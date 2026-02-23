"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Highcharts from "highcharts/highstock";

// Shared Dark Theme for Highcharts
const darkTheme = {
    chart: {
        backgroundColor: 'transparent',
        style: {
            fontFamily: 'var(--font-geist-sans)'
        }
    },
    navigator: {
        enabled: false
    },
    rangeSelector: {
        enabled: false
    },
    scrollbar: {
        enabled: false
    },
    title: {
        style: {
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600'
        }
    },
    xAxis: {
        gridLineColor: 'rgba(255, 255, 255, 0.05)',
        gridLineDashStyle: 'Dash',
        labels: {
            style: {
                color: '#888888',
                fontSize: '10px'
            }
        },
        lineColor: 'rgba(255, 255, 255, 0.1)',
        minorGridLineColor: 'rgba(255, 255, 255, 0.02)',
        tickColor: 'rgba(255, 255, 255, 0.1)',
        title: {
            style: {
                color: '#aaaaaa'
            }
        }
    },
    yAxis: {
        gridLineColor: 'rgba(255, 255, 255, 0.05)',
        gridLineDashStyle: 'Dash',
        labels: {
            style: {
                color: '#888888',
                fontSize: '10px'
            }
        },
        lineColor: 'rgba(255, 255, 255, 0.1)',
        minorGridLineColor: 'rgba(255, 255, 255, 0.02)',
        tickColor: 'rgba(255, 255, 255, 0.1)',
        tickWidth: 1,
        title: {
            style: {
                color: '#aaaaaa',
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

Highcharts.setOptions(darkTheme);

const MONO_COLORS = ['#38bdf8', '#a78bfa', '#34d399'];

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

const computeKPIs = (data) => {
    let totalBitrate = 0, totalJitter = 0, totalFPS = 0, totalRTT = 0;
    let totalPacketsLost = 0, totalPackets = 0;
    let count = 0;
    let minBitrate = Infinity, maxBitrate = -Infinity;

    data.forEach((entry) => {
        if (entry.stats) {
            entry.stats.forEach((stat) => {
                totalBitrate += stat.bitrate || 0;
                totalJitter += stat.jitter || 0;
                totalFPS += stat.size?.framerate || 0;
                totalRTT += stat.rtt || 0;
                totalPacketsLost += stat.packetsLost || 0;
                totalPackets += stat.totalPackets || 0;
                if (stat.bitrate < minBitrate) minBitrate = stat.bitrate;
                if (stat.bitrate > maxBitrate) maxBitrate = stat.bitrate;
                count++;
            });
        }
    });

    return {
        avgBitrate: count > 0 ? totalBitrate / count : 0,
        avgJitter: count > 0 ? totalJitter / count : 0,
        avgFPS: count > 0 ? totalFPS / count : 0,
        avgRTT: count > 0 ? totalRTT / count : 0,
        packetLoss: totalPackets > 0 ? (totalPacketsLost / totalPackets) * 100 : 0,
        totalSamples: count,
        minBitrate: minBitrate === Infinity ? 0 : minBitrate,
        maxBitrate: maxBitrate === -Infinity ? 0 : maxBitrate,
    };
};

const computeLimitations = (data) => {
    const reasons = { none: 0, cpu: 0, bandwidth: 0, other: 0 };

    data.forEach((entry) => {
        if (entry.stats) {
            entry.stats.forEach((stat) => {
                const reason = stat.limitation?.reason || 'other';
                if (reasons[reason] !== undefined) {
                    reasons[reason]++;
                } else {
                    reasons.other++;
                }
            });
        }
    });

    return Object.entries(reasons)
        .filter(([, v]) => v > 0)
        .map(([name, y]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), y }));
};

const computeStreamAverages = (data) => {
    const streams = [
        { bitrate: 0, jitter: 0, fps: 0, rtt: 0, count: 0 },
        { bitrate: 0, jitter: 0, fps: 0, rtt: 0, count: 0 },
        { bitrate: 0, jitter: 0, fps: 0, rtt: 0, count: 0 },
    ];

    data.forEach((entry) => {
        if (entry.stats) {
            entry.stats.forEach((stat, i) => {
                if (i < 3) {
                    streams[i].bitrate += stat.bitrate || 0;
                    streams[i].jitter += stat.jitter || 0;
                    streams[i].fps += stat.size?.framerate || 0;
                    streams[i].rtt += stat.rtt || 0;
                    streams[i].count++;
                }
            });
        }
    });

    return streams.map((s, i) => ({
        name: `Stream ${i + 1}`,
        avgBitrate: s.count > 0 ? s.bitrate / s.count : 0,
        avgJitter: s.count > 0 ? s.jitter / s.count : 0,
        avgFPS: s.count > 0 ? s.fps / s.count : 0,
        avgRTT: s.count > 0 ? s.rtt / s.count : 0,
    }));
};

function useAnimatedValue(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start = 0;
        const startTime = performance.now();
        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(start + (target - start) * eased);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target, duration]);
    return value;
}

function KPICard({ label, value, unit, delay = 0 }) {
    const animatedVal = useAnimatedValue(value);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    const displayVal = typeof value === 'number'
        ? (value >= 100 ? Math.round(animatedVal).toLocaleString() : animatedVal.toFixed(2))
        : value;

    return (
        <div
            className={`chart-card relative group bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl rounded-2xl p-6 border border-white/5 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="relative z-10 text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-3 group-hover:text-white/60 transition-colors">{label}</p>
            <div className="relative z-10 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">{displayVal}</span>
                {unit && <span className="text-sm text-white/30 font-medium">{unit}</span>}
            </div>
        </div>
    );
}

export function KPISummary({ dataset, title }) {
    const kpis = useMemo(() => computeKPIs(dataset), [dataset]);

    return (
        <section className="mb-16">
            <div className="flex items-center gap-6 mb-8">
                <h2 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap">{title}</h2>
                <div className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard label="Avg Bitrate" value={kpis.avgBitrate} unit="kbps" delay={0} />
                <KPICard label="Avg Jitter" value={kpis.avgJitter} unit="ms" delay={80} />
                <KPICard label="Avg FPS" value={kpis.avgFPS} unit="fps" delay={160} />
                <KPICard label="Avg RTT" value={kpis.avgRTT} unit="ms" delay={240} />
                <KPICard label="Packet Loss" value={kpis.packetLoss} unit="%" delay={320} />
                <KPICard label="Total Samples" value={kpis.totalSamples} unit="" delay={400} />
            </div>
        </section>
    );
}

function StackedAreaChart({ dataset, title }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const seriesData = processSeries(dataset, 'bitrate');
        seriesData.forEach((s, i) => {
            s.type = 'area';
            s.fillColor = {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, Highcharts.color(MONO_COLORS[i]).setOpacity(0.25).get('rgba')],
                    [1, Highcharts.color(MONO_COLORS[i]).setOpacity(0.02).get('rgba')]
                ]
            };
            s.lineWidth = 1.5;
        });

        const chart = Highcharts.chart(chartRef.current, {
            chart: { type: 'area' },
            title: { text: '' },
            xAxis: {
                type: 'datetime',
                labels: {
                    formatter: function () {
                        return new Date(this.value).toLocaleTimeString('en-US', {
                            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
                        });
                    }
                }
            },
            yAxis: {
                title: { text: 'Bitrate (kbps)' },
                labels: { formatter: function () { return `${(this.value / 1000).toFixed(1)}M`; } }
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    marker: { enabled: false },
                    lineWidth: 1.5,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                style: { color: '#ffffff' },
                shared: true,
                useHTML: true,
                headerFormat: '<div style="margin-bottom: 5px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 3px;">{point.key}</div>',
                pointFormat: '<div style="display: flex; justify-content: space-between; gap: 10px;">' +
                    '<span style="color:{series.color}">●</span> {series.name}: ' +
                    '<span style="font-weight: bold;">{point.y:.1f} kbps</span>' +
                    '</div>'
            },
            series: seriesData
        });

        return () => chart.destroy();
    }, [dataset]);

    return (
        <div className="chart-card glass rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">{title}</h3>
            </div>
            <div ref={chartRef} style={{ height: "300px", width: "100%" }}></div>
        </div>
    );
}

function LimitationDonut({ dataset, title }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const data = computeLimitations(dataset);
        const donutColors = ['#38bdf8', '#a78bfa', '#34d399', '#f472b6'];

        const chart = Highcharts.chart(chartRef.current, {
            chart: { type: 'pie' },
            title: { text: '' },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                        style: { color: '#888888', fontSize: '10px', textOutline: 'none' },
                        distance: 20
                    },
                    colors: donutColors,
                    states: {
                        hover: {
                            brightness: 0.15
                        }
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                style: { color: '#ffffff' },
                pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y} samples)'
            },
            series: [{
                name: 'Limitation',
                data: data
            }]
        });

        return () => chart.destroy();
    }, [dataset]);

    return (
        <div className="chart-card glass rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">{title}</h3>
            </div>
            <div ref={chartRef} style={{ height: "300px", width: "100%" }}></div>
        </div>
    );
}

function StreamComparisonChart({ dataset, title }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const averages = computeStreamAverages(dataset);
        const categories = averages.map((a) => a.name);

        const chart = Highcharts.chart(chartRef.current, {
            chart: { type: 'column' },
            title: { text: '' },
            xAxis: {
                categories,
                labels: { style: { color: '#888888', fontSize: '10px' } }
            },
            yAxis: [
                {
                    title: { text: 'Bitrate (kbps)' },
                    labels: { formatter: function () { return `${(this.value / 1000).toFixed(1)}M`; } },
                    opposite: false
                },
                {
                    title: { text: 'FPS / RTT / Jitter' },
                    opposite: true,
                    gridLineWidth: 0
                }
            ],
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                style: { color: '#ffffff' },
                shared: true,
                useHTML: true,
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                    borderRadius: 3,
                    groupPadding: 0.15,
                }
            },
            series: [
                {
                    name: 'Avg Bitrate',
                    data: averages.map((a) => Math.round(a.avgBitrate)),
                    color: '#38bdf8',
                    yAxis: 0,
                },
                {
                    name: 'Avg FPS',
                    data: averages.map((a) => parseFloat(a.avgFPS.toFixed(1))),
                    color: '#a78bfa',
                    yAxis: 1,
                },
                {
                    name: 'Avg Jitter',
                    data: averages.map((a) => parseFloat(a.avgJitter.toFixed(2))),
                    color: '#34d399',
                    yAxis: 1,
                },
            ]
        });

        return () => chart.destroy();
    }, [dataset]);

    return (
        <div className="chart-card glass rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase">{title}</h3>
            </div>
            <div ref={chartRef} style={{ height: "300px", width: "100%" }}></div>
        </div>
    );
}

export function InsightsSection({ dataset, label }) {
    return (
        <section className="mb-24">
            <div className="flex items-center gap-6 mb-12">
                <h2 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap">{label}</h2>
                <div className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <StackedAreaChart dataset={dataset} title="Cumulative Bitrate Distribution" />
                <LimitationDonut dataset={dataset} title="Quality Limitation Breakdown" />
            </div>
            <div className="grid grid-cols-1 gap-8">
                <StreamComparisonChart dataset={dataset} title="Per-Stream Average Comparison" />
            </div>
        </section>
    );
}

function BaseChart({ title, valueKey, yAxisLabel, dataset, formatter = (v) => v }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const seriesData = processSeries(dataset, valueKey);

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
                backgroundColor: 'rgba(10, 10, 10, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
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

export function GridSection({ title, dataset }) {
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
