import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://scyhmxfksqlwjkqhlama.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_StNVl1zqzZE_bsetnfi8mA_jl9TBFyI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[m]));

async function news() {
  const b = $("#newsList");
  const { data, error } = await supabase
    .from("berita")
    .select("judul,ringkasan,created_at")
    .eq("diterbitkan", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    b.innerHTML = "<article><h3>Informasi sedang disiapkan</h3><p>Berita BPD akan tampil di sini.</p></article>";
    return;
  }

  b.innerHTML = data?.length
    ? data.map(x => `<article><h3>${esc(x.judul)}</h3><p>${esc(x.ringkasan || "Informasi BPD Desa Kendalserut.")}</p></article>`).join("")
    : "<article><h3>Belum ada berita</h3><p>Berita BPD akan tampil di sini.</p></article>";
}

/* =========================
   KIRIM ASPIRASI
   Menggunakan RPC SECURITY DEFINER.
   Jadi masyarakat tidak perlu memiliki
   akses SELECT ke seluruh tabel aspirasi.
========================= */
$("#aspForm").onsubmit = async (e) => {
  e.preventDefault();

  const f = new FormData(e.target);
  const m = $("#aspMsg");
  const button = e.target.querySelector("button[type=submit]");

  m.textContent = "Mengirim aspirasi...";
  button.disabled = true;

  const { data, error } = await supabase.rpc("submit_aspirasi", {
    p_nama: f.get("nama") || null,
    p_dusun: f.get("wilayah") || null,
    p_rt_rw: null,
    p_whatsapp: f.get("whatsapp") || null,
    p_kategori: f.get("kategori"),
    p_isi_aspirasi: f.get("isi"),
    p_anonim: f.get("anonim") === "on"
  });

  button.disabled = false;

  if (error) {
    console.error(error);
    m.textContent = "Gagal: " + error.message;
    return;
  }

  const ticket = data?.[0]?.nomor_tiket || data?.nomor_tiket;

  if (!ticket) {
    m.textContent = "Aspirasi terkirim, tetapi nomor tiket tidak berhasil diterima.";
    return;
  }

  e.target.reset();
  m.innerHTML = `✅ Aspirasi berhasil dikirim.<br>Nomor tiket Anda: <b>${esc(ticket)}</b><br><small>Simpan nomor tiket ini untuk mengecek status aspirasi.</small>`;
};

/* =========================
   CEK ASPIRASI
   Menggunakan RPC SECURITY DEFINER.
========================= */
$("#checkForm").onsubmit = async (e) => {
  e.preventDefault();

  const t = String(new FormData(e.target).get("ticket") || "").trim().toUpperCase();
  const b = $("#checkResult");

  if (!t) return;

  b.innerHTML = '<div class="result">Memeriksa nomor tiket...</div>';

  const { data, error } = await supabase.rpc("cek_aspirasi", {
    p_nomor_tiket: t
  });

  if (error) {
    console.error(error);
    b.innerHTML = `<div class="result">Gagal memeriksa tiket: ${esc(error.message)}</div>`;
    return;
  }

  const row = data?.[0];

  b.innerHTML = row
    ? `<div class="result">
        <b>${esc(row.nomor_tiket)}</b>
        <p>Kategori: ${esc(row.kategori)}</p>
        <p>Status: <span class="status">${esc(row.status)}</span></p>
        <p>${row.tanggapan ? "Tanggapan BPD: " + esc(row.tanggapan) : "Belum ada tanggapan dari BPD."}</p>
       </div>`
    : '<div class="result">Nomor tiket tidak ditemukan.</div>';
};

/* =========================
   DASHBOARD ADMIN
========================= */
async function admin() {
  const a = $("#adminDash");
  const l = $("#logoutBtn");

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    a.classList.add("hidden");
    l.classList.add("hidden");
    return;
  }

  const { data: p } = await supabase
    .from("admin_profiles")
    .select("nama_lengkap,jabatan")
    .eq("id", user.id)
    .maybeSingle();

  if (!p) {
    a.innerHTML = "<div class='panel'>Akun bukan admin BPD.</div>";
    a.classList.remove("hidden");
    return;
  }

  l.classList.remove("hidden");
  a.classList.remove("hidden");

  const { data: r, error } = await supabase
    .from("aspirasi")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    a.innerHTML = `<div class="panel"><h3>Dashboard ${esc(p.nama_lengkap)}</h3><p>Gagal memuat aspirasi: ${esc(error.message)}</p></div>`;
    return;
  }

  const rows = r || [];

  a.innerHTML = `
    <div class="panel">
      <h3>Dashboard ${esc(p.nama_lengkap)}</h3>
      <p>Total aspirasi: <b>${rows.length}</b></p>
      <div style="overflow:auto">
        <table>
          <tr>
            <th>Tiket</th><th>Pelapor</th><th>Wilayah</th><th>Kategori</th>
            <th>Status</th><th>Tanggapan</th><th>Aksi</th>
          </tr>
          ${rows.map(x => `
            <tr>
              <td>${esc(x.nomor_tiket)}</td>
              <td>${x.anonim ? "Anonim" : esc(x.nama || "Masyarakat")}</td>
              <td>${esc([x.dusun, x.rt_rw].filter(Boolean).join(" / "))}</td>
              <td>${esc(x.kategori)}</td>
              <td>
                <select class="st" data-id="${x.id}">
                  <option ${x.status === "Diterima" ? "selected" : ""}>Diterima</option>
                  <option ${x.status === "Diproses" ? "selected" : ""}>Diproses</option>
                  <option ${x.status === "Ditindaklanjuti" ? "selected" : ""}>Ditindaklanjuti</option>
                  <option ${x.status === "Selesai" ? "selected" : ""}>Selesai</option>
                </select>
              </td>
              <td><textarea class="tg" data-id="${x.id}">${esc(x.tanggapan || "")}</textarea></td>
              <td>
                <button class="detail" data-id="${x.id}">Lihat Detail</button>
                <button class="save" data-id="${x.id}">Simpan</button>
              </td>
            </tr>
          `).join("")}
        </table>
      </div>
    </div>`;

  // Modal detail aspirasi
  const oldModal = document.getElementById("aspDetailModal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "aspDetailModal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;padding:20px;z-index:9999;";
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;max-width:720px;width:100%;max-height:90vh;overflow:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.2)">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:16px">
        <h3 style="margin:0">Detail Aspirasi</h3>
        <button id="closeAspDetail" type="button">✕ Tutup</button>
      </div>
      <div id="aspDetailContent"></div>
    </div>`;
  document.body.appendChild(modal);

  const closeDetail = () => { modal.style.display = "none"; };
  document.getElementById("closeAspDetail").onclick = closeDetail;
  modal.onclick = (ev) => { if (ev.target === modal) closeDetail(); };

  document.querySelectorAll(".detail").forEach((b) => {
    b.onclick = () => {
      const x = rows.find((row) => row.id === b.dataset.id);
      if (!x) return;

      const wilayah = [x.dusun, x.rt_rw].filter(Boolean).join(" / ") || "-";
      const nama = x.anonim ? "Anonim" : (x.nama || "Masyarakat");
      const dibuat = x.created_at ? new Date(x.created_at).toLocaleString("id-ID") : "-";
      const diperbarui = x.updated_at ? new Date(x.updated_at).toLocaleString("id-ID") : "-";

      document.getElementById("aspDetailContent").innerHTML = `
        <div style="display:grid;gap:12px">
          <p><b>Nomor Tiket</b><br>${esc(x.nomor_tiket)}</p>
          <p><b>Nama</b><br>${esc(nama)}</p>
          <p><b>Dusun / RT / RW</b><br>${esc(wilayah)}</p>
          <p><b>WhatsApp</b><br>${esc(x.whatsapp || "-")}</p>
          <p><b>Kategori</b><br>${esc(x.kategori)}</p>
          <p><b>Status</b><br>${esc(x.status)}</p>
          <p><b>Isi Aspirasi</b><br><div style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:10px">${esc(x.isi_aspirasi)}</div></p>
          <p><b>Tanggapan BPD</b><br><div style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:10px">${esc(x.tanggapan || "Belum ada tanggapan.")}</div></p>
          <p><b>Dibuat</b><br>${esc(dibuat)}</p>
          <p><b>Diperbarui</b><br>${esc(diperbarui)}</p>
        </div>`;
      modal.style.display = "flex";
    };
  });

  document.querySelectorAll(".save").forEach((b) => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const s = document.querySelector(`.st[data-id="${id}"]`).value;
      const t = document.querySelector(`.tg[data-id="${id}"]`).value;

      const { error } = await supabase
        .from("aspirasi")
        .update({ status: s, tanggapan: t })
        .eq("id", id);

      alert(error ? error.message : "Tersimpan");
      if (!error) admin();
    };
  });
}

$("#loginForm").onsubmit = async (e) => {
  e.preventDefault();

  const f = new FormData(e.target);
  const m = $("#loginMsg");

  const { error } = await supabase.auth.signInWithPassword({
    email: f.get("email"),
    password: f.get("password")
  });

  m.textContent = error ? error.message : "Login berhasil.";
  if (!error) admin();
};

$("#logoutBtn").onclick = async () => {
  await supabase.auth.signOut();
  admin();
};

$("#navBtn").onclick = () => {
  const n = $("#nav");
  n.style.display = n.style.display === "flex" ? "none" : "flex";
};

news();
admin();
