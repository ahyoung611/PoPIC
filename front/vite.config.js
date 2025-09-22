import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
              // "/user":   { target: "http://localhost:8080", changeOrigin: true },
              "/vendor": { target: "http://localhost:8080", changeOrigin: true },
              "/auth":   { target: "http://localhost:8080", changeOrigin: true },
              "/uploads":{ target: "http://localhost:8080", changeOrigin: true },
              "/waiting":{ target: "http://localhost:8080", changeOrigin: true },

            "/api": {
                target: "http://localhost:8080", // 스프링 포트
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
