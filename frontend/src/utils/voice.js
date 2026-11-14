// Voice Speech-to-Text and Text-to-Speech utilities for CityLab

export const isSpeechRecognitionSupported = () => {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const isSpeechSynthesisSupported = () => {
  return typeof window !== "undefined" && "speechSynthesis" in window;
};

// Map application language codes to BCP 47 language tags
export const getLangLocale = (lang) => {
  switch (lang) {
    case "ur":
      return "ur-PK";
    case "roman_ur":
      return "ur-PK";
    case "ar":
      return "ar-SA";
    case "en":
    default:
      return "en-US";
  }
};

/**
 * Creates an active SpeechRecognition listener session.
 */
export const startListening = ({
  language = "en",
  onResult,
  onError,
  onEnd,
}) => {
  if (!isSpeechRecognitionSupported()) {
    onError?.("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = getLangLocale(language);
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      onResult?.(transcript);
    }
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    let msg = `Microphone error: ${event.error}`;
    if (event.error === "not-allowed" || event.error === "permission-denied") {
      msg = "Microphone permission denied. Please allow microphone access in your browser bar.";
    } else if (event.error === "no-speech") {
      msg = "No speech detected. Please try speaking again closer to the microphone.";
    }
    onError?.(msg);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    onError?.(`Could not start microphone: ${err.message}`);
    return null;
  }
};

/**
 * Clean markdown for smooth text-to-speech reading.
 */
export const cleanTextForTTS = (markdownText) => {
  if (!markdownText) return "";
  return markdownText
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/#{1,6}\s+/g, "") // headers
    .replace(/`([^`]+)`/g, "$1") // code
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .replace(/[-*•]\s+/g, "") // bullet points
    .replace(/🚨|⚠️|✔️|❌/g, "") // emojis
    .trim();
};

/**
 * Reads aloud text with browser speechSynthesis.
 */
export const speakText = (text, options = {}) => {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Text-to-speech is not supported in this browser.");
    return null;
  }

  // Cancel any currently playing audio
  window.speechSynthesis.cancel();

  const clean = cleanTextForTTS(text);
  if (!clean) return null;

  const utterance = new SpeechSynthesisUtterance(clean);
  const targetLocale = getLangLocale(options.language || "en");
  utterance.lang = targetLocale;
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;

  // Attempt to find voice matching language and gender preference
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const langVoices = voices.filter((v) => v.lang.startsWith(targetLocale.split("-")[0]));
    if (langVoices.length > 0) {
      if (options.gender === "male") {
        const maleVoice = langVoices.find((v) => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("george"));
        utterance.voice = maleVoice || langVoices[0];
      } else {
        const femaleVoice = langVoices.find((v) => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("google"));
        utterance.voice = femaleVoice || langVoices[0];
      }
    }
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return {
    stop: () => window.speechSynthesis.cancel(),
    pause: () => window.speechSynthesis.pause(),
    resume: () => window.speechSynthesis.resume(),
  };
};

export const stopSpeech = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};
