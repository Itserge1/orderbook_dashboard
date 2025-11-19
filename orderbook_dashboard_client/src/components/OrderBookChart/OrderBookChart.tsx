// STYLES & LIBRARIES
import styles from "./OrderBookChart.module.css";
import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer} from "recharts";

// INTERFACES
interface ILatestOrderBook {
    price: number;
    bidVolume: number;
    askVolume: number;
    totalVolume: number;
}

interface OrderBookChartProps {
    data: ILatestOrderBook[];
}

interface ILatestOrderBook {
    price: number;
    totalVolume: number;
}

// MAIN COMPONENT
const OrderBookChart = ({data}: OrderBookChartProps) => {
    return (
        <section className={styles.orderBookChartContainer}>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
                >
                    <XAxis type="number" />
                    <YAxis dataKey="price" type="category" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1e1e1e",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "14px",
                            padding: "10px",
                        }}
                        labelFormatter={(label: string) => `Price:${label}`}
                        labelStyle={{ color: "#fff", fontWeight: "bold" }}
                        itemStyle={{}}
                    />
                    <Legend />
                    <Bar dataKey="bidVolume" stackId="a" fill="#9b59b6" name="Bid Volume" />
                    <Bar dataKey="askVolume" stackId="a" fill="#f39c12" name="Ask Volume" />
                </BarChart>
            </ResponsiveContainer>
        </section>
    );
};

export default OrderBookChart;
