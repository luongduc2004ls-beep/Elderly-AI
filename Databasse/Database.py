import os
import sqlite3
from datetime import datetime

DB_FILENAME = "elderly_care.db"
DB_PATH = os.path.join(os.path.dirname(__file__), DB_FILENAME)

CREATE_USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    address TEXT,
    emergency_contact TEXT,
    created_at TEXT NOT NULL
);
"""

CREATE_MEDICATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    scheduled_time TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
"""

CREATE_MEDICATION_LOGS_TABLE = """
CREATE TABLE IF NOT EXISTS medication_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    medicine_name TEXT NOT NULL,
    taken_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Taken',
    FOREIGN KEY(user_id) REFERENCES users(id)
);
"""

CREATE_FALL_LOGS_TABLE = """
CREATE TABLE IF NOT EXISTS fall_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fall_time TEXT NOT NULL,
    location TEXT,
    video_snapshot_url TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
"""

CREATE_ALERTS_TABLE = """
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT,
    message TEXT,
    is_resolved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
"""


def get_connection():
    """Open a connection to the local SQLite database."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)


def create_tables():
    """Create all required tables in the SQLite database."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(CREATE_USERS_TABLE)
        cursor.execute(CREATE_MEDICATIONS_TABLE)
        cursor.execute(CREATE_MEDICATION_LOGS_TABLE)
        cursor.execute(CREATE_FALL_LOGS_TABLE)
        cursor.execute(CREATE_ALERTS_TABLE)
        conn.commit()


if __name__ == "__main__":
    create_tables()
    print(">>> Đã khởi tạo thành công hệ thống Cơ sở dữ liệu AI Hỗ trợ người cao tuổi!")
    print(f">>> Database file created at: {DB_PATH}")
