import React from "react";
import { Img, staticFile } from "remotion";
import { resolveStaticAssetSrc } from "@tokovo/core";

export type DeterministicImageProps = React.ComponentProps<typeof Img>;

function resolveRenderImageSrc(src: string): string {
  return resolveStaticAssetSrc(src, (assetPath) => staticFile(assetPath.replace(/^\//, "")));
}

/**
 * Render-safe image primitive.
 *
 * Remotion delays a frame until Img has loaded. Local public assets are routed
 * through staticFile while remote and pre-signed URLs remain untouched.
 */
export const DeterministicImage: React.FC<DeterministicImageProps> = ({ src, ...props }) => (
  <Img {...props} src={resolveRenderImageSrc(src)} />
);
