import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://scyhmxfksqlwjkqhlama.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_StNVl1zqzZE_bsetnfi8mA_jl9TBFyI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const ADMIN_EMAIL = "mohamadnoerikhwan@gmail.com";

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showLoginMessage(message, ok = false) {
  const el = $("loginMsg");
  if (!el) return;
  el.textContent = message;
  el.style.color = ok ? "#246b4b" : "#9a4141";
}

function showAspMessage(message, ok = true) {
  const el = $("aspMsg");
  if (!el) return;
  el.textContent = message;
  el.style.color = ok ? "#28563f" : "#9a4141";
}

function setLoginBusy(busy) {
  const form = $("loginForm");
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? "⏳ Memproses..." : "🔐 Masuk ke Dashboard";
}

function getStatusLabel(status) {
  return status || "Diterima";
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

function renderAdminDashboard(profile, aspirations) {
  let dash = $("adminDash");
  if (!dash) return;

  dash.classList.remove("hidden");

  const rows = aspirations.map((item) => `
    <tr>
      <td>${escapeHtml(item.nomor_tiket || "-")}</td>
      <td>${escapeHtml(item.anonim ? "Anonim" : (item.nama || "-"))}</td>
      <td>${escapeHtml(item.dusun || "-")}</td>
      <td>${escapeHtml(item.kategori || "-")}</td>
      <td>${escapeHtml((item.isi_aspirasi || "").slice(0, 120))}${(item.isi_aspirasi || "").length > 120 ? "…" : ""}</td>
      <td><span class="status">${escapeHtml(getStatusLabel(item.status))}</span></td>
      <td>${escapeHtml(item.tanggapan || "-")}</td>
      <td>${escapeHtml(formatDate(item.created_at))}</td>
      <td>
        <button class="admin-action" data-action="detail" data-id="${escapeHtml(item.id)}">Detail</button>
      </td>
    </tr>
  `).join("");

  dash.innerHTML = `
    <section class="section" style="background:#f4f7f5;">
      <div class="container">
        <div style="background:#075f48;color:#fff;border-radius:18px;padding:24px;margin-bottom:20px;">
          <div class="admin-topbar">
            <div>
              <div style="font-size:13px;opacity:.85;">DASHBOARD ADMIN</div>
              <h2 style="margin:5px 0;color:#fff;">BPD Desa Kendalserut</h2>
              <div class="admin-user">${escapeHtml(profile?.nama_lengkap || ADMIN_EMAIL)} — ${escapeHtml(profile?.jabatan || "Admin BPD")}</div>
            </div>
            <button id="dashboardLogoutBtn" class="logout-button" type="button">🚪 Logout</button>
          </div>
        </div>

        <div style="background:#fff;border:1px solid #e1e8e3;border-radius:18px;padding:22px;overflow:auto;">
          <div style="display:flex;justify-content:space-between;gap:15px;align-items:center;flex-wrap:wrap;margin-bottom:15px;">
            <div>
              <h3 style="margin:0;">Daftar Aspirasi Masyarakat</h3>
              <p style="margin:5px 0;color:#6c7871;">Total ${aspirations.length} aspirasi</p>
            </div>
            <button id="refreshAspBtn" class="btn btn-primary" type="button">🔄 Refresh</button>
          </div>

          <table style="width:100%;border-collapse:collapse;min-width:1050px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Tiket</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Nama</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Wilayah</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Kategori</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Aspirasi</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Status</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Tanggapan</th>
                <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd;">Tanggal</th>
                <th style="padding:10px;border-bottom:1px solid #ddd;">Aksi</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="9" style="padding:25px;text-align:center;">Belum ada aspirasi.</td></tr>`}</tbody>
          </table>

          <div id="adminDetail" style="margin-top:20px;"></div>
        </div>
      </div>
    </section>
  `;

  $("dashboardLogoutBtn")?.addEventListener("click", logoutAdmin);
  $("refreshAspBtn")?.addEventListener("click", async () => {
    await loadDashboard();
  });

  dash.querySelectorAll('[data-action="detail"]').forEach((button) => {
    button.addEventListener("click", () => {
      const item = aspirations.find((x) => x.id === button.dataset.id);
      if (item) renderAspirationDetail(item);
    });
  });
}

function renderAspirationDetail(item) {
  const box = $("adminDetail");
  if (!box) return;

  box.innerHTML = `
    <div style="border:1px solid #dce6df;border-radius:15px;padding:20px;background:#f8fbf9;">
      <h3 style="margin-top:0;">Detail Aspirasi ${escapeHtml(item.nomor_tiket)}</h3>
      <p><strong>Nama:</strong> ${escapeHtml(item.anonim ? "Anonim" : (item.nama || "-"))}</p>
      <p><strong>Dusun/Wilayah:</strong> ${escapeHtml(item.dusun || "-")}</p>
      <p><strong>RT/RW:</strong> ${escapeHtml(item.rt_rw || "-")}</p>
      <p><strong>WhatsApp:</strong> ${escapeHtml(item.whatsapp || "-")}</p>
      <p><strong>Kategori:</strong> ${escapeHtml(item.kategori || "-")}</p>
      <p><strong>Tanggal:</strong> ${escapeHtml(formatDate(item.created_at))}</p>
      <p><strong>Isi Aspirasi:</strong><br>${escapeHtml(item.isi_aspirasi || "-").replaceAll("\n", "<br>")}</p>

      <form id="updateAspForm" style="margin-top:18px;">
        <input type="hidden" id="updateAspId" value="${escapeHtml(item.id)}">
        <div class="form-group">
          <label for="updateStatus">Status</label>
          <select id="updateStatus" required>
            ${["Diterima","Diproses","Ditindaklanjuti","Selesai"].map(s =>
              `<option value="${s}" ${item.status === s ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </div>
        <br>
        <div class="form-group">
          <label for="updateTanggapan">Tanggapan BPD</label>
          <textarea id="updateTanggapan" rows="5" placeholder="Tulis tanggapan BPD...">${escapeHtml(item.tanggapan || "")}</textarea>
        </div>
        <br>
        <button class="btn btn-primary" type="submit">💾 Simpan Perubahan</button>
        <button id="closeDetailBtn" type="button" style="margin-left:8px;padding:10px 15px;border:1px solid #ccd8d0;background:#fff;border-radius:10px;cursor:pointer;">Tutup</button>
        <div id="updateAspMsg" style="margin-top:12px;"></div>
      </form>
    </div>
  `;

  $("closeDetailBtn")?.addEventListener("click", () => {
    box.innerHTML = "";
  });

  $("updateAspForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = $("updateAspId")?.value;
    const status = $("updateStatus")?.value;
    const tanggapan = $("updateTanggapan")?.value?.trim() || null;
    const msg = $("updateAspMsg");

    if (!id || !status) return;

    msg.textContent = "⏳ Menyimpan...";

    const { error } = await supabase
      .from("aspirasi")
      .update({
        status,
        tanggapan,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Update aspirasi:", error);
      msg.textContent = "❌ Gagal menyimpan: " + error.message;
      msg.style.color = "#9a4141";
      return;
    }

    msg.textContent = "✅ Perubahan berhasil disimpan.";
    msg.style.color = "#246b4b";
    await loadDashboard();
  });
}

async function loadDashboard() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    hideDashboard();
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id,email,nama_lengkap,jabatan,aktif")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("admin_profiles:", profileError);
    showLoginMessage("❌ Login berhasil, tetapi profil admin tidak dapat dibaca: " + profileError.message);
    return false;
  }

  if (!profile || profile.aktif !== true) {
    await supabase.auth.signOut();
    hideDashboard();
    showLoginMessage("❌ Akun berhasil login tetapi belum terdaftar/aktif sebagai admin.");
    return false;
  }

  const { data: aspirations, error: aspError } = await supabase
    .from("aspirasi")
    .select("id,nomor_tiket,nama,dusun,rt_rw,whatsapp,kategori,isi_aspirasi,anonim,status,tanggapan,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (aspError) {
    console.error("aspirasi:", aspError);
    renderAdminDashboard(profile, []);
    const dash = $("adminDash");
    if (dash) {
      const warning = document.createElement("div");
      warning.style.cssText = "max-width:1100px;margin:-5px auto 20px;padding:15px 20px;background:#fff0f0;color:#9a4141;border:1px solid #e7caca;border-radius:12px;";
      warning.textContent = "⚠️ Login berhasil, tetapi data aspirasi tidak bisa dibaca. Periksa RLS tabel aspirasi. " + aspError.message;
      dash.prepend(warning);
    }
    return true;
  }

  renderAdminDashboard(profile, aspirations || []);
  $("loginMsg") && showLoginMessage("✅ Login berhasil.", true);
  $("logoutBtn")?.classList.remove("hidden");

  const loginSection = $("login-admin");
  if (loginSection) loginSection.classList.add("hidden");

  $("adminDash")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

function hideDashboard() {
  const dash = $("adminDash");
  if (dash) {
    dash.classList.add("hidden");
    dash.innerHTML = "";
  }
  $("logoutBtn")?.classList.add("hidden");
}

async function loginAdmin(event) {
  event.preventDefault();

  const form = $("loginForm");
  if (!form) {
    console.error("loginForm tidak ditemukan.");
    return;
  }

  const email = $("email")?.value?.trim();
  const password = $("password")?.value;

  if (!email || !password) {
    showLoginMessage("❌ Email dan password wajib diisi.");
    return;
  }

  setLoginBusy(true);
  showLoginMessage("⏳ Memeriksa akun...");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Supabase login:", error);
      showLoginMessage("❌ Login gagal: " + error.message);
      return;
    }

    if (!data?.user) {
      showLoginMessage("❌ Login gagal: akun tidak ditemukan.");
      return;
    }

    if (data.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await supabase.auth.signOut();
      showLoginMessage("❌ Akun ini bukan akun administrator BPD.");
      return;
    }

    const ok = await loadDashboard();
    if (ok) {
      form.reset();
    }
  } catch (err) {
    console.error("Kesalahan login:", err);
    showLoginMessage("❌ Terjadi kesalahan saat login: " + (err?.message || err));
  } finally {
    setLoginBusy(false);
  }
}

async function logoutAdmin() {
  await supabase.auth.signOut();
  hideDashboard();

  const loginSection = $("login-admin");
  if (loginSection) loginSection.classList.remove("hidden");

  showLoginMessage("✅ Anda sudah logout.", true);
  loginSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function submitAspiration(event) {
  event.preventDefault();

  const form = $("aspForm");
  if (!form) return;

  const formData = new FormData(form);
  const nama = String(formData.get("nama") || "").trim();
  const wilayah = String(formData.get("wilayah") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const kategori = String(formData.get("kategori") || "").trim();
  const isi = String(formData.get("isi") || "").trim();
  const anonim = formData.get("anonim") === "on";

  if (!kategori || !isi) {
    showAspMessage("❌ Kategori dan isi aspirasi wajib diisi.", false);
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.textContent = "⏳ Mengirim...";
  }

  showAspMessage("⏳ Mengirim aspirasi...");

  try {
    const { data, error } = await supabase
      .from("aspirasi")
      .insert({
        nama: anonim ? null : (nama || null),
        dusun: wilayah || null,
        whatsapp: anonim ? null : (whatsapp || null),
        kategori,
        isi_aspirasi: isi,
        anonim,
        status: "Diterima",
        tanggapan: null
      })
      .select("nomor_tiket,status")
      .single();

    if (error) {
      console.error("Insert aspirasi:", error);
      showAspMessage("❌ Gagal mengirim aspirasi: " + error.message, false);
      return;
    }

    showAspMessage(
      `✅ Aspirasi berhasil dikirim! Nomor Tiket Anda: ${data.nomor_tiket || "-"} Status: ${data.status || "Diterima"}. Simpan nomor tiket ini untuk mengecek perkembangan aspirasi.`
    );

    form.reset();
  } catch (err) {
    console.error("Kesalahan pengiriman:", err);
    showAspMessage("❌ Terjadi kesalahan: " + (err?.message || err), false);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "📣 Kirim Aspirasi";
    }
  }
}

async function checkAspiration(event) {
  event.preventDefault();

  const ticket = $("ticket")?.value?.trim();
  const result = $("checkResult");

  if (!result) return;

  if (!ticket) {
    result.innerHTML = `<div class="result ticket-result">❌ Masukkan nomor tiket.</div>`;
    return;
  }

  result.innerHTML = `<div class="result">⏳ Mencari nomor tiket...</div>`;

  const { data, error } = await supabase
    .from("aspirasi")
    .select("nomor_tiket,kategori,isi_aspirasi,status,tanggapan,created_at,updated_at")
    .eq("nomor_tiket", ticket)
    .maybeSingle();

  if (error) {
    console.error("Cek tiket:", error);
    result.innerHTML = `<div class="result ticket-result">❌ Gagal memeriksa tiket: ${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!data) {
    result.innerHTML = `<div class="result ticket-result">❌ Nomor tiket tidak ditemukan.</div>`;
    return;
  }

  result.innerHTML = `
    <div class="result ticket-result">
      <p><strong>Nomor Tiket:</strong> ${escapeHtml(data.nomor_tiket)}</p>
      <p><strong>Kategori:</strong> ${escapeHtml(data.kategori)}</p>
      <p><strong>Status:</strong> <span class="status">${escapeHtml(data.status)}</span></p>
      <p><strong>Tanggal:</strong> ${escapeHtml(formatDate(data.created_at))}</p>
      <p><strong>Tanggapan BPD:</strong><br>${escapeHtml(data.tanggapan || "Belum ada tanggapan.").replaceAll("\n", "<br>")}</p>
    </div>
  `;
}

async function init() {
  console.log("✅ app.js BPD Desa Kendalserut berhasil dimuat.");

  $("loginForm")?.addEventListener("submit", loginAdmin);
  $("aspForm")?.addEventListener("submit", submitAspiration);
  $("checkForm")?.addEventListener("submit", checkAspiration);
  $("logoutBtn")?.addEventListener("click", logoutAdmin);

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    await loadDashboard();
  }

  supabase.auth.onAuthStateChange(async (event, sessionNow) => {
    console.log("Auth event:", event);

    if (sessionNow?.user && event === "SIGNED_IN") {
      await loadDashboard();
    }

    if (!sessionNow && event === "SIGNED_OUT") {
      hideDashboard();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
