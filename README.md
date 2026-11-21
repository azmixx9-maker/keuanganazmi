# Azmi Finance

Aplikasi keuangan pribadi (HTML tunggal, offline). Data tersimpan hanya di perangkat, tidak dikirim ke GitHub.

## Pasang di GitHub Pages
1. Buat repository baru di github.com (mis. `azmi-finance`).
2. **Add file > Upload files**, unggah semua file ini ke root repository: `index.html`, `sw.js`, `manifest.webmanifest`, `icon-180.png`, `icon-192.png`, `icon-512.png`. Lalu **Commit changes**.
3. Buka **Settings > Pages**. Pada *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu 1-2 menit. Alamatnya: `https://USERNAME.github.io/azmi-finance/`
5. Buka alamat itu di **Safari iPhone**, tekan **Bagikan > Tambah ke Layar Utama**. Seterusnya buka hanya dari ikon di Layar Utama.

## Penting
- Data di Safari dan di ikon Layar Utama terpisah. Jika sudah mencatat di Safari, buat Backup JSON, lalu Impor di aplikasi Layar Utama.
- Setelah mengganti file, buka aplikasi dua kali agar versi baru aktif (service worker memperbarui di latar belakang).
- Lakukan Backup JSON tiap minggu.
