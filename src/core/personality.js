export function personality(text, mood = "neutral") {
  switch (mood) {
    case "sarcastic":
      return `${text}... obviously.`;
    case "friendly":
      return `${text}, sir 🙂`;
    case "serious":
      return text;
    default:
      return text;
  }
}
