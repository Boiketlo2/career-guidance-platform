import React, { useState } from "react";
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

      console.log('Posting job with payload:', payload);

      const res = await companyAPI.postJob(payload);
      console.log('Post Job Response:', res);
      
      if (res.success) {
        alert("✅ Job posted successfully!");
        navigate(`/company/${companyId}/jobs`);
      } else {
        setError(res.error || "Job posting failed");
      }
    } catch (err) {
      console.error("Error posting job:", err, "response:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data || err.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
            <p className="text-sm text-gray-600 mt-1">Fill in the details below to create a new job posting</p>
            <p className="text-xs text-gray-500 mt-1">Company ID: {companyId}</p>
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                name="title"
                required
                placeholder="e.g., Senior Software Developer"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                required
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                <textarea
                  name="requirements"
                  required
                  placeholder="Separate requirements with commas&#10;e.g., JavaScript, React, Node.js"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications *
                </label>
                <textarea
                  name="qualifications"
                  required
                  placeholder="Separate qualifications with commas&#10;e.g., Bachelor's Degree, 3 years experience"
                  value={form.qualifications}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  name="location"
                  required
                  placeholder="e.g., Maseru, Lesotho"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select 
                  name="jobType" 
                  value={form.jobType} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range
                </label>
                <input
                  name="salaryRange"
                  placeholder="e.g., M15,000 - M20,000"
                  value={form.salaryRange}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline *
                </label>
                <input
                  name="applicationDeadline"
                  type="date"
                  required
                  value={form.applicationDeadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
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
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center"
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
    </div>
  );
};

export default PostJobs;