export function injectIMessageStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("tokovo-imessage-styles")) return;

  const style = document.createElement("style");
  style.id = "tokovo-imessage-styles";
  style.innerHTML = `
    @keyframes imessage-slam {
      0% { transform: scale(0.8); }
      80% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes imessage-loud {
      0% { transform: scale(0.9); }
      50% { transform: scale(1.12); }
      100% { transform: scale(1); }
    }

    @keyframes imessage-gentle {
      0% { opacity: 0; transform: scale(0.98); }
      100% { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}
