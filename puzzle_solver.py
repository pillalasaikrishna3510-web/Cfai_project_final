import time
import heapq

def is_solvable(state):
    """
    Check if an 8-puzzle state is solvable.
    A state is solvable if the number of inversions is even.
    """
    arr = [x for x in state if x != 0]
    inversions = 0
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] > arr[j]:
                inversions += 1
    return inversions % 2 == 0

def get_manhattan_distance(state, goal=(1, 2, 3, 4, 5, 6, 7, 8, 0)):
    """
    Calculate the Manhattan Distance heuristic for 8-puzzle.
    """
    distance = 0
    for i, val in enumerate(state):
        if val != 0:
            # Current row/col
            curr_r, curr_c = i // 3, i % 3
            # Goal row/col (based on goal state values)
            goal_idx = goal.index(val)
            goal_r, goal_c = goal_idx // 3, goal_idx % 3
            distance += abs(curr_r - goal_r) + abs(curr_c - goal_c)
    return distance

def solve_8_puzzle(start_state, goal_state=(1, 2, 3, 4, 5, 6, 7, 8, 0)):
    """
    Solves 8-puzzle using A* Search and Manhattan Distance heuristic.
    start_state: list or tuple of 9 elements
    goal_state: tuple of 9 elements
    Returns: (path, execution_time_ms, nodes_explored, is_solvable)
    """
    start_time = time.perf_counter()
    start_tup = tuple(start_state)
    
    if not is_solvable(start_tup):
        end_time = time.perf_counter()
        return [], (end_time - start_time) * 1000, 0, False
        
    if start_tup == goal_state:
        end_time = time.perf_counter()
        return [list(start_tup)], (end_time - start_time) * 1000, 1, True
        
    # Heap stores: (f_score, g_score, count, state, parent_state)
    count = 0
    h_start = get_manhattan_distance(start_tup, goal_state)
    open_set = [(h_start, 0, count, start_tup)]
    
    g_score = {start_tup: 0}
    parent = {start_tup: None}
    visited = set()
    nodes_explored = 0
    
    found = False
    
    while open_set:
        f, g, _, curr = heapq.heappop(open_set)
        
        if curr in visited:
            continue
        visited.add(curr)
        nodes_explored += 1
        
        if curr == goal_state:
            found = True
            break
            
        # Find 0 index
        zero_idx = curr.index(0)
        r, c = zero_idx // 3, zero_idx % 3
        
        # Directions for blank tile: Up, Down, Left, Right
        moves = []
        if r > 0: moves.append(zero_idx - 3) # Up
        if r < 2: moves.append(zero_idx + 3) # Down
        if c > 0: moves.append(zero_idx - 1) # Left
        if c < 2: moves.append(zero_idx + 1) # Right
        
        curr_list = list(curr)
        for move_idx in moves:
            # Swap 0 and the target tile
            next_list = list(curr_list)
            next_list[zero_idx], next_list[move_idx] = next_list[move_idx], next_list[zero_idx]
            next_tup = tuple(next_list)
            
            tentative_g = g + 1
            if next_tup not in g_score or tentative_g < g_score[next_tup]:
                g_score[next_tup] = tentative_g
                parent[next_tup] = curr
                f_score = tentative_g + get_manhattan_distance(next_tup, goal_state)
                count += 1
                heapq.heappush(open_set, (f_score, tentative_g, count, next_tup))
                
    path = []
    if found:
        curr = goal_state
        while curr is not None:
            path.append(list(curr))
            curr = parent[curr]
        path.reverse()
        
    end_time = time.perf_counter()
    execution_time = (end_time - start_time) * 1000
    
    return path, execution_time, nodes_explored, True
