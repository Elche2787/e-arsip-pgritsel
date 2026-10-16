# Arsip Surat PGRI Kec. Teweh Selatan

Frontend statis (index.html) + backend Google Apps Script (Drive & Sheet).

## 1. Backend
1. Buka script.google.com > Proyek baru > tempel isi `apps-script/Code.gs`.
2. Project Settings > Script Properties: tambah `APP_USER` dan `APP_PASS` (akun login Anda).
3. Deploy > New deployment > Web app > Execute as: **Me**, Who has access: **Anyone**. Izinkan akses Drive & Sheets.
4. Salin URL Web App (berakhiran /exec).

## 2. Frontend
1. Letakkan logo di `assets/logo-pgri.png`.
2. Di `index.html`, ganti `GANTI_DENGAN_URL_WEB_APP` dengan URL Web App.
3. Push ke GitHub, lalu Vercel > Add New Project > pilih repo > Deploy (tanpa build command).

Catatan: preview surat memakai Google Drive, jadi perlu masuk akun Google yang punya akses folder. Ukuran file disarankan di bawah 8 MB.
