import time
import heapq

def greedy_bfs(maze, start, goal, weights=None):
    """
    Greedy Best-First Search Algorithm.
    maze: 2D array (0: open, 1: wall)
    start: [r, c]
    goal: [r, c]
    Returns: (path, visited, execution_time_ms, nodes_explored)
    """
    start_time = time.perf_counter()
    rows, cols = len(maze), len(maze[0])
    start_tup = (start[0], start[1])
    goal_tup = (goal[0], goal[1])

    def heuristic(p1, p2):
        return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

    count = 0
    open_set = []
    heapq.heappush(open_set, (heuristic(start_tup, goal_tup), count, start_tup, None, [list(start_tup)]))

    visited = []
    visited_set = set()
    found = False
    final_path = []

    while open_set:
        _, _, curr, parent, path = heapq.heappop(open_set)

        if curr in visited_set:
            continue
        visited_set.add(curr)

        curr_h = heuristic(curr, goal_tup)
        visited.append({
            "pos": list(curr),
            "parent": list(parent) if parent is not None else None,
            "h": curr_h
        })

        if curr == goal_tup:
            found = True
            final_path = path
            break

        r, c = curr
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if maze[nr][nc] != 1 and (nr, nc) not in visited_set:
                    count += 1
                    heapq.heappush(open_set, (heuristic((nr, nc), goal_tup), count, (nr, nc), curr, path + [[nr, nc]]))

    end_time = time.perf_counter()
    execution_time = (end_time - start_time) * 1000

    return final_path, visited, execution_time, len(visited)
