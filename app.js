<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <meta
    name="description"
    content="Website resmi BPD Desa Kendalserut, Kecamatan Pangkah, Kabupaten Tegal. Wadah informasi dan aspirasi masyarakat."
  >

  <meta name="theme-color" content="#0b5d3b">

  <title>BPD Desa Kendalserut — Wadah Informasi dan Aspirasi Masyarakat</title>

  <link rel="stylesheet" href="./style.css">

  <style>
    /* =====================================================
       TAMBAHAN KOMPATIBILITAS FORM & LOGIN
    ====================================================== */

    .hidden {
      display: none !important;
    }

    .service-form {
      max-width: 850px;
      margin: 25px auto 0;
      background: #fff;
      padding: 28px;
      border-radius: 20px;
      border: 1px solid #e5ebe7;
      box-shadow: 0 8px 28px rgba(0,0,0,.05);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .form-group.full {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 700;
      font-size: 14px;
      color: #29483a;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d7e0da;
      border-radius: 10px;
      padding: 12px 13px;
      font-family: inherit;
      font-size: 14px;
      background: #fff;
    }

    .form-group textarea {
      min-height: 130px;
      resize: vertical;
    }

    .form-check {
      display: flex;
      gap: 9px;
      align-items: center;
      font-size: 13px;
      color: #58665e;
    }

    .form-check input {
      width: auto;
    }

    .form-message {
      margin-top: 16px;
      padding: 13px 15px;
      border-radius: 10px;
      background: #f3f7f4;
      color: #28563f;
      line-height: 1.6;
    }

    .login-section {
      background: #f4f7f5;
    }

    .login-card {
      max-width: 480px;
      margin: 25px auto 0;
      background: #fff;
      padding: 30px;
      border-radius: 20px;
      border: 1px solid #e1e8e3;
      box-shadow: 0 10px 30px rgba(0,0,0,.06);
    }

    .login-card h3 {
      margin-top: 0;
      margin-bottom: 7px;
    }

    .login-card p {
      color: #6c7871;
    }

    .login-message {
      margin-top: 14px;
      min-height: 20px;
      color: #9a4141;
      font-size: 14px;
    }

    .admin-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .admin-topbar .admin-user {
      color: #fff;
    }

    .logout-button {
      border: 0;
      background: #fff;
      color: #245c45;
      border-radius: 10px;
      padding: 10px 15px;
      font-weight: 700;
      cursor: pointer;
    }

    .news-section {
      background: #fff;
    }

    #newsList {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      margin-top: 25px;
    }

    #newsList article {
      background: #fff;
      border: 1px solid #e3e9e5;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 5px 18px rgba(0,0,0,.04);
    }

    #newsList h3 {
      margin-top: 0;
    }

    .result {
      margin-top: 18px;
      background: #f4f8f5;
      border-radius: 13px;
      padding: 18px;
      line-height: 1.7;
    }

    .ticket-result {
      border-left: 4px solid #245c45;
    }

    .status {
      display: inline-block;
      background: #eaf4ee;
      color: #245c45;
      padding: 4px 9px;
      border-radius: 999px;
      font-weight: 700;
    }

    @media (max-width: 760px) {

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-group.full {
        grid-column: auto;
      }

      #newsList {
        grid-template-columns: 1fr;
      }

      .service-form,
      .login-card {
        padding: 20px;
      }
    }
  </style>
</head>

<body>

  <!-- =====================================================
       TOP BAR
  ====================================================== -->

  <div class="topbar">

    <div class="container topbar-inner">

      <span>
        📍 Desa Kendalserut, Kec. Pangkah, Kab. Tegal, Jawa Tengah
      </span>

      <div class="top-contact">

        <span>
          ✉️ bpd.kendalserut@gmail.com
        </span>

        <span>
          ☎️ (0283) 1234567
        </span>

      </div>

    </div>

  </div>


  <!-- =====================================================
       HEADER
  ====================================================== -->

  <header class="site-header">

    <div class="container header-inner">

      <a
        class="brand"
        href="#beranda"
        aria-label="BPD Desa Kendalserut"
      >

        <img
          src="./logo-bpd-kendalserut.jpg"
          alt="Logo BPD Desa Kendalserut"
          loading="eager"
        >

        <div>

          <div class="brand-title">
            BPD DESA KENDALSERUT
          </div>

          <div class="brand-subtitle">
            Badan Permusyawaratan Desa
          </div>

        </div>

      </a>


      <button
        class="menu-toggle"
        id="navBtn"
        type="button"
        aria-label="Buka menu"
      >
        ☰
      </button>


      <nav
        class="main-nav"
        id="nav"
        aria-label="Navigasi utama"
      >

        <a class="active" href="#beranda">
          Beranda
        </a>

        <a href="#profil">
          Profil BPD
        </a>

        <a href="#struktur">
          Struktur BPD
        </a>

        <a href="#aspirasi">
          Aspirasi
        </a>

        <a href="#cek">
          Cek Aspirasi
        </a>

        <a href="#kontak">
          Kontak
        </a>

        <a class="admin-btn" href="#login-admin">
          ♟ Login Admin
        </a>

      </nav>

    </div>

  </header>


  <main id="beranda">


    <!-- =====================================================
         HERO
    ====================================================== -->

    <section
      class="hero"
      style="
        background-image: url('./background-header.jpg');
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
      "
    >

      <div class="hero-overlay"></div>

      <div class="container hero-content">

        <span class="eyebrow">
          BADAN PERMUSYAWARATAN DESA
        </span>

        <h1>
          BPD DESA<br>
          KENDALSERUT
        </h1>

        <p class="hero-lead">
          Wadah Informasi dan Aspirasi Masyarakat
        </p>

        <div class="gold-line"></div>

        <p class="hero-copy">
          Mari sampaikan aspirasi, saran, dan masukan
          <br class="desktop-only">
          untuk kemajuan Desa Kendalserut.
        </p>

        <div class="hero-actions">

          <a
            class="btn btn-primary"
            href="#aspirasi"
          >
            📣 Sampaikan Aspirasi
          </a>

          <a
            class="btn btn-light"
            href="#cek"
          >
            🎫 Cek Aspirasi
          </a>

        </div>

      </div>

    </section>


    <!-- =====================================================
         QUICK MENU
    ====================================================== -->

    <section class="quick-section">

      <div class="container quick-grid">

        <a class="info-card" href="#aspirasi">

          <span class="icon-circle">
            📣
          </span>

          <div>

            <h3>
              Sampaikan Aspirasi
            </h3>

            <p>
              Sampaikan aspirasi, saran, dan masukan Anda
              untuk kemajuan desa.
            </p>

          </div>

          <span class="arrow">
            →
          </span>

        </a>


        <a class="info-card" href="#cek">

          <span class="icon-circle">
            🔎
          </span>

          <div>

            <h3>
              Lacak Aspirasi
            </h3>

            <p>
              Pantau status aspirasi Anda secara mudah
              dan transparan.
            </p>

          </div>

          <span class="arrow">
            →
          </span>

        </a>


        <a class="info-card" href="#profil">

          <span class="icon-circle">
            🏛
          </span>

          <div>

            <h3>
              Informasi BPD
            </h3>

            <p>
              Dapatkan informasi seputar kegiatan dan
              program BPD Desa Kendalserut.
            </p>

          </div>

          <span class="arrow">
            →
          </span>

        </a>


        <div class="village-card">

          <h3>
            Tentang Desa Kendalserut
          </h3>

          <div class="village-line"></div>

          <p>📍 Desa Kendalserut</p>
          <p>⌖ Kecamatan Pangkah</p>
          <p>◉ Kabupaten Tegal</p>
          <p>★ Jawa Tengah</p>

        </div>

      </div>

    </section>


    <!-- =====================================================
         PROFIL
    ====================================================== -->

    <section
      id="profil"
      class="section"
    >

      <div class="container split">

        <div>

          <span class="section-label">
            PROFIL
          </span>

          <h2>
            Sekilas Tentang BPD
          </h2>

          <div class="small-gold-line"></div>

          <p>
            Badan Permusyawaratan Desa (BPD) merupakan lembaga
            yang melaksanakan fungsi pemerintahan yang anggotanya
            merupakan wakil dari penduduk desa berdasarkan
            keterwakilan wilayah dan ditetapkan secara demokratis.
          </p>

          <p>
            BPD berperan menampung dan menyalurkan aspirasi
            masyarakat serta menjalankan fungsi pengawasan demi
            terwujudnya tata kelola pemerintahan desa yang baik.
          </p>

        </div>


        <div class="quote-card">

          <span class="quote-mark">
            “
          </span>

          <p>
            Bersama BPD, membangun desa dengan aspirasi,
            partisipasi, dan gotong royong.
          </p>

        </div>

      </div>

    </section>


    <!-- =====================================================
         STRUKTUR
    ====================================================== -->

    <section
      id="struktur"
      class="section section-soft"
    >

      <div class="container">

        <span class="section-label">
          KELEMBAGAAN
        </span>

        <h2>
          Struktur BPD Desa Kendalserut
        </h2>

        <div class="small-gold-line"></div>

        <div class="structure-grid">

          <div class="member">
            <strong>Siti Muslicha, Amd</strong>
            <span>Ketua</span>
          </div>

          <div class="member">
            <strong>Akhmad Suswanto, S.Pd.SD</strong>
            <span>Wakil Ketua</span>
          </div>

          <div class="member">
            <strong>Sunjoyo, SM</strong>
            <span>Sekretaris</span>
          </div>

          <div class="member">
            <strong>Farkhatun</strong>
            <span>
              Ketua Bidang Pemerintahan dan Pembinaan Masyarakat
            </span>
          </div>

          <div class="member">
            <strong>Yasin Nurjati Kusumo</strong>
            <span>
              Anggota Bidang Pemerintahan dan Pembinaan Masyarakat
            </span>
          </div>

          <div class="member">
            <strong>Mohamad Nur Ikhwan</strong>
            <span>
              Ketua Bidang Pembangunan dan Pemberdayaan Masyarakat
            </span>
          </div>

          <div class="member">
            <strong>Udi Pamungkas</strong>
            <span>
              Anggota Bidang Pembangunan dan Pemberdayaan Masyarakat
            </span>
          </div>

        </div>

      </div>

    </section>


    <!-- =====================================================
         ASPIRASI
    ====================================================== -->

    <section
      id="aspirasi"
      class="section"
    >

      <div class="container">

        <div class="action-panel">

          <div>

            <span class="section-label">
              LAYANAN MASYARAKAT
            </span>

            <h2>
              Sampaikan Aspirasi Anda
            </h2>

            <p>
              Gunakan layanan aspirasi untuk menyampaikan
              saran, masukan, atau kebutuhan masyarakat
              kepada BPD Desa Kendalserut.
            </p>

          </div>

        </div>


        <!-- FORM ASPIRASI -->

        <form
          id="aspForm"
          class="service-form"
        >

          <div class="form-grid">

            <div class="form-group">

              <label for="nama">
                Nama
              </label>

              <input
                id="nama"
                name="nama"
                type="text"
                placeholder="Nama Anda"
              >

            </div>


            <div class="form-group">

              <label for="wilayah">
                Dusun / Wilayah
              </label>

              <input
                id="wilayah"
                name="wilayah"
                type="text"
                placeholder="Contoh: RT 02 / RW 05"
              >

            </div>


            <div class="form-group">

              <label for="whatsapp">
                Nomor WhatsApp
              </label>

              <input
                id="whatsapp"
                name="whatsapp"
                type="text"
                placeholder="08xxxxxxxxxx"
              >

            </div>


            <div class="form-group">

              <label for="kategori">
                Kategori Aspirasi
              </label>

              <select
                id="kategori"
                name="kategori"
                required
              >

                <option value="">
                  Pilih kategori
                </option>

                <option value="Pemerintahan">
                  Pemerintahan
                </option>

                <option value="Pembangunan">
                  Pembangunan
                </option>

                <option value="Pemberdayaan Masyarakat">
                  Pemberdayaan Masyarakat
                </option>

                <option value="Infrastruktur">
                  Infrastruktur
                </option>

                <option value="Sosial">
                  Sosial
                </option>

                <option value="Kesehatan">
                  Kesehatan
                </option>

                <option value="Pendidikan">
                  Pendidikan
                </option>

                <option value="Lainnya">
                  Lainnya
                </option>

              </select>

            </div>


            <div class="form-group full">

              <label for="isi">
                Isi Aspirasi
              </label>

              <textarea
                id="isi"
                name="isi"
                required
                placeholder="Tuliskan aspirasi, saran, atau masukan Anda..."
              ></textarea>

            </div>


            <div class="form-group full">

              <label class="form-check">

                <input
                  type="checkbox"
                  name="anonim"
                >

                Kirim sebagai anonim

              </label>

            </div>


            <div class="form-group full">

              <button
                class="btn btn-primary"
                type="submit"
              >
                📣 Kirim Aspirasi
              </button>

            </div>

          </div>


          <div
            id="aspMsg"
            class="form-message"
            aria-live="polite"
          ></div>

        </form>

      </div>

    </section>


    <!-- =====================================================
         CEK ASPIRASI
    ====================================================== -->

    <section
      id="cek"
      class="section section-soft"
    >

      <div class="container">

        <div class="action-panel">

          <div>

            <span class="section-label">
              PELACAKAN
            </span>

            <h2>
              Cek Status Aspirasi
            </h2>

            <p>
              Masukkan nomor tiket aspirasi untuk melihat
              status dan tanggapan dari BPD.
            </p>

          </div>

        </div>


        <form
          id="checkForm"
          class="service-form"
        >

          <div class="form-group">

            <label for="ticket">
              Nomor Tiket Aspirasi
            </label>

            <input
              id="ticket"
              name="ticket"
              type="text"
              required
              placeholder="Contoh: ASP-20260814-7220"
            >

          </div>

          <br>

          <button
            class="btn btn-primary"
            type="submit"
          >
            🔎 Cek Status
          </button>


          <div
            id="checkResult"
            aria-live="polite"
          ></div>

        </form>

      </div>

    </section>


    <!-- =====================================================
         BERITA / INFORMASI
    ====================================================== -->

    <section class="section news-section">

      <div class="container">

        <span class="section-label">
          INFORMASI TERKINI
        </span>

        <h2>
          Berita BPD Desa Kendalserut
        </h2>

        <div class="small-gold-line"></div>

        <div id="newsList">

          <article>
            <h3>
              Informasi sedang disiapkan
            </h3>

            <p>
              Berita dan informasi BPD Desa Kendalserut
              akan tampil di sini.
            </p>
          </article>

        </div>

      </div>

    </section>


    <!-- =====================================================
         KONTAK
    ====================================================== -->

    <section
      id="kontak"
      class="contact-section"
    >

      <div class="container contact-grid">

        <div>

          <span class="section-label light-label">
            KONTAK
          </span>

          <h2>
            Hubungi BPD Desa Kendalserut
          </h2>

          <p>
            Untuk informasi dan komunikasi kelembagaan BPD,
            silakan gunakan kanal kontak yang tersedia.
          </p>

        </div>


        <div class="contact-box">

          <p>
            ✉️
            <strong>
              bpd.kendalserut@gmail.com
            </strong>
          </p>

          <p>
            ☎️
            <strong>
              (0283) 1234567
            </strong>
          </p>

          <p>
            📍 Desa Kendalserut,
            Kecamatan Pangkah,
            Kabupaten Tegal
          </p>

        </div>

      </div>

    </section>


    <!-- =====================================================
         LOGIN ADMIN
    ====================================================== -->

    <section
      id="login-admin"
      class="section login-section"
    >

      <div class="container">

        <span class="section-label">
          ADMINISTRATOR
        </span>

        <h2>
          Login Admin BPD
        </h2>

        <div class="small-gold-line"></div>


        <form
          id="loginForm"
          class="login-card"
        >

          <h3>
            Masuk ke Dashboard Admin
          </h3>

          <p>
            Gunakan akun administrator BPD yang telah
            terdaftar.
          </p>


          <div class="form-group">

            <label for="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autocomplete="username"
              required
              placeholder="Email admin"
            >

          </div>

          <br>


          <div class="form-group">

            <label for="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="Password"
            >

          </div>

          <br>


          <button
            class="btn btn-primary"
            type="submit"
          >
            🔐 Masuk ke Dashboard
          </button>


          <div
            id="loginMsg"
            class="login-message"
            aria-live="polite"
          ></div>

        </form>

      </div>

    </section>


    <!-- =====================================================
         ADMIN DASHBOARD
         
         app.js akan mengisi bagian ini setelah login berhasil.
    ====================================================== -->

    <section
      id="adminDash"
      class="hidden"
    ></section>


    <!-- Tombol logout.
         Awalnya tersembunyi dan akan ditampilkan oleh app.js
         setelah admin berhasil login. -->

    <div
      class="container"
      style="padding:20px 0;text-align:right;"
    >

      <button
        id="logoutBtn"
        class="logout-button hidden"
        type="button"
      >
        🚪 Logout Admin
      </button>

    </div>


  </main>


  <!-- =====================================================
       FOOTER
  ====================================================== -->

  <footer>

    <div class="container footer-inner">

      <span>
        © 2026 BPD Desa Kendalserut. All rights reserved.
      </span>

      <span>
        ♥ Bersama Membangun Desa yang Maju dan Sejahtera
      </span>

    </div>

  </footer>


  <!-- =====================================================
       MENU MOBILE
  ====================================================== -->

  <script>

    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-nav");

    if (toggle && nav) {

      toggle.addEventListener("click", () => {

        nav.classList.toggle("open");

      });

    }


    document.querySelectorAll(".main-nav a").forEach((link) => {

      link.addEventListener("click", () => {

        if (nav) {
          nav.classList.remove("open");
        }

      });

    });

  </script>


  <!-- =====================================================
       APP.JS
       
       JANGAN DIHAPUS.
       File ini menangani:
       - Supabase
       - Kirim aspirasi
       - Nomor tiket
       - Cek aspirasi
       - Login admin
       - Dashboard admin
       - Logout
       - Berita
  ====================================================== -->

  <script
    type="module"
    src="./app.js"
  ></script>


</body>
</html>
