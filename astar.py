import time
import heapq

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar(maze, start, goal, weights=None):
    """
    A* Search pathfinding algorithm.
    Supports weights.
    Returns: (path, visited, execution_time_ms, nodes_explored)
    """
    start_time = time.perf_counter()
    rows = len(maze)
    cols = len(maze[0])

    if weights is None:
        weights = [[1 for _ in range(cols)] for _ in range(rows)]

    start_tup = tuple(start)
    goal_tup = tuple(goal)

    # open_set stores: (f_score, count, current, parent, g_score, path)
    count = 0
    open_set = []

    g_score = {start_tup: 0}
    h_start = heuristic(start_tup, goal_tup)
    heapq.heappush(open_set, (h_start, count, start_tup, None, 0, [list(start_tup)]))

    visited = []
    visited_set = set()
    found = False
    final_path = []

    while open_set:
        f, _, current, parent, g, path = heapq.heappop(open_set)

        if current in visited_set:
            continue
        visited_set.add(current)
        h = heuristic(current, goal_tup)
        visited.append({
            "pos": list(current),
            "parent": list(parent) if parent is not None else None,
            "g": g,
            "h": h,
            "f": g + h
        })

        if current == goal_tup:
            found = True
            final_path = path
            break

        row, col = current

        for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nr = row + dr
            nc = col + dc

            if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] == 0:
                neighbor = (nr, nc)
                weight = weights[nr][nc]
                tentative_g = g + weight

                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    g_score[neighbor] = tentative_g
                    f = tentative_g + heuristic(neighbor, goal_tup)
                    count += 1
                    heapq.heappush(open_set, (f, count, neighbor, current, tentative_g, path + [list(neighbor)]))

    end_time = time.perf_counter()
    execution_time = (end_time - start_time) * 1000

    return final_path, visited, execution_time, len(visited)