import './App.css';
import { useEffect, useState, useRef } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Contacts } from '@capacitor-community/contacts';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { App as CapacitorApp } from '@capacitor/app';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [status, setStatus] = useState('Initializing JARVIS...');
  const listeningRef = useRef(false);
  const speakingRef = useRef(false);

  // ⚠️ WARNING: Move this to backend later
  const GEMINI_API_KEY = 'AIzaSyBKQ07Jd8dNw-cfwQ_JQDL15TrjBx6RHeE';

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `
You are JARVIS, Tony Stark’s AI.
Short, intelligent, slightly sarcastic.
Call the user "sir" occasionally.
`
  });

  // -------------------------
  // CORE INITIALIZATION
  // -------------------------
  useEffect(() => {
    const init = async () => {
      try {
        setStatus('JARVIS online. Listening...');

        await SpeechRecognition.requestPermissions();

        startListening();

        CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) startListening();
        });

        SpeechRecognition.addListener('listeningState', (state) => {
          if (!state.listening) startListening();
        });

        SpeechRecognition.addListener('partialResults', handleSpeech);

      } catch (err) {
        setStatus('Initialization failed.');
        console.error(err);
      }
    };

    init();

    return () => {
      SpeechRecognition.stop();
    };
  }, []);

  // -------------------------
  // SPEECH LISTENER
  // -------------------------
  const startListening = async () => {
    if (listeningRef.current) return;

    try {
      listeningRef.current = true;
      await SpeechRecognition.start({
        language: 'en-US',
        partialResults: true,
      });
    } catch {
      listeningRef.current = false;
    }
  };

  // -------------------------
  // SPEECH HANDLER
  // -------------------------
  const handleSpeech = async (event) => {
    const transcript = event.value?.[0]?.toLowerCase();
    if (!transcript || !transcript.includes('jarvis')) return;

    const query = transcript.replace(/jarvis/gi, '').trim();
    if (!query) {
      await speak('Yes, sir?');
      return;
    }

    let response = '';

    try {
      if (query.includes('time')) {
        response = `It is ${new Date().toLocaleTimeString('en-GB')}, sir.`;

      } else if (query.includes('date')) {
        response = new Date().toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      } else if (query.includes('location')) {
        const pos = await Geolocation.getCurrentPosition();
        response = `Latitude ${pos.coords.latitude.toFixed(4)}, longitude ${pos.coords.longitude.toFixed(4)}. Try not to wander off, sir.`;

      } else if (query.includes('call')) {
        await callContact(query.replace(/call|dial|phone/gi, '').trim());
        return;

      } else if (query.includes('photo') || query.includes('camera')) {
        await takePhoto();
        return;

      } else if (query.includes('bluetooth')) {
        const { value } = await BluetoothLe.isEnabled();
        response = value ? 'Bluetooth is enabled, sir.' : 'Bluetooth is disabled, sir.';

      } else {
        if (query.length < 4) return;

        const result = await model.generateContent(query);
        response = result.response.text();
      }

      await speak(response);
      setStatus(response);

    } catch (err) {
      console.error(err);
      await speak('Something went wrong, sir.');
    }
  };

  // -------------------------
  // SPEAK FUNCTION
  // -------------------------
  const speak = async (text) => {
    if (speakingRef.current) await TextToSpeech.stop();

    speakingRef.current = true;

    await TextToSpeech.speak({
      text,
      lang: 'en-GB',
      rate: 0.95,
      pitch: 1.0,
      volume: 1.0,
    });

    speakingRef.current = false;
  };

  // -------------------------
  // CONTACT CALLING
  // -------------------------
  const callContact = async (name) => {
    try {
      const perm = await Contacts.checkPermissions();
      if (perm.contacts !== 'granted') await Contacts.requestPermissions();

      const res = await Contacts.getContacts();
      const person = res.contacts.find(c =>
        c.name?.display?.toLowerCase().includes(name.toLowerCase())
      );

      if (person?.phoneNumbers?.[0]) {
        window.location.href = `tel:${person.phoneNumbers[0].number}`;
        await speak(`Calling ${person.name.display}, sir.`);
      } else {
        await speak(`I cannot find ${name}, sir.`);
      }
    } catch {
      await speak('Contacts access failed, sir.');
    }
  };

  // -------------------------
  // CAMERA
  // -------------------------
  const takePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: 'base64',
      });

      await speak('Analyzing image, sir.');

      const result = await model.generateContent([
        'Describe this image in a witty JARVIS tone.',
        {
          inlineData: {
            data: photo.base64,
            mimeType: 'image/jpeg',
          },
        },
      ]);

      const text = result.response.text();
      setStatus(text);
      await speak(text);

    } catch {
      await speak('Camera failure, sir.');
    }
  };

  return (
    <div className="jarvis-container">
      <div id="particles-js"></div>

      <div className="jarvis-ui">
        <h1>JARVIS</h1>
        <p className="status">{status}</p>
        <div className="hint">
          Say: <b>"Jarvis"</b> + command<br />
          Example: time, location, call mom, take photo
        </div>
      </div>
    </div>
  );
}

export default App;