# Game Discover

Prototipe website rekomendasi game digital (mirip Steam) untuk tugas mata kuliah Sistem Rekomendasi. Dilengkapi dengan antarmuka pengguna modern (*Dark Gaming Theme & Glassmorphism*) dan pengalaman interaktif bertaraf platform streaming game profesional.

---

## Fitur Utama

- **Register / Login & Onboarding**:
  - Autentikasi sesi (username + password, session cookie).
  - Tampilan split layout sinematik dengan efek *ambient glowing blobs*.
  - Onboarding interaktif dengan kartu genre (*genre tiles*), emoji representatif, pembatas 3–5 pilihan, dan animasi *confetti*.
- **Home (Beranda)**:
  - **Hero Carousel Banner**: Menampilkan game rekomendasi teratas dengan auto-rotate 5 detik, navigasi kaca, dan dukungan layar sentuh.
  - **Sistem Filter & Pencarian**: Chip genre horizontal scrollable, search bar dengan tombol hapus instan, dan badge filter aktif.
  - **Katalog & Card Interaktif**: Kartu game modern dengan efek zoom, persentase ulasan bersandi warna, tombol cepat *+ Add to Library*, serta *numbered pagination*.
  - **Recommended for You**: Rekomendasi personal berbasis preferensi genre awal dan library user.
- **Detail Game**:
  - *Immersive blurred backdrop* berskala penuh.
  - *Progress bar* rasio ulasan positif visual (contoh: *Sangat Positif 88%*).
  - Tombol *Add to Library* dengan animasi gelombang (*ripple effect*).
  - **Interactive Star Rating**: Beri atau ubah rating 1–5 bintang langsung dari halaman detail tanpa harus ke library.
  - Daftar rekomendasi *Game Serupa* berbasis *content similarity*.
- **My Library**:
  - Banner profil gamer dengan inisial avatar gradien dan 4 tile statistik koleksi.
  - **AI Recommender Unlock Tracker**: Banner progres dinamis yang memandu user mencapai 5 rating untuk mengaktifkan sistem Hybrid AI.
  - **View Switcher (Grid ⊞ vs List ☰)**: Pilihan tampilan kartu atau baris daftar yang tersimpan di `localStorage`.
  - Filter cepat (*Semua*, *Sudah Dirating*, *Belum Dirating*) dan pencarian *real-time* di library.
  - Badge status rating (*Masterpiece, Recommended, Good, Mediocre, Belum Dirating*) dan efek pendaran bintang (*star shine*).

---

## Tech Stack & Komponen Tampilan (Frontend & Backend)

### Backend
- **Python**: 3.11 / 3.14
- **FastAPI**: Backend web framework modern & asinkron.
- **Jinja2**: Template engine untuk render halaman HTML dinamis.
- **SQLite**: Database relasional ringan untuk katalog game, user, dan library.
- **Pandas & Scikit-learn**: Pemrosesan dataset dan kalkulasi vektor TF-IDF, Cosine Similarity, serta matriks Item Collaborative Filtering.

### Frontend & Desain Tampilan (UI/UX)
- **Bootstrap 5 (CDN)**: Grid layout responsif dan komponen dasar.
- **Google Fonts (Outfit)**: Tipografi modern bertema teknologi dan gaming.
- **Vanilla JavaScript (ES6+)**: Logika interaktif tanpa dependency library eksternal:
  - Hero carousel auto-rotate & touch swipe.
  - Filter chips horizontal wheel scroll & auto-centering.
  - Pengatur view toggle Grid vs List dengan persistensi `localStorage`.
  - Pencarian real-time dan penyaringan tab library.
  - AJAX fetch handler untuk *Add to Library* dan *Star Rating* reaktif.
  - Partikel animasi konfeti dan kalkulasi lingkaran SVG (*progress ring*).
- **Custom CSS3 (Design System & Tokens)**:
  - **Dark Gaming Palette**: Variabel warna CSS kustom (Deep Navy `#0a0e1a`, Surface `#121826`, Electric Blue `#4c8dff`, Neon Emerald `#22c55e`).
  - **Glassmorphism**: Lapisan blur tembus pandang (`backdrop-filter: blur()`).
  - **Micro-Animations & Keyframes**: *Spring hover effects*, *pulse dot*, *star shine*, *button ripple*, dan *shake animations*.
  - **SVG Asset**: Ikon vektor mandiri dan placeholder gambar otomatis saat cover gagal dimuat.

---

## Sistem Rekomendasi

- **Content-based**: TF-IDF pada tags game + cosine similarity. Dipakai untuk *cold-start* (rating user < 5) dari genre favorit.
- **Collaborative filtering**: Item-based, rating dipusatkan per user (*mean-centered*), similarity diredam (*shrinkage*) untuk overlap kecil.
- **Hybrid**: Skor = $0.5 \times \text{content-based} + 0.5 \times \text{collaborative}$, ditambah bobot popularitas kecil. Aktif bila user punya minimal 5 rating.
- **Similar Games**: Kombinasi similarity content-based dan collaborative.

---

## Dataset

Kaggle "Game Recommendations on Steam" (antonkozyriev), di-sampling menjadi:
- **1.994** game
- **5.000** user
- **52.293** rating

Rating 1–5 diturunkan dari kolom `is_recommended` dan jam bermain. Dataset tidak memiliki kolom genre terpisah, sehingga kolom `tags` diperlakukan sebagai representasi genre.

---

## Struktur Proyek

```text
app/
  ├── main.py              # Routing FastAPI, session auth, dan API library
  ├── auth.py              # Hashing password dan session cookie
  ├── database.py          # Koneksi dan skema database SQLite
  ├── recommender.py       # Algoritma Content-Based, Collaborative, & Hybrid
  ├── templates/           # Jinja2 HTML templates
  │     ├── base.html      # Layout utama & sticky glass navbar
  │     ├── _macros.html   # Macro kartu game responsif
  │     ├── home.html      # Beranda, Hero Carousel, & katalog chips
  │     ├── detail.html    # Halaman detail, backdrop, & rating interaktif
  │     ├── library.html   # Koleksi game, Grid/List view, & statistik profil
  │     ├── login.html     # Halaman login 2-kolom
  │     ├── register.html  # Halaman register 2-kolom
  │     └── onboarding.html# Pemilihan genre interaktif dengan progress ring
  └── static/
        ├── css/style.css  # Desain sistem lengkap (Dark gaming theme, tokens, animations)
        ├── js/app.js      # Controller interaktif (Carousel, rating AJAX, filter, switcher)
        └── img/           # Placeholder asset SVG
scripts/                   # Skrip seed DB, evaluasi model, demo, dan pengujian
data/
  ├── raw/                 # File dataset Kaggle mentah (tidak di-commit)
  └── processed/           # Hasil data siap pakai (games, ratings, metadata)
```

---

## Cara Menjalankan

### 1. Setup Environment
```bash
# Menggunakan venv Python bawaan:
python -m venv venv
venv\Scripts\activate      # Windows (PowerShell/CMD)
# source venv/bin/activate # Linux/macOS

# Instal dependensi:
pip install -r requirements.txt
```

### 2. Inisialisasi Database & Jalankan Server
```bash
# Inisialisasi SQLite dari data/processed/:
python scripts/seed_db.py

# Jalankan server FastAPI:
uvicorn app.main:app --reload
```

Buka peramban di: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## Pengujian & Evaluasi

```bash
python scripts/evaluate.py    # Evaluasi model (RMSE/MAE, Precision@10, Recall@10)
python scripts/smoke_ui.py    # Uji end-to-end seluruh halaman dan rute
```

### Hasil Evaluasi (300 user uji, 20% rating disembunyikan)
| Metode | Precision@10 | Recall@10 |
|---|---|---|
| Popularitas (baseline) | 0.0159 | 0.0562 |
| Content-based | 0.0138 | 0.0537 |
| Collaborative | 0.0179 | 0.0628 |
| Hybrid | 0.0162 | 0.0646 |

*Prediksi rating: CF RMSE 1.1815 / MAE 0.8940 (baseline rata-rata global 1.1856 / 0.8983).*

---

## Keterbatasan Sistem

- **Sparsity**: Data jarang (rata-rata ~10 rating per user) sehingga peningkatan terhadap baseline popularitas relatif bertahap.
- **Rating Implicit-to-Explicit**: Rating dataset diturunkan dari jam main dan rekomendasi biner, bukan survei rating eksplisit asli.
- **Model Retraining**: Matriks similarity collaborative dilatih saat server dimulai. Rating baru dari user langsung memengaruhi rekomendasi user itu sendiri secara dinamis, namun baru diintegrasikan ke matriks CF global saat server di-restart.
- **Keamanan Prototipe**: `SECRET_KEY` default ditujukan untuk keperluan pengembangan dan tugas akademik. Tentukan environment variable `SECRET_KEY` tersendiri untuk penggunaan produksi nyata.
