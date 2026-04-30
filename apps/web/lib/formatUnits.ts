/**
 * Format a base-unit integer string (e.g. "1000000") into a human-readable decimal
 * string (e.g. "1.000000") using BigInt to avoid floating-point precision loss on
 * large values that exceed Number.MAX_SAFE_INTEGER.
 *
 * @param baseUnits  - Integer string in the token's smallest unit (e.g. "123456789")
 * @param decimals   - Number of decimal places for the token
 * @param maxDisplay - Maximum decimal digits to show (default 6)
 */
export function formatBaseUnits(
  baseUnits: string,
  decimals: number,
  maxDisplay = 6
): string {
  if (!baseUnits || baseUnits === "0") return "0";
  const bn = BigInt(baseUnits);
  if (decimals === 0) return bn.toString();

  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = bn / divisor;
  const frac = bn % divisor;

  const fracStr = frac.toString().padStart(decimals, "0");
  const display = Math.min(decimals, maxDisplay);
  const trimmed = fracStr.slice(0, display).replace(/0+$/, "");

  return trimmed.length > 0 ? `${whole}.${trimmed}` : whole.toString();
}
