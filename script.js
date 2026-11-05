document.body.classList.add("js");

const menuToggle = document.querySelector(".mobile-menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const navItems = [...document.querySelectorAll(".nav-item")];
const dropdownTriggers = [...document.querySelectorAll(".nav-trigger")];

function closeDropdowns(exceptItem) {
  navItems.forEach((item) => {
    if (item === exceptItem) return;
    item.classList.remove("is-open");
    const trigger = item.querySelector(".nav-trigger");
    const menu = item.querySelector(".dropdown-menu");
    trigger?.setAttribute("aria-expanded", "false");
    if (menu) menu.hidden = true;
  });
}

function closeMobileNav() {
  if (!menuToggle || !primaryNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  primaryNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  closeDropdowns();
}

menuToggle?.addEventListener("click", () => {
  const opening = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(opening));
  menuToggle.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
  primaryNav?.classList.toggle("is-open", opening);
  document.body.classList.toggle("menu-open", opening);
  if (!opening) closeDropdowns();
});

dropdownTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const item = trigger.closest(".nav-item");
    const menu = item?.querySelector(".dropdown-menu");
    const opening = trigger.getAttribute("aria-expanded") !== "true";
    closeDropdowns(item);
    item?.classList.toggle("is-open", opening);
    trigger.setAttribute("aria-expanded", String(opening));
    if (menu) menu.hidden = !opening;
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-item")) closeDropdowns();
});

document.querySelectorAll(".primary-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    closeDropdowns();
    if (window.matchMedia("(max-width: 1040px)").matches) closeMobileNav();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDropdowns();
    closeMobileNav();
  }
});

const searchDialog = document.querySelector("#search-dialog");
const searchInput = document.querySelector("#site-search");
const searchResults = document.querySelector("#search-results");
const searchTrigger = document.querySelector(".search-trigger");
const searchIndex = [...document.querySelectorAll("a[href]")]
  .filter((link) => {
    const href = link.getAttribute("href")?.trim();
    return href && !/^(?:#|mailto:|tel:|javascript:)/i.test(href) && link.textContent.trim();
  })
  .map((link) => ({ label: link.textContent.trim().replace(/\s+/g, " "), href: link.getAttribute("href"), external: /^https?:\/\//i.test(link.getAttribute("href")) }))
  .filter((item, index, list) => list.findIndex((candidate) => candidate.label === item.label && candidate.href === item.href) === index);

function renderSearchResults(term) {
  if (!searchResults) return;
  searchResults.replaceChildren();
  const query = term.trim().toLocaleLowerCase();
  if (!query) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = "Popular links: programs, library, student portal and admission.";
    searchResults.append(empty);
    return;
  }
  const matches = searchIndex.filter((item) => item.label.toLocaleLowerCase().includes(query)).slice(0, 7);
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = "No matching page found. Try a shorter search.";
    searchResults.append(empty);
    return;
  }
  matches.forEach((item) => {
    const result = document.createElement("a");
    result.className = "search-result";
    result.href = item.href;
    if (item.external) {
      result.target = "_blank";
      result.rel = "noreferrer";
    }
    const label = document.createElement("strong");
    label.textContent = item.label;
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    result.append(label, arrow);
    result.addEventListener("click", () => searchDialog?.close());
    searchResults.append(result);
  });
}

searchTrigger?.addEventListener("click", () => {
  if (!searchDialog?.showModal) return;
  searchDialog.showModal();
  renderSearchResults("");
  window.setTimeout(() => searchInput?.focus(), 50);
});
searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));
searchDialog?.addEventListener("click", (event) => {
  if (event.target === searchDialog) searchDialog.close();
});

const feedTabs = [...document.querySelectorAll(".feed-tab")];
const feedPanels = [...document.querySelectorAll(".feed-panel")];
function selectFeedTab(tab, moveFocus = false) {
  const panelId = tab.getAttribute("aria-controls");
  feedTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  feedPanels.forEach((panel) => {
    panel.hidden = panel.id !== panelId;
  });
  if (moveFocus) tab.focus();
}
feedTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectFeedTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % feedTabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + feedTabs.length) % feedTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = feedTabs.length - 1;
    selectFeedTab(feedTabs[next], true);
  });
});

const backToTop = document.querySelector(".back-to-top");
function updateBackToTop() {
  backToTop?.classList.toggle("is-visible", window.scrollY > 560);
}
window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();
backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const revealElements = [...document.querySelectorAll(".reveal")];
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}
