const contractStorageKeys = {
  context: "maesttro-contract-context",
  draft: "maesttro-contract-draft"
};

const brMoney = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function readContractStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function writeContractStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Keeps the prototype usable even when storage is unavailable.
  }
}

function formatContractDate(dateValue) {
  if (!dateValue) return "data a definir";
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateObject(date) {
  if (!date) return "data a definir";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function addMonths(date, amount) {
  const next = new Date(date);
  const targetMonth = next.getMonth() + amount;
  next.setMonth(targetMonth);
  if (next.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    next.setDate(0);
  }
  return next;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function parseDateOnly(dateValue) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthlyInstallmentCount(eventDateValue, today = new Date()) {
  const eventDate = parseDateOnly(eventDateValue);
  if (!eventDate) return 0;
  const cutoff = addDays(eventDate, -30);
  let dueDate = addMonths(new Date(today.getFullYear(), today.getMonth(), today.getDate()), 1);
  let count = 0;
  while (dueDate <= cutoff) {
    count += 1;
    dueDate = addMonths(dueDate, 1);
  }
  return count;
}

function activePaymentMethod() {
  return document.querySelector('input[name="payment"]:checked')?.value || "pix-full";
}

function totalValue() {
  return Number(document.getElementById("contract-total")?.value || 0);
}

function eventDateValue() {
  return document.getElementById("contract-event-date")?.value || "";
}

function buildPaymentSummary() {
  const total = totalValue();
  const eventDate = eventDateValue();
  const method = activePaymentMethod();
  const entry = total * 0.2;
  const balance = total - entry;
  const discounted = total * 0.95;
  const cutoffText = eventDate ? formatDateObject(addDays(parseDateOnly(eventDate), -30)) : "30 dias antes do evento";
  const installments = monthlyInstallmentCount(eventDate);

  const summaries = {
    "pix-full": {
      title: "À vista via PIX",
      lines: [
        ["Desconto aplicado", "5%"],
        ["Total com desconto", brMoney.format(discounted)]
      ]
    },
    "pix-entry-installments": {
      title: "Entrada + parcelas mensais via PIX",
      lines: installments > 0
        ? [
            ["Entrada de 20%", brMoney.format(entry)],
            ["Saldo parcelado", brMoney.format(balance)],
            ["Quantidade de parcelas", `${installments} parcela${installments === 1 ? "" : "s"}`],
            ["Valor de cada parcela", brMoney.format(balance / installments)],
            ["Limite de vencimento", `até ${cutoffText}`]
          ]
        : [
            ["Entrada de 20%", brMoney.format(entry)],
            ["Saldo", brMoney.format(balance)],
            ["Parcelas mensais", "sem tempo hábil pela regra dos 30 dias"],
            ["Limite de vencimento", `até ${cutoffText}`]
          ]
    },
    "pix-entry-balance": {
      title: "Entrada + saldo antes do evento",
      lines: [
        ["Entrada de 20%", brMoney.format(entry)],
        ["Saldo restante", brMoney.format(balance)],
        ["Vencimento do saldo", `até ${cutoffText}`]
      ]
    },
    "credit-card": {
      title: "Cartão de crédito via Mercado Pago",
      lines: [
        ["Total no cartão", brMoney.format(total)],
        ["Parcelamento máximo", "até 12 vezes"],
        ["Referência em 12x", brMoney.format(total / 12)],
        ["Processamento", "Mercado Pago"]
      ]
    }
  };

  return summaries[method] || summaries["pix-full"];
}

function renderContractSummary() {
  const context = readContractStorage(contractStorageKeys.context, {});
  const summaryTotal = document.getElementById("contract-summary-total");
  const eventSummary = document.getElementById("contract-event-summary");
  const paymentSummary = document.getElementById("payment-summary");
  const payment = buildPaymentSummary();

  if (summaryTotal) summaryTotal.textContent = brMoney.format(totalValue());
  if (eventSummary) {
    const instruments = (context.instruments || []).join(", ") || "formação a confirmar";
    eventSummary.innerHTML = `
      <div class="contract-line"><span>Evento</span><b>${context.lead?.eventType || "Evento a confirmar"}</b></div>
      <div class="contract-line"><span>Data</span><b>${formatContractDate(eventDateValue())}</b></div>
      <div class="contract-line"><span>Local</span><b>${context.eventLocation || "local a confirmar"}</b></div>
      <div class="contract-line"><span>Formação</span><b>${context.formation || instruments}</b></div>
      <div class="contract-line"><span>Instrumentos</span><b>${instruments}</b></div>
    `;
  }
  if (paymentSummary) {
    paymentSummary.innerHTML = `
      <h3>${payment.title}</h3>
      ${payment.lines.map(([label, value]) => `<div class="contract-line"><span>${label}</span><b>${value}</b></div>`).join("")}
    `;
  }
}

function prefillContractForm() {
  const context = readContractStorage(contractStorageKeys.context, {});
  const draft = readContractStorage(contractStorageKeys.draft, {});
  const lead = context.lead || {};
  const values = {
    "contract-name": draft.contractName || lead.name || "",
    "contract-email": draft.contractEmail || lead.email || "",
    "contract-event-date": draft.eventDate || context.eventDate || lead.eventDate || "",
    "contract-total": draft.total || context.total || 4800,
    "contract-nationality": draft.nationality || "Brasileiro(a)",
    "contract-rg": draft.rg || "",
    "contract-cpf": draft.cpf || "",
    "contract-marital": draft.marital || "",
    "contract-profession": draft.profession || "",
    "contract-address": draft.address || "",
    "witness-name": draft.witnessName || "",
    "witness-cpf": draft.witnessCpf || "",
    "witness-email": draft.witnessEmail || "",
    "contract-notes": draft.notes || ""
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  });
  if (draft.payment) {
    const payment = document.querySelector(`input[name="payment"][value="${draft.payment}"]`);
    if (payment) payment.checked = true;
  }
}

function collectDraft() {
  return {
    contractName: document.getElementById("contract-name")?.value.trim() || "",
    contractEmail: document.getElementById("contract-email")?.value.trim() || "",
    nationality: document.getElementById("contract-nationality")?.value.trim() || "",
    rg: document.getElementById("contract-rg")?.value.trim() || "",
    cpf: document.getElementById("contract-cpf")?.value.trim() || "",
    marital: document.getElementById("contract-marital")?.value.trim() || "",
    profession: document.getElementById("contract-profession")?.value.trim() || "",
    address: document.getElementById("contract-address")?.value.trim() || "",
    witnessName: document.getElementById("witness-name")?.value.trim() || "",
    witnessCpf: document.getElementById("witness-cpf")?.value.trim() || "",
    witnessEmail: document.getElementById("witness-email")?.value.trim() || "",
    eventDate: eventDateValue(),
    total: totalValue(),
    payment: activePaymentMethod(),
    paymentSummary: buildPaymentSummary(),
    notes: document.getElementById("contract-notes")?.value.trim() || "",
    savedAt: new Date().toISOString()
  };
}

function bindContractForm() {
  document.querySelectorAll("#contract-form input, #contract-form textarea").forEach((element) => {
    element.addEventListener("input", renderContractSummary);
    element.addEventListener("change", renderContractSummary);
  });

  document.getElementById("contract-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const draft = collectDraft();
    writeContractStorage(contractStorageKeys.draft, draft);

    // Salva o rascunho de contrato no Supabase caso esteja conectado
    const context = readContractStorage(contractStorageKeys.context, {});
    const leadId = context.leadId || null;
    const simulationId = context.simulationId || null;

    if (typeof dbSaveContractDraft === "function") {
      dbSaveContractDraft(draft, leadId, simulationId).then(draftId => {
        if (draftId) {
          console.log("MAESTTRO: Minuta de contrato salva com sucesso no Supabase com ID:", draftId);
        }
      });
    }

    const success = document.getElementById("contract-success");
    if (success) {
      success.hidden = false;
      success.innerHTML = `Dados salvos para a minuta de <strong>${draft.contractName}</strong>. Condição escolhida: ${draft.paymentSummary.title}.`;
    }

    // Increment filled contracts in analytics
    try {
      let analytics = JSON.parse(localStorage.getItem("maesttro_analytics")) || {
        visits: 1426,
        simulations: 91,
        whatsapp: 3,
        contracts: 4,
        contractsStarted: 1,
        videos: 8,
        songs: 34,
        avgTime: "8m 50s"
      };
      analytics.contracts = (analytics.contracts || 0) + 1;
      localStorage.setItem("maesttro_analytics", JSON.stringify(analytics));
      
      // Auto-backup if trigger is available
      if (typeof triggerAutoBackup === "function") {
        triggerAutoBackup();
      }
    } catch(e) {}
  });
}

// Track contract started once per session
if (!sessionStorage.getItem("maesttro_contract_started")) {
  sessionStorage.setItem("maesttro_contract_started", "true");
  try {
    let analytics = JSON.parse(localStorage.getItem("maesttro_analytics")) || {
      visits: 1426,
      simulations: 91,
      whatsapp: 3,
      contracts: 4,
      contractsStarted: 1,
      videos: 8,
      songs: 34,
      avgTime: "8m 50s"
    };
    analytics.contractsStarted = (analytics.contractsStarted || 0) + 1;
    localStorage.setItem("maesttro_analytics", JSON.stringify(analytics));
    
    if (typeof triggerAutoBackup === "function") {
      triggerAutoBackup();
    }
  } catch(e) {}
}

prefillContractForm();
bindContractForm();
renderContractSummary();
