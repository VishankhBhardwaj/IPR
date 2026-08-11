
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "./Chart.css";

const COLORS = ["#c74c85", "#16a34a", "#f59e0b", "#ef4444"];

const Chart = ({ tables }) => {
  if (!tables) return null;

  const publishedGrantedData =
    tables.publishedGrantedByYear?.rows?.map((row) => ({
      year: row.year,
      Published: row.published,
      Granted: row.granted,
    })) || [];

  const utilityDesignData =
    tables.utilityDesignByYear?.rows?.map((row) => ({
      year: row.year,
      Utility: row.utility,
      Design: row.design,
    })) || [];

  const countryData =
    tables.utilityStatusByCountry?.rows?.map((row) => ({
      country: row.country,
      Granted: row.granted,
      Published: row.published,
    })) || [];

  const pieData = [
    {
      name: "Granted",
      value: tables.publishedGrantedByYear?.grandTotal?.granted || 0,
    },
    {
      name: "Published",
      value: tables.publishedGrantedByYear?.grandTotal?.published || 0,
    },
  ];

  return (
    <div className="chart-grid">

      {/* Published vs Granted */}
      <div className="chart-card">
        <h2>Published vs Granted</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={publishedGrantedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="Published" radius={[5,5,0,0]} fill="#00a0fc"/>
            <Bar dataKey="Granted" radius={[5,5,0,0]} fill="#fc009b"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Utility vs Design */}
      <div className="chart-card">
        <h2>Utility vs Design</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={utilityDesignData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="Utility" radius={[5,5,0,0]} fill="#00a0fc"/>
            <Bar dataKey="Design" radius={[5,5,0,0]} fill="#fc009b"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Country Wise */}
      <div className="chart-card">
        <h2>Country Wise Patent Status</h2>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={countryData}
            layout="vertical"
            margin={{ left: 40 }}
            
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" />
            <YAxis type="category" dataKey="country" />

            <Tooltip />
            <Legend />

            <Bar dataKey="Granted" radius={[0,5,5,0]}  fill="#00a0fc"/>
            <Bar dataKey="Published" radius={[0,5,5,0]} fill="#fc009b"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="chart-card">
        <h2>Patent Status Distribution</h2>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default Chart;