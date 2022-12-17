import { defineConfig } from "vite";
import dns from "dns";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
    server: {
        hmr: {
            clientPort: process.env.CODESPACES ? 443 : undefined,
        },
    },
});
