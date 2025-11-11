import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../api/studentAPI';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Institutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await studentAPI.getInstitutionsWithCourses();
      setInstitutions(response.institutions || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎓 Higher Learning Institutions in Lesotho</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Browse all registered institutions and their available courses
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {institutions.map((institution) => (
          <div key={institution.id} className="cg-card" style={{ padding: '18px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{institution.name}</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>📍 Location:</strong> {institution.location || 'Not specified'}
              </p>
              {institution.contact && (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>📞 Contact:</strong> {institution.contact}
                </p>
              )}
              {institution.email && (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>📧 Email:</strong> {institution.email}
                </p>
              )}
              {institution.type && (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>🏛️ Type:</strong> {institution.type}
                </p>
              )}
            </div>

            {/* Faculties Preview */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '16px' }}>
                Faculties ({institution.faculties?.length || 0})
              </h4>
              {!institution.faculties || institution.faculties.length === 0 ? (
                <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No faculties registered yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {institution.faculties.slice(0, 3).map(faculty => (
                    <div key={faculty.id} style={{ 
                      padding: '8px', 
                      background: '#f8f9fa', 
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      <strong>{faculty.name}</strong>
                      {faculty.description && (
                        <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                          {faculty.description}
                        </div>
                      )}
                      <div style={{ marginTop: '5px' }}>
                        <small style={{ color: '#667eea' }}>
                          Courses: {faculty.courses?.length || 0}
                        </small>
                      </div>
                    </div>
                  ))}
                  {institution.faculties.length > 3 && (
                    <div style={{ color: '#667eea', fontSize: '12px', textAlign: 'center' }}>
                      + {institution.faculties.length - 3} more faculties
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedInstitution(selectedInstitution?.id === institution.id ? null : institution)}
                style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {selectedInstitution?.id === institution.id ? 'Hide Details' : 'View Details'}
              </button>
            </div>

            {/* Expanded Details */}
            {selectedInstitution?.id === institution.id && (
              <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>All Faculties & Courses</h4>
                {!institution.faculties || institution.faculties.length === 0 ? (
                  <p style={{ color: '#666' }}>No faculties available</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {institution.faculties.map(faculty => (
                      <div key={faculty.id}>
                        <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>{faculty.name}</h5>
                        {faculty.description && (
                          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                            {faculty.description}
                          </p>
                        )}
                        {faculty.courses && faculty.courses.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {faculty.courses.map(course => (
                              <span 
                                key={course.id}
                                style={{
                                  background: '#e9ecef',
                                  color: '#495057',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}
                              >
                                {course.name}
                                {course.duration && ` (${course.duration})`}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>No courses available</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>📊 Directory Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
              {institutions.length}
            </div>
            <div style={{ color: '#666' }}>Institutions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {institutions.reduce((total, inst) => total + (inst.faculties?.length || 0), 0)}
            </div>
            <div style={{ color: '#666' }}>Faculties</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {institutions.reduce((total, inst) => total + (inst.faculties?.reduce((facTotal, fac) => facTotal + (fac.courses?.length || 0), 0) || 0), 0)}
            </div>
            <div style={{ color: '#666' }}>Courses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Institutions;