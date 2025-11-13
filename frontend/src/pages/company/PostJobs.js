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
  const [companyApproved, setCompanyApproved] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);

  // Check authentication and company approval status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Component Mount - Token:', token);
    console.log('🔍 Company ID:', companyId);
    
    if (!token) {
      setError('Please log in to post a job');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Check if company exists and is approved
    if (companyId) {
      checkCompanyApprovalStatus();
    }
  }, [companyId, navigate]);

  const checkCompanyApprovalStatus = async () => {
    try {
      console.log('🔍 Checking company approval status...');
      const profile = await companyAPI.getProfile(companyId);
      console.log('🔍 Company profile:', profile);
      
      // Handle different response structures
      let companyData = null;
      let isApproved = false;

      if (profile.company) {
        companyData = profile.company;
        isApproved = profile.company.isApproved;
      } else if (profile.data) {
        companyData = profile.data;
        isApproved = profile.data.isApproved;
      } else if (profile.success && profile.data) {
        companyData = profile.data;
        isApproved = profile.data.isApproved;
      }

      setCompanyProfile(companyData);
      setCompanyApproved(isApproved);
      
      if (!isApproved) {
        setError('Your company is pending approval. You will be able to post jobs once approved by an administrator.');
      }
    } catch (err) {
      console.error('🔍 Error checking company status:', err);
      setCompanyApproved(false);
      setError('Unable to verify company status. Please try again later.');
    }
  };

  const handleChange = (e) => {
    if (companyApproved === false) return; // Prevent changes if not approved
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if company is not approved
    if (companyApproved === false) {
      setError('Your company is not approved to post jobs yet. Please complete the approval process first.');
      return;
    }

    setError('');

    const token = localStorage.getItem('token');
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
      
      if (err.response?.status === 403) {
        const errorMessage = err.response?.data?.error;
        
        if (errorMessage === 'Company not approved to post jobs') {
          setCompanyApproved(false);
          setError('Your company needs to be approved by an administrator before you can post jobs. Please contact support or wait for approval.');
        } else {
          setError('Access denied: ' + (errorMessage || 'Unknown authorization issue'));
        }
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to post job");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    if (companyApproved === false) {
      return false;
    }

    const token = localStorage.getItem('token');
    const hasRequiredFields = (
      form.title.trim() &&
      form.description.trim() &&
      form.requirements.trim() &&
      form.qualifications.trim() &&
      form.location.trim() &&
      form.applicationDeadline &&
      !loading
    );
    
    return token && hasRequiredFields;
  };

  // Get button text based on state
  const getButtonText = () => {
    if (companyApproved === false) {
      return "Waiting Approval";
    }
    return loading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Posting...
      </>
    ) : (
      "Post Job"
    );
  };

  // If company is not approved, show a more prominent message
  if (companyApproved === false) {
    return (
      <div className="auth-page">
        <div className="glass-panel">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Approval</h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your company <strong>{companyProfile?.name || 'Unknown Company'}</strong> is currently under review and needs to be approved before you can post jobs.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto mb-6">
              <h3 className="font-semibold text-yellow-800 mb-3">Next Steps:</h3>
              <ul className="text-left space-y-2 text-yellow-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Complete your company profile with all required information</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Contact our support team to expedite the approval process</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Approval typically takes 24-48 hours after profile completion</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate(`/company/${companyId}/profile`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Company Profile
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>Company ID: {companyId}</p>
              <p>Status: Pending Approval</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="glass-panel">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-sm text-gray-600 mt-1">Fill in the details below to create a new, professional job posting</p>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-xs text-gray-500">Company ID: {companyId}</p>
            <p className={`text-xs px-2 py-1 rounded-full ${
              companyApproved === null 
                ? 'bg-gray-100 text-gray-700' 
                : companyApproved 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              Status: {companyApproved === null ? 'Checking...' : companyApproved ? 'Approved ✅' : 'Pending Approval ⏳'}
            </p>
          </div>
        </div>

        {error && companyApproved !== false && (
          <div className={`mx-6 mt-4 border rounded-lg p-4 ${
            error.includes('approved') || error.includes('pending') 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className={`${
                  error.includes('approved') || error.includes('pending') 
                    ? 'text-yellow-400' 
                    : 'text-red-400'
                }`}>
                  {error.includes('approved') || error.includes('pending') ? '⚠️' : '❌'}
                </span>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  error.includes('approved') || error.includes('pending') 
                    ? 'text-yellow-800' 
                    : 'text-red-800'
                }`}>
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="glass-form-grid">
            <div className="glass-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
              <input 
                name="title" 
                required 
                placeholder="e.g., Senior Software Developer" 
                value={form.title} 
                onChange={handleChange} 
                className="glass-input" 
                disabled={companyApproved === false || loading}
              />
            </div>

            <div className="glass-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
              <textarea 
                name="description" 
                required 
                placeholder="Describe the role, responsibilities, and what makes this position exciting..." 
                value={form.description} 
                onChange={handleChange} 
                rows={4} 
                className="glass-input" 
                disabled={companyApproved === false || loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements *</label>
              <textarea 
                name="requirements" 
                required 
                placeholder="JavaScript, React, Node.js, Communication Skills" 
                value={form.requirements} 
                onChange={handleChange} 
                rows={3} 
                className="glass-input" 
                disabled={companyApproved === false || loading}
              />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications *</label>
              <textarea 
                name="qualifications" 
                required 
                placeholder="Bachelor's Degree, 3 years experience, Relevant Certification" 
                value={form.qualifications} 
                onChange={handleChange} 
                rows={3} 
                className="glass-input" 
                disabled={companyApproved === false || loading}
              />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input 
                name="location" 
                required 
                placeholder="e.g., Maseru, Lesotho" 
                value={form.location} 
                onChange={handleChange} 
                className="glass-input" 
                disabled={companyApproved === false || loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
              <select 
                name="jobType" 
                value={form.jobType} 
                onChange={handleChange} 
                className="glass-input" 
                disabled={companyApproved === false || loading}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <input 
                name="salaryRange" 
                placeholder="e.g., M15,000 - M20,000" 
                value={form.salaryRange} 
                onChange={handleChange} 
                className="glass-input" 
                disabled={companyApproved === false || loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
              <input 
                name="applicationDeadline" 
                type="date" 
                required 
                value={form.applicationDeadline} 
                onChange={handleChange} 
                className="glass-input" 
                disabled={companyApproved === false || loading}
              />
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
              className={`${
                companyApproved === false 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'glass-button'
              } ${
                !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
              }`} 
              style={{
                minWidth: 120, 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobs;
