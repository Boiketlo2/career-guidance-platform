import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const ViewApplicants = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyId) fetchJobs();
  }, [companyId]);

  useEffect(() => {
    if (location.state?.selectedJobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === location.state.selectedJobId);
      if (job) handleSelectJob(job);
    }
  }, [location.state, jobs]);

  const fetchJobs = async () => {
    try {
      setError('');
      const res = await companyAPI.getJobs(companyId);
      console.log('ViewApplicants Jobs Response:', res);
      
      if (res?.success) {
        setJobs(res.jobs || []);
      } else {
        setError(res?.error || 'Failed to load jobs');
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError('Failed to load jobs. Please check company ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setApplicants([]);
    
    try {
      const res = await companyAPI.getJobApplicants(job.id);
      console.log('Applicants Response:', res);
      
      if (res?.success) {
        setApplicants(res.applicants || []);
      } else {
        setError(res?.error || 'Failed to load applicants');
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError('Failed to load applicants for this job');
    }
  };

  const updateApplicantStatus = async (applicantId, newStatus) => {
    try {
      const res = await companyAPI.updateApplicantStatus(selectedJob.id, applicantId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      
      if (res?.success) {
        setApplicants(prev => prev.map(app => 
          app.id === applicantId ? { ...app, status: newStatus } : app
        ));
        alert(`Applicant status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Error updating applicant status:", err);
      alert('Failed to update applicant status');
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">View Applicants</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and review job applications</p>
          <p className="text-xs text-gray-500 mt-1">Company ID: {companyId}</p>
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
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600">Post a job to start receiving applications</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Job Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Job to View Applicants
              </label>
              <select
                className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  const job = jobs.find(j => j.id === e.target.value);
                  if (job) handleSelectJob(job);
                }}
                value={selectedJob?.id || ''}
              >
                <option value="">-- Select a job --</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.applicants?.length || 0} applicants)
                  </option>
                ))}
              </select>
            </div>

            {/* Applicants List */}
            {selectedJob && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Applicants for "{selectedJob.title}"
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {applicants.length} applicant(s) found • {selectedJob.location} • {selectedJob.jobType}
                  </p>
                </div>

                {applicants.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants yet</h3>
                    <p className="text-gray-600">Applications will appear here when students apply</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applicant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Education
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
                        {applicants.map((applicant) => (
                          <tr key={applicant.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {applicant.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {applicant.fieldOfStudy || 'Not specified'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{applicant.email}</div>
                              <div className="text-sm text-gray-500">{applicant.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {applicant.educationLevel || 'N/A'}
                              {applicant.institution && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {applicant.institution}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                applicant.status === 'approved' ? 'bg-green-100 text-green-800' :
                                applicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                applicant.status === 'interview' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {applicant.status || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={applicant.status || 'pending'}
                                onChange={(e) => updateApplicantStatus(applicant.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="interview">Interview</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplicants;