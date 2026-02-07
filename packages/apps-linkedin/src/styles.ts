export const injectLinkedInStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("tokovo-linkedin-styles")) return;

  const style = document.createElement("style");
  style.id = "tokovo-linkedin-styles";
  style.innerHTML = `
    @keyframes liFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes liShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .li-fade-up { animation: liFadeUp 0.32s ease-out; }
  `;
  document.head.appendChild(style);
};

