const PRODUCTION_API_URL = "https://shama-chicken-shop.vercel.app";

export function getApiBaseUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (configuredUrl) {
        return configuredUrl.replace(/\/+$/, "");
    }
    if (
        typeof window !== "undefined" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
    ) {
        return "http://localhost:4000";
    }
    return PRODUCTION_API_URL;
}