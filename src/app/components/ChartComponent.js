"use client";

import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts/highstock";
import videoStats from "../../../Data.js";


// Horizontal Line Chart Component - Same as HorizontalBarChart but with lines
export function HorizontalLineChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const createHorizontalLineChart = () => {
      try {
        // Process video stats data for horizontal lines
        // Each stat becomes a separate line, width value determines line position
        const seriesData = [];

        // Use all data for complete visualization
        const limitedData = videoStats;

        // Create grouped series - one series per stat position
        const statSeries = [];

        // Initialize series for each stat position (S1, S2, S3)
        for (let statIndex = 0; statIndex < 3; statIndex++) {
          statSeries.push({
            name: `Stat ${statIndex + 1}`,
            data: [],
            color: `hsl(${(statIndex * 120) % 360}, 70%, 50%)`
          });
        }

        limitedData.forEach((entry, timestampIndex) => {
          if (entry.stats && entry.stats.length > 0) {
            // Process each stat within this parent timestamp
            entry.stats.forEach((stat, statIndex) => {
              if (stat && stat.size && statIndex < 3) {
                // Use the actual stat timestamp for x-axis
                const statTimestamp = new Date(stat.timestamp).getTime();
                
                // Add data point to the corresponding stat series
                statSeries[statIndex].data.push({
                  x: statTimestamp,
                  y: stat.size.width,
                  custom: {
                    timestamp: entry.timestamp,
                    statIndex: statIndex + 1,
                    width: stat.size.width,
                    height: stat.size.height,
                    framerate: stat.size.framerate
                  }
                });
              }
            });
          }
        });

        // Add all stat series to the chart
        seriesData.push(...statSeries);


        // Extract all unique timestamps for explicit tick positioning
        const allTimestamps = [];
        seriesData.forEach(series => {
          series.data.forEach(point => {
            if (!allTimestamps.includes(point.x)) {
              allTimestamps.push(point.x);
            }
          });
        });
        allTimestamps.sort((a, b) => a - b);

        // Create the stock chart
        const chart = Highcharts.stockChart(chartRef.current, {
          rangeSelector: {
            selected: 3,
            inputEnabled: false,
            inputDateFormat: '%Y-%m-%d',
            inputEditDateFormat: '%Y-%m-%d',
            inputDateParser: null,
            inputBoxWidth: 0,
            inputBoxHeight: 0,
            inputStyle: {
              display: 'none'
            },
            buttons: [
              {
                type: 'custom',
                count: 10,
                text: '10',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 10) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[9];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 20,
                text: '20',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 20) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[19];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 40,
                text: '40',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 40) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[39];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'all',
                text: 'All'
              }
            ]
          },

          title: {
            text: 'Video Width Analytics'
          },

          legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
              fontSize: '12px'
            },
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 2
          },

          xAxis: {
            overscroll: '10px',
            labels: {
              enabled: true,
              rotation: -45,
              style: {
                fontSize: '4px'
              },
              step: 1,
              staggerLines: 1,
              formatter: function() {
                return new Date(this.value).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                });
              }
            },
            tickInterval: null,
            type: 'datetime',
            minPadding: 0,
            maxPadding: 0,
            startOnTick: false,
            endOnTick: false,
            tickPositions: allTimestamps,
            tickPositioner: function() {
              return allTimestamps;
            }
          },

          yAxis: {
            min: 0,
            title: {
              text: 'Width (pixels)'
            }
          },

          navigator: {
            xAxis: {
              labels: {
                enabled: true,
                rotation: -45,
                style: {
                  fontSize: '4px'
                },
                step: 1,
                staggerLines: 1,
                formatter: function() {
                  return new Date(this.value).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  });
                }
              },
              tickInterval: null,
              type: 'datetime',
              minPadding: 0,
              maxPadding: 0,
              startOnTick: false,
              endOnTick: false,
              tickPositions: allTimestamps,
              tickPositioner: function() {
                return allTimestamps;
              }
            }
          },

          series: seriesData.map(series => ({
            ...series,
            tooltip: {
              valueDecimals: 0
            }
          }))
        });
      } catch (error) {
        console.error("Error creating horizontal line chart:", error);
      }
    };

    createHorizontalLineChart();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div ref={chartRef} style={{ height: "400px", width: "100%" }}></div>
    </div>
  );
}

// Jitter Horizontal Line Chart Component
export function JitterHorizontalLineChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const createJitterHorizontalLineChart = () => {
      try {
        const seriesData = [];
        const limitedData = videoStats;

        const statSeries = [];
        for (let statIndex = 0; statIndex < 3; statIndex++) {
          statSeries.push({
            name: `Stat ${statIndex + 1}`,
            data: [],
            color: `hsl(${(statIndex * 120) % 360}, 70%, 50%)`
          });
        }

        limitedData.forEach((entry, timestampIndex) => {
          if (entry.stats && entry.stats.length > 0) {
            entry.stats.forEach((stat, statIndex) => {
              if (stat && statIndex < 3) {
                // Use the actual stat timestamp for x-axis
                const statTimestamp = new Date(stat.timestamp).getTime();
                
                statSeries[statIndex].data.push({
                  x: statTimestamp,
                  y: stat.jitter,
                  custom: {
                    timestamp: entry.timestamp,
                    statIndex: statIndex + 1,
                    jitter: stat.jitter,
                    rtt: stat.rtt,
                    bitrate: stat.bitrate
                  }
                });
              }
            });
          }
        });

        seriesData.push(...statSeries);

        // Extract all unique timestamps for explicit tick positioning
        const allTimestamps = [];
        seriesData.forEach(series => {
          series.data.forEach(point => {
            if (!allTimestamps.includes(point.x)) {
              allTimestamps.push(point.x);
            }
          });
        });
        allTimestamps.sort((a, b) => a - b);

        const chart = Highcharts.stockChart(chartRef.current, {
          rangeSelector: {
            selected: 3,
            inputEnabled: false,
            inputDateFormat: '%Y-%m-%d',
            inputEditDateFormat: '%Y-%m-%d',
            inputDateParser: null,
            inputBoxWidth: 0,
            inputBoxHeight: 0,
            inputStyle: {
              display: 'none'
            },
            buttons: [
              {
                type: 'custom',
                count: 10,
                text: '10',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 10) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[9];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 20,
                text: '20',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 20) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[19];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 40,
                text: '40',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 40) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[39];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'all',
                text: 'All'
              }
            ]
          },

          title: {
            text: 'Jitter Analytics'
          },

          legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
              fontSize: '12px'
            },
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 2
          },

          xAxis: {
            overscroll: '10px',
            labels: {
              enabled: true,
              rotation: -45,
              style: {
                fontSize: '4px'
              },
              step: 1,
              staggerLines: 1,
              formatter: function() {
                return new Date(this.value).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                });
              }
            },
            tickInterval: null,
            type: 'datetime',
            minPadding: 0,
            maxPadding: 0,
            startOnTick: false,
            endOnTick: false,
            tickPositions: allTimestamps,
            tickPositioner: function() {
              return allTimestamps;
            }
          },

          yAxis: {
            min: 0,
            title: {
              text: 'Jitter (ms)'
            }
          },

          navigator: {
            xAxis: {
              labels: {
                enabled: true,
                rotation: -45,
                style: {
                  fontSize: '4px'
                },
                step: 1,
                staggerLines: 1,
                formatter: function() {
                  return new Date(this.value).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  });
                }
              },
              tickInterval: null,
              type: 'datetime',
              minPadding: 0,
              maxPadding: 0,
              startOnTick: false,
              endOnTick: false,
              tickPositions: allTimestamps,
              tickPositioner: function() {
                return allTimestamps;
              }
            }
          },

          series: seriesData.map(series => ({
            ...series,
            tooltip: {
              valueDecimals: 2
            }
          }))
        });
      } catch (error) {
        console.error("Error creating jitter horizontal line chart:", error);
      }
    };

    createJitterHorizontalLineChart();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div ref={chartRef} style={{ height: "400px", width: "100%" }}></div>
    </div>
  );
}

// RTT/Latency Horizontal Line Chart Component
export function RTTHorizontalLineChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const createRTTHorizontalLineChart = () => {
      try {
        const seriesData = [];
        const limitedData = videoStats;

        const statSeries = [];
        for (let statIndex = 0; statIndex < 3; statIndex++) {
          statSeries.push({
            name: `Stat ${statIndex + 1}`,
            data: [],
            color: `hsl(${(statIndex * 120) % 360}, 70%, 50%)`
          });
        }

        limitedData.forEach((entry, timestampIndex) => {
          if (entry.stats && entry.stats.length > 0) {
            entry.stats.forEach((stat, statIndex) => {
              if (stat && statIndex < 3) {
                // Use the actual stat timestamp for x-axis
                const statTimestamp = new Date(stat.timestamp).getTime();
                
                statSeries[statIndex].data.push({
                  x: statTimestamp,
                  y: stat.rtt,
                  custom: {
                    timestamp: entry.timestamp,
                    statIndex: statIndex + 1,
                    rtt: stat.rtt,
                    jitter: stat.jitter,
                    bitrate: stat.bitrate
                  }
                });
              }
            });
          }
        });

        seriesData.push(...statSeries);

        // Extract all unique timestamps for explicit tick positioning
        const allTimestamps = [];
        seriesData.forEach(series => {
          series.data.forEach(point => {
            if (!allTimestamps.includes(point.x)) {
              allTimestamps.push(point.x);
            }
          });
        });
        allTimestamps.sort((a, b) => a - b);

        const chart = Highcharts.stockChart(chartRef.current, {
          rangeSelector: {
            selected: 3,
            inputEnabled: false,
            inputDateFormat: '%Y-%m-%d',
            inputEditDateFormat: '%Y-%m-%d',
            inputDateParser: null,
            inputBoxWidth: 0,
            inputBoxHeight: 0,
            inputStyle: {
              display: 'none'
            },
            buttons: [
              {
                type: 'custom',
                count: 10,
                text: '10',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 10) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[9];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 20,
                text: '20',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 20) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[19];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 40,
                text: '40',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 40) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[39];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'all',
                text: 'All'
              }
            ]
          },

          title: {
            text: 'RTT/Latency Analytics'
          },

          legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
              fontSize: '12px'
            },
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 2
          },

          xAxis: {
            overscroll: '10px',
            labels: {
              enabled: true,
              rotation: -45,
              style: {
                fontSize: '4px'
              },
              step: 1,
              staggerLines: 1,
              formatter: function() {
                return new Date(this.value).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                });
              }
            },
            tickInterval: null,
            type: 'datetime',
            minPadding: 0,
            maxPadding: 0,
            startOnTick: false,
            endOnTick: false,
            tickPositions: allTimestamps,
            tickPositioner: function() {
              return allTimestamps;
            }
          },

          yAxis: {
            min: 0,
            title: {
              text: 'RTT (ms)'
            }
          },

          navigator: {
            xAxis: {
              labels: {
                enabled: true,
                rotation: -45,
                style: {
                  fontSize: '4px'
                },
                step: 1,
                staggerLines: 1,
                formatter: function() {
                  return new Date(this.value).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  });
                }
              },
              tickInterval: null,
              type: 'datetime',
              minPadding: 0,
              maxPadding: 0,
              startOnTick: false,
              endOnTick: false,
              tickPositions: allTimestamps,
              tickPositioner: function() {
                return allTimestamps;
              }
            }
          },

          series: seriesData.map(series => ({
            ...series,
            tooltip: {
              valueDecimals: 2
            }
          }))
        });
      } catch (error) {
        console.error("Error creating RTT horizontal line chart:", error);
      }
    };

    createRTTHorizontalLineChart();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div ref={chartRef} style={{ height: "400px", width: "100%" }}></div>
    </div>
  );
}

// Packet Loss Percentage Horizontal Line Chart Component
export function PacketLossHorizontalLineChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const createPacketLossHorizontalLineChart = () => {
      try {
        const seriesData = [];
        const limitedData = videoStats;

        const statSeries = [];
        for (let statIndex = 0; statIndex < 3; statIndex++) {
          statSeries.push({
            name: `Stat ${statIndex + 1}`,
            data: [],
            color: `hsl(${(statIndex * 120) % 360}, 70%, 50%)`
          });
        }

        limitedData.forEach((entry, timestampIndex) => {
          if (entry.stats && entry.stats.length > 0) {
            entry.stats.forEach((stat, statIndex) => {
              if (stat && statIndex < 3) {
                // Use the actual stat timestamp for x-axis
                const statTimestamp = new Date(stat.timestamp).getTime();
                
                const packetLossPercentage = stat.totalPackets > 0
                  ? (stat.packetsLost / stat.totalPackets) * 100
                  : 0;

                statSeries[statIndex].data.push({
                  x: statTimestamp,
                  y: packetLossPercentage,
                  custom: {
                    timestamp: entry.timestamp,
                    statIndex: statIndex + 1,
                    packetLossPercentage: packetLossPercentage,
                    packetsLost: stat.packetsLost,
                    totalPackets: stat.totalPackets
                  }
                });
              }
            });
          }
        });

        seriesData.push(...statSeries);

        // Extract all unique timestamps for explicit tick positioning
        const allTimestamps = [];
        seriesData.forEach(series => {
          series.data.forEach(point => {
            if (!allTimestamps.includes(point.x)) {
              allTimestamps.push(point.x);
            }
          });
        });
        allTimestamps.sort((a, b) => a - b);

        const chart = Highcharts.stockChart(chartRef.current, {
          rangeSelector: {
            selected: 3,
            inputEnabled: false,
            inputDateFormat: '%Y-%m-%d',
            inputEditDateFormat: '%Y-%m-%d',
            inputDateParser: null,
            inputBoxWidth: 0,
            inputBoxHeight: 0,
            inputStyle: {
              display: 'none'
            },
            buttons: [
              {
                type: 'custom',
                count: 10,
                text: '10',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 10) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[9];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 20,
                text: '20',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 20) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[19];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 40,
                text: '40',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 40) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[39];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'all',
                text: 'All'
              }
            ]
          },

          title: {
            text: 'Packet Loss Percentage Analytics'
          },

          legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
              fontSize: '12px'
            },
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 2
          },

          xAxis: {
            overscroll: '10px',
            labels: {
              enabled: true,
              rotation: -45,
              style: {
                fontSize: '4px'
              },
              step: 1,
              staggerLines: 1,
              formatter: function() {
                return new Date(this.value).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                });
              }
            },
            tickInterval: null,
            type: 'datetime',
            minPadding: 0,
            maxPadding: 0,
            startOnTick: false,
            endOnTick: false,
            tickPositions: allTimestamps,
            tickPositioner: function() {
              return allTimestamps;
            }
          },

          yAxis: {
            min: 0,
            title: {
              text: 'Packet Loss (%)'
            }
          },

          navigator: {
            xAxis: {
              labels: {
                enabled: true,
                rotation: -45,
                style: {
                  fontSize: '4px'
                },
                step: 1,
                staggerLines: 1,
                formatter: function() {
                  return new Date(this.value).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  });
                }
              },
              tickInterval: null,
              type: 'datetime',
              minPadding: 0,
              maxPadding: 0,
              startOnTick: false,
              endOnTick: false,
              tickPositions: allTimestamps,
              tickPositioner: function() {
                return allTimestamps;
              }
            }
          },

          series: seriesData.map(series => ({
            ...series,
            tooltip: {
              valueDecimals: 2
            }
          }))
        });
      } catch (error) {
        console.error("Error creating packet loss horizontal line chart:", error);
      }
    };

    createPacketLossHorizontalLineChart();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div ref={chartRef} style={{ height: "400px", width: "100%" }}></div>
    </div>
  );
}

// Bitrate Horizontal Line Chart Component
export function BitrateHorizontalLineChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const createBitrateHorizontalLineChart = () => {
      try {
        const seriesData = [];
        const limitedData = videoStats;

        const statSeries = [];
        for (let statIndex = 0; statIndex < 3; statIndex++) {
          statSeries.push({
            name: `Stat ${statIndex + 1}`,
            data: [],
            color: `hsl(${(statIndex * 120) % 360}, 70%, 50%)`
          });
        }

        limitedData.forEach((entry, timestampIndex) => {
          if (entry.stats && entry.stats.length > 0) {
            entry.stats.forEach((stat, statIndex) => {
              if (stat && statIndex < 3) {
                // Use the actual stat timestamp for x-axis
                const statTimestamp = new Date(stat.timestamp).getTime();
                
                statSeries[statIndex].data.push({
                  x: statTimestamp,
                  y: stat.bitrate,
                  custom: {
                    timestamp: entry.timestamp,
                    statIndex: statIndex + 1,
                    bitrate: stat.bitrate,
                    jitter: stat.jitter,
                    rtt: stat.rtt
                  }
                });
              }
            });
          }
        });

        seriesData.push(...statSeries);

        // Extract all unique timestamps for explicit tick positioning
        const allTimestamps = [];
        seriesData.forEach(series => {
          series.data.forEach(point => {
            if (!allTimestamps.includes(point.x)) {
              allTimestamps.push(point.x);
            }
          });
        });
        allTimestamps.sort((a, b) => a - b);

        const chart = Highcharts.stockChart(chartRef.current, {
          rangeSelector: {
            selected: 3,
            inputEnabled: false,
            inputDateFormat: '%Y-%m-%d',
            inputEditDateFormat: '%Y-%m-%d',
            inputDateParser: null,
            inputBoxWidth: 0,
            inputBoxHeight: 0,
            inputStyle: {
              display: 'none'
            },
            buttons: [
              {
                type: 'custom',
                count: 10,
                text: '10',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 10) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[9];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 20,
                text: '20',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 20) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[19];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 40,
                text: '40',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 40) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[39];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'all',
                text: 'All'
              }
            ]
          },

          title: {
            text: 'Bitrate Analytics'
          },

          legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
              fontSize: '12px'
            },
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 2
          },

          xAxis: {
            overscroll: '10px',
            labels: {
              enabled: true,
              rotation: -45,
              style: {
                fontSize: '4px'
              },
              step: 1,
              staggerLines: 1,
              formatter: function() {
                return new Date(this.value).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                });
              }
            },
            tickInterval: null,
            type: 'datetime',
            minPadding: 0,
            maxPadding: 0,
            startOnTick: false,
            endOnTick: false,
            tickPositions: allTimestamps,
            tickPositioner: function() {
              return allTimestamps;
            }
          },

          yAxis: {
            min: 0,
            title: {
              text: 'Bitrate (kbps)'
            }
          },

          navigator: {
            xAxis: {
              labels: {
                enabled: true,
                rotation: -45,
                style: {
                  fontSize: '4px'
                },
                step: 1,
                staggerLines: 1,
                formatter: function() {
                  return new Date(this.value).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  });
                }
              },
              tickInterval: null,
              type: 'datetime',
              minPadding: 0,
              maxPadding: 0,
              startOnTick: false,
              endOnTick: false,
              tickPositions: allTimestamps,
              tickPositioner: function() {
                return allTimestamps;
              }
            }
          },

          series: seriesData.map(series => ({
            ...series,
            tooltip: {
              valueDecimals: 2
            }
          }))
        });
      } catch (error) {
        console.error("Error creating bitrate horizontal line chart:", error);
      }
    };

    createBitrateHorizontalLineChart();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div ref={chartRef} style={{ height: "400px", width: "100%" }}></div>
    </div>
  );
}

// FPS Horizontal Line Chart Component
export function FPSHorizontalLineChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const createFPSHorizontalLineChart = () => {
      try {
        const seriesData = [];
        const limitedData = videoStats;

        const statSeries = [];
        for (let statIndex = 0; statIndex < 3; statIndex++) {
          statSeries.push({
            name: `Stat ${statIndex + 1}`,
            data: [],
            color: `hsl(${(statIndex * 120) % 360}, 70%, 50%)`
          });
        }

        limitedData.forEach((entry, timestampIndex) => {
          if (entry.stats && entry.stats.length > 0) {
            entry.stats.forEach((stat, statIndex) => {
              if (stat && stat.size && statIndex < 3) {
                // Use the actual stat timestamp for x-axis
                const statTimestamp = new Date(stat.timestamp).getTime();
                
                statSeries[statIndex].data.push({
                  x: statTimestamp,
                  y: stat.size.framerate,
                  custom: {
                    timestamp: entry.timestamp,
                    statIndex: statIndex + 1,
                    framerate: stat.size.framerate,
                    width: stat.size.width,
                    height: stat.size.height
                  }
                });
              }
            });
          }
        });

        seriesData.push(...statSeries);

        // Extract all unique timestamps for explicit tick positioning
        const allTimestamps = [];
        seriesData.forEach(series => {
          series.data.forEach(point => {
            if (!allTimestamps.includes(point.x)) {
              allTimestamps.push(point.x);
            }
          });
        });
        allTimestamps.sort((a, b) => a - b);

        const chart = Highcharts.stockChart(chartRef.current, {
          rangeSelector: {
            selected: 3,
            inputEnabled: false,
            inputDateFormat: '%Y-%m-%d',
            inputEditDateFormat: '%Y-%m-%d',
            inputDateParser: null,
            inputBoxWidth: 0,
            inputBoxHeight: 0,
            inputStyle: {
              display: 'none'
            },
            buttons: [
              {
                type: 'custom',
                count: 10,
                text: '10',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 10) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[9];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 20,
                text: '20',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 20) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[19];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'custom',
                count: 40,
                text: '40',
                events: {
                  click: function() {
                    if (allTimestamps && allTimestamps.length > 40) {
                      const startTime = allTimestamps[0];
                      const endTime = allTimestamps[39];
                      chart.xAxis[0].setExtremes(startTime, endTime);
                    }
                  }
                }
              },
              {
                type: 'all',
                text: 'All'
              }
            ]
          },

          title: {
            text: 'FPS Analytics'
          },

          legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
              fontSize: '12px'
            },
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 2
          },

          xAxis: {
            overscroll: '10px',
            labels: {
              enabled: true,
              rotation: -45,
              style: {
                fontSize: '4px'
              },
              step: 1,
              staggerLines: 1,
              formatter: function() {
                return new Date(this.value).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                });
              }
            },
            tickInterval: null,
            type: 'datetime',
            minPadding: 0,
            maxPadding: 0,
            startOnTick: false,
            endOnTick: false,
            tickPositions: allTimestamps,
            tickPositioner: function() {
              return allTimestamps;
            }
          },

          yAxis: {
            min: 0,
            title: {
              text: 'FPS'
            }
          },

          navigator: {
            xAxis: {
              labels: {
                enabled: true,
                rotation: -45,
                style: {
                  fontSize: '4px'
                },
                step: 1,
                staggerLines: 1,
                formatter: function() {
                  return new Date(this.value).toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                  });
                }
              },
              tickInterval: null,
              type: 'datetime',
              minPadding: 0,
              maxPadding: 0,
              startOnTick: false,
              endOnTick: false,
              tickPositions: allTimestamps,
              tickPositioner: function() {
                return allTimestamps;
              }
            }
          },

          series: seriesData.map(series => ({
            ...series,
            tooltip: {
              valueDecimals: 0
            }
          }))
        });
      } catch (error) {
        console.error("Error creating FPS horizontal line chart:", error);
      }
    };

    createFPSHorizontalLineChart();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div ref={chartRef} style={{ height: "400px", width: "100%" }}></div>
    </div>
  );
}


export default function ChartComponent() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-20">
        {/* Video Width Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6 ">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            Video Width Analytics
          </h2>
          <HorizontalLineChart />
        </div>

        {/* Jitter Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            Jitter Analytics
          </h2>
          <JitterHorizontalLineChart />
        </div>

        {/* RTT/Latency Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            RTT/Latency Analytics
          </h2>
          <RTTHorizontalLineChart />
        </div>

        {/* Packet Loss Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            Packet Loss Percentage Analytics
          </h2>
          <PacketLossHorizontalLineChart />
        </div>

        {/* Bitrate Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            Bitrate Analytics
          </h2>
          <BitrateHorizontalLineChart />
        </div>

        {/* FPS Analytics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            FPS Analytics
          </h2>
          <FPSHorizontalLineChart />
        </div>
      </div>
    </div>

  );
}
