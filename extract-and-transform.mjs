import fs from 'fs';

function getParentTimestamp(timestamp) {
  const date = new Date(timestamp);
  const seconds = date.getSeconds();
  const roundedSeconds = Math.floor(seconds / 5) * 5;
  date.setSeconds(roundedSeconds, 0);
  return date.toISOString();
}

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

// Try to read from various possible file locations
const possibleFiles = [
  'Untitled-1',
  'untitled-1',
  'Untitled-1.json',
  'input.json'
];

let fileContent = null;
let inputFile = null;

// Check if file is provided as argument
if (process.argv[2]) {
  inputFile = process.argv[2];
  try {
    fileContent = fs.readFileSync(inputFile, 'utf8');
  } catch (e) {
    console.error(`Could not read ${inputFile}`);
  }
} else {
  // Try to find the file
  for (const file of possibleFiles) {
    try {
      fileContent = fs.readFileSync(file, 'utf8');
      inputFile = file;
      break;
    } catch (e) {
      // Continue
    }
  }
}

if (!fileContent) {
  console.error('Please provide the input file as argument: node extract-and-transform.mjs <input-file>');
  console.error('Or ensure one of these files exists:', possibleFiles.join(', '));
  process.exit(1);
}

// Parse the content - handle both "videoStats": [...] and direct array
let flatData;
try {
  // Try parsing as JSON first
  const parsed = JSON.parse(fileContent);
  flatData = parsed.videoStats || parsed;
  
  if (!Array.isArray(flatData)) {
    console.error('Data must be an array or an object with videoStats array');
    process.exit(1);
  }
} catch (e) {
  console.error('Error parsing JSON:', e.message);
  process.exit(1);
}

console.log(`Found ${flatData.length} entries in ${inputFile}`);

const transformed = transformFlatData(flatData);
const dataString = JSON.stringify(transformed, null, 2);
const output = `const videoStats = ${dataString};\n\nexport default videoStats;`;

fs.writeFileSync('Data.js', output, 'utf8');
console.log(`Transformed ${flatData.length} entries into ${transformed.length} groups`);
console.log('Output written to Data.js');
