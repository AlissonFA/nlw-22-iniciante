/* ══════════════════════════════════════
   ANIMATIONS.JS — GSAP + ScrollTrigger
   ══════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

// ── Initial states para os elementos do hero ──────────────────────────────
gsap.set(
  ["#hero-badge", "#hero-title", "#hero-sub", "#hero-cta", "#hero-stats"],
  { y: 30 },
);

// ── Hero entrance sequence ────────────────────────────────────────────────
const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });

heroTL
  .to("#hero-badge", { opacity: 1, y: 0, duration: 0.7, delay: 0.2 })
  .to("#hero-title", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
  .to("#hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
  .to("#hero-cta", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
  .to("#hero-stats", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");

// ── Features section ──────────────────────────────────────────────────────
gsap.from("#features-header", {
  scrollTrigger: { trigger: "#funcionalidades", start: "top 80%" },
  opacity: 0,
  y: 40,
  duration: 0.8,
  ease: "power3.out",
});

gsap.from(".bento-item", {
  scrollTrigger: { trigger: "#bento-grid", start: "top 75%" },
  opacity: 0,
  y: 50,
  duration: 0.7,
  ease: "power3.out",
  stagger: 0.12,
});

// ── How it works ──────────────────────────────────────────────────────────
gsap.from("#how-header", {
  scrollTrigger: { trigger: "#como-funciona", start: "top 80%" },
  opacity: 0,
  y: 40,
  duration: 0.8,
  ease: "power3.out",
});

gsap.from(".step-item", {
  scrollTrigger: { trigger: "#steps-grid", start: "top 75%" },
  opacity: 0,
  y: 50,
  duration: 0.7,
  ease: "back.out(1.4)",
  stagger: 0.2,
});

// ── App section ───────────────────────────────────────────────────────────
gsap.from("#app-header", {
  scrollTrigger: { trigger: "#experimente", start: "top 80%" },
  opacity: 0,
  y: 40,
  duration: 0.8,
  ease: "power3.out",
});

gsap.from("#experimente > div > .relative", {
  scrollTrigger: { trigger: "#experimente", start: "top 70%" },
  opacity: 0,
  y: 60,
  scale: 0.97,
  duration: 0.9,
  ease: "power3.out",
  delay: 0.2,
});

// ── Waveform bars — animação contínua ─────────────────────────────────────
document
  .querySelectorAll(".bento-item:first-child .flex > div")
  .forEach((bar, i) => {
    gsap.to(bar, {
      height: `${Math.random() * 70 + 30}%`,
      duration: 0.8 + Math.random() * 0.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.07,
    });
  });
