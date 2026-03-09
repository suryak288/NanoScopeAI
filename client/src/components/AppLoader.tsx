import { useEffect, useState } from "react";
import { waitForServer } from "../utils/checkServer";

export default function AppLoader({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function check() {
            while (!ready) {
                const ok = await waitForServer();
                if (ok) {
                    setReady(true);
                    break;
                }
                await new Promise(r => setTimeout(r, 3000));
            }
        }
        check();
    }, []);

    if (!ready) {
        return (
            <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#0b0f1a", color: "#fff", fontSize: "18px" }}>
                🔬 NanoScopeAI waking up… Please wait a few seconds.
            </div>
        );
    }

    return <>{children}</>;
}
