import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiRequest from '../../services/axiosInstance';
import AudioRecorder from '../../components/AudioRecorder';
import { ArrowLeft, Send, Upload, FileImage } from 'lucide-react';

const CreateComplaint = () => {
  const [complaintType, setComplaintType] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAudioSaved = (file) => {
    setAudioFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!complaintType) {
      return setError('Please select a complaint type');
    }
    if (!description || description.trim().length < 10) {
      return setError('Please write a clear description (at least 10 characters)');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('complaintType', complaintType);
      formData.append('description', description);

      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (audioFile) {
        formData.append('audio', audioFile);
      }

      await apiRequest('/api/complaints', {
        method: 'POST',
        body: formData, // Handled automatically by apiRequest when instance of FormData
      });

      setSuccess('Complaint registered successfully in the Panchayat database!');
      setComplaintType('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      setAudioFile(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/citizen/complaints');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/citizen" style={{ color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </Link>
          Register New Grievance
        </h2>
      </div>

      <div className="gov-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="gov-card-header">
          Grievance Lodging Form
          <span style={{ fontSize: '11px', color: 'var(--saffron)', fontWeight: 'bold' }}>SECURE TRANSMISSION</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="complaintType">Grievance / Issue Category *</label>
            <select
              id="complaintType"
              className="form-control"
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select Category --</option>
              <option value="Sanitation">Sanitation / Trash Cleaning</option>
              <option value="Water Supply">Clean Drinking Water Supply</option>
              <option value="Roads">Potholes / Broken Roads</option>
              <option value="Street Lights">Broken Street Lights</option>
              <option value="Electricity">Electricity Interruptions</option>
              <option value="Others">Others (Specify in description)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              className="form-control"
              rows="5"
              placeholder="Provide specific details about the issue (e.g. Near Ward 3 primary school water pipe leakage)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          {/* Image Upload field */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Upload Supporting Photo (Optional)</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '6px' }}>
              <label
                htmlFor="image-upload"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Upload size={16} />
                Choose Photo
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
              </label>
              {imageFile && (
                <span style={{ fontSize: '13px', color: 'var(--light-text)' }}>
                  Selected: {imageFile.name}
                </span>
              )}
            </div>
            
            {imagePreview && (
              <div style={{ marginTop: '12px', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '4px', maxWidth: '200px' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}
          </div>

          {/* Audio Recording field using our AudioRecorder */}
          <div className="form-group" style={{ marginTop: '25px', marginBottom: '25px' }}>
            <label>Voice Grievance Recording (Optional)</label>
            <AudioRecorder onAudioSaved={handleAudioSaved} />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', gap: '15px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flex: '1', height: '42px' }}
              disabled={loading}
            >
              <Send size={16} />
              {loading ? 'Submitting to Server...' : 'Submit Grievance Record'}
            </button>
            <Link to="/citizen" className="btn btn-secondary" style={{ flex: '0 0 auto' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
