import time
from collections import deque

def bfs(maze, start, goal):
    """
    Breadth-First Search (BFS) pathfinding algorithm.
    Returns: (path, visited, execution_time_ms, nodes_explored)
    """
    start_time = time.perf_counter()
    rows = len(maze)
    cols = len(maze[0])

    # queue stores: (current, parent, path)
    queue = deque([(start, None, [start])])
    visited = []
    visited_set = set()

    found = False
    final_path = []

    while queue:
        current, parent, path = queue.popleft()

        if current in visited_set:
            continue
        visited_set.add(current)
        visited.append({
            "pos": list(current),
            "parent": list(parent) if parent is not None else None,
            "g": len(path) - 1
        })

        if current == goal:
            found = True
            final_path = path
            break

        row, col = current

        for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nr = row + dr
            nc = col + dc

            if (0 <= nr < rows and
                0 <= nc < cols and
                maze[nr][nc] == 0 and
                (nr, nc) not in visited_set):

                queue.append(((nr, nc), current, path + [(nr, nc)]))

    end_time = time.perf_counter()
    execution_time = (end_time - start_time) * 1000

    return final_path, visited, execution_time, len(visited)