//buscamos los containers
const containers = document.querySelectorAll(
  "[data-algorithms-container], #algorithmsContainer"
);

//rutas
const DATA_PATHS = [
  "./algorithms.json",
  "/algorithms.json",
  "./public/algorithms.json"
];

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

  console.error("no paso el json");

  return [];
}

//generamos clase de css dinamica dependiendo dela dificultad (sobre todo para lo del color)
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

  //insertamos el texto
  element.textContent = text;
  parent.appendChild(element);

  return element;
}

//creaciond e card
function createCard(data) {

  const card = document.createElement("a");
  card.className = "algo-card";

  //linkea el algoritmo al playground seleccionado
  card.href = `./algorithm.html?id=${encodeURIComponent(data.id)}`;

  //acces
  card.setAttribute("aria-label", `Open ${data.name} playground`);

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "algo-image";
  const image = document.createElement("img");
  image.src = getImagePath(data.image);
  image.alt = data.name;

  imageWrapper.appendChild(image);
  card.appendChild(imageWrapper);

  //dif y categoria
  const meta = document.createElement("div");
  meta.className = "algo-card-meta";

  //dificultad
  addTextElement(
    meta,
    "span",
    `difficulty-badge ${getDifficultyClass(data.difficulty)}`,
    data.difficulty
  );

  //categoria
  addTextElement(
    meta,
    "span",
    "algo-category",
    data.category
  );

  card.appendChild(meta);

  addTextElement(card, "h3", "", data.name);

  // descripcion
  addTextElement(
    card,
    "p",
    "algo-description",
    data.description
  );

  //complejida
  if (data.timeComplexity?.average) {
    addTextElement(
      card,
      "p",
      "algo-complexity",
      `Average: ${data.timeComplexity.average}`
    );
  }

  addTextElement(
    card,
    "span",
    "algo-link",
    "Open playground"
  );

  return card;
}

async function renderCards() {

  //si no hay container no corremos
  if (!containers.length) {
    return;
  }

  //json
  const items = await loadData();

  containers.forEach((container) => {

    if (!items.length) {
      renderEmptyState(container);
      return;
    }

    container.innerHTML = ""; //limpiamos el contenedor x si acaso

    items.forEach((item) =>
      container.appendChild(createCard(item))
    );
  });
}

renderCards();