import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { userService } from '../services'
import { ArrowLeft, Edit, Mail, Phone, Briefcase, Building2, Calendar, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await userService.getUser(id)
      setUser(response.data.user)
    } catch (error) {
      console.error('Fetch user error:', error)
      toast.error('Gagal memuat data pengguna')
      navigate('/users')
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role) => {
    const roleMap = {
      ADMIN: 'Administrator',
      DOCTOR: 'Dokter',
      NURSE: 'Perawat',
      FRONT_DESK: 'Front Desk',
      PHARMACY: 'Farmasi',
      LABORATORY: 'Laboratorium',
      PATIENT: 'Pasien'
    }
    return roleMap[role] || role
  }

  const getRoleBadgeClass = (role) => {
    const badgeMap = {
      ADMIN: 'bg-red-100 text-red-800',
      DOCTOR: 'bg-blue-100 text-blue-800',
      NURSE: 'bg-green-100 text-green-800',
      FRONT_DESK: 'bg-yellow-100 text-yellow-800',
      PHARMACY: 'bg-purple-100 text-purple-800',
      LABORATORY: 'bg-indigo-100 text-indigo-800',
      PATIENT: 'bg-gray-100 text-gray-800'
    }
    return badgeMap[role] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pengguna tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/users"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Pengguna</h1>
            <p className="text-gray-600">Informasi lengkap pengguna</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/users/${id}/edit`}
            className="btn btn-primary"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-2xl">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadgeClass(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
            <div>
              {user.isActive ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aktif
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <XCircle className="w-4 h-4 mr-1" />
                  Nonaktif
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nomor Telepon</p>
                    <p className="text-sm font-medium text-gray-900">{user.phone || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pekerjaan</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Briefcase className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-900">{getRoleLabel(user.role)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Departemen</p>
                    <p className="text-sm font-medium text-gray-900">{user.department || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Terakhir Diperbarui</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Informasi Sistem</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>User ID: {user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetail
