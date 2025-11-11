import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const CompanyHome = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    jobsPosted: 0,
    totalApplicants: 0,
    activeJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyId) {
      fetchCompanyProfile();
      fetchCompanyStats();
    }
  }, [companyId]);

  const fetchCompanyProfile = async () => {
    try {
      setError('');
      const res = await companyAPI.getProfile(companyId);
      console.log('Company Profile Response:', res);
      
      if (res?.success) {
        setCompany(res.company);
      } else {
        setError(res?.error || 'Failed to load company profile');
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError('Company not found or server error');
    }
  };

  const fetchCompanyStats = async () => {
    try {
      setError('');
      const res = await companyAPI.getJobs(companyId);
      console.log('Jobs Response:', res);
      
      if (res?.success && res.jobs) {
        let totalApplicants = 0;
        res.jobs.forEach(job => {
          totalApplicants += job.applicants?.length || 0;
        });
        
        setStats({
          jobsPosted: res.jobs.length,
          totalApplicants,
          activeJobs: res.jobs.filter(job => job.status === 'active').length
        });
      } else {
        setError(res?.error || 'Failed to load company stats');
      }
    } catch (err) {
      console.error("Error fetching company stats:", err);
      setError('Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                {company?.name || `Company ID: ${companyId}`}
              </p>
            </div>
            <nav className="company-nav flex items-center space-x-3">
              <button onClick={() => navigate(`/company/${companyId}/jobs`)} className="company-nav-link">Manage Jobs</button>
              <button onClick={() => navigate(`/company/${companyId}/applicants`)} className="company-nav-link">Applicants</button>
              <button onClick={() => navigate(`/company/${companyId}/profile`)} className="company-nav-link">Profile</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  Please check if the company ID is correct and try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 cg-card-grid cg-quick-grid">
          <QuickAction
            title="Manage Jobs"
            description="View and edit job postings"
            onClick={() => navigate(`/company/${companyId}/jobs`)}
            color="green"
          />
          <QuickAction
            title="Applicants"
            description="Review job applications"
            onClick={() => navigate(`/company/${companyId}/applicants`)}
            color="purple"
          />
          <QuickAction
            title="Profile"
            description="Update company information"
            onClick={() => navigate(`/company/${companyId}/profile`)}
            color="gray"
          />
        </div>

        {/* Stats Cards */}
        {!error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 cg-card-grid">
              <StatCard
                title="Active Jobs"
                value={stats.activeJobs}
                change="Currently open positions"
              />
              <StatCard
                title="Total Applicants"
                value={stats.totalApplicants}
                change="All applications received"
              />
              <StatCard
                title="Jobs Posted"
                value={stats.jobsPosted}
                change="Total job postings"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const QuickAction = ({ title, description, onClick, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
    green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
    gray: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
  };

  return (
    <button
      onClick={onClick}
      className={`glass-card ${colorClasses[color]} border rounded-lg p-4 text-left transition-colors hover:shadow-md`}
    >
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs opacity-75 mt-1">{description}</p>
    </button>
  );
};

const StatCard = ({ title, value, change }) => {
  return (
    <div className="glass-card stat-card">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-5xl font-extrabold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-3">{change}</p>
      </div>
    </div>
  );
};

export default CompanyHome;