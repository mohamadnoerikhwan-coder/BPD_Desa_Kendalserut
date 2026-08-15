// ============================================================
// APP.JS - BPD DESA KENDALSERUT
// Supabase + Aspirasi + Tiket + Cek Status + Login Admin
// ============================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ============================================================
// 1. KONFIGURASI SUPABASE
// ============================================================

// GANTI DENGAN DATA PROJECT SUPABASE ANDA
const SUPABASE_URL = "MASUKKAN_SUPABASE_URL_ANDA";
const SUPABASE_ANON_KEY = "MASUKKAN_SUPABASE_ANON_KEY_ANDA";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ============================================================
// 2. AMBIL ELEMEN HTML
// ============================================================

const aspForm = document.getElementById("aspForm");
const aspMsg = document.getElementById("aspMsg");

const checkForm = document.getElementById("checkForm");
const checkResult = document.getElementById("checkResult");

const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

const adminDash = document.getElementById("adminDash");
const logoutBtn = document.getElementById("logoutBtn");

const newsList = document.getElementById("newsList");


// ============================================================
// 3. FUNGSI NOMOR TIKET
// Contoh: ASP-20260816-4827
// ============================================================

function generateTicket() {

  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `ASP-${year}${month}${day}-${random}`;
}


// ============================================================
// 4. ESCAPE HTML
// Supaya isi aspirasi tidak bisa menyisipkan HTML berbahaya
// ============================================================

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ============================================================
// 5. KIRIM ASPIRASI
// ============================================================

if (aspForm) {

  aspForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (aspMsg) {
      aspMsg.innerHTML = "⏳ Sedang mengirim aspirasi...";
    }

    const namaInput = document.getElementById("nama");
    const wilayahInput = document.getElementById("wilayah");
    const whatsappInput = document.getElementById("whatsapp");
    const kategoriInput = document.getElementById("kategori");
    const isiInput = document.getElementById("isi");
    const anonimInput = aspForm.querySelector('input[name="anonim"]');

    const nama = namaInput?.value.trim() || "";
    const wilayah = wilayahInput?.value.trim() || "";
    const whatsapp = whatsappInput?.value.trim() || "";
    const kategori = kategoriInput?.value || "";
    const isi = isiInput?.value.trim() || "";
    const anonim = anonimInput?.checked || false;


    // Validasi
    if (!kategori) {

      aspMsg.innerHTML =
        "⚠️ Silakan pilih kategori aspirasi.";

      return;
    }

    if (!isi) {

      aspMsg.innerHTML =
        "⚠️ Isi aspirasi belum diisi.";

      return;
    }


    // Pisahkan Dusun / Wilayah menjadi dusun dan RT/RW
    let dusun = wilayah;
    let rt_rw = "";

    const wilayahParts = wilayah.split(",");

    if (wilayahParts.length > 1) {

      dusun = wilayahParts[0].trim();

      rt_rw = wilayahParts
        .slice(1)
        .join(",")
        .trim();

    }


    // Buat nomor tiket
    const nomor_tiket = generateTicket();


    try {

      const { data, error } = await supabase
        .from("aspirasi")
        .insert([
          {
            nomor_tiket: nomor_tiket,
            nama: anonim ? "Anonim" : nama,
            dusun: dusun,
            rt_rw: rt_rw,
            whatsapp: anonim ? "" : whatsapp,
            kategori: kategori,
            isi_aspirasi: isi,
            anonim: anonim,
            status: "Menunggu",
            tanggapan: "",
          }
        ])
        .select()
        .single();


      if (error) {

        console.error("Supabase insert error:", error);

        aspMsg.innerHTML =
          "❌ Aspirasi gagal dikirim.<br><br>" +
          "<small>" +
          escapeHTML(error.message) +
          "</small>";

        return;
      }


      // ======================================================
      // BERHASIL
      // ======================================================

      aspMsg.innerHTML = `
        <div class="result ticket-result">

          <h3>✅ Aspirasi Berhasil Dikirim</h3>

          <p>
            Terima kasih. Aspirasi Anda telah diterima
            oleh BPD Desa Kendalserut.
          </p>

          <p>
            <strong>Nomor Tiket Anda:</strong>
          </p>

          <div
            style="
              font-size:22px;
              font-weight:800;
              letter-spacing:1px;
              padding:14px;
              margin:10px 0;
              background:#ffffff;
              border-radius:10px;
              text-align:center;
              border:1px dashed #245c45;
            "
          >
            ${escapeHTML(data.nomor_tiket)}
          </div>

          <p>
            ⚠️ Simpan nomor tiket tersebut untuk
            mengecek status aspirasi Anda.
          </p>

        </div>
      `;


      // Kosongkan form
      aspForm.reset();


      // Simpan tiket sementara di browser
      localStorage.setItem(
        "lastAspirasiTicket",
        data.nomor_tiket
      );


    } catch (error) {

      console.error(error);

      aspMsg.innerHTML =
        "❌ Terjadi kesalahan saat mengirim aspirasi.";

    }

  });

}


// ============================================================
// 6. CEK STATUS ASPIRASI
// ============================================================

if (checkForm) {

  checkForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const ticketInput =
      document.getElementById("ticket");

    const ticket =
      ticketInput?.value.trim().toUpperCase() || "";


    if (!ticket) {

      checkResult.innerHTML = `
        <div class="result">
          ⚠️ Silakan masukkan nomor tiket.
        </div>
      `;

      return;
    }


    checkResult.innerHTML =
      `<div class="result">⏳ Mencari data aspirasi...</div>`;


    try {

      const { data, error } = await supabase
        .from("aspirasi")
        .select(
          "nomor_tiket,kategori,isi_aspirasi,status,tanggapan,created_at,updated_at"
        )
        .eq("nomor_tiket", ticket)
        .maybeSingle();


      if (error) {

        console.error("Check ticket error:", error);

        checkResult.innerHTML = `
          <div class="result">
            ❌ Terjadi kesalahan saat mencari tiket.
            <br><br>
            <small>${escapeHTML(error.message)}</small>
          </div>
        `;

        return;
      }


      if (!data) {

        checkResult.innerHTML = `
          <div class="result">
            ❌ Nomor tiket tidak ditemukan.
            <br><br>
            Pastikan nomor tiket yang dimasukkan sudah benar.
          </div>
        `;

        return;
      }


      // ======================================================
      // TAMPILKAN HASIL
      // ======================================================

      const createdDate = data.created_at
        ? new Date(data.created_at).toLocaleString("id-ID")
        : "-";


      const tanggapan =
        data.tanggapan &&
        data.tanggapan.trim() !== ""
          ? escapeHTML(data.tanggapan)
          : "Belum ada tanggapan dari BPD.";


      checkResult.innerHTML = `
        <div class="result ticket-result">

          <h3>📋 Data Aspirasi</h3>

          <p>
            <strong>Nomor Tiket:</strong><br>
            ${escapeHTML(data.nomor_tiket)}
          </p>

          <p>
            <strong>Kategori:</strong><br>
            ${escapeHTML(data.kategori)}
          </p>

          <p>
            <strong>Isi Aspirasi:</strong><br>
            ${escapeHTML(data.isi_aspirasi)}
          </p>

          <p>
            <strong>Status:</strong><br>
            <span class="status">
              ${escapeHTML(data.status || "Menunggu")}
            </span>
          </p>

          <p>
            <strong>Tanggapan BPD:</strong><br>
            ${tanggapan}
          </p>

          <p>
            <strong>Tanggal Pengiriman:</strong><br>
            ${createdDate}
          </p>

        </div>
      `;


    } catch (error) {

      console.error(error);

      checkResult.innerHTML = `
        <div class="result">
          ❌ Terjadi kesalahan sistem.
        </div>
      `;

    }

  });

}


// ============================================================
// 7. LOGIN ADMIN
// ============================================================

if (loginForm) {

  loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
      document.getElementById("email")?.value.trim();

    const password =
      document.getElementById("password")?.value;


    if (loginMsg) {
      loginMsg.innerHTML = "⏳ Memeriksa akun...";
    }


    try {

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });


      if (error) {

        console.error("Login error:", error);

        loginMsg.innerHTML =
          "❌ Email atau password salah.";

        return;
      }


      loginMsg.innerHTML =
        "✅ Login berhasil.";


      await showAdminDashboard();


      // Scroll ke dashboard
      setTimeout(() => {

        adminDash?.scrollIntoView({
          behavior: "smooth"
        });

      }, 300);


    } catch (error) {

      console.error(error);

      loginMsg.innerHTML =
        "❌ Terjadi kesalahan saat login.";

    }

  });

}


// ============================================================
// 8. DASHBOARD ADMIN
// ============================================================

async function showAdminDashboard() {

  if (!adminDash) {
    return;
  }


  adminDash.classList.remove("hidden");


  adminDash.innerHTML = `
    <div
      class="section"
      style="
        background:#0b5d3b;
        color:white;
      "
    >

      <div class="container">

        <div class="admin-topbar">

          <div>

            <h2 style="margin:0;color:white;">
              Dashboard Admin BPD
            </h2>

            <div
              id="adminUser"
              class="admin-user"
              style="margin-top:5px;"
            >
              Memuat...
            </div>

          </div>

          <button
            id="dashboardLogout"
            class="logout-button"
            type="button"
          >
            🚪 Logout
          </button>

        </div>

      </div>

    </div>


    <section
      class="section"
      style="background:#f4f7f5;"
    >

      <div class="container">

        <div id="adminStats"></div>

        <div
          id="adminAspirasi"
          style="margin-top:25px;"
        >
          ⏳ Memuat data aspirasi...
        </div>

      </div>

    </section>
  `;


  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();


  const adminUser =
    document.getElementById("adminUser");


  if (adminUser) {

    adminUser.textContent =
      user?.email || "Administrator";

  }


  const dashboardLogout =
    document.getElementById("dashboardLogout");


  if (dashboardLogout) {

    dashboardLogout.addEventListener(
      "click",
      logoutAdmin
    );

  }


  if (logoutBtn) {
    logoutBtn.classList.remove("hidden");
  }


  await loadAdminAspirasi();

}


// ============================================================
// 9. LOAD ASPIRASI ADMIN
// ============================================================

async function loadAdminAspirasi() {

  const container =
    document.getElementById("adminAspirasi");

  const stats =
    document.getElementById("adminStats");


  if (!container) {
    return;
  }


  try {

    const { data, error } = await supabase
      .from("aspirasi")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if (error) {

      console.error(error);

      container.innerHTML = `
        <div class="result">
          ❌ Tidak dapat mengambil data aspirasi.
          <br><br>
          ${escapeHTML(error.message)}
        </div>
      `;

      return;
    }


    const aspirasi =
      data || [];


    // ========================================================
    // STATISTIK
    // ========================================================

    const total =
      aspirasi.length;

    const menunggu =
      aspirasi.filter(
        item =>
          item.status === "Menunggu"
      ).length;

    const diproses =
      aspirasi.filter(
        item =>
          item.status === "Diproses"
      ).length;

    const selesai =
      aspirasi.filter(
        item =>
          item.status === "Selesai"
      ).length;


    if (stats) {

      stats.innerHTML = `
        <div
          style="
            display:grid;
            grid-template-columns:repeat(4,1fr);
            gap:15px;
          "
        >

          <div class="result">
            <strong>Total Aspirasi</strong>
            <h2>${total}</h2>
          </div>

          <div class="result">
            <strong>Menunggu</strong>
            <h2>${menunggu}</h2>
          </div>

          <div class="result">
            <strong>Diproses</strong>
            <h2>${diproses}</h2>
          </div>

          <div class="result">
            <strong>Selesai</strong>
            <h2>${selesai}</h2>
          </div>

        </div>
      `;

    }


    if (aspirasi.length === 0) {

      container.innerHTML = `
        <div class="result">
          Belum ada aspirasi masuk.
        </div>
      `;

      return;
    }


    // ========================================================
    // TABEL ASPIRASI
    // ========================================================

    let html = `
      <div
        style="
          background:white;
          border-radius:15px;
          padding:20px;
          overflow-x:auto;
        "
      >

        <h3>
          📋 Daftar Aspirasi Masyarakat
        </h3>

        <table
          style="
            width:100%;
            border-collapse:collapse;
            min-width:1000px;
          "
        >

          <thead>

            <tr
              style="
                text-align:left;
                border-bottom:2px solid #dce5df;
              "
            >

              <th style="padding:12px;">
                Tiket
              </th>

              <th style="padding:12px;">
                Pengirim
              </th>

              <th style="padding:12px;">
                Wilayah
              </th>

              <th style="padding:12px;">
                Kategori
              </th>

              <th style="padding:12px;">
                Aspirasi
              </th>

              <th style="padding:12px;">
                Status
              </th>

              <th style="padding:12px;">
                Tanggapan
              </th>

              <th style="padding:12px;">
                Aksi
              </th>

            </tr>

          </thead>

          <tbody>
    `;


    aspirasi.forEach(item => {

      const status =
        item.status || "Menunggu";


      html += `
        <tr
          style="
            border-bottom:1px solid #e5ebe7;
            vertical-align:top;
          "
        >

          <td style="padding:12px;">
            <strong>
              ${escapeHTML(item.nomor_tiket)}
            </strong>
          </td>

          <td style="padding:12px;">
            ${escapeHTML(item.nama || "Anonim")}
            <br>
            <small>
              ${escapeHTML(item.whatsapp || "")}
            </small>
          </td>

          <td style="padding:12px;">
            ${escapeHTML(item.dusun || "")}
            <br>
            ${escapeHTML(item.rt_rw || "")}
          </td>

          <td style="padding:12px;">
            ${escapeHTML(item.kategori || "")}
          </td>

          <td
            style="
              padding:12px;
              max-width:300px;
            "
          >
            ${escapeHTML(item.isi_aspirasi || "")}
          </td>

          <td style="padding:12px;">

            <select
              class="status-select"
              data-id="${escapeHTML(item.id)}"
            >

              <option
                value="Menunggu"
                ${status === "Menunggu" ? "selected" : ""}
              >
                Menunggu
              </option>

              <option
                value="Diproses"
                ${status === "Diproses" ? "selected" : ""}
              >
                Diproses
              </option>

              <option
                value="Selesai"
                ${status === "Selesai" ? "selected" : ""}
              >
                Selesai
              </option>

              <option
                value="Ditolak"
                ${status === "Ditolak" ? "selected" : ""}
              >
                Ditolak
              </option>

            </select>

          </td>

          <td style="padding:12px;">

            <textarea
              class="tanggapan-input"
              data-id="${escapeHTML(item.id)}"
              rows="4"
              style="
                width:250px;
                padding:8px;
                border:1px solid #d7e0da;
                border-radius:8px;
              "
            >${escapeHTML(item.tanggapan || "")}</textarea>

          </td>

          <td style="padding:12px;">

            <button
              class="save-aspirasi-btn btn btn-primary"
              data-id="${escapeHTML(item.id)}"
              type="button"
            >
              💾 Simpan
            </button>

          </td>

        </tr>
      `;

    });


    html += `
          </tbody>

        </table>

      </div>
    `;


    container.innerHTML = html;


    // ========================================================
    // PASANG EVENT TOMBOL SIMPAN
    // ========================================================

    document
      .querySelectorAll(".save-aspirasi-btn")
      .forEach(button => {

        button.addEventListener(
          "click",
          async function () {

            const id =
              this.dataset.id;

            const statusSelect =
              document.querySelector(
                `.status-select[data-id="${id}"]`
              );

            const tanggapanInput =
              document.querySelector(
                `.tanggapan-input[data-id="${id}"]`
              );


            const status =
              statusSelect?.value || "Menunggu";

            const tanggapan =
              tanggapanInput?.value.trim() || "";


            this.disabled = true;

            this.textContent =
              "⏳ Menyimpan...";


            const {
              error
            } = await supabase
              .from("aspirasi")
              .update({
                status: status,
                tanggapan: tanggapan,
                updated_at: new Date().toISOString()
              })
              .eq("id", id);


            if (error) {

              console.error(error);

              alert(
                "Gagal menyimpan: " +
                error.message
              );

            } else {

              alert(
                "✅ Aspirasi berhasil diperbarui."
              );

            }


            this.disabled = false;

            this.textContent =
              "💾 Simpan";


            await loadAdminAspirasi();

          }

        );

      });


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <div class="result">
        ❌ Terjadi kesalahan saat mengambil data.
      </div>
    `;

  }

}


// ============================================================
// 10. LOGOUT ADMIN
// ============================================================

async function logoutAdmin() {

  await supabase.auth.signOut();


  if (adminDash) {

    adminDash.innerHTML = "";

    adminDash.classList.add("hidden");

  }


  if (logoutBtn) {

    logoutBtn.classList.add("hidden");

  }


  if (loginMsg) {

    loginMsg.innerHTML =
      "Anda telah logout.";

  }


  window.location.hash =
    "login-admin";

}


if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    logoutAdmin
  );

}


// ============================================================
// 11. CEK SESSION SAAT HALAMAN DIBUKA
// ============================================================

async function checkExistingSession() {

  try {

    const {
      data
    } = await supabase.auth.getSession();


    if (data?.session) {

      await showAdminDashboard();

    }

  } catch (error) {

    console.error(
      "Session error:",
      error
    );

  }

}


checkExistingSession();


// ============================================================
// 12. PERUBAHAN LOGIN / LOGOUT SUPABASE
// ============================================================

supabase.auth.onAuthStateChange(
  async (event, session) => {

    if (event === "SIGNED_IN" && session) {

      await showAdminDashboard();

    }


    if (event === "SIGNED_OUT") {

      if (adminDash) {

        adminDash.innerHTML = "";

        adminDash.classList.add("hidden");

      }

      if (logoutBtn) {

        logoutBtn.classList.add("hidden");

      }

    }

  }
);


// ============================================================
// 13. BERITA
// Untuk sementara menampilkan informasi statis.
// Nanti bisa kita buat tabel berita di Supabase.
// ============================================================

function loadNews() {

  if (!newsList) {
    return;
  }


  newsList.innerHTML = `
    <article>

      <h3>
        Selamat Datang di Website BPD Desa Kendalserut
      </h3>

      <p>
        Website ini menjadi media informasi,
        komunikasi, dan penyampaian aspirasi
        masyarakat Desa Kendalserut kepada BPD.
      </p>

    </article>

    <article>

      <h3>
        Layanan Aspirasi Masyarakat
      </h3>

      <p>
        Masyarakat dapat menyampaikan aspirasi,
        saran, dan masukan secara online melalui
        layanan aspirasi.
      </p>

    </article>

    <article>

      <h3>
        Transparansi Aspirasi
      </h3>

      <p>
        Setiap aspirasi yang masuk mendapatkan
        nomor tiket sehingga masyarakat dapat
        memantau perkembangannya.
      </p>

    </article>
  `;

}


loadNews();


// ============================================================
// 14. ISI OTOMATIS NOMOR TIKET TERAKHIR
// ============================================================

const lastTicket =
  localStorage.getItem(
    "lastAspirasiTicket"
  );


if (lastTicket) {

  const ticketInput =
    document.getElementById("ticket");


  if (ticketInput) {

    ticketInput.placeholder =
      `Tiket terakhir: ${lastTicket}`;

  }

}


// ============================================================
// SELESAI
// ============================================================

console.log(
  "BPD Desa Kendalserut app.js berhasil dimuat."
);
