// src/services/wakeword.js
let porcupineWorker = null;

export const initWakeWord = async (onWakeWordDetected) => {
  if (porcupineWorker) return;

  // Dynamically create a Web Worker using the Porcupine Web worker URL
  const workerUrl = new URL(
    "@picovoice/porcupine-web/dist/porcupine-web-worker.min.js",
    import.meta.url
  );

  porcupineWorker = new Worker(workerUrl, { type: "module" });

  porcupineWorker.postMessage({
    command: "init",
    keywords: ["jarvis"],
    sensitivities: [0.7],
  });

  porcupineWorker.onmessage = (e) => {
    if (e.data && e.data.keywordIndex !== undefined) {
      onWakeWordDetected();
    }
  };

  // Start microphone capture
  porcupineWorker.postMessage({ command: "start" });
};

export const stopWakeWord = async () => {
  if (porcupineWorker) {
    porcupineWorker.postMessage({ command: "stop" });
    porcupineWorker.terminate();
    porcupineWorker = null;
  }
};
