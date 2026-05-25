(function () {
  "use strict";

  const API_BASE_URL = window.AIFORGE_API_URL || "http://localhost:3000/api";
  const POST_SLUG = "documentary-film";
  const ANONYMOUS_ID_KEY = "aiforge.anonymousId";

  const postTitle = document.getElementById("postTitle");
  const postVideo = document.getElementById("postVideo");
  const postDescription = document.getElementById("postDescription");
  const likeButton = document.getElementById("likeButton");
  const likeButtonText = document.getElementById("likeButtonText");
  const likeCount = document.getElementById("likeCount");
  const commentCount = document.getElementById("commentCount");
  const commentsList = document.getElementById("commentsList");
  const commentForm = document.getElementById("commentForm");
  const commentBody = document.getElementById("commentBody");
  const ratingPicker = document.getElementById("ratingPicker");
  const commentAuthHint = document.getElementById("commentAuthHint");
  const feedback = document.getElementById("documentaryFeedback");

  let selectedRating = 5;

  init();

  function init() {
    bindLikeButton();
    bindRatingPicker();
    bindCommentForm();
    renderCommentAccess();
    loadPost();
  }

  async function loadPost() {
    setFeedback("Loading post...", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${POST_SLUG}`, {
        headers: getRequestHeaders({ includeAnonymousId: true }),
        cache: "no-cache",
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      renderPost(data);
      setFeedback("", "info");
    } catch (error) {
      setFeedback(error.message || "Could not load post.", "error");
    }
  }

  function bindLikeButton() {
    if (!likeButton) {
      return;
    }

    likeButton.addEventListener("click", async () => {
      likeButton.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/posts/${POST_SLUG}/likes`, {
          method: "POST",
          headers: getRequestHeaders({
            includeJson: true,
            includeAuth: true,
          }),
          body: JSON.stringify({
            anonymousId: getAnonymousId(),
          }),
        });
        const data = await parseResponse(response);

        if (!response.ok) {
          throw new Error(getErrorMessage(data));
        }

        renderLikeState(data.liked, data.likeCount);
      } catch (error) {
        setFeedback(error.message || "Could not update like.", "error");
      } finally {
        likeButton.disabled = false;
      }
    });
  }

  function bindRatingPicker() {
    if (!ratingPicker) {
      return;
    }

    ratingPicker.querySelectorAll("button[data-rating]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedRating = Number(button.dataset.rating);
        renderRatingPicker();
      });
    });

    renderRatingPicker();
  }

  function bindCommentForm() {
    if (!commentForm) {
      return;
    }

    commentForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const session = window.AIForgeAuth && window.AIForgeAuth.getSession();

      if (!session) {
        return;
      }

      if (!commentForm.checkValidity()) {
        commentForm.reportValidity();
        return;
      }

      const submitButton = commentForm.querySelector("button[type='submit']");
      const originalText = submitButton.innerHTML;

      submitButton.disabled = true;
      submitButton.innerHTML = "Posting...";

      try {
        const response = await fetch(`${API_BASE_URL}/posts/${POST_SLUG}/comments`, {
          method: "POST",
          headers: getRequestHeaders({
            includeJson: true,
            includeAuth: true,
          }),
          body: JSON.stringify({
            body: commentBody.value.trim(),
            rating: selectedRating,
          }),
        });
        const data = await parseResponse(response);

        if (!response.ok) {
          throw new Error(getErrorMessage(data));
        }

        commentBody.value = "";
        selectedRating = 5;
        renderRatingPicker();
        setFeedback("Review posted.", "success");
        await loadPost();
      } catch (error) {
        setFeedback(error.message || "Could not post review.", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    });
  }

  function renderCommentAccess() {
    const session = window.AIForgeAuth && window.AIForgeAuth.getSession();
    const isSignedIn = Boolean(session);

    setCommentFormDisabled(!isSignedIn);
    commentAuthHint.hidden = !isSignedIn;
    commentAuthHint.textContent = isSignedIn ? "Rate the film and leave your review." : "";
  }

  function setCommentFormDisabled(isDisabled) {
    if (!commentForm) {
      return;
    }

    commentForm.classList.toggle("is-disabled", isDisabled);
    commentForm.querySelectorAll("textarea, button").forEach((control) => {
      control.disabled = isDisabled;
    });
  }

  function renderPost(post) {
    postTitle.textContent = post.title;
    postVideo.src = toYoutubeEmbedUrl(post.youtubeUrl);
    postDescription.textContent = post.description || "";
    commentCount.textContent = String(post.commentCount);
    renderLikeState(post.viewerHasLiked, post.likeCount);
    renderComments(post.comments);
  }

  function renderLikeState(isLiked, totalLikes) {
    likeButton.classList.toggle("is-liked", Boolean(isLiked));
    likeButton.setAttribute("aria-pressed", String(Boolean(isLiked)));
    likeButton.querySelector("i").className = `fa-${isLiked ? "solid" : "regular"} fa-heart`;
    likeButtonText.textContent = isLiked ? "Liked" : "Like";
    likeCount.textContent = String(totalLikes);
  }

  function renderComments(comments) {
    if (!comments.length) {
      commentsList.innerHTML = '<p class="comments-empty">No reviews yet. Be the first to share one.</p>';
      return;
    }

    commentsList.innerHTML = comments.map(renderComment).join("");
  }

  function renderComment(comment) {
    return `
      <article class="comment-item">
        <div class="comment-avatar">${renderAuthorAvatar(comment.author)}</div>
        <div>
          <div class="comment-meta">
            <div>
              <h3 class="comment-author">${escapeHtml(comment.author.name)}</h3>
              <p class="comment-date">${formatDate(comment.createdAt)}</p>
            </div>
            <div class="comment-stars" aria-label="${comment.rating} out of 5 stars">
              ${renderStars(comment.rating)}
            </div>
          </div>
          <p class="comment-body">${escapeHtml(comment.body)}</p>
        </div>
      </article>
    `;
  }

  function renderAuthorAvatar(author) {
    if (author.avatarUrl) {
      return `<img src="${author.avatarUrl}" alt="${escapeHtml(author.name)} avatar">`;
    }

    return escapeHtml(getInitials(author.name));
  }

  function renderStars(rating) {
    return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
  }

  function renderRatingPicker() {
    ratingPicker.querySelectorAll("button[data-rating]").forEach((button) => {
      const rating = Number(button.dataset.rating);

      button.classList.toggle("is-active", rating <= selectedRating);
    });
  }

  function getRequestHeaders(options = {}) {
    const headers = {};
    const session = window.AIForgeAuth && window.AIForgeAuth.getSession();

    if (options.includeJson) {
      headers["Content-Type"] = "application/json";
    }

    if (options.includeAuth && session) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    if (options.includeAnonymousId) {
      headers["X-AIForge-Anonymous-Id"] = getAnonymousId();
    }

    return headers;
  }

  function getAnonymousId() {
    let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);

    if (!anonymousId) {
      anonymousId = crypto.randomUUID ? crypto.randomUUID() : createFallbackId();
      localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
    }

    return anonymousId;
  }

  function createFallbackId() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (value) =>
      (Number(value) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(value) / 4)))).toString(16),
    );
  }

  function toYoutubeEmbedUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const videoId = parsedUrl.hostname.includes("youtu.be")
        ? parsedUrl.pathname.slice(1)
        : parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch {
      return url;
    }

    return url;
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

  function formatDate(value) {
    return new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function getInitials(source) {
    const parts = source.trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
