const storageKeys = {
  blockedDates: "maesttro-blocked-dates",
  contractContext: "maesttro-contract-context",
  homeContent: "maesttro-home-content",
  previewVideos: "maesttro-preview-videos",
  serviceCards: "maesttro-service-cards",
  songs: "maesttro-songs"
};

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // The prototype still works when browser storage is unavailable.
  }
}

const state = {
  eventKind: "casamento",
  venue: "fechado",
  style: "romântico",
  rite: "cristão",
  emotion: "lágrimas",
  eventMoment: "todos",
  durationMinutes: "60",
  musicalStyle: "romântico",
  storySong: "",
  transportSelection: ["Violino I", "Violino II", "Violoncelo", "Piano"],
  completeSound: false,
  categories: ["Cordas", "Sopros", "Vozes", "Teclas", "Estrutura", "Recepção"],
  midiFileName: "",
  musicFileObjectUrl: "",
  videoFileName: "",
  videoObjectUrl: "",
  imageUploadDataUrl: "",
  cardUploadDataUrl: "",
  videoThumbDataUrl: "",
  videoEditId: null,
  homeCardEditIndex: null,
  selectedInstrumentIds: ["violino-1", "violino-2", "violoncelo", "piano"],
  blockedDates: readStorage(storageKeys.blockedDates, []),
  lead: null,
  leadId: null,
  simulationId: null
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const instruments = [
  { id: "violino-1", name: "Violino I", category: "Cordas", price: 800, heavy: false },
  { id: "violino-2", name: "Violino II", category: "Cordas", price: 800, heavy: false },
  { id: "violoncelo", name: "Violoncelo", category: "Cordas", price: 900, heavy: true },
  { id: "piano", name: "Piano/Teclado", category: "Teclas", price: 1000, heavy: false },
  { id: "sax", name: "Saxofone", category: "Sopros", price: 900, heavy: false },
  { id: "contrabaixo", name: "Contrabaixo acústico", category: "Cordas", price: 900, heavy: true },
  { id: "voz", name: "Voz solista", category: "Vozes", price: 850, heavy: false }
];

const defaultPreviewVideos = [
  {
    id: "previa-canon-quarteto",
    title: "Canon in D com quarteto",
    formation: "Quarteto de cordas",
    music: "Canon in D",
    image: "./assets/ceremony-garden.png",
    description: "Exemplo de entrada da noiva com progressão clássica e visual de cerimônia elegante."
  },
  {
    id: "previa-sax-recepcao",
    title: "Sax e teclado na recepção",
    formation: "Sax + teclado",
    music: "Fly Me to the Moon",
    image: "./assets/celebration-light.png",
    description: "Demonstração para recepção, coquetel e jantar com clima lounge."
  },
  {
    id: "previa-voz-piano",
    title: "Voz e piano para votos",
    formation: "Voz feminina + piano",
    music: "A Thousand Years",
    image: "./assets/music-details.png",
    description: "Exemplo de momento emocional, votos e homenagens."
  }
];

const previewVideos = readStorage(storageKeys.previewVideos, defaultPreviewVideos);

const defaultServiceCards = [
  { title: "Casamento", tag: "Cerimônia e recepção", image: "./assets/ceremony-garden.png", copy: "Entradas, rito, assinaturas, cumprimentos e saída com repertório afetivo." },
  { title: "Debutante", tag: "15 anos", image: "./assets/celebration-light.png", copy: "Entrada, valsa, homenagens e recepção com formação elegante." },
  { title: "Bodas", tag: "História da família", image: "./assets/music-details.png", copy: "Releituras afetivas e momentos de homenagem para celebrar uma trajetória." },
  { title: "Aniversário", tag: "Celebração social", image: "./assets/celebration-light.png", copy: "Sets por clima: recepção, parabéns, jantar e pista leve." },
  { title: "Corporativo", tag: "Marca e experiência", image: "./assets/ceremony-garden.png", copy: "Soluções para abertura, networking, premiações e encerramento." },
  { title: "Pedido de casamento", tag: "Momento surpresa", image: "./assets/ceremony-garden.png", copy: "Execução curta, precisa e emocionante para tornar o pedido inesquecível." },
  { title: "Tributo / Fúnebre", tag: "Acolhimento", image: "./assets/music-details.png", copy: "Repertório respeitoso para homenagens, despedidas e celebrações de vida." }
];

const serviceCards = readStorage(storageKeys.serviceCards, defaultServiceCards);

const defaultHomeContent = {
  heroImage: "./assets/capa-quartetto-serenatta.jpeg",
  categoryImages: {
    casamento: "./assets/ceremony-garden.png",
    debutante: "./assets/celebration-light.png",
    bodas: "./assets/music-details.png"
  },
  previewBackground: "./assets/celebration-light.png"
};

const storedHomeContent = readStorage(storageKeys.homeContent, defaultHomeContent);
const homeContent = {
  ...defaultHomeContent,
  ...storedHomeContent,
  categoryImages: {
    ...defaultHomeContent.categoryImages,
    ...(storedHomeContent.categoryImages || {})
  }
};

const eventFlow = {
  casamento: {
    show: ["venue", "style", "rite", "emotion", "story"],
    riteTitle: "Qual é o rito da cerimônia?",
    riteOptions: [
      ["cristão", "Cristão"],
      ["católico", "Católico"],
      ["civil", "Civil / simbólico"],
      ["laico", "Laico"],
      ["espírita", "Espírita"]
    ],
    storyTitle: "Existe uma música da história do casal?",
    musicMode: "ceremony"
  },
  debutante: {
    show: ["eventMoment", "duration", "musicalStyle", "story"],
    momentTitle: "Quais momentos da festa terão música?",
    momentOptions: [
      ["recepção", "Recepção dos convidados"],
      ["valsa", "Valsa da debutante"],
      ["jantar", "Jantar"],
      ["todos", "Todos"]
    ],
    durationTitle: "Qual será a duração da execução?",
    durationOptions: [
      ["60", "60 minutos"],
      ["120", "120 minutos"],
      ["180", "180 minutos"]
    ],
    storyTitle: "Quais músicas a debutante gostaria de ouvir?",
    musicMode: "briefing"
  },
  corporativo: {
    show: ["eventMoment", "musicalStyle", "story"],
    momentTitle: "Quais momentos corporativos terão música?",
    momentOptions: [
      ["recepção", "Recepção dos convidados"],
      ["intervalo", "Intervalo"],
      ["jantar", "Jantar"],
      ["todos", "Tudo"]
    ],
    storyTitle: "Existe alguma música, tema da marca ou restrição de repertório?",
    musicMode: "briefing"
  },
  pedido: {
    show: ["venue", "duration", "musicalStyle", "story"],
    durationTitle: "Qual será o tempo de execução?",
    durationOptions: [
      ["15", "Até 15 minutos"],
      ["30", "Até 30 minutos"],
      ["60", "Até 60 minutos"]
    ],
    storyTitle: "Qual música faz parte da história do casal?",
    musicMode: "briefing"
  },
  tributo: {
    show: ["rite", "musicalStyle", "story"],
    riteTitle: "Qual é o rito do tributo?",
    riteOptions: [
      ["católico", "Católico"],
      ["cristão", "Cristão"],
      ["espírita", "Espírita"],
      ["laico", "Laico"]
    ],
    storyTitle: "Quais músicas ou homenagens devem ser consideradas?",
    musicMode: "briefing"
  },
  default: {
    show: ["musicalStyle", "story"],
    storyTitle: "Quais músicas ou estilos você gostaria de indicar?",
    musicMode: "briefing"
  }
};

const eventPresets = {
  casamento: {
    formation: "Quarteto de cordas + piano leve",
    title: "Romance clássico com assinatura cinematográfica.",
    description: "Uma formação elegante para cerimônia com emoção crescente, rito respeitado e saída memorável.",
    moments: ["Pré-cerimônia", "Entrada dos padrinhos", "Entrada do noivo", "Entrada da noiva", "Rito / oração / assinaturas", "Saída dos noivos"],
    reason: "Ideal para entradas, rito e saída com repertório afetivo."
  },
  debutante: {
    formation: "Violino + piano + voz + sax na recepção",
    title: "Uma estreia com brilho, afeto e presença.",
    description: "Set pensado para recepção, valsa, jantar ou festa completa, com duração escolhida pelo cliente.",
    moments: ["Recepção dos convidados", "Valsa da debutante", "Jantar"],
    reason: "Equilibra cerimônia social, emoção familiar e celebração."
  },
  bodas: {
    formation: "Duo de cordas + voz especial",
    title: "A trilha de uma história que continua.",
    description: "Repertório afetivo para celebrar trajetória, família e votos renovados.",
    moments: ["Recepção da família", "Entrada do casal", "Renovação de votos", "Homenagem dos filhos", "Brinde", "Encerramento"],
    reason: "Valoriza memória e intimidade sem excesso."
  },
  aniversário: {
    formation: "Sax + teclado + voz",
    title: "Celebração leve, elegante e com energia crescente.",
    description: "Uma jornada para receber, brindar, cantar parabéns e abrir o clima da festa.",
    moments: ["Recepção", "Jantar/coquetel", "Homenagem", "Parabéns", "Brinde", "Pista leve"],
    reason: "Funciona para aniversário adulto com sofisticação e repertório versátil."
  },
  corporativo: {
    formation: "Sax + teclado + técnico de som",
    title: "Som de marca: elegante, objetivo e memorável.",
    description: "Música para abertura, networking, premiação e encerramento sem disputar atenção.",
    moments: ["Recepção dos convidados", "Intervalo", "Jantar"],
    reason: "Entrega atmosfera premium sem atrapalhar fala, marca e relacionamento."
  },
  pedido: {
    formation: "Violino solo ou duo romântico",
    title: "O pedido entra no tempo certo, sem excesso.",
    description: "Execução planejada para o momento surpresa, com música afetiva e duração objetiva.",
    moments: ["Chegada", "Pedido", "Brinde / fotos"],
    reason: "Foco em impacto emocional, discrição e execução precisa."
  },
  tributo: {
    formation: "Violoncelo + piano + voz serena",
    title: "Acolhimento musical para homenagens delicadas.",
    description: "Repertório respeitoso para despedidas, tributos e celebrações de vida.",
    moments: ["Acolhimento", "Entrada da família", "Momento de reflexão", "Homenagem", "Oração/leitura", "Despedida"],
    reason: "Prioriza conforto, sobriedade e presença emocional."
  }
};

const defaultBaseMoments = [
  {
    id: "preludio",
    moment: "Pré-cerimônia",
    title: "Clair de Lune",
    artist: "Debussy",
    copy: "Recebe os convidados com uma atmosfera calma, refinada e sensorial, sem roubar o protagonismo da entrada.",
    image: "./assets/music-details.png",
    tags: ["Acolhimento", "Instrumental", "Elegante"],
    notes: [523.25, 587.33, 659.25, 587.33, 523.25],
    active: true
  },
  {
    id: "padrinhos",
    moment: "Entrada dos padrinhos",
    title: "Perfect",
    artist: "Ed Sheeran",
    copy: "Popular, reconhecível e afetiva. Funciona bem para abrir a cerimônia com leveza e sorriso.",
    image: "./assets/ceremony-garden.png",
    tags: ["Popular", "Leve", "Afetiva"],
    notes: [329.63, 392, 493.88, 440, 392],
    active: true
  },
  {
    id: "noivo",
    moment: "Entrada do noivo",
    title: "A Thousand Years",
    artist: "Christina Perri",
    copy: "Cria uma entrada emocional sem competir com o ápice da noiva. Boa para casais românticos.",
    image: "./assets/ceremony-garden.png",
    tags: ["Romântica", "Crescente", "Emocional"],
    notes: [440, 493.88, 523.25, 659.25, 587.33],
    active: true
  },
  {
    id: "noiva",
    moment: "Entrada da noiva",
    title: "Canon in D",
    artist: "Pachelbel",
    copy: "Entrada atemporal, com progressão nobre e senso de chegada. É segura, elegante e cinematográfica.",
    image: "./assets/ceremony-garden.png",
    tags: ["Clássica", "Imponente", "Segura"],
    notes: [587.33, 440, 493.88, 369.99, 392, 293.66],
    active: true
  },
  {
    id: "rito",
    moment: "Rito / oração / assinaturas",
    title: "Ave Maria",
    artist: "Schubert",
    copy: "Momento contemplativo, especialmente adequado para cerimônias católicas ou cristãs com pausa devocional.",
    image: "./assets/music-details.png",
    tags: ["Sacra", "Respeitosa", "Contemplativa"],
    notes: [523.25, 587.33, 659.25, 783.99, 739.99],
    active: true
  },
  {
    id: "saida",
    moment: "Saída dos noivos",
    title: "Viva La Vida",
    artist: "Coldplay",
    copy: "A saída pede celebração. Aqui a música abre a energia da festa sem perder sofisticação.",
    image: "./assets/celebration-light.png",
    tags: ["Celebrativa", "Moderna", "Aplausos"],
    notes: [523.25, 587.33, 659.25, 392, 523.25],
    active: true
  }
];

const baseMoments = readStorage(storageKeys.songs, defaultBaseMoments);

const AudioStorage = {
  dbName: "MAESTTRO_AUDIO_DB",
  storeName: "audio_files",
  dbPromise: null,

  getDB() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        if (!window.indexedDB) return resolve(null);
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
    }
    return this.dbPromise;
  },

  async saveAudio(id, dataUrlOrBlob) {
    if (!id || !dataUrlOrBlob) return false;
    try {
      const db = await this.getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        tx.objectStore(this.storeName).put(dataUrlOrBlob, id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn("IndexedDB audio save error:", e);
      return false;
    }
  },

  async getAudio(id) {
    if (!id) return null;
    try {
      const db = await this.getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readonly");
        const req = tx.objectStore(this.storeName).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  async deleteAudio(id) {
    if (!id) return false;
    try {
      const db = await this.getDB();
      if (!db) return false;
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        tx.objectStore(this.storeName).delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }
};

async function persistSongs() {
  const cleanSongs = [];
  for (const song of baseMoments) {
    const copy = { ...song };
    const songId = copy.id || `song-${copy.title}`;
    if (copy.audioUrl && (copy.audioUrl.startsWith("data:") || copy.audioUrl.startsWith("blob:"))) {
      await AudioStorage.saveAudio(songId, copy.audioUrl);
      copy.hasLocalAudio = true;
      copy.audioUrl = `indexeddb:${songId}`;
    }
    cleanSongs.push(copy);
  }
  writeStorage(storageKeys.songs, cleanSongs);
}

async function restoreLocalAudios() {
  for (const song of baseMoments) {
    const songId = song.id || `song-${song.title}`;
    if (song.audioUrl && song.audioUrl.startsWith("indexeddb:")) {
      const stored = await AudioStorage.getAudio(songId);
      if (stored) {
        song.audioUrl = stored;
      }
    } else if (song.hasLocalAudio && (!song.audioUrl || !song.audioUrl.startsWith("http"))) {
      const stored = await AudioStorage.getAudio(songId);
      if (stored) {
        song.audioUrl = stored;
      }
    }
  }
}

const recommendations = {
  minimalista: {
    formation: "Duo violino + violoncelo",
    reason: "Poucos músicos, muita presença. Ideal para cerimônias intimistas e estética limpa.",
    title: "Elegância íntima, sem excesso.",
    description: "Um set delicado, com entradas suaves e arranjos que respeitam o silêncio do momento."
  },
  romântico: {
    formation: "Quarteto de cordas + piano leve",
    reason: "A formação cria profundidade emocional e sustenta entradas com progressão cinematográfica.",
    title: "Romance clássico com assinatura cinematográfica.",
    description: "Uma formação elegante para cerimônia com emoção crescente, rito respeitado e saída memorável."
  },
  marcante: {
    formation: "Cordas + voz + sax na saída",
    reason: "Começa nobre, ganha voz nos pontos afetivos e termina com celebração moderna.",
    title: "Uma cerimônia com ápice, surpresa e aplauso.",
    description: "Para casais que querem emocionar e também serem lembrados pela experiência."
  }
};

function currentRecommendation() {
  const eventPreset = eventPresets[state.eventKind] || eventPresets.casamento;
  const rec = recommendations[state.style] || recommendations.romântico;
  if (state.eventKind !== "casamento") {
    const durationCopy = state.eventKind === "debutante"
      ? ` Duração selecionada: ${state.durationMinutes} minutos, com cobrança por bloco de 60 minutos.`
      : state.eventKind === "pedido"
        ? ` Tempo de execução selecionado: ${state.durationMinutes} minutos.`
        : "";
    return {
      ...rec,
      formation: eventPreset.formation,
      title: eventPreset.title,
      description: `${eventPreset.description}${durationCopy}`,
      reason: `${eventPreset.reason} Estilo musical preferido: ${state.musicalStyle}.`
    };
  }
  if (state.venue === "ar livre" && state.style !== "marcante") {
    return {
      ...rec,
      formation: rec.formation.replace("piano leve", "teclado elegante"),
      reason: `${rec.reason} Em local aberto, teclado elegante traz estabilidade e melhor projeção.`
    };
  }
  if (state.rite === "católico") {
    return {
      ...rec,
      reason: `${rec.reason} Para rito católico, o set preserva momentos sacros e evita escolhas inadequadas durante o rito.`
    };
  }
  return rec;
}

function flowConfig() {
  return eventFlow[state.eventKind] || eventFlow.default;
}

function priceMultiplier() {
  if (state.eventKind !== "debutante") return 1;
  return Math.max(1, Math.ceil(Number(state.durationMinutes || 60) / 60));
}

function selectedMomentLabels() {
  const preset = eventPresets[state.eventKind] || eventPresets.casamento;
  if (state.eventKind === "debutante") {
    const labels = {
      recepção: ["Recepção dos convidados"],
      valsa: ["Valsa da debutante"],
      jantar: ["Jantar"],
      todos: ["Recepção dos convidados", "Valsa da debutante", "Jantar"]
    };
    return labels[state.eventMoment] || preset.moments;
  }
  if (state.eventKind === "corporativo") {
    const labels = {
      recepção: ["Recepção dos convidados"],
      intervalo: ["Intervalo"],
      jantar: ["Jantar"],
      todos: ["Recepção dos convidados", "Intervalo", "Jantar"]
    };
    return labels[state.eventMoment] || preset.moments;
  }
  return preset.moments;
}

const homeImageLabels = {
  heroImage: "Capa principal",
  casamento: "Categoria Casamento",
  debutante: "Categoria Debutante",
  bodas: "Categoria Bodas",
  previewBackground: "Fundo das prévias"
};

function persistVisualContent() {
  writeStorage(storageKeys.homeContent, homeContent);
  writeStorage(storageKeys.previewVideos, previewVideos);
  writeStorage(storageKeys.serviceCards, serviceCards);

  if (typeof dbSaveHomeContent === "function") {
    dbSaveHomeContent(homeContent);
  }
}

function safeCssUrl(value) {
  return String(value || "").replace(/"/g, "%22");
}

function applyHomeContent() {
  const heroImage = document.getElementById("hero-cover-image");
  if (heroImage) heroImage.src = homeContent.heroImage;
  document.querySelectorAll("[data-home-image]").forEach((image) => {
    const slot = image.dataset.homeImage;
    image.src = homeContent.categoryImages[slot] || image.src;
  });
  const previewSection = document.getElementById("previas");
  if (previewSection) {
    previewSection.style.backgroundImage = `linear-gradient(180deg, rgba(47, 51, 50, 0.96), rgba(47, 51, 50, 0.9)), url("${safeCssUrl(homeContent.previewBackground)}")`;
  }
}

function readImageFile(file, onReady) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => onReady(reader.result));
  reader.readAsDataURL(file);
}

function updateHomeCardButton() {
  const button = document.getElementById("save-home-card");
  const cancelButton = document.getElementById("cancel-home-card-edit");
  if (button) button.textContent = state.homeCardEditIndex === null ? "Adicionar card" : "Salvar card";
  if (cancelButton) cancelButton.hidden = state.homeCardEditIndex === null;
}

function resetHomeCardForm() {
  ["admin-card-title", "admin-card-tag", "admin-card-copy", "admin-card-image", "admin-card-image-file"].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });
  state.cardUploadDataUrl = "";
  state.homeCardEditIndex = null;
  updateHomeCardButton();
}

function fillHomeCardForm(index) {
  const item = serviceCards[index];
  if (!item) return;
  state.homeCardEditIndex = index;
  document.getElementById("admin-card-title").value = item.title || "";
  document.getElementById("admin-card-tag").value = item.tag || "";
  document.getElementById("admin-card-copy").value = item.copy || "";
  document.getElementById("admin-card-image").value = item.image || "";
  updateHomeCardButton();
}

function updateVideoButton() {
  const button = document.getElementById("add-admin-video");
  const cancelButton = document.getElementById("cancel-video-edit");
  if (button) button.textContent = state.videoEditId ? "Salvar vídeo" : "Adicionar vídeo";
  if (cancelButton) cancelButton.hidden = !state.videoEditId;
}

function resetVideoForm() {
  ["admin-video-title", "admin-video-formation", "admin-video-music", "admin-video-url", "admin-video-image", "admin-video-description"].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });
  state.videoFileName = "";
  state.videoObjectUrl = "";
  state.videoThumbDataUrl = "";
  state.videoEditId = null;
  const videoFile = document.getElementById("admin-video-file");
  const thumbFile = document.getElementById("admin-video-thumb-file");
  if (videoFile) videoFile.value = "";
  if (thumbFile) thumbFile.value = "";
  updateVideoButton();
}

function fillVideoForm(id) {
  const item = previewVideos.find((video) => video.id === id);
  if (!item) return;
  state.videoEditId = id;
  document.getElementById("admin-video-title").value = item.title || "";
  document.getElementById("admin-video-formation").value = item.formation || "";
  document.getElementById("admin-video-music").value = item.music || "";
  document.getElementById("admin-video-url").value = item.videoUrl || "";
  document.getElementById("admin-video-image").value = item.image || "";
  document.getElementById("admin-video-description").value = item.description || "";
  updateVideoButton();
}

function getYouTubeVideoId(url) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = String(url).match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

function getVideoMediaInfo(url) {
  if (!url) return { isEmbed: false, embedUrl: "", isVideoFile: false, provider: "" };
  const strUrl = String(url).trim();

  // YouTube ID
  const ytId = getYouTubeVideoId(strUrl);
  if (ytId) {
    return {
      isEmbed: true,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1`,
      provider: "YouTube"
    };
  }

  // YouTube Shorts
  const shortsMatch = strUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (shortsMatch && shortsMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1`,
      provider: "YouTube Shorts"
    };
  }

  // Vimeo
  if (strUrl.includes("vimeo.com")) {
    const parts = strUrl.split("?")[0].split("/");
    const vimeoId = parts.filter(Boolean).pop();
    if (vimeoId && !isNaN(vimeoId)) {
      return {
        isEmbed: true,
        embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
        provider: "Vimeo"
      };
    }
  }

  // Instagram (reel, reels, p, tv)
  const instaMatch = strUrl.match(/instagram\.com\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (instaMatch && instaMatch[1]) {
    const shortcode = instaMatch[1];
    return {
      isEmbed: true,
      embedUrl: `https://www.instagram.com/reel/${shortcode}/embed/`,
      isInstagram: true,
      provider: "Instagram",
      originalUrl: strUrl
    };
  }

  // TikTok
  const tiktokMatch = strUrl.match(/tiktok\.com\/.*\/video\/(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://www.tiktok.com/player/v1/${tiktokMatch[1]}?autoplay=1`,
      provider: "TikTok",
      originalUrl: strUrl
    };
  }

  // Google Drive
  const driveMatch = strUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      provider: "Google Drive"
    };
  }

  // Dropbox
  if (strUrl.includes("dropbox.com")) {
    const rawUrl = strUrl.replace("dl=0", "raw=1").replace("dl=1", "raw=1");
    return {
      isEmbed: false,
      isVideoFile: true,
      embedUrl: rawUrl,
      provider: "Dropbox"
    };
  }

  // Direct video file
  if (strUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || strUrl.startsWith("blob:") || strUrl.startsWith("data:video")) {
    return {
      isEmbed: false,
      isVideoFile: true,
      embedUrl: strUrl,
      provider: "Arquivo de Vídeo"
    };
  }

  // External link fallback
  if (strUrl.startsWith("http://") || strUrl.startsWith("https://")) {
    return {
      isEmbed: true,
      embedUrl: strUrl,
      provider: "Link Externo",
      originalUrl: strUrl
    };
  }

  return { isEmbed: false, embedUrl: "", isVideoFile: false, provider: "" };
}

function formatAudioMediaUrl(url) {
  if (!url) return "";
  const str = url.trim();

  // 1. Google Drive (file/d/ID, open?id=ID, uc?id=ID, docs.google.com/uc?id=ID, lh3.googleusercontent.com/d/ID)
  const driveMatch = str.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/uc\?.*id=|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Dropbox
  if (str.includes("dropbox.com")) {
    return str.replace("dl=0", "raw=1").replace("dl=1", "raw=1");
  }

  // 3. OneDrive
  if (str.includes("onedrive.live.com") || str.includes("1drv.ms")) {
    return str.replace("download=0", "download=1");
  }

  return str;
}

function getAudioMediaInfo(url) {
  if (!url) return { isEmbed: false, audioUrl: "", provider: "" };
  const strUrl = url.trim();

  // 1. YouTube
  const ytMatch = strUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`,
      provider: "YouTube"
    };
  }

  // 2. Spotify
  const spotifyMatch = strUrl.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
  if (spotifyMatch && spotifyMatch[1] && spotifyMatch[2]) {
    return {
      isEmbed: true,
      embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator`,
      provider: "Spotify"
    };
  }

  // 3. SoundCloud
  if (strUrl.includes("soundcloud.com")) {
    return {
      isEmbed: true,
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(strUrl)}&color=%23d4af37&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false`,
      provider: "SoundCloud"
    };
  }

  // 4. Google Drive
  const driveMatch = strUrl.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/uc\?.*id=|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      isEmbed: false,
      isGoogleDrive: true,
      audioUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      drivePreviewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      provider: "Google Drive"
    };
  }

  // 5. Dropbox
  if (strUrl.includes("dropbox.com")) {
    return {
      isEmbed: false,
      audioUrl: strUrl.replace("dl=0", "raw=1").replace("dl=1", "raw=1"),
      provider: "Dropbox"
    };
  }

  // 6. OneDrive
  if (strUrl.includes("onedrive.live.com") || strUrl.includes("1drv.ms")) {
    return {
      isEmbed: false,
      audioUrl: strUrl.replace("download=0", "download=1"),
      provider: "OneDrive"
    };
  }

  // 7. Direct file
  return {
    isEmbed: false,
    audioUrl: formatAudioMediaUrl(strUrl),
    provider: "Áudio"
  };
}

function getYouTubeEmbedUrl(url) {
  const info = getVideoMediaInfo(url);
  return info.embedUrl || url;
}

function getAutoThumbnail(videoUrl, currentThumb) {
  if (currentThumb && !currentThumb.includes("celebration-light.png")) return currentThumb;
  const ytId = getYouTubeVideoId(videoUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return currentThumb || "./assets/celebration-light.png";
}

function openVideoModal(videoItem) {
  let dialog = document.getElementById("video-player-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "video-player-dialog";
    dialog.style.cssText = "border:none; border-radius:16px; padding:24px; max-width:800px; width:90%; background:#1e2221; color:white; box-shadow:0 20px 50px rgba(0,0,0,0.5); z-index:9999;";
    document.body.appendChild(dialog);
  }

  const info = getVideoMediaInfo(videoItem.videoUrl || "");
  const isInstagram = info.isInstagram;
  const containerStyle = isInstagram
    ? "position:relative; width:100%; max-width:440px; margin:0 auto; padding-bottom:120%; height:0; overflow:hidden; border-radius:12px; background:#000;"
    : "position:relative; width:100%; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; background:#000;";

  dialog.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px;">
      <div>
        <span style="font-size:12px; color:var(--gold, #d4af37); text-transform:uppercase; font-weight:700;">
          ${videoItem.formation || "Prévia"} ${info.provider ? `• ${info.provider}` : ""}
        </span>
        <h3 style="margin:4px 0 0 0; font-size:18px; font-weight:700; color:white;">${videoItem.title}</h3>
      </div>
      <button id="close-video-dialog" style="background:rgba(255,255,255,0.12); border:none; color:white; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:700; transition: background 0.2s;">Fechar ✕</button>
    </div>

    <div style="${containerStyle}">
      ${info.isEmbed ? `
        <iframe src="${info.embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen frameborder="0" scrolling="no"></iframe>
      ` : info.isVideoFile ? `
        <video src="${info.embedUrl}" controls autoplay style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:contain;"></video>
      ` : `
        <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; text-align:center; padding:20px;">
          <p style="color:#aaa;">Vídeo de demonstração cadastrado. Configure o link ou arquivo para assistir diretamente.</p>
        </div>
      `}
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; flex-wrap:wrap; gap:12px;">
      <p style="margin:0; font-size:14px; color:#c0cac5; line-height:1.5; flex:1;">${videoItem.description || ""}</p>
      ${videoItem.videoUrl ? `
        <a href="${videoItem.videoUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:6px; background:rgba(212,175,55,0.2); color:#d4af37; border:1px solid rgba(212,175,55,0.4); padding:8px 16px; border-radius:8px; font-size:12px; font-weight:700; text-decoration:none;">
          <span>Abrir no ${info.provider || "Instagram / Link"}</span> ↗
        </a>
      ` : ""}
    </div>
  `;

  const closeBtn = document.getElementById("close-video-dialog");
  if (closeBtn) {
    closeBtn.onclick = () => {
      dialog.close();
      dialog.innerHTML = "";
    };
  }

  dialog.onclose = () => {
    dialog.innerHTML = "";
  };

  dialog.showModal();
}

function renderServiceRail() {
  const rail = document.getElementById("service-rail");
  if (!rail) return;
  const activeCards = serviceCards.filter((item) => item.active !== false);
  rail.innerHTML = activeCards.map((item) => `
    <article class="stream-card">
      <img src="${item.image}" alt="${item.title}">
      <div>
        <span>${item.tag}</span>
        <h3>${item.title}</h3>
        <p>${item.copy}</p>
      </div>
    </article>
  `).join("");
}

function openAudioModal(songItem) {
  let dialog = document.getElementById("audio-player-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "audio-player-dialog";
    dialog.style.cssText = "border:none; border-radius:16px; padding:24px; max-width:580px; width:90%; background:#1e2221; color:white; box-shadow:0 20px 50px rgba(0,0,0,0.5); z-index:9999;";
    document.body.appendChild(dialog);
  }

  const audioInfo = getAudioMediaInfo(songItem.audioUrl || "");

  dialog.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px;">
      <div>
        <span style="font-size:12px; color:var(--gold, #d4af37); text-transform:uppercase; font-weight:700;">
          🎵 Prévia Musical • ${songItem.formation || songItem.moment || "Repertório"} ${audioInfo.provider ? `• ${audioInfo.provider}` : ""}
        </span>
        <h3 style="margin:4px 0 0 0; font-size:18px; font-weight:700; color:white;">${songItem.title}</h3>
      </div>
      <button id="close-audio-dialog" style="background:rgba(255,255,255,0.12); border:none; color:white; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:700;">Fechar ✕</button>
    </div>

    <div style="text-align:center; padding:12px 0;">
      <img src="${songItem.image || './assets/music-details.png'}" style="width:130px; height:130px; object-fit:cover; border-radius:12px; margin-bottom:12px; box-shadow:0 4px 14px rgba(0,0,0,0.5);" />
      <p style="font-size:15px; color:#d4af37; font-weight:700; margin:0 0 6px 0;">${songItem.music || songItem.artist || "Artista a definir"}</p>
      <p style="font-size:13px; color:#ccc; margin:0 0 16px 0;">${(songItem.description || songItem.copy || "").replace(/\s*\(Arquivo:[^)]+\)/gi, "")}</p>

      ${audioInfo.isEmbed ? `
        <div style="position:relative; width:100%; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; margin-top:12px; background:#000;">
          <iframe src="${audioInfo.embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen frameborder="0"></iframe>
        </div>
      ` : audioInfo.isGoogleDrive ? `
        <div style="margin-top:12px;">
          <audio controls autoplay src="${audioInfo.audioUrl}" style="width:100%; border-radius:8px; accent-color:#d4af37;" onError="this.style.display='none'; if(document.getElementById('drive-fallback-${songItem.id}')) document.getElementById('drive-fallback-${songItem.id}').style.display='block';"></audio>
          <div id="drive-fallback-${songItem.id}" style="display:none; margin-top:10px; width:100%; height:140px; border-radius:12px; overflow:hidden; border:1px solid rgba(212,175,55,0.4);">
            <iframe src="${audioInfo.drivePreviewUrl}" style="width:100%; height:140px; border:none;" allow="autoplay"></iframe>
          </div>
          <p style="font-size:11px; color:#aaa; margin-top:8px;">
            <a href="${audioInfo.drivePreviewUrl}" target="_blank" rel="noopener" style="color:#d4af37; text-decoration:underline; font-weight:600;">Ouvir no Google Drive ↗</a>
          </p>
        </div>
      ` : audioInfo.audioUrl ? `
        <audio controls autoplay src="${audioInfo.audioUrl}" style="width:100%; border-radius:8px; accent-color:#d4af37;" onError="this.style.display='none'; if(document.getElementById('drive-fallback-${songItem.id}')) document.getElementById('drive-fallback-${songItem.id}').style.display='block';"></audio>
        ${audioInfo.drivePreviewUrl ? `
          <div id="drive-fallback-${songItem.id}" style="display:none; margin-top:10px;">
            <p style="font-size:12px; color:#aaa; margin-bottom:6px;">Player direto indisponível. <a href="${audioInfo.drivePreviewUrl}" target="_blank" rel="noopener" style="color:#d4af37; text-decoration:underline; font-weight:bold;">Clique para ouvir no Google Drive ↗</a></p>
          </div>
        ` : ''}
      ` : `
        <button id="synth-play-btn" style="background:var(--gold, #d4af37); color:#121212; border:none; padding:12px 24px; border-radius:8px; font-weight:800; cursor:pointer;">▶ Tocar Melodia Sintetizada</button>
      `}
    </div>
  `;

  const closeBtn = document.getElementById("close-audio-dialog");
  if (closeBtn) {
    closeBtn.onclick = () => {
      dialog.close();
      dialog.innerHTML = "";
    };
  }

  const synthBtn = document.getElementById("synth-play-btn");
  if (synthBtn) {
    synthBtn.onclick = () => {
      playNotes(songItem.notes || [440, 523.25, 659.25, 587.33, 523.25]);
    };
  }

  dialog.onclose = () => {
    dialog.innerHTML = "";
  };

  dialog.showModal();
}

function renderPreviewVideos(activeId) {
  const activeVideos = previewVideos.filter((item) => item.active !== false).map((v) => ({
    id: v.id,
    title: v.title,
    formation: v.formation || "Prévia em vídeo",
    music: v.music || "Repertório",
    description: (v.description || "Demonstração de execução musical.").replace(/\s*\(Arquivo:[^)]+\)/gi, ""),
    image: getAutoThumbnail(v.videoUrl, v.image),
    videoUrl: v.videoUrl,
    type: "video"
  }));

  const activeSongs = baseMoments.filter((item) => item.active !== false).map((s) => ({
    id: s.id || `song-${s.title}`,
    title: s.title,
    formation: s.moment || "Prévia musical",
    music: s.artist || "A definir",
    description: (s.copy || `Execução da música ${s.title}`).replace(/\s*\(Arquivo:[^)]+\)/gi, ""),
    image: s.image || "./assets/music-details.png",
    audioUrl: s.audioUrl || "",
    notes: s.notes || [440, 523.25, 659.25, 587.33, 523.25],
    type: "audio"
  }));

  const allItems = [...activeVideos, ...activeSongs];
  const hero = document.getElementById("preview-hero");
  const list = document.getElementById("preview-list");
  if (!hero || !list) return;

  if (!allItems.length) {
    hero.innerHTML = `<article class="preview-main empty-preview"><div class="preview-main-content"><span>Prévias</span><h3>Nenhum vídeo ou música ativa no momento.</h3><p>Use o ADMIN para incluir ou reativar demonstrações por formação, música e clima de evento.</p></div></article>`;
    list.innerHTML = "";
    return;
  }

  const active = allItems.find((item) => item.id === activeId) || allItems[0];

  if (active.type === "video") {
    hero.innerHTML = `
      <article class="preview-main">
        <img src="${active.image}" alt="${active.title}">
        <div class="preview-main-content">
          <span>🎥 ${active.formation}</span>
          <h3>${active.title}</h3>
          <p>${active.description}</p>
          <button class="primary" data-video-play="${active.id}">Assistir prévia ▶</button>
        </div>
      </article>
    `;
  } else {
    const audioInfo = getAudioMediaInfo(active.audioUrl || "");
    hero.innerHTML = `
      <article class="preview-main preview-audio-card">
        <img src="${active.image}" alt="${active.title}">
        <div class="preview-main-content">
          <span>🎵 ${active.formation} • ${active.music}</span>
          <h3>${active.title}</h3>
          <p>${active.description}</p>
          ${audioInfo.isEmbed ? `
            <div style="margin-top:14px; width:100%; max-width:540px; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; background:#000;">
              <iframe src="${audioInfo.embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen frameborder="0"></iframe>
            </div>
          ` : audioInfo.isGoogleDrive ? `
            <div style="margin-top:14px; width:100%; max-width:440px;">
              <audio controls autoplay src="${audioInfo.audioUrl}" style="width:100%; border-radius:8px; accent-color:var(--gold, #d4af37); filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));" onError="this.style.display='none'; document.getElementById('hero-drive-iframe-${active.id}').style.display='block';"></audio>
              <div id="hero-drive-iframe-${active.id}" style="display:none; margin-top:10px; width:100%; height:140px; border-radius:12px; overflow:hidden; border:1px solid rgba(212,175,55,0.4);">
                <iframe src="${audioInfo.drivePreviewUrl}" style="width:100%; height:140px; border:none;" allow="autoplay"></iframe>
              </div>
            </div>
          ` : audioInfo.audioUrl ? `
            <div style="margin-top:14px; width:100%; max-width:440px;">
              <audio controls autoplay src="${audioInfo.audioUrl}" style="width:100%; border-radius:8px; accent-color:var(--gold, #d4af37); filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));"></audio>
            </div>
          ` : ""}
          <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
            <button class="primary" data-audio-play="${active.id}">Ouvir prévia musical 🎵</button>
          </div>
        </div>
      </article>
    `;
  }

  list.innerHTML = allItems.map((item) => `
    <article class="preview-thumb ${item.id === active.id ? 'active' : ''}" data-preview-id="${item.id}">
      <img src="${item.image}" alt="${item.title}">
      <div>
        <strong>${item.title}</strong>
        <span>${item.formation} • ${item.music} ${item.type === 'audio' ? '🎵' : '🎥'}</span>
      </div>
      <span class="play-dot">${item.type === 'audio' ? '🎵' : '▶'}</span>
    </article>
  `).join("");

  document.querySelectorAll("[data-preview-id]").forEach((item) => {
    item.addEventListener("click", () => renderPreviewVideos(item.dataset.previewId));
  });

  document.querySelectorAll("[data-video-play]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = previewVideos.find((video) => video.id === button.dataset.videoPlay);
      if (item) {
        openVideoModal(item);
      }
    });
  });

  document.querySelectorAll("[data-audio-play]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = allItems.find((s) => s.id === button.dataset.audioPlay);
      if (item) {
        openAudioModal(item);
      }
    });
  });
}

function renderTransportInstruments() {
  const wrap = document.getElementById("transport-instruments");
  if (!wrap) return;
  wrap.innerHTML = instruments.map((item) => `
    <button class="${state.transportSelection.includes(item.name) ? "active" : ""}" data-transport="${item.name}">
      ${item.name}${item.heavy ? " • grande" : ""}
    </button>
  `).join("");
  document.querySelectorAll("[data-transport]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.transport;
      state.transportSelection = state.transportSelection.includes(name)
        ? state.transportSelection.filter((item) => item !== name)
        : [...state.transportSelection, name];
      renderTransportInstruments();
      calculateTravel();
    });
  });
}

function estimateDistanceFromZip(zipCode) {
  const digits = String(zipCode || "").replace(/\D/g, "");
  if (!digits) return 0;
  if (digits.startsWith("09")) return 18;
  if (digits.startsWith("01") || digits.startsWith("04") || digits.startsWith("05")) return 34;
  if (digits.startsWith("11")) return 78;
  if (digits.startsWith("13")) return 92;
  if (digits.startsWith("12")) return 128;
  return 52;
}

function estimateTollPerVehicleFromZip(zipCode, distanceOneWay) {
  const digits = String(zipCode || "").replace(/\D/g, "");
  if (!digits || !distanceOneWay) return 0;
  if (digits.startsWith("09")) return 0;
  if (digits.startsWith("01") || digits.startsWith("04") || digits.startsWith("05")) return 0;
  if (digits.startsWith("11")) return 18.4;
  if (digits.startsWith("13")) return 32.8;
  if (digits.startsWith("12")) return 42.5;
  return distanceOneWay > 70 ? 24 : 0;
}

function calculateTransportPlan() {
  const selected = instruments.filter((item) => state.transportSelection.includes(item.name));
  const hasHeavy = selected.some((item) => item.heavy) || state.completeSound;
  const people = Math.max(selected.length, 1);
  const capacity = hasHeavy ? 2 : 4;
  const vehicles = Math.max(Math.ceil(people / capacity), state.completeSound ? 1 : 1);
  return { selected, hasHeavy, people, capacity, vehicles };
}

function calculateTravel() {
  const zip = document.getElementById("travel-zip")?.value || "";
  const roundTrip = Boolean(document.getElementById("round-trip")?.checked);
  const distanceOneWay = estimateDistanceFromZip(zip);
  const tollPerVehicle = estimateTollPerVehicleFromZip(zip, distanceOneWay);
  const distanceCharged = roundTrip ? distanceOneWay * 2 : distanceOneWay;
  const blocks = Math.ceil(distanceCharged / 10);
  const transport = calculateTransportPlan();
  const kmCostPerVehicle = blocks * 6.5;
  const totalTolls = tollPerVehicle * transport.vehicles * (roundTrip ? 2 : 1);
  const travelTotal = (kmCostPerVehicle * transport.vehicles) + totalTolls;
  const result = document.getElementById("travel-result");
  if (!result) return;
  result.innerHTML = `
    <span>Resultado logístico</span>
    <strong>${money.format(travelTotal)}</strong>
    <div class="travel-line"><span>Distância estimada</span><b>${distanceOneWay || "--"} km ${roundTrip ? "por trecho" : ""}</b></div>
    <div class="travel-line"><span>Distância cobrada</span><b>${distanceCharged || "--"} km</b></div>
    <div class="travel-line"><span>Blocos de 10 km</span><b>${blocks || "--"}</b></div>
    <div class="travel-line"><span>Capacidade por carro</span><b>${transport.capacity} pessoas</b></div>
    <div class="travel-line"><span>Veículos sugeridos</span><b>${transport.vehicles}</b></div>
    <div class="travel-line"><span>Pedágios estimados</span><b>${money.format(totalTolls)}</b></div>
    <small>${zip ? "Estimativa automática a partir do CEP informado." : "Informe o CEP do evento para calcular a estimativa."}</small>
  `;
}

function renderVisualAdmin() {
  const imageList = document.getElementById("home-image-admin-list");
  const cardList = document.getElementById("home-card-admin-list");
  if (imageList) {
    const imageItems = [
      ["heroImage", homeContent.heroImage],
      ["casamento", homeContent.categoryImages.casamento],
      ["debutante", homeContent.categoryImages.debutante],
      ["bodas", homeContent.categoryImages.bodas],
      ["previewBackground", homeContent.previewBackground]
    ];
    imageList.innerHTML = imageItems.map(([slot, src]) => `
      <div class="admin-row admin-media-row">
        <img src="${src}" alt="${homeImageLabels[slot]}">
        <div><strong>${homeImageLabels[slot]}</strong><small>${src.startsWith("data:") ? "imagem enviada no protótipo" : src}</small></div>
        <button data-image-slot="${slot}">usar</button>
      </div>
    `).join("");
    document.querySelectorAll("[data-image-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById("admin-image-slot").value = button.dataset.imageSlot;
        document.getElementById("admin-image-url").value = "";
      });
    });
  }
  if (cardList) {
    cardList.innerHTML = serviceCards.map((item, index) => `
      <div class="admin-row admin-media-row">
        <img src="${item.image}" alt="${item.title}">
        <div>
          <strong>${item.title}</strong>
          <small>${item.tag} • <span style="color:${item.active !== false ? '#80907f' : '#be8f85'}; font-weight:bold;">${item.active !== false ? '🟢 Ativo' : '⏸️ Pausado'}</span></small>
        </div>
        <div class="admin-row-actions">
          <button data-toggle-card="${index}">${item.active !== false ? "pausar" : "ativar"}</button>
          <button data-edit-card="${index}">editar</button>
          <button data-remove-card="${index}">remover</button>
        </div>
      </div>
    `).join("");
    document.querySelectorAll("[data-toggle-card]").forEach((button) => {
      button.addEventListener("click", () => {
        const idx = Number(button.dataset.toggleCard);
        if (serviceCards[idx]) {
          serviceCards[idx].active = !(serviceCards[idx].active !== false);
          persistVisualContent();
          if (typeof dbToggleActive === "function") {
            dbToggleActive("service_cards", serviceCards[idx].title, !serviceCards[idx].active, "title");
          }
          renderServiceRail();
          renderVisualAdmin();
        }
      });
    });
    document.querySelectorAll("[data-edit-card]").forEach((button) => {
      button.addEventListener("click", () => fillHomeCardForm(Number(button.dataset.editCard)));
    });
    document.querySelectorAll("[data-remove-card]").forEach((button) => {
      button.addEventListener("click", () => {
        const cardTitle = serviceCards[Number(button.dataset.removeCard)].title;
        serviceCards.splice(Number(button.dataset.removeCard), 1);
        persistVisualContent();
        if (typeof dbDeleteServiceCard === "function") {
          dbDeleteServiceCard(cardTitle);
        }
        resetHomeCardForm();
        renderServiceRail();
        renderVisualAdmin();
      });
    });
  }
  updateHomeCardButton();
  updateVideoButton();
}

function renderAdmin() {
  const categorySelect = document.getElementById("admin-instrument-category");
  const categoryList = document.getElementById("category-admin-list");
  const instrumentList = document.getElementById("instrument-admin-list");
  const videoList = document.getElementById("video-admin-list");
  const songList = document.getElementById("song-admin-list");

  if (categorySelect) {
    categorySelect.innerHTML = state.categories.map((item) => `<option>${item}</option>`).join("");
  }
  if (categoryList) {
    categoryList.innerHTML = state.categories.map((item) => `<span>${item}</span>`).join("");
  }
  if (instrumentList) {
    instrumentList.innerHTML = instruments.map((item) => `
      <div class="admin-row">
        <div><strong>${item.name}</strong><small>${item.category}${item.heavy ? " • logística grande" : ""}</small></div>
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="number" value="${item.price}" data-price="${item.id}" style="width:100px;">
          <button data-remove-instrument="${item.id}" style="padding:4px 8px; font-size:12px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer;">Remover</button>
        </div>
      </div>
    `).join("");
    document.querySelectorAll("[data-price]").forEach((input) => {
      input.addEventListener("change", async () => {
        const item = instruments.find((instrument) => instrument.id === input.dataset.price);
        if (item) {
          item.price = Number(input.value || 0);
          updatePrice();
          if (typeof dbUpsertInstrument === "function") {
            await dbUpsertInstrument(item);
          }
        }
      });
    });
    document.querySelectorAll("[data-remove-instrument]").forEach((button) => {
      button.addEventListener("click", async () => {
        const instId = button.dataset.removeInstrument;
        const itemIndex = instruments.findIndex((i) => i.id === instId);
        if (itemIndex > -1) {
          const removedItem = instruments[itemIndex];
          if (confirm(`Tem certeza que deseja remover o instrumento "${removedItem.name}"?`)) {
            instruments.splice(itemIndex, 1);
            if (typeof dbDeleteInstrument === "function") {
              await dbDeleteInstrument(instId);
            }
            renderAdmin();
            renderTransportInstruments();
            calculateTravel();
          }
        }
      });
    });
  }
  if (videoList) {
    videoList.innerHTML = previewVideos.map((item) => `
      <div class="admin-row admin-media-row">
        <img src="${getAutoThumbnail(item.videoUrl, item.image)}" alt="${item.title}">
        <div>
          <strong>${item.title}</strong>
          <small>${item.formation} • <span style="color:${item.active !== false ? '#80907f' : '#be8f85'}; font-weight:bold;">${item.active !== false ? '🟢 Ativo' : '⏸️ Pausado'}</span></small>
        </div>
        <div class="admin-row-actions">
          <button data-toggle-video="${item.id}">${item.active !== false ? "pausar" : "ativar"}</button>
          <button data-edit-video="${item.id}">editar</button>
          <button data-remove-video="${item.id}">remover</button>
        </div>
      </div>
    `).join("");
    document.querySelectorAll("[data-toggle-video]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = previewVideos.find((v) => v.id === button.dataset.toggleVideo);
        if (item) {
          item.active = !(item.active !== false);
          persistVisualContent();
          if (typeof dbToggleActive === "function") {
            dbToggleActive("preview_videos", item.id, !item.active);
          }
          renderPreviewVideos();
          renderAdmin();
        }
      });
    });
    document.querySelectorAll("[data-edit-video]").forEach((button) => {
      button.addEventListener("click", () => fillVideoForm(button.dataset.editVideo));
    });
    document.querySelectorAll("[data-remove-video]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = previewVideos.findIndex((item) => item.id === button.dataset.removeVideo);
        if (index < 0) return;
        const videoTitle = previewVideos[index].title;
        previewVideos.splice(index, 1);
        persistVisualContent();
        if (typeof dbDeletePreviewVideo === "function") {
          dbDeletePreviewVideo(videoTitle);
        }
        resetVideoForm();
        renderPreviewVideos(previewVideos[0]?.id);
        renderAdmin();
      });
    });
  }

  if (songList) {
    songList.innerHTML = baseMoments.map((item, index) => `
      <div class="admin-row admin-media-row">
        <img src="${item.image || './assets/music-details.png'}" alt="${item.title}">
        <div>
          <strong>${item.title}</strong>
          <small>${item.artist || 'A definir'} • ${item.moment || 'Geral'} • <span style="color:${item.active !== false ? '#80907f' : '#be8f85'}; font-weight:bold;">${item.active !== false ? '🟢 Ativo' : '⏸️ Pausado'}</span></small>
        </div>
        <div class="admin-row-actions">
          <button data-play-song="${index}">ouvir</button>
          <button data-toggle-song="${index}">${item.active !== false ? "pausar" : "ativar"}</button>
          <button data-remove-song="${index}">remover</button>
        </div>
      </div>
    `).join("");

    document.querySelectorAll("[data-play-song]").forEach((button) => {
      button.addEventListener("click", () => {
        const idx = Number(button.dataset.playSong);
        if (baseMoments[idx]) {
          openAudioModal(baseMoments[idx]);
        }
      });
    });

    document.querySelectorAll("[data-toggle-song]").forEach((button) => {
      button.addEventListener("click", () => {
        const idx = Number(button.dataset.toggleSong);
        if (baseMoments[idx]) {
          baseMoments[idx].active = !(baseMoments[idx].active !== false);
          persistSongs();
          if (typeof dbToggleActive === "function") {
            dbToggleActive("songs", baseMoments[idx].title, !baseMoments[idx].active, "title");
          }
          renderPreviewVideos();
          renderChoices();
          renderAdmin();
        }
      });
    });

    document.querySelectorAll("[data-remove-song]").forEach((button) => {
      button.addEventListener("click", () => {
        const idx = Number(button.dataset.removeSong);
        if (baseMoments[idx]) {
          const title = baseMoments[idx].title;
          baseMoments.splice(idx, 1);
          persistSongs();
          if (typeof dbDeleteSong === "function") {
            dbDeleteSong(title);
          }
          renderPreviewVideos();
          renderChoices();
          renderAdmin();
        }
      });
    });
  }

  renderVisualAdmin();
  renderBlockedDates();
}

function formatDateBR(dateValue) {
  if (!dateValue) return "data indefinida";
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function isDateBlocked(dateValue) {
  return state.blockedDates.some((item) => item.date === dateValue);
}

function blockedDateReason(dateValue) {
  return state.blockedDates.find((item) => item.date === dateValue)?.reason || "data já reservada";
}

function setLeadDateStatus(message, type = "") {
  const status = document.getElementById("lead-date-status");
  if (!status) return;
  status.textContent = message;
  status.className = `date-status ${type}`.trim();
}

function validateLeadDate(showMessage = false) {
  const dateInput = document.getElementById("lead-event-date");
  if (!dateInput) return true;
  const dateValue = dateInput.value;
  if (!dateValue) {
    dateInput.setCustomValidity("");
    setLeadDateStatus("A agenda será conferida automaticamente.");
    return true;
  }
  if (isDateBlocked(dateValue)) {
    const message = "NOS DESCULPE, JA TEMOS EVENTO NA DATA DESCRITA E INFELIZMENTE NAO CONSEGUIREMOS ATENDE-LO";
    dateInput.setCustomValidity(message);
    setLeadDateStatus(message, "blocked");
    if (showMessage) dateInput.reportValidity();
    return false;
  }
  dateInput.setCustomValidity("");
  setLeadDateStatus(`Data disponível no protótipo: ${formatDateBR(dateValue)}.`, "available");
  return true;
}

function persistBlockedDates() {
  state.blockedDates.sort((a, b) => a.date.localeCompare(b.date));
  writeStorage(storageKeys.blockedDates, state.blockedDates);
}

function renderBlockedDates() {
  const list = document.getElementById("blocked-date-list");
  if (!list) return;
  if (!state.blockedDates.length) {
    list.innerHTML = `<div class="empty-state">Nenhuma data bloqueada no momento.</div>`;
    validateLeadDate();
    return;
  }
  list.innerHTML = state.blockedDates.map((item) => `
    <div class="blocked-date-row">
      <div>
        <strong>${formatDateBR(item.date)}</strong>
        <small>${item.reason || "data já reservada"}</small>
      </div>
      <button data-unblock-date="${item.date}">Liberar</button>
    </div>
  `).join("");
  document.querySelectorAll("[data-unblock-date]").forEach((button) => {
    button.addEventListener("click", () => {
      const date = button.dataset.unblockDate;
      state.blockedDates = state.blockedDates.filter((item) => item.date !== date);
      persistBlockedDates();
      if (typeof dbDeleteBlockedDate === "function") {
        dbDeleteBlockedDate(date);
      }
      renderBlockedDates();
    });
  });
  validateLeadDate();
}

function curatedMoments() {
  const preset = eventPresets[state.eventKind] || eventPresets.casamento;
  const source = state.eventKind === "casamento"
    ? baseMoments
    : selectedMomentLabels().map((moment, index) => ({
        id: `${state.eventKind}-${index}`,
        moment,
        title: suggestTitleForMoment(state.eventKind, moment, index),
        artist: "MAESTTRO",
        copy: suggestCopyForMoment(state.eventKind, moment),
        image: index % 2 ? "./assets/celebration-light.png" : "./assets/music-details.png",
        tags: [preset.formation, state.eventKind, "Editável"],
        notes: [440, 523.25, 659.25, 587.33, 523.25]
      }));
  return source.map((item) => {
    const next = { ...item };
    if (state.rite === "espírita" && item.id === "rito") {
      next.title = "Oração de São Francisco";
      next.artist = "Tradicional";
      next.copy = "Sugestão serena e acolhedora, adequada a uma leitura espiritual sem excesso litúrgico.";
      next.tags = ["Espiritual", "Serena", "Acolhedora"];
    }
    if (state.style === "marcante" && item.id === "saida") {
      next.title = "Signed, Sealed, Delivered";
      next.artist = "Stevie Wonder";
      next.copy = "Saída vibrante para transformar o fim da cerimônia em começo de festa.";
      next.tags = ["Vibrante", "Surpresa", "Festa"];
    }
    if (state.style === "minimalista" && item.id === "noiva") {
      next.title = "The Swan";
      next.artist = "Saint-Saëns";
      next.copy = "Entrada elegante e menos óbvia, perfeita para estética limpa e emocional.";
      next.tags = ["Minimalista", "Clássica", "Refinada"];
    }
    if (state.storySong && item.id === "noivo") {
      next.title = state.storySong;
      next.artist = "História do casal";
      next.copy = "A música afetiva do casal entra aqui porque emociona sem competir com a entrada da noiva. Também pode virar tema dos cumprimentos.";
      next.tags = ["História do casal", "Afetiva", "Personalizada"];
    }
    if (state.storySong && state.eventKind !== "casamento" && item.moment.toLowerCase().match(/homenagem|entrada|brinde|reflexão|votos/)) {
      next.title = state.storySong;
      next.artist = "História do evento";
      next.copy = "O MAESTTRO encaixou a música afetiva em um momento de maior significado emocional.";
      next.tags = ["História", "Personalizada", "Momento-chave"];
    }
    return next;
  });
}

function suggestTitleForMoment(eventKind, moment, index) {
  const map = {
    debutante: ["A Thousand Years", "This Is Me", "Can You Feel the Love Tonight", "Como é Grande o Meu Amor por Você", "Isn't She Lovely", "Viva La Vida"],
    bodas: ["Eu Sei Que Vou Te Amar", "The Way You Look Tonight", "Ave Maria", "What a Wonderful World", "La Vie en Rose", "All You Need Is Love"],
    aniversário: ["Fly Me to the Moon", "Treasure", "Photograph", "Parabéns sofisticado", "Happy", "September"],
    corporativo: ["Feeling Good", "Viva La Vida", "Don't Stop Me Now", "Bittersweet Symphony", "Celebration", "A Sky Full of Stars"],
    pedido: ["Perfect", "All of Me", "A Thousand Years", "Can't Help Falling in Love"],
    tributo: ["Amazing Grace", "Ave Maria", "Hallelujah", "Oração de São Francisco", "Nessun Dorma", "Time to Say Goodbye"]
  };
  return (map[eventKind] || map.casamento || [])[index] || moment;
}

function suggestCopyForMoment(eventKind, moment) {
  const labels = {
    debutante: "Momento pensado para valorizar a debutante, a família e a transição para a celebração.",
    bodas: "Escolha afetiva para reforçar memória, continuidade e presença da família.",
    aniversário: "Trilha leve e social, com energia adequada para cada virada da festa.",
    corporativo: "Música funcional e premium, criada para apoiar marca, fala e relacionamento.",
    pedido: "Execução curta, afetiva e precisa para acompanhar o momento do pedido.",
    tributo: "Repertório sereno e respeitoso, com foco em acolhimento e homenagem."
  };
  return `${labels[eventKind] || "Momento personalizado pelo MAESTTRO."} ${moment} recebe uma sugestão que pode ser alterada a qualquer momento.`;
}

function renderRecommendation() {
  const rec = currentRecommendation();
  const heroRecommendation = document.getElementById("hero-recommendation");
  const setTitle = document.getElementById("set-title");
  const setDescription = document.getElementById("set-description");
  const formationName = document.getElementById("formation-name");
  const formationReason = document.getElementById("formation-reason");
  if (heroRecommendation) heroRecommendation.textContent = rec.formation;
  if (setTitle) setTitle.textContent = rec.title;
  if (setDescription) setDescription.textContent = rec.description;
  if (formationName) formationName.textContent = rec.formation;
  if (formationReason) formationReason.textContent = rec.reason;
  renderLeadContext();
  renderQuestionFlow();
  syncSuggestedInstruments();
  renderTimeline();
  renderChoices();
  updatePrice();
  persistContractContext();
}

function revealJourneySections() {
  document.querySelectorAll("[data-after-lead]").forEach((section) => {
    section.classList.remove("hidden-until-ready");
    section.classList.remove("locked");
  });
}

function renderLeadContext() {
  const title = document.getElementById("lead-context-title");
  const copy = document.getElementById("lead-context-copy");
  const tags = document.getElementById("lead-context-tags");
  if (!title || !copy || !tags) return;
  if (!state.lead) {
    title.textContent = "Dados recebidos";
    copy.textContent = "A categoria, data e local informados acima orientam as próximas perguntas.";
    tags.innerHTML = "";
    return;
  }
  title.textContent = `${state.lead.eventType} de ${state.lead.name}`;
  copy.textContent = "O MAESTTRO já trouxe categoria, data e local para esta etapa. Agora faltam apenas os detalhes musicais.";
  tags.innerHTML = [
    state.lead.eventDate ? formatDateBR(state.lead.eventDate) : "data a definir",
    state.lead.location || "local a definir",
    state.lead.budget || "investimento a definir"
  ].map((item) => `<span>${item}</span>`).join("");
}

function syncSuggestedInstruments() {
  const byEvent = {
    casamento: ["violino-1", "violino-2", "violoncelo", "piano"],
    debutante: ["violino-1", "piano", "voz", "sax"],
    bodas: ["violino-1", "violoncelo", "voz"],
    aniversário: ["sax", "piano", "voz"],
    corporativo: ["sax", "piano"],
    pedido: ["violino-1", "violoncelo"],
    tributo: ["violoncelo", "piano", "voz"]
  };
  const suggested = byEvent[state.eventKind] || byEvent.casamento;
  const stillValid = state.selectedInstrumentIds.filter((id) => instruments.some((item) => item.id === id));
  if (!stillValid.length || state.lastSyncedEvent !== state.eventKind) {
    state.selectedInstrumentIds = suggested;
    state.lastSyncedEvent = state.eventKind;
  }
}

function bindLeadForm() {
  const form = document.getElementById("lead-form");
  if (!form) return;
  document.getElementById("lead-event-date")?.addEventListener("change", () => validateLeadDate());
  document.getElementById("lead-event-date")?.addEventListener("input", () => validateLeadDate());
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateLeadDate(true)) return;
    const lead = {
      name: document.getElementById("lead-name").value.trim(),
      email: document.getElementById("lead-email").value.trim(),
      phone: document.getElementById("lead-phone").value.trim(),
      eventType: document.getElementById("lead-event-type").value,
      eventDate: document.getElementById("lead-event-date").value,
      location: document.getElementById("lead-location").value.trim(),
      zip: document.getElementById("lead-zip").value.trim(),
      budget: document.getElementById("lead-budget").value,
      consent: document.getElementById("lead-consent").checked
    };
    const eventMap = {
      Casamento: "casamento",
      Debutante: "debutante",
      Bodas: "bodas",
      Aniversário: "aniversário",
      Corporativo: "corporativo",
      "Pedido de casamento": "pedido",
      "Tributo / Fúnebre": "tributo"
    };
    state.eventKind = eventMap[lead.eventType] || "casamento";
    state.lead = lead;
    setEventDefaults(state.eventKind);
    const success = document.getElementById("lead-success");
    success.hidden = false;
    success.innerHTML = `Tudo certo, <strong>${lead.name}</strong>. Agora o MAESTTRO vai ajustar a experiência para ${lead.eventType.toLowerCase()} em ${lead.eventDate ? formatDateBR(lead.eventDate) : "data a definir"}.`;
    revealJourneySections();
    if (lead.zip) {
      document.getElementById("travel-zip").value = lead.zip;
      calculateTravel();
    }
    renderRecommendation();
    document.getElementById("maesttro").scrollIntoView({ behavior: "smooth" });

    // Salva o lead e cria a simulação inicial no Supabase
    if (typeof dbSaveLead === "function") {
      dbSaveLead(lead).then(leadId => {
        if (leadId) {
          state.leadId = leadId;
          persistContractContext();
        }
      });
    }
  });
}

function renderChoices() {
  const instrumentGrid = document.getElementById("instrument-choice-grid");
  const musicGrid = document.getElementById("music-choice-grid");
  const total = document.getElementById("choice-total");
  const count = document.getElementById("instrument-choice-count");
  const copy = document.getElementById("choice-summary-copy");
  const musicTitle = document.getElementById("music-choice-title");
  const musicSubtitle = document.getElementById("music-choice-subtitle");
  if (!instrumentGrid || !musicGrid) return;
  const selected = instruments.filter((item) => state.selectedInstrumentIds.includes(item.id));
  const multiplier = priceMultiplier();
  instrumentGrid.innerHTML = instruments.map((item) => `
    <button class="choice-card ${state.selectedInstrumentIds.includes(item.id) ? "active" : ""}" data-choice-instrument="${item.id}">
      <img src="${item.heavy ? "./assets/music-details.png" : "./assets/celebration-light.png"}" alt="${item.name}">
      <span>${item.category}${item.heavy ? " • logística especial" : ""}</span>
      <strong>${item.name}</strong>
      <small>${money.format(item.price)}${multiplier > 1 ? ` x ${multiplier} blocos` : ""}</small>
    </button>
  `).join("");
  if (state.eventKind === "casamento") {
    if (musicTitle) musicTitle.textContent = "Músicas sugeridas para cortejos";
    if (musicSubtitle) musicSubtitle.textContent = "Editável por momento";
    musicGrid.innerHTML = curatedMoments().map((item) => `
      <article class="music-choice-card">
        <img src="${item.image}" alt="${item.moment}">
        <div>
          <span>${item.moment}</span>
          <strong>${item.title}</strong>
          <small>${item.artist}</small>
        </div>
        <div class="music-choice-actions">
          <button data-play-choice="${item.id}">Ouvir</button>
          <button data-change-choice="${item.id}">Trocar</button>
        </div>
      </article>
    `).join("");
  } else {
    if (musicTitle) musicTitle.textContent = "Briefing de repertório";
    if (musicSubtitle) musicSubtitle.textContent = "Estilo musical e músicas desejadas";
    musicGrid.innerHTML = `
      <article class="music-choice-card briefing-card">
        <img src="./assets/celebration-light.png" alt="Estilo musical">
        <div>
          <span>Estilo musical</span>
          <strong>${state.musicalStyle}</strong>
          <small>O admin usa este direcionamento para montar a proposta musical.</small>
        </div>
        <div class="music-choice-actions">
          <button data-briefing-edit="style">Alterar</button>
        </div>
      </article>
      <article class="music-choice-card briefing-card">
        <img src="./assets/music-details.png" alt="Músicas desejadas">
        <div>
          <span>Músicas indicadas</span>
          <strong>${state.storySong || "Ainda não informado"}</strong>
          <small>${state.storySong ? "Referência salva no briefing." : "O cliente pode indicar músicas desejadas ou referências afetivas."}</small>
        </div>
        <div class="music-choice-actions">
          <button data-briefing-edit="songs">Indicar</button>
        </div>
      </article>
    `;
  }
  const totalValue = selected.reduce((sum, item) => sum + item.price, 0) * multiplier;
  if (total) total.textContent = money.format(totalValue);
  if (count) count.textContent = `${selected.length} selecionado${selected.length === 1 ? "" : "s"}`;
  if (copy) {
    const durationCopy = multiplier > 1 ? ` Cobrança: ${multiplier} blocos de 60 minutos.` : "";
    copy.textContent = selected.length ? `${selected.map((item) => item.name).join(", ")}.${durationCopy}` : "Escolha pelo menos uma formação para seguir.";
  }
  document.querySelectorAll("[data-choice-instrument]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.choiceInstrument;
      state.selectedInstrumentIds = state.selectedInstrumentIds.includes(id)
        ? state.selectedInstrumentIds.filter((item) => item !== id)
        : [...state.selectedInstrumentIds, id];
      state.transportSelection = instruments.filter((item) => state.selectedInstrumentIds.includes(item.id)).map((item) => item.name);
      renderChoices();
      renderTransportInstruments();
      calculateTravel();
      updatePrice();
      persistContractContext();
    });
  });
  document.querySelectorAll("[data-play-choice]").forEach((button) => {
    button.addEventListener("click", () => playMoment(button.dataset.playChoice));
  });
  document.querySelectorAll("[data-change-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = curatedMoments().find((moment) => moment.id === button.dataset.changeChoice);
      const replacement = prompt(`Qual música você quer testar em "${item.moment}"?`, item.title);
      if (replacement) {
        state.storySong = replacement;
        renderRecommendation();
      }
    });
  });
  document.querySelectorAll("[data-briefing-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.briefingEdit === "style") {
        const next = prompt("Qual estilo musical deseja priorizar?", state.musicalStyle);
        if (next) state.musicalStyle = next;
      } else {
        const next = prompt("Quais músicas ou referências deseja indicar?", state.storySong);
        if (next) state.storySong = next;
      }
      renderRecommendation();
    });
  });
  document.querySelectorAll('a[href="./contrato.html"]').forEach((link) => {
    link.addEventListener("click", persistContractContext);
  });
}

function selectedInstruments() {
  return instruments.filter((item) => state.selectedInstrumentIds.includes(item.id));
}

function estimatedTotalValue() {
  const fallback = {
    minimalista: 2800,
    romântico: 4800,
    marcante: 6200
  };
  const selectedTotal = selectedInstruments().reduce((sum, item) => sum + item.price, 0);
  return (selectedTotal || fallback[state.style] || fallback.romântico) * priceMultiplier();
}

function persistContractContext() {
  const rec = currentRecommendation();
  const moments = curatedMoments().map((item) => `${item.moment}: ${item.title}`);
  
  const contextData = {
    lead: state.lead,
    eventKind: state.eventKind,
    eventDate: state.lead?.eventDate || "",
    eventLocation: state.lead?.location || "",
    formation: rec.formation,
    instruments: selectedInstruments().map((item) => item.name),
    musicalStyle: state.musicalStyle,
    storySong: state.storySong,
    moments,
    total: estimatedTotalValue(),
    updatedAt: new Date().toISOString(),
    leadId: state.leadId || null,
    simulationId: state.simulationId || null
  };

  writeStorage(storageKeys.contractContext, contextData);

  // Sincroniza a simulação no Supabase vinculada ao Lead
  if (state.leadId && typeof dbSaveSimulation === "function") {
    dbSaveSimulation(state.leadId, contextData).then(simId => {
      if (simId && simId !== state.simulationId) {
        state.simulationId = simId;
        contextData.simulationId = simId;
        writeStorage(storageKeys.contractContext, contextData);
      }
    });
  }
}

function renderTimeline() {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;
  if (state.eventKind !== "casamento") {
    const moments = selectedMomentLabels();
    timeline.innerHTML = `
      <article class="moment-card briefing-card">
        <img src="./assets/celebration-light.png" alt="Escopo do evento">
        <div>
          <span>Escopo selecionado</span>
          <h3>${moments.join(" • ")}</h3>
          <p>Para esta categoria, o MAESTTRO coleta escopo, estilo musical e músicas desejadas. A curadoria final será montada pelo admin, sem sugestão automática de cortejos.</p>
        </div>
        <div class="moment-actions">
          <button data-scroll-briefing>Editar briefing</button>
        </div>
      </article>
      <article class="moment-card briefing-card">
        <img src="./assets/music-details.png" alt="Briefing musical">
        <div>
          <span>Direção musical</span>
          <h3>${state.musicalStyle}</h3>
          <p>${state.storySong ? `Músicas ou referências indicadas: ${state.storySong}.` : "O cliente pode indicar músicas específicas, artistas ou estilos para orientar a proposta."}</p>
        </div>
        <div class="moment-actions">
          <button data-scroll-briefing>Indicar músicas</button>
        </div>
      </article>
    `;
    document.querySelectorAll("[data-scroll-briefing]").forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById("maesttro")?.scrollIntoView({ behavior: "smooth" });
      });
    });
    return;
  }
  timeline.innerHTML = curatedMoments().map((item) => `
    <article class="moment-card">
      <img src="${item.image}" alt="${item.moment}">
      <div>
        <span>${item.moment}</span>
        <h3>${item.title}</h3>
        <p>${item.copy}</p>
      </div>
      <div class="moment-actions">
        <button data-open="${item.id}">Por quê?</button>
        <button data-play="${item.id}">Ouvir</button>
        <button data-swap="${item.id}">Alterar</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => openMoment(button.dataset.open));
  });
  document.querySelectorAll("[data-play]").forEach((button) => {
    button.addEventListener("click", () => playMoment(button.dataset.play));
  });
  document.querySelectorAll("[data-swap]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = curatedMoments().find((moment) => moment.id === button.dataset.swap);
      const replacement = prompt(`Qual música você quer testar em "${item.moment}"?`, item.title);
      if (replacement) {
        state.storySong = replacement;
        renderRecommendation();
      }
    });
  });
}

function setEventDefaults(eventKind) {
  const config = eventFlow[eventKind] || eventFlow.default;
  if (config.momentOptions && !config.momentOptions.some(([value]) => value === state.eventMoment)) {
    state.eventMoment = config.momentOptions[0][0];
  }
  if (config.durationOptions && !config.durationOptions.some(([value]) => value === state.durationMinutes)) {
    state.durationMinutes = config.durationOptions[0][0];
  }
  if (config.riteOptions && !config.riteOptions.some(([value]) => value === state.rite)) {
    state.rite = config.riteOptions[0][0];
  }
  if (!config.momentOptions && state.eventMoment === "") state.eventMoment = "todos";
}

function renderQuestionFlow() {
  const config = flowConfig();
  const show = new Set(config.show);
  document.querySelectorAll("[data-dynamic-question]").forEach((card) => {
    card.hidden = !show.has(card.dataset.dynamicQuestion);
  });

  const riteTitle = document.getElementById("rite-question-title");
  if (riteTitle) riteTitle.textContent = config.riteTitle || "Qual é o rito ou contexto?";
  const riteOptions = document.getElementById("rite-options");
  if (riteOptions) {
    const options = config.riteOptions || eventFlow.casamento.riteOptions;
    riteOptions.innerHTML = options.map(([value, label]) => `
      <button data-answer="rite" data-value="${value}">${label}</button>
    `).join("");
  }

  const storyTitle = document.getElementById("story-question-title");
  if (storyTitle) storyTitle.textContent = config.storyTitle || "Quais músicas ou estilos você gostaria de indicar?";
  const storyInput = document.getElementById("story-song");
  if (storyInput) {
    storyInput.placeholder = state.eventKind === "casamento"
      ? "Ex.: música do casal, da família ou de um momento especial..."
      : "Ex.: músicas desejadas, artistas, referências ou restrições...";
  }
  const storyButton = document.getElementById("fit-story-song");
  if (storyButton) storyButton.textContent = state.eventKind === "casamento" ? "Encaixar no roteiro" : "Salvar indicação";

  const spotifyTitle = document.getElementById("spotify-title");
  const spotifyCopy = document.getElementById("spotify-copy");
  if (spotifyTitle) {
    spotifyTitle.textContent = state.eventKind === "casamento"
      ? "Traga o Spotify. O MAESTTRO sugere onde cada música cabe melhor."
      : "Traga referências musicais para orientar a proposta.";
  }
  if (spotifyCopy) {
    spotifyCopy.textContent = state.eventKind === "casamento"
      ? "Cole um link de playlist ou escreva algumas músicas. A lógica do protótipo simula a curadoria por energia, letra, função emocional e momento da cerimônia."
      : "Cole um link de playlist ou escreva músicas desejadas. Para esta categoria, elas entram como briefing de repertório para o admin montar a proposta.";
  }

  const momentTitle = document.getElementById("event-moment-title");
  if (momentTitle) momentTitle.textContent = config.momentTitle || "Em quais momentos teremos música?";

  const momentOptions = document.getElementById("event-moment-options");
  if (momentOptions) {
    momentOptions.innerHTML = (config.momentOptions || []).map(([value, label]) => `
      <button data-answer="eventMoment" data-value="${value}">${label}</button>
    `).join("");
  }

  const durationTitle = document.getElementById("duration-question-title");
  if (durationTitle) durationTitle.textContent = config.durationTitle || "Qual será a duração?";

  const durationOptions = document.getElementById("duration-options");
  if (durationOptions) {
    durationOptions.innerHTML = (config.durationOptions || []).map(([value, label]) => `
      <button data-answer="durationMinutes" data-value="${value}">${label}</button>
    `).join("");
  }

  document.querySelectorAll("[data-answer]").forEach((button) => {
    button.classList.toggle("active", String(state[button.dataset.answer]) === button.dataset.value);
  });
}

function bindQuestions() {
  const grid = document.querySelector(".question-grid");
  if (!grid) return;
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-answer]");
    if (!button) return;
    const key = button.dataset.answer;
    state[key] = button.dataset.value;
    if (key === "eventKind") setEventDefaults(state.eventKind);
    renderQuestionFlow();
    renderRecommendation();
  });
  setEventDefaults(state.eventKind);
  renderQuestionFlow();
}

function renderSpotify() {
  const result = document.getElementById("spotify-result");
  if (!result) return;

  const activeSongs = baseMoments.filter((s) => s.active !== false);

  let html = "";
  
  if (state.lastSpotifySongs && state.lastSpotifySongs.length > 0) {
    const moments = ["Entrada do noivo", "Cumprimentos", "Saída dos noivos", "Pré-cerimônia", "Entrada dos padrinhos"];
    if (state.lastSpotifyLink) {
      html += `<div class="spotify-fit" style="margin-bottom:12px;"><div><strong>Playlist recebida</strong><span>Link: ${state.lastSpotifyLink}</span></div><em>Spotify</em></div>`;
    }
    state.lastSpotifySongs.forEach((song, index) => {
      const matching = activeSongs.find(s => s.title.toLowerCase().includes(song.toLowerCase()) || song.toLowerCase().includes(s.title.toLowerCase()));
      html += `
        <div class="spotify-fit" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${song}</strong>
            <span>Melhor encaixe sugerido: ${moments[index % moments.length]}</span>
          </div>
          <div style="display:flex; gap:8px;">
            ${matching ? `<button class="primary" data-spotify-play="${matching.id || matching.title}" style="padding:6px 12px; font-size:12px;">▶ Ouvir 🎵</button>` : `<button class="primary" data-spotify-play-synth="${song}" style="padding:6px 12px; font-size:12px;">▶ Ouvir 🎵</button>`}
            <button data-use-song="${song}">Usar no roteiro</button>
          </div>
        </div>
      `;
    });
  }

  if (activeSongs.length > 0) {
    html += `
      <div style="margin-top:16px; border-top:1px solid rgba(212,175,55,0.25); padding-top:14px;">
        <span style="font-size:12px; color:var(--gold, #d4af37); text-transform:uppercase; font-weight:700; letter-spacing:0.5px; display:block; margin-bottom:10px;">
          🎧 Músicas do Catálogo & Cadastradas pelo Admin (Disponíveis para Execução)
        </span>
        <div style="display:flex; flex-direction:column; gap:8px; max-height:320px; overflow-y:auto; padding-right:4px;">
    `;
    activeSongs.forEach((song) => {
      const cleanCopy = (song.copy || "").replace(/\s*\(Arquivo:[^)]+\)/gi, "");
      html += `
        <div class="spotify-fit" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; margin-bottom:4px;">
          <div style="flex:1; padding-right:10px;">
            <strong style="color:white; font-size:14px; display:block;">${song.title}</strong>
            <span style="font-size:12px; color:#bbb;">${song.artist || "A definir"} • Encaixe: <b style="color:var(--gold, #d4af37);">${song.moment || "Cerimônia"}</b></span>
            ${cleanCopy ? `<p style="font-size:11px; color:#888; margin:2px 0 0 0;">${cleanCopy}</p>` : ""}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button data-spotify-play="${song.id || song.title}" style="background:var(--gold, #d4af37); color:#121212; border:none; padding:7px 14px; border-radius:6px; font-weight:700; cursor:pointer; font-size:12px;">▶ Ouvir 🎵</button>
            <button data-use-song="${song.title}" style="background:rgba(255,255,255,0.12); color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:600; cursor:pointer; font-size:12px;">Usar</button>
          </div>
        </div>
      `;
    });
    html += `
        </div>
      </div>
    `;
  }

  result.innerHTML = html;

  document.querySelectorAll("[data-spotify-play]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.spotifyPlay;
      const song = baseMoments.find((s) => (s.id || s.title) === target || s.title === target);
      if (song) {
        openAudioModal(song);
      }
    });
  });

  document.querySelectorAll("[data-spotify-play-synth]").forEach((button) => {
    button.addEventListener("click", () => {
      const songTitle = button.dataset.spotifyPlaySynth;
      openAudioModal({
        id: `synth-${Date.now()}`,
        title: songTitle,
        artist: "Música da Playlist",
        moment: "Sugerido para Cerimônia",
        copy: "Demonstração de execução da música.",
        image: "./assets/music-details.png",
        audioUrl: "",
        notes: [440, 523.25, 659.25, 587.33, 523.25]
      });
    });
  });

  document.querySelectorAll("[data-use-song]").forEach((button) => {
    button.addEventListener("click", () => {
      state.storySong = button.dataset.useSong;
      renderRecommendation();
      document.getElementById("set")?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function bindSpotify() {
  document.getElementById("fit-story-song")?.addEventListener("click", () => {
    const value = document.getElementById("story-song")?.value.trim() || "";
    if (!value) return;
    state.storySong = value;
    renderRecommendation();
    document.getElementById("set")?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("analyze-spotify")?.addEventListener("click", () => {
    const raw = document.getElementById("spotify-songs")?.value.trim() || "";
    const link = document.getElementById("spotify-link")?.value.trim() || "";
    const songs = raw ? raw.split("\n").map((line) => line.trim()).filter(Boolean) : ["A Thousand Years - Christina Perri", "Perfect - Ed Sheeran", "Viva La Vida - Coldplay"];
    
    state.lastSpotifySongs = songs;
    state.lastSpotifyLink = link;

    renderSpotify();
  });

  renderSpotify();
}

function bindTravelControls() {
  ["travel-zip", "round-trip", "complete-sound"].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("input", () => {
      if (id === "complete-sound") state.completeSound = element.checked;
      calculateTravel();
    });
    element.addEventListener("change", () => {
      if (id === "complete-sound") state.completeSound = element.checked;
      calculateTravel();
    });
  });
  document.getElementById("calculate-travel")?.addEventListener("click", calculateTravel);
}

function bindAdminControls() {
  document.getElementById("admin-midi-file")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      state.midiFileName = "";
      state.musicFileObjectUrl = "";
      state.musicFileDataUrl = "";
      return;
    }
    state.midiFileName = file.name;
    state.musicFileObjectUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      state.musicFileDataUrl = reader.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("paste-song-url-btn")?.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const input = document.getElementById("admin-song-url");
        if (input) input.value = text.trim();
      }
    } catch (e) {
      alert("Para colar o link copiado, clique no campo e pressione Ctrl+V (ou segure o dedo e toque em Colar no celular).");
    }
  });

  document.getElementById("paste-video-url-btn")?.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const input = document.getElementById("admin-video-url");
        if (input) input.value = text.trim();
      }
    } catch (e) {
      alert("Para colar o link copiado, clique no campo e pressione Ctrl+V (ou segure o dedo e toque em Colar no celular).");
    }
  });

  document.getElementById("add-admin-song")?.addEventListener("click", async () => {
    const titleInput = document.getElementById("admin-song-title");
    const artistInput = document.getElementById("admin-song-artist");
    const momentInput = document.getElementById("admin-song-moment");
    const urlInput = document.getElementById("admin-song-url");
    const midiInput = document.getElementById("admin-midi-file");

    const title = titleInput ? titleInput.value.trim() : "";
    const artist = (artistInput ? artistInput.value.trim() : "") || "A definir";
    const moment = momentInput ? momentInput.value : "Entrada dos padrinhos";
    const explicitUrl = urlInput ? urlInput.value.trim() : "";

    if (!title) {
      alert("Por favor, preencha o Nome da música.");
      return;
    }

    const file = midiInput?.files?.[0];
    if (file && !state.musicFileDataUrl) {
      state.musicFileDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });
    }

    let audioUrl = explicitUrl ? formatAudioMediaUrl(explicitUrl) : "";

    if (!audioUrl && file) {
      if (typeof dbUploadMedia === "function") {
        const uploadedUrl = await dbUploadMedia(file, "songs");
        if (uploadedUrl) {
          audioUrl = uploadedUrl;
        } else {
          audioUrl = state.musicFileDataUrl || "";
        }
      } else {
        audioUrl = state.musicFileDataUrl || "";
      }
    }

    if (!audioUrl) {
      audioUrl = state.musicFileDataUrl || "";
    }

    const songPayload = {
      id: `admin-${Date.now()}`,
      moment,
      title,
      artist,
      copy: "Música adicionada pelo admin. Pode ser encaixada na curadoria do evento.",
      image: "./assets/music-details.png",
      audioUrl: audioUrl,
      tags: ["Admin", "Áudio", "Personalizada"],
      notes: [440, 523.25, 659.25, 587.33, 523.25],
      active: true
    };

    baseMoments.push(songPayload);
    await persistSongs();

    if (typeof dbUpsertSong === "function") {
      const saved = await dbUpsertSong(songPayload);
      if (saved) {
        if (saved.id) songPayload.id = saved.id;
        if (saved.audio_url || saved.midi_url) songPayload.audioUrl = saved.audio_url || saved.midi_url;
        await persistSongs();
      }
    }

    if (typeof syncWithSupabase === "function") {
      await syncWithSupabase();
    }

    if (titleInput) titleInput.value = "";
    if (artistInput) artistInput.value = "";
    if (urlInput) urlInput.value = "";
    if (midiInput) midiInput.value = "";
    state.midiFileName = "";
    state.musicFileObjectUrl = "";
    state.musicFileDataUrl = "";

    renderAdmin();
    renderPreviewVideos(songPayload.id);
    renderSpotify();
    renderChoices();
    renderRecommendation();
    alert(`Música "${title}" cadastrada com sucesso e sincronizada com o Supabase!`);
  });

  document.getElementById("add-admin-instrument")?.addEventListener("click", async () => {
    const nameInput = document.getElementById("admin-instrument-name");
    const priceInput = document.getElementById("admin-instrument-price");
    const catSelect = document.getElementById("admin-instrument-category");

    const name = nameInput ? nameInput.value.trim() : "";
    const price = priceInput ? Number(priceInput.value || 0) : 0;
    const category = catSelect && catSelect.value ? catSelect.value : "Personalizado";

    if (!name) {
      alert("Por favor, preencha o nome do instrumento.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      alert("Por favor, informe um valor base válido para o instrumento (ex.: 800).");
      return;
    }

    const instPayload = {
      id: `inst-${Date.now()}`,
      name,
      category,
      price,
      heavy: /violoncelo|contrabaixo|som completo|estrutura/i.test(name),
      active: true
    };

    instruments.push(instPayload);

    if (typeof dbUpsertInstrument === "function") {
      const saved = await dbUpsertInstrument(instPayload);
      if (saved) {
        alert(`Instrumento "${name}" cadastrado e salvo no Supabase com sucesso!`);
      } else {
        alert(`Instrumento "${name}" adicionado localmente. Houve uma falha ao comunicar com o Supabase.`);
      }
    } else {
      alert(`Instrumento "${name}" adicionado localmente.`);
    }

    if (nameInput) nameInput.value = "";
    if (priceInput) priceInput.value = "";

    renderAdmin();
    renderTransportInstruments();
    calculateTravel();
  });

  document.getElementById("add-admin-category")?.addEventListener("click", async () => {
    const catInput = document.getElementById("admin-category-name");
    const name = catInput ? catInput.value.trim() : "";
    if (!name) {
      alert("Por favor, digite o nome da categoria.");
      return;
    }
    if (state.categories.includes(name)) {
      alert("Esta categoria já existe.");
      return;
    }
    state.categories.push(name);
    if (typeof dbCreateCategory === "function") {
      const ok = await dbCreateCategory(name);
      if (ok) {
        alert(`Categoria "${name}" criada e salva no Supabase com sucesso!`);
      } else {
        alert(`Categoria "${name}" criada localmente.`);
      }
    }
    if (catInput) catInput.value = "";
    renderAdmin();
  });

  document.getElementById("admin-image-file")?.addEventListener("change", (event) => {
    readImageFile(event.target.files?.[0], (dataUrl) => {
      state.imageUploadDataUrl = dataUrl;
    });
  });

  document.getElementById("save-home-image")?.addEventListener("click", () => {
    const slot = document.getElementById("admin-image-slot").value;
    const url = document.getElementById("admin-image-url").value.trim();
    const image = url || state.imageUploadDataUrl;
    if (!slot || !image) return;
    if (slot === "heroImage") {
      homeContent.heroImage = image;
    } else if (slot === "previewBackground") {
      homeContent.previewBackground = image;
    } else {
      homeContent.categoryImages[slot] = image;
    }
    state.imageUploadDataUrl = "";
    document.getElementById("admin-image-url").value = "";
    document.getElementById("admin-image-file").value = "";
    persistVisualContent();
    applyHomeContent();
    renderVisualAdmin();
  });

  document.getElementById("admin-card-image-file")?.addEventListener("change", (event) => {
    readImageFile(event.target.files?.[0], (dataUrl) => {
      state.cardUploadDataUrl = dataUrl;
      const imgInput = document.getElementById("admin-card-image");
      if (imgInput) imgInput.value = "";
    });
  });

  document.getElementById("save-home-card")?.addEventListener("click", () => {
    const title = document.getElementById("admin-card-title").value.trim();
    const tag = document.getElementById("admin-card-tag").value.trim() || "Inspiração";
    const copy = document.getElementById("admin-card-copy").value.trim() || "Experiência musical personalizada pelo MAESTTRO.";
    const image = state.cardUploadDataUrl || document.getElementById("admin-card-image").value.trim() || "./assets/celebration-light.png";
    if (!title) return;
    const payload = { title, tag, copy, image };
    if (state.homeCardEditIndex === null) {
      serviceCards.push(payload);
    } else {
      serviceCards[state.homeCardEditIndex] = payload;
    }
    persistVisualContent();
    if (typeof dbUpsertServiceCard === "function") {
      dbUpsertServiceCard(payload);
    }
    renderServiceRail();
    resetHomeCardForm();
    renderVisualAdmin();
  });

  document.getElementById("cancel-home-card-edit")?.addEventListener("click", resetHomeCardForm);

  document.getElementById("add-blocked-date")?.addEventListener("click", () => {
    const dateInput = document.getElementById("admin-block-date");
    const reasonInput = document.getElementById("admin-block-reason");
    const date = dateInput?.value || "";
    const reason = reasonInput?.value.trim() || "evento já contratado";
    if (!date) return;
    const existing = state.blockedDates.find((item) => item.date === date);
    if (existing) {
      existing.reason = reason;
    } else {
      state.blockedDates.push({ date, reason });
    }
    if (dateInput) dateInput.value = "";
    if (reasonInput) reasonInput.value = "";
    persistBlockedDates();
    if (typeof dbUpsertBlockedDate === "function") {
      dbUpsertBlockedDate(date, reason);
    }
    renderBlockedDates();
  });

  document.getElementById("admin-video-file")?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    state.videoFileName = file?.name || "";
    state.videoObjectUrl = file ? URL.createObjectURL(file) : "";
  });

  document.getElementById("admin-video-thumb-file")?.addEventListener("change", (event) => {
    readImageFile(event.target.files?.[0], (dataUrl) => {
      state.videoThumbDataUrl = dataUrl;
      const imageInput = document.getElementById("admin-video-image");
      if (imageInput) imageInput.value = "";
    });
  });

  document.getElementById("add-admin-video")?.addEventListener("click", async () => {
    const title = document.getElementById("admin-video-title").value.trim();
    const formation = document.getElementById("admin-video-formation").value.trim() || "Formação personalizada";
    const music = document.getElementById("admin-video-music").value.trim() || state.videoFileName || "Prévia musical";
    const explicitVideoUrl = document.getElementById("admin-video-url").value.trim();
    const imageUrl = document.getElementById("admin-video-image").value.trim();
    const description = document.getElementById("admin-video-description").value.trim();
    if (!title) {
      alert("Por favor, informe o título do vídeo.");
      return;
    }

    const videoFileInput = document.getElementById("admin-video-file");
    const videoFile = videoFileInput?.files?.[0];

    let videoUrl = explicitVideoUrl;

    if (!videoUrl && videoFile && typeof dbUploadMedia === "function") {
      const uploaded = await dbUploadMedia(videoFile, "videos");
      if (uploaded) {
        videoUrl = uploaded;
      }
    }

    const existing = previewVideos.find((item) => item.id === state.videoEditId);
    const payload = {
      id: existing?.id || `video-${Date.now()}`,
      title,
      formation,
      music,
      videoUrl: videoUrl || state.videoObjectUrl || existing?.videoUrl || "",
      image: state.videoThumbDataUrl || imageUrl || existing?.image || "./assets/celebration-light.png",
      description: description || `Prévia cadastrada pelo admin${state.videoFileName ? `: ${state.videoFileName}` : ""}.`,
      active: existing ? existing.active : true
    };
    if (existing) {
      Object.assign(existing, payload);
    } else {
      previewVideos.push(payload);
    }
    persistVisualContent();
    if (typeof dbUpsertPreviewVideo === "function") {
      await dbUpsertPreviewVideo(payload);
    }
    renderPreviewVideos(payload.id);
    resetVideoForm();
    renderAdmin();
  });

  document.getElementById("cancel-video-edit")?.addEventListener("click", resetVideoForm);
}

function openMoment(id) {
  const item = curatedMoments().find((moment) => moment.id === id);
  document.getElementById("dialog-image").src = item.image;
  document.getElementById("dialog-moment").textContent = item.moment;
  document.getElementById("dialog-title").textContent = item.title;
  document.getElementById("dialog-copy").textContent = item.copy;
  document.getElementById("dialog-tags").innerHTML = item.tags.map((tag) => `<span>${tag}</span>`).join("");
  document.getElementById("dialog-play").onclick = () => playNotes(item.notes);
  document.getElementById("moment-dialog").showModal();
}

function playMoment(id) {
  const item = curatedMoments().find((moment) => moment.id === id);
  playNotes(item.notes);
}

function playNotes(notes) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const now = context.currentTime + 0.04;
  notes.forEach((frequency, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = index % 2 ? "triangle" : "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.16, now + index * 0.18 + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.18 + 0.16);
    osc.connect(gain).connect(context.destination);
    osc.start(now + index * 0.18);
    osc.stop(now + index * 0.18 + 0.18);
  });
}

function updatePrice() {
  const totalPrice = document.getElementById("total-price");
  if (totalPrice) totalPrice.textContent = money.format(estimatedTotalValue());
}

document.getElementById("close-dialog")?.addEventListener("click", () => {
  document.getElementById("moment-dialog").close();
});

document.querySelector("[data-scroll-set]")?.addEventListener("click", () => {
  document.getElementById("set")?.scrollIntoView({ behavior: "smooth" });
});

// Função para sincronizar dados locais com o Supabase de forma transparente
async function syncWithSupabase() {
  if (typeof dbLoadPublicContent !== "function") return;
  const data = await dbLoadPublicContent();
  if (!data) return;

  console.log("MAESTTRO: Sincronizando dados obtidos do Supabase...", data);

  // 1. Home Content
  if (data.homeContent) {
    Object.assign(homeContent, data.homeContent);
    applyHomeContent();
  }

  // 2. Service Cards
  if (data.serviceCards) {
    serviceCards.length = 0;
    serviceCards.push(...data.serviceCards);
    renderServiceRail();
  }

  // 3. Preview Videos
  if (data.previewVideos) {
    previewVideos.length = 0;
    previewVideos.push(...data.previewVideos);
    renderPreviewVideos();
  }

  // 4. Instrument Categories
  if (data.categories) {
    const catSet = new Set(state.categories);
    data.categories.forEach((c) => catSet.add(c));
    state.categories.length = 0;
    state.categories.push(...Array.from(catSet));
  }

  // 5. Instruments
  if (data.instruments) {
    const remoteInstNames = new Set(data.instruments.map((i) => (i.name || "").toLowerCase().trim()));

    // Auto-sincroniza no Supabase qualquer instrumento cadastrado localmente que ainda não esteja no banco
    if (typeof dbUpsertInstrument === "function") {
      for (const localInst of instruments) {
        if (localInst.name && !remoteInstNames.has(localInst.name.toLowerCase().trim())) {
          console.log(`MAESTTRO: Auto-sincronizando instrumento local "${localInst.name}" para o Supabase...`);
          const saved = await dbUpsertInstrument(localInst);
          if (saved) {
            remoteInstNames.add(localInst.name.toLowerCase().trim());
            if (saved.id) localInst.id = saved.id;
          }
        }
      }
    }

    const instMap = new Map();
    instruments.forEach((inst) => {
      if (inst.name) {
        instMap.set(inst.name.toLowerCase().trim(), inst);
      }
    });
    data.instruments.forEach((i) => {
      if (i.name) {
        const key = i.name.toLowerCase().trim();
        const existing = instMap.get(key) || {};
        instMap.set(key, { ...existing, ...i });
      }
    });
    instruments.length = 0;
    instruments.push(...Array.from(instMap.values()));
    renderTransportInstruments();
  }

  // 6. Blocked Dates
  if (data.blockedDates) {
    state.blockedDates.length = 0;
    state.blockedDates.push(...data.blockedDates);
    renderBlockedDates();
  }

  // 7. Songs
  if (data.songs) {
    const remoteTitles = new Set(data.songs.map((s) => (s.title || "").toLowerCase().trim()));

    // Auto-sincroniza no Supabase qualquer música cadastrada localmente pelo Admin que ainda não esteja no banco
    if (typeof dbUpsertSong === "function") {
      for (const localSong of baseMoments) {
        if (localSong.title && !remoteTitles.has(localSong.title.toLowerCase().trim())) {
          console.log(`MAESTTRO: Auto-sincronizando música local "${localSong.title}" para o Supabase...`);
          const saved = await dbUpsertSong(localSong);
          if (saved) {
            remoteTitles.add(localSong.title.toLowerCase().trim());
            if (saved.id) localSong.id = saved.id;
            if (saved.audio_url || saved.midi_url) localSong.audioUrl = saved.audio_url || saved.midi_url;
          }
        }
      }
    }

    const songMap = new Map();
    baseMoments.forEach((song) => {
      if (song.title) {
        const key = song.title.toLowerCase().trim();
        songMap.set(key, song);
      }
    });
    data.songs.forEach((s) => {
      if (s.title) {
        const key = s.title.toLowerCase().trim();
        const existing = songMap.get(key) || {};
        const validAudio = (s.audioUrl && !s.audioUrl.startsWith("blob:") && !s.audioUrl.startsWith("indexeddb:")) ? s.audioUrl : (existing.audioUrl || s.audioUrl || "");
        songMap.set(key, {
          ...existing,
          ...s,
          copy: (s.copy || "").replace(/\s*\(Arquivo:[^)]+\)/gi, ""),
          audioUrl: validAudio
        });
      }
    });
    baseMoments.length = 0;
    baseMoments.push(...Array.from(songMap.values()));
    await restoreLocalAudios();
    await persistSongs();
  } else {
    await restoreLocalAudios();
  }

  renderPreviewVideos();
  renderSpotify();
  renderAdmin();
  calculateTravel();
  renderRecommendation();
}

async function initApp() {
  await restoreLocalAudios();
  bindQuestions();
  bindLeadForm();
  bindSpotify();
  bindTravelControls();
  bindAdminControls();
  applyHomeContent();
  renderServiceRail();
  renderPreviewVideos();
  renderSpotify();
  renderTransportInstruments();
  renderAdmin();
  calculateTravel();
  renderRecommendation();

  if (typeof syncWithSupabase === "function") {
    syncWithSupabase();
  }

  // Sincronização periódica em segundo plano a cada 15 segundos (para múltiplos dispositivos)
  setInterval(() => {
    if (typeof syncWithSupabase === "function") {
      syncWithSupabase();
    }
  }, 15000);

  // Sincroniza imediatamente ao focar ou alternar abas no celular/desktop
  window.addEventListener("focus", () => {
    if (typeof syncWithSupabase === "function") {
      syncWithSupabase();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && typeof syncWithSupabase === "function") {
      syncWithSupabase();
    }
  });

  // Supabase Realtime: Atualização instantânea ao detectar mudanças nas tabelas do Supabase
  if (typeof getSupabaseClient === "function") {
    try {
      const activeClient = getSupabaseClient();
      if (activeClient && typeof activeClient.channel === "function") {
        activeClient.channel("maesttro-realtime-global")
          .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
            console.log("MAESTTRO Realtime: Alteração detectada no Supabase em tabela:", payload.table);
            if (typeof syncWithSupabase === "function") syncWithSupabase();
          })
          .subscribe();
      }
    } catch (e) {
      console.warn("MAESTTRO: Não foi possível registrar escutador Realtime do Supabase:", e);
    }
  }
}

initApp();

/* ==========================================================================
   MAESTTRO EXTRAS: ANALYTICS, USER MANAGEMENT & BACKUP SYSTEM
   ========================================================================== */

// 1. ANALYTICS ENGINE
function getAnalytics() {
  let analytics = localStorage.getItem("maesttro_analytics");
  const fallback = {
    visits: 0,
    lifetimeVisits: 0,
    zeroCountStartedAt: null,
    simulations: 0,
    whatsapp: 0,
    contracts: 0,
    contractsStarted: 0,
    videos: (typeof previewVideos !== "undefined" ? previewVideos.length : 3),
    songs: (typeof baseMoments !== "undefined" && typeof instruments !== "undefined" ? baseMoments.length + instruments.length : 34),
    avgTime: "0m 00s"
  };
  if (!analytics) {
    analytics = fallback;
    localStorage.setItem("maesttro_analytics", JSON.stringify(analytics));
  } else {
    try {
      analytics = JSON.parse(analytics);
    } catch (e) {
      analytics = fallback;
    }
  }
  return analytics;
}

function incrementAnalytics(key) {
  const an = getAnalytics();
  // Só contabiliza se o administrador tiver iniciado a contagem
  if (!an.zeroCountStartedAt) {
    return;
  }
  an[key] = (an[key] || 0) + 1;
  if (key === "visits") {
    an.lifetimeVisits = (an.lifetimeVisits || 0) + 1;
  }
  localStorage.setItem("maesttro_analytics", JSON.stringify(an));
  renderAnalyticsDashboard();
  triggerAutoBackup();
}

function getLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFilteredAnalytics() {
  const base = getAnalytics();
  
  if (!base.zeroCountStartedAt) {
    return {
      visits: 0,
      simulations: 0,
      whatsapp: 0,
      contracts: 0,
      contractsStarted: 0,
      videos: base.videos || (typeof previewVideos !== "undefined" ? previewVideos.length : 3),
      songs: base.songs || (typeof baseMoments !== "undefined" && typeof instruments !== "undefined" ? baseMoments.length + instruments.length : 34),
      avgTime: "0m 00s"
    };
  }
  
  const startEl = document.getElementById("input-filter-start");
  const endEl = document.getElementById("input-filter-end");
  
  if (!startEl || !endEl || !startEl.value || !endEl.value) {
    return base;
  }
  
  const startDate = new Date(startEl.value + "T00:00:00");
  const endDate = new Date(endEl.value + "T23:59:59");
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return base;
  }
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
  
  // Base is 7 days (the standard metrics represent a 7-day period)
  const ratio = diffDays / 7;
  
  const visits = Math.round(base.visits * ratio);
  const simulations = Math.round(base.simulations * ratio);
  const whatsapp = Math.round(base.whatsapp * ratio);
  const contracts = Math.round(base.contracts * ratio);
  const contractsStarted = Math.round(base.contractsStarted * ratio);
  
  return {
    visits,
    simulations,
    whatsapp,
    contracts,
    contractsStarted,
    videos: base.videos || (typeof previewVideos !== "undefined" ? previewVideos.length : 3),
    songs: base.songs || (typeof baseMoments !== "undefined" && typeof instruments !== "undefined" ? baseMoments.length + instruments.length : 34),
    avgTime: base.avgTime || "0m 00s"
  };
}

function renderAnalyticsDashboard() {
  const base = getAnalytics();
  const an = getFilteredAnalytics();
  const active = !!base.zeroCountStartedAt;

  const els = {
    lifetimeVisits: document.getElementById("analytics-lifetime-visits"),
    zeroStartedInfo: document.getElementById("analytics-zero-started-info"),
    toggleBtn: document.getElementById("btn-toggle-lifetime-counter"),
    visits: document.getElementById("analytics-visits"),
    simulations: document.getElementById("analytics-simulations"),
    whatsapp: document.getElementById("analytics-whatsapp"),
    contractsStarted: document.getElementById("analytics-contracts-started"),
    contracts: document.getElementById("analytics-contracts"),
    songs: document.getElementById("analytics-songs"),
    videos: document.getElementById("analytics-videos"),
    avgTime: document.getElementById("analytics-avg-time"),
    
    // Funnel elements
    funnelVisits: document.getElementById("funnel-visits"),
    funnelWhatsapp: document.getElementById("funnel-whatsapp"),
    funnelContractsNum: document.getElementById("funnel-contracts-num"),
    funnelRatio1: document.getElementById("funnel-ratio-1"),
    funnelRatio2: document.getElementById("funnel-ratio-2"),
    funnelPercent: document.getElementById("funnel-percent"),
  };

  if (els.lifetimeVisits) els.lifetimeVisits.textContent = Number(active ? (base.lifetimeVisits || 0) : 0).toLocaleString("pt-BR");
  if (els.zeroStartedInfo) {
    if (active) {
      els.zeroStartedInfo.textContent = `🟢 Contagem ativa desde: ${base.zeroCountStartedAt}`;
      els.zeroStartedInfo.style.color = "#4ade80";
    } else {
      els.zeroStartedInfo.textContent = `⏹️ Contagem zerada e pausada (Aguardando admin iniciar)`;
      els.zeroStartedInfo.style.color = "#f87171";
    }
  }

  if (els.toggleBtn) {
    if (active) {
      els.toggleBtn.innerHTML = `⏸️ Pausar / Zerar Contagens`;
      els.toggleBtn.style.background = "#e11d48";
      els.toggleBtn.style.color = "#ffffff";
    } else {
      els.toggleBtn.innerHTML = `▶️ Iniciar Contagem`;
      els.toggleBtn.style.background = "#d4af37";
      els.toggleBtn.style.color = "#121413";
    }
  }

  if (els.visits) els.visits.textContent = Number(active ? an.visits : 0).toLocaleString("pt-BR");
  if (els.simulations) els.simulations.textContent = Number(active ? an.simulations : 0).toLocaleString("pt-BR");
  if (els.whatsapp) els.whatsapp.textContent = Number(active ? an.whatsapp : 0).toLocaleString("pt-BR");
  if (els.contractsStarted) els.contractsStarted.textContent = Number(active ? an.contractsStarted : 0).toLocaleString("pt-BR");
  if (els.contracts) els.contracts.textContent = Number(active ? an.contracts : 0).toLocaleString("pt-BR");
  if (els.songs) els.songs.textContent = (typeof baseMoments !== "undefined" && typeof instruments !== "undefined") ? baseMoments.length + instruments.length : 34;
  if (els.videos) els.videos.textContent = (typeof previewVideos !== "undefined") ? previewVideos.length : 3;
  if (els.avgTime) els.avgTime.textContent = active ? (an.avgTime || "0m 00s") : "0m 00s";

  // Funnel display
  if (els.funnelVisits) els.funnelVisits.textContent = Number(active ? an.visits : 0).toLocaleString("pt-BR");
  if (els.funnelWhatsapp) els.funnelWhatsapp.textContent = Number(active ? an.simulations : 0).toLocaleString("pt-BR");
  if (els.funnelContractsNum) els.funnelContractsNum.textContent = Number(active ? an.contracts : 0).toLocaleString("pt-BR");

  const ratio1 = (active && an.visits > 0) ? ((an.simulations / an.visits) * 100).toFixed(1) : "0.0";
  const ratio2 = (active && an.simulations > 0) ? ((an.contracts / an.simulations) * 100).toFixed(1) : "0.0";
  const overallRatio = (active && an.visits > 0) ? ((an.contracts / an.visits) * 100).toFixed(2) : "0.00";

  if (els.funnelRatio1) els.funnelRatio1.textContent = `${ratio1}% conv.`;
  if (els.funnelRatio2) els.funnelRatio2.textContent = `${ratio2}% conv.`;
  if (els.funnelPercent) els.funnelPercent.textContent = `${ratio1}%`;
  
  const totalRatioEl = document.getElementById("funnel-total-ratio");
  if (totalRatioEl) totalRatioEl.textContent = `${overallRatio}%`;

  // Call Chart.js sync function if defined
  if (typeof window.renderAnalyticsCharts === "function") {
    window.renderAnalyticsCharts();
  }
}


// 2. USER MANAGEMENT ENGINE
function getCustomUsers() {
  let users = localStorage.getItem("maesttro_users");
  if (!users) {
    users = [
      { username: "CEO", password: "Cb@210691", permission: "Admin" },
      { username: "nilton", password: "123", permission: "Editor" },
      { username: "visitante", password: "123", permission: "Visualizador" }
    ];
    localStorage.setItem("maesttro_users", JSON.stringify(users));
  } else {
    try {
      users = JSON.parse(users);
    } catch (e) {
      users = [
        { username: "CEO", password: "Cb@210691", permission: "Admin" }
      ];
    }
  }
  return users;
}

function saveCustomUsers(users) {
  localStorage.setItem("maesttro_users", JSON.stringify(users));
  renderUsersList();
  triggerAutoBackup();
}

function renderUsersList() {
  const listContainer = document.getElementById("admin-users-list");
  if (!listContainer) return;
  const users = getCustomUsers();
  
  if (!users.length) {
    listContainer.innerHTML = `<div class="empty-state">Nenhum usuário cadastrado.</div>`;
    return;
  }
  
  listContainer.innerHTML = users.map(user => `
    <div class="admin-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding: 10px 0;">
      <div>
        <strong>${user.username}</strong>
        <span style="font-size: 11px; margin-left: 8px; padding: 2px 6px; border-radius: 4px; background: rgba(130,148,162,0.15); color: var(--text); font-weight: 700;">
          ${user.permission === "Admin" ? "Administrador" : user.permission === "Editor" ? "Editor" : "Visualizador"}
        </span>
      </div>
      <div>
        ${user.username !== "CEO" ? `<button class="soft" style="padding: 4px 10px; font-size: 11px; border-radius: 6px; margin: 0;" onclick="deleteCustomUser('${user.username}')">Remover</button>` : `<span style="font-size: 11px; color: var(--muted); font-style: italic;">Sistema</span>`}
      </div>
    </div>
  `).join("");
}

window.deleteCustomUser = function(username) {
  let users = getCustomUsers();
  users = users.filter(u => u.username !== username);
  saveCustomUsers(users);
};

function bindUserManagement() {
  const btnAdd = document.getElementById("btn-add-user");
  if (!btnAdd) return;
  btnAdd.addEventListener("click", () => {
    const usernameInput = document.getElementById("new-user-username");
    const passwordInput = document.getElementById("new-user-password");
    const permissionInput = document.getElementById("new-user-permission");
    
    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const permission = permissionInput ? permissionInput.value : "Visualizador";
    
    if (!username || !password) {
      alert("Por favor, preencha o Usuário e Senha.");
      return;
    }
    
    const users = getCustomUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      alert("Este usuário já existe.");
      return;
    }
    
    users.push({ username, password, permission });
    saveCustomUsers(users);
    
    if (usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
    alert(`Usuário "${username}" cadastrado com sucesso com permissão "${permission}".`);
  });
}


// 3. INTEGRAL BACKUP ENGINE
function generateBackupPayload() {
  const backup = {
    timestamp: Date.now(),
    dateString: new Date().toLocaleString("pt-BR"),
    storage: {},
    instruments: instruments,
    categories: state.categories,
    baseMoments: baseMoments
  };
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("maesttro") || key === "maesttro_analytics" || key === "maesttro_users") {
      backup.storage[key] = localStorage.getItem(key);
    }
  }
  return backup;
}

function createBackup(type = "Manual") {
  const payload = generateBackupPayload();
  const backupItem = {
    id: `backup-${Date.now()}`,
    type: type,
    timestamp: payload.timestamp,
    dateString: payload.dateString,
    data: payload
  };
  
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("maesttro_backup_history") || "[]");
  } catch (e) {}
  
  history.unshift(backupItem);
  if (history.length > 15) history.pop();
  localStorage.setItem("maesttro_backup_history", JSON.stringify(history));
  renderBackupHistory();
  return backupItem;
}

function triggerAutoBackup() {
  console.log("MAESTTRO: Auto-saving backup...");
  createBackup("Automático");
}

function restoreBackupPayload(payload) {
  if (!payload || !payload.storage) {
    alert("Formato de backup inválido.");
    return false;
  }
  
  // Restore localstorage entries
  Object.entries(payload.storage).forEach(([key, val]) => {
    localStorage.setItem(key, val);
  });
  
  // Restore state parameters if present
  if (payload.instruments) {
    instruments.length = 0;
    instruments.push(...payload.instruments);
  }
  if (payload.categories) {
    state.categories.length = 0;
    state.categories.push(...payload.categories);
  }
  if (payload.baseMoments) {
    baseMoments.length = 0;
    baseMoments.push(...payload.baseMoments);
  }
  
  alert("Backup restaurado com sucesso! Recarregando configurações...");
  window.location.reload();
  return true;
}

window.restoreBackupFromHistory = function(backupId) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("maesttro_backup_history") || "[]");
  } catch (e) {}
  
  const item = history.find(b => b.id === backupId);
  if (!item) {
    alert("Backup não encontrado.");
    return;
  }
  
  if (confirm(`Deseja mesmo restaurar o backup de ${item.dateString}? Isto substituirá todas as configurações atuais do sistema.`)) {
    restoreBackupPayload(item.data);
  }
};

window.downloadBackupFromHistory = function(backupId) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("maesttro_backup_history") || "[]");
  } catch (e) {}
  
  const item = history.find(b => b.id === backupId);
  if (!item) return;
  
  const blob = new Blob([JSON.stringify(item.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `maesttro-backup-${item.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.deleteBackupFromHistory = function(backupId) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("maesttro_backup_history") || "[]");
  } catch (e) {}
  
  history = history.filter(b => b.id !== backupId);
  localStorage.setItem("maesttro_backup_history", JSON.stringify(history));
  renderBackupHistory();
};

function renderBackupHistory() {
  const listContainer = document.getElementById("backup-history-list");
  if (!listContainer) return;
  
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("maesttro_backup_history") || "[]");
  } catch (e) {}
  
  if (!history.length) {
    listContainer.innerHTML = `<div class="empty-state" style="color: var(--muted); font-size: 13px; font-style: italic; padding: 12px 0;">Nenhum backup encontrado no histórico.</div>`;
    return;
  }
  
  listContainer.innerHTML = history.map(item => `
    <div class="admin-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding: 10px 0;">
      <div>
        <strong>${item.dateString}</strong>
        <span style="font-size: 11px; margin-left: 8px; padding: 2px 6px; border-radius: 4px; background: ${item.type === "Automático" ? "rgba(130,148,162,0.15)" : "rgba(197, 160, 89, 0.15)"}; color: ${item.type === "Automático" ? "var(--text)" : "var(--gold)"}; font-weight: 700;">
          ${item.type}
        </span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="soft" style="padding: 4px 8px; font-size: 11px; border-radius: 6px; margin: 0; cursor: pointer;" onclick="restoreBackupFromHistory('${item.id}')">Restaurar</button>
        <button class="soft" style="padding: 4px 8px; font-size: 11px; border-radius: 6px; margin: 0; cursor: pointer;" onclick="downloadBackupFromHistory('${item.id}')">Download</button>
        <button class="soft" style="padding: 4px 8px; font-size: 11px; border-radius: 6px; margin: 0; color: var(--rose); cursor: pointer;" onclick="deleteBackupFromHistory('${item.id}')">Excluir</button>
      </div>
    </div>
  `).join("");
}

function bindBackupControls() {
  document.getElementById("btn-create-backup")?.addEventListener("click", () => {
    createBackup("Manual");
    alert("Backup manual gerado com sucesso!");
  });
  
  document.getElementById("import-backup-file")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target.result);
        restoreBackupPayload(payload);
      } catch (err) {
        alert("Erro ao decodificar o arquivo de backup. Certifique-se de que é um JSON válido do MAESTTRO.");
      }
    };
    reader.readAsText(file);
  });
}

function injectWhatsAppFloatingButton() {
  if (window.location.pathname.includes("admin.html")) return;
  const btn = document.createElement("a");
  btn.href = "https://wa.me/5511999999999";
  btn.target = "_blank";
  btn.id = "whatsapp-floating-btn";
  btn.style.position = "fixed";
  btn.style.bottom = "24px";
  btn.style.right = "24px";
  btn.style.width = "60px";
  btn.style.height = "60px";
  btn.style.backgroundColor = "#25d366";
  btn.style.borderRadius = "50%";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.justifyContent = "center";
  btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  btn.style.zIndex = "9999";
  btn.style.cursor = "pointer";
  btn.style.transition = "transform 0.2s ease";
  btn.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
  
  btn.addEventListener("click", () => {
    let an = getAnalytics();
    an.whatsapp = (an.whatsapp || 0) + 1;
    localStorage.setItem("maesttro_analytics", JSON.stringify(an));
    triggerAutoBackup();
  });

  // Hover styles
  btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.1)"; });
  btn.addEventListener("mouseleave", () => { btn.style.transform = "scale(1)"; });

  document.body.appendChild(btn);
}

// Track visits once per session
if (!sessionStorage.getItem("maesttro_visited")) {
  sessionStorage.setItem("maesttro_visited", "true");
  let an = getAnalytics();
  an.visits = (an.visits || 0) + 1;
  localStorage.setItem("maesttro_analytics", JSON.stringify(an));
  triggerAutoBackup();
}

// Increments simulation counter on Lead Form completion
document.getElementById("lead-form")?.addEventListener("submit", () => {
  let an = getAnalytics();
  an.simulations = (an.simulations || 0) + 1;
  localStorage.setItem("maesttro_analytics", JSON.stringify(an));
  triggerAutoBackup();
});

function bindAdminTabs() {
  const btnIndicadores = document.getElementById("tab-btn-indicadores");
  const btnConteudo = document.getElementById("tab-btn-conteudo");
  const panelIndicadores = document.getElementById("panel-indicadores");
  const adminGrid = document.querySelector(".admin-grid");

  if (!btnIndicadores || !btnConteudo || !panelIndicadores || !adminGrid) return;

  btnIndicadores.addEventListener("click", () => {
    btnIndicadores.classList.add("active");
    btnIndicadores.style.background = "var(--ink)";
    btnIndicadores.style.color = "white";
    btnIndicadores.style.border = "none";

    btnConteudo.classList.remove("active");
    btnConteudo.style.background = "white";
    btnConteudo.style.color = "var(--text)";
    btnConteudo.style.border = "1px solid var(--line)";

    panelIndicadores.style.display = "block";
    adminGrid.style.display = "none";

    if (typeof window.renderAnalyticsCharts === "function") {
      setTimeout(() => {
        window.renderAnalyticsCharts();
      }, 50);
    }
  });

  btnConteudo.addEventListener("click", () => {
    btnConteudo.classList.add("active");
    btnConteudo.style.background = "var(--ink)";
    btnConteudo.style.color = "white";
    btnConteudo.style.border = "none";

    btnIndicadores.classList.remove("active");
    btnIndicadores.style.background = "white";
    btnIndicadores.style.color = "var(--text)";
    btnIndicadores.style.border = "1px solid var(--line)";

    panelIndicadores.style.display = "none";
    adminGrid.style.display = "grid";
  });

  // Start on Indicadores tab
  panelIndicadores.style.display = "block";
  adminGrid.style.display = "none";
}

function bindAnalyticsControls() {
  const startInput = document.getElementById("input-filter-start");
  const endInput = document.getElementById("input-filter-end");

  // Define padrão das datas: "até" = data atual, "start" = 7 dias atrás
  if (startInput && endInput) {
    const today = new Date();
    const start7 = new Date();
    start7.setDate(today.getDate() - 6);

    endInput.value = getLocalDateStr(today);
    startInput.value = getLocalDateStr(start7);
  }

  // Handler para Iniciar / Pausar contagens
  const handleStartOrToggleCounter = () => {
    let session = {};
    try {
      session = JSON.parse(localStorage.getItem("maesttro-admin-session")) || {};
    } catch(e) {}
    
    if (session.permission === "Visualizador") {
      alert("Apenas administradores ou editores podem alterar as contagens de estatísticas.");
      return;
    }

    const base = getAnalytics();
    if (!base.zeroCountStartedAt) {
      // Iniciar contagem a partir do zero
      const nowStr = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      const startedStats = {
        visits: 0,
        lifetimeVisits: 0,
        zeroCountStartedAt: nowStr,
        simulations: 0,
        whatsapp: 0,
        contracts: 0,
        contractsStarted: 0,
        videos: (typeof previewVideos !== "undefined" ? previewVideos.length : 3),
        songs: (typeof baseMoments !== "undefined" && typeof instruments !== "undefined" ? baseMoments.length + instruments.length : 34),
        avgTime: "0m 00s"
      };
      localStorage.setItem("maesttro_analytics", JSON.stringify(startedStats));
      
      renderAnalyticsDashboard();
      if (typeof window.renderAnalyticsCharts === "function") {
        window.renderAnalyticsCharts();
      }
      if (typeof triggerAutoBackup === "function") {
        triggerAutoBackup();
      }
      alert(`Todas as contagens e indicadores foram iniciados do zero com sucesso!\nData de início: ${nowStr}`);
    } else {
      // Pausar e zerar contagem
      if (confirm("Deseja realmente zerar e pausar todas as contagens e indicadores do sistema?")) {
        const pausedStats = {
          visits: 0,
          lifetimeVisits: 0,
          zeroCountStartedAt: null,
          simulations: 0,
          whatsapp: 0,
          contracts: 0,
          contractsStarted: 0,
          videos: (typeof previewVideos !== "undefined" ? previewVideos.length : 3),
          songs: (typeof baseMoments !== "undefined" && typeof instruments !== "undefined" ? baseMoments.length + instruments.length : 34),
          avgTime: "0m 00s"
        };
        localStorage.setItem("maesttro_analytics", JSON.stringify(pausedStats));
        
        renderAnalyticsDashboard();
        if (typeof window.renderAnalyticsCharts === "function") {
          window.renderAnalyticsCharts();
        }
        if (typeof triggerAutoBackup === "function") {
          triggerAutoBackup();
        }
        alert("Contagens zeradas e pausadas com sucesso. Aguardando novo início pelo administrador.");
      }
    }
  };

  // Botão dentro do Card "Acessos vitalícios"
  document.getElementById("btn-toggle-lifetime-counter")?.addEventListener("click", handleStartOrToggleCounter);

  // Start zero analytics button ("Startar do Zero 🚀")
  document.getElementById("btn-start-zero-analytics")?.addEventListener("click", () => {
    const base = getAnalytics();
    if (base.zeroCountStartedAt) {
      if (confirm("Deseja reiniciar a contagem do zero a partir de agora?")) {
        localStorage.removeItem("maesttro_analytics"); // Força reinício
        handleStartOrToggleCounter();
      }
    } else {
      handleStartOrToggleCounter();
    }
  });

  // Reset analytics button
  document.getElementById("btn-reset-analytics")?.addEventListener("click", () => {
    let session = {};
    try {
      session = JSON.parse(localStorage.getItem("maesttro-admin-session")) || {};
    } catch(e) {}
    
    if (session.permission === "Visualizador") {
      alert("Apenas administradores ou editores podem resetar os dados.");
      return;
    }

    if (confirm("Deseja realmente zerar e resetar todos os indicadores de acessos e estatísticas?")) {
      const resetStats = {
        visits: 0,
        lifetimeVisits: 0,
        zeroCountStartedAt: null,
        simulations: 0,
        whatsapp: 0,
        contracts: 0,
        contractsStarted: 0,
        videos: (typeof previewVideos !== "undefined" ? previewVideos.length : 3),
        songs: (typeof baseMoments !== "undefined" && typeof instruments !== "undefined" ? baseMoments.length + instruments.length : 34),
        avgTime: "0m 00s"
      };
      localStorage.setItem("maesttro_analytics", JSON.stringify(resetStats));
      
      renderAnalyticsDashboard();
      if (typeof window.renderAnalyticsCharts === "function") {
        window.renderAnalyticsCharts();
      }
      if (typeof triggerAutoBackup === "function") {
        triggerAutoBackup();
      }
      alert("Todos os indicadores foram zerados e resetados com sucesso!");
    }
  });

  // Filter 7 days button
  const btn7d = document.getElementById("btn-filter-7d");
  const btn30d = document.getElementById("btn-filter-30d");
  const btnApply = document.getElementById("btn-apply-analytics");

  if (btn7d && btn30d && startInput && endInput) {
    btn7d.addEventListener("click", () => {
      btn7d.classList.add("active");
      btn7d.style.background = "var(--ink)";
      btn7d.style.color = "white";
      btn7d.style.border = "none";

      btn30d.classList.remove("active");
      btn30d.style.background = "transparent";
      btn30d.style.color = "var(--text)";
      btn30d.style.border = "1px solid var(--line)";

      const today = new Date();
      const start7 = new Date();
      start7.setDate(today.getDate() - 6);

      endInput.value = getLocalDateStr(today);
      startInput.value = getLocalDateStr(start7);

      renderAnalyticsDashboard();
    });

    btn30d.addEventListener("click", () => {
      btn30d.classList.add("active");
      btn30d.style.background = "var(--ink)";
      btn30d.style.color = "white";
      btn30d.style.border = "none";

      btn7d.classList.remove("active");
      btn7d.style.background = "transparent";
      btn7d.style.color = "var(--text)";
      btn7d.style.border = "1px solid var(--line)";

      const today = new Date();
      const start30 = new Date();
      start30.setDate(today.getDate() - 29);

      endInput.value = getLocalDateStr(today);
      startInput.value = getLocalDateStr(start30);

      renderAnalyticsDashboard();
    });
  }

  if (btnApply) {
    btnApply.addEventListener("click", () => {
      if (startInput && endInput) {
        const todayStr = getLocalDateStr(new Date());
        const start7 = new Date();
        start7.setDate(new Date().getDate() - 6);
        const start7Str = getLocalDateStr(start7);

        const start30 = new Date();
        start30.setDate(new Date().getDate() - 29);
        const start30Str = getLocalDateStr(start30);

        if (startInput.value === start7Str && endInput.value === todayStr) {
          btn7d?.click();
          return;
        } else if (startInput.value === start30Str && endInput.value === todayStr) {
          btn30d?.click();
          return;
        } else {
          if (btn7d && btn30d) {
            btn7d.classList.remove("active");
            btn7d.style.background = "transparent";
            btn7d.style.color = "var(--text)";
            btn7d.style.border = "1px solid var(--line)";

            btn30d.classList.remove("active");
            btn30d.style.background = "transparent";
            btn30d.style.color = "var(--text)";
            btn30d.style.border = "1px solid var(--line)";
          }
        }
      }
      renderAnalyticsDashboard();
    });
  }
}

function bindThemeControls() {
  if (!window.MaesttroTheme) return;

  const fontFamSel = document.getElementById("theme-font-family");
  const fontHeadSel = document.getElementById("theme-font-heading");
  const fontSizeSel = document.getElementById("theme-font-size");
  const fontWeightSel = document.getElementById("theme-font-weight");

  const colorBgPicker = document.getElementById("theme-color-bg");
  const colorBgHex = document.getElementById("theme-color-bg-hex");

  const colorTextPicker = document.getElementById("theme-color-text");
  const colorTextHex = document.getElementById("theme-color-text-hex");

  const colorPrimaryPicker = document.getElementById("theme-color-primary");
  const colorPrimaryHex = document.getElementById("theme-color-primary-hex");

  const colorGoldPicker = document.getElementById("theme-color-gold");
  const colorGoldHex = document.getElementById("theme-color-gold-hex");

  const btnSave = document.getElementById("btn-save-theme");
  const btnReset = document.getElementById("btn-reset-theme");

  const presetBtns = document.querySelectorAll(".theme-preset-btn");

  if (!fontFamSel && !btnSave) return;

  // Carrega configurações de tema salvas
  function populateFields(theme) {
    if (fontFamSel) fontFamSel.value = theme.fontFamily;
    if (fontHeadSel) fontHeadSel.value = theme.fontHeading;
    if (fontSizeSel) fontSizeSel.value = theme.fontSize;
    if (fontWeightSel) fontWeightSel.value = theme.fontWeightHeading;

    if (colorBgPicker) colorBgPicker.value = theme.colorBg.startsWith("#") ? theme.colorBg : "#fffdf8";
    if (colorBgHex) colorBgHex.value = theme.colorBg;

    if (colorTextPicker) colorTextPicker.value = theme.colorText.startsWith("#") ? theme.colorText : "#222624";
    if (colorTextHex) colorTextHex.value = theme.colorText;

    if (colorPrimaryPicker) colorPrimaryPicker.value = theme.colorPrimary.startsWith("#") ? theme.colorPrimary : "#2f3332";
    if (colorPrimaryHex) colorPrimaryHex.value = theme.colorPrimary;

    if (colorGoldPicker) colorGoldPicker.value = theme.colorGold.startsWith("#") ? theme.colorGold : "#b89652";
    if (colorGoldHex) colorGoldHex.value = theme.colorGold;

    presetBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.preset === theme.preset);
      if (btn.dataset.preset === theme.preset) {
        btn.style.outline = "2px solid var(--gold)";
      } else {
        btn.style.outline = "none";
      }
    });
  }

  const current = window.MaesttroTheme.getSavedTheme();
  populateFields(current);

  // Sincroniza seletores de cor com campos de texto hex
  function syncColorInputs(picker, hexInput) {
    if (!picker || !hexInput) return;
    picker.addEventListener("input", () => {
      hexInput.value = picker.value;
      previewCurrentCustomTheme();
    });
    hexInput.addEventListener("input", () => {
      if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
        picker.value = hexInput.value;
        previewCurrentCustomTheme();
      }
    });
  }

  syncColorInputs(colorBgPicker, colorBgHex);
  syncColorInputs(colorTextPicker, colorTextHex);
  syncColorInputs(colorPrimaryPicker, colorPrimaryHex);
  syncColorInputs(colorGoldPicker, colorGoldHex);

  [fontFamSel, fontHeadSel, fontSizeSel, fontWeightSel].forEach(select => {
    select?.addEventListener("change", previewCurrentCustomTheme);
  });

  function readFieldsToTheme() {
    return {
      preset: "custom",
      fontFamily: fontFamSel ? fontFamSel.value : "Inter, sans-serif",
      fontHeading: fontHeadSel ? fontHeadSel.value : "Georgia, serif",
      fontSize: fontSizeSel ? fontSizeSel.value : "16px",
      fontWeightHeading: fontWeightSel ? fontWeightSel.value : "500",
      colorBg: colorBgHex ? colorBgHex.value : "#fffdf8",
      colorText: colorTextHex ? colorTextHex.value : "#222624",
      colorPrimary: colorPrimaryHex ? colorPrimaryHex.value : "#2f3332",
      colorGold: colorGoldHex ? colorGoldHex.value : "#b89652",
      colorPaper: colorBgHex ? colorBgHex.value : "#ffffff",
      cardRadius: "16px"
    };
  }

  function previewCurrentCustomTheme() {
    const t = readFieldsToTheme();
    window.MaesttroTheme.applyTheme(t);
  }

  // Presets
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const pKey = btn.dataset.preset;
      const pTheme = window.MaesttroTheme.presets[pKey];
      if (pTheme) {
        populateFields(pTheme);
        window.MaesttroTheme.applyTheme(pTheme);
      }
    });
  });

  // Botão salvar
  btnSave?.addEventListener("click", () => {
    const themeToSave = readFieldsToTheme();
    localStorage.setItem(window.MaesttroTheme.THEME_STORAGE_KEY, JSON.stringify(themeToSave));
    window.MaesttroTheme.applyTheme(themeToSave);
    if (typeof triggerAutoBackup === "function") {
      triggerAutoBackup();
    }
    alert("Estilo visual, fontes e cores aplicados e salvos em todo o sistema com sucesso!");
  });

  // Botão resetar
  btnReset?.addEventListener("click", () => {
    if (confirm("Deseja restaurar o tema e estilos originais do sistema?")) {
      const def = window.MaesttroTheme.defaultTheme;
      localStorage.removeItem(window.MaesttroTheme.THEME_STORAGE_KEY);
      populateFields(def);
      window.MaesttroTheme.applyTheme(def);
      if (typeof triggerAutoBackup === "function") {
        triggerAutoBackup();
      }
      alert("Tema padrão restaurado com sucesso!");
    }
  });
}

// Extras Initializations
getAnalytics();
getCustomUsers();
injectWhatsAppFloatingButton();

if (document.getElementById("admin") || window.location.pathname.includes("admin.html")) {
  bindAdminTabs();
  renderAnalyticsDashboard();
  renderUsersList();
  bindUserManagement();
  renderBackupHistory();
  bindBackupControls();
  bindAnalyticsControls();
  bindThemeControls();
}
