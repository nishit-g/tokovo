import type { InputProjection, KeyboardFamily, KeyboardLayoutKind } from "../contract/index.js";

type KeyboardRows = readonly (readonly string[])[];

export interface KeyboardLayoutDefinition {
  id: string;
  rows: KeyboardRows;
  rowInsets: readonly number[];
  keyGapScale: number;
  fontScale: number;
  controlRow: number;
  showsShift: boolean;
  form: "rows" | "flick-grid";
}

const LATIN: KeyboardRows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

/** iOS 18+ alphabetical Hindi layout; intentionally not the old crowded InScript approximation. */
const IOS_DEVANAGARI_ALPHABETICAL: KeyboardRows = [
  ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ"],
  ["क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ"],
  ["त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म"],
  ["य", "र", "ल", "व", "श", "ष", "स", "ह"],
];

/** Gboard Hindi alphabetic arrangement with full-size targets and dedicated vowel row. */
const ANDROID_DEVANAGARI_ALPHABETICAL: KeyboardRows = [
  ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ"],
  ["क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ"],
  ["त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म"],
  ["य", "र", "ल", "व", "श", "ष", "स", "ह"],
];

const FAMILY_ROWS: Partial<Record<KeyboardFamily, KeyboardRows>> = {
  latin: LATIN,
  cjk: LATIN,
  generic: LATIN,
  arabic: [
    ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
    ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
    ["ئ", "ء", "ؤ", "ر", "ى", "ة", "و", "ز", "ظ"],
  ],
  cyrillic: [
    ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х"],
    ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
    ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
  ],
  devanagari: [
    ["ौ", "ै", "ा", "ी", "ू", "ब", "ह", "ग", "द", "ज", "ड"],
    ["ो", "े", "्", "ि", "ु", "प", "र", "क", "त", "च", "ट"],
    ["ं", "म", "न", "व", "ल", "स", "य"],
  ],
  bengali: [
    ["ৌ", "ৈ", "া", "ী", "ূ", "ব", "হ", "গ", "দ", "জ", "ড"],
    ["ো", "ে", "্", "ি", "ু", "প", "র", "ক", "ত", "চ", "ট"],
    ["ং", "ম", "ন", "ব", "ল", "স", "য"],
  ],
  gurmukhi: [
    ["ੌ", "ੈ", "ਾ", "ੀ", "ੂ", "ਬ", "ਹ", "ਗ", "ਦ", "ਜ", "ਡ"],
    ["ੋ", "ੇ", "੍", "ਿ", "ੁ", "ਪ", "ਰ", "ਕ", "ਤ", "ਚ", "ਟ"],
    ["ੰ", "ਮ", "ਨ", "ਵ", "ਲ", "ਸ", "ਯ"],
  ],
  gujarati: [
    ["ૌ", "ૈ", "ા", "ી", "ૂ", "બ", "હ", "ગ", "દ", "જ", "ડ"],
    ["ો", "ે", "્", "િ", "ુ", "પ", "ર", "ક", "ત", "ચ", "ટ"],
    ["ં", "મ", "ન", "વ", "લ", "સ", "ય"],
  ],
  tamil: [
    ["ஆ", "ஈ", "ஊ", "ஏ", "ஐ", "ஓ", "க", "ங", "ச", "ஞ"],
    ["ட", "ண", "த", "ந", "ப", "ம", "ய", "ர", "ல"],
    ["வ", "ழ", "ள", "ற", "ன", "ஸ", "ஹ"],
  ],
  telugu: [
    ["ఆ", "ఈ", "ఊ", "ఏ", "ఐ", "ఓ", "క", "గ", "చ", "జ"],
    ["ట", "డ", "త", "ద", "న", "ప", "బ", "మ", "య"],
    ["ర", "ల", "వ", "శ", "ష", "స", "హ"],
  ],
  kannada: [
    ["ಆ", "ಈ", "ಊ", "ಏ", "ಐ", "ಓ", "ಕ", "ಗ", "ಚ", "ಜ"],
    ["ಟ", "ಡ", "ತ", "ದ", "ನ", "ಪ", "ಬ", "ಮ", "ಯ"],
    ["ರ", "ಲ", "ವ", "ಶ", "ಷ", "ಸ", "ಹ"],
  ],
  malayalam: [
    ["ആ", "ഈ", "ഊ", "ഏ", "ഐ", "ഓ", "ക", "ഗ", "ച", "ജ"],
    ["ട", "ഡ", "ത", "ദ", "ന", "പ", "ബ", "മ", "യ"],
    ["ര", "ല", "വ", "ശ", "ഷ", "സ", "ഹ"],
  ],
  thai: [
    ["ๆ", "ไ", "ำ", "พ", "ะ", "ั", "ี", "ร", "น", "ย", "บ", "ล"],
    ["ฟ", "ห", "ก", "ด", "เ", "้", "่", "า", "ส", "ว", "ง"],
    ["ผ", "ป", "แ", "อ", "ิ", "ื", "ท", "ม", "ใ", "ฝ"],
  ],
  hangul: [
    ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"],
    ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
    ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"],
  ],
  kana: [
    ["あ", "か", "さ"],
    ["た", "な", "は"],
    ["ま", "や", "ら"],
    ["小", "わ", "ん"],
  ],
};

const LAYOUT_ROWS: Record<Exclude<KeyboardLayoutKind, "letters">, KeyboardRows> = {
  numbers: [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
    [".", ",", "?", "!", "'"],
  ],
  symbols: [
    ["[", "]", "{", "}", "#", "%", "^", "*", "+", "="],
    ["_", "\\", "|", "~", "<", ">", "€", "£", "¥", "•"],
    [".", ",", "?", "!", "'"],
  ],
  emoji: [
    ["😀", "😂", "🥹", "😍", "🤩", "😎", "😭", "😡"],
    ["👍", "👎", "👏", "🙏", "💪", "🤝", "❤️", "🔥"],
    ["🎉", "✨", "💯", "🚀", "✅", "👀", "🤔", "🙌"],
  ],
};

export function resolveInputKeyboardLayout(projection: InputProjection): KeyboardLayoutDefinition {
  if (projection.surface.layout !== "letters") {
    return {
      id: `${projection.surface.platform}:${projection.surface.layout}`,
      rows: LAYOUT_ROWS[projection.surface.layout],
      rowInsets: [0, 0, 14],
      keyGapScale: 1,
      fontScale: projection.surface.layout === "emoji" ? 0.88 : 1,
      controlRow: 2,
      showsShift: projection.surface.layout !== "emoji",
      form: "rows",
    };
  }
  if (projection.surface.family === "devanagari") {
    return {
      id:
        projection.surface.platform === "ios"
          ? "ios:devanagari-alphabetical@1"
          : "android:devanagari-alphabetical@1",
      rows:
        projection.surface.platform === "ios"
          ? IOS_DEVANAGARI_ALPHABETICAL
          : ANDROID_DEVANAGARI_ALPHABETICAL,
      rowInsets: [0, 0, 0, 10],
      keyGapScale: projection.surface.platform === "ios" ? 0.72 : 0.78,
      fontScale: projection.surface.platform === "ios" ? 0.82 : 0.86,
      controlRow: 3,
      showsShift: false,
      form: "rows",
    };
  }
  const dense =
    projection.surface.family === "arabic" ||
    projection.surface.family === "thai" ||
    projection.surface.family === "bengali" ||
    projection.surface.family === "gurmukhi" ||
    projection.surface.family === "gujarati";
  return {
    id: `${projection.surface.platform}:${projection.surface.family}@1`,
    rows: (FAMILY_ROWS[projection.surface.family] ?? LATIN).map((row) => row.map((key) => projection.surface.uppercase ? key.toLocaleUpperCase(projection.locale.tag) : key)),
    rowInsets: [0, projection.surface.platform === "ios" ? 20 : 7, 0],
    keyGapScale: dense ? 0.72 : 1,
    fontScale: dense ? 0.84 : 1,
    controlRow: projection.surface.family === "kana" ? 3 : 2,
    showsShift: projection.surface.family !== "kana",
    form: projection.surface.family === "kana" ? "flick-grid" : "rows",
  };
}
