import fs from 'fs';

// Function to round down timestamp to nearest 5 seconds
function getParentTimestamp(timestamp) {
  const date = new Date(timestamp);
  const seconds = date.getSeconds();
  const roundedSeconds = Math.floor(seconds / 5) * 5;
  date.setSeconds(roundedSeconds, 0);
  return date.toISOString();
}

// Transform flat array to nested format
function transformFlatData(flatData) {
  const grouped = {};
  
  flatData.forEach(stat => {
    const parentTimestamp = getParentTimestamp(stat.timestamp);
    
    if (!grouped[parentTimestamp]) {
      grouped[parentTimestamp] = {
        parentTimestamp: parentTimestamp,
        timestamp: parentTimestamp,
        stats: [],
        _id: stat._id
      };
    }
    
    const statWithLimitation = {
      ...stat,
      limitation: stat.limitation || {
        reason: "none",
        durations: {
          bandwidth: 0,
          cpu: 0,
          none: 0,
          other: 0
        },
        resolutionChanges: 0
      }
    };
    
    grouped[parentTimestamp].stats.push(statWithLimitation);
  });
  
  return Object.values(grouped).sort((a, b) => 
    new Date(a.parentTimestamp) - new Date(b.parentTimestamp)
  );
}

// Read input file (flat data)
const inputFile = process.argv[2] || 'flat-data.json';
const outputFile = process.argv[3] || 'Data.js';

try {
  const fileContent = fs.readFileSync(inputFile, 'utf8');
  // Handle both "videoStats": [...] and direct array
  let flatData;
  if (fileContent.trim().startsWith('{')) {
    const parsed = JSON.parse(fileContent);
    flatData = parsed.videoStats || parsed;
  } else {
    flatData = JSON.parse(fileContent);
  }
  
  const transformed = transformFlatData(flatData);
  const dataString = JSON.stringify(transformed, null, 2);
  const output = `const videoStats = ${dataString};\n\nexport default videoStats;`;
  
  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`Transformed ${flatData.length} entries into ${transformed.length} groups`);
  console.log(`Output written to ${outputFile}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
