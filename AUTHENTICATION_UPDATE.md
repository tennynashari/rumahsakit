# Update Autentikasi ke HttpOnly Cookies

## Perubahan yang Dilakukan

Aplikasi telah diupdate dari menggunakan **localStorage** menjadi **HttpOnly Cookies** untuk keamanan yang lebih baik.

## Keuntungan HttpOnly Cookies

✅ **Keamanan dari XSS**: Token tidak dapat diakses oleh JavaScript
✅ **Automatic Handling**: Browser secara otomatis mengirim cookies
✅ **Secure & SameSite**: Perlindungan tambahan dari CSRF attacks

## Backend Changes

### 1. Dependencies
- ✅ Installed `cookie-parser`

### 2. Server Configuration (`backend/src/server.js`)
- ✅ Import dan setup `cookie-parser` middleware
- ✅ CORS sudah dikonfigurasi dengan `credentials: true`

### 3. Auth Controller (`backend/src/controllers/authController.js`)
- ✅ **Login**: Mengirim tokens sebagai HttpOnly cookies (bukan di response body)
- ✅ **Refresh Token**: Membaca dari cookies (bukan dari request body)
- ✅ **Logout**: Menghapus cookies dengan `clearCookie`
- ✅ **Me Endpoint**: Endpoint baru untuk mendapatkan current user

### 4. Auth Middleware (`backend/src/middleware/authMiddleware.js`)
- ✅ Membaca token dari cookies sebagai prioritas pertama
- ✅ Fallback ke Authorization header untuk backward compatibility

### 5. Auth Routes (`backend/src/routes/authRoutes.js`)
- ✅ Tambah route `GET /api/auth/me` untuk mendapatkan current user

## Frontend Changes

### 1. API Configuration (`frontend/src/services/api.js`)
- ✅ Tambah `withCredentials: true` untuk semua requests
- ✅ Hapus request interceptor (tidak perlu tambah token manual)
- ✅ Update response interceptor untuk refresh token via cookies
- ✅ Simplified error handling

### 2. Auth Context (`frontend/src/context/AuthContext.jsx`)
- ✅ Hapus semua `localStorage` usage
- ✅ Update initialization untuk call `/auth/me` endpoint
- ✅ Login tidak lagi menyimpan tokens ke localStorage
- ✅ Logout tidak lagi hapus localStorage

### 3. Auth Service (`frontend/src/services/index.js`)
- ✅ Tambah `me()` function untuk get current user

## Cookie Configuration

```javascript
{
  httpOnly: true,              // Tidak bisa diakses JavaScript
  secure: NODE_ENV === 'production', // HTTPS only di production
  sameSite: 'strict',          // CSRF protection
  maxAge: {
    accessToken: 1 hour,
    refreshToken: 7 days
  }
}
```

## Testing

### Backend Testing
```bash
cd backend
npm run dev
```

### Frontend Testing
```bash
cd frontend
npm run dev
```

### Manual Testing Steps
1. ✅ Login dengan credentials
2. ✅ Verify cookies di browser DevTools (Application > Cookies)
3. ✅ Navigate ke halaman yang memerlukan auth
4. ✅ Verify auto-refresh token saat access token expired
5. ✅ Logout dan verify cookies terhapus

## Environment Variables

Pastikan `.env` di backend memiliki:
```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Migration Notes

⚠️ **Breaking Change**: User yang sedang login akan otomatis logout karena tokens di localStorage tidak akan digunakan lagi.

## Security Improvements

| Aspek | localStorage | HttpOnly Cookies |
|-------|-------------|------------------|
| XSS Attack | ❌ Vulnerable | ✅ Protected |
| CSRF Attack | ✅ Protected | ✅ Protected (SameSite) |
| JavaScript Access | ❌ Accessible | ✅ Not accessible |
| Auto-Send | ❌ Manual | ✅ Automatic |

## Next Steps (Optional)

- [ ] Implement refresh token rotation
- [ ] Add token blacklist for logout
- [ ] Add rate limiting for auth endpoints
- [ ] Implement session management
- [ ] Add 2FA authentication
