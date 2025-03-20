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

    const response = completion.choices[0].message.content;
    
    // Parse and clean the response to ensure valid JSON
    try {
      const parsedResponse = JSON.parse(response);
      
      // Clean percentage values in GrowthRateComparison
      if (parsedResponse.ComparativeCharts?.GrowthRateComparison?.datasets) {
        parsedResponse.ComparativeCharts.GrowthRateComparison.datasets = 
          parsedResponse.ComparativeCharts.GrowthRateComparison.datasets.map(dataset => ({
            ...dataset,
            data: dataset.data.map(value => {
              // Convert percentage strings to numbers
              if (typeof value === 'string' && value.includes('%')) {
                return parseFloat(value.replace('%', ''));
              }
              return value;
            })
          }));
      }

      // Format Analysis fields as strings if they are objects
      if (parsedResponse.Analysis) {
        const { Analysis } = parsedResponse;
        
        // Format KeyMetrics
        if (typeof Analysis.KeyMetrics === 'object') {
          Analysis.KeyMetrics = Object.entries(Analysis.KeyMetrics)
            .map(([metric, values]) => {
              if (typeof values === 'object') {
                return `${metric}: ${Object.entries(values)
                  .map(([company, value]) => `${company}: ${value}`)
                  .join(', ')}`;
              }
              return `${metric}: ${values}`;
            })
            .join('\n');
        }

        // Format Trends
        if (typeof Analysis.Trends === 'object') {
          Analysis.Trends = Object.entries(Analysis.Trends)
            .map(([metric, trend]) => `${metric}: ${trend}`)
            .join('\n');
        }

        // Format Recommendations
        if (typeof Analysis.Recommendations === 'object') {
          Analysis.Recommendations = Object.entries(Analysis.Recommendations)
            .map(([company, rec]) => `${company}: ${rec}`)
            .join('\n');
        }
      }
      
      return JSON.stringify(parsedResponse);
    } catch (parseError) {
      console.error("Error parsing or cleaning response:", parseError);
      throw new Error("Failed to parse generated content");
    }
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate content");
  }
};

// Function to analyze a single Excel file's financial data.
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

    **Important:** 
    - Return the key insights as an array of strings (not objects)
    - All numeric values should be plain numbers without any symbols (%, $, etc.)
    - Growth rates should be expressed as decimal numbers (e.g., 0.253 for 25.3%)

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
  const excelText = await inputExcelText(filePath);

  const queryPrompt = `
    ${prompt || ""}
    
    Act as a financial expert analyzing the given data.
    Answer the user's question based on the financial data provided.
    Provide visualizations that best represent the data for the query.

    **Important:**
    - All numeric values should be plain numbers without any symbols (%, $, etc.)
    - Growth rates should be expressed as decimal numbers (e.g., 0.253 for 25.3%)

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

    **Important:**
    - All numeric values should be plain numbers without any symbols (%, $, etc.)
    - Growth rates should be expressed as decimal numbers (e.g., 0.253 for 25.3%)
    - Ensure all datasets have the same number of data points for valid comparison
    - Format all analysis text as plain strings, not objects

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
            {"label": "Company A", "data": [0.15, 0.05]},
            {"label": "Company B", "data": [0.20, 0.08]}
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
        "KeyMetrics": "Key metrics comparison as a single string with line breaks...",
        "Trends": "Trends analysis as a single string with line breaks...",
        "Recommendations": "Recommendations as a single string with line breaks...",
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