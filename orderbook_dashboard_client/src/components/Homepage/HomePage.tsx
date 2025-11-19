"use client";

// STYLES & LIBRARIES
import styles from "./HomePage.module.css";
import { useState } from "react";

// COMPONENTS
import OrderBookChart from "@/components/OrderBookChart/OrderBookChart";
import HistoricalOrderBookChart from "@/components/HistoricalOrderBookChart/HistoricalOrderBookChart";
import CSVUpload from "@/components/handleFileUpload/handleFileUpload";

// INTERFACES
export interface ILatestOrderBook {
    price: number;
    bidVolume: number;
    askVolume: number;
    totalVolume: number;
}

export interface IHistoricalOrderBookList {
    time: string;
    price: number;
    bidVolume: number;
    askVolume: number;
}

// MAIN COMPONENT
const HomePage = () => {
    const [orderBookList, setOrderBookList] = useState<ILatestOrderBook[]>([]);
    const [historicalOrderBookList, setHistoricalOrderBookList] = useState<IHistoricalOrderBookList[]>([]);

    return (
        <section className={styles.homepage}>
            <div className={styles["homepage__wrapper"]}>
                <div className={styles["homepage__content"]}>
                    <div>
                        <CSVUpload
                            onHistoricalLoaded={(data) => setHistoricalOrderBookList(data.reverse())}
                            onLatestLoaded={(data) => setOrderBookList(data)}
                        />
                    </div>

                    <div>
                        <h2>Historical OrderBook Data</h2>
                        {historicalOrderBookList.length > 0 ? (
                            <HistoricalOrderBookChart data={historicalOrderBookList} setData={setHistoricalOrderBookList} />
                        ) : (
                            <p>Upload a CSV to view historical data</p>
                        )}
                    </div>

                    <div>
                        <h2>Latest OrderBook</h2>
                        {orderBookList.length > 0 ? (
                            <OrderBookChart data={orderBookList} />
                        ) : (
                            <p>Upload a CSV to view Orderbook data...</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;
