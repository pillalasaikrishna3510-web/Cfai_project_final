import random

def generate_maze(rows=15, cols=15, maze_type="dfs"):
    """
    Generates a maze grid of size rows x cols.
    maze_type: "random" (random 30% density walls) or "dfs" (perfect recursive backtracking maze).
    0 represents open path, 1 represents wall.
    """
    if maze_type == "random":
        maze = []
        for i in range(rows):
            row = []
            for j in range(cols):
                if random.random() < 0.3:
                    row.append(1)
                else:
                    row.append(0)
            maze.append(row)
        
        # Ensure start and goal positions are open path (0)
        if rows > 2 and cols > 2:
            maze[1][1] = 0
            maze[rows - 2][cols - 2] = 0
        maze[0][0] = 0
        maze[rows - 1][cols - 1] = 0
        return maze

    # For "dfs" Perfect Maze Generator:
    # Start with a grid full of walls
    maze = [[1 for _ in range(cols)] for _ in range(rows)]
    
    # We carve paths starting from (1, 1) if bounds allow, otherwise (0, 0)
    start_r, start_c = (1, 1) if (rows > 2 and cols > 2) else (0, 0)
    maze[start_r][start_c] = 0
    
    visited = set([(start_r, start_c)])
    stack = [(start_r, start_c)]
    
    while stack:
        r, c = stack[-1]
        neighbors = []
        
        # Find all unvisited neighbors at distance 2
        for dr, dc in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
            nr, nc = r + dr, c + dc
            if 0 < nr < rows - 1 and 0 < nc < cols - 1:
                if (nr, nc) not in visited:
                    neighbors.append((nr, nc, dr, dc))
                    
        if neighbors:
            # Choose one random unvisited neighbor
            nr, nc, dr, dc = random.choice(neighbors)
            
            # Carve path to it
            maze[r + dr // 2][c + dc // 2] = 0
            maze[nr][nc] = 0
            
            visited.add((nr, nc))
            stack.append((nr, nc))
        else:
            stack.pop()
            
    # Always ensure standard start and goal cells are open
    if rows > 2 and cols > 2:
        maze[1][1] = 0
        maze[rows - 2][cols - 2] = 0
        
        # Ensure start and goal are connected to the maze paths
        # Connect start node (1, 1) to a neighbor
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = 1 + dr, 1 + dc
            if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] == 0:
                break
        else:
            if cols > 2:
                maze[1][2] = 0
                
        # Connect goal node (rows-2, cols-2) to a neighbor
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = rows - 2 + dr, cols - 2 + dc
            if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] == 0:
                break
        else:
            if cols > 2:
                maze[rows - 2][cols - 3] = 0

    maze[0][0] = 0
    maze[rows - 1][cols - 1] = 0
    
    return maze