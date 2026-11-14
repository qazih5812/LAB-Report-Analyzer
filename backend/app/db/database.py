import sqlite3
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("citylab.db")

DB_PATH = Path(__file__).resolve().parent.parent.parent / "history.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the persistent SQLite database schema."""
    conn = get_connection()
    cursor = conn.cursor()

    # Patient report history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS report_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        mrn TEXT NOT NULL,
        report_date TEXT NOT NULL,
        total_tests INTEGER NOT NULL,
        normal_count INTEGER NOT NULL,
        low_count INTEGER NOT NULL,
        high_count INTEGER NOT NULL,
        urgent_count INTEGER NOT NULL,
        has_urgent INTEGER NOT NULL,
        summary_excerpt TEXT,
        results_snapshot TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # User preferences table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        display_name TEXT DEFAULT 'Healthcare Professional',
        preferred_language TEXT DEFAULT 'en',
        preferred_theme TEXT DEFAULT 'light',
        font_size TEXT DEFAULT 'medium',
        eli10_enabled INTEGER DEFAULT 0,
        voice_gender TEXT DEFAULT 'female',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Conversation history table (scoped strictly by patient_id)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        allowed INTEGER DEFAULT 1,
        provider_used TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()
    logger.info(f"Initialized SQLite database at {DB_PATH}")

def record_report_history(
    patient_id: str,
    patient_name: str,
    mrn: str,
    report_date: str,
    results: List[Dict[str, Any]],
    has_urgent: bool,
    summary_excerpt: str = ""
):
    """Saves an analyzed report snapshot to persistent history."""
    conn = get_connection()
    cursor = conn.cursor()

    normal_cnt = sum(1 for r in results if r.get("status") == "NORMAL")
    low_cnt = sum(1 for r in results if r.get("status") in ["LOW", "URGENT_LOW"])
    high_cnt = sum(1 for r in results if r.get("status") in ["HIGH", "URGENT_HIGH"])
    urgent_cnt = sum(1 for r in results if r.get("is_urgent"))

    # Check if report already exists for this patient and date to avoid duplicates
    cursor.execute(
        "SELECT id FROM report_history WHERE patient_id = ? AND report_date = ?",
        (patient_id, report_date)
    )
    existing = cursor.fetchone()

    snapshot_str = json.dumps(results)
    if existing:
        cursor.execute("""
        UPDATE report_history SET
            patient_name = ?,
            mrn = ?,
            total_tests = ?,
            normal_count = ?,
            low_count = ?,
            high_count = ?,
            urgent_count = ?,
            has_urgent = ?,
            summary_excerpt = ?,
            results_snapshot = ?,
            created_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (
            patient_name, mrn, len(results), normal_cnt, low_cnt, high_cnt,
            urgent_cnt, 1 if has_urgent else 0, summary_excerpt, snapshot_str, existing["id"]
        ))
    else:
        cursor.execute("""
        INSERT INTO report_history (
            patient_id, patient_name, mrn, report_date, total_tests,
            normal_count, low_count, high_count, urgent_count, has_urgent,
            summary_excerpt, results_snapshot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            patient_id, patient_name, mrn, report_date, len(results),
            normal_cnt, low_cnt, high_cnt, urgent_cnt, 1 if has_urgent else 0,
            summary_excerpt, snapshot_str
        ))

    conn.commit()
    conn.close()

def get_report_history(limit: int = 10, search: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves the recent patient report records with summary counts."""
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM report_history"
    params = []

    if search:
        query += " WHERE patient_name LIKE ? OR patient_id LIKE ? OR mrn LIKE ?"
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "patient_id": row["patient_id"],
            "patient_name": row["patient_name"],
            "mrn": row["mrn"],
            "report_date": row["report_date"],
            "total_tests": row["total_tests"],
            "normal_count": row["normal_count"],
            "low_count": row["low_count"],
            "high_count": row["high_count"],
            "urgent_count": row["urgent_count"],
            "has_urgent": bool(row["has_urgent"]),
            "summary_excerpt": row["summary_excerpt"],
            "created_at": row["created_at"]
        })
    return history

def delete_report_history(report_id: int) -> bool:
    """Deletes a report from persistent history."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM report_history WHERE id = ?", (report_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_patient_trend(patient_id: str, test_name: str) -> List[Dict[str, Any]]:
    """Retrieves chronological history of a specific test for a patient to plot trend charts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT report_date, results_snapshot FROM report_history WHERE patient_id = ? ORDER BY report_date ASC",
        (patient_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    trend = []
    for r in rows:
        date = r["report_date"]
        try:
            results = json.loads(r["results_snapshot"] or "[]")
            for res in results:
                if (res.get("canonical_test", "").lower() == test_name.lower() or
                    res.get("reported_test", "").lower() == test_name.lower()):
                    val = res.get("converted_value") or res.get("reported_value")
                    try:
                        numeric_val = float(str(val).replace(",", ""))
                        trend.append({
                            "date": date,
                            "value": numeric_val,
                            "unit": res.get("converted_unit") or res.get("reported_unit") or "",
                            "status": res.get("status")
                        })
                    except (ValueError, TypeError):
                        pass
        except Exception:
            pass

    return trend
