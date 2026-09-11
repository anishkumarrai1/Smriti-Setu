import React from 'react';
import { 
  Building2, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Radio, 
  Bell, 
  Activity, 
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { Button } from '../../components/common/Button';
import { HardwareStatus } from '../../types';
import { formatTime } from '../../utils/formatters';

export const FacilityDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { 
    device, 
    eventLogs, 
    setStatus, 
    triggerPhysicalButton, 
    toggleLed, 
    toggleBuzzer 
  } = useDeviceStore();

  return (
    <div className="space-y-10 md:space-y-12 animate-in fade-in duration-500">
      
      {/* Header Summary */}
      <div className="bg-ivory-100/90 p-6 md:p-8 rounded-4xl border border-ivory-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
            {t('roles.facility_admin', 'Healthcare Facility Administration')}
          </span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-charcoal-900 mt-1 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-forest-800" />
            <span>Guwahati Regional Cognitive Care Center</span>
          </h2>
          <p className="text-sm text-charcoal-600 mt-1">
            {t('common.region', 'North Eastern Region Node')} #NER-FAC-01 · District: Kamrup Metropolitan, Assam
          </p>
        </div>

        <span className="bg-forest-800 text-ivory-50 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold-400" /> {t('hardware.status', 'Facility Telemetry Active')}
        </span>
      </div>

      {/* Hardware Telemetry Console */}
      <div className="bg-white p-6 md:p-8 rounded-4xl border border-ivory-200 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ivory-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">{t('hardware.subtitle', 'Stationary Console Unit')}</span>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-forest-800" />
              <span>{t('hardware.title', 'ESP32 Cognitive Assistance Console')}</span>
            </h3>
            <p className="text-xs text-charcoal-500">{t('hardware.deviceId', 'Device ID')}: {device.deviceId} ({device.hardwareModel})</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-charcoal-600">{t('hardware.status', 'Simulate Hardware State')}:</span>
            {(['online', 'offline', 'connecting'] as HardwareStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  device.status === st
                    ? st === 'online'
                      ? 'bg-forest-800 text-white shadow-xs'
                      : st === 'connecting'
                      ? 'bg-gold-500 text-charcoal-950 shadow-xs'
                      : 'bg-terracotta-600 text-white shadow-xs'
                    : 'bg-ivory-200 text-charcoal-700 hover:bg-ivory-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Connection Banner */}
        <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
          device.status === 'online'
            ? 'bg-forest-50 border-forest-300 text-forest-950'
            : device.status === 'connecting'
            ? 'bg-gold-50 border-gold-300 text-gold-950'
            : 'bg-terracotta-50 border-terracotta-300 text-terracotta-950'
        }`}>
          <div className="flex items-center gap-3">
            {device.status === 'online' ? (
              <Wifi className="w-6 h-6 text-forest-700 animate-pulse" />
            ) : device.status === 'connecting' ? (
              <RefreshCw className="w-6 h-6 text-gold-700 animate-spin" />
            ) : (
              <WifiOff className="w-6 h-6 text-terracotta-700" />
            )}
            <div>
              <h4 className="font-bold text-lg">
                {t('hardware.status', 'Hardware Connection')}: {device.status.toUpperCase()}
              </h4>
              <p className="text-xs font-medium">
                {device.status === 'online'
                  ? `Active telemetry heartbeat stream. IP: ${device.ipAddress} | FW: ${device.firmwareVersion}`
                  : device.status === 'connecting'
                  ? 'Attempting handshake with ESP32 gateway over local Wi-Fi / MQTT...'
                  : 'Device is offline or disconnected from power.'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-charcoal-800 bg-white px-3 py-1.5 rounded-full border">
            {t('hardware.lastHeartbeat', 'Last Heartbeat')}: {formatTime(device.lastHeartbeat)}
          </span>
        </div>

        {/* Physical & Indicator Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="bg-ivory-50 p-6 rounded-3xl border border-ivory-200 space-y-3">
            <h4 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-forest-800" />
              <span>{t('hardware.triggerButton', 'Physical Button Input')}</span>
            </h4>
            <p className="text-xs text-charcoal-600">Simulate patient pressing the physical assist button on console.</p>
            <Button
              variant="primary"
              size="md"
              disabled={device.status !== 'online'}
              onClick={triggerPhysicalButton}
              className="w-full"
            >
              {t('hardware.triggerButton', 'Simulate Button Press')}
            </Button>
          </div>

          <div className="bg-ivory-50 p-6 rounded-3xl border border-ivory-200 space-y-3">
            <h4 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-forest-800" />
              <span>{t('hardware.ledState', 'LED Status Indicator')}</span>
            </h4>
            <p className="text-xs text-charcoal-600">{t('common.status', 'Current Output')}: <strong className="uppercase">{device.ledColor}</strong></p>
            <div className="flex items-center gap-1.5">
              {(['green', 'yellow', 'red', 'off'] as const).map((clr) => (
                <button
                  key={clr}
                  onClick={() => toggleLed(clr)}
                  disabled={device.status !== 'online'}
                  className={`flex-1 py-2 text-xs font-bold capitalize rounded-full transition-all ${
                    device.ledColor === clr
                      ? 'bg-forest-900 text-white font-bold shadow-xs'
                      : 'bg-white text-charcoal-700 border border-ivory-300 hover:bg-ivory-200'
                  }`}
                >
                  {clr}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-ivory-50 p-6 rounded-3xl border border-ivory-200 space-y-3">
            <h4 className="font-bold text-charcoal-900 text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-terracotta-600" />
              <span>{t('hardware.buzzerState', 'Buzzer Audio Alert')}</span>
            </h4>
            <p className="text-xs text-charcoal-600">Audio Alert State: <strong>{device.buzzerActive ? 'ACTIVE' : 'SILENT'}</strong></p>
            <Button
              variant={device.buzzerActive ? 'danger' : 'outline'}
              size="md"
              disabled={device.status !== 'online'}
              onClick={toggleBuzzer}
              className="w-full"
            >
              {device.buzzerActive ? t('common.close', 'Silence Tone') : t('hardware.buzzerState', 'Trigger Alert')}
            </Button>
          </div>

        </div>
      </div>

      {/* Telemetry Event History Table */}
      <div className="bg-white p-6 md:p-8 rounded-4xl border border-ivory-200/80 shadow-soft space-y-4">
        <h3 className="font-serif font-bold text-xl text-charcoal-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-forest-800" />
          <span>ESP32 Hardware Event Stream</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-100 text-charcoal-700 border-b border-ivory-200">
              <tr>
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Device ID</th>
                <th className="py-3 px-4 font-bold">Event Type</th>
                <th className="py-3 px-4 font-bold">Payload Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {eventLogs.map((log) => (
                <tr key={log.id} className="hover:bg-ivory-50">
                  <td className="py-3.5 px-4 font-medium text-charcoal-900">{formatTime(log.timestamp)}</td>
                  <td className="py-3.5 px-4 text-charcoal-600 font-mono text-xs">{log.deviceId}</td>
                  <td className="py-3.5 px-4 capitalize font-bold text-forest-800">{log.eventType.replace('_', ' ')}</td>
                  <td className="py-3.5 px-4 text-charcoal-700">{log.payload}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
