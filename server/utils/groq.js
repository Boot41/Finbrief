const fs = require("fs");
const xlsx = require("xlsx");
const dotenv = require("dotenv");
const { Groq } = require("groq-sdk");

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Excel parsing functions
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

// Function to generate content using Groq
const generateContent = async (input, temperature = 0.3) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: temperature,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate content");
  }
};

// Function to analyze a single Excel file's financial data.
// Note: We now return the raw response text so that your API's JSON.parse() logic works as expected.
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
    - Give insights and improvement suggestions pointwise

    **Important:** Return the key insights as an array of strings (not objects). Each string should concisely summarize one insight.

    Here is the raw financial data extracted from an Excel file:
    ${excelText}

    I want the response in valid JSON format with the following structure:
    {
      "Summary": "",
      "KeyInsights": [
        "Revenue: 2485.76 (Increasing) - The revenue has been consistently increasing over the years.",
        "Profit/Loss: -2451.18 (Decreasing) - The company has been consistently incurring losses over the years.",
        "Employee Benefit Expenses: 621.01 (Increasing) - The company's employee benefit expenses have been increasing over the years."
      ],
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

// Function to answer user queries based on Excel financial data
module.exports.queryFinancialData = async (
  filePath,
  userQuery,
  temperature,
  prompt
) => {
  // Retrieve the Excel content from the file path
  const excelText = await inputExcelText(filePath);

  // Construct the prompt with strict instructions to output ONLY valid JSON
  // and to focus on providing a "RelevantData" array with detailed data points.
  const queryPrompt = `
    ${prompt || ""}
    
    Act as a financial expert analyzing the given data.
    Answer the user's question based on the financial data provided.
    Provide visualizations that best represent the data for the query.
    Return only valid JSON without any additional commentary or text.

    User Question: "${userQuery}"

    Here is the financial data:
    ${excelText}

    Provide the response in the following JSON format:
    {
      "Answer": "Detailed answer to the user's question",
      "RelevantData": [
        "Key data point 1",
        "Key data point 2",
        ...
      ],
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

  // Generate the response using Groq
  return await generateContent(queryPrompt, temperature);
};

// Function to compare financial data across multiple Excel files
module.exports.compareFinancialData = async (
  filePaths,
  temperature,
  prompt
) => {
  const filesData = await inputExcelTexts(filePaths);

  // Combine all file data into a single string
  let formattedData = filesData
    .map((file) => `File: ${file.filePath}\nData:\n${file.content}`)
    .join("\n\n");

  // Construct the prompt
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
            {"label": "Company A Revenue", "data": [100, 200, 300, ...]},
            {"label": "Company B Revenue", "data": [150, 250, 350, ...]}
          ]
        },
        "MetricComparison": {
          "labels": ["Revenue", "Expenses", "Profit"],
          "datasets": [
            {"label": "Company A", "data": [5000, 3000, 2000]},
            {"label": "Company B", "data": [6000, 4000, 2000]}
          ]
        },
        "GrowthRateComparison": {
          "labels": ["YoY Growth", "QoQ Growth"],
          "datasets": [
            {"label": "Company A", "data": [15, 5]},
            {"label": "Company B", "data": [20, 8]}
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
        "TimeSeriesComparison": { ... },
        "MetricComparison": { ... },
        "GrowthRateComparison": { ... }
      }
    }
  `;

  // Get the raw response from Groq
  const responseText = await generateContent(inputPrompt, temperature);

  // Remove any ```json fences and trim whitespace
  const cleanedResponse = responseText.replace(/```json|```/g, "").trim();

  // Return the cleaned JSON string
  return cleanedResponse;
};
