import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiRequest from '../../services/axiosInstance';
import { ArrowLeft, Send, Upload } from 'lucide-react';

const DeathCertificate = () => {
  const [formData, setFormData] = useState({
    deceasedName: '',
    gender: '',
    dateOfDeath: '',
    ageAtDeath: '',
    placeOfDeath: '',
    fatherOrSpouseName: '',
    applicantName: '',
    applicantRelation: '',
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

    const {
      deceasedName,
      gender,
      dateOfDeath,
      ageAtDeath,
      placeOfDeath,
      fatherOrSpouseName,
      applicantName,
      applicantRelation,
    } = formData;

    if (
      !deceasedName ||
      !gender ||
      !dateOfDeath ||
      !ageAtDeath ||
      !placeOfDeath ||
      !fatherOrSpouseName ||
      !applicantName ||
      !applicantRelation
    ) {
      return setError('Please fill in all details');
    }
    if (!documentFile) {
      return setError('Please upload supporting documents (e.g. Hospital Death Report)');
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('deceasedName', deceasedName);
      data.append('gender', gender);
      data.append('dateOfDeath', dateOfDeath);
      data.append('ageAtDeath', ageAtDeath);
      data.append('placeOfDeath', placeOfDeath);
      data.append('fatherOrSpouseName', fatherOrSpouseName);
      data.append('applicantName', applicantName);
      data.append('applicantRelation', applicantRelation);
      data.append('document', documentFile);

      await apiRequest('/api/death/apply', {
        method: 'POST',
        body: data,
      });

      setSuccess('Death Certificate application submitted successfully!');
      setFormData({
        deceasedName: '',
        gender: '',
        dateOfDeath: '',
        ageAtDeath: '',
        placeOfDeath: '',
        fatherOrSpouseName: '',
        applicantName: '',
        applicantRelation: '',
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
          Death Registration & Certificate Application
        </h2>
      </div>

      <div className="gov-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="gov-card-header">
          Form 2: Application for Death Certificate
          <span style={{ fontSize: '11px', color: 'var(--saffron)', fontWeight: 'bold' }}>REGISTRATION OF BIRTHS & DEATHS ACT, 1969</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Deceased details */}
          <h3 style={{ fontSize: '14px', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            1. Deceased Person Details
          </h3>

          <div className="gov-form-row">
            <div className="form-group">
              <label htmlFor="deceasedName">Name of the Deceased *</label>
              <input
                type="text"
                id="deceasedName"
                className="form-control"
                placeholder="Enter deceased's full name"
                value={formData.deceasedName}
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
              <label htmlFor="dateOfDeath">Date of Death *</label>
              <input
                type="date"
                id="dateOfDeath"
                className="form-control"
                value={formData.dateOfDeath}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ageAtDeath">Age at time of Death (Years) *</label>
              <input
                type="number"
                id="ageAtDeath"
                className="form-control"
                placeholder="e.g. 68"
                value={formData.ageAtDeath}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="gov-form-row">
            <div className="form-group">
              <label htmlFor="placeOfDeath">Place of Death *</label>
              <input
                type="text"
                id="placeOfDeath"
                className="form-control"
                placeholder="Hospital name or residential address"
                value={formData.placeOfDeath}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fatherOrSpouseName">Father's or Spouse's Name *</label>
              <input
                type="text"
                id="fatherOrSpouseName"
                className="form-control"
                placeholder="Name of husband/wife/father"
                value={formData.fatherOrSpouseName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Section 2: Applicant details */}
          <h3 style={{ fontSize: '14px', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '20px', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            2. Applicant Details
          </h3>

          <div className="gov-form-row">
            <div className="form-group">
              <label htmlFor="applicantName">Applicant's Full Name *</label>
              <input
                type="text"
                id="applicantName"
                className="form-control"
                placeholder="Enter your full name"
                value={formData.applicantName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="applicantRelation">Relationship with Deceased *</label>
              <select
                id="applicantRelation"
                className="form-control"
                value={formData.applicantRelation}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">-- Select Relationship --</option>
                <option value="Spouse">Husband / Wife (Spouse)</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Sibling">Brother / Sister (Sibling)</option>
                <option value="Other">Other Relative</option>
              </select>
            </div>
          </div>

          {/* Section 3: Upload documents */}
          <h3 style={{ fontSize: '14px', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '20px', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            3. Supporting Proof Documents
          </h3>

          <div className="form-group">
            <label>Upload Supporting Document (PDF or Image, max 10MB) *</label>
            <p style={{ fontSize: '11px', color: 'var(--light-text)', marginBottom: '10px' }}>
              Upload doctor death declaration slip, cremation/burial authority slip, or police report in case of accidents.
            </p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label
                htmlFor="document"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Upload size={16} />
                Upload Death Report Slip
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
              {loading ? 'Submitting Application...' : 'Register Death & Apply'}
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

export default DeathCertificate;
