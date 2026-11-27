const root = document.documentElement;
const introScreen = document.querySelector(".intro-screen");
const skipLoadingButton = document.getElementById("skip-loading");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeSwitch = document.getElementById("kishin-theme-switch");

if (themeSwitch) {
    themeSwitch.checked = root.dataset.theme === "night";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeSwitch.checked ? "#081F5C" : "#800000");
    themeSwitch.setAttribute("aria-label", themeSwitch.checked ? "Aktifkan Day Mode" : "Aktifkan Night Mode");
    themeSwitch.addEventListener("change", () => {
        const theme = themeSwitch.checked ? "night" : "day";
        root.dataset.theme = theme;
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeSwitch.checked ? "#081F5C" : "#800000");
        themeSwitch.setAttribute("aria-label", themeSwitch.checked ? "Aktifkan Day Mode" : "Aktifkan Night Mode");
        try {
            localStorage.setItem("kishin-theme", theme);
        } catch {}
    });
}

// The visible skip control also gives people a way out if a resource stalls.
root.classList.add("is-loading");
const loaderStartedAt = performance.now();
let pageLoaded = document.readyState === "complete";
let loaderReleased = false;
let loaderExited = false;
let loaderReleaseTimer = null;

const releaseLoader = (skip = false) => {
    if (loaderExited || (!pageLoaded && !skip) || (loaderReleased && !skip)) return;
    if (loaderReleaseTimer !== null) window.clearTimeout(loaderReleaseTimer);
    loaderReleased = true;

    const minimumDuration = skip ? 0 : 5000;
    const remaining = Math.max(0, minimumDuration - (performance.now() - loaderStartedAt));

    loaderReleaseTimer = window.setTimeout(() => {
        loaderReleaseTimer = null;
        loaderExited = true;
        root.classList.add("is-ready");

        if (!introScreen) {
            root.classList.remove("is-loading");
            return;
        }

        introScreen.classList.add("hide");
        introScreen.setAttribute("aria-hidden", "true");
        introScreen.inert = true;

        window.setTimeout(() => root.classList.remove("is-loading"), motionPreference.matches ? 0 : 320);
        window.setTimeout(() => introScreen.remove(), motionPreference.matches ? 20 : 760);
    }, remaining);
};

skipLoadingButton?.addEventListener("click", () => releaseLoader(true));

window.addEventListener("load", () => {
    pageLoaded = true;
    releaseLoader();
}, { once: true });

window.setTimeout(() => {
    pageLoaded = true;
    releaseLoader();
}, 2600);

if (pageLoaded) releaseLoader();

const projectEmbed = document.getElementById("project-embed");
const projectEmbedFrame = document.getElementById("project-embed-frame");
const projectEmbedTitle = document.getElementById("project-embed-title");
const projectEmbedFallback = document.getElementById("project-embed-fallback");
const projectEmbedClose = document.querySelector(".project-embed__close");
let lastProjectTrigger = null;

if (projectEmbed?.showModal && projectEmbedFrame) {
    document.querySelectorAll(".project-embed-trigger").forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            event.preventDefault();
            lastProjectTrigger = trigger;
            const project = trigger.closest(".project-card");
            const title = project?.querySelector("h3")?.textContent.trim() || "Project preview";
            const url = trigger.href;

            projectEmbedTitle.textContent = title;
            projectEmbedFrame.title = `Pratinjau ${title}`;
            projectEmbedFallback.href = url;
            projectEmbed.showModal();
            projectEmbedFrame.src = url;
        });
    });

    projectEmbedClose?.addEventListener("click", () => projectEmbed.close());
    projectEmbed.addEventListener("close", () => {
        projectEmbedFrame.src = "about:blank";
        lastProjectTrigger?.focus();
    });
}

const mainSections = document.querySelectorAll("main > section[id]");
const sectionLinks = document.querySelectorAll('.header .nav-link[href^="#"]');

if ("IntersectionObserver" in window && mainSections.length && sectionLinks.length) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                sectionLinks.forEach((link) => {
                    const isCurrent = link.hash === `#${entry.target.id}`;
                    link.classList.toggle("active", isCurrent);

                    if (isCurrent) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        },
        { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );

    mainSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('#navbarMenu a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
        const menu = document.getElementById("navbarMenu");
        const toggle = document.querySelector(".navbar-toggler");

        if (!menu?.classList.contains("show")) return;

        if (window.bootstrap?.Collapse) {
            window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
        } else {
            menu.classList.remove("show");
            toggle?.setAttribute("aria-expanded", "false");
        }
    });
});

if (window.Lenis && !motionPreference.matches) {
    window.siteLenis = new Lenis({
        anchors: true,
        lerp: 0.085,
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
        ".hero h1, .works-heading h2, .about-heading h2, .education-heading h2",
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

        gsap.fromTo(
            heading.querySelectorAll(".word-reveal"),
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
