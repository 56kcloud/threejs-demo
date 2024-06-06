import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    daisyui: {
        themes: [
            {
                dark: {
                    "color-scheme": "dark",
                    "primary": "#0B94D8",
                    "secondary": "#2DB6AA",
                    "accent": "#F471B5",
                    "neutral": "#1E293B",
                    "base-100": "#101010",
                    "info": "#0CA5E9",
                    "success": "#2DD4BF",
                    "warning": "#F4BF50",
                    "error": "#FB7085",
                },
            },
        ],
    },
    plugins: [daisyui],
};

export default config;
