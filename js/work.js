/* ===== SELALU MULAI DARI ATAS ===== */
history.scrollRestoration = "manual";
window.scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger);

/* ===== LENIS ===== */
const lenis = new Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: .9 });
lenis.on('scroll', ScrollTrigger.update);
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.stop(); /* jalan lagi setelah curtain kebuka */

/* ===== CURSOR ===== */
const cursorDot = document.querySelector(".cursor-dot");
const cursorCircle = document.querySelector(".cursor-circle");
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let circleX = mouseX, circleY = mouseY;

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX; mouseY = event.clientY;
  gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: .08, ease: "power2.out" });
});

gsap.ticker.add(() => {
  circleX += (mouseX - circleX) * .12;
  circleY += (mouseY - circleY) * .12;
  cursorCircle.style.transform =
    `translate(${circleX}px, ${circleY}px) translate(-50%, -50%)`;
});

document.querySelectorAll("a, button").forEach((element) => {
  element.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
  element.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
});

document.querySelectorAll(".work-item").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    document.body.classList.remove("cursor-hover");
    document.body.classList.add("cursor-view");
  });
  item.addEventListener("mouseleave", () => document.body.classList.remove("cursor-view"));
});

/* ===== INTRO — judul naik dari bawah (kyk DIGITAL EXPERIENCES) ===== */
const intro = gsap.timeline({
  paused: true,
  defaults: { ease: "power4.out" }
});
intro
  .to(".hero-line", { y: 0, duration: 1.25, stagger: .12 })
  .from(".hero-label, .hero-location", { opacity: 0, y: 25, duration: .7 }, "-=.7")
  .from(".hero-bottom", { opacity: 0, y: 30, duration: .8 }, "-=.45");

/* ===== ENTRANCE CURTAIN (pengganti preloader) ===== */
const pt = document.getElementById('pt');
const ptFlag = sessionStorage.getItem('pt');

function openCurtain(label) {
  if (label) {
    document.getElementById('ptText').textContent = label;
    gsap.set('.pt-label span', { y: '0%' });
  }

  gsap.timeline({
    onComplete: () => {
      pt.classList.remove('is-active');
      gsap.set(pt, { yPercent: -101 });  /* posisi akhir: kebuka penuh */
      lenis.start();
    }
  })
    .to({}, { duration: label ? .35 : .15 })                                    /* hold */
    .to('.pt-label span', { y: '-115%', duration: .45, ease: "power3.in" })      /* teks cabut ke atas */
    .to(pt, { yPercent: -101, duration: .9, ease: "power4.inOut" }, "-=.05")     /* hitam cabut ke atas */
    .add(() => intro.play(), "-=.55");                                           /* judul naik barengan */
}

if (ptFlag) {
  /* datang dari home via transition → curtain masih nutup + label "Work" */
  sessionStorage.removeItem('pt');
  pt.classList.add('is-active');
  openCurtain(ptFlag);
} else {
  /* direct load / refresh → curtain polos langsung kebuka */
  openCurtain(null);
}

/* ===== NAV COLLAPSE ===== */
const navLinks = document.querySelector(".nav-links");
const menuButton = document.getElementById("menuButton");

gsap.set(menuButton, { scale: 0, autoAlpha: 0 });
let navCollapsed = false;

lenis.on('scroll', ({ scroll }) => {
  const shouldCollapse = scroll > 120;
  if (shouldCollapse === navCollapsed || menuOpen) return;
  navCollapsed = shouldCollapse;

  gsap.to(navLinks, { autoAlpha: navCollapsed ? 0 : 1, y: navCollapsed ? -16 : 0, duration: .45, ease: "power3.out" });
  gsap.to(menuButton, {
    scale: navCollapsed ? 1 : 0, autoAlpha: navCollapsed ? 1 : 0,
    duration: .65, ease: navCollapsed ? "back.out(1.2)" : "power3.in"
  });
});

/* ===== MENU ===== */
const menuOverlay = document.getElementById("menuOverlay");

const menuTimeline = gsap.timeline({ paused: true, reversed: true });
menuTimeline
  .to(menuOverlay, { clipPath: "inset(0% 0% 0% 0%)", duration: .85, ease: "power4.inOut" })
  .to(".menu-link span", { y: 0, duration: .7, stagger: .08, ease: "power4.out" }, "-=.35");

let menuOpen = false;

function toggleMenu(force) {
  menuOpen = force !== undefined ? force : !menuOpen;
  if (menuOpen) {
    menuButton.classList.add("open");
    menuOverlay.style.pointerEvents = "auto";
    gsap.to(".nav-logo, .nav-links", { autoAlpha: 0, duration: .3, ease: "power2.out" });
    menuTimeline.play();
    lenis.stop();
  } else {
    menuButton.classList.remove("open");
    menuOverlay.style.pointerEvents = "none";
    menuTimeline.reverse();
    gsap.to(".nav-logo", { autoAlpha: 1, duration: .4, delay: .25 });
    if (!navCollapsed) gsap.to(".nav-links", { autoAlpha: 1, duration: .4, delay: .25 });
    lenis.start();
  }
}

menuButton.addEventListener("click", () => toggleMenu());

/* menu link → close dulu, baru navigasi */
document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href === "./work.html" || href.includes("work.html")) {
      e.preventDefault();   /* udah di work, skip */
      toggleMenu(false);
      return;
    }
    e.preventDefault();
    toggleMenu(false);
    setTimeout(() => { window.location.href = href; }, 550);
  });
});

/* ===== MAGNETIC ===== */
document.querySelectorAll(".magnetic, .magnetic-target").forEach((element) => {
  const strength = parseFloat(element.dataset.strength || ".25");

  element.addEventListener("mousemove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    gsap.to(element, { x: x * strength, y: y * strength, duration: .5, ease: "power3.out" });
  });

  element.addEventListener("mouseleave", () => {
    gsap.to(element, { x: 0, y: 0, duration: .8, ease: "elastic.out(1,.35)" });
  });
});

/* ===== INNER MAGNETIC ===== */
document.querySelectorAll(".f-circle, .menu-button, .st-circle, .more-btn").forEach((btn) => {
  const inner = btn.querySelector(".f-circle span, .menu-icon, .st-circle-label, .more-label");
  if (!inner) return;
  const strength = parseFloat(btn.dataset.innerStrength || ".35");

  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    gsap.to(inner, {
      x: (e.clientX - r.left - r.width / 2) * strength,
      y: (e.clientY - r.top - r.height / 2) * strength,
      duration: .55, ease: "power3.out"
    });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(inner, { x: 0, y: 0, duration: .9, ease: "elastic.out(1,.4)" });
  });
});

/* ===== PROJECT PREVIEW — center di ring + delay + skew ===== */
const preview = document.getElementById("projectPreview");
const previewImage = document.getElementById("previewImage");

gsap.set(preview, { xPercent: -50, yPercent: -50, scale: .75 });

let prevPX = 0;
const skewTo = gsap.quickTo(preview, "skewX", { duration: .45, ease: "power3.out" });
const rotTo  = gsap.quickTo(preview, "rotation", { duration: .45, ease: "power3.out" });

gsap.ticker.add(() => {
  const px = gsap.getProperty(preview, "x");
  const py = gsap.getProperty(preview, "y");
  const nx = px + (circleX - px) * .11;
  const ny = py + (circleY - py) * .11;
  const vx = nx - prevPX;
  prevPX = nx;
  gsap.set(preview, { x: nx, y: ny });
  skewTo(gsap.utils.clamp(-12, 12, vx * .55));
  rotTo(gsap.utils.clamp(-6, 6, vx * .18));
});

document.querySelectorAll(".work-item").forEach((project) => {
  project.addEventListener("mouseenter", () => {
    previewImage.src = project.dataset.image;
    gsap.set(preview, { x: circleX, y: circleY });
    prevPX = circleX;
    gsap.to(preview, { opacity: 1, scale: 1, duration: .45, ease: "power3.out" });
  });
  project.addEventListener("mouseleave", () => {
    gsap.to(preview, { opacity: 0, scale: .75, duration: .35, ease: "power2.in" });
    skewTo(0); rotTo(0);
  });
});

/* ===== WORK REVEAL ===== */
gsap.utils.toArray(".work-item").forEach((item, index) => {
  gsap.from(item, {
    opacity: 0, y: 50, duration: .9, delay: index * .04,
    scrollTrigger: { trigger: item, start: "top 90%" }
  });
});

/* ===== STATEMENT — word reveal ===== */
const stBig = document.getElementById("statementBig");
if (stBig) {
  stBig.innerHTML = stBig.textContent.trim().split(/\s+/)
    .map(w => `<span class="w">${w.replace(/&/g, "&amp;")}</span>`)
    .join(" ");

  gsap.to(".statement-big .w", {
    color: "#f5f4f0", stagger: .08, ease: "none",
    scrollTrigger: { trigger: ".statement-big", start: "top 80%", end: "bottom 45%", scrub: true }
  });

  gsap.from(".statement-small, .st-circle", {
    opacity: 0, y: 35, duration: .9, stagger: .12, ease: "power3.out",
    scrollTrigger: { trigger: ".statement-side", start: "top 85%" }
  });
}

/* ===== SECTION HEADING REVEAL ===== */
gsap.utils.toArray(".section-heading").forEach((element) => {
  gsap.from(element, {
    opacity: 0, y: 35, duration: .9,
    scrollTrigger: { trigger: element, start: "top 85%" }
  });
});

/* ===== HERO PARALLAX ===== */
gsap.to(".hero-title", {
  yPercent: -14, opacity: .35, ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

/* ===== FOOTER CURVE ===== */
gsap.fromTo("#footerInner", { yPercent: -14 }, {
  yPercent: 0, ease: "none",
  scrollTrigger: { trigger: ".footer-space", start: "top bottom", end: "bottom bottom", scrub: true }
});

gsap.from(".footer-heading", {
  y: 130, duration: 1.5, ease: "back.out(1.2)",
  scrollTrigger: { trigger: ".footer-space", start: "top 60%" }
});

gsap.from(".f-circle", {
  scale: .6, opacity: 0, duration: 1.1, ease: "back.out(1.4)",
  scrollTrigger: { trigger: ".footer-space", start: "top 55%" }
});

/* ===== BACK TO TOP ===== */
document.getElementById("toTop").addEventListener("click", () => {
  lenis.scrollTo(0, { duration: 1.5 });
});

/* ===== RESIZE ===== */
window.addEventListener("resize", () => ScrollTrigger.refresh());