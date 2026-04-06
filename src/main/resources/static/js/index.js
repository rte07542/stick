const qs = (sel, root = document) => root.querySelector(sel);

const STORAGE_KEYS = {
  role: "role",
  inviteCode: "inviteCode",
  loginUserId: "loginUserId",
  loginUserNickname: "loginUserNickname"
};

const ROLE = {
  guestReadonly: "guest-readonly",
  member: "member"
};

const ROUTES = {
  app: "html/app.html",
  home: "./index.html"
};

function setAriaHidden(el, hidden) {
  el.setAttribute("aria-hidden", hidden ? "true" : "false");
}

function openModal(overlayEl) {
  if (!overlayEl) return;
  overlayEl.classList.remove("hidden");
  setAriaHidden(overlayEl, false);

  const firstFocus = qs("#loginId");
  firstFocus?.focus();
}

function closeModal(overlayEl) {
  if (!overlayEl) return;
  overlayEl.classList.add("hidden");
  setAriaHidden(overlayEl, true);
}

function initHome() {
  const enterBtn = qs("#enterBtn");
  const inviteInput = qs("#inviteCode");

  const overlay = qs("[data-login-overlay]");
  const openBtn = qs("[data-login-open]");
  const closeBtn = qs("[data-login-close]");

  const loginIdInput = qs("#loginId");
  const loginPwInput = qs("#loginPw");
  const loginSubmitBtn = qs("#loginSubmitBtn");

  function onEnter() {
    const code = inviteInput?.value.trim();
    if (!code) return;

    localStorage.setItem(STORAGE_KEYS.role, ROLE.guestReadonly);
    localStorage.setItem(STORAGE_KEYS.inviteCode, code);

    location.href = ROUTES.app;
  }

  async function onLogin() {
    const loginId = loginIdInput?.value.trim();
    const password = loginPwInput?.value.trim();

    if (!loginId) {
      alert("아이디를 입력해.");
      loginIdInput?.focus();
      return;
    }

    if (!password) {
      alert("비밀번호를 입력해.");
      loginPwInput?.focus();
      return;
    }

    loginSubmitBtn.disabled = true;

    try {
      const response = await authFetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          loginId,
          password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "로그인 실패");
      }

      const user = await response.json();

      localStorage.setItem(STORAGE_KEYS.role, ROLE.member);
      localStorage.setItem(STORAGE_KEYS.loginUserId, String(user.id));
      localStorage.setItem(STORAGE_KEYS.loginUserNickname, user.nickname ?? "");
      localStorage.setItem("token", user.token);

      location.href = ROUTES.app;
    } catch (err) {
      console.error(err);
      alert(err.message || "로그인 중 오류가 발생했어.");
    } finally {
      loginSubmitBtn.disabled = false;
    }
  }

  function onEsc(e) {
    if (e.key !== "Escape") return;
    if (!overlay || overlay.classList.contains("hidden")) return;
    closeModal(overlay);
  }

  function onOverlayClick(e) {
    if (e.target === overlay) closeModal(overlay);
  }

  function authFetch(url, options = {}) {
      const token = localStorage.getItem("token");
      return fetch(url, {
          ...options,
          headers: {
              ...(options.headers || {}),
              "Authorization": `Bearer ${token}`
          }
      });
  }

  enterBtn?.addEventListener("click", onEnter);
  openBtn?.addEventListener("click", () => openModal(overlay));
  closeBtn?.addEventListener("click", () => closeModal(overlay));
  loginSubmitBtn?.addEventListener("click", onLogin);

  window.addEventListener("keydown", onEsc);
  overlay?.addEventListener("click", onOverlayClick);
}

document.addEventListener("DOMContentLoaded", initHome);