// ============================================================
// BPD DESA KENDALSERUT - APP.JS
// Login Admin + Dashboard + Aspirasi
// ============================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://scyhmxfksqlwjkqhlama.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_StNVl1zqzZE_bsetnfi8mA_jl9TBFyI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ app.js BPD Desa Kendalserut berhasil dimuat.");

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setMessage(el, message, type = "info") {
  if (!el) return;
  el.innerHTML = message;
  el.style.display = "block";
  el.style.padding = "12px 14px";
  el.style.marginTop = "14px";
  el.style.borderRadius = "10px";
  el.style.lineHeight = "1.5";

  if (type === "success") {
    el.style.background = "#eaf7ef";
    el.style.color = "#17633f";
  } else if (type === "error") {
    el.style.background = "#fff0f0";
    el.style.color = "#a12626";
  } else {
    el.style.background = "#eef5ff";
    el.style.color = "#24527a";
  }
}

function ensureDashboardStyles() {
  if ($("#bpd-admin-style")) return;

  const style = document.createElement("style");
  style.id = "bpd-admin-style";
  style.textContent = `
    #adminDash { padding: 40px 0; background:#f4f7f5; }
    #adminDash .admin-wrap { max-width:1200px; margin:auto; padding:0 20px; }
    #adminDash .admin-head {
      background:#075f46; color:white; border-radius:18px; padding:24px;
      display:flex; justify-content:space-between; align-items:center; gap:20px;
      flex-wrap:wrap; margin-bottom:22px;
    }
    #adminDash .admin-head h2 { margin:0 0 5px; }
    #adminDash .admin-head p { margin:0; opacity:.9; }
    #adminDash .admin-actions { display:flex; gap:10px; flex-wrap:wrap; }
    #adminDash .admin-actions button {
      border:0; border-radius:10px; padding:10px 15px; cursor:pointer;
      font-weight:700;
    }
    #adminDash .refresh-btn { background:white; color:#075f46; }
    #adminDash .admin-logout { background:#ffe5e5; color:#9d2020; }
    #adminDash .stats {
      display:grid; grid-template-columns:repeat(4,1fr); gap:15px; margin-bottom:22px;
    }
    #adminDash .stat {
      background:white; border:1px solid #e1e8e3; border-radius:15px;
      padding:18px; box-shadow:0 5px 18px rgba(0,0,0,.04);
    }
    #adminDash .stat strong { display:block; font-size:28px; color:#075f46; }
    #adminDash .stat span { color:#64736b; font-size:13px; }
    #adminDash .table-card {
      background:white; border:1px solid #e1e8e3; border-radius:16px;
      overflow:auto; box-shadow:0 5px 18px rgba(0,0,0,.04);
    }
    #adminDash table { width:100%; border-collapse:collapse; min-width:900px; }
    #adminDash th, #adminDash td {
      padding:13px 12px; border-bottom:1px solid #edf1ee;
      text-align:left; vertical-align:top; font-size:14px;
    }
    #adminDash th { background:#f3f7f4; color:#29483a; }
    #adminDash .status-badge {
      display:inline-block; padding:5px 9px; border-radius:999px;
      background:#eaf4ee; color:#245c45; font-weight:700; font-size:12px;
    }
    #adminDash select, #adminDash textarea {
      border:1px solid #d5dfd9; border-radius:8px; padding:8px;
      width:100%; box-sizing:border-box; font:inherit;
    }
    #adminDash textarea { min-width:220px; min-height:70px; }
    #adminDash .save-btn {
      margin-top:7px; border:0; background:#075f46; color:white;
      border-radius:8px; padding:8px 11px; cursor:pointer; font-weight:700;
    }
    #adminDash .empty { padding:30px; text-align:center; color:#65746c; }
    #adminDash .admin-error {
      background:#fff0f0; color:#9d2020; padding:15px; border-radius:10px; margin-bottom:15px;
    }
    @media(max-width:800px) {
      #adminDash .stats { grid-template-columns:repeat(2,1fr); }
    }
    @media(max-width:500px) {
      #adminDash .stats { grid-template-columns:1fr; }
    }
  `;
  document.head.appendChild(style);
}

function showDashboard(show = true) {
  const dash = $("#adminDash");
  const loginSection = $("#login-admin");
  const logoutBtn = $("#logoutBtn");

  if (dash) dash.classList.toggle("hidden", !show);
  if (loginSection) loginSection.classList.toggle("hidden", show);
  if (logoutBtn) logoutBtn.classList.toggle("hidden", !show);

  if (show) {
    dash.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function getAdminProfile(userId) {
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id,email,nama_lengkap,jabatan,aktif")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("admin_profiles error:", error);
    throw new Error(
      "Login berhasil, tetapi profil admin tidak dapat dibaca. " +
      "Periksa RLS tabel admin_profiles."
    );
  }

  if (!data) {
    throw new Error(
      "Akun berhasil login, tetapi belum terdaftar sebagai admin di admin_profiles."
    );
  }

  if (data.aktif !== true) {
    throw new Error("Akun admin ditemukan tetapi statusnya tidak aktif.");
  }

  return data;
}

async function renderDashboard(profile) {
  ensureDashboardStyles();

  const dash = $("#adminDash");
  if (!dash) return;

  dash.classList.remove("hidden");

  dash.innerHTML = `
    <div class="admin-wrap">
      <div class="admin-head">
        <div>
          <h2>Dashboard Admin BPD</h2>
          <p>${escapeHtml(profile.nama_lengkap || profile.email)} · ${escapeHtml(profile.jabatan || "Admin BPD")}</p>
        </div>
        <div class="admin-actions">
          <button class="refresh-btn" id="adminRefreshBtn" type="button">🔄 Refresh</button>
          <button class="admin-logout" id="adminDashLogoutBtn" type="button">🚪 Logout</button>
        </div>
      </div>

      <div class="stats">
        <div class="stat"><strong id="statTotal">0</strong><span>Total Aspirasi</span></div>
        <div class="stat"><strong id="statDiterima">0</strong><span>Diterima</span></div>
        <div class="stat"><strong id="statProses">0</strong><span>Diproses</span></div>
        <div class="stat"><strong id="statSelesai">0</strong><span>Selesai</span></div>
      </div>

      <div id="adminTableMessage"></div>
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Tiket</th>
              <th>Tanggal</th>
              <th>Nama</th>
              <th>Wilayah</th>
              <th>Kategori</th>
              <th>Isi Aspirasi</th>
              <th>Status</th>
              <th>Tanggapan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="aspirasiAdminBody">
            <tr><td colspan="9" class="empty">Memuat data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  $("#adminRefreshBtn")?.addEventListener("click", () => loadAdminAspirasi());
  $("#adminDashLogoutBtn")?.addEventListener("click", () => logoutAdmin());

  await loadAdminAspirasi();
}

async function loadAdminAspirasi() {
  const body = $("#aspirasiAdminBody");
  if (!body) return;

  body.innerHTML = `<tr><td colspan="9" class="empty">⏳ Memuat data aspirasi...</td></tr>`;

  const { data, error } = await supabase
    .from("aspirasi")
    .select("id,nomor_tiket,nama,dusun,rt_rw,whatsapp,kategori,isi_aspirasi,anonim,status,tanggapan,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("aspirasi select error:", error);
    body.innerHTML = `
      <tr><td colspan="9">
        <div class="admin-error">
          ❌ Data aspirasi tidak dapat dimuat.<br>
          ${escapeHtml(error.message)}
        </div>
      </td></tr>
    `;
    return;
  }

  const rows = data || [];

  $("#statTotal").textContent = rows.length;
  $("#statDiterima").textContent = rows.filter(x => x.status === "Diterima").length;
  $("#statProses").textContent = rows.filter(x => x.status === "Diproses" || x.status === "Ditindaklanjuti").length;
  $("#statSelesai").textContent = rows.filter(x => x.status === "Selesai").length;

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="9" class="empty">Belum ada aspirasi.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map(item => {
    const date = item.created_at
      ? new Date(item.created_at).toLocaleString("id-ID")
      : "-";

    const displayName = item.anonim ? "Anonim" : (item.nama || "-");
    const wilayah = [item.dusun, item.rt_rw].filter(Boolean).join(" / ") || "-";

    return `
      <tr data-id="${escapeHtml(item.id)}">
        <td><strong>${escapeHtml(item.nomor_tiket || "-")}</strong></td>
        <td>${escapeHtml(date)}</td>
        <td>${escapeHtml(displayName)}</td>
        <td>${escapeHtml(wilayah)}</td>
        <td>${escapeHtml(item.kategori || "-")}</td>
        <td>${escapeHtml(item.isi_aspirasi || "-")}</td>
        <td>
          <select class="status-input">
            ${["Diterima","Diproses","Ditindaklanjuti","Selesai"].map(s =>
              `<option value="${s}" ${item.status === s ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </td>
        <td>
          <textarea class="tanggapan-input" placeholder="Tulis tanggapan...">${escapeHtml(item.tanggapan || "")}</textarea>
        </td>
        <td>
          <button class="save-btn" type="button" data-save-id="${escapeHtml(item.id)}">💾 Simpan</button>
        </td>
      </tr>
    `;
  }).join("");

  body.querySelectorAll("[data-save-id]").forEach(btn => {
    btn.addEventListener("click", () => updateAspirasi(btn.dataset.saveId, btn));
  });
}

async function updateAspirasi(id, button) {
  const row = button.closest("tr");
  const status = row.querySelector(".status-input")?.value;
  const tanggapan = row.querySelector(".tanggapan-input")?.value || "";

  button.disabled = true;
  button.textContent = "Menyimpan...";

  const { error } = await supabase
    .from("aspirasi")
    .update({
      status,
      tanggapan
    })
    .eq("id", id);

  button.disabled = false;
  button.textContent = "💾 Simpan";

  if (error) {
    console.error("aspirasi update error:", error);
    alert("Gagal menyimpan:\n" + error.message);
    return;
  }

  alert("✅ Status dan tanggapan berhasil disimpan.");
  await loadAdminAspirasi();
}

async function loginAdmin(email, password, msgEl) {
  setMessage(msgEl, "⏳ Menghubungkan ke Supabase...", "info");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      console.error("Supabase login error:", error);
      throw new Error(error.message);
    }

    if (!data?.user) {
      throw new Error("Supabase tidak mengembalikan data pengguna.");
    }

    console.log("✅ Auth berhasil:", data.user.email);

    const profile = await getAdminProfile(data.user.id);

    setMessage(
      msgEl,
      `✅ Login berhasil. Selamat datang, ${escapeHtml(profile.nama_lengkap || profile.email)}.`,
      "success"
    );

    showDashboard(true);
    await renderDashboard(profile);

  } catch (err) {
    console.error("❌ Login gagal:", err);

    // Jika login Auth berhasil tetapi profil/RLS gagal, jangan meninggalkan
    // sesi setengah aktif.
    await supabase.auth.signOut();

    setMessage(
      msgEl,
      `❌ Login gagal:<br><strong>${escapeHtml(err.message || err)}</strong>`,
      "error"
    );
  }
}

async function logoutAdmin() {
  await supabase.auth.signOut();
  showDashboard(false);

  const msg = $("#loginMsg");
  if (msg) setMessage(msg, "Anda telah logout.", "info");

  const form = $("#loginForm");
  if (form) form.reset();

  window.location.hash = "beranda";
}

async function checkExistingSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("getSession error:", error);
    return;
  }

  const session = data?.session;
  if (!session?.user) {
    showDashboard(false);
    return;
  }

  try {
    const profile = await getAdminProfile(session.user.id);
    showDashboard(true);
    await renderDashboard(profile);
  } catch (err) {
    console.warn("Session ada tetapi bukan admin:", err);
    await supabase.auth.signOut();
    showDashboard(false);
  }
}

// ------------------------------------------------------------
// FORM LOGIN
// ------------------------------------------------------------
function setupLogin() {
  const form = $("#loginForm");
  const msg = $("#loginMsg");

  if (!form) {
    console.error("❌ #loginForm tidak ditemukan.");
    return;
  }

  console.log("✅ #loginForm ditemukan.");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const emailInput = form.querySelector('[name="email"], #email');
    const passwordInput = form.querySelector('[name="password"], #password');

    const email = emailInput?.value?.trim() || "";
    const password = passwordInput?.value || "";

    console.log("🔐 Percobaan login:", email);

    if (!email || !password) {
      setMessage(msg, "❌ Email dan password wajib diisi.", "error");
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = true;
      submit.dataset.originalText = submit.innerHTML;
      submit.innerHTML = "⏳ Memproses login...";
    }

    await loginAdmin(email, password, msg);

    if (submit) {
      submit.disabled = false;
      submit.innerHTML = submit.dataset.originalText || "🔐 Masuk ke Dashboard";
    }
  });

  // Jika ada tombol logout lama di HTML
  $("#logoutBtn")?.addEventListener("click", logoutAdmin);
}

// ------------------------------------------------------------
// FORM KIRIM ASPIRASI
// ------------------------------------------------------------
function setupAspirasiForm() {
  const form = $("#aspForm");
  const msg = $("#aspMsg");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fd = new FormData(form);
    const anonim = fd.get("anonim") === "on";

    const payload = {
      nama: anonim ? null : (fd.get("nama") || null),
      dusun: fd.get("wilayah") || null,
      rt_rw: null,
      whatsapp: anonim ? null : (fd.get("whatsapp") || null),
      kategori: fd.get("kategori"),
      isi_aspirasi: fd.get("isi"),
      anonim,
      // status sengaja TIDAK dikirim.
      // Database Anda memiliki DEFAULT 'Diterima' dan trigger nomor tiket.
    };

    setMessage(msg, "⏳ Mengirim aspirasi...", "info");

    const { data, error } = await supabase
      .from("aspirasi")
      .insert(payload)
      .select("nomor_tiket,status")
      .single();

    if (error) {
      console.error("aspirasi insert error:", error);
      setMessage(
        msg,
        `❌ Gagal mengirim aspirasi:<br><strong>${escapeHtml(error.message)}</strong>`,
        "error"
      );
      return;
    }

    setMessage(
      msg,
      `✅ Aspirasi berhasil dikirim! Nomor Tiket Anda: <strong>${escapeHtml(data?.nomor_tiket || "-")}</strong> Status: <strong>${escapeHtml(data?.status || "Diterima")}</strong><br>Simpan nomor tiket ini untuk mengecek perkembangan aspirasi.`,
      "success"
    );

    form.reset();
  });
}

// ------------------------------------------------------------
// FORM CEK TIKET
// ------------------------------------------------------------
function setupCheckForm() {
  const form = $("#checkForm");
  const result = $("#checkResult");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const ticket = form.querySelector('[name="ticket"], #ticket')?.value?.trim();

    if (!ticket) {
      setMessage(result, "❌ Masukkan nomor tiket.", "error");
      return;
    }

    setMessage(result, "⏳ Mencari nomor tiket...", "info");

    const { data, error } = await supabase
      .from("aspirasi")
      .select("nomor_tiket,kategori,isi_aspirasi,status,tanggapan,created_at,updated_at")
      .eq("nomor_tiket", ticket)
      .maybeSingle();

    if (error) {
      console.error("ticket check error:", error);
      setMessage(result, `❌ Gagal mengecek tiket:<br>${escapeHtml(error.message)}`, "error");
      return;
    }

    if (!data) {
      setMessage(result, "❌ Nomor tiket tidak ditemukan.", "error");
      return;
    }

    result.innerHTML = `
      <div class="result ticket-result">
        <p><strong>Nomor Tiket:</strong> ${escapeHtml(data.nomor_tiket)}</p>
        <p><strong>Kategori:</strong> ${escapeHtml(data.kategori || "-")}</p>
        <p><strong>Status:</strong> <span class="status">${escapeHtml(data.status || "-")}</span></p>
        <p><strong>Aspirasi:</strong><br>${escapeHtml(data.isi_aspirasi || "-")}</p>
        <p><strong>Tanggapan BPD:</strong><br>${escapeHtml(data.tanggapan || "Belum ada tanggapan.")}</p>
      </div>
    `;
  });
}

// ------------------------------------------------------------
// AUTH STATE
// ------------------------------------------------------------
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("Auth state:", event);

  if (event === "SIGNED_OUT") {
    showDashboard(false);
    return;
  }

  if (event === "SIGNED_IN" && session?.user) {
    try {
      const profile = await getAdminProfile(session.user.id);
      showDashboard(true);
      await renderDashboard(profile);
    } catch (err) {
      console.error("Admin profile after sign-in:", err);
      await supabase.auth.signOut();
      setMessage(
        $("#loginMsg"),
        `❌ ${escapeHtml(err.message || err)}`,
        "error"
      );
    }
  }
});

// ------------------------------------------------------------
// START
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 BPD app starting...");

  setupLogin();
  setupAspirasiForm();
  setupCheckForm();

  ensureDashboardStyles();

  // Jangan membuka dashboard sebelum pengecekan session selesai.
  showDashboard(false);

  await checkExistingSession();
});
