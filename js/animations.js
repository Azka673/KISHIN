import { animate, hover, inView } from "https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const cards = document.querySelectorAll(".project-card, .education-card");

if (!reduceMotion.matches && cards.length) {
  cards.forEach((card, index) => {
    card.style.opacity = "0";

    inView(
      card,
      (element) => {
        animate(
          element,
          { opacity: 1, y: [24, 0] },
          {
            duration: 0.65,
            delay: (index % 3) * 0.1,
            ease: [0.22, 1, 0.36, 1],
          },
        );
      },
      { amount: 0.18 },
    );
  });

  hover(cards, (element) => {
    animate(
      element,
      { y: -7, scale: 1.015 },
      { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
    );

    return () => {
      animate(element, { y: 0, scale: 1 }, { duration: 0.3, ease: "easeOut" });
    };
  });
}
