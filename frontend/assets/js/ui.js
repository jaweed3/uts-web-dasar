(function () {
  "use strict";

  let uiReady = false;

  const numberFormatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  });

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      (character) => escapeMap[character]
    );
  }

  function formatNumber(value, maximumFractionDigits = 2) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "0";
    }
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits,
    }).format(number);
  }

  function formatKg(value, digits = 2) {
    return `${formatNumber(value, digits)} kg`;
  }

  function parseDate(value, withTime) {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    const text = String(value).trim();
    const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnly) {
      return new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      );
    }

    const dateTime = text.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/
    );

    if (dateTime) {
      return new Date(
        Number(dateTime[1]),
        Number(dateTime[2]) - 1,
        Number(dateTime[3]),
        Number(dateTime[4] || 0),
        Number(dateTime[5] || 0),
        Number(dateTime[6] || 0)
      );
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatDate(value) {
    const date = parseDate(value, false);
    return date ? dateFormatter.format(date) : "—";
  }

  function formatDateTime(value) {
    const date = parseDate(value, true);
    if (!date) {
      return "—";
    }
    return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`;
  }

  function todayISO() {
    const today = new Date();
    const pad = (number) => String(number).padStart(2, "0");
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
      today.getDate()
    )}`;
  }

  function debounce(fn, delay = 250) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function getStockMeta(stok, stokAwal) {
    const value = Math.max(0, Number(stok) || 0);
    const initial = Number(stokAwal) > 0 ? Number(stokAwal) : 100;
    const percent = Math.max(
      0,
      Math.min(100, Math.round((value / initial) * 100))
    );

    let status = "success";
    let label = "Aman";
    let badgeClass = "bg-green-100 text-green-800";
    let barClass = "from-green-600 to-green-500";
    let borderClass = "border-slate-200";

    if (value <= 0) {
      status = "critical";
      label = "Habis";
      badgeClass = "bg-rose-100 text-rose-700";
      barClass = "from-rose-600 to-rose-400";
      borderClass = "border-rose-300";
    } else if (percent <= 10) {
      status = "critical";
      label = "Kritis";
      badgeClass = "bg-rose-100 text-rose-700";
      barClass = "from-rose-600 to-rose-400";
      borderClass = "border-rose-300";
    } else if (percent <= 30) {
      status = "warning";
      label = "Stok Menipis";
      badgeClass = "bg-amber-100 text-amber-800";
      barClass = "from-amber-600 to-amber-400";
      borderClass = "border-amber-300";
    }

    return {
      value,
      initial,
      percent,
      status,
      label,
      badgeClass,
      barClass,
      borderClass,
      note: `${percent}% dari ${
        Number(stokAwal) > 0 ? "stok awal" : "kapasitas acuan"
      } ${formatNumber(initial)} kg`,
    };
  }

  function setSourcePill(element, info) {
    if (!element) {
      return;
    }

    const isApi = info && info.mode === "api";
    element.className =
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm";
    element.innerHTML = `<span class="h-1.5 w-1.5 rounded-full ${
      isApi ? "bg-green-500" : "bg-amber-500"
    }"></span>${isApi ? "API terhubung" : "Mode demo"}`;
    element.title = isApi
      ? `Data diambil dari ${info.apiBase}`
      : info && info.lastError
      ? `${info.lastError} Data demo disimpan di browser.`
      : "Data demo disimpan di browser.";
    element.setAttribute("aria-label", element.title);
  }

  

  const toastTitles = {
    success: "Berhasil",
    error: "Gagal",
    info: "Informasi",
  };

  const toastIcons = {
    success:
      '<path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    error:
      '<path d="M12 8v5m0 3h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    info:
      '<path d="M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  };

  function toast(message, type = "success", title = "") {
    let stack = document.getElementById("toast-stack");

    if (!stack) {
      stack = document.createElement("div");
      stack.id = "toast-stack";
      stack.className =
        "toast-stack fixed bottom-4 right-4 z-[120] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2.5";
      stack.setAttribute("aria-live", "polite");
      stack.setAttribute("aria-atomic", "false");
      document.body.appendChild(stack);
    }

    while (stack.children.length >= 4) {
      stack.removeChild(stack.firstElementChild);
    }

    const toastType = ["success", "error", "info"].includes(type)
      ? type
      : "success";
    const tone = {
      success: {
        ring: "border-green-200",
        icon: "bg-green-100 text-green-700",
      },
      error: {
        ring: "border-rose-200",
        icon: "bg-rose-100 text-rose-700",
      },
      info: {
        ring: "border-amber-200",
        icon: "bg-amber-100 text-amber-700",
      },
    }[toastType];

    const element = document.createElement("div");
    element.className = `animate-toast-in flex items-start gap-3 rounded-2xl border ${tone.ring} bg-white p-3.5 text-slate-800 shadow-float`;
    element.setAttribute("role", "status");
    element.innerHTML = `
      <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full ${tone.icon}">
        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">${toastIcons[toastType]}</svg>
      </span>
      <div class="min-w-0 flex-1 pt-0.5">
        <p class="toast-title text-xs font-extrabold text-slate-900"></p>
        <p class="toast-message mt-0.5 text-[11.5px] leading-5 text-slate-500"></p>
      </div>
      <button type="button" class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup notifikasi">
        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    element.querySelector(".toast-title").textContent =
      title || toastTitles[toastType];
    element.querySelector(".toast-message").textContent = message || "";

    const closeButton = element.querySelector("button");
    let removed = false;

    const remove = () => {
      if (removed) {
        return;
      }
      removed = true;
      element.classList.add("opacity-0", "translate-y-2");
      element.style.transition = "opacity .18s ease, transform .18s ease";
      setTimeout(() => element.remove(), 190);
    };

    closeButton.addEventListener("click", remove);
    stack.appendChild(element);
    setTimeout(remove, toastType === "error" ? 6500 : 4500);
  }

  

  function openDialog(dialogOrId, trigger) {
    const dialog =
      typeof dialogOrId === "string"
        ? document.getElementById(dialogOrId)
        : dialogOrId;

    if (!dialog) {
      return null;
    }

    dialog._returnFocus = trigger || document.activeElement;

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.setAttribute("open", "");
    }

    document.body.classList.add("modal-open");
    return dialog;
  }

  function closeDialog(dialogOrId) {
    const dialog =
      typeof dialogOrId === "string"
        ? document.getElementById(dialogOrId)
        : dialogOrId;

    if (!dialog) {
      return;
    }

    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      document.body.classList.remove("modal-open");
    }
  }

  function setupDialogs() {
    document.querySelectorAll("dialog.modal").forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target.closest("[data-close]")) {
          dialog.close();
          return;
        }

        if (event.target === dialog) {
          dialog.close();
        }
      });

      dialog.addEventListener("close", () => {
        if (!document.querySelector("dialog[open]")) {
          document.body.classList.remove("modal-open");
        }

        if (dialog._returnFocus && document.contains(dialog._returnFocus)) {
          dialog._returnFocus.focus();
        }
        dialog._returnFocus = null;
      });
    });
  }

  
  function hideAlert(element) {
    if (!element) {
      return;
    }
    element.hidden = true;
    element.textContent = "";
  }

  function showAlert(element, message, type = "error") {
    if (!element) {
      return;
    }

    const tone =
      type === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : type === "info"
        ? "border-sky-200 bg-sky-50 text-sky-800"
        : "border-rose-200 bg-rose-50 text-rose-700";

    element.className = `flex items-start gap-2 rounded-xl border px-3.5 py-3 text-xs font-semibold leading-5 ${tone}`;
    element.textContent = message;
    element.hidden = false;
  }

  function clearFormErrors(form) {
    if (!form) {
      return;
    }

    form.querySelectorAll("[data-field-error]").forEach((element) => {
      element.textContent = "";
      element.classList.add("hidden");
    });

    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

    hideAlert(form.querySelector("[data-form-alert]"));
  }

  function setFieldError(form, fieldName, message) {
    if (!form) {
      return;
    }

    const field =
      form.elements[fieldName] || form.querySelector(`[name="${fieldName}"]`);
    const error = form.querySelector(
      `[data-field-error="${String(fieldName).replace(/"/g, '\\"')}"]`
    );

    if (field) {
      field.setAttribute("aria-invalid", "true");
    }

    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
  }

  function applyDataErrors(form, error) {
    if (!form || !error) {
      return false;
    }

    let applied = false;

    if (error.errors && typeof error.errors === "object") {
      Object.keys(error.errors).forEach((fieldName) => {
        if (form.elements[fieldName]) {
          setFieldError(form, fieldName, error.errors[fieldName]);
          applied = true;
        }
      });
    }

    return applied;
  }

  function setButtonLoading(button, loading, loadingLabel = "Memproses...") {
    if (!button) {
      return;
    }

    if (loading) {
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
      }
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.innerHTML = `<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true"></span><span>${escapeHTML(
        loadingLabel
      )}</span>`;
      return;
    }

    button.disabled = false;
    button.removeAttribute("aria-busy");

    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
  }

  

  function tableStateRow(colspan, content) {
    return `<tr class="state-row"><td colspan="${colspan}">${content}</td></tr>`;
  }

  function emptyState(options = {}) {
    const title = escapeHTML(options.title || "Belum ada data");
    const text = escapeHTML(options.text || "Data akan muncul di sini.");
    const action = options.action || "";

    return `
      <div class="flex flex-col items-center justify-center px-5 py-10 text-center">
        <span class="grid h-12 w-12 place-items-center rounded-2xl bg-green-50 text-green-700">
          <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6" aria-hidden="true">
            <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            <path d="m4.5 7.5 7.5 4.2 7.5-4.2M12 21v-9.3" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
          </svg>
        </span>
        <h3 class="mt-3.5 text-sm font-extrabold text-slate-900">${title}</h3>
        <p class="mt-1 max-w-sm text-xs leading-5 text-slate-500">${text}</p>
        ${action}
      </div>
    `;
  }

  function tableEmptyRow(colspan, options = {}) {
    return tableStateRow(colspan, emptyState(options));
  }

  function tableLoadingRow(colspan, rows = 4) {
    const lineWidths = ["w-2/3", "w-1/2", "w-3/4", "w-2/5"];

    return tableStateRow(
      colspan,
      `<div class="space-y-3 px-5 py-5">${Array.from({ length: rows })
        .map(
          (_, index) => `
            <div class="flex items-center gap-4">
              <span class="skeleton skeleton--circle h-8 w-8 shrink-0"></span>
              <span class="skeleton skeleton--text ${lineWidths[index % lineWidths.length]}"></span>
              <span class="skeleton skeleton--text ml-auto w-16 shrink-0"></span>
            </div>
          `
        )
        .join("")}</div>`
    );
  }

  function tableErrorRow(colspan, message, retryAttribute = "data-retry") {
    return tableStateRow(
      colspan,
      `<div class="flex flex-col items-center justify-center gap-3 px-5 py-10 text-center">
        <span class="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
            <path d="M12 9v4m0 3h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <p class="max-w-md text-xs font-semibold leading-5 text-rose-700">${escapeHTML(
          message
        )}</p>
        <button type="button" ${retryAttribute} class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
          Coba lagi
        </button>
      </div>`
    );
  }

  

  function setActiveNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const active = link.dataset.nav === page;
      link.classList.toggle("bg-green-50", active);
      link.classList.toggle("text-green-700", active);
      link.classList.toggle("text-slate-500", !active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setupNavigation() {
    const nav = document.getElementById("primary-nav");
    const toggle = document.getElementById("nav-toggle");
    const backdrop = document.getElementById("nav-backdrop");

    if (!nav || !toggle) {
      return;
    }

    const openMenu = () => {
      nav.classList.remove("hidden");
      nav.classList.add("flex");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Tutup menu");
      if (backdrop) {
        backdrop.classList.remove("hidden");
      }
      document.body.classList.add("menu-open");
    };

    const closeMenu = () => {
      nav.classList.add("hidden");
      nav.classList.remove("flex");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Buka menu");
      if (backdrop) {
        backdrop.classList.add("hidden");
      }
      document.body.classList.remove("menu-open");
    };

    toggle.addEventListener("click", () => {
      if (nav.classList.contains("hidden")) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeMenu);
    }

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 768) {
          closeMenu();
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    });
  }

  function init() {
    if (uiReady) {
      return;
    }
    uiReady = true;
    setActiveNav();
    setupNavigation();
    setupDialogs();
  }

  document.addEventListener("DOMContentLoaded", init);

  window.UI = {
    escapeHTML,
    formatNumber,
    formatKg,
    formatDate,
    formatDateTime,
    todayISO,
    debounce,
    getStockMeta,
    setSourcePill,
    toast,
    openDialog,
    closeDialog,
    hideAlert,
    showAlert,
    clearFormErrors,
    setFieldError,
    applyDataErrors,
    setButtonLoading,
    tableStateRow,
    tableEmptyRow,
    tableLoadingRow,
    tableErrorRow,
    emptyState,
  };
})();
