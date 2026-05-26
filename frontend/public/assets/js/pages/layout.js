(function () {
  "use strict";

  const NAV_LINKS = [
    { href: "quiz.html", label: "AI/Real Quiz" },
    { href: "documentary.html", label: "Documentary" },
    { href: "about.html", label: "About Us" },
    { href: "cases.html", label: "Cases" },
  ];

  const SOCIAL_LINKS = [
    {
      href: "https://www.instagram.com/aitu_creative?igsh=b2h3NmNzb2JhbHNi",
      label: "Instagram",
      icon: "fa-instagram",
    },
    {
      href: "https://t.me/aicommunityaitu",
      label: "Telegram",
      icon: "fa-telegram",
    },
  ];

  const DESCRIPTION = [
    "<b>AI Cinema Lab</b> is a creative research space exploring how",
    "<b>artificial intelligence</b> transforms cinema - from digital actors",
    "and deepfakes to emotional storytelling and perception. It is a bridge",
    "between human creativity and machine vision, revealing the thin line",
    "between reality and simulation in modern film.",
  ].join(" ");

  window.AIFORGE_API_URL = window.AIFORGE_API_URL || getDefaultApiBaseUrl();

  window.AIForgeLayout = {
    render: renderLayout,
    mountChatbot,
  };

  if (document.body) {
    renderLayout();
  } else {
    document.addEventListener("DOMContentLoaded", renderLayout, { once: true });
  }

  function renderLayout() {
    if (document.body.dataset.layout === "bare") {
      ensureChatbotRoot();
      loadChatbotAssets();
      return;
    }

    removeExistingLayout();
    document.body.insertAdjacentHTML(
      "afterbegin",
      [
        renderPreloader(),
        renderMouseCursor(),
        renderBackToTop(),
        renderOffcanvas(),
        renderHeader(),
      ].join(""),
    );
    document.body.insertAdjacentHTML("beforeend", renderFooter());
    ensureChatbotRoot();
    loadChatbotAssets();
  }

  function removeExistingLayout() {
    document
      .querySelectorAll(
        [
          "#preloader",
          ".mouse-cursor.cursor-outer",
          ".mouse-cursor.cursor-inner",
          "#back-top",
          ".fix-area",
          ".offcanvas__overlay",
          "#header-sticky",
          "footer.footer-section",
        ].join(", "),
      )
      .forEach((element) => element.remove());
  }

  function renderPreloader() {
    const letters = "AI Cinema Lab"
      .split("")
      .map(
        (letter) =>
          `<span data-text-preloader="${letter}" class="letters-loading">${letter === " " ? "&nbsp;" : letter}</span>`,
      )
      .join("");

    return `
      <div id="preloader" class="preloader" data-layout-part="preloader">
        <div class="animation-preloader">
          <div class="spinner"></div>
          <div class="txt-loading">${letters}</div>
          <p class="text-center">Loading</p>
        </div>
        <div class="loader">
          <div class="row">
            <div class="col-3 loader-section section-left"><div class="bg"></div></div>
            <div class="col-3 loader-section section-left"><div class="bg"></div></div>
            <div class="col-3 loader-section section-right"><div class="bg"></div></div>
            <div class="col-3 loader-section section-right"><div class="bg"></div></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMouseCursor() {
    return `
      <div class="mouse-cursor cursor-outer" data-layout-part="cursor"></div>
      <div class="mouse-cursor cursor-inner" data-layout-part="cursor"></div>
    `;
  }

  function renderBackToTop() {
    return `
      <button id="back-top" class="back-to-top" data-layout-part="back-to-top">
        <i class="fa-regular fa-arrow-up"></i>
      </button>
    `;
  }

  function renderOffcanvas() {
    return `
      <div class="fix-area" data-layout-part="offcanvas">
        <div class="offcanvas__info">
          <div class="offcanvas__wrapper">
            <div class="offcanvas__content">
              <div class="offcanvas__top mb-5 d-flex justify-content-between align-items-center">
                <div class="offcanvas__logo">
                  <a href="index.html">
                    <img src="assets/img/logo/white-logo.svg" alt="AI Cinema Lab logo">
                  </a>
                </div>
                <div class="offcanvas__close">
                  <button type="button" aria-label="Close menu">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <p class="text d-none d-xl-block">${DESCRIPTION}</p>
              <div class="mobile-menu fix mb-3"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="offcanvas__overlay" data-layout-part="offcanvas-overlay"></div>
    `;
  }

  function renderHeader() {
    return `
      <header id="header-sticky" class="header-1" data-layout-part="header">
        <div class="container-fluid">
          <div class="mega-menu-wrapper">
            <div class="header-main">
              <div class="header-left">
                <div class="logo">
                  <a href="index.html" class="header-logo">
                    <img src="assets/img/logo/white-logo.svg" alt="AI Cinema Lab logo">
                  </a>
                </div>
                <div class="mean__menu-wrapper">
                  <div class="main-menu">
                    <nav id="mobile-menu">
                      <ul>${renderNavLinks()}</ul>
                    </nav>
                  </div>
                </div>
              </div>
              <div class="header-right d-flex justify-content-end align-items-center">
                <a href="register.html" class="join-text header-join-now">Join now</a>
                <div class="header__hamburger d-xl-block my-auto">
                  <div class="sidebar__toggle">
                    <i class="fas fa-bars"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  function renderNavLinks() {
    return NAV_LINKS.map(
      (link) => `
        <li class="has-dropdown">
          <a href="${link.href}"${isCurrentPage(link.href) ? ' class="active"' : ""}>
            ${link.label}
          </a>
        </li>
      `,
    ).join("");
  }

  function renderFooter() {
    return `
      <footer class="footer-section footer-bg" data-layout-part="footer">
        <div class="footer-bottom">
          <div class="container">
            <div class="footer-bottom-wrapper text-center">
              <div class="logo-img wow fadeInUp mb-3" data-wow-delay=".3s">
                <a href="index.html">
                  <img src="assets/img/logo/white-logo.svg" alt="AI Cinema Lab logo" class="footer-logo">
                </a>
              </div>
              <p class="wow fadeInUp footer-credit" data-wow-delay=".5s">
                Created by <b>Ainissa Sarsenbayeva</b> and <b>Zhaniya Serikbayeva</b> &mdash;
                students of <b>Astana IT University</b>, <br>School of Creative Industries.
              </p>
              <div class="footer-social-links wow fadeInUp" data-wow-delay=".7s">
                ${renderSocialLinks()}
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function renderSocialLinks() {
    return SOCIAL_LINKS.map(
      (link) => `
        <a href="${link.href}" aria-label="${link.label}">
          <i class="fa-brands ${link.icon}"></i>
        </a>
      `,
    ).join("");
  }

  function ensureChatbotRoot() {
    let root = document.getElementById("aiforge-chatbot-root");

    if (!root) {
      document.body.insertAdjacentHTML(
        "beforeend",
        '<div id="aiforge-chatbot-root" class="aiforge-chatbot-root" data-layout-part="chatbot"></div>',
      );
      root = document.getElementById("aiforge-chatbot-root");
    }

    return root;
  }

  function mountChatbot(renderCallback) {
    const root = ensureChatbotRoot();

    if (typeof renderCallback === "function") {
      renderCallback(root);
    }

    return root;
  }

  function loadChatbotAssets() {
    if (!document.querySelector('link[data-aiforge-chatbot="style"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "assets/css/pages/chatbot.css";
      link.dataset.aiforgeChatbot = "style";
      document.head.appendChild(link);
    }

    if (!document.querySelector('script[data-aiforge-chatbot="script"]')) {
      const script = document.createElement("script");
      script.src = "assets/js/pages/chatbot.js";
      script.defer = true;
      script.dataset.aiforgeChatbot = "script";
      document.body.appendChild(script);
    }
  }

  function isCurrentPage(href) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    return currentPage === href;
  }

  function getDefaultApiBaseUrl() {
    const isLocalhost = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

    return isLocalhost ? "http://localhost:3000/api" : "/api";
  }
})();
