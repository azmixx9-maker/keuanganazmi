# Panduan Uji Supabase (untuk pemilik, tanpa coding)

Tujuan: memastikan aplikasi online benar-benar menyimpan ke Supabase. Total sekitar 15 menit.

## Tahap 1. Uji otomatis (2 menit)
1. Buka alamat Vercel Anda, login.
2. Klik tombol **⋯** di kiri bawah sidebar → **Uji koneksi**.
3. Tunggu sampai di bawah muncul ringkasan "N lulus · N gagal · N peringatan".
4. Arti tanda: **✓** baik, **!** peringatan (aplikasi tetap jalan, tapi baca sarannya), **✕** gagal (ikuti saran di bawah barisnya), **i** hanya info.
5. Klik **Salin hasil**, lalu tempel ke AI pengembang bila ada ✕ atau !. Salinan hasil tidak memuat alamat atau kunci Supabase.

Yang diuji otomatis: login dan profil aktif, baca/tulis tabel `app_data`, nomor versi otomatis, tabel `app_files`, unggah/unduh di folder `arsip`, fungsi pembersih berkas yatim, Realtime, dan apakah data di perangkat ini sudah ada di cloud. Berkas uji dihapus otomatis.

## Tahap 2. Uji manual yang tidak bisa otomatis
**A. Data benar-benar di cloud**
1. Di Supabase: **Table Editor → app_data**. Harus ada banyak baris (kontrak, karyawan, surat, dll.).
2. Ubah satu hal kecil di aplikasi (mis. tambah catatan di Catatan & Pengingat). Tunggu 5 detik. Di Supabase, klik tombol refresh pada tabel `app_data`: kolom `updated_at` baris `opa-notes` harus berubah.

**B. Dua perangkat (sinkron)**
1. Buka aplikasi di browser kedua (atau ponsel), login dengan akun yang sama.
2. Data yang sama harus tampil. Tambah satu catatan di perangkat 1, lalu di perangkat 2 tunggu sebentar atau klik **⋯ → Tarik**.
3. Catatan itu harus muncul di perangkat 2.

**C. Lampiran**
1. Di modul Dokumen, unggah satu berkas kecil ke Arsip.
2. Di Supabase: **Storage → arsip → files**. Berkasnya harus ada.
3. Hapus berkas itu dari aplikasi. Di menu **Berkas Online** harus ada di Sampah dan bisa dipulihkan.

**D. Cadangan dan pulihkan**
1. **⋯ → Cadangkan semua data**. Simpan file `.json` di komputer (JANGAN diunggah ke GitHub).
2. Di browser bersih (jendela Incognito), login lalu **⋯ → Pulihkan dari file…** pilih file tadi. Data harus kembali utuh.

**E. Keamanan**
1. Supabase → **Authentication → Sign In / Providers**: **Allow new users to sign up** harus **mati**.
2. Repository GitHub harus **Private**.
3. Buka alamat Vercel di jendela Incognito tanpa login: hanya layar login yang boleh tampil.

## Kalau muncul masalah
| Gejala | Tindakan |
|---|---|
| ✕ "relation ... does not exist" atau "Could not find the function" | Jalankan ulang `supabase/supabase-setup.sql` di SQL Editor (aman diulang). |
| ✕ "row-level security" / "permission denied" | Table Editor → `profiles` → kolom `aktif` harus true untuk akun Anda. Jalankan ulang SQL bila tabel `profiles` kosong. |
| ✕ "Bucket not found" | Jalankan ulang SQL; cek Storage ada folder `arsip`. |
| ! Realtime tidak terdeteksi | Tidak fatal. Pakai **⋯ → Tarik** untuk menarik data. Cek Database → Replication: `app_data` dan `app_files` aktif. |
| ! Belum ada di cloud: ... | Klik **⋯ → Simpan** lalu ulangi uji. |
| Semua ✕ dengan pesan jaringan | Cek internet dan isi `config.js` (Project URL dan Publishable key). |
| "Project paused" | Supabase gratis menjeda project yang tidak dipakai ±1 minggu. Buka dashboard Supabase → **Restore**. |
