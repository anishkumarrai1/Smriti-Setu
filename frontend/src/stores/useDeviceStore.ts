import { create } from 'zustand';
import { ESP32Device, DeviceEvent, HardwareStatus } from '../types';
import { deviceApi } from '../services/api';

interface DeviceState {
  device: ESP32Device;
  eventLogs: DeviceEvent[];
  fetchTelemetry: (deviceId?: string) => Promise<void>;
  setStatus: (status: HardwareStatus) => void;
  triggerPhysicalButton: () => Promise<void>;
  toggleLed: (color: 'green' | 'yellow' | 'red' | 'off') => Promise<void>;
  toggleBuzzer: () => Promise<void>;
  addEventLog: (eventType: DeviceEvent['eventType'], payload: string) => void;
}

const initialDevice: ESP32Device = {
  deviceId: 'ESP32-NER-GW-042',
  deviceName: 'Cognitive Assistance Node',
  facilityId: 'fac-ghy-01',
  facilityName: 'Guwahati Regional Cognitive Care Center',
  assignedPatientId: 'pat-ner-001',
  assignedPatientName: 'Ranjit Borthakur',
  status: 'online',
  lastHeartbeat: new Date().toISOString(),
  firmwareVersion: 'v2.4.1-ner-stable',
  hardwareModel: 'ESP32-S3-WROOM-1',
  ipAddress: '192.168.1.104',
  ledColor: 'green',
  buzzerActive: false,
};

const initialLogs: DeviceEvent[] = [
  {
    id: 'evt-101',
    deviceId: 'ESP32-NER-GW-042',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    eventType: 'heartbeat',
    payload: 'Telemetry OK - RSSI: -62dBm, Battery: 94%',
  },
  {
    id: 'evt-102',
    deviceId: 'ESP32-NER-GW-042',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    eventType: 'button_press',
    payload: 'Physical Button A pressed: Patient confirmed daily activity start.',
  },
  {
    id: 'evt-103',
    deviceId: 'ESP32-NER-GW-042',
    timestamp: new Date().toISOString(),
    eventType: 'led_toggle',
    payload: 'LED switched to GREEN (Active Session Indicator)',
  },
];

export const useDeviceStore = create<DeviceState>((set, get) => ({
  device: initialDevice,
  eventLogs: initialLogs,

  fetchTelemetry: async (deviceId = 'ESP32-NER-GW-042') => {
    try {
      const data = await deviceApi.getDeviceTelemetry(deviceId);
      const logs = await deviceApi.getDeviceEvents(deviceId);
      if (data) set({ device: data });
      if (Array.isArray(logs) && logs.length > 0) set({ eventLogs: logs });
    } catch (err) {
      console.warn('Device telemetry fetched locally (offline mode)', err);
    }
  },

  setStatus: (status) =>
    set((state) => ({
      device: { ...state.device, status, lastHeartbeat: new Date().toISOString() },
    })),

  addEventLog: (eventType, payload) => {
    const newLog: DeviceEvent = {
      id: `evt-${Date.now()}`,
      deviceId: get().device.deviceId,
      timestamp: new Date().toISOString(),
      eventType,
      payload,
    };
    set((state) => ({
      eventLogs: [newLog, ...state.eventLogs],
    }));
  },

  triggerPhysicalButton: async () => {
    const { addEventLog, device } = get();
    if (device.status !== 'online') {
      return;
    }
    addEventLog('button_press', 'Physical Assist Button pressed on stationary ESP32 console.');

    try {
      await deviceApi.triggerAction(
        device.deviceId,
        'button_press',
        'Physical Assist Button pressed on stationary ESP32 console.'
      );
    } catch (err) {
      console.warn('Device action logged locally', err);
    }
  },

  toggleLed: async (color) => {
    const { addEventLog, device } = get();
    set((state) => ({
      device: { ...state.device, ledColor: color },
    }));
    addEventLog('led_toggle', `LED indicator output set to ${color.toUpperCase()}`);

    try {
      await deviceApi.triggerAction(device.deviceId, 'led_toggle', undefined, color);
    } catch (err) {
      console.warn('LED action logged locally', err);
    }
  },

  toggleBuzzer: async () => {
    const { addEventLog, device } = get();
    const nextState = !device.buzzerActive;
    set((state) => ({
      device: { ...state.device, buzzerActive: nextState },
    }));
    addEventLog('buzzer_alert', nextState ? 'Buzzer audio alert triggered' : 'Buzzer audio alert silenced');

    try {
      await deviceApi.triggerAction(device.deviceId, 'buzzer_toggle');
    } catch (err) {
      console.warn('Buzzer action logged locally', err);
    }
  },
}));
