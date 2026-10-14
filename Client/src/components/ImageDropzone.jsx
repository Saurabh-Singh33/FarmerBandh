import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, X, Loader2, Sparkles, Link as LinkIcon } from 'lucide-react';
import { uploadApi } from '../services/uploadApi';
import { notify } from '../context/NotificationContext';

export const PRESET_IMAGES = [
  { label: 'Wheat', url: '/images/products/wheat-grade-a.jpg' },
  { label: 'Rice', url: '/images/products/basmati-rice.jpg' },
  { label: 'Tomato', url: '/images/products/tomato-fresh.jpg' },
  { label: 'Onion', url: '/images/products/onion-red.jpg' },
  { label: 'Potato', url: '/images/products/potato-jyoti.jpg' },
  { label: 'Mango', url: '/images/products/mango-kesar.jpg' },
  { label: 'Banana', url: '/images/products/banana-g9.jpg' },
  { label: 'Corn/Maize', url: '/images/products/yellow-maize.jpg' },
  { label: 'Toor Dal', url: '/images/products/toor-dal.jpg' },
  { label: 'Chana', url: '/images/products/chana-gram.jpg' },
  { label: 'Turmeric', url: '/images/products/turmeric-finger.jpg' }
];

export const ImageDropzone = ({ value, onChange, label = 'Crop / Harvest Photo' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [customUrlInput, setCustomUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file (PNG, JPG, WebP, AVIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify.error('Image size must be under 10 MB.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress('Uploading harvest image to server...');
      const result = await uploadApi.uploadImage(file);
      onChange(result.url);
      notify.success('Harvest photo uploaded and saved successfully!');
    } catch (err) {
      console.error('Image upload failed:', err);
      notify.error(err?.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearImage = () => {
    onChange('');
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    onChange(customUrlInput.trim());
    setCustomUrlInput('');
    notify.success('Custom image URL applied.');
  };

  const isUploadedImage = value && (value.includes('/uploads/') || value.startsWith('http://localhost:5000/uploads/'));
  const isPresetImage = value && PRESET_IMAGES.some((p) => p.url === value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Label and Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1B4D3E', marginBottom: '2px' }}>
            {label}
          </label>
          <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
            Upload real crop harvest photos or choose from verified produce presets
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'inline-flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            style={{
              border: 'none',
              backgroundColor: activeTab === 'upload' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'upload' ? '#1B4D3E' : '#6B7280',
              fontWeight: activeTab === 'upload' ? 700 : 500,
              fontSize: '0.78rem',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Upload Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            style={{
              border: 'none',
              backgroundColor: activeTab === 'preset' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'preset' ? '#1B4D3E' : '#6B7280',
              fontWeight: activeTab === 'preset' ? 700 : 500,
              fontSize: '0.78rem',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'preset' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            style={{
              border: 'none',
              backgroundColor: activeTab === 'url' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'url' ? '#1B4D3E' : '#6B7280',
              fontWeight: activeTab === 'url' ? 700 : 500,
              fontSize: '0.78rem',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: activeTab === 'url' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Main Preview Box if an image is already selected/uploaded */}
      {value && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: '#F9FBF8',
            border: '1.5px solid #C8E6C9',
            borderRadius: '10px',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <img
                src={value}
                alt="Selected harvest"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src = '/images/products/wheat-grade-a.jpg';
                }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={15} color="#15803D" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B4D3E' }}>
                  {isUploadedImage ? 'Custom Harvest Photo Uploaded' : (isPresetImage ? 'Verified Stock Preset Selected' : 'Custom Image URL Set')}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.74rem',
                  color: '#6B7280',
                  margin: '3px 0 0 0',
                  maxWidth: '420px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {value}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClearImage}
              style={{
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Remove image"
            >
              <X size={14} /> Remove
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: Drag & Drop Zone */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed #1B4D3E' : '2px dashed #D1D5DB',
            backgroundColor: isDragging ? '#ECFDF5' : (uploading ? '#F9FAFB' : '#FFFFFF'),
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={32} color="#1B4D3E" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1B4D3E' }}>
                {uploadProgress || 'Uploading image...'}
              </span>
              <span style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                Saving harvest photo to server and database
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: isDragging ? '#D1FAE5' : '#E8F5E9',
                  color: '#1B4D3E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(27,77,62,0.1)'
                }}
              >
                <UploadCloud size={26} strokeWidth={2.2} />
              </div>

              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1B4D3E' }}>
                  Click to upload
                </span>
                <span style={{ fontSize: '0.92rem', color: '#4B5563' }}> or drag and drop your crop photo</span>
              </div>

              <p style={{ fontSize: '0.76rem', color: '#9CA3AF', margin: 0 }}>
                PNG, JPG, WebP, or AVIF up to 10 MB. High-resolution harvest photos build buyer confidence.
              </p>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Presets Grid */}
      {activeTab === 'preset' && (
        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.65rem' }}>
            <Sparkles size={15} color="#059669" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
              Select a standard market crop photo:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PRESET_IMAGES.map((img) => {
              const isSelected = value === img.url;
              return (
                <button
                  type="button"
                  key={img.label}
                  onClick={() => onChange(img.url)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #1B4D3E' : '1px solid #D1D5DB',
                    backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                    color: isSelected ? '#065F46' : '#374151',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                  <span>{img.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Custom URL Input */}
      {activeTab === 'url' && (
        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Paste Public Web Image URL
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="url"
              placeholder="https://example.com/images/crop.jpg"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.55rem 0.85rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.88rem',
                outline: 'none',
                backgroundColor: '#FFFFFF'
              }}
            />
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LinkIcon size={14} /> Apply URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
