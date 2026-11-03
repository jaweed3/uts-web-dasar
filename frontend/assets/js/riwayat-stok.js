(function () {
  "use strict";

  if (document.body.dataset.page !== "riwayat") {
    return;
  }

  const PER_PAGE = 8;
  const MAX_PAGE_BUTTONS = 5;

  const state = {
    items: [],
    pakan: [],
    search: "",
    filter: "all",
    page: 1,
    loading: false,
  };

  let sourcePill;  let loadAlert;
  let loadAlertText;
  let tableBody;
  let countElement;
  let searchInput;
  let filterSelect;
  let pager;
  let prevButton;
  let nextButton;
  let pageNumbers;
  let printButton;

  let statTotal;
  let statTerpakai;
  let statMasuk;

  function cacheElements() {
    sourcePill = document.getElementById("data-source");
    loadAlert = document.getElementById("load-alert");
    loadAlertText = document.getElementById("load-alert-text");
    tableBody = document.getElementById("riwayat-body");
    countElement = document.getElementById("riwayat-count");
    searchInput = document.getElementById("riwayat-search");
    filterSelect = document.getElementById("riwayat-filter");
    pager = document.getElementById("riwayat-pager");
    prevButton = document.getElementById("riwayat-page-prev");
    nextButton = document.getElementById("riwayat-page-next");
    pageNumbers = document.getElementById("riwayat-page-numbers");
    printButton = document.getElementById("riwayat-print");

    statTotal = document.getElementById("stat-total");
    statTerpakai = document.getElementById("stat-terpakai");
    statMasuk = document.getElementById("stat-masuk");
  }

  function renderFilterOptions() {
    if (!filterSelect) {
      return;
    }

    const current = state.filter;
    filterSelect.innerHTML =
      '<option value="all">Semua pakan</option>' +
      state.pakan
        .map(
          (item) =>
            `<option value="${item.id_pakan}">${UI.escapeHTML(
              item.nama_pakan
            )}</option>`
        )
        .join("");

    const exists = state.pakan.some(
      (item) => String(item.id_pakan) === String(current)
    );
    state.filter = current === "all" || exists ? current : "all";
    filterSelect.value = state.filter;
  }

  function filteredItems() {
    const keyword = state.search.trim().toLowerCase();

    return state.items.filter((item) => {
      if (
        state.filter !== "all" &&
        String(item.id_pakan) !== String(state.filter)
      ) {
        return false;
      }

      if (
        keyword &&
        !String(item.nama_pakan || "").toLowerCase().includes(keyword) &&
        !String(item.keterangan || "").toLowerCase().includes(keyword) &&
        !String(item.kandang || "").toLowerCase().includes(keyword)
      ) {
        return false;
      }

      return true;
    });
  }

  function renderStats(items) {
    let terpakai = 0;
    let masuk = 0;

    items.forEach((item) => {
      const delta = Number(item.stok_sesudah) - Number(item.stok_sebelum);

      if (delta < 0) {
        terpakai += Math.abs(delta);
      } else if (delta > 0) {
        masuk += delta;
      }
    });

    if (statTotal) {
      statTotal.textContent = UI.formatNumber(items.length, 0);
    }
    if (statTerpakai) {
      statTerpakai.textContent = UI.formatNumber(terpakai);
    }
    if (statMasuk) {
      statMasuk.textContent = UI.formatNumber(masuk);
    }
  }

  function renderCount(items) {
    if (!countElement) {
      return;
    }

    countElement.textContent =
      items.length === state.items.length
        ? `${state.items.length} mutasi`
        : `${items.length} dari ${state.items.length} mutasi`;
  }

  function totalPagesFor(items) {
    return Math.max(1, Math.ceil(items.length / PER_PAGE));
  }

  function pageButtonsMarkup(current, total) {
    let start = 1;
    let end = total;

    if (total > MAX_PAGE_BUTTONS) {
      const half = Math.floor(MAX_PAGE_BUTTONS / 2);

      if (current <= half + 1) {
        start = 1;
        end = MAX_PAGE_BUTTONS;
      } else if (current >= total - half) {
        end = total;
        start = total - MAX_PAGE_BUTTONS + 1;
      } else {
        start = current - half;
        end = current + half;
      }
    }

    const buttons = [];

    for (let page = start; page <= end; page += 1) {
      const active = page === current;
      buttons.push(`
        <button type="button" data-pg="${page}" aria-current="${active ? "page" : "false"}"
          class="inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
            active
              ? "bg-green-700 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }">${page}</button>
      `);
    }

    return buttons.join("");
  }

  function renderPager(items) {
    const total = totalPagesFor(items);

    if (state.page > total) {
      state.page = total;
    }

    const showPager = total > 1;
    if (pager) {
      pager.hidden = !showPager;
    }

    if (!showPager) {
      return;
    }

    if (prevButton) {
      prevButton.disabled = state.page <= 1;
    }
    if (nextButton) {
      nextButton.disabled = state.page >= total;
    }
    if (pageNumbers) {
      pageNumbers.innerHTML = pageButtonsMarkup(state.page, total);
    }
    if (countElement) {
      countElement.textContent += ` — halaman ${state.page} dari ${total}`;
    }
  }

  function riwayatRow(item) {
    const delta = Number(item.stok_sesudah) - Number(item.stok_sebelum);
    const deltaTone =
      delta < 0
        ? "text-rose-600"
        : delta > 0
        ? "text-green-700"
        : "text-slate-900";
    const deltaBadge =
      delta < 0
        ? "bg-rose-50 text-rose-700"
        : delta > 0
        ? "bg-green-50 text-green-800"
        : "bg-slate-100 text-slate-600";

    return `
      <tr class="transition hover:bg-slate-50/70">
        <td data-label="#" class="whitespace-nowrap px-5 py-3.5 text-[12px] font-semibold text-slate-400">#${item.id_log}</td>
        <td data-label="Waktu" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-500">${UI.escapeHTML(
          UI.formatDateTime(item.tanggal)
        )}</td>
        <td data-label="Pakan" class="px-5 py-3.5 text-[13px] font-extrabold text-slate-900">${UI.escapeHTML(
          item.nama_pakan
        )}</td>
        <td data-label="Sebelum (kg)" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-600">${UI.formatNumber(
          item.stok_sebelum
        )}</td>
        <td data-label="Sesudah (kg)" class="whitespace-nowrap px-5 py-3.5">
          <span class="inline-flex items-center gap-1.5">
            <span class="text-[13px] font-extrabold ${deltaTone}">${UI.formatNumber(
              item.stok_sesudah
            )}</span>
            <span class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${deltaBadge}">${
              delta < 0 ? "−" : delta > 0 ? "+" : "±"
            }</span>
          </span>
        </td>
        <td data-label="Keterangan" class="px-5 py-3.5 text-[12.5px] text-slate-600">${UI.escapeHTML(
          item.keterangan
        )}</td>
      </tr>
    `;
  }

  function renderTable() {
    if (!tableBody) {
      return;
    }

    const items = filteredItems();

    if (state.page > totalPagesFor(items)) {
      state.page = totalPagesFor(items);
    }

    if (countElement) {
      countElement.textContent =
        items.length === state.items.length
          ? `${state.items.length} mutasi`
          : `${items.length} dari ${state.items.length} mutasi`;
    }

    renderStats(items);
    renderPager(items);

    if (!items.length) {
      const filterActive = state.search.trim() !== "" || state.filter !== "all";

      tableBody.innerHTML = filterActive
        ? UI.tableEmptyRow(6, {
            title: "Tidak ada hasil",
            text: "Coba kata kunci lain atau ubah filter pakan.",
            action:
              '<button type="button" data-clear-filter class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">Bersihkan filter</button>',
          })
        : UI.tableEmptyRow(6, {
            title: "Belum ada mutasi stok",
            text: "Mutasi muncul otomatis setiap kali stok pakan berubah lewat catatan harian.",
          });
      return;
    }

    const start = (state.page - 1) * PER_PAGE;
    const visible = items.slice(start, start + PER_PAGE);
    tableBody.innerHTML = visible.map(riwayatRow).join("");
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

  function setLoadingState() {
    if (tableBody) {
      tableBody.innerHTML = UI.tableLoadingRow(6, 5);
    }
    if (countElement) {
      countElement.textContent = "Memuat data...";
    }
    if (pager) {
      pager.hidden = true;
    }
  }

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;
    hideLoadError();
    setLoadingState();

    try {
      const info = await window.SiKandangAPI.init();
      UI.setSourcePill(sourcePill, info);
      const [pakan, riwayat] = await Promise.all([
        window.SiKandangAPI.getPakan(),
        window.SiKandangAPI.getRiwayat(),
      ]);

      state.pakan = pakan;
      state.items = riwayat;
      renderFilterOptions();
      renderTable();
    } catch (error) {
      const message =
        error && error.message
          ? error.message
          : "Gagal memuat riwayat mutasi stok.";
      showLoadError(message);

      if (tableBody) {
        tableBody.innerHTML = UI.tableErrorRow(6, message, "data-retry-load");
      }
      if (countElement) {
        countElement.textContent = "Data gagal dimuat";
      }
      if (statTotal) {
        statTotal.textContent = "0";
      }
      if (statTerpakai) {
        statTerpakai.textContent = "0";
      }
      if (statMasuk) {
        statMasuk.textContent = "0";
      }
    } finally {
      state.loading = false;
    }
  }

  function resetFilters() {
    state.search = "";
    state.filter = "all";
    state.page = 1;
    if (searchInput) {
      searchInput.value = "";
    }
    if (filterSelect) {
      filterSelect.value = "all";
    }
    renderTable();
  }

  function goToPage(page) {
    const total = totalPagesFor(filteredItems());

    const next = Math.min(Math.max(1, Number(page) || 1), total);
    if (next === state.page) {
      return;
    }

    state.page = next;
    renderTable();

    if (tableBody) {
      tableBody.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handlePrint() {
    const items = filteredItems();

    if (!items.length) {
      UI.toast("Tidak ada data mutasi untuk dicetak.", "info");
      return;
    }

    if (tableBody) {
      tableBody.innerHTML = items.map(riwayatRow).join("");
    }
    if (countElement) {
      countElement.textContent = `Mode cetak: menampilkan ${items.length} mutasi`;
    }
    if (pager) {
      pager.hidden = true;
    }

    window.print();
  }

  function bindEvents() {
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        UI.debounce(() => {
          state.search = searchInput.value;
          state.page = 1;
          renderTable();
        }, 180)
      );
    }

    if (filterSelect) {
      filterSelect.addEventListener("change", () => {
        state.filter = filterSelect.value;
        state.page = 1;
        renderTable();
      });
    }

    if (pager) {
      pager.addEventListener("click", (event) => {
        const button = event.target.closest("[data-pg]");
        if (!button || button.disabled) {
          return;
        }

        const value = button.dataset.pg;

        if (value === "prev") {
          goToPage(state.page - 1);
        } else if (value === "next") {
          goToPage(state.page + 1);
        } else {
          goToPage(value);
        }
      });
    }

    if (printButton) {
      printButton.addEventListener("click", handlePrint);
    }

    window.addEventListener("afterprint", () => {
      if (state.items.length) {
        renderTable();
      }
    });

    if (tableBody) {
      tableBody.addEventListener("click", (event) => {
        const clearFilter = event.target.closest("[data-clear-filter]");
        if (clearFilter) {
          resetFilters();
        }
      });
    }

    const retryButton = document.getElementById("load-retry");
    if (retryButton) {
      retryButton.setAttribute("data-retry-load", "");
    }

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-retry-load]")) {
        load();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    bindEvents();
    load();
  });
})();
