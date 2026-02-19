const fs = require('fs');

// Since the data is in the selection, we'll need to read it from a file
// Let's create a function that transforms the data structure

function transformData(inputData) {
  if (typeof inputData === 'string') {
    inputData = JSON.parse(inputData);
  }
  
  const videoStats = inputData.videoStats || inputData;
  
  const transformed = videoStats.map(entry => ({
    parentTimestamp: entry.timestamp,
    timestamp: entry.timestamp,
    stats: entry.stats,
    _id: entry._id
  }));
  
  return transformed;
}

// Format as JavaScript module
function formatAsJSModule(data) {
  const jsonStr = JSON.stringify(data, null, 2);
  return `const videoStats = ${jsonStr};\n\nexport default videoStats;\n`;
}

// Export functions
module.exports = { transformData, formatAsJSModule };

console.log('Data transformation functions ready');
