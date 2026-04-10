export const injectXStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("tokovo-x-styles")) return;

  const style = document.createElement("style");
  style.id = "tokovo-x-styles";
  style.innerHTML = `
    @keyframes xFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes xPulse {
      0% { opacity: .35; }
      50% { opacity: 1; }
      100% { opacity: .35; }
    }
    .x-fade-up { animation: xFadeUp 0.35s ease-out; }
    .x-typing-dot { animation: xPulse 1.2s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
};
