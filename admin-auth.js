const adminSessionKey = "maesttro-admin-session";
const adminCredentials = {
  user: "CEO",
  password: "Cb@210691"
};

function getLocalUsers() {
  try {
    const raw = localStorage.getItem("maesttro_users");
    if (!raw) {
      const defaultUsers = [
        { username: "CEO", password: "Cb@210691", permission: "Admin" },
        { username: "nilton", password: "123", permission: "Editor" },
        { username: "visitante", password: "123", permission: "Visualizador" }
      ];
      localStorage.setItem("maesttro_users", JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch(e) {
    return [{ username: "CEO", password: "Cb@210691", permission: "Admin" }];
  }
}

function isAdminLogged() {
  try {
    return JSON.parse(localStorage.getItem(adminSessionKey))?.logged === true;
  } catch (error) {
    return false;
  }
}

function setAdminLogged(value, matchedUser) {
  if (value) {
    const user = matchedUser || { username: "CEO", permission: "Admin" };
    localStorage.setItem(adminSessionKey, JSON.stringify({
      logged: true,
      user: user.username,
      permission: user.permission,
      at: new Date().toISOString()
    }));
  } else {
    localStorage.removeItem(adminSessionKey);
  }
}

function applyPermissionsUI(permission) {
  const isViewer = permission === "Visualizador";
  const isEditor = permission === "Editor";
  
  // Notice badge if restricted
  let notice = document.getElementById("admin-permission-notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "admin-permission-notice";
    notice.style.position = "fixed";
    notice.style.bottom = "20px";
    notice.style.left = "20px";
    notice.style.background = "#dfa12d";
    notice.style.color = "#121414";
    notice.style.padding = "10px 16px";
    notice.style.borderRadius = "8px";
    notice.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
    notice.style.fontSize = "12px";
    notice.style.fontWeight = "bold";
    notice.style.zIndex = "99999";
    notice.style.display = "none";
    document.body.appendChild(notice);
  }

  // Restore defaults first
  const allInputs = document.querySelectorAll("#admin input, #admin select, #admin button:not(#admin-logout)");
  allInputs.forEach(el => {
    el.disabled = false;
    el.style.opacity = "";
    el.style.cursor = "";
  });
  document.querySelectorAll(".file-drop").forEach(el => {
    el.style.pointerEvents = "";
    el.style.opacity = "";
  });

  if (isViewer) {
    notice.textContent = "Modo Visualizador: Apenas leitura de dados está disponível.";
    notice.style.display = "block";
    notice.style.backgroundColor = "var(--gold)";
    notice.style.color = "#121414";
    
    // Disable inputs & forms (excluding analytics filters so viewers can still interact with the dashboard filters)
    const inputs = document.querySelectorAll("#admin input, #admin select, #admin button:not(#admin-logout)");
    inputs.forEach(el => {
      if (el.closest(".analytics-filters") && el.id !== "btn-reset-analytics") {
        return;
      }
      el.disabled = true;
      el.style.opacity = "0.5";
      el.style.cursor = "not-allowed";
    });
    
    // Disable file dropping
    document.querySelectorAll(".file-drop").forEach(el => {
      el.style.pointerEvents = "none";
      el.style.opacity = "0.5";
    });
    
  } else if (isEditor) {
    notice.textContent = "Modo Editor: Você não possui permissão para gerenciar usuários ou restaurar backups.";
    notice.style.display = "block";
    notice.style.backgroundColor = "rgba(130,148,162,0.8)";
    notice.style.color = "var(--text)";
    
    // Disable user form fields
    const userInputs = document.querySelectorAll("#admin-user-form input, #admin-user-form select, #admin-user-form button");
    userInputs.forEach(el => {
      el.disabled = true;
      el.style.opacity = "0.5";
      el.style.cursor = "not-allowed";
    });
    
    // Disable backup restore or import backup
    const importBackup = document.getElementById("import-backup-file");
    if (importBackup) {
      importBackup.disabled = true;
      importBackup.style.cursor = "not-allowed";
      importBackup.style.opacity = "0.5";
    }
    
    const restoreButtons = document.querySelectorAll("[onclick^='restoreBackupFromHistory']");
    restoreButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    });
  } else {
    notice.style.display = "none";
  }
}

function renderAdminAuth() {
  const login = document.getElementById("admin-login");
  const admin = document.getElementById("admin");
  const logged = isAdminLogged();
  if (login) login.hidden = logged;
  if (admin) admin.hidden = !logged;

  if (logged) {
    let session = {};
    try {
      session = JSON.parse(localStorage.getItem(adminSessionKey)) || {};
    } catch(e) {}
    
    const username = session.user || "CEO";
    const permission = session.permission || "Admin";
    const infoBadge = document.getElementById("logged-user-info");
    if (infoBadge) {
      infoBadge.textContent = `Logado como: ${username} (${permission})`;
    }
    
    // Apply role-based UI restriction
    applyPermissionsUI(permission);
  } else {
    const notice = document.getElementById("admin-permission-notice");
    if (notice) notice.style.display = "none";
  }
}

document.getElementById("admin-login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = document.getElementById("admin-user")?.value.trim() || "";
  const password = document.getElementById("admin-password")?.value || "";
  const message = document.getElementById("admin-login-message");

  const localUsers = getLocalUsers();
  const matchedUser = localUsers.find(u => u.username.toLowerCase() === user.toLowerCase() && u.password === password);

  if (matchedUser) {
    setAdminLogged(true, matchedUser);
    renderAdminAuth();
    // Refresh admin view elements
    if (typeof renderUsersList === "function") renderUsersList();
    if (typeof renderBackupHistory === "function") renderBackupHistory();
    if (typeof renderAnalyticsDashboard === "function") renderAnalyticsDashboard();
    return;
  }

  // Se Supabase estiver ativo, tenta autenticar por lá como fallback
  if (typeof isSupabaseActive === "function" && isSupabaseActive()) {
    const email = user.includes("@") ? user : `${user.toLowerCase()}@maesttro.com.br`;
    supabase.auth.signInWithPassword({
      email: email,
      password: password
    }).then(({ data, error }) => {
      if (!error && data.user) {
        setAdminLogged(true, { username: user, permission: "Admin" });
        renderAdminAuth();
      } else {
        if (message) {
          message.hidden = false;
          message.textContent = `Erro de login: ${error ? error.message : "Credenciais inválidas"}.`;
        }
      }
    }).catch(err => {
      if (message) {
        message.hidden = false;
        message.textContent = "Erro ao conectar com o serviço de autenticação.";
      }
    });
  } else {
    if (message) {
      message.hidden = false;
      message.textContent = "Usuário ou senha inválidos.";
    }
  }
});

document.getElementById("admin-logout")?.addEventListener("click", () => {
  setAdminLogged(false);
  renderAdminAuth();
});

renderAdminAuth();
