import os
import time
import logging
from typing import Optional, Dict, Any, List, Tuple
import httpx

logger = logging.getLogger("citylab.llm")

# Provider priority list
PROVIDER_PRIORITY = ["gemini", "groq", "openrouter", "deterministic"]

class LLMProviderManager:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        
        # Configure Gemini if available
        self._gemini_client = None
        if self.gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_api_key)
                self._gemini_client = genai.GenerativeModel("gemini-1.5-flash")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")

    def get_provider_status(self) -> Dict[str, Any]:
        """Returns the real-time configuration status of all LLM providers."""
        return {
            "gemini": {
                "available": bool(self.gemini_api_key),
                "model": "gemini-1.5-flash",
                "priority": 1,
            },
            "groq": {
                "available": bool(self.groq_api_key),
                "model": "llama-3.3-70b-versatile",
                "priority": 2,
            },
            "openrouter": {
                "available": bool(self.openrouter_api_key),
                "model": "meta-llama/llama-3.3-70b-instruct:free",
                "priority": 3,
            },
            "deterministic_fallback": {
                "available": True,
                "model": "rule-engine-v1",
                "priority": 4,
            },
            "active_primary_provider": self.get_active_primary_provider(),
        }

    def get_active_primary_provider(self) -> str:
        if self.gemini_api_key:
            return "gemini"
        elif self.groq_api_key:
            return "groq"
        elif self.openrouter_api_key:
            return "openrouter"
        return "deterministic"

    def generate_completion(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        max_retries: int = 2
    ) -> Tuple[Optional[str], str]:
        """
        Attempts generation using Provider Priority chain:
        Gemini -> Groq -> OpenRouter -> None (triggers deterministic fallback).
        Returns:
            (generated_text, provider_used)
        """
        # 1. Try Gemini
        if self.gemini_api_key and self._gemini_client:
            for attempt in range(max_retries):
                try:
                    full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                    response = self._gemini_client.generate_content(
                        full_prompt,
                        generation_config={"temperature": 0.2, "max_output_tokens": 1024}
                    )
                    if response and response.text:
                        return response.text.strip(), "gemini"
                except Exception as e:
                    logger.warning(f"Gemini generation error (attempt {attempt+1}/{max_retries}): {e}")
                    if "429" in str(e) or "quota" in str(e).lower() or "rate" in str(e).lower():
                        time.sleep(1.0 * (attempt + 1))  # Exponential backoff
                    else:
                        break  # Fall to next provider on hard error

        # 2. Try Groq
        if self.groq_api_key:
            for attempt in range(max_retries):
                try:
                    text = self._call_groq(prompt, system_instruction)
                    if text:
                        return text, "groq"
                except Exception as e:
                    logger.warning(f"Groq generation error (attempt {attempt+1}/{max_retries}): {e}")
                    if "429" in str(e) or "rate" in str(e).lower():
                        time.sleep(1.0 * (attempt + 1))
                    else:
                        break

        # 3. Try OpenRouter
        if self.openrouter_api_key:
            for attempt in range(max_retries):
                try:
                    text = self._call_openrouter(prompt, system_instruction)
                    if text:
                        return text, "openrouter"
                except Exception as e:
                    logger.warning(f"OpenRouter generation error (attempt {attempt+1}/{max_retries}): {e}")
                    if "429" in str(e):
                        time.sleep(1.0 * (attempt + 1))
                    else:
                        break

        # 4. Fallback: all providers unavailable or failed
        return None, "deterministic"

    def _call_groq(self, prompt: str, system_instruction: Optional[str]) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json",
        }
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 1024,
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            resp.raise_for_status()
        return None

    def _call_openrouter(self, prompt: str, system_instruction: Optional[str]) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://citylab.diagnostics",
            "X-Title": "CityLab Diagnostics Explainer",
        }
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": "meta-llama/llama-3.3-70b-instruct:free",
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 1024,
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            resp.raise_for_status()
        return None

# Singleton instance
llm_manager = LLMProviderManager()
