import { randomBytes, solidityPackedKeccak256, toBigInt } from "ethers";

export type Move = 1 | 2 | 3 | 4 | 5;

export function generateSaltUint256(): bigint {
  const bytes = randomBytes(32);
  return toBigInt(bytes);
}

export function commitment(move: Move, salt: bigint): string {
  return solidityPackedKeccak256(["uint8", "uint256"], [move, salt]);
}
