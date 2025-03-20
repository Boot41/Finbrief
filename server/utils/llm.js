const fs = require("fs");
const xlsx = require("xlsx");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Function to read and extract data from an Excel file.
 */
const inputExcelText = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  return jsonData.map((row) => row.join(" ")).join("\n");
};

const inputExcelTexts = async (filePaths) => {
  let fileData = [];
  for (const filePath of filePaths) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    fileData.push({
      filePath,
      content: jsonData.map((row) => row.join(" ")).join("\n"),
    });
  }
  return fileData;
};

/**
 * Generates AI response based on input.
 */
const generateContent = async (input, temperature = 0.3) => {
  // Configure model with temperature
  const modelConfig = {
    temperature: temperature,
    // Add any other model configuration parameters here
  };

  // Create a new model instance with the configuration
  const configuredModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    ...modelConfig,
  });

  const response = await configuredModel.generateContent([input]);
  const responseText = await response.response;
  return responseText.candidates[0].content.parts[0].text;
};

/**
 * Function to analyze and store financial data insights.
 */
module.exports.analyzeFinancialData = async (filePath, temperature, prompt) => {
  const excelText = await inputExcelText(filePath);

  const inputPrompt = `
        ${prompt || ""}
        
        Act as a highly experienced financial analyst. 
        Your task is to analyze the provided financial data including transactions, audits, debits, credits, and other records.

        Please perform the following:
        - Summarize key financial insights
        - Generate data for charts (e.g., revenue trends, expenses, etc.)
        - Predict future revenue and expenses for the next 6 months
        - Provide actionable insights on how to improve financial performance
        -Give insights and improvementsuggestion pointwise

        Here is the raw financial data extracted from an Excel file:
        ${excelText}

        I want the response in valid JSON format with the following structure:
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
          },
           "forecast": "",
          "FuturePredictions": {
            "labels": ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "datasets": [{
              "label": "Predicted Revenue",
              "data": [2100, 2300, 2500, 2700, 2900, 3100]
            }, {
              "label": "Predicted Expenses",
              "data": [1700, 1800, 1900, 2000, 2100, 2200]
            }]
          },
          "improvementsuggestions": [
          "Optimize cost structures by reducing unnecessary expenses.",
          "Increase revenue streams through diversified income sources.",
          "Enhance customer retention with better service offerings."
          ]
        }
    `;

  return await generateContent(inputPrompt, temperature);
};

/**
 * Function to handle user queries on uploaded Excel data.
 */
module.exports.queryFinancialData = async (
  filePath,
  userQuery,
  temperature,
  prompt
) => {
  const excelText = await inputExcelText(filePath);

  const queryPrompt = `
        ${prompt || ""}
        
        Act as a financial expert analyzing the given data.
        Answer the user's question based on the financial data provided.
        Provide visualizations that best represent the data for the query.


      User Question: "${userQuery}"

        Here is the financial data:
        ${excelText}

        Provide the response in the following JSON format:
        {
          "Answer": "Detailed answer to the user's question",
          "RelevantData": ["Key data point 1", "Key data point 2", ...],
          "ChartData": {
            "TimeSeries": {
              "labels": ["Jan", "Feb", "Mar", ...],
              "datasets": [{
                "label": "Revenue/Expenses/etc",
                "data": [100, 200, 300, ...]
              }]
            },
            "Categories": {
              "labels": ["Category 1", "Category 2", ...],
              "datasets": [{
                "label": "Amount",
                "data": [500, 300, 200, ...]
              }]
            },
            "Distribution": {
              "labels": ["Item 1", "Item 2", "Item 3", ...],
              "data": [30, 20, 15, ...]
            }
          }
        }

        Choose the most appropriate chart types based on the data:
        - Use TimeSeries for showing trends over time
        - Use Categories for comparing different categories
        - Use Distribution for showing percentage breakdowns
        
        Only include chart types that are relevant to the query.
    `;

  return await generateContent(queryPrompt, temperature);
};

//Comparing Financial Data
module.exports.compareFinancialData = async (
  filePaths,
  temperature,
  prompt
) => {
  const filesData = await inputExcelTexts(filePaths);

  let formattedData = filesData
    .map((file) => `File: ${file.filePath}\nData:\n${file.content}`)
    .join("\n\n");

  const inputPrompt = `
      ${prompt || ""}
      
      Act as a highly experienced financial analyst. 
      Perform a comprehensive comparative analysis of the provided financial data from multiple companies.

      Analysis should include:
      - Key financial metrics comparison (Revenue, Expenses, Profit, etc.)
      - Trends and patterns across companies
      - Significant variations and potential reasons
      - Future projections and improvement suggestions
      - Final performance ranking with justification

      Chart Requirements:
      Generate COMPARATIVE visualizations showing differences between companies.
      Use these chart structures:
      {
        "ComparativeCharts": {
          "TimeSeriesComparison": {
            "labels": ["Jan", "Feb", "Mar", ...],
            "datasets": [
              {"label": "Company A Revenue", "data": [100, 200, 300,...]},
              {"label": "Company B Revenue", "data": [150, 250, 350,...]}
             {"label": "Company C Revenue", "data": [550, 250, 350,...]}

            ]
          },
          "MetricComparison": {
            "labels": ["Revenue", "Expenses", "Profit"],
            "datasets": [
              {"label": "Company A", "data": [5000, 3000, 2000]},
              {"label": "Company B", "data": [6000, 4000, 2000]}
             {"label": "Company C", "data": [8000, 5000, 1000]}

            ]
          },
          "GrowthRateComparison": {
            "labels": ["YoY Growth", "QoQ Growth"],
            "datasets": [
              {"label": "Company A", "data": [15, 5]},
              {"label": "Company B", "data": [20, 8]}
              {"label": "Company C", "data": [10, 8]}

            ]
          }
        }
      }

      Include only relevant chart types based on data availability.
      Maintain consistent time periods/categories across companies.
      Focus on 3-5 key metrics that best show comparative performance.

      Raw financial data from Excel files:
      ${formattedData}

      Respond in JSON format (without markdown) with this structure:
      {
        "Analysis": {
          "KeyMetrics": "...",
          "Trends": "...",
          "Recommendations": "...",
          "PerformanceRanking": ["CompanyX", "CompanyY", ...]
        },
        "ComparativeCharts": {
          "TimeSeriesComparison": {...},
          "MetricComparison": {...},
          "GrowthRateComparison": {...}
        }
      }
  `;

  const responseText = await generateContent(inputPrompt, temperature);
  console.log(responseText)
  return responseText.replace(/```json|```/g, "").trim();
};
