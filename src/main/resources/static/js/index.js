const qs = (sel, root = document) => root.querySelector(sel);

const STORAGE_KEYS = {
  role: "role",
  loginUserId: "loginUserId",
  loginUserNickname: "loginUserNickname"
};

const ROLE = {
  member: "member"
};

const ROUTES = {
  app: "html/app.html",
  home: "./index.html"
};

function initHome() {
  const loginIdInput = qs("#loginId");
  const loginPwInput = qs("#loginPw");
  const loginSubmitBtn = qs("#loginSubmitBtn");

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
      const response = await fetch("/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ loginId, password })
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

  loginSubmitBtn?.addEventListener("click", onLogin);

  loginPwInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") onLogin();
  });

  loginIdInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginPwInput?.focus();
  });
}

document.addEventListener("DOMContentLoaded", initHome);