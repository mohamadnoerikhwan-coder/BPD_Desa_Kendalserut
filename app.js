import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   KONFIGURASI SUPABASE
========================================================= */

const SUPABASE_URL = "https://scyhmxfksqlwjkqhlama.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_StNVl1zqzZE_bsetnfi8mA_jl9TBFyI";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   HELPER
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatTanggal(value) {

  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


/* =========================================================
   GENERATOR NOMOR TIKET
   FORMAT:
   ASP-20260816-1234
========================================================= */

function buatNomorTiket() {

  const sekarang = new Date();

  const tahun = sekarang.getFullYear();

  const bulan = String(
    sekarang.getMonth() + 1
  ).padStart(2, "0");

  const tanggal = String(
    sekarang.getDate()
  ).padStart(2, "0");

  const angka = Math.floor(
    1000 + Math.random() * 9000
  );

  return `ASP-${tahun}${bulan}${tanggal}-${angka}`;
}


/* =========================================================
   MEMBUAT NOMOR TIKET UNIK
========================================================= */

async function buatTiketUnik() {

  for (let i = 0; i < 20; i++) {

    const nomor = buatNomorTiket();

    const { data, error } = await supabase
      .from("aspirasi")
      .select("id")
      .eq("nomor_tiket", nomor)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return nomor;
    }
  }

  throw new Error(
    "Tidak dapat membuat nomor tiket unik."
  );
}


/* =========================================================
   FORM ASPIRASI
========================================================= */

const aspForm = $("aspForm");

if (aspForm) {

  aspForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      const message = $("aspMsg");

      if (message) {
        message.innerHTML =
          "⏳ Sedang mengirim aspirasi...";
      }

      const formData =
        new FormData(aspForm);

      const nama =
        String(
          formData.get("nama") || ""
        ).trim();

      const wilayah =
        String(
          formData.get("wilayah") || ""
        ).trim();

      const whatsapp =
        String(
          formData.get("whatsapp") || ""
        ).trim();

      const kategori =
        String(
          formData.get("kategori") || ""
        ).trim();

      const isi =
        String(
          formData.get("isi") || ""
        ).trim();

      const anonim =
        formData.get("anonim") !== null;


      /* ---------------------------------------------
         VALIDASI
      --------------------------------------------- */

      if (!kategori) {

        message.innerHTML =
          "⚠️ Silakan pilih kategori aspirasi.";

        return;
      }


      if (!isi) {

        message.innerHTML =
          "⚠️ Isi aspirasi wajib diisi.";

        return;
      }


      if (!anonim && !nama) {

        message.innerHTML =
          "⚠️ Silakan isi nama atau centang \"Kirim sebagai anonim\".";

        return;
      }


      try {

        /* -------------------------------------------
           BUAT NOMOR TIKET
        ------------------------------------------- */

        const nomorTiket =
          await buatTiketUnik();


        /* -------------------------------------------
           DATA YANG DISIMPAN
           
           Sesuai tabel:
           
           id
           nomor_tiket
           nama
           dusun
           rt_rw
           whatsapp
           kategori
           isi_aspirasi
           anonim
           status
           tanggapan
           created_at
           updated_at
        ------------------------------------------- */

        const dataAspirasi = {

          nomor_tiket: nomorTiket,

          nama: anonim
            ? "Anonim"
            : nama,

          dusun: wilayah,

          rt_rw: wilayah,

          whatsapp: anonim
            ? ""
            : whatsapp,

          kategori: kategori,

          isi_aspirasi: isi,

          anonim: anonim,

          status: "Menunggu",

          tanggapan: "",

          created_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString()
        };


        /* -------------------------------------------
           SIMPAN KE SUPABASE
        ------------------------------------------- */

        const {
          data,
          error
        } = await supabase
          .from("aspirasi")
          .insert(dataAspirasi)
          .select()
          .single();


        if (error) {
          throw error;
        }


        /* -------------------------------------------
           BERHASIL
        ------------------------------------------- */

        message.innerHTML = `

          <div
            class="result ticket-result"
            style="
              background:#eef8f1;
              border-left:5px solid #245c45;
              padding:20px;
              border-radius:12px;
            "
          >

            <h3>
              ✅ Aspirasi Berhasil Dikirim
            </h3>

            <p>
              Terima kasih telah menyampaikan
              aspirasi kepada BPD Desa Kendalserut.
            </p>

            <p>
              Nomor tiket aspirasi Anda:
            </p>

            <div
              style="
                font-size:26px;
                font-weight:800;
                letter-spacing:1px;
                padding:12px 0;
                color:#245c45;
              "
            >
              ${escapeHTML(
                data.nomor_tiket
              )}
            </div>

            <p>
              ⚠️
              <strong>
                Simpan nomor tiket ini.
              </strong>
              Nomor ini digunakan untuk mengecek
              status aspirasi Anda.
            </p>

          </div>

        `;


        /* -------------------------------------------
           RESET FORM
        ------------------------------------------- */

        aspForm.reset();


        /* -------------------------------------------
           ISI OTOMATIS FORM CEK
        ------------------------------------------- */

        const ticketInput =
          $("ticket");

        if (ticketInput) {
          ticketInput.value =
            data.nomor_tiket;
        }


      } catch (error) {

        console.error(
          "ERROR KIRIM ASPIRASI:",
          error
        );

        message.innerHTML = `

          <div
            class="result"
            style="
              background:#fff1f1;
              color:#9a3030;
              border-left:5px solid #c74b4b;
            "
          >

            ❌
            <strong>
              Aspirasi gagal dikirim.
            </strong>

            <p>
              Silakan coba beberapa saat lagi.
            </p>

          </div>

        `;
      }

    }
  );

}


/* =========================================================
   CEK STATUS ASPIRASI
========================================================= */

const checkForm =
  $("checkForm");


if (checkForm) {

  checkForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      const result =
        $("checkResult");

      const formData =
        new FormData(checkForm);

      const nomorTiket =
        String(
          formData.get("ticket") || ""
        ).trim();


      if (!nomorTiket) {

        result.innerHTML = `
          <div class="result">
            ⚠️ Silakan masukkan nomor tiket.
          </div>
        `;

        return;
      }


      result.innerHTML = `
        <div class="result">
          ⏳ Mencari data aspirasi...
        </div>
      `;


      try {

        const {
          data,
          error
        } = await supabase
          .from("aspirasi")
          .select(`
            nomor_tiket,
            nama,
            dusun,
            rt_rw,
            kategori,
            isi_aspirasi,
            anonim,
            status,
            tanggapan,
            created_at
          `)
          .eq(
            "nomor_tiket",
            nomorTiket
          )
          .maybeSingle();


        if (error) {
          throw error;
        }


        if (!data) {

          result.innerHTML = `

            <div
              class="result"
              style="
                background:#fff5f5;
                color:#963939;
              "
            >

              ❌
              <strong>
                Nomor tiket tidak ditemukan.
              </strong>

              <p>
                Periksa kembali nomor tiket
                yang Anda masukkan.
              </p>

            </div>

          `;

          return;
        }


        result.innerHTML = `

          <div
            class="result ticket-result"
          >

            <h3>
              🎫 Detail Aspirasi
            </h3>

            <p>
              <strong>
                Nomor Tiket
              </strong>
              <br>
              ${escapeHTML(
                data.nomor_tiket
              )}
            </p>

            <p>
              <strong>
                Nama
              </strong>
              <br>
              ${escapeHTML(
                data.anonim
                  ? "Anonim"
                  : data.nama
              )}
            </p>

            <p>
              <strong>
                Wilayah
              </strong>
              <br>
              ${escapeHTML(
                data.dusun || "-"
              )}
            </p>

            <p>
              <strong>
                Kategori
              </strong>
              <br>
              ${escapeHTML(
                data.kategori
              )}
            </p>

            <p>
              <strong>
                Tanggal Pengajuan
              </strong>
              <br>
              ${escapeHTML(
                formatTanggal(
                  data.created_at
                )
              )}
            </p>

            <p>
              <strong>
                Status
              </strong>
              <br>

              <span class="status">
                ${escapeHTML(
                  data.status ||
                  "Menunggu"
                )}
              </span>

            </p>

            <p>
              <strong>
                Isi Aspirasi
              </strong>
              <br>
              ${escapeHTML(
                data.isi_aspirasi
              )}
            </p>

            <p>
              <strong>
                Tanggapan BPD
              </strong>
              <br>

              ${
                data.tanggapan
                  ? escapeHTML(
                      data.tanggapan
                    )
                  : "Belum ada tanggapan dari BPD."
              }

            </p>

          </div>

        `;


      } catch (error) {

        console.error(
          "ERROR CEK ASPIRASI:",
          error
        );

        result.innerHTML = `

          <div class="result">

            ❌
            Terjadi kesalahan saat
            mengambil data aspirasi.

          </div>

        `;
      }

    }
  );

}


/* =========================================================
   LOGIN ADMIN
========================================================= */

const loginForm =
  $("loginForm");


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      const loginMsg =
        $("loginMsg");

      const email =
        $("email")?.value.trim() || "";

      const password =
        $("password")?.value || "";


      loginMsg.textContent =
        "⏳ Memeriksa akun...";


      try {

        const {
          data,
          error
        } = await supabase.auth
          .signInWithPassword({
            email,
            password
          });


        if (error) {
          throw error;
        }


        loginMsg.textContent =
          "✅ Login berhasil.";


        await tampilkanDashboard(
          data.user
        );


      } catch (error) {

        console.error(
          "ERROR LOGIN:",
          error
        );

        loginMsg.textContent =
          "❌ Email atau password salah.";

      }

    }
  );

}


/* =========================================================
   DASHBOARD ADMIN
========================================================= */

async function tampilkanDashboard(user) {

  const dashboard =
    $("adminDash");

  if (!dashboard) {
    return;
  }


  dashboard.classList.remove(
    "hidden"
  );


  const logoutBtn =
    $("logoutBtn");

  if (logoutBtn) {
    logoutBtn.classList.remove(
      "hidden"
    );
  }


  dashboard.innerHTML = `

    <section
      class="section"
      style="
        background:#245c45;
        color:white;
      "
    >

      <div class="container">

        <div
          class="admin-topbar"
        >

          <div>

            <span
              style="
                font-size:13px;
                opacity:.8;
              "
            >
              DASHBOARD ADMIN
            </span>

            <h2
              style="
                margin:5px 0;
                color:white;
              "
            >
              BPD Desa Kendalserut
            </h2>

          </div>


          <div
            class="admin-user"
          >

            👤
            ${escapeHTML(
              user?.email ||
              "Administrator"
            )}

          </div>

        </div>


        <div
          id="adminStats"
          style="
            display:grid;
            grid-template-columns:
              repeat(
                auto-fit,
                minmax(170px,1fr)
              );
            gap:15px;
          "
        >
        </div>

      </div>

    </section>


    <section
      class="section section-soft"
    >

      <div class="container">

        <div
          style="
            display:flex;
            justify-content:
              space-between;
            align-items:center;
            gap:15px;
            flex-wrap:wrap;
          "
        >

          <div>

            <span
              class="section-label"
            >
              DATA MASYARAKAT
            </span>

            <h2>
              Aspirasi Masyarakat
            </h2>

          </div>


          <button
            id="refreshAdminBtn"
            class="btn btn-primary"
            type="button"
          >
            🔄 Refresh Data
          </button>

        </div>


        <div
          id="adminAspirasiList"
          style="margin-top:25px"
        >
          ⏳ Memuat data...
        </div>

      </div>

    </section>

  `;


  $("refreshAdminBtn")
    ?.addEventListener(
      "click",
      muatDataAdmin
    );


  await muatDataAdmin();
}


/* =========================================================
   STATISTIK ADMIN
========================================================= */

function buatKartuStatistik(
  judul,
  angka
) {

  return `

    <div
      style="
        background:white;
        color:#245c45;
        padding:20px;
        border-radius:15px;
      "
    >

      <small>
        ${escapeHTML(judul)}
      </small>

      <div
        style="
          font-size:30px;
          font-weight:800;
          margin-top:5px;
        "
      >
        ${angka}
      </div>

    </div>

  `;
}


/* =========================================================
   LOAD DATA ADMIN
========================================================= */

async function muatDataAdmin() {

  const list =
    $("adminAspirasiList");

  const stats =
    $("adminStats");


  if (!list) {
    return;
  }


  list.innerHTML =
    "⏳ Memuat data aspirasi...";


  try {

    const {
      data,
      error
    } = await supabase
      .from("aspirasi")
      .select("*")
      .order(
        "created_at",
        {
          ascending:false
        }
      );


    if (error) {
      throw error;
    }


    const semua =
      data || [];


    const menunggu =
      semua.filter(
        x =>
          String(
            x.status || ""
          ).toLowerCase() ===
          "menunggu"
      ).length;


    const diproses =
      semua.filter(
        x =>
          String(
            x.status || ""
          ).toLowerCase() ===
          "diproses"
      ).length;


    const selesai =
      semua.filter(
        x =>
          String(
            x.status || ""
          ).toLowerCase() ===
          "selesai"
      ).length;


    if (stats) {

      stats.innerHTML =

        buatKartuStatistik(
          "Total Aspirasi",
          semua.length
        ) +

        buatKartuStatistik(
          "Menunggu",
          menunggu
        ) +

        buatKartuStatistik(
          "Diproses",
          diproses
        ) +

        buatKartuStatistik(
          "Selesai",
          selesai
        );
    }


    if (!semua.length) {

      list.innerHTML = `

        <div
          class="service-form"
        >

          <h3>
            Belum Ada Aspirasi
          </h3>

          <p>
            Belum ada aspirasi
            masyarakat yang masuk.
          </p>

        </div>

      `;

      return;
    }


    list.innerHTML =
      semua.map(
        buatTampilanAspirasiAdmin
      ).join("");


    /* ---------------------------------------------
       EVENT TOMBOL SIMPAN
    --------------------------------------------- */

    document
      .querySelectorAll(
        ".save-aspirasi"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            function () {

              simpanPerubahan(
                this.dataset.id
              );

            }
          );

        }
      );


    /* ---------------------------------------------
       EVENT TOMBOL HAPUS
    --------------------------------------------- */

    document
      .querySelectorAll(
        ".delete-aspirasi"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            function () {

              hapusAspirasi(
                this.dataset.id
              );

            }
          );

        }
      );


  } catch (error) {

    console.error(
      "ERROR LOAD ADMIN:",
      error
    );


    list.innerHTML = `

      <div
        class="service-form"
        style="
          color:#9a3030;
        "
      >

        ❌
        <strong>
          Data aspirasi gagal dimuat.
        </strong>

        <p>
          Pastikan pengaturan Supabase
          dan Row Level Security sudah benar.
        </p>

      </div>

    `;
  }
}


/* =========================================================
   TAMPILKAN ASPIRASI ADMIN
========================================================= */

function buatTampilanAspirasiAdmin(
  item
) {

  const status =
    item.status ||
    "Menunggu";


  const pilihanStatus =
    [
      "Menunggu",
      "Diproses",
      "Selesai",
      "Ditolak"
    ];


  const options =
    pilihanStatus
      .map(
        pilihan => `

          <option
            value="${escapeHTML(
              pilihan
            )}"
            ${
              status === pilihan
                ? "selected"
                : ""
            }
          >
            ${escapeHTML(
              pilihan
            )}
          </option>

        `
      )
      .join("");


  return `

    <article
      style="
        background:white;
        border:1px solid #dfe7e2;
        border-radius:16px;
        padding:20px;
        margin-bottom:18px;
        box-shadow:
          0 5px 18px
          rgba(0,0,0,.04);
      "
    >

      <div
        style="
          display:flex;
          justify-content:
            space-between;
          gap:15px;
          flex-wrap:wrap;
        "
      >

        <div>

          <strong>
            🎫
            ${escapeHTML(
              item.nomor_tiket
            )}
          </strong>

          <div
            style="
              color:#68756d;
              font-size:13px;
              margin-top:6px;
            "
          >
            ${escapeHTML(
              formatTanggal(
                item.created_at
              )
            )}
          </div>

        </div>


        <span
          class="status"
        >
          ${escapeHTML(status)}
        </span>

      </div>


      <hr
        style="
          border:0;
          border-top:
            1px solid #e5ebe7;
          margin:16px 0;
        "
      >


      <div
        style="
          display:grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(190px,1fr)
            );
          gap:14px;
        "
      >

        <div>

          <strong>
            Nama
          </strong>

          <br>

          ${escapeHTML(
            item.anonim
              ? "Anonim"
              : (
                  item.nama ||
                  "-"
                )
          )}

        </div>


        <div>

          <strong>
            Dusun
          </strong>

          <br>

          ${escapeHTML(
            item.dusun || "-"
          )}

        </div>


        <div>

          <strong>
            RT / RW
          </strong>

          <br>

          ${escapeHTML(
            item.rt_rw || "-"
          )}

        </div>


        <div>

          <strong>
            WhatsApp
          </strong>

          <br>

          ${escapeHTML(
            item.whatsapp || "-"
          )}

        </div>


        <div>

          <strong>
            Kategori
          </strong>

          <br>

          ${escapeHTML(
            item.kategori || "-"
          )}

        </div>

      </div>


      <div
        style="
          margin-top:18px;
          background:#f5f8f6;
          padding:15px;
          border-radius:12px;
        "
      >

        <strong>
          Isi Aspirasi
        </strong>

        <p>
          ${escapeHTML(
            item.isi_aspirasi ||
            "-"
          )}
        </p>

      </div>


      <div
        style="
          margin-top:15px;
        "
      >

        <label>

          <strong>
            Status
          </strong>

        </label>

        <br>

        <select
          class="admin-status"
          data-id="${escapeHTML(
            item.id
          )}"
          style="
            margin-top:7px;
            width:100%;
            max-width:350px;
            padding:11px;
            border:
              1px solid #d7e0da;
            border-radius:10px;
          "
        >

          ${options}

        </select>

      </div>


      <div
        style="
          margin-top:15px;
        "
      >

        <label>

          <strong>
            Tanggapan BPD
          </strong>

        </label>

        <br>

        <textarea
          class="admin-tanggapan"
          data-id="${escapeHTML(
            item.id
          )}"
          style="
            width:100%;
            box-sizing:border-box;
            min-height:100px;
            padding:12px;
            border:
              1px solid #d7e0da;
            border-radius:10px;
            margin-top:7px;
          "
        >${escapeHTML(
          item.tanggapan || ""
        )}</textarea>

      </div>


      <div
        style="
          margin-top:15px;
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        "
      >

        <button
          class="btn btn-primary save-aspirasi"
          data-id="${escapeHTML(
            item.id
          )}"
          type="button"
        >
          💾 Simpan Perubahan
        </button>


        <button
          class="btn btn-light delete-aspirasi"
          data-id="${escapeHTML(
            item.id
          )}"
          type="button"
        >
          🗑 Hapus
        </button>

      </div>

    </article>

  `;
}


/* =========================================================
   SIMPAN PERUBAHAN ASPIRASI
========================================================= */

async function simpanPerubahan(id) {

  const statusElement =
    document.querySelector(
      `.admin-status[data-id="${CSS.escape(
        String(id)
      )}"]`
    );


  const tanggapanElement =
    document.querySelector(
      `.admin-tanggapan[data-id="${CSS.escape(
        String(id)
      )}"]`
    );


  const status =
    statusElement?.value ||
    "Menunggu";


  const tanggapan =
    tanggapanElement?.value.trim() ||
    "";


  try {

    const {
      error
    } = await supabase
      .from("aspirasi")
      .update({

        status: status,

        tanggapan:
          tanggapan,

        updated_at:
          new Date().toISOString()

      })
      .eq(
        "id",
        id
      );


    if (error) {
      throw error;
    }


    alert(
      "✅ Perubahan berhasil disimpan."
    );


    await muatDataAdmin();


  } catch (error) {

    console.error(
      "ERROR UPDATE:",
      error
    );


    alert(
      "❌ Gagal menyimpan perubahan."
    );
  }
}


/* =========================================================
   HAPUS ASPIRASI
========================================================= */

async function hapusAspirasi(id) {

  const yakin =
    confirm(
      "Apakah Anda yakin ingin menghapus aspirasi ini?"
    );


  if (!yakin) {
    return;
  }


  try {

    const {
      error
    } = await supabase
      .from("aspirasi")
      .delete()
      .eq(
        "id",
        id
      );


    if (error) {
      throw error;
    }


    alert(
      "✅ Aspirasi berhasil dihapus."
    );


    await muatDataAdmin();


  } catch (error) {

    console.error(
      "ERROR DELETE:",
      error
    );


    alert(
      "❌ Gagal menghapus aspirasi."
    );
  }
}


/* =========================================================
   CEK SESSION LOGIN
========================================================= */

async function cekSession() {

  try {

    const {
      data,
      error
    } =
      await supabase.auth
        .getSession();


    if (error) {
      throw error;
    }


    if (
      data &&
      data.session &&
      data.session.user
    ) {

      await tampilkanDashboard(
        data.session.user
      );

    }

  } catch (error) {

    console.error(
      "ERROR SESSION:",
      error
    );

  }
}


cekSession();


/* =========================================================
   PERUBAHAN SESSION
========================================================= */

supabase.auth.onAuthStateChange(
  async (
    event,
    session
  ) => {

    if (
      event === "SIGNED_IN" &&
      session
    ) {

      await tampilkanDashboard(
        session.user
      );

    }


    if (
      event === "SIGNED_OUT"
    ) {

      const dashboard =
        $("adminDash");

      if (dashboard) {

        dashboard.classList.add(
          "hidden"
        );

        dashboard.innerHTML = "";

      }


      const logoutBtn =
        $("logoutBtn");

      if (logoutBtn) {

        logoutBtn.classList.add(
          "hidden"
        );

      }

    }

  }
);


/* =========================================================
   LOGOUT
========================================================= */

const logoutBtn =
  $("logoutBtn");


if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async function () {

      const yakin =
        confirm(
          "Apakah Anda yakin ingin logout?"
        );


      if (!yakin) {
        return;
      }


      const {
        error
      } =
        await supabase.auth
          .signOut();


      if (error) {

        console.error(
          "ERROR LOGOUT:",
          error
        );

        alert(
          "❌ Gagal logout."
        );

      }

    }
  );

}


/* =========================================================
   SELESAI
========================================================= */

console.log(
  "✅ app.js BPD Desa Kendalserut berhasil dimuat."
);
