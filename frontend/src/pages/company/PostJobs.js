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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '30px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#2d3748',
              marginBottom: '8px'
            }}>Post a New Job</h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '4px'
            }}>Fill in the details below to create a new, professional job posting</p>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '4px'
            }}>Company ID: {companyId}</p>
          </div>

          {error && (
            <div style={{
              margin: '0 24px 24px 24px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <span style={{ color: '#f87171' }}>❌</span>
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#dc2626'
                  }}>
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Job Title *</label>
                <input 
                  name="title" 
                  required 
                  placeholder="e.g., Senior Software Developer" 
                  value={form.title} 
                  onChange={handleChange} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Job Description *</label>
                <textarea 
                  name="description" 
                  required 
                  placeholder="Describe the role..." 
                  value={form.description} 
                  onChange={handleChange} 
                  rows={4} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    resize: 'vertical',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Requirements *</label>
                <textarea 
                  name="requirements" 
                  required 
                  placeholder="JavaScript, React, Node.js" 
                  value={form.requirements} 
                  onChange={handleChange} 
                  rows={3} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    resize: 'vertical',
                    transition: 'all 0.2s'
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>Separate with commas</p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Qualifications *</label>
                <textarea 
                  name="qualifications" 
                  required 
                  placeholder="Bachelor's Degree, 3 years experience" 
                  value={form.qualifications} 
                  onChange={handleChange} 
                  rows={3} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    resize: 'vertical',
                    transition: 'all 0.2s'
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>Separate with commas</p>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Location *</label>
                <input 
                  name="location" 
                  required 
                  placeholder="e.g., Maseru, Lesotho" 
                  value={form.location} 
                  onChange={handleChange} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Job Type *</label>
                <select 
                  name="jobType" 
                  value={form.jobType} 
                  onChange={handleChange} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Salary Range</label>
                <input 
                  name="salaryRange" 
                  placeholder="e.g., M15,000 - M20,000" 
                  value={form.salaryRange} 
                  onChange={handleChange} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>Application Deadline *</label>
                <input 
                  name="applicationDeadline" 
                  type="date" 
                  required 
                  value={form.applicationDeadline} 
                  onChange={handleChange} 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    transition: 'all 0.2s'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb',
              marginTop: '24px'
            }}>
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                disabled={loading}
                style={{
                  padding: '8px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#374151',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  minWidth: '120px',
                  padding: '8px 24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => !loading && (e.target.style.opacity = '0.9')}
                onMouseOut={(e) => !loading && (e.target.style.opacity = '1')}
              >
                {loading ? (
                  <>
                    <div style={{
                      animation: 'spin 1s linear infinite',
                      borderRadius: '50%',
                      height: '16px',
                      width: '16px',
                      borderBottom: '2px solid white',
                      marginRight: '8px'
                    }}></div>
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

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          input:hover, textarea:hover, select:hover {
            border-color: #9ca3af;
          }
        `}
      </style>
    </div>
  );
};

export default PostJobs;
