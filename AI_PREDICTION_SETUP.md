# AI Prediction Feature - Setup Guide

## ✅ Implementation Complete!

Fitur AI Prediction sudah berhasil diimplementasikan dengan:
- ✅ Python ML Service (Flask port 5030)
- ✅ Backend Express API routes
- ✅ Frontend Dashboard UI dengan charts
- ✅ Dummy data historical (50-100 records, 6 bulan)
- ✅ Multi-language support (EN/ID)
- ✅ Mobile responsive

---

## 🚀 Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

> Axios sudah ditambahkan ke dependencies untuk komunikasi dengan ML service.

### 2. Setup Python ML Service

#### a. Create Virtual Environment
```bash
cd backend/ml_service
python -m venv venv
```

#### b. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### c. Install Python Dependencies
```bash
pip install -r requirements.txt
```

> **Note:** Prophet installation might take a few minutes as it needs to compile some components.

### 3. Seed Database with Historical Data

```bash
cd backend
npm run db:seed
```

> This will generate 50-100 historical visits and room occupancies from the last 6 months for AI training.

### 4. Start Services

#### a. Start Python ML Service (Terminal 1)
```bash
cd backend/ml_service
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
python app.py
```

> ML Service will run on **http://localhost:5030**

#### b. Start Backend API (Terminal 2)
```bash
cd backend
npm run dev
```

> Backend will run on **http://localhost:5000**

#### c. Start Frontend (Terminal 3)
```bash
cd frontend
npm run dev
```

> Frontend will run on **http://localhost:3000**

---

## 📊 How to Use

1. **Login** to Dashboard dengan credentials:
   - Email: `admin@klinik.com`
   - Password: `admin123`

2. **Scroll ke AI Prediction section** di Dashboard (paling bawah)

3. **Click "Fetch & Train"** button:
   - Fetches historical data dari database
   - Trains Prophet models untuk setiap visit type
   - Trains room type analysis models
   - Tunggu hingga muncul success message

4. **Click "Predict"** button:
   - Generates predictions untuk 7 hari ke depan
   - Menampilkan Top 3 visit types per day
   - Menampilkan Top 3 room types per day
   - Shows interactive Line Chart untuk visits
   - Shows Bar Chart untuk rooms

---

## 🎯 Features

### Top 3 Visit Types Prediction
- **Line Chart**: Shows trend prediksi untuk top 3 visit types
- **Mobile Table**: Compact view untuk mobile devices
- **Daily Rankings**: Setiap hari menampilkan top 3 visit types dengan nilai prediksi

Example output:
```
2026-03-11:
  1. General Checkup: 2.1
  2. Inpatient: 1.5
  3. Medical Action: 1.2
```

### Top 3 Room Types Prediction
- **Bar Chart**: Comparative view untuk room types
- **Mobile Table**: Easy-to-read pada small screens
- **Daily Rankings**: Top 3 room types per day

Example output:
```
2026-03-11:
  1. VIP: 2.1
  2. Kelas 1: 1.8
  3. ICU: 1.3
```

### Multi-Language Support
- 🇬🇧 **English**: Full translations
- 🇮🇩 **Indonesia**: Full translations
- Switch language via Navbar dropdown

### Mobile Responsive
- ✅ Cards layout pada mobile devices
- ✅ Responsive charts dengan proper sizing
- ✅ Touch-friendly buttons
- ✅ Horizontal scroll tables untuk detail view

---

## 🔧 Technical Details

### ML Models Used
- **Prophet** (Facebook): Time series forecasting untuk visit types
- **Frequency Analysis**: Statistical analysis untuk room types
- **Models Storage**: `backend/ml_models/*.pkl`

### API Endpoints

**Train Models:**
```
POST /api/predictions/train
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Models trained successfully",
  "data": {
    "visit_models": {...},
    "room_analysis": {...}
  }
}
```

**Get Predictions:**
```
POST /api/predictions/predict
Authorization: Bearer {token}
Body: { "days": 7 }

Response:
{
  "success": true,
  "data": {
    "visits": [
      {
        "date": "2026-03-11",
        "top3": [
          {"type": "GENERAL_CHECKUP", "value": 2.1},
          {"type": "INPATIENT", "value": 1.5},
          {"type": "MEDICAL_ACTION", "value": 1.2}
        ]
      },
      ...
    ],
    "rooms": [
      {
        "date": "2026-03-11",
        "top3": [
          {"type": "VIP", "value": 2.1},
          {"type": "KELAS_1", "value": 1.8},
          {"type": "ICU", "value": 1.3}
        ]
      },
      ...
    ],
    "generated_at": "2026-03-10T10:00:00Z"
  }
}
```

**Health Check:**
```
GET /api/predictions/health
Authorization: Bearer {token}
```

---

## 🐛 Troubleshooting

### ML Service Not Available
**Error:** "ML service is not available. Please ensure Python service is running on port 5030."

**Solution:**
1. Check if Python ML service is running
2. Activate venv and run `python app.py`
3. Verify port 5030 is not used by other processes

### Prophet Installation Issues
**Error:** Failed to build prophet

**Solution (Windows):**
```bash
# Install Microsoft C++ Build Tools first
# https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Then install prophet
pip install prophet
```

### No Historical Data
**Error:** "Not enough data for training"

**Solution:**
```bash
cd backend
npm run db:seed
```

### Predictions Not Showing
**Solution:**
1. Train models first dengan "Fetch & Train" button
2. Wait for success message
3. Then click "Predict" button

---

## 📁 Files Modified/Created

### Python ML Service
- ✅ `backend/ml_service/app.py` - Flask ML service
- ✅ `backend/ml_service/requirements.txt` - Python dependencies
- ✅ `backend/ml_service/README.md` - Documentation
- ✅ `backend/ml_service/.gitignore` - Git ignore

### Backend API
- ✅ `backend/src/controllers/predictionController.js` - Controller
- ✅ `backend/src/routes/predictionRoutes.js` - Routes
- ✅ `backend/src/server.js` - Added prediction routes
- ✅ `backend/package.json` - Added axios dependency
- ✅ `backend/src/database/seed.js` - Added historical data generation

### Frontend
- ✅ `frontend/src/pages/Dashboard.jsx` - Added AI Prediction section
- ✅ `frontend/src/services/api.js` - Added prediction API methods
- ✅ `frontend/src/locales/en.json` - English translations
- ✅ `frontend/src/locales/id.json` - Indonesian translations

---

## 🎉 Summary

AI Prediction feature is now fully functional with:
- Real-time predictions based on historical data
- Top 3 rankings per day for visits and rooms
- Beautiful visualizations with Recharts
- Full multi-language support (EN/ID)
- Mobile-responsive design
- Prophet ML model for accurate forecasting

Happy predicting! 🔮
