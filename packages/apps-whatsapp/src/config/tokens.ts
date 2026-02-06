/**
 * WhatsApp design tokens (colors/typography/spacing).
 *
 * Canonical import path for app UI + layout to share constants.
 *
 * Note: WhatsApp currently has a legacy `src/components/theme.ts` token file.
 * This module re-exports those tokens as the v1 canonical surface.
 */

export {
  whatsappColors as waColors,
  typography as waTypography,
  spacing as waSpacing,
  whatsappIOSTheme as waTheme,
} from "../components/theme.js";

