export type TypewriterKeyId =
  | "ESC"
  | "SHIFT"
  | "RETURN"
  | "BACKSPACE"
  | "SPACE"
  | "MINUS"
  | "EQUAL"
  | "LBRACKET"
  | "RBRACKET"
  | "BACKSLASH"
  | "SEMICOLON"
  | "QUOTE"
  | "COMMA"
  | "PERIOD"
  | "SLASH"
  | "BACKTICK"
  | "DIGIT_0"
  | "DIGIT_1"
  | "DIGIT_2"
  | "DIGIT_3"
  | "DIGIT_4"
  | "DIGIT_5"
  | "DIGIT_6"
  | "DIGIT_7"
  | "DIGIT_8"
  | "DIGIT_9"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type KeyDef = {
  id: TypewriterKeyId;
  label: string;
  shiftedLabel?: string;
  w?: number; // width units
};

export const TYPEWRITER_KEYBOARD_ROWS: KeyDef[][] = [
  [
    { id: "BACKTICK", label: "`", shiftedLabel: "~" },
    { id: "DIGIT_1", label: "1", shiftedLabel: "!" },
    { id: "DIGIT_2", label: "2", shiftedLabel: "@" },
    { id: "DIGIT_3", label: "3", shiftedLabel: "#" },
    { id: "DIGIT_4", label: "4", shiftedLabel: "$" },
    { id: "DIGIT_5", label: "5", shiftedLabel: "%" },
    { id: "DIGIT_6", label: "6", shiftedLabel: "^" },
    { id: "DIGIT_7", label: "7", shiftedLabel: "&" },
    { id: "DIGIT_8", label: "8", shiftedLabel: "*" },
    { id: "DIGIT_9", label: "9", shiftedLabel: "(" },
    { id: "DIGIT_0", label: "0", shiftedLabel: ")" },
    { id: "MINUS", label: "-", shiftedLabel: "_" },
    { id: "EQUAL", label: "=", shiftedLabel: "+" },
  ],
  [
    { id: "Q", label: "Q" },
    { id: "W", label: "W" },
    { id: "E", label: "E" },
    { id: "R", label: "R" },
    { id: "T", label: "T" },
    { id: "Y", label: "Y" },
    { id: "U", label: "U" },
    { id: "I", label: "I" },
    { id: "O", label: "O" },
    { id: "P", label: "P" },
  ],
  [
    { id: "A", label: "A" },
    { id: "S", label: "S" },
    { id: "D", label: "D" },
    { id: "F", label: "F" },
    { id: "G", label: "G" },
    { id: "H", label: "H" },
    { id: "J", label: "J" },
    { id: "K", label: "K" },
    { id: "L", label: "L" },
    { id: "SEMICOLON", label: ";", shiftedLabel: ":" },
    { id: "QUOTE", label: "'", shiftedLabel: "\"" },
    { id: "RETURN", label: "Return", w: 1.6 },
  ],
  [
    { id: "SHIFT", label: "Shift", w: 1.6 },
    { id: "Z", label: "Z" },
    { id: "X", label: "X" },
    { id: "C", label: "C" },
    { id: "V", label: "V" },
    { id: "B", label: "B" },
    { id: "N", label: "N" },
    { id: "M", label: "M" },
    { id: "COMMA", label: ",", shiftedLabel: "<" },
    { id: "PERIOD", label: ".", shiftedLabel: ">" },
    { id: "SLASH", label: "/", shiftedLabel: "?" },
    { id: "BACKSPACE", label: "Bksp", w: 1.6 },
  ],
  [{ id: "SPACE", label: "Space", w: 6.8 }],
];

const DIGITS: Record<string, TypewriterKeyId> = {
  "0": "DIGIT_0",
  "1": "DIGIT_1",
  "2": "DIGIT_2",
  "3": "DIGIT_3",
  "4": "DIGIT_4",
  "5": "DIGIT_5",
  "6": "DIGIT_6",
  "7": "DIGIT_7",
  "8": "DIGIT_8",
  "9": "DIGIT_9",
};

const SHIFTED: Record<string, string> = {
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "0": ")",
  "-": "_",
  "=": "+",
  "[": "{",
  "]": "}",
  "\\": "|",
  ";": ":",
  "'": "\"",
  ",": "<",
  ".": ">",
  "/": "?",
  "`": "~",
};

const UNSHIFTED_BY_SHIFTED: Record<string, string> = Object.fromEntries(
  Object.entries(SHIFTED).map(([k, v]) => [v, k]),
);

export type KeyPress = {
  keys: TypewriterKeyId[];
  category: "key" | "space" | "punct" | "return" | "backspace";
};

function keyIdForUnshiftedSymbol(sym: string): TypewriterKeyId | undefined {
  switch (sym) {
    case "-":
      return "MINUS";
    case "=":
      return "EQUAL";
    case "[":
      return "LBRACKET";
    case "]":
      return "RBRACKET";
    case "\\":
      return "BACKSLASH";
    case ";":
      return "SEMICOLON";
    case "'":
      return "QUOTE";
    case ",":
      return "COMMA";
    case ".":
      return "PERIOD";
    case "/":
      return "SLASH";
    case "`":
      return "BACKTICK";
    default:
      return undefined;
  }
}

export function deriveKeyPressFromChar(ch: string): KeyPress {
  if (ch === " ") return { keys: ["SPACE"], category: "space" };
  if (ch === "\n") return { keys: ["RETURN"], category: "return" };

  if (ch === "Backspace") return { keys: ["BACKSPACE"], category: "backspace" };

  const upper = ch.toUpperCase();
  if (upper >= "A" && upper <= "Z") {
    const needsShift = ch !== upper;
    return { keys: needsShift ? ["SHIFT", upper as TypewriterKeyId] : [upper as TypewriterKeyId], category: "key" };
  }

  if (ch in DIGITS) {
    return { keys: [DIGITS[ch] as TypewriterKeyId], category: "key" };
  }

  const unshifted = UNSHIFTED_BY_SHIFTED[ch];
  if (unshifted) {
    if (unshifted in DIGITS) {
      return { keys: ["SHIFT", DIGITS[unshifted] as TypewriterKeyId], category: "punct" };
    }
    const kid = keyIdForUnshiftedSymbol(unshifted);
    if (kid) return { keys: ["SHIFT", kid], category: "punct" };
  }

  const kid = keyIdForUnshiftedSymbol(ch);
  if (kid) return { keys: [kid], category: "punct" };

  // Fallback: animate shift lightly so it still "feels" mechanical.
  return { keys: ["SHIFT"], category: "punct" };
}
