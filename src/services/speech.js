import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export async function startListening(callback) {
  await SpeechRecognition.start({
    language: 'en-US',
    partialResults: true,
  });

  SpeechRecognition.addListener('partialResults', e => {
    const text = e.value?.[0];
    if (text) callback(text);
  });
}

export async function speak(text) {
  await TextToSpeech.stop();
  await TextToSpeech.speak({
    text,
    lang: 'en-GB',
    rate: 0.95,
  });
}
