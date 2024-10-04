import { createFont } from "@frontend/design-system-core/typography";

const mainFont = createFont({
    family: "Work Sans",
    prefix: undefined,
    variants: {
        h4: { component: "h4", fontSize: "2rem", lineHeight: "119%", fontWeight: 700 },
        h6: { component: "h6", fontSize: "1.25rem", lineHeight: "130%", fontWeight: 700 },
        heading: { component: "h6", fontSize: "1rem", lineHeight: "150%", fontWeight: 600 },
        body1: { component: "p", fontSize: "1rem", lineHeight: "150%" },
        body2: { component: "p", fontSize: "0.875rem", lineHeight: "171%" },
        caption1: { component: "p", fontSize: "0.875rem", lineHeight: "143%" },
        caption2: { component: "p", fontSize: "0.75rem", lineHeight: "133%" },
        caption3: { component: "p", fontSize: "0.6rem", lineHeight: "123%" },
    },
    weights: ["thin", "extraLight", "light", "regular", "medium", "semibold", "bold", "extraBold", "black"],
});

export const fonts = [mainFont] as const;
