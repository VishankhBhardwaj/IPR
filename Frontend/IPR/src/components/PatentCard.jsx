import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, FileText, Trash2, Globe } from 'lucide-react';
import Button from './Button';
import './PatentCard.css';

const PatentCard = ({ patent, onDelete }) => {
  const inventorSummary = patent.inventors?.length
    ? patent.inventors.map((inventor) => inventor.name).join(', ')
    : patent.inventorName;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'badge-success';
      case 'filed': return 'badge-warning';
      case 'rejected': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="patent-card clean-panel animate-fade-in">
      <div className="patent-header">
        <h3 className="patent-title">
          <Link to={`/patent/${patent.id}`}>{patent.patentTitle}</Link>
        </h3>
        <span className={`badge ${getStatusColor(patent.status)}`}>
          {patent.status || 'Unknown'}
        </span>
      </div>
      
      <div className="patent-body">
        <div className="info-row">
          <FileText size={16} className="info-icon" />
          <span><strong>App No:</strong> {patent.applicationNo}</span>
        </div>
        <div className="info-row">
          <User size={16} className="info-icon" />
          <span><strong>Inventors:</strong> {inventorSummary || 'N/A'}</span>
        </div>
        {patent.inventors?.length > 0 && (
          <div className="inventor-chip-row">
            {patent.inventors.slice(0, 3).map((inventor) => (
              <span className="inventor-chip" key={inventor.id || inventor.name}>
                {inventor.designation?.replaceAll('_', ' ')}
              </span>
            ))}
            {patent.inventors.length > 3 && (
              <span className="inventor-chip">+{patent.inventors.length - 3}</span>
            )}
          </div>
        )}
        <div className="info-row">
          <Calendar size={16} className="info-icon" />
          <span><strong>Filed:</strong> {formatDate(patent.filedDate)}</span>
        </div>
        <div className="info-row">
          <Globe size={16} className="info-icon" />
          <span><strong>Country:</strong> {patent.country || 'N/A'}</span>
        </div>
      </div>

      <div className="patent-footer">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to={`/patent/${patent.id}`} className="weblink" style={{ color: 'var(--accent-primary)' }}>
            View Details
          </Link>
          <span style={{ color: 'var(--border-color)', fontSize: '0.875rem' }}>|</span>
          {patent.weblink ? (
            <a href={patent.weblink} target="_blank" rel="noreferrer" className="weblink">
              View Source
            </a>
          ) : (
            <span className="no-link">No source</span>
          )}
        </div>
        
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => onDelete(patent.id)}
          title="Delete Patent"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default PatentCard;
