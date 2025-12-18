/**
 * iOS Prediction Logic
 * 
 * Deterministic suggestion generation for replay.
 */

export const IOSPrediction = {
    /**
     * Get suggestions based on input text.
     * MUST be deterministic (same input = same output).
     */
    getSuggestions: (text: string, seed: number): string[] => {
        const common = ["the", "I", "a", "to", "and", "in", "it", "you", "of", "for"];
        const context = ["love", "peace", "truth", "soul", "mind", "life", "world"];

        // Simple hash based on input
        const inputHash = text.length;
        const s = seed + inputHash;

        // Deterministic selection
        const i1 = (s * 3) % common.length;
        const i2 = (s * 7 + 1) % context.length;
        const i3 = (s * 2 + 5) % common.length;

        return [common[i1], context[i2], common[i3]];
    },

    /**
     * Get suggestions with last word context.
     */
    getContextualSuggestions: (text: string, seed: number): string[] => {
        const lastWord = text.trim().split(" ").pop() || "";

        // Prefix-based suggestions
        if (lastWord.length > 0) {
            const prefixSuggestions: Record<string, string[]> = {
                "h": ["hello", "hi", "hey"],
                "t": ["the", "this", "that"],
                "a": ["and", "are", "at"],
                "i": ["I", "is", "in"],
                "w": ["what", "when", "with"],
            };

            const prefix = lastWord[0].toLowerCase();
            if (prefixSuggestions[prefix]) {
                const suggestions = prefixSuggestions[prefix];
                const i = (seed + lastWord.length) % suggestions.length;
                return [
                    suggestions[i],
                    suggestions[(i + 1) % suggestions.length],
                    suggestions[(i + 2) % suggestions.length],
                ];
            }
        }

        return IOSPrediction.getSuggestions(text, seed);
    },
};

export default IOSPrediction;
