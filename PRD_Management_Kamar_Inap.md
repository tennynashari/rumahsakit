# Product Requirements Document (PRD)
## Management Kamar Inap - Hospital Information System

**Versi:** 1.0  
**Tanggal:** 24 Februari 2026  
**Status:** Draft  
**Penulis:** Product Team

---

## 1. Executive Summary

### 1.1 Overview
Fitur Management Kamar Inap adalah modul untuk mengelola seluruh aspek kamar rawat inap di rumah sakit, termasuk master data kamar, penempatan pasien, monitoring okupansi, dan laporan utilisasi kamar.

### 1.2 Tujuan Bisnis
- Meningkatkan efisiensi pengelolaan kamar rawat inap
- Mempercepat proses penempatan pasien ke kamar
- Menyediakan visibilitas real-time status kamar
- Mengoptimalkan tingkat okupansi kamar
- Memudahkan pelaporan dan analisis utilisasi kamar

### 1.3 Target Users
- **Admin/Resepsionis**: Mengelola master data kamar dan assignment pasien
- **Perawat**: Melihat status kamar dan daftar pasien per kamar
- **Dokter**: Melihat informasi kamar pasien yang ditangani
- **Manajemen**: Melihat laporan dan analisis okupansi kamar

---

## 2. Problem Statement

### 2.1 Masalah yang Ingin Diselesaikan
1. Tidak ada sistem terpusat untuk mengelola data kamar inap
2. Sulitnya mengetahui ketersediaan kamar secara real-time
3. Proses manual dalam penempatan pasien ke kamar
4. Kesulitan tracking riwayat penempatan pasien
5. Tidak ada visibilitas untuk laporan okupansi dan revenue kamar

### 2.2 Impact Jika Tidak Diselesaikan
- Waktu tunggu pasien lebih lama
- Potensi kesalahan dalam penempatan pasien
- Kesulitan dalam perencanaan kapasitas
- Kehilangan revenue karena kamar tidak teroptimasi

---

## 3. User Stories

### 3.1 Admin/Resepsionis
```
As a receptionist,
I want to see all available rooms by type,
So that I can quickly assign a patient to an appropriate room.

As a receptionist,
I want to check-in a patient to a room,
So that the room occupancy is tracked properly.

As a receptionist,
I want to check-out a patient from a room,
So that the room becomes available for other patients.

As an admin,
I want to manage room master data,
So that all room information is up-to-date and accurate.
```

### 3.2 Perawat
```
As a nurse,
I want to view all patients in a specific room,
So that I can provide proper care to them.

As a nurse,
I want to see room status in my floor/ward,
So that I know which rooms need attention.
```

### 3.3 Manajemen
```
As a manager,
I want to view occupancy rate report,
So that I can make informed decisions about capacity planning.

As a manager,
I want to see revenue by room type,
So that I can analyze profitability of different room types.
```

---

## 4. Functional Requirements

### 4.1 Master Data Kamar (Room Master)

#### 4.1.1 CRUD Kamar
- **Create**: Tambah kamar baru dengan informasi lengkap
- **Read**: Lihat daftar semua kamar dengan filter dan pencarian
- **Update**: Edit informasi kamar (kecuali nomor kamar)
- **Delete**: Soft delete kamar yang sudah tidak digunakan

#### 4.1.2 Informasi Kamar
**Data yang harus disimpan:**
- Nomor Kamar (unique, required) - Contoh: "101", "A-201"
- Nama Kamar (optional) - Contoh: "VIP Suite A"
- Tipe Kamar (required) - Enum: VIP, KELAS_1, KELAS_2, KELAS_3, ICU, NICU, PICU, ISOLATION
- Lantai/Floor (required) - Integer
- Gedung/Building (optional) - String
- Kapasitas Tempat Tidur (required) - Integer (1-4 bed)
- Status Kamar (required) - Enum: AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING, RESERVED
- Harga per Hari (required) - Decimal
- Fasilitas (optional) - Array of String atau JSON
  - Contoh: ["AC", "TV", "Kamar Mandi Dalam", "Kulkas", "WiFi", "Telepon"]
- Deskripsi (optional) - Text
- Foto Kamar (optional) - Array of image URLs
- Aktif/Tidak Aktif (required) - Boolean
- Created At, Updated At, Deleted At (audit fields)

#### 4.1.3 Validasi
- Nomor kamar harus unik
- Kapasitas minimal 1 bed
- Harga tidak boleh negatif
- Tidak bisa delete kamar yang sedang occupied

### 4.2 Penempatan Pasien (Room Assignment)

#### 4.2.1 Check-in Pasien
**Proses:**
1. Pilih pasien dari master data pasien
2. Pilih kamar yang available
3. Input data:
   - Tanggal Check-in (default: sekarang)
   - Perkiraan Tanggal Check-out (optional)
   - Nomor Tempat Tidur (jika kamar multi-bed)
   - Diagnosa Awal (optional)
   - Dokter Penanggung Jawab (required)
   - Kelas Perawatan (jika berbeda dari tipe kamar)
   - Catatan Khusus (optional)
4. Sistem otomatis:
   - Update status kamar menjadi OCCUPIED
   - Create record di tabel room_occupancy
   - Generate nomor registrasi rawat inap
   - Trigger notifikasi ke perawat yang bertugas

**Validasi:**
- Pasien tidak boleh memiliki occupancy aktif lain
- Kamar harus AVAILABLE atau RESERVED
- Nomor bed tidak boleh duplikat dalam kamar yang sama
- Dokter harus memiliki role DOCTOR

#### 4.2.2 Check-out Pasien
**Proses:**
1. Pilih pasien yang sedang rawat inap
2. Input data:
   - Tanggal Check-out (default: sekarang)
   - Kondisi Pasien Saat Keluar - Enum: SEMBUH, MEMBAIK, RUJUK, MENINGGAL, APS (Atas Permintaan Sendiri)
   - Diagnosa Akhir (optional)
   - Catatan (optional)
3. Sistem otomatis:
   - Hitung total hari rawat inap
   - Hitung total biaya kamar (hari × harga per hari)
   - Update status kamar menjadi CLEANING
   - Update record occupancy (set checked_out_at)
   - Generate tagihan kamar (create billing entry)

**Validasi:**
- Tanggal check-out tidak boleh lebih awal dari check-in
- Harus ada occupancy aktif untuk pasien tersebut
- Billing harus sudah dibuat/diselesaikan (optional requirement)

#### 4.2.3 Transfer Kamar
**Proses:**
1. Pilih pasien yang sedang rawat inap
2. Pilih kamar tujuan yang available
3. Input:
   - Tanggal Transfer (default: sekarang)
   - Alasan Transfer (required)
   - Dokter yang menyetujui (required)
4. Sistem otomatis:
   - Update occupancy lama (set transferred_at)
   - Create occupancy baru di kamar tujuan
   - Update status kedua kamar
   - Log transfer history

**Validasi:**
- Kamar tujuan harus available
- Tidak boleh transfer ke kamar yang sama
- Harus ada persetujuan dokter

### 4.3 Monitoring & Dashboard

#### 4.3.1 Dashboard Kamar
**Metrics yang ditampilkan:**
- Total Kamar (per tipe)
- Kamar Tersedia (Available)
- Kamar Terisi (Occupied)
- Tingkat Okupansi (%) = (Occupied / (Total - Maintenance)) × 100
- Kamar Maintenance
- Kamar Cleaning
- Estimasi Revenue Hari Ini
- Grafik Okupansi 30 hari terakhir

#### 4.3.2 Floor Plan View (Optional - Future)
Visual representation kamar per lantai dengan color coding:
- Hijau: AVAILABLE
- Merah: OCCUPIED
- Kuning: RESERVED
- Abu-abu: MAINTENANCE
- Biru: CLEANING

#### 4.3.3 Daftar Pasien Rawat Inap
Tabel dengan informasi:
- Nomor RM Pasien
- Nama Pasien
- Nomor Kamar
- Tipe Kamar
- Tanggal Check-in
- Lama Rawat (hari)
- Dokter Penanggung Jawab
- Status
- Action (View Detail, Transfer, Check-out)

Filter:
- Tipe Kamar
- Lantai
- Dokter
- Status
- Rentang Tanggal

### 4.4 Laporan (Reports)

#### 4.4.1 Laporan Okupansi
**Parameter:**
- Periode (Tanggal Mulai - Tanggal Selesai)
- Tipe Kamar (optional)
- Lantai (optional)

**Output:**
- Tingkat Okupansi per Hari
- Rata-rata Lama Rawat (ALOS - Average Length of Stay)
- Bed Turnover Rate (BTO)
- Bed Occupancy Rate (BOR)
- Grafik trend okupansi
- Top 5 kamar paling sering digunakan

#### 4.4.2 Laporan Revenue Kamar
**Parameter:**
- Periode
- Tipe Kamar

**Output:**
- Total Revenue
- Revenue per Tipe Kamar
- Revenue per Lantai
- Perbandingan dengan periode sebelumnya
- Grafik revenue trend

#### 4.4.3 Laporan Pasien Rawat Inap
**Parameter:**
- Periode
- Status Keluar

**Output:**
- Total Pasien Rawat Inap
- Distribusi berdasarkan Kondisi Keluar
- Rata-rata Lama Rawat per Diagnosa
- Top Diagnosa
- Export ke Excel/PDF

---

## 5. Data Models

### 5.1 Table: rooms

```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(20) UNIQUE NOT NULL,
  room_name VARCHAR(100),
  room_type VARCHAR(20) NOT NULL,
  -- VIP, KELAS_1, KELAS_2, KELAS_3, ICU, NICU, PICU, ISOLATION
  floor INTEGER NOT NULL,
  building VARCHAR(50),
  bed_capacity INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  -- AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING, RESERVED
  price_per_day DECIMAL(12,2) NOT NULL,
  facilities JSONB,
  -- [{name: "AC", icon: "snowflake"}, {name: "TV", icon: "tv"}]
  description TEXT,
  images JSONB,
  -- ["url1.jpg", "url2.jpg"]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_rooms_floor ON rooms(floor);
```

### 5.2 Table: room_occupancies

```sql
CREATE TABLE room_occupancies (
  id SERIAL PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  -- Format: INP-YYYYMMDD-XXXX
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  bed_number INTEGER,
  -- Untuk kamar multi-bed
  doctor_id INTEGER NOT NULL REFERENCES users(id),
  -- Dokter penanggung jawab
  
  -- Check-in data
  checked_in_at TIMESTAMP NOT NULL DEFAULT NOW(),
  estimated_checkout_at TIMESTAMP,
  initial_diagnosis TEXT,
  care_class VARCHAR(20),
  -- Bisa berbeda dari room type
  
  -- Check-out data  
  checked_out_at TIMESTAMP,
  actual_days INTEGER,
  -- Calculated on checkout
  discharge_condition VARCHAR(20),
  -- SEMBUH, MEMBAIK, RUJUK, MENINGGAL, APS
  final_diagnosis TEXT,
  discharge_notes TEXT,
  
  -- Transfer data
  transferred_at TIMESTAMP,
  transfer_reason TEXT,
  transfer_approved_by INTEGER REFERENCES users(id),
  
  -- Financial
  total_room_cost DECIMAL(12,2),
  -- Calculated on checkout
  billing_id INTEGER REFERENCES billings(id),
  
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  -- ACTIVE, TRANSFERRED, CHECKED_OUT
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_occupancy_patient ON room_occupancies(patient_id);
CREATE INDEX idx_occupancy_room ON room_occupancies(room_id);
CREATE INDEX idx_occupancy_status ON room_occupancies(status);
CREATE INDEX idx_occupancy_checkin ON room_occupancies(checked_in_at);
```

### 5.3 Table: room_maintenance_logs (Optional)

```sql
CREATE TABLE room_maintenance_logs (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  maintenance_type VARCHAR(50) NOT NULL,
  -- CLEANING, REPAIR, INSPECTION, UPGRADE
  description TEXT,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  performed_by VARCHAR(100),
  status VARCHAR(20) DEFAULT 'IN_PROGRESS',
  -- IN_PROGRESS, COMPLETED, CANCELLED
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API Endpoints

### 6.1 Room Management

#### Get All Rooms
```
GET /api/rooms
Query params: ?type=VIP&floor=2&status=AVAILABLE&page=1&limit=20
Response: {
  rooms: [
    {
      id, roomNumber, roomName, roomType, floor, building,
      bedCapacity, status, pricePerDay, facilities, description,
      images, isActive, currentOccupancy, availableBeds
    }
  ],
  pagination: { total, page, limit, totalPages }
}
```

#### Get Room by ID
```
GET /api/rooms/:id
Response: { room: {...}, currentPatients: [...] }
```

#### Create Room
```
POST /api/rooms
Body: {
  roomNumber, roomName, roomType, floor, building,
  bedCapacity, pricePerDay, facilities, description, images
}
Response: { room: {...} }
```

#### Update Room
```
PUT /api/rooms/:id
Body: { roomName, status, pricePerDay, facilities, ... }
Response: { room: {...} }
```

#### Delete Room
```
DELETE /api/rooms/:id
Response: { message: "Room deleted successfully" }
```

### 6.2 Room Occupancy

#### Check-in Patient
```
POST /api/room-occupancies/check-in
Body: {
  patientId, roomId, bedNumber, doctorId,
  checkedInAt, estimatedCheckoutAt,
  initialDiagnosis, careClass, notes
}
Response: { occupancy: {...}, registrationNumber }
```

#### Check-out Patient
```
POST /api/room-occupancies/check-out/:id
Body: {
  checkedOutAt, dischargeCondition,
  finalDiagnosis, dischargeNotes
}
Response: { 
  occupancy: {...}, 
  totalDays, 
  totalRoomCost,
  billing: {...}
}
```

#### Transfer Patient
```
POST /api/room-occupancies/transfer/:id
Body: {
  newRoomId, bedNumber, transferReason,
  transferredAt, transferApprovedBy
}
Response: { oldOccupancy: {...}, newOccupancy: {...} }
```

#### Get Active Occupancies
```
GET /api/room-occupancies/active
Query: ?roomType=VIP&floor=2&doctorId=5
Response: { occupancies: [...] }
```

#### Get Occupancy History
```
GET /api/room-occupancies/history
Query: ?patientId=10&startDate=2026-01-01&endDate=2026-02-24
Response: { occupancies: [...] }
```

### 6.3 Dashboard & Reports

#### Get Dashboard Stats
```
GET /api/rooms/dashboard/stats
Response: {
  totalRooms, availableRooms, occupiedRooms,
  maintenanceRooms, cleaningRooms, occupancyRate,
  estimatedDailyRevenue, roomsByType: {...}
}
```

#### Get Occupancy Report
```
GET /api/reports/room-occupancy
Query: ?startDate=2026-01-01&endDate=2026-02-24&roomType=VIP
Response: {
  period: {...},
  occupancyRate, averageLOS, bedTurnoverRate,
  dailyOccupancy: [...],
  topRooms: [...]
}
```

#### Get Revenue Report
```
GET /api/reports/room-revenue
Query: ?startDate=2026-01-01&endDate=2026-02-24
Response: {
  totalRevenue, revenueByType: {...},
  revenueByFloor: {...}, trendData: [...]
}
```

---

## 7. UI/UX Design

### 7.1 Pages/Views

#### 7.1.1 Halaman Daftar Kamar (Rooms List)
**Route:** `/rooms`

**Layout:**
- Header dengan tombol "+ Tambah Kamar"
- Filter section:
  - Tipe Kamar (multi-select)
  - Lantai (dropdown)
  - Status (multi-select)
  - Search by nomor/nama kamar
- Tabs untuk view mode:
  - List View (default)
  - Card View
  - Floor Plan View (future)
- Table/Cards dengan columns:
  - Nomor Kamar
  - Nama Kamar
  - Tipe
  - Lantai
  - Kapasitas
  - Status (badge dengan warna)
  - Harga/Hari
  - Okupansi (2/4 beds)
  - Actions (View, Edit, Delete)
- Pagination

**Color Coding:**
- Available: Green badge
- Occupied: Red badge
- Reserved: Yellow badge
- Maintenance: Gray badge
- Cleaning: Blue badge

#### 7.1.2 Halaman Form Kamar (Room Form)
**Routes:** `/rooms/new`, `/rooms/:id/edit`

**Sections:**
1. Informasi Dasar
   - Nomor Kamar*
   - Nama Kamar
   - Tipe Kamar* (dropdown)
   - Lantai* (number)
   - Gedung
   - Kapasitas Tempat Tidur* (number)

2. Tarif & Status
   - Harga per Hari* (currency input)
   - Status (dropdown - hanya untuk edit)

3. Fasilitas
   - Checkbox list: AC, TV, Kamar Mandi Dalam, Kulkas, WiFi, dll
   - Input custom fasilitas

4. Detail Tambahan
   - Deskripsi (textarea)
   - Upload Foto Kamar (multiple images)

5. Buttons
   - Simpan
   - Batal

#### 7.1.3 Halaman Detail Kamar (Room Detail)
**Route:** `/rooms/:id`

**Sections:**
- Header dengan informasi kamar
- Foto kamar (carousel)
- Status & Availability badge
- Tabs:
  1. **Overview**
     - Semua informasi kamar
     - Current occupancy status
     - Fasilitas list
  2. **Pasien Saat Ini**
     - List pasien yang sedang menempati
     - Info: Nama, Nomor RM, Bed Number, Doctor, Check-in Date, Days
     - Action: Transfer, Check-out
  3. **Riwayat**
     - History occupancy
     - Table: Patient, Check-in, Check-out, Days, Discharge Condition
  4. **Maintenance Log** (optional)
     - History maintenance/cleaning

#### 7.1.4 Halaman Pasien Rawat Inap (Inpatient List)
**Route:** `/inpatients`

**Layout:**
- Header dengan filter
- Filter section:
  - Search (nama/nomor RM)
  - Tipe Kamar
  - Lantai
  - Dokter
  - Range tanggal check-in
- Summary cards:
  - Total Pasien Rawat Inap
  - Check-in Hari Ini
  - Estimasi Check-out Hari Ini
- Table dengan columns:
  - No. RM
  - Nama Pasien
  - No. Kamar
  - Tipe Kamar
  - Bed Number
  - Tanggal Check-in
  - Lama Rawat (hari)
  - Dokter
  - Actions (View, Transfer, Check-out)
- Pagination

#### 7.1.5 Form Check-in Pasien
**Route:** `/inpatients/check-in`

**Steps (Wizard atau Single Page):**

**Step 1: Pilih Pasien**
- Search & select dari master pasien
- Display: Foto, Nama, No. RM, Umur, Gender
- Button: Pilih

**Step 2: Pilih Kamar**
- Filter: Tipe, Lantai
- Card view kamar available
- Display per card: Nomor, Tipe, Lantai, Harga, Kapasitas, Fasilitas
- Button: Pilih Kamar

**Step 3: Detail Check-in**
- Info Pasien (read-only summary)
- Info Kamar & Harga (read-only summary)
- Form inputs:
  - Nomor Tempat Tidur* (jika multi-bed)
  - Dokter Penanggung Jawab* (dropdown)
  - Tanggal Check-in* (datetime)
  - Estimasi Check-out (date)
  - Diagnosa Awal (textarea)
  - Kelas Perawatan (dropdown)
  - Catatan (textarea)

**Step 4: Konfirmasi**
- Review semua data
- Ringkasan biaya estimasi
- Buttons: Konfirmasi Check-in, Kembali

#### 7.1.6 Form Check-out Pasien
**Modal atau Page:** `/inpatients/:id/check-out`

**Content:**
- Info Pasien & Kamar (read-only)
- Tanggal Check-in (read-only)
- Lama Rawat: X hari (calculated)
- Form inputs:
  - Tanggal Check-out* (datetime, default: now)
  - Kondisi Pasien Keluar* (dropdown)
  - Diagnosa Akhir (textarea)
  - Catatan (textarea)
- Ringkasan Biaya:
  - Biaya Kamar: Rp X × Y hari = Rp Z
  - (Biaya lain akan ditambahkan di billing)
- Checkbox: "Generate tagihan otomatis"
- Buttons: Check-out, Batal

#### 7.1.7 Form Transfer Kamar
**Modal:** `/inpatients/:id/transfer`

**Content:**
- Info Pasien & Kamar Saat Ini (read-only)
- Pilih Kamar Tujuan (dropdown/card selection - hanya available)
- Form inputs:
  - Nomor Bed di Kamar Baru (jika multi-bed)
  - Tanggal Transfer* (datetime, default: now)
  - Alasan Transfer* (textarea)
  - Dokter yang Menyetujui* (dropdown)
- Perbandingan Harga:
  - Kamar sebelumnya: Rp X/hari
  - Kamar baru: Rp Y/hari
  - Selisih: ±Rp Z/hari
- Buttons: Transfer, Batal

#### 7.1.8 Dashboard Kamar
**Route:** `/dashboard/rooms` atau section di main dashboard

**Layout:**
- Summary Cards Row 1:
  - Total Kamar
  - Kamar Tersedia
  - Kamar Terisi
  - Tingkat Okupansi (%)
- Summary Cards Row 2 (by Status):
  - Maintenance
  - Cleaning
  - Reserved
  - Estimasi Revenue Hari Ini
- Chart: Tingkat Okupansi 30 Hari Terakhir (line chart)
- Chart: Distribusi Pasien per Tipe Kamar (pie/donut chart)
- Table: Top 5 Kamar Paling Sering Digunakan
- Quick Actions:
  - Check-in Pasien Baru
  - Lihat Daftar Pasien Rawat Inap
  - Lihat Kamar Available
  - Lihat Laporan

#### 7.1.9 Halaman Laporan Okupansi
**Route:** `/reports/room-occupancy`

**Layout:**
- Filter Section:
  - Date Range Picker*
  - Tipe Kamar (multi-select)
  - Lantai (multi-select)
  - Button: Generate Report
- Export Buttons: PDF, Excel
- Summary Cards:
  - Tingkat Okupansi Rata-rata
  - ALOS (Average Length of Stay)
  - BOR (Bed Occupancy Rate)
  - BTO (Bed Turnover Rate)
- Chart: Okupansi Harian (line chart dengan trend)
- Table: Detail Okupansi per Tipe Kamar
  - Tipe Kamar
  - Total Kamar
  - Rata-rata Terisi
  - Okupansi %
  - Total Patient Days
- Table: Top 5 Kamar Paling Sering Digunakan
  - No. Kamar
  - Tipe
  - Jumlah Pasien
  - Total Hari
  - Okupansi %

#### 7.1.10 Halaman Laporan Revenue
**Route:** `/reports/room-revenue`

**Layout:**
- Filter Section (sama dengan okupansi)
- Export Buttons
- Summary Cards:
  - Total Revenue
  - Revenue Hari Ini
  - Average Revenue per Day
  - Growth vs Previous Period (%)
- Chart: Revenue Trend (bar chart per hari/minggu/bulan)
- Chart: Revenue by Room Type (pie chart)
- Table: Revenue per Tipe Kamar
  - Tipe Kamar
  - Jumlah Pasien
  - Total Hari
  - Revenue
  - % dari Total
- Table: Revenue per Lantai

### 7.2 Components yang Dibutuhkan

1. **RoomCard** - Card display untuk kamar dengan status badge
2. **RoomStatusBadge** - Badge dengan warna sesuai status
3. **RoomTypeIcon** - Icon untuk setiap tipe kamar
4. **OccupancyIndicator** - Visual indicator (2/4 beds)
5. **PatientSelector** - Searchable dropdown untuk pilih pasien
6. **RoomSelector** - Card/dropdown selector untuk pilih kamar
7. **DoctorSelector** - Dropdown untuk pilih dokter
8. **CheckInForm** - Multi-step form untuk check-in
9. **CheckOutModal** - Modal untuk check-out
10. **TransferModal** - Modal untuk transfer kamar
11. **OccupancyChart** - Chart untuk okupansi
12. **RevenueChart** - Chart untuk revenue
13. **RoomFloorPlan** - Visual floor plan (future)

---

## 8. Business Rules

### 8.1 Room Status Transitions
```
AVAILABLE → RESERVED → OCCUPIED → CLEANING → AVAILABLE
         ↓            ↓
    MAINTENANCE ←─────┘
```

**Rules:**
- Kamar MAINTENANCE tidak bisa di-book
- Kamar CLEANING otomatis dari check-out, harus diubah manual ke AVAILABLE
- Reserved hanya bisa dibuat maksimal 7 hari sebelum check-in

### 8.2 Pricing Rules
- Harga per hari dihitung berdasarkan check-in dan check-out
- Jika check-out < 12 siang = tidak dihitung hari itu
- Jika check-out ≥ 12 siang = dihitung 1 hari penuh
- Minimal charge: 1 hari

### 8.3 Bed Management (Multi-bed Rooms)
- Kamar dengan kapasitas > 1 harus track bed number untuk setiap pasien
- Bed number 1 sampai {bed_capacity}
- Tidak boleh double assignment di bed yang sama
- Status kamar AVAILABLE jika minimal ada 1 bed kosong
- Status kamar OCCUPIED jika semua bed terisi

### 8.4 Automatic Billing Integration
- Saat check-out, otomatis create billing entry dengan item "Kamar [Type] - X hari"
- Amount = price_per_day × actual_days
- Billing status = UNPAID
- Link billing_id ke room_occupancy record

### 8.5 Data Retention
- Occupancy records tidak boleh dihapus (audit trail)
- Room master data bisa soft delete jika tidak ada occupancy aktif
- History harus tersimpan minimal 5 tahun

---

## 9. Technical Specifications

### 9.1 Tech Stack (Existing)
- **Frontend**: React.js + Tailwind CSS + Vite
- **Backend**: Express.js + Prisma ORM
- **Database**: PostgreSQL
- **State Management**: React Context
- **HTTP Client**: Axios
- **UI Icons**: Lucide React
- **Notifications**: React Hot Toast
- **i18n**: react-i18next (Bahasa Indonesia & English)

### 9.2 New Dependencies (if needed)
- **Date Handling**: date-fns (untuk kalkulasi hari)
- **Charts**: recharts atau chart.js (untuk dashboard)
- **Image Upload**: multer (backend) + react-dropzone (frontend)
- **Export**: ExcelJS (untuk export Excel), jsPDF (untuk export PDF)

### 9.3 Database Migrations
```bash
# Create migration files
npx prisma migrate dev --name add_room_management

# Migration akan create:
# - rooms table
# - room_occupancies table  
# - room_maintenance_logs table (optional)
# - indexes
# - foreign keys
```

### 9.4 API Response Format (Standard)
```javascript
// Success
{
  success: true,
  data: {...},
  message: "Operation successful"
}

// Error
{
  success: false,
  error: "Error message",
  details: {...}
}

// List with pagination
{
  success: true,
  data: [...],
  pagination: {
    total: 100,
    page: 1,
    limit: 20,
    totalPages: 5
  }
}
```

### 9.5 Permission & Access Control
```javascript
// Room Management
- View Rooms: ALL_ROLES
- Create/Edit Room: ADMIN
- Delete Room: ADMIN

// Occupancy Management  
- View Occupancies: DOCTOR, NURSE, ADMIN
- Check-in Patient: ADMIN, NURSE
- Check-out Patient: ADMIN, NURSE, DOCTOR
- Transfer Patient: ADMIN, NURSE, DOCTOR (with approval)

// Reports
- View Reports: ADMIN, DOCTOR
- Export Reports: ADMIN
```

---

## 10. Acceptance Criteria

### 10.1 Room Management
- [ ] Admin dapat menambah kamar baru dengan semua field required terisi
- [ ] Admin dapat melihat daftar kamar dengan filter tipe, lantai, status
- [ ] Admin dapat mengedit informasi kamar kecuali nomor kamar
- [ ] Admin dapat mengubah status kamar
- [ ] System menolak duplikasi nomor kamar
- [ ] Admin tidak bisa delete kamar yang sedang occupied
- [ ] Fasilitas kamar dapat dikelola (add/remove items)

### 10.2 Check-in Process
- [ ] User dapat search dan memilih pasien dari master data
- [ ] User dapat melihat kamar available berdasarkan filter
- [ ] User dapat assign pasien ke kamar dan bed number
- [ ] System validasi: pasien tidak boleh punya occupancy aktif ganda
- [ ] System auto-update status kamar menjadi OCCUPIED
- [ ] System generate registration number unik (format: INP-YYYYMMDD-XXXX)
- [ ] Data check-in tersimpan lengkap dengan doctor, diagnosis, dll

### 10.3 Check-out Process
- [ ] User dapat check-out pasien rawat inap
- [ ] System auto-calculate total hari rawat
- [ ] System auto-calculate total biaya kamar
- [ ] System auto-generate billing entry
- [ ] System auto-update status kamar menjadi CLEANING
- [ ] Data discharge condition dan diagnosis final tersimpan
- [ ] User dapat melihat summary biaya sebelum confirm

### 10.4 Transfer Process
- [ ] User dapat transfer pasien ke kamar available lain
- [ ] System validasi kamar tujuan harus available
- [ ] System create new occupancy di kamar baru
- [ ] System close occupancy lama dengan status TRANSFERRED
- [ ] Transfer history dapat dilihat
- [ ] Alasan transfer wajib diisi

### 10.5 Dashboard & Monitoring
- [ ] Dashboard menampilkan real-time stats: total kamar, occupied, available, okupansi %
- [ ] User dapat melihat daftar semua pasien rawat inap dengan filter
- [ ] User dapat search pasien by nama atau nomor RM
- [ ] Chart okupansi 30 hari ditampilkan dengan benar
- [ ] Color coding status kamar konsisten di semua view

### 10.6 Reports
- [ ] User dapat generate laporan okupansi dengan date range
- [ ] Laporan menampilkan: okupansi rate, ALOS, BOR, BTO
- [ ] User dapat generate laporan revenue dengan date range
- [ ] User dapat export laporan ke PDF
- [ ] User dapat export laporan ke Excel
- [ ] Report generation < 5 detik untuk data 1 tahun

### 10.7 Multi-language Support
- [ ] Semua UI text tersedia dalam Bahasa Indonesia dan English
- [ ] Room type, status, discharge condition labels diterjemahkan
- [ ] Toast notifications dalam bahasa yang dipilih
- [ ] Reports dapat di-export dalam bahasa yang dipilih

### 10.8 Performance
- [ ] Room list page load < 2 detik untuk 100 kamar
- [ ] Check-in process complete < 1 detik
- [ ] Check-out process complete < 2 detik (including billing)
- [ ] Dashboard stats load < 1 detik
- [ ] Search pasien response < 1 detik

### 10.9 Data Validation
- [ ] Semua required fields wajib terisi
- [ ] Harga kamar tidak boleh negatif atau 0
- [ ] Kapasitas bed minimal 1
- [ ] Tanggal check-out tidak boleh sebelum check-in
- [ ] Bed number tidak boleh duplikat dalam 1 kamar
- [ ] Nomor kamar unik di seluruh sistem

---

## 11. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Prioritas: P0 (Must Have)**

**Backend:**
- [ ] Create database schema (Prisma models)
- [ ] Run migrations
- [ ] Create room master CRUD endpoints
- [ ] Create basic validation & error handling
- [ ] Seed sample room data

**Frontend:**
- [ ] Setup routing for new pages
- [ ] Create base layout for room management section
- [ ] Create RoomCard component
- [ ] Create RoomStatusBadge component
- [ ] Implement Room List page (basic view)
- [ ] Implement Room Form (create/edit)

**Testing:**
- [ ] Unit tests for room CRUD
- [ ] Integration tests for API endpoints

### Phase 2: Core Occupancy (Week 3-4)
**Prioritas: P0 (Must Have)**

**Backend:**
- [ ] Create occupancy endpoints (check-in, check-out)
- [ ] Implement business logic untuk status transitions
- [ ] Implement auto-calculation (days, cost)
- [ ] Integrate with billing module
- [ ] Create validation rules

**Frontend:**
- [ ] Implement Check-in form (multi-step)
- [ ] Implement Check-out modal
- [ ] Implement Inpatient List page
- [ ] Create PatientSelector component
- [ ] Create RoomSelector component
- [ ] Integrate with existing patient & user services

**Testing:**
- [ ] Test check-in flow end-to-end
- [ ] Test check-out flow + billing integration
- [ ] Test validation rules
- [ ] Edge case testing (same day check-in/out, etc)

### Phase 3: Advanced Features (Week 5)
**Prioritas: P1 (Should Have)**

**Backend:**
- [ ] Implement transfer patient endpoint
- [ ] Create dashboard stats endpoint
- [ ] Implement occupancy history endpoint
- [ ] Add pagination, sorting, filtering

**Frontend:**
- [ ] Implement Transfer modal
- [ ] Implement Room Detail page with tabs
- [ ] Implement occupancy history view
- [ ] Add advanced filters to list pages
- [ ] Implement multi-bed room management

**Testing:**
- [ ] Test transfer flow
- [ ] Test filter combinations
- [ ] Test multi-bed scenarios

### Phase 4: Dashboard & Monitoring (Week 6)
**Prioritas: P1 (Should Have)**

**Backend:**
- [ ] Create dashboard metrics calculation
- [ ] Optimize queries for performance
- [ ] Add caching for frequently accessed data

**Frontend:**
- [ ] Implement Room Dashboard page
- [ ] Create OccupancyChart component
- [ ] Create real-time status updates
- [ ] Implement notification system (optional)

**Testing:**
- [ ] Performance testing for dashboard
- [ ] Test with large dataset (1000+ rooms)

### Phase 5: Reports & Analytics (Week 7-8)
**Prioritas: P2 (Nice to Have)**

**Backend:**
- [ ] Create occupancy report endpoint
- [ ] Create revenue report endpoint
- [ ] Implement export to Excel logic
- [ ] Implement export to PDF logic
- [ ] Calculate KPIs (ALOS, BOR, BTO)

**Frontend:**
- [ ] Implement Occupancy Report page
- [ ] Implement Revenue Report page
- [ ] Create RevenueChart component
- [ ] Implement export functions
- [ ] Add date range picker

**Testing:**
- [ ] Test report calculations accuracy
- [ ] Test export file formats
- [ ] Test with various date ranges

### Phase 6: Polish & Optimization (Week 9)
**Prioritas: P2 (Nice to Have)**

**All:**
- [ ] Multi-language translation (ID/EN)
- [ ] Add loading states & skeleton screens
- [ ] Improve error messages
- [ ] Add helpful tooltips & guides
- [ ] Optimize images & assets
- [ ] Code refactoring & cleanup
- [ ] Documentation update

**Testing:**
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit
- [ ] User acceptance testing (UAT)

### Phase 7: Future Enhancements (Backlog)
**Prioritas: P3 (Future)**

- [ ] Floor Plan visualization
- [ ] Room reservation system
- [ ] Housekeeping integration
- [ ] Maintenance scheduling
- [ ] Patient preferences tracking
- [ ] Auto-assignment algorithm (suggest best room)
- [ ] Mobile app version
- [ ] Real-time notifications (WebSocket)
- [ ] Integration with admission system
- [ ] QR code for room identification

---

## 12. Success Metrics (KPIs)

### 12.1 Operational Efficiency
- **Target:** Reduce check-in time by 50% (from 10 min to 5 min)
- **Target:** Reduce room assignment errors to 0%
- **Target:** Increase bed occupancy rate by 15%

### 12.2 System Performance
- **Target:** Page load time < 2 seconds for all pages
- **Target:** 99.9% uptime
- **Target:** Support 100+ concurrent users

### 12.3 User Adoption
- **Target:** 90% staff adoption within first month
- **Target:** < 5% error rate in data entry
- **Target:** User satisfaction score > 4/5

### 12.4 Business Impact
- **Target:** Increase room revenue visibility by 100%
- **Target:** Reduce manual reporting time by 80%
- **Target:** Improve bed turnover rate by 20%

---

## 13. Risks & Mitigation

### 13.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database performance with large occupancy history | High | Implement indexing, archiving old data, pagination |
| Complex business logic errors | High | Thorough unit testing, code review |
| Integration issues with billing module | Medium | Mock billing service during development, integration tests |
| Concurrent room assignment | Medium | Implement database locking, transaction management |

### 13.2 User Adoption Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Staff resistance to new system | High | Training sessions, user-friendly UI, gradual rollout |
| Data migration from old system | Medium | Plan migration carefully, validate data |
| Learning curve | Medium | Provide documentation, tooltips, onboarding guide |

### 13.3 Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Inaccurate reporting affects decisions | High | Validate calculations with existing data, QA testing |
| System downtime during critical hours | High | Deploy during low-traffic hours, have rollback plan |
| Lost revenue due to bugs | Medium | Extensive testing, staged rollout, monitoring |

---

## 14. Testing Strategy

### 14.1 Unit Testing
- Test all business logic functions (calculate days, cost, etc)
- Test validation rules
- Test API controllers
- Coverage target: > 80%

### 14.2 Integration Testing
- Test API endpoints with real database
- Test billing integration
- Test patient service integration
- Test multi-step flows (check-in to check-out)

### 14.3 End-to-End Testing
- Test complete user journeys:
  - Admin manages rooms
  - Nurse checks in patient
  - Doctor views patient info
  - Nurse checks out patient
  - Admin generates reports

### 14.4 Performance Testing
- Load testing with 1000 rooms, 10,000 occupancy records
- Concurrent user testing (100 users)
- Report generation speed testing
- Database query optimization

### 14.5 User Acceptance Testing (UAT)
- Test with actual hospital staff
- Collect feedback on UI/UX
- Validate business logic matches real workflows
- Iterate based on feedback

---

## 15. Documentation Requirements

### 15.1 Technical Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema diagram (ERD)
- [ ] Architecture diagram
- [ ] Deployment guide
- [ ] Environment setup guide

### 15.2 User Documentation
- [ ] User manual (Bahasa Indonesia & English)
- [ ] Video tutorials (check-in, check-out, transfer)
- [ ] FAQ document
- [ ] Troubleshooting guide
- [ ] Quick reference card

### 15.3 Developer Documentation
- [ ] Code commenting standards
- [ ] Component documentation
- [ ] Testing guide
- [ ] Contributing guidelines
- [ ] Changelog

---

## 16. Deployment Plan

### 16.1 Environment Strategy
1. **Development** - Local development
2. **Staging** - Pre-production testing
3. **Production** - Live system

### 16.2 Deployment Steps
1. Database migration (run Prisma migrate)
2. Deploy backend API
3. Deploy frontend build
4. Smoke testing
5. Monitor logs for errors
6. Gradual rollout (10% → 50% → 100%)

### 16.3 Rollback Plan
- Keep previous version ready
- Database migration rollback script
- Monitoring alerts for errors
- Quick rollback procedure documented

### 16.4 Post-Deployment
- Monitor error logs for 48 hours
- Collect user feedback
- Hot-fix critical bugs immediately
- Schedule iteration based on feedback

---

## 17. Training & Onboarding

### 17.1 Training Materials
- Video tutorial (5-10 menit per fitur)
- Step-by-step guide with screenshots
- Interactive demo environment
- FAQ & troubleshooting sheet

### 17.2 Training Sessions
- **Session 1** (Admin): Room management & configuration
- **Session 2** (Nurse/Reception): Check-in & check-out process
- **Session 3** (Doctor): Viewing patient & room info
- **Session 4** (Management): Dashboard & reports

### 17.3 Support Plan
- Dedicated support person for first 2 weeks
- Helpdesk ticketing system
- Response time: < 4 hours for critical issues
- Weekly feedback collection

---

## 18. Maintenance & Support

### 18.1 Ongoing Maintenance
- Regular database backup (daily)
- Performance monitoring
- Security updates
- Bug fixes based on priority
- Feature enhancements from user feedback

### 18.2 SLA (Service Level Agreement)
- **Uptime:** 99.9%
- **Response Time:** 
  - Critical: < 1 hour
  - High: < 4 hours
  - Medium: < 24 hours
  - Low: < 1 week
- **Data Backup:** Daily, retained for 30 days

---

## 19. Cost Estimation (Development)

### 19.1 Development Time (Developer Hours)
- Phase 1 (Foundation): 60 hours
- Phase 2 (Core Occupancy): 80 hours
- Phase 3 (Advanced Features): 40 hours
- Phase 4 (Dashboard): 40 hours
- Phase 5 (Reports): 60 hours
- Phase 6 (Polish): 40 hours
- **Total:** ~320 hours (8 weeks × 40 hours/week)

### 19.2 Additional Costs (Optional)
- UI/UX Design: 20-40 hours
- QA Testing: 40 hours
- Technical Writing: 20 hours
- Training preparation: 16 hours

---

## 20. Appendix

### 20.1 Glossary

| Term | Definition |
|------|------------|
| ALOS | Average Length of Stay - rata-rata lama rawat pasien |
| BOR | Bed Occupancy Rate - persentase hunian tempat tidur |
| BTO | Bed Turnover Rate - tingkat pergantian pasien per tempat tidur |
| Okupansi | Tingkat penggunaan kamar (occupied/total) |
| Check-in | Proses masuk pasien ke kamar rawat inap |
| Check-out | Proses keluar pasien dari kamar rawat inap |
| Room Assignment | Penempatan pasien ke kamar tertentu |
| Transfer | Pemindahan pasien dari satu kamar ke kamar lain |
| Discharge | Pasien keluar dari rumah sakit |
| Maintenance | Kamar sedang dalam perbaikan/perawatan |

### 20.2 References
- Hospital Management Best Practices
- Healthcare IT Standards (HL7, FHIR)
- Indonesian Hospital Regulations
- Existing system documentation

### 20.3 Change Log
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-24 | Initial PRD creation | Product Team |

---

## 21. Approval & Sign-off

### 21.1 Stakeholders
- [ ] Product Manager
- [ ] Technical Lead
- [ ] UX Designer
- [ ] Hospital Management
- [ ] Development Team

### 21.2 Next Steps
1. Review PRD dengan tim
2. Refine requirements berdasarkan feedback
3. Create technical design document
4. Setup project board & tasks
5. Start Phase 1 development

---

**Document Status:** DRAFT - Pending Review & Approval

**Contact:** Product Team | Email: product@rumahsakit.com

---

*End of PRD - Management Kamar Inap*
