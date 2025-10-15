import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    server: {
        host: true, // true = 0.0.0.0
        port: 5173,
        strictPort: true, // 포트가 이미 사용 중이면 에러
        proxy: {
            "/waiting":{ target: "http://3.34.97.40:8080", changeOrigin: true },
            "/api": {
                target: "http://3.34.97.40:8080", // 스프링 포트
                changeOrigin: true,
                secure: false,
            },
            // "/auth": {
            //     target: "http://localhost:8080",
            //     changeOrigin: true,
            //     secure: false,
            // },
        },
    },
});
