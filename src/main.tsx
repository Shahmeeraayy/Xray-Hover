import * as React from "react"
import { createRoot } from "react-dom/client"
import InteractivePortrait from "./InteractivePortrait"
import "./styles.css"

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <main className="preview-shell">
            <section className="portrait-frame">
                <InteractivePortrait
                    image="/base.png"
                    revealImage="/reveal.png"
                    backgroundText=""
                    backgroundTextColor="#D71920"
                    backgroundTextOpacity={82}
                    borderRadius={0}
                    intensity={5}
                    glowColor="#FFFFFF"
                    glowStrength={62}
                    revealSize={300}
                    revealSoftness={58}
                    showText={false}
                    title="Lorenzo"
                    subtitle="Hover to reveal"
                    textColor="#FFFFFF"
                    overlayDarkness={28}
                />
            </section>
        </main>
    </React.StrictMode>
)
