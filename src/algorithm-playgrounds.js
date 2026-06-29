export const PLAYGROUNDS = {
  "bubble-sort": {
    language: "JavaScript",
    steps: [
      "Compare each pair of neighbors.",
      "Swap them when the left value is greater than the right value.",
      "Repeat passes until a full pass makes no swaps."
    ],
    code: `function bubbleSort(values) {
  const arr = [...values];

  for (let pass = 0; pass < arr.length - 1; pass++) {
    let swapped = false;

    for (let i = 0; i < arr.length - pass - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }

    console.log(\`Pass \${pass + 1}: \${arr.join(", ")}\`);

    if (!swapped) break;
  }

  return arr;
}

console.log("Sorted:", bubbleSort([5, 1, 4, 2, 8]));`
  },
  "merge-sort": {
    language: "JavaScript",
    steps: [
      "Split the array into two halves.",
      "Sort each half recursively.",
      "Merge the sorted halves into one sorted array."
    ],
    code: `function merge(left, right) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i), right.slice(j));
}

function mergeSort(values) {
  if (values.length <= 1) return values;

  const middle = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, middle));
  const right = mergeSort(values.slice(middle));
  const merged = merge(left, right);

  console.log(\`\${left.join(", ")} + \${right.join(", ")} -> \${merged.join(", ")}\`);
  return merged;
}

console.log("Sorted:", mergeSort([9, 3, 7, 1, 6, 2]));`
  },
  "quick-sort": {
    language: "JavaScript",
    steps: [
      "Pick a pivot value.",
      "Partition values lower and greater than the pivot.",
      "Sort both partitions recursively and join them."
    ],
    code: `function quickSort(values) {
  if (values.length <= 1) return values;

  const pivot = values[values.length - 1];
  const lower = [];
  const equal = [];
  const greater = [];

  for (const value of values) {
    if (value < pivot) lower.push(value);
    else if (value > pivot) greater.push(value);
    else equal.push(value);
  }

  console.log("pivot:", pivot, "lower:", lower, "greater:", greater);
  return [...quickSort(lower), ...equal, ...quickSort(greater)];
}

console.log("Sorted:", quickSort([8, 4, 7, 3, 9, 2, 6]));`
  },
  dijkstra: {
    language: "JavaScript",
    steps: [
      "Start with distance 0 for the source node.",
      "Always expand the unvisited node with the smallest known distance.",
      "Relax outgoing edges when a shorter path is found."
    ],
    code: `const graph = {
  A: { B: 4, C: 2 },
  B: { D: 5 },
  C: { B: 1, D: 8, E: 10 },
  D: { E: 2, F: 6 },
  E: { F: 3 },
  F: {}
};

function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();

  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
  }

  distances[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    const current = Object.keys(distances)
      .filter((node) => !visited.has(node))
      .sort((a, b) => distances[a] - distances[b])[0];

    if (distances[current] === Infinity) break;

    for (const [neighbor, weight] of Object.entries(graph[current])) {
      const candidate = distances[current] + weight;

      if (candidate < distances[neighbor]) {
        distances[neighbor] = candidate;
        console.log(\`A -> \${neighbor} is now \${candidate}\`);
      }
    }

    visited.add(current);
  }

  return distances;
}

console.log(dijkstra(graph, "A"));`
  },
  "fibonacci-recursion": {
    language: "JavaScript",
    steps: [
      "Return n directly for the base cases 0 and 1.",
      "For larger n, solve fibonacci(n - 1) and fibonacci(n - 2).",
      "Add those two recursive answers."
    ],
    code: `function fibonacci(n) {
  if (n <= 1) return n;

  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let n = 0; n <= 8; n++) {
  console.log(\`fib(\${n}) = \${fibonacci(n)}\`);
}`
  },
  "binary-search": {
    language: "JavaScript",
    steps: [
      "Keep left and right boundaries around the search range.",
      "Check the middle value.",
      "Discard the half that cannot contain the target."
    ],
    code: `function binarySearch(values, target) {
  let left = 0;
  let right = values.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const value = values[middle];

    console.log(\`Checking index \${middle}: \${value}\`);

    if (value === target) return middle;
    if (value < target) left = middle + 1;
    else right = middle - 1;
  }

  return -1;
}

const numbers = [2, 5, 8, 12, 16, 23, 38, 56];
console.log("Found at index:", binarySearch(numbers, 23));`
  }
};

export function getPlaygroundForAlgorithm(id) {
  return PLAYGROUNDS[id] || {
    language: "JavaScript",
    steps: [
      "Read the algorithm metadata.",
      "Write an implementation.",
      "Run it with your own sample data."
    ],
    code: `console.log("Start experimenting with this algorithm.");`
  };
}
