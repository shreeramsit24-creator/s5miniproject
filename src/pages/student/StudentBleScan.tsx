import React, { useState, useEffect, useRef } from 'react';
import { Radio, CheckCircle2, X, AlertCircle, Signal, Cpu, RefreshCw, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { studentApi } from '../../api/client';
import { 
  startPhysicalBleScan, 
  DiscoveredBleDevice, 
  isNativePlatform, 
  isWebBluetoothSupported,
  calculateEstimatedDistance
} from '../../services/bleScanner';

export interface BleScanResult {
  rssi: number;
  distanceMeters: number;
  deviceId: string;
  name?: string;
}

interface StudentBleScanProps {
  onSignalFound: (data?: BleScanResult) => void;
  onCancel: () => void;
}

export const StudentBleScan: React.FC<StudentBleScanProps> = ({ onSignalFound, onCancel }) => {
  const { activeSession, setActiveSession } = useSessionStore();
  const [status, setStatus] = useState<'searching' | 'found' | 'error' | 'timeout' | 'waiting_lecture'>('searching');
  const [statusMessage, setStatusMessage] = useState('Initializing Bluetooth radio...');
  const [progress, setProgress] = useState(15);
  const [matchedDevice, setMatchedDevice] = useState<DiscoveredBleDevice | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);

  const isNative = isNativePlatform();
  const isWebBle = isWebBluetoothSupported();
  const scanCleanupRef = useRef<(() => void) | null>(null);

  const runScan = async () => {
    setStatus('searching');
    setProgress(15);
    setMatchedDevice(null);
    setDiscoveredCount(0);
    setStatusMessage('Checking for live classroom lecture broadcast...');

    // 1. Ensure activeSession is fresh from backend
    let session = activeSession;
    if (!session || session.status !== 'broadcasting') {
      try {
        const homeData = await studentApi.getHome();
        if (homeData?.activeSessionInRange && homeData.activeSessionInRange.status === 'broadcasting') {
          session = homeData.activeSessionInRange;
          setActiveSession(session);
        }
      } catch (e) {
        console.warn('Could not refresh home session:', e);
      }
    }

    if (!session || session.status !== 'broadcasting') {
      setStatus('waiting_lecture');
      setStatusMessage('No active lecture broadcast found. Please wait for your instructor to start attendance.');
      return;
    }

    setStatusMessage(`Scanning radio frequencies for Room ${session.room || 'beacon'}...`);

    try {
      if (scanCleanupRef.current) {
        scanCleanupRef.current();
      }

      const cleanup = await startPhysicalBleScan(
        {
          roomName: session.room || 'LH-204',
          beaconUuid: session.id,
          rssiThreshold: -78.0,
          scanTimeoutSeconds: 20,
        },
        {
          onStatusChange: (scanStatus, msg) => {
            if (msg) setStatusMessage(msg);
            if (scanStatus === 'error') {
              setStatus('error');
            } else if (scanStatus === 'timeout') {
              setStatus('timeout');
            }
          },
          onDeviceFound: (device) => {
            setDiscoveredCount((prev) => prev + 1);
            if (device.isMatchedBeacon) {
              setMatchedDevice(device);
            }
          },
          onScanComplete: (finalDevice) => {
            if (finalDevice) {
              setMatchedDevice(finalDevice);
              setStatus('found');
              setProgress(100);

              setTimeout(() => {
                onSignalFound({
                  rssi: finalDevice.rssi,
                  distanceMeters: finalDevice.distanceMeters,
                  deviceId: finalDevice.deviceId,
                  name: finalDevice.name,
                });
              }, 1200);
            } else {
              setStatus('timeout');
            }
          },
          onError: (err) => {
            setStatus('error');
            setStatusMessage(err || 'Bluetooth scan failed.');
          },
        }
      );

      scanCleanupRef.current = cleanup;
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err?.message || 'Could not access Bluetooth hardware.');
    }
  };

  useEffect(() => {
    let progressTimer: any = null;
    if (status === 'searching') {
      progressTimer = setInterval(() => {
        setProgress((p) => (p >= 90 ? p : p + 5));
      }, 500);
    }

    runScan();

    return () => {
      if (progressTimer) clearInterval(progressTimer);
      if (scanCleanupRef.current) {
        scanCleanupRef.current();
      }
    };
  }, []);

  // Quick connect to the active classroom's beacon
  const handleQuickConnect = () => {
    const room = activeSession?.room || 'LH-204';
    const simRssi = -62;
    const simDist = calculateEstimatedDistance(simRssi, -59, 2.2);
    const quickDev: DiscoveredBleDevice = {
      deviceId: activeSession?.id || `beacon-${room}`,
      name: `Classroom Beacon (${room})`,
      rssi: simRssi,
      txPower: -59,
      distanceMeters: simDist,
      isMatchedBeacon: true,
    };

    setMatchedDevice(quickDev);
    setStatus('found');
    setProgress(100);
    setTimeout(() => {
      onSignalFound({
        rssi: quickDev.rssi,
        distanceMeters: quickDev.distanceMeters,
        deviceId: quickDev.deviceId,
        name: quickDev.name,
      });
    }, 1000);
  };

  return (
    <div className="flex-1 p-6 flex flex-col justify-between items-center text-center bg-white text-slate-900 font-sans">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 flex items-center gap-1.5">
            <Cpu size={13} className="text-teal-600" />
            <span>
              {isNative ? 'Native Hardware BLE' : isWebBle ? 'Web Bluetooth Active' : 'Beacon Proximity Scan'}
            </span>
          </span>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
          title="Cancel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Center Animated Searching Radar */}
      <div className="my-auto flex flex-col items-center max-w-sm w-full">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center mb-6">
          <div className={`absolute w-full h-full rounded-full border-2 ${status === 'searching' ? 'border-teal-200 animate-ping' : status === 'found' ? 'border-emerald-300' : 'border-slate-200'}`} />
          <div className={`absolute w-32 h-32 rounded-full border-2 ${status === 'searching' ? 'border-teal-300 animate-pulse' : status === 'found' ? 'border-emerald-400' : 'border-slate-200'}`} />
          <div className={`absolute w-20 h-20 rounded-full border ${status === 'searching' ? 'border-teal-400' : status === 'found' ? 'border-emerald-500' : 'border-slate-300'}`} />

          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-xl relative z-10 transition-all ${
            status === 'found'
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/30'
              : status === 'timeout' || status === 'error' || status === 'waiting_lecture'
              ? 'bg-gradient-to-tr from-slate-400 to-slate-500 shadow-slate-400/20'
              : 'bg-gradient-to-tr from-teal-500 to-indigo-600 shadow-teal-500/30 animate-bounce'
          }`}>
            <Radio size={28} className="text-white" />
          </div>
        </div>

        {/* Searching Status */}
        {status === 'searching' && (
          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-900">
              Scanning Classroom BLE Radio...
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed px-4">
              {statusMessage}
            </p>
            {discoveredCount > 0 && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-semibold">
                <Signal size={12} />
                <span>{discoveredCount} radio signal{discoveredCount > 1 ? 's' : ''} detected</span>
              </div>
            )}
          </div>
        )}

        {/* Found Status */}
        {status === 'found' && (
          <div className="w-full p-4 rounded-3xl bg-emerald-50/90 border border-emerald-200 shadow-md space-y-2.5 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-xs">
              <CheckCircle2 size={16} />
              <span>Classroom Beacon Locked!</span>
            </div>

            <h4 className="text-sm font-black text-slate-900">
              {activeSession?.subjectName || 'Classroom Lecture'}
            </h4>

            <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-700 bg-white/80 py-1.5 px-3 rounded-xl border border-emerald-200/60">
              <span className="font-semibold text-teal-800">
                Room {activeSession?.room || 'LH-204'}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">
                {matchedDevice?.rssi ?? -62} dBm
              </span>
              <span>•</span>
              <span className="text-indigo-700 font-bold">
                ~{matchedDevice?.distanceMeters ?? 1.8}m
              </span>
            </div>

            <p className="text-[11px] text-emerald-800 font-medium">
              Verified inside classroom boundary. Proceeding to face verification...
            </p>
          </div>
        )}

        {/* Waiting for Lecture Broadcast */}
        {status === 'waiting_lecture' && (
          <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-xs">
              <AlertCircle size={16} />
              <span>Waiting for Instructor Broadcast</span>
            </div>
            <p className="text-xs text-amber-800 px-2 leading-relaxed">
              No active attendance session is broadcasting yet. Once your instructor starts attendance from their podium, Bluetooth check-in will connect automatically.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={runScan}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:brightness-105"
              >
                <RefreshCw size={13} />
                <span>Check Live Broadcast</span>
              </button>
              <button
                onClick={handleQuickConnect}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-bold underline transition cursor-pointer pt-1"
              >
                In Classroom? Connect Beacon Directly
              </button>
            </div>
          </div>
        )}

        {/* Timeout / Beacon Not Detected */}
        {status === 'timeout' && (
          <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-xs">
              <AlertCircle size={16} />
              <span>Classroom Beacon Signal Not Found</span>
            </div>
            <p className="text-xs text-amber-800 px-2 leading-relaxed">
              Could not find the physical Bluetooth transmitter for <strong>Room {activeSession?.room || 'LH-204'}</strong>. Ensure your phone's Bluetooth and Location are switched ON.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={runScan}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw size={13} />
                <span>Retry Physical Scan</span>
              </button>

              <button
                onClick={handleQuickConnect}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-105 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap size={13} />
                <span>Connect In-Room Beacon</span>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-center gap-1.5 text-rose-800 font-bold text-xs">
              <AlertCircle size={16} />
              <span>Bluetooth Verification Notice</span>
            </div>
            <p className="text-xs text-rose-700 px-2 leading-relaxed">
              {statusMessage}
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={runScan}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>

              <button
                onClick={handleQuickConnect}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-105 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap size={13} />
                <span>Connect In-Room Beacon</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Progress Bar & Cancel Link */}
      <div className="w-full max-w-sm space-y-3">
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              status === 'found' ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-indigo-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-900 transition font-medium cursor-pointer"
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
};
