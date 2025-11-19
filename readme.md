# Overview

This project is a **dashboard application** designed to visualize order book data for stocks. It allows users to upload
CSV files containing detailed bid and the ask volumes, timestamps, and prices. The
dashboard then displays this data in interactive charts, giving a clear, view of market depth and liquidity.

The backend is built with **FastAPI** and provides endpoints to upload a CSV file, retrieve the latest order book
entries, as well as historical data grouped by either price or timestamp.

On the frontend, a **React/Next.js** application renders the charts using Recharts, including stacked area and bar
charts for bid and ask volumes. Tooltips show detailed information with timestamps down to milliseconds, while users can
scroll through historical data seamlessly.

# **How to Run the Application**

Start by cloning the repository:

```shell
git clone https://github.com/Itserge1/orderbook_dashboard.git
```

## **Prerequisites**

* Python **3.8 or higher**
* Node.js **18+**
* pip (latest recommended)

---

# **Start the Backend Server**

Navigate to the backend directory:

```
orderbook_dashboard/orderbook_dashboard_server/
```

## **Step 1: Create a Virtual Environment**

### **macOS / Linux**

Create the environment:

```shell
python3 -m venv .venv
```

Activate it:

```shell
source .venv/bin/activate
```

Upgrade pip:

```shell
python3 -m pip install --upgrade pip
```

Install dependencies:

```shell
pip install -r requirements.txt
```

### **Windows (PowerShell)**

Create the environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\activate
```

Upgrade pip:

```powershell
python -m pip install --upgrade pip
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

---

## **Step 2: Obtain a CSV File**

A sample CSV file `output_5000` is included in:

```
orderbook_dashboard_server/data/
```

If you have a `.zst` compressed file (e.g.,
`glbx-mdp3-20250611.mbp-10.csv.zst`), place it in the same folder and run:

```shell
python open.py
```

This will decompress the file and generate a CSV containing the first **10,000 rows** (default — can be changed in the
script).


## **Step 3: Run the Backend Server**

Run:

```shell
uvicorn main:app --reload --port 5001
```

---

# **Start the Client Application**

Navigate to the frontend directory:

```
orderbook_dashboard/orderbook_dashboard_client/
```

## **Step 1: Install Dependencies**

```shell
npm install
```

## **Step 2: Create a `.env` File**

At the root of the client folder, create a `.env` file:

```shell
NEXT_PUBLIC_API_BASE_URL="http://localhost:5001"
```

## **Step 3: Run the Application**

Run the development server:

```shell
npm run dev
```

The app will be available at:

```
http://localhost:3000
```

