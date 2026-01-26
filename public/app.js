const container = document.getElementById("algorithmsContainer");
async function loadData() {
    try {
        const response = await fetch("./algorithms.json");
        if (!response.ok)
            throw new Error("Error al cargar JSON");
        return await response.json();
    }
    catch (error) {
        console.error(error);
        return [];
    }
}

function createCard(data) {
    const card = document.createElement("article");
    card.className = "algo-card";

    const difficultyClass = `difficulty-${data.difficulty.toLowerCase()}`;

    card.innerHTML = `
    <div class="algo-image">
      <img src="${data.image}" alt="${data.name}">
    </div>

    <span class="difficulty-badge ${difficultyClass}">
      ${data.difficulty}
    </span>

    <h3>${data.name}</h3>
    <p class="algo-description">${data.description}</p>
  `;

    return card;
}

async function renderCards() {
    const items = await loadData();
    if (container) {
        container.innerHTML = "";
        items.forEach(item => container.appendChild(createCard(item)));
    }
}
renderCards();
