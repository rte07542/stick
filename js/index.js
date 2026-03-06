const qs  = (sel, root = document) => root.querySelector(sel);

const STORAGE_KEYS = {
  role: "role",
  inviteCode: "inviteCode",
};

const ROLE = {
  guestReadonly: "guest-readonly",
};

const ROUTES = {
  app: "./app.html",   // ✅ 본격 서비스
  home: "./index.html" // 홈
};

function setAriaHidden(el, hidden) {
  el.setAttribute("aria-hidden", hidden ? "true" : "false");
}

function openModal(overlayEl) {
  if (!overlayEl) return;
  overlayEl.classList.remove("hidden");
  setAriaHidden(overlayEl, false);

  // 포커스 이동
  const firstFocus = qs("#loginId");
  firstFocus?.focus();
}

function closeModal(overlayEl) {
  if (!overlayEl) return;
  overlayEl.classList.add("hidden");
  setAriaHidden(overlayEl, true);
}

function initHome() {
  // ---- DOM cache ----
  const enterBtn      = qs("#enterBtn");
  const inviteInput   = qs("#inviteCode");

  const overlay       = qs("[data-login-overlay]");
  const openBtn       = qs("[data-login-open]");
  const closeBtn      = qs("[data-login-close]");

  // ---- handlers ----
  function onEnter() {
    const code = inviteInput?.value.trim();
    if (!code) return;

    localStorage.setItem(STORAGE_KEYS.role, ROLE.guestReadonly);
    localStorage.setItem(STORAGE_KEYS.inviteCode, code);

    // ✅ app으로 이동
    location.href = ROUTES.app;
  }

  function onEsc(e) {
    if (e.key !== "Escape") return;
    if (!overlay || overlay.classList.contains("hidden")) return;
    closeModal(overlay);
  }

  function onOverlayClick(e) {
    // 오버레이 배경 클릭 시 닫기 (모달 박스 클릭은 무시)
    if (e.target === overlay) closeModal(overlay);
  }

  // ---- bind events ----
  enterBtn?.addEventListener("click", onEnter);
  openBtn?.addEventListener("click", () => openModal(overlay));
  closeBtn?.addEventListener("click", () => closeModal(overlay));

  window.addEventListener("keydown", onEsc);
  overlay?.addEventListener("click", onOverlayClick);
}

// DOM 준비되면 실행
document.addEventListener("DOMContentLoaded", initHome);