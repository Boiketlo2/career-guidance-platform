import React, { useState, useEffect } from "react";
import { companyAPI } from "../../api/companyAPI";
import { useParams, useNavigate } from "react-router-dom";

const PostJobs = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    qualifications: "",
    location: "",
    salaryRange: "",
    jobType: "full-time",
    applicationDeadline: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check authentication and company existence on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Component Mount - Token:', token);
    console.log('🔍 Company ID:', companyId);
    
    if (!token) {
      setError('Please log in to post a job');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Optional: Check if company exists
    if (companyId) {
      checkCompanyExists();
    }
  }, [companyId, navigate]);

  const checkCompanyExists = async () => {
    try {
      console.log('🔍 Checking if company exists:', companyId);
      const company = await companyAPI.checkCompanyExists(companyId);
      console.log('🔍 Company found:', company);
    } catch (err) {
      console.error('🔍 Company check failed:', err);
      setError('Company not found or access denied');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Debug authentication
    const token = localStorage.getItem('token');
    console.log('🚀 Form Submit - Token exists:', !!token);
    console.log('🚀 Form Submit - Token value:', token);

    if (!token) {
      setError('Please log in to post a job');
      navigate('/login');
      return;
    }

    if (!companyId) {
      setError("Company ID is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        companyId: companyId,
        title: form.title,
        description: form.description,
        requirements: form.requirements.split(",").map(r => r.trim()).filter(r => r),
        qualifications: form.qualifications.split(",").map(q => q.trim()).filter(q => q),
        location: form.location,
        salaryRange: form.salaryRange ? { amount: form.salaryRange } : {},
        jobType: form.jobType,
        applicationDeadline: form.applicationDeadline
      };

      console.log('📤 Posting job with payload:', payload);
      console.log('📤 Full URL will be:', `https://career-guidance-platform-1-t41w.onrender.com/api/company/jobs`);

      const res = await companyAPI.postJob(payload);
      console.log('✅ Post Job Response:', res);
      
      if (res.success) {
        alert("✅ Job posted successfully!");
        navigate(`/company/${companyId}/jobs`);
      } else {
        setError(res.error || "Job posting failed");
      }
    } catch (err) {
      console.error("❌ Error posting job:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      console.error("❌ Error headers:", err.response?.headers);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setError('Access denied. Please check if you have permission to post jobs for this company.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to post job");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      form.title.trim() &&
      form.description.trim() &&
      form.requirements.trim() &&
      form.qualifications.trim() &&
      form.location.trim() &&
      form.applicationDeadline &&
      !loading
    );
  };

  return (
    <div className="auth-page">
      <div className="glass-panel">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-sm text-gray-600 mt-1">Fill in the details below to create a new, professional job posting</p>
          <p className="text-xs text-gray-500 mt-1">Company ID: {companyId}</p>
          <p className="text-xs text-gray-500 mt-1">Token: {localStorage.getItem('token') ? 'Exists' : 'Missing'}</p>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-400">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          {/* Your existing form fields remain the same */}
          <div className="glass-form-grid">
            <div className="glass-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
              <input name="title" required placeholder="e.g., Senior Software Developer" value={form.title} onChange={handleChange} className="glass-input" />
            </div>

            <div className="glass-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
              <textarea name="description" required placeholder="Describe the role..." value={form.description} onChange={handleChange} rows={4} className="glass-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements *</label>
              <textarea name="requirements" required placeholder="JavaScript, React, Node.js" value={form.requirements} onChange={handleChange} rows={3} className="glass-input" />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications *</label>
              <textarea name="qualifications" required placeholder="Bachelor's Degree, 3 years experience" value={form.qualifications} onChange={handleChange} rows={3} className="glass-input" />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input name="location" required placeholder="e.g., Maseru, Lesotho" value={form.location} onChange={handleChange} className="glass-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
              <select name="jobType" value={form.jobType} onChange={handleChange} className="glass-input">
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <input name="salaryRange" placeholder="e.g., M15,000 - M20,000" value={form.salaryRange} onChange={handleChange} className="glass-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
              <input name="applicationDeadline" type="date" required value={form.applicationDeadline} onChange={handleChange} className="glass-input" />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!isFormValid()} 
              className={`glass-button ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`} 
              style={{
                minWidth: 120, 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                "Post Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobs;
