export type Decimal = { coefficient: bigint; scale: number };

export function parseDecimal(value: string): Decimal {
  const match = value.trim().match(/^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!match) throw new Error("Invalid numeric amount.");

  const fraction = match[3] ?? "";
  let coefficient = BigInt(`${match[2]}${fraction}`) * (match[1] === "-" ? -BigInt(1) : BigInt(1));
  let scale = fraction.length - Number(match[4] ?? 0);
  if (scale < 0) {
    coefficient *= BigInt(10) ** BigInt(-scale);
    scale = 0;
  }
  return { coefficient, scale };
}

export function addDecimals(left: Decimal, rightValue: string): Decimal {
  const right = parseDecimal(rightValue);
  const scale = Math.max(left.scale, right.scale);
  return {
    coefficient:
      left.coefficient * BigInt(10) ** BigInt(scale - left.scale) +
      right.coefficient * BigInt(10) ** BigInt(scale - right.scale),
    scale,
  };
}

export function subtractDecimals(leftValue: string, rightValue: string): Decimal {
  const left = parseDecimal(leftValue);
  const right = parseDecimal(rightValue);
  const scale = Math.max(left.scale, right.scale);
  return {
    coefficient:
      left.coefficient * BigInt(10) ** BigInt(scale - left.scale) -
      right.coefficient * BigInt(10) ** BigInt(scale - right.scale),
    scale,
  };
}

export function decimalToString(value: Decimal): string {
  const negative = value.coefficient < BigInt(0);
  const digits = (negative ? -value.coefficient : value.coefficient)
    .toString()
    .padStart(value.scale + 1, "0");
  if (!value.scale) return `${negative ? "-" : ""}${digits}`;
  const integer = digits.slice(0, -value.scale);
  const fraction = digits.slice(-value.scale).replace(/0+$/, "");
  return `${negative ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`;
}

export function compareDecimals(leftValue: string, rightValue: string): number {
  const difference = subtractDecimals(leftValue, rightValue).coefficient;
  return difference < BigInt(0) ? -1 : difference > BigInt(0) ? 1 : 0;
}

export function percentageOf(value: string, maximum: string): number {
  const part = parseDecimal(value);
  const whole = parseDecimal(maximum);
  const scale = Math.max(part.scale, whole.scale);
  const numerator = part.coefficient * BigInt(10) ** BigInt(scale - part.scale);
  const denominator = whole.coefficient * BigInt(10) ** BigInt(scale - whole.scale);
  if (denominator <= BigInt(0)) return 0;
  return Number((numerator * BigInt(10000)) / denominator) / 100;
}

export function formatMoney(value: string): string {
  const match = value.trim().match(/^([+-]?)(\d+)(?:\.(\d*))?$/);
  if (!match) return "RM0.00";
  const integer = match[2].replace(/^0+(?=\d)/, "");
  const fraction = match[3] ?? "";
  let minorUnits = BigInt(`${integer}${fraction.padEnd(2, "0").slice(0, 2)}`);
  if (fraction[2] && fraction[2] >= "5") minorUnits += BigInt(1);
  const whole = minorUnits / BigInt(100);
  const cents = (minorUnits % BigInt(100)).toString().padStart(2, "0");
  const formattedWhole = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(whole);
  return `${match[1] === "-" ? "-" : ""}${formattedWhole}.${cents}`;
}
