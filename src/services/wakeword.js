import { PorcupineManager } from "@picovoice/porcupine-react-native";

export async function startWakeWord(onWake) {
  const manager = await PorcupineManager.fromKeywords(
    ["jarvis"],
    () => onWake()
  );

  await manager.start();
}
