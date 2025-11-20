# Overview

* [Overview](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#overview)
  * [Prerequisites](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#prerequisites)
* [Summary](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#summary)
* [My Design Approach & Thought Process](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#my-design-approach--thought-process-read-if-you-want-to-see-how-i-tackled-the-challenge)
* [How to Run the Application?](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#how-to-run-the-application)
* [Start the Backend Server](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#start-the-backend-server)
    * [Step 1: Create a Virtual Environment](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#step-1-create-a-virtual-environment)
        * [macOS / Linux](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#macos--linux)
        * [Windows (PowerShell)](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#windows-powershell)
    * [Step 2: Obtain a CSV File](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#step-2-obtain-a-csv-file)
    * [Step 3: Run the Backend Server](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#step-3-run-the-backend-server)
* [Start the Client Application](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#start-the-client-application)
    * [Step 1: Install Dependencies](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#step-1-install-dependencies)
    * [Step 2: Create a
      `.env` File](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#step-2-create-a-env-file)
    * [Step 3: Run the Application](https://github.com/Itserge1/orderbook_dashboard?tab=readme-ov-file#step-3-run-the-application)

## **Prerequisites**

* Python **3.8 or higher**
* Node.js **18+**
* pip (latest recommended)
* VS Code (or any IDE that can run python and JavaScript)

# Summary

This project is a **dashboard application** designed to visualize order book data for stocks. It allows users to upload
CSV files containing detailed bid and the ask volumes, timestamps, and prices. The
dashboard then displays this data in interactive charts, giving a clear, view of market depth and liquidity.

The backend is built with **FastAPI** and provides endpoints to upload a CSV file, retrieve the latest order book
entries, as well as historical data grouped by either price or timestamp.

On the frontend, a **React/Next.js** application renders the charts using Recharts, including stacked area and bar
charts for bid and ask volumes. Tooltips show detailed information with timestamps down to milliseconds, while users can
scroll through historical data seamlessly.

# **My Design Approach & Thought Process (Read if you want to see how I tackled the challenge)**

My main challenge while building this project was handling **large datasets efficiently** and deciding how best to process
and display them. I chose a combination of **pagination** and a **sliding-window approach**. Pagination allows the
backend to send only a fixed number of rows at a time, while the sliding window ensures the client only displays the
current visible range of data-keeping performance smooth and consistent.

Initially, I considered parsing the CSV directly on the client using [PapaParse](https://www.papaparse.com/) and rendering the chart entirely on the
frontend with no backend involved. However, this approach quickly showed limitations:

* Large CSV files cause the browser to freeze or crash.
* Pagination becomes inefficient because the CSV would need to be re-parsed repeatedly.
* There is no persistent place to store or query the data efficiently.

Because of these limitations, I decided to introduce a lightweight local database. **SQLite**, combined with a simple
Python/FastAPI backend, provided the perfect solution. The backend accepts a CSV file, loads it once into the SQLite
database, and then exposes endpoints that return exactly the amount of data needed for the charts. For example, the
historical chart displays **300 rows** at a time (a number that can easily be adjusted based on business requirements).

Here’s how the sliding-window plus pagination workflow works:

* The user uploads a CSV file from the client. The file is sent to the server, which processes the entire CSV and loads
  all records into the database. This step may take some time depending on the file size.
* Once the import is complete, the backend returns a success response. The client then requests the **first 300
  formatted rows**, which are retrieved from the result of running an SQL query against the database, not by reading the first 300 rows
  of the CSV. The server returns those 300 records, and the client displays them in the dashboard chart.
* When the user clicks **Prev**, the UI simply shifts the window to show older rows that are already loaded in memory, no
  backend request is needed.
* If the user reaches the earliest 100 rows currently buffered and clicks **Prev**, the client requests **an additional
  100 older rows** from the backend.
* At the same time, the client removes the oldest 100 rows from the local buffer to keep a consistent **300-row sliding
  window**.
* This design allows smooth navigation through very large datasets while keeping memory usage stable. The only heavy
  operation is the initial CSV to database import, which can be optimized further in a production environment.

## **Potential Production Enhancements**

In a production environment, the data ingestion pipeline can be significantly optimized. Several improvements could be
introduced:

### **1. Stream Processing / Queueing**

Using technologies like **Kafka** or even **Redis Streams** would allow high-volume CSV data to be
processed incrementally and reliably.

### **2. Parallelized CSV Processing**

Instead of processing the CSV sequentially, the file could be split into multiple ranges and processed by parallel jobs.
For example:

* Job 1 inserts rows **1–50,000**
* Job 2 inserts rows **50,001–100,000**
* More jobs can be added dynamically

Jobs can be orchestrated via pipelines (github actions or AWS CodePipeline) or workflow engines and run independently.

### **3. Dedicated Data Processing CLI Tools**

We could build a Python CLI (Command line interface) tool for data processing using [Click](https://click.palletsprojects.com/en/stable/). This tool would use the same functions we wrote
for the REST API and make them available as CLI commands. This means that we can run a shell command, and it will point to that
same function (which is processing the data directly). This would turn the project into a CLI-based project that can be
containerized with Docker and stored in an artifact registry such as **AWS ECR** or **Azure ACR**. 

PS: I love to use click to automate things!

A pipeline (GitHub Actions, AWS CodePipeline, etc.) could then:

* Pull the container image
* Run the CLI inside the pipeline
* Run the shell command (we get from Click) in a YAML job which will Automatically run the process and load CSV data into the database

This would create a robust, scalable, automated ingestion pipeline.

# **How to Run the Application?**

Start by cloning the repository:

```shell
git clone https://github.com/Itserge1/orderbook_dashboard.git
```

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
This should start the FastAPI server and create a SQLite database call `orderbook.db`.
The app will be available at:

```
http://localhost:5001
```

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

