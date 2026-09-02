"use strict";
/*
  Shiraume Lodge / in-place wow-factor enhancement
  The existing document remains the source of truth. This module only adds layered art,
  a scroll-linked obi gesture, and compositor-safe reveal/progress behavior around it.
*/
const ART = {
    shrine: "assets/art/shiraume-shrine-etching_e4225976.png",
    washi: "assets/art/shiraume-washi-cedar-veil_aab3e61e.png",
    gallery: "assets/art/shiraume-gallery-shoji_7fb6b0c5.jpg",
};
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const LEGACY_ASSET_ROOT = document.baseURI;
const GALLERY_ITEMS = [
    { room: "Koke", jp: "苔", src: "assets/img/room-koke.jpg", note: "Garden room · 庭にひらく客室" },
    { room: "Koke", jp: "苔", src: "assets/img/s2-room-koke.jpg", note: "Stone, cedar, morning light" },
    { room: "Shizuka", jp: "静", src: "assets/img/room-shizuka.jpg", note: "A quiet room · 静かな居場所" },
    { room: "Yamabiko", jp: "山彦", src: "assets/img/room-yamabiko.jpg", note: "Room with a mountain echo" },
    { room: "Hinoki", jp: "檜", src: "assets/img/room-hinoki.jpg", note: "Hinoki and tatami · 檜と畳" },
    { room: "Higashiyama", jp: "東山", src: "assets/img/room-higashiyama.jpg", note: "Upper-house light · 山のひかり" },
];
let galleryView = null;
function addGalleryRoute() {
    if (galleryView || document.getElementById("view-gallery"))
        return;
    const route = document.createElement("div");
    route.id = "view-gallery";
    route.className = "view";
    route.innerHTML = `
    <main class="shiraume-gallery-page">
      <div class="gallery-route__grain" aria-hidden="true"></div>
      <header class="gallery-route__head">
        <button class="gallery-route__back" type="button" data-gallery-back>← BACK TO SHIRAUME · 白梅へ</button>
        <span class="gallery-route__code">HIKOSAN / 740 / 1917</span>
      </header>
      <section class="gallery-route__intro">
        <span class="gallery-route__eyebrow">景 / THE VIEWS</span>
        <h1>Gallery <i>ギャラリー</i></h1>
        <p>The rooms, held in cedar, paper, and mountain light.</p>
        <span class="gallery-route__rule"></span>
      </section>
      <section class="gallery-route__grid" aria-label="Shiraume Lodge room gallery">
        ${GALLERY_ITEMS.map((item, index) => `
          <figure class="gallery-route__item gallery-route__item--${index + 1}">
            <div class="gallery-route__image-wrap"><img src="${item.src}" alt="${item.room} ${item.jp} — ${item.note}" loading="lazy" /></div>
            <figcaption><span>${String(index + 1).padStart(2, "0")} · ${item.room}</span><strong>${item.jp}</strong><small>${item.note}</small></figcaption>
          </figure>
        `).join("")}
      </section>
      <footer class="gallery-route__foot">
        <span>白梅 · A ROOM IN THE MOUNTAIN</span>
        <button type="button" data-gallery-back>RETURN TO THE LODGE ↓</button>
      </footer>
    </main>
  `;
    document.body.appendChild(route);
    galleryView = route;
    route.querySelectorAll("[data-gallery-back]").forEach((button) => button.addEventListener("click", () => closeGalleryPage()));
}
function dismissSplashForGalleryRoute() {
    const splashApi = window.ShiraumeSplash;
    if (splashApi?.finish)
        splashApi.finish();
    const splash = document.getElementById("shiraume-splash");
    if (!splash)
        return;
    splash.classList.add("sp2-gone");
    splash.setAttribute("aria-hidden", "true");
    window.setTimeout(() => { splash.style.display = "none"; }, 680);
}
function openGalleryPage(updateHistory = true) {
    if (!galleryView)
        addGalleryRoute();
    if (window.location.pathname === "/gallery" || updateHistory === false)
        dismissSplashForGalleryRoute();
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    galleryView?.classList.add("active");
    document.body.classList.add("gallery-route-open");
    document.title = "Gallery · ギャラリー · Shiraume Lodge";
    if (updateHistory && window.location.pathname !== "/gallery")
        window.history.pushState({ shiraumeGallery: true }, "", "/gallery");
    window.scrollTo({ top: 0, behavior: "auto" });
}
function closeGalleryPage(updateHistory = true) {
    document.body.classList.remove("gallery-route-open");
    galleryView?.classList.remove("active");
    document.getElementById("view-home")?.classList.add("active");
    document.title = "Shiraume Lodge — A Ryokan Concept, Hikosan, Fukuoka";
    if (updateHistory && window.location.pathname === "/gallery")
        window.history.pushState({}, "", "/");
    window.scrollTo({ top: 0, behavior: "auto" });
}
function normalizeLegacyAssets(root = document) {
    const images = root.querySelectorAll?.("img[src]") ?? [];
    images.forEach((image) => {
        const raw = image.getAttribute("src") || "";
        if (!raw || raw.startsWith("http") || raw.startsWith("/") || raw.startsWith("data:"))
            return;
        if (!raw.includes("assets/"))
            return;
        image.src = new URL(raw.replace(/^\.\//, ""), LEGACY_ASSET_ROOT).href;
    });
    const styled = root.querySelectorAll?.("[style]") ?? [];
    styled.forEach((element) => {
        const raw = element.style.backgroundImage;
        if (!raw || !raw.includes("assets/") || /https?:\/\//.test(raw))
            return;
        const assetMatch = raw.match(/assets\/[^"')]+/);
        if (assetMatch)
            element.style.backgroundImage = `url("${new URL(assetMatch[0], LEGACY_ASSET_ROOT).href}")`;
    });
}
function watchLegacyAssets() {
    normalizeLegacyAssets();
    if (!("MutationObserver" in window))
        return;
    const observer = new MutationObserver((records) => {
        records.forEach((record) => {
            record.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE)
                    return;
                normalizeLegacyAssets(node);
            });
            if (record.type === "attributes")
                normalizeLegacyAssets(record.target.parentElement || document);
        });
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "style"] });
}
let hikosanHistoryPanel = null;
let hikosanHistoryTrigger = null;
function addHikosanHistoryPanel() {
    if (hikosanHistoryPanel || document.getElementById("hikosan-history-panel"))
        return;
    const panel = document.createElement("div");
    panel.id = "hikosan-history-panel";
    panel.className = "hikosan-history-panel";
    panel.hidden = true;
    panel.innerHTML = `
    <div class="hikosan-history-panel__veil" data-history-close></div>
    <section class="hikosan-history-panel__sheet" role="dialog" aria-modal="true" aria-labelledby="hikosan-history-title" tabindex="-1">
      <button class="hikosan-history-panel__close" type="button" data-history-close aria-label="Close Hikosan history">× <span>閉じる</span></button>
      <div class="hikosan-history-panel__seal" aria-hidden="true"><span>英</span><i>彦山</i></div>
      <div class="hikosan-history-panel__content">
        <span class="hikosan-history-panel__eyebrow">THE MOUNTAIN REMEMBERS · 山の記憶</span>
        <h2 id="hikosan-history-title">A mountain that<br><i>remembers.</i></h2>
        <p class="hikosan-history-panel__lead">Hikosan is not scenery placed behind the lodge. It is a living pilgrimage landscape—its peaks, water, shrine paths, and memory forming the quiet architecture of the stay.</p>
        <div class="hikosan-history-panel__timeline" aria-label="Hikosan history timeline">
          <article><strong>740</strong><span>The shrine tradition is said to have been established here, anchoring worship at the mountain for more than thirteen centuries.</span></article>
          <article><strong>12—16C</strong><span>The Hiko-san cult spread through medieval Kyushu. Shugendo practitioners, Buddhist monks, and Shinto ritual performers shared the mountain.</span></article>
          <article><strong>1616</strong><span>Hōheiden was rebuilt by Hosokawa Tadaoki. A stone-paved route led from the bronze gate toward the sanctuary, with yamabushi lodges along the way.</span></article>
          <article><strong>1729</strong><span>Retired Emperor Reigen permitted the character 英—“outstanding”—to be added to 彦山. The mountain became 英彦山: Hiko-san of excellence.</span></article>
        </div>
        <div class="hikosan-history-panel__closing">
          <span class="hikosan-history-panel__closing-mark">巡</span>
          <p>Today, the path still asks for the same thing it always has: attention. Walk slowly enough, and the mountain answers.</p>
        </div>
        <a class="hikosan-history-panel__source" href="https://hikosanjingu.or.jp/history/" target="_blank" rel="noreferrer">Read the historical outline · 英彦山神宮 →</a>
      </div>
    </section>
  `;
    document.body.appendChild(panel);
    hikosanHistoryPanel = panel;
    const sheet = panel.querySelector(".hikosan-history-panel__sheet");
    panel.querySelectorAll("[data-history-close]").forEach((close) => close.addEventListener("click", () => closeHikosanHistory()));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && hikosanHistoryPanel && !hikosanHistoryPanel.hidden)
            closeHikosanHistory();
        if (event.key === "Tab" && hikosanHistoryPanel && !hikosanHistoryPanel.hidden && sheet) {
            const focusable = Array.from(sheet.querySelectorAll("button, a, [tabindex]:not([tabindex='-1'])"));
            if (!focusable.length)
                return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
}
function openHikosanHistory(trigger) {
    addHikosanHistoryPanel();
    if (!hikosanHistoryPanel)
        return;
    hikosanHistoryTrigger = trigger || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    hikosanHistoryPanel.hidden = false;
    document.body.classList.add("hikosan-history-open");
    requestAnimationFrame(() => {
        hikosanHistoryPanel?.classList.add("is-open");
        hikosanHistoryPanel?.querySelector(".hikosan-history-panel__close")?.focus();
    });
}
function closeHikosanHistory() {
    if (!hikosanHistoryPanel)
        return;
    hikosanHistoryPanel.classList.remove("is-open");
    document.body.classList.remove("hikosan-history-open");
    window.setTimeout(() => {
        if (!hikosanHistoryPanel)
            return;
        hikosanHistoryPanel.hidden = true;
        hikosanHistoryTrigger?.focus();
        hikosanHistoryTrigger = null;
    }, 360);
}
function addWhyHikosanArt() {
    const section = document.querySelector(".why-section");
    if (!section || section.querySelector(".why-hikosan-art"))
        return;
    const layer = document.createElement("div");
    layer.className = "why-hikosan-art";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `
    <img src="${ART.shrine}" alt="" />
    <span class="why-hikosan-art__caption">HIKOSAN JINGU · 英彦山神宮</span>
    <button class="why-hikosan-art__seal" type="button" aria-label="Open the history of Hikosan">発見</button>
  `;
    section.prepend(layer);
    section.id = "why-hikosan";
    section.classList.add("has-why-hikosan-art");
    const cipher = document.createElement("button");
    cipher.type = "button";
    cipher.className = "shiraume-cipher";
    cipher.setAttribute("aria-label", "Reveal the Shiraume pilgrimage message");
    cipher.setAttribute("aria-expanded", "false");
    cipher.innerHTML = `
    <span class="shiraume-cipher__ring shiraume-cipher__ring--outer"></span>
    <span class="shiraume-cipher__ring shiraume-cipher__ring--inner"></span>
    <span class="shiraume-cipher__glyph">巡</span>
    <span class="shiraume-cipher__code">740 · SANDO · 1917 · 白梅</span>
    <span class="shiraume-cipher__message"><b>歩けば、山は応える。</b><i>Walk far enough and the mountain answers.</i></span>
  `;
    let pinned = false;
    const setCipherState = (active) => {
        cipher.classList.toggle("is-awake", active);
        cipher.setAttribute("aria-expanded", String(active));
    };
    cipher.addEventListener("pointerenter", () => setCipherState(true));
    cipher.addEventListener("pointerleave", () => {
        if (!pinned && document.activeElement !== cipher)
            setCipherState(false);
    });
    cipher.addEventListener("focus", () => setCipherState(true));
    cipher.addEventListener("blur", () => {
        pinned = false;
        setCipherState(false);
    });
    cipher.addEventListener("click", () => {
        pinned = !pinned;
        setCipherState(pinned || document.activeElement === cipher);
        openHikosanHistory(cipher);
    });
    section.appendChild(cipher);
    section.querySelector(".why-hikosan-art__seal")?.addEventListener("click", (event) => openHikosanHistory(event.currentTarget));
}
const INTERACTIVE_ENGRAVINGS = [
    { selector: ".story-section", mark: "宿", code: "1917 / HIKOSAN", message: "木と水に守られた百年の宿。" },
    { selector: ".why-section", mark: "巡", code: "740 · SANDO · 白梅", message: "歩けば、山は応える。" },
    { selector: ".rooms-section", mark: "客室", code: "01—05 / SHIRAUME", message: "五つの客室、ひとつの山の時間。" },
    { selector: ".area-section", mark: "谷", code: "MT. HIKO / 1200M", message: "参道の先に、谷の静けさ。" },
    { selector: ".experience-section", mark: "道", code: "SANDO / MA", message: "急がないことも、旅の一部。" },
    { selector: ".journal-section", mark: "記", code: "01 · 07 · 19", message: "記録は、宿が生きる音。" },
    { selector: ".inquiry-section", mark: "白梅", code: "PRIVATE / STAY", message: "余白の中へ、お迎えします。" },
    { selector: ".site-footer", mark: "山", code: "HIKOSAN / RETURN", message: "また山へ、お帰りください。" },
];
function addInteractiveEngravings() {
    INTERACTIVE_ENGRAVINGS.forEach(({ selector, mark, code, message }) => {
        const section = document.querySelector(selector);
        if (!section || section.querySelector(".shiraume-engraving"))
            return;
        const engraving = document.createElement("button");
        engraving.type = "button";
        engraving.className = "shiraume-engraving";
        engraving.setAttribute("aria-expanded", "false");
        engraving.setAttribute("aria-label", `Reveal the hidden Shiraume message: ${mark}`);
        engraving.innerHTML = `
      <span class="shiraume-engraving__rings" aria-hidden="true"></span>
      <span class="shiraume-engraving__mark">${mark}</span>
      <span class="shiraume-engraving__code">${code}</span>
      <span class="shiraume-engraving__message">${message}</span>
    `;
        let pinned = false;
        const setAwake = (active) => {
            engraving.classList.toggle("is-awake", active);
            engraving.setAttribute("aria-expanded", String(active));
        };
        engraving.addEventListener("pointerenter", () => setAwake(true));
        engraving.addEventListener("pointerleave", () => {
            if (!pinned && document.activeElement !== engraving)
                setAwake(false);
        });
        engraving.addEventListener("focus", () => setAwake(true));
        engraving.addEventListener("blur", () => {
            pinned = false;
            setAwake(false);
        });
        engraving.addEventListener("click", () => {
            pinned = !pinned;
            setAwake(pinned || document.activeElement === engraving);
            if (selector === ".why-section")
                openHikosanHistory(engraving);
        });
        section.appendChild(engraving);
    });
}
function addSplashTorii() {
    const splash = document.querySelector("#shiraume-splash");
    const world = splash?.querySelector(".sp2-world");
    if (!splash || !world || world.querySelector(".shiraume-splash-torii"))
        return;
    const torii = document.createElement("div");
    torii.className = "shiraume-splash-torii";
    torii.setAttribute("aria-hidden", "true");
    torii.innerHTML = `
    <span class="shiraume-splash-torii__moon"></span>
    <span class="shiraume-splash-torii__halo"></span>
    <span class="shiraume-splash-torii__lintel"></span>
    <span class="shiraume-splash-torii__lintel shiraume-splash-torii__lintel--lower"></span>
    <span class="shiraume-splash-torii__post shiraume-splash-torii__post--left"></span>
    <span class="shiraume-splash-torii__post shiraume-splash-torii__post--right"></span>
    <span class="shiraume-splash-torii__depth shiraume-splash-torii__depth--left"></span>
    <span class="shiraume-splash-torii__depth shiraume-splash-torii__depth--right"></span>
    <span class="shiraume-splash-torii__mist shiraume-splash-torii__mist--one"></span>
    <span class="shiraume-splash-torii__mist shiraume-splash-torii__mist--two"></span>
    <span class="shiraume-splash-torii__path"></span>
  `;
    world.appendChild(torii);
    splash.classList.add("has-splash-torii");
}
function addObiGesture() {
    const interlude = document.querySelector("#interlude");
    if (!interlude || interlude.querySelector(".obi-gesture"))
        return null;
    const gesture = document.createElement("div");
    gesture.className = "obi-gesture";
    gesture.setAttribute("aria-hidden", "true");
    gesture.innerHTML = `
    <span class="obi-gesture__shadow"></span>
    <span class="obi-gesture__tail obi-gesture__tail--left"></span>
    <span class="obi-gesture__tail obi-gesture__tail--right"></span>
    <span class="obi-gesture__band obi-gesture__band--back"></span>
    <span class="obi-gesture__band obi-gesture__band--front"></span>
    <span class="obi-gesture__knot"><i></i><b></b></span>
    <span class="obi-gesture__seal">結</span>
  `;
    interlude.prepend(gesture);
    interlude.classList.add("has-obi-gesture");
    return interlude;
}
function addGalleryAtmosphere() {
    const seasonalGallery = document.querySelector("#seasons");
    if (seasonalGallery && !seasonalGallery.querySelector(".gallery-atmosphere")) {
        const atmosphere = document.createElement("div");
        atmosphere.className = "gallery-atmosphere";
        atmosphere.setAttribute("aria-hidden", "true");
        atmosphere.innerHTML = `<img src="${ART.washi}" alt="" /><span class="gallery-atmosphere__seal">景</span>`;
        seasonalGallery.prepend(atmosphere);
        seasonalGallery.classList.add("gallery-art-directed");
    }
    const roomGallery = document.querySelector("#view-room .rdb");
    if (roomGallery && !roomGallery.querySelector(".room-gallery-atmosphere")) {
        const atmosphere = document.createElement("div");
        atmosphere.className = "room-gallery-atmosphere";
        atmosphere.setAttribute("aria-hidden", "true");
        atmosphere.innerHTML = `<img src="${ART.gallery}" alt="" />`;
        roomGallery.prepend(atmosphere);
        roomGallery.classList.add("room-gallery-art-directed");
    }
    const roomMain = document.querySelector("#view-room .rdb-main");
    const roomLabel = roomMain && Array.from(roomMain.querySelectorAll(".rdb-feats-lbl")).find((item) => item.textContent?.includes("Gallery"));
    if (roomMain && roomLabel && !roomMain.querySelector(".gallery-ceremony")) {
        const ceremony = document.createElement("div");
        ceremony.className = "gallery-ceremony";
        ceremony.innerHTML = `
      <span class="gallery-ceremony__eyebrow">白梅 · A ROOM IN THE MOUNTAIN</span>
      <strong>Gallery <i>ギャラリー</i></strong>
      <span class="gallery-ceremony__line"></span>
      <span class="gallery-ceremony__code">HIKOSAN / 740 / 1917</span>
    `;
        const launch = document.createElement("button");
        launch.type = "button";
        launch.className = "gallery-ceremony__launch";
        launch.textContent = "Open Gallery · ギャラリー →";
        launch.addEventListener("click", () => openGalleryPage());
        ceremony.appendChild(launch);
        roomLabel.parentNode?.insertBefore(ceremony, roomLabel);
    }
}
function setupReveal(reducedMotion) {
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("revealed"));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.14, rootMargin: "0px 0px -10% 0px" });
    revealItems.forEach((item) => observer.observe(item));
}
function setupMotion(interlude, reducedMotion) {
    const progress = document.createElement("div");
    progress.className = "route-progress";
    progress.innerHTML = '<span class="route-progress__label">THE SANDO</span><span class="route-progress__line"><i></i></span><span class="route-progress__number">00</span>';
    document.body.appendChild(progress);
    let frame = 0;
    const update = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const pageProgress = clamp(window.scrollY / maxScroll);
            document.documentElement.style.setProperty("--shiraume-progress", String(pageProgress));
            const hero = document.querySelector("#view-home .hero");
            const heroShift = hero ? clamp(window.scrollY / Math.max(1, hero.offsetHeight * 0.9)) : 0;
            document.documentElement.style.setProperty("--shiraume-hero-shift", `${(-heroShift * 24).toFixed(2)}px`);
            const motifSections = Array.from(document.querySelectorAll("#view-home .story-section, #view-home .why-section, #view-home .rooms-section, #view-home .area-section, #view-home .experience-section, #view-home .journal-section, #view-home .inquiry-section, #view-home .site-footer"));
            motifSections.forEach((section, index) => {
                const bounds = section.getBoundingClientRect();
                const centered = Math.min(1, Math.max(-1, (window.innerHeight * 0.5 - (bounds.top + bounds.height * 0.5)) / Math.max(1, window.innerHeight)));
                const shift = reducedMotion ? 0 : centered * (7 + (index % 3) * 3);
                section.style.setProperty("--motif-shift", `${shift.toFixed(2)}px`);
                section.querySelector(".shiraume-engraving")?.style.setProperty("--engraving-shift", `${(-shift * 0.75).toFixed(2)}px`);
            });
            if (interlude && !reducedMotion) {
                const bounds = interlude.getBoundingClientRect();
                const travel = clamp((window.innerHeight - bounds.top) / (window.innerHeight + bounds.height));
                const tieProgress = clamp((travel - 0.16) / 0.68);
                document.documentElement.style.setProperty("--obi-progress", String(tieProgress));
                document.documentElement.style.setProperty("--obi-lift", `${(tieProgress * -16).toFixed(2)}px`);
            }
            const number = progress.querySelector(".route-progress__number");
            if (number)
                number.textContent = String(Math.round(pageProgress * 100)).padStart(2, "0");
        });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
}
function startEnhancement() {
    if (document.documentElement.dataset.shiraumeEnhanced === "true")
        return;
    document.documentElement.dataset.shiraumeEnhanced = "true";
    document.documentElement.classList.add("shiraume-enhanced");
    document.body.classList.add("shiraume-wow-layer", "shiraume-enhanced");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    watchLegacyAssets();
    addSplashTorii();
    addWhyHikosanArt();
    addHikosanHistoryPanel();
    addInteractiveEngravings();
    const interlude = addObiGesture();
    addGalleryRoute();
    addGalleryAtmosphere();
    if (window.location.pathname === "/gallery")
        openGalleryPage(false);
    window.addEventListener("popstate", () => {
        if (window.location.pathname === "/gallery")
            openGalleryPage(false);
        else if (document.body.classList.contains("gallery-route-open"))
            closeGalleryPage(false);
    });
    setupReveal(reducedMotion);
    setupMotion(interlude, reducedMotion);
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startEnhancement, { once: true });
}
else {
    startEnhancement();
}

// The seven Moonlit Cedar artworks are not in assets/art/ yet. Until they are,
// hide the art plates rather than let the browser draw a broken-image icon.
document.addEventListener("error", (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && target.src.includes("/assets/art/")) target.style.display = "none";
}, true);
