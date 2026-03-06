// signup.js

const qs = (sel, root = document) => root.querySelector(sel);

function setAriaHidden(el, hidden) {
  el?.setAttribute("aria-hidden", hidden ? "true" : "false");
}

function isHidden(el) {
  return !el || el.classList.contains("hidden");
}

function initSignup() {
  // ---- DOM cache ----
  const agreeTerms   = qs("#agreeTerms");
  const signupBtn    = qs("#signupBtn");

  const openTerms    = qs("#openTerms");
  const openPrivacy  = qs("#openPrivacy");

  const overlay      = qs("#overlay");
  const policyTitle  = qs("#policyTitle");
  const policyContent= qs("#policyContent");
  const policyClose  = qs("#policyClose");
  const policyOk     = qs("#policyOk");

  if (!agreeTerms || !signupBtn) return; // 페이지 구조가 다르면 조용히 종료
  // overlay는 "약관 모달 없는 버전"일 수도 있으니 필수로 안 잡음

  // ---- modal content ----
  const TERMS_HTML = `
    <p><b>이용약관(요약)</b></p>
    <ul>
      <li>서비스는 제공되는 그대로 사용합니다.</li>
      <li>악용/스팸/불법행위 금지.</li>
      <li>운영 정책 위반 시 제한/삭제될 수 있습니다.</li>
    </ul>
  `;

  const PRIVACY_HTML = `
    <p><b>개인정보 처리방침(요약)</b></p>
    <ul>
      <li>계정 생성/로그인을 위해 최소 정보만 수집합니다.</li>
      <li>목적 달성 후 보관/파기 기준에 따라 처리합니다.</li>
      <li>요청 시 열람/정정/삭제가 가능합니다.</li>
    </ul>
  `;

  // ---- state sync ----
  function syncSignupEnabled() {
    signupBtn.disabled = !agreeTerms.checked;
  }

  // ---- modal control ----
  let lastFocusEl = null;

  function openModal(title, html) {
    if (!overlay || !policyTitle || !policyContent) return;

    lastFocusEl = document.activeElement;

    policyTitle.textContent = title;
    policyContent.innerHTML = html;

    overlay.classList.remove("hidden");
    setAriaHidden(overlay, false);

    // 닫기 버튼으로 포커스 이동 (접근성 + 키보드 사용성)
    policyClose?.focus();
  }

  function closeModal() {
    if (!overlay) return;

    overlay.classList.add("hidden");
    setAriaHidden(overlay, true);

    // 모달 열기 전 포커스로 복귀
    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
    lastFocusEl = null;
  }

  // ---- handlers ----
  function onOverlayPointerDown(e) {
    // overlay 바깥 클릭 닫기 (dialog 내부 클릭은 무시)
    const dialog = overlay?.querySelector(".dialog");
    if (dialog && !dialog.contains(e.target)) closeModal();
  }

  function onEsc(e) {
    if (e.key !== "Escape") return;
    if (!overlay || isHidden(overlay)) return;
    closeModal();
  }

  // ---- bind events ----
  agreeTerms.addEventListener("change", syncSignupEnabled);
  syncSignupEnabled();

  openTerms?.addEventListener("click", () => openModal("이용약관", TERMS_HTML));
  openPrivacy?.addEventListener("click", () => openModal("개인정보 처리방침", PRIVACY_HTML));

  policyClose?.addEventListener("click", closeModal);
  policyOk?.addEventListener("click", closeModal);

  overlay?.addEventListener("pointerdown", onOverlayPointerDown);
  window.addEventListener("keydown", onEsc);
}

document.addEventListener("DOMContentLoaded", initSignup);