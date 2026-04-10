export function injectInstagramStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("tokovo-instagram-styles")) return;

  const style = document.createElement("style");
  style.id = "tokovo-instagram-styles";
  style.innerHTML = `
    @keyframes igFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes igPulse {
      0% { opacity: .35; transform: scale(.95); }
      50% { opacity: 1; transform: scale(1); }
      100% { opacity: .35; transform: scale(.95); }
    }
    .ig-fade-up { animation: igFadeUp .35s ease-out; }
    .ig-typing-dot { animation: igPulse 1.2s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}
