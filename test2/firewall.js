const fs = require('fs');

function bfsExcludeNode(graph, start, exclude) {
  const numNodes = graph.length;
  const visited = Array(numNodes).fill(false);
  const queue = [start];
  visited[start] = true;
  let count = 0;

  while (queue.length > 0) {
    const node = queue.shift();
    count++;

    for (const neighbor of graph[node]) {
      if (!visited[neighbor] && neighbor !== exclude) {
        visited[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }

  return count;
}

function findBestFirewallNode(numNodes, virusLocation, graph) {
  let minImpact = Infinity;
  let bestNode = -1;
  let impactList = [];

  for (let node = 0; node < numNodes; node++) {
    if (node !== virusLocation) {
      const impact = bfsExcludeNode(graph, virusLocation, node);
      impactList.push(impact);
      if (impact < minImpact) {
        minImpact = impact;
        bestNode = node;
      }
    }
  }

  if (new Set(impactList).size === 1) {
    return -1;
  }

  return bestNode;
}

fs.readFile('./test-cases/case_4.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const input = data.trim().split('\n');
  const numNodes = parseInt(input[0]);
  const virusLocation = parseInt(input[1]);
  const numLinks = parseInt(input[2]);
  const links = input
    .slice(3, 3 + numLinks)
    .map((line) => line.split(' ').map(Number));

  const graph = Array.from({ length: numNodes }, () => []);

  for (const [u, v] of links) {
    graph[u].push(v);
    graph[v].push(u);
  }

  const bestNode = findBestFirewallNode(numNodes, virusLocation, graph);
  if (bestNode === -1) {
    console.log('No single firewall can effectively contain the virus.');
  } else {
    console.log(`Best node to place the firewall: ${bestNode}`);
  }
});
