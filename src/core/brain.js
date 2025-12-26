// src/core/brain.js
import { speak } from "../services/speech";
import { askAI } from "../services/ai";
import {
  takePhoto,
  getLocation,
  callContact,
  controlMedia,
  checkBluetooth,
} from "../services/system";

export const processCommand = async (command) => {
  const query = command.toLowerCase().replace(/jarvis/gi, "").trim();
  if (!query) return speak("Yes, sir?");

  if (query.includes("time")) return speak(`The current time is ${new Date().toLocaleTimeString("en-GB")}, sir.`);
  if (query.includes("date")) return speak(`Today is ${new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`);
  if (query.includes("location") || query.includes("where am i")) {
    const coords = await getLocation();
    return speak(coords ? `You are at latitude ${coords.latitude.toFixed(4)}, longitude ${coords.longitude.toFixed(4)}. Try not to get lost again, sir.` : "Location access denied, sir.");
  }
  if (query.includes("call") || query.includes("phone") || query.includes("dial")) {
    const name = query.replace(/call|phone|dial|ring/gi, "").trim();
    const result = await callContact(name);
    return speak(result);
  }
  if (query.includes("photo") || query.includes("picture") || query.includes("camera")) {
    const photo = await takePhoto();
    if (photo) {
      const description = await askAI([
        "Describe this image in JARVIS's sarcastic style.",
        { inlineData: { data: photo, mimeType: "image/jpeg" } },
      ]);
      return speak(description);
    } else return speak("Camera failed, sir.");
  }
  if (query.includes("play") || query.includes("pause") || query.includes("next")) {
    const action = query.includes("play") ? "play" : query.includes("pause") ? "pause" : "next";
    const result = await controlMedia(action);
    return speak(result);
  }
  if (query.includes("bluetooth")) {
    const status = await checkBluetooth();
    return speak(status);
  }

  // Default AI response
  const response = await askAI(query);
  return speak(response);
};
