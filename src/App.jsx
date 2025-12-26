// src/App.jsx
import { useEffect, useState } from "react";
import { initWakeWord } from "./services/wakeword";
import { initSpeech, startListening } from "./services/speech";
import { processCommand } from "./core/brain";
import HUD from "./ui/hud";

function App() {
  const [status, setStatus] = useState("Initializing JARVIS...");

  useEffect(() => {
    const initJarvis = async () => {
      setStatus("JARVIS online. Listening for wake word...");
      await initSpeech();
      await initWakeWord(async () => {
        setStatus("Wake word detected. Listening...");
        startListening(async (transcript) => {
          setStatus(`Heard: ${transcript}`);
          await processCommand(transcript);
        });
      });
    };
    initJarvis();

    return () => {};
  }, []);

  return <HUD status={status} />;
}

export default App;
