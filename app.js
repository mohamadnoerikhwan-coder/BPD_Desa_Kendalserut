// =====================================================
// APP.JS — BPD DESA KENDALSERUT
// Supabase + Aspirasi + Tiket + Cek Status + Admin
// =====================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// -----------------------------------------------------
// KONFIGURASI SUPABASE
// -----------------------------------------------------
const SUPABASE_URL = "https://scyhmxfksqlwjkqhlama.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_StNVl1zqzZE_bsetnfi8mA_jl9TBFyI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -----------------------------------------------------
// HELPER
// -----------------------------------------------------
const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showMessage(el, message, type = "info") {
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function generateTicket() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ASP-${y}${m}${d}-${random}`;
}

function getFriendlyError(error) {
  const message = error?.message || String(error || "Terjadi kesalahan.");

  if (message.includes("aspirasi_status_check")) {
    return "Database menolak status aspirasi. Status awal harus \"Diterima\".";
  }

  if (message.toLowerCase().includes("row-level security")) {
    return "Database menolak pengiriman karena RLS/Policy Supabase belum benar.";
  }

  if (message.toLowerCase().includes("duplicate key")) {
    return "Nomor tiket bentrok. Silakan kirim kembali.";
  }

  return message;
}

// -----------------------------------------------------
// FORM ASPIRASI
// -----------------------------------------------------
const aspForm = $("aspForm");
const aspMsg = $("aspMsg");

if (aspForm) {
  aspForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = aspForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "⏳ Mengirim...";
    }

    showMessage(aspMsg, "Sedang mengirim aspirasi...", "info");

    try {
      const namaInput = $("nama");
      const wilayahInput = $("wilayah");
      const whatsappInput = $("whatsapp");
      const kategoriInput = $("kategori");
      const isiInput = $("isi");
      const anonimInput = aspForm.querySelector('input[name="anonim"]');

      const anonim = Boolean(anonimInput?.checked);
      const nama = anonim ? "Anonim" : (namaInput?.value || "").trim();
      const wilayah = (wilayahInput?.value || "").trim();
      const whatsapp = (whatsappInput?.value || "").trim();
      const kategori = (kategoriInput?.value || "").trim();
      const isi = (isiInput?.value || "").trim();

      if (!kategori) {
        throw new Error("Silakan pilih kategori aspirasi.");
      }

      if (!isi) {
        throw new Error("Isi aspirasi wajib diisi.");
      }

      const nomorTiket = generateTicket();

      const payload = {
        nomor_tiket: nomorTiket,
        nama: nama || "Anonim",
        dusun: wilayah,
        rt_rw: wilayah,
        whatsapp: whatsapp,
        kategori: kategori,
        isi_aspirasi: isi,
        anonim: anonim,
        status: "Diterima",
        tanggapan: null
      };

      const { data, error } = await supabase
        .from("aspirasi")
        .insert(payload)
        .select("id, nomor_tiket, status, created_at")
        .single();

      if (error) throw error;

      showMessage(
        aspMsg,
        `✅ Aspirasi berhasil dikirim!\n\nNomor Tiket Anda: ${data.nomor_tiket}\nStatus: ${data.status}\n\nSimpan nomor tiket ini untuk mengecek perkembangan aspirasi.`,
        "success"
      );

      aspForm.reset();

      const ticketInput = $("ticket");
      if (ticketInput) ticketInput.value = data.nomor_tiket;

    } catch (error) {
      console.error("Gagal mengirim aspirasi:", error);
      showMessage(
        aspMsg,
        `❌ ${getFriendlyError(error)}\n\nPeriksa Console browser (F12) jika masalah masih terjadi.`,
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "📣 Kirim Aspirasi";
      }
    }
  });
}

// -----------------------------------------------------
// CEK STATUS ASPIRASI
// -----------------------------------------------------
const checkForm = $("checkForm");
const checkResult = $("checkResult");

if (checkForm) {
  checkForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = $("ticket");
    const ticket = (input?.value || "").trim().toUpperCase();

    if (!ticket) {
      if (checkResult) {
        checkResult.innerHTML = '<div class="result">❌ Masukkan nomor tiket terlebih dahulu.</div>';
      }
      return;
    }

    if (checkResult) {
      checkResult.innerHTML = '<div class="result">⏳ Mencari nomor tiket...</div>';
    }

    try {
      const { data, error } = await supabase
        .from("aspirasi")
        .select("nomor_tiket,nama,dusun,rt_rw,kategori,isi_aspirasi,anonim,status,tanggapan,created_at,updated_at")
        .eq("nomor_tiket", ticket)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        if (checkResult) {
          checkResult.innerHTML = `
            <div class="result">
              ❌ Nomor tiket <strong>${escapeHtml(ticket)}</strong> tidak ditemukan.
            </div>`;
        }
        return;
      }

      const namaTampil = data.anonim ? "Anonim" : (data.nama || "Tidak disebutkan");

      if (checkResult) {
        checkResult.innerHTML = `
          <div class="result ticket-result">
            <h3>🎫 ${escapeHtml(data.nomor_tiket)}</h3>
            <p><strong>Status:</strong> <span class="status">${escapeHtml(data.status)}</span></p>
            <p><strong>Nama:</strong> ${escapeHtml(namaTampil)}</p>
            <p><strong>Kategori:</strong> ${escapeHtml(data.kategori)}</p>
            <p><strong>Aspirasi:</strong><br>${escapeHtml(data.isi_aspirasi).replace(/\n/g, "<br>")}</p>
            <p><strong>Dikirim:</strong> ${escapeHtml(formatDate(data.created_at))}</p>
            <p><strong>Tanggapan BPD:</strong><br>
              ${data.tanggapan
                ? escapeHtml(data.tanggapan).replace(/\n/g, "<br>")
                : "<em>Belum ada tanggapan.</em>"}
            </p>
            <p><strong>Pembaruan terakhir:</strong> ${escapeHtml(formatDate(data.updated_at))}</p>
          </div>`;
      }

    } catch (error) {
      console.error("Gagal mengecek aspirasi:", error);

      if (checkResult) {
        checkResult.innerHTML = `
          <div class="result">
            ❌ ${escapeHtml(getFriendlyError(error))}
          </div>`;
      }
    }
  });
}

// -----------------------------------------------------
// LOGIN ADMIN
// -----------------------------------------------------
const loginForm = $("loginForm");
const loginMsg = $("loginMsg");
const adminDash = $("adminDash");
const logoutBtn = $("logoutBtn");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = ($("email")?.value || "").trim();
    const password = $("password")?.value || "";

    if (!email || !password) return;

    showMessage(loginMsg, "⏳ Memproses login...", "info");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      showMessage(loginMsg, "✅ Login berhasil.", "success");

      loginForm.reset();
      showAdminDashboard(data.user);

      setTimeout(() => {
        adminDash?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (error) {
      console.error("Login gagal:", error);
      showMessage(loginMsg, `❌ ${getFriendlyError(error)}`, "error");
    }
  });
}

// -----------------------------------------------------
// DASHBOARD ADMIN
// -----------------------------------------------------
async function showAdminDashboard(user) {
  if (!adminDash) return;

  adminDash.classList.remove("hidden");

  if (logoutBtn) logoutBtn.classList.remove("hidden");

  adminDash.innerHTML = `
    <div class="container" style="padding:30px 0;">
      <div class="action-panel">
        <div>
          <span class="section-label">DASHBOARD ADMIN</span>
          <h2>Kelola Aspirasi Masyarakat</h2>
          <p class="admin-user">
            Login sebagai: <strong>${escapeHtml(user?.email || "")}</strong>
          </p>
        </div>
      </div>

      <div id="adminAspirasiList" class="service-form">
        <p>⏳ Memuat data aspirasi...</p>
      </div>
    </div>
  `;

  await loadAdminAspirations();
  await loadNewsForAdmin();
}

async function loadAdminAspirations() {
  const list = $("adminAspirasiList");
  if (!list) return;

  try {
    const { data, error } = await supabase
      .from("aspirasi")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data?.length) {
      list.innerHTML = "<p>Belum ada aspirasi masuk.</p>";
      return;
    }

    list.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:10px;">Tiket</th>
              <th style="text-align:left;padding:10px;">Nama</th>
              <th style="text-align:left;padding:10px;">Kategori</th>
              <th style="text-align:left;padding:10px;">Aspirasi</th>
              <th style="text-align:left;padding:10px;">Status</th>
              <th style="text-align:left;padding:10px;">Tanggapan</th>
              <th style="padding:10px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td style="padding:10px;vertical-align:top;"><strong>${escapeHtml(row.nomor_tiket)}</strong><br><small>${escapeHtml(formatDate(row.created_at))}</small></td>
                <td style="padding:10px;vertical-align:top;">${escapeHtml(row.anonim ? "Anonim" : row.nama)}</td>
                <td style="padding:10px;vertical-align:top;">${escapeHtml(row.kategori)}</td>
                <td style="padding:10px;vertical-align:top;min-width:220px;">${escapeHtml(row.isi_aspirasi).replace(/\n/g, "<br>")}</td>
                <td style="padding:10px;vertical-align:top;">
                  <select data-status="${escapeHtml(row.id)}">
                    ${["Diterima","Diproses","Ditindaklanjuti","Selesai"].map(status =>
                      `<option value="${status}" ${row.status === status ? "selected" : ""}>${status}</option>`
                    ).join("")}
                  </select>
                </td>
                <td style="padding:10px;vertical-align:top;min-width:220px;">
                  <textarea data-response="${escapeHtml(row.id)}" rows="4" style="width:100%;box-sizing:border-box;">${escapeHtml(row.tanggapan || "")}</textarea>
                </td>
                <td style="padding:10px;vertical-align:top;text-align:center;">
                  <button type="button" class="btn btn-primary" data-save="${escapeHtml(row.id)}">Simpan</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div id="adminSaveMsg" class="form-message" aria-live="polite"></div>
    `;

    list.querySelectorAll("[data-save]").forEach(button => {
      button.addEventListener("click", async () => {
        await updateAspirasi(button.dataset.save);
      });
    });

  } catch (error) {
    console.error("Gagal memuat aspirasi admin:", error);
    list.innerHTML = `<div class="result">❌ ${escapeHtml(getFriendlyError(error))}</div>`;
  }
}

async function updateAspirasi(id) {
  const statusEl = document.querySelector(`[data-status="${CSS.escape(id)}"]`);
  const responseEl = document.querySelector(`[data-response="${CSS.escape(id)}"]`);
  const msg = $("adminSaveMsg");

  const status = statusEl?.value;
  const tanggapan = responseEl?.value?.trim() || null;

  try {
    const { error } = await supabase
      .from("aspirasi")
      .update({
        status,
        tanggapan,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) throw error;

    showMessage(msg, "✅ Aspirasi berhasil diperbarui.", "success");

  } catch (error) {
    console.error("Gagal memperbarui aspirasi:", error);
    showMessage(msg, `❌ ${getFriendlyError(error)}`, "error");
  }
}

// -----------------------------------------------------
// BERITA
// -----------------------------------------------------
async function loadNews() {
  const newsList = $("newsList");
  if (!newsList) return;

  // Hanya mencoba membaca tabel berita jika memang tersedia.
  // Jika tabel belum dibuat, halaman tetap normal.
  try {
    const { data, error } = await supabase
      .from("berita")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.info("Tabel berita belum tersedia atau belum diberi policy.");
      return;
    }

    if (!data?.length) return;

    newsList.innerHTML = data.map(item => `
      <article>
        <h3>${escapeHtml(item.judul || item.title || "Berita BPD")}</h3>
        ${item.created_at ? `<small>${escapeHtml(formatDate(item.created_at))}</small>` : ""}
        <p>${escapeHtml(item.isi || item.konten || item.deskripsi || "").replace(/\n/g, "<br>")}</p>
      </article>
    `).join("");

  } catch (error) {
    console.info("Berita tidak dimuat:", error);
  }
}

async function loadNewsForAdmin() {
  // Placeholder agar dashboard tetap kompatibel jika tabel berita
  // belum dibuat. Fitur berita tidak mengganggu fitur aspirasi.
}

// -----------------------------------------------------
// LOGOUT
// -----------------------------------------------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      adminDash?.classList.add("hidden");
      adminDash.innerHTML = "";
      logoutBtn.classList.add("hidden");

      if (loginMsg) {
        showMessage(loginMsg, "Anda telah logout.", "info");
      }

      window.location.hash = "login-admin";
    }
  });
}

// -----------------------------------------------------
// SESSION LOGIN
// -----------------------------------------------------
async function restoreSession() {
  try {
    const { data } = await supabase.auth.getSession();

    if (data?.session?.user) {
      showAdminDashboard(data.session.user);
    }
  } catch (error) {
    console.error("Gagal memulihkan sesi:", error);
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    showAdminDashboard(session.user);
  } else {
    adminDash?.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
  }
});

// -----------------------------------------------------
// START
// -----------------------------------------------------
loadNews();
restoreSession();

console.log("✅ app.js BPD Desa Kendalserut berhasil dimuat.");
