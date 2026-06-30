const containers = document.querySelectorAll("[data-algorithms-container], #algorithmsContainer");
const DATA_PATHS = ["./algorithms.json", "/algorithms.json", "./public/algorithms.json"];

async function loadData() {
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

  console.error("No se pudo cargar la data de algoritmos.");
  return [];
}

function getDifficultyClass(difficulty = "") {
  return `difficulty-${difficulty.toLowerCase().replace(/\s+/g, "-")}`;
}

function getImagePath(image = "") {
  return image || "./images/logopng.png";
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

function createCard(data) {
  const card = document.createElement("a");
  card.className = "algo-card";
  card.href = `./algorithm.html?id=${encodeURIComponent(data.id)}`;
  card.setAttribute("aria-label", `Open ${data.name} playground`);

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "algo-image";

  const image = document.createElement("img");
  image.src = getImagePath(data.image);
  image.alt = data.name;

  imageWrapper.appendChild(image);
  card.appendChild(imageWrapper);

  const meta = document.createElement("div");
  meta.className = "algo-card-meta";

  addTextElement(meta, "span", `difficulty-badge ${getDifficultyClass(data.difficulty)}`, data.difficulty);
  addTextElement(meta, "span", "algo-category", data.category);

  if (data.status) {
    addTextElement(meta, "span", "algo-status", data.status);
  }

  card.appendChild(meta);

  addTextElement(card, "h3", "", data.name);
  addTextElement(card, "p", "algo-description", data.description);

  if (data.timeComplexity?.average) {
    addTextElement(card, "p", "algo-complexity", `Average: ${data.timeComplexity.average}`);
  }

  addTextElement(card, "span", "algo-link", "Open playground");

  return card;
}

function renderEmptyState(container) {
  container.innerHTML = "";
  addTextElement(container, "p", "text-muted", "No algorithms available yet.");
}

async function renderCards() {
  if (!containers.length) {
    return;
  }

  const items = await loadData();

  containers.forEach((container) => {
    if (!items.length) {
      renderEmptyState(container);
      return;
    }

    container.innerHTML = "";
    items.forEach((item) => container.appendChild(createCard(item)));
  });
}

renderCards();
