import { createCipheriv } from "node:crypto";

import { Injectable } from "@nestjs/common";

const BLOCK_SIZE = 16;
const SV2_PREFIX = Buffer.from("3CC300010080", "hex");
const RB_CONSTANT = 0x87;

export interface VerifyCmacPayload {
  uidHex: string;
  counter: number;
  macHex: string;
  keyHex: string;
}

export class CmacVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CmacVerificationError";
  }
}

@Injectable()
export class CmacService {
  verifyMac(payload: VerifyCmacPayload): boolean {
    const uidHex = payload.uidHex.trim();
    const macHex = payload.macHex.trim();
    const keyHex = payload.keyHex.trim();
    const counter = payload.counter;

    if (uidHex.length !== 14) {
      throw new CmacVerificationError(
        "UID must have exactly 14 hex characters (7 bytes).",
      );
    }

    if (macHex.length !== 16) {
      throw new CmacVerificationError(
        "MAC must have exactly 16 hex characters (8 bytes).",
      );
    }

    if (!Number.isInteger(counter) || counter < 0 || counter > 0xff_ff_ff) {
      throw new CmacVerificationError(
        "CTR must be within 0..16777215 (0x000000..0xFFFFFF).",
      );
    }

    if (keyHex.length !== 32) {
      throw new CmacVerificationError(
        "AES-128 key must have 32 hex characters (16 bytes).",
      );
    }

    const ctrHex = counter.toString(16).toUpperCase().padStart(6, "0");
    const sdmKey = Buffer.from(keyHex, "hex");
    const uidBytes = Buffer.from(uidHex, "hex");
    const ctrBytes = Buffer.from(ctrHex, "hex");
    const ctrBytesLe = this.reverseBuffer(ctrBytes);

    const sv2 = Buffer.concat([SV2_PREFIX, uidBytes, ctrBytesLe]);
    const kses = this.aesCmac(sdmKey, sv2);

    const macInput = Buffer.from(uidHex + ctrHex, "ascii");
    const fullCmac = this.aesCmac(kses, macInput);
    const macCalc = this.truncateMac(fullCmac);
    const macFromTag = Buffer.from(macHex, "hex");

    return macCalc.equals(macFromTag);
  }

  private truncateMac(fullCmac: Buffer): Buffer {
    const truncated = Buffer.alloc(BLOCK_SIZE / 2);

    for (
      let index = 1, index_ = 0;
      index < fullCmac.length;
      index += 2, index_++
    ) {
      truncated[index_] = fullCmac[index];
    }

    return truncated;
  }

  private aesCmac(key: Buffer, message: Buffer): Buffer {
    const { k1, k2 } = this.generateSubkeys(key);
    const blocks = this.splitIntoBlocks(message);
    const lastBlockComplete =
      message.length > 0 && message.length % BLOCK_SIZE === 0;

    const n = blocks.length === 0 ? 1 : blocks.length;

    const lastBlock = lastBlockComplete
      ? this.xorBuffers(blocks[n - 1], k1)
      : this.xorBuffers(this.padBlock(blocks[n - 1] ?? Buffer.alloc(0)), k2);

    let x: Buffer<ArrayBufferLike> = Buffer.alloc(BLOCK_SIZE, 0);

    for (let index = 0; index < n - 1; index++) {
      x = this.encryptBlock(
        key,
        this.xorBuffers(x, blocks[index] ?? Buffer.alloc(BLOCK_SIZE, 0)),
      );
    }

    return this.encryptBlock(key, this.xorBuffers(x, lastBlock));
  }

  private splitIntoBlocks(message: Buffer): Buffer[] {
    const blocks: Buffer[] = [];

    for (let offset = 0; offset < message.length; offset += BLOCK_SIZE) {
      blocks.push(message.subarray(offset, offset + BLOCK_SIZE));
    }

    return blocks;
  }

  private padBlock(block: Buffer): Buffer {
    const padded = Buffer.alloc(BLOCK_SIZE, 0);

    block.copy(padded);
    padded[block.length] = 0x80;

    return padded;
  }

  private generateSubkeys(key: Buffer) {
    const l = this.encryptBlock(key, Buffer.alloc(BLOCK_SIZE, 0));

    const k1 = this.leftShiftOneBit(l);
    if (l[0] & 0x80) {
      k1[BLOCK_SIZE - 1] ^= RB_CONSTANT;
    }

    const k2 = this.leftShiftOneBit(k1);
    if (k1[0] & 0x80) {
      k2[BLOCK_SIZE - 1] ^= RB_CONSTANT;
    }

    return { k1, k2 };
  }

  private leftShiftOneBit(buffer: Buffer): Buffer {
    const shifted = Buffer.alloc(buffer.length);
    let carry = 0;

    for (let index = buffer.length - 1; index >= 0; index--) {
      const byte = buffer[index];
      shifted[index] = ((byte << 1) & 0xff) | carry;
      carry = byte >> 7;
    }

    return shifted;
  }

  private xorBuffers(a: Buffer, b: Buffer): Buffer {
    const result = Buffer.alloc(BLOCK_SIZE);

    for (let index = 0; index < BLOCK_SIZE; index++) {
      result[index] = (a[index] ?? 0) ^ (b[index] ?? 0);
    }

    return result;
  }

  private reverseBuffer(buffer: Buffer): Buffer {
    const reversed = Buffer.alloc(buffer.length);

    for (let index = 0; index < buffer.length; index++) {
      reversed[index] = buffer[buffer.length - 1 - index];
    }

    return reversed;
  }

  private encryptBlock(key: Buffer, block: Buffer): Buffer {
    const cipher = createCipheriv("aes-128-ecb", key, null);
    cipher.setAutoPadding(false);
    return Buffer.concat([cipher.update(block), cipher.final()]) as Buffer;
  }
}
