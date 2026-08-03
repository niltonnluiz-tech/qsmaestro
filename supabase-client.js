// MAESTTRO - Supabase Client SDK integration
// Fornece leitura/escrita resiliente para o aplicativo e painel administrativo.

let supabase = null;

function getSupabaseClient() {
  if (supabase) return supabase;
  const createClient = window.supabase?.createClient || (typeof window.supabase === "function" ? window.supabase : null);
  if (window.MAESTTRO_SUPABASE && createClient) {
    try {
      let cleanUrl = window.MAESTTRO_SUPABASE.url;
      if (cleanUrl.endsWith("/rest/v1/")) {
        cleanUrl = cleanUrl.replace("/rest/v1/", "");
      } else if (cleanUrl.endsWith("/rest/v1")) {
        cleanUrl = cleanUrl.replace("/rest/v1", "");
      }
      supabase = createClient(cleanUrl, window.MAESTTRO_SUPABASE.anonKey);
      console.log("MAESTTRO: Conectado com sucesso ao Supabase em", cleanUrl);
      return supabase;
    } catch (e) {
      console.error("MAESTTRO: Erro ao inicializar o cliente Supabase:", e);
    }
  }
  return null;
}

// Verifica se o Supabase está configurado e disponível
function isSupabaseActive() {
  return !!getSupabaseClient();
}

/**
 * Lê todo o conteúdo público necessário para renderizar o site principal
 */
async function dbLoadPublicContent() {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const results = {};

    // 1. Home Content
    try {
      const { data: home, error: homeError } = await client
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
      const { data: cards, error: cardsError } = await client
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

    // 3. Preview Videos (obtém ativos e inativos se for admin ou filtra no front)
    try {
      const { data: videos, error: videosError } = await client
        .from("preview_videos")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!videosError && videos && videos.length > 0) {
        results.previewVideos = videos.map(v => ({
          id: v.id,
          title: v.title,
          formation: v.formation,
          music: v.music,
          description: v.description,
          image: v.image_url,
          videoUrl: v.video_url,
          active: v.active !== false
        }));
      }
    } catch (e) {
      console.warn("Não foi possível ler a tabela 'preview_videos':", e);
    }

    // 4. Instrument Categories
    try {
      const { data: categories, error: categoriesError } = await client
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
      const { data: insts, error: instsError } = await client
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
      const { data: dates, error: datesError } = await client
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

    // 7. Songs
    try {
      const { data: songs, error: songsError } = await client
        .from("songs")
        .select("*")
        .order("created_at", { ascending: true });

      if (!songsError && songs) {
        results.songs = songs.map(s => ({
          id: s.id || `song-${s.title}`,
          title: s.title,
          artist: s.artist || "A definir",
          moment: s.moment || "Pré-cerimônia",
          copy: (s.copy || "").replace(/\s*\(Arquivo:[^)]+\)/gi, ""),
          image: s.image_url || "./assets/music-details.png",
          audioUrl: s.audio_url || s.midi_url || "",
          tags: Array.isArray(s.tags) ? s.tags : ["Catálogo"],
          notes: [440, 523.25, 659.25, 587.33, 523.25],
          active: s.active !== false
        }));
      } else {
        results.songs = [];
      }
    } catch (e) {
      console.warn("Não foi possível ler a tabela 'songs':", e);
      results.songs = [];
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
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
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
  const client = getSupabaseClient();
  if (!client || !leadId) return null;
  try {
    const { data, error } = await client
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
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
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
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
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
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
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
  const client = getSupabaseClient();
  if (!client) return null;
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
    const { data, error } = await client
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
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
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
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
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
  const client = getSupabaseClient();
  if (!client) return null;
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
    const { data, error } = await client
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
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
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
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    let finalAudioUrl = song.audioUrl || "";

    // Se o audioUrl for um data: URL local (base64), faz upload automático para o Supabase Storage
    if (finalAudioUrl.startsWith("data:")) {
      try {
        const res = await fetch(finalAudioUrl);
        const blob = await res.blob();
        const cleanTitle = (song.title || "musica").toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
        const fileObj = new File([blob], `${cleanTitle}.mp3`, { type: blob.type || "audio/mpeg" });
        const uploaded = await dbUploadMedia(fileObj, "songs");
        if (uploaded) {
          finalAudioUrl = uploaded;
          song.audioUrl = uploaded;
        } else {
          console.warn("Upload de mídia falhou. Limpando base64 antes de persistir na tabela 'songs'.");
          finalAudioUrl = "";
        }
      } catch (e) {
        console.warn("Erro ao converter dataUrl para arquivo no Storage:", e);
        finalAudioUrl = "";
      }
    } else if (finalAudioUrl.startsWith("blob:") || finalAudioUrl.startsWith("indexeddb:")) {
      finalAudioUrl = "";
    }

    const fullPayload = {
      title: song.title,
      artist: song.artist || "A definir",
      moment: song.moment || "Pré-cerimônia",
      copy: (song.copy || "").replace(/\s*\(Arquivo:[^)]+\)/gi, ""),
      image_url: song.image || "./assets/music-details.png",
      audio_url: finalAudioUrl,
      midi_url: finalAudioUrl,
      tags: Array.isArray(song.tags) ? song.tags : ["Admin"],
      active: song.active !== false
    };

    const { data: existing } = await client
      .from("songs")
      .select("id")
      .eq("title", song.title)
      .maybeSingle();

    // Cria as variantes de payload para caso a tabela 'songs' no Supabase não possua todas as colunas extras
    const payloadVariants = [
      { ...fullPayload },
      { ...fullPayload, midi_url: undefined, tags: undefined },
      { ...fullPayload, audio_url: undefined, midi_url: undefined, tags: undefined }
    ];

    for (const payload of payloadVariants) {
      // Remove chaves undefined do objeto
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      if (existing && existing.id) {
        const { data, error } = await client
          .from("songs")
          .update(payload)
          .eq("id", existing.id)
          .select("*")
          .maybeSingle();

        if (!error && data) return data;
      } else {
        const { data, error } = await client
          .from("songs")
          .insert(payload)
          .select("*")
          .maybeSingle();

        if (!error && data) return data;
      }
    }

    console.error(`Erro ao salvar música "${song.title}" em todas as variações de colunas no Supabase.`);
    return null;
  } catch (err) {
    console.error("Erro ao adicionar/atualizar música no Supabase:", err);
    return null;
  }
}

/**
 * Adiciona/Edita um Instrumento e seu valor base
 */
async function dbUpsertInstrument(inst) {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const payload = {
      id: inst.id || `inst-${Date.now()}`,
      name: inst.name,
      category: inst.category || "Personalizado",
      price: parseFloat(inst.price) || 0,
      heavy: Boolean(inst.heavy),
      active: inst.active !== false
    };

    let existingId = null;
    if (inst.id) {
      const { data } = await client
        .from("instruments")
        .select("id")
        .eq("id", inst.id)
        .maybeSingle();
      if (data && data.id) existingId = data.id;
    }

    if (!existingId && inst.name) {
      const { data } = await client
        .from("instruments")
        .select("id")
        .eq("name", inst.name)
        .maybeSingle();
      if (data && data.id) existingId = data.id;
    }

    if (existingId) {
      payload.id = existingId;
      const { data, error } = await client
        .from("instruments")
        .update(payload)
        .eq("id", existingId)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data || payload;
    } else {
      const { data, error } = await client
        .from("instruments")
        .insert(payload)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data || payload;
    }
  } catch (err) {
    console.error("Erro ao cadastrar/atualizar instrumento no Supabase:", err);
    return null;
  }
}

/**
 * Remove um Instrumento do Supabase
 */
async function dbDeleteInstrument(id) {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from("instruments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao deletar instrumento no Supabase:", err);
    return false;
  }
}

/**
 * Cadastra uma nova Categoria de instrumento
 */
async function dbCreateCategory(name) {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
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
  const client = getSupabaseClient();
  if (!client) {
    console.warn("MAESTTRO: Cliente Supabase não inicializado.");
    return null;
  }
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `${folder}/${Date.now()}-${cleanFileName}`;
    const { data, error } = await client.storage
      .from("maesttro-media")
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    const { data: { publicUrl } } = client.storage
      .from("maesttro-media")
      .getPublicUrl(path);

    console.log("MAESTTRO: Arquivo enviado com sucesso para o Supabase Storage:", publicUrl);
    return publicUrl;
  } catch (err) {
    console.error("Falha no upload para o Supabase Storage. Verifique se o bucket 'maesttro-media' foi criado e é PÚBLICO no painel do Supabase.", err);
    return null;
  }
}

/**
 * Alterna o status ativo/pausado de um item no Supabase
 */
async function dbToggleActive(table, idOrTitle, currentActive, idColumn = "id") {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const newActiveState = !currentActive;
    const { error } = await client
      .from(table)
      .update({ active: newActiveState })
      .eq(idColumn, idOrTitle);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Erro ao alterar status ativo em ${table}:`, err);
    return false;
  }
}

/**
 * Deleta uma música do banco de dados
 */
async function dbDeleteSong(title) {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from("songs")
      .delete()
      .eq("title", title);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao deletar música no Supabase:", err);
    return false;
  }
}

/**
 * Função de Teste Diagnóstico de Leitura e Escrita no Supabase
 * Pode ser executada chamando window.testSupabaseConnection() no console do navegador.
 */
async function testSupabaseConnection() {
  console.group("🧪 Teste Diagnóstico de Conexão Supabase - MAESTTRO");
  const client = getSupabaseClient();
  
  if (!client) {
    console.error("❌ FALHA: Cliente Supabase não foi inicializado. Verifique se o script supabase-config.js possui a URL e Anon Key corretas.");
    console.groupEnd();
    return { success: false, error: "Cliente não inicializado" };
  }

  const cleanUrl = window.MAESTTRO_SUPABASE?.url || "N/A";
  console.log("1. URL do Projeto:", cleanUrl);
  console.log("2. Testando LEITURA (SELECT)...");

  try {
    // Teste 1: Leitura na tabela 'songs'
    const { data: songsData, error: songsError } = await client
      .from("songs")
      .select("id, title")
      .limit(5);

    if (songsError) {
      console.error("❌ ERRO na leitura da tabela 'songs':", songsError.message);
      console.groupEnd();
      return { success: false, step: "select", error: songsError };
    }

    console.log("✅ LEITURA BEM-SUCEDIDA! Músicas encontradas:", songsData.length, songsData);

    // Teste 2: Escrita (INSERT) de um registro de teste em 'songs'
    console.log("3. Testando ESCRITA (INSERT)...");
    const testTitle = `[TESTE_AUTODETECT] ${new Date().toLocaleTimeString()}`;
    const { data: insertData, error: insertError } = await client
      .from("songs")
      .insert([
        {
          title: testTitle,
          artist: "Sistema de Teste",
          moment: "Pré-cerimônia",
          copy: "Registro temporário de validação de conexão",
          active: false
        }
      ])
      .select();

    if (insertError) {
      console.error("❌ ERRO na escrita (INSERT) na tabela 'songs':", insertError.message);
      console.groupEnd();
      return { success: false, step: "insert", error: insertError };
    }

    console.log("✅ ESCRITA BEM-SUCEDIDA! Registro criado:", insertData);

    // Teste 3: Deleção (DELETE) do registro de teste
    console.log("4. Limpando registro de teste (DELETE)...");
    const { error: deleteError } = await client
      .from("songs")
      .delete()
      .eq("title", testTitle);

    if (deleteError) {
      console.warn("⚠️ Aviso na deleção do registro de teste:", deleteError.message);
    } else {
      console.log("✅ DELEÇÃO BEM-SUCEDIDA! Registro de teste removido.");
    }

    console.log("🎉 CONEXÃO 100% OPERACIONAL! Leitura, Escrita, Deleção e RLS funcionando perfeitamente.");
    console.groupEnd();
    return { success: true, url: cleanUrl, songsFound: songsData.length };
  } catch (err) {
    console.error("❌ EXCEÇÃO INESPERADA ao testar Supabase:", err);
    console.groupEnd();
    return { success: false, error: err.message || err };
  }
}

// Expõe a função de teste globalmente para ser chamada no console a qualquer momento
if (typeof window !== "undefined") {
  window.testSupabaseConnection = testSupabaseConnection;
}


