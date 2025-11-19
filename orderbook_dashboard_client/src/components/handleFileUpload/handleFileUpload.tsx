"use client";

// STYLES & LIBRARIES
import { useState, ChangeEvent } from "react";

// COMPONENTS
import {ILatestOrderBook, IHistoricalOrderBookList} from "@/components/Homepage/HomePage";

// INTERFACES
interface CSVUploadProps {
    onHistoricalLoaded: (data: IHistoricalOrderBookList[]) => void;
    onLatestLoaded: (data: ILatestOrderBook[]) => void;
}

// MAIN COMPONENT
export default function CSVUpload({ onHistoricalLoaded, onLatestLoaded }: CSVUploadProps) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // RECEIVE THE CSV FILE AND UPLOAD TO THE SQLIte DB
    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Upload the CSV to the Database
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload_csv/`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

            // After upload, fetch the latest (30 rows: could change depending on business requirements) from DB, base on time
            const latestRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/latest_orderbook?limit=30`);
            if (!latestRes.ok) throw new Error(`Failed to fetch latest rows: ${latestRes.statusText}`);

            // Set the state for the OrderBookChart component
            const data = await latestRes.json();
            onLatestLoaded?.(data.rows);

            // Fetch historical 300 rows from DB
            const historicalRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/historical_orderbook?limit=300`);
            if (!historicalRes.ok) throw new Error(`Failed to fetch historical rows: ${historicalRes.statusText}`);

            // Set the state for the HistoricalOrderBookChart
            const historicalData = await historicalRes.json();
            onHistoricalLoaded?.(historicalData.rows);
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("An unknown error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-4 border rounded-xl bg-gray-50">
            <h2 className="font-bold text-xl mb-3">Upload CSV to Backend</h2>

            <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block mb-4"
            />

            {loading && <p>Chart Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
        </div>
    );
}
