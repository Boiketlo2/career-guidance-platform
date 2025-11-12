import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { companyAPI } from "../../api/companyAPI";

const CompanyProfile = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyId) fetchProfile();
  }, [companyId]);

  const fetchProfile = async () => {
    try {
      setError('');
      const res = await companyAPI.getProfile(companyId);
      console.log('Profile API Response:', res);
      
      if (res?.success) {
        setCompany(res.company);
      } else {
        setError(res?.error || 'Failed to load company profile');
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
      setError('Company not found or server error');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
            <p className="text-sm text-gray-600 mt-1">Company information and details</p>
          </div>
          
          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-lg mb-2"> {error}</div>
              <p className="text-gray-600">Company ID: {companyId}</p>
            </div>
          ) : company ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Company Name" value={company.name} />
                <InfoField label="Email" value={company.email} />
                <InfoField label="Industry" value={company.industry} />
                <InfoField label="Location" value={company.location} />
                <InfoField label="Contact Person" value={company.contactPerson} />
                <InfoField label="Phone" value={company.phone} />
                <InfoField label="Website" value={company.website} isLink={true} />
                <InfoField label="Status" value={company.status} 
                  badge={company.status === 'approved' ? 'success' : 
                         company.status === 'pending' ? 'warning' : 'default'} 
                />
              </div>
              
              {company.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    {company.description}
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Company ID:</span>
                  <p className="font-mono">{company.id || companyId}</p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p>{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No company information available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, isLink = false, badge = null }) => {
  if (!value) return null;

  const badgeClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      {badge ? (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses[badge] || badgeClasses.default}`}>
          {value}
        </span>
      ) : isLink ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm break-words"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-900">{value}</p>
      )}
    </div>
  );
};

export default CompanyProfile;
