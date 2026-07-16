# 🚀 Valen's Visual Lab

Una plataforma interactiva para aprender y visualizar algoritmos de ciencias de la computación a través de animaciones paso a paso.

Valen's Visual Lab busca hacer que los algoritmos sean más fáciles de entender, permitiendo a los usuarios explorar su ejecución de forma visual e intuitiva.

## ✨ Features

- 📊 Playground interactivo de algoritmos
- 📚 Explicaciones educativas
- 🔍 Búsqueda y filtro de algoritmos
- 📱 Diseño responsive
- ⚙️ Demo de **Web Workers** para comparar ejecución en el hilo principal vs. en un hilo aparte

## 🛠️ Tecnologías usadas

- HTML5
- CSS3
- JavaScript (ES6+)
- TypeScript
- Web Workers API

## 🚀 Getting Started

Clonar el repositorio:

```bash
git clone https://github.com/Valencinn/Valens-Visual-Lab.git
```

Entrar a la carpeta del proyecto:

```bash
cd Valens-Visual-Lab
```

Instalar las dependencias:

```bash
npm install
```

Levantar el servidor de desarrollo:

```bash
npm run dev
```

Abrir en el navegador:

```
http://localhost:5173
```

## ⚙️ Demo: Web Worker

Proba en cualquier algoritmo este codigo que deberia crashear un editor de codigo.

```javascript
let result = 0;

for (let i = 0; i < 50_000_000_000; i++) {
    result += Math.sqrt(i);

    if (i % 100_000_000 === 0) {
        postMessage(`Progress: ${((i / 50_000_000_000) * 100).toFixed(2)}%`);
    }
}

postMessage(result);
```

## 📄 License

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Author

**Valentín Sierra**
GitHub: [https://github.com/Valencinn](https://github.com/Valencinn)