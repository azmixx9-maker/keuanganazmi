# Catatan Serah Terima: OPA HR Admin Corp Tools v87 (sebelumnya OPA HR Suite 4in1)

Dokumen ini untuk AI/developer yang melanjutkan. Pemilik **tidak paham coding**: jelaskan langkah klik demi klik, satu tahap per satu, dan selalu serahkan hasil berupa berkas siap unggah.

## 0. Prompt siap tempel (salin ke AI pengembang)
```
Anda senior front-end engineer. Lanjutkan proyek "OPA HR Admin Corp Tools v87".
Baca dulu docs/00_CATATAN_SERAH_TERIMA.md di repo (saya lampirkan repo ZIP-nya).
Aturan: UI berbahasa Indonesia; pemilik tidak paham coding, jadi jelaskan langkah klik demi klik;
ubah seperlunya saja (jangan refactor besar); jaga data lama tetap aman; hasilkan berkas siap unggah
(index.html baru + src/ yang sinkron via `python3 build.py`) dan tulis ringkasan perubahan.
Tugas saya sekarang: <tulis permintaan di sini>
```

## 0b. Penamaan
Nama produk kini **OPA HR Admin Corp Tools**. Nama internal lama TETAP dipertahankan dan jangan diganti: kunci penyimpanan `opa-hr-suite-*`, penanda cadangan `app:'opa-hr-suite'` (dicek saat Pulihkan), `meta app-version`, dan `VER`. Mengubahnya membuat cadangan lama tidak bisa dipulihkan. Hanya teks yang tampil ke pengguna (judul tab, nama di sidebar, layar kunci, pesan) yang diganti. Ini project Supabase/GitHub/Vercel **baru**; sambungan ke project lama sengaja dihapus.

## 1. Gambaran
Aplikasi HR internal untuk satu pengguna utama (pemilik) dan beberapa admin. Satu berkas `index.html` (±2 MB) berisi:
- **Kerangka (shell)**: menu samping, kunci PIN, dashboard suite, Tanya AI, Daily Activity, Slip Gaji, login Supabase, sinkronisasi cloud.
- **4 modul** dimuat sebagai `<iframe srcdoc>` dari string JSON di `<script type="application/json" id="d0..d3">`:
  `d0` Kontrak & Rekrutmen (ContractDesk v8), `d1` Absensi (No Clock & Terlambat), `d2` Dokumen (DMS: Surat Keluar/Masuk, Memo, Arsip, Master Data), `d3` PPh 21 Therapist (BP21/Coretax).
- Menu utama ada 6 modul logis: Kontrak, Rekrutmen, Absensi, Dokumen, PPh 21 Therapist, Slip Gaji (+ Pengaturan, Lainnya).

## 2. Struktur repo
```
index.html                 HASIL BUILD, yang dipublikasikan Vercel (jangan diedit tangan)
config.js                  alamat Supabase (window.OPA_CONFIG); sengaja KOSONG di repo, pemilik wajib mengisi (tanpa isi, login menampilkan pesan "Alamat Supabase belum diisi")
vercel.json  .gitignore  build.py
supabase/supabase-setup.sql   skema, RLS, bucket "arsip", realtime, RPC opa_orphan_objects
src/modul/*.html           sumber 4 modul (HTML utuh, mengandung base64 logo/formulir)
src/shell/index.template.html   kerangka dengan penanda {{MODUL:nama}} dan {{INC:id}}
src/shell/*.js             skrip kerangka: v38js ux43js ux44js ux46js slipgaji opa-cloud ui75js
docs/00_CATATAN_SERAH_TERIMA.md
```
**Alur kerja**: edit berkas di `src/` → `python3 build.py` → hasilnya `index.html` → unggah ke GitHub → Vercel auto-deploy.
`build.py` sudah diuji menghasilkan `index.html` identik byte-per-byte dari hasil pecahan. Modul disisipkan sebagai string JSON (`<` ditulis `\u003c`).
Kerangka menyisipkan ke tiap modul: `OPA_BRIDGE_HTML` (hook unggah hasil generate + IndexedDB), gaya `HIDE*`, `XI`, `UIX(i)` (lihat `load(i)` di kerangka). Sebagian perilaku modul dipatch dari kerangka lewat `ev(i, ...)`/`parent.eval`; cari dulu sebelum mengganti nama fungsi.

## 3. Cloud (Supabase)
- Project baru region Singapore (nama: OPA HR Admin Corp Tools). Klien: `@supabase/supabase-js@2.43.4` dari jsDelivr. Login email+password (pendaftaran bebas HARUS dimatikan).
- Tabel: `profiles(id,email,nama,role,aktif)`, `app_data(key,value jsonb,version,updated_at,updated_by)`, `app_files(file_key,store,original_name,mime_type,size_bytes,storage_path,kind,source,deleted_at,...)`.
- RLS: hanya akun `profiles.aktif = true` boleh baca/tulis (fungsi `opa_is_active()`). Bucket privat `arsip` dengan kebijakan serupa.
- Trigger `opa_touch`: menaikkan `version` tiap update (dipakai untuk optimistic concurrency) dan mengisi `updated_by`.
- Sinkronisasi (`src/shell/opa-cloud.js`):
  - Data `localStorage` ↔ `app_data` untuk kunci di `SYNC_KEYS` (opa_contractdesk_v2, ohm-v16-karyawan, ohm-v16-kasus, opa-hr-suite-v1-late-cases, opa_db, opa_md, opa-pic-map, opa-pdf-seq2, opa-daily, opa-slip-gaji, opa-pic-letters, opa-arch-queue, opa-daily-jam, opa-suite-wa, opa-suite-watpl).
  - Data PPh 21 (IndexedDB `localforage/keyvaluepairs`) ↔ `app_data` dengan prefiks `pph/`.
  - Lampiran (IndexedDB `opa_cd_files`, `opa_hr_dms`) ↔ Storage `arsip/files/<db>/<kunci>` + baris `app_files`; hapus = soft delete (`deleted_at`), ada panel "Berkas Online" dengan sampah/pulihkan.
  - Hasil generate (PDF/XML/XLSX/DOCX/CSV/ZIP/HTML, termasuk snapshot cetak-saja) otomatis ke `arsip/generated/<tahun>/<bulan>/` (slip gaji ke `generated/slip-gaji/`).
  - Konflik dua admin: gabung 3 arah (`merge3`, dasar/lokal/cloud) per record; penghitung nomor (`nst|seq|seqs|used|rcUsed`) memakai nilai terbesar. Salinan `backup/` di Storage otomatis, retensi 10 salinan / 60 hari.
  - Realtime channel `opa_cloud_v74` pada `app_data` dan `app_files`.
  - Batas berkas 48 MB. `window.OPACloud` mengekspos `uploadGenerated, openFiles, flush, syncNow, supa, SYNC_KEYS, pruneBackups, findOrphans`.

## 4. Perubahan terakhir (v76): penomoran Surat Keluar
Berkas: `src/modul/dokumen.html`.
- `serCore/serInfo/nextNo`: nomor berikutnya = **nomor tertinggi di seri (kode jenis + tahun) + 1**, dihitung dari `DB.out` + arsip manual (`DB.man`) + nomor awal `DB.nst["tahun|KODE"]`. Dulu mengisi celah terendah; sekarang menyambung dari data yang ada. Surat dengan `manualNo` hanya dihitung bila kodenya sama dengan seri.
- Form surat: kotak nomor punya 2 mode, **Otomatis (default)** dan **Isi manual** (`FS.nmode`, `FS.cno`, `setNmode`, `numUi`, `nmSaveStart`). Mode otomatis menampilkan nomor yang dipakai + "Atur nomor awal (sekali saja)". Mode manual menolak nomor ganda (`svOut`) dan memberi petunjuk dampak ke urutan otomatis.
- Dialog "Nomor Awal" menampilkan tercatat tertinggi dan nomor berikutnya; form Arsip Surat Lama punya petunjuk langsung (`manHint`).
- Belum diubah: Memo HR (`nextMemoNo`) dan Surat Masuk (`nextIncomingNo`) masih mengisi celah dan tanpa nomor awal.

## 4b. Perubahan terakhir (v78): Menu Utama lebih hidup
Berkas: `src/shell/index.template.html` (blok `<style id="hm78">` di akhir) dan `src/shell/ui78js.js` (baru, disisipkan lewat `{{INC:ui78js}}`).
- Latar gradasi bergerak halus + titik-titik (tanpa elemen tambahan, supaya halaman tidak jadi bisa di-scroll).
- Kartu header kaca; tanggal + jam; pil status "N hal perlu perhatian" / "Semua aman" (klik = kartu bermasalah berkedip).
- Kartu modul: sorotan cahaya mengikuti kursor, panah muncul saat hover, tata letak 3 x 2 (sebelumnya 3+2+1).
- Dock bawah berbentuk kapsul kaca, ikon membesar saat disentuh kursor.
- Pintasan keyboard 1-6 membuka modul sesuai angka di kartu (tidak aktif saat mengetik, layar terkunci, atau ada dialog).
- Tidak mengubah logika data. Menu Utama tetap muat satu layar di laptop 14 inci (diuji 1366x768, 1440x900, 1920x1080) dan mode gelap.

## 4c. Perubahan terakhir (v79): Dashboard Suite lebih hidup
Berkas: `src/shell/index.template.html` (blok `<style id="ds79">`) dan `src/shell/ui79js.js` (baru, `{{INC:ui79js}}`).
- Kartu KPI atas (`.kt`) dan kartu ringkasan (`.sc`) berwarna dengan garis aksen, naik saat hover, angka menghitung naik.
- Banner sapaan bergradasi lembut, kartu daftar dengan hover, avatar bergradasi, latar titik-titik.
- Catatan: blok `opaui` (v-sebelumnya) memaksa `.kt` jadi netral dengan `!important`; v79 menimpanya dengan selektor `html body #dsi .kp .kt`. Logika data tidak diubah.

## 4d. Perubahan terakhir (v80): sidebar + transisi halaman
Berkas: `src/shell/index.template.html` (blok `<style id="sb80">`). Hanya CSS, tanpa JS baru.
- Sidebar: tint warna mengikuti modul aktif (`--ac`), judul grup huruf kapital kecil, item menu bergeser saat hover, item aktif masuk dengan animasi, tombol ikon modul membesar saat hover, bilah atas buram kaca.
- Transisi: iframe modul, Dashboard Suite, dan Menu Utama muncul dengan fade + geser 8px (`pg80`) saat dibuka. Mati otomatis bila pengguna memilih "kurangi gerakan".
- Sidebar ciut (`body.sbc`) tidak ikut bergeser saat hover.

## 4e. Perubahan terakhir (v81): isi modul Kontrak, Rekrutmen, Absensi, Dokumen, Slip Gaji
Berkas: `src/shell/index.template.html`. Hanya CSS, tanpa mengubah logika data.
- `UI81(i)` (di dekat `UIP`): gaya tambahan yang disuntikkan ke iframe modul 0, 1, 2 lewat `load(i)`. Modul 3 (PPh 21) sengaja tidak disentuh. Dibungkus `@media screen` supaya cetakan/PDF tidak berubah. Memakai variabel `--sx-c` (warna aksen modul) dan `--u-*`.
- Isi: tombol (hover naik, klik menekan, tombol utama bercahaya), kolom isian (cincin fokus berwarna), kartu (`.card`, `.kcard` naik + garis aksen), kartu angka (`.kp>div`, `.st>div`), tabel `.tw` (judul kolom huruf kapital kecil, baris menyala saat hover), baris daftar `.row` + avatar `.av`, tombol segmen `.seg`, dialog `.md` muncul dengan animasi. Modul 0 punya aturan baris tersendiri agar tidak menyentuh tepi.
- Slip Gaji: blok `<style id="m81">` (selektor `.sl ...`): judul, kotak, tab, area seret Excel, kartu angka, tabel, daftar karyawan, pilihan model.
- Jangan menambah animasi masuk pada `#view` modul: modul merender ulang `#view` tiap interaksi, animasi akan berulang dan berkedip.
- Belum diuji dengan data asli: daftar/tabel diuji dengan isi contoh yang disuntikkan, bukan data kontrak/surat sungguhan.

## 4f. Perubahan terakhir (v82): login, layar kunci, Daily Activity, Tanya AI, panel
Berkas: `src/shell/index.template.html` (blok `<style id="u82">`, sebelum `ui75js`). Hanya CSS, tanpa mengubah logika data.
- Login: panel kiri dengan cahaya bergerak + titik-titik, kartu form melayang, tombol gradasi.
- Layar kunci PIN: latar gradasi, kartu kaca, tombol penuh lebar.
- Daily Activity dan Tanya AI (`.dy`): judul gradasi, kartu membulat dengan bayangan, masuk bertahap, contoh pertanyaan jadi pil, status kosong bergaris putus, tabel jawaban lebih rapi.
- Palet cari (Ctrl+K) dan panel Berkas Online: latar buram, sudut lebih bulat, baris menyala saat hover.
- Scrollbar tipis dan warna seleksi mengikuti aksen. Mati otomatis bila pengguna memilih "kurangi gerakan". Mode gelap sudah dicek.
- PPh 21 kini ikut diseragamkan lewat `UI82P` (di atas `load(i)`, hanya untuk modul 3): tombol `.p/.b/.s`, fokus isian, kartu/KPI/outlet, hero bergradasi, baris tabel, langkah panduan, dialog, dan tombol mengambang memakai bahasa desain yang sama dengan v81. Dibungkus `@media screen` supaya cetakan/PDF tidak berubah. Logika PPh tidak diubah.
- Diuji secara visual dengan data kosong (tanpa Supabase); tabel/dialog PPh dengan data asli belum dilihat langsung.

## 4g. Perubahan terakhir (v82): penyederhanaan logika (hati-hati, struktur data tidak berubah)
- `src/modul/dokumen.html`: `nextMemoNo` dan `nextIncomingNo` kini memakai **nomor tertinggi + 1** (sama dengan Surat Keluar), tidak lagi mengisi celah terendah. Nomor yang pernah dihapus tidak dipakai ulang.
- `src/modul/absensi.html`:
  - Form catat No Clock dan keterlambatan harian punya tombol **Simpan & tambah lagi** (tanggal/shift/jenis terbawa; `NCP`, `LDP`).
  - Kasus No Clock yang sama (karyawan + tanggal + shift + jenis) ditolak dengan pesan, supaya tidak ganda.
  - Memilih hasil akhir otomatis menyelesaikan status: No Clock Disetujui/Ditolak, atau Keterlambatan Ditindaklanjuti. Bisa diurungkan.
- Diuji dengan skrip di browser (data contoh). Belum diuji terhadap Supabase/data asli.
- Item "Tugas lanjutan" nomor 4 (penomoran Memo/Surat Masuk) sudah selesai.

## 4h. Perbaikan (v82): pembacaan angka Slip Gaji
- `src/shell/slipgaji.js`, `slNum`: angka format Indonesia yang tersimpan sebagai **teks** di Excel (mis. `1.500.000`, `Rp 2.350.000`) sebelumnya terbaca 1,5 / 2,35. Kini titik pemisah ribuan dikenali (pola `1.234`, `1.234.567`). Angka berformat desimal (`12.5`, `1.234,5`) tetap seperti semula. Sudah diuji 15 kasus di Node.
- Terbilang (`slWords`) diuji 18 angka: benar. Modul PPh `num()` sudah benar sejak awal.
- Alur Kontrak (isian awal dari kontrak terakhir, perpanjangan massal, deteksi tumpang tindih, nomor tertinggi+1) dan logika tarif PPh 21 harian ditinjau dan sengaja tidak diubah. Tabel TER bulanan belum diverifikasi ke PMK 168/2023.

## 4i. Fitur baru (v83): Catatan, Pengingat, dan popup saat aplikasi dibuka
Berkas: `src/shell/nt83js.js` (baru, `{{INC:nt83js}}`), blok `<style id="nt83">` dan halaman `<div class="dy" id="ntv">` di `index.template.html`, `SYNC_KEYS` di `opa-cloud.js`.
- Halaman **Catatan & Pengingat** (`show(-6)`, menu samping grup Laporan, tombol di dock Menu Utama). Dua tab:
  - **Catatan**: judul + isi, kategori (Pekerjaan, Catatan, Penting, Lainnya), sematkan, cari, filter kategori, salin, hapus dengan tombol Urungkan. Disimpan di `localStorage` kunci `opa-notes` (array objek `{id,t,b,cat,pin,c,u}`).
  - **Pengingat**: teks + catatan tambahan + tanggal + jam (opsional) + berulang (harian/mingguan/bulanan/tahunan). Kunci `opa-reminders` (`{id,t,n,d,tm,rep,dom,done,dts,last,c}`). Menandai selesai pada pengingat berulang memajukan `d` ke kejadian berikutnya; yang tidak berulang menjadi `done`. Tombol "Besok" menunda satu hari.
- **Popup** (`rmPopup`): muncul sekali setiap aplikasi dibuka, setelah login/PIN selesai dan modul siap (`boot()` memantau `ready` dan layar `.lk`). Berisi pengingat terlewat/hari ini/3 hari ke depan + daftar "Perlu dicek di aplikasi" (`auto()`, dihitung dari `data()` dan `pphStat()`: kontrak berakhir, menunggu TTD, No Clock, keterlambatan, surat, NIK/BP21 PPh 21, kandidat, cadangan > 7 hari). Tidak muncul bila kosong. Lonceng di bilah atas (`#rmb`) membuka popup kapan saja dan menampilkan jumlahnya.
- Pengaturan per perangkat (tidak disinkron): `opa-rm-on` ('0' = matikan popup), `opa-rm-auto` ('0' = tanpa info otomatis), `opa-rm-skip` (tanggal; "Jangan tampilkan lagi hari ini").
- `opa-notes` dan `opa-reminders` masuk `SYNC_KEYS` (sinkron Supabase, gabung 3 arah per `id`) dan `XKEYS` (cadangan/pulihkan JSON). Tidak ada perubahan SQL Supabase (memakai tabel `app_data`).
- Pintasan angka 1-6 Menu Utama otomatis nonaktif saat popup terbuka (popup memakai `role="dialog"`).
- Diuji di browser dengan data contoh (terang/gelap, popup, tambah/ubah/cari/hapus, pengulangan, Esc, Ctrl+Enter). Belum diuji terhadap Supabase asli.
- PPh 21: gaya sudah diseragamkan di v82 (`UI82P`); v83 memeriksa ulang tampilannya dan tidak mengubahnya.

## 4j. Perubahan terakhir (v84): sidebar penuh untuk menu, cadangan/pulihkan disembunyikan
Berkas: `src/shell/index.template.html` (blok `<style id="sb84">` + `<script id="sb84js">` di akhir), `src/shell/opa-cloud.js` (`ensureUserBar`), `src/shell/ux46js.js` (`draw`).
- Dasar sidebar kini satu baris: avatar + status sinkron (satu baris kecil) | tombol **⋯** | tombol Kunci. Semua tombol lain ada di menu pop-up **⋯** (`#dm`): Profil saya, Cadangkan semua data (`#bkp`), Pulihkan dari file (`#rst`), lalu grup Online (Berkas, Simpan, Tarik) dan Keluar (dipindah ke dasar menu).
- Titik penanda cadangan lama (`#bkd`) kini kecil, kuning, tidak berdenyut; teks "N hari tanpa cadangan" tampil di dalam menu (`#bkh`). Pil melayang `#bkb` memang sudah disembunyikan CSS sejak sebelumnya.
- Pil simpan di bilah atas (`#svb`): saat belum diatur (state `off`) tampil sebagai ikon abu-abu kecil (kelas `q`); kuning/merah hanya saat Menyimpan/perlu izin/gagal. Isi dan fungsi tidak berubah.
- **Pulihkan** kini otomatis mengunduh salinan data saat ini lebih dulu (`backupAll(1)`, nama berkas `...cadangan-sebelum-pulihkan-TANGGAL.json`, tidak mengubah penanda "terakhir dicadangkan"), selain salinan di localStorage yang sudah ada.
- ID elemen lama tetap dipakai (`bkp`, `rst`, `prf`, `lkn`, `bkd`, `supaFilesBtn`, `supaPushBtn`, `supaPullBtn`, `supaLogoutBtn`, `supaSyncStatus`), jadi logika lain tidak berubah. `#prf` kini ada di template, tidak lagi disuntik lewat JS.
- Tidak ada perubahan SQL Supabase. Diuji di Chromium headless (data kosong, tanpa Supabase asli): menu buka/tutup (klik luar, Esc), unduh cadangan biasa dan sebelum-pulihkan, tanpa galat JS. Tampilan setelah login Supabase asli disimulasikan, belum dilihat langsung.
- Kartu "Pengelolaan data" di Dashboard Suite dan kartu peringatan cadangan (>7 hari) sengaja tidak diubah.

## 4k. Perbaikan (v85): cadangan memuat berkas Kontrak; Pulihkan tidak lagi menghapus berkas
Berkas: `src/shell/index.template.html` (`idbRestore`, `cdOpen/cdDump/cdRestore`, `backupAll`, handler `#rst`), `src/shell/ux46js.js` (`build`), `src/shell/opa-cloud.js` (teks galat).
- **Celah lama**: cadangan JSON hanya memuat IndexedDB `opa_hr_dms` (lampiran Dokumen). Berkas modul Kontrak & Rekrutmen (`opa_cd_files`: scan kontrak, CV, formulir; nilainya berupa string data-URL atau objek, bukan Blob) tidak pernah ikut dicadangkan atau dipulihkan.
- Kini cadangan berformat v2 punya bidang baru **`cd`** (entri `[kunci, jenis, isi]`; jenis `s` = string, `j` = JSON, `b:<mime>` = Blob base64). Bidang `idb` (DMS) tidak berubah, jadi cadangan lama tetap bisa dipulihkan.
- **Bug yang diperbaiki**: `idbRestore` selalu mengosongkan IndexedDB sebelum mengisi. Memulihkan cadangan yang `idb`-nya kosong (mis. cadangan 2026-11-20) menghapus semua lampiran Dokumen di perangkat. Kini pemulihan berkas hanya berjalan bila cadangan memuat berkas; bila kosong, berkas lokal dibiarkan.
- Cadangan otomatis ke folder (`ux46js.js` `build`) ikut memuat `cd`.
- Teks galat Storage yang menyebut `supabase-tambahan.sql` diganti `supabase-setup.sql`.
- Diuji di Chromium headless: cadangan, hapus lokal, pulihkan, lalu isi kembali (string, objek, Blob); pemulihan cadangan tanpa berkas tidak menghapus apa pun. Belum diuji dengan berkas besar atau Supabase asli (berkas hasil pulihkan baru terunggah ke cloud lewat sinkron berkas yang sudah ada).
- `config.js` pada ZIP ini sudah berisi Project URL dan publishable key milik pemilik (aman publik). Jangan menimpanya dengan versi kosong saat mengunggah pembaruan.
- Dari daftar "Tugas lanjutan" nomor 2 sebagian teratasi: berkas kontrak lama di versi lokal kini bisa ikut cadangan bila cadangan dibuat dari v85 atau lebih baru dengan data lama terbuka.

## 4l. Perubahan terakhir (v86): kartu cadangan di Dashboard + koreksi catatan nomor awal
Berkas: `src/shell/index.template.html` (kartu `warn` di Dashboard Suite).
- Kartu peringatan cadangan (muncul bila belum pernah atau >= 7 hari) diubah dari kartu kuning besar menjadi satu baris abu-abu kecil dengan tombol "Cadangkan". Teks lama "Data tersimpan di browser ini saja dan bisa hilang" dihapus karena sudah tidak benar sejak data tersinkron ke Supabase. Kartu "Pengelolaan data" tidak diubah. Popup pengingat saat aplikasi dibuka (v83) masih memuat satu baris "Data belum pernah dicadangkan" (itu bagian fitur Pengingat, sengaja dibiarkan).
- **Koreksi "Tugas lanjutan" nomor 5** (nomor awal ke angka lebih kecil tertimpa penggabungan): `merge3` di `opa-cloud.js` adalah penggabungan 3 arah. Bila hanya satu perangkat yang mengubah nomor awal, nilai dari perangkat itu menang (`mEq(b,r)` mengembalikan nilai lokal), termasuk bila diturunkan. Aturan "nilai terbesar" (`M_COUNTER`) hanya berlaku bila DUA perangkat mengubah penghitung yang sama sebelum sempat sinkron. Dengan satu pengguna utama, ini praktis tidak terjadi. Tidak ada perubahan kode. Catatan: menurunkan nomor awal di bawah nomor surat tertinggi yang sudah ada memang tidak berpengaruh, karena penomoran selalu "tertinggi + 1".

## 4m. Fitur baru (v87): Uji koneksi cloud
Berkas: `src/shell/opa-cloud.js` (`selfTest(client, me)`, tombol `#supaTestBtn` di menu ⋯, diekspos sebagai `OPACloud.selfTest`), panduan pemilik di `docs/PANDUAN_UJI_SUPABASE.md`.
- Dialog yang menjalankan 9 pemeriksaan berurutan dan menampilkan hasil per baris (✓ ! ✕ i) dengan saran perbaikan berbahasa Indonesia: login+profil aktif; baca `app_data`; tulis + nomor versi naik otomatis (trigger `opa_touch`); baca `app_files`; unggah/unduh/hapus di bucket `arsip` (`uji/tes-*.txt`); RPC `opa_orphan_objects`; Realtime (subscribe lalu upsert kunci `__uji_realtime` dan menunggu event 9 dtk); perbandingan kunci `SYNC_KEYS` lokal vs cloud; pengingat cek manual "Allow new users to sign up".
- Baris uji sementara memakai kunci `__uji_koneksi` dan `__uji_realtime` di `app_data` dan dihapus di blok `finally`. Kunci itu tidak ada di `SYNC_KEYS`, jadi tidak diterapkan ke data aplikasi oleh realtime utama. Tombol "Salin hasil" menghasilkan teks tanpa URL/kunci Supabase.
- **Diuji hanya dengan klien Supabase tiruan di memori** (skenario semua baik dan skenario tabel/bucket/RPC/trigger hilang); `selfTest(client, me)` menerima klien dan sesi sebagai argumen supaya bisa diuji tanpa jaringan. **Belum dijalankan terhadap Supabase asli**: perilaku nyata Realtime, pesan galat asli, dan RLS masih perlu dikonfirmasi oleh pemilik lewat panduan. Bila ada hasil ✕/! dari Supabase asli, perbaiki sumbernya (SQL/pengaturan) dan, bila perlu, sesuaikan teks `hint()`.

## 5. Aturan produk dari pemilik (jangan dilanggar)
- UI bahasa Indonesia. Pengguna utama: laptop 14 inci (prioritas), kadang monitor 27 inci. Menu Utama harus muat tanpa scroll.
- Aplikasi internal untuk dirinya sendiri: alur sesederhana dan sesingkat mungkin.
- DMS: tanpa persetujuan atasan; pemilik mencentang "Selesai" sendiri. Kop surat merah-emas, penuh lebar.
- Kontrak punya Arsip Kontrak sendiri (tidak digabung ke Arsip Dokumen). Database therapist (PPh 21) terpisah dari Data Karyawan, tanpa sinkron. Master Therapist menandai outlet/CV tempat BP21 dilaporkan (peringatan saja, tidak memblokir).
- Slip Gaji: NIK dan nomor rekening **tidak disamarkan**; multi-bulan dalam **satu PDF** (tanpa ZIP).
- Sidebar bisa diciutkan; banner cadangan tidak boleh menutupi isi. Tombol Cadangkan/Pulihkan dan akun tidak boleh menonjol: simpan di menu ⋯ dasar sidebar supaya sidebar penuh untuk menu modul.
- Bila kuota harian habis: hasilkan dulu yang bisa, lalu tulis catatan lanjutan.

## 6. Keamanan: catatan jujur
- PIN kunci (kerangka dan DMS, bawaan DMS `2468`) hanya pengaman layar di sisi klien, bukan pengaman data. Pengaman utama = login Supabase + RLS. Pertimbangkan mengganti PIN bawaan dan menghapusnya dari `opa_md`.
- Kunci yang tertanam di `config.js` adalah *publishable key* (aman publik). Jangan pernah menaruh secret/service_role di repo.
- Data pribadi karyawan hanya di Supabase. Jangan commit cadangan JSON (`.gitignore` menolak `*.json` hanya untuk Git CLI, bukan unggah via web GitHub).
- Belum ada CSP di `vercel.json` (aplikasi memakai skrip inline + CDN jsDelivr/cdnjs/Google Fonts). Menambah CSP butuh uji menyeluruh.
- Muat dari CDN tanpa SRI: pertimbangkan menyalin library (supabase-js, pdf-lib, dll.) ke repo.

## 7. Tugas lanjutan / belum terverifikasi
1. **Verifikasi terhadap Supabase asli** (alat bantu: ⋯ → Uji koneksi, panduan `docs/PANDUAN_UJI_SUPABASE.md`; hasil belum pernah dijalankan di Supabase asli) (login, push/pull, realtime, upload Storage, RPC yatim, retensi backup). Di sesi ini hanya struktur dan sintaks yang diperiksa; aplikasi belum dijalankan terhadap Supabase.
2. **Migrasi lampiran lokal**: cadangan JSON 2026-11-20 memuat 0 berkas lampiran (`idb` kosong) dan cadangan suite hanya mendump satu IndexedDB. Bila ada lampiran hanya di versi lokal lama, buat alat unggah massal/pemulihan lampiran ke Storage.
3. Uji otomatis (harness) untuk merge3, penomoran, dan sinkron belum disertakan di repo ini.
4. (selesai di v82) penomoran Memo HR dan Surat Masuk.
5. Koreksi nomor awal ke angka lebih kecil bisa tertimpa penggabungan "nilai terbesar" antar perangkat; bila perlu tambahkan cara resmi mereset penghitung.
6. Pesan galat lama menyebut `supabase-tambahan.sql`; isinya kini ada di `supabase-setup.sql` (ubah teks pesannya bila ingin).
7. Hindari satu berkas 2 MB: pertimbangkan memecah menjadi beberapa halaman/berkas statis dengan tetap satu kerangka.

## 8. Cara menguji cepat setelah perubahan
1. `python3 build.py` lalu buka `index.html` di Chrome/Edge (atau situs Vercel preview).
2. Login → pastikan 4 modul termuat, status sinkron tidak merah.
3. Buat satu Surat Keluar (Otomatis) dan satu manual; periksa nomor berikutnya menyambung.
4. Buat cadangan JSON dan pulihkan di profil browser bersih untuk memastikan data utuh.
