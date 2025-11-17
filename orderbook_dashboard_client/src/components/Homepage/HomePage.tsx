"use client"; // Treat this as a client component

import styles from "./HomePage.module.css";

const HomePage = () => {
    return (
        <section className={`${styles.homepage}`}>
            <p>Hello From HomePage!</p>
        </section>
    );
};

export default HomePage;