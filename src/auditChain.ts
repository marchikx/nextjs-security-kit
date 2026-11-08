import { createHash } from "node:crypto";

export type AuditRecord = {
  index: number;
  timestamp: string;
  payload: string;
  prevHash: string;
  hash: string;
};

function chainHash(prevHash: string, payload: string): string {
  return createHash("sha256").update(`${prevHash}:${payload}`, "utf8").digest("hex");
}

const GENESIS = "0".repeat(64);

/**
 * Append-only tamper-evident audit log using a hash chain.
 */
export class AuditChain {
  private records: AuditRecord[] = [];
  private tailHash = GENESIS;

  get length(): number {
    return this.records.length;
  }

  get lastHash(): string {
    return this.tailHash;
  }

  snapshot(): readonly AuditRecord[] {
    return [...this.records];
  }

  append(payload: string, timestamp: string = new Date().toISOString()): AuditRecord {
    if (typeof payload !== "string") {
      throw new Error("payload must be a string");
    }
    const prevHash = this.tailHash;
    const hash = chainHash(prevHash, payload);
    const record: AuditRecord = {
      index: this.records.length,
      timestamp,
      payload,
      prevHash,
      hash,
    };
    this.records.push(record);
    this.tailHash = hash;
    return record;
  }

  verify(): boolean {
    let expectedPrev = GENESIS;
    for (const record of this.records) {
      if (record.prevHash !== expectedPrev) {
        return false;
      }
      const expectedHash = chainHash(record.prevHash, record.payload);
      if (record.hash !== expectedHash) {
        return false;
      }
      expectedPrev = record.hash;
    }
    return true;
  }
}
