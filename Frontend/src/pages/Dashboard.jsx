import { useState, useEffect, useMemo } from 'react';
import { getAllPatents, deletePatent } from '../api/patentApi';
import PatentCard from '../components/PatentCard';
import Button from '../components/Button';
import { downloadPatentsPDF } from '../utils/downloadPdf';
import './Dashboard.css';

// Fuzzy matching helpers
const levenshteinDistance = (s1, s2) => {
  const m = s1.length, n = s2.length;
  if (!m) return n;
  if (!n) return m;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      if (s1[i - 1] === s2[j - 1]) d[i][j] = d[i - 1][j - 1];
      else d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1);
    }
  }
  return d[m][n];
};

const fuzzyMatchWord = (searchWord, targetWord) => {
  // Exact match or search word is a substring of the target word
  if (targetWord.includes(searchWord)) return true;
  
  // Do not allow fuzzy match for very short search words to prevent false positives
  if (searchWord.length <= 2) return false;

  // Allow 1 typo for words up to 4 chars, 2 typos for longer words
  const maxTypos = Math.max(1, Math.floor(searchWord.length / 4));
  return levenshteinDistance(searchWord, targetWord) <= maxTypos;
};

const fuzzyMatchName = (searchQuery, targetName) => {
  if (!targetName) return false;
  const searchWords = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  const targetWords = targetName.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  
  if (searchWords.length === 0) return true;
  if (targetWords.length === 0) return false;
  
  // Every search word should match at least one target word
  return searchWords.every(sWord => 
    targetWords.some(tWord => fuzzyMatchWord(sWord, tWord))
  );
};

const Dashboard = () => {
  // Stores the complete, unfiltered dataset fetched once from the API
  const [allPatents, setAllPatents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    applicationNo: '',
    status: '',
    patentType: '',
    inventorName: '',
    department: ''
  });

  // Fetch all patents once on mount — no re-fetching on filter changes
  useEffect(() => {
    let isMounted = true;

    const fetchPatents = async () => {
      try {
        const response = await getAllPatents();

        if (!isMounted) return;

        // Assume the response structure is { success: true, data: [...] }
        if (response.success) {
          setAllPatents(response.data);
        } else {
          setAllPatents(response); // Fallback in case the array is returned directly
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching patents:', err);
        if (isMounted) {
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/auth';
          } else {
            setError('Failed to load patents. Please check if the backend server is running.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPatents();

    return () => {
      isMounted = false;
    };
  }, []);

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
          .toUpperCase()
          .includes(filters.applicationNo.toUpperCase())
      ) {
        return false;
      }
      if (filters.status && patent.status !== filters.status) {
        return false;
      }
      if (filters.patentType && patent.patentType !== filters.patentType) {
        return false;
      }
      if (filters.inventorName) {
        const searchName = filters.inventorName;
        const mainInventorMatch = fuzzyMatchName(searchName, patent.inventorName);
        const subInventorsMatch = patent.inventors?.some(inv => fuzzyMatchName(searchName, inv.name));
        if (!mainInventorMatch && !subInventorsMatch) return false;
      }
      if (filters.department) {
        const searchDept = filters.department.toLowerCase();
        const mainDeptMatch = (patent.department || '').toLowerCase().includes(searchDept);
        const subDeptMatch = patent.inventors?.some(inv => 
          inv.departments?.some(d => (d || '').toLowerCase().includes(searchDept))
        );
        if (!mainDeptMatch && !subDeptMatch) return false;
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

  const handleDownloadPdf = () => {
    downloadPatentsPDF(filteredPatents);
  };

  return (
    <div className="dashboard container" style={{marginTop: '50px'}}>
      <div className="dashboard-header">
        <h1>IPR MAIT Patent Registry</h1>
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
          <div className="filter-group">
            <label>Inventor Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={filters.inventorName}
              onChange={(e) => setFilters({ ...filters, inventorName: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All</option>
              <option value="CSE">Computer Science and Engineering (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics and Communication (ECE)</option>
              <option value="MAE">Mechanical and Automation (MAE)</option>
              <option value="EEE">Electrical and Electronics (EEE)</option>
              <option value="CST">Computer Science and Technology (CST)</option>
              <option value="ITE">Information Technology and Engineering (ITE)</option>
              <option value="AI&ML">AI and Machine Learning (AI&ML)</option>
              <option value="AI&DS">AI and Data Science (AI&DS)</option>
              <option value="Applied Sciences">Applied Sciences</option>
            </select>
          </div>
          <div className="filter-actions">
            <Button
              type="button"
              onClick={handleDownloadPdf}
              disabled={loading || filteredPatents.length === 0}
            >
              Download PDF
            </Button>
            {/* Clear button resets all filter state; useMemo re-derives the full list automatically */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilters({ year: '', applicationNo: '', status: '', patentType: '', inventorName: '', department: '' });
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
