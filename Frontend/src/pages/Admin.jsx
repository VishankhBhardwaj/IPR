import React, { useState, useEffect, useMemo } from 'react';
import { getAllPatents } from '../api/patentApi';
import { ShieldCheck, Search, FileSpreadsheet } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatents();
  }, []);

  const fetchPatents = async () => {
    try {
      setLoading(true);
      const response = await getAllPatents();
      if (response.success) {
        setPatents(response.data);
      } else {
        setPatents(response);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching patents for Admin view:', err);
      setError('Failed to load patent registry. Please verify the server connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const filteredPatents = useMemo(() => {
    if (!searchTerm.trim()) return patents;
    const term = searchTerm.toLowerCase();
    return patents.filter((p) => 
      (p.patentTitle || '').toLowerCase().includes(term) ||
      (p.applicationNo || '').toLowerCase().includes(term)
    );
  }, [patents, searchTerm]);

  return (
    <div className="admin-page container animate-fade-in" style={{ marginTop: '50px' }}>
      <div className="admin-header">
        <div className="admin-title-area">
          <ShieldCheck className="admin-logo-icon" size={32} />
          <div>
            <h1>Admin Control Panel</h1>
            <p className="subtitle">Official patent registry overview and administrative records.</p>
          </div>
        </div>
      </div>

      <div className="admin-search-bar clean-panel">
        <div className="search-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search patents by title or application number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <div className="admin-summary-badge">
          <FileSpreadsheet size={16} />
          <span>Total Records: {filteredPatents.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading administration logs...</p>
        </div>
      ) : error ? (
        <div className="error-state clean-panel">
          <p>{error}</p>
        </div>
      ) : filteredPatents.length === 0 ? (
        <div className="empty-state clean-panel">
          <h2>No Administrative Records Found</h2>
          <p>
            {patents.length === 0
              ? 'No patents are registered in the portal database.'
              : 'No results matched your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="admin-table-container clean-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>SN</th>
                <th>Patent Title</th>
                <th style={{ width: '180px' }}>Filed Date</th>
                <th style={{ width: '180px' }}>Granted Date</th>
                <th style={{ width: '180px' }}>Published Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatents.map((patent, index) => {
                const isGranted = patent.status?.toUpperCase() === 'GRANTED';
                const isPublished = patent.status?.toUpperCase() === 'PUBLISHED';

                return (
                  <tr key={patent.id || patent.applicationNo}>
                    <td className="sn-col">{index + 1}</td>
                    <td className="title-col">
                      <div className="patent-row-title">{patent.patentTitle || 'Untitled Patent'}</div>
                      <div className="patent-row-meta">
                        App No: {patent.applicationNo || 'N/A'} | Type: {patent.patentType || 'N/A'}
                      </div>
                    </td>
                    <td className="date-col">
                      {patent.filedDate ? (
                        <span className="badge badge-warning date-badge">
                          {formatDate(patent.filedDate)}
                        </span>
                      ) : (
                        <span className="no-date">—</span>
                      )}
                    </td>
                    <td className="date-col">
                      {isGranted ? (
                        <span className="badge badge-success date-badge">
                          {formatDate(patent.publicationDate)}
                        </span>
                      ) : (
                        <span className="no-date">—</span>
                      )}
                    </td>
                    <td className="date-col">
                      {isPublished ? (
                        <span className="badge badge-primary date-badge">
                          {formatDate(patent.publicationDate)}
                        </span>
                      ) : (
                        <span className="no-date">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
