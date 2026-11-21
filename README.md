# OPA HR Admin Corp Tools (versi online)

Aplikasi HR internal (sebelumnya bernama OPA HR Suite 4in1): Kontrak & Rekrutmen, Absensi (No Clock/Terlambat), Dokumen (Surat Keluar, Surat Masuk, Memo, Arsip), PPh 21 Therapist, Slip Gaji.
Data dan berkas disimpan di **Supabase**, kodenya di **GitHub**, situsnya tayang lewat **Vercel**.

Panduan ini ditulis untuk yang tidak paham coding. Ikuti urutan A sampai G. Total sekitar 30–45 menit.
Nama menu di Supabase/GitHub/Vercel kadang sedikit berubah; cari yang paling mirip.

---

## Isi folder ini

| Berkas / folder | Fungsinya |
|---|---|
| `index.html` | Aplikasi utuh. Inilah yang dibuka orang saat mengakses situs. |
| `config.js` | Alamat Supabase Anda (2 baris). **Wajib diisi.** |
| `vercel.json` | Pengaturan situs untuk Vercel. Tidak perlu disentuh. |
| `supabase/supabase-setup.sql` | Perintah sekali jalan untuk menyiapkan database dan folder cloud. |
| `src/modul/` | Kode terpisah per modul (kontrak, absensi, dokumen, pph21). Untuk pengembangan lanjutan. |
| `src/shell/` | Kode kerangka utama, termasuk sinkronisasi cloud (`opa-cloud.js`). |
| `build.py` | Alat penggabung `src/` menjadi `index.html` (dipakai AI/developer, bukan Anda). |
| `docs/00_CATATAN_SERAH_TERIMA.md` | Catatan lengkap + prompt siap tempel untuk AI yang melanjutkan. |
| `docs/PANDUAN_UJI_SUPABASE.md` | Cara menguji bahwa Supabase benar-benar bekerja (mulai dari tombol ⋯ → Uji koneksi). |

> **Penting: file cadangan data (`OPA-HR-Suite-cadangan-...json`) JANGAN diunggah ke GitHub.**
> Isinya data karyawan (nomor HP, NIK, rekening, dll.). Data itu masuk ke Supabase lewat tombol *Pulihkan* di dalam aplikasi (langkah E). Berkas `.gitignore` hanya melindungi bila memakai Git di komputer; unggah lewat web GitHub tidak memeriksanya, jadi pastikan sendiri tidak ada file `.json` cadangan di folder yang Anda seret.

---

## A. Siapkan 3 akun gratis
1. GitHub: https://github.com (daftar, verifikasi email).
2. Supabase: https://supabase.com (boleh "Sign in with GitHub").
3. Vercel: https://vercel.com (pilih "Continue with GitHub").

## B. Supabase (database + folder cloud)

> Ini **project baru**. Jangan memakai kembali project, repository, atau alamat Vercel yang lama supaya data tidak tercampur.

1. **Buat project**: *New project* → nama `OPA HR Admin Corp Tools` → isi *Database password* (catat di tempat aman) → *Region*: **Southeast Asia (Singapore)** → *Create*. Tunggu 1–2 menit.
2. **Jalankan setup database**: menu **SQL Editor** → *New query* → buka file `supabase/supabase-setup.sql` dengan Notepad → salin semua isinya → tempel → klik **Run**. Harus muncul "Success".
3. **Cek hasilnya**: menu **Table Editor** harus menampilkan tabel `app_data`, `app_files`, `profiles`. Menu **Storage** harus menampilkan folder (bucket) `arsip`.
4. **Buat akun login**: menu **Authentication → Users → Add user → Create new user** → isi email dan password → **centang "Auto Confirm User"** → *Create*. Ulangi untuk tiap orang yang boleh memakai aplikasi. Akun pertama otomatis menjadi admin.
5. **Matikan pendaftaran bebas** (wajib, supaya orang asing tidak bisa daftar): **Authentication → Sign In / Providers** (atau *Settings*) → matikan **Allow new users to sign up** → Save.
6. **Salin alamat project**: **Project Settings → API** (atau *API Keys*). Catat dua hal: **Project URL** dan **Publishable key** (diawali `sb_publishable_`). Jangan pakai *secret* / *service_role*.
7. Dua nilai ini **wajib** dimasukkan ke `config.js` di langkah C3. Isi bawaannya sengaja kosong supaya aplikasi tidak tersambung ke project lama.

## C. GitHub (tempat menyimpan kode)
1. Ekstrak (Extract All) file ZIP ini. Buka foldernya.
2. Di GitHub klik **+ → New repository** → nama `opa-hr-admin-corp-tools` → pilih **Private** → *Create repository*.
3. **Wajib:** buka `config.js` dengan Notepad, tempel Project URL dan Publishable key dari langkah B6 di antara tanda kutip `' '`, lalu simpan (Ctrl+S).
4. Di halaman repository klik **uploading an existing file**. Buka folder hasil ekstrak, **pilih semua isinya** (index.html, config.js, vercel.json, build.py, README.md, folder `src`, `supabase`, `docs`, dan `.gitignore` bila tampak), lalu seret ke halaman GitHub. Tunggu semua terunggah (folder ikut terbawa) → **Commit changes**.
5. Cek: di halaman repository harus terlihat `index.html`, `config.js`, folder `src`, `supabase`, `docs`.

## D. Vercel (menayangkan situs)
1. Di Vercel klik **Add New… → Project**.
2. Pilih repository `opa-hr-admin-corp-tools` → **Import**. (Kalau tidak muncul: *Adjust GitHub App Permissions* lalu beri akses ke repo itu.)
3. Pengaturan biarkan bawaan: **Framework Preset: Other**, Build Command kosong, Output Directory kosong. Tidak perlu *Environment Variables*.
4. Klik **Deploy**. Setelah selesai Anda mendapat alamat seperti `opa-hr-admin-corp-tools.vercel.app`. Itulah alamat aplikasi online Anda.

## E. Masukkan data Anda ke cloud
1. Buka alamat Vercel Anda → login dengan email dan password dari B4.
2. **Cek dulu apakah data sudah ada di cloud**: kalau versi lama Anda dulu sudah login ke Supabase yang sama, data mungkin sudah ada di sana dan langsung turun otomatis. Kalau kontrak dan karyawan sudah tampil, lewati langkah 3.
3. Kalau kosong: klik tombol **⋯** (tiga titik) di kiri bawah sidebar → **Pulihkan dari file…** → pilih file `OPA-HR-Suite-cadangan-2026-11-20.json` → konfirmasi. Aplikasi memuat ulang, lalu otomatis mengunggah data ke Supabase (muncul notifikasi ☁ tersimpan online).
4. Di Supabase **Table Editor → app_data** harus terisi sekitar 10 baris (kontrak, karyawan, surat/dokumen, slip gaji, dll.).
5. **Lampiran** (scan surat, CV, PDF): file cadangan di atas **tidak memuat berkas lampiran** (bagian `idb` kosong). Berkas yang Anda unggah dari sekarang tersimpan di folder cloud `arsip`. Kalau di versi lokal lama ada lampiran penting yang belum pernah terunggah, beri tahu AI pengembang (lihat catatan serah terima, bagian "Tugas lanjutan") untuk dibuatkan alat pindahan lampiran.

## E2. Uji koneksi (disarankan)
Klik **⋯ → Uji koneksi** di kiri bawah sidebar. Semua baris sebaiknya ✓. Panduan lengkap: `docs/PANDUAN_UJI_SUPABASE.md`.

## F. Cek berkas di folder cloud
- Dalam aplikasi: menu **Berkas Online** (Riwayat File) menampilkan hasil generate dan lampiran.
- Di Supabase: **Storage → arsip**: `files/` (lampiran arsip), `generated/` (PDF/Excel/XML hasil generate, termasuk `slip-gaji/`), `backup/` (salinan otomatis sebelum menimpa data).

## G. Cara memperbarui aplikasi ke depan
1. Minta AI mengubah aplikasi (tempelkan prompt dari `docs/00_CATATAN_SERAH_TERIMA.md`).
2. Ambil `index.html` baru dari AI → di GitHub buka repository → **Add file → Upload files** → unggah (menimpa yang lama) → *Commit*.
3. Vercel otomatis menayangkan versi baru dalam ±1 menit. Tidak perlu apa-apa lagi.
4. Bila AI juga memberi folder `src/`, unggah juga supaya kode terpisah tetap sama dengan `index.html`.

## Keamanan dan perawatan
- Repository harus **Private**. Jangan unggah file cadangan `.json`.
- Unduh **cadangan JSON** dari aplikasi secara berkala (mis. tiap minggu) dan simpan di komputer/Drive pribadi.
- Paket gratis Supabase menjeda project yang tidak dipakai sekitar 1 minggu. Kalau muncul "paused", buka dashboard Supabase lalu klik **Restore**. Penyimpanan gratis sekitar 1 GB dan berkas maksimal 50 MB (aplikasi membatasi 48 MB).
- PIN kunci di dalam aplikasi hanya pengaman layar, bukan pengaman data. Pengaman sebenarnya adalah login Supabase. Jangan bagikan email/password.

## Kalau ada masalah
| Gejala | Penyebab / solusi |
|---|---|
| "Profil tidak ditemukan" saat login | Akun dibuat sebelum SQL dijalankan. Jalankan ulang `supabase-setup.sql`. |
| "Upload ditolak Supabase" / "row-level security" | SQL belum dijalankan atau gagal. Jalankan ulang, pastikan "Success". |
| Muncul "Alamat Supabase belum diisi" | `config.js` masih kosong atau salah. Isi Project URL dan Publishable key, simpan di GitHub (Commit), tunggu deploy, lalu Ctrl+F5. |
| Layar login tidak muncul / "Library Supabase gagal dimuat" | Internet bermasalah. Muat ulang. |
| Gagal login | Cek email/password di Authentication → Users, dan centang Auto Confirm saat membuat akun. |
| Perubahan tidak tampil setelah upload ke GitHub | Tunggu deploy Vercel selesai (tab Deployments), lalu tekan Ctrl+F5. |
