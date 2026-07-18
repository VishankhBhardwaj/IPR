import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPatent } from '../api/patentApi';
import Button from '../components/Button';
import './AddPatentForm.css';
import { Building, ChevronDown } from 'lucide-react';

const DEPARTMENTS = [
  { value: '', label: 'Select Department', disabled: true },
  { value: 'CSE', label: 'Computer Science and Engineering (CSE)' },
  { value: 'IT', label: 'Information Technology (IT)' },
  { value: 'ECE', label: 'Electronics and Communication (ECE)' },
  { value: 'MAE', label: 'Mechanical and Automation (MAE)' },
  { value: 'EEE', label: 'Electrical and Electronics (EEE)' },
  { value: 'CST', label: 'Computer Science and Technology (CST)' },
  { value: 'ITE', label: 'Information Technology and Engineering (ITE)' },
  { value: 'AI&ML', label: 'AI and Machine Learning (AI&ML)' },
  { value: 'AI&DS', label: 'AI and Data Science (AI&DS)' },
];

const initialFormState = {
  applicationNo: '',
  status: 'PUBLISHED',
  inventorName: '',
  patentTitle: '',
  applicantName: '',
  filedDate: '',
  publicationDate: '',
  publicationNo: '',
  institueAffiliation: '',
  driveLink: '',
  year: new Date().getFullYear(),
  patentType: 'UTILITY',
  patentSession: '',
  weblink: '',
  country: 'India',
  department: '',
  userId: 1 // Defaulting to 1 as per assumption since there is no auth
};

const AddPatentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format dates properly
      const dataToSubmit = {
        ...formData,
        filedDate: formData.filedDate ? new Date(formData.filedDate).toISOString() : null,
        publicationDate: formData.publicationDate ? new Date(formData.publicationDate).toISOString() : null,
      };

      const res = await addPatent(dataToSubmit);
      if (res) {
        navigate('/');
      }
    } catch (err) {
      console.error('Error adding patent:', err);
      setError(err.response?.data?.message || 'Failed to add patent. Please check the inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-patent-container container">
      <div className="form-header">
        <h2>Register New Patent</h2>
        <p>Enter the details of the new intellectual property.</p>
      </div>

      <form className="patent-form clean-panel animate-fade-in" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          {/* Row 1 */}
          <div className="form-group">
            <label htmlFor="patentTitle">Patent Title *</label>
            <input
              type="text"
              id="patentTitle"
              name="patentTitle"
              value={formData.patentTitle}
              onChange={handleChange}
              required
              placeholder="E.g. AI Based System..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="applicationNo">Application Number *</label>
            <input
              type="text"
              id="applicationNo"
              name="applicationNo"
              value={formData.applicationNo}
              onChange={handleChange}
              required
              placeholder="IN2026..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="publicationNo">Publication/Grant Number *</label>
            <input
              type="text"
              id="publicationNo"
              name="publicationNo"
              value={formData.publicationNo}
              onChange={handleChange}
              required
              placeholder="PUB2026..."
            />
          </div>

          {/* Row 2 */}
          <div className="form-group">
            <label htmlFor="inventorName">Inventor Name *</label>
            <input
              type="text"
              id="inventorName"
              name="inventorName"
              value={formData.inventorName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="applicantName">Applicant Name *</label>
            <input
              type="text"
              id="applicantName"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required>
              <option value="PUBLISHED">Published</option>
              <option value="GRANTED">Granted</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="patentType">Patent Type *</label>
            <select id="patentType" name="patentType" value={formData.patentType} onChange={handleChange} required>
              <option value="UTILITY">Utility</option>
              <option value="DESIGN">Design</option>
            </select>
          </div>

          {/* Row 4 */}
          <div className="form-group">
            <label htmlFor="filedDate">Filed Date *</label>
            <input
              type="date"
              id="filedDate"
              name="filedDate"
              value={formData.filedDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="publicationDate">Publication Date *</label>
            <input
              type="date"
              id="publicationDate"
              name="publicationDate"
              value={formData.publicationDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Row 5 */}
          <div className="form-group">
            <label htmlFor="institueAffiliation">Institute Affiliation *</label>
            <input
              type="text"
              id="institueAffiliation"
              name="institueAffiliation"
              value={formData.institueAffiliation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>

          {/* Row 6 */}
          <div className="form-group">
            <label htmlFor="weblink">Web Link *</label>
            <input
              type="url"
              id="weblink"
              name="weblink"
              value={formData.weblink}
              onChange={handleChange}
              required
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="driveLink">Drive Link *</label>
            <input
              type="url"
              id="driveLink"
              name="driveLink"
              value={formData.driveLink}
              onChange={handleChange}
              required
              placeholder="https://drive.google.com/..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="year">Year *</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="patentSession">Session *</label>
            <input
              type="text"
              id="patentSession"
              name="patentSession"
              value={formData.patentSession}
              onChange={handleChange}
              required
              placeholder="e.g. 2025-26"
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select id="department" name="department" value={formData.department} onChange={handleChange}>
              <option value="">Select Department</option>
              {DEPARTMENTS.slice(1).map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Register Patent
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPatentForm;
