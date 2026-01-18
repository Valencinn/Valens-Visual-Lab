interface CardData {
    id: string;
    name: string;
    description: string;
    difficulty: string;
}

const container = document.getElementById("algorithmsContainer") as HTMLElement;

async function loadData(): Promise<CardData[]> {
    try {
        const response = await fetch("./data.json");
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
    card.innerHTML = `
        <h3>${data.name}</h3>
        <p>${data.description}</p>
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
