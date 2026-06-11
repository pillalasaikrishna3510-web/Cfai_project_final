import time
import heapq

def dijkstra(maze, start, goal, weights=None):
    """
    Dijkstra's Pathfinding algorithm.
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

    # pq stores: (cost, count, current, parent, path)
    count = 0
    pq = []

    g_score = {start_tup: 0}
    heapq.heappush(pq, (0, count, start_tup, None, [list(start_tup)]))

    visited = []
    visited_set = set()
    found = False
    final_path = []

    while pq:
        cost, _, current, parent, path = heapq.heappop(pq)

        if current in visited_set:
            continue
        visited_set.add(current)
        visited.append({
            "pos": list(current),
            "parent": list(parent) if parent is not None else None,
            "g": cost
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
                tentative_g = cost + weight

                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    g_score[neighbor] = tentative_g
                    count += 1
                    heapq.heappush(pq, (tentative_g, count, neighbor, current, path + [list(neighbor)]))

    end_time = time.perf_counter()
    execution_time = (end_time - start_time) * 1000

    return final_path, visited, execution_time, len(visited)