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

/* ===== INTRO — judul naik dari bawah ===== */
const intro = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
intro
  .to(".hero-line", { y: 0, duration: 1.25, stagger: .12 })
  .from(".hero-label, .hero-location", { opacity: 0, y: 25, duration: .7 }, "-=.7")
  .from(".hero-bottom", { opacity: 0, y: 30, duration: .8 }, "-=.45");

/* ===== CURTAIN ===== */
const CURTAIN = document.getElementById('pt');

function openCurtain() {
  document.getElementById('preloader')?.remove();

  gsap.timeline({
    onComplete: () => {
      CURTAIN.classList.remove('is-active');
      gsap.set(CURTAIN, { yPercent: -135, autoAlpha: 0 });
      lenis.start();
    }
  })
    .to({}, { duration: .15 })
    .to(CURTAIN, { yPercent: -135, duration: 1, ease: "power3.inOut" })
    .add(() => intro.play(), "-=.55");
}

sessionStorage.removeItem('pt');
if (!sessionStorage.getItem('seen')) sessionStorage.setItem('seen', '1');
openCurtain();

/* ===== NAV COLLAPSE ===== */
const navLinks = document.querySelector(".nav-links");
const menuButton = document.getElementById("menuButton");

gsap.set(menuButton, { scale: 0, autoAlpha: 0 });
let navCollapsed = false;

lenis.on('scroll', ({ scroll }) => {
  const shouldCollapse = scroll > 120;
  if (shouldCollapse === navCollapsed || menuOpen) return;
  navCollapsed = shouldCollapse;

  gsap.to(navLinks, {
    autoAlpha: navCollapsed ? 0 : 1,
    y: navCollapsed ? -16 : 0,
    duration: .45, ease: "power3.out"
  });
  gsap.to(menuButton, {
    scale: navCollapsed ? 1 : 0,
    autoAlpha: navCollapsed ? 1 : 0,
    duration: .65,
    ease: navCollapsed ? "back.out(1.2)" : "power3.in"
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

/* ===== NAVIGASI + CURTAIN MELENGKUNG ===== */
function pageLabel(href) {
  const f = href.toLowerCase();
  if (f.includes('home'))    return 'Home';
  if (f.includes('work'))    return 'Work';
  if (f.includes('about'))   return 'About';
  if (f.includes('contact')) return 'Contact';
  return '';
}

document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  /* prefetch pas hover */
  link.addEventListener('mouseenter', () => {
    if (document.head.querySelector(`link[href="${link.getAttribute('href')}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = link.getAttribute('href');
    document.head.appendChild(l);
  }, { once: true });

  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    const label = pageLabel(href);

    /* klik link halaman yang lagi dibuka → close menu (kalau dari menu), stay */
    if (label.toLowerCase() === document.body.dataset.page) {
      if (link.classList.contains('menu-link')) toggleMenu(false);
      return;
    }

    sessionStorage.setItem('pt', label);
    document.getElementById('ptText').innerHTML = '<i class="pt-dot">•</i> ' + label;
    CURTAIN.classList.add('is-active');
    gsap.set(CURTAIN, { yPercent: 135, autoAlpha: 1 });

    const nav = () => { window.location.href = href; };

    if (link.classList.contains('menu-link') && menuOpen) {
      toggleMenu(false);
      gsap.timeline()
        .to(CURTAIN, { yPercent: 0, duration: .9, ease: "power3.inOut" }, .35)
        .to('.pt-label span', { y: '0%', duration: .5, ease: "power4.out" }, "-=.2")
        .add(nav);
    } else {
      gsap.timeline()
        .to(CURTAIN, { yPercent: 0, duration: .9, ease: "power3.inOut" })
        .to('.pt-label span', { y: '0%', duration: .5, ease: "power4.out" }, "-=.25")
        .to({}, { duration: .2 })
        .add(nav);
    }
  });
});

/* ===== ANCHORS (#) — gak lompat ke atas, menu close tetep di posisi ===== */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    if (link.classList.contains("menu-link")) toggleMenu(false);
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

/* ===== SERVICES ACCORDION ===== */
document.querySelectorAll(".svc-head").forEach((head) => {
  head.addEventListener("click", () => {
    const svc = head.parentElement;
    const wasOpen = svc.classList.contains("open");

    /* tutup semua dulu (satu terbuka pada satu waktu) */
    document.querySelectorAll(".svc.open").forEach((s) => s.classList.remove("open"));

    if (!wasOpen) svc.classList.add("open");
    setTimeout(() => ScrollTrigger.refresh(), 600);
  });
});

/* ===== INNER MAGNETIC ===== */
document.querySelectorAll(".f-circle, .menu-button").forEach((btn) => {
  const inner = btn.querySelector(".f-circle span, .menu-icon");
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

/* ===== REVEALS ===== */
gsap.utils.toArray(".section-heading").forEach((element) => {
  gsap.from(element, {
    opacity: 0, y: 35, duration: .9,
    scrollTrigger: { trigger: element, start: "top 85%" }
  });
});

/* intro: paragraf gede — kata nyala satu-satu (scrub) */
const introBig = document.getElementById("introBig");
introBig.innerHTML = introBig.textContent.trim().split(/\s+/)
  .map(w => `<span class="w">${w.replace(/&/g, "&amp;")}</span>`)
  .join(" ");

gsap.to(".intro-big .w", {
  color: "#f5f4f0", stagger: .06, ease: "none",
  scrollTrigger: { trigger: ".intro-big", start: "top 80%", end: "bottom 45%", scrub: true }
});

gsap.from(".intro-small", {
  opacity: 0, y: 30, duration: .9,
  scrollTrigger: { trigger: ".intro-small", start: "top 88%" }
});

/* foto parallax halus */
gsap.fromTo("#introImg", { yPercent: -8 }, {
  yPercent: 8, ease: "none",
  scrollTrigger: { trigger: ".intro-media", start: "top bottom", end: "bottom top", scrub: true }
});

/* counters */
document.querySelectorAll("[data-count]").forEach((el) => {
  const end = +el.dataset.count;
  gsap.fromTo(el, { innerText: 0 }, {
    innerText: end, duration: 1.6, ease: "power2.out", snap: { innerText: 1 },
    scrollTrigger: { trigger: el, start: "top 88%" }
  });
});

/* journey reveal */
gsap.utils.toArray(".journey-item").forEach((item, index) => {
  gsap.from(item, {
    opacity: 0, y: 50, duration: .9, delay: index * .04,
    scrollTrigger: { trigger: item, start: "top 90%" }
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