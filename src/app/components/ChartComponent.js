"use client";

import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts/highstock"; // We still import highstock but will use regular Highcharts.chart
import videoStats1 from "../../../Data.js";
import videoStats2 from "../../../Data2.js";

// Shared Dark Theme for Highcharts
const darkTheme = {
  chart: {
    backgroundColor: 'transparent',
    style: {
      fontFamily: 'var(--font-geist-sans)'
    }
  },
  navigator: {
    enabled: false // Explicitly disable navigator
  },
  rangeSelector: {
    enabled: false // Explicitly disable range selector
  },
  scrollbar: {
    enabled: false // Explicitly disable scrollbar
  },
  title: {
    style: {
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600'
    }
  },
  xAxis: {
    gridLineColor: '#1a1a1a',
    labels: {
      style: {
        color: '#666666',
        fontSize: '10px'
      }
    },
    lineColor: '#1a1a1a',
    minorGridLineColor: '#111111',
    tickColor: '#1a1a1a',
    title: {
      style: {
        color: '#888888'
      }
    }
  },
  yAxis: {
    gridLineColor: '#1a1a1a',
    labels: {
      style: {
        color: '#666666',
        fontSize: '10px'
      }
    },
    lineColor: '#1a1a1a',
    minorGridLineColor: '#111111',
    tickColor: '#1a1a1a',
    tickWidth: 1,
    title: {
      style: {
        color: '#888888',
        fontSize: '10px'
      }
    }
  },
  legend: {
    enabled: true,
    itemStyle: {
      color: '#ffffff',
      fontWeight: '400',
      fontSize: '10px'
    },
    itemHoverStyle: {
      color: '#888888'
    },
    itemHiddenStyle: {
      color: '#333333'
    }
  },
  credits: {
    enabled: false
  }
};

// Apply theme once
Highcharts.setOptions(darkTheme);

// Series Colors - Monochromatic shades
const MONO_COLORS = ['#ffffff', '#a1a1a1', '#525252'];

// Utility to process series data
const processSeries = (data, valueKey) => {
  const statSeries = MONO_COLORS.map((color, i) => ({
    name: `Stream ${i + 1}`,
    data: [],
    color: color,
    lineWidth: 1.5,
    states: {
      hover: {
        lineWidth: 2
      }
    }
  }));

  data.forEach((entry) => {
    if (entry.stats && entry.stats.length > 0) {
      entry.stats.forEach((stat, statIndex) => {
        if (stat && statIndex < 3) {
          const timestamp = new Date(stat.timestamp).getTime();
          let value;

          if (typeof valueKey === 'function') {
            value = valueKey(stat);
          } else {
            value = valueKey.split('.').reduce((obj, key) => obj?.[key], stat);
          }

          if (value !== undefined) {
            statSeries[statIndex].data.push({
              x: timestamp,
              y: value
            });
          }
        }
      });
    }
  });

  return statSeries;
};

// Common Chart Wrapper Component
function BaseChart({ title, valueKey, yAxisLabel, dataset, formatter = (v) => v }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const seriesData = processSeries(dataset, valueKey);

    // Use Highcharts.chart instead of stockChart to completely avoid zoom/navigator features
    const chart = Highcharts.chart(chartRef.current, {
      title: { text: '' },
      yAxis: {
        title: { text: yAxisLabel },
        labels: { formatter: function () { return formatter(this.value); } }
      },
      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function () {
            return new Date(this.value).toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        borderColor: '#1a1a1a',
        style: { color: '#ffffff' },
        shared: true,
        useHTML: true,
        headerFormat: '<div style="margin-bottom: 5px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 3px;">{point.key}</div>',
        pointFormat: '<div style="display: flex; justify-content: space-between; gap: 10px;">' +
          '<span style="color:{series.color}">●</span> {series.name}: ' +
          '<span style="font-weight: bold;">{point.y}</span>' +
          '</div>'
      },
      series: seriesData
    });

    return () => chart.destroy();
  }, [valueKey, title, yAxisLabel, formatter, dataset]);

  return (
    <div className="chart-card glass rounded-xl p-6 h-full border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">{title}</h3>
      </div>
      <div ref={chartRef} style={{ height: "280px", width: "100%" }}></div>
    </div>
  );
}

function GridSection({ title, dataset }) {
  return (
    <section className="mb-24">
      <div className="flex items-center gap-6 mb-12">
        <h2 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap">{title}</h2>
        <div className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BaseChart
          title="Resolution Profile"
          valueKey="size.width"
          yAxisLabel="Width (px)"
          dataset={dataset}
          formatter={(v) => `${v}px`}
        />
        <BaseChart
          title="Network Jitter"
          valueKey="jitter"
          yAxisLabel="Jitter (ms)"
          dataset={dataset}
          formatter={(v) => `${v}ms`}
        />
        <BaseChart
          title="Latency (RTT)"
          valueKey="rtt"
          yAxisLabel="RTT (ms)"
          dataset={dataset}
          formatter={(v) => `${v}ms`}
        />
        <BaseChart
          title="Packet Loss Rate"
          valueKey={(s) => s.totalPackets > 0 ? (s.packetsLost / s.totalPackets) * 100 : 0}
          yAxisLabel="Loss (%)"
          dataset={dataset}
          formatter={(v) => `${v.toFixed(2)}%`}
        />
        <BaseChart
          title="Transmission Bitrate"
          valueKey="bitrate"
          yAxisLabel="Bitrate (kbps)"
          dataset={dataset}
          formatter={(v) => `${(v / 1000).toFixed(1)}M`}
        />
        <BaseChart
          title="Visual Fidelity (FPS)"
          valueKey="size.framerate"
          yAxisLabel="FPS"
          dataset={dataset}
          formatter={(v) => `${v} fps`}
        />
      </div>
    </section>
  );
}

export default function ChartComponent() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black antialiased font-sans">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <GridSection title="Primary Diagnostics" dataset={videoStats1} />
        <GridSection title="Historical Reference" dataset={videoStats2} />
      </main>
    </div>
  );
}
