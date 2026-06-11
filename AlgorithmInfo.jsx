import React from "react";

function AlgorithmInfo({ algorithm }) {
  const getInfo = (algo) => {
    switch (algo) {
      case "bfs":
        return {
          name: "Breadth-First Search (BFS)",
          complexity: { time: "O(V + E)", space: "O(V) [High memory]" },
          heuristic: "Unweighted frontier queue. Explores uniformly in concentric circles.",
          advantages: [
            "Guarantees the shortest path in an unweighted maze.",
            "Complete and reliable (always finds a path if one exists).",
            "Easy to implement and understand.",
          ],
          disadvantages: [
            "High memory consumption due to storing all frontier nodes in the queue.",
            "Explores many unnecessary nodes in directions away from the goal.",
            "Performance decreases dramatically as the maze size increases.",
          ],
          inefficiency: [
            "Very large mazes where memory capacity is limited.",
            "Mazes with extensive branching and paths leading away from the goal.",
          ],
        };
      case "dfs":
        return {
          name: "Depth-First Search (DFS)",
          complexity: { time: "O(V + E)", space: "O(D) where D is depth [Low memory]" },
          heuristic: "LIFO Stack. Traverses down a single branch until a dead end, then backtracks.",
          advantages: [
            "Uses significantly less memory than BFS.",
            "Can quickly find a path if it is lucky enough to choose the correct branch.",
            "Simple stack-based implementation.",
          ],
          disadvantages: [
            "Does not guarantee the shortest path.",
            "May explore extremely deep dead-end paths before backtracking.",
            "Can take much longer in complex mazes with many loops or dead ends.",
          ],
          inefficiency: [
            "Mazes with many dead ends and recursive branching.",
            "Situations requiring the optimal (shortest) path.",
            "Extremely deep search spaces where recursion/stack overflow is a risk.",
          ],
        };
      case "dijkstra":
        return {
          name: "Dijkstra's Algorithm",
          complexity: { time: "O((V + E) log V)", space: "O(V)" },
          heuristic: "Priority queue based on cumulative cost g(n) from the start.",
          advantages: [
            "Guarantees the absolute shortest/most optimal path.",
            "Works perfectly with weighted environments (e.g. mud, water, terrain).",
            "Extremely reliable and mathematically optimal.",
          ],
          disadvantages: [
            "Slower than heuristic-guided algorithms like A* because it searches blindly in all directions.",
            "Explores many nodes in a circular frontier before reaching the goal.",
            "Requires more computational overhead for managing the priority queue.",
          ],
          inefficiency: [
            "Very large grids with uniform movement costs.",
            "Real-time or high-performance systems requiring instantaneous updates.",
          ],
        };
      case "astar":
        return {
          name: "A* Search Algorithm",
          complexity: { time: "O(E log V) in worst case", space: "O(V)" },
          heuristic: "Priority queue based on f(n) = g(n) + h(n), where h(n) is the Manhattan heuristic.",
          advantages: [
            "Highly efficient pathfinding by guiding search towards the goal using heuristics.",
            "Guarantees the shortest path if the heuristic is admissible (never overestimates).",
            "Usually faster and visits fewer nodes than Dijkstra's Algorithm.",
          ],
          disadvantages: [
            "Performance depends heavily on the quality and admissibility of the heuristic function.",
            "Memory usage can still become high as it maintains an open list of all frontier nodes.",
            "More complex to implement than basic BFS/DFS.",
          ],
          inefficiency: [
            "Poorly designed heuristics that mislead the search direction.",
            "Dynamic environments where wall obstacles change position frequently (requires complete re-evaluation).",
          ],
        };
      case "greedy":
        return {
          name: "Greedy Best-First Search",
          complexity: { time: "O(b^m) worst case", space: "O(b^m)" },
          heuristic: "Priority queue based solely on h(n) (Manhattan distance to goal). Ignores step cost.",
          advantages: [
            "Very fast search times in open environments.",
            "Directed search directly towards the goal coordinate.",
          ],
          disadvantages: [
            "Does not guarantee the shortest path.",
            "Can be easily misled by walls and obstacles, getting stuck in large local pockets.",
            "Ignores path costs entirely (treats mud/water costs same as open paths).",
          ],
          inefficiency: [
            "Mazes with complex wall structures and winding paths.",
            "Weighted grids where finding the low-cost path is essential.",
          ],
        };
      default:
        return null;
    }
  };

  const info = getInfo(algorithm);

  if (!info) return null;

  return (
    <div className="card algo-info-panel">
      <h3 style={{ marginTop: 0, textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-primary)" }}>
        💡 {info.name} Details
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
        <div>
          <span style={{ color: "#858b9c", fontSize: "0.8rem", textTransform: "uppercase" }}>Time Complexity</span>
          <div style={{ fontSize: "1rem", fontWeight: "bold", fontFamily: "JetBrains Mono, monospace" }}>
            {info.complexity.time}
          </div>
        </div>
        <div>
          <span style={{ color: "#858b9c", fontSize: "0.8rem", textTransform: "uppercase" }}>Space Complexity</span>
          <div style={{ fontSize: "1rem", fontWeight: "bold", fontFamily: "JetBrains Mono, monospace" }}>
            {info.complexity.space}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <span style={{ color: "#858b9c", fontSize: "0.8rem", textTransform: "uppercase" }}>Search Strategy</span>
        <div style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
          {info.heuristic}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <span style={{ color: "var(--path-color)", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase" }}>🟢 Advantages</span>
          <ul style={{ margin: "5px 0", paddingLeft: "18px", fontSize: "0.85rem", color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "4px" }}>
            {info.advantages.map((adv, idx) => (
              <li key={idx}>{adv}</li>
            ))}
          </ul>
        </div>
        <div>
          <span style={{ color: "var(--goal-color)", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase" }}>🔴 Disadvantages</span>
          <ul style={{ margin: "5px 0", paddingLeft: "18px", fontSize: "0.85rem", color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "4px" }}>
            {info.disadvantages.map((dis, idx) => (
              <li key={idx}>{dis}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "12px" }}>
        <span style={{ color: "#ff9f43", fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase" }}>⚠️ Inefficiency Scenarios</span>
        <ul style={{ margin: "5px 0", paddingLeft: "18px", fontSize: "0.85rem", color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "2px" }}>
          {info.inefficiency.map((ineff, idx) => (
            <li key={idx}>{ineff}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AlgorithmInfo;
