"use client";

import React from "react";
import videoStats1 from "../../../Data.js";
import videoStats2 from "../../../Data2.js";
import { KPISummary, InsightsSection, GridSection } from "./DashboardCharts";

export default function ChartComponent() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black antialiased font-sans">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        {/* KPI Overview — Primary */}
        <KPISummary dataset={videoStats1} title="Overview — Primary" />

        {/* New Insight Charts — Primary */}
        <InsightsSection dataset={videoStats1} label="Primary Insights" />

        {/* Existing time-series grids */}
        <GridSection title="Primary Diagnostics" dataset={videoStats1} />

        {/* KPI Overview — Historical */}
        <KPISummary dataset={videoStats2} title="Overview — Historical" />

        {/* New Insight Charts — Historical */}
        <InsightsSection dataset={videoStats2} label="Historical Insights" />

        <GridSection title="Historical Reference" dataset={videoStats2} />
      </main>
    </div>
  );
}
