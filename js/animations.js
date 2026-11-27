const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Reveal content once as it enters the viewport.
const revealTargets = document.querySelectorAll(
  ".project-card, .education-card, .works-heading, .about-content, .education-heading",
);

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    if (element.matches(".project-card, .education-card")) {
      element.style.transitionDelay = `${(index % 3) * 80}ms`;
    }
    revealObserver.observe(element);
  });
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}

// Move each image layer at its own restrained speed while the page scrolls.
const parallaxTargets = document.querySelectorAll("[data-parallax]");
let parallaxFrame = 0;

const updateParallax = () => {
  parallaxFrame = 0;
  if (reduceMotion || !parallaxTargets.length) return;

  const viewportMiddle = window.innerHeight / 2;

  parallaxTargets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom < -80 || rect.top > window.innerHeight + 80) return;

    const speed = Number.parseFloat(element.dataset.parallax) || 0;
    const distanceFromCenter = viewportMiddle - (rect.top + rect.height / 2);
    const offset = Math.max(-52, Math.min(52, distanceFromCenter * speed));
    element.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
  });
};

const requestParallaxUpdate = () => {
  if (parallaxFrame || reduceMotion) return;
  parallaxFrame = window.requestAnimationFrame(updateParallax);
};

if (!reduceMotion && parallaxTargets.length) {
  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate, { passive: true });
  requestParallaxUpdate();
}

// Add a small 3D tilt to project cards on desktop pointers only.
if (!reduceMotion && finePointer) {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--tilt-x", `${((0.5 - y) * 3).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${((x - 0.5) * 3).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

// A compact cursor ring follows the pointer on devices that have a mouse.
if (!reduceMotion && finePointer) {
  const cursor = document.createElement("div");
  cursor.className = "cursor-follower";
  cursor.setAttribute("aria-hidden", "true");

  const ring = document.createElement("span");
  ring.className = "cursor-ring";
  const label = document.createElement("span");
  label.className = "cursor-label";
  label.textContent = "VIEW";
  ring.append(label);

  const dot = document.createElement("span");
  dot.className = "cursor-dot";
  cursor.append(ring, dot);
  document.body.append(cursor);
  document.body.classList.add("has-custom-cursor");

  let pointerX = -100;
  let pointerY = -100;
  let ringX = -100;
  let ringY = -100;
  let cursorFrame = 0;

  const moveRing = () => {
    ringX += (pointerX - ringX) * 0.22;
    ringY += (pointerY - ringY) * 0.22;
    cursor.style.setProperty("--ring-x", `${ringX.toFixed(1)}px`);
    cursor.style.setProperty("--ring-y", `${ringY.toFixed(1)}px`);

    if (Math.abs(pointerX - ringX) > 0.3 || Math.abs(pointerY - ringY) > 0.3) {
      cursorFrame = window.requestAnimationFrame(moveRing);
    } else {
      cursorFrame = 0;
    }
  };

  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.style.setProperty("--cursor-x", `${pointerX}px`);
    cursor.style.setProperty("--cursor-y", `${pointerY}px`);

    if (!cursorFrame) cursorFrame = window.requestAnimationFrame(moveRing);
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("a, button, [role='button'], [data-cursor]");
    if (!target) return;
    cursor.dataset.hover = "true";
    label.textContent = target.closest(".project-image") ? "VIEW" : "GO";
  });

  document.addEventListener("pointerout", (event) => {
    if (event.relatedTarget?.closest("a, button, [role='button'], [data-cursor]")) return;
    cursor.dataset.hover = "false";
  });

  window.addEventListener("blur", () => {
    cursor.dataset.hover = "false";
  });
}
