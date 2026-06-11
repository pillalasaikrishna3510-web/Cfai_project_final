import React from "react";

function NodeInspector({ cellData }) {
  if (!cellData) {
    return (
      <div className="card node-inspector" style={{ minHeight: "160px" }}>
        <h3 style={{ marginTop: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
          🔍 Node Inspector
        </h3>
        <p style={{ color: "#858b9c", fontSize: "0.95rem", textAlign: "center", margin: "20px 0" }}>
          Hover over any grid cell to inspect its traversal metrics (g, h, f scores, type, and parent).
        </p>
      </div>
    );
  }

  const { r, c, type, weight, isVisited, visitedData } = cellData;

  const getTypeIcon = (type) => {
    switch (type) {
      case "Start": return "🎯";
      case "Goal": return "🏁";
      case "Wall": return "🧱";
      case "Obstacle": return "👾";
      case "Path": return "🟢";
      case "Visited": return "🟡";
      default: return "🟦";
    }
  };

  return (
    <div className="card node-inspector" style={{ minHeight: "160px" }}>
      <h3 style={{ marginTop: 0, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "15px" }}>
        🔍 Node Inspector: ({r}, {c})
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <div>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "#858b9c", fontSize: "0.85rem", textTransform: "uppercase" }}>Cell Type</span>
            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-bright)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{getTypeIcon(type)}</span> {type}
            </div>
          </div>
          <div>
            <span style={{ color: "#858b9c", fontSize: "0.85rem", textTransform: "uppercase" }}>Movement Cost</span>
            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: weight > 1 ? "#ff9f43" : "var(--text-bright)" }}>
              {weight === 1 ? "1 (Normal)" : weight === 5 ? "5 (Mud/Water)" : "10 (Heavy Mud)"}
            </div>
          </div>
        </div>

        <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.08)", paddingLeft: "15px" }}>
          <span style={{ color: "#858b9c", fontSize: "0.85rem", textTransform: "uppercase" }}>Traversal State</span>
          <div style={{ fontSize: "1.05rem", fontWeight: "bold", color: isVisited ? "var(--color-primary)" : "#858b9c", marginBottom: "8px" }}>
            {isVisited ? "⭐ Explored / Expanded" : "⚪ Unexplored"}
          </div>

          {isVisited && visitedData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.9rem", fontFamily: "JetBrains Mono, monospace" }}>
              {visitedData.g !== undefined && (
                <div>
                  <span style={{ color: "#858b9c" }}>g(n) [Cost]:</span>{" "}
                  <strong style={{ color: "var(--path-color)" }}>{visitedData.g}</strong>
                </div>
              )}
              {visitedData.h !== undefined && (
                <div>
                  <span style={{ color: "#858b9c" }}>h(n) [Heuristic]:</span>{" "}
                  <strong style={{ color: "var(--goal-color)" }}>{visitedData.h}</strong>
                </div>
              )}
              {visitedData.f !== undefined && (
                <div>
                  <span style={{ color: "#858b9c" }}>f(n) [Total]:</span>{" "}
                  <strong style={{ color: "var(--color-secondary)" }}>{visitedData.f}</strong>
                </div>
              )}
              {visitedData.parent && (
                <div>
                  <span style={{ color: "#858b9c" }}>Parent:</span>{" "}
                  <strong style={{ color: "#fff" }}>
                    ({visitedData.parent[0]}, {visitedData.parent[1]})
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NodeInspector;
