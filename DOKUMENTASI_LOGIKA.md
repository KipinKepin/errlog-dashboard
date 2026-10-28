# Dokumentasi Lengkap Logika Aplikasi — ETL Error Monitoring Dashboard

Dokumen ini berisi penjelasan menyeluruh mengenai seluruh logika, perhitungan data, filter, visualisasi grafik, tabel, hingga peta interaktif (**Overseas Branch Heatmap**) yang dibuat pada aplikasi **ETL Error Monitoring Dashboard**.

---

## 1. Struktur File Utama

Aplikasi ini dibagi menjadi tiga file logika utama di dalam folder `src/`:

1. **`src/data/overseasBranches.js`**
   Menyimpan konfigurasi statis untuk 7 Kantor Cabang Luar Negeri (KCLN), opsi dropdown filter cabang, serta fungsi pencocokan filter cabang (`matchesBranchFilter`).
2. **`src/components/OverseasHeatmap.jsx`**
   Komponen visualisasi **Peta Heatmap Cabang Luar Negeri** berbasis SVG interaktif yang mendukung *auto-filter*, *auto-zoom* ke lokasi cabang, *mouse drag panning* (geser peta), *mouse wheel zooming* (perbesar/perkecil peta), sub-node heatmap per schema, serta panel rincian cabang.
3. **`src/App.jsx`**
   Komponen utama dashboard yang mengelola *state* global, *dataset* log eksekusi ETL, pemfilteran berlapis, pengelompokan waktu (*Daily*, *Weekly*, *Monthly*), perhitungan KPI, 3 baris bagian visualisasi (*Execution Trend*, 3 *Chart* sejajar, dan *Execution Log Details Table*), serta fitur pencarian, pengurutan (*sorting*), dan paginasi tabel.

---

## 2. Logika Konfigurasi & Filter Cabang Luar Negeri (`src/data/overseasBranches.js`)

### 2.1. Definisi Data Cabang (`OVERSEAS_BRANCHES`)
Variabel `OVERSEAS_BRANCHES` mendefinisikan 7 cabang luar negeri beserta atribut geografisnya:
- **Singapura** (`lat: 1.3521, lng: 103.8198`, `SGT (UTC+8)`)
- **Hong Kong** (`lat: 22.3193, lng: 114.1694`, `HKT (UTC+8)`)
- **Tokyo - Jepang** (`lat: 35.6762, lng: 139.6503`, `JST (UTC+9)`)
- **Osaka - Jepang** (`lat: 34.6937, lng: 135.5023`, `JST (UTC+9)`)
- **New York - Amerika Serikat** (`lat: 40.7128, lng: -74.006`, `EDT (UTC-4)`)
- **Seoul - Korea Selatan** (`lat: 37.5665, lng: 126.978`, `KST (UTC+9)`)
- **London - Inggris** (`lat: 51.5072, lng: -0.1276`, `BST (UTC+1)`)

### 2.2. Logika Pencocokan Cabang (`matchesBranchFilter`)
Fungsi `matchesBranchFilter(recordBranch, selectedBranch)` menentukan apakah sebuah baris data log termasuk dalam filter cabang yang sedang dipilih:
- Jika `selectedBranch` bernilai `"All"` (atau kosong), maka mengembalikan `true` (semua cabang ditampilkan).
- Jika `selectedBranch` bernilai `"Tokyo dan Osaka - Jepang"`, maka fungsi memeriksa apakah `recordBranch === "Tokyo - Jepang" || recordBranch === "Osaka - Jepang"`. Hal ini memungkinkan pengguna memfilter gabungan seluruh cabang di negara Jepang sekaligus maupun memilih Tokyo atau Osaka secara terpisah.
- Selain itu, fungsi membandingkan kecocokan langsung `recordBranch === selectedBranch`.

---

## 3. Logika Dataset, Derivasi Status, dan Utilitas (`src/App.jsx`)

### 3.1. Pengayaan Dataset (`ENRICHED_RAW_DATA`)
Data mentah (`RAW_DATA`) berisi rekaman eksekusi job ETL dari bulan Juni hingga Agustus 2026 untuk kategori `"Dalam Negeri"` dan `"Luar Negeri"`.
Melalui `ENRICHED_RAW_DATA`:
- Jika baris memiliki `CATEGORY !== "Luar Negeri"`, maka properti `BRANCH` diisi `"Jakarta - Dalam Negeri"`.
- Jika baris memiliki `CATEGORY === "Luar Negeri"`, maka properti `BRANCH` diambil dari properti `BRANCH` eksplisit pada data atau didistribusikan secara deterministik menggunakan rumus modulo `(item.LOG_ID + idx) % BRANCH_ROTATION.length` agar setiap cabang luar negeri memiliki distribusi data yang konsisten.

### 3.2. Derivasi Status Eksekusi (`getDerivedStatus`)
Status eksekusi tidak disimpan secara mentah, melainkan diturunkan secara dinamis dari teks `MESSAGE` menggunakan fungsi `getDerivedStatus(message)`:
1. Jika `MESSAGE` mengandung kata `"completed successfully"` (tidak peka huruf besar/kecil) $\rightarrow$ **`"Success"`** (Hijau `#87d068`).
2. Jika `MESSAGE` mengandung kata `"abort encountered"` $\rightarrow$ **`"Failed"`** (Merah `#e04355`).
3. Jika pesan kosong atau tidak memenuhi kedua kondisi di atas $\rightarrow$ **`"Unknown"`** (Kuning/Amber `#faad14`).

### 3.3. Konversi & Pemformatan Durasi (`parseDurationSeconds` & `formatDuration`)
- **`parseDurationSeconds(duration)`**:
  Menggunakan *Regular Expression* `/(\d+)\s*days?,\s*(\d+):(\d+):(\d+)/i` untuk mengekstrak jumlah hari, jam, menit, dan detik, lalu mengubahnya menjadi total detik:
  $$\text{Total Detik} = (\text{hari} \times 86400) + (\text{jam} \times 3600) + (\text{menit} \times 60) + \text{detik}$$
  Jika `duration` kosong (misalnya karena job gagal/*incomplete*), fungsi mengembalikan `-1` agar saat diurutkan (*sorting*) berada di urutan paling bawah/atas secara konsisten.
- **`formatDuration(duration)`**:
  Mengubah string durasi mentah seperti `"0 days, 00:17:08"` menjadi format ringkas `"00:17:08"` jika jumlah harinya `0`, atau tetap menampilkan `"X days, HH:MM:SS"` jika lebih dari 0 hari.

### 3.4. Klasifikasi Penyebab Error (`classifyErrorCause`)
Fungsi `classifyErrorCause(message)` mengelompokkan pesan error pada job yang berstatus `Failed` ke dalam 5 kategori akar masalah (*root cause*) untuk ditampilkan pada chart **Error Cause Breakdown**:
1. **`"Network / Timeout"`**: Jika pesan memuat kata `timeout`, `connection`, `network`, atau `handshake`.
2. **`"Resource / Disk / Mem"`**: Jika pesan memuat kata `memory`, `disk`, `cpu`, atau `i/o`.
3. **`"Data / Schema Error"`**: Jika pesan memuat kata `mismatch`, `json`, `column`, `schema`, atau `division`.
4. **`"DB Lock / Constraint"`**: Jika pesan memuat kata `lock`, `deadlock`, `duplicate`, `constraint`, atau `ora-`.
5. **`"System / Other Abort"`**: Untuk pesan *abort* umum lainnya.

---

## 4. Logika Filter Global & Rentang Waktu (`src/App.jsx`)

### 4.1. Preset Rentang Waktu Cepat (`TIME_PERIOD_PRESETS` & `handleSelectTimePreset`)
Pengguna dapat memilih filter periode waktu secara cepat melalui tombol di *Global Filter Bar*:
- **All Time (`All`)**: `2026-06-01` s/d `2026-08-31`
- **Daily (`Daily`)**: Hari terakhir pada data (`2026-08-13` s/d `2026-08-13`)
- **3 Days (`3Days`)**: 3 hari terakhir (`2026-08-11` s/d `2026-08-13`)
- **Weekly (`Weekly`)**: 7 hari terakhir (`2026-08-07` s/d `2026-08-13`)
- **14 Days (`BiWeekly`)**: 14 hari terakhir (`2026-07-31` s/d `2026-08-13`)
- **Monthly (`MonthlyAug`)**: Bulan Agustus penuh (`2026-08-01` s/d `2026-08-31`)
- **Custom Range (`Custom`)**: Aktif secara otomatis ketika pengguna mengubah input tanggal mulai (`startDate`) atau tanggal akhir (`endDate`) secara manual.

### 4.2. Pemisahan `overseasBaseData` dan `filteredData`
Aplikasi menggunakan dua lapisan memoization (`useMemo`) untuk pemfilteran data:
1. **`overseasBaseData`**:
   Memfilter data khusus `CATEGORY === "Luar Negeri"` berdasarkan rentang tanggal (`startDate` s/d `endDate`), `statusFilter`, dan pencarian nama job (`jobSearch`), **tanpa** memfilter cabang (`selectedBranch`).
   *Tujuan*: Agar komponen `OverseasHeatmap` tetap mengetahui statistik total ke-7 cabang pada tombol pil cabang dan daftar ringkasan, sekaligus dapat memfilter tampilan peta secara spesifik ketika sebuah cabang dipilih.
2. **`filteredData`**:
   Memfilter data berdasarkan:
   - Tab aktif (`Semua`, `Dalam Negeri`, atau `Luar Negeri`)
   - Cabang luar negeri (`matchesBranchFilter(d.BRANCH, selectedBranch)`) khusus ketika berada di tab `Luar Negeri`
   - Rentang tanggal (`DATE_PARAM >= startDate && DATE_PARAM <= endDate`)
   - Status eksekusi (`All`, `Success`, `Failed`, `Unknown`)
   - Pencarian nama job (`jobSearch`)
   *Tujuan*: Menjadi sumber data tunggal (*single source of truth*) bagi kartu **KPI**, **Execution Trend**, **Status Distribution**, **Top 5 Failed Jobs**, **Executions by Schema / Error Cause**, dan **Execution Log Details Table**. Ketika pengguna memilih cabang (misalnya **Seoul - Korea Selatan**), seluruh grafik dan tabel di bawah peta otomatis menyesuaikan isinya hanya untuk cabang Seoul.

---

## 5. Logika Perhitungan KPI & 3 Baris Visualisasi Grafik (`src/App.jsx`)

### 5.1. Perhitungan Kartu KPI (`kpis`)
Dihitung secara reaktif dari `filteredData`:
- **`total`**: Jumlah seluruh eksekusi (`filteredData.length`)
- **`success`**: Jumlah eksekusi dengan `STATUS === "Success"`
- **`failed`**: Jumlah eksekusi dengan `STATUS === "Failed"`
- **`successRate`**: Persentase keberhasilan dengan rumus:
  $$\text{Success Rate} = \left(\frac{\text{success}}{\text{total}} \times 100\right)\text{.toFixed(1)}$$

### 5.2. Baris 1 — Execution Trend & Pengelompokan Waktu (`trendData`)
Grafik garis (*LineChart*) menampilkan tren jumlah eksekusi `Success` dan `Failed` yang dikelompokkan berdasarkan *state* `trendGranularity`:
- **`Daily`**: Dikelompokkan langsung per tanggal `DATE_PARAM` (`YYYY-MM-DD`).
- **`Weekly` (`getWeekBucket`)**:
  Mengonversi tanggal `YYYY-MM-DD` ke objek `Date` UTC, lalu mencari hari Senin pada minggu tersebut (`dt.setUTCDate(dt.getUTCDate() - day + 1)`). Setiap baris dalam minggu yang sama digabungkan ke dalam satu titik minggu berlabel `Wk MM/DD`.
- **`Monthly` (`getMonthBucket`)**:
  Mengambil 7 karakter pertama tanggal (`YYYY-MM`) dan menggabungkan seluruh eksekusi pada bulan yang sama menjadi label `Jun 2026`, `Jul 2026`, atau `Agu 2026`.

### 5.3. Baris 2 — 3 Grafik Sejajar (3 Kolom)
1. **Kolom 1 — Status Distribution (`pieData`)**:
   Menghitung frekuensi masing-masing status (`Success`, `Failed`, `Unknown`) dari `filteredData`, lalu memfilter status yang nilainya `> 0` untuk ditampilkan pada *Donut/Pie Chart*.
2. **Kolom 2 — Top 5 Failed Jobs (`topFailedJobs`)**:
   Memfilter `filteredData` yang berstatus `"Failed"`, menghitung jumlah kegagalan per `JOB_NAME`, mengurutkannya dari yang paling sering gagal (`b.count - a.count`), lalu mengambil 5 teratas (`.slice(0, 5)`).
3. **Kolom 3 — Executions by Schema (`schemaChartData`) & Error Cause Breakdown (`errorCauseData`)**:
   Dilengkapi tombol *toggle* untuk berpindah antara 2 mode analisis:
   - **By Schema (`schemaChartData`)**: Mengelompokkan `filteredData` berdasarkan `SCHEMA_NAME` (`THE`, `FIN`, `PAY`, `STG`, `SEC`, `CRM`, dll.), menghitung jumlah `Success` dan `Failed` per schema, lalu menampilkannya dalam *Stacked BarChart* untuk melihat schema mana yang paling banyak mengalami error dibanding total eksekusinya.
   - **Error Cause (`errorCauseData`)**: Mengelompokkan job yang gagal berdasarkan hasil fungsi `classifyErrorCause(curr.MESSAGE)` untuk menampilkan distribusi penyebab kegagalan tertinggi.

### 5.4. Baris 3 — Tabel Detail Log Eksekusi (`tableData` & Paginasi)
1. **Pencarian Global Kolom (`tableSearch`)**:
   Mencocokkan kata kunci pencarian terhadap seluruh kolom sekaligus: `STATUS`, `JOB_NAME`, `BRANCH` (Cabang), `TARGET` (`SCHEMA_NAME.TABLE_NAME`), `START_TS`, `DURATION` (termasuk teks `"Incomplete"`), `TOTAL_ROW_COUNT` (angka mentah maupun yang sudah diformat dengan pemisah ribuan), dan `MESSAGE`.
2. **Pengurutan 3 Arah (`handleSort` & `sortConfig`)**:
   Klik pertama pada header kolom mengurutkan secara naik (`asc`), klik kedua mengurutkan secara turun (`desc`), dan klik ketiga mereset urutan (`null`).
   - Untuk kolom `TOTAL_ROW_COUNT`: Mengurutkan secara numerik (`null` dianggap `-1`).
   - Untuk kolom `DURATION`: Mengurutkan berdasarkan hasil konversi detik dari `parseDurationSeconds`.
   - Untuk kolom teks lainnya: Mengurutkan secara alfabetis menggunakan `localeCompare`.
3. **Paginasi (`paginatedTableData`)**:
   Membagi `tableData` berdasarkan `pageSize` (`5`, `10`, `20`, atau `50` baris per halaman) dan memastikan halaman aktif (`safeCurrentPage`) tidak pernah melampaui `totalPages` saat filter berubah.

---

## 6. Logika Peta Heatmap Luar Negeri (`src/components/OverseasHeatmap.jsx`)

Komponen ini **hanya dirender ketika pengguna membuka tab `Luar Negeri`** (`activeCategory === "Luar Negeri"`).

### 6.1. Proyeksi Geografis ke Bidang SVG (`projectLatLng`)
Peta menggunakan sistem koordinat *equirectangular* berukuran `1000 x 500` unit SVG. Fungsi `projectLatLng(lat, lng)` memetakan derajat garis lintang (`lat` dari `-90` s/d `90`) dan garis bujur (`lng` dari `-180` s/d `180`) ke koordinat `(x, y)` menggunakan rumus:
$$x = \left(\frac{\text{lng} + 180}{360}\right) \times 1000, \quad y = \left(\frac{90 - \text{lat}}{180}\right) \times 500$$
Rumus yang sama digunakan untuk menggambar poligon benua/negara (`WORLD_LAND_POLYGONS`), garis lengkung jaringan dari HQ Jakarta ke masing-masing cabang, serta posisi titik cabang luar negeri.

### 6.2. Perhitungan Statistik & Warna Panas Cabang (`branchStats` & `getHeatColor`)
Untuk setiap cabang di `OVERSEAS_BRANCHES`, `branchStats` menghitung:
- Jumlah eksekusi `total`, `success`, `failed`, `errorRate` (%), dan `successRate` (%).
- Rincian eksekusi per `SCHEMA_NAME` di dalam cabang tersebut (`schemaList`).
- **Intensitas Heatmap (`intensity`)** berdasarkan mode yang dipilih pengguna (`heatMetric`):
  1. **Intensitas Error (`failed`)**: Rasio jumlah error cabang terhadap jumlah error tertinggi di antara seluruh cabang ($\text{failed} / \text{maxFailed}$).
  2. **Error Rate (`rate`)**: Persentase kegagalan cabang ($\text{errorRate} / 100$).
  3. **Volume Eksekusi (`total`)**: Rasio total eksekusi cabang terhadap total eksekusi tertinggi ($\text{total} / \text{maxTotal}$).
- **Level & Gradien Warna Panas (`getHeatColor`)**:
  - **Healthy / Low Heat** (Hijau `#87d068` $\rightarrow$ Cyan `#20a7c9`): Jika `failed === 0`.
  - **Elevated Warning** (Kuning `#facc15` $\rightarrow$ Oranye `#f97316`): Jika terdapat error dengan intensitas menengah.
  - **Critical Hotspot** (Merah `#ef4444` $\rightarrow$ Oranye `#f97316` $\rightarrow$ Kuning `#facc15`): Jika `failed >= 4` atau `errorRate >= 45%`.

### 6.3. Auto-Filter & Auto-Zoom Peta Ketika Cabang Dipilih
- **Auto-Filter Titik Peta (`visibleBranchesOnMap`)**:
  Saat pengguna memilih cabang tertentu (misalnya **Seoul - Korea Selatan**), `visibleBranchesOnMap` memfilter daftar cabang menggunakan `matchesBranchFilter`. Hasilnya, **hanya titik dan lapisan heatmap cabang Seoul yang ditampilkan di atas peta**, sedangkan cabang lainnya disembunyikan.
- **Auto-Zoom Wilayah (`VIEWBOX_PRESETS` & `currentViewBox`)**:
  Setiap cabang memiliki *bounding box* kamera (`VIEWBOX_PRESETS`) tersendiri. Saat `Seoul - Korea Selatan` dipilih, atribut `viewBox` pada `<svg>` otomatis bertransisi dari tampilan dunia (`w: 840, h: 360`) menuju area Semenanjung Korea/Seoul (`x: 816, y: 124, w: 72, h: 42`).
- **Sub-Node Heatmap Schema (`SUB_NODE_OFFSETS`)**:
  Ketika peta sedang di-zoom ke sebuah cabang, komponen juga menggambar titik-titik *sub-heatmap* untuk setiap database `SCHEMA_NAME` yang berjalan di cabang tersebut di sekeliling titik pusat kota, lengkap dengan garis penghubung dan label jumlah error per schema.

### 6.4. Logika Geser Peta dengan Mouse (*Drag to Pan*) & *Scroll Wheel Zoom*
Agar peta dapat digeser dan diperbesar menggunakan mouse:
1. **Mouse Drag Panning (`handleMouseDown`, `handleMouseMove`, `handleMouseUpOrLeave`)**:
   - Saat tombol kiri mouse ditekan (`onMouseDown`), posisi awal kursor (`clientX`, `clientY`) dan posisi pergeseran peta saat itu (`panOffset.x`, `panOffset.y`) disimpan ke `dragStartRef`.
   - Saat mouse digerakkan (`onMouseMove`), selisih piksel layar (`dxPixels`, `dyPixels`) dikonversi secara proporsional ke satuan *viewBox* SVG:
     $$\Delta x_{\text{svg}} = \text{dxPixels} \times \frac{\text{currentViewBox.w}}{\text{rect.width}}, \quad \Delta y_{\text{svg}} = \text{dyPixels} \times \frac{\text{currentViewBox.h}}{\text{rect.height}}$$
   - Jika pergeseran melebihi `3px`, penanda `dragStartRef.current.moved` diatur menjadi `true` agar saat mouse dilepas tidak memicu klik pemilihan cabang secara tidak sengaja.
   - Nilai `clampedX` dan `clampedY` menjaga agar kamera peta tidak bergeser keluar batas dunia.
2. **Mouse Wheel Zooming (`handleWheel`)**:
   - Menggunakan `addEventListener("wheel", handleWheel, { passive: false })` pada elemen `<svg>` agar ketika pengguna memutar roda *scroll* mouse di atas peta, halaman browser tidak ikut tergulung (`e.preventDefault()`), melainkan mengubah `zoomMultiplier` dalam rentang `0.7x` hingga `4.5x`.
3. **Reset View**:
   - Apabila peta telah digeser atau di-zoom (`isMapMoved`), tombol **Reset View** muncul secara otomatis untuk mengembalikan posisi kamera ke tengah (`panOffset = { x: 0, y: 0 }` dan `zoomMultiplier = 1`).
