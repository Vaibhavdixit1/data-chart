const fs = require('fs');

// Read JSON from file or create from the selection data
// The JSON structure from Untitled-1 needs to be saved first

const transformEntry = (entry) => ({
  parentTimestamp: entry.timestamp,
  timestamp: entry.timestamp,
  stats: entry.stats,
  _id: entry._id
});

// This will process the full dataset
console.log('Ready to process JSON data');
console.log('Please save the JSON from Untitled-1 as input.json, then run:');
console.log('node -e "const fs=require(\"fs\");const d=JSON.parse(fs.readFileSync(\"input.json\"));const t=d.videoStats.map(e=>({parentTimestamp:e.timestamp,timestamp:e.timestamp,stats:e.stats,_id:e._id}));fs.writeFileSync(\"Data.js\",\"const videoStats = \"+JSON.stringify(t,null,2)+\";\\nexport default videoStats;\\n\");"');
