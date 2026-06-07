import { useEffect, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLegacyCopy, type LegacyCopy } from './legacy-copy';

type LegacyHtmlPageProps = {
  html: string;
  page: 'home' | 'about' | 'cases';
  title: string;
};

const routeByLegacyHref: Record<string, string> = {
  'index.html': '/',
  'quiz.html': '/quiz',
  'documentary.html': '/documentary',
  'about.html': '/about',
  'cases.html': '/cases',
  'register.html': '/register',
  'login.html': '/login',
  'forgot-password.html': '/forgot-password',
  'reset-password.html': '/reset-password',
  'profile.html': '/profile',
};

const layoutSelectors = [
  '#preloader',
  '.mouse-cursor.cursor-outer',
  '.mouse-cursor.cursor-inner',
  '#back-top',
  '.fix-area',
  '.offcanvas__overlay',
  '#header-sticky',
  'footer.footer-section',
  'script',
];

export function LegacyHtmlPage({ html, page, title }: LegacyHtmlPageProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language;
  const content = useMemo(() => extractLegacyBody(html, page, t, currentLanguage), [html, page, t, currentLanguage]);

  useEffect(() => {
    document.title = title;
    window.setTimeout(initWow, 60);
  }, [title, content]);

  function handleClick(event: MouseEvent<HTMLElement>) {
    const link = (event.target as HTMLElement).closest('a');

    if (!link) {
      return;
    }

    const rawHref = link.getAttribute('href');

    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return;
    }

    if (/^https?:\/\//i.test(rawHref)) {
      return;
    }

    const [hrefWithoutHash] = rawHref.split('#');
    const [legacyPage, query = ''] = hrefWithoutHash.split('?');
    const route = routeByLegacyHref[legacyPage];

    if (!route) {
      return;
    }

    event.preventDefault();
    navigate(query ? `${route}?${query}` : route);
  }

  return <div className="legacy-page" onClick={handleClick} dangerouslySetInnerHTML={{ __html: content }} />;
}

function extractLegacyBody(html: string, page: LegacyHtmlPageProps['page'], t: (key: string) => string, language: string) {
  const documentSnapshot = new DOMParser().parseFromString(html, 'text/html');
  const legacyCopy = getLegacyCopy(language);

  documentSnapshot.querySelectorAll(layoutSelectors.join(', ')).forEach((element) => element.remove());
  normalizeHomeHero(documentSnapshot, page, t);
  applyLegacyTranslations(documentSnapshot, page, t, legacyCopy);
  documentSnapshot.querySelectorAll('[src^="assets/"]').forEach((element) => {
    const source = element.getAttribute('src');

    if (source) {
      element.setAttribute('src', `/${source}`);
    }
  });
  documentSnapshot.querySelectorAll('[href^="assets/"]').forEach((element) => {
    const href = element.getAttribute('href');

    if (href) {
      element.setAttribute('href', `/${href}`);
    }
  });
  documentSnapshot.querySelectorAll('[style*="assets/"]').forEach((element) => {
    const style = element.getAttribute('style');

    if (style) {
      element.setAttribute('style', style.replaceAll("url('assets/", "url('/assets/").replaceAll('url("assets/', 'url("/assets/'));
    }
  });

  return documentSnapshot.body.innerHTML;
}

function normalizeHomeHero(documentSnapshot: Document, page: LegacyHtmlPageProps['page'], t: (key: string) => string) {
  if (page !== 'home') {
    return;
  }

  const heroContent = documentSnapshot.querySelector('.hero-secton.hero-1 .hero-content');
  const heroText = heroContent?.querySelector('p');
  const title = documentSnapshot.querySelector('.hero-secton.hero-1 .hero-content h1');

  if (!heroContent || !title) {
    return;
  }

  if (!heroContent.querySelector('.home-aitu-logo')) {
    const aituLogo = documentSnapshot.createElement('img');
    aituLogo.setAttribute('src', 'assets/img/logo/aitu-logo-white-2-300x154.png');
    aituLogo.setAttribute('alt', 'Astana IT University');
    aituLogo.className = 'home-aitu-logo';
    heroContent.insertBefore(aituLogo, heroText ?? title);
  }

  title.className = 'react-home-title';
  const titleSub = t('legacy.home.titleSub');

  title.innerHTML = [
    `<span class="react-home-title-main">${formatHomeTitleMain(t('legacy.home.titleMain'))}</span>`,
    titleSub ? `<span class="react-home-title-sub">${escapeHtml(titleSub)}</span>` : '',
  ].join('');
}

function formatHomeTitleMain(value: string) {
  return escapeHtml(value).replace(/^AI(\s+)/, `<span class="highlight">AI</span>$1`);
}

function formatHomeHeroText(value: string) {
  const [lead, ...restParts] = value.split(':');

  if (!lead || restParts.length === 0) {
    return escapeHtml(value);
  }

  return [
    `<span class="home-hero-eyebrow-line">${escapeHtml(lead.trim())}:</span>`,
    `<span class="home-hero-eyebrow-line home-hero-eyebrow-line-rest">${escapeHtml(restParts.join(':').trim())}</span>`,
  ].join('');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function applyLegacyTranslations(
  documentSnapshot: Document,
  page: LegacyHtmlPageProps['page'],
  t: (key: string) => string,
  legacyCopy: LegacyCopy,
) {
  const setText = (selector: string, key: string) => {
    const element = documentSnapshot.querySelector(selector);

    if (element) {
      element.textContent = t(key);
    }
  };
  const setHtml = (selector: string, key: string) => {
    const element = documentSnapshot.querySelector(selector);

    if (element) {
      element.innerHTML = t(key);
    }
  };
  const setEyebrow = (selector: string, key: string) => {
    const element = documentSnapshot.querySelector(selector);

    if (element) {
      element.innerHTML = `<img src="assets/img/star.png" alt="img"> ${t(key)}`;
    }
  };
  const setDirectText = (selector: string, value: string) => {
    const element = documentSnapshot.querySelector(selector);

    if (element) {
      element.textContent = value;
    }
  };
  const setDirectHtml = (selector: string, value: string) => {
    const element = documentSnapshot.querySelector(selector);

    if (element) {
      element.innerHTML = value;
    }
  };
  const setDirectEyebrow = (selector: string, value: string) => {
    const element = documentSnapshot.querySelector(selector);

    if (element) {
      element.innerHTML = `<img src="assets/img/star.png" alt="img"> ${value}`;
    }
  };
  const setCollectionText = (selector: string, values: string[]) => {
    documentSnapshot.querySelectorAll(selector).forEach((element, index) => {
      const value = values[index];

      if (value) {
        element.textContent = value;
      }
    });
  };
  const setCollectionHtml = (selector: string, values: string[]) => {
    documentSnapshot.querySelectorAll(selector).forEach((element, index) => {
      const value = values[index];

      if (value) {
        element.innerHTML = value;
      }
    });
  };
  const setListItems = (selector: string, values: string[]) => {
    documentSnapshot.querySelectorAll(selector).forEach((element, index) => {
      const value = values[index];

      if (value) {
        element.innerHTML = `<i class="fa-solid fa-check"></i> ${value}`;
      }
    });
  };

  if (page === 'home') {
    const homeCopy = legacyCopy.home;
    const heroText = documentSnapshot.querySelector('.hero-secton.hero-1 .hero-content p');

    if (heroText) {
      heroText.innerHTML = formatHomeHeroText(t('legacy.home.heroText'));
    }

    setEyebrow('.about-section .section-title h6', 'legacy.home.aboutEyebrow');
    setHtml('.about-section .section-title h2', 'legacy.home.aboutTitle');
    setCollectionText('.about-section .about-wrapper > .nav .nav-link', [
      homeCopy.tabs.concept,
      homeCopy.tabs.research,
      homeCopy.tabs.visuals,
    ]);
    setCollectionHtml('#Concept .about-content p', homeCopy.aboutTabs.Concept);
    setCollectionHtml('#Research .about-content p', homeCopy.aboutTabs.Research);
    setCollectionHtml('#Visuals .about-content p', homeCopy.aboutTabs.Visuals);
    setCollectionText('.counter-section .counter-items .content p', homeCopy.counters);
    setEyebrow('.service-section .section-title h6', 'legacy.home.focusEyebrow');
    setHtml('.service-section .section-title h2', 'legacy.home.focusTitle');
    documentSnapshot.querySelectorAll('.service-section .service-box-items .service-content').forEach((element, index) => {
      const card = homeCopy.focusCards[index];

      if (!card) {
        return;
      }

      const title = element.querySelector('h3');
      const body = element.querySelector('p');

      if (title) {
        title.textContent = card.title;
      }

      if (body) {
        body.textContent = card.body;
      }
    });
    setDirectHtml('.project-section .project-title', homeCopy.featuredTitle);
    documentSnapshot.querySelectorAll('.project-section .project-content').forEach((element, index) => {
      const project = homeCopy.projects[index];

      if (!project) {
        return;
      }

      const label = element.querySelector('span');
      const title = element.querySelector('h3');
      const body = element.querySelector('p');

      if (label) {
        label.textContent = project.label;
      }

      if (title) {
        title.textContent = project.title;
      }

      if (body) {
        body.textContent = project.body;
      }
    });
    setDirectEyebrow('.faq-section .section-title h6', homeCopy.faq.eyebrow);
    setDirectHtml('.faq-section .section-title h2', homeCopy.faq.title);
    setDirectText('.faq-section .section-title p', homeCopy.faq.description);
    documentSnapshot.querySelectorAll('.faq-accordion .accordion-item').forEach((element, index) => {
      const item = homeCopy.faq.items[index];

      if (!item) {
        return;
      }

      const question = element.querySelector('.accordion-button');
      const answer = element.querySelector('.accordion-body');

      if (question) {
        question.textContent = item.question;
      }

      if (answer) {
        answer.textContent = item.answer;
      }
    });
    setDirectText('.parallax-quote', homeCopy.quote);
    setDirectEyebrow('.pricing-section .section-title h6', homeCopy.tools.eyebrow);
    setDirectHtml('.pricing-section .section-title h2', homeCopy.tools.title);
    setCollectionHtml('.pricing-section .price-card p', homeCopy.tools.items);
    setDirectHtml('.message-section .message-items > h2', homeCopy.message.title);
    setDirectHtml(
      '.message-section .lets-circle',
      `<i class="fa-sharp fa-regular fa-arrow-up-right"></i> <br>${homeCopy.message.cta}`,
    );
    setDirectHtml('.message-section .lets-talk-items p', homeCopy.message.body);
    return;
  }

  if (page === 'about') {
    const aboutCopy = legacyCopy.about;

    setEyebrow('.about-section .section-title h6', 'legacy.about.eyebrow');
    setHtml('.about-section .section-title h2', 'legacy.about.heading');
    setCollectionHtml('.about-section .row.align-items-center .about-content > p', aboutCopy.intro);
    setDirectHtml(
      '.about-section .row.align-items-center .about-content .theme-btn',
      `${aboutCopy.quiz} <i class="fa-sharp fa-regular fa-arrow-up-right"></i>`,
    );
    setDirectText('a[href="#Mission"]', aboutCopy.tabs.mission);
    setDirectText('a[href="#Vision"]', aboutCopy.tabs.vision);
    setDirectText('a[href="#Values"]', aboutCopy.tabs.values);
    setDirectHtml('#Mission .about-content p', aboutCopy.mission.body);
    setListItems('#Mission .list-items li', aboutCopy.mission.items);
    setDirectHtml('#Vision .about-content p', aboutCopy.vision.body);
    setDirectHtml('#Values .about-content p', aboutCopy.values.body);
    setListItems('#Values .list-items li', aboutCopy.values.items);
    return;
  }

  const casesCopy = legacyCopy.cases;

  setEyebrow('.breadcrumb-wrapper .page-heading h6', 'legacy.cases.eyebrow');
  setHtml('.breadcrumb-wrapper .page-heading h1', 'legacy.cases.heading');
  setText('.portfolio-section .section-title h2', 'legacy.cases.intro');
  documentSnapshot.querySelectorAll('.portfolio-card-items .portfolio-content').forEach((element, index) => {
    const card = casesCopy.cards[index];

    if (!card) {
      return;
    }

    const category = element.querySelector('h6');
    const body = element.querySelector('p');

    if (category) {
      category.innerHTML = `<span>//</span> ${card.category}`;
    }

    if (body) {
      body.innerHTML = card.body;
    }
  });
}

function initWow() {
  const maybeWindow = window as typeof window & {
    WOW?: new (options?: Record<string, unknown>) => { init: () => void };
  };

  if (maybeWindow.WOW) {
    new maybeWindow.WOW({ live: false }).init();
  }
}
