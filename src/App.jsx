import { runJarvisTest } from './core/testMode';

function App() {
  const [status, setStatus] = useState('Initializing JARVIS...');

  // Add this button in your UI
  return (
    <div className="jarvis-ui">
      <h1>JARVIS</h1>
      <p className="status">{status}</p>

      <button onClick={() => runJarvisTest(setStatus)}>
        Run JARVIS Test Mode
      </button>

      <div className="hint">
        Say: "Jarvis" + command<br />
        Try: time, location, call Mom, take photo, play music, bluetooth
      </div>
    </div>
  );
}
