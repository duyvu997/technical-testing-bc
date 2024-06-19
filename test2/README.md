### Requirements
A virus is installed in one of the nodes of a network. The goal is to protect the largest possible part of the network from the virus by placing a firewall on a single node that the virus cannot traverse.
You must output the optimal location of the firewall. You cannot place your firewall on an infected node.    

`NOTE`: The virus can spread through any link in the network. Solutions are unique, no tiebreak is needed.
#### Input   

- Line 1: An integer, numNodes, the number of nodes in the network
- Line 2: An integer, virusLocation, the starting node of the virus
- Line 3: An integer, numLinks, the number of links within the network
-  Next numLinks lines: Two space-separated integers i and j representing the indexes of the nodes connected by the undirected link
#### Output

An integer firewallLocation, the index of the node where the firewall should be placed.


#### Constraints

- 5 <= numNodes <= 500
- numNodes-2 < numLinks < 800   

### How to run 


#### step 1
add the input to folder `test-cases/case_*.txt`

#### step 2
modify the test case you want to test in `firewall.js`
```
fs.readFile('./test-cases/case_3.txt', 'utf8', (err, data)
```

#### step 3
```
node firewall.js
```

#### optional
to ease to evaluate the result.
run file `graph.html` to visualize the graph. put the test case into input box

### Summary solution
the idea of solution is bruce force. select a node (except virus node), then try to travel over the graph(use BFS) and exclude one node, keep track the impact results. 

example: `(node X, impact 10), (node Y, impact 19)` that mean when you set firewall on X, this minimal the impact. 

#### Output:
If bestNode is -1, it prints: "No single firewall can effectively contain the virus."   
Otherwise, it prints: "Best node to place the firewall: {bestNode}"

#### Cons 
Bruce force and depend on BFS
#### Pros
Operates in O(V + E) time complexity, where V is the number of vertices (nodes) and E is the number of edges (links).This is efficient for medium-sized graphs typically encountered in practical applications.
