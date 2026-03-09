export async function waitForServer() {
    const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

    try {
        const res = await fetch(`${API}/api/health`);
        return res.ok;
    } catch {
        return false;
    }
}
