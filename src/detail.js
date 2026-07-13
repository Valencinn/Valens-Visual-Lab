import { getPlaygroundForAlgorithm } from "./algorithm-playgrounds";

//para q cargue de algorithms.json, lo dejo asi pq a veces no funciona bien con solo uno
const DATA_PATHS = ["./algorithms.json", "/algorithms.json", "./public/algorithms.json"];

//dom management
const hero = document.getElementById("algorithmHero");
const stepsContainer = document.getElementById("algorithmSteps");
const complexityGrid = document.getElementById("complexityGrid");
const languageLabel = document.getElementById("playgroundLanguage");
const codeEditor = document.getElementById("codeEditor");
const outputPanel = document.getElementById("codeOutput");
const runButton = document.getElementById("runCode");
const resetButton = document.getElementById("resetCode");

//variables de stado para los web workers del playground
let starterCode = "";
let activeWorker = null;
let activeWorkerUrl = "";
let activeTimeout = null;

/*fetch del json */
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

/*obtiene el id del algoritmo desde la URL. va como parametro ?id= y el hash x si acaso pero todavia no funciono asi creo?*/
function getRequestedAlgorithmId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || window.location.hash.replace("#", "");
}

/*creea un elemento html con texto y lo agrega a un contenedor*/
function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  parent.appendChild(element);
  return element;
}

/*en el caso de no encontrar algoritmo llena la data con esto*/
function renderNotFound() {
  hero.innerHTML = "";
  addTextElement(hero, "p", "detail-eyebrow", "Algorithm not found");
  addTextElement(hero, "h1", "hero-title", "Choose an algorithm");
  addTextElement(hero, "p", "hero-subtitle", "The requested algorithm does not exist in the current data.");
  document.querySelector(".detail-layout")?.classList.add("hidden");
}

/* chip reutilizable para meter info*/
function createChip(text, className = "algo-category") {
  const chip = document.createElement("span");
  chip.className = className;
  chip.textContent = text;
  return chip;
}

/* render del hero de algorithm*/
function renderHero(algorithm) {
  hero.innerHTML = "";

  addTextElement(hero, "p", "detail-eyebrow", algorithm.category);
  addTextElement(hero, "h1", "hero-title", algorithm.name);
  addTextElement(hero, "p", "hero-subtitle", algorithm.description);

  const chips = document.createElement("div");
  chips.className = "detail-chips";
  chips.appendChild(
    createChip(
      algorithm.difficulty,
      `difficulty-badge difficulty-${algorithm.difficulty.toLowerCase()}`
    )
  );

  hero.appendChild(chips);
}

/*carga la data en las boxes*/
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

/*renderiza la .timeComplexity de cada algoritm*/
function renderComplexity(algorithm) {
  complexityGrid.innerHTML = "";
  addComplexity("Best", algorithm.timeComplexity?.best || "N/A");
  addComplexity("Average", algorithm.timeComplexity?.average || "N/A");
  addComplexity("Worst", algorithm.timeComplexity?.worst || "N/A");
  addComplexity("Space", algorithm.spaceComplexity || "N/A");
}

/*hace que sea texto para que pase x el playground*/
function formatWorkerValue(value) {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/*Genera el código fuente del Web Worker encargado*/
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

/* finaliza el worker activo*/
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

/* finaliza el web worker
 */
function finishWorker(worker, workerUrl) {
  if (activeWorker === worker) {
    stopActiveWorker();
  } else {
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
  }

  runButton.disabled = false;
}

/* runCode es la funcion q ejecuta el codigo puesto en la box de codigo! */
function runCode() {
  const code = codeEditor.value;
  const workerUrl = URL.createObjectURL(
    new Blob([getWorkerSource()], { type: "text/javascript" })
  );
  const worker = new Worker(workerUrl);
  const lines = [];

  stopActiveWorker();

  activeWorker = worker;
  activeWorkerUrl = workerUrl;

  outputPanel.textContent = "Running...";
  runButton.disabled = true;

  //esto es buena praxis basicamente, evita que el cpu siga corriendo xq sigue corriendo el codigo del usuario
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

/*reset del playground*/
function resetCode() {
  codeEditor.value = starterCode;
  runCode();
}

/* init carga los algos, busca el /url, render de la info y setea el playground*/
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

//corremos la app
init();