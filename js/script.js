const enterButton = document.getElementById("enter-button");
const introScreen = document.querySelector(".intro-screen");

enterButton?.addEventListener("click", function () {
    introScreen.classList.add("hide");
    window.history.replaceState(null, "", "#home");

    if (window.siteLenis) {
        window.siteLenis.scrollTo("#home");
    } else {
        document.querySelector("#home")?.scrollIntoView();
    }
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (window.Lenis) {
    window.siteLenis = new Lenis({
        anchors: true,
        lerp: motionPreference.matches ? 1 : 0.09,
    });

    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        window.siteLenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => window.siteLenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    } else {
        const raf = (time) => {
            window.siteLenis.raf(time);
            requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);
    }
}

if (window.gsap && window.ScrollTrigger && !motionPreference.matches) {
    gsap.registerPlugin(ScrollTrigger);

    const headings = document.querySelectorAll(
        ".intro-content h1, .hero h1, .works-heading h2, .about-heading h2, .education-heading h2",
    );

    headings.forEach((heading) => {
        const originalText = heading.textContent.trim().replace(/\s+/g, " ");
        heading.setAttribute("aria-label", originalText);

        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        const textNodes = [];

        while (walker.nextNode()) textNodes.push(walker.currentNode);

        textNodes.forEach((textNode) => {
            const parts = textNode.textContent.split(/(\s+)/);
            const fragment = document.createDocumentFragment();

            parts.forEach((part) => {
                if (!part) return;

                if (/^\s+$/.test(part)) {
                    fragment.append(document.createTextNode(part));
                    return;
                }

                const mask = document.createElement("span");
                mask.className = "word-mask";
                mask.setAttribute("aria-hidden", "true");

                const word = document.createElement("span");
                word.className = "word-reveal";
                word.textContent = part;
                mask.append(word);
                fragment.append(mask);
            });

            textNode.replaceWith(fragment);
        });

        const words = heading.querySelectorAll(".word-reveal");

        gsap.fromTo(
            words,
            { yPercent: 115, opacity: 0 },
            {
                yPercent: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.09,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: heading,
                    start: "top 82%",
                    once: true,
                },
            },
        );
    });

    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}
