import { OfflineDatabaseBackup } from '../types/database';

export interface P2PConnectionState {
  status: 'idle' | 'generating_offer' | 'waiting_answer' | 'connecting' | 'connected' | 'completed' | 'error';
  role: 'sender' | 'receiver' | null;
  error?: string;
  dataChannel?: RTCDataChannel;
  peerConnection?: RTCPeerConnection;
}

/**
 * Compress an OfflineDatabaseBackup into a base64 string for quick offline transfer
 */
export function serializeBackupForP2P(backup: OfflineDatabaseBackup): string {
  const jsonStr = JSON.stringify(backup);
  if (typeof btoa !== 'undefined') {
    return btoa(encodeURIComponent(jsonStr));
  }
  return jsonStr;
}

/**
 * Deserialize a base64 transfer payload back into OfflineDatabaseBackup
 */
export function deserializeBackupFromP2P(payload: string): OfflineDatabaseBackup {
  let jsonStr = payload.trim();
  try {
    if (typeof atob !== 'undefined') {
      jsonStr = decodeURIComponent(atob(payload.trim()));
    }
  } catch {
    // If not base64, try raw json
    jsonStr = payload.trim();
  }
  return JSON.parse(jsonStr) as OfflineDatabaseBackup;
}

/**
 * Creates a serverless WebRTC connection for direct station-to-station sync
 */
export class StudioP2PClient {
  private pc: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private onStateChangeCallback?: (state: string) => void;
  private onDataReceivedCallback?: (backup: OfflineDatabaseBackup) => void;

  constructor(
    onStateChange?: (state: string) => void,
    onDataReceived?: (backup: OfflineDatabaseBackup) => void
  ) {
    this.onStateChangeCallback = onStateChange;
    this.onDataReceivedCallback = onDataReceived;
  }

  // Sender starts offer
  async createOffer(): Promise<string> {
    this.cleanup();
    this.pc = new RTCPeerConnection({
      iceServers: [], // Air-gapped / local only
    });

    this.channel = this.pc.createDataChannel('poli_studio_sync', {
      ordered: true,
    });

    this.setupDataChannel(this.channel);

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Wait briefly for local candidates
    await new Promise<void>((resolve) => {
      if (this.pc?.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (this.pc?.iceGatheringState === 'complete') {
            this.pc.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        this.pc?.addEventListener('icegatheringstatechange', checkState);
        setTimeout(resolve, 800); // 800ms fallback timeout
      }
    });

    const localDesc = this.pc.localDescription;
    return btoa(JSON.stringify(localDesc));
  }

  // Receiver accepts offer and creates answer
  async handleOfferAndCreateAnswer(offerBase64: string): Promise<string> {
    this.cleanup();
    this.pc = new RTCPeerConnection({
      iceServers: [],
    });

    this.pc.ondatachannel = (event) => {
      this.channel = event.channel;
      this.setupDataChannel(this.channel);
    };

    const offerDesc = JSON.parse(atob(offerBase64.trim()));
    await this.pc.setRemoteDescription(new RTCSessionDescription(offerDesc));

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    await new Promise<void>((resolve) => {
      if (this.pc?.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (this.pc?.iceGatheringState === 'complete') {
            this.pc.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        this.pc?.addEventListener('icegatheringstatechange', checkState);
        setTimeout(resolve, 800);
      }
    });

    return btoa(JSON.stringify(this.pc.localDescription));
  }

  // Sender accepts receiver's answer
  async acceptAnswer(answerBase64: string): Promise<void> {
    if (!this.pc) throw new Error('Peer connection not initialised');
    const answerDesc = JSON.parse(atob(answerBase64.trim()));
    await this.pc.setRemoteDescription(new RTCSessionDescription(answerDesc));
  }

  // Send backup data across channel
  sendBackup(backup: OfflineDatabaseBackup): void {
    if (!this.channel || this.channel.readyState !== 'open') {
      throw new Error('Data channel not open');
    }
    const serialized = JSON.stringify(backup);
    this.channel.send(serialized);
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      this.onStateChangeCallback?.('connected');
    };
    channel.onclose = () => {
      this.onStateChangeCallback?.('closed');
    };
    channel.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        this.onDataReceivedCallback?.(parsed);
      } catch (err) {
        console.error('P2P Message parse error', err);
      }
    };
  }

  cleanup() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}
