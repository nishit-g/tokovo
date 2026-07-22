import type { MaterialRecipe } from "./contract.js";

export interface MaterialPaintStyle {
  background: string;
  backdropFilter?: string;
  WebkitBackdropFilter?: string;
  border?: string;
  boxShadow?: string;
}

/** The only serializer used by system-surface painters. */
export function materialToPaintStyle(
  recipe: MaterialRecipe,
  scale = 1,
): MaterialPaintStyle {
  const filters: string[] = [];
  if (recipe.backdropBlur > 0) {
    filters.push(`blur(${recipe.backdropBlur * scale}px)`);
  }
  if (recipe.backdropSaturation !== 1) {
    filters.push(`saturate(${recipe.backdropSaturation})`);
  }
  if (recipe.backdropBrightness !== 1) {
    filters.push(`brightness(${recipe.backdropBrightness})`);
  }
  const backdropFilter = filters.length > 0 ? filters.join(" ") : undefined;
  return {
    background: recipe.fill,
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
    border: recipe.stroke
      ? `${Math.max(0.5, recipe.stroke.width * scale)}px solid ${recipe.stroke.color}`
      : undefined,
    boxShadow:
      recipe.shadows.length > 0
        ? recipe.shadows
            .map(
              (shadow) =>
                `${shadow.offsetX * scale}px ${shadow.offsetY * scale}px ${shadow.blur * scale}px ${shadow.spread * scale}px ${shadow.color}`,
            )
            .join(", ")
        : undefined,
  };
}
