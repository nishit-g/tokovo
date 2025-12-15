```javascript
import React from 'react';

export interface AppSurfaceProps {
    /** The logical width the app was designed for (e.g. 393 for iPhone 14/15/16 Pro) */
    designWidth?: number;
    /** The actual physical width of the target device/container */
    targetWidth?: number;
    /** The actual physical height of the target device/container */
    targetHeight?: number;
    children: React.ReactNode;
    style?: React.CSSProperties;
    /** Optional background color for the container */
    backgroundColor?: string;
}

/**
 * AppSurface
 * 
 * A container that automatically calculates and applies a scale transform
 * to map a "Logical Design Resolution" to a "Physical Target Resolution".
 * 
 * This allows apps to be built using standard 1x CSS units (e.g. 16px font),
 * while rendering perfectly crisp on high-resolution devices (e.g. 1290px wide).
 */
export const AppSurface: React.FC<AppSurfaceProps> = ({
    designWidth = 393,
    targetWidth,
    targetHeight = 852, // Default logical height for 393 width (iPhone 14/15/16 Pro)
    children,
    style,
    backgroundColor = '#000'
}) => {
    // Avoid division by zero
    const finalDesignWidth = designWidth || 393;
    const finalTargetWidth = targetWidth || finalDesignWidth;
    
    // Calculate scale factor: Mapping physical pixels to logical points
    const scale = finalTargetWidth / finalDesignWidth;

    return (
        <div style={{
            width: finalTargetWidth,
            height: targetHeight,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor,
            ...style
        }}>
           <div style={{
               width: finalDesignWidth,
               // We need the logical height to fill the physical height
               height: targetHeight / scale,
               minHeight: targetHeight / scale,
               transform: `scale(${ scale })`,
               transformOrigin: 'top left',
               position: 'absolute',
               top: 0,
               left: 0,
               display: 'flex',
               flexDirection: 'column'
           }}>
               {children}
           </div>
        </div>
    );
};
```
