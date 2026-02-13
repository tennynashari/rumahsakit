# Perbandingan Deployment: User yang Sama vs User Berbeda

## Situasi Anda
- ✅ Sudah ada aplikasi CRM dengan user `crm`
- ✅ PostgreSQL sudah terinstall (global)
- ✅ Node.js sudah terinstall (global)
- ✅ Nginx sudah terinstall (global)
- ✅ PM2 sudah terinstall (global)

## Opsi A: Pakai User yang Sama (crm)

### ✅ Kelebihan
- Setup sangat cepat (5-10 menit)
- Tidak perlu konfigurasi user baru
- Tidak perlu setup SSH key baru
- Management lebih simple (satu user)
- Deploy dan update lebih mudah

### ❌ Kekurangan
- Kurang isolated antara aplikasi
- Jika user `crm` di-hack, semua aplikasi kena
- File permissions shared
- Lebih sulit audit (siapa yang akses apa)

### 📋 Struktur Directory
```
/home/crm/
├── apps/
│   ├── crm/              # Aplikasi existing
│   │   ├── frontend/
│   │   └── backend/
│   └── rumahsakit/       # Aplikasi hospital (baru)
│       ├── frontend/
│       └── backend/
```

### 🔧 PM2 Apps (user crm)
```bash
pm2 list
┌─────┬───────────────────┬─────────────┬──────────┐
│ id  │ name              │ mode        │ status   │
├─────┼───────────────────┼─────────────┼──────────┤
│ 0   │ crm-backend       │ fork        │ online   │
│ 1   │ hospital-backend  │ fork        │ online   │ ← BARU
└─────┴───────────────────┴─────────────┴──────────┘
```

### 🚀 Kapan Pakai Opsi Ini?
- Development/staging environment
- Internal tools (tidak public-facing)
- Aplikasi dengan security requirements sama
- Team kecil dengan trust penuh

---

## Opsi B: Buat User Baru (hospital)

### ✅ Kelebihan
- **Isolasi lebih baik** - apps terpisah sepenuhnya
- **Security lebih tinggi** - jika satu compromised, yang lain aman
- **Permission granular** - bisa set akses per aplikasi
- **Audit trail jelas** - tahu siapa yang akses apa
- **Production best practice** - standar industry

### ❌ Kekurangan
- Setup sedikit lebih lama (15-20 menit)
- Perlu manage SSH keys untuk 2 users
- Perlu switch user untuk management
- Sedikit lebih kompleks (tapi worth it!)

### 📋 Struktur Directory
```
/home/crm/
└── apps/
    └── crm/              # Aplikasi CRM
        ├── frontend/
        └── backend/

/home/hospital/
└── apps/
    └── rumahsakit/       # Aplikasi hospital
        ├── frontend/
        └── backend/
```

### 🔧 PM2 Apps (terpisah per user)
```bash
# User: crm
su - crm
pm2 list
┌─────┬───────────────┬─────────────┬──────────┐
│ id  │ name          │ mode        │ status   │
├─────┼───────────────┼─────────────┼──────────┤
│ 0   │ crm-backend   │ fork        │ online   │
└─────┴───────────────┴─────────────┴──────────┘

# User: hospital
su - hospital
pm2 list
┌─────┬───────────────────┬─────────────┬──────────┐
│ id  │ name              │ mode        │ status   │
├─────┼───────────────────┼─────────────┼──────────┤
│ 0   │ hospital-backend  │ fork        │ online   │
└─────┴───────────────────┴─────────────┴──────────┘
```

### 🚀 Kapan Pakai Opsi Ini?
- **Production environment** ✅ RECOMMENDED
- Public-facing applications
- Sensitive data (medical records, financial)
- Different teams managing different apps
- Compliance requirements (HIPAA, GDPR, etc.)

---

## Perbandingan Quick Reference

| Aspek | User Sama (crm) | User Baru (hospital) |
|-------|-----------------|----------------------|
| **Security** | ⚠️ Medium | ✅ High |
| **Isolasi** | ⚠️ Shared | ✅ Full isolation |
| **Setup Time** | ✅ 5-10 min | ⚠️ 15-20 min |
| **Management** | ✅ Simple | ⚠️ Moderate |
| **Production Ready** | ⚠️ OK | ✅ Best practice |
| **Audit Trail** | ⚠️ Mixed | ✅ Clear |
| **Risk if Hacked** | ❌ All apps | ✅ One app only |

---

## Yang TIDAK Terpengaruh Pilihan User

✅ **Node.js** - Terinstall global, bisa dipakai semua user
✅ **PostgreSQL** - Database server global, akses via network/socket
✅ **Nginx** - Web server global, serve untuk semua user
✅ **PM2** - Terinstall global, tapi state per-user (terpisah)

**Database PostgreSQL:**
```sql
-- User PostgreSQL TERPISAH dari user Linux
-- Bisa diakses dari user manapun
User Linux: crm      → Connect to → PostgreSQL user: crm_db
User Linux: hospital → Connect to → PostgreSQL user: rumahsakit
```

**Backend Ports:**
```
User crm     → Backend port 3000 (CRM)
User hospital → Backend port 5000 (Hospital)
# Port berbeda = tidak conflict
```

---

## Rekomendasi Saya

### Untuk Production (Public) → **Opsi B (User Baru)**
Karena aplikasi hospital mengandung data sensitif (medical records), saya strong recommend pakai user terpisah untuk security dan compliance.

### Untuk Development/Testing → **Opsi A (User Sama)**
Jika hanya untuk testing atau internal tools, pakai user yang sama untuk simplicity.

---

## Setup Commands Comparison

### Opsi A: User Sama (crm)
```bash
# 1. Login sebagai crm
su - crm

# 2. Buat directory
mkdir -p ~/apps/rumahsakit
cd ~/apps/rumahsakit

# 3. Upload aplikasi & deploy
# (ikuti DEPLOYMENT_UBUNTU.md)
```

### Opsi B: User Baru (hospital)
```bash
# 1. Buat user baru
sudo adduser hospital
sudo usermod -aG sudo hospital  # Optional: jika butuh sudo

# 2. Setup SSH key (optional)
# Copy authorized_keys dari user crm atau setup baru

# 3. Login sebagai hospital
su - hospital

# 4. Buat directory
mkdir -p ~/apps/rumahsakit
cd ~/apps/rumahsakit

# 5. Upload aplikasi & deploy
# (ikuti DEPLOYMENT_UBUNTU.md)
```

---

## FAQ

### Q: Apakah perlu install Node.js lagi untuk user baru?
**A:** TIDAK! Node.js yang sudah terinstall bisa dipakai semua user.

### Q: Apakah perlu install PostgreSQL lagi?
**A:** TIDAK! PostgreSQL adalah database server global.

### Q: Apakah PM2 apps akan conflict?
**A:** TIDAK! PM2 state adalah per-user, tidak akan conflict.

### Q: Apakah Nginx bisa serve dari 2 user berbeda?
**A:** YA! Tinggal set path di config: `/home/crm/...` dan `/home/hospital/...`

### Q: Backend port harus beda kan?
**A:** YA! Pastikan setiap backend pakai port berbeda (misal: 3000, 5000, 8080).

### Q: Database PostgreSQL harus beda?
**A:** Best practice: YA. Buat database terpisah untuk setiap aplikasi.
```sql
-- CRM
CREATE DATABASE crm;
CREATE USER crm_user WITH PASSWORD 'xxx';

-- Hospital
CREATE DATABASE rumahsakit;
CREATE USER rumahsakit WITH PASSWORD 'yyy';
```

---

## Kesimpulan

**Pilih berdasarkan prioritas:**
- 🔐 **Prioritas Security** → User Baru (hospital)
- ⚡ **Prioritas Speed** → User Sama (crm)
- 🏥 **Aplikasi Hospital** → User Baru (RECOMMENDED untuk medical data)

Kedua opsi valid dan akan bekerja dengan baik!
