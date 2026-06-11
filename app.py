import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the directory containing this file to the python path to prevent import issues
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from bfs import bfs
from dfs import dfs
from astar import astar
from dijkstra import dijkstra
from greedy_bfs import greedy_bfs
from maze_generator import generate_maze
from puzzle_solver import solve_8_puzzle

app = Flask(__name__)
CORS(app)

@app.route("/api/generate-maze", methods=["POST"])
def api_generate_maze():
    data = request.get_json() or {}
    rows = data.get("rows", 15)
    cols = data.get("cols", 15)
    maze_type = data.get("type", "dfs")
    
    maze = generate_maze(rows, cols, maze_type)
    return jsonify({"maze": maze})

@app.route("/api/solve", methods=["POST"])
def api_solve():
    data = request.get_json() or {}
    maze = data.get("maze")
    start = data.get("start", [1, 1])
    goal = data.get("goal")
    algorithm = data.get("algorithm", "astar")
    weights = data.get("weights")
    
    if not maze:
        return jsonify({"error": "No maze grid provided"}), 400
        
    if goal is None:
        goal = [len(maze) - 2, len(maze[0]) - 2]
        
    start_tuple = tuple(start)
    goal_tuple = tuple(goal)
    
    if algorithm == "bfs":
        path, visited, exec_time, nodes = bfs(maze, start_tuple, goal_tuple)
    elif algorithm == "dfs":
        path, visited, exec_time, nodes = dfs(maze, start_tuple, goal_tuple)
    elif algorithm == "astar":
        path, visited, exec_time, nodes = astar(maze, start_tuple, goal_tuple, weights)
    elif algorithm == "dijkstra":
        path, visited, exec_time, nodes = dijkstra(maze, start_tuple, goal_tuple, weights)
    elif algorithm == "greedy":
        path, visited, exec_time, nodes = greedy_bfs(maze, start_tuple, goal_tuple, weights)
    else:
        return jsonify({"error": f"Unknown algorithm: {algorithm}"}), 400
        
    return jsonify({
        "path": path,
        "visited": visited,
        "executionTime": exec_time,
        "nodesExplored": nodes
    })

@app.route("/api/solve-all", methods=["POST"])
def api_solve_all():
    data = request.get_json() or {}
    maze = data.get("maze")
    start = data.get("start", [1, 1])
    goal = data.get("goal")
    weights = data.get("weights")
    
    if not maze:
        return jsonify({"error": "No maze grid provided"}), 400
        
    if goal is None:
        goal = [len(maze) - 2, len(maze[0]) - 2]
        
    start_tuple = tuple(start)
    goal_tuple = tuple(goal)
    
    results = {}
    
    # BFS
    try:
        path, visited, exec_time, nodes = bfs(maze, start_tuple, goal_tuple)
        results["bfs"] = {
            "success": len(path) > 0,
            "path": path,
            "visited": visited,
            "executionTime": exec_time,
            "nodesExplored": nodes
        }
    except Exception as e:
        results["bfs"] = {"success": False, "error": str(e)}
        
    # DFS
    try:
        path, visited, exec_time, nodes = dfs(maze, start_tuple, goal_tuple)
        results["dfs"] = {
            "success": len(path) > 0,
            "path": path,
            "visited": visited,
            "executionTime": exec_time,
            "nodesExplored": nodes
        }
    except Exception as e:
        results["dfs"] = {"success": False, "error": str(e)}
        
    # A*
    try:
        path, visited, exec_time, nodes = astar(maze, start_tuple, goal_tuple, weights)
        results["astar"] = {
            "success": len(path) > 0,
            "path": path,
            "visited": visited,
            "executionTime": exec_time,
            "nodesExplored": nodes
        }
    except Exception as e:
        results["astar"] = {"success": False, "error": str(e)}
        
    # Dijkstra
    try:
        path, visited, exec_time, nodes = dijkstra(maze, start_tuple, goal_tuple, weights)
        results["dijkstra"] = {
            "success": len(path) > 0,
            "path": path,
            "visited": visited,
            "executionTime": exec_time,
            "nodesExplored": nodes
        }
    except Exception as e:
        results["dijkstra"] = {"success": False, "error": str(e)}
        
    # Greedy BFS
    try:
        path, visited, exec_time, nodes = greedy_bfs(maze, start_tuple, goal_tuple, weights)
        results["greedy"] = {
            "success": len(path) > 0,
            "path": path,
            "visited": visited,
            "executionTime": exec_time,
            "nodesExplored": nodes
        }
    except Exception as e:
        results["greedy"] = {"success": False, "error": str(e)}
        
    return jsonify(results)

@app.route("/api/solve-puzzle", methods=["POST"])
def api_solve_puzzle():
    data = request.get_json() or {}
    start_state = data.get("startState")
    
    if not start_state:
        return jsonify({"error": "No start state provided"}), 400
        
    path, exec_time, nodes, solvable = solve_8_puzzle(start_state)
    return jsonify({
        "path": path,
        "executionTime": exec_time,
        "nodesExplored": nodes,
        "solvable": solvable
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)