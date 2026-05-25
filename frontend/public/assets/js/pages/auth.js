(function () {
  "use strict";

  const API_BASE_URL = window.AIFORGE_API_URL || "http://localhost:3000/api";
  const TOKEN_KEY = "aiforge.accessToken";
  const USER_KEY = "aiforge.user";

  bindPasswordToggles();
  bindRegisterForm();
  bindLoginForm();

  function bindRegisterForm() {
    const form = document.getElementById("registerForm");

    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const feedback = document.getElementById("registerFeedback");
      const submitButton = form.querySelector("button[type='submit']");

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      await submitAuthForm({
        endpoint: "/auth/register",
        payload: {
          name: document.getElementById("registerName").value.trim(),
          email: document.getElementById("registerEmail").value.trim(),
          password: document.getElementById("registerPassword").value,
          rememberMe: isRememberMeChecked(form),
        },
        rememberMe: isRememberMeChecked(form),
        feedback,
        submitButton,
        loadingText: "Creating account...",
        successText: "Account created. Redirecting...",
      });
    });
  }

  function bindLoginForm() {
    const form = document.getElementById("loginForm");

    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const feedback = document.getElementById("loginFeedback");
      const submitButton = form.querySelector("button[type='submit']");

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      await submitAuthForm({
        endpoint: "/auth/login",
        payload: {
          email: document.getElementById("loginEmail").value.trim(),
          password: document.getElementById("loginPassword").value,
          rememberMe: isRememberMeChecked(form),
        },
        rememberMe: isRememberMeChecked(form),
        feedback,
        submitButton,
        loadingText: "Signing in...",
        successText: "Signed in. Redirecting...",
      });
    });
  }

  async function submitAuthForm(options) {
    const originalButtonText = options.submitButton.innerHTML;

    setFeedback(options.feedback, options.loadingText, "info");
    options.submitButton.disabled = true;
    options.submitButton.innerHTML = options.loadingText;

    try {
      const response = await fetch(`${API_BASE_URL}${options.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options.payload),
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      saveAuthSession(data, options.rememberMe);
      setFeedback(options.feedback, options.successText, "success");

      window.setTimeout(() => {
        window.location.href = "index.html";
      }, 700);
    } catch (error) {
      setFeedback(options.feedback, error.message || "Something went wrong. Try again.", "error");
      options.submitButton.disabled = false;
      options.submitButton.innerHTML = originalButtonText;
    }
  }

  function bindPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      const input = document.getElementById(button.dataset.passwordToggle);

      if (!input) {
        return;
      }

      button.addEventListener("click", () => {
        const isHidden = input.type === "password";

        input.type = isHidden ? "text" : "password";
        button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
        button.innerHTML = `<i class="fa-solid ${isHidden ? "fa-eye" : "fa-eye-slash"}"></i>`;
      });
    });
  }

  function isRememberMeChecked(form) {
    const rememberMe = form.querySelector("input[name='reviewcheck']");

    return Boolean(rememberMe && rememberMe.checked);
  }

  function saveAuthSession(data, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    storage.setItem(TOKEN_KEY, data.accessToken);
    storage.setItem(USER_KEY, JSON.stringify(data.user));

    if (window.AIForgeAuth) {
      window.AIForgeAuth.renderHeader();
    }
  }

  async function parseResponse(response) {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      return { message: text };
    }
  }

  function getErrorMessage(data) {
    if (Array.isArray(data.message)) {
      return data.message.join(" ");
    }

    return data.message || "Request failed. Try again.";
  }

  function setFeedback(element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.remove("is-success", "is-error", "is-info");
    element.classList.add(`is-${type}`);
  }
})();
