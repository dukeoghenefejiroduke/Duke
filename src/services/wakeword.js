// src/services/wakeword.js
import PorcupineWorker from "@picovoice/porcupine-web/dist/porcupine-web-worker.js";

let porcupineWorker = null;

export const initWakeWord = async (onWakeWordDetected) => {
  if (porcupineWorker) return;

  porcupineWorker = new PorcupineWorker({
    keywords: ["jarvis"],
    sensitivities: [0.7],
    onKeywordDetected: (keywordIndex) => {
      onWakeWordDetected();
    },
  });

  // Start microphone capture
  await porcupineWorker.start();
};

export const stopWakeWord = async () => {
  if (porcupineWorker) {
    await porcupineWorker.stop();
    porcupineWorker.terminate();
    porcupineWorker = null;
  }
};
