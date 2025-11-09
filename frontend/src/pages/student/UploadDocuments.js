import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { studentAPI } from "../../api/studentAPI";

const UploadDocuments = () => {
  const { studentId } = useParams();
  const [documentData, setDocumentData] = useState({
    documentType: "transcript",
    documentName: "",
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploadedDocuments();
  }, [studentId]);

  const fetchUploadedDocuments = async () => {
    try {
      const res = await studentAPI.getDocuments(studentId);
      if (res.success) {
        setUploadedDocuments(res.documents || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setError("Please select a valid file type (PDF, DOC, DOCX, JPG, PNG)");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setDocumentData(prev => ({ 
        ...prev, 
        file: file,
        documentName: file.name.split('.')[0] // Set document name from file name
      }));
      setError("");
    }
  };

  const simulateFileUpload = async (file) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // Generate a mock file URL (replace with actual Firebase Storage URL later)
          const mockFileUrl = `https://example.com/uploads/${studentId}/${Date.now()}_${file.name}`;
          resolve(mockFileUrl);
        }
        setUploadProgress(progress);
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!documentData.documentName.trim()) {
      setError("Please enter a document name.");
      return;
    }

    if (!documentData.file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");
    setUploadProgress(0);

    try {
      console.log("Starting file upload...", documentData);

      // Simulate file upload progress (replace with actual Firebase Storage upload)
      const fileUrl = await simulateFileUpload(documentData.file);

      console.log("File upload simulated, URL:", fileUrl);

      // Send document metadata to backend
      const res = await studentAPI.uploadDocument({
        studentId,
        documentType: documentData.documentType,
        documentName: documentData.documentName,
        fileUrl: fileUrl
      });

      if (res.success) {
        setMessage("✅ Document uploaded successfully!");
        // Reset form
        setDocumentData({
          documentType: "transcript",
          documentName: "",
          file: null
        });
        // Clear file input
        document.getElementById("fileInput").value = "";
        setUploadProgress(0);
        // Refresh documents list
        await fetchUploadedDocuments();
      } else {
        setError(res.error || "Failed to upload document.");
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      setError("Error uploading document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "transcript": return "📊";
      case "certificate": return "🏆";
      default: return "📄";
    }
  };

  const DocumentList = ({ documents, type }) => {
    const filteredDocs = documents.filter(doc => 
      doc.documentType === type || doc.type === type
    );

    return (
      <div style={styles.documentTypeSection}>
        <h3 style={styles.documentTypeTitle}>
          {getFileIcon(type)} {type === "transcript" ? "Transcripts" : "Certificates"}
          <span style={styles.docCount}>({filteredDocs.length})</span>
        </h3>
        
        {filteredDocs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No {type}s uploaded yet</p>
          </div>
        ) : (
          <div style={styles.documentsGrid}>
            {filteredDocs.map((doc, index) => (
              <div key={doc.id || index} style={styles.documentCard}>
                <div style={styles.documentHeader}>
                  <div style={styles.documentIcon}>
                    {getFileIcon(type)}
                  </div>
                  <div style={styles.documentInfo}>
                    <h4 style={styles.documentName}>{doc.name || doc.documentName}</h4>
                    <p style={styles.documentDate}>
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={styles.documentActions}>
                  {doc.fileUrl && (
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.viewButton}
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Upload Documents</h1>
        <p style={styles.subtitle}>Manage your academic transcripts and certificates</p>
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

      <div style={styles.uploadSection}>
        <div style={styles.uploadCard}>
          <h3 style={styles.uploadTitle}>Upload New Document</h3>
          
          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Document Type *</label>
              <select
                name="documentType"
                value={documentData.documentType}
                onChange={handleInputChange}
                style={styles.select}
                disabled={uploading}
              >
                <option value="transcript">Academic Transcript</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Document Name *</label>
              <input
                type="text"
                name="documentName"
                value={documentData.documentName}
                onChange={handleInputChange}
                placeholder="e.g., High School Transcript, Bachelor Degree Certificate"
                style={styles.input}
                disabled={uploading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Select File *</label>
              <div style={styles.fileUploadArea}>
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={styles.fileInput}
                  disabled={uploading}
                />
                <div style={styles.fileUploadContent}>
                  <div style={styles.fileUploadIcon}>📁</div>
                  <div>
                    <p style={styles.fileUploadText}>
                      {documentData.file ? documentData.file.name : "Click to select file"}
                    </p>
                    <p style={styles.fileUploadHint}>
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {uploading && (
              <div style={styles.progressSection}>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${uploadProgress}%`
                    }}
                  ></div>
                </div>
                <p style={styles.progressText}>
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            <button 
              onClick={handleUpload} 
              disabled={uploading || !documentData.documentName || !documentData.file}
              style={{
                ...styles.uploadButton,
                ...(uploading ? styles.uploadButtonDisabled : {})
              }}
            >
              {uploading ? (
                <>
                  <div style={styles.buttonSpinner}></div>
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={styles.documentsSection}>
        <h2 style={styles.sectionTitle}>Your Documents</h2>
        
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p>Loading your documents...</p>
          </div>
        ) : (
          <>
            <DocumentList documents={uploadedDocuments} type="transcript" />
            <DocumentList documents={uploadedDocuments} type="certificate" />
          </>
        )}
      </div>

      <div style={styles.infoSection}>
        <h3 style={styles.infoTitle}>📝 Document Guidelines</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <h4>File Requirements</h4>
            <ul style={styles.infoList}>
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
              <li>Ensure documents are clear and readable</li>
            </ul>
          </div>
          <div style={styles.infoCard}>
            <h4>Transcript Guidelines</h4>
            <ul style={styles.infoList}>
              <li>Include all academic transcripts</li>
              <li>Ensure grades are visible</li>
              <li>Upload most recent transcripts first</li>
            </ul>
          </div>
          <div style={styles.infoCard}>
            <h4>Certificate Guidelines</h4>
            <ul style={styles.infoList}>
              <li>Include relevant certifications</li>
              <li>Professional development certificates</li>
              <li>Awards and achievements</li>
            </ul>
          </div>
        </div>
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
    marginBottom: "40px",
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
  uploadSection: {
    marginBottom: "40px",
  },
  uploadCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  uploadTitle: {
    margin: "0 0 25px 0",
    color: "#1e293b",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
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
  select: {
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#fff",
    outline: "none",
  },
  fileUploadArea: {
    position: "relative",
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    padding: "30px",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  fileInput: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    opacity: "0",
    cursor: "pointer",
  },
  fileUploadContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  fileUploadIcon: {
    fontSize: "2rem",
    color: "#6b7280",
  },
  fileUploadText: {
    margin: "0",
    color: "#374151",
    fontWeight: "500",
  },
  fileUploadHint: {
    margin: "0",
    color: "#6b7280",
    fontSize: "12px",
  },
  progressSection: {
    marginTop: "10px",
  },
  progressBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "#e5e7eb",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    transition: "width 0.3s ease",
  },
  progressText: {
    margin: "5px 0 0 0",
    color: "#6b7280",
    fontSize: "12px",
    textAlign: "center",
  },
  uploadButton: {
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
  },
  uploadButtonDisabled: {
    opacity: "0.6",
    cursor: "not-allowed",
  },
  buttonSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
  },
  documentsSection: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 25px 0",
  },
  documentTypeSection: {
    marginBottom: "30px",
  },
  documentTypeTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 15px 0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  docCount: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: "400",
  },
  documentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "15px",
  },
  documentCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
  },
  documentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  documentIcon: {
    fontSize: "24px",
  },
  documentInfo: {
    flex: "1",
  },
  documentName: {
    margin: "0 0 5px 0",
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "600",
  },
  documentDate: {
    margin: "0",
    color: "#64748b",
    fontSize: "12px",
  },
  documentActions: {
    marginLeft: "15px",
  },
  viewButton: {
    padding: "6px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px dashed #cbd5e1",
  },
  infoSection: {
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  infoTitle: {
    margin: "0 0 20px 0",
    color: "#1e293b",
    fontSize: "1.2rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  infoCard: {
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  infoList: {
    margin: "0",
    paddingLeft: "20px",
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  successMessage: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    fontWeight: "500",
    textAlign: "center",
  },
  errorMessage: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    fontWeight: "500",
    textAlign: "center",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
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
};

export default UploadDocuments;