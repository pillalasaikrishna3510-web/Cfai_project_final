// Priority Queue / Min Heap implementation supporting lexicographical numeric comparisons (like Python's tuples)
function compareItems(a, b) {
  const limit = Math.min(a.length, b.length);
  for (let i = 0; i < limit; i++) {
    if (typeof a[i] === 'number' && typeof b[i] === 'number') {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    } else {
      break;
    }
  }
  return 0;
}

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return min;
  }

  bubbleUp(n) {
    const element = this.heap[n];
    while (n > 0) {
      const parentN = Math.floor((n + 1) / 2) - 1;
      const parent = this.heap[parentN];
      if (compareItems(element, parent) >= 0) break;
      this.heap[parentN] = element;
      this.heap[n] = parent;
      n = parentN;
    }
  }

  bubbleDown(n) {
    const length = this.heap.length;
    const element = this.heap[n];
    while (true) {
      const child2N = (n + 1) * 2;
      const child1N = child2N - 1;
      let swap = null;
      if (child1N < length) {
        const child1 = this.heap[child1N];
        if (compareItems(child1, element) < 0) {
          swap = child1N;
        }
      }
      if (child2N < length) {
        const child2 = this.heap[child2N];
        const currentBest = swap === null ? element : this.heap[swap];
        if (compareItems(child2, currentBest) < 0) {
          swap = child2N;
        }
      }
      if (swap === null) break;
      this.heap[n] = this.heap[swap];
      this.heap[swap] = element;
      n = swap;
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}

// -------------------------------------------------------------
// Maze Generator
// -------------------------------------------------------------
export function generateMaze(rows = 15, cols = 15, mazeType = "dfs") {
  if (mazeType === "random") {
    const maze = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        if (Math.random() < 0.3) {
          row.push(1);
        } else {
          row.push(0);
        }
      }
      maze.push(row);
    }
    if (rows > 2 && cols > 2) {
      maze[1][1] = 0;
      maze[rows - 2][cols - 2] = 0;
    }
    maze[0][0] = 0;
    maze[rows - 1][cols - 1] = 0;
    return maze;
  }

  // "dfs" Perfect Maze Generator
  const maze = Array(rows).fill(null).map(() => Array(cols).fill(1));
  const startR = (rows > 2 && cols > 2) ? 1 : 0;
  const startC = (rows > 2 && cols > 2) ? 1 : 0;
  maze[startR][startC] = 0;

  const visited = new Set([`${startR}-${startC}`]);
  const stack = [[startR, startC]];

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const neighbors = [];

    // Find all unvisited neighbors at distance 2
    for (const [dr, dc] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1) {
        if (!visited.has(`${nr}-${nc}`)) {
          neighbors.push([nr, nc, dr, dc]);
        }
      }
    }

    if (neighbors.length > 0) {
      // Choose one random unvisited neighbor
      const [nr, nc, dr, dc] = neighbors[Math.floor(Math.random() * neighbors.length)];
      // Carve path to it
      maze[r + Math.floor(dr / 2)][c + Math.floor(dc / 2)] = 0;
      maze[nr][nc] = 0;
      visited.add(`${nr}-${nc}`);
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }

  // Always ensure standard start and goal cells are open
  if (rows > 2 && cols > 2) {
    maze[1][1] = 0;
    maze[rows - 2][cols - 2] = 0;

    // Connect start node (1, 1) to a neighbor
    let startConnected = false;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = 1 + dr;
      const nc = 1 + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0) {
        startConnected = true;
        break;
      }
    }
    if (!startConnected && cols > 2) {
      maze[1][2] = 0;
    }

    // Connect goal node (rows-2, cols-2) to a neighbor
    let goalConnected = false;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = rows - 2 + dr;
      const nc = cols - 2 + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0) {
        goalConnected = true;
        break;
      }
    }
    if (!goalConnected && cols > 2) {
      maze[rows - 2][cols - 3] = 0;
    }
  }

  maze[0][0] = 0;
  maze[rows - 1][cols - 1] = 0;
  return maze;
}

// -------------------------------------------------------------
// BFS Solver
// -------------------------------------------------------------
export function bfs(maze, start, goal) {
  const startTime = performance.now();
  const rows = maze.length;
  const cols = maze[0].length;

  const queue = [[start, null, [start]]];
  const visited = [];
  const visitedSet = new Set();
  let finalPath = [];

  while (queue.length > 0) {
    const [current, parent, path] = queue.shift();
    const currKey = `${current[0]}-${current[1]}`;

    if (visitedSet.has(currKey)) continue;
    visitedSet.add(currKey);

    visited.push({
      pos: current,
      parent: parent,
      g: path.length - 1
    });

    if (current[0] === goal[0] && current[1] === goal[1]) {
      finalPath = path;
      break;
    }

    const [row, col] = current;
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nr = row + dr;
      const nc = col + dc;
      const neighborKey = `${nr}-${nc}`;

      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        maze[nr][nc] === 0 &&
        !visitedSet.has(neighborKey)
      ) {
        queue.push([[nr, nc], current, [...path, [nr, nc]]]);
      }
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return [finalPath, visited, executionTime, visited.length];
}

// -------------------------------------------------------------
// DFS Solver
// -------------------------------------------------------------
export function dfs(maze, start, goal) {
  const startTime = performance.now();
  const rows = maze.length;
  const cols = maze[0].length;

  const stack = [[start, null, [start]]];
  const visited = [];
  const visitedSet = new Set();
  let finalPath = [];

  while (stack.length > 0) {
    const [current, parent, path] = stack.pop();
    const currKey = `${current[0]}-${current[1]}`;

    if (visitedSet.has(currKey)) continue;
    visitedSet.add(currKey);

    visited.push({
      pos: current,
      parent: parent
    });

    if (current[0] === goal[0] && current[1] === goal[1]) {
      finalPath = path;
      break;
    }

    const [row, col] = current;
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nr = row + dr;
      const nc = col + dc;
      const neighborKey = `${nr}-${nc}`;

      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        maze[nr][nc] === 0 &&
        !visitedSet.has(neighborKey)
      ) {
        stack.push([[nr, nc], current, [...path, [nr, nc]]]);
      }
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return [finalPath, visited, executionTime, visited.length];
}

// -------------------------------------------------------------
// A* Solver
// -------------------------------------------------------------
export function astar(maze, start, goal, weights) {
  const startTime = performance.now();
  const rows = maze.length;
  const cols = maze[0].length;
  const actualWeights = weights || Array(rows).fill(null).map(() => Array(cols).fill(1));

  const startKey = `${start[0]}-${start[1]}`;
  const gScore = { [startKey]: 0 };

  const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

  const openSet = new MinHeap();
  let count = 0;
  const hStart = heuristic(start, goal);
  // Heap stores: [f_score, count, current, parent, g_score, path]
  openSet.push([hStart, count, start, null, 0, [start]]);

  const visited = [];
  const visitedSet = new Set();
  let finalPath = [];

  while (!openSet.isEmpty()) {
    const popped = openSet.pop();
    const [f, _, current, parent, g, path] = popped;
    const currKey = `${current[0]}-${current[1]}`;

    if (visitedSet.has(currKey)) continue;
    visitedSet.add(currKey);

    const h = heuristic(current, goal);
    visited.push({
      pos: current,
      parent: parent,
      g: g,
      h: h,
      f: g + h
    });

    if (current[0] === goal[0] && current[1] === goal[1]) {
      finalPath = path;
      break;
    }

    const [row, col] = current;
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nr = row + dr;
      const nc = col + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0) {
        const neighbor = [nr, nc];
        const neighborKey = `${nr}-${nc}`;
        const weight = actualWeights[nr][nc] || 1;
        const tentativeG = g + weight;

        if (!(neighborKey in gScore) || tentativeG < gScore[neighborKey]) {
          gScore[neighborKey] = tentativeG;
          const nextF = tentativeG + heuristic(neighbor, goal);
          count++;
          openSet.push([nextF, count, neighbor, current, tentativeG, [...path, neighbor]]);
        }
      }
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return [finalPath, visited, executionTime, visited.length];
}

// -------------------------------------------------------------
// Dijkstra Solver
// -------------------------------------------------------------
export function dijkstra(maze, start, goal, weights) {
  const startTime = performance.now();
  const rows = maze.length;
  const cols = maze[0].length;
  const actualWeights = weights || Array(rows).fill(null).map(() => Array(cols).fill(1));

  const startKey = `${start[0]}-${start[1]}`;
  const gScore = { [startKey]: 0 };

  const pq = new MinHeap();
  let count = 0;
  // pq stores: [cost, count, current, parent, path]
  pq.push([0, count, start, null, [start]]);

  const visited = [];
  const visitedSet = new Set();
  let finalPath = [];

  while (!pq.isEmpty()) {
    const [cost, _, current, parent, path] = pq.pop();
    const currKey = `${current[0]}-${current[1]}`;

    if (visitedSet.has(currKey)) continue;
    visitedSet.add(currKey);

    visited.push({
      pos: current,
      parent: parent,
      g: cost
    });

    if (current[0] === goal[0] && current[1] === goal[1]) {
      finalPath = path;
      break;
    }

    const [row, col] = current;
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nr = row + dr;
      const nc = col + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0) {
        const neighbor = [nr, nc];
        const neighborKey = `${nr}-${nc}`;
        const weight = actualWeights[nr][nc] || 1;
        const tentativeG = cost + weight;

        if (!(neighborKey in gScore) || tentativeG < gScore[neighborKey]) {
          gScore[neighborKey] = tentativeG;
          count++;
          pq.push([tentativeG, count, neighbor, current, [...path, neighbor]]);
        }
      }
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return [finalPath, visited, executionTime, visited.length];
}

// -------------------------------------------------------------
// Greedy BFS Solver
// -------------------------------------------------------------
export function greedy_bfs(maze, start, goal, weights) {
  const startTime = performance.now();
  const rows = maze.length;
  const cols = maze[0].length;

  const heuristic = (p1, p2) => Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);

  const openSet = new MinHeap();
  let count = 0;
  // openSet stores: [heuristic_score, count, current, parent, path]
  openSet.push([heuristic(start, goal), count, start, null, [start]]);

  const visited = [];
  const visitedSet = new Set();
  let finalPath = [];

  while (!openSet.isEmpty()) {
    const [_, __, curr, parent, path] = openSet.pop();
    const currKey = `${curr[0]}-${curr[1]}`;

    if (visitedSet.has(currKey)) continue;
    visitedSet.add(currKey);

    const currH = heuristic(curr, goal);
    visited.push({
      pos: curr,
      parent: parent,
      h: currH
    });

    if (curr[0] === goal[0] && curr[1] === goal[1]) {
      finalPath = path;
      break;
    }

    const [r, c] = curr;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      const neighborKey = `${nr}-${nc}`;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (maze[nr][nc] !== 1 && !visitedSet.has(neighborKey)) {
          count++;
          const neighbor = [nr, nc];
          openSet.push([heuristic(neighbor, goal), count, neighbor, curr, [...path, neighbor]]);
        }
      }
    }
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return [finalPath, visited, executionTime, visited.length];
}

// -------------------------------------------------------------
// 8-Puzzle Solver
// -------------------------------------------------------------
export function isSolvable(state) {
  const arr = state.filter(x => x !== 0);
  let inversions = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        inversions++;
      }
    }
  }
  return inversions % 2 === 0;
}

export function getManhattanDistance(state, goal = [1, 2, 3, 4, 5, 6, 7, 8, 0]) {
  let distance = 0;
  for (let i = 0; i < state.length; i++) {
    const val = state[i];
    if (val !== 0) {
      const currR = Math.floor(i / 3);
      const currC = i % 3;
      const goalIdx = goal.indexOf(val);
      const goalR = Math.floor(goalIdx / 3);
      const goalC = goalIdx % 3;
      distance += Math.abs(currR - goalR) + Math.abs(currC - goalC);
    }
  }
  return distance;
}

export function solve_8_puzzle(startState, goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0]) {
  const startTime = performance.now();
  
  if (!isSolvable(startState)) {
    const endTime = performance.now();
    return [[], endTime - startTime, 0, false];
  }

  const startKey = startState.join(',');
  const goalKey = goalState.join(',');

  if (startKey === goalKey) {
    const endTime = performance.now();
    return [[startState], endTime - startTime, 1, true];
  }

  const openSet = new MinHeap();
  let count = 0;
  const hStart = getManhattanDistance(startState, goalState);
  // Heap stores: [f_score, g_score, count, state]
  openSet.push([hStart, 0, count, startState]);

  const gScore = { [startKey]: 0 };
  const parent = { [startKey]: null };
  const visited = new Set();
  let nodesExplored = 0;
  let found = false;

  while (!openSet.isEmpty()) {
    const [f, g, _, curr] = openSet.pop();
    const currKey = curr.join(',');

    if (visited.has(currKey)) continue;
    visited.add(currKey);
    nodesExplored++;

    if (currKey === goalKey) {
      found = true;
      break;
    }

    const zeroIdx = curr.indexOf(0);
    const r = Math.floor(zeroIdx / 3);
    const c = zeroIdx % 3;

    // Blank tile moves: Up, Down, Left, Right
    const moves = [];
    if (r > 0) moves.push(zeroIdx - 3);
    if (r < 2) moves.push(zeroIdx + 3);
    if (c > 0) moves.push(zeroIdx - 1);
    if (c < 2) moves.push(zeroIdx + 1);

    for (const moveIdx of moves) {
      const nextState = [...curr];
      nextState[zeroIdx] = curr[moveIdx];
      nextState[moveIdx] = 0;
      const nextKey = nextState.join(',');

      const tentativeG = g + 1;
      if (!(nextKey in gScore) || tentativeG < gScore[nextKey]) {
        gScore[nextKey] = tentativeG;
        parent[nextKey] = curr;
        const nextF = tentativeG + getManhattanDistance(nextState, goalState);
        count++;
        openSet.push([nextF, tentativeG, count, nextState]);
      }
    }
  }

  const path = [];
  if (found) {
    let curr = goalState;
    while (curr !== null) {
      path.push(curr);
      const currKey = curr.join(',');
      curr = parent[currKey] || null;
    }
    path.reverse();
  }

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return [path, executionTime, nodesExplored, true];
}
