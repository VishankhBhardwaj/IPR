import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { addPatent, getPatentById, updatePatent } from '../api/patentApi';
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
  { value: 'Applied Sciences', label: 'Applied Sciences' },
];

const emptyInventor = {
  name: '',
  designation: 'STUDENT',
  departments: '',
};

const initialFormState = {
  applicationNo: '',
  status: 'PUBLISHED',
  inventors: [{ ...emptyInventor }],
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
  const { id } = useParams();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isEditMode = Boolean(id);

  React.useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getPatentById(id)
        .then((res) => {
          if (res.success && res.data) {
            const patent = res.data;
            
            let parsedInventors = [{ ...emptyInventor }];
            if (patent.inventors?.length) {
              parsedInventors = patent.inventors.map(inv => ({
                ...inv,
                departments: inv.departments?.join(', ') || ''
              }));
            } else if (patent.inventorName) {
              const names = patent.inventorName.split(',').map(n => n.trim()).filter(n => n);
              if (names.length > 0) {
                parsedInventors = names.map(name => ({
                  ...emptyInventor,
                  name: name
                }));
              }
            }

            setFormData({
              ...patent,
              filedDate: patent.filedDate ? patent.filedDate.substring(0, 10) : '',
              publicationDate: patent.publicationDate ? patent.publicationDate.substring(0, 10) : '',
              inventors: parsedInventors
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching patent:", err);
          setError("Failed to load patent data.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleInventorChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      inventors: prev.inventors.map((inventor, currentIndex) => (
        currentIndex === index ? { ...inventor, [field]: value } : inventor
      )),
    }));
  };

  const addInventorRow = () => {
    setFormData((prev) => ({
      ...prev,
      inventors: [...prev.inventors, { ...emptyInventor }],
    }));
  };

  const removeInventorRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      inventors: prev.inventors.length === 1
        ? prev.inventors
        : prev.inventors.filter((_, currentIndex) => currentIndex !== index),
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
        inventors: formData.inventors.map((inventor) => ({
          name: inventor.name.trim(),
          designation: inventor.designation,
          departments: inventor.departments
            .split(',')
            .map((department) => department.trim())
            .filter(Boolean),
        })),
      };

      let res;
      if (isEditMode) {
        res = await updatePatent(id, dataToSubmit);
      } else {
        res = await addPatent(dataToSubmit);
      }
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
        <h2>{isEditMode ? 'Edit Patent' : 'Register New Patent'}</h2>
        <p>{isEditMode ? 'Update the details of the intellectual property.' : 'Enter the details of the new intellectual property.'}</p>
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
            <label htmlFor="publicationNo">Publication/Grant Number</label>
            <input
              type="text"
              id="publicationNo"
              name="publicationNo"
              value={formData.publicationNo}
              onChange={handleChange}
              placeholder="PUB2026..."
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

          <section className="inventors-section">
            <div className="inventors-section-header">
              <div>
                <h3>Inventors</h3>
                <p>Add each inventor separately with designation and departments.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addInventorRow}>
                <Plus size={16} />
                Add
              </Button>
            </div>

            <div className="inventor-list">
              {formData.inventors.map((inventor, index) => (
                <div className="inventor-entry" key={`inventor-${index}`}>
                  <div className="inventor-entry-title">
                    <span>Inventor {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeInventorRow(index)}
                      disabled={formData.inventors.length === 1}
                      aria-label={`Remove inventor ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="inventor-fields">
                    <div className="form-group">
                      <label htmlFor={`inventor-name-${index}`}>Name *</label>
                      <input
                        id={`inventor-name-${index}`}
                        type="text"
                        value={inventor.name}
                        onChange={(e) => handleInventorChange(index, 'name', e.target.value)}
                        required
                        placeholder="Inventor full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`inventor-designation-${index}`}>Designation *</label>
                      <select
                        id={`inventor-designation-${index}`}
                        value={inventor.designation}
                        onChange={(e) => handleInventorChange(index, 'designation', e.target.value)}
                        required
                      >
                        <option value="STUDENT">Student</option>
                        <option value="ASSISTANT_PROFESSOR">Assistant Professor</option>
                        <option value="ASSOCIATE_PROFESSOR">Associate Professor</option>
                        <option value="PROFESSOR">Professor</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor={`inventor-departments-${index}`}>Departments *</label>
                      <input
                        id={`inventor-departments-${index}`}
                        type="text"
                        value={inventor.departments}
                        onChange={(e) => handleInventorChange(index, 'departments', e.target.value)}
                        required
                        placeholder="CSE, IT, ECE"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Row 3 */}
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required>
              <option value="APPLIED">Applied</option>
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
            <label htmlFor="publicationDate">Publication Date</label>
            <input
              type="date"
              id="publicationDate"
              name="publicationDate"
              value={formData.publicationDate}
              onChange={handleChange}
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
            {isEditMode ? 'Update Patent' : 'Register Patent'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPatentForm;
