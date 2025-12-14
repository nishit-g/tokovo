/**
 * Compiler Transforms
 *
 * @module @tokovo/compiler/transforms
 */

export {
    downgradeUnsupportedOp,
    downgradeContentKind,
    applyDowngrades,
    type DowngradeAction,
    type DowngradedOp,
} from "./downgrade";
