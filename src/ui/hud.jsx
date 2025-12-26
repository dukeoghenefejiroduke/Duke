// src/ui/hud.jsx
import { useEffect } from "react";
import "tsparticles";

export default function HUD({ status }) {
  useEffect(() => {
    if (window.tsParticles) {
      window.tsParticles.load("particles-js", {
        particles: { number: { value: 80 }, color: { value: "#00d8ff" }, move: { enable: true } },
      });
    }
  }, []);

  return (
    <div className="jarvis-container">
      <div id="particles-js"></div>
      <div className="jarvis-ui">
        <h1>JARVIS</h1>
        <p className="status">{status}</p>
      </div>
    </div>
  );
}
