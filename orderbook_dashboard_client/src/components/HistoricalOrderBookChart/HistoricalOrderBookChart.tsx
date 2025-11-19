// STYLES & LIBRARIES
import styles from "./HistoricalOrderBookChart.module.css";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { useState, useRef, useEffect, useMemo, Dispatch, SetStateAction } from "react";

// INTERFACES
interface IHistoricalOrderBookList {
    time: string;
    bidVolume: number;
    askVolume: number;
    price: number;
    timeShort?: string;
    timeFull?: string;
}

interface HistoricalOrderBookChartProps {
    data: IHistoricalOrderBookList[];
    setData: Dispatch<SetStateAction<IHistoricalOrderBookList[]>>; // add this
    maxPoints?: number; // max points to render at once
}

// MAIN COMPONENT
const HistoricalOrderBookChart = ({ data, setData, maxPoints = 300 }: HistoricalOrderBookChartProps) => {
    const [currentIndex, setCurrentIndex] = useState(() => data.length - 1);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const displayedData = useMemo(() => {
        if (data.length <= maxPoints) return data.slice(0, currentIndex + 1);

        const end = Math.min(currentIndex + 1, data.length);
        const step = Math.ceil(end / maxPoints);

        const filtered = data.slice(0, end).filter((_, i) => i % step === 0);

        // Make sure at least 2 points
        if (filtered.length < 2) return data.slice(0, 2);

        return filtered;
    }, [data, currentIndex, maxPoints]);


    // Map currentIndex to last element in displayedData
    const currentTickTime = displayedData[displayedData.length - 1]?.time;

    // Handle PREV& NEXT
    const PAGE_SIZE = 100;
    const WINDOW_SIZE = 300;

    const handlePrevPage = async () => {
        if (data.length === 0) return;

        // if we have enough previous rows in state to just slide
        if (currentIndex >= PAGE_SIZE) {
            setCurrentIndex(prev => prev - PAGE_SIZE);
            return;
        }

        // we reached the start of state, need to fetch older rows
        const oldestTime = data[0].time;
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/historical_orderbook?limit=${PAGE_SIZE}&before=${oldestTime}`
        );
        if (!res.ok) return;

        const fetched = await res.json();
        const newRows = fetched.rows.reverse();
        if (newRows.length === 0) return; // no more older data

        // Prepend fetched rows and trim right to maintain WINDOW_SIZE
        setData(prev => {
            const combined = [...newRows, ...prev];
            if (combined.length > WINDOW_SIZE) {
                return combined.slice(0, WINDOW_SIZE);
            }
            return combined;
        });

        // Move play-head by PAGE_SIZE back
        setCurrentIndex(prev => prev + newRows.length - PAGE_SIZE);
    };

    const handleNextPage = async () => {
        if (data.length === 0) return;

        const lastVisibleIndex = currentIndex;
        const lastVisibleTime = data[data.length - 1].time;

        // if there are rows ahead in the current state
        if (lastVisibleIndex + PAGE_SIZE < data.length) {
            setCurrentIndex(prev => Math.min(prev + PAGE_SIZE, data.length - 1));
            return;
        }

        // otherwise, fetch newer rows from the backend
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/historical_orderbook?limit=${PAGE_SIZE}&after=${lastVisibleTime}`
        );
        if (!res.ok) return;

        const fetchedData = await res.json();
        const newRows = fetchedData.rows; // newest first?

        if (newRows.length === 0) return; // no newer rows

        // append new rows and trim from left to keep window size
        setData(prev => {
            const combined = [...prev, ...newRows];
            if (combined.length > WINDOW_SIZE) {
                // remove the oldest rows to maintain the window
                return combined.slice(combined.length - WINDOW_SIZE);
            }
            return combined;
        });

        // move the currentIndex forward by PAGE_SIZE (or whatever was fetched)
        setCurrentIndex(prev => Math.min(prev + PAGE_SIZE, data.length + newRows.length - 1));
    };


    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = window.setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= data.length - 1) {
                        if (intervalRef.current) window.clearInterval(intervalRef.current);
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 100); // playback speed
        } else {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [isPlaying, data.length]);

    const formatWithMs = (time: string | number) => {
        const date = new Date(time);

        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            fractionalSecondDigits: 3 // show milliseconds
        }).format(date);
    };

    return (
        <section className={styles.historicalOrderBookChartContainer}>
            {/* Playback Controls */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button onClick={handlePrevPage}>⏪ Reverse 100</button>
                {/*<button onClick={() => setCurrentIndex(prev => Math.min(prev + 100, data.length - 1))}>⏩ Forward 100</button>*/}
                <button onClick={handleNextPage}>⏩ Forward 100</button>

                <button onClick={() => setIsPlaying(true)}>▶️ Play</button>
                <button onClick={() => setIsPlaying(false)}>⏸ Pause</button>
                <button onClick={() => { setIsPlaying(false); setCurrentIndex(data.length - 1); }}>⏹ Reset</button>
                <input
                    type="range"
                    min={1}
                    max={data.length - 1}
                    value={currentIndex}
                    onChange={e => setCurrentIndex(Math.max(Number(e.target.value), 1))}
                    style={{ flex: 1 }}
                />
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={displayedData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="time"
                        tickFormatter={time =>
                            new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        }
                        tick={{ fontSize: 12 }}
                        interval={Math.floor(displayedData.length / 8)}
                    />
                    <YAxis tick={{ fontSize: 12 }} />

                    <Tooltip
                        // labelFormatter={label => new Date(label).toLocaleString()}
                        labelFormatter={label => formatWithMs(label)}
                        formatter={(value: number) => value.toLocaleString()}
                        contentStyle={{
                            backgroundColor: "#1e1e1e",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "14px",
                            padding: "10px",
                        }}
                        labelStyle={{ color: "#fff", fontWeight: "bold" }}
                        itemStyle={{}}
                    />

                    {/* Bid and Ask Areas */}
                    <Area
                        type="monotone"
                        dataKey="bidVolume"
                        stackId="1"
                        stroke="#0084ff"
                        fill="#0084ff"
                        opacity={0.7}
                    />
                    <Area
                        type="monotone"
                        dataKey="askVolume"
                        stackId="1"
                        stroke="#ff4d4d"
                        fill="#ff4d4d"
                        opacity={0.7}
                    />

                    {/* Vertical play-head */}
                    {currentTickTime && (
                        <ReferenceLine
                            x={currentTickTime}
                            stroke="yellow"
                            strokeWidth={2}
                            label={{ value: "▶", position: "top", fill: "yellow", fontWeight: "bold" }}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </section>
    );
};

export default HistoricalOrderBookChart;
