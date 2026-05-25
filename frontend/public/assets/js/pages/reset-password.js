(function () {
  "use strict";

  const API_BASE_URL = window.AIFORGE_API_URL || "http://localhost:3000/api";
  const form = document.getElementById("resetPasswordForm");
  const password = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const feedback = document.getElementById("resetPasswordFeedback");
  const token = new URLSearchParams(window.location.search).get("token");

  bindPasswordToggles();

  if (!form || !password || !confirmPassword || !feedback) {
    return;
  }

  if (!token) {
    setFeedback("Reset token is missing. Please request a new reset link.", "error");
    form.querySelectorAll("input, button").forEach((element) => {
      element.disabled = true;
    });
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (password.value !== confirmPassword.value) {
      setFeedback("Passwords do not match.", "error");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    const originalButtonText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = "Resetting...";
    setFeedback("Resetting password...", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: password.value,
        }),
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setFeedback(data.message || "Password has been reset. Redirecting...", "success");

      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      setFeedback(error.message || "Could not reset password. Try again.", "error");
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });

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

  async function parseResponse(response) {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  function getErrorMessage(data) {
    if (Array.isArray(data.message)) {
      return data.message.join(" ");
    }

    return data.message || "Request failed. Try again.";
  }

  function setFeedback(message, type) {
    feedback.textContent = message;
    feedback.classList.remove("is-success", "is-error", "is-info");
    feedback.classList.add(`is-${type}`);
  }
})();
