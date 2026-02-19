const fs = require('fs');

// The data structure from Untitled-1
const inputData = {
  "videoStats": [
    {
      "timestamp": "2025-11-18T11:04:26.691Z",
      "stats": [{
        "bitrate": 0,
        "codec": null,
        "jitter": 0.888,
        "limitation": {
          "reason": "none",
          "durations": {
            "bandwidth": 0,
            "cpu": 0,
            "none": 1.063,
            "other": 0
          },
          "resolutionChanges": 0
        },
        "size": {
          "width": 640,
          "height": 360,
          "framerate": 20
        },
        "timestamp": "2025-11-18T11:04:26.689Z",
        "network": "WIFI",
        "packetsLost": 0,
        "totalPackets": 46,
        "rtt": 16,
        "_id": "691c52c3601f5518dde1c362"
      }],
      "_id": "691c52c3601f5518dde1c361"
    }
  ]
};

// Transform: add parentTimestamp
const transformed = inputData.videoStats.map(entry => ({
  parentTimestamp: entry.timestamp,
  timestamp: entry.timestamp,
  stats: entry.stats,
  _id: entry._id
}));

console.log(JSON.stringify(transformed[0], null, 2));
