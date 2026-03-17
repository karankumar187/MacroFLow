import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Loader2 } from 'lucide-react';

export default function PhotoUpload({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.type.startsWith('image/')) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await onUpload(file);
      handleClose();
    } catch (err) {
      console.error('Upload error:', err);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="card"
          style={{
            width: '440px',
            maxWidth: '90vw',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>
              📸 Quick Log Photo
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
            >
              <X size={20} />
            </motion.button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#8BC34A' : '#ddd'}`,
              borderRadius: '16px',
              padding: preview ? '0' : '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: dragOver ? '#E8F5E9' : '#fafafa',
              overflow: 'hidden',
              minHeight: '200px',
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Food preview"
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '14px' }}
              />
            ) : (
              <>
                <Image size={40} color="#ccc" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#999', fontSize: '14px' }}>Drop a food photo or nutrition label</p>
                <p style={{ color: '#ccc', fontSize: '12px', marginTop: '4px' }}>or click to browse</p>
              </>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {file && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{ display: 'flex', gap: '10px', marginTop: '16px' }}
            >
              <button className="btn-secondary" onClick={() => { setFile(null); setPreview(null); }} style={{ flex: 1 }}>Clear</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {loading ? 'Analyzing...' : 'Extract Macros'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
