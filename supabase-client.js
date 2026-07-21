// MAESTTRO - Supabase Client SDK integration
// Fornece leitura/escrita resiliente para o aplicativo e painel administrativo.

const { createClient } = window.supabase || {};
let supabase = null;

if (window.MAESTTRO_SUPABASE && createClient) {
  try {
    // Normaliza URL caso termine com barra de REST
    let cleanUrl = window.MAESTTRO_SUPABASE.url;
    if (cleanUrl.endsWith("/rest/v1/")) {
      cleanUrl = cleanUrl.replace("/rest/v1/", "");
    } else if (cleanUrl.endsWith("/rest/v1")) {
      cleanUrl = cleanUrl.replace("/rest/v1", "");
    }
    supabase = createClient(cleanUrl, window.MAESTTRO_SUPABASE.anonKey);
    console.log("MAESTTRO: Conectado com sucesso ao Supabase em", cleanUrl);
  } catch (e) {
    console.error("MAESTTRO: Erro ao inicializar o cliente Supabase:", e);
  }
} else {
  console.warn("MAESTTRO: Supabase SDK não disponível. Operando em modo offline/local.");
}

// Verifica se o Supabase está configurado e disponível
function isSupabaseActive() {
  return !!supabase;
}

/**
 * Lê todo o conteúdo público necessário para renderizar o site principal
 */
async function dbLoadPublicContent() {
  if (!isSupabaseActive()) return null;
  try {
    const results = {};

    // 1. Home Content
    try {
      const { data: home, error: homeError } = await supabase
        .from("home_content")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (!homeError && home) {
        let catImages = {};
        if (typeof home.category_images === "string") {
          try { catImages = JSON.parse(home.category_images); } catch(e) {}
        } else if (home.category_images) {
          catImages = home.category_images;
        }

        results.homeContent = {
          heroImage: home.hero_image,
          previewBackground: home.preview_background,
          categoryImages: catImages
        };
      }
    } catch (e) {
      console.warn("Não foi possível ler a tabela 'home_content':", e);
    }

    // 2. Service Cards
    try {
      const { data: cards, error: cardsError } = await supabase
        .from("service_cards")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (!cardsError && cards && cards.length > 0) {
        results.serviceCards = cards.map(c => ({
          id: c.id,
          title: c.title,
          tag: c.tag,
          copy: c.copy,
          image: c.image,
          sortOrder: c.sort_order
        }));
      }
    } catch (e) {
      console.warn("Não foi possível ler a tabela 'service_cards':", e);
    }

    // 3. Preview Videos
    try {
      const { data: videos, error: videosError } = await supabase
        .from("preview_videos")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (!videosError && videos && videos.length > 0) {
        results.previewVideos = videos.map(v => ({
          id: v.id,
          title: v.title,
          formation: v.formation,
          music: v.music,
          description: v.description,
          image: v.image_url,
          videoUrl: v.video_url
        }));
      }
    } catch (e) {
      console.warn("Não foi possível ler a tabela 'preview_videos':", e);
    }

    // 4. Instrument Categories
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from("instrument_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!categoriesError && categories && categories.length > 0) {
        results.categories = categories.map(c => c.name);
      }
    } catch (e) {
      console.warn("Não foi possível ler a tabela 'instrument_categories':", e);
    }

    // 5. Instruments
    try {
      const { data: insts, error: instsError } = await supabase
        .from("instruments")
        .select("*")
        .eq("active", true)
        .order("price", { ascending: true });

      if (!instsError && insts && insts.length > 0) {
        results.instruments = insts.map(i => ({
          id: i.id,
          name: i.name,
          category: i.category,
          price: parseFloat(i.price),
          heavy: i.heavy
        }));
      }
    } catch (e) {
      console.warn("Não foi possível ler a tabela 'instruments':", e);
    }

    // 6. Blocked Dates
    try {
      const { data: dates, error: datesError } = await supabase
        .from("blocked_dates")
        .select("*")
        .order("event_date", { ascending: true });

      if (!datesError && dates && dates.length > 0) {
        results.blockedDates = dates.map(d => ({
          date: d.event_date,
          reason: d.reason
        }));
      }
    } catch (e) {
      console.warn("Não foi possível ler a tabela 'blocked_dates':", e);
    }

    return results;
  } catch (err) {
    console.error("Erro genérico na leitura pública do Supabase:", err);
    return null;
  }
}

/**
 * Salva um Lead no banco e retorna seu ID
 */
async function dbSaveLead(lead) {
  if (!isSupabaseActive()) return null;
  try {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        event_type: lead.eventType,
        event_date: lead.eventDate || null,
        location: lead.location || null,
        zip_code: lead.zip || null,
        budget: lead.budget || null,
        consent: lead.consent || false,
        status: "novo"
      })
      .select("id")
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error("Erro ao salvar lead no Supabase:", err);
    return null;
  }
}

/**
 * Salva uma Simulação vinculada ao ID do Lead
 */
async function dbSaveSimulation(leadId, stateContext) {
  if (!isSupabaseActive() || !leadId) return null;
  try {
    const { data, error } = await supabase
      .from("simulations")
      .insert({
        lead_id: leadId,
        event_kind: stateContext.eventKind || "casamento",
        venue: stateContext.venue || null,
        style: stateContext.style || null,
        rite: stateContext.rite || null,
        emotion: stateContext.emotion || null,
        event_moment: stateContext.eventMoment || null,
        duration_minutes: stateContext.durationMinutes || null,
        musical_style: stateContext.musicalStyle || null,
        story_song: stateContext.storySong || null,
        formation: stateContext.formation || "",
        instruments: stateContext.instruments || [],
        moments: stateContext.moments || [],
        total_estimated: stateContext.total || 0,
        transport: stateContext.transport || null,
        raw_state: stateContext
      })
      .select("id")
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error("Erro ao salvar simulação no Supabase:", err);
    return null;
  }
}

/**
 * Salva um Rascunho de Contrato vinculado ao ID do Lead e Simulação
 */
async function dbSaveContractDraft(draft, leadId, simulationId) {
  if (!isSupabaseActive()) return null;
  try {
    const { data, error } = await supabase
      .from("contract_drafts")
      .insert({
        lead_id: leadId || null,
        simulation_id: simulationId || null,
        contract_name: draft.contractName,
        contract_email: draft.contractEmail,
        nationality: draft.nationality || null,
        rg: draft.rg || null,
        cpf: draft.cpf || null,
        marital_status: draft.marital || null,
        profession: draft.profession || null,
        address: draft.address || null,
        witness_name: draft.witnessName || null,
        witness_cpf: draft.witnessCpf || null,
        witness_email: draft.witnessEmail || null,
        event_date: draft.eventDate || null,
        total: draft.total || null,
        payment_method: draft.payment || "pix-full",
        payment_summary: draft.paymentSummary || null,
        notes: draft.notes || null,
        status: "rascunho"
      })
      .select("id")
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error("Erro ao salvar rascunho de contrato no Supabase:", err);
    return null;
  }
}

/**
 * Bloqueia uma data de evento na agenda
 */
async function dbUpsertBlockedDate(date, reason) {
  if (!isSupabaseActive()) return false;
  try {
    const { error } = await supabase
      .from("blocked_dates")
      .upsert({ event_date: date, reason }, { onConflict: "event_date" });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao bloquear data no Supabase:", err);
    return false;
  }
}

/**
 * Libera uma data bloqueada na agenda
 */
async function dbDeleteBlockedDate(date) {
  if (!isSupabaseActive()) return false;
  try {
    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("event_date", date);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao liberar data bloqueada no Supabase:", err);
    return false;
  }
}

/**
 * Adiciona ou edita um Card de Vitrine/Serviço
 */
async function dbUpsertServiceCard(card) {
  if (!isSupabaseActive()) return null;
  try {
    const payload = {
      title: card.title,
      tag: card.tag,
      copy: card.copy,
      image: card.image,
      active: true
    };
    if (card.id) {
      payload.id = card.id;
    }
    const { data, error } = await supabase
      .from("service_cards")
      .upsert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erro no upsert de card de serviço no Supabase:", err);
    return null;
  }
}

/**
 * Remove um Card de Vitrine/Serviço
 */
async function dbDeleteServiceCard(title) {
  if (!isSupabaseActive()) return false;
  try {
    const { error } = await supabase
      .from("service_cards")
      .delete()
      .eq("title", title);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao deletar card de serviço no Supabase:", err);
    return false;
  }
}

/**
 * Salva as configurações de imagens visuais da HOME
 */
async function dbSaveHomeContent(content) {
  if (!isSupabaseActive()) return false;
  try {
    const { error } = await supabase
      .from("home_content")
      .upsert({
        id: "default",
        hero_image: content.heroImage,
        preview_background: content.previewBackground,
        category_images: content.categoryImages
      }, { onConflict: "id" });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao salvar conteúdo de imagens da Home:", err);
    return false;
  }
}

/**
 * Adiciona ou atualiza um Vídeo de Prévia
 */
async function dbUpsertPreviewVideo(video) {
  if (!isSupabaseActive()) return null;
  try {
    const payload = {
      title: video.title,
      formation: video.formation,
      music: video.music,
      description: video.description || "",
      image_url: video.image,
      video_url: video.videoUrl || "",
      active: true
    };
    // Se ID não for temporário do protótipo, preserva ele
    if (video.id && !video.id.startsWith("video-") && !video.id.startsWith("previa-")) {
      payload.id = video.id;
    }
    const { data, error } = await supabase
      .from("preview_videos")
      .upsert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erro ao salvar vídeo de prévia no Supabase:", err);
    return null;
  }
}

/**
 * Deleta um Vídeo de Prévia
 */
async function dbDeletePreviewVideo(title) {
  if (!isSupabaseActive()) return false;
  try {
    const { error } = await supabase
      .from("preview_videos")
      .delete()
      .eq("title", title);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao deletar vídeo de prévia no Supabase:", err);
    return false;
  }
}

/**
 * Adiciona uma música ao catálogo de músicas
 */
async function dbUpsertSong(song) {
  if (!isSupabaseActive()) return null;
  try {
    const { data, error } = await supabase
      .from("songs")
      .insert({
        title: song.title,
        artist: song.artist || "A definir",
        moment: song.moment,
        copy: song.copy || "",
        image_url: song.image || "./assets/music-details.png",
        midi_url: song.midi_url || "",
        tags: song.tags || [],
        active: true
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erro ao adicionar música no Supabase:", err);
    return null;
  }
}

/**
 * Adiciona/Edita um Instrumento e seu valor base
 */
async function dbUpsertInstrument(inst) {
  if (!isSupabaseActive()) return null;
  try {
    const { data, error } = await supabase
      .from("instruments")
      .upsert({
        id: inst.id,
        name: inst.name,
        category: inst.category,
        price: inst.price,
        heavy: inst.heavy || false,
        active: true
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erro ao cadastrar/atualizar instrumento no Supabase:", err);
    return null;
  }
}

/**
 * Cadastra uma nova Categoria de instrumento
 */
async function dbCreateCategory(name) {
  if (!isSupabaseActive()) return false;
  try {
    const { error } = await supabase
      .from("instrument_categories")
      .insert({ name, sort_order: 10 });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao cadastrar categoria no Supabase:", err);
    return false;
  }
}

/**
 * Faz upload de mídia para o Supabase Storage (se configurado)
 * com fallback transparente.
 */
async function dbUploadMedia(file, folder) {
  if (!isSupabaseActive()) return null;
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `${folder}/${Date.now()}-${cleanFileName}`;
    const { data, error } = await supabase.storage
      .from("maesttro-media")
      .upload(path, file);

    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from("maesttro-media")
      .getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.warn("Falha no upload para o Supabase Storage. Verifique se o bucket 'maesttro-media' foi criado e é público.", err);
    return null;
  }
}
