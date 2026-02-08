import TcpSocket from "react-native-tcp-socket";
import Zeroconf from "react-native-zeroconf";
import HikkaAuthStorage from "../Storage/HikkaAuthStorage";
import AniuaAuthStorage from "../Storage/AniuaAuthStorage";
import Logger from "../Logger/Logger";
import MainConfig from "../cfgs/MainConfig";

const TAG = "QRAuthTransfer";
const SERVICE_TYPE = "_aniua-auth._tcp.";
const TIMEOUT_MS = 120_000;
const DEV_FIXED_PORT = 55555;

interface QRPayload {
  v: number;
  service: string;
  secret: string;
  host: string;
  port: number;
}

interface AuthTransferData {
  secret: string;
  hikka: {
    token: string;
    expiration: number; // ms timestamp
    user: any;
  } | null;
  aniua: {
    accessToken: string;
    refreshToken: string;
    expiration: number; // ms timestamp
    user: any;
  } | null;
}

interface TransferResponse {
  success: boolean;
  error?: string;
}

function generateSecret(length = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomPort(): number {
  return 49152 + Math.floor(Math.random() * (65535 - 49152));
}

// ─── Receiver (Device B — not logged in) ───────────────────────────────

export interface ReceiverHandle {
  qrPayload: QRPayload;
  stop: () => void;
}

export function startReceiver(callbacks: {
  onConnecting: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onTimeout: () => void;
}): ReceiverHandle {
  const secret = generateSecret();
  const port = MainConfig.debug.isDebug ? DEV_FIXED_PORT : getRandomPort();
  const serviceName = `aniua-login-${secret.slice(0, 4)}`;
  let stopped = false;
  let server: ReturnType<typeof TcpSocket.createServer> | null = null;
  let zeroconf: Zeroconf | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    if (timeoutId) clearTimeout(timeoutId);
    try {
      server?.close();
    } catch {}
    try {
      zeroconf?.unpublishService(serviceName);
      zeroconf?.stop();
    } catch {}
    server = null;
    zeroconf = null;
  };

  // Auto-timeout
  timeoutId = setTimeout(() => {
    if (!stopped) {
      Logger.warn(TAG, "Receiver timeout");
      cleanup();
      callbacks.onTimeout();
    }
  }, TIMEOUT_MS);

  server = TcpSocket.createServer((socket) => {
    if (stopped) {
      socket.destroy();
      return;
    }
    callbacks.onConnecting();
    let data = "";

    socket.on("data", (chunk) => {
      data += chunk.toString();
      const nlIndex = data.indexOf("\n");
      if (nlIndex === -1) return;

      const message = data.slice(0, nlIndex);
      try {
        const transfer: AuthTransferData = JSON.parse(message);

        // Validate secret
        if (transfer.secret !== secret) {
          const resp: TransferResponse = {
            success: false,
            error: "Invalid secret",
          };
          socket.write(JSON.stringify(resp) + "\n");
          socket.destroy();
          cleanup();
          callbacks.onError("Невірний секретний ключ");
          return;
        }

        // Store Hikka auth
        if (transfer.hikka) {
          const secondsLeft = Math.max(
            0,
            (transfer.hikka.expiration - Date.now()) / 1000,
          );
          HikkaAuthStorage.setAuthData(
            transfer.hikka.token,
            secondsLeft,
            transfer.hikka.user,
          );
          Logger.info(TAG, "Hikka auth stored");
        }

        // Store AniUA auth
        if (transfer.aniua) {
          AniuaAuthStorage.setAuthData(
            transfer.aniua.accessToken,
            transfer.aniua.refreshToken,
            transfer.aniua.expiration,
            transfer.aniua.user,
          );
          Logger.info(TAG, "AniUA auth stored");
        }

        const resp: TransferResponse = { success: true };
        socket.write(JSON.stringify(resp) + "\n");
        socket.destroy();
        cleanup();
        callbacks.onSuccess();
      } catch (e) {
        Logger.error(TAG, "Failed to parse auth data", e);
        const resp: TransferResponse = {
          success: false,
          error: "Parse error",
        };
        socket.write(JSON.stringify(resp) + "\n");
        socket.destroy();
        cleanup();
        callbacks.onError("Помилка обробки даних");
      }
    });

    socket.on("error", (err) => {
      Logger.error(TAG, "Socket error", err);
      cleanup();
      callbacks.onError("Помилка з'єднання");
    });
  });

  server.listen({ port, host: "0.0.0.0" }, () => {
    Logger.info(TAG, `TCP server listening on port ${port}`);
  });

  server.on("error", (err) => {
    Logger.error(TAG, "Server error", err);
    cleanup();
    callbacks.onError("Не вдалося запустити сервер");
  });

  // Publish zeroconf
  zeroconf = new Zeroconf();
  try {
    zeroconf.publishService("_aniua-auth", "tcp", "local.", serviceName, port);
    Logger.info(TAG, `Zeroconf published: ${serviceName}`);
  } catch (e) {
    Logger.warn(TAG, "Zeroconf publish failed, QR direct mode only", e);
  }

  // Get local IP for QR payload
  const localHost = "0.0.0.0"; // Will be resolved by zeroconf or use direct IP from network info

  const qrPayload: QRPayload = {
    v: 1,
    service: serviceName,
    secret,
    host: localHost,
    port,
  };

  return { qrPayload, stop: cleanup };
}

// ─── Sender (Device A — logged in) ────────────────────────────────────

export interface FreshAuthData {
  hikka?: {
    token: string;
    expiration: number;
    user: any;
  };
  aniua?: {
    accessToken: string;
    refreshToken: string;
    expiration: number;
    user: any;
  };
}

export async function sendAuth(
  qrPayload: QRPayload,
  authData: FreshAuthData,
): Promise<{ success: boolean; error?: string }> {
  const { service, secret, host, port } = qrPayload;

  // Try zeroconf discovery first (5s timeout), then fallback to direct
  let targetHost = host;
  let targetPort = port;

  try {
    const resolved = await resolveZeroconf(service, 5000);
    if (resolved) {
      targetHost = resolved.host;
      targetPort = resolved.port;
      Logger.info(TAG, `Zeroconf resolved: ${targetHost}:${targetPort}`);
    }
  } catch (e) {
    Logger.warn(TAG, "Zeroconf resolution failed, using direct IP", e);
  }

  // If host is still 0.0.0.0, we need zeroconf to resolve
  if (targetHost === "0.0.0.0") {
    return { success: false, error: "Не вдалося знайти пристрій у мережі" };
  }

  const transferData: AuthTransferData = {
    secret,
    hikka: authData.hikka
      ? {
          token: authData.hikka.token,
          expiration: authData.hikka.expiration,
          user: authData.hikka.user,
        }
      : null,
    aniua: authData.aniua
      ? {
          accessToken: authData.aniua.accessToken,
          refreshToken: authData.aniua.refreshToken,
          expiration: authData.aniua.expiration,
          user: authData.aniua.user,
        }
      : null,
  };

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: "Час очікування вичерпано" });
    }, 15000);

    try {
      const client = TcpSocket.createConnection(
        { host: targetHost, port: targetPort },
        () => {
          Logger.info(TAG, "Connected to receiver");
          client.write(JSON.stringify(transferData) + "\n");
        },
      );

      let responseData = "";

      client.on("data", (chunk) => {
        responseData += chunk.toString();
        const nlIndex = responseData.indexOf("\n");
        if (nlIndex === -1) return;

        clearTimeout(timeout);
        const message = responseData.slice(0, nlIndex);
        try {
          const response: TransferResponse = JSON.parse(message);
          client.destroy();
          resolve(response);
        } catch {
          client.destroy();
          resolve({ success: false, error: "Невірна відповідь від пристрою" });
        }
      });

      client.on("error", (err) => {
        clearTimeout(timeout);
        Logger.error(TAG, "Connection error", err);
        resolve({
          success: false,
          error: "Помилка з'єднання з пристроєм",
        });
      });
    } catch (e) {
      clearTimeout(timeout);
      Logger.error(TAG, "Failed to connect", e);
      resolve({ success: false, error: "Не вдалося підключитися" });
    }
  });
}

// ─── Zeroconf helper ───────────────────────────────────────────────────

function resolveZeroconf(
  serviceName: string,
  timeoutMs: number,
): Promise<{ host: string; port: number } | null> {
  return new Promise((resolve) => {
    const zc = new Zeroconf();
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        zc.stop();
        resolve(null);
      }
    }, timeoutMs);

    zc.on("resolved", (service) => {
      if (resolved) return;
      if (service.name === serviceName) {
        resolved = true;
        clearTimeout(timeout);
        zc.stop();
        const host =
          service.addresses?.find((a: string) => a.includes(".")) ||
          service.host;
        resolve({ host, port: service.port });
      }
    });

    zc.on("error", () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        zc.stop();
        resolve(null);
      }
    });

    zc.scan("_aniua-auth", "tcp", "local.");
  });
}
