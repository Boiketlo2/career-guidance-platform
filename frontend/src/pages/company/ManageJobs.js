import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const ManageJobs = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyId) fetchJobs();
  }, [companyId]);

  const fetchJobs = async () => {
    try {
      setError('');
      const res = await companyAPI.getJobs(companyId);
      console.log('ManageJobs API Response:', res);
      
      if (res?.success) {
        setJobs(res.jobs || []);
      } else {
        setError(res?.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError('Failed to load jobs. Please check if the company ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/company/${companyId}/applicants`, { state: { selectedJobId: jobId } });
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;

    try {
      // Note: You'll need to implement deleteJob in your backend
      // For now, we'll just remove it from the local state
      setJobs(prev => prev.filter(job => job.id !== jobId));
      alert("Job deleted successfully (local only - backend not implemented)");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
            <p className="text-sm text-gray-600 mt-1">Create and manage your job postings</p>
          </div>
        </div>

        {/* Quick action cards: Post Job & Available Functions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/company/${companyId}/post-job`)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/company/${companyId}/post-job`)}
            className="glass-card cursor-pointer"
            aria-label="Post new job"
          >
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Post Job</p>
              <p className="text-2xl font-extrabold text-gray-900">Create a new job posting</p>
              <p className="text-sm text-gray-500 mt-3">Fill out the details and publish your opening</p>
            </div>
          </div>

          <div className="glass-card">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Available Functions</p>
              <p className="text-2xl font-extrabold text-gray-900">Quick actions</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigate(`/company/${companyId}/jobs`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  View Listings
                </button>
                <button
                  onClick={() => navigate(`/company/${companyId}/applicants`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  View Applicants
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-4">Get started by posting your first job opening</p>
            <button
              onClick={() => navigate(`/company/${companyId}/post-job`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Job Postings ({jobs.length})
                </h2>
                <span className="text-sm text-gray-600">
                  Company ID: {companyId}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {job.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {job.jobType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium">{job.applicants?.length || 0}</span>
                        <span className="text-gray-500 text-xs ml-1">applicants</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewApplicants(job.id)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-xs"
                        >
                          View Applicants
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;