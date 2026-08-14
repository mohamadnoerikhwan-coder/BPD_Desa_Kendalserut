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
   DASHBOARD ADMIN BPD
   - Statistik aspirasi
   - Pencarian & filter status
   - Daftar aspirasi terbaru
   - Detail aspirasi
   - Ubah status & tanggapan
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

  const { data: p, error: profileError } = await supabase
    .from("admin_profiles")
    .select("nama_lengkap,jabatan")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !p) {
    a.innerHTML = "<div class='panel'><h3>Akses Admin</h3><p>Akun ini belum terdaftar sebagai admin BPD.</p></div>";
    a.classList.remove("hidden");
    return;
  }

  l.classList.remove("hidden");
  a.classList.remove("hidden");
  a.innerHTML = "<div class='panel'><p>Memuat dashboard...</p></div>";

  const { data: r, error } = await supabase
    .from("aspirasi")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    a.innerHTML = `<div class="panel"><h3>Dashboard ${esc(p.nama_lengkap)}</h3><p>Gagal memuat aspirasi: ${esc(error.message)}</p></div>`;
    return;
  }

  const rows = r || [];
  const count = (status) => rows.filter(x => x.status === status).length;

  a.innerHTML = `
    <div class="panel">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap">
        <div>
          <span class="eyebrow">DASHBOARD ADMIN</span>
          <h3 style="margin:.25rem 0">${esc(p.nama_lengkap)}</h3>
          <p style="margin:0">${esc(p.jabatan || "Admin BPD Desa Kendalserut")}</p>
        </div>
        <button id="refreshAdmin" class="btn secondary" type="button">↻ Refresh</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:22px 0">
        <div class="panel" style="margin:0;background:#f7faf8"><small>Total Aspirasi</small><h2 style="margin:.3rem 0">${rows.length}</h2></div>
        <div class="panel" style="margin:0;background:#f7faf8"><small>Diterima</small><h2 style="margin:.3rem 0">${count("Diterima")}</h2></div>
        <div class="panel" style="margin:0;background:#f7faf8"><small>Diproses</small><h2 style="margin:.3rem 0">${count("Diproses")}</h2></div>
        <div class="panel" style="margin:0;background:#f7faf8"><small>Ditindaklanjuti</small><h2 style="margin:.3rem 0">${count("Ditindaklanjuti")}</h2></div>
        <div class="panel" style="margin:0;background:#f7faf8"><small>Selesai</small><h2 style="margin:.3rem 0">${count("Selesai")}</h2></div>
        <div class="panel" style="margin:0;background:#f7faf8"><small>Ditolak</small><h2 style="margin:.3rem 0">${count("Ditolak")}</h2></div>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        <input id="adminSearch" type="search" placeholder="Cari nomor tiket, nama, wilayah, kategori..." style="flex:1;min-width:230px">
        <select id="adminStatusFilter" style="min-width:170px">
          <option value="">Semua status</option>
          <option>Diterima</option>
          <option>Diproses</option>
          <option>Ditindaklanjuti</option>
          <option>Selesai</option>
          <option>Ditolak</option>
        </select>
      </div>

      <div id="adminTableWrap" style="overflow:auto"></div>
    </div>`;

  const tableWrap = $("#adminTableWrap");

  function renderTable() {
    const q = ($("#adminSearch")?.value || "").trim().toLowerCase();
    const sf = $("#adminStatusFilter")?.value || "";

    const filtered = rows.filter(x => {
      const haystack = [
        x.nomor_tiket, x.nama, x.dusun, x.rt_rw, x.kategori, x.isi_aspirasi, x.status
      ].filter(Boolean).join(" ").toLowerCase();

      return (!q || haystack.includes(q)) && (!sf || x.status === sf);
    });

    tableWrap.innerHTML = filtered.length ? `
      <table>
        <thead>
          <tr>
            <th>Tiket</th>
            <th>Pelapor</th>
            <th>Wilayah</th>
            <th>Kategori</th>
            <th>Status</th>
            <th>Tanggapan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(x => `
            <tr>
              <td><b>${esc(x.nomor_tiket)}</b><br><small>${x.created_at ? esc(new Date(x.created_at).toLocaleDateString("id-ID")) : ""}</small></td>
              <td>${x.anonim ? "Anonim" : esc(x.nama || "Masyarakat")}</td>
              <td>${esc([x.dusun, x.rt_rw].filter(Boolean).join(" / ") || "-")}</td>
              <td>${esc(x.kategori)}</td>
              <td>
                <select class="st" data-id="${x.id}">
                  <option ${x.status === "Diterima" ? "selected" : ""}>Diterima</option>
                  <option ${x.status === "Diproses" ? "selected" : ""}>Diproses</option>
                  <option ${x.status === "Ditindaklanjuti" ? "selected" : ""}>Ditindaklanjuti</option>
                  <option ${x.status === "Selesai" ? "selected" : ""}>Selesai</option>
                  <option ${x.status === "Ditolak" ? "selected" : ""}>Ditolak</option>
                </select>
              </td>
              <td><textarea class="tg" data-id="${x.id}" rows="2" placeholder="Tulis tanggapan...">${esc(x.tanggapan || "")}</textarea></td>
              <td style="white-space:nowrap">
                <button class="detail" data-id="${x.id}" type="button">Lihat Detail</button>
                <button class="save" data-id="${x.id}" type="button">Simpan</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <p style="margin-top:12px"><small>Menampilkan ${filtered.length} dari ${rows.length} aspirasi.</small></p>
    ` : `<div class="panel" style="margin:0"><p>Tidak ada aspirasi yang sesuai dengan pencarian/filter.</p></div>`;

    document.querySelectorAll(".detail").forEach((b) => {
      b.onclick = () => {
        const x = rows.find(row => row.id === b.dataset.id);
        if (!x) return;
        showDetail(x);
      };
    });

    document.querySelectorAll(".save").forEach((b) => {
      b.onclick = async () => {
        const id = b.dataset.id;
        const s = document.querySelector(`.st[data-id="${id}"]`)?.value;
        const t = document.querySelector(`.tg[data-id="${id}"]`)?.value || "";
        b.disabled = true;
        b.textContent = "Menyimpan...";

        const { error } = await supabase
          .from("aspirasi")
          .update({ status: s, tanggapan: t })
          .eq("id", id);

        b.disabled = false;
        b.textContent = "Simpan";

        if (error) {
          alert("Gagal menyimpan: " + error.message);
          return;
        }

        const item = rows.find(row => row.id === id);
        if (item) {
          item.status = s;
          item.tanggapan = t;
        }

        alert("Perubahan berhasil disimpan.");
        admin();
      };
    });
  }

  function showDetail(x) {
    const oldModal = document.getElementById("aspDetailModal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "aspDetailModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.48);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999";

    const wilayah = [x.dusun, x.rt_rw].filter(Boolean).join(" / ") || "-";
    const nama = x.anonim ? "Anonim" : (x.nama || "Masyarakat");
    const dibuat = x.created_at ? new Date(x.created_at).toLocaleString("id-ID") : "-";
    const diperbarui = x.updated_at ? new Date(x.updated_at).toLocaleString("id-ID") : "-";

    modal.innerHTML = `
      <div style="background:#fff;border-radius:18px;max-width:760px;width:100%;max-height:90vh;overflow:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25)">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:18px">
          <div>
            <small>DETAIL ASPIRASI</small>
            <h3 style="margin:.25rem 0">${esc(x.nomor_tiket)}</h3>
          </div>
          <button id="closeAspDetail" type="button">✕ Tutup</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">
          <div><b>Nama</b><br>${esc(nama)}</div>
          <div><b>Dusun / RT / RW</b><br>${esc(wilayah)}</div>
          <div><b>WhatsApp</b><br>${esc(x.whatsapp || "-")}</div>
          <div><b>Kategori</b><br>${esc(x.kategori || "-")}</div>
          <div><b>Status</b><br><span class="status">${esc(x.status || "-")}</span></div>
          <div><b>Diajukan</b><br>${esc(dibuat)}</div>
        </div>

        <hr style="margin:20px 0">
        <p><b>Isi Aspirasi</b></p>
        <div style="white-space:pre-wrap;background:#f6f8f7;padding:14px;border-radius:12px">${esc(x.isi_aspirasi || "-")}</div>

        <p><b>Tanggapan BPD</b></p>
        <div style="white-space:pre-wrap;background:#f6f8f7;padding:14px;border-radius:12px">${esc(x.tanggapan || "Belum ada tanggapan.")}</div>

        <p><small>Terakhir diperbarui: ${esc(diperbarui)}</small></p>
      </div>`;

    document.body.appendChild(modal);
    const close = () => modal.remove();
    $("#closeAspDetail").onclick = close;
    modal.onclick = ev => { if (ev.target === modal) close(); };
  }

  $("#adminSearch").oninput = renderTable;
  $("#adminStatusFilter").onchange = renderTable;
  $("#refreshAdmin").onclick = admin;

  renderTable();
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
