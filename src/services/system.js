// src/services/system.js
import { Camera } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { Contacts } from "@capacitor-community/contacts";
import { Media } from "@capacitor-community/media";
import { BluetoothLe } from "@capacitor-community/bluetooth-le";

export const takePhoto = async () => {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: "base64",
    });
    return photo.base64;
  } catch {
    return null;
  }
};

export const getLocation = async () => {
  try {
    const pos = await Geolocation.getCurrentPosition();
    return pos.coords;
  } catch {
    return null;
  }
};

export const callContact = async (name) => {
  try {
    const perm = await Contacts.checkPermissions();
    if (perm.contacts !== "granted") await Contacts.requestPermissions();

    const result = await Contacts.getContacts();
    const contact = result.contacts.find((c) =>
      c.name?.display?.toLowerCase().includes(name.toLowerCase())
    );

    if (contact?.phoneNumbers?.[0]) {
      window.location.href = `tel:${contact.phoneNumbers[0].number}`;
      return `Calling ${contact.name.display}, sir.`;
    } else {
      return `No contact found for "${name}", sir.`;
    }
  } catch {
    return "Cannot access contacts, sir.";
  }
};

export const controlMedia = async (action) => {
  switch (action) {
    case "play":
      await Media.play();
      return "Playing music, sir.";
    case "pause":
      await Media.pause();
      return "Music paused, sir.";
    case "next":
      await Media.next();
      return "Next track, sir.";
    default:
      return "Media action not recognized, sir.";
  }
};

export const checkBluetooth = async () => {
  const enabled = await BluetoothLe.isEnabled();
  return enabled ? "Bluetooth is on, sir." : "Bluetooth is off, sir.";
};
