(function () {
  "use strict";

  if (document.body.dataset.page !== "pakan") {
    return;
  }

  const state = {
    items: [],
    search: "",
    status: "all",
    loading: false,
    selected: null,
    deleting: null,
  };

  let sourcePill;
  let tableBody;
  let countElement;
  let searchInput;
  let statusFilter;
  let loadAlert;
  let loadAlertText;
  let addButton;

  let pakanDialog;
  let pakanForm;
  let pakanDialogTitle;
  let pakanDialogSubtitle;
  let pakanStockField;
  let pakanEditNote;
  let pakanSubmit;

  let stokDialog;
  let stokForm;
  let stokPakanName;
  let stokPakanCurrent;
  let stokSubmit;

  let hapusDialog;
  let hapusPakanName;
  let hapusAlert;
  let deleteSubmit;

  function cacheElements() {
    sourcePill = document.getElementById("data-source");
    tableBody = document.getElementById("pakan-body");
    countElement = document.getElementById("pakan-count");
    searchInput = document.getElementById("pakan-search");
    statusFilter = document.getElementById("pakan-filter");
    loadAlert = document.getElementById("load-alert");
    loadAlertText = document.getElementById("load-alert-text");
    addButton = document.getElementById("add-pakan");

    pakanDialog = document.getElementById("pakan-dialog");
    pakanForm = document.getElementById("pakan-form");
    pakanDialogTitle = document.getElementById("pakan-dialog-title");
    pakanDialogSubtitle = document.getElementById("pakan-dialog-subtitle");
    pakanStockField = document.getElementById("pakan-stok-field");
    pakanEditNote = document.getElementById("pakan-edit-note");
    pakanSubmit = document.getElementById("pakan-submit");

    stokDialog = document.getElementById("stok-dialog");
    stokForm = document.getElementById("stok-form");
    stokPakanName = document.getElementById("stok-pakan-name");
    stokPakanCurrent = document.getElementById("stok-pakan-current");
    stokSubmit = document.getElementById("stok-submit");

    hapusDialog = document.getElementById("hapus-dialog");
    hapusPakanName = document.getElementById("hapus-pakan-name");
    hapusAlert = document.getElementById("hapus-alert");
    deleteSubmit = document.getElementById("pakan-delete-submit");
  }

  function formatCount(filteredCount, totalCount) {
    if (filteredCount === totalCount) {
      return `${totalCount} jenis pakan`;
    }
    return `${filteredCount} dari ${totalCount} jenis pakan`;
  }

  function filteredItems() {
    const keyword = state.search.trim().toLowerCase();

    return state.items.filter((item) => {
      const meta = UI.getStockMeta(item.stok_kg, item.stok_awal);

      if (state.status !== "all" && meta.status !== state.status) {
        return false;
      }

      if (keyword && !item.nama_pakan.toLowerCase().includes(keyword)) {
        return false;
      }

      return true;
    });
  }

  function rowActionButtons(item) {
    return `
      <div class="row-actions flex flex-wrap items-center justify-end gap-0.5">
        <button type="button" data-action="edit" data-id="${item.id_pakan}"
          class="rounded-lg px-2 py-1.5 text-[11.5px] font-bold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Edit</button>
        <button type="button" data-action="stock" data-id="${item.id_pakan}"
          class="rounded-lg px-2 py-1.5 text-[11.5px] font-bold text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">Stok Masuk</button>
        <button type="button" data-action="delete" data-id="${item.id_pakan}"
          class="rounded-lg px-2 py-1.5 text-[11.5px] font-bold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">Hapus</button>
      </div>
    `;
  }

  function pakanRow(item, index) {
    const meta = UI.getStockMeta(item.stok_kg, item.stok_awal);
    const stockTone =
      meta.status === "warning"
        ? "text-amber-700"
        : meta.status === "critical"
          ? "text-rose-600"
          : "text-[#2b2b2b]";

    const rowTone =
      meta.status === "warning"
        ? "bg-amber-50/30 hover:bg-amber-50/60"
        : meta.status === "critical"
          ? "bg-rose-50/30 hover:bg-rose-50/60"
          : "hover:bg-[#f2f2f2]/70";

    return `
      <tr class="transition ${rowTone}">
        <td data-label="#" class="cell-index whitespace-nowrap px-5 py-3.5 text-[12px] font-semibold text-[#7f7f7f]">${String(
          index + 1,
        ).padStart(2, "0")}</td>
        <td data-label="Nama Pakan" class="px-5 py-3.5">
          <div class="flex flex-col items-end gap-0.5 md:items-start">
            <span class="text-[13px] font-extrabold text-[#2b2b2b]">${UI.escapeHTML(
              item.nama_pakan,
            )}</span>
            <span class="text-[10px] font-medium text-[#7f7f7f]">ID #${item.id_pakan}</span>
          </div>
        </td>
        <td data-label="Stok (kg)" class="whitespace-nowrap px-5 py-3.5">
          <span class="text-[13px] font-extrabold ${stockTone}">${UI.formatNumber(
            item.stok_kg,
          )}</span>
          <span class="text-[11px] font-medium text-[#7f7f7f]">kg</span>
        </td>
        <td data-label="Sisa Stok" class="px-5 py-3.5">
          <div class="progress-wrap flex min-w-[8rem] flex-col gap-1">
            <div class="h-2 overflow-hidden rounded-full bg-[#f2f2f2]">
              <div class="progress-fill h-full rounded-full bg-gradient-to-r ${meta.barClass}" style="width:${meta.percent}%"></div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-medium text-[#7f7f7f]">${meta.percent}%</span>
              <span class="text-[10px] font-medium text-[#7f7f7f]">${UI.formatNumber(
                meta.initial,
              )} kg</span>
            </div>
          </div>
        </td>
        <td data-label="Status" class="whitespace-nowrap px-5 py-3.5">
          <span class="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.badgeClass}">${meta.label}</span>
        </td>
        <td data-label="Aksi" class="cell-actions whitespace-nowrap px-5 py-3.5 text-right">
          ${rowActionButtons(item)}
        </td>
      </tr>
    `;
  }

  function renderTable() {
    if (!tableBody) {
      return;
    }

    if (!state.items.length) {
      tableBody.innerHTML = UI.tableEmptyRow(6, {
        title: "Belum ada pakan",
        text: "Tambahkan jenis pakan pertama supaya stok dan catatan harian bisa dikelola.",
        action:
          '<button type="button" data-empty-add class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-800">Tambah pakan</button>',
      });
      if (countElement) {
        countElement.textContent = "0 jenis pakan";
      }
      return;
    }

    const items = filteredItems();

    if (!items.length) {
      tableBody.innerHTML = UI.tableEmptyRow(6, {
        title: "Tidak ada hasil",
        text: "Coba kata kunci lain atau ubah filter status pakan.",
        action:
          '<button type="button" data-clear-filter class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#cccccc] bg-white px-3.5 py-2 text-xs font-bold text-[#2b2b2b] transition hover:bg-[#f2f2f2]">Bersihkan filter</button>',
      });
    } else {
      tableBody.innerHTML = items.map(pakanRow).join("");
    }

    if (countElement) {
      countElement.textContent = formatCount(items.length, state.items.length);
    }
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
      tableBody.innerHTML = UI.tableLoadingRow(6, 4);
    }
    if (countElement) {
      countElement.textContent = "Memuat data...";
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
      state.items = await window.SiKandangAPI.getPakan();
      renderTable();
    } catch (error) {
      const message =
        error && error.message ? error.message : "Gagal memuat data pakan.";
      showLoadError(message);

      if (tableBody) {
        tableBody.innerHTML = UI.tableErrorRow(6, message, "data-retry-load");
      }
      if (countElement) {
        countElement.textContent = "Data gagal dimuat";
      }
    } finally {
      state.loading = false;
    }
  }

  function openAddDialog() {
    pakanForm.reset();
    UI.clearFormErrors(pakanForm);
    pakanForm.elements.id_pakan.value = "";
    pakanDialogTitle.textContent = "Tambah Pakan";
    pakanDialogSubtitle.textContent =
      "Daftarkan jenis pakan baru beserta stok awalnya.";
    pakanStockField.classList.remove("hidden");
    pakanEditNote.classList.add("hidden");
    UI.openDialog(pakanDialog, addButton);
    setTimeout(() => pakanForm.elements.nama_pakan.focus(), 60);
  }

  function openEditDialog(item) {
    UI.clearFormErrors(pakanForm);
    pakanForm.elements.id_pakan.value = item.id_pakan;
    pakanForm.elements.nama_pakan.value = item.nama_pakan;
    pakanForm.elements.stok_kg.value = item.stok_kg;
    pakanDialogTitle.textContent = "Edit Pakan";
    pakanDialogSubtitle.textContent =
      "Perbarui nama pakan. Stok tidak diubah dari form ini.";
    pakanStockField.classList.add("hidden");
    pakanEditNote.classList.remove("hidden");
    state.selected = item;
    UI.openDialog(pakanDialog, document.activeElement);
    setTimeout(() => pakanForm.elements.nama_pakan.focus(), 60);
  }

  function openStockDialog(item) {
    stokForm.reset();
    UI.clearFormErrors(stokForm);
    stokForm.elements.id_pakan.value = item.id_pakan;
    stokPakanName.textContent = item.nama_pakan;
    stokPakanCurrent.textContent = `${UI.formatNumber(item.stok_kg)} kg`;
    state.selected = item;
    UI.openDialog(stokDialog, document.activeElement);
    setTimeout(() => stokForm.elements.jumlah.focus(), 60);
  }

  function openDeleteDialog(item) {
    if (hapusAlert) {
      hapusAlert.hidden = true;
      hapusAlert.textContent = "";
    }
    hapusPakanName.textContent = item.nama_pakan;
    state.deleting = item;
    UI.openDialog(hapusDialog, document.activeElement);
  }

  function resetFilters() {
    state.search = "";
    state.status = "all";
    if (searchInput) {
      searchInput.value = "";
    }
    if (statusFilter) {
      statusFilter.value = "all";
    }
    renderTable();
  }

  function fieldError(message, fieldName) {
    const errors = {};
    errors[fieldName] = message;
    return { message, errors };
  }

  async function handlePakanSubmit(event) {
    event.preventDefault();
    UI.clearFormErrors(pakanForm);

    const id = pakanForm.elements.id_pakan.value;
    const nama = pakanForm.elements.nama_pakan.value.trim();
    const stokValue = pakanForm.elements.stok_kg.value;
    const isEdit = Boolean(id);
    let valid = true;

    if (!nama) {
      UI.setFieldError(pakanForm, "nama_pakan", "Nama pakan wajib diisi.");
      valid = false;
    }

    if (!isEdit) {
      if (stokValue !== "" && Number(stokValue) < 0) {
        UI.setFieldError(
          pakanForm,
          "stok_kg",
          "Stok awal tidak boleh negatif.",
        );
        valid = false;
      } else if (stokValue !== "" && !Number.isFinite(Number(stokValue))) {
        UI.setFieldError(pakanForm, "stok_kg", "Stok awal harus berupa angka.");
        valid = false;
      }
    }

    if (!valid) {
      return;
    }

    UI.setButtonLoading(pakanSubmit, true, "Menyimpan...");

    try {
      if (isEdit) {
        await window.SiKandangAPI.updatePakan(id, { nama_pakan: nama });
        UI.toast("Nama pakan berhasil diperbarui.", "success");
      } else {
        await window.SiKandangAPI.addPakan({
          nama_pakan: nama,
          stok_kg: stokValue === "" ? 0 : Number(stokValue),
        });
        UI.toast("Pakan baru berhasil ditambahkan.", "success");
      }

      UI.closeDialog(pakanDialog);
      await load();
    } catch (error) {
      const applied = UI.applyDataErrors(pakanForm, error);
      if (!applied) {
        UI.showAlert(
          pakanForm.querySelector("[data-form-alert]"),
          error.message || "Gagal menyimpan pakan.",
        );
      }
    } finally {
      UI.setButtonLoading(pakanSubmit, false);
    }
  }

  async function handleStokSubmit(event) {
    event.preventDefault();
    UI.clearFormErrors(stokForm);

    const id = stokForm.elements.id_pakan.value;
    const jumlahValue = stokForm.elements.jumlah.value;
    const jumlah = Number(jumlahValue);

    if (jumlahValue === "" || !Number.isFinite(jumlah) || jumlah <= 0) {
      UI.setFieldError(
        stokForm,
        "jumlah",
        "Jumlah tambahan harus lebih dari 0 kg.",
      );
      return;
    }

    UI.setButtonLoading(stokSubmit, true, "Menambahkan...");

    try {
      await window.SiKandangAPI.addStokPakan(id, jumlah);
      UI.toast(`Stok bertambah ${UI.formatNumber(jumlah)} kg.`, "success");
      UI.closeDialog(stokDialog);
      await load();
    } catch (error) {
      const applied = UI.applyDataErrors(stokForm, error);
      if (!applied) {
        UI.showAlert(
          stokForm.querySelector("[data-form-alert]"),
          error.message || "Gagal menambah stok.",
        );
      }
    } finally {
      UI.setButtonLoading(stokSubmit, false);
    }
  }

  async function handleDelete() {
    if (!state.deleting) {
      return;
    }

    UI.setButtonLoading(deleteSubmit, true, "Menghapus...");

    try {
      await window.SiKandangAPI.deletePakan(state.deleting.id_pakan);
      UI.closeDialog(hapusDialog);
      UI.toast("Pakan berhasil dihapus.", "success");
      state.deleting = null;
      await load();
    } catch (error) {
      if (hapusAlert) {
        hapusAlert.hidden = false;
        hapusAlert.textContent = error.message || "Gagal menghapus pakan.";
      }
    } finally {
      UI.setButtonLoading(deleteSubmit, false);
    }
  }

  function attachInputCleanup(form) {
    if (!form) {
      return;
    }

    form.addEventListener("input", (event) => {
      const field = event.target;
      if (!field.name) {
        return;
      }
      field.removeAttribute("aria-invalid");
      const error = form.querySelector(`[data-field-error="${field.name}"]`);
      if (error) {
        error.classList.add("hidden");
      }
    });
  }

  function bindEvents() {
    if (addButton) {
      addButton.addEventListener("click", openAddDialog);
    }

    if (pakanForm) {
      pakanForm.addEventListener("submit", handlePakanSubmit);
      attachInputCleanup(pakanForm);
    }

    if (stokForm) {
      stokForm.addEventListener("submit", handleStokSubmit);
      attachInputCleanup(stokForm);
    }

    if (deleteSubmit) {
      deleteSubmit.addEventListener("click", handleDelete);
    }

    if (searchInput) {
      const searchHandler = UI.debounce(() => {
        state.search = searchInput.value;
        renderTable();
      }, 180);

      searchInput.addEventListener("input", searchHandler);
    }

    if (statusFilter) {
      statusFilter.addEventListener("change", () => {
        state.status = statusFilter.value;
        renderTable();
      });
    }

    if (tableBody) {
      tableBody.addEventListener("click", (event) => {
        const addEmpty = event.target.closest("[data-empty-add]");
        if (addEmpty) {
          openAddDialog();
          return;
        }

        const clearFilter = event.target.closest("[data-clear-filter]");
        if (clearFilter) {
          resetFilters();
          return;
        }

        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) {
          return;
        }

        const item = state.items.find(
          (pakan) => Number(pakan.id_pakan) === Number(actionButton.dataset.id),
        );

        if (!item) {
          return;
        }

        if (actionButton.dataset.action === "edit") {
          openEditDialog(item);
        } else if (actionButton.dataset.action === "stock") {
          openStockDialog(item);
        } else if (actionButton.dataset.action === "delete") {
          openDeleteDialog(item);
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
