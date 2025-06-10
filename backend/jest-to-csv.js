import fs from 'fs';
import path from 'path';

// Read JSON
const data = await fs.promises.readFile('test-results.json', 'utf8');
const jestResults = JSON.parse(data);

// Get today's date (YYYY-MM-DD)
const dateTaken = new Date().toISOString().split('T')[0];

const csvRows = [
  'suite,testName,status,duration,dateTaken'
];

for (const suite of jestResults.testResults) {
  for (const test of suite.assertionResults) {
    csvRows.push([
      JSON.stringify(path.basename(suite.name)),
      JSON.stringify(test.fullName),
      test.status,
      test.duration || '',
      dateTaken
    ].join(','));
  }
}

await fs.promises.writeFile('jest-results.csv', csvRows.join('\n'));
console.log('CSV written to jest-results.csv');
