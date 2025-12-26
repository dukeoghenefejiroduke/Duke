import { useEffect, useState } from 'react';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Contacts } from '@capacitor-community/contacts';
import { Preferences } from '@capacitor/preferences';
import { GoogleGenerativeAI } from '@google/generative-ai';

import './App.css';

function App() {
  const [status, setStatus] = useState('Initializing JARVIS...');

  const GEMINI_API_KEY = 'AIzaSyBKQ07Jd8dNw-cfwQ_JQDL15TrjBx6RHeE';
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: `You are JARVIS, Tony Stark's highly intelligent, sarcastic, dry-witted British AI assistant from Iron Man. 
    Respond concisely, with subtle superiority and humor. Use "sir" occasionally. Be extremely helpful.`
  });

  useEffect(() => {
    const initJarvis = async () => {
      try {
        // Startup (no vibration – removed for Android 9 compatibility)
        setStatus('JARVIS online. Listening for wake word...');

        await SpeechRecognition.requestPermissions();

        await SpeechRecognition.startListening({
          language: 'en-US',
          partialResults: true,
          maxResults: 10,
        });

        SpeechRecognition.addListener('partialResults', async (event) => {
          const transcript = event.matches?.[0]?.toLowerCase() || '';
          
          if (transcript.includes('jarvis')) {
            // Wake word detected (no vibration – removed)
            
            const query = transcript.replace(/jarvis/gi, '').trim();

            let userMessage = query || "Yes, sir?";

            let responseText = "";

            if (query.includes('time')) {
              responseText = `The current time is ${new Date().toLocaleTimeString('en-GB')}, sir.`;
            } else if (query.includes('date')) {
              responseText = `Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
            } else if (query.includes('location') || query.includes('where am i')) {
              try {
                const pos = await Geolocation.getCurrentPosition();
                responseText = `You are at latitude ${pos.coords.latitude.toFixed(4)}, longitude ${pos.coords.longitude.toFixed(4)}. Try not to get lost again, sir.`;
              } catch {
                responseText = "Location access denied, sir.";
              }
            } else if (query.includes('call') || query.includes('phone') || query.includes('dial')) {
              const name = query.replace(/call|phone|dial|ring/gi, '').trim();
              await callContact(name);
              return;
            } else if (query.includes('photo') || query.includes('picture') || query.includes('camera')) {
              await takeAndAnalyzePhoto();
              return;
            } else {
              try {
                const result = await model.generateContent(userMessage);
                responseText = result.response.text();
              } catch (e) {
                responseText = "I'm having trouble connecting to my higher functions, sir. Please check your internet.";
              }
            }

            await speak(responseText);
            setStatus(responseText);
          }
        });

      } catch (error) {
        setStatus('Error initializing JARVIS: ' + error.message);
      }
    };

    initJarvis();

    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 100 },
          color: { value: '#00d8ff' },
          shape: { type: 'circle' },
          opacity: { value: 0.6, random: true },
          size: { value: 3 },
          line_linked: { enable: true, distance: 120, color: '#00d8ff', opacity: 0.4, width: 1 },
          move: { enable: true, speed: 2 }
        },
        interactivity: {
          events: { onhover: { enable: true, mode: 'repulse' } }
        }
      });
    }

    return () => SpeechRecognition.stopListening();
  }, []);

  const speak = async (text) => {
    await TextToSpeech.speak({
      text,
      lang: 'en-GB',
      rate: 0.95,
      pitch: 1.0,
      volume: 1.0
    });
  };

  const callContact = async (name) => {
    try {
      const perm = await Contacts.checkPermissions();
      if (perm.contacts !== 'granted') await Contacts.requestPermissions();

      const result = await Contacts.getContacts();
      const contact = result.contacts.find(c => 
        c.name?.display?.toLowerCase().includes(name.toLowerCase())
      );

      if (contact?.phoneNumbers?.[0]) {
        window.location.href = `tel:${contact.phoneNumbers[0].number}`;
        await speak(`Calling ${contact.name.display}, sir.`);
      } else {
        await speak(`No contact found for "${name}", sir.`);
      }
    } catch {
      await speak(`Cannot access contacts, sir.`);
    }
  };

  const takeAndAnalyzePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'base64'
      });

      await speak("Analyzing image, sir...");

      const result = await model.generateContent([
        "Describe this image in JARVIS's sarcastic, witty style.",
        { inlineData: { data: photo.base64, mimeType: 'image/jpeg' } }
      ]);

      const description = result.response.text();
      await speak(description);
      setStatus(description);
    } catch (e) {
      await speak("Camera failed or access denied, sir.");
    }
  };

  return (
    <div className="jarvis-container">
      <div id="particles-js"></div>
      
      <div className="jarvis-ui">
        <h1>JARVIS</h1>
        <p className="status">{status}</p>
        <div className="hint">
          Say: "Jarvis" + your command<br/>
          Examples: time, location, call Mom, take photo, or anything!
        </div>
      </div>
    </div>
  );
}

export default App;