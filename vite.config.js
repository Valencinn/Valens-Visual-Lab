import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: "./index.html",
                admin: "./admin.html",
                about: "./about.html",
                algorithms: "./algorithms.html",
                algorithm: "./algorithm.html"
            }
        }
    }
});