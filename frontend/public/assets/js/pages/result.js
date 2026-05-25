(function () {
  "use strict";

  const API_BASE_URL = window.AIFORGE_API_URL || "http://localhost:3000/api";
  const params = new URLSearchParams(window.location.search);
  const attemptId = params.get("attempt");

  const scoreText = document.getElementById("scoreText");
  const scoreMessage = document.getElementById("scoreMessage");
  const averageScorePanel = document.getElementById("averageScorePanel");
  const averageScoreValue = document.getElementById("averageScoreValue");
  const averageScoreFill = document.getElementById("averageScoreFill");

  loadResult();

  async function loadResult() {
    if (!attemptId) {
      renderError("Result was not found. Please complete the quiz again.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/quiz/attempts/${encodeURIComponent(attemptId)}`, {
        cache: "no-cache",
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      renderResult(data);
      renderAverageScore(data);
    } catch (error) {
      renderError(error.message || "Could not load quiz result.");
    }
  }

  function renderResult(result) {
    const score = Number(result.scorePercent);

    scoreText.textContent = `${score}%`;

    if (score >= 90) {
      scoreMessage.textContent = "Outstanding. You can spot AI like a true director of reality.";
    } else if (score >= 70) {
      scoreMessage.textContent = "Great job. You have a sharp eye for authentic detail.";
    } else if (score >= 50) {
      scoreMessage.textContent = "Not bad. AI is learning fast, so keep training your perception.";
    } else {
      scoreMessage.textContent = "AI fooled you this time. Try again and sharpen your senses.";
    }
  }

  function renderAverageScore(result) {
    if (!averageScorePanel || !averageScoreValue || !averageScoreFill) {
      return;
    }

    const averageScore = clampScore(Number(result.averageScorePercent) || 0);

    averageScoreValue.textContent = `${averageScore}%`;
    averageScoreFill.style.width = `${averageScore}%`;
    averageScorePanel.hidden = false;
    averageScorePanel.setAttribute(
      "aria-label",
      `Average score across ${result.attemptsCount || 0} quiz attempts is ${averageScore}%`,
    );
  }

  function renderError(message) {
    scoreText.textContent = "No result";
    scoreMessage.textContent = message;
    scoreMessage.classList.add("is-error");

    if (averageScorePanel) {
      averageScorePanel.hidden = true;
    }
  }

  function clampScore(score) {
    return Math.min(100, Math.max(0, Math.round(score)));
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
})();
