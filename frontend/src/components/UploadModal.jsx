import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle, RefreshCw } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to process report file.');
      }

      const analyzedData = await res.json();
      onUploadSuccess(analyzedData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Upload size={20} className="modal-title-icon" />
            <h3>Upload Custom Medical Report</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Upload an authentic or simulated CityLab markdown report (<code>.md</code>).
            The ingestion engine will strip CLIA/HIPAA boilerplate, extract demographics,
            normalize aliases, and execute deterministic classification.
          </p>

          <div
            className={`dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              accept=".md,.txt"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="dropzone-label">
              <FileText size={36} className="dropzone-icon" />
              {file ? (
                <div className="file-selected-info">
                  <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <>
                  <span className="dropzone-text-main">
                    Drag and drop your lab report file here, or <strong>browse</strong>
                  </span>
                  <span className="dropzone-text-sub">Supports Markdown (.md) reports</span>
                </>
              )}
            </label>
          </div>

          {error && (
            <div className="modal-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleUploadSubmit}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <RefreshCw size={14} className="spinning" />
                <span>Processing Report...</span>
              </>
            ) : (
              <span>Analyze Report</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
