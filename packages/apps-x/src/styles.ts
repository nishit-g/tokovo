export const injectXStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("tokovo-x-styles")) return;

  const style = document.createElement("style");
  style.id = "tokovo-x-styles";
  style.innerHTML = `
    @keyframes xFadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes xGlow {
      0% { box-shadow: 0 0 0 rgba(29,155,240,0); }
      100% { box-shadow: 0 18px 40px rgba(29,155,240,0.35); }
    }
    .x-fade-up { animation: xFadeUp 0.35s ease-out; }
  `;
  document.head.appendChild(style);
};
