import React from "react";

function Controls({
  algorithm,
  setAlgorithm,
  generateMaze,
  solveMaze,
  clearBoard,
  clearPath,
  rows,
  setRows,
  cols,
  setCols,
  speed,
  setSpeed,
  editMode,
  setEditMode,
  isSolving,
  dynamicObstacles,
  setDynamicObstacles,
  raceMode,
  setRaceMode,
  mazeType,
  setMazeType,
}) {
  return (
    <div className="controls-panel">
      <div className="control-group">
        <label>Select Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isSolving}
        >
          <option value="bfs">Breadth-First Search (BFS)</option>
          <option value="dfs">Depth-First Search (DFS)</option>
          <option value="astar">A* Search (Manhattan)</option>
          <option value="dijkstra">Dijkstra's Algorithm</option>
          <option value="greedy">Greedy Best-First Search</option>
        </select>
      </div>

      <div className="control-group">
        <label>Grid Dimensions</label>
        <div className="btn-group-row">
          <div>
            <span style={{ fontSize: "0.85rem", color: "#858b9c" }}>Rows:</span>
            <input
              type="number"
              min="5"
              max="35"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 15)}
              disabled={isSolving}
            />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "#858b9c" }}>Cols:</span>
            <input
              type="number"
              min="5"
              max="35"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 15)}
              disabled={isSolving}
            />
          </div>
        </div>
      </div>

      <div className="control-group">
        <label>Edit Mode</label>
        <div className="edit-modes">
          <button
            className={`edit-btn wall ${editMode === "wall" ? "active" : ""}`}
            onClick={() => setEditMode("wall")}
            disabled={isSolving}
          >
            🧱 Wall
          </button>
          <button
            className={`edit-btn weight ${editMode === "weight" ? "active" : ""}`}
            onClick={() => setEditMode("weight")}
            disabled={isSolving}
          >
            🌊 Weight
          </button>
          <button
            className={`edit-btn start ${editMode === "start" ? "active" : ""}`}
            onClick={() => setEditMode("start")}
            disabled={isSolving}
          >
            🎯 Start
          </button>
          <button
            className={`edit-btn goal ${editMode === "goal" ? "active" : ""}`}
            onClick={() => setEditMode("goal")}
            disabled={isSolving}
          >
            🏁 Goal
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>Animation Speed: {speed}ms</label>
        <input
          type="range"
          min="1"
          max="200"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          disabled={isSolving}
        />
      </div>

      <div className="control-group" style={{ flexDirection: "row", gap: "20px", marginTop: "5px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={dynamicObstacles}
            onChange={(e) => setDynamicObstacles(e.target.checked)}
            disabled={isSolving}
            style={{ width: "auto", margin: 0 }}
          />
          👾 Dynamic Obstacles
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={raceMode}
            onChange={(e) => setRaceMode(e.target.checked)}
            disabled={isSolving}
            style={{ width: "auto", margin: 0 }}
          />
          🤖 AI Race Mode
        </label>
      </div>

      <div className="control-group">
        <label>Maze Generation Style</label>
        <select
          value={mazeType}
          onChange={(e) => setMazeType(e.target.value)}
          disabled={isSolving}
        >
          <option value="dfs">Perfect Maze (DFS Recursive)</option>
          <option value="random">Random Obstacles (30% density)</option>
        </select>
      </div>

      <button
        className="btn-primary"
        onClick={solveMaze}
        disabled={isSolving}
      >
        {raceMode ? "🏁 Run AI Race!" : "▶️ Solve Maze"}
      </button>

      <button
        className="btn-secondary"
        onClick={generateMaze}
        disabled={isSolving}
      >
        ✨ Generate Maze
      </button>

      <div className="btn-group-row">
        <button className="btn-danger" onClick={clearBoard} disabled={isSolving}>
          🧹 Clear Board
        </button>
        <button className="btn-secondary" onClick={clearPath} disabled={isSolving}>
          ❌ Clear Path
        </button>
      </div>
    </div>
  );
}

export default Controls;