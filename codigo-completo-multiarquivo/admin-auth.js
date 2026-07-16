const adminSessionKey = "maesttro-admin-session";
const adminCredentials = {
  user: "CEO",
  password: "Cb@210691"
};

function isAdminLogged() {
  try {
    return JSON.parse(localStorage.getItem(adminSessionKey))?.logged === true;
  } catch (error) {
    return false;
  }
}

function setAdminLogged(value) {
  if (value) {
    localStorage.setItem(adminSessionKey, JSON.stringify({ logged: true, user: adminCredentials.user, at: new Date().toISOString() }));
  } else {
    localStorage.removeItem(adminSessionKey);
  }
}

function renderAdminAuth() {
  const login = document.getElementById("admin-login");
  const admin = document.getElementById("admin");
  const logged = isAdminLogged();
  if (login) login.hidden = logged;
  if (admin) admin.hidden = !logged;
}

document.getElementById("admin-login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = document.getElementById("admin-user")?.value.trim() || "";
  const password = document.getElementById("admin-password")?.value || "";
  const message = document.getElementById("admin-login-message");
  if (user === adminCredentials.user && password === adminCredentials.password) {
    setAdminLogged(true);
    renderAdminAuth();
    return;
  }
  if (message) {
    message.hidden = false;
    message.textContent = "Usuário ou senha inválidos.";
  }
});

document.getElementById("admin-logout")?.addEventListener("click", () => {
  setAdminLogged(false);
  renderAdminAuth();
});

renderAdminAuth();
