(function () {
  "use strict";

  const API_BASE_URL = window.AIFORGE_API_URL || "http://localhost:3000/api";
  const fallbackQuestions = [
    { slug: "scene-1", answer: "ai" },
    { slug: "scene-2", answer: "real" },
    { slug: "scene-3", answer: "real" },
    { slug: "scene-4", answer: "ai" },
    { slug: "scene-5", answer: "ai" },
    { slug: "scene-6", answer: "real" },
    { slug: "scene-7", answer: "ai" },
    { slug: "scene-8", answer: "real" },
    { slug: "scene-9", answer: "real" },
    { slug: "scene-10", answer: "ai" },
  ];
  const state = {
    questions: fallbackQuestions,
    userAnswers: [],
    usesBackend: false,
  };

  async function loadQuizQuestions() {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/questions`, { cache: "no-cache" });

      if (!response.ok) {
        throw new Error("Quiz API request failed");
      }

      const questions = await response.json();

      if (Array.isArray(questions) && questions.length > 0) {
        state.questions = questions;
        state.usesBackend = true;
      }
    } catch (error) {
      console.warn("Using bundled quiz data.", error);
      await loadFallbackQuestions();
    }

    attachQuestionSlugs();
  }

  async function loadFallbackQuestions() {
    try {
      const response = await fetch("assets/data/quiz.json", { cache: "no-cache" });

      if (!response.ok) {
        throw new Error("Quiz data request failed");
      }

      const quiz = await response.json();

      if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        state.questions = quiz.questions.map((question) => ({
          slug: question.id,
          answer: question.answer,
        }));
      }
    } catch (error) {
      console.warn("Using hardcoded quiz fallback.", error);
    }
  }

  function attachQuestionSlugs() {
    getQuestionBlocks().forEach((block, index) => {
      const question = state.questions[index];

      if (question) {
        block.dataset.questionSlug = question.slug;
      }
    });
  }

  function bindAnswerButtons() {
    const questionBlocks = getQuestionBlocks();

    document.querySelectorAll(".quiz-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const parent = button.closest(".project-box-content");
        const questionIndex = questionBlocks.indexOf(parent);

        parent.querySelectorAll(".quiz-btn").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        state.userAnswers[questionIndex] = button.dataset.answer;
        setFeedback("");
      });
    });
  }

  function bindSubmitButton() {
    const submitButton = document.getElementById("checkAnswers");

    if (!submitButton) {
      return;
    }

    submitButton.addEventListener("click", async () => {
      const missingAnswerIndex = state.questions.findIndex((_, index) => !state.userAnswers[index]);

      if (missingAnswerIndex !== -1) {
        setFeedback(`Please answer Scene ${missingAnswerIndex + 1} before checking your result.`, "error");
        return;
      }

      const originalButtonText = submitButton.innerHTML;

      submitButton.disabled = true;
      submitButton.innerHTML = "Checking...";
      setFeedback("Checking your result...", "info");

      try {
        if (!state.usesBackend) {
          throw new Error("Quiz backend is unavailable. Please try again later.");
        }

        const result = await submitAttemptToBackend();

        window.location.href = `result.html?attempt=${encodeURIComponent(result.attemptId)}`;
      } catch (error) {
        setFeedback(error.message || "Could not submit quiz result. Try again.", "error");
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
  }

  async function submitAttemptToBackend() {
    const headers = {
      "Content-Type": "application/json",
    };
    const session = window.AIForgeAuth && window.AIForgeAuth.getSession();

    if (session) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/quiz/attempts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        answers: state.questions.map((question, index) => ({
          slug: question.slug,
          selectedAnswer: state.userAnswers[index],
        })),
      }),
    });
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }

    return data;
  }

  function getQuestionBlocks() {
    return [...document.querySelectorAll(".project-box-content")];
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
    const feedback = document.getElementById("quizFeedback");

    if (!feedback) {
      return;
    }

    feedback.textContent = message;
    feedback.classList.remove("is-success", "is-error", "is-info");

    if (type) {
      feedback.classList.add(`is-${type}`);
    }
  }

  loadQuizQuestions();
  bindAnswerButtons();
  bindSubmitButton();
})();
