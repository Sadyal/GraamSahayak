import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiRequest from '../../services/axiosInstance';
import Loader from '../../components/Loader';
import { ArrowLeft, Printer, Milestone } from 'lucide-react';

const CertificateGenerator = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecord();
  }, [type, id]);

  const fetchRecord = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch specific certificate directly by ID (Secure Owner or Admin)
      const endpoint = type === 'birth' ? `/api/birth/${id}` : `/api/death/${id}`;
      const res = await apiRequest(endpoint);
      const found = res.data;

      if (!found) {
        throw new Error('Certificate application record not found');
      }

      if (found.status !== 'Approved' || !found.certificateId) {
        throw new Error('This application has not been approved yet, or no Certificate ID was generated.');
      }

      setRecord(found);
    } catch (err) {
      setError(err.message || 'Failed to fetch certificate details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) return <Loader message="Retrieving secure digital certificate..." />;

  if (error) {
    return (
      <div>
        <div className="content-header">
          <h2>Certificate Verification</h2>
        </div>
        <div className="gov-card">
          <div className="alert alert-error">{error}</div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const citizen = record.citizen || {};
  const isBirth = type === 'birth';

  return (
    <div>
      {/* Back button and Print options (Hidden during window.print()) */}
      <div className="content-header no-print">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          Certificate Preview
        </h2>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrint}
            className="btn btn-success"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Back
          </button>
        </div>
      </div>

      <div className="no-print gov-card" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '12px', fontSize: '13px', marginBottom: '20px', borderRadius: '4px', fontWeight: 'bold' }}>
        💡 TIP: In the print dialog, enable "Background graphics" and set layout to "Portrait" to preserve colors and seals!
      </div>

      {/* Official Certificate Form Card (Will print) */}
      <div className="certificate-container print-area">
        {/* Faint watermarked background text */}
        <div className="watermark">GRAM PANCHAYAT</div>

        {/* Certificate Flag tricolor bar */}
        <div style={{ height: '5px', width: '100%', display: 'flex', marginBottom: '15px' }}>
          <div style={{ flex: 1, backgroundColor: 'var(--saffron)' }}></div>
          <div style={{ flex: 1, backgroundColor: '#ffffff' }}></div>
          <div style={{ flex: 1, backgroundColor: 'var(--green)' }}></div>
        </div>

        <div className="certificate-header">
          <h2 style={{ fontFamily: 'Georgia, serif', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
            Government of India
          </h2>
          <p style={{ letterSpacing: '2px', color: 'var(--secondary-blue)', fontSize: '13px' }}>
            State Department of Panchayati Raj
          </p>
          <p style={{ color: 'var(--green)', fontSize: '14px', marginTop: '4px', fontWeight: 'bold' }}>
            GRAM PANCHAYAT OFFICE: {citizen.village?.toUpperCase()} (WARD {citizen.wardNumber || '00'})
          </p>
        </div>

        <div className="certificate-title">
          {isBirth ? 'Certificate of Birth' : 'Certificate of Death'}
        </div>

        <div style={{ textAlign: 'center', fontSize: '11px', fontStyle: 'italic', marginBottom: '30px', color: '#4b5563' }}>
          (Issued under Section 12/17 of the Registration of Births and Deaths Act, 1969)
        </div>

        <div className="certificate-body">
          {isBirth ? (
            <p>
              This is to certify that the following information has been taken from the original record of birth
              which is in the register for <span>Gram Panchayat {citizen.village || '[Village]'}</span> of Ward No.{' '}
              <span>{citizen.wardNumber || '00'}</span>.<br /><br />
              Name of the Child: <span>{record.childName}</span><br />
              Gender: <span>{record.gender}</span><br />
              Date of Birth: <span>{formatDate(record.dateOfBirth)}</span><br />
              Place of Birth: <span>{record.placeOfBirth}</span><br />
              Name of Father: <span>{record.fatherName}</span><br />
              Name of Mother: <span>{record.motherName}</span><br />
              Registration Date: <span>{formatDate(record.createdAt)}</span>
            </p>
          ) : (
            <p>
              This is to certify that the following information has been taken from the original record of death
              which is in the register for <span>Gram Panchayat {citizen.village || '[Village]'}</span> of Ward No.{' '}
              <span>{citizen.wardNumber || '00'}</span>.<br /><br />
              Name of the Deceased: <span>{record.deceasedName}</span><br />
              Gender: <span>{record.gender}</span><br />
              Date of Death: <span>{formatDate(record.dateOfDeath)}</span><br />
              Age at Death: <span>{record.ageAtDeath} Years</span><br />
              Place of Death: <span>{record.placeOfDeath}</span><br />
              Father's or Spouse's Name: <span>{record.fatherOrSpouseName}</span><br />
              Registration Date: <span>{formatDate(record.createdAt)}</span>
            </p>
          )}
        </div>

        <div className="certificate-footer">
          {/* Mock QR Verification Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '2px solid #111827',
              padding: '4px',
              backgroundColor: '#ffffff',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '2px'
            }}>
              {/* Fake QR pattern lines */}
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} style={{
                  backgroundColor: (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 4 || i === 20 || i === 24) ? '#111827' : '#ffffff'
                }}></div>
              ))}
            </div>
            <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--light-text)' }}>
              Scan to Verify
            </span>
          </div>

          <div className="certificate-seal">
            <div style={{ border: '1px solid var(--green)', borderRadius: '50%', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
              <span>GRAM PANCHAYAT</span>
              <span style={{ color: 'var(--saffron)' }}>★</span>
              <span>OFFICIAL SEAL</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
              {record.certificateId}
            </span>
            <div className="certificate-signature" style={{ fontSize: '12px', fontWeight: 'bold' }}>
              Panchayat Registrar (ग्राम सचिव)
              <br />
              <span style={{ fontSize: '10px', color: 'var(--light-text)', fontWeight: 'normal' }}>
                Digitally Verified & Signed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded print stylesheets inside this specific component */}
      <style>{`
        @media print {
          /* Hide everything except print-area classes */
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            border: 10px double #003366 !important;
            padding: 30px !important;
            margin: 0 !important;
            box-shadow: none !important;
            background-color: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateGenerator;
