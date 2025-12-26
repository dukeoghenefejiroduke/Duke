// src/services/wakeword.js
import { PorcupineWorkerFactory } from "@picovoice/porcupine-web";

let porcupineWorker = null;

export const initWakeWord = async (onWakeWordDetected) => {
  if (porcupineWorker) return;

  // Initialize Porcupine Web with a keyword (Jarvis)
  porcupineWorker = await PorcupineWorkerFactory.create(
    {
      keywords: ["jarvis"],  // You can add more keywords if desired
      sensitivity: [0.7],
    },
    (keywordIndex) => {
      // Trigger callback when wake word detected
      onWakeWordDetected();
    }
  );
};

export const processAudioFrame = (pcmFrame) => {
  if (porcupineWorker) porcupineWorker.postMessage(pcmFrame);
};

export const stopWakeWord = () => {
  if (porcupineWorker) {
    porcupineWorker.terminate();
    porcupineWorker = null;
  }
};
