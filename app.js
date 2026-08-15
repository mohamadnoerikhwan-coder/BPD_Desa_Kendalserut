import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/*
  ============================================================
  APP.JS - BPD DESA KENDALSERUT
  ============================================================
  Supabase:
  URL  : https://scyhmxfksqlwjkqhlama.supabase.co
  Key  : publishable key (aman digunakan di frontend)

  Tabel:
  aspirasi
  id, nomor_tiket, nama, dusun, rt_rw, whatsapp, kategori,
  isi_aspirasi, anonim, status, tanggapan, created_at, updated_at
*/

const SUPABASE_URL = "https://scyhmxfksqlwjkqhlama.supabase.co";
const SUPABASE_KEY = "sb_publishable_StNVl1zqzZE_bsetnfi8mA_jl9TBFyI";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initAspirasiForm();
  initCheckForm();
  initLogin();
  initLogout();
  checkSession();
});

/* ============================================================
   UTILITAS
============================================================ */

function $(selector) {
  return document.querySelector(selector);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setMessage(element, message, type = "info") {
  if (!element) return;

  const colors = {
    info: "#28563f",
    success: "#176b45",
    error: "#a33d3d",
    warning: "#8a6500"
  };

  element.style.color = colors[type] || colors.info;
  element.innerHTML = message;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function generateTicket() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `ASP-${year}${month}${day}-${random}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
  Membuat nomor tiket yang sangat kecil kemungkinan bentrok.
  Jika ternyata sudah ada di database, buat ulang.
*/
async function generateUniqueTicket() {
  for (let i = 0; i < 5; i++) {
    const ticket = generateTicket();

    const { data, error } = await supabase
      .from("aspirasi")
      .select("id")
      .eq("nomor_tiket", ticket)
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return ticket;
    }
  }

  throw new Error("Tidak dapat membuat nomor tiket unik. Silakan coba lagi.");
}

/* ============================================================
   MENU MOBILE
============================================================ */

function initMobileMenu() {
  const toggle = $(".menu-toggle");
  const nav = $(".main-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}

/* ============================================================
   FORM ASPIRASI
============================================================ */

function initAspirasiForm() {
  const form = $("#aspForm");
  const message = $("#aspMsg");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (message) {
      setMessage(message, "⏳ Sedang mengirim aspirasi...", "info");
    }

    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.innerHTML;
      submitButton.innerHTML = "⏳ Mengirim...";
    }

    try {
      const namaInput = $("#nama");
      const wilayahInput = $("#wilayah");
      const whatsappInput = $("#whatsapp");
      const kategoriInput = $("#kategori");
      const isiInput = $("#isi");
      const anonimInput = form.querySelector('input[name="anonim"]');

      const nama = (namaInput?.value || "").trim();
      const wilayah = (wilayahInput?.value || "").trim();
      const whatsapp = (whatsappInput?.value || "").trim();
      const kategori = (kategoriInput?.value || "").trim();
      const isi = (isiInput?.value || "").trim();
      const anonim = Boolean(anonimInput?.checked);

      if (!kategori) {
        throw new Error("Silakan pilih kategori aspirasi.");
      }

      if (!isi) {
        throw new Error("Isi aspirasi wajib diisi.");
      }

      /*
        Kolom database memiliki:
        dusun
        rt_rw

        Sementara form HTML saat ini hanya mempunyai satu input
        "wilayah". Agar tetap kompatibel, isi wilayah disimpan
        ke kolom dusun dan rt_rw dikosongkan.

        Jika pengguna menulis "RT 02 / RW 05", kita simpan ke rt_rw.
        Selain itu kita simpan ke dusun.
      */
      let dusun = wilayah;
      let rt_rw = "";

      const rtRwPattern = /(?:RT\s*\d+.*RW\s*\d+|RW\s*\d+.*RT\s*\d+)/i;

      if (rtRwPattern.test(wilayah)) {
        rt_rw = wilayah;
        dusun = "";
      }

      const nomorTiket = await generateUniqueTicket();

      const payload = {
        nomor_tiket: nomorTiket,
        nama: anonim ? "Anonim" : (nama || "Masyarakat"),
        dusun: dusun || null,
        rt_rw: rt_rw || null,
        whatsapp: whatsapp || null,
        kategori,
        isi_aspirasi: isi,
        anonim,
        status: "Diajukan",
        tanggapan: null
      };

      const { data, error } = await supabase
        .from("aspirasi")
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const savedTicket = data?.nomor_tiket || nomorTiket;

      setMessage(
        message,
        `
        <div class="result ticket-result">
          <strong>✅ Aspirasi berhasil dikirim.</strong><br><br>
          Nomor tiket Anda:<br>
          <strong style="font-size:22px;">${escapeHtml(savedTicket)}</strong>
          <br><br>
          <small>
            Simpan nomor tiket ini untuk mengecek status aspirasi.
          </small>
        </div>
        `,
        "success"
      );

      form.reset();

      const ticketInput = $("#ticket");

      if (ticketInput) {
        ticketInput.value = savedTicket;
      }

    } catch (error) {
      console.error("Gagal mengirim aspirasi:", error);

      let messageText = error?.message || "Terjadi kesalahan saat mengirim aspirasi.";

      /*
        Pesan yang lebih mudah dipahami untuk masalah RLS.
      */
      if (
        messageText.toLowerCase().includes("row-level security") ||
        messageText.toLowerCase().includes("permission denied") ||
        messageText.toLowerCase().includes("not allowed")
      ) {
        messageText =
          "Database menolak pengiriman karena pengaturan RLS/Policy Supabase belum benar.";
      }

      setMessage(
        message,
        `❌ ${escapeHtml(messageText)}<br><small>Periksa Console browser (F12) jika masalah masih terjadi.</small>`,
        "error"
      );

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML =
          submitButton.dataset.originalText || "📣 Kirim Aspirasi";
      }
    }
  });
}

/* ============================================================
   CEK NOMOR TIKET
============================================================ */

function initCheckForm() {
  const form = $("#checkForm");
  const result = $("#checkResult");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const ticketInput = $("#ticket");
    const ticket = (ticketInput?.value || "").trim().toUpperCase();

    if (!ticket) {
      setMessage(result, "Masukkan nomor tiket terlebih dahulu.", "warning");
      return;
    }

    setMessage(result, "⏳ Mencari nomor tiket...", "info");

    const button = form.querySelector('button[type="submit"]');

    if (button) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = "⏳ Mencari...";
    }

    try {
      const { data, error } = await supabase
        .from("aspirasi")
        .select(
          "nomor_tiket,nama,dusun,rt_rw,kategori,isi_aspirasi,anonim,status,tanggapan,created_at,updated_at"
        )
        .eq("nomor_tiket", ticket)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setMessage(
          result,
          `
          <div class="result">
            ❌ <strong>Nomor tiket tidak ditemukan.</strong><br>
            Pastikan nomor tiket yang dimasukkan benar.
          </div>
          `,
          "error"
        );
        return;
      }

      const namaTampil = data.anonim ? "Anonim" : (data.nama || "-");

      setMessage(
        result,
        `
        <div class="result ticket-result">
          <h3 style="margin-top:0;">Hasil Pelacakan Aspirasi</h3>

          <p>
            <strong>Nomor Tiket:</strong><br>
            ${escapeHtml(data.nomor_tiket)}
          </p>

          <p>
            <strong>Status:</strong><br>
            <span class="status">${escapeHtml(data.status || "Diajukan")}</span>
          </p>

          <p>
            <strong>Nama:</strong><br>
            ${escapeHtml(namaTampil)}
          </p>

          <p>
            <strong>Kategori:</strong><br>
            ${escapeHtml(data.kategori || "-")}
          </p>

          <p>
            <strong>Isi Aspirasi:</strong><br>
            ${escapeHtml(data.isi_aspirasi || "-")}
          </p>

          <p>
            <strong>Tanggapan BPD:</strong><br>
            ${escapeHtml(data.tanggapan || "Belum ada tanggapan.")}
          </p>

          <p>
            <strong>Dikirim:</strong><br>
            ${escapeHtml(formatDate(data.created_at))}
          </p>

          <p>
            <strong>Diperbarui:</strong><br>
            ${escapeHtml(formatDate(data.updated_at))}
          </p>
        </div>
        `,
        "success"
      );

    } catch (error) {
      console.error("Gagal mengecek tiket:", error);

      setMessage(
        result,
        `❌ ${escapeHtml(error?.message || "Gagal mengambil data aspirasi.")}`,
        "error"
      );

    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML =
          button.dataset.originalText || "🔎 Cek Status";
      }
    }
  });
}

/* ============================================================
   LOGIN ADMIN SUPABASE AUTH
============================================================ */

function initLogin() {
  const form = $("#loginForm");
  const message = $("#loginMsg");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = ($("#email")?.value || "").trim();
    const password = $("#password")?.value || "";

    if (!email || !password) {
      setMessage(message, "Email dan password wajib diisi.", "error");
      return;
    }

    const button = form.querySelector('button[type="submit"]');

    if (button) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = "⏳ Memproses...";
    }

    setMessage(message, "⏳ Memeriksa akun admin...", "info");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (!data?.session) {
        throw new Error("Login berhasil tetapi sesi admin tidak ditemukan.");
      }

      setMessage(message, "✅ Login berhasil.", "success");

      await sleep(300);

      await showAdminDashboard(data.user);

      const dashboard = $("#adminDash");

      if (dashboard) {
        dashboard.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

    } catch (error) {
      console.error("Login admin gagal:", error);

      let msg = error?.message || "Login gagal.";

      if (msg.toLowerCase().includes("invalid login credentials")) {
        msg = "Email atau password admin salah.";
      }

      setMessage(message, `❌ ${escapeHtml(msg)}`, "error");

    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML =
          button.dataset.originalText || "🔐 Masuk ke Dashboard";
      }
    }
  });
}

/* ============================================================
   CEK SESSION
============================================================ */

async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Gagal membaca session:", error);
      return;
    }

    if (data?.session?.user) {
      await showAdminDashboard(data.session.user);
    }
  } catch (error) {
    console.error("Session error:", error);
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      await showAdminDashboard(session.user);
    } else {
      hideAdminDashboard();
    }
  });
}

/* ============================================================
   LOGOUT
============================================================ */

function initLogout() {
  const logoutButton = $("#logoutBtn");

  if (!logoutButton) return;

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      hideAdminDashboard();

      const loginSection = $("#login-admin");

      if (loginSection) {
        loginSection.scrollIntoView({
          behavior: "smooth"
        });
      }

    } catch (error) {
      console.error("Logout gagal:", error);
      alert("Logout gagal: " + (error?.message || "Kesalahan tidak diketahui."));
    } finally {
      logoutButton.disabled = false;
    }
  });
}

/* ============================================================
   DASHBOARD ADMIN
============================================================ */

async function showAdminDashboard(user) {
  const dashboard = $("#adminDash");
  const logoutButton = $("#logoutBtn");

  if (!dashboard) return;

  dashboard.classList.remove("hidden");

  if (logoutButton) {
    logoutButton.classList.remove("hidden");
  }

  dashboard.innerHTML = `
    <div style="
      background:#245c45;
      color:#fff;
      padding:35px 20px;
      margin-top:25px;
    ">
      <div class="container">
        <div class="admin-topbar">
          <div>
            <div style="font-size:13px;opacity:.85;">
              DASHBOARD ADMIN BPD
            </div>
            <h2 style="margin:5px 0;color:#fff;">
              Kelola Aspirasi Masyarakat
            </h2>
            <div class="admin-user">
              Login: ${escapeHtml(user?.email || "-")}
            </div>
          </div>
        </div>

        <div style="
          background:#fff;
          color:#29483a;
          border-radius:16px;
          padding:20px;
          margin-top:20px;
        ">
          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            flex-wrap:wrap;
          ">
            <h3 style="margin:0;">
              Data Aspirasi
            </h3>

            <button
              id="refreshAspirasi"
              class="btn btn-primary"
              type="button"
            >
              🔄 Muat Ulang
            </button>
          </div>

          <div id="adminAspirasiList" style="margin-top:20px;">
            ⏳ Memuat data...
          </div>
        </div>
      </div>
    </div>
  `;

  const refresh = $("#refreshAspirasi");

  if (refresh) {
    refresh.addEventListener("click", loadAdminAspirasi);
  }

  await loadAdminAspirasi();
}

/* ============================================================
   MUAT DATA ASPIRASI UNTUK ADMIN
============================================================ */

async function loadAdminAspirasi() {
  const container = $("#adminAspirasiList");

  if (!container) return;

  container.innerHTML = "⏳ Memuat data aspirasi...";

  try {
    const { data, error } = await supabase
      .from("aspirasi")
      .select(
        "id,nomor_tiket,nama,dusun,rt_rw,whatsapp,kategori,isi_aspirasi,anonim,status,tanggapan,created_at,updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="result">
          Belum ada aspirasi yang masuk.
        </div>
      `;
      return;
    }

    container.innerHTML = data.map(item => {
      const status = item.status || "Diajukan";

      return `
        <article style="
          border:1px solid #e1e8e3;
          border-radius:14px;
          padding:18px;
          margin-bottom:15px;
          background:#fff;
        ">
          <div style="
            display:flex;
            justify-content:space-between;
            gap:10px;
            flex-wrap:wrap;
          ">
            <strong style="font-size:17px;">
              ${escapeHtml(item.nomor_tiket)}
            </strong>

            <span class="status">
              ${escapeHtml(status)}
            </span>
          </div>

          <hr style="border:0;border-top:1px solid #e7ece9;margin:15px 0;">

          <p>
            <strong>Nama:</strong>
            ${escapeHtml(item.anonim ? "Anonim" : (item.nama || "-"))}
          </p>

          <p>
            <strong>Wilayah:</strong>
            ${escapeHtml(
              [item.dusun, item.rt_rw].filter(Boolean).join(" / ") || "-"
            )}
          </p>

          <p>
            <strong>WhatsApp:</strong>
            ${escapeHtml(item.whatsapp || "-")}
          </p>

          <p>
            <strong>Kategori:</strong>
            ${escapeHtml(item.kategori || "-")}
          </p>

          <p>
            <strong>Isi:</strong><br>
            ${escapeHtml(item.isi_aspirasi || "-")}
          </p>

          <p>
            <strong>Tanggapan:</strong><br>
            ${escapeHtml(item.tanggapan || "Belum ada tanggapan.")}
          </p>

          <small>
            Dikirim: ${escapeHtml(formatDate(item.created_at))}
          </small>

          <div style="
            margin-top:15px;
            display:grid;
            grid-template-columns:1fr;
            gap:10px;
          ">
            <select
              id="status-${escapeHtml(item.id)}"
              style="
                padding:11px;
                border:1px solid #d7e0da;
                border-radius:9px;
              "
            >
              ${statusOption("Diajukan", status)}
              ${statusOption("Diproses", status)}
              ${statusOption("Diteruskan", status)}
              ${statusOption("Selesai", status)}
              ${statusOption("Ditolak", status)}
            </select>

            <textarea
              id="tanggapan-${escapeHtml(item.id)}"
              placeholder="Tulis tanggapan BPD..."
              style="
                width:100%;
                min-height:90px;
                box-sizing:border-box;
                padding:11px;
                border:1px solid #d7e0da;
                border-radius:9px;
                resize:vertical;
              "
            >${escapeHtml(item.tanggapan || "")}</textarea>

            <button
              class="btn btn-primary save-aspirasi"
              type="button"
              data-id="${escapeHtml(item.id)}"
            >
              💾 Simpan Perubahan
            </button>

            <div
              id="save-msg-${escapeHtml(item.id)}"
              style="font-size:13px;"
            ></div>
          </div>
        </article>
      `;
    }).join("");

    container.querySelectorAll(".save-aspirasi").forEach(button => {
      button.addEventListener("click", async () => {
        await updateAspirasi(button.dataset.id);
      });
    });

  } catch (error) {
    console.error("Gagal memuat dashboard:", error);

    container.innerHTML = `
      <div class="result" style="border-left:4px solid #a33d3d;">
        ❌ Gagal memuat data aspirasi.<br><br>
        ${escapeHtml(error?.message || "Kesalahan tidak diketahui.")}
        <br><br>
        <small>
          Jika muncul "permission denied" atau "row-level security",
          periksa Policy RLS tabel aspirasi di Supabase.
        </small>
      </div>
    `;
  }
}

function statusOption(value, current) {
  return `
    <option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>
      ${escapeHtml(value)}
    </option>
  `;
}

/* ============================================================
   UPDATE ASPIRASI ADMIN
============================================================ */

async function updateAspirasi(id) {
  const statusElement = document.querySelector(`#status-${CSS.escape(String(id))}`);
  const tanggapanElement = document.querySelector(`#tanggapan-${CSS.escape(String(id))}`);
  const messageElement = document.querySelector(`#save-msg-${CSS.escape(String(id))}`);

  if (!statusElement || !tanggapanElement) return;

  if (messageElement) {
    setMessage(messageElement, "⏳ Menyimpan...", "info");
  }

  try {
    const status = statusElement.value;
    const tanggapan = tanggapanElement.value.trim();

    const { error } = await supabase
      .from("aspirasi")
      .update({
        status,
        tanggapan: tanggapan || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    if (messageElement) {
      setMessage(messageElement, "✅ Perubahan berhasil disimpan.", "success");
    }

    await loadAdminAspirasi();

  } catch (error) {
    console.error("Gagal update aspirasi:", error);

    if (messageElement) {
      setMessage(
        messageElement,
        `❌ ${escapeHtml(error?.message || "Gagal menyimpan perubahan.")}`,
        "error"
      );
    }
  }
}

/* ============================================================
   SEMBUNYIKAN DASHBOARD
============================================================ */

function hideAdminDashboard() {
  const dashboard = $("#adminDash");
  const logoutButton = $("#logoutBtn");

  if (dashboard) {
    dashboard.classList.add("hidden");
    dashboard.innerHTML = "";
  }

  if (logoutButton) {
    logoutButton.classList.add("hidden");
  }

  const loginMessage = $("#loginMsg");

  if (loginMessage) {
    loginMessage.innerHTML = "";
  }
}

/* ============================================================
   DEBUG SUPABASE
============================================================ */

window.bpdSupabase = supabase;

console.log("BPD app.js berhasil dimuat.");
