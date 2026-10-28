(function () {
  "use strict";

  if (document.body.dataset.page !== "catatan") {
    return;
  }

  const state = {
    items: [],
    pakan: [],
    search: "",
    filter: "all",
    loading: false,
    capabilities: {
      editCatatan: false,
      deleteCatatan: false,
    },
    editing: null,
    deleting: null,
  };

  let sourcePill;
  let loadAlert;
  let loadAlertText;
  let tableBody;
  let countElement;
  let searchInput;
  let filterSelect;
  let modeNote;
  let orderNote;

  let form;
  let pakanSelect;
  let pakanStockHint;
  let submitButton;
  let resetButton;

  let detailDialog;
  let detailContent;

  let editDialog;
  let editForm;
  let editPakanSelect;
  let editStockHint;
  let editSubmit;

  let hapusDialog;
  let hapusLabel;
  let hapusAlert;
  let deleteSubmit;

  function cacheElements() {
    sourcePill = document.getElementById("data-source");
    loadAlert = document.getElementById("load-alert");
    loadAlertText = document.getElementById("load-alert-text");
    tableBody = document.getElementById("catatan-body");
    countElement = document.getElementById("catatan-count");
    searchInput = document.getElementById("catatan-search");
    filterSelect = document.getElementById("catatan-filter");
    modeNote = document.getElementById("catatan-mode-note");
    orderNote = document.getElementById("catatan-order-note");

    form = document.getElementById("catatan-form");
    pakanSelect = document.getElementById("new-pakan");
    pakanStockHint = document.getElementById("new-pakan-stock-hint");
    submitButton = document.getElementById("catatan-submit");
    resetButton = document.getElementById("catatan-reset");

    detailDialog = document.getElementById("detail-dialog");
    detailContent = document.getElementById("detail-content");

    editDialog = document.getElementById("edit-dialog");
    editForm = document.getElementById("edit-catatan-form");
    editPakanSelect = document.getElementById("edit-pakan");
    editStockHint = document.getElementById("edit-pakan-stock-hint");
    editSubmit = document.getElementById("edit-submit");

    hapusDialog = document.getElementById("hapus-dialog");
    hapusLabel = document.getElementById("hapus-catatan-label");
    hapusAlert = document.getElementById("hapus-alert");
    deleteSubmit = document.getElementById("catatan-delete-submit");
  }

  function findPakan(id) {
    return state.pakan.find((item) => Number(item.id_pakan) === Number(id));
  }

  function findCatatan(id) {
    return state.items.find((item) => Number(item.id_beri) === Number(id));
  }

  function setDefaultDate() {
    if (!form) {
      return;
    }
    const dateInput = form.elements.tanggal;
    if (!dateInput.value) {
      dateInput.value = UI.todayISO();
    }
  }

  function optionLabel(item) {
    return `${item.nama_pakan} — sisa ${UI.formatNumber(item.stok_kg)} kg`;
  }

  function renderPakanOptions(select, selectedId) {
    if (!select) {
      return;
    }

    const selected = selectedId == null ? "" : String(selectedId);

    if (!state.pakan.length) {
      select.innerHTML = '<option value="">Belum ada data pakan</option>';
      return;
    }

    select.innerHTML =
      '<option value="">Pilih pakan</option>' +
      state.pakan
        .map(
          (item) =>
            `<option value="${item.id_pakan}" ${
              String(item.id_pakan) === selected ? "selected" : ""
            }>${UI.escapeHTML(optionLabel(item))}</option>`,
        )
        .join("");
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
              item.nama_pakan,
            )}</option>`,
        )
        .join("");

    const exists = state.pakan.some(
      (item) => String(item.id_pakan) === String(current),
    );
    state.filter = current === "all" || exists ? current : "all";
    filterSelect.value = state.filter;
  }

  function updateStockHint(select, hintElement, fallbackText) {
    if (!select || !hintElement) {
      return;
    }

    const item = findPakan(select.value);

    if (item) {
      hintElement.textContent = `Sisa stok ${UI.formatNumber(item.stok_kg)} kg`;
      hintElement.className = "mt-1 text-[11px] font-semibold text-brand-700";
    } else {
      hintElement.textContent = fallbackText;
      hintElement.className = "mt-1 text-[11px] text-[#7f7f7f]";
    }
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
        !item.kandang.toLowerCase().includes(keyword) &&
        !item.nama_pakan.toLowerCase().includes(keyword)
      ) {
        return false;
      }

      return true;
    });
  }

  function actionButtons(item) {
    const detail = `<button type="button" data-action="detail" data-id="${item.id_beri}" class="rounded-lg px-2 py-1.5 text-[11.5px] font-bold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Detail</button>`;

    if (!state.capabilities.editCatatan) {
      return detail;
    }

    return `
      <div class="row-actions flex flex-wrap items-center justify-end gap-0.5">
        ${detail}
        <button type="button" data-action="edit" data-id="${item.id_beri}" class="rounded-lg px-2 py-1.5 text-[11.5px] font-bold text-[#595959] transition hover:bg-[#f2f2f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7f7f7f]">Edit</button>
        <button type="button" data-action="delete" data-id="${item.id_beri}" class="rounded-lg px-2 py-1.5 text-[11.5px] font-bold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">Hapus</button>
      </div>
    `;
  }

  function catatanRow(item) {
    return `
      <tr class="transition hover:bg-[#f2f2f2]/70">
        <td data-label="Tanggal" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-[#595959]">${UI.formatDate(
          item.tanggal,
        )}</td>
        <td data-label="Kandang" class="whitespace-nowrap px-5 py-3.5">
          <span class="inline-flex rounded-lg bg-[#f2f2f2] px-2 py-1 text-[11px] font-extrabold text-[#2b2b2b]">${UI.escapeHTML(
            item.kandang,
          )}</span>
        </td>
        <td data-label="Pakan" class="px-5 py-3.5 text-[13px] text-[#595959]">${UI.escapeHTML(
          item.nama_pakan,
        )}</td>
        <td data-label="Pakan (kg)" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-[#595959]">${UI.formatNumber(
          item.jumlah_pakan_kg,
        )}</td>
        <td data-label="Telur" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-[#595959]">${UI.formatNumber(
          item.jumlah_telur,
          0,
        )} butir</td>
        <td data-label="Berat (kg)" class="whitespace-nowrap px-5 py-3.5 text-[13px] text-[#595959]">${UI.formatNumber(
          item.berat_telur_kg,
        )}</td>
        <td data-label="Aksi" class="cell-actions whitespace-nowrap px-5 py-3.5 text-right">${actionButtons(
          item,
        )}</td>
      </tr>
    `;
  }

  function renderTable() {
    if (!tableBody) {
      return;
    }

    if (!state.items.length) {
      tableBody.innerHTML = UI.tableEmptyRow(7, {
        title: "Belum ada catatan harian",
        text: "Isi form di atas untuk mencatat pemberian pakan dan panen telur pertama.",
        action:
          '<button type="button" data-focus-form class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-800">Isi form catatan</button>',
      });
      if (countElement) {
        countElement.textContent = "0 catatan";
      }
      return;
    }

    const items = filteredItems();

    if (!items.length) {
      tableBody.innerHTML = UI.tableEmptyRow(7, {
        title: "Tidak ada hasil",
        text: "Coba kata kunci lain atau ubah filter pakan.",
        action:
          '<button type="button" data-clear-filter class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#cccccc] bg-white px-3.5 py-2 text-xs font-bold text-[#2b2b2b] transition hover:bg-[#f2f2f2]">Bersihkan filter</button>',
      });
    } else {
      tableBody.innerHTML = items.map(catatanRow).join("");
    }

    if (countElement) {
      countElement.textContent =
        items.length === state.items.length
          ? `${state.items.length} catatan`
          : `${items.length} dari ${state.items.length} catatan`;
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
      tableBody.innerHTML = UI.tableLoadingRow(7, 5);
    }
    if (countElement) {
      countElement.textContent = "Memuat data...";
    }
  }

  function updateModeNote(info) {
    const canEdit = Boolean(
      info && info.capabilities && info.capabilities.editCatatan,
    );
    state.capabilities.editCatatan = canEdit;
    state.capabilities.deleteCatatan = Boolean(
      info && info.capabilities && info.capabilities.deleteCatatan,
    );

    if (modeNote) {
      modeNote.classList.toggle("hidden", canEdit);
    }
    if (orderNote) {
      orderNote.classList.toggle("hidden", !canEdit);
    }
  }

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;
    hideLoadError();
    setLoadingState();

    const currentPakanValue = pakanSelect ? pakanSelect.value : "";
    const currentEditPakanValue = editPakanSelect ? editPakanSelect.value : "";

    try {
      const info = await window.SiKandangAPI.init();
      UI.setSourcePill(sourcePill, info);
      updateModeNote(info);

      const [pakan, catatan] = await Promise.all([
        window.SiKandangAPI.getPakan(),
        window.SiKandangAPI.getCatatan(),
      ]);

      state.pakan = pakan;
      state.items = catatan;

      renderPakanOptions(pakanSelect, currentPakanValue);
      renderPakanOptions(editPakanSelect, currentEditPakanValue);
      renderFilterOptions();
      updateStockHint(
        pakanSelect,
        pakanStockHint,
        "Pilih pakan untuk melihat sisa stok.",
      );
      updateStockHint(
        editPakanSelect,
        editStockHint,
        "Sisa stok mengikuti data terbaru.",
      );
      setDefaultDate();
      renderTable();
    } catch (error) {
      const message =
        error && error.message ? error.message : "Gagal memuat catatan harian.";
      showLoadError(message);

      if (tableBody) {
        tableBody.innerHTML = UI.tableErrorRow(7, message, "data-retry-load");
      }
      if (countElement) {
        countElement.textContent = "Data gagal dimuat";
      }
    } finally {
      state.loading = false;
    }
  }

  function collectValues(formElement) {
    return {
      kandang: String(formElement.elements.kandang.value || "").trim(),
      id_pakan: formElement.elements.id_pakan.value,
      tanggal: String(formElement.elements.tanggal.value || ""),
      jumlah_pakan_kg: formElement.elements.jumlah_pakan_kg.value,
      jumlah_telur: formElement.elements.jumlah_telur.value,
      berat_telur_kg: formElement.elements.berat_telur_kg.value,
    };
  }

  function validateValues(formElement, raw, current) {
    let valid = true;
    const pakan = findPakan(raw.id_pakan);
    const feed = Number(raw.jumlah_pakan_kg);
    const eggs = Number(raw.jumlah_telur);
    const weight = Number(raw.berat_telur_kg);

    if (!raw.kandang) {
      UI.setFieldError(formElement, "kandang", "Kandang wajib diisi.");
      valid = false;
    }

    if (!raw.id_pakan) {
      UI.setFieldError(formElement, "id_pakan", "Pilih jenis pakan.");
      valid = false;
    }

    if (raw.jumlah_pakan_kg === "" || !Number.isFinite(feed) || feed <= 0) {
      UI.setFieldError(
        formElement,
        "jumlah_pakan_kg",
        "Jumlah pakan harus lebih dari 0 kg.",
      );
      valid = false;
    }

    if (
      raw.jumlah_telur === "" ||
      !Number.isFinite(eggs) ||
      !Number.isInteger(eggs) ||
      eggs < 0
    ) {
      UI.setFieldError(
        formElement,
        "jumlah_telur",
        "Jumlah telur harus bilangan bulat 0 atau lebih.",
      );
      valid = false;
    }

    if (raw.berat_telur_kg === "" || !Number.isFinite(weight) || weight < 0) {
      UI.setFieldError(
        formElement,
        "berat_telur_kg",
        "Berat telur harus angka 0 atau lebih.",
      );
      valid = false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.tanggal)) {
      UI.setFieldError(formElement, "tanggal", "Tanggal wajib diisi.");
      valid = false;
    }

    if (pakan && Number.isFinite(feed) && feed > 0) {
      let available = pakan.stok_kg;

      if (current && Number(current.id_pakan) === Number(pakan.id_pakan)) {
        available += Number(current.jumlah_pakan_kg);
      }

      if (feed > available + 0.0001) {
        UI.setFieldError(
          formElement,
          "jumlah_pakan_kg",
          `Melebihi stok tersedia (${UI.formatNumber(available)} kg).`,
        );
        valid = false;
      }
    }

    if (!valid) {
      return null;
    }

    return {
      kandang: raw.kandang,
      id_pakan: Number(raw.id_pakan),
      tanggal: raw.tanggal,
      jumlah_pakan_kg: feed,
      jumlah_telur: Math.trunc(eggs),
      berat_telur_kg: weight,
    };
  }

  function attachFieldCleanup(formElement) {
    if (!formElement) {
      return;
    }

    const cleanup = (event) => {
      const field = event.target;
      if (!field.name) {
        return;
      }
      field.removeAttribute("aria-invalid");
      const error = formElement.querySelector(
        `[data-field-error="${field.name}"]`,
      );
      if (error) {
        error.classList.add("hidden");
      }
    };

    formElement.addEventListener("input", cleanup);
    formElement.addEventListener("change", cleanup);
  }

  async function handleCreateSubmit(event) {
    event.preventDefault();
    UI.clearFormErrors(form);

    const raw = collectValues(form);
    const values = validateValues(form, raw, null);

    if (!values) {
      return;
    }

    UI.setButtonLoading(submitButton, true, "Menyimpan...");

    try {
      await window.SiKandangAPI.addCatatan(values);
      UI.toast("Catatan harian berhasil disimpan.", "success");
      form.reset();
      setDefaultDate();
      updateStockHint(
        pakanSelect,
        pakanStockHint,
        "Pilih pakan untuk melihat sisa stok.",
      );
      await load();
      const kandangInput = document.getElementById("new-kandang");
      if (kandangInput) {
        kandangInput.focus();
      }
    } catch (error) {
      const applied = UI.applyDataErrors(form, error);
      if (!applied) {
        UI.showAlert(
          form.querySelector("[data-form-alert]"),
          error.message || "Gagal menyimpan catatan harian.",
        );
      }
    } finally {
      UI.setButtonLoading(submitButton, false);
    }
  }

  function openDetail(item, trigger) {
    if (!detailContent) {
      return;
    }

    const cards = [
      ["Tanggal", UI.formatDate(item.tanggal)],
      ["Kandang", item.kandang],
      ["Jenis pakan", item.nama_pakan],
      ["Pakan diberikan", `${UI.formatNumber(item.jumlah_pakan_kg)} kg`],
      ["Jumlah telur", `${UI.formatNumber(item.jumlah_telur, 0)} butir`],
      ["Berat telur", `${UI.formatNumber(item.berat_telur_kg)} kg`],
    ];

    detailContent.innerHTML = `
      <div class="grid gap-3 sm:grid-cols-2">
        ${cards
          .map(
            ([label, value]) => `
              <div class="rounded-xl border border-[#cccccc] bg-[#f2f2f2]/70 px-3.5 py-3">
                <span class="text-[10px] font-bold uppercase tracking-[0.07em] text-[#7f7f7f]">${UI.escapeHTML(
                  label,
                )}</span>
                <p class="mt-1 text-sm font-extrabold text-[#2b2b2b]">${UI.escapeHTML(
                  value,
                )}</p>
              </div>
            `,
          )
          .join("")}
      </div>
      <div class="mt-4 flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3.5 py-3 text-[11px] font-semibold text-brand-800">
        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4 shrink-0" aria-hidden="true">
          <path d="M12 8v5m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
        </svg>
        ID catatan #${item.id_beri} — tersimpan sebagai satu transaksi pemberian pakan + panen telur.
      </div>
    `;

    UI.openDialog(detailDialog, trigger);
  }

  function openEdit(item, trigger) {
    if (!editForm) {
      return;
    }

    state.editing = item;
    UI.clearFormErrors(editForm);
    renderPakanOptions(editPakanSelect, item.id_pakan);
    editForm.elements.id_beri.value = item.id_beri;
    editForm.elements.kandang.value = item.kandang;
    editForm.elements.tanggal.value = item.tanggal;
    editForm.elements.jumlah_pakan_kg.value = item.jumlah_pakan_kg;
    editForm.elements.jumlah_telur.value = item.jumlah_telur;
    editForm.elements.berat_telur_kg.value = item.berat_telur_kg;
    updateStockHint(
      editPakanSelect,
      editStockHint,
      "Sisa stok mengikuti data terbaru.",
    );
    UI.openDialog(editDialog, trigger);
    setTimeout(() => editForm.elements.kandang.focus(), 60);
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!state.editing) {
      return;
    }

    UI.clearFormErrors(editForm);
    const raw = collectValues(editForm);
    const values = validateValues(editForm, raw, state.editing);

    if (!values) {
      return;
    }

    UI.setButtonLoading(editSubmit, true, "Menyimpan...");

    try {
      await window.SiKandangAPI.updateCatatan(state.editing.id_beri, values);
      UI.toast("Catatan berhasil diperbarui.", "success");
      UI.closeDialog(editDialog);
      state.editing = null;
      await load();
    } catch (error) {
      const applied = UI.applyDataErrors(editForm, error);
      if (!applied) {
        UI.showAlert(
          editForm.querySelector("[data-form-alert]"),
          error.message || "Gagal memperbarui catatan.",
        );
      }
    } finally {
      UI.setButtonLoading(editSubmit, false);
    }
  }

  function openDelete(item, trigger) {
    state.deleting = item;
    if (hapusAlert) {
      hapusAlert.hidden = true;
      hapusAlert.textContent = "";
    }
    if (hapusLabel) {
      hapusLabel.textContent = `#${item.id_beri} — Kandang ${item.kandang} (${UI.formatDate(
        item.tanggal,
      )})`;
    }
    UI.openDialog(hapusDialog, trigger);
  }

  async function handleDelete() {
    if (!state.deleting) {
      return;
    }

    UI.setButtonLoading(deleteSubmit, true, "Menghapus...");

    try {
      await window.SiKandangAPI.deleteCatatan(state.deleting.id_beri);
      UI.toast("Catatan berhasil dihapus dan stok dikembalikan.", "success");
      UI.closeDialog(hapusDialog);
      state.deleting = null;
      await load();
    } catch (error) {
      if (hapusAlert) {
        hapusAlert.hidden = false;
        hapusAlert.textContent = error.message || "Gagal menghapus catatan.";
      }
    } finally {
      UI.setButtonLoading(deleteSubmit, false);
    }
  }

  function resetFilters() {
    state.search = "";
    state.filter = "all";
    if (searchInput) {
      searchInput.value = "";
    }
    if (filterSelect) {
      filterSelect.value = "all";
    }
    renderTable();
  }

  function bindEvents() {
    if (form) {
      form.addEventListener("submit", handleCreateSubmit);
      attachFieldCleanup(form);
      form.addEventListener("reset", () => {
        setTimeout(() => {
          setDefaultDate();
          updateStockHint(
            pakanSelect,
            pakanStockHint,
            "Pilih pakan untuk melihat sisa stok.",
          );
        }, 0);
      });

      if (pakanSelect) {
        pakanSelect.addEventListener("change", () => {
          updateStockHint(
            pakanSelect,
            pakanStockHint,
            "Pilih pakan untuk melihat sisa stok.",
          );
        });
      }
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        UI.clearFormErrors(form);
      });
    }

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        UI.debounce(() => {
          state.search = searchInput.value;
          renderTable();
        }, 180),
      );
    }

    if (filterSelect) {
      filterSelect.addEventListener("change", () => {
        state.filter = filterSelect.value;
        renderTable();
      });
    }

    if (tableBody) {
      tableBody.addEventListener("click", (event) => {
        const focusForm = event.target.closest("[data-focus-form]");
        if (focusForm) {
          const kandangInput = document.getElementById("new-kandang");
          if (kandangInput) {
            kandangInput.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            setTimeout(() => kandangInput.focus(), 350);
          }
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

        const item = findCatatan(actionButton.dataset.id);
        if (!item) {
          return;
        }

        if (actionButton.dataset.action === "detail") {
          openDetail(item, actionButton);
        } else if (actionButton.dataset.action === "edit") {
          openEdit(item, actionButton);
        } else if (actionButton.dataset.action === "delete") {
          openDelete(item, actionButton);
        }
      });
    }

    if (editForm) {
      editForm.addEventListener("submit", handleEditSubmit);
      attachFieldCleanup(editForm);
      if (editPakanSelect) {
        editPakanSelect.addEventListener("change", () => {
          updateStockHint(
            editPakanSelect,
            editStockHint,
            "Sisa stok mengikuti data terbaru.",
          );
        });
      }
    }

    if (deleteSubmit) {
      deleteSubmit.addEventListener("click", handleDelete);
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
    setDefaultDate();
    load();
  });
})();
