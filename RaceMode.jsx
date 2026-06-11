import React from "react";

function RaceMode({ raceResults, isSolving }) {
  if (!raceResults || Object.keys(raceResults).length === 0) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>🤖 AI Race Mode</h3>
        <p style={{ color: "#858b9c", fontSize: "0.95rem" }}>
          Enable "AI Race Mode" and click "Run AI Race" to watch all pathfinding algorithms solve the maze simultaneously and compare their performance!
        </p>
      </div>
    );
  }

  // Find the winner (fastest execution time with success)
  let winnerKey = null;
  let minTime = Infinity;

  Object.entries(raceResults).forEach(([key, result]) => {
    if (result.success && result.executionTime < minTime) {
      minTime = result.executionTime;
      winnerKey = key;
    }
  });

  const getAlgoName = (key) => {
    switch (key) {
      case "bfs": return "Breadth-First Search (BFS)";
      case "dfs": return "Depth-First Search (DFS)";
      case "astar": return "A* Search (Manhattan)";
      case "dijkstra": return "Dijkstra's Algorithm";
      case "greedy": return "Greedy Best-First Search";
      default: return key.toUpperCase();
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
        🏎️ AI Race Results
      </h3>
      
      {isSolving ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "1.2rem", color: "var(--color-primary)", fontWeight: "bold" }}>
            Racing algorithms in progress... 🏁
          </div>
        </div>
      ) : (
        <div className="race-dashboard">
          {winnerKey && (
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "2rem" }}>🏆</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--path-color)" }}>
                  Winner: {getAlgoName(winnerKey)}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#858b9c" }}>
                  Solves the maze in {(raceResults[winnerKey].executionTime).toFixed(2)} ms, exploring {raceResults[winnerKey].nodesExplored} nodes.
                </div>
              </div>
            </div>
          )}

          <div className="race-list">
            {Object.entries(raceResults).map(([key, result]) => {
              const isWinner = key === winnerKey;
              return (
                <div key={key} className={`race-row ${key} ${isWinner ? "winner" : ""}`}>
                  <div className="race-algo-info">
                    <span className="race-algo-name">{key}</span>
                    <span className="race-algo-details">
                      {result.success
                        ? `Time: ${result.executionTime.toFixed(2)} ms | Explored: ${result.nodesExplored} | Path: ${result.path.length} steps`
                        : result.error ? `Failed: ${result.error}` : "Unsolvable Maze"}
                    </span>
                  </div>

                  <div>
                    {isWinner ? (
                      <span className="race-algo-badge winner">1st Place</span>
                    ) : result.success ? (
                      <span className="race-algo-badge loser">Finished</span>
                    ) : (
                      <span className="race-algo-badge loser" style={{ borderColor: "#ff2e93", color: "#ff2e93" }}>DNF</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default RaceMode;