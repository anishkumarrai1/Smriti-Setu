import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';
import { broadcastHardwareEvent, isValidHardwareButtonEvent } from '../modules/hardwareSocket';

export const getDeviceTelemetry = (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const device = dataStore.getDevice(deviceId);
    if (!device) {
      res.status(404).json({ error: `Device with ID '${deviceId}' not found` });
      return;
    }
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve device telemetry', details: error.message });
  }
};

export const getDeviceEvents = (req: Request, res: Response) => {
  try {
    const deviceId =
      ((req.query.deviceId as string) || (req.params.deviceId as string)) ?? undefined;
    const events = dataStore.getDeviceEvents(deviceId);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve device events', details: error.message });
  }
};

export const triggerDeviceAction = (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const { actionType, payload, button } = req.body;

    const device = dataStore.getDevice(deviceId);
    if (!device) {
      res.status(404).json({ error: `Device with ID '${deviceId}' not found` });
      return;
    }

    let description = payload || '';
    if (actionType === 'led_toggle' && req.body.color) {
      dataStore.updateDeviceState(deviceId, { ledColor: req.body.color });
      description = `LED switched to ${req.body.color.toUpperCase()}`;
    } else if (actionType === 'buzzer_toggle') {
      const nextBuzzer = !device.buzzerActive;
      dataStore.updateDeviceState(deviceId, { buzzerActive: nextBuzzer });
      description = nextBuzzer ? 'Buzzer audio alert triggered' : 'Buzzer audio alert silenced';
    } else if (actionType === 'button_press') {
      description = description || `Physical assist button (${button || 'RED'}) pressed on ESP32 node`;
      const targetButton = (button || 'RED').toUpperCase();
      broadcastHardwareEvent({
        type: 'BUTTON_PRESS',
        button: targetButton as any,
        deviceId,
        timestamp: Date.now(),
      });
    }

    const event = dataStore.addDeviceEvent(
      deviceId,
      actionType === 'buzzer_toggle' ? 'buzzer_alert' : actionType,
      description
    );

    res.json({
      success: true,
      event,
      device: dataStore.getDevice(deviceId),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to trigger device action', details: error.message });
  }
};

export const emitTestButtonEvent = (req: Request, res: Response) => {
  try {
    const { button = 'RED', deviceId = 'ESP32-NER-GW-001' } = req.body;
    const eventPayload = {
      type: 'BUTTON_PRESS',
      button: String(button).toUpperCase(),
      deviceId: String(deviceId),
      timestamp: Date.now(),
    };

    if (!isValidHardwareButtonEvent(eventPayload)) {
      res.status(400).json({ error: 'Invalid button payload', payload: eventPayload });
      return;
    }

    const broadcasted = broadcastHardwareEvent(eventPayload);
    res.json({
      success: true,
      broadcasted,
      event: eventPayload,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to emit test hardware event', details: error.message });
  }
};


export const updateDevice = (req: Request, res: Response) => {
  try {
    const deviceId = req.params.deviceId as string;
    const updates = req.body;
    const updated = dataStore.updateDeviceState(deviceId, updates);
    if (!updated) {
      res.status(404).json({ error: `Device with ID '${deviceId}' not found` });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update device', details: error.message });
  }
};
