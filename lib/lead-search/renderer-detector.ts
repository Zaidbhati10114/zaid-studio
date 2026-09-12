export type RendererType =
    | "static"
    | "wordpress"
    | "shopify"
    | "wix"
    | "squarespace"
    | "angular"
    | "react-spa"
    | "unknown";

export function detectRenderer(html: string): RendererType {
    const lower = html.toLowerCase();

    if (lower.includes("wp-content")) return "wordpress";

    if (lower.includes("cdn.shopify.com")) return "shopify";

    if (
        lower.includes("wixstatic.com") ||
        lower.includes("_wix")
    )
        return "wix";

    if (lower.includes("static.squarespace.com"))
        return "squarespace";

    if (
        lower.includes("<app-root") ||
        lower.includes("ng-version") ||
        lower.includes("<base href=")
    )
        return "angular";

    if (
        lower.includes("__next_data__") ||
        lower.includes("reactroot") ||
        lower.includes("react-dom")
    )
        return "react-spa";

    return "static";
}