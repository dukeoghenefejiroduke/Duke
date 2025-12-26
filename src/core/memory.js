import { Preferences } from '@capacitor/preferences';

export async function remember(key, value) {
  await Preferences.set({
    key,
    value: JSON.stringify(value)
  });
}

export async function recall(key) {
  const { value } = await Preferences.get({ key });
  return value ? JSON.parse(value) : null;
}
