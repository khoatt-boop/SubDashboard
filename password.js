const DASHBOARD_PASSWORD_HASH = "35b7110298d50eecaa35a8c5fd3a3e8b76a3d104cf0f083f49c37e34bc0c7a95";
const AUTH_SESSION_KEY = "sub_dashboard_auth";

function addAuthStyles() {
  if (document.getElementById("authStyles")) return;

  const style = document.createElement("style");
  style.id = "authStyles";
  style.textContent = `
body.auth-locked{background:#111827;min-height:100vh;display:flex;align-items:center;justify-content:center;}
body.auth-locked .page{display:none;}
.auth-screen{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#111827,#1f2937 52%,#7f1d1d);z-index:9999;padding:24px;}
.auth-card{width:min(360px,100%);background:#fff;border-radius:8px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,.28);font-family:'Segoe UI',Arial,sans-serif;}
.auth-card h2{font-size:20px;color:#111827;margin:0 0 6px;}
.auth-card p{font-size:12px;color:#6b7280;margin:0 0 16px;line-height:1.4;}
.auth-card label{display:block;font-size:10px;color:#374151;font-weight:700;text-transform:uppercase;margin-bottom:6px;}
.auth-card input{width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:6px;padding:10px 12px;font-size:14px;margin-bottom:12px;}
.auth-card button{width:100%;border:0;border-radius:6px;background:#EE3124;color:#fff;font-size:13px;font-weight:800;padding:10px 12px;cursor:pointer;}
.auth-card button:hover{background:#c9241a;}
.auth-error{min-height:16px;margin-top:10px;color:#dc2626;font-size:11px;font-weight:700;}
body:not(.auth-locked) .auth-screen{display:none;}
`;
  document.head.appendChild(style);
}

function addAuthScreen() {
  if (document.getElementById("authScreen")) return;

  const screen = document.createElement("div");
  screen.className = "auth-screen";
  screen.id = "authScreen";
  screen.innerHTML = `
  <form class="auth-card" id="authForm">
    <h2>TSP Sub Account Dashboard</h2>
    <p>Nhập mật khẩu để xem Livestream Performance Dashboard.</p>
    <label for="authPassword">Password</label>
    <input type="password" id="authPassword" autocomplete="current-password" autofocus>
    <button type="submit">Vào dashboard</button>
    <div class="auth-error" id="authError"></div>
  </form>
`;
  document.body.prepend(screen);
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function unlockDashboard() {
  document.body.classList.remove("auth-locked");
  const screen = document.getElementById("authScreen");
  if (screen) screen.remove();
}

function lockDashboard() {
  document.body.classList.add("auth-locked");
  addAuthStyles();
  addAuthScreen();
}

function initPasswordGate() {
  if (sessionStorage.getItem(AUTH_SESSION_KEY) === "ok") {
    unlockDashboard();
    return;
  }

  lockDashboard();

  document.getElementById("authForm").addEventListener("submit", async event => {
    event.preventDefault();

    const input = document.getElementById("authPassword");
    const error = document.getElementById("authError");
    const hash = await sha256Hex(input.value);

    if (hash === DASHBOARD_PASSWORD_HASH) {
      sessionStorage.setItem(AUTH_SESSION_KEY, "ok");
      unlockDashboard();
      return;
    }

    error.textContent = "Sai mật khẩu. Vui lòng thử lại.";
    input.value = "";
    input.focus();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPasswordGate);
} else {
  initPasswordGate();
}
