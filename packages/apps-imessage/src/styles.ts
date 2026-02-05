export function injectIMessageStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("tokovo-imessage-styles")) return;

  const style = document.createElement("style");
  style.id = "tokovo-imessage-styles";
  style.innerHTML = `
    /* Bubble effects */
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

    @keyframes imessage-typing-pulse {
      0%, 100% { opacity: 0.4; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    /* Screen effects */
    @keyframes imessage-balloon-rise {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(-120vh) rotate(10deg); opacity: 0.8; }
    }

    @keyframes imessage-confetti-fall {
      0% { 
        transform: translateY(0) rotate(0deg); 
        opacity: 1; 
      }
      100% { 
        transform: translateY(110vh) rotate(720deg); 
        opacity: 0; 
      }
    }

    @keyframes imessage-laser-scan {
      0% { transform: translateX(-100%); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateX(100%); opacity: 0; }
    }

    @keyframes imessage-firework-burst {
      0% { 
        transform: scale(0); 
        opacity: 1; 
      }
      50% { 
        transform: scale(3); 
        opacity: 1; 
      }
      100% { 
        transform: scale(5); 
        opacity: 0; 
      }
    }

    @keyframes imessage-heart-float {
      0% { 
        transform: translateY(0) scale(0.5); 
        opacity: 0; 
      }
      10% { 
        opacity: 1; 
        transform: translateY(-10vh) scale(1); 
      }
      100% { 
        transform: translateY(-110vh) scale(1.2); 
        opacity: 0; 
      }
    }

    @keyframes imessage-echo-ripple {
      0% { 
        transform: scale(1); 
        opacity: 1; 
      }
      100% { 
        transform: scale(8); 
        opacity: 0; 
      }
    }

    @keyframes imessage-spotlight-move {
      0% { background-position: 50% 100%; }
      50% { background-position: 50% 30%; }
      100% { background-position: 50% 50%; }
    }

    @keyframes imessage-poof-particle {
      0% { 
        transform: rotate(inherit) translateX(0) scale(1); 
        opacity: 1; 
      }
      100% { 
        transform: rotate(inherit) translateX(30px) scale(0); 
        opacity: 0; 
      }
    }

    @keyframes imessage-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }

    /* Unsend animation */
    @keyframes imessage-unsend-shrink {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0.1); opacity: 0; filter: blur(10px); }
    }
  `;
  document.head.appendChild(style);
}


