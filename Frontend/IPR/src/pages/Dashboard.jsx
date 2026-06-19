import React, { useState, useEffect } from 'react';
import { getAllPatents, deletePatent } from '../api/patentApi';
import PatentCard from '../components/PatentCard';
import Button from '../components/Button';
import './Dashboard.css';

const Dashboard = () => {
  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    applicationNo: '',
    status: '',
    patentType: ''
  });

  useEffect(() => {
    fetchPatents();
  }, []);

  const fetchPatents = async (currentFilters = filters) => {
    try {
      setLoading(true);
      // Clean up empty filters
      const activeFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '')
      );
      
      const response = await getAllPatents(activeFilters);
      // Assume the response structure is { success: true, data: [...] }
      if (response.success) {
        setPatents(response.data);
      } else {
        setPatents(response); // Fallback in case the array is returned directly
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching patents:', err);
      setError('Failed to load patents. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patent?')) {
      try {
        await deletePatent(id);
        // Optimistically update the UI
        setPatents(patents.filter(p => p.id !== id));
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

      <div className="filters-section clean-panel">
        <form 
          className="filters-form" 
          onSubmit={(e) => {
            e.preventDefault();
            fetchPatents(filters);
          }}
        >
          <div className="filter-group">
            <label>Application No.</label>
            <input 
              type="text" 
              placeholder="e.g. 202141059"
              value={filters.applicationNo}
              onChange={(e) => setFilters({...filters, applicationNo: e.target.value})}
            />
          </div>
          <div className="filter-group">
            <label>Year</label>
            <input 
              type="number" 
              placeholder="e.g. 2024"
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
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
              onChange={(e) => setFilters({...filters, patentType: e.target.value})}
            >
              <option value="">All</option>
              <option value="UTILITY">Utility</option>
              <option value="DESIGN">Design</option>
            </select>
          </div>
          <div className="filter-actions">
            <Button type="submit" variant="primary">Apply Filters</Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                const resetFilters = { year: '', applicationNo: '', status: '', patentType: '' };
                setFilters(resetFilters);
                fetchPatents(resetFilters);
              }}
            >
              Clear
            </Button>
          </div>
        </form>
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
      ) : patents.length === 0 ? (
        <div className="empty-state clean-panel">
          <div className="empty-icon">📄</div>
          <h2>No Patents Found</h2>
          <p>There are no patents registered in the system yet.</p>
        </div>
      ) : (
        <div className="patents-grid">
          {patents.map((patent) => (
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
