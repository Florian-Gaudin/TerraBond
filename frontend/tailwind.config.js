/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        fontFamily: {
            title: ["Montserrat-Alt1", "sans-serif"],
            body: ["Montserrat", "sans-serif"],
        },
        colors: {
            transparent: "transparent",
            current: "currentColor",
            white: "#f5f5f5",
            purple: "#9969C0",
            red: "#FC1A4A",
            bg: "rgb(14,12,49)",
            bglight: "rgb(183, 182, 207)",
        },
        extend: {
            gradientColorStops: (theme) => ({
                "from-purple": theme("colors.purple"),
                "to-red": theme("colors.red"),
            }),
        },
    },
    plugins: [],
};
