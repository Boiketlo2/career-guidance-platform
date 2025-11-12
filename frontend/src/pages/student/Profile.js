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
        setMessage(" Profile updated successfully!");
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
        setMessage(" Document uploaded successfully!");
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
        setMessage(" Work experience added successfully!");
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
        setMessage(" Academic records saved successfully!");
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
        {type === "transcripts" ? "📊 Transcripts" : "🏆 Certificates"}
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
      <h4 style={styles.documentListTitle}>💼 Work Experience</h4>
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
      <h4 style={styles.documentListTitle}>📚 Your LGCSE Subjects & Grades</h4>
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
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Student Profile</h1>
        <p style={styles.subtitle}>Manage your personal information and documents</p>
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
                  💡 Don't forget to save your changes! Your academic records will be used to filter courses you qualify for.
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
    padding: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: "0",
  },
  tabs: {
    display: "flex",
    marginBottom: "30px",
    background: "#fff",
    borderRadius: "12px",
    padding: "5px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  tabButton: {
    flex: "1",
    padding: "15px 20px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "600",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    fontSize: "14px",
  },
  activeTab: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  tabContent: {
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  textarea: {
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "inherit",
    outline: "none",
  },
  submitButton: {
    padding: "15px 30px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    alignSelf: "flex-start",
  },
  uploadSection: {
    background: "#f8fafc",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px",
    border: "1px solid #e2e8f0",
  },
  uploadTitle: {
    margin: "0 0 20px 0",
    color: "#1e293b",
    fontSize: "1.2rem",
  },
  helpText: {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  uploadForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "500px",
  },
  subjectForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formRow: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-end",
  },
  workForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  uploadButton: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  addButton: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  saveButton: {
    padding: "15px 30px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  removeButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  documentsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  documentList: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
  },
  documentListTitle: {
    margin: "0 0 15px 0",
    color: "#1e293b",
    fontSize: "1.1rem",
  },
  documentItem: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #f1f5f9",
    gap: "15px",
  },
  workItem: {
    padding: "15px",
    borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  subjectItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px",
    borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  subjectsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  subjectInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  subjectName: {
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "600",
  },
  subjectGrade: {
    color: "#64748b",
    fontSize: "12px",
  },
  documentInfo: {
    flex: "1",
  },
  documentName: {
    display: "block",
    color: "#1e293b",
    marginBottom: "5px",
  },
  documentDate: {
    color: "#64748b",
    fontSize: "12px",
  },
  documentLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: "500",
  },
  workPosition: {
    margin: "0 0 8px 0",
    color: "#1e293b",
    fontSize: "1rem",
  },
  workDates: {
    margin: "0 0 8px 0",
    color: "#64748b",
    fontSize: "14px",
  },
  workDescription: {
    margin: "0",
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  noDocuments: {
    color: "#94a3b8",
    fontStyle: "italic",
    textAlign: "center",
    padding: "20px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#374151",
    fontSize: "14px",
  },
  saveSection: {
    background: "#f0f9ff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #bae6fd",
    marginTop: "20px",
    textAlign: "center",
  },
  saveNote: {
    color: "#0369a1",
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "0",
  },
  successMessage: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    fontWeight: "500",
  },
  errorMessage: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    marginBottom: "20px",
  },
  buttonSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
  },
};

export default Profile;
