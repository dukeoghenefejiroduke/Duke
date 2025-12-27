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
      const perm = await Contacts.checkPermissions();
      if (perm.contacts !== 'granted') {
        await Contacts.requestPermissions();
      }

      const contacts = await Contacts.getContacts({ pageSize: 1 });
      if (contacts.contacts.length > 0) {
        await speak('Contacts access confirmed.');
      } else {
        await speak('Contacts list is empty.');
      }
    } catch {
      await speak('Contacts test failed.');
    }

    // ------------------ MEDIA ------------------
    try {
      await Media.play();
      await speak('Media playback working.');
      await Media.pause();
    } catch {
      await speak('Media plugin failed.');
    }

    // ------------------ BLUETOOTH ------------------
    try {
      const enabled = await BluetoothLe.isEnabled();
      await speak(`Bluetooth is ${enabled ? 'enabled' : 'disabled'}.`);
    } catch {
      await speak('Bluetooth check failed.');
    }

    // ------------------ SPEECH RECOGNITION ------------------
    try {
      const perm = await SpeechRecognition.requestPermission();
      if (perm.granted) {
        await speak('Speech recognition permission granted.');
      } else {
        await speak('Speech recognition permission denied.');
      }
    } catch {
      await speak('Speech recognition failed.');
    }

    // ------------------ SQLITE ------------------
    try {
      const db = await CapacitorSQLite.createConnection({
        database: 'jarvis_test',
        version: 1,
      });
      await db.open();
      await db.execute(`CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY);`);
      await speak('SQLite database operational.');
      await db.close();
    } catch {
      await speak('SQLite failed.');
    }

    // ------------------ PREFERENCES ------------------
    try {
      await Preferences.set({ key: 'jarvis_test', value: 'ok' });
      const { value } = await Preferences.get({ key: 'jarvis_test' });
      if (value === 'ok') await speak('Preferences storage working.');
    } catch {
      await speak('Preferences failed.');
    }

    // ------------------ BACKGROUND RUNNER ------------------
    try {
      await BackgroundRunner.start();
      await speak('Background runner active.');
      await BackgroundRunner.stop();
    } catch {
      await speak('Background runner failed.');
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