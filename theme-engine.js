/**
 * MAESTTRO Global Theme & Styling Engine
 * Controls dynamic fonts, colors, weights, and layout themes across all pages.
 */

(function () {
  const THEME_STORAGE_KEY = "maesttro_theme_config";

  const defaultTheme = {
    preset: "elegante",
    fontFamily: "Inter, sans-serif",
    fontHeading: "Georgia, 'Times New Roman', serif",
    fontSize: "16px",
    fontWeightHeading: "500",
    colorBg: "#fffdf8",
    colorText: "#222624",
    colorPrimary: "#2f3332",
    colorGold: "#b89652",
    colorPaper: "#ffffff",
    cardRadius: "16px"
  };

  const presets = {
    elegante: {
      preset: "elegante",
      fontFamily: "Inter, sans-serif",
      fontHeading: "Georgia, 'Times New Roman', serif",
      fontSize: "16px",
      fontWeightHeading: "500",
      colorBg: "#fffdf8",
      colorText: "#222624",
      colorPrimary: "#2f3332",
      colorGold: "#b89652",
      colorPaper: "#ffffff",
      cardRadius: "16px"
    },
    arrojado: {
      preset: "arrojado",
      fontFamily: "'Montserrat', sans-serif",
      fontHeading: "'Montserrat', sans-serif",
      fontSize: "16px",
      fontWeightHeading: "800",
      colorBg: "#121413",
      colorText: "#f0f2f1",
      colorPrimary: "#1a1d1c",
      colorGold: "#d4af37",
      colorPaper: "#1e2221",
      cardRadius: "8px"
    },
    suave: {
      preset: "suave",
      fontFamily: "'Poppins', sans-serif",
      fontHeading: "'Playfair Display', serif",
      fontSize: "16px",
      fontWeightHeading: "600",
      colorBg: "#f4f6f4",
      colorText: "#222b26",
      colorPrimary: "#35483a",
      colorGold: "#80907f",
      colorPaper: "#ffffff",
      cardRadius: "24px"
    },
    tecnologico: {
      preset: "tecnologico",
      fontFamily: "'Roboto', sans-serif",
      fontHeading: "'Cinzel', serif",
      fontSize: "16px",
      fontWeightHeading: "700",
      colorBg: "#0f172a",
      colorText: "#f1f5f9",
      colorPrimary: "#1e293b",
      colorGold: "#38bdf8",
      colorPaper: "#1e293b",
      cardRadius: "12px"
    }
  };

  function getSavedTheme() {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        return { ...defaultTheme, ...JSON.parse(stored) };
      }
    } catch (e) {}
    return { ...defaultTheme };
  }

  function getContrastColor(hex) {
    if (!hex || typeof hex !== "string") return "#ffffff";
    let color = hex.replace("#", "").trim();
    if (color.length === 3) {
      color = color.split("").map(c => c + c).join("");
    }
    if (color.length !== 6) return "#ffffff";
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return "#ffffff";
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? "#121413" : "#ffffff";
  }

  function applyTheme(theme) {
    loadGoogleFonts();

    const textColorForPrimary = getContrastColor(theme.colorPrimary);
    const textColorForGold = getContrastColor(theme.colorGold);

    let styleTag = document.getElementById("maesttro-dynamic-theme-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "maesttro-dynamic-theme-style";
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --font-family: ${theme.fontFamily} !important;
        --font-family-heading: ${theme.fontHeading} !important;
        --font-size-base: ${theme.fontSize} !important;
        --font-weight-heading: ${theme.fontWeightHeading} !important;
        --paper-bg: ${theme.colorBg} !important;
        --paper: ${theme.colorPaper || "#ffffff"} !important;
        --text: ${theme.colorText} !important;
        --ink: ${theme.colorPrimary} !important;
        --gold: ${theme.colorGold} !important;
        --card-radius: ${theme.cardRadius || "16px"} !important;
      }
      body {
        font-family: ${theme.fontFamily} !important;
        font-size: ${theme.fontSize} !important;
        background: ${theme.colorBg} !important;
        color: ${theme.colorText} !important;
      }
      h1, h2, h3, .floating-card strong, .set-summary strong, .checkout-card strong {
        font-family: ${theme.fontHeading} !important;
        font-weight: ${theme.fontWeightHeading} !important;
      }

      /* Botões primários e de ação no ecossistema do cliente */
      .primary,
      button.primary,
      a.primary,
      .story-input button,
      #analyze-spotify,
      #calculate-travel,
      #fit-story-song,
      #dialog-play,
      #btn-start-lead,
      .hero-actions .primary,
      .checkout-card .primary,
      .checkout-card a.primary,
      .set-summary .primary,
      .set-summary a.primary,
      .choice-summary .primary,
      .choice-summary a.primary,
      .contract-summary .primary,
      .contract-summary a.primary,
      .lead-context-card .primary {
        background: ${theme.colorGold} !important;
        color: ${textColorForGold} !important;
        border: none !important;
        font-weight: 850 !important;
        text-decoration: none !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .primary:hover,
      button.primary:hover,
      a.primary:hover,
      #analyze-spotify:hover,
      #calculate-travel:hover,
      .checkout-card .primary:hover {
        filter: brightness(1.1) !important;
        transform: translateY(-1px) !important;
        color: ${textColorForGold} !important;
      }

      /* Botões secundários (soft) dentro e fora de cards */
      .soft,
      button.soft,
      a.soft,
      .hero-actions .soft {
        background: rgba(0, 0, 0, 0.05) !important;
        color: ${theme.colorText} !important;
        border: 1px solid rgba(0, 0, 0, 0.12) !important;
        text-decoration: none !important;
        font-weight: 700 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .checkout-card .soft,
      .set-summary .soft,
      .choice-summary .soft,
      .contract-summary .soft,
      .checkout-card a.soft,
      .set-summary a.soft,
      .choice-summary a.soft,
      .contract-summary a.soft {
        background: rgba(255, 255, 255, 0.15) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        text-decoration: none !important;
        font-weight: 700 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .checkout-card .soft:hover,
      .set-summary .soft:hover,
      .choice-summary .soft:hover,
      .contract-summary .soft:hover {
        background: rgba(255, 255, 255, 0.25) !important;
        color: #ffffff !important;
      }

      .eyebrow, .section-title span, .set-intro span, .set-summary span, .spotify-section span {
        color: ${theme.colorGold} !important;
      }
      .admin-card, .analytics-dashboard, .choice-card, .stream-card, .preview-main {
        border-radius: ${theme.cardRadius || "16px"} !important;
      }
    `;
  }

  function loadGoogleFonts() {
    if (document.getElementById("maesttro-google-fonts")) return;
    const link = document.createElement("link");
    link.id = "maesttro-google-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }

  // Executa imediatamente na leitura do arquivo para evitar piscadas
  const currentTheme = getSavedTheme();
  applyTheme(currentTheme);

  window.MaesttroTheme = {
    getSavedTheme,
    applyTheme,
    presets,
    defaultTheme,
    THEME_STORAGE_KEY
  };
})();
