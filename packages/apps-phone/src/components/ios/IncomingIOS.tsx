/**
 * iOS Incoming Call - Main Router
 * 
 * Decides between Contact Poster (iOS 17+) and Classic (iOS 16) style.
 */

import React from "react";
import { CallState } from "@tokovo/core";
import { ContactPoster } from "./ContactPoster";
import { ClassicIncoming } from "./ClassicIncoming";

interface IncomingIOSProps {
    call: CallState;
    profile?: any;
    currentFrame?: number;
}

/**
 * IncomingIOS - Routes to the appropriate iOS incoming call UI
 * 
 * - iOS 17+: Contact Poster (full-screen image)
 * - iOS 16 and below: Classic blur with slide to answer
 */
export const IncomingIOS: React.FC<IncomingIOSProps> = ({ call, profile, currentFrame = 0 }) => {
    // Check if caller has a poster image (iOS 17+ style)
    const hasPoster = !!call.callerMetadata?.posterImage;

    console.log('[IncomingIOS] hasPoster:', hasPoster, 'routing to:', hasPoster ? 'ContactPoster' : 'ClassicIncoming');

    if (hasPoster) {
        return <ContactPoster call={call} profile={profile} currentFrame={currentFrame} />;
    }

    return <ClassicIncoming call={call} currentFrame={currentFrame} />;
};
