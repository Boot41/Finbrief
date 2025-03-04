// Create test directories
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Set a longer timeout for Jest
jest.setTimeout(30000);

// Create test directories
const testFilesDir = path.join(__dirname, 'test-files');

if (!fs.existsSync(testFilesDir)) {
  fs.mkdirSync(testFilesDir);
}

// Create a test Excel file
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([
  ['Date', 'Revenue', 'Expenses'],
  ['2024-01-01', 1000, 500],
  ['2024-01-02', 1200, 600],
  ['2024-01-03', 800, 400]
]);
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
XLSX.writeFile(wb, path.join(testFilesDir, 'test.xlsx'));
