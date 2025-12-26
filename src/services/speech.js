// src/services/speech.js
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

export const initSpeech = async () => {
  await SpeechRecognition.requestPermissions();
};

export const startListening = (onResult) => {
  SpeechRecognition.start({ language: "en-US", partialResults: true });
  SpeechRecognition.addListener("partialResults", (event) => {
    const transcript = event.value?.[0] || "";
    onResult(transcript);
  });
};

export const stopListening = async () => {
  await SpeechRecognition.stop();
};

export const speak = async (text) => {
  await TextToSpeech.speak({
    text,
    lang: "en-GB",
    rate: 0.95,
    pitch: 1.0,
    volume: 1.0,
  });
};
