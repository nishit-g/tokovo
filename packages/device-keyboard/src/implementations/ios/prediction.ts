/**
 * iOS Keyboard Prediction Logic (Pure)
 * 
 * separated from View for testability and deterministic replay.
 */
export const IOSPrediction = {
    getSuggestions: (text: string, seed: number): string[] => {
        const common = ["the", "I", "a", "to", "and", "in", "it", "you", "of", "for"];
        const context = ["love", "peace", "truth", "soul", "mind", "life", "world"];

        // Simple hash of input to vary seed
        const inputHash = text.length;

        // Deterministic pseudo-random based on input length + seed
        const s = seed + inputHash;

        const i1 = (s * 3) % common.length;
        const i2 = (s * 7 + 1) % context.length;
        const i3 = (s * 2 + 5) % common.length;

        return [common[i1], context[i2], common[i3]];
    }
};
