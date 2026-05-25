(function () {
  "use strict";

  const form = document.getElementById("forgotPasswordForm");
  const feedback = document.getElementById("forgotPasswordFeedback");
  const email = document.getElementById("resetEmail");
  const API_BASE_URL = window.AIFORGE_API_URL || "http://localhost:3000/api";

  if (!form || !feedback || !email) {
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    const originalButtonText = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.innerHTML = "Sending...";
    setFeedback("Sending reset link...", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value.trim(),
        }),
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setFeedback(data.message || "If this email exists, a password reset link has been sent.", "success");
    } catch (error) {
      setFeedback(error.message || "Could not send reset link. Try again.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });

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
