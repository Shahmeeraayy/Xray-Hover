import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            framer: path.resolve(__dirname, "src/framer-preview.ts"),
        },
    },
    server: {
        fs: {
            allow: [".."],
        },
    },
})
