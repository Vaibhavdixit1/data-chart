const fs = require('fs');

// Function to transform data
function transformData(inputData) {
  const videoStats = inputData.videoStats || inputData;
  return videoStats.map(entry => ({
    parentTimestamp: entry.timestamp,
    timestamp: entry.timestamp,
    stats: entry.stats,
    _id: entry._id
  }));
}

// Function to format as JS module
function formatAsJSModule(data) {
  const jsonStr = JSON.stringify(data, null, 2);
  return `const videoStats = ${jsonStr};\n\nexport default videoStats;\n`;
}

// Main processing
if (require.main === module) {
  const inputFile = process.argv[2] || 'input.json';
  
  try {
    const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const transformed = transformData(inputData);
    const output = formatAsJSModule(transformed);
    
    fs.writeFileSync('Data.js', output, 'utf8');
    console.log(`✓ Successfully transformed ${transformed.length} entries`);
    console.log('✓ Written to Data.js');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = { transformData, formatAsJSModule };
