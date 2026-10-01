# Referensi TA Kakak Kelas untuk Rencana Topik Mandiri

**Sumber data:** `src/data/data_ta_filter_500.json`
**Jumlah entri:** 1001 baris · **Judul unik:** 422
**Tanggal analisis:** 2 Oktober 2026

---

## Rencana Topik yang Dicandidatekan

| # | Topik | Fokus Kajian |
|---|---|---|
| 1 | Koordinasi Multi-Robot & Manajemen Lalu Lintas Terdistribusi | Algoritma & arsitektur komunikasi terpusat: routing jalur, task allocation, collision avoidance pada banyak unit robot sekaligus |
| 2 | Pengelolaan Aliran Data Sensor Skala Masif (IoT/Robotics) | Strategi data ingestion, data pipeline, dan manajemen penyimpanan untuk telemetry berfrekuensi tinggi secara real-time |
| 3 | Strategi Distribusi Pembaruan Perangkat Lunak Jarak Jauh (OTA) | Patch, update kode, dan migrasi konfigurasi ke banyak perangkat lapangan dengan zero-downtime deployment + rollback otomatis |

---

## Catatan Penting (Temuan Kritis)

**Tidak ada satu pun TA kakak kelas yang membahas multi-robot/fleet management maupun OTA update secara literal.**

- **Topik 2** memiliki preseden paling kuat dan paling aman untuk dijadikan rumusan masalah utama.
- **Topik 1** dan **Topik 3** tidak punya padanan langsung, sehingga harus diposisikan sebagai *studi analogue*.

Justru kondisi ini dapat menjadi **keunggulan proposal**: gap penelitian yang jelas dari penelitian terdahulu = nilai novelty yang mudah dipertahankan saat sidang.

---

## 5 Rekomendasi Utama

### 1. Pemanfaatan Apache Kafka dan Spark Structured Streaming dalam Monitoring Jaringan — untuk **Topik 2**

| Atribut | Detail |
|---|---|
| Nama | Febrianto Kudadiri |
| NIM | 221113626 |
| Jalur | Skripsi |
| Status | Selesai |
| Judul Inggris | *Utilizing Apache Kafka and Spark Structured Streaming in Network Monitoring: A Case Study of DDoS Attack Detection* |

**Relevansi:** Padanan arsitektural paling dekat dengan yang Anda usulkan. Kafka = *message broker* untuk ingestion telemetry robot; Spark Structured Streaming = *pipeline* pemrosesan real-time. Keduanya identik dengan kebutuhan "menelan data sensor berfrekuensi tinggi tanpa bottleneck".

**Yang bisa diambil:**
- Metodologi benchmarking throughput
- Uji beban (*load testing*) dan pengukuran Admission Control
- Pola *backpressure* dan *queue handling*

**Adaptasi:** Judul DDoS-nya dapat diubah menjadi skenario *anomaly / collision detection* pada data sensor robot.

---

### 2. Penerapan Algoritma Concurrency Control untuk Mencegah Race Condition pada Aplikasi Lelang Online — untuk **Topik 1**

| Atribut | Detail |
|---|---|
| Nama | Christian Tiovanto |
| NIM | 221111153 |
| Jalur | Skripsi |
| Status | Selesai |
| Judul Inggris | *Implementation of a Concurrency Control Algorithm to Prevent Race Conditions in Online Auction Applications* |

**Relevansi:** Menyentuh secara langsung concerns inti Topik 1 secara teoretis — *mutual exclusion*, *lock*, dan *deadlock*. Dalam konteks robot:
- *Race condition* = dua robot memesan jalur/slot yang sama
- *Deadlock* = Robot A mengunci resource yang sedang dipegang Robot B

**Bonus:** Landasan teori *concurrency control* sudah memiliki precedent di kampus ini, sehingga penguji tidak akan menganggap topik ini terlalu teoritis.

---

### 3. Rancang Bangun Sistem Smart Parking Berbasis Mobile menggunakan Mikrokontroler ESP32 — untuk **Topik 1**

| Atribut | Detail |
|---|---|
| Nama | Ardi Saputra |
| NIM | 201111952 |
| Jalur | Skripsi |
| Status | Selesai |
| Judul Inggris | *Design and Construction of Mobile-Based Smart Parking System using ESP32 Microcontroller* |

**Relevansi:** Skenario *fleet* paling dekat di dalam dataset. Banyak "unit" (kendaraan) beroperasi di satu area terbatas, harus **alokasi slot eksklusif** tanpa saling tabrakan, dengan **ESP32 sebagai unit kontrol robot** — persis analog dengan robot pada riset Anda.

**Justifikasi yang bisa dipakai:**
> *"Studi analog dengan domain IoT/robotik sudah pernah dilakukan di kampus ini, namun belum menangani perilaku multi-agent dinamis serta potensi deadlock pada sistem terpusat."*

---

### 4. Pengembangan Aplikasi Penentuan Rute Terdekat dalam Pengantaran Paket menggunakan Algoritma A* (A-star) — untuk **Topik 1**

| Atribut | Detail |
|---|---|
| Nama | Alfons Dermawan Er. Laia |
| NIM | 201111454 |
| Jalur | Skripsi |
| Status | Selesai |
| Judul Inggris | *Development of a Web and Mobile-Based Application for Determining the Nearest Route in Package Delivery using the A* (A-star) Algorithm* |

**Relevansi:** Ini adalah *fleet routing* level-1 — algoritma *path finding* untuk armada pengantar paket. Relevan dengan sisi "algoritma mengatur jalur" pada Topik 1.

**Pembeda yang harus ditegaskan:** A* bersifat *single-agent* dan *stateless*, sedangkan yang Anda kaji adalah *multi-agent* dengan *stateful coordination* + *collision avoidance*. Pembeda akademiknya jelas dan mudah dipertahankan saat sidang.

---

### 5. Pengembangan Sistem Monitor dan Laporan Mesin Secara Otomatis menggunakan Amazon Web Services — untuk **Topik 2 & 3**

| Atribut | Detail |
|---|---|
| Nama | Bryan Herberth Tambela |
| NIM | 181112442 |
| Jalur | Skripsi |
| Status | Selesai |
| Judul Inggris | *Development of Automatic Machine Monitoring and Report System using Amazon Web Services based on Mobile and Web (Study Case: PT. Numalos Abadi)* |

**Relevansi:** Satu-satunya TA di dataset yang menyentuh **pengiriman laporan dari perangkat lapangan ke cloud**. Untuk **Topik 3**, ini paling dekat secara konseptual dengan *device-to-cloud reporting* — fondasi OTA ada di sini (*telemetry uplink*, cloud, mobile/web monitoring).

**Cara mengikuti:**
1. Ikuti pipeline AWS-nya: `AWS IoT Core → Message Broker → Lambda/Rule → Database`
2. Sisipkan modul *OTA orchestration* pada simpul tersebut: *device registry*, *rollout percentage*, *canary release*, *rollback trigger*

---

## Cadangan / Alternatif (Pendukung)

| Judul | Nama (NIM) | Cocok untuk | Alasan |
|---|---|---|---|
| Pengembangan Sistem Deteksi Kendaraan YOLOV8 untuk Analisis Kepadatan Lalu Lintas | Muhammad Aulia Kahfi (211112562) | Topik 1 | *Perception layer* sensor kamera untuk deteksi kepadatan & antrian |
| Analisis dan Implementasi Load Balancing Menggunakan Mikrotik untuk Meningkatkan Kinerja Jaringan | Vreddy Togatorop (191111894) | Topik 2 | Pengujian batas throughput & skalabilitas jaringan |
| Pengembangan Aplikasi Point of Sales dengan Arsitektur Microservices dan Protokol RPC | Louis Aldorio Efendi (181112469) | Topik 2 & 3 | Arsitektur *service decomposition* untuk sistem terdistribusi |
| Digitalisasi Perekaman dan Pelaporan Kadar Air Jagung berbasis IoT | Seiko Santana (181112311) | Topik 2 | Protokol ingestion data sensor sederhana |
| Smart Bin berbasis IoT dengan Sensor Bau, Berat dan Tinggi | Abraham Bulyan Zebua (181114028) | Topik 2 | Multi-sensor pada satu node IoT |
| Sistem Informasi Antrian Rawat Jalan dengan Metode FIFO | Wisdom Bernadeth Manurung (181112639) | Topik 1 | *Scheduling policy* (FIFO) sebagai analog *task allocation* |
| Pengembangan Website Marketplace dengan Algoritma Dijkstra | Nicholas Chandra (211112137) | Topik 1 | Algoritma routing/graph terpendek |

---

## Analisis Gap: Topik 3 (OTA)

**Tidak ada referensi precedent di kampus untuk OTA / zero-downtime deployment.**

Ini bisa menjadi **peluang** atau **risiko**, tergantung penanganan:

### Penanganan yang disarankan

**Angle naratif (keunggulan):**
> *"Sejumlah penelitian terdahulu di [nama kampus] berfokus pada [Kafka / IoT monitoring / load balancing], namun belum ada yang menghadapi masalah distribusi pembaruan jarak jauh (*over-the-air update*) pada sistem perangkat terdistribusi."*

Ini menjawab pertanyaan *"apa yang sudah diteliti sebelumnya"* sekaligus memberi Anda **novelty yang eksplisit**.

**Mitigasi risiko:**
- Jadikan **Rekomendasi #5 (AWS)** sebagai fondasi pipeline.
- Tambahkan referensi eksternal wajib dari IEEE/ACM, misalnya topik: *canary release*, *OTA rollback*, *fleet learning*, *SWUpdate*, *zero-downtime deployment*.
- **Jangan mengandalkan referensi lokal saja** untuk justifikasi Topik 3.

---

## Rekomendasi Strategi Akhir

| Peran | Topik | Alasan |
|---|---|---|
| **Rumusan Masalah Utama** | Topik 2 | Preseden kuat, metode jelas, hasil terukur |
| **Studi Penduka / Bab Pendukung** | Topik 1 | Preseden parsial (routing + concurrency + IoT kontrol), dapat dipadukan |
| **Implementasi Lanjutan / Future Work** | Topik 3 | Preseden lemah, risiko tinggi bila dijadikan klaim utama |

### Langkah berikutnya yang disarankan
1. Kunci **Topik 2** sebagai inti proposal.
2. Gunakan Rekomendasi #1 (Kafka/Spark) dan #5 (AWS) sebagai dua pilar referensi teknis.
3. Lengkapi dengan #2 (Concurrency Control) untuk reinforce teori pada Topik 1.
4. Tuliskan argumen gap pada latar belakang — ini yang akan membedakan TA Anda dari 422 judul yang sudah ada.

---

*Dokumen ini dibuat berdasarkan hasil analisis keyword terhadap `src/data/data_ta_filter_500.json`.*
