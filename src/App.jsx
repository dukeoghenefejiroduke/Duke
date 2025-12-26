import { useEffect, useState } from "react";
import { brain } from "./core/brain";
import HUD from "./ui/hud";

export default function App() {
  const [status, setStatus] = useState("JARVIS initializing...");

  useEffect(() => {
    brain.init(setStatus);
  }, []);

  return <HUD status={status} />;
}