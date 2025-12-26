// src/core/testMode.js
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { Contacts } from '@capacitor-community/contacts';
import { Media } from '@capacitor-community/media';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';

export const runJarvisTest = async (updateStatus) => {
  const speak = async (text) => {
    updateStatus(text);
    await TextToSpeech.speak({ text, lang: 'en-GB', rate: 0.95, pitch: 1.0 });
  };

  try {
    await speak('Starting JARVIS test sequence, sir.');

    // 1️⃣ TTS test
    await speak('TTS is working, sir.');

    // 2️⃣ Geolocation test
    try {
      const pos = await Geolocation.getCurrentPosition();
      await speak(`Geolocation working: latitude ${pos.coords.latitude.toFixed(4)}, longitude ${pos.coords.longitude.toFixed(4)}`);
    } catch {
      await speak('Geolocation failed.');
    }

    // 3️⃣ Camera test
    try {
      const photo = await Camera.getPhoto({ quality: 50, allowEditing: false, resultType: 'base64' });
      if (photo?.base64) await speak('Camera working and photo captured.');
    } catch {
      await speak('Camera failed.');
    }

    // 4️⃣ Contacts test
    try {
      const perm = await Contacts.checkPermissions();
      if (perm.contacts !== 'granted') await Contacts.requestPermissions();
      const result = await Contacts.getContacts({ pageSize: 1 });
      if (result.contacts.length > 0) await speak('Contacts access working.');
      else await speak('Contacts list empty.');
    } catch {
      await speak('Contacts failed.');
    }

    // 5️⃣ Media test
    try {
      await Media.play();
      await speak('Media plugin working.');
      await Media.pause();
    } catch {
      await speak('Media failed.');
    }

    // 6️⃣ Bluetooth test
    try {
      const enabled = await BluetoothLe.isEnabled();
      await speak(`Bluetooth is ${enabled ? 'on' : 'off'}.`);
    } catch {
      await speak('Bluetooth check failed.');
    }

    await speak('JARVIS test sequence complete, sir.');
  } catch (e) {
    await speak('JARVIS test encountered an error, sir.');
    console.error('Test Mode Error:', e);
  }
};
