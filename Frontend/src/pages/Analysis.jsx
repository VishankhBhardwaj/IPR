import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Filter, RefreshCw, TableProperties } from "lucide-react";
import { getPatentAnalysis } from "../api/patentApi";
import Button from "../components/Button";
import "./Analysis.css";
import Chart from "./Chart";
import { Download } from "lucide-react";
import { downloadAnalysisPDF } from "../utils/downloadPdf";
const emptyFilters = {
  applicantName: "",
  year: "",
  status: "",
  patentType: "",
  country: "",
};

const columnLabels = {
  granted: "Granted",
  published: "Published",
  design: "Design",
  utility: "Utility",
  grandTotal: "Grand Total",
};

const getRowKey = (table) => {
  if (!table) return "year";
  if (
    table.rows?.some((row) => row.country !== undefined) ||
    table.grandTotal?.country !== undefined
  ) {
    return "country";
  }
  return "year";
};

const formatCell = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  return value;
};

const PivotTable = ({ table }) => {
  if (!table) return null;

  const rowKey = getRowKey(table);
  const rowHeader = rowKey === "country" ? "Country" : "Year";
  const rows = [...(table.rows || []), table.grandTotal].filter(Boolean);

  return (
    <section className="analysis-table-panel clean-panel">
      <div className="analysis-table-header">
        <div>
          <h2>{table.title}</h2>
          {table.filters && (
            <p>
              {Object.entries(table.filters)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" | ")}
            </p>
          )}
        </div>
        <TableProperties size={22} />
      </div>

      <div className="analysis-table-scroll">
        <table className="analysis-table">
          <thead>
            <tr>
              <th>{rowHeader}</th>
              {(table.columns || []).map((column) => (
                <th key={column}>{columnLabels[column] || column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isGrandTotal = row[rowKey] === "Grand Total";

              return (
                <tr
                  key={`${table.title}-${row[rowKey]}`}
                  className={isGrandTotal ? "grand-total-row" : ""}
                >
                  <td>{row[rowKey]}</td>
                  {(table.columns || []).map((column) => (
                    <td key={column}>{formatCell(row[column])}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const Analysis = () => {
  const [filters, setFilters] = useState(emptyFilters);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const metricCards = useMemo(() => {
    const currentTables = analysis?.tables || {};
    const publishedGranted = currentTables.publishedGrantedByYear?.grandTotal;
    const utilityDesign = currentTables.utilityDesignByYear?.grandTotal;
    const utilityCountry = currentTables.utilityStatusByCountry?.grandTotal;

    return [
      {
        label: "Total Patents",
        value: analysis?.totalPatents ?? 0,
        detail: "Records matching filters",
      },
      {
        label: "Granted",
        value: publishedGranted?.granted ?? 0,
        detail: "Across all patent types",
      },
      {
        label: "Published",
        value: publishedGranted?.published ?? 0,
        detail: "Across all patent types",
      },
      {
        label: "Utility Patents",
        value: utilityDesign?.utility ?? utilityCountry?.grandTotal ?? 0,
        detail: "Used in country-wise analysis",
      },
    ];
  }, [analysis]);

  const fetchAnalysis = useCallback(async (nextFilters = emptyFilters) => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(nextFilters).filter(
          ([, value]) => String(value || "").trim() !== "",
        ),
      );
      const response = await getPatentAnalysis(params);

      if (response.success) {
        setAnalysis(response.data);
        setError(null);
      } else {
        setAnalysis(null);
        setError(response.message || "Unable to load analysis.");
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/auth';
      } else {
        setError('Failed to load analysis data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis(emptyFilters);
  }, [fetchAnalysis]);

  const tables = analysis?.tables || {};

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchAnalysis(filters);
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    fetchAnalysis(emptyFilters);
  };

  return (
    <div className="analysis-page container animate-fade-in">
      <div className="download-container">
        <button
          className="download-btn"
          onClick={() => downloadAnalysisPDF(tables)}
        >
          <Download size={18} />
          Download PDF
        </button>
      </div>
      <div className="analysis-header" style={{ marginTop: "50px" }}>
        <div>
          <h1>Analysis</h1>
          <p className="subtitle">
            Year-wise, type-wise, and country-wise patent summaries.
          </p>
        </div>
        <BarChart3 size={34} />
      </div>
      {/* 
      <form className="analysis-filters clean-panel" onSubmit={handleSubmit}>
        <div className="filter-group">
          <label htmlFor="applicantName">Applicant</label>
          <input
            id="applicantName"
            name="applicantName"
            type="text"
            placeholder="All applicants"
            value={filters.applicantName}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="year">Year</label>
          <input
            id="year"
            name="year"
            type="number"
            placeholder="All years"
            value={filters.year}
            onChange={handleChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={filters.status} onChange={handleChange}>
            <option value="">All</option>
            <option value="GRANTED">Granted</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="patentType">Type</label>
          <select id="patentType" name="patentType" value={filters.patentType} onChange={handleChange}>
            <option value="">All</option>
            <option value="UTILITY">Utility</option>
            <option value="DESIGN">Design</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="country">Country</label>
          <input
            id="country"
            name="country"
            type="text"
            placeholder="All countries"
            value={filters.country}
            onChange={handleChange}
          />
        </div>

        <div className="analysis-filter-actions">
          <Button type="submit" variant="primary" isLoading={loading}>
            <Filter size={16} />
            Apply
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
            <RefreshCw size={16} />
            Reset
          </Button>
        </div>
      </form> */}

      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading analysis...</p>
        </div>
      ) : error ? (
        <div className="error-state clean-panel">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="analysis-metrics">
            {metricCards.map((metric) => (
              <section
                className="analysis-metric clean-panel"
                key={metric.label}
              >
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </section>
            ))}
          </div>

          <div className="analysis-grid">
            <PivotTable table={tables.publishedGrantedByYear} />
            <PivotTable table={tables.utilityStatusByYear} />
            <PivotTable table={tables.utilityDesignByYear} />
            <PivotTable table={tables.utilityStatusByCountry} />
          </div>
        </>
      )}
      <Chart tables={tables} />
    </div>
  );
};

export default Analysis;
