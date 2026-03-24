import { Connection, ConnectionConfig, Commitment } from "@solana/web3.js";
import { RPC_ENDPOINTS } from "@askstudio/config";

export interface RpcHealth {
  endpoint: string;
  latencyMs: number;
  healthy: boolean;
  lastChecked: number;
}

const HEALTH_CHECK_TIMEOUT_MS = 5000;
const ROUND_ROBIN_INTERVAL_MS = 30_000;

class RpcManager {
  private endpoints: string[];
  private healthMap: Map<string, RpcHealth> = new Map();
  private currentIndex = 0;
  private connections: Map<string, Connection> = new Map();
  private lastRotation = 0;
  private pinnedEndpoint: string | null = null;

  constructor(endpoints: readonly string[]) {
    this.endpoints = [...endpoints];
    for (const ep of this.endpoints) {
      this.healthMap.set(ep, {
        endpoint: ep,
        latencyMs: Infinity,
        healthy: true,
        lastChecked: 0,
      });
    }
  }

  private getOrCreateConnection(endpoint: string, commitment: Commitment = "confirmed"): Connection {
    const key = `${endpoint}:${commitment}`;
    if (!this.connections.has(key)) {
      const config: ConnectionConfig = { commitment, disableRetryOnRateLimit: false };
      this.connections.set(key, new Connection(endpoint, config));
    }
    return this.connections.get(key)!;
  }

  async checkHealth(endpoint: string): Promise<RpcHealth> {
    const start = Date.now();
    let healthy = false;
    let latencyMs = Infinity;
    const timeoutHandle = { id: undefined as ReturnType<typeof setTimeout> | undefined };
    try {
      const conn = this.getOrCreateConnection(endpoint);
      await Promise.race([
        conn.getSlot(),
        new Promise<never>((_, reject) => {
          timeoutHandle.id = setTimeout(
            () => reject(new Error("timeout")),
            HEALTH_CHECK_TIMEOUT_MS
          );
        }),
      ]);
      latencyMs = Date.now() - start;
      healthy = true;
    } catch {
      latencyMs = Infinity;
      healthy = false;
    } finally {
      if (timeoutHandle.id !== undefined) clearTimeout(timeoutHandle.id);
    }
    const health: RpcHealth = { endpoint, latencyMs, healthy, lastChecked: Date.now() };
    this.healthMap.set(endpoint, health);
    return health;
  }

  async checkAllHealth(): Promise<RpcHealth[]> {
    const results = await Promise.all(this.endpoints.map((ep) => this.checkHealth(ep)));
    return results;
  }

  getBestEndpoint(): string {
    if (this.pinnedEndpoint && this.endpoints.includes(this.pinnedEndpoint)) {
      return this.pinnedEndpoint;
    }
    const healthy = this.endpoints
      .map((ep) => this.healthMap.get(ep)!)
      .filter((h) => h.healthy)
      .sort((a, b) => a.latencyMs - b.latencyMs);
    if (healthy.length > 0) return healthy[0].endpoint;
    return this.endpoints[0];
  }

  getNextEndpoint(): string {
    const now = Date.now();
    if (now - this.lastRotation > ROUND_ROBIN_INTERVAL_MS) {
      this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
      this.lastRotation = now;
    }
    const start = this.currentIndex;
    for (let i = 0; i < this.endpoints.length; i++) {
      const idx = (start + i) % this.endpoints.length;
      const ep = this.endpoints[idx];
      const health = this.healthMap.get(ep);
      if (health?.healthy) return ep;
    }
    return this.endpoints[this.currentIndex % this.endpoints.length];
  }

  getConnection(commitment: Commitment = "confirmed"): Connection {
    const endpoint = this.getBestEndpoint();
    return this.getOrCreateConnection(endpoint, commitment);
  }

  async getConnectionWithFailover(commitment: Commitment = "confirmed"): Promise<Connection> {
    const best = this.getBestEndpoint();
    const conn = this.getOrCreateConnection(best, commitment);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        conn.getSlot(),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("timeout")), HEALTH_CHECK_TIMEOUT_MS);
        }),
      ]);
      return conn;
    } catch {
      this.healthMap.set(best, { ...this.healthMap.get(best)!, healthy: false });
      const fallback = this.getBestEndpoint();
      return this.getOrCreateConnection(fallback, commitment);
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }

  getAllHealth(): RpcHealth[] {
    return this.endpoints.map((ep) => this.healthMap.get(ep)!);
  }

  setEndpointHealth(endpoint: string, healthy: boolean): void {
    const h = this.healthMap.get(endpoint);
    if (h) this.healthMap.set(endpoint, { ...h, healthy });
  }

  /**
   * Pin a specific endpoint so all subsequent `getBestEndpoint` calls return it.
   * Pass `null` to resume automatic health-based selection.
   */
  pinEndpoint(endpoint: string | null): void {
    this.pinnedEndpoint = endpoint;
  }

  getPinnedEndpoint(): string | null {
    return this.pinnedEndpoint;
  }
}

export const rpcManager = new RpcManager(RPC_ENDPOINTS);

export function createConnection(endpoint?: string, commitment: Commitment = "confirmed"): Connection {
  const ep = endpoint ?? rpcManager.getBestEndpoint();
  return new Connection(ep, { commitment });
}
