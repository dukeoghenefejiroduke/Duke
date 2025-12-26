import { startListening, speak } from "../services/speech";
import { detectIntent } from "./intent";
import { personality } from "./personality";
import { remember, recall } from "./memory";
import { askAI } from "../services/ai";
import { getSystemStatus } from "../services/system";
import { startWakeWord } from "../services/wakeword";

// Optional: add more services as needed
import { takePhoto } from "../services/camera";
import { callContact } from "../services/contacts";

export const brain = {
  mood: "sarcastic",
  listening: false,

  async init(onUpdateStatus) {
    // Start offline wake word
    startWakeWord(() => {
      onUpdateStatus("Wake word detected. Listening...");
      this.startListening(onUpdateStatus);
    });

    // Start general speech recognition
    this.startListening(onUpdateStatus);
  },

  async startListening(onUpdateStatus) {
    if (this.listening) return;
    this.listening = true;

    startListening(async (text) => {
      if (!text.toLowerCase().includes("jarvis")) return;

      const command = text.replace(/jarvis/gi, "").trim();
      if (!command) {
        await speak("Yes, sir?");
        onUpdateStatus("Yes, sir?");
        return;
      }

      // Remember command
      await remember("lastCommand", command);

      // Detect intent
      const intent = detectIntent(command);

      let response = "";
      try {
        switch (intent) {
          case "TIME":
            response = new Date().toLocaleTimeString();
            break;
          case "DATE":
            response = new Date().toDateString();
            break;
          case "BATTERY":
          case "SYSTEM":
            response = await getSystemStatus();
            break;
          case "LOCATION":
            // Example: could use Geolocation here
            response = "You are somewhere on Earth, sir. 😉";
            break;
          case "CAMERA":
            response = await takePhoto();
            break;
          case "CALL":
            await callContact(command);
            return;
          default:
            response = await askAI(command);
        }

        // Apply personality
        response = personality(response, this.mood);

        // Speak and update UI
        await speak(response);
        onUpdateStatus(response);

      } catch (err) {
        console.error("Brain error:", err);
        await speak("I encountered a problem, sir.");
        onUpdateStatus("Error in brain.js");
      }
    });
  },

  async setMood(newMood) {
    this.mood = newMood;
  },

  async recallMemory(key) {
    return await recall(key);
  },
};
