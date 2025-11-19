# db.py
import sqlite3
from pathlib import Path

DB_FILE = Path("orderbook.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # rows as dicts
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orderbook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TEXT,
        price REAL,
        bidVolume REAL,
        askVolume REAL
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_time ON orderbook(time DESC)")
    conn.commit()
    conn.close()
