# Hospital Information System - Mobile App Analysis & Planning

## 📊 Backend API Analysis

### Authentication Endpoints
- `POST /api/auth/login` - Login dengan email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/register` - Register new user (Admin only)

### Core API Endpoints Available

#### Patients
- `GET /api/patients` - List patients (dengan pagination)
- `GET /api/patients/:id` - Detail patient
- `GET /api/patients/search` - Search patients
- `POST /api/patients` - Create patient (Admin, Front Desk)
- `PUT /api/patients/:id` - Update patient (Admin, Front Desk)
- `DELETE /api/patients/:id` - Delete patient (Admin only)

#### Visits/Schedule
- `GET /api/visits` - List visits (dengan pagination)
- `GET /api/visits/:id` - Detail visit
- `POST /api/visits` - Create visit (Admin, Doctor, Nurse, Front Desk)
- `PUT /api/visits/:id` - Update visit (Admin, Doctor, Nurse, Front Desk)
- `DELETE /api/visits/:id` - Delete visit (Admin only)

**Visit Types:** GENERAL_CHECKUP, OUTPATIENT, INPATIENT, EMERGENCY
**Visit Status:** SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW

#### Dashboard
- `GET /api/dashboard/stats` - Statistics (total patients, today visits, revenue, etc)
- `GET /api/dashboard/activities` - Recent activities

#### Medical Records
- Available via `/api/records`

#### Users
- Available via `/api/users` (untuk manajemen staff)

#### Medicines
- Available via `/api/medicines`

#### Billing
- Available via `/api/billing`

### Database Schema Key Models

#### User
- Roles: ADMIN, DOCTOR, NURSE, FRONT_DESK, PHARMACY, LABORATORY
- Fields: name, email, role, department, phone, avatarUrl, isActive

#### Patient
- Fields: medicalRecordNo, name, dateOfBirth, gender, phone, address, emergencyContact
- Gender: MALE, FEMALE, OTHER

#### Visit
- Fields: patientId, doctorId, visitType, scheduledAt, queueNumber, status, notes
- **Queue Number Format:** YYMMDD-XXX (e.g., 260111-001)

---

## 🎯 Mobile App Feature Recommendations

### Phase 1: Essential Features (MVP)

#### 1. Authentication
- ✅ Login screen (email + password)
- ✅ Auto token refresh
- ✅ Logout
- ✅ Remember me / Biometric login (optional)
- ✅ Role-based access control

#### 2. Dashboard
- ✅ Statistics cards (total patients, today visits, pending records)
- ✅ Quick actions (based on role)
- ✅ Recent activities feed
- ✅ Welcome message with user info

#### 3. Schedule/Visits Management
- ✅ View today's schedule
- ✅ View all schedules (with filters: date, status, type)
- ✅ Schedule details (patient info, doctor, queue number, status)
- ✅ Add new schedule (for authorized roles)
- ✅ Update schedule status (SCHEDULED → IN_PROGRESS → COMPLETED)
- ✅ Cancel/reschedule appointments
- ✅ Push notifications for upcoming appointments
- ✅ **Queue number display** (prominent)

#### 4. Patients Management
- ✅ Patient list (with search & pagination)
- ✅ Patient details (basic info, visit history)
- ✅ Search patients (by name, medical record number, phone)
- ✅ Add new patient (Front Desk, Admin)
- ✅ Edit patient info (Front Desk, Admin)
- ✅ View patient's visit history

#### 5. Profile & Settings
- ✅ View/edit user profile
- ✅ Change password
- ✅ App settings (notifications, theme)
- ✅ About & version info

### Phase 2: Advanced Features (Optional)

#### 6. Medical Records
- View medical records (Doctors only)
- Add medical records after visit
- View prescriptions
- Download/share medical records (PDF)

#### 7. Medicines
- View medicine inventory
- Search medicines
- Low stock alerts (Pharmacy role)

#### 8. Billing (if needed)
- View billing information
- Payment status tracking

#### 9. Notifications
- Push notifications for:
  - Upcoming appointments
  - Schedule changes
  - New patient arrivals
  - Urgent alerts

#### 10. Offline Mode
- Cache recent data
- Sync when online
- Queue actions when offline

---

## 📱 Mobile App Technical Stack

### Core Technologies
```json
{
  "framework": "Expo React Native",
  "language": "JavaScript / TypeScript",
  "stateManagement": "React Context API / Redux Toolkit",
  "navigation": "React Navigation",
  "uiLibrary": "React Native Paper / NativeBase / custom",
  "forms": "React Hook Form",
  "api": "Axios",
  "storage": "AsyncStorage / SecureStore",
  "icons": "Expo Vector Icons / React Native Vector Icons"
}
```

### Recommended Packages
```bash
# Core
expo
expo-router # or @react-navigation/native

# UI Components
react-native-paper # Material Design
# or
native-base # Component library

# Forms & Validation
react-hook-form
yup # Validation schema

# API & State
axios
@tanstack/react-query # Server state management
zustand # or @reduxjs/toolkit

# Authentication
expo-secure-store # Secure token storage
expo-local-authentication # Biometric auth

# Utilities
date-fns # Date formatting
dayjs # Alternative to date-fns

# Notifications
expo-notifications

# Camera (for future features)
expo-camera
expo-image-picker
```

---

## 🎨 UI/UX Design Considerations

### Color Scheme (berdasarkan web app)
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Background: White/Light Gray

### Screen Structure

#### Bottom Tab Navigation (Main)
1. **Dashboard** (Home icon)
2. **Schedule** (Calendar icon)
3. **Patients** (Users icon)
4. **More** (Menu icon)

#### Role-Based Features
- **Doctor:** Focus on schedule, patient records, medical records
- **Nurse:** Schedule, patient info, assist doctors
- **Front Desk:** Schedule, patient registration, appointments
- **Admin:** Full access to all features
- **Pharmacy:** Medicines, prescriptions
- **Laboratory:** Lab results, test orders

---

## 🔒 Security Considerations

### 1. Authentication
- ✅ JWT tokens stored in SecureStore (encrypted)
- ✅ Refresh token mechanism
- ✅ Auto logout on token expiration
- ✅ Optional biometric authentication

### 2. Data Protection
- ✅ HTTPS only communication
- ✅ Sensitive data not cached
- ✅ Secure credential storage
- ✅ Certificate pinning (optional, for production)

### 3. Privacy
- ✅ Patient data encryption
- ✅ Role-based data access
- ✅ Audit logs for sensitive actions
- ✅ GDPR/HIPAA compliance considerations

---

## 🚀 Development Plan

### Step 1: Project Setup (1-2 days)
- [ ] Initialize Expo project
- [ ] Setup folder structure
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Setup navigation structure
- [ ] Configure ESLint/Prettier

### Step 2: Core Features (1 week)
- [ ] Authentication (Login, Logout, Token management)
- [ ] API service layer setup
- [ ] State management setup
- [ ] Navigation setup (Bottom tabs, Stack navigation)

### Step 3: Dashboard & Home (3-4 days)
- [ ] Dashboard statistics
- [ ] Quick actions
- [ ] Recent activities
- [ ] Role-based UI

### Step 4: Schedule Module (1 week)
- [ ] Schedule list with filters
- [ ] Schedule detail view
- [ ] Create/Edit schedule
- [ ] Status updates
- [ ] Queue number display
- [ ] Date picker & time picker

### Step 5: Patient Module (1 week)
- [ ] Patient list with search
- [ ] Patient detail view
- [ ] Add/Edit patient forms
- [ ] Visit history
- [ ] Patient search

### Step 6: Profile & Settings (2-3 days)
- [ ] User profile screen
- [ ] Edit profile
- [ ] Change password
- [ ] Settings screen
- [ ] Logout functionality

### Step 7: Testing & Polish (3-5 days)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] UI/UX refinements

### Step 8: Deployment (2-3 days)
- [ ] Build Android APK
- [ ] Build iOS IPA
- [ ] Test on real devices
- [ ] Documentation
- [ ] App store submission (if needed)

**Total Estimated Time:** 4-6 weeks for MVP

---

## 📂 Proposed Folder Structure

```
mobile-app/
├── app/                          # Expo Router screens (if using)
├── src/
│   ├── api/                      # API services
│   │   ├── axiosInstance.js
│   │   ├── authService.js
│   │   ├── patientService.js
│   │   ├── visitService.js
│   │   └── dashboardService.js
│   ├── components/               # Reusable components
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   └── LoadingSpinner.js
│   │   ├── schedule/
│   │   │   ├── ScheduleCard.js
│   │   │   └── ScheduleFilters.js
│   │   └── patient/
│   │       ├── PatientCard.js
│   │       └── PatientSearchBar.js
│   ├── screens/                  # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.js
│   │   ├── schedule/
│   │   │   ├── ScheduleListScreen.js
│   │   │   ├── ScheduleDetailScreen.js
│   │   │   ├── CreateScheduleScreen.js
│   │   │   └── EditScheduleScreen.js
│   │   ├── patients/
│   │   │   ├── PatientListScreen.js
│   │   │   ├── PatientDetailScreen.js
│   │   │   ├── CreatePatientScreen.js
│   │   │   └── EditPatientScreen.js
│   │   └── profile/
│   │       ├── ProfileScreen.js
│   │       └── SettingsScreen.js
│   ├── navigation/               # Navigation setup
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainTabNavigator.js
│   ├── context/                  # React Context
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useDebounce.js
│   ├── utils/                    # Utility functions
│   │   ├── dateFormatter.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── constants/                # App constants
│   │   ├── colors.js
│   │   ├── routes.js
│   │   └── api.js
│   └── assets/                   # Images, fonts, etc
│       ├── images/
│       └── fonts/
├── app.json
├── package.json
└── .env.example
```

---

## 🔄 API Integration Strategy

### 1. Axios Instance Setup
```javascript
// src/api/axiosInstance.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        await SecureStore.setItemAsync('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        // NavigationService.navigate('Login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 2. Service Layer Pattern
```javascript
// src/api/visitService.js
import axiosInstance from './axiosInstance';

export const visitService = {
  getVisits: async (params = {}) => {
    const response = await axiosInstance.get('/visits', { params });
    return response.data;
  },

  getVisit: async (id) => {
    const response = await axiosInstance.get(`/visits/${id}`);
    return response.data;
  },

  createVisit: async (data) => {
    const response = await axiosInstance.post('/visits', data);
    return response.data;
  },

  updateVisit: async (id, data) => {
    const response = await axiosInstance.put(`/visits/${id}`, data);
    return response.data;
  },

  deleteVisit: async (id) => {
    const response = await axiosInstance.delete(`/visits/${id}`);
    return response.data;
  },
};
```

---

## 📊 State Management Strategy

### Option 1: React Context + React Query (Recommended)
- **Context:** For global state (auth, theme, settings)
- **React Query:** For server state (API data, caching, refetching)
- **Local State:** For component-specific state

### Option 2: Redux Toolkit
- More boilerplate, but powerful for complex state
- Good for large apps with complex state dependencies

### Option 3: Zustand
- Lightweight alternative to Redux
- Simpler API, less boilerplate
- Good middle ground

---

## 🎯 Key Features for Each Role

### Doctor
1. **Priority:** Today's schedule, patient medical records
2. **Features:**
   - View daily appointments
   - Access patient medical history
   - Add/update medical records
   - View prescriptions
   - Update visit status

### Nurse
1. **Priority:** Assist doctors, manage patient flow
2. **Features:**
   - View schedule
   - Update visit status
   - View patient vital signs
   - Access basic patient info

### Front Desk
1. **Priority:** Patient registration, appointment scheduling
2. **Features:**
   - Create/edit patients
   - Schedule appointments
   - Manage queue numbers
   - View today's schedule
   - Check-in patients

### Admin
1. **Priority:** Overview and management
2. **Features:**
   - Full dashboard statistics
   - User management
   - All CRUD operations
   - Reports
   - System settings

---

## 📝 Environment Configuration

```env
# .env.example
API_BASE_URL=http://192.168.1.100:5000/api
API_TIMEOUT=10000

# For production
# API_BASE_URL=https://api.hospital.com/api
```

**Note:** Untuk development, gunakan IP address komputer (bukan localhost) agar bisa diakses dari device fisik atau emulator.

---

## ✅ Checklist Before Starting

- [ ] Pastikan backend API sudah running dan accessible
- [ ] Test all API endpoints dengan Postman/Thunder Client
- [ ] Understand authentication flow (JWT tokens)
- [ ] Design mockups/wireframes (optional tapi recommended)
- [ ] Setup version control (Git)
- [ ] Create project board untuk tracking progress

---

## 🎨 UI/UX Best Practices

1. **Responsive Design:** Support berbagai ukuran screen
2. **Loading States:** Show loading indicators untuk semua API calls
3. **Error Handling:** User-friendly error messages
4. **Empty States:** Informative ketika tidak ada data
5. **Pull to Refresh:** Untuk list screens
6. **Infinite Scroll/Pagination:** Untuk large datasets
7. **Form Validation:** Real-time validation dengan helpful messages
8. **Confirmation Dialogs:** Untuk destructive actions (delete, cancel)
9. **Accessibility:** Support untuk screen readers, font scaling
10. **Offline Indicators:** Show ketika tidak ada koneksi internet

---

## 🔔 Notification Strategy

### Local Notifications
- Appointment reminders (30 min, 1 hour, 1 day before)
- Queue number updates
- Status changes

### Push Notifications (Future)
- Urgent alerts from doctors
- Schedule changes
- New patient arrivals
- Emergency notifications

---

## 📦 Next Steps

1. **Review & Approve** analisis ini
2. **Setup Development Environment**
   - Install Node.js & Expo CLI
   - Setup Android Studio / Xcode
   - Configure emulators
3. **Create Project**
   - `npx create-expo-app hospital-mobile`
4. **Start Development** sesuai development plan di atas

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

---

**Estimated Timeline:** 4-6 weeks untuk MVP (dengan 1 developer full-time)

**Budget Estimate:** Tergantung developer rate dan complexity

**Maintenance:** Ongoing updates, bug fixes, feature additions
