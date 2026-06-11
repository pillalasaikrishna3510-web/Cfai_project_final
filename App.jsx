import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Controls from "./Controls";
import MazeGrid from "./MazeGrid";
import Dashboard from "./Dashboard";
import RaceMode from "./RaceMode";
import PuzzleSolver from "./PuzzleSolver";
import NodeInspector from "./NodeInspector";
import AlgorithmInfo from "./AlgorithmInfo";
import {
  generateMaze as localGenerateMaze,
  bfs as localBfs,
  dfs as localDfs,
  astar as localAstar,
  dijkstra as localDijkstra,
  greedy_bfs as localGreedyBfs
} from "./algorithms";

function App() {
  const [activeTab, setActiveTab] = useState("maze");

  const defaultRows = 15;
  const defaultCols = 15;
  const initialMaze = Array(defaultRows).fill(null).map(() => Array(defaultCols).fill(0));
  const initialWeights = Array(defaultRows).fill(null).map(() => Array(defaultCols).fill(1));

  // Maze states
  const [rows, setRows] = useState(defaultRows);
  const [cols, setCols] = useState(defaultCols);
  const [maze, setMaze] = useState(initialMaze);
  const [weights, setWeights] = useState(initialWeights);
  const [start, setStart] = useState([1, 1]);
  const [goal, setGoal] = useState([13, 13]);
  const [algorithm, setAlgorithm] = useState("astar");
  const [mazeType, setMazeType] = useState("dfs");
  const [speed, setSpeed] = useState(15); // ms
  const [editMode, setEditMode] = useState("wall");
  const [hoveredCell, setHoveredCell] = useState(null);

  // Interactive path/visited
  const [path, setPath] = useState([]);
  const [animatedVisited, setAnimatedVisited] = useState([]);
  const [isSolving, setIsSolving] = useState(false);

  // Dynamic obstacles
  const [dynamicObstacles, setDynamicObstacles] = useState(false);
  const [obstacles, setObstacles] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    algorithm: "A* Search",
    pathLength: 0,
    executionTime: 0,
    nodesExplored: 0,
  });
  
  // Race states
  const [raceMode, setRaceMode] = useState(false);
  const [raceResults, setRaceResults] = useState({});
  const [allStats, setAllStats] = useState({});

  const timerRef = useRef(null);
  const obstacleIntervalRef = useRef(null);

  // Initialize maze
  useEffect(() => {
    generateMaze();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (obstacleIntervalRef.current) clearInterval(obstacleIntervalRef.current);
    };
  }, [rows, cols]);

  // Set start and goal when rows/cols change
  useEffect(() => {
    setStart([1, 1]);
    setGoal([rows - 2 > 0 ? rows - 2 : rows - 1, cols - 2 > 0 ? cols - 2 : cols - 1]);
  }, [rows, cols]);

  // Dynamic obstacles movement interval
  useEffect(() => {
    if (dynamicObstacles && maze.length > 0) {
      // Initialize 3 obstacles
      const initialObstacles = [];
      while (initialObstacles.length < 4) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (
          maze[r]?.[c] === 0 &&
          !(start[0] === r && start[1] === c) &&
          !(goal[0] === r && goal[1] === c) &&
          !initialObstacles.some(([or, oc]) => or === r && oc === c)
        ) {
          initialObstacles.push([r, c]);
        }
      }
      setObstacles(initialObstacles);

      obstacleIntervalRef.current = setInterval(() => {
        setObstacles((prevObstacles) =>
          prevObstacles.map(([or, oc]) => {
            // Pick random valid neighbor
            const neighbors = [];
            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
              const nr = or + dr;
              const nc = oc + dc;
              if (
                nr >= 0 &&
                nr < rows &&
                nc >= 0 &&
                nc < cols &&
                maze[nr][nc] === 0 &&
                !(start[0] === nr && start[1] === nc) &&
                !(goal[0] === nr && goal[1] === nc)
              ) {
                neighbors.push([nr, nc]);
              }
            }
            if (neighbors.length > 0) {
              return neighbors[Math.floor(Math.random() * neighbors.length)];
            }
            return [or, oc];
          })
        );
      }, 500);
    } else {
      setObstacles([]);
      if (obstacleIntervalRef.current) {
        clearInterval(obstacleIntervalRef.current);
      }
    }

    return () => {
      if (obstacleIntervalRef.current) clearInterval(obstacleIntervalRef.current);
    };
  }, [dynamicObstacles, maze, rows, cols]);

  // Generate Maze using local JS algorithm
  const generateMaze = async () => {
    if (isSolving) return;
    try {
      const generatedGrid = localGenerateMaze(rows, cols, mazeType);
      if (!generatedGrid || generatedGrid.length === 0 || !generatedGrid[0]) return;
      setMaze(generatedGrid);

      // Reset weights
      const defaultWeights = Array(generatedGrid.length)
        .fill(null)
        .map(() => Array(generatedGrid[0].length).fill(1));
      setWeights(defaultWeights);

      // Clear any solution
      setPath([]);
      setAnimatedVisited([]);
      setRaceResults({});
      setAllStats({});
      setStats({
        algorithm: algorithm.toUpperCase(),
        pathLength: 0,
        executionTime: 0,
        nodesExplored: 0,
      });
    } catch (err) {
      console.error("Error generating maze:", err);
    }
  };

  // Solve Maze using local JS algorithms
  const solveMaze = async () => {
    if (isSolving) return;
    setIsSolving(true);
    setPath([]);
    setAnimatedVisited([]);

    if (!maze || maze.length === 0 || !maze[0]) {
      setIsSolving(false);
      return;
    }

    // Adjust grid momentarily to treat moving obstacles as walls (so path does not cross them)
    const activeGrid = maze.map((row, r) =>
      row ? row.map((cell, c) => {
        const isObstacle = obstacles && obstacles.some(([or, oc]) => or === r && oc === c);
        return isObstacle ? 1 : cell;
      }) : []
    );

    if (raceMode) {
      try {
        const data = {};

        // Run BFS
        try {
          const [bfsPath, bfsVisited, bfsTime, bfsNodes] = localBfs(activeGrid, start, goal);
          data["bfs"] = {
            success: bfsPath.length > 0,
            path: bfsPath,
            visited: bfsVisited,
            executionTime: bfsTime,
            nodesExplored: bfsNodes
          };
        } catch (e) {
          data["bfs"] = { success: false, error: e.message };
        }

        // Run DFS
        try {
          const [dfsPath, dfsVisited, dfsTime, dfsNodes] = localDfs(activeGrid, start, goal);
          data["dfs"] = {
            success: dfsPath.length > 0,
            path: dfsPath,
            visited: dfsVisited,
            executionTime: dfsTime,
            nodesExplored: dfsNodes
          };
        } catch (e) {
          data["dfs"] = { success: false, error: e.message };
        }

        // Run A*
        try {
          const [astarPath, astarVisited, astarTime, astarNodes] = localAstar(activeGrid, start, goal, weights);
          data["astar"] = {
            success: astarPath.length > 0,
            path: astarPath,
            visited: astarVisited,
            executionTime: astarTime,
            nodesExplored: astarNodes
          };
        } catch (e) {
          data["astar"] = { success: false, error: e.message };
        }

        // Run Dijkstra
        try {
          const [dijkstraPath, dijkstraVisited, dijkstraTime, dijkstraNodes] = localDijkstra(activeGrid, start, goal, weights);
          data["dijkstra"] = {
            success: dijkstraPath.length > 0,
            path: dijkstraPath,
            visited: dijkstraVisited,
            executionTime: dijkstraTime,
            nodesExplored: dijkstraNodes
          };
        } catch (e) {
          data["dijkstra"] = { success: false, error: e.message };
        }

        // Run Greedy BFS
        try {
          const [greedyPath, greedyVisited, greedyTime, greedyNodes] = localGreedyBfs(activeGrid, start, goal, weights);
          data["greedy"] = {
            success: greedyPath.length > 0,
            path: greedyPath,
            visited: greedyVisited,
            executionTime: greedyTime,
            nodesExplored: greedyNodes
          };
        } catch (e) {
          data["greedy"] = { success: false, error: e.message };
        }

        setRaceResults(data);

        // Compile all stats for the chart
        const statsSummary = {};
        Object.entries(data).forEach(([key, result]) => {
          if (result.success) {
            statsSummary[key] = {
              executionTime: result.executionTime,
              nodesExplored: result.nodesExplored,
            };
          }
        });
        setAllStats(statsSummary);

        // Find winner to animate
        let winnerAlgo = null;
        let minTime = Infinity;
        Object.entries(data).forEach(([key, result]) => {
          if (result.success && result.executionTime < minTime) {
            minTime = result.executionTime;
            winnerAlgo = key;
          }
        });

        if (winnerAlgo && data[winnerAlgo]) {
          // Animate the winner's solution
          animateSolution(data[winnerAlgo].visited, data[winnerAlgo].path);
          setStats({
            algorithm: `${winnerAlgo.toUpperCase()} (Race Winner)`,
            pathLength: data[winnerAlgo].path.length,
            executionTime: data[winnerAlgo].executionTime,
            nodesExplored: data[winnerAlgo].nodesExplored,
          });
        } else {
          setIsSolving(false);
          alert("No path found by any algorithm!");
        }

      } catch (err) {
        console.error("Error in AI race mode:", err);
        setIsSolving(false);
      }
    } else {
      try {
        let solvePath, solveVisited, executionTime, nodesExplored;

        if (algorithm === "bfs") {
          [solvePath, solveVisited, executionTime, nodesExplored] = localBfs(activeGrid, start, goal);
        } else if (algorithm === "dfs") {
          [solvePath, solveVisited, executionTime, nodesExplored] = localDfs(activeGrid, start, goal);
        } else if (algorithm === "astar") {
          [solvePath, solveVisited, executionTime, nodesExplored] = localAstar(activeGrid, start, goal, weights);
        } else if (algorithm === "dijkstra") {
          [solvePath, solveVisited, executionTime, nodesExplored] = localDijkstra(activeGrid, start, goal, weights);
        } else if (algorithm === "greedy") {
          [solvePath, solveVisited, executionTime, nodesExplored] = localGreedyBfs(activeGrid, start, goal, weights);
        } else {
          setIsSolving(false);
          alert(`Unknown algorithm: ${algorithm}`);
          return;
        }

        if (solvePath.length === 0) {
          setIsSolving(false);
          alert("No path found!");
          return;
        }

        setStats({
          algorithm: algorithm.toUpperCase(),
          pathLength: solvePath.length,
          executionTime,
          nodesExplored,
        });

        // Set comparison stats for single run (makes it show in the dashboard chart)
        setAllStats({
          [algorithm]: { executionTime, nodesExplored },
        });

        animateSolution(solveVisited, solvePath);

      } catch (err) {
        console.error("Error solving maze:", err);
        setIsSolving(false);
      }
    }
  };

  // Helper to animate visited nodes step-by-step
  const animateSolution = (visitedNodes, finalPath) => {
    let index = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (index < visitedNodes.length) {
        setAnimatedVisited((prev) => [...prev, visitedNodes[index]]);
        index++;
      } else {
        clearInterval(timerRef.current);
        setPath(finalPath);
        setIsSolving(false);
      }
    }, speed);
  };

  const clearBoard = () => {
    if (isSolving) return;
    const cleanGrid = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0));
    
    // Maintain borders or start/end slots
    setMaze(cleanGrid);

    const defaultWeights = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(1));
    setWeights(defaultWeights);

    setPath([]);
    setAnimatedVisited([]);
    setRaceResults({});
    setAllStats({});
    setStats({
      algorithm: algorithm.toUpperCase(),
      pathLength: 0,
      executionTime: 0,
      nodesExplored: 0,
    });
  };

  const clearPath = () => {
    if (isSolving) return;
    setPath([]);
    setAnimatedVisited([]);
    setRaceResults({});
    setAllStats({});
  };

  // Handle cell click drawing
  const handleCellClick = (r, c) => {
    if (isSolving) return;
    modifyCell(r, c);
  };

  const handleCellMouseEnter = (r, c) => {
    if (isSolving) return;
    modifyCell(r, c);
  };

  const modifyCell = (r, c) => {
    if (editMode === "start") {
      if (maze[r][c] !== 1 && !(goal[0] === r && goal[1] === c)) {
        setStart([r, c]);
      }
    } else if (editMode === "goal") {
      if (maze[r][c] !== 1 && !(start[0] === r && start[1] === c)) {
        setGoal([r, c]);
      }
    } else if (editMode === "wall") {
      if (!(start[0] === r && start[1] === c) && !(goal[0] === r && goal[1] === c)) {
        const newMaze = [...maze];
        newMaze[r] = [...newMaze[r]];
        newMaze[r][c] = newMaze[r][c] === 1 ? 0 : 1;
        setMaze(newMaze);
      }
    } else if (editMode === "weight") {
      if (!(start[0] === r && start[1] === c) && !(goal[0] === r && goal[1] === c) && maze[r][c] !== 1) {
        const newWeights = [...weights];
        newWeights[r] = [...newWeights[r]];
        // Cycle: 1 -> 5 -> 10 -> 1
        const currentW = newWeights[r][c];
        newWeights[r][c] = currentW === 1 ? 5 : currentW === 5 ? 10 : 1;
        setWeights(newWeights);
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AI-Based Maze & Puzzle Solver</h1>
        <p>A B.Tech CSE AI Project showcasing advanced search techniques and algorithms</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "maze" ? "active" : ""}`}
          onClick={() => setActiveTab("maze")}
        >
          🧭 Maze Pathfinding Solver
        </button>
        <button
          className={`tab-btn ${activeTab === "puzzle" ? "active" : ""}`}
          onClick={() => setActiveTab("puzzle")}
        >
          🧩 8-Puzzle A* Solver
        </button>
      </div>

      {activeTab === "maze" ? (
        <div className="grid-layout">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card">
              <Controls
                algorithm={algorithm}
                setAlgorithm={setAlgorithm}
                generateMaze={generateMaze}
                solveMaze={solveMaze}
                clearBoard={clearBoard}
                clearPath={clearPath}
                rows={rows}
                setRows={setRows}
                cols={cols}
                setCols={setCols}
                speed={speed}
                setSpeed={setSpeed}
                editMode={editMode}
                setEditMode={setEditMode}
                isSolving={isSolving}
                dynamicObstacles={dynamicObstacles}
                setDynamicObstacles={setDynamicObstacles}
                raceMode={raceMode}
                setRaceMode={setRaceMode}
                mazeType={mazeType}
                setMazeType={setMazeType}
              />
            </div>
            <NodeInspector cellData={hoveredCell} />
            <AlgorithmInfo algorithm={algorithm} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <div className="card" style={{ display: "flex", justifyContent: "center" }}>
              <MazeGrid
                maze={maze}
                weights={weights}
                start={start}
                goal={goal}
                path={path}
                visited={animatedVisited}
                obstacles={obstacles}
                editMode={editMode}
                algorithm={algorithm}
                onCellClick={handleCellClick}
                onCellMouseEnter={handleCellMouseEnter}
                onHoverCellChange={setHoveredCell}
              />
            </div>

            <Dashboard stats={stats} allStats={allStats} />

            {raceMode && (
              <RaceMode raceResults={raceResults} isSolving={isSolving} />
            )}
          </div>
        </div>
      ) : (
        <PuzzleSolver />
      )}
    </div>
  );
}

export default App;