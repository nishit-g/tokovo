/**
 * Avatar Utilities
 * 
 * Generates fallback avatar URLs when local files don't exist.
 */

/**
 * Generate a colorful avatar URL from a name using UI Avatars service.
 * Used as fallback when local avatar files don't exist.
 */
export function generateAvatarUrl(name: string, size = 128): string {
    // Extract clean name (remove emojis and special chars)
    const cleanName = name.replace(/[^\w\s]/g, "").trim() || "User";

    // Generate a consistent color based on name
    const colors = [
        "E91E63", // Pink
        "9C27B0", // Purple
        "673AB7", // Deep Purple
        "3F51B5", // Indigo
        "2196F3", // Blue
        "00BCD4", // Cyan
        "009688", // Teal
        "4CAF50", // Green
        "FF9800", // Orange
        "FF5722", // Deep Orange
    ];

    // Hash the name to get consistent color
    const hash = cleanName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % colors.length;
    const bgColor = colors[colorIndex];

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=${bgColor}&color=fff&size=${size}&bold=true`;
}

/**
 * Check if a path is a local path that doesn't exist.
 * Local paths start with "/" but aren't full URLs.
 */
export function isLocalPath(path: string | undefined): boolean {
    if (!path) return false;
    return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("http");
}

/**
 * Resolve avatar URL with fallback.
 * If the URL is a local path (starts with /), generate a fallback instead
 * since local avatar files typically don't exist.
 */
export function resolveAvatarWithFallback(
    avatarUrl: string | undefined,
    contactName: string,
): string {
    // If no URL or it's a local path, generate a fallback
    if (!avatarUrl || isLocalPath(avatarUrl)) {
        return generateAvatarUrl(contactName);
    }

    // Otherwise use the provided URL (could be https:// or data:)
    return avatarUrl;
}
