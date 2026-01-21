interface CardData {
    id: string;
    name: string;
    description: string;
    difficulty: string;
}

const container = document.getElementById("algorithmsContainer") as HTMLElement;

async function loadData(): Promise<CardData[]> {
    try {
        const response = await fetch("./algorithms.json");
        if (!response.ok) throw new Error("Error al cargar JSON");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

function createCard(data: CardData): HTMLElement {
    const card = document.createElement("article");
    card.className = "algo-card";

    const difficultyClass = `difficulty-${data.difficulty.toLowerCase()}`;

    card.innerHTML = `
        <span class="difficulty-badge ${difficultyClass}">${data.difficulty}</span>
        <h3>${data.name}</h3>
        <p class="algo-description">${data.description}</p>
    `;
    return card;
}

async function renderCards(): Promise<void> {
    const items = await loadData();
    if (container) {
        container.innerHTML = "";
        items.forEach(item => container.appendChild(createCard(item)));
    }
}

renderCards();
