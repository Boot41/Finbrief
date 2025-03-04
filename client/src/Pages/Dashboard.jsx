import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is Excel
      const isExcel = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ].includes(selectedFile.type);

      if (!isExcel) {
        alert('Please upload only Excel files (.xls or .xlsx)');
        e.target.value = null; // Reset file input
        return;
      }
      setFile(selectedFile);
    }
  };


  // Fetch all projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: {
          token: localStorage.getItem('token'),
        },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);


  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:5000/api/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: localStorage.getItem('token'),
        },
      });
      fetchProjects();
      alert('File uploaded successfully');
      setModal(false);
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };


  // Handle project deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { token: localStorage.getItem('token') },
      });
      fetchProjects();
      alert('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };
  

  // Handle file analysis
  const handleAnalyze = async (project) => {
    try {
      console.log("here")
      setIsLoading(true);
      setError(null);
      
      // If project hasn't been analyzed yet, trigger analysis
      if (project.status !== 'analyzed') {
        console.log("here1")
        const response = await axios.post(
          `http://localhost:5000/api/projects/analyze/${project._id}`,
          {},
          {
            headers: { 
              token: localStorage.getItem('token'),
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
          }
        );
        
        if (response.data) {
          console.log("here2")
          // Update the project in the list with the analyzed data
          const updatedProjects = projects.map((p) =>
            p._id === project._id ? response.data : p
          );
          setProjects(updatedProjects);
          
          // Navigate to project summary
          navigate(`/project/${project._id}`);
        } else {
          throw new Error('No data received from analysis');
        }
      } else {
        // If already analyzed, just navigate
        console.log("here3")
        navigate(`/project/${project._id}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      let errorMessage = 'Failed to analyze project. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Analysis timed out. Please try again.';
      } else if (error.response) {
        // Server responded with error
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Could not connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900">Projects  Dashboard</h1>
          <button
            onClick={() => setModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
          >
            Add Project
          </button>
        </div>

        {/* Upload Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">Upload Excel File</h2>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="flex flex-col items-center p-6 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50">
                  <label
                    htmlFor="file"
                    className="cursor-pointer bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    Browse Excel File
                  </label>
                  <input
                    id="file"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file && (
                    <div className="mt-4 text-sm text-indigo-700">
                      <p>Selected file: {file.name}</p>
                      <p>Size: {formatFileSize(file.size)}</p>
                      <button onClick={handleUpload} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Upload
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setModal(false);
                      setFile(null);
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Uploaded Projects</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              <span className="ml-3 text-indigo-600">Processing...</span>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No projects uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition duration-300"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{project.filename}</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Size: {formatFileSize(project.size)}</p>
                      <p>Uploaded: {new Date(project.uploadedAt).toLocaleString()}</p>
                      <p>Status: <span className={`inline-block px-2 py-1 rounded text-xs ${
                        project.status === 'analyzed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>{project.status}</span></p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAnalyze(project)}
                      className={`px-4 py-2 rounded-lg text-white transition duration-300 ${
                        project.status === 'analyzed'
                          ? 'bg-indigo-500 hover:bg-indigo-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      disabled={isLoading}
                    >
                      {project.status === 'analyzed' ? 'View Analysis' : 'Analyze'}
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;