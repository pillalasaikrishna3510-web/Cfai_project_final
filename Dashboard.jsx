import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ stats, allStats = {} }) {
  // Check if we have multiple stats (from Race Mode or previous runs)
  const hasMultipleStats = Object.keys(allStats).length > 0;

  // Prepare chart data if multiple stats exist
  const chartLabels = hasMultipleStats
    ? Object.keys(allStats).map((k) => k.toUpperCase())
    : [stats.algorithm || "ALGORITHM"];

  const executionTimeData = hasMultipleStats
    ? Object.values(allStats).map((s) => s.executionTime || 0)
    : [stats.executionTime || 0];

  const nodesExploredData = hasMultipleStats
    ? Object.values(allStats).map((s) => s.nodesExplored || 0)
    : [stats.nodesExplored || 0];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Execution Time (ms)",
        data: executionTimeData,
        backgroundColor: "rgba(102, 252, 241, 0.6)",
        borderColor: "rgba(102, 252, 241, 1)",
        borderWidth: 1,
      },
      {
        label: "Nodes Explored",
        data: nodesExploredData,
        backgroundColor: "rgba(247, 183, 49, 0.6)",
        borderColor: "rgba(247, 183, 49, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#c5c6c7",
          font: {
            family: "Outfit",
          },
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#c5c6c7",
          font: {
            family: "JetBrains Mono",
          },
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#c5c6c7",
          font: {
            family: "Outfit",
          },
        },
      },
    },
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
        🏆 Performance Dashboard
      </h3>

      <div className="dashboard-grid">
        <div className="stat-box execution-time">
          <div className="stat-lbl">Execution Time</div>
          <div className="stat-val">
            {(stats.executionTime ?? 0).toFixed(2)}
          </div>
          <div className="stat-lbl">Milliseconds</div>
        </div>

        <div className="stat-box explored-nodes">
          <div className="stat-lbl">Explored Nodes</div>
          <div className="stat-val">{stats.nodesExplored ?? 0}</div>
          <div className="stat-lbl">Cells Popped</div>
        </div>

        <div className="stat-box path-length">
          <div className="stat-lbl">Path Length</div>
          <div className="stat-val">{stats.pathLength ?? 0}</div>
          <div className="stat-lbl">Total Steps</div>
        </div>
      </div>

      <div className="charts-wrapper">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default Dashboard;