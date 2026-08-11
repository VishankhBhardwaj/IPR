import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatentById, deletePatent } from '../api/patentApi';
import { ArrowLeft, Calendar, User, FileText, Globe, Building, ExternalLink, Link2, Clock, Briefcase, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import './PatentDetails.css';

const PatentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patent, setPatent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatent = async () => {
      try {
        setLoading(true);
        const res = await getPatentById(id);
        if (res.success) {
          setPatent(res.data);
        } else {
          setPatent(res);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching patent details:', err);
        setError('Failed to load patent details. Please verify the ID and server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatent();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this patent? This action cannot be undone.")) {
      try {
        setLoading(true);
        const res = await deletePatent(id);
        if (res) {
          navigate('/');
        }
      } catch (err) {
        console.error('Error deleting patent:', err);
        setError('Failed to delete the patent. Please try again later.');
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'badge-success';
      case 'filed': return 'badge-warning';
      case 'rejected': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  const formatDesignation = (designation) => {
    return (designation || '')
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="patent-details-loading container">
        <div className="loader"></div>
        <p>Loading patent details...</p>
      </div>
    );
  }

  if (error || !patent) {
    return (
      <div className="patent-details-error container">
        <div className="clean-panel error-card animate-fade-in">
          <h2>Error</h2>
          <p>{error || 'Patent not found.'}</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="patent-details container animate-fade-in">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="details-card clean-panel">
        <div className="details-card-header">
          <div className="title-section">
            <span className={`badge ${getStatusColor(patent.status)}`}>
              {patent.status || 'Unknown'}
            </span>
            <h1>{patent.patentTitle}</h1>
          </div>
        </div>

        <div className="details-grid">
          {/* Left Column - Key Info */}
          <div className="details-column main-info">
            <h3 className="section-title">Registration Details</h3>
            
            <div className="detail-item">
              <FileText size={18} className="item-icon" />
              <div>
                <span className="item-label">Application Number</span>
                <span className="item-value font-mono">{patent.applicationNo}</span>
              </div>
            </div>

            <div className="detail-item">
              <FileText size={18} className="item-icon" />
              <div>
                <span className="item-label">Publication/Grant Number</span>
                <span className="item-value font-mono">{patent.publicationNo || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item">
              <Building size={18} className="item-icon" />
              <div>
                <span className="item-label">Applicant Name</span>
                <span className="item-value">{patent.applicantName || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item">
              <Building size={18} className="item-icon" />
              <div>
                <span className="item-label">Institute Affiliation</span>
                <span className="item-value">{patent.institueAffiliation || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Secondary Info & Timeline */}
          <div className="details-column timeline-info">
            <h3 className="section-title">Timeline & Metadata</h3>

            <div className="detail-item">
              <Calendar size={18} className="item-icon" />
              <div>
                <span className="item-label">Filing Date</span>
                <span className="item-value">{formatDate(patent.filedDate)}</span>
              </div>
            </div>

            <div className="detail-item">
              <Calendar size={18} className="item-icon" />
              <div>
                <span className="item-label">Publication/Grant Date</span>
                <span className="item-value">{formatDate(patent.publicationDate)}</span>
              </div>
            </div>

            <div className="detail-item">
              <Clock size={18} className="item-icon" />
              <div>
                <span className="item-label">Academic Year / Session</span>
                <span className="item-value">{patent.patentSession || 'N/A'} (Year: {patent.year})</span>
              </div>
            </div>

            <div className="detail-item">
              <Briefcase size={18} className="item-icon" />
              <div>
                <span className="item-label">Patent Type</span>
                <span className="item-value">{patent.patentType}</span>
              </div>
            </div>

            <div className="detail-item">
              <Globe size={18} className="item-icon" />
              <div>
                <span className="item-label">Country</span>
                <span className="item-value">{patent.country || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <section className="inventor-details-section">
          <h3 className="section-title">Inventors</h3>
          {patent.inventors?.length > 0 ? (
            <div className="inventor-details-grid">
              {patent.inventors.map((inventor) => (
                <article className="inventor-detail-card" key={inventor.id || inventor.name}>
                  <div className="inventor-detail-main">
                    <User size={18} className="item-icon" />
                    <div>
                      <h4>{inventor.name}</h4>
                      <span>{formatDesignation(inventor.designation)}</span>
                    </div>
                  </div>
                  <div className="department-chip-list">
                    {(inventor.departments || []).map((department) => (
                      <span className="department-chip" key={department}>{department}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="detail-item">
              <User size={18} className="item-icon" />
              <div>
                <span className="item-label">Inventor(s) Name</span>
                <span className="item-value">{patent.inventorName || 'N/A'}</span>
              </div>
            </div>
          )}
        </section>

        {/* Card Actions / External Links */}
        <div className="details-links">
          {patent.weblink && (
            <a 
              href={patent.weblink} 
              target="_blank" 
              rel="noreferrer" 
              className="action-link-btn primary"
            >
              <ExternalLink size={16} />
              <span>Official Search Source</span>
            </a>
          )}
          {patent.driveLink && (
            <a 
              href={patent.driveLink} 
              target="_blank" 
              rel="noreferrer" 
              className="action-link-btn secondary"
            >
              <Link2 size={16} />
              <span>Google Drive Document</span>
            </a>
          )}
          <Button 
            variant="danger" 
            onClick={handleDelete}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Trash2 size={16} />
            <span>Delete Patent</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatentDetails;
