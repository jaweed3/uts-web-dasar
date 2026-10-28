(function () {
  "use strict";

  const config = window.SIKANDANG_CONFIG || {};
  const API_BASE = String(
    config.API_BASE_URL || "http://localhost:8000/sikandang/api",
  ).replace(/\/+$/, "");
  const PREFERRED_MODE = ["auto", "api", "demo"].includes(config.MODE)
    ? config.MODE
    : "auto";
  const REQUEST_TIMEOUT_MS = Number(config.REQUEST_TIMEOUT_MS) || 6000;
  const DETECT_TIMEOUT_MS = Number(config.DETECT_TIMEOUT_MS) || 1600;
  const STORAGE_KEY = "sikandang.frontend.demo.v1";
  const DEMO_DELAY_MS = 180;

  let mode = PREFERRED_MODE === "demo" ? "demo" : null;
  let fallbackToDemo = false;
  let lastConnectionError = null;
  let initPromise = null;
  let memoryStore = null;

  class DataError extends Error {
    constructor(message, status = 0, errors = null) {
      super(message);
      this.name = "DataError";
      this.status = status;
      this.errors = errors;
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function round2(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function timestampFor(dateString) {
    const now = new Date();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(dateString))
      ? dateString
      : `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    return `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function seedStore() {
    return {
      version: 1,
      pakan: [
        { id_pakan: 1, nama_pakan: "Konsentrat", stok_kg: 95, stok_awal: 120 },
        { id_pakan: 2, nama_pakan: "Bekatul", stok_kg: 12, stok_awal: 50 },
        {
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          stok_kg: 75,
          stok_awal: 125,
        },
      ],
      catatan: [
        {
          id_beri: 1,
          kandang: "C4",
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          jumlah_pakan_kg: 10,
          tanggal: "2026-10-14",
          jumlah_telur: 96,
          berat_telur_kg: 5.8,
        },
        {
          id_beri: 2,
          kandang: "A4",
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          jumlah_pakan_kg: 3,
          tanggal: "2026-10-15",
          jumlah_telur: 117,
          berat_telur_kg: 7,
        },
        {
          id_beri: 3,
          kandang: "C3",
          id_pakan: 2,
          nama_pakan: "Bekatul",
          jumlah_pakan_kg: 15,
          tanggal: "2026-10-15",
          jumlah_telur: 88,
          berat_telur_kg: 5.3,
        },
        {
          id_beri: 4,
          kandang: "B4",
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          jumlah_pakan_kg: 12,
          tanggal: "2026-10-16",
          jumlah_telur: 132,
          berat_telur_kg: 7.9,
        },
        {
          id_beri: 5,
          kandang: "B3",
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          jumlah_pakan_kg: 5,
          tanggal: "2026-10-17",
          jumlah_telur: 108,
          berat_telur_kg: 6.5,
        },
        {
          id_beri: 6,
          kandang: "A3",
          id_pakan: 2,
          nama_pakan: "Bekatul",
          jumlah_pakan_kg: 12,
          tanggal: "2026-10-18",
          jumlah_telur: 79,
          berat_telur_kg: 4.7,
        },
        {
          id_beri: 7,
          kandang: "C2",
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          jumlah_pakan_kg: 15,
          tanggal: "2026-10-19",
          jumlah_telur: 146,
          berat_telur_kg: 8.8,
        },
        {
          id_beri: 8,
          kandang: "C1",
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          jumlah_pakan_kg: 6,
          tanggal: "2026-10-19",
          jumlah_telur: 102,
          berat_telur_kg: 6.1,
        },
        {
          id_beri: 9,
          kandang: "B2",
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          jumlah_pakan_kg: 6,
          tanggal: "2026-10-20",
          jumlah_telur: 110,
          berat_telur_kg: 6.8,
        },
        {
          id_beri: 10,
          kandang: "B1",
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          jumlah_pakan_kg: 13,
          tanggal: "2026-10-20",
          jumlah_telur: 140,
          berat_telur_kg: 8.4,
        },
        {
          id_beri: 11,
          kandang: "A2",
          id_pakan: 2,
          nama_pakan: "Bekatul",
          jumlah_pakan_kg: 11,
          tanggal: "2026-10-21",
          jumlah_telur: 95,
          berat_telur_kg: 5.6,
        },
        {
          id_beri: 12,
          kandang: "A1",
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          jumlah_pakan_kg: 5,
          tanggal: "2026-10-21",
          jumlah_telur: 120,
          berat_telur_kg: 7.2,
        },
      ],
      riwayat: [
        {
          id_log: 37,
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          stok_sebelum: 125,
          stok_sesudah: 115,
          keterangan: "Pemberian #1 - Kandang C4",
          tanggal: "2026-10-14 06:45:00",
          kandang: "C4",
        },
        {
          id_log: 38,
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          stok_sebelum: 120,
          stok_sesudah: 117,
          keterangan: "Pemberian #2 - Kandang A4",
          tanggal: "2026-10-15 07:10:00",
          kandang: "A4",
        },
        {
          id_log: 39,
          id_pakan: 2,
          nama_pakan: "Bekatul",
          stok_sebelum: 50,
          stok_sesudah: 35,
          keterangan: "Pemberian #3 - Kandang C3",
          tanggal: "2026-10-15 12:40:00",
          kandang: "C3",
        },
        {
          id_log: 40,
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          stok_sebelum: 115,
          stok_sesudah: 103,
          keterangan: "Pemberian #4 - Kandang B4",
          tanggal: "2026-10-16 06:55:00",
          kandang: "B4",
        },
        {
          id_log: 41,
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          stok_sebelum: 117,
          stok_sesudah: 112,
          keterangan: "Pemberian #5 - Kandang B3",
          tanggal: "2026-10-17 07:05:00",
          kandang: "B3",
        },
        {
          id_log: 42,
          id_pakan: 2,
          nama_pakan: "Bekatul",
          stok_sebelum: 35,
          stok_sesudah: 23,
          keterangan: "Pemberian #6 - Kandang A3",
          tanggal: "2026-10-18 12:30:00",
          kandang: "A3",
        },
        {
          id_log: 43,
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          stok_sebelum: 103,
          stok_sesudah: 88,
          keterangan: "Pemberian #7 - Kandang C2",
          tanggal: "2026-10-19 06:40:00",
          kandang: "C2",
        },
        {
          id_log: 44,
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          stok_sebelum: 112,
          stok_sesudah: 106,
          keterangan: "Pemberian #8 - Kandang C1",
          tanggal: "2026-10-19 13:00:00",
          kandang: "C1",
        },
        {
          id_log: 45,
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          stok_sebelum: 106,
          stok_sesudah: 100,
          keterangan: "Pemberian #9 - Kandang B2",
          tanggal: "2026-10-20 08:15:00",
          kandang: "B2",
        },
        {
          id_log: 46,
          id_pakan: 3,
          nama_pakan: "Jagung Giling",
          stok_sebelum: 88,
          stok_sesudah: 75,
          keterangan: "Pemberian #10 - Kandang B1",
          tanggal: "2026-10-20 08:15:00",
          kandang: "B1",
        },
        {
          id_log: 47,
          id_pakan: 2,
          nama_pakan: "Bekatul",
          stok_sebelum: 23,
          stok_sesudah: 12,
          keterangan: "Pemberian #11 - Kandang A2",
          tanggal: "2026-10-21 13:02:00",
          kandang: "A2",
        },
        {
          id_log: 48,
          id_pakan: 1,
          nama_pakan: "Konsentrat",
          stok_sebelum: 100,
          stok_sesudah: 95,
          keterangan: "Pemberian #12 - Kandang A1",
          tanggal: "2026-10-21 13:02:00",
          kandang: "A1",
        },
      ],
      nextPakanId: 4,
      nextBeriId: 13,
      nextLogId: 49,
    };
  }

  function getStore() {
    if (memoryStore) {
      return memoryStore;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && Array.isArray(parsed.pakan)) {
          memoryStore = parsed;
          return memoryStore;
        }
      }
    } catch (error) {}

    memoryStore = seedStore();
    saveStore();
    return memoryStore;
  }

  function saveStore() {
    if (!memoryStore) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    } catch (error) {}
  }

  function findPakan(store, id) {
    return store.pakan.find((item) => Number(item.id_pakan) === Number(id));
  }

  function pushLog(
    store,
    pakan,
    sebelum,
    sesudah,
    keterangan,
    kandang,
    dateString,
  ) {
    const log = {
      id_log: store.nextLogId++,
      id_pakan: Number(pakan.id_pakan),
      nama_pakan: pakan.nama_pakan,
      stok_sebelum: round2(sebelum),
      stok_sesudah: round2(sesudah),
      keterangan,
      tanggal: timestampFor(dateString),
    };

    if (kandang) {
      log.kandang = kandang;
    }

    store.riwayat.push(log);
    return log;
  }

  function validateText(value, label, maxLength) {
    const text = String(value == null ? "" : value).trim();

    if (!text) {
      throw new DataError(`${label} wajib diisi.`, 422, {
        field: `${label} wajib diisi.`,
      });
    }

    if (maxLength && text.length > maxLength) {
      throw new DataError(`${label} maksimal ${maxLength} karakter.`, 422);
    }

    return text;
  }

  function normalizePakan(item) {
    return {
      id_pakan: Number(item.id_pakan),
      nama_pakan: String(item.nama_pakan == null ? "" : item.nama_pakan),
      stok_kg: toNumber(item.stok_kg),
      stok_awal:
        item.stok_awal == null || item.stok_awal === ""
          ? null
          : toNumber(item.stok_awal),
    };
  }

  function normalizeCatatan(item) {
    return {
      id_beri: Number(item.id_beri),
      kandang: String(item.kandang == null ? "" : item.kandang),
      id_pakan: Number(item.id_pakan),
      nama_pakan: String(item.nama_pakan == null ? "" : item.nama_pakan),
      jumlah_pakan_kg: toNumber(item.jumlah_pakan_kg),
      tanggal: String(item.tanggal == null ? "" : item.tanggal).slice(0, 10),
      jumlah_telur: Math.trunc(toNumber(item.jumlah_telur)),
      berat_telur_kg: toNumber(item.berat_telur_kg),
    };
  }

  function normalizeRiwayat(item) {
    const keterangan = String(item.keterangan == null ? "" : item.keterangan);
    const kandangMatch = keterangan.match(/kandang\s+([^\s,]+)/i);

    return {
      id_log: Number(item.id_log),
      id_pakan: Number(item.id_pakan),
      nama_pakan: String(item.nama_pakan == null ? "" : item.nama_pakan),
      stok_sebelum: toNumber(item.stok_sebelum),
      stok_sesudah: toNumber(item.stok_sesudah),
      keterangan,
      tanggal: String(item.tanggal == null ? "" : item.tanggal),
      kandang: item.kandang
        ? String(item.kandang)
        : kandangMatch
          ? kandangMatch[1]
          : "",
    };
  }

  function sortCatatan(list) {
    return list.slice().sort((a, b) => {
      if (a.tanggal !== b.tanggal) {
        return a.tanggal < b.tanggal ? 1 : -1;
      }
      return Number(b.id_beri) - Number(a.id_beri);
    });
  }

  function sortRiwayat(list) {
    return list.slice().sort((a, b) => {
      if (a.tanggal !== b.tanggal) {
        return a.tanggal < b.tanggal ? 1 : -1;
      }
      return Number(b.id_log) - Number(a.id_log);
    });
  }

  async function apiRequest(path, options = {}) {
    const method = options.method || "GET";
    const timeout = options.timeout || REQUEST_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const headers = { Accept: "application/json" };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    let response;

    try {
      response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
      });
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new DataError("Waktu koneksi ke API habis.", 0);
      }
      throw new DataError(
        "Tidak dapat terhubung ke API. Pastikan backend berjalan dan CORS aktif.",
        0,
      );
    } finally {
      clearTimeout(timer);
    }

    let text = "";

    try {
      text = await response.text();
    } catch (error) {
      text = "";
    }

    let payload = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        throw new DataError(
          `Respons API tidak valid (HTTP ${response.status}).`,
          response.status,
        );
      }
    }

    if (!response.ok || (payload && payload.success === false)) {
      throw new DataError(
        (payload && payload.message) ||
          `Permintaan gagal (HTTP ${response.status}).`,
        response.status,
        payload && payload.errors ? payload.errors : null,
      );
    }

    return payload;
  }

  function init() {
    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      if (PREFERRED_MODE === "demo") {
        mode = "demo";
        getStore();
        return getInfo();
      }

      if (PREFERRED_MODE === "api") {
        mode = "api";
        return getInfo();
      }

      try {
        await apiRequest("/pakan", { timeout: DETECT_TIMEOUT_MS });
        mode = "api";
      } catch (error) {
        mode = "demo";
        fallbackToDemo = true;
        lastConnectionError = error;
        getStore();
      }

      return getInfo();
    })();

    return initPromise;
  }

  function getInfo() {
    return {
      mode,
      apiBase: API_BASE,
      fallback: fallbackToDemo,
      lastError: lastConnectionError ? lastConnectionError.message : "",
      capabilities: {
        editCatatan: mode === "demo",
        deleteCatatan: mode === "demo",
      },
    };
  }

  async function getPakan() {
    await init();

    if (mode === "api") {
      const payload = await apiRequest("/pakan");
      return asArray(payload && payload.data).map(normalizePakan);
    }

    await pause(DEMO_DELAY_MS);
    return clone(getStore().pakan).sort(
      (a, b) => Number(a.id_pakan) - Number(b.id_pakan),
    );
  }

  async function addPakan(input) {
    await init();
    const nama = validateText(input.nama_pakan, "Nama pakan", 100);
    const stok = toNumber(input.stok_kg);

    if (!Number.isFinite(stok) || stok < 0) {
      throw new DataError("Stok awal harus berupa angka 0 atau lebih.", 422, {
        stok_kg: "Stok awal harus berupa angka 0 atau lebih.",
      });
    }

    if (mode === "api") {
      const payload = await apiRequest("/pakan", {
        method: "POST",
        body: { nama_pakan: nama, stok_kg: stok },
      });
      return normalizePakan(payload.data);
    }

    return pause(DEMO_DELAY_MS).then(() => {
      const store = getStore();
      const duplicate = store.pakan.some(
        (item) => item.nama_pakan.toLowerCase() === nama.toLowerCase(),
      );

      if (duplicate) {
        throw new DataError("Nama pakan sudah ada.", 422, {
          nama_pakan: "Nama pakan sudah ada.",
        });
      }

      const item = {
        id_pakan: store.nextPakanId++,
        nama_pakan: nama,
        stok_kg: round2(stok),
        stok_awal: round2(stok),
      };

      store.pakan.push(item);

      if (item.stok_kg > 0) {
        pushLog(
          store,
          item,
          0,
          item.stok_kg,
          `Stok awal ${item.nama_pakan}`,
          "",
          "",
        );
      }

      saveStore();
      return clone(item);
    });
  }

  async function updatePakan(id, input) {
    await init();
    const nama = validateText(input.nama_pakan, "Nama pakan", 100);

    if (mode === "api") {
      const payload = await apiRequest(`/pakan/${id}`, {
        method: "PUT",
        body: { nama_pakan: nama },
      });
      return normalizePakan(payload.data);
    }

    return pause(DEMO_DELAY_MS).then(() => {
      const store = getStore();
      const item = findPakan(store, id);

      if (!item) {
        throw new DataError("Pakan tidak ditemukan.", 404);
      }

      const duplicate = store.pakan.some(
        (pakan) =>
          Number(pakan.id_pakan) !== Number(id) &&
          pakan.nama_pakan.toLowerCase() === nama.toLowerCase(),
      );

      if (duplicate) {
        throw new DataError("Nama pakan sudah ada.", 422, {
          nama_pakan: "Nama pakan sudah ada.",
        });
      }

      const oldName = item.nama_pakan;
      item.nama_pakan = nama;

      store.catatan.forEach((catatan) => {
        if (Number(catatan.id_pakan) === Number(id)) {
          catatan.nama_pakan = nama;
        }
      });

      store.riwayat.forEach((log) => {
        if (Number(log.id_pakan) === Number(id)) {
          log.nama_pakan = nama;
        }
      });

      if (oldName !== nama) {
        saveStore();
      }

      return clone(item);
    });
  }

  async function addStokPakan(id, jumlah) {
    await init();
    const tambahan = toNumber(jumlah);

    if (!Number.isFinite(tambahan) || tambahan <= 0) {
      throw new DataError("Penambahan stok harus lebih dari 0 kg.", 422, {
        stok_kg: "Penambahan stok harus lebih dari 0 kg.",
      });
    }

    if (mode === "api") {
      const payload = await apiRequest(`/pakan/${id}`, {
        method: "PUT",
        body: { stok_kg: tambahan },
      });
      return normalizePakan(payload.data);
    }

    return pause(DEMO_DELAY_MS).then(() => {
      const store = getStore();
      const item = findPakan(store, id);

      if (!item) {
        throw new DataError("Pakan tidak ditemukan.", 404);
      }

      const sebelum = item.stok_kg;
      item.stok_kg = round2(item.stok_kg + tambahan);
      pushLog(
        store,
        item,
        sebelum,
        item.stok_kg,
        `Penambahan stok manual (${tambahan} kg)`,
        "",
        "",
      );
      saveStore();
      return clone(item);
    });
  }

  async function deletePakan(id) {
    await init();

    if (mode === "api") {
      await apiRequest(`/pakan/${id}`, { method: "DELETE" });
      return true;
    }

    return pause(DEMO_DELAY_MS).then(() => {
      const store = getStore();
      const item = findPakan(store, id);

      if (!item) {
        throw new DataError("Pakan tidak ditemukan.", 404);
      }

      const dipakai = store.catatan.some(
        (catatan) => Number(catatan.id_pakan) === Number(id),
      );

      if (dipakai) {
        throw new DataError(
          "Pakan sudah dipakai di catatan, tidak bisa dihapus.",
          422,
        );
      }

      store.pakan = store.pakan.filter(
        (pakan) => Number(pakan.id_pakan) !== Number(id),
      );
      store.riwayat = store.riwayat.filter(
        (log) => Number(log.id_pakan) !== Number(id),
      );
      saveStore();
      return true;
    });
  }

  async function getCatatan() {
    await init();

    if (mode === "api") {
      const payload = await apiRequest("/catatan-harian");
      return sortCatatan(
        asArray(payload && payload.data).map(normalizeCatatan),
      );
    }

    await pause(DEMO_DELAY_MS);
    return sortCatatan(clone(getStore().catatan));
  }

  function validateCatatanInput(input, store, current) {
    const kandang = validateText(input.kandang, "Kandang", 50);
    const idPakan = Number(input.id_pakan);
    const pakan = findPakan(store, idPakan);
    const jumlahPakan = toNumber(input.jumlah_pakan_kg);
    const jumlahTelur = toNumber(input.jumlah_telur);
    const beratTelur = toNumber(input.berat_telur_kg);
    const tanggal = String(input.tanggal || "");

    if (!pakan) {
      throw new DataError("Pakan tidak ditemukan.", 404, {
        id_pakan: "Pilih pakan yang tersedia.",
      });
    }

    if (!Number.isFinite(jumlahPakan) || jumlahPakan <= 0) {
      throw new DataError("Jumlah pakan harus lebih dari 0 kg.", 422, {
        jumlah_pakan_kg: "Jumlah pakan harus lebih dari 0 kg.",
      });
    }

    if (
      !Number.isFinite(jumlahTelur) ||
      jumlahTelur < 0 ||
      !Number.isInteger(jumlahTelur)
    ) {
      throw new DataError(
        "Jumlah telur harus berupa bilangan bulat 0 atau lebih.",
        422,
        {
          jumlah_telur:
            "Jumlah telur harus berupa bilangan bulat 0 atau lebih.",
        },
      );
    }

    if (!Number.isFinite(beratTelur) || beratTelur < 0) {
      throw new DataError("Berat telur harus berupa angka 0 atau lebih.", 422, {
        berat_telur_kg: "Berat telur harus berupa angka 0 atau lebih.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      throw new DataError(
        "Tanggal wajib diisi dengan format YYYY-MM-DD.",
        422,
        {
          tanggal: "Tanggal wajib diisi.",
        },
      );
    }

    let tersedia = pakan.stok_kg;

    if (current && Number(current.id_pakan) === Number(idPakan)) {
      tersedia = round2(tersedia + Number(current.jumlah_pakan_kg));
    }

    if (jumlahPakan > tersedia + 0.0001) {
      const message = `Stok ${pakan.nama_pakan} tidak mencukupi. Sisa ${tersedia} kg.`;
      throw new DataError(message, 422, { jumlah_pakan_kg: message });
    }

    return {
      kandang,
      id_pakan: idPakan,
      nama_pakan: pakan.nama_pakan,
      jumlah_pakan_kg: round2(jumlahPakan),
      jumlah_telur: Math.trunc(jumlahTelur),
      berat_telur_kg: round2(beratTelur),
      tanggal,
    };
  }

  async function addCatatan(input) {
    await init();

    if (mode === "api") {
      const payload = await apiRequest("/catatan-harian", {
        method: "POST",
        body: {
          kandang: String(input.kandang || "").trim(),
          id_pakan: Number(input.id_pakan),
          jumlah_pakan_kg: toNumber(input.jumlah_pakan_kg),
          jumlah_telur: Math.trunc(toNumber(input.jumlah_telur)),
          berat_telur_kg: toNumber(input.berat_telur_kg),
          tanggal: String(input.tanggal || ""),
        },
      });
      return normalizeCatatan(payload.data);
    }

    return pause(DEMO_DELAY_MS).then(() => {
      const store = getStore();
      const data = validateCatatanInput(input, store, null);
      const pakan = findPakan(store, data.id_pakan);
      const sebelum = pakan.stok_kg;
      const idBeri = store.nextBeriId++;
      const catatan = {
        id_beri: idBeri,
        kandang: data.kandang,
        id_pakan: data.id_pakan,
        nama_pakan: pakan.nama_pakan,
        jumlah_pakan_kg: data.jumlah_pakan_kg,
        tanggal: data.tanggal,
        jumlah_telur: data.jumlah_telur,
        berat_telur_kg: data.berat_telur_kg,
      };

      pakan.stok_kg = round2(pakan.stok_kg - data.jumlah_pakan_kg);
      store.catatan.push(catatan);
      pushLog(
        store,
        pakan,
        sebelum,
        pakan.stok_kg,
        `Pemberian #${idBeri} - Kandang ${data.kandang}`,
        data.kandang,
        data.tanggal,
      );
      saveStore();
      return clone(catatan);
    });
  }

  async function updateCatatan(id, input) {
    await init();

    if (mode !== "demo") {
      throw new DataError(
        "Edit catatan belum tersedia di API backend. Gunakan mode demo.",
        501,
      );
    }

    return pause(DEMO_DELAY_MS).then(() => {
      const store = getStore();
      const current = store.catatan.find(
        (catatan) => Number(catatan.id_beri) === Number(id),
      );

      if (!current) {
        throw new DataError("Catatan tidak ditemukan.", 404);
      }

      const data = validateCatatanInput(input, store, current);
      const pakanBaru = findPakan(store, data.id_pakan);
      const pakanLama = findPakan(store, current.id_pakan);

      if (Number(current.id_pakan) === Number(data.id_pakan)) {
        const delta = round2(data.jumlah_pakan_kg - current.jumlah_pakan_kg);

        if (delta !== 0) {
          const sebelum = pakanBaru.stok_kg;
          pakanBaru.stok_kg = round2(pakanBaru.stok_kg - delta);

          if (pakanBaru.stok_kg < 0) {
            throw new DataError("Stok pakan tidak mencukupi.", 422, {
              jumlah_pakan_kg: "Stok pakan tidak mencukupi.",
            });
          }

          pushLog(
            store,
            pakanBaru,
            sebelum,
            pakanBaru.stok_kg,
            `Penyesuaian catatan #${current.id_beri} - Kandang ${data.kandang}`,
            data.kandang,
            data.tanggal,
          );
        }
      } else {
        if (pakanLama) {
          const sebelumLama = pakanLama.stok_kg;
          pakanLama.stok_kg = round2(
            pakanLama.stok_kg + current.jumlah_pakan_kg,
          );
          pushLog(
            store,
            pakanLama,
            sebelumLama,
            pakanLama.stok_kg,
            `Pembatalan catatan #${current.id_beri} - Kandang ${current.kandang}`,
            current.kandang,
            current.tanggal,
          );
        }

        const sebelumBaru = pakanBaru.stok_kg;
        pakanBaru.stok_kg = round2(pakanBaru.stok_kg - data.jumlah_pakan_kg);
        pushLog(
          store,
          pakanBaru,
          sebelumBaru,
          pakanBaru.stok_kg,
          `Pemberian #${current.id_beri} - Kandang ${data.kandang}`,
          data.kandang,
          data.tanggal,
        );
      }

      Object.assign(current, {
        kandang: data.kandang,
        id_pakan: data.id_pakan,
        nama_pakan: data.nama_pakan,
        jumlah_pakan_kg: data.jumlah_pakan_kg,
        tanggal: data.tanggal,
        jumlah_telur: data.jumlah_telur,
        berat_telur_kg: data.berat_telur_kg,
      });

      saveStore();
      return clone(current);
    });
  }

  async function deleteCatatan(id) {
    await init();

    if (mode !== "demo") {
      throw new DataError(
        "Hapus catatan belum tersedia di API backend. Gunakan mode demo.",
        501,
      );
    }

    return pause(DEMO_DELAY_MS).then(() => {
      const store = getStore();
      const current = store.catatan.find(
        (catatan) => Number(catatan.id_beri) === Number(id),
      );

      if (!current) {
        throw new DataError("Catatan tidak ditemukan.", 404);
      }

      const pakan = findPakan(store, current.id_pakan);

      if (pakan) {
        const sebelum = pakan.stok_kg;
        pakan.stok_kg = round2(pakan.stok_kg + current.jumlah_pakan_kg);
        pushLog(
          store,
          pakan,
          sebelum,
          pakan.stok_kg,
          `Penghapusan catatan #${current.id_beri} - Kandang ${current.kandang}`,
          current.kandang,
          current.tanggal,
        );
      }

      store.catatan = store.catatan.filter(
        (catatan) => Number(catatan.id_beri) !== Number(id),
      );
      saveStore();
      return true;
    });
  }

  async function getRiwayat() {
    await init();

    if (mode === "api") {
      const payload = await apiRequest("/riwayat-stok");
      return sortRiwayat(
        asArray(payload && payload.data).map(normalizeRiwayat),
      );
    }

    await pause(DEMO_DELAY_MS);
    return sortRiwayat(clone(getStore().riwayat));
  }

  function resetDemo() {
    memoryStore = seedStore();
    saveStore();
    return true;
  }

  window.SiKandangAPI = {
    init,
    getInfo,
    getPakan,
    addPakan,
    updatePakan,
    addStokPakan,
    deletePakan,
    getCatatan,
    addCatatan,
    updateCatatan,
    deleteCatatan,
    getRiwayat,
    resetDemo,
    DataError,
  };
})();
