(function () {
  "use strict";

  const API_BASE_URL = window.AIFORGE_API_URL || "http://localhost:3000/api";
  const MAX_SOURCE_IMAGE_SIZE = 8 * 1024 * 1024;
  const MAX_AVATAR_UPLOAD_SIZE = 700 * 1024;

  const form = document.getElementById("profileForm");
  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");
  const avatarInput = document.getElementById("profileAvatar");
  const avatarPreview = document.getElementById("profileAvatarPreview");
  const feedback = document.getElementById("profileFeedback");
  const signOutButton = document.getElementById("profileSignOut");

  let selectedAvatarFile = null;
  let selectedAvatarPreviewUrl = null;

  init();

  function init() {
    const session = getRequiredSession();

    if (!session) {
      return;
    }

    fetchProfile(session.token);
    bindAvatarPicker();
    bindForm();
    bindSignOut();
  }

  async function fetchProfile(token) {
    setFeedback("Loading profile...", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      renderProfile(data);
      window.AIForgeAuth.updateUser(toStoredUser(data));
      setFeedback("", "info");
    } catch (error) {
      setFeedback(error.message || "Could not load profile.", "error");

      if (String(error.message).toLowerCase().includes("token")) {
        window.AIForgeAuth.clearSession();
        window.location.href = "login.html";
      }
    }
  }

  function bindAvatarPicker() {
    if (!avatarInput) {
      return;
    }

    avatarInput.addEventListener("change", async () => {
      const file = avatarInput.files && avatarInput.files[0];

      clearSelectedAvatarPreviewUrl();
      selectedAvatarFile = null;

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        setFeedback("Please choose an image file.", "error");
        avatarInput.value = "";
        return;
      }

      if (file.size > MAX_SOURCE_IMAGE_SIZE) {
        setFeedback("Please choose an image smaller than 8 MB.", "error");
        avatarInput.value = "";
        return;
      }

      setFeedback("Preparing avatar...", "info");

      try {
        selectedAvatarFile = await prepareAvatarFile(file);
        selectedAvatarPreviewUrl = URL.createObjectURL(selectedAvatarFile);
        renderAvatar(selectedAvatarPreviewUrl, nameInput.value);
        setFeedback("Avatar is ready to save.", "info");
      } catch (error) {
        setFeedback(error.message || "Could not prepare avatar.", "error");
        avatarInput.value = "";
      }
    });
  }

  function bindForm() {
    if (!form) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const session = getRequiredSession();

      if (!session) {
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitButton = form.querySelector("button[type='submit']");
      const originalButtonText = submitButton.innerHTML;

      submitButton.disabled = true;
      submitButton.innerHTML = "Saving...";
      setFeedback("Saving profile...", "info");

      try {
        let profile = null;

        if (selectedAvatarFile) {
          profile = await uploadAvatar(session.token, selectedAvatarFile);
        }

        profile = await updateProfile(session.token, {
          name: nameInput.value.trim(),
        });

        selectedAvatarFile = null;
        avatarInput.value = "";
        clearSelectedAvatarPreviewUrl();
        renderProfile(profile);
        window.AIForgeAuth.updateUser(toStoredUser(profile));
        setFeedback("Profile updated.", "success");
      } catch (error) {
        setFeedback(error.message || "Could not update profile.", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    });
  }

  async function uploadAvatar(token, file) {
    const formData = new FormData();

    formData.append("avatar", file);

    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }

    return data;
  }

  async function updateProfile(token, payload) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }

    return data;
  }

  function bindSignOut() {
    if (!signOutButton) {
      return;
    }

    signOutButton.addEventListener("click", () => {
      window.AIForgeAuth.clearSession();
      window.location.href = "login.html";
    });
  }

  function getRequiredSession() {
    const session = window.AIForgeAuth && window.AIForgeAuth.getSession();

    if (!session) {
      window.location.href = "login.html";
      return null;
    }

    return session;
  }

  function renderProfile(profile) {
    nameInput.value = profile.name;
    emailInput.value = profile.email;
    renderAvatar(profile.avatarUrl, profile.name);
  }

  function renderAvatar(imageUrl, name) {
    avatarPreview.textContent = "";

    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = name ? `${name} avatar` : "Profile avatar";
      avatarPreview.appendChild(image);
      return;
    }

    avatarPreview.textContent = getInitials(name || emailInput.value || "AI");
  }

  async function prepareAvatarFile(file) {
    if (file.size <= MAX_AVATAR_UPLOAD_SIZE) {
      return file;
    }

    const compressedBlob = await compressAvatar(file);

    if (compressedBlob.size > MAX_AVATAR_UPLOAD_SIZE) {
      throw new Error("Please choose a simpler or smaller image.");
    }

    return new File([compressedBlob], "avatar.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  }

  function compressAvatar(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const imageUrl = URL.createObjectURL(file);

      image.addEventListener("load", async () => {
        URL.revokeObjectURL(imageUrl);

        try {
          const attempts = [
            { size: 512, quality: 0.82 },
            { size: 384, quality: 0.76 },
            { size: 256, quality: 0.7 },
            { size: 180, quality: 0.64 },
          ];

          for (const attempt of attempts) {
            const blob = await drawAvatar(image, attempt.size, attempt.quality);

            if (blob.size <= MAX_AVATAR_UPLOAD_SIZE) {
              resolve(blob);
              return;
            }
          }

          reject(new Error("Please choose a simpler or smaller image."));
        } catch (error) {
          reject(error);
        }
      });

      image.addEventListener("error", () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("Could not read this image."));
      });

      image.src = imageUrl;
    });
  }

  function drawAvatar(image, outputSize, quality) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - sourceSize) / 2;
      const sourceY = (image.naturalHeight - sourceSize) / 2;

      canvas.width = outputSize;
      canvas.height = outputSize;
      context.fillStyle = "#222226";
      context.fillRect(0, 0, outputSize, outputSize);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        outputSize,
        outputSize,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not compress this image."));
            return;
          }

          resolve(blob);
        },
        "image/jpeg",
        quality,
      );
    });
  }

  function toStoredUser(profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      createdAt: profile.createdAt,
    };
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
    if (!feedback) {
      return;
    }

    feedback.textContent = message;
    feedback.classList.remove("is-success", "is-error", "is-info");
    feedback.classList.add(`is-${type}`);
  }

  function getInitials(source) {
    const parts = source.trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }

  function clearSelectedAvatarPreviewUrl() {
    if (!selectedAvatarPreviewUrl) {
      return;
    }

    URL.revokeObjectURL(selectedAvatarPreviewUrl);
    selectedAvatarPreviewUrl = null;
  }
})();
