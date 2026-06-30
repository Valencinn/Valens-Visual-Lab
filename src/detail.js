import { getPlaygroundForAlgorithm } from "/algorithm-playgrounds.js";

const DATA_PATHS = ["./algorithms.json", "/algorithms.json", "./public/algorithms.json"];
const hero = document.getElementById("algorithmHero");
const stepsContainer = document.getElementById("algorithmSteps");
const complexityGrid = document.getElementById("complexityGrid");
const languageLabel = document.getElementById("playgroundLanguage");
const codeEditor = document.getElementById("codeEditor");
const outputPanel = document.getElementById("codeOutput");
const runButton = document.getElementById("runCode");
const resetButton = document.getElementById("resetCode");

let starterCode = "";
let activeWorker = null;
let activeWorkerUrl = "";
let activeTimeout = null;

async function loadAlgorithms() {
  for (const path of DATA_PATHS) {
    try {
      const response = await fetch(path);

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`No se pudo cargar ${path}`, error);
    }
  }

  return [];
}

function getRequestedAlgorithmId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || window.location.hash.replace("#", "");
}

function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function renderNotFound() {
  hero.innerHTML = "";
  addTextElement(hero, "p", "detail-eyebrow", "Algorithm not found");
  addTextElement(hero, "h1", "hero-title", "Choose an algorithm");
  addTextElement(hero, "p", "hero-subtitle", "The requested algorithm does not exist in the current data.");
  document.querySelector(".detail-layout")?.classList.add("hidden");
}

function createChip(text, className = "algo-category") {
  const chip = document.createElement("span");
  chip.className = className;
  chip.textContent = text;
  return chip;
}

function renderHero(algorithm) {
  hero.innerHTML = "";

  addTextElement(hero, "p", "detail-eyebrow", algorithm.category);
  addTextElement(hero, "h1", "hero-title", algorithm.name);
  addTextElement(hero, "p", "hero-subtitle", algorithm.description);

  const chips = document.createElement("div");
  chips.className = "detail-chips";
  chips.appendChild(createChip(algorithm.difficulty, `difficulty-badge difficulty-${algorithm.difficulty.toLowerCase()}`));

  hero.appendChild(chips);
}

function renderSteps(steps) {
  stepsContainer.innerHTML = "";

  steps.forEach((step, index) => {
    const row = document.createElement("div");
    row.className = "step";

    addTextElement(row, "span", "num", String(index + 1));
    addTextElement(row, "p", "", step);

    stepsContainer.appendChild(row);
  });
}

function addComplexity(label, value) {
  const item = document.createElement("div");
  item.className = "complexity-item";

  addTextElement(item, "span", "text-muted text-sm", label);
  addTextElement(item, "strong", "", value);

  complexityGrid.appendChild(item);
}

function renderComplexity(algorithm) {
  complexityGrid.innerHTML = "";
  addComplexity("Best", algorithm.timeComplexity?.best || "N/A");
  addComplexity("Average", algorithm.timeComplexity?.average || "N/A");
  addComplexity("Worst", algorithm.timeComplexity?.worst || "N/A");
  addComplexity("Space", algorithm.spaceComplexity || "N/A");
}

function formatWorkerValue(value) {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getWorkerSource() {
  return `
const formatValue = ${formatWorkerValue.toString()};
const sendLine = (value) => self.postMessage({ type: "log", value });

console.log = (...values) => {
  sendLine(values.map(formatValue).join(" "));
};

console.error = (...values) => {
  self.postMessage({ type: "error", value: values.map(formatValue).join(" ") });
};

self.onmessage = (event) => {
  try {
    const result = new Function(event.data)();

    if (result !== undefined) {
      sendLine(formatValue(result));
    }

    self.postMessage({ type: "done" });
  } catch (error) {
    self.postMessage({ type: "error", value: error.stack || error.message });
  }
};`;
}

function stopActiveWorker() {
  if (activeWorker) {
    activeWorker.terminate();
  }

  if (activeWorkerUrl) {
    URL.revokeObjectURL(activeWorkerUrl);
  }

  if (activeTimeout) {
    window.clearTimeout(activeTimeout);
  }

  activeWorker = null;
  activeWorkerUrl = "";
  activeTimeout = null;
}

function finishWorker(worker, workerUrl) {
  if (activeWorker === worker) {
    stopActiveWorker();
  } else {
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
  }

  runButton.disabled = false;
}

function runCode() {
  const code = codeEditor.value;
  const workerUrl = URL.createObjectURL(new Blob([getWorkerSource()], { type: "text/javascript" }));
  const worker = new Worker(workerUrl);
  const lines = [];

  stopActiveWorker();

  activeWorker = worker;
  activeWorkerUrl = workerUrl;

  outputPanel.textContent = "Running...";
  runButton.disabled = true;

  activeTimeout = window.setTimeout(() => {
    outputPanel.textContent = "Execution stopped: timeout.";
    finishWorker(worker, workerUrl);
  }, 1500);

  worker.onmessage = (event) => {
    if (event.data.type === "log") {
      lines.push(event.data.value);
      outputPanel.textContent = lines.join("\n");
    }

    if (event.data.type === "error") {
      lines.push(event.data.value);
      outputPanel.textContent = lines.join("\n");
      finishWorker(worker, workerUrl);
    }

    if (event.data.type === "done") {
      if (!lines.length) {
        outputPanel.textContent = "Done.";
      }

      finishWorker(worker, workerUrl);
    }
  };

  worker.onerror = (error) => {
    outputPanel.textContent = error.message;
    finishWorker(worker, workerUrl);
  };

  worker.postMessage(code);
}

function resetCode() {
  codeEditor.value = starterCode;
  runCode();
}

async function init() {
  const requestedId = getRequestedAlgorithmId();
  const algorithms = await loadAlgorithms();
  const algorithm = algorithms.find((item) => item.id === requestedId);

  if (!algorithm) {
    renderNotFound();
    return;
  }

  const playground = getPlaygroundForAlgorithm(algorithm.id);
  starterCode = playground.code;

  document.title = `${algorithm.name} Playground`;
  renderHero(algorithm);
  renderSteps(playground.steps);
  renderComplexity(algorithm);

  languageLabel.textContent = playground.language;
  codeEditor.value = starterCode;

  runButton.addEventListener("click", runCode);
  resetButton.addEventListener("click", resetCode);
  runCode();
}

init();
