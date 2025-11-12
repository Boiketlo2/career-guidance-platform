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
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 50 }); // 50MB total storage

  useEffect(() => {
    fetchUploadedDocuments();
    calculateStorageUsage();
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

  const calculateStorageUsage = () => {
    // Mock storage calculation - in real app, calculate from actual file sizes
    const usedMB = uploadedDocuments.length * 2; // Assume 2MB per document
    setStorageUsage({ used: usedMB, total: 50 });
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
        setMessage("Document uploaded successfully!");
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
        calculateStorageUsage();
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

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const res = await studentAPI.deleteDocument(studentId, documentId);
      if (res.success) {
        setMessage("Document deleted successfully!");
        await fetchUploadedDocuments();
        calculateStorageUsage();
      } else {
        setError("Failed to delete document.");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Error deleting document. Please try again.");
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "transcript": return "";
      case "certificate": return "";
      default: return "📄";
    }
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case "transcript": return "#2d5a2d";
      case "certificate": return "#1a1a1a";
      default: return "#666";
    }
  };

  const DocumentList = ({ documents, type }) => {
    const filteredDocs = documents.filter(doc => 
      doc.documentType === type || doc.type === type
    );

    return (
      <div style={styles.documentTypeSection}>
        <h3 style={styles.documentTypeTitle}>
          <span style={{ 
            ...styles.documentTypeIcon, 
            backgroundColor: getFileTypeColor(type) + '1A',
            color: getFileTypeColor(type)
          }}>
            {getFileIcon(type)}
          </span>
          {type === "transcript" ? "Transcripts" : "Certificates"}
          <span style={styles.docCount}>({filteredDocs.length})</span>
        </h3>
        
        {filteredDocs.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No {type}s uploaded yet</p>
            <p style={styles.emptySubtext}>Upload your {type.toLowerCase()} to get started</p>
          </div>
        ) : (
          <div style={styles.documentsGrid}>
            {filteredDocs.map((doc, index) => (
              <div 
                key={doc.id || index} 
                style={styles.documentCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.documentHeader}>
                  <div style={{
                    ...styles.documentIcon,
                    backgroundColor: getFileTypeColor(type) + '1A',
                    color: getFileTypeColor(type)
                  }}>
                    {getFileIcon(type)}
                  </div>
                  <div style={styles.documentInfo}>
                    <h4 style={styles.documentName}>{doc.name || doc.documentName}</h4>
                    <p style={styles.documentDate}>
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    <p style={styles.documentType}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
                  <button 
                    onClick={() => handleDeleteDocument(doc.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
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
        
        {/* Storage Usage */}
        <div style={styles.storageSection}>
          <div style={styles.storageHeader}>
            <span style={styles.storageLabel}>Storage Usage</span>
            <span style={styles.storagePercentage}>
              {Math.round((storageUsage.used / storageUsage.total) * 100)}% used
            </span>
          </div>
          <div style={styles.storageBar}>
            <div 
              style={{
                ...styles.storageFill,
                width: `${(storageUsage.used / storageUsage.total) * 100}%`
              }}
            />
          </div>
          <p style={styles.storageText}>
            {storageUsage.used}MB of {storageUsage.total}MB used
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
              <div 
                style={{
                  ...styles.fileUploadArea,
                  ...(documentData.file ? styles.fileUploadAreaActive : {})
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    handleFileChange({ target: { files: [file] } });
                  }
                }}
              >
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
                      {documentData.file ? documentData.file.name : "Click to select or drag & drop file"}
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
                ...(uploading || !documentData.documentName || !documentData.file ? styles.uploadButtonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!uploading && documentData.documentName && documentData.file) {
                  e.target.style.backgroundColor = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!uploading && documentData.documentName && documentData.file) {
                  e.target.style.backgroundColor = '#1a1a1a';
                }
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
            <p style={styles.loadingText}>Loading your documents...</p>
          </div>
        ) : (
          <>
            <DocumentList documents={uploadedDocuments} type="transcript" />
            <DocumentList documents={uploadedDocuments} type="certificate" />
          </>
        )}
      </div>

      <div style={styles.infoSection}>
        <h3 style={styles.infoTitle}>Document Guidelines</h3>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <h4 style={styles.infoCardTitle}>File Requirements</h4>
            <ul style={styles.infoList}>
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
              <li>Ensure documents are clear and readable</li>
            </ul>
          </div>
          <div style={styles.infoCard}>
            <h4 style={styles.infoCardTitle}>Transcript Guidelines</h4>
            <ul style={styles.infoList}>
              <li>Include all academic transcripts</li>
              <li>Ensure grades are visible</li>
              <li>Upload most recent transcripts first</li>
            </ul>
          </div>
          <div style={styles.infoCard}>
            <h4 style={styles.infoCardTitle}>Certificate Guidelines</h4>
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
  storageSection: {
    background: "#f8f8f8",
    padding: "1.5rem",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  storageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  storageLabel: {
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  storagePercentage: {
    color: "#1a1a1a",
    fontWeight: "700",
    fontSize: "1rem",
  },
  storageBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "0.5rem",
  },
  storageFill: {
    height: "100%",
    backgroundColor: "#1a1a1a",
    transition: "width 0.3s ease",
  },
  storageText: {
    color: "#666",
    fontSize: "0.85rem",
    margin: "0",
  },
  uploadSection: {
    marginBottom: "2rem",
  },
  uploadCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "2.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  uploadTitle: {
    margin: "0 0 1.5rem 0",
    color: "#1a1a1a",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
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
  select: {
    padding: "0.875rem 1rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    backgroundColor: "#fff",
    outline: "none",
  },
  fileUploadArea: {
    position: "relative",
    border: "2px dashed #e0e0e0",
    borderRadius: "6px",
    padding: "2rem",
    textAlign: "center",
    transition: "all 0.2s ease",
    cursor: "pointer",
    backgroundColor: "#f8f8f8",
  },
  fileUploadAreaActive: {
    borderColor: "#1a1a1a",
    backgroundColor: "#f0f0f0",
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
    gap: "0.75rem",
  },
  fileUploadIcon: {
    fontSize: "2rem",
    color: "#666",
  },
  fileUploadText: {
    margin: "0",
    color: "#1a1a1a",
    fontWeight: "500",
    fontSize: "0.95rem",
  },
  fileUploadHint: {
    margin: "0",
    color: "#666",
    fontSize: "0.8rem",
  },
  progressSection: {
    marginTop: "0.5rem",
  },
  progressBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "#f0f0f0",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1a1a1a",
    transition: "width 0.3s ease",
  },
  progressText: {
    margin: "0.5rem 0 0 0",
    color: "#666",
    fontSize: "0.8rem",
    textAlign: "center",
  },
  uploadButton: {
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
  },
  uploadButtonDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
    cursor: "not-allowed",
  },
  buttonSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  documentsSection: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 1.5rem 0",
  },
  documentTypeSection: {
    marginBottom: "2rem",
  },
  documentTypeTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 1rem 0",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  documentTypeIcon: {
    padding: "0.5rem",
    borderRadius: "6px",
    fontSize: "1rem",
  },
  docCount: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "400",
    marginLeft: "0.5rem",
  },
  documentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1rem",
  },
  documentCard: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  documentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  documentIcon: {
    padding: "0.75rem",
    borderRadius: "6px",
    fontSize: "1.25rem",
  },
  documentInfo: {
    flex: "1",
  },
  documentName: {
    margin: "0 0 0.25rem 0",
    color: "#1a1a1a",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  documentDate: {
    margin: "0 0 0.25rem 0",
    color: "#666",
    fontSize: "0.8rem",
  },
  documentType: {
    margin: "0",
    color: "#999",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  documentActions: {
    display: "flex",
    gap: "0.5rem",
    marginLeft: "1rem",
  },
  viewButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#1a1a1a",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  deleteButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#8b2d2d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#999",
    background: "#f8f8f8",
    borderRadius: "6px",
    border: "1px dashed #e0e0e0",
  },
  emptyText: {
    margin: "0 0 0.5rem 0",
    fontSize: "1rem",
    fontWeight: "600",
  },
  emptySubtext: {
    margin: "0",
    fontSize: "0.9rem",
  },
  infoSection: {
    background: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e0e0",
  },
  infoTitle: {
    margin: "0 0 1.5rem 0",
    color: "#1a1a1a",
    fontSize: "1.2rem",
    fontWeight: "600",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.25rem",
  },
  infoCard: {
    padding: "1.5rem",
    background: "#f8f8f8",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  infoCardTitle: {
    margin: "0 0 0.75rem 0",
    color: "#1a1a1a",
    fontSize: "1rem",
    fontWeight: "600",
  },
  infoList: {
    margin: "0",
    paddingLeft: "1.25rem",
    color: "#666",
    fontSize: "0.85rem",
    lineHeight: "1.6",
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
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
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
};

export default UploadDocuments;
