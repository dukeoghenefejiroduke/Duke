export function detectIntent(text) {
  text = text.toLowerCase();

  if (text.includes("time")) return "TIME";
  if (text.includes("date")) return "DATE";
  if (text.includes("battery")) return "BATTERY";
  if (text.includes("location")) return "LOCATION";
  if (text.includes("photo")) return "CAMERA";

  return "AI";
}
