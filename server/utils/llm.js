const fs = require("fs");
const xlsx = require("xlsx");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;

const generateContent = async (input) => {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const response = await model.generateContent([input]);
  const responseText = await response.response;
  return responseText.candidates[0].content.parts[0].text;

};

// Excel Parsing function
const inputExcelText = async (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Read the first sheet
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
    // Convert Excel data into a plain text format
    return jsonData.map(row => row.join(" ")).join("\n");
  };

// Analyze Financial Data function
module.exports.analyzeFinancialData = async (filePath) => {
  const excelText = await inputExcelText(filePath); // Extract text from the Excel file

  // Constructing the AI prompt
  const inputPrompt = `
      Act as a highly experienced financial analyst specializing in summarizing and explaining complex financial data for executives.
      Your task is to analyze the provided financial data, including transactions, audits, debits, credits, and other financial records.
      
      Please perform the following:
      - Summarize key financial insights
      - Generate data for charts (e.g., monthly revenue, expenses, etc.) in a format suitable for visualization.

      Here is the raw financial data extracted from an Excel file:
      ${excelText}

      I want the response in one single string having the structure starting and ending with curly brackets only in a valid json format
      {
        "Summary": "", 
        "KeyInsights": [],
        "ChartData": {
          "ExpensesByCategory": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "datasets": [{
              "label": "Expenses",
              "data": [800, 900, 850, 950, 1000, 900]
            }]
          },
          "TotalExpenses": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "datasets": [{
              "label": "Expenses",
              "data": [1000, 1500, 1200, 1800, 2000, 1700]
            }]
          }
        }
      }
        "FuturePredictions": {
            "labels": ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "datasets": [{
              "label": "Predicted Revenue",
              "data": [2100, 2300, 2500, 2700, 2900, 3100]
            }, {
              "label": "Predicted Expenses",
              "data": [1700, 1800, 1900, 2000, 2100, 2200]
            }]
          }
        }
      }
    `;

  // Get the response from Google AI
  const responseText = await generateContent(inputPrompt);
  return responseText;
};