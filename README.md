<div align="center">

# Cryptography Toolkit

**Implementasi algoritma kriptografi klasik dan modern berbasis web**

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Akses Daring:** [kriptographykhilqimarselrachel.my.id](https://www.kriptographykhilqimarselrachel.my.id/)

</div>

---

## Deskripsi Proyek

**Cryptography Toolkit** merupakan aplikasi web interaktif yang dikembangkan sebagai tugas **Ujian Tengah Semester (UTS) mata kuliah Kriptografi**. Aplikasi ini mengimplementasikan delapan algoritma kriptografi, mulai dari cipher klasik berbasis alfabet hingga cipher modern berbasis byte.

> **Keamanan Data:** Seluruh proses enkripsi dan dekripsi dijalankan sepenuhnya di sisi klien (*client-side*). Tidak ada data pengguna yang dikirimkan ke server eksternal.

---

## Algoritma yang Diimplementasikan

### Alphabet Ciphers *(Domain: 26 karakter A–Z)*

| No. | Algoritma | Rute | Deskripsi |
|-----|-----------|------|-----------|
| 1 | **Vigenere Standard** | `/vigenere` | Cipher substitusi polialfabetik klasik dengan pergeseran kunci berulang |
| 2 | **Auto-Key Vigenere** | `/autokey` | Varian Vigenere dengan kunci yang diperpanjang secara dinamis dari plaintext |
| 3 | **Playfair Cipher** | `/playfair` | Enkripsi berbasis matriks 5×5 yang memproses pasangan huruf (digraf) |
| 4 | **Affine Cipher** | `/affine` | Enkripsi menggunakan fungsi linear `E(x) = (mx + b) mod 26` |
| 5 | **Hill Cipher** | `/hill` | Enkripsi blok berbasis perkalian matriks kunci N×N dalam aritmetika mod 26 |

### Byte Ciphers *(Domain: 256 nilai byte — mendukung file biner)*

| No. | Algoritma | Rute | Deskripsi |
|-----|-----------|------|-----------|
| 6 | **Extended Vigenere** | `/extended` | Perluasan Vigenere ke ranah 256 byte; mendukung enkripsi file biner |
| 7 | **Super Encryption** | `/super` | Enkripsi berlapis: Extended Vigenere dikombinasikan dengan Transposisi Kolom |
| 8 | **Enigma Cipher** | `/enigma` | Simulasi mesin rotor Enigma 3-tingkat dengan reflector; bersifat simetris |

---

## Mode Input

Setiap algoritma mendukung dua mode input:

| Mode | Keterangan |
|------|------------|
| **Text** | Masukan berupa teks bebas; keluaran berupa teks atau string Base64 |
| **File** | Masukan berupa file biner; keluaran berupa file terenkripsi dengan ekstensi `.dat` |

> **Catatan:** Mode File hanya tersedia pada algoritma **Extended Vigenere**, **Super Encryption**, dan **Enigma Cipher**, karena ketiga algoritma tersebut beroperasi pada level byte.

---

## Instalasi dan Penggunaan Lokal

### Prasyarat

- **Node.js** versi 18 atau lebih baru — [Unduh di sini](https://nodejs.org/)
- **npm** (sudah disertakan bersama Node.js)

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone <url-repositori>
cd uts

# 2. Instalasi dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```

Buka `http://localhost:3000` pada browser untuk mengakses aplikasi.

### Perintah Tersedia

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Mengompilasi aplikasi untuk produksi |
| `npm run start` | Menjalankan hasil build produksi |
| `npm run lint` | Memeriksa kualitas kode |

---

## Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [Next.js](https://nextjs.org/) | `16.x` | Framework React dengan App Router |
| [React](https://react.dev/) | `19.x` | Library antarmuka pengguna |
| [TypeScript](https://www.typescriptlang.org/) | `5.x` | Pengetikan statis dan keamanan tipe |
| [Tailwind CSS](https://tailwindcss.com/) | `4.x` | Kerangka kerja CSS berbasis utilitas |
| [math.js](https://mathjs.org/) | `15.x` | Komputasi matriks untuk Hill dan Affine Cipher |

---

## Struktur Direktori

```
uts/
│
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Halaman utama dan menu navigasi
│   ├── layout.tsx                 # Root layout aplikasi
│   ├── globals.css                # Stylesheet global
│   │
│   ├── vigenere/                  # Halaman Vigenere Standard
│   ├── autokey/                   # Halaman Auto-Key Vigenere
│   ├── extended/                  # Halaman Extended Vigenere
│   ├── playfair/                  # Halaman Playfair Cipher
│   ├── affine/                    # Halaman Affine Cipher
│   ├── hill/                      # Halaman Hill Cipher
│   ├── super/                     # Halaman Super Encryption
│   └── enigma/                    # Halaman Enigma Cipher
│
├── components/
│   ├── CipherUI.tsx               # Komponen UI utama yang digunakan oleh semua cipher
│   └── Sidebar.tsx                # Komponen navigasi
│
├── utils/
│   └── ciphers/
│       ├── alphabetCiphers.ts     # Implementasi: Vigenere, Playfair, Affine, Hill
│       └── byteCiphers.ts         # Implementasi: Extended Vigenere, Super, Enigma
│
└── public/                        # Aset statis
```

---

## Detail Teknis Implementasi

<details>
<summary><strong>Vigenere Standard &amp; Auto-Key Vigenere</strong></summary>

- Prinsip dasar: pergeseran modular `E(x) = (x + k) mod 26`
- Pada **Auto-Key Vigenere**, kunci diperpanjang secara otomatis menggunakan karakter plaintext (saat enkripsi) atau karakter ciphertext (saat dekripsi), sehingga panjang kunci selalu sama dengan panjang pesan
- Karakter non-alfabet pada masukan diabaikan sebelum diproses

</details>

<details>
<summary><strong>Playfair Cipher</strong></summary>

- Matriks 5×5 dibangun berdasarkan kunci; huruf `J` diperlakukan sama dengan `I`
- Plaintext dibagi menjadi pasangan huruf (digraf); huruf kembar dalam satu digraf dipisahkan dengan karakter `X`
- Tiga aturan enkripsi: baris sama (geser kanan), kolom sama (geser bawah), persegi panjang (tukar kolom)

</details>

<details>
<summary><strong>Affine Cipher</strong></summary>

- Enkripsi: `E(x) = (m · x + b) mod 26`
- Dekripsi: `D(x) = m⁻¹ · (x − b) mod 26`
- Kunci `m` harus koprima dengan 26 (nilai yang valid: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25)
- Invers modular dihitung menggunakan pencarian langsung (*brute-force*)

</details>

<details>
<summary><strong>Hill Cipher</strong></summary>

- Enkripsi blok: `C = K · P mod 26`, dengan K sebagai matriks kunci dan P sebagai vektor plaintext
- Dekripsi: `P = K⁻¹ · C mod 26`; invers matriks dihitung melalui adjugat dikali invers determinan mod 26
- Mendukung matriks kunci berukuran N×N (default 2×2); plaintext diberi padding `X` bila panjangnya tidak kelipatan N
- Komputasi matriks memanfaatkan library **math.js**

</details>

<details>
<summary><strong>Extended Vigenere Cipher</strong></summary>

- Prinsip identik dengan Vigenere standar, namun beroperasi pada domain 256 nilai byte
- Kunci dikonversi ke dalam array byte menggunakan `TextEncoder`
- Formula: enkripsi `E(b) = (b + k) mod 256`, dekripsi `D(b) = (b − k + 256) mod 256`
- Keluaran enkripsi dikodekan dalam format **Base64**

</details>

<details>
<summary><strong>Super Encryption</strong></summary>

- **Proses enkripsi:** Extended Vigenere → Transposisi Kolom
- **Proses dekripsi:** Invers Transposisi Kolom → Extended Vigenere
- Urutan kolom pada transposisi ditentukan berdasarkan urutan leksikografis karakter kunci

</details>

<details>
<summary><strong>Enigma Cipher (Disederhanakan)</strong></summary>

- Menggunakan 3 rotor virtual dengan mekanisme *stepping* otomatis (bertingkat seperti odometer)
- Kondisi awal setiap rotor ditentukan dari 3 byte pertama kunci
- Reflector: `R(b) = 255 − b` (simetris, sehingga proses enkripsi dan dekripsi identik)
- Saat mengenkripsi file, ekstensi asli disisipkan di awal data terenkripsi agar dapat dipulihkan saat dekripsi

</details>

---

## Panduan Penggunaan

1. Buka halaman utama dan pilih algoritma yang diinginkan
2. Tentukan mode masukan: **Text** atau **File**
3. Masukkan kunci rahasia
   - Untuk **Affine Cipher**: isi parameter `m` dan `b`
   - Untuk **Hill Cipher**: isi matriks kunci N×N
4. Klik tombol **Encrypt** untuk mengenkripsi atau **Decrypt** untuk mendekripsi
5. Salin teks keluaran atau klik **Download** untuk mengunduh file hasil (mode File)

---

## Informasi Pengembang

| | |
|---|---|
| **Nama** | Khilqi Marsel Rachel |
| **Mata Kuliah** | Kriptografi |
| **Jenis Tugas** | Ujian Tengah Semester (UTS) |
| **Semester** | 7 |
| **Akses Daring** | [kriptographykhilqimarselrachel.my.id](https://www.kriptographykhilqimarselrachel.my.id/) |

---

*Proyek ini dikembangkan semata-mata untuk keperluan akademik.*
