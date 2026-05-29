import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiRequest from '../../services/axiosInstance';
import { ArrowLeft, Send, Upload } from 'lucide-react';

const BirthCertificate = () => {
  const [formData, setFormData] = useState({
    childName: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: '',
    fatherName: '',
    motherName: '',
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { childName, gender, dateOfBirth, placeOfBirth, fatherName, motherName } = formData;

    if (!childName || !gender || !dateOfBirth || !placeOfBirth || !fatherName || !motherName) {
      return setError('Please fill in all details');
    }
    if (!documentFile) {
      return setError('Please upload supporting documents (e.g. Hospital Discharge Slip)');
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('childName', childName);
      data.append('gender', gender);
      data.append('dateOfBirth', dateOfBirth);
      data.append('placeOfBirth', placeOfBirth);
      data.append('fatherName', fatherName);
      data.append('motherName', motherName);
      data.append('document', documentFile);

      await apiRequest('/api/birth/apply', {
        method: 'POST',
        body: data,
      });

      setSuccess('Birth Certificate application submitted successfully!');
      setFormData({
        childName: '',
        gender: '',
        dateOfBirth: '',
        placeOfBirth: '',
        fatherName: '',
        motherName: '',
      });
      setDocumentFile(null);

      setTimeout(() => {
        navigate('/citizen/applications');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please try again.');
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
          Birth Registration & Certificate Application
        </h2>
      </div>

      <div className="gov-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="gov-card-header">
          Form 1: Application for Birth Certificate
          <span style={{ fontSize: '11px', color: 'var(--saffron)', fontWeight: 'bold' }}>REGISTRATION OF BIRTHS ACT, 1969</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Child details */}
          <h3 style={{ fontSize: '14px', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            1. Child Details
          </h3>

          <div className="gov-form-row">
            <div className="form-group">
              <label htmlFor="childName">Name of the Child *</label>
              <input
                type="text"
                id="childName"
                className="form-control"
                placeholder="Enter child's full name"
                value={formData.childName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="gov-form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                className="form-control"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="placeOfBirth">Place of Birth *</label>
              <input
                type="text"
                id="placeOfBirth"
                className="form-control"
                placeholder="Hospital name or residential address"
                value={formData.placeOfBirth}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Section 2: Parents details */}
          <h3 style={{ fontSize: '14px', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '20px', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            2. Parents Details
          </h3>

          <div className="gov-form-row">
            <div className="form-group">
              <label htmlFor="fatherName">Full Name of Father *</label>
              <input
                type="text"
                id="fatherName"
                className="form-control"
                placeholder="Enter father's name"
                value={formData.fatherName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="motherName">Full Name of Mother *</label>
              <input
                type="text"
                id="motherName"
                className="form-control"
                placeholder="Enter mother's name"
                value={formData.motherName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Section 3: Upload documents */}
          <h3 style={{ fontSize: '14px', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '20px', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            3. Supporting Proof Documents
          </h3>

          <div className="form-group">
            <label>Upload Supporting Document (PDF or Image, max 10MB) *</label>
            <p style={{ fontSize: '11px', color: 'var(--light-text)', marginBottom: '10px' }}>
              Upload hospital discharge certificate, vaccination card, or a written declaration signed by Ward Member.
            </p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label
                htmlFor="document"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Upload size={16} />
                Upload Certificate Slip
                <input
                  type="file"
                  id="document"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
              </label>
              {documentFile && (
                <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 'bold' }}>
                  ✓ {documentFile.name}
                </span>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flex: '1', height: '42px' }}
              disabled={loading}
            >
              <Send size={16} />
              {loading ? 'Submitting Application...' : 'Register Birth & Apply'}
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

export default BirthCertificate;
