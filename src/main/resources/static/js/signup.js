const qs = (sel, root = document) => root.querySelector(sel);

function setAriaHidden(el, hidden) {
  el?.setAttribute("aria-hidden", hidden ? "true" : "false");
}

function isHidden(el) {
  return !el || el.classList.contains("hidden");
}

function initSignup() {
  const signupId = qs("#signupId");
  const signupPw = qs("#signupPw");
  const signupPw2 = qs("#signupPw2");
  const signupNick = qs("#signupNick");
  const agreeTerms = qs("#agreeTerms");
  const signupBtn = qs("#signupBtn");

  const openTerms = qs("#openTerms");
  const openPrivacy = qs("#openPrivacy");

  const overlay = qs("#overlay");
  const policyTitle = qs("#policyTitle");
  const policyContent = qs("#policyContent");
  const policyClose = qs("#policyClose");
  const policyOk = qs("#policyOk");

  if (!agreeTerms || !signupBtn) return;

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

  function syncSignupEnabled() {
    signupBtn.disabled = !agreeTerms.checked;
  }

  let lastFocusEl = null;

  function openModal(title, html) {
    if (!overlay || !policyTitle || !policyContent) return;
    lastFocusEl = document.activeElement;
    policyTitle.textContent = title;
    policyContent.innerHTML = html;
    overlay.classList.remove("hidden");
    setAriaHidden(overlay, false);
    policyClose?.focus();
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.add("hidden");
    setAriaHidden(overlay, true);
    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
    lastFocusEl = null;
  }

  async function onSignup() {
    const loginId = signupId?.value.trim();
    const password = signupPw?.value.trim();
    const passwordConfirm = signupPw2?.value.trim();
    const nickname = signupNick?.value.trim();
    const ageConfirmed = !!agreeTerms?.checked;

    if (!loginId) {
      alert("아이디를 입력해.");
      signupId?.focus();
      return;
    }

    if (!password) {
      alert("비밀번호를 입력해.");
      signupPw?.focus();
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호 확인이 일치하지 않아.");
      signupPw2?.focus();
      return;
    }

    if (!nickname) {
      alert("닉네임을 입력해.");
      signupNick?.focus();
      return;
    }

    if (!ageConfirmed) {
      alert("만 13세 이상 및 약관 동의가 필요해.");
      return;
    }

    signupBtn.disabled = true;

    try {
      const response = await fetch("/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          loginId,
          password,
          nickname,
          ageConfirmed
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "회원가입 실패");
      }

      alert("회원가입 완료");
      window.location.href = "../index.html";
    } catch (err) {
      console.error(err);
      alert(err.message || "회원가입 중 오류가 발생했어.");
    } finally {
      syncSignupEnabled();
    }
  }

  function onOverlayPointerDown(e) {
    const dialog = overlay?.querySelector(".dialog");
    if (dialog && !dialog.contains(e.target)) closeModal();
  }

  function onEsc(e) {
    if (e.key !== "Escape") return;
    if (!overlay || isHidden(overlay)) return;
    closeModal();
  }

  agreeTerms.addEventListener("change", syncSignupEnabled);
  signupBtn.addEventListener("click", onSignup);

  syncSignupEnabled();

  openTerms?.addEventListener("click", () => openModal("이용약관", TERMS_HTML));
  openPrivacy?.addEventListener("click", () => openModal("개인정보 처리방침", PRIVACY_HTML));

  policyClose?.addEventListener("click", closeModal);
  policyOk?.addEventListener("click", closeModal);

  overlay?.addEventListener("pointerdown", onOverlayPointerDown);
  window.addEventListener("keydown", onEsc);
}

document.addEventListener("DOMContentLoaded", initSignup);