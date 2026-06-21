import React, { useState, useEffect, useMemo } from 'react';
import { getAllPatents, deletePatent } from '../api/patentApi';
import PatentCard from '../components/PatentCard';
import Button from '../components/Button';
import './Dashboard.css';

const Dashboard = () => {
  // Stores the complete, unfiltered dataset fetched once from the API
  const [allPatents, setAllPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    applicationNo: '',
    status: '',
    patentType: ''
  });

  // Fetch all patents once on mount — no re-fetching on filter changes
  useEffect(() => {
    fetchPatents();
  }, []);

  // Fetches the full patent list from the API (called only once on component mount)
  const fetchPatents = async () => {
    try {
      setLoading(true);
      const response = await getAllPatents();
      // Assume the response structure is { success: true, data: [...] }
      if (response.success) {
        setAllPatents(response.data);
      } else {
        setAllPatents(response); // Fallback in case the array is returned directly
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching patents:', err);
      setError('Failed to load patents. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering using useMemo — replaces the previous approach of making
  // a new API call on every filter change. This eliminates redundant network requests
  // and gives the user instant feedback as they adjust filters.
  const filteredPatents = useMemo(() => {
    return allPatents.filter((patent) => {
      if (filters.year && patent.year !== parseInt(filters.year)) {
        return false;
      }
      if (
        filters.applicationNo &&
        !(patent.applicationNo || '')
          .toLowerCase()
          .includes(filters.applicationNo.toLowerCase())
      ) {
        return false;
      }
      if (filters.status && patent.status !== filters.status) {
        return false;
      }
      if (filters.patentType && patent.patentType !== filters.patentType) {
        return false;
      }
      return true;
    });
  }, [allPatents, filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patent?')) {
      try {
        await deletePatent(id);
        // Optimistically update the UI
        setAllPatents(allPatents.filter(p => p.id !== id));
      } catch (err) {
        console.error('Error deleting patent:', err);
        alert('Failed to delete patent.');
      }
    }
  };

  return (
    <div className="dashboard container">
      <div className="dashboard-header">
        <h1>Patent Registry</h1>
        <p className="subtitle">Manage and track all intellectual property registrations.</p>
      </div>

      {/* Filters now update local state only — no form submission or API call needed.
          Results are computed instantly via the filteredPatents useMemo above. */}
      <div className="filters-section clean-panel">
        <div className="filters-form">
          <div className="filter-group">
            <label>Application No.</label>
            <input
              type="text"
              placeholder="e.g. 202141059"
              value={filters.applicationNo}
              onChange={(e) => setFilters({ ...filters, applicationNo: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Year</label>
            <input
              type="number"
              placeholder="e.g. 2024"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="PUBLISHED">Published</option>
              <option value="GRANTED">Granted</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.patentType}
              onChange={(e) => setFilters({ ...filters, patentType: e.target.value })}
            >
              <option value="">All</option>
              <option value="UTILITY">Utility</option>
              <option value="DESIGN">Design</option>
            </select>
          </div>
          <div className="filter-actions">
            {/* Clear button resets all filter state; useMemo re-derives the full list automatically */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilters({ year: '', applicationNo: '', status: '', patentType: '' });
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        {!loading && !error && (
          <p className="filter-count">
            Showing {filteredPatents.length} of {allPatents.length} patents
          </p>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading patents...</p>
        </div>
      ) : error ? (
        <div className="error-state clean-panel">
          <p>{error}</p>
        </div>
      ) : filteredPatents.length === 0 ? (
        <div className="empty-state clean-panel">
          <div className="empty-icon">📄</div>
          <h2>No Patents Found</h2>
          {/* Distinguish between "no data at all" vs "filters matched nothing" */}
          <p>
            {allPatents.length === 0
              ? 'There are no patents registered in the system yet.'
              : 'No patents match the current filters. Try adjusting your criteria.'}
          </p>
        </div>
      ) : (
        <div className="patents-grid">
          {filteredPatents.map((patent) => (
            <PatentCard
              key={patent.id || patent.applicationNo}
              patent={patent}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
