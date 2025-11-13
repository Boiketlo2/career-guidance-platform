import React, { useEffect, useState } from "react";
import { adminAPI } from "../../api/adminAPI";

export default function ManageFacultiesCourses() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state for faculties and courses per institution
  const [facultyForms, setFacultyForms] = useState({});
  const [courseForms, setCourseForms] = useState({});
  const [showFacultyForm, setShowFacultyForm] = useState({});
  const [showCourseForm, setShowCourseForm] = useState({});
  const [submitting, setSubmitting] = useState({});

  const fetchInstitutions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getInstitutions();
      if (!res.success) throw new Error("Failed to fetch institutions");

      // Initialize forms for each institution
      const facultyInit = {};
      const courseInit = {};
      res.institutions.forEach(inst => {
        facultyInit[inst.id] = { name: "", description: "" };
        courseInit[inst.id] = { name: "", duration: "", requirements: "", facultyId: "" };
      });

      setFacultyForms(facultyInit);
      setCourseForms(courseInit);

      setInstitutions(
        res.institutions.map(inst => ({
          ...inst,
          faculties: inst.faculties || [],
          courses: inst.courses || [],
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInstitutions(); }, []);

  // Add faculty
  const handleAddFaculty = async (institutionId) => {
    const form = facultyForms[institutionId];
    if (!form.name) return setError("Faculty name is required");

    setSubmitting({ ...submitting, [`faculty_${institutionId}`]: true });
    setError("");
    setSuccess("");

    try {
      await adminAPI.addFaculty(institutionId, {
        name: form.name,
        description: form.description,
        institutionId,
        createdAt: new Date().toISOString(),
      });
      setFacultyForms({ ...facultyForms, [institutionId]: { name: "", description: "" } });
      setShowFacultyForm({ ...showFacultyForm, [institutionId]: false });
      setSuccess("Faculty added successfully!");
      fetchInstitutions();
    } catch (err) {
      console.error(err);
      setError("Failed to save faculty");
    } finally {
      setSubmitting({ ...submitting, [`faculty_${institutionId}`]: false });
    }
  };

  // Add course
  const handleAddCourse = async (institutionId) => {
    const form = courseForms[institutionId];
    if (!form.name || !form.duration || !form.facultyId) return setError("All course fields are required");

    setSubmitting({ ...submitting, [`course_${institutionId}`]: true });
    setError("");
    setSuccess("");

    try {
      await adminAPI.addCourse(form.facultyId, {
        name: form.name,
        duration: form.duration,
        requirements: form.requirements,
        facultyId: form.facultyId,
        createdAt: new Date().toISOString(),
      });
      setCourseForms({
        ...courseForms,
        [institutionId]: { name: "", duration: "", requirements: "", facultyId: "" },
      });
      setShowCourseForm({ ...showCourseForm, [institutionId]: false });
      setSuccess("Course added successfully!");
      fetchInstitutions();
    } catch (err) {
      console.error(err);
      setError("Failed to save course");
    } finally {
      setSubmitting({ ...submitting, [`course_${institutionId}`]: false });
    }
  };

  const getTotalStats = () => {
    const totalInstitutions = institutions.length;
    const totalFaculties = institutions.reduce((sum, inst) => sum + (inst.faculties?.length || 0), 0);
    const totalCourses = institutions.reduce((sum, inst) => sum + (inst.courses?.length || 0), 0);
    return { totalInstitutions, totalFaculties, totalCourses };
  };

  const stats = getTotalStats();

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Manage Faculties & Courses</h1>
          <p style={styles.subtitle}>Manage academic structures across all institutions</p>
        </div>
        <button style={styles.returnBtn} onClick={() => window.location.href = "/admin/home"}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Statistics Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏛️</div>
          <div style={styles.statNumber}>{stats.totalInstitutions}</div>
          <div style={styles.statLabel}>Institutions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statNumber}>{stats.totalFaculties}</div>
          <div style={styles.statLabel}>Faculties</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎓</div>
          <div style={styles.statNumber}>{stats.totalCourses}</div>
          <div style={styles.statLabel}>Courses</div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={styles.error}>
          <div style={styles.errorIcon}>⚠️</div>
          <div style={styles.errorContent}>
            <strong style={styles.errorTitle}>Error</strong>
            <div style={styles.errorMessage}>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div style={styles.success}>
          <div style={styles.successIcon}>✓</div>
          <div style={styles.successContent}>
            <strong style={styles.successTitle}>Success</strong>
            <div style={styles.successMessage}>{success}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.mainContent}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading Institutions...</p>
          </div>
        ) : institutions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏛️</div>
            <h3 style={styles.emptyTitle}>No Institutions Found</h3>
            <p style={styles.emptyText}>
              {error ? "Unable to load institutions. Please try again." : "No institutions are registered in the system."}
            </p>
            <button onClick={fetchInstitutions} style={styles.refreshButton}>
              Refresh
            </button>
          </div>
        ) : (
          <div style={styles.institutionsGrid}>
            {institutions.map(inst => (
              <div key={inst.id} style={styles.institutionCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.institutionAvatar}>
                    {inst.name?.charAt(0) || 'I'}
                  </div>
                  <div style={styles.institutionInfo}>
                    <h2 style={styles.institutionName}>{inst.name}</h2>
                    <p style={styles.institutionLocation}>{inst.location || 'Location not specified'}</p>
                  </div>
                </div>

                {/* Faculties Section */}
                <div style={styles.section}>
                  <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>Faculties</h3>
                    <span style={styles.sectionCount}>({inst.faculties?.length || 0})</span>
                  </div>
                  
                  {inst.faculties.length === 0 ? (
                    <p style={styles.emptySection}>No faculties added yet</p>
                  ) : (
                    <div style={styles.list}>
                      {inst.faculties.map(fac => (
                        <div key={fac.id} style={styles.listItem}>
                          <div style={styles.itemContent}>
                            <strong style={styles.itemTitle}>{fac.name}</strong>
                            {fac.description && (
                              <p style={styles.itemDescription}>{fac.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Faculty Form */}
                  <div style={styles.formSection}>
                    <button
                      style={showFacultyForm[inst.id] ? styles.cancelButton : styles.addButton}
                      onClick={() => setShowFacultyForm({ ...showFacultyForm, [inst.id]: !showFacultyForm[inst.id] })}
                    >
                      {showFacultyForm[inst.id] ? '✕ Cancel' : '+ Add Faculty'}
                    </button>

                    {showFacultyForm[inst.id] && (
                      <div style={styles.form}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Faculty Name *</label>
                          <input
                            style={styles.input}
                            placeholder="Enter faculty name"
                            value={facultyForms[inst.id]?.name || ""}
                            onChange={(e) => setFacultyForms({ ...facultyForms, [inst.id]: { ...facultyForms[inst.id], name: e.target.value } })}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Description</label>
                          <input
                            style={styles.input}
                            placeholder="Brief description (optional)"
                            value={facultyForms[inst.id]?.description || ""}
                            onChange={(e) => setFacultyForms({ ...facultyForms, [inst.id]: { ...facultyForms[inst.id], description: e.target.value } })}
                          />
                        </div>
                        <button 
                          style={submitting[`faculty_${inst.id}`] ? styles.submitButtonDisabled : styles.submitButton}
                          onClick={() => handleAddFaculty(inst.id)}
                          disabled={submitting[`faculty_${inst.id}`] || !facultyForms[inst.id]?.name}
                        >
                          {submitting[`faculty_${inst.id}`] ? (
                            <div style={styles.buttonContent}>
                              <div style={styles.smallSpinner}></div>
                              Adding...
                            </div>
                          ) : (
                            "💾 Save Faculty"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Courses Section */}
                <div style={styles.section}>
                  <div style={styles.sectionHeader}>
                    <h3 style={styles.sectionTitle}>Courses</h3>
                    <span style={styles.sectionCount}>({inst.courses?.length || 0})</span>
                  </div>
                  
                  {inst.courses.length === 0 ? (
                    <p style={styles.emptySection}>No courses added yet</p>
                  ) : (
                    <div style={styles.list}>
                      {inst.courses.map(course => (
                        <div key={course.id} style={styles.listItem}>
                          <div style={styles.itemContent}>
                            <strong style={styles.itemTitle}>{course.name}</strong>
                            <div style={styles.courseDetails}>
                              <span style={styles.courseDetail}>Duration: {course.duration || 'Not specified'}</span>
                              {course.requirements && (
                                <span style={styles.courseDetail}>Requirements: {course.requirements}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Course Form */}
                  <div style={styles.formSection}>
                    <button
                      style={showCourseForm[inst.id] ? styles.cancelButton : styles.addButton}
                      onClick={() => setShowCourseForm({ ...showCourseForm, [inst.id]: !showCourseForm[inst.id] })}
                    >
                      {showCourseForm[inst.id] ? '✕ Cancel' : '+ Add Course'}
                    </button>

                    {showCourseForm[inst.id] && (
                      <div style={styles.form}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Faculty *</label>
                          <select
                            style={styles.select}
                            value={courseForms[inst.id]?.facultyId || ""}
                            onChange={(e) => setCourseForms({ ...courseForms, [inst.id]: { ...courseForms[inst.id], facultyId: e.target.value } })}
                          >
                            <option value="">Select Faculty</option>
                            {inst.faculties.map(fac => (
                              <option key={fac.id} value={fac.id}>{fac.name}</option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Course Name *</label>
                          <input
                            style={styles.input}
                            placeholder="Enter course name"
                            value={courseForms[inst.id]?.name || ""}
                            onChange={(e) => setCourseForms({ ...courseForms, [inst.id]: { ...courseForms[inst.id], name: e.target.value } })}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Duration *</label>
                          <input
                            style={styles.input}
                            placeholder="e.g., 3 years, 4 semesters"
                            value={courseForms[inst.id]?.duration || ""}
                            onChange={(e) => setCourseForms({ ...courseForms, [inst.id]: { ...courseForms[inst.id], duration: e.target.value } })}
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Requirements</label>
                          <input
                            style={styles.input}
                            placeholder="Entry requirements (optional)"
                            value={courseForms[inst.id]?.requirements || ""}
                            onChange={(e) => setCourseForms({ ...courseForms, [inst.id]: { ...courseForms[inst.id], requirements: e.target.value } })}
                          />
                        </div>
                        <button 
                          style={submitting[`course_${inst.id}`] ? styles.submitButtonDisabled : styles.submitButton}
                          onClick={() => handleAddCourse(inst.id)}
                          disabled={submitting[`course_${inst.id}`] || !courseForms[inst.id]?.name || !courseForms[inst.id]?.duration || !courseForms[inst.id]?.facultyId}
                        >
                          {submitting[`course_${inst.id}`] ? (
                            <div style={styles.buttonContent}>
                              <div style={styles.smallSpinner}></div>
                              Adding...
                            </div>
                          ) : (
                            "💾 Save Course"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#fafbfc',
    padding: '0 20px 40px 20px',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    background: '#ffffff',
    padding: '40px 0',
    marginBottom: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderBottom: '1px solid #e1e5e9'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '0 20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    margin: 0,
    fontWeight: '400'
  },
  returnBtn: {
    background: 'transparent',
    color: '#333',
    border: '1px solid #d0d7de',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    marginTop: '16px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto 32px auto'
  },
  statCard: {
    background: '#ffffff',
    padding: '24px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9',
    textAlign: 'center',
    transition: 'all 0.2s ease'
  },
  statIcon: {
    fontSize: '24px',
    marginBottom: '12px'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  error: {
    background: '#fef2f2',
    padding: '20px',
    borderRadius: '8px',
    color: '#dc2626',
    margin: '0 auto 24px auto',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '1200px'
  },
  errorIcon: {
    fontSize: '16px',
    flexShrink: 0
  },
  errorContent: {
    flex: 1
  },
  errorTitle: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '600'
  },
  errorMessage: {
    fontSize: '14px',
    opacity: 0.9
  },
  success: {
    background: '#f0f9ff',
    padding: '20px',
    borderRadius: '8px',
    color: '#0369a1',
    margin: '0 auto 24px auto',
    border: '1px solid #bae6fd',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '1200px'
  },
  successIcon: {
    fontSize: '16px',
    flexShrink: 0,
    fontWeight: 'bold'
  },
  successContent: {
    flex: 1
  },
  successTitle: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px'
  },
  successMessage: {
    fontSize: '14px',
    opacity: 0.9
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #1a1a1a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '24px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px 0'
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 24px 0',
    lineHeight: '1.5'
  },
  refreshButton: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  institutionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
    gap: '24px'
  },
  institutionCard: {
    background: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e1e5e9',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #f0f0f0'
  },
  institutionAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#1a1a1a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '18px',
    flexShrink: 0
  },
  institutionInfo: {
    flex: 1
  },
  institutionName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 4px 0',
    lineHeight: '1.3'
  },
  institutionLocation: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  section: {
    marginBottom: '28px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0
  },
  sectionCount: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  emptySection: {
    fontSize: '14px',
    color: '#666',
    fontStyle: 'italic',
    margin: '8px 0'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  listItem: {
    padding: '12px',
    background: '#fafbfc',
    borderRadius: '6px',
    border: '1px solid #e1e5e9'
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  itemDescription: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
    lineHeight: '1.4'
  },
  courseDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '4px'
  },
  courseDetail: {
    fontSize: '12px',
    color: '#666'
  },
  formSection: {
    marginTop: '16px'
  },
  addButton: {
    background: 'transparent',
    color: '#1a1a1a',
    border: '1px solid #d0d7de',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  cancelButton: {
    background: 'transparent',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  form: {
    marginTop: '16px',
    padding: '20px',
    background: '#fafbfc',
    borderRadius: '8px',
    border: '1px solid #e1e5e9'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#1a1a1a',
    transition: 'all 0.2s ease'
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#1a1a1a',
    transition: 'all 0.2s ease'
  },
  submitButton: {
    background: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  submitButtonDisabled: {
    background: '#8c8c8c',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '14px',
    width: '100%'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  smallSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid transparent',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default ManageFacultiesCourses;
