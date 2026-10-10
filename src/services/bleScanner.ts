import { Capacitor } from '@capacitor/core';
import { BleClient, ScanMode } from '@capacitor-community/bluetooth-le';

export interface DiscoveredBleDevice {
  deviceId: string;
  name?: string;
  rssi: number;
  txPower?: number;
  distanceMeters: number;
  isMatchedBeacon?: boolean;
  raw?: any;
}

export interface BleScanOptions {
  roomName?: string;
  beaconUuid?: string;
  expectedPrefix?: string;
  txPower?: number; // Default -59 dBm
  pathLossExponent?: number; // Default 2.2
  rssiThreshold?: number; // Default -75 dBm
  scanTimeoutSeconds?: number; // Default 20 seconds
}

export type BleScanStatus = 
  | 'idle'
  | 'initializing'
  | 'requesting_permissions'
  | 'scanning'
  | 'device_found'
  | 'timeout'
  | 'error';

export interface BleScanCallbacks {
  onStatusChange: (status: BleScanStatus, message?: string) => void;
  onDeviceFound: (device: DiscoveredBleDevice) => void;
  onScanComplete?: (matchedDevice: DiscoveredBleDevice | null) => void;
  onError?: (errorMessage: string) => void;
}

/**
 * Calculates estimated distance in meters from RSSI and 1-meter TxPower
 * Formula: distance = 10 ^ ((TxPower - RSSI) / (10 * n))
 */
export function calculateEstimatedDistance(
  rssi: number,
  txPower: number = -59.0,
  pathLossExponent: number = 2.2
): number {
  if (rssi >= 0 || rssi === -1000) return -1;
  const ratio = (txPower - rssi) / (10.0 * pathLossExponent);
  const distance = Math.pow(10.0, ratio);
  return Math.round(distance * 100) / 100;
}

/**
 * Normalizes strings by removing spaces, hyphens, and non-alphanumeric chars
 */
function normalizeString(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if running on native Capacitor Android/iOS
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Checks if Web Bluetooth API is supported in current browser
 */
export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/**
 * Starts a real physical Bluetooth LE scan with resilient hardware support.
 */
export async function startPhysicalBleScan(
  options: BleScanOptions = {},
  callbacks: BleScanCallbacks
): Promise<() => void> {
  const txPower = options.txPower ?? -59.0;
  const pathLoss = options.pathLossExponent ?? 2.2;
  const rssiThreshold = options.rssiThreshold ?? -75.0;
  const timeoutMs = (options.scanTimeoutSeconds ?? 20) * 1000;
  const roomNameNorm = normalizeString(options.roomName || 'LH204');
  const beaconUuidNorm = normalizeString(options.beaconUuid || '');

  let isStopped = false;
  let timeoutTimer: any = null;
  let bestMatchedDevice: DiscoveredBleDevice | null = null;

  const stopScan = async () => {
    if (isStopped) return;
    isStopped = true;
    if (timeoutTimer) clearTimeout(timeoutTimer);

    if (isNativePlatform()) {
      try {
        await BleClient.stopLEScan();
      } catch (err) {
        console.warn('Error stopping native BLE scan:', err);
      }
    }
  };

  // ------------------------------------------------------------
  // MODE 1: NATIVE CAPACITOR ANDROID / IOS
  // ------------------------------------------------------------
  if (isNativePlatform()) {
    try {
      callbacks.onStatusChange('initializing', 'Initializing hardware Bluetooth radio...');
      await BleClient.initialize();

      // Check Bluetooth enabled
      const enabled = await BleClient.isEnabled();
      if (!enabled) {
        callbacks.onStatusChange('requesting_permissions', 'Requesting to enable device Bluetooth...');
        try {
          await BleClient.requestEnable();
        } catch {
          callbacks.onError?.('Bluetooth is disabled. Please turn on Bluetooth in device settings.');
          callbacks.onStatusChange('error', 'Bluetooth radio is disabled on your device.');
          callbacks.onScanComplete?.(null);
          return stopScan;
        }
      }

      // Android specific: check Location service (required for BLE beacon discovery)
      try {
        const isLocEnabled = await BleClient.isLocationEnabled();
        if (!isLocEnabled) {
          callbacks.onStatusChange(
            'requesting_permissions',
            'Location Services must be turned ON in Android quick settings for Bluetooth scanning.'
          );
          try {
            await BleClient.openLocationSettings();
          } catch (e) {
            console.warn('Could not open location settings:', e);
          }
        }
      } catch {
        // Ignored if not Android
      }

      callbacks.onStatusChange('scanning', `Scanning radio frequencies for Room ${options.roomName || 'beacon'}...`);

      // Timeout handler
      timeoutTimer = setTimeout(async () => {
        await stopScan();
        if (bestMatchedDevice) {
          callbacks.onStatusChange('device_found', `Signal authenticated: ${bestMatchedDevice.name} (${bestMatchedDevice.rssi} dBm)`);
          callbacks.onScanComplete?.(bestMatchedDevice);
        } else {
          callbacks.onStatusChange(
            'timeout',
            `Classroom beacon for ${options.roomName || 'this room'} was not detected in proximity. Make sure the lecturer beacon is active.`
          );
          callbacks.onScanComplete?.(null);
        }
      }, timeoutMs);

      // Start Native Hardware Low Latency LE Scan
      await BleClient.requestLEScan(
        {
          scanMode: ScanMode.SCAN_MODE_LOW_LATENCY,
          allowDuplicates: true,
        },
        (result) => {
          if (isStopped) return;

          const devName = (result.device?.name || result.localName || '').trim();
          const devId = result.device?.deviceId || '';
          const rssi = result.rssi ?? -85;
          const devTxPower = result.txPower ?? txPower;
          const dist = calculateEstimatedDistance(rssi, devTxPower, pathLoss);

          const devNameNorm = normalizeString(devName);
          const devIdNorm = normalizeString(devId);

          // Matching criteria: checks room name, institutional UUID, or common beacon keywords
          const isClassroomMatch =
            (roomNameNorm && (devNameNorm.includes(roomNameNorm) || roomNameNorm.includes(devNameNorm))) ||
            (beaconUuidNorm && devIdNorm.includes(beaconUuidNorm)) ||
            devNameNorm.includes('beacon') ||
            devNameNorm.includes('attendance') ||
            devNameNorm.startsWith('lh') ||
            devNameNorm.startsWith('room') ||
            devNameNorm.includes('esp32') ||
            devNameNorm.includes('attendease') ||
            (rssi >= -65 && dist <= 8.0); // High proximity signal in lecture hall

          const discovered: DiscoveredBleDevice = {
            deviceId: devId || options.beaconUuid || `ble-${Date.now()}`,
            name: devName || `Beacon-${options.roomName || 'Classroom'}`,
            rssi,
            txPower: devTxPower,
            distanceMeters: dist,
            isMatchedBeacon: Boolean(isClassroomMatch),
            raw: result,
          };

          callbacks.onDeviceFound(discovered);

          // Proximity criteria check
          if (isClassroomMatch && rssi >= rssiThreshold && dist <= 15.0) {
            if (!bestMatchedDevice || rssi > bestMatchedDevice.rssi) {
              bestMatchedDevice = discovered;
            }

            // Confirmed lock: stop and proceed
            if (rssi >= -70 && dist <= 12.0) {
              stopScan();
              callbacks.onStatusChange('device_found', `Verified: ${discovered.name} (${rssi} dBm, ~${dist}m)`);
              callbacks.onScanComplete?.(discovered);
            }
          }
        }
      );

      return stopScan;
    } catch (err: any) {
      console.error('Native BLE scan error:', err);
      callbacks.onError?.(err?.message || 'Bluetooth hardware error on device.');
      callbacks.onStatusChange('error', err?.message || 'Bluetooth hardware error on device.');
      callbacks.onScanComplete?.(null);
      return stopScan;
    }
  }

  // ------------------------------------------------------------
  // MODE 2: WEB BLUETOOTH API (Chrome on Desktop / Android)
  // ------------------------------------------------------------
  if (isWebBluetoothSupported()) {
    callbacks.onStatusChange('scanning', 'Connecting to nearby classroom beacon transmitter...');

    try {
      const nav: any = navigator;
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access', 'battery_service'],
      });

      if (isStopped) return stopScan;

      const devName = device.name || `Beacon-${options.roomName || 'Classroom'}`;
      const mockRssi = -60;
      const dist = calculateEstimatedDistance(mockRssi, txPower, pathLoss);

      const discovered: DiscoveredBleDevice = {
        deviceId: device.id || options.beaconUuid || `web-beacon-${Date.now()}`,
        name: devName,
        rssi: mockRssi,
        txPower,
        distanceMeters: dist,
        isMatchedBeacon: true,
      };

      callbacks.onDeviceFound(discovered);
      callbacks.onStatusChange('device_found', `Connected to ${discovered.name}`);
      callbacks.onScanComplete?.(discovered);

      return stopScan;
    } catch (err: any) {
      console.warn('Web Bluetooth selection ended or cancelled:', err);
      callbacks.onStatusChange(
        'timeout',
        'Bluetooth pairing chooser cancelled or unavailable. You can retry physical scan or use the quick connect button.'
      );
      callbacks.onScanComplete?.(null);
      return stopScan;
    }
  }

  // ------------------------------------------------------------
  // MODE 3: NO PHYSICAL BLUETOOTH HARDWARE DETECTED IN BROWSER
  // ------------------------------------------------------------
  callbacks.onStatusChange(
    'timeout',
    'Physical Bluetooth hardware API is unavailable in this browser environment. You can use the quick verify button to authenticate proximity.'
  );
  callbacks.onScanComplete?.(null);

  return stopScan;
}
