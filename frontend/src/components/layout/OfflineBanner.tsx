import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSyncStore } from '../../stores/useSyncStore';
import { useTranslation } from 'react-i18next';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const { isOnline, syncState, pendingItems, setOnlineStatus, triggerManualSync } = useSyncStore();

  return (
    <div className={`transition-all duration-300 py-1.5 px-4 text-xs font-medium border-b flex flex-wrap items-center justify-between gap-2 ${
      !isOnline 
        ? 'bg-gold-100 text-gold-900 border-gold-300'
        : syncState === 'syncing'
        ? 'bg-blue-50 text-blue-900 border-blue-200'
        : 'bg-forest-50 text-forest-900 border-forest-100'
    }`}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-gold-700 animate-pulse" />
              <span>{t('sync.offline')}</span>
            </>
          ) : syncState === 'syncing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>{t('sync.syncing')}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              <span>{t('sync.synced')}</span>
            </>
          )}

          {pendingItems.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-gold-200 text-gold-950 font-bold text-xs">
              {pendingItems.length} queued
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setOnlineStatus(!isOnline)}
            className="hover:underline font-semibold cursor-pointer flex items-center gap-1 text-charcoal-700"
          >
            <Wifi className="w-3 h-3" />
            <span>Simulate Network: {isOnline ? 'Online' : 'Offline'}</span>
          </button>
          {isOnline && pendingItems.length > 0 && (
            <button
              onClick={() => triggerManualSync()}
              className="bg-forest-800 text-white px-2.5 py-0.5 rounded-full hover:bg-forest-900 font-semibold"
            >
              Sync Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
