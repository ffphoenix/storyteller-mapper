type ParsedColor = {
  color: number;
  alpha: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const parseHex = (hex: string): ParsedColor => {
  const raw = hex.replace("#", "");
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    return { color: (r << 16) + (g << 8) + b, alpha: 1 };
  }
  const value = parseInt(raw, 16);
  if (raw.length === 6) {
    return { color: value, alpha: 1 };
  }
  if (raw.length === 8) {
    const a = value & 0xff;
    const rgb = value >>> 8;
    return { color: rgb, alpha: clamp(a / 255, 0, 1) };
  }
  return { color: 0x000000, alpha: 1 };
};

const parseRgba = (input: string): ParsedColor => {
  const match = input
    .replace(/\s+/g, "")
    .match(/^rgba?\((\d+),(\d+),(\d+)(?:,([0-9.]+))?\)$/i);
  if (!match) return { color: 0x000000, alpha: 1 };
  const r = clamp(parseInt(match[1], 10), 0, 255);
  const g = clamp(parseInt(match[2], 10), 0, 255);
  const b = clamp(parseInt(match[3], 10), 0, 255);
  const alpha = match[4] !== undefined ? clamp(parseFloat(match[4]), 0, 1) : 1;
  return { color: (r << 16) + (g << 8) + b, alpha };
};

export const parseColor = (value?: string | number, fallback: number = 0x000000): ParsedColor => {
  if (typeof value === "number") {
    return { color: value, alpha: 1 };
  }
  if (!value) {
    return { color: fallback, alpha: 1 };
  }
  if (value === "transparent") {
    return { color: fallback, alpha: 0 };
  }
  if (value.startsWith("#")) {
    return parseHex(value);
  }
  if (value.startsWith("rgb")) {
    return parseRgba(value);
  }
  return { color: fallback, alpha: 1 };
};
