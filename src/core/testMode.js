// src/core/testMode.js

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { Contacts } from '@capacitor-community/contacts';
import { Media } from '@capacitor-community/media';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { BackgroundRunner } from '@capacitor/background-runner';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

export const runJarvisTest = async (updateStatus) => {

  const speak = async (text) => {
    console.log('[JARVIS]', text);
    updateStatus(text);
    await TextToSpeech.speak({
      text,
      lang: 'en-GB',
      rate: 0.95,
      pitch: 1.0,
    });
  };

  try {
    await speak('Initializing JARVIS diagnostic mode, sir.');

    // ------------------ TTS ------------------
    await speak('Text to speech is operational.');

    // ------------------ DEVICE INFO ------------------
    try {
      const info = await Device.getInfo();
      await speak(`Device running ${info.operatingSystem} version ${info.osVersion}.`);
    } catch {
      await speak('Device info check failed.');
    }

    // ------------------ HAPTICS ------------------
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      await speak('Haptics operational.');
    } catch {
      await speak('Haptics failed.');
    }

    // ------------------ GEOLOCATION ------------------
    try {
      const pos = await Geolocation.getCurrentPosition();
      await speak(`Location acquired. Latitude ${pos.coords.latitude.toFixed(3)}.`);
    } catch {
      await speak('Geolocation failed.');
    }

    // ------------------ CAMERA ------------------
    try {
      const photo = await Camera.getPhoto({
        quality: 40,
        allowEditing: false,
        resultType: 'base64'
      });

      if (photo?.base64) {
        await speak('Camera operational.');
      }
    } catch {
      await speak('Camera failed.');
    }

    // ------------------ CONTACTS ------------------
       try {
       await Contacts.requestPermissions();
      const result = await Contacts.getContacts({ pageSize: 1 });
      if (result.contacts?.length > 0) await speak('Contacts access working, sir.');
      else await speak('Contacts list empty, sir.');
    } catch (e) {
      await speak('Contacts access failed, sir.');
      console.error(e);
    }
    // ------------------ MEDIA ------------------try {
      // Minimal test using online audio
      await Media.create({
        mediaId: 'test',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      });
      await Media.play({ mediaId: 'test' });
      await speak('Media plugin working, sir.');
      await Media.pause({ mediaId: 'test' });
    } catch (e) {
      await speak('Media plugin failed, sir.');
      console.error(e);
    }

    

    // ------------------ BLUETOOTH ------------------try {
      const enabled = await BluetoothLe.isEnabled();
      await speak(`Bluetooth is ${enabled ? 'on' : 'off'}, sir.`);
    } catch (e) {
      await speak('Bluetooth check failed, sir.');
      console.error(e);
    }

    

    // ------------------ SPEECH RECOGNITION ------------------try {
      await SpeechRecognition.requestPermission();
      await speak('Please speak now for Speech Recognition test, sir.');
      await SpeechRecognition.start({ language: 'en-US', maxResults: 1, prompt: 'Say "Jarvis test"' });
      SpeechRecognition.addListener('partialResults', (event) => {
        const transcript = event.value?.[0] || '';
        if (transcript) speak(`Heard: ${transcript}, sir.`);
      });
    } catch (e) {
      await speak('Speech recognition failed, sir.');
      console.error(e);
    }
    

    // ------------------ SQLITE ------------------try {
      const sqlite = new CapacitorSQLite();
      const db = await sqlite.createConnection({ database: 'jarvis', version: 1 });
      await db.open();
      await db.execute('CREATE TABLE IF NOT EXISTS test(id INTEGER PRIMARY KEY, name TEXT)');
      await db.close();
      await speak('SQLite plugin working, sir.');
    } catch (e) {
      await speak('SQLite plugin failed, sir.');
      console.error(e);
    }
    

    // ------------------ PREFERENCES ------------------
    try {
      await Preferences.set({ key: 'jarvis_test', value: 'ok' });
      const { value } = await Preferences.get({ key: 'jarvis_test' });
      if (value === 'ok') await speak('Preferences storage working.');
    } catch {
      await speak('Preferences failed.');
    }

    // ------------------ BACKGROUND RUNNER ------------------try {
      await BackgroundRunner.start();
      await speak('Background runner functional, sir.');
      await BackgroundRunner.stop();
    } catch (e) {
      await speak('Background runner failed, sir.');
      console.error(e);
    }
    

    // ------------------ APP INFO ------------------
    try {
      const appInfo = await App.getInfo();
      await speak(`App version ${appInfo.version} verified.`);
    } catch {
      await speak('App info failed.');
    }

    await speak('JARVIS system diagnostic complete, sir.');

  } catch (err) {
    console.error(err);
    await speak('Critical failure in JARVIS test mode.');
  }
};