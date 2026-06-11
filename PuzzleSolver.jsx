import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { solve_8_puzzle as localSolve8Puzzle } from "./algorithms";

function PuzzleSolver() {
  const goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const [board, setBoard] = useState([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [isSolving, setIsSolving] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });
  
  // Playback state
  const [solutionPath, setSolutionPath] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(300); // ms per step
  
  const [stats, setStats] = useState({
    executionTime: 0,
    nodesExplored: 0,
    pathLength: 0,
  });

  const timerRef = useRef(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle tile click to slide manually
  const handleTileClick = (index) => {
    if (isSolving || isPlaying) return;

    const zeroIndex = board.indexOf(0);
    const rZero = Math.floor(zeroIndex / 3);
    const cZero = zeroIndex % 3;
    const rTile = Math.floor(index / 3);
    const cTile = index % 3;

    // Check if adjacent (Manhattan distance == 1)
    const isAdjacent = Math.abs(rZero - rTile) + Math.abs(cZero - cTile) === 1;

    if (isAdjacent) {
      const newBoard = [...board];
      newBoard[zeroIndex] = board[index];
      newBoard[index] = 0;
      setBoard(newBoard);
      setSolutionPath([]); // Reset solution path as user diverged
      setStatus({ message: "Tile moved.", type: "success" });
    }
  };

  // Get Manhattan distance contribution of a tile at an index
  const getTileManhattan = (value, index) => {
    if (value === 0) return 0;
    const goalIndex = goalState.indexOf(value);
    const currR = Math.floor(index / 3);
    const currC = index % 3;
    const goalR = Math.floor(goalIndex / 3);
    const goalC = goalIndex % 3;
    return Math.abs(currR - goalR) + Math.abs(currC - goalC);
  };

  // Total Manhattan distance of the board
  const getTotalManhattan = () => {
    return board.reduce((acc, val, idx) => acc + getTileManhattan(val, idx), 0);
  };

  // Scramble the board by making random VALID moves
  const scrambleBoard = () => {
    if (isSolving || isPlaying) return;
    
    let tempBoard = [...board];
    const movesCount = 60;
    
    for (let m = 0; m < movesCount; m++) {
      const zeroIdx = tempBoard.indexOf(0);
      const r = Math.floor(zeroIdx / 3);
      const c = zeroIdx % 3;
      
      const validSwaps = [];
      if (r > 0) validSwaps.push(zeroIdx - 3); // Up
      if (r < 2) validSwaps.push(zeroIdx + 3); // Down
      if (c > 0) validSwaps.push(zeroIdx - 1); // Left
      if (c < 2) validSwaps.push(zeroIdx + 1); // Right
      
      const swapWith = validSwaps[Math.floor(Math.random() * validSwaps.length)];
      tempBoard[zeroIdx] = tempBoard[swapWith];
      tempBoard[swapWith] = 0;
    }
    
    setBoard(tempBoard);
    setSolutionPath([]);
    setCurrentStepIndex(0);
    setStats({ executionTime: 0, nodesExplored: 0, pathLength: 0 });
    setStatus({ message: "Board scrambled.", type: "success" });
  };

  // Reset to goal state
  const resetBoard = () => {
    if (isSolving || isPlaying) return;
    setBoard([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    setSolutionPath([]);
    setCurrentStepIndex(0);
    setStats({ executionTime: 0, nodesExplored: 0, pathLength: 0 });
    setStatus({ message: "Reset to goal state.", type: "success" });
  };

  // Solve the puzzle using local JS implementation
  const solvePuzzle = async () => {
    if (isSolving || isPlaying) return;
    setIsSolving(true);
    setStatus({ message: "Calculating shortest path using A* & Manhattan Distance...", type: "success" });

    try {
      const [path, executionTime, nodesExplored, solvable] = localSolve8Puzzle(board);

      if (!solvable) {
        setStatus({ message: "⚠️ Puzzle configuration is unsolvable!", type: "error" });
        setIsSolving(false);
        return;
      }

      setSolutionPath(path);
      setCurrentStepIndex(0);
      setStats({
        executionTime,
        nodesExplored,
        pathLength: path.length - 1,
      });
      setStatus({
        message: `Solved successfully in ${executionTime.toFixed(2)} ms! Click Play to view steps.`,
        type: "success",
      });

      // Start playing path automatically
      playSolution(path);

    } catch (err) {
      console.error(err);
      setStatus({ message: "Error in 8-puzzle solver algorithm.", type: "error" });
    } finally {
      setIsSolving(false);
    }
  };

  // Play/Pause Playback loop
  const playSolution = (path = solutionPath) => {
    if (path.length === 0) return;
    setIsPlaying(true);
  };

  const pauseSolution = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Handle playback interval
  useEffect(() => {
    if (isPlaying && solutionPath.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prevIdx) => {
          const nextIdx = prevIdx + 1;
          if (nextIdx < solutionPath.length) {
            setBoard(solutionPath[nextIdx]);
            return nextIdx;
          } else {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            setStatus({ message: "Goal state reached!", type: "success" });
            return prevIdx;
          }
        });
      }, playbackSpeed);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, solutionPath, playbackSpeed]);

  const stepForward = () => {
    if (currentStepIndex < solutionPath.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setBoard(solutionPath[nextIdx]);
      setCurrentStepIndex(nextIdx);
    }
  };

  const stepBackward = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setBoard(solutionPath[prevIdx]);
      setCurrentStepIndex(prevIdx);
    }
  };

  return (
    <div className="puzzle-dashboard">
      <div className="card" style={{ width: "100%" }}>
        <h3 style={{ marginTop: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
          🧩 8-Puzzle Solver (Manhattan Distance)
        </h3>
        <p style={{ color: "#858b9c", fontSize: "0.9rem" }}>
          Solve the classic 8-Puzzle using the A* Search algorithm. Click tiles to move them manually, scramble the board, or press solve to run the A* agent.
        </p>

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <div className="puzzle-grid">
            {board.map((tile, index) => {
              const isCorrect = tile !== 0 && index === goalState.indexOf(tile);
              const manhattanDist = tile !== 0 ? getTileManhattan(tile, index) : 0;
              
              return (
                <div
                  key={index}
                  className={`puzzle-tile ${tile === 0 ? "empty" : ""} ${isCorrect ? "correct" : ""}`}
                  onClick={() => handleTileClick(index)}
                >
                  {tile !== 0 && tile}
                  {tile !== 0 && <span className="tile-h">m:{manhattanDist}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-grid" style={{ marginBottom: "20px" }}>
          <div className="stat-box execution-time">
            <div className="stat-lbl">A* Solve Time</div>
            <div className="stat-val">{stats.executionTime.toFixed(2)}</div>
            <div className="stat-lbl">Milliseconds</div>
          </div>
          <div className="stat-box explored-nodes">
            <div className="stat-lbl">Nodes Explored</div>
            <div className="stat-val">{stats.nodesExplored}</div>
            <div className="stat-lbl">States Visited</div>
          </div>
          <div className="stat-box path-length">
            <div className="stat-lbl">Solution Cost</div>
            <div className="stat-val">{stats.pathLength}</div>
            <div className="stat-lbl">Moves to Solve</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
          <div className="btn-group-row" style={{ width: "100%" }}>
            <button className="btn-primary" onClick={solvePuzzle} disabled={isSolving || board.indexOf(0) === -1 || getTotalManhattan() === 0}>
              🧠 Solve with A*
            </button>
            <button className="btn-secondary" onClick={scrambleBoard} disabled={isSolving || isPlaying}>
              🔀 Scramble
            </button>
          </div>

          <button className="btn-secondary" style={{ width: "100%" }} onClick={resetBoard} disabled={isSolving || isPlaying}>
            🔄 Reset to Goal State
          </button>

          {solutionPath.length > 0 && (
            <div style={{ width: "100%", textAlign: "center", marginTop: "10px" }}>
              <div style={{ fontSize: "0.9rem", color: "#858b9c" }}>
                Step: <strong>{currentStepIndex}</strong> of {solutionPath.length - 1}
              </div>

              <div className="playback-controls">
                <button className="playback-btn" onClick={stepBackward} disabled={currentStepIndex === 0 || isPlaying}>
                  ⏮️
                </button>
                {isPlaying ? (
                  <button className="playback-btn" onClick={pauseSolution}>
                    ⏸️
                  </button>
                ) : (
                  <button className="playback-btn" onClick={() => playSolution()}>
                    ▶️
                  </button>
                )}
                <button className="playback-btn" onClick={stepForward} disabled={currentStepIndex === solutionPath.length - 1 || isPlaying}>
                  ⏭️
                </button>
              </div>

              <div className="control-group">
                <label style={{ fontSize: "0.8rem" }}>Playback Speed: {playbackSpeed}ms</label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                  className="playback-slider"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PuzzleSolver;
