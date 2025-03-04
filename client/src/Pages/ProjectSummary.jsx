import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import jsPDF from 'jspdf';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProjectSummary = () => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  // Handle print functionality using jspdf
  const handlePrint = () => {
    const input = printRef.current;

    if (!input) {
      console.error('Nothing to print: printRef.current is null or undefined');
      return;
    }

    // Create a new PDF instance
    const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait mode, A4 size

    // Add content to the PDF
    pdf.html(input, {
      callback: (pdf) => {
        pdf.save('project-summary.pdf'); // Save the PDF
      },
      margin: [20, 20, 20, 20], // Margins (top, right, bottom, left)
      autoPaging: 'text', // Automatically paginate content
      x: 0, // X position
      y: 0, // Y position
      width: 190, // Width of the content in the PDF
      windowWidth: input.scrollWidth, // Width of the HTML content
      background: '#ffffff'
    });
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/projects/${id}`, {
          headers: { token: localStorage.getItem('token') }
        });

        if (!response.data) {
          setError('Project not found');
          return;
        }
        setProject(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error: </strong>{error}
          <button onClick={() => navigate('/dashboard')} className="ml-4 text-blue-500">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Project Summary</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Back to Dashboard</button>
        </div>
        
        {/* Attach the ref to the content you want to print */}
        <div ref={printRef} className="p-6 border rounded-lg bg-white">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">File Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Filename:</strong> {project.filename}</p>
              <p><strong>File Size:</strong> {formatFileSize(project.size)}</p>
              <p><strong>Uploaded At:</strong> {new Date(project.uploadedAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {project.status}</p>
            </div>
          </section>

          {project.summary && (
            <section className="mb-8">
              <h3 className="text-xl font-medium mb-2">Summary</h3>
              <p>{project.summary}</p>
            </section>
          )}

          {project?.chartData && (
            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">Financial Charts</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {project.chartData.ExpensesByCategory && (
                  <div>
                    <h4 className="text-lg font-medium">Expenses by Category</h4>
                    {/* <Line data={project.chartData.ExpensesByCategory}   */}
                    <Line 
                       data={{
                          labels: project.chartData.ExpensesByCategory.labels,
                          datasets: project.chartData.ExpensesByCategory.datasets.map(dataset => ({
                          ...dataset,
                          borderColor: 'pink', // Add this line to change the color
                          backgroundColor: 'rgba(255, 99, 132, 0.2)', // Background color under the line
                          }))      
                        }}
                     options={{ responsive: true }} />
                  </div>
                )}
                {project.chartData.TotalExpenses && (
                  <div>
                    <h4 className="text-lg font-medium">Total Expenses</h4>
                    <Line  data={{
                          labels: project.chartData.TotalExpenses.labels,
                          datasets: project.chartData.TotalExpenses.datasets.map(dataset => ({
                          ...dataset,
                          borderColor: 'pink', // Add this line to change the color
                          backgroundColor: 'rgba(255, 99, 132, 0.2)', // Background color under the line
                          }))      
                        }}

                     options={{ responsive: true }} />
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded-lg">Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;