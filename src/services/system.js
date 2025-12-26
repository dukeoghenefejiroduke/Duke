import { Device } from '@capacitor/device';

export async function getSystemStatus() {
  const info = await Device.getInfo();
  return `Device: ${info.model}, OS: ${info.operatingSystem}`;
}
