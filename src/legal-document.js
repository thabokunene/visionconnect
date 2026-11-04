export function enhanceLegalDocument(
  root,
  {
    contentsSelector = ".pn-toc ol a",
    printSelector = "[data-popia-print], [data-legal-print]",
  } = {},
) {
  const print = root.querySelector(printSelector);
  if (print) {
    print.hidden = false;
    print.addEventListener("click", () => window.print());
  }
  bindContents(root, contentsSelector);
}

function bindContents(root, contentsSelector) {
  const links = [...root.querySelectorAll(contentsSelector)];
  const headings = links.map((link) => root.querySelector(link.hash));
  let scheduled = false;
  function select(index) {
    links.forEach((link, i) => {
      if (i === index) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  function update() {
    scheduled = false;
    // A position-based fallback makes tracking deterministic between widely
    // spaced headings, on resize, and when jumping past several sections.
    let index = 0;
    const scrollPadding =
      parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
      0;
    headings.forEach((heading, i) => {
      // Native fragment alignment adds root scroll-padding and target
      // scroll-margin. Include that offset (plus rounding tolerance), so
      // a correctly aligned target stays current even on a short viewport.
      const scrollMargin =
        parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
      const boundary = Math.max(
        125,
        innerHeight * 0.35,
        scrollPadding + scrollMargin + 2,
      );
      if (heading.getBoundingClientRect().top <= boundary) index = i;
    });
    select(index);
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  function fromHash() {
    const index = links.findIndex((link) => link.hash === location.hash);
    if (index >= 0) select(index);
    schedule();
  }
  links.forEach((link, index) => {
    link.addEventListener("click", () => {
      // Keep native URL/history and browser anchor scrolling. Move keyboard
      // focus to the target without introducing a second competing scroll.
      headings[index].focus({ preventScroll: true });
      select(index);
    });
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(schedule, {
      rootMargin: "-30% 0px -60% 0px",
      threshold: 0,
    });
    headings.forEach((heading) => observer.observe(heading));
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("hashchange", fromHash);
  window.addEventListener("load", schedule, { once: true });
  document.fonts?.ready.then(schedule);
  fromHash();
}
