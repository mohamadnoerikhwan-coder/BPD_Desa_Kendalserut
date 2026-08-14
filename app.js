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


<style id="publicHomePolish">
/* ===== HALAMAN PUBLIK BPD KENDALSERUT ===== */
:root{
  --bpd-green:#123d2d;--bpd-green2:#1f6a4c;--bpd-soft:#eef5f1;
  --bpd-gold:#c99a45;--bpd-text:#203029;--bpd-muted:#68756e;
  --bpd-line:#e5ebe7;
}
body{background:#f7f9f8;color:var(--bpd-text)}
.public-hero{max-width:1180px;margin:22px auto;padding:44px 34px;border-radius:24px;
background:linear-gradient(135deg,var(--bpd-green),var(--bpd-green2));color:#fff;
box-shadow:0 16px 42px rgba(18,61,45,.16);position:relative;overflow:hidden}
.public-hero:after{content:"";position:absolute;width:300px;height:300px;border-radius:50%;
right:-100px;top:-120px;background:rgba(255,255,255,.07)}
.public-hero small{letter-spacing:.13em;font-weight:800;opacity:.82}
.public-hero h1{font-size:clamp(30px,5vw,50px);line-height:1.08;margin:10px 0 12px;max-width:760px}
.public-hero p{font-size:16px;line-height:1.7;max-width:720px;margin:0;opacity:.92}
.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}
.hero-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:11px;text-decoration:none;font-weight:800}
.hero-btn.primary{background:#fff;color:var(--bpd-green)}
.hero-btn.secondary{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.35);color:#fff}
.public-section{max-width:1180px;margin:20px auto;padding:0 18px}
.section-title{margin:0 0 5px;font-size:25px;color:var(--bpd-green)}
.section-subtitle{margin:0 0 16px;color:var(--bpd-muted)}
.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.feature-card{background:#fff;border:1px solid var(--bpd-line);border-radius:18px;padding:22px;
box-shadow:0 6px 22px rgba(0,0,0,.04)}
.feature-icon{width:42px;height:42px;border-radius:12px;background:var(--bpd-soft);
display:grid;place-items:center;font-size:21px;margin-bottom:12px}
.feature-card h3{margin:0 0 7px;color:var(--bpd-green);font-size:17px}
.feature-card p{margin:0;color:var(--bpd-muted);line-height:1.6;font-size:14px}
.aspirasi-callout{max-width:1180px;margin:20px auto;padding:24px 26px;border-radius:20px;
background:#fff;border:1px solid var(--bpd-line);display:flex;justify-content:space-between;
align-items:center;gap:20px;box-shadow:0 7px 24px rgba(0,0,0,.045)}
.aspirasi-callout h2{margin:0 0 5px;color:var(--bpd-green);font-size:22px}
.aspirasi-callout p{margin:0;color:var(--bpd-muted)}
.public-btn{border:0;border-radius:10px;padding:11px 16px;background:var(--bpd-green);
color:#fff;font-weight:800;cursor:pointer;text-decoration:none;white-space:nowrap}
.public-footer{margin-top:34px;padding:28px 18px;background:var(--bpd-green);color:#fff}
.public-footer-inner{max-width:1180px;margin:auto;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
.public-footer small{opacity:.78}
@media(max-width:760px){
 .public-hero{margin:10px;padding:30px 22px;border-radius:19px}
 .public-section{padding:0 10px}.feature-grid{grid-template-columns:1fr}
 .aspirasi-callout{margin:14px 10px;padding:20px;align-items:flex-start;flex-direction:column}
 .public-btn{width:100%;text-align:center}
}
</style>
<script>
(function(){
  function buildPublicHome(){
    if(document.getElementById("publicHomePolishFooter")) return;
    const main=document.querySelector("main") || document.body;
    const hero=document.createElement("section");
    hero.className="public-hero";
    hero.innerHTML=`<small>LEMBAGA BPD DESA KENDALSERUT</small>
      <h1>Wadah Informasi & Aspirasi Masyarakat</h1>
      <p>Badan Permusyawaratan Desa Kendalserut hadir sebagai ruang komunikasi masyarakat untuk menyampaikan aspirasi, mengikuti informasi, dan memantau tindak lanjut secara terbuka.</p>
      <div class="hero-actions">
        <a class="hero-btn primary" href="#aspirasi">✉ Kirim Aspirasi</a>
        <a class="hero-btn secondary" href="#cek">🎫 Cek Aspirasi</a>
      </div>`;
    main.insertBefore(hero, main.firstChild);

    const section=document.createElement("section");
    section.className="public-section";
    section.innerHTML=`<h2 class="section-title">Layanan BPD Desa Kendalserut</h2>
      <p class="section-subtitle">Informasi dan layanan utama untuk masyarakat.</p>
      <div class="feature-grid">
        <article class="feature-card"><div class="feature-icon">📢</div><h3>Sampaikan Aspirasi</h3><p>Sampaikan usulan, keluhan, atau masukan kepada BPD secara mudah melalui website.</p></article>
        <article class="feature-card"><div class="feature-icon">🎫</div><h3>Lacak Aspirasi</h3><p>Gunakan nomor tiket untuk melihat status dan tanggapan atas aspirasi yang telah dikirim.</p></article>
        <article class="feature-card"><div class="feature-icon">🏛️</div><h3>Informasi BPD</h3><p>Menjadi media informasi kegiatan dan pelayanan Badan Permusyawaratan Desa Kendalserut.</p></article>
      </div>`;
    hero.after(section);

    const call=document.createElement("section");
    call.className="aspirasi-callout";
    call.innerHTML=`<div><h2>Mari sampaikan aspirasi Anda</h2><p>Partisipasi masyarakat membantu pembangunan Desa Kendalserut menjadi lebih baik.</p></div>
      <a class="public-btn" href="#aspirasi">Kirim Aspirasi →</a>`;
    section.after(call);

    const footer=document.createElement("footer");
    footer.id="publicHomePolishFooter"; footer.className="public-footer";
    footer.innerHTML=`<div class="public-footer-inner"><div><strong>BPD Desa Kendalserut</strong><br><small>Wadah informasi dan aspirasi masyarakat</small></div><div><small>Kecamatan Pangkah • Kabupaten Tegal</small></div></div>`;
    document.body.appendChild(footer);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",buildPublicHome);
  else buildPublicHome();
})();
</script>


<style id="profilePageStyle">
.profile-page{max-width:1180px;margin:24px auto;padding:0 18px}
.profile-hero{background:linear-gradient(135deg,#123d2d,#1f6a4c);color:#fff;border-radius:24px;padding:36px 30px;box-shadow:0 14px 36px rgba(18,61,45,.14)}
.profile-hero small{letter-spacing:.12em;font-weight:800;opacity:.8}.profile-hero h1{font-size:clamp(30px,5vw,46px);margin:8px 0}.profile-hero p{max-width:760px;line-height:1.7;margin:0;opacity:.92}
.profile-grid{display:grid;grid-template-columns:1.35fr .8fr;gap:16px;margin-top:16px}
.profile-card{background:#fff;border:1px solid #e5ebe7;border-radius:18px;padding:24px;box-shadow:0 7px 24px rgba(0,0,0,.045)}
.profile-card h2,.profile-card h3{color:#123d2d;margin-top:0}.profile-card p,.profile-card li{line-height:1.75;color:#68756e}
.profile-card ul,.profile-card ol{padding-left:22px}.profile-list{display:grid;gap:10px}
.profile-list div{padding:12px 14px;border-radius:11px;background:#f7f9f8}
.profile-list b{display:block;color:#123d2d;margin-bottom:3px}
.profile-vision{border-left:4px solid #c99a45;padding-left:16px;font-style:italic}
@media(max-width:800px){.profile-grid{grid-template-columns:1fr}.profile-page{padding:0 10px}.profile-hero{padding:28px 22px}}
</style>
<script>
(function(){
  function showProfile(){
    let mount=document.getElementById("profilPageMount");
    if(!mount){
      mount=document.createElement("div");
      mount.id="profilPageMount";
      (document.querySelector("main")||document.body).appendChild(mount);
    }
    mount.innerHTML=`
      <section class="profile-page">
        <div class="profile-hero">
          <small>PROFIL LEMBAGA</small>
          <h1>BPD Desa Kendalserut</h1>
          <p>Badan Permusyawaratan Desa Kendalserut merupakan lembaga yang menjadi ruang partisipasi masyarakat dalam menyampaikan aspirasi, membangun komunikasi, dan mengawal kepentingan masyarakat desa.</p>
        </div>
        <div class="profile-grid">
          <div>
            <article class="profile-card">
              <h2>Tentang BPD</h2>
              <p>Badan Permusyawaratan Desa (BPD) adalah lembaga yang mewadahi peran masyarakat desa dalam penyelenggaraan pemerintahan desa. BPD Desa Kendalserut berupaya menjadi jembatan komunikasi antara masyarakat dengan Pemerintah Desa serta memastikan aspirasi masyarakat dapat disampaikan dan ditindaklanjuti secara baik.</p>
            </article>
            <article class="profile-card">
              <h2>Tugas dan Fungsi BPD</h2>
              <ul>
                <li>Menampung dan menyalurkan aspirasi masyarakat.</li>
                <li>Membahas dan menyepakati rancangan Peraturan Desa bersama Kepala Desa.</li>
                <li>Melakukan pengawasan terhadap kinerja Kepala Desa.</li>
                <li>Mendorong partisipasi masyarakat dalam pembangunan desa.</li>
              </ul>
            </article>
          </div>
          <article class="profile-card">
            <h3>Identitas BPD</h3>
            <div class="profile-list">
              <div><b>Nama Lembaga</b>BPD Desa Kendalserut</div>
              <div><b>Desa</b>Kendalserut</div>
              <div><b>Kecamatan</b>Pangkah</div>
              <div><b>Kabupaten</b>Tegal</div>
              <div><b>Provinsi</b>Jawa Tengah</div>
            </div>
          </article>
        </div>
        <div class="profile-grid">
          <article class="profile-card">
            <h2>Visi</h2>
            <p class="profile-vision">“Mewujudkan BPD Desa Kendalserut yang aspiratif, terbuka, responsif, dan mampu menjadi mitra masyarakat serta Pemerintah Desa dalam mewujudkan Desa Kendalserut yang lebih maju dan sejahtera.”</p>
          </article>
          <article class="profile-card">
            <h2>Misi</h2>
            <ol>
              <li>Menampung aspirasi masyarakat secara terbuka.</li>
              <li>Mendorong transparansi dan komunikasi antara masyarakat dan Pemerintah Desa.</li>
              <li>Mengawal aspirasi masyarakat agar mendapatkan tindak lanjut.</li>
              <li>Meningkatkan partisipasi masyarakat dalam pembangunan desa.</li>
            </ol>
          </article>
        </div>
      </section>`;
    mount.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function bindProfile(){
    document.querySelectorAll("a,button").forEach(function(el){
      if(/profil bpd/i.test(el.textContent||"") && !el.dataset.profileBound){
        el.dataset.profileBound="1";
        el.addEventListener("click",function(e){e.preventDefault();showProfile();});
      }
    });
    if(location.hash.toLowerCase()==="#profil") showProfile();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bindProfile);
  else bindProfile();
})();
</script>


<style id="structurePageStyle">
.structure-page{max-width:1180px;margin:24px auto;padding:0 18px}
.structure-hero{background:linear-gradient(135deg,#123d2d,#1f6a4c);color:#fff;border-radius:24px;padding:36px 30px;box-shadow:0 14px 36px rgba(18,61,45,.14)}
.structure-hero small{letter-spacing:.12em;font-weight:800;opacity:.8}.structure-hero h1{font-size:clamp(30px,5vw,46px);margin:8px 0}.structure-hero p{max-width:760px;line-height:1.7;margin:0;opacity:.92}
.structure-section-title{text-align:center;color:#123d2d;margin:26px 0 14px}
.structure-top{display:flex;justify-content:center;margin:16px 0}.structure-card{background:#fff;border:1px solid #e5ebe7;border-radius:18px;padding:22px;text-align:center;box-shadow:0 7px 24px rgba(0,0,0,.045)}
.structure-card.featured{border-top:5px solid #c99a45;min-width:270px}.structure-card h3{margin:0;color:#123d2d;font-size:19px}.structure-card p{margin:6px 0 0;color:#68756e;font-size:14px;line-height:1.5}
.structure-line{width:2px;height:28px;background:#cfd9d3;margin:0 auto}
.structure-second{display:grid;grid-template-columns:repeat(2,270px);justify-content:center;gap:16px}
.structure-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:16px}
.structure-group{background:#fff;border:1px solid #e5ebe7;border-radius:20px;padding:20px;box-shadow:0 7px 24px rgba(0,0,0,.045)}
.structure-group h3{margin:0 0 14px;color:#123d2d;text-align:center;font-size:17px}
.structure-members{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.structure-member{background:#f7f9f8;border-radius:14px;padding:17px;text-align:center}
.structure-member strong{display:block;color:#123d2d}.structure-member span{display:block;color:#68756e;font-size:13px;line-height:1.45;margin-top:5px}
.structure-note{text-align:center;color:#68756e;font-size:13px;margin:20px 0}
@media(max-width:700px){.structure-page{padding:0 10px}.structure-hero{padding:28px 22px}.structure-second,.structure-grid{grid-template-columns:1fr}.structure-members{grid-template-columns:1fr}.structure-card.featured{min-width:0}}
</style>
<script>
(function(){
  function showStructure(){
    let mount=document.getElementById("strukturBpdMount");
    if(!mount){
      mount=document.createElement("div");
      mount.id="strukturBpdMount";
      (document.querySelector("main")||document.body).appendChild(mount);
    }
    mount.innerHTML=`
      <section class="structure-page">
        <div class="structure-hero">
          <small>STRUKTUR ORGANISASI</small>
          <h1>BPD Desa Kendalserut</h1>
          <p>Susunan anggota Badan Permusyawaratan Desa Kendalserut sebagai wadah perwakilan dan partisipasi masyarakat desa.</p>
        </div>

        <h2 class="structure-section-title">Pimpinan BPD</h2>
        <div class="structure-top">
          <div class="structure-card featured"><h3>Siti Muslicha, Amd</h3><p>Ketua</p></div>
        </div>
        <div class="structure-line"></div>
        <div class="structure-second">
          <div class="structure-card"><h3>Akhmad Suswanto, S.Pd.SD</h3><p>Wakil Ketua</p></div>
          <div class="structure-card"><h3>Sunjoyo, SM</h3><p>Sekretaris</p></div>
        </div>

        <h2 class="structure-section-title">Bidang Pemerintahan &amp; Pembinaan Masyarakat</h2>
        <div class="structure-group">
          <div class="structure-members">
            <div class="structure-member"><strong>Farkhatun</strong><span>Ketua Bidang Pemerintahan dan Pembinaan Masyarakat</span></div>
            <div class="structure-member"><strong>Yasin Nurjati Kusumo</strong><span>Anggota Bidang Pemerintahan dan Pembinaan Masyarakat</span></div>
          </div>
        </div>

        <h2 class="structure-section-title">Bidang Pembangunan &amp; Pemberdayaan Masyarakat</h2>
        <div class="structure-group">
          <div class="structure-members">
            <div class="structure-member"><strong>Mohamad Nur Ikhwan</strong><span>Ketua Bidang Pembangunan dan Pemberdayaan Masyarakat</span></div>
            <div class="structure-member"><strong>Udi Pamungkas</strong><span>Anggota Bidang Pembangunan dan Pemberdayaan Masyarakat</span></div>
          </div>
        </div>
        <p class="structure-note">BPD Desa Kendalserut • Kecamatan Pangkah • Kabupaten Tegal</p>
      </section>`;
    mount.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function bindStructure(){
    document.querySelectorAll("a,button").forEach(function(el){
      if(/struktur bpd/i.test(el.textContent||"") && !el.dataset.structureBound){
        el.dataset.structureBound="1";
        el.addEventListener("click",function(e){e.preventDefault();showStructure();});
      }
    });
    if(location.hash.toLowerCase()==="#struktur") showStructure();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bindStructure);
  else bindStructure();
})();
</script>

/* =========================
   DASHBOARD ADMIN BPD — RAPI & RESPONSIVE
========================= */
async function admin() {
  const a = $("#adminDash");
  const l = $("#logoutBtn");
  if (!a) return;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    a.classList.add("hidden");
    if (l) l.classList.add("hidden");
    return;
  }

  const { data: p, error: profileError } = await supabase
    .from("admin_profiles")
    .select("nama_lengkap,jabatan")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !p) {
    a.innerHTML = `
      <section class="adm-shell">
        <div class="adm-card adm-empty">
          <div class="adm-icon">🔐</div>
          <h3>Akses Admin</h3>
          <p>Akun ini belum terdaftar sebagai admin BPD.</p>
        </div>
      </section>`;
    a.classList.remove("hidden");
    return;
  }

  l?.classList.remove("hidden");
  a.classList.remove("hidden");
  a.innerHTML = `
    <section class="adm-shell">
      <div class="adm-loading">Memuat dashboard...</div>
    </section>`;

  const { data: r, error } = await supabase
    .from("aspirasi")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    a.innerHTML = `
      <section class="adm-shell">
        <div class="adm-card adm-empty">
          <div class="adm-icon">⚠️</div>
          <h3>Gagal memuat data</h3>
          <p>${esc(error.message)}</p>
        </div>
      </section>`;
    return;
  }

  const rows = r || [];
  const count = status => rows.filter(x => x.status === status).length;

  // Inject dashboard-only CSS once.
  if (!document.getElementById("admDashboardStyle")) {
    const style = document.createElement("style");
    style.id = "admDashboardStyle";
    style.textContent = `
      .adm-shell{max-width:1180px;margin:24px auto;padding:0 18px}
      .adm-hero{background:linear-gradient(135deg,#123d2d,#1f6a4c);color:#fff;border-radius:22px;padding:26px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;box-shadow:0 12px 32px rgba(18,61,45,.16)}
      .adm-hero small{opacity:.8;letter-spacing:.12em;font-weight:700}
      .adm-hero h2{margin:6px 0 4px;font-size:28px}
      .adm-hero p{margin:0;opacity:.88}
      .adm-hero-actions{display:flex;gap:10px;flex-wrap:wrap}
      .adm-btn{border:0;border-radius:11px;padding:10px 15px;font-weight:700;cursor:pointer;font-size:14px}
      .adm-btn-light{background:#fff;color:#123d2d}
      .adm-btn-ghost{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.3)}
      .adm-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:16px 0}
      .adm-stat{background:#fff;border:1px solid #e7ece9;border-radius:16px;padding:17px;box-shadow:0 5px 18px rgba(0,0,0,.04)}
      .adm-stat-label{font-size:12px;color:#6b7771;font-weight:700}
      .adm-stat-value{font-size:27px;font-weight:800;margin-top:5px;color:#17382b}
      .adm-stat.total{border-top:4px solid #245c45}.adm-stat.accept{border-top:4px solid #6b8e7a}
      .adm-stat.process{border-top:4px solid #d19a3a}.adm-stat.follow{border-top:4px solid #547ba8}
      .adm-stat.done{border-top:4px solid #31805b}.adm-stat.reject{border-top:4px solid #b95858}
      .adm-card{background:#fff;border:1px solid #e6ebe8;border-radius:20px;box-shadow:0 7px 24px rgba(0,0,0,.045);overflow:hidden}
      .adm-toolbar{padding:18px;border-bottom:1px solid #edf0ee;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
      .adm-search{flex:1;min-width:240px}
      .adm-input,.adm-select{width:100%;border:1px solid #d8e0db;border-radius:10px;padding:11px 12px;background:#fff;box-sizing:border-box}
      .adm-toolbar .adm-input,.adm-toolbar .adm-select{width:auto}
      .adm-table-wrap{overflow:auto}
      .adm-table{width:100%;border-collapse:collapse;min-width:900px}
      .adm-table th{background:#f5f8f6;color:#56645d;font-size:12px;text-transform:uppercase;letter-spacing:.04em;text-align:left;padding:13px 14px;white-space:nowrap}
      .adm-table td{padding:14px;border-top:1px solid #edf0ee;vertical-align:top;font-size:13px}
      .adm-table tr:hover td{background:#fbfdfc}
      .adm-ticket{font-weight:800;color:#174f39}
      .adm-date{font-size:11px;color:#7b8781;margin-top:3px}
      .adm-person{font-weight:700}.adm-muted{color:#7b8781}
      .adm-status{border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;display:inline-block;white-space:nowrap}
      .adm-status-d{background:#edf5f0;color:#276446}.adm-status-p{background:#fff5df;color:#8a641e}
      .adm-status-t{background:#eaf2fb;color:#3d638d}.adm-status-s{background:#e8f7ef;color:#25704a}
      .adm-status-x{background:#faeaea;color:#9a4141}
      .adm-actions{display:flex;gap:7px;flex-wrap:wrap}
      .adm-action{border:0;border-radius:9px;padding:8px 10px;cursor:pointer;font-weight:700;font-size:12px}
      .adm-detail{background:#eef5f1;color:#245c45}.adm-save{background:#245c45;color:#fff}
      .adm-action:disabled{opacity:.55;cursor:wait}
      .adm-note{min-width:180px;resize:vertical}
      .adm-footer{padding:13px 18px;color:#758079;font-size:12px}
      .adm-empty{text-align:center;padding:50px 20px}
      .adm-icon{font-size:34px;margin-bottom:8px}
      .adm-loading{text-align:center;padding:40px;color:#6b7771}
      .adm-modal{position:fixed;inset:0;background:rgba(10,27,20,.58);display:flex;align-items:center;justify-content:center;padding:18px;z-index:9999}
      .adm-modal-box{background:#fff;border-radius:22px;max-width:780px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 24px 80px rgba(0,0,0,.25)}
      .adm-modal-head{padding:20px 22px;border-bottom:1px solid #edf0ee;display:flex;justify-content:space-between;gap:16px;align-items:center}
      .adm-modal-body{padding:22px}
      .adm-close{border:0;background:#f0f3f1;border-radius:9px;padding:8px 11px;cursor:pointer;font-weight:700}
      .adm-info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:18px}
      .adm-info{background:#f7f9f8;border-radius:12px;padding:12px}
      .adm-info small{display:block;color:#7b8781;margin-bottom:4px}
      .adm-content{background:#f7f9f8;border-radius:12px;padding:14px;white-space:pre-wrap;line-height:1.65}
      @media(max-width:900px){.adm-stats{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:640px){.adm-shell{padding:0 10px}.adm-hero{padding:20px;align-items:flex-start;flex-direction:column}.adm-hero h2{font-size:23px}.adm-stats{grid-template-columns:repeat(2,1fr)}.adm-toolbar{padding:12px}.adm-toolbar .adm-input,.adm-toolbar .adm-select{width:100%}.adm-info-grid{grid-template-columns:1fr}.adm-modal{padding:10px}}
    `;
    document.head.appendChild(style);
  }

  a.innerHTML = `
    <section class="adm-shell">
      <div class="adm-hero">
        <div>
          <small>DASHBOARD ADMIN • BPD DESA KENDALSERUT</small>
          <h2>${esc(p.nama_lengkap)}</h2>
          <p>${esc(p.jabatan || "Pengelola Aspirasi Masyarakat")}</p>
        </div>
        <div class="adm-hero-actions">
          <button id="refreshAdmin" class="adm-btn adm-btn-ghost" type="button">↻ Refresh</button>
        </div>
      </div>

      <div class="adm-stats">
        <div class="adm-stat total"><div class="adm-stat-label">TOTAL ASPIRASI</div><div class="adm-stat-value">${rows.length}</div></div>
        <div class="adm-stat accept"><div class="adm-stat-label">DITERIMA</div><div class="adm-stat-value">${count("Diterima")}</div></div>
        <div class="adm-stat process"><div class="adm-stat-label">DIPROSES</div><div class="adm-stat-value">${count("Diproses")}</div></div>
        <div class="adm-stat follow"><div class="adm-stat-label">DITINDAKLANJUTI</div><div class="adm-stat-value">${count("Ditindaklanjuti")}</div></div>
        <div class="adm-stat done"><div class="adm-stat-label">SELESAI</div><div class="adm-stat-value">${count("Selesai")}</div></div>
        <div class="adm-stat reject"><div class="adm-stat-label">DITOLAK</div><div class="adm-stat-value">${count("Ditolak")}</div></div>
      </div>

      <div class="adm-card">
        <div class="adm-toolbar">
          <div class="adm-search">
            <input id="adminSearch" class="adm-input" type="search" placeholder="🔎  Cari tiket, nama, wilayah, kategori...">
          </div>
          <div style="min-width:190px">
            <select id="adminStatusFilter" class="adm-select">
              <option value="">Semua status</option>
              <option>Diterima</option><option>Diproses</option>
              <option>Ditindaklanjuti</option><option>Selesai</option><option>Ditolak</option>
            </select>
          </div>
        </div>
        <div id="adminTableWrap"></div>
        <div id="adminFooter" class="adm-footer"></div>
      </div>
    </section>`;

  const tableWrap = $("#adminTableWrap");
  const footer = $("#adminFooter");

  const statusClass = s => ({
    "Diterima":"adm-status-d",
    "Diproses":"adm-status-p",
    "Ditindaklanjuti":"adm-status-t",
    "Selesai":"adm-status-s",
    "Ditolak":"adm-status-x"
  }[s] || "adm-status-d");

  function renderTable() {
    const q = ($("#adminSearch")?.value || "").trim().toLowerCase();
    const sf = $("#adminStatusFilter")?.value || "";

    const filtered = rows.filter(x => {
      const haystack = [x.nomor_tiket,x.nama,x.dusun,x.rt_rw,x.kategori,x.isi_aspirasi,x.status]
        .filter(Boolean).join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (!sf || x.status === sf);
    });

    tableWrap.innerHTML = filtered.length ? `
      <div class="adm-table-wrap">
        <table class="adm-table">
          <thead><tr>
            <th>Nomor Tiket</th><th>Pelapor</th><th>Wilayah</th>
            <th>Kategori</th><th>Status</th><th>Tanggapan</th><th>Aksi</th>
          </tr></thead>
          <tbody>
          ${filtered.map(x => `
            <tr>
              <td>
                <div class="adm-ticket">${esc(x.nomor_tiket)}</div>
                <div class="adm-date">${x.created_at ? esc(new Date(x.created_at).toLocaleString("id-ID")) : ""}</div>
              </td>
              <td>
                <div class="adm-person">${x.anonim ? "Anonim" : esc(x.nama || "Masyarakat")}</div>
                <div class="adm-muted">${esc(x.whatsapp || "")}</div>
              </td>
              <td>${esc([x.dusun,x.rt_rw].filter(Boolean).join(" / ") || "-")}</td>
              <td>${esc(x.kategori || "-")}</td>
              <td>
                <span class="adm-status ${statusClass(x.status)}">${esc(x.status || "-")}</span>
                <select class="adm-select st" data-id="${x.id}" style="margin-top:7px">
                  <option ${x.status==="Diterima"?"selected":""}>Diterima</option>
                  <option ${x.status==="Diproses"?"selected":""}>Diproses</option>
                  <option ${x.status==="Ditindaklanjuti"?"selected":""}>Ditindaklanjuti</option>
                  <option ${x.status==="Selesai"?"selected":""}>Selesai</option>
                  <option ${x.status==="Ditolak"?"selected":""}>Ditolak</option>
                </select>
              </td>
              <td><textarea class="adm-input adm-note tg" data-id="${x.id}" rows="3" placeholder="Tulis tanggapan BPD...">${esc(x.tanggapan || "")}</textarea></td>
              <td>
                <div class="adm-actions">
                  <button class="adm-action adm-detail detail" data-id="${x.id}" type="button">Detail</button>
                  <button class="adm-action adm-save save" data-id="${x.id}" type="button">Simpan</button>
                </div>
              </td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>` : `
      <div class="adm-empty">
        <div class="adm-icon">📭</div>
        <h3>Tidak ada aspirasi</h3>
        <p>Belum ada data yang sesuai dengan pencarian atau filter.</p>
      </div>`;

    footer.textContent = `Menampilkan ${filtered.length} dari ${rows.length} aspirasi`;

    document.querySelectorAll(".detail").forEach(b => {
      b.onclick = () => {
        const x = rows.find(row => row.id === b.dataset.id);
        if (x) showDetail(x);
      };
    });

    document.querySelectorAll(".save").forEach(b => {
      b.onclick = async () => {
        const id = b.dataset.id;
        const s = document.querySelector(`.st[data-id="${id}"]`)?.value;
        const t = document.querySelector(`.tg[data-id="${id}"]`)?.value || "";
        b.disabled = true; b.textContent = "Menyimpan...";

        const { error } = await supabase.from("aspirasi")
          .update({ status:s, tanggapan:t }).eq("id",id);

        b.disabled = false; b.textContent = "Simpan";

        if (error) { alert("Gagal menyimpan: " + error.message); return; }

        const item = rows.find(row => row.id === id);
        if (item) { item.status=s; item.tanggapan=t; }
        alert("✓ Perubahan berhasil disimpan.");
        admin();
      };
    });
  }

  function showDetail(x) {
    const modal = document.createElement("div");
    modal.className = "adm-modal";
    const wilayah = [x.dusun,x.rt_rw].filter(Boolean).join(" / ") || "-";
    const nama = x.anonim ? "Anonim" : (x.nama || "Masyarakat");

    modal.innerHTML = `
      <div class="adm-modal-box">
        <div class="adm-modal-head">
          <div>
            <small>DETAIL ASPIRASI</small>
            <h3 style="margin:4px 0 0">${esc(x.nomor_tiket)}</h3>
          </div>
          <button class="adm-close" type="button">✕ Tutup</button>
        </div>
        <div class="adm-modal-body">
          <div class="adm-info-grid">
            <div class="adm-info"><small>Nama</small><b>${esc(nama)}</b></div>
            <div class="adm-info"><small>WhatsApp</small><b>${esc(x.whatsapp || "-")}</b></div>
            <div class="adm-info"><small>Dusun / RT / RW</small><b>${esc(wilayah)}</b></div>
            <div class="adm-info"><small>Kategori</small><b>${esc(x.kategori || "-")}</b></div>
            <div class="adm-info"><small>Status</small><b><span class="adm-status ${statusClass(x.status)}">${esc(x.status || "-")}</span></b></div>
            <div class="adm-info"><small>Diajukan</small><b>${x.created_at ? esc(new Date(x.created_at).toLocaleString("id-ID")) : "-"}</b></div>
          </div>
          <p><b>Isi Aspirasi</b></p>
          <div class="adm-content">${esc(x.isi_aspirasi || "-")}</div>
          <p><b>Tanggapan BPD</b></p>
          <div class="adm-content">${esc(x.tanggapan || "Belum ada tanggapan.")}</div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    modal.querySelector(".adm-close").onclick = () => modal.remove();
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
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
