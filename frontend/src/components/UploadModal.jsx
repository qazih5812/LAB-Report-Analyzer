import React, { useState } from "react";
import { apiUrl } from "../api";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  Image as ImageIcon,
} from "lucide-react";

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(apiUrl("/api/upload"), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to process report file.");
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

  const isPdf = file?.name?.toLowerCase().endsWith(".pdf");
  const isImage = file?.type?.startsWith("image/") || /\.(png|jpe?g|webp|bmp)$/i.test(file?.name || "");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Upload size={20} className="modal-title-icon" />
            <h3>Upload Medical Lab Report</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Upload a laboratory report in <strong>PDF</strong>, <strong>PNG/JPG Image</strong>, or <strong>Markdown (.md)</strong> format.
            Our multimodal ingestion pipeline extracts patient demographics and runs deterministic classification.
          </p>

          <div
            className={`dropzone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.md,.txt"
              onChange={handleChange}
              style={{ display: "none" }}
            />
            <label htmlFor="file-input" className="dropzone-label">
              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    className="max-h-36 max-w-full rounded-lg border border-border object-contain shadow-xs"
                  />
                  <span className="text-xs font-semibold text-foreground">{file.name}</span>
                </div>
              ) : isPdf ? (
                <div className="flex flex-col items-center gap-1.5">
                  <FileSpreadsheet size={40} className="text-red-500" />
                  <span className="text-xs font-bold text-foreground">{file.name}</span>
                  <span className="text-[11px] text-muted-foreground">PDF Document Ready for Ingestion</span>
                </div>
              ) : file ? (
                <div className="file-selected-info">
                  <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ) : (
                <>
                  <FileText size={36} className="dropzone-icon" />
                  <span className="dropzone-text-main">
                    Drag and drop your report here, or <strong>browse</strong>
                  </span>
                  <span className="dropzone-text-sub">
                    Supports <strong>PDF</strong>, <strong>PNG</strong>, <strong>JPG</strong>, and <strong>Markdown</strong> files
                  </span>
                </>
              )}
            </label>
          </div>

          {error && (
            <div className="modal-error">
              <AlertCircle size={16} className="shrink-0" />
              <span className="text-xs">{error}</span>
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
                <span>Extracting & Analyzing...</span>
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
