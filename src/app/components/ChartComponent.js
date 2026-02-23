"use client";

import React from "react";
import videoStats1 from "../../../Data.js";
import videoStats2 from "../../../Data2.js";
import { KPISummary, InsightsSection, GridSection } from "./DashboardCharts";

export default function ChartComponent() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-sky-500/30 selection:text-sky-200 antialiased font-sans">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-sky-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 tracking-widest uppercase">
              Dashboard v2.0
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/30">
              Stream Telemetry
            </h1>
            <p className="text-white/50 font-medium mt-3 text-lg max-w-xl">
              Real-time video performance analytics and network capability diagnostics.
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(56,189,248,0.1)]">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse"></div>
            <span className="text-xs font-bold text-sky-400 tracking-widest uppercase">Live Connection</span>
          </div>
        </header>

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
