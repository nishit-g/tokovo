import { registerWhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { registerDevicesPlugin } from "@tokovo/devices";
import { registerNotificationPlugin } from "@tokovo/device-notifications";
import { registerKeyboardPlugin } from "@tokovo/device-keyboard";
import { registerCameraPlugin } from "@tokovo/device-camera";
// DISABLED: Timeline module incomplete - @tokovo/react/timeline not yet implemented
// import { EpisodeEditor } from "@tokovo/react/timeline";

registerDevicesPlugin();
registerWhatsAppPlugin();
registerNotificationPlugin();
registerKeyboardPlugin();
registerCameraPlugin();

export function TimelineDemo() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="relative h-full flex flex-col">
        <header className="px-8 py-6 backdrop-blur-xl bg-slate-950/30 border-b border-purple-500/10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 animate-pulse" />
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Timeline Editor [DISABLED]
            </h1>
            <div className="ml-auto px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
              <span className="text-sm font-mono text-purple-300">
                Camera Showcase
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex items-center justify-center">
          <div className="text-center space-y-4 max-w-lg px-8">
            <div className="text-6xl">🚧</div>
            <h2 className="text-2xl font-bold text-purple-300">
              Timeline Editor Not Available
            </h2>
            <p className="text-slate-400">
              The{" "}
              <code className="px-2 py-1 bg-slate-800/50 rounded text-purple-400">
                @tokovo/react/timeline
              </code>{" "}
              module is incomplete. This page will be functional once the
              timeline components are implemented.
            </p>
            <div className="pt-4">
              <code className="text-xs text-slate-500 bg-slate-900/50 px-3 py-2 rounded block">
                Episode IR Ready
              </code>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-shimmer {
          animation: shimmer 8s infinite;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(139, 92, 246, 0.1) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
        }
      `}</style>
    </div>
  );
}
