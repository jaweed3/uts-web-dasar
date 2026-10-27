

(function () {
  "use strict";

  if (document.body.dataset.page !== "beranda") {
    return;
  }

  const state = {
    loading: false,
    loadedOnce: false,
  };

  let loadAlert;
  let loadAlertText;
  let sourcePill;
  let stockGrid;
  let latestBody;

  function cacheElements() {
    loadAlert = document.getElementById("load-alert");
    loadAlertText = document.getElementById("load-alert-text");
    sourcePill = document.getElementById("data-source");
    stockGrid = document.getElementById("stock-grid");
    latestBody = document.getElementById("latest-body");
  }

  function sum(items, field) {
    return items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
  }

  function sessionLabel() {
    const hour = new Date().getHours();
    if (hour < 11) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 19) return "Sore";
    return "Malam";
  }

  function setStat(key, value) {
    const valueElement = document.querySelector(`[data-stat="${key}"]`);
    if (!valueElement) {
      return;
    }

    valueElement.textContent = value;
    valueElement.classList.remove("hidden");

    const card = valueElement.closest("article");
    const skeleton = card ? card.querySelector("[data-stat-skeleton]") : null;
    if (skeleton) {
      skeleton.classList.add("hidden");
    }
  }

  function setStatsUnavailable() {
    document.querySelectorAll("[data-stat]").forEach((element) => {
      element.textContent = "—";
      element.classList.remove("hidden");
    });
    document.querySelectorAll("[data-stat-skeleton]").forEach((element) => {
      element.classList.add("hidden");
    });
  }

  function renderStats(pakan, catatan) {
    const kandang = new Set(
      catatan
        .map((item) => String(item.kandang || "").trim().toUpperCase())
        .filter(Boolean)
    );

    setStat("pakan", UI.formatNumber(pakan.length, 0));
    setStat("stok", UI.formatNumber(sum(pakan, "stok_kg")));
    setStat("telur", UI.formatNumber(sum(catatan, "jumlah_telur"), 0));
    setStat("kandang", UI.formatNumber(kandang.size, 0));
    setStat("pakan-diberi", UI.formatNumber(sum(catatan, "jumlah_pakan_kg")));
    setStat("panen", UI.formatNumber(sum(catatan, "berat_telur_kg")));
  }

  function renderHero(pakan, catatan) {
    const latest = catatan[0];

    if (!latest) {
      return;
    }

    const pakanTerpakai =
      pakan.find(
        (item) => Number(item.id_pakan) === Number(latest.id_pakan)
      ) || null;

    const kandang = document.querySelector("[data-hero-kandang]");
    const detail = document.querySelector("[data-hero-detail]");
    const date = document.querySelector("[data-hero-date]");
    const stockLabel = document.querySelector("[data-hero-stock-label]");
    const stockValue = document.querySelector("[data-hero-stock]");

    if (kandang) {
      kandang.textContent = `Kandang ${latest.kandang} — ${sessionLabel()}`;
    }

    if (detail) {
      detail.textContent = `Pemberian ${UI.formatNumber(
        latest.jumlah_pakan_kg
      )} kg • Panen ${UI.formatNumber(latest.jumlah_telur, 0)} telur`;
    }

    if (date) {
      date.textContent = UI.formatDate(latest.tanggal);
    }

    if (stockLabel) {
      stockLabel.textContent = pakanTerpakai
        ? `Stok ${pakanTerpakai.nama_pakan}`
        : "Stok pakan";
    }

    if (stockValue) {
      stockValue.textContent = UI.formatNumber(
        pakanTerpakai ? pakanTerpakai.stok_kg : 0
      );
    }
  }

  function stockCard(pakan) {
    const meta = UI.getStockMeta(pakan.stok_kg, pakan.stok_awal);

    return `
      <article class="group flex flex-col rounded-2xl border ${meta.borderClass} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-center justify-between gap-3">
          <h3 class="truncate text-sm font-extrabold text-slate-900">${UI.escapeHTML(
            pakan.nama_pakan
          )}</h3>
          <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.badgeClass}">${meta.label}</span>
        </div>

        <div class="mt-3 flex items-baseline gap-1.5">
          <strong class="text-3xl font-extrabold tracking-[-0.04em] text-slate-950">${UI.formatNumber(
            pakan.stok_kg
          )}</strong>
          <span class="text-xs font-bold text-slate-500">kg</span>
        </div>

        <div class="mt-4">
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div class="progress-fill h-full rounded-full bg-gradient-to-r ${meta.barClass}" style="width:${meta.percent}%"></div>
          </div>
          <p class="mt-2 text-[11px] font-medium text-slate-400">${meta.note}</p>
        </div>

        <a href="pakan.html" class="mt-4 inline-flex w-fit items-center gap-1 text-[11px] font-bold text-green-700 transition hover:gap-2 hover:text-green-800">
          Kelola pakan
          <svg viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5" aria-hidden="true">
            <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </article>
    `;
  }

  function renderStok(pakan) {
    if (!stockGrid) {
      return;
    }

    if (!pakan.length) {
      stockGrid.innerHTML = `
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white md:col-span-3">
          ${UI.emptyState({
            title: "Belum ada data pakan",
            text: "Tambahkan jenis pakan terlebih dahulu supaya stok bisa dipantau dari beranda.",
            action:
              '<a href="pakan.html" class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-green-800">Tambah pakan</a>',
          })}
        </div>
      `;
      return;
    }

    stockGrid.innerHTML = pakan.slice(0, 3).map(stockCard).join("");
  }

  function renderLatest(catatan) {
    if (!latestBody) {
      return;
    }

    if (!catatan.length) {
      latestBody.innerHTML = UI.tableEmptyRow(6, {
        title: "Belum ada catatan harian",
        text: "Catat pemberian pakan dan panen telur pertama untuk kandangmu.",
        action:
          '<a href="catatan-harian.html" class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-green-800">Buat catatan</a>',
      });
      return;
    }

    latestBody.innerHTML = catatan
      .slice(0, 4)
      .map(
        (item) => `
          <tr class="transition hover:bg-slate-50/70">
            <td data-label="Tanggal" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-500">${UI.formatDate(
              item.tanggal
            )}</td>
            <td data-label="Kandang" class="whitespace-nowrap px-5 py-3.5 text-[13px] font-extrabold text-slate-900">${UI.escapeHTML(
              item.kandang
            )}</td>
            <td data-label="Pakan" class="px-5 py-3.5 text-[13px] text-slate-600">${UI.escapeHTML(
              item.nama_pakan
            )}</td>
            <td data-label="Jumlah" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-600">${UI.formatNumber(
              item.jumlah_pakan_kg
            )} kg</td>
            <td data-label="Telur" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-600">${UI.formatNumber(
              item.jumlah_telur,
              0
            )} butir</td>
            <td data-label="Berat" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-600">${UI.formatNumber(
              item.berat_telur_kg
            )} kg</td>
          </tr>
        `
      )
      .join("");
  }

  function showLoadError(message) {
    if (loadAlert && loadAlertText) {
      loadAlert.hidden = false;
      loadAlertText.textContent = message;
    }
  }

  function hideLoadError() {
    if (loadAlert) {
      loadAlert.hidden = true;
    }
  }

  function renderErrorState(message) {
    setStatsUnavailable();

    if (stockGrid) {
      stockGrid.innerHTML = `
        <div class="rounded-2xl border border-rose-200 bg-rose-50 md:col-span-3">
          ${UI.emptyState({
            title: "Stok gagal dimuat",
            text: message,
            action:
              '<button type="button" data-retry-load class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100">Coba lagi</button>',
          })}
        </div>
      `;
    }

    if (latestBody) {
      latestBody.innerHTML = UI.tableErrorRow(6, message, "data-retry-load");
    }
  }

  function maybeShowDemoNotice(info) {
    if (!info || info.mode !== "demo" || !info.fallback) {
      return;
    }

    try {
      if (window.sessionStorage.getItem("sikandang.demo.notice") === "1") {
        return;
      }
      window.sessionStorage.setItem("sikandang.demo.notice", "1");
    } catch (error) {
      
    }

    UI.toast(
      "Backend belum terdeteksi, jadi data demo ditampilkan. Semua fitur tetap bisa dicoba.",
      "info",
      "Mode demo aktif"
    );
  }

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;
    hideLoadError();

    try {
      const info = await window.SiKandangAPI.init();
      UI.setSourcePill(sourcePill, info);
      maybeShowDemoNotice(info);

      const [pakan, catatan] = await Promise.all([
        window.SiKandangAPI.getPakan(),
        window.SiKandangAPI.getCatatan(),
      ]);

      renderStats(pakan, catatan);
      renderStok(pakan);
      renderLatest(catatan);
      renderHero(pakan, catatan);
      state.loadedOnce = true;
    } catch (error) {
      const message =
        error && error.message
          ? error.message
          : "Terjadi kesalahan saat memuat data.";
      showLoadError(message);
      renderErrorState(message);
    } finally {
      state.loading = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    cacheElements();

    const retryButton = document.getElementById("load-retry");
    if (retryButton) {
      retryButton.setAttribute("data-retry-load", "");
    }

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-retry-load]")) {
        load();
      }
    });

    load();
  });
})();
