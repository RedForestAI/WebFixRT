// Convert .mat files into csv files
// Open up the csv files in JavaScript
const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('test.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results);
    console.log(results[0].x)
  });