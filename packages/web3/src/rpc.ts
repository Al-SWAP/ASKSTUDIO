import { Connection, ConnectionConfig, Commitment } from "@solana/web3.js";
import { RPC_ENDPOINTS } from "@askstudio/config";

export interface RpcHealth {
  endpoint: string;
  latencyMs: number;
  healthy: boolean;
  lastChecked: number;
}

const HEALTH_CHECK_TIMEOUT_MS = 5_000;
const ROUND_ROBIN_INTERVAL_MS = 30_000;

class RpcManager {
  private endpoints: string[];
  private healthMap: Map<string, RpcHealth> = new Map();
  private currentIndex = 0;
  private connections: Map<string, Connection> = new Map();
  private lastRotation = 0;
  /** Explicit endpoint selected via switchEndpoint(). Cleared if it becomes unhealthy. */
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
    const conn = this.getOrCreateConnection(endpoint);

    // Resolve with a sentinel instead of rejecting so the losing branch of
    // Promise.race cannot produce an unhandled rejection noise or crash.
    const timeoutPromise = new Promise<"timeout">((resolve) =>
      setTimeout(() => resolve("timeout"), HEALTH_CHECK_TIMEOUT_MS)
    );

    try {
      const result = await Promise.race([
        conn.getLatestBlockhash("finalized").then(() => "ok" as const),
        timeoutPromise,
      ]);
      if (result === "timeout") throw new Error("Health check timeout");
      const health: RpcHealth = {
        endpoint,
        latencyMs: Date.now() - start,
        healthy: true,
        lastChecked: Date.now(),
      };
      this.healthMap.set(endpoint, health);
      return health;
    } catch {
      const health: RpcHealth = {
        endpoint,
        latencyMs: Infinity,
        healthy: false,
        lastChecked: Date.now(),
      };
      this.healthMap.set(endpoint, health);
      return health;
    }
  }

  async checkAllHealth(): Promise<RpcHealth[]> {
    return Promise.all(this.endpoints.map((ep) => this.checkHealth(ep)));
  }

  getBestEndpoint(): string {
    // If an endpoint was explicitly pinned by switchEndpoint() and is still healthy, prefer it.
    if (this.pinnedEndpoint) {
      const h = this.healthMap.get(this.pinnedEndpoint);
      if (h?.healthy ?? true) return this.pinnedEndpoint;
      // Pinned endpoint became unhealthy — fall back to round-robin.
      this.pinnedEndpoint = null;
    }

    const now = Date.now();
    const shouldRotate = now - this.lastRotation > ROUND_ROBIN_INTERVAL_MS;

    const healthy = this.endpoints.filter((ep) => {
      const h = this.healthMap.get(ep);
      return h?.healthy ?? true;
    });

    const pool = healthy.length > 0 ? healthy : this.endpoints;
    if (pool.length === 0) throw new Error("No RPC endpoints configured");

    if (shouldRotate) {
      this.currentIndex = (this.currentIndex + 1) % pool.length;
      this.lastRotation = now;
    }

    return pool[this.currentIndex % pool.length]!;
  }

  getConnection(commitment: Commitment = "confirmed"): Connection {
    return this.getOrCreateConnection(this.getBestEndpoint(), commitment);
  }

  getHealthMap(): Map<string, RpcHealth> {
    return new Map(this.healthMap);
  }

  getAllHealth(): RpcHealth[] {
    return this.endpoints.map(
      (ep) => this.healthMap.get(ep) ?? { endpoint: ep, latencyMs: Infinity, healthy: false, lastChecked: 0 }
    );
  }

  /**
   * Pin a specific endpoint for all subsequent connections.
   * The pin is automatically released if the endpoint is found unhealthy during getBestEndpoint().
   */
  switchEndpoint(endpoint: string): void {
    if (this.endpoints.includes(endpoint)) {
      this.pinnedEndpoint = endpoint;
    }
  }

  addEndpoint(endpoint: string): void {
    if (!this.endpoints.includes(endpoint)) {
      this.endpoints.push(endpoint);
      this.healthMap.set(endpoint, {
        endpoint,
        latencyMs: Infinity,
        healthy: true,
        lastChecked: 0,
      });
    }
  }
}

export const rpcManager = new RpcManager(RPC_ENDPOINTS);

export function getConnection(commitment: Commitment = "confirmed"): Connection {
  return rpcManager.getConnection(commitment);
}
