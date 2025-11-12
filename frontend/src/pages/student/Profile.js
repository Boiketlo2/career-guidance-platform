import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { studentAPI } from "../../api/studentAPI";

const Profile = () => {
  const { studentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    highSchool: "",
    graduationYear: "",
    dateOfBirth: ""
  });
  const [documents, setDocuments] = useState({
    transcripts: [],
    certificates: [],
    workExperience: []
  });
  const [subjects, setSubjects] = useState([]);
  const [predefinedSubjects, setPredefinedSubjects] = useState([]);
  const [validGrades, setValidGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingSubjects, setSavingSubjects] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [newDocument, setNewDocument] = useState({ 
    type: "transcript", 
    name: "",
    fileUrl: "" 
  });
  const [newWorkExperience, setNewWorkExperience] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
    isCurrent: false
  });
  const [newSubject, setNewSubject] = useState({
    subject: "",
    grade: ""
  });
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    if (tabParam === 'academic') {
      setActiveTab('academic');
    }
    
    fetchProfile();
    fetchDocuments();
    fetchStudentSubjects();
  }, [studentId, searchParams]);

  useEffect(() => {
    calculateProfileCompletion();
  }, [profile, documents, subjects]);

  const fetchProfile = async () => {
    try {
      const res = await studentAPI.getProfile(studentId);
      if (res.success) {
        const studentData = res.student;
        console.log("Profile data:", studentData);
        setProfile({
          name: studentData.name || "",
          email: studentData.email || "",
          phone: studentData.phone || "",
          location: studentData.location || "",
          address: studentData.address || "",
          highSchool: studentData.highSchool || "",
          graduationYear: studentData.graduationYear || "",
          dateOfBirth: studentData.dateOfBirth || ""
        });
        
        // Set work experience from profile
        setDocuments(prev => ({
          ...prev,
          workExperience: studentData.workExperience || []
        }));
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const [transcriptsRes, certificatesRes] = await Promise.all([
        studentAPI.getDocuments(studentId, "transcript"),
        studentAPI.getDocuments(studentId, "certificate")
      ]);

      console.log("Documents response:", { transcriptsRes, certificatesRes });

      setDocuments(prev => ({
        ...prev,
        transcripts: transcriptsRes.success ? transcriptsRes.documents : [],
        certificates: certificatesRes.success ? certificatesRes.documents : []
      }));
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const fetchStudentSubjects = async () => {
    try {
      const [subjectsRes, predefinedRes] = await Promise.all([
        studentAPI.getStudentSubjects(studentId),
        studentAPI.getPredefinedSubjects()
      ]);

      if (subjectsRes.success) {
        setSubjects(subjectsRes.subjects || []);
      }

      if (predefinedRes.success) {
        setPredefinedSubjects(predefinedRes.subjects || []);
        setValidGrades(predefinedRes.grades || []);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const calculateProfileCompletion = () => {
    let completedFields = 0;
    let totalFields = 0;

    // Personal info fields
    const personalFields = ['name', 'email', 'phone', 'location', 'address', 'highSchool', 'graduationYear', 'dateOfBirth'];
    personalFields.forEach(field => {
      totalFields++;
      if (profile[field] && profile[field].trim() !== '') completedFields++;
    });

    // Documents
    totalFields += 2;
    if (documents.transcripts.length > 0) completedFields++;
    if (documents.certificates.length > 0) completedFields++;

    // Work experience
    totalFields++;
    if (documents.workExperience.length > 0) completedFields++;

    // Academic records
    totalFields++;
    if (subjects.length > 0) completedFields++;

    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    setProfileCompletion(completionPercentage);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkExpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewWorkExperience(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubjectChange = (e) => {
    const { name, value } = e.target;
    setNewSubject(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");
    setError("");

    try {
      // Filter out empty fields to avoid overwriting with empty strings
      const updateData = Object.fromEntries(
        Object.entries(profile).filter(([_, value]) => value !== "")
      );

      console.log("Updating profile with:", updateData);

      const res = await studentAPI.updateProfile(studentId, updateData);
      if (res.success) {
        setMessage("Profile updated successfully!");
        // Refresh profile data
        await fetchProfile();
      } else {
        setError(res.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!newDocument.name) {
      setError("Please enter document name.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      console.log("Uploading document:", newDocument);

      const res = await studentAPI.uploadDocument({
        studentId,
        documentType: newDocument.type,
        documentName: newDocument.name,
        fileUrl: newDocument.fileUrl || "https://example.com/placeholder.pdf"
      });

      if (res.success) {
        setMessage("Document uploaded successfully!");
        setNewDocument({ type: "transcript", name: "", fileUrl: "" });
        // Refresh documents
        await fetchDocuments();
      } else {
        setError(res.error || "Failed to upload document");
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      setError("Error uploading document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddWorkExperience = async () => {
    if (!newWorkExperience.company || !newWorkExperience.position || !newWorkExperience.startDate) {
      setError("Please fill company, position, and start date.");
      return;
    }

    try {
      console.log("Adding work experience:", newWorkExperience);

      const res = await studentAPI.addWorkExperience(studentId, newWorkExperience);
      if (res.success) {
        setMessage("Work experience added successfully!");
        setNewWorkExperience({
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          isCurrent: false
        });
        // Refresh profile to get updated work experience
        await fetchProfile();
      } else {
        setError(res.error || "Failed to add work experience");
      }
    } catch (err) {
      console.error("Error adding work experience:", err);
      setError("Error adding work experience. Please try again.");
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.subject || !newSubject.grade) {
      setError("Please select both subject and grade.");
      return;
    }

    // Check if subject already exists
    if (subjects.find(s => s.subject === newSubject.subject)) {
      setError("This subject has already been added.");
      return;
    }

    const updatedSubjects = [...subjects, {
      subject: newSubject.subject,
      grade: newSubject.grade
    }];

    setSubjects(updatedSubjects);
    setNewSubject({ subject: "", grade: "" });
    setError("");
  };

  const handleRemoveSubject = (index) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
  };

  const handleSaveSubjects = async () => {
    if (subjects.length === 0) {
      setError("Please add at least one subject.");
      return;
    }

    setSavingSubjects(true);
    setMessage("");
    setError("");

    try {
      console.log("Saving subjects:", subjects);

      const res = await studentAPI.saveStudentSubjects(studentId, subjects);
      if (res.success) {
        setMessage("Academic records saved successfully!");
        setSubjects(res.subjects || subjects);
      } else {
        setError(res.error || "Failed to save academic records");
      }
    } catch (err) {
      console.error("Error saving subjects:", err);
      setError("Error saving academic records. Please try again.");
    } finally {
      setSavingSubjects(false);
    }
  };

  const DocumentList = ({ docs, type }) => (
    <div style={styles.documentList}>
      <h4 style={styles.documentListTitle}>
        {type === "transcripts" ? "Transcripts" : "Certificates"}
      </h4>
      {docs.length === 0 ? (
        <p style={styles.noDocuments}>No {type} uploaded yet</p>
      ) : (
        docs.map((doc, idx) => (
          <div key={doc.id || idx} style={styles.documentItem}>
            <div style={styles.documentInfo}>
              <strong style={styles.documentName}>{doc.name || doc.documentName}</strong>
              <small style={styles.documentDate}>
                Uploaded: {new Date(doc.uploadedAt || doc.addedAt).toLocaleDateString()}
              </small>
              {doc.fileUrl && (
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={styles.documentLink}>
                  View Document
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const WorkExperienceList = ({ experiences }) => (
    <div style={styles.documentList}>
      <h4 style={styles.documentListTitle}>Work Experience</h4>
      {experiences.length === 0 ? (
        <p style={styles.noDocuments}>No work experience added yet</p>
      ) : (
        experiences.map((exp, idx) => (
          <div key={exp.id || idx} style={styles.workItem}>
            <h5 style={styles.workPosition}>{exp.position} at {exp.company}</h5>
            <p style={styles.workDates}>
              {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
            </p>
            {exp.description && (
              <p style={styles.workDescription}>{exp.description}</p>
            )}
          </div>
        ))
      )}
    </div>
  );

  const SubjectsList = () => (
    <div style={styles.documentList}>
      <h4 style={styles.documentListTitle}>Your LGCSE Subjects & Grades</h4>
      {subjects.length === 0 ? (
        <p style={styles.noDocuments}>No subjects added yet. Add your LGCSE subjects and grades below.</p>
      ) : (
        <div style={styles.subjectsGrid}>
          {subjects.map((subject, index) => (
            <div key={index} style={styles.subjectItem}>
              <div style={styles.subjectInfo}>
                <strong style={styles.subjectName}>{subject.subject}</strong>
                <span style={styles.subjectGrade}>Grade: {subject.grade}</span>
              </div>
              <button 
                onClick={() => handleRemoveSubject(index)}
                style={styles.removeButton}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Student Profile</h1>
        <p style={styles.subtitle}>Manage your personal information and documents</p>
        
        {/* Profile Completion Progress */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Profile Completion</span>
            <span style={styles.progressPercentage}>{profileCompletion}%</span>
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${profileCompletion}%`
              }}
            />
          </div>
          <p style={styles.progressHelp}>
            Complete your profile to unlock better course recommendations and job matches
          </p>
        </div>
      </div>

      {message && (
        <div style={styles.successMessage}>
          {message}
        </div>
      )}
      
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      <div style={styles.tabs}>
        <button 
          style={{
            ...styles.tabButton, 
            ...(activeTab === "personal" ? styles.activeTab : {})
          }} 
          onClick={() => setActiveTab("personal")}
        >
          Personal Info
        </button>
        <button 
          style={{
            ...styles.tabButton, 
            ...(activeTab === "documents" ? styles.activeTab : {})
          }} 
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
        <button 
          style={{
            ...styles.tabButton, 
            ...(activeTab === "work" ? styles.activeTab : {})
          }} 
          onClick={() => setActiveTab("work")}
        >
          Work Experience
        </button>
        <button 
          style={{
            ...styles.tabButton, 
            ...(activeTab === "academic" ? styles.activeTab : {})
          }} 
          onClick={() => setActiveTab("academic")}
        >
          Academic Records
        </button>
      </div>

      <div style={styles.tabContent}>
        {activeTab === "personal" && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={profile.name} 
                  onChange={handleChange} 
                  placeholder="Enter your full name" 
                  required 
                  style={styles.input} 
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={profile.email} 
                  onChange={handleChange} 
                  placeholder="Enter your email" 
                  required 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={profile.phone} 
                  onChange={handleChange} 
                  placeholder="Enter your phone number" 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value={profile.location} 
                  onChange={handleChange} 
                  placeholder="Enter your location" 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={profile.address} 
                  onChange={handleChange} 
                  placeholder="Enter your full address" 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>High School</label>
                <input 
                  type="text" 
                  name="highSchool" 
                  value={profile.highSchool} 
                  onChange={handleChange} 
                  placeholder="Enter your high school name" 
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Graduation Year</label>
                <input 
                  type="number" 
                  name="graduationYear" 
                  value={profile.graduationYear} 
                  onChange={handleChange} 
                  placeholder="Enter graduation year" 
                  min="1900"
                  max="2030"
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  value={profile.dateOfBirth} 
                  onChange={handleChange} 
                  style={styles.input} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={updating} 
              style={styles.submitButton}
              onMouseEnter={(e) => !updating && (e.target.style.backgroundColor = '#333')}
              onMouseLeave={(e) => !updating && (e.target.style.backgroundColor = '#1a1a1a')}
            >
              {updating ? (
                <>
                  <div style={styles.buttonSpinner}></div>
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        )}

        {activeTab === "documents" && (
          <>
            <div style={styles.uploadSection}>
              <h3 style={styles.uploadTitle}>Upload New Document</h3>
              <div style={styles.uploadForm}>
                <input 
                  type="text" 
                  value={newDocument.name} 
                  placeholder="Document Name (e.g., High School Transcript)" 
                  onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                  style={styles.input}
                />
                <select 
                  value={newDocument.type} 
                  onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                  style={styles.input}
                >
                  <option value="transcript">Transcript</option>
                  <option value="certificate">Certificate</option>
                </select>
                <input 
                  type="text" 
                  value={newDocument.fileUrl} 
                  placeholder="File URL (implement file upload functionality)" 
                  onChange={(e) => setNewDocument({...newDocument, fileUrl: e.target.value})}
                  style={styles.input}
                />
                <button 
                  onClick={handleDocumentUpload} 
                  disabled={uploading || !newDocument.name}
                  style={styles.uploadButton}
                  onMouseEnter={(e) => !uploading && (e.target.style.backgroundColor = '#333')}
                  onMouseLeave={(e) => !uploading && (e.target.style.backgroundColor = '#1a1a1a')}
                >
                  {uploading ? "Uploading..." : "Upload Document"}
                </button>
              </div>
            </div>

            <div style={styles.documentsSection}>
              <DocumentList docs={documents.transcripts} type="transcripts" />
              <DocumentList docs={documents.certificates} type="certificates" />
            </div>
          </>
        )}

        {activeTab === "work" && (
          <>
            <div style={styles.uploadSection}>
              <h3 style={styles.uploadTitle}>Add Work Experience</h3>
              <div style={styles.workForm}>
                <div style={styles.formGrid}>
                  <input 
                    type="text" 
                    name="company" 
                    value={newWorkExperience.company} 
                    onChange={handleWorkExpChange} 
                    placeholder="Company Name" 
                    style={styles.input} 
                  />
                  <input 
                    type="text" 
                    name="position" 
                    value={newWorkExperience.position} 
                    onChange={handleWorkExpChange} 
                    placeholder="Position Title" 
                    style={styles.input} 
                  />
                  <input 
                    type="date" 
                    name="startDate" 
                    value={newWorkExperience.startDate} 
                    onChange={handleWorkExpChange} 
                    placeholder="Start Date" 
                    style={styles.input} 
                  />
                  <input 
                    type="date" 
                    name="endDate" 
                    value={newWorkExperience.endDate} 
                    onChange={handleWorkExpChange} 
                    placeholder="End Date" 
                    style={styles.input} 
                    disabled={newWorkExperience.isCurrent} 
                  />
                </div>
                <textarea 
                  name="description" 
                  value={newWorkExperience.description} 
                  onChange={handleWorkExpChange} 
                  placeholder="Describe your responsibilities and achievements..." 
                  style={styles.textarea} 
                  rows="4"
                />
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="isCurrent" 
                    checked={newWorkExperience.isCurrent} 
                    onChange={handleWorkExpChange} 
                  />
                  I currently work here
                </label>
                <button 
                  onClick={handleAddWorkExperience} 
                  style={styles.uploadButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
                >
                  Add Work Experience
                </button>
              </div>
            </div>

            <WorkExperienceList experiences={documents.workExperience} />
          </>
        )}

        {activeTab === "academic" && (
          <>
            <div style={styles.uploadSection}>
              <h3 style={styles.uploadTitle}>Add LGCSE Subjects & Grades</h3>
              <p style={styles.helpText}>
                Add your Lesotho General Certificate of Secondary Education (LGCSE) subjects and grades. 
                This information will be used to show you courses you qualify for.
              </p>
              <div style={styles.subjectForm}>
                <div style={styles.formRow}>
                  <select
                    name="subject"
                    value={newSubject.subject}
                    onChange={handleSubjectChange}
                    style={styles.input}
                  >
                    <option value="">Select Subject</option>
                    {predefinedSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <select
                    name="grade"
                    value={newSubject.grade}
                    onChange={handleSubjectChange}
                    style={styles.input}
                  >
                    <option value="">Select Grade</option>
                    {validGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAddSubject}
                    style={styles.addButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2d5a2d'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
                  >
                    Add Subject
                  </button>
                </div>
              </div>
            </div>

            <SubjectsList />

            {subjects.length > 0 && (
              <div style={styles.saveSection}>
                <button 
                  onClick={handleSaveSubjects}
                  disabled={savingSubjects}
                  style={styles.saveButton}
                  onMouseEnter={(e) => !savingSubjects && (e.target.style.backgroundColor = '#333')}
                  onMouseLeave={(e) => !savingSubjects && (e.target.style.backgroundColor = '#1a1a1a')}
                >
                  {savingSubjects ? (
                    <>
                      <div style={styles.buttonSpinner}></div>
                      Saving...
                    </>
                  ) : (
                    "Save Academic Records"
                  )}
                </button>
                <p style={styles.saveNote}>
                  Complete your academic records to unlock personalized course recommendations based on your qualifications
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#f8f8f8",
    minHeight: "100vh",
  },
  header: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
    border: "1px solid #e0e0e0",
  },
  title: {
    fontSize: "2.25rem",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    margin: "0 0 1.5rem 0",
    lineHeight: "1.5",
  },
  progressSection: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  progressLabel: {
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  progressPercentage: {
    color: "#1a1a1a",
    fontWeight: "700",
    fontSize: "1.1rem",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "0.5rem",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1a1a1a",
    transition: "width 0.3s ease",
  },
  progressHelp: {
    color: "#666",
    fontSize: "0.85rem",
    margin: "0",
    fontStyle: "italic",
  },
  tabs: {
    display: "flex",
    marginBottom: "2rem",
    background: "#fff",
    borderRadius: "8px",
    padding: "0.25rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  tabButton: {
    flex: "1",
    padding: "1rem 1.25rem",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "600",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
    color: "#666",
  },
  activeTab: {
    background: "#1a1a1a",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },
  tabContent: {
    background: "#fff",
    borderRadius: "8px",
    padding: "2.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.25rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontWeight: "600",
    color: "#1a1a1a",
    fontSize: "0.9rem",
  },
  input: {
    padding: "0.875rem 1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    outline: "none",
    backgroundColor: "#fff",
  },
  textarea: {
    padding: "0.875rem 1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "inherit",
    outline: "none",
    backgroundColor: "#fff",
  },
  submitButton: {
    padding: "1rem 2rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    alignSelf: "flex-start",
  },
  uploadSection: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    marginBottom: "2rem",
    border: "1px solid #e0e0e0",
  },
  uploadTitle: {
    margin: "0 0 1rem 0",
    color: "#1a1a1a",
    fontSize: "1.2rem",
    fontWeight: "600",
  },
  helpText: {
    color: "#666",
    fontSize: "0.9rem",
    marginBottom: "1rem",
    lineHeight: "1.5",
  },
  uploadForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxWidth: "500px",
  },
  subjectForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-end",
  },
  workForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  uploadButton: {
    padding: "0.875rem 1.5rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    alignSelf: "flex-start",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
  },
  addButton: {
    padding: "0.875rem 1.5rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
  },
  saveButton: {
    padding: "1rem 2rem",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
  },
  removeButton: {
    background: "#8b2d2d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    width: "2rem",
    height: "2rem",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "all 0.2s ease",
  },
  documentsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  documentList: {
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "1.5rem",
  },
  documentListTitle: {
    margin: "0 0 1rem 0",
    color: "#1a1a1a",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  documentItem: {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    borderBottom: "1px solid #f0f0f0",
    gap: "1rem",
  },
  workItem: {
    padding: "1rem",
    borderBottom: "1px solid #f0f0f0",
    background: "#f8f8f8",
    borderRadius: "4px",
    marginBottom: "0.75rem",
  },
  subjectItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
    borderBottom: "1px solid #f0f0f0",
    background: "#f8f8f8",
    borderRadius: "4px",
    marginBottom: "0.75rem",
  },
  subjectsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  subjectInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  subjectName: {
    color: "#1a1a1a",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  subjectGrade: {
    color: "#666",
    fontSize: "0.8rem",
  },
  documentInfo: {
    flex: "1",
  },
  documentName: {
    display: "block",
    color: "#1a1a1a",
    marginBottom: "0.25rem",
    fontWeight: "600",
  },
  documentDate: {
    color: "#666",
    fontSize: "0.8rem",
  },
  documentLink: {
    color: "#1a1a1a",
    textDecoration: "none",
    fontSize: "0.8rem",
    fontWeight: "500",
    borderBottom: "1px solid transparent",
    transition: "border-color 0.2s ease",
  },
  workPosition: {
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a",
    fontSize: "1rem",
    fontWeight: "600",
  },
  workDates: {
    margin: "0 0 0.5rem 0",
    color: "#666",
    fontSize: "0.85rem",
  },
  workDescription: {
    margin: "0",
    color: "#666",
    fontSize: "0.85rem",
    lineHeight: "1.5",
  },
  noDocuments: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    padding: "1.5rem",
    fontSize: "0.9rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#666",
    fontSize: "0.9rem",
  },
  saveSection: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    marginTop: "1.5rem",
    textAlign: "center",
  },
  saveNote: {
    color: "#666",
    fontSize: "0.85rem",
    marginTop: "0.75rem",
    marginBottom: "0",
    lineHeight: "1.5",
  },
  successMessage: {
    background: "#f0f8f0",
    color: "#2d5a2d",
    padding: "1rem 1.25rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    border: "1px solid #d0e8d0",
    fontSize: "0.9rem",
  },
  errorMessage: {
    background: "#f8f0f0",
    color: "#8b2d2d",
    padding: "1rem 1.25rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    border: "1px solid #e8d0d0",
    fontSize: "0.9rem",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    color: "#666",
  },
  loadingText: {
    marginTop: "1rem",
    fontSize: "1rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #1a1a1a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  buttonSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default Profile;
