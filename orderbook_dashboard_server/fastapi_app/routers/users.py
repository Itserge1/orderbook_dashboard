from fastapi_app import APIRouter, HTTPException, Path, json, Query
from fastapi import UploadFile, File
from fastapi_app.db import get_connection
import csv
import io
import heapq
from typing import Optional


router = APIRouter()

@router.get("/health")
def home():
    return {"status": "ok"}

@router.post("/api/upload_csv/")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    csv_file = io.StringIO(content.decode("utf-8"))
    reader = csv.reader(csv_file)
    header = next(reader, None)

    rows_to_insert = []
    for row in reader:
        try:
            time = row[1]
            price = float(row[8]) if row[8] else 0
            bid_volume = float(row[15]) if row[15] else 0
            ask_volume = float(row[16]) if row[16] else 0
            rows_to_insert.append((time, price, bid_volume, ask_volume))
        except:
            continue

    conn = get_connection()
    cursor = conn.cursor()
    cursor.executemany(
        "INSERT INTO orderbook (time, price, bidVolume, askVolume) VALUES (?, ?, ?, ?)",
        rows_to_insert
    )
    conn.commit()
    conn.close()

    return {"message": f"{len(rows_to_insert)} rows uploaded successfully."}

@router.get("/api/latest_orderbook")
async def get_latest_orderbook(limit: int = 300, before: Optional[str] = None):
    """
    Return latest 'limit' rows, grouped by price.
    Aggregates bidVolume and askVolume for identical prices.
    """
    conn = get_connection()
    cursor = conn.cursor()

    if before:
        cursor.execute("""
            SELECT 
                price,
                SUM(bidVolume) AS bidVolume,
                SUM(askVolume) AS askVolume,
                SUM(bidVolume + askVolume) AS totalVolume
            FROM orderbook
            WHERE time < ?
            GROUP BY price
            ORDER BY price DESC
            LIMIT ?
        """, (before, limit))
    else:
        cursor.execute("""
            SELECT 
                price,
                SUM(bidVolume) AS bidVolume,
                SUM(askVolume) AS askVolume,
                SUM(bidVolume + askVolume) AS totalVolume
            FROM orderbook
            GROUP BY price
            ORDER BY price DESC
            LIMIT ?
        """, (limit,))

    rows = cursor.fetchall()
    conn.close()
    return {"rows": [dict(row) for row in rows]}


@router.get("/api/historical_orderbook")
def get_historical_orderbook(limit: int = 300):
    """
    Return historical orderbook data, grouped by time and price.
    Sums bidVolume and askVolume for identical (time, price) rows.
    Returns the latest 'limit' grouped rows.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # SQLite query: group by time + price, sum bid/ask volumes
    cursor.execute("""
        SELECT 
            time,
            price,
            SUM(bidVolume) AS bidVolume,
            SUM(askVolume) AS askVolume
        FROM orderbook
        GROUP BY time, price
        ORDER BY time DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    # Return as list of dicts
    return {"rows": [dict(row) for row in rows]}
