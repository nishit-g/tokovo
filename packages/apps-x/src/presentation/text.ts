import twitterText from "twitter-text";

const graphemes = new Intl.Segmenter("en", { granularity: "grapheme" });
const emoji = new RegExp("^\\p{RGI_Emoji}$", "v");

/** Reference URL/weight rules, with current Unicode joined emoji counted as two. */
export function xPostBudget(text: string, limit = 280) {
  const urls = twitterText.extractUrlsWithIndices(text);
  const weightedText = Array.from(graphemes.segment(text), ({ segment, index }) =>
    emoji.test(segment) && !urls.some(({ indices }) => index >= indices[0] && index < indices[1])
      ? "👾"
      : segment,
  ).join("");
  const parsed = twitterText.parseTweet(weightedText, {
    ...twitterText.configs.defaults,
    maxWeightedTweetLength: limit,
  });
  return { remaining: limit - parsed.weightedLength, valid: parsed.valid };
}
