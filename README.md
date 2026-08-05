# Selapan

**Kalender Jawa, dengan hitungannya diperlihatkan.**

Empat siklus yang berjalan bersamaan, aritmetika yang bisa diperiksa dengan tangan, kurup yang benar sepanjang sejarah, dan batas tegas antara yang dihitung dan yang diwariskan.

> *selapan* — daur 35 hari yang lahir dari pasaran lima hari berjalan melawan pekan tujuh hari. Daur yang dinamai sebuah weton.

Situs statis, tanpa backend. Lihat `PRD.md` untuk lingkup dan `CLAUDE.md` untuk cara bekerja di repo ini.

## Yang sudah ada

| | |
|---|---|
| **M0** Scaffold | Ekspor statis, konversi JDN, skema anchor + validator build |
| **M1** Siklus | Pasaran, dina, weton, neptu, wuku dari anchor bersumber |
| **M2** Tahun lunar | Windu, panjang bulan, kurup, Aboge/Asapon, rentang keberlakuan |
| **M3** Antarmuka | Cincin siklus, konversi dengan derivasi, kalender bulanan |
| **M4** Perselisihan | Aboge dan Asapon berdampingan, halaman sumber |
| **M5** Mangsa | Pranata mangsa, selapanan, hitungan slametan |
| **M6** Primbon | **Belum dirilis** — menunggu peninjau (PRD §10) |

M6 sengaja ditahan. Mesin kalendernya berdiri sendiri sebagai produk yang utuh; lapisan tafsir butuh peninjau yang paham praktik pananggalan Jawa. Skema dan pemeriksa build untuk lapisan itu sudah ada dan sudah berlaku.

## Cara kerjanya

```
tanggal Masehi
  → JDN (bilangan bulat)
  → siklus (murni)  → pasaran, dina, wuku       [tanpa batas]
  → lunar (murni)   → kurup → windu → tahun → bulan → tanggal  [sejak 1633 M]
  → CalendarTrace   → cincin | konversi | kalender
```

Tiga hal menentukan segalanya:

1. **Yang dihitung dan yang ditafsirkan dipisah tegas**, di kode maupun di warna. Nila untuk aritmetika, merah rubrik untuk bahan primbon. Tidak pernah dicampur.
2. **JDN adalah representasi internal.** Bilangan bulat, modulo terhadap anchor bersumber. Tidak ada objek `Date` di dalam mesin — tidak ada zona waktu, tidak ada DST, tidak ada locale.
3. **Rentang keberlakuan berbeda per subsistem.** Siklus 5, 7, dan 210 hari kontinu tanpa batas. Sistem tahun lunar mulai 1633 M dan tidak berarti apa pun sebelum itu. Di luar rentang, mesin menolak — bukan mengekstrapolasi.

## Perintah

```bash
pnpm dev
pnpm build                  # ekspor statis ke ./out; menjalankan data:validate dulu
pnpm preview                # sajikan ./out
pnpm test:run               # sebelum setiap commit
pnpm test:cycles            # invarian periode siklus sepanjang satu abad
pnpm test:anchors           # fixture anchor bersumber
pnpm test:kurup             # batas kurup, perselisihan Aboge/Asapon
pnpm data:validate          # skema dan kelengkapan kutipan — menggerbangi build
pnpm typecheck
pnpm lint
```

`pnpm data:validate` menggerbangi build dan CI. Jangan dilemahkan.

## Yang belum selesai

Daftar terbuka, juga tersedia di halaman **Sumber** aplikasi:

- **Epoch pawukon** bersandar pada satu sumber dan belum diadu dengan kalender Bali maupun Jawa cetak. Fase yang meleset satu wuku tidak akan tertangkap uji invarian mana pun. Nilai wuku dirender abu-abu.
- **Kurup Anenhing** (1987 AJ, mulai 2052 M) adalah proyeksi, bukan catatan.
- **Panjang bulan tahun Dal** dalam tradisi Surakarta tidak beraturan dan belum diterapkan. Batas tahun tidak terpengaruh; tanggal di dalam tahun Dal bisa meleset.
- **Kurup pertama berjalan 72 tahun**, bukan 120. Sebab historisnya tidak dicatat di sini; yang bisa ditegaskan hanya bahwa panjang itulah yang membuat rantai kurup berikutnya mendarat tepat.
- **Sumber dikutip sebagai tradisi pananggalan**, belum sebagai halaman almanak cetak yang ditranskripsi.

## Pengembangan

Sekitar 126 uji. Yang paling berguna adalah invarian siklus sepanjang puluhan ribu hari berturut-turut: kesalahan satu hari pada sebuah anchor langsung terlihat sebagai periode yang rusak atau nilai yang berulang, tanpa perlu oracle dari luar.

Uji silang yang paling meyakinkan ada di `tests/kurup`: berangkat dari satu anchor 1633 dan menerapkan pola windu beserta koreksi 120 tahun, rantai kurup mendarat berturut-turut pada Kemis Kliwon, Rebo Wage, dan Selasa Pon — nama Amiswon, Aboge, dan Asapon — dengan Asapon jatuh pada 24 Maret 1936, tanggal yang tercatat sumber.

## Lisensi dan sikap

Proyek pribadi, sumber terbuka, bukan otoritas. Tradisi pananggalan berbeda antar-daerah, dan aplikasi ini tidak dimaksudkan membantah perhitungan yang dipakai keluarga atau komunitas mana pun. Bahan primbon, bila kelak dirilis, disajikan sebagai dokumentasi budaya — bukan ramalan, bukan nasihat, tanpa peringkat, dan selalu beratribusi.
