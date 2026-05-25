(function () {
  "use strict";

  const TOKEN_KEY = "aiforge.accessToken";
  const USER_KEY = "aiforge.user";

  window.AIForgeAuth = {
    getSession,
    updateUser,
    clearSession,
    renderHeader,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHeader);
  } else {
    renderHeader();
  }

  function getSession() {
    const localSession = readSession(localStorage);

    if (localSession) {
      return { ...localSession, storage: localStorage };
    }

    const tabSession = readSession(sessionStorage);

    return tabSession ? { ...tabSession, storage: sessionStorage } : null;
  }

  function updateUser(user) {
    const session = getSession();

    if (!session) {
      return;
    }

    session.storage.setItem(USER_KEY, JSON.stringify(user));
    renderHeader();
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    renderHeader();
  }

  function renderHeader() {
    const session = getSession();

    document.querySelectorAll(".header-join-now, .header-profile-link").forEach((link) => {
      if (!session || !session.user) {
        link.href = "register.html";
        link.classList.add("join-text", "header-join-now");
        link.classList.remove("header-profile-link");
        link.textContent = "Join now";
        link.removeAttribute("aria-label");
        return;
      }

      renderProfileLink(link, session.user);
    });
  }

  function renderProfileLink(link, user) {
    link.href = "profile.html";
    link.classList.remove("join-text", "header-join-now");
    link.classList.add("header-profile-link");
    link.setAttribute("aria-label", "Open profile");
    link.textContent = "";

    const avatar = document.createElement("span");
    avatar.className = "header-profile-avatar";

    const avatarUrl = user.avatarUrl;

    if (avatarUrl) {
      const image = document.createElement("img");
      image.src = avatarUrl;
      image.alt = user.name ? `${user.name} avatar` : "Profile avatar";
      avatar.appendChild(image);
    } else {
      avatar.textContent = getInitials(user);
    }

    link.appendChild(avatar);
  }

  function readSession(storage) {
    const token = storage.getItem(TOKEN_KEY);
    const userJson = storage.getItem(USER_KEY);

    if (!token || !userJson) {
      return null;
    }

    try {
      return {
        token,
        user: normalizeStoredUser(JSON.parse(userJson), storage),
      };
    } catch {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
      return null;
    }
  }

  function normalizeStoredUser(user, storage) {
    if (!Object.prototype.hasOwnProperty.call(user, "avatarDataUrl")) {
      return user;
    }

    delete user.avatarDataUrl;
    storage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  }

  function getInitials(user) {
    const source = user.name || user.email || "AI";
    const parts = source.trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }
})();
