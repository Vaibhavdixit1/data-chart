# Video Analytics Dashboard

A specialized visualization dashboard built with **Next.js 15** and **Highcharts (Highstock)** to analyze real-time video streaming performance metrics.

## 🚀 Overview

This project provides a comprehensive overview of video streaming quality by visualizing critical network and performance data. It is designed to help developers and engineers troubleshoot stream quality issues and monitor real-time performance.

## 📊 Key Analytics Tracked

The dashboard features interactive Highcharts implementations for:

- **Video Width Analytics**: Tracks changes in video resolution over time.
- **Jitter Analytics**: Visualizes network jitter fluctuations.
- **RTT/Latency Analytics**: Monitors Round Trip Time for connection responsiveness.
- **Packet Loss Analytics**: Displays packet loss percentage to identify network congestion.
- **Bitrate Analytics**: Tracks variations in streaming bitrate (kbps).
- **FPS Analytics**: Monitors frame rate consistency for smooth playback.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Charting Engine**: [Highcharts](https://www.highcharts.com/) / [Highstock](https://www.highcharts.com/products/stock/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Source**: Static JSON-based metrics from `Data.js` and `Data2.js`.

## ⚙️ Getting Started

### Installation

First, install the dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## 📁 Project Structure

- `src/app/components/ChartComponent.js`: The primary component containing all charting logic and Highcharts configurations.
- `Data.js`: Main data source for video streaming metrics.
- `Data2.js`: Secondary/Historical data source.
- `src/app/page.js`: Main entry point for the dashboard view.

*Handcrafted for precise video data visualization.*
