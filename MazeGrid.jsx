import React, { useState } from "react";

function MazeGrid({
  maze = [],
  weights = [],
  start = [1, 1],
  goal = [13, 13],
  path = [],
  visited = [],
  obstacles = [],
  editMode = "wall",
  algorithm = "astar",
  onCellClick = () => {},
  onCellMouseEnter = () => {},
  onHoverCellChange = () => {},
}) {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = (r, c) => {
    setIsMouseDown(true);
    onCellClick(r, c);
  };

  const handleMouseEnter = (r, c, cellInfo) => {
    onHoverCellChange(cellInfo);
    if (isMouseDown) {
      onCellMouseEnter(r, c);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  React.useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Helper getters to safely support both dict-based and array-based visited structures
  const getPos = (v) => {
    if (!v) return null;
    if (Array.isArray(v)) return v;
    return v.pos || null;
  };

  const getParent = (v) => {
    if (!v || Array.isArray(v)) return null;
    return v.parent || null;
  };

  // Compute DFS active path (stack) at the current state of animation
  const activeDfsNodes = React.useMemo(() => {
    const activeSet = new Set();
    if (algorithm === "dfs" && visited && visited.length > 0) {
      let current = visited[visited.length - 1];
      while (current) {
        const pos = getPos(current);
        if (!pos) break;
        const key = `${pos[0]}-${pos[1]}`;
        activeSet.add(key);
        const parentPos = getParent(current);
        if (parentPos) {
          // Trace back parent node by finding it in the already visited list
          current = visited.find(v => {
            const vp = getPos(v);
            return vp && vp[0] === parentPos[0] && vp[1] === parentPos[1];
          });
        } else {
          current = null;
        }
      }
    }
    return activeSet;
  }, [visited, algorithm]);

  return (
    <div className="maze-container">
      <div className="maze-grid-wrapper">
        <div
          className="maze-grid"
          style={{
            gridTemplateColumns: `repeat(${maze[0]?.length || 0}, 28px)`,
          }}
        >
          {maze && maze.map((row, r) =>
            row && row.map((cell, c) => {
              const isStart = start && start[0] === r && start[1] === c;
              const isGoal = goal && goal[0] === r && goal[1] === c;
              
              const isObstacle = obstacles && obstacles.some(
                ([or, oc]) => or === r && oc === c
              );

              const isPath = path && path.some(([pr, pc]) => pr === r && pc === c);
              
              const visitedNode = visited && visited.find((v) => {
                const vp = getPos(v);
                return vp && vp[0] === r && vp[1] === c;
              });
              const isVisited = !!visitedNode;

              const cellWeight = weights?.[r]?.[c] || 1;
              const isWall = cell === 1;

              // Determine type string for the inspector
              let nodeType = "Open Path";
              if (isWall) nodeType = "Wall";
              else if (isObstacle) nodeType = "Obstacle";
              else if (isStart) nodeType = "Start";
              else if (isGoal) nodeType = "Goal";
              else if (isPath) nodeType = "Path";
              else if (isVisited) nodeType = "Visited";

              const cellInfo = {
                r,
                c,
                type: nodeType,
                weight: cellWeight,
                isVisited,
                visitedData: visitedNode
              };

              let cellClass = "cell open";
              if (isWall) cellClass = "cell wall";
              else if (isObstacle) cellClass = "cell obstacle";
              else if (isStart) cellClass = "cell start";
              else if (isGoal) cellClass = "cell goal";
              else if (isPath) cellClass = "cell path";
              else if (isVisited) {
                if (algorithm === "dfs") {
                  const key = `${r}-${c}`;
                  const isActive = activeDfsNodes.has(key);
                  cellClass = isActive 
                    ? "cell visited active-dfs" 
                    : "cell visited backtracked-dfs";
                } else {
                  cellClass = `cell visited weight-${cellWeight}`;
                }
              } else if (cellWeight > 1) {
                cellClass = `cell weight-${cellWeight}`;
              }

              // Determine grid cell text label
              let cellLabel = "";
              if (isStart) cellLabel = "🎯";
              else if (isGoal) cellLabel = "🏁";
              else if (isObstacle) cellLabel = "👾";
              else if (isVisited) {
                if (algorithm === "astar" && visitedNode.f !== undefined) {
                  cellLabel = visitedNode.f;
                } else if (algorithm === "dijkstra" && visitedNode.g !== undefined) {
                  cellLabel = visitedNode.g;
                } else if (cellWeight > 1) {
                  cellLabel = `~${cellWeight}`;
                }
              } else if (cellWeight > 1) {
                cellLabel = `~${cellWeight}`;
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={cellClass}
                  onMouseDown={() => handleMouseDown(r, c)}
                  onMouseEnter={() => handleMouseEnter(r, c, cellInfo)}
                >
                  <span className="cell-text">{cellLabel}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="legends">
        <div className="legend-item">
          <div className="legend-color start"></div>
          <span>Start (🎯)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color goal"></div>
          <span>Goal (🏁)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color wall"></div>
          <span>Wall (🧱)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color weight-5"></div>
          <span>Water/Mud (🌊 Cost: 5)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color obstacle"></div>
          <span>Moving Obstacle (👾)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color visited"></div>
          <span>Visited / Explored (🟡)</span>
        </div>
        {algorithm === "dfs" && (
          <>
            <div className="legend-item">
              <div className="legend-color active-dfs-legend"></div>
              <span>Active DFS Path (Magenta)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color backtracked-dfs-legend"></div>
              <span>Backtracked Dead-End (Faded Grey)</span>
            </div>
          </>
        )}
        <div className="legend-item">
          <div className="legend-color path"></div>
          <span>Final Path (🟢)</span>
        </div>
      </div>
    </div>
  );
}

export default MazeGrid;