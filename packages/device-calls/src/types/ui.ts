/**
 * Call UI Types
 * 
 * Props for call UI components.
 */

import type { CallState } from "./index";

// =============================================================================
// STRATEGY PROPS
// =============================================================================

export interface CallUIStrategyProps {
    /** Current call state */
    call: CallState;
    /** Answer callback */
    onAnswer?: () => void;
    /** Decline callback */
    onDecline?: () => void;
    /** End call callback */
    onEnd?: () => void;
    /** Theme */
    theme?: "light" | "dark";
    /** Current time in frames */
    t?: number;
}

export type CallUIStrategyComponent = React.FC<CallUIStrategyProps>;

// =============================================================================
// BANNER PROPS
// =============================================================================

export interface IncomingCallBannerProps {
    call: CallState;
    onAnswer?: () => void;
    onDecline?: () => void;
    variant?: string;
    deviceWidth?: number;
}

// =============================================================================
// DYNAMIC ISLAND PROPS
// =============================================================================

export interface DynamicIslandCallProps {
    call: CallState;
    mode: "minimal" | "compact" | "expanded";
    t?: number;
}
