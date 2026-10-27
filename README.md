# Bengkel Alwi

Prototipe web responsif untuk pencarian bengkel di peta OpenStreetMap, forum konsultasi, booking servis, dan transaksi sparepart. React + TypeScript + Vite + Tailwind CSS + Leaflet.

## Menjalankan

```sh
npm install
npm run dev
```

Buka alamat lokal yang dicetak Vite. Browser memerlukan internet untuk tile peta. Data dan ilustrasi demo tersedia secara lokal.

```sh
npm test
npm run build
npm run preview
```

`npm run build` menjalankan pemeriksaan TypeScript sebelum membangun `dist/`. Hosting statis harus mengarahkan URL aplikasi yang tidak cocok dengan file ke `index.html` agar React Router bekerja saat refresh.

## Mencoba alur demo

1. Akun awal: **Raka Pratama**. Pilih **Alwi Auto Care** pada peta, buat pertanyaan, booking layanan, atau tambahkan produknya ke keranjang.
2. Pada checkout, pilih simulasi pembayaran gagal lalu coba kembali dengan hasil berhasil. Pesanan dapat dilanjutkan dari **Aktivitas → Pesanan sparepart**.
3. Pilih **Mitra** pada header untuk membuka dashboard Alwi Auto Care. Terima booking, jawab pertanyaan, atau proses pesanan sampai selesai.
4. Kembali ke **User** untuk melihat perubahan. Untuk mitra lain, pilih akun yang sesuai pada **Akun**.
5. Pilih **Mitra Baru** pada halaman Akun, buka dashboard, dan daftarkan bengkel dengan memilih titik peta. Bengkel baru langsung tampil pada hasil pencarian yang sesuai.
6. Tombol **Reset data demo** di halaman Akun mengembalikan semua data awal.

Data awal berisi 15 bengkel fiktif, 40 produk, 12 pertanyaan, 2 akun user, 15 mitra bengkel, dan 1 akun mitra baru. Ilustrasi dibuat sebagai SVG lokal, bukan foto usaha nyata. Peran dan akun demo bukan autentikasi atau kontrol akses produksi.

## Perilaku penting

- Semua data aplikasi tersimpan di `localStorage` browser dengan kunci `bengkel-alwi-demo-v1`, melalui repository asinkron. Semua mutasi melewati antrean dan baru diterapkan pada UI setelah penyimpanan berhasil.
- Akun memiliki keranjang, kendaraan, pertanyaan, dan aktivitas masing-masing. Pergantian akun tersedia di halaman Akun. Pembaruan dari tab lain dibaca melalui event `storage`; transaksi lintas tab simultan tidak dijamin atomik dan bukan fitur produksi.
- Radius dan urutan terdekat dihitung dengan jarak garis lurus dari pusat wilayah atau lokasi yang diizinkan pengguna. Pilihan wilayah mengubah pusat peta dan penghitungan jarak, bukan membatasi wilayah administratif.
- Jam buka, tanggal, dan slot menggunakan **Asia/Jakarta (WIB)**. Setiap bengkel beroperasi setiap hari pada jam yang dikonfigurasi. Booking yang ditolak membebaskan slot. Harga layanan adalah harga mulai.
- Keranjang hanya berisi produk satu bengkel. Stok diverifikasi saat checkout dan pembayaran berhasil. Pembayaran gagal tidak mengurangi stok. Pembayaran sukses berulang bersifat idempoten. Pesanan menyimpan harga dan nama produk saat checkout.
- Pengambilan sparepart dilakukan di bengkel. Tidak ada pembayaran nyata, pengiriman, geocoding, chat privat, unggahan, atau backend.
- Pertanyaan yang ditujukan ke satu bengkel hanya bisa dijawab mitra bengkel tersebut; pertanyaan umum dapat dijawab mitra mana pun yang memiliki bengkel. Pemilik pertanyaan dapat menanggapi dan menyelesaikan diskusi.

## Peta

Default tile: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Atribusi OpenStreetMap selalu terlihat. Tile memakai caching browser dan tidak diprefetch atau disediakan offline. Patuhi [kebijakan penggunaan tile OSM](https://operations.osmfoundation.org/policies/tiles/) sebelum penggunaan lebih luas.

Sumber tile dapat diganti lewat `VITE_OSM_TILE_URL` pada `.env.local`. Jika memakai penyedia lain, sesuaikan atribusi pada `MapView.tsx` dengan persyaratan penyedia. Pemilihan area dan pencarian memakai data lokal, tanpa Nominatim. Kegagalan tile tidak menghentikan daftar dan alur aplikasi.

## Struktur

- `src/domain.ts`: aturan filter, booking, stok, pembayaran, forum, dan validasi kepemilikan demo.
- `src/repository.ts` dan `src/store.tsx`: penyimpanan asinkron, antrean perubahan, akun aktif, dan pesan status.
- `src/seed.ts` dan `src/types.ts`: data contoh dan tipe domain.
- Komponen halaman: `Explore`, `Forum`, `Activity`, `Partner`, dan `Account`.

## Verifikasi implementasi

- 26 tes lulus: pencarian, WIB, kapasitas booking, kepemilikan data, stok, pembayaran idempoten, forum, repository, dan alur komponen user–mitra.
- Build produksi dan pemeriksaan TypeScript lulus. Audit npm saat implementasi: 0 kerentanan yang dilaporkan.
- Tes komponen berjalan dalam jsdom dengan peta tiruan; tes ini tidak memverifikasi tampilan atau pemuatan tile Leaflet di browser sungguhan.
- Server lokal telah diverifikasi merespons HTTP 200. Pemeriksaan visual desktop/HP belum dilakukan karena alat browser menolak akses URL lokal pada sesi implementasi.

Untuk produksi, ganti repository dengan API dan database, terapkan autentikasi serta otorisasi di server, dan tambahkan transaksi database untuk stok serta kapasitas booking. Jangan menggunakan data pribadi atau pembayaran sungguhan dalam prototipe ini.
