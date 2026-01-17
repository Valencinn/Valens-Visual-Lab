 async function loadAlgorithms() {

        try {

            const response = await fetch('/src/data/algorithms.json');

            const algorithms = await response.json();

            const container = document.getElementById('algorithmsContainer');

           

            algorithms.forEach(algo => {

                const card = document.createElement('div');

                card.className = 'algo-card';

                card.innerHTML = `

                    <h3>${algo.name}</h3>

                    <span class="difficulty-badge difficulty-${algo.difficulty.toLowerCase()}">

                        ${algo.difficulty}

                    </span>

                    <p class="algo-description">${algo.description}</p>

                `;

                container.appendChild(card);

            });

        } catch (error) {

            console.error('Error loading algorithms:', error);

        }

    }

   

    loadAlgorithms();