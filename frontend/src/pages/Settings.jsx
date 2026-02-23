import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Database,
  Shield,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: user?.department || '',
    specialization: ''
  })

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    billingAlerts: true,
    systemUpdates: false
  })

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: i18n.language || 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour'
  })

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field) => {
    setNotificationSettings(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleAppearanceChange = (field, value) => {
    setAppearanceSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    // TODO: Implement API call
    toast.success(t('settings.profile.saveSuccess'))
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('settings.security.passwordMismatch'))
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('settings.security.passwordLengthError'))
      return
    }

    // TODO: Implement API call
    toast.success(t('settings.security.passwordChanged'))
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleSaveNotifications = () => {
    // TODO: Implement API call
    toast.success(t('settings.notifications.saveSuccess'))
  }

  const handleSaveAppearance = () => {
    // Update i18n language when language setting changes
    if (appearanceSettings.language !== i18n.language) {
      i18n.changeLanguage(appearanceSettings.language)
    }
    // TODO: Implement API call
    toast.success(t('settings.appearance.saveSuccess'))
  }

  const tabs = [
    { id: 'profile', name: t('settings.tabs.profile'), icon: User },
    { id: 'security', name: t('settings.tabs.security'), icon: Lock },
    { id: 'notifications', name: t('settings.tabs.notifications'), icon: Bell },
    { id: 'appearance', name: t('settings.tabs.appearance'), icon: Palette },
    { id: 'system', name: t('settings.tabs.system'), icon: Database }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-sm text-gray-600">{t('settings.subtitle')}</p>
      </div>

      {/* Settings Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="card p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium border-l-4 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 border-primary-600 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 mr-2 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">{t('settings.profile.title')}</h2>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t('settings.profile.name')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      placeholder={t('settings.profile.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="form-label">{t('settings.profile.email')}</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder={t('settings.profile.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="form-label">{t('settings.profile.phone')}</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={profileData.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder={t('settings.profile.phonePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="form-label">{t('settings.profile.department')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.department}
                      onChange={(e) => handleProfileChange('department', e.target.value)}
                      placeholder={t('settings.profile.departmentPlaceholder')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">{t('settings.profile.specialization')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileData.specialization}
                      onChange={(e) => handleProfileChange('specialization', e.target.value)}
                      placeholder={t('settings.profile.specializationPlaceholder')}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button type="submit" className="btn btn-primary inline-flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    {t('settings.profile.saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 mr-2 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">{t('settings.security.title')}</h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="form-label">{t('settings.security.currentPassword')}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input pr-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">{t('settings.security.newPassword')}</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('settings.security.passwordRequirement')}</p>
                </div>

                <div>
                  <label className="form-label">{t('settings.security.confirmPassword')}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input pr-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button type="submit" className="btn btn-primary inline-flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    {t('settings.security.changePassword')}
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.security.twoFactorAuth')}</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{t('settings.security.enable2FA')}</p>
                    <p className="text-sm text-gray-500">{t('settings.security.2FADescription')}</p>
                  </div>
                  <button className="btn btn-secondary">
                    {t('settings.security.enable')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Bell className="w-6 h-6 mr-2 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">{t('settings.notifications.title')}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{t('settings.notifications.emailNotifications')}</p>
                    <p className="text-sm text-gray-500">{t('settings.notifications.emailNotificationsDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{t('settings.notifications.smsNotifications')}</p>
                    <p className="text-sm text-gray-500">{t('settings.notifications.smsNotificationsDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.smsNotifications}
                      onChange={() => handleNotificationChange('smsNotifications')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{t('settings.notifications.appointmentReminders')}</p>
                    <p className="text-sm text-gray-500">{t('settings.notifications.appointmentRemindersDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.appointmentReminders}
                      onChange={() => handleNotificationChange('appointmentReminders')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{t('settings.notifications.billingAlerts')}</p>
                    <p className="text-sm text-gray-500">{t('settings.notifications.billingAlertsDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.billingAlerts}
                      onChange={() => handleNotificationChange('billingAlerts')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{t('settings.notifications.systemUpdates')}</p>
                    <p className="text-sm text-gray-500">{t('settings.notifications.systemUpdatesDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.systemUpdates}
                      onChange={() => handleNotificationChange('systemUpdates')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t mt-6">
                <button onClick={handleSaveNotifications} className="btn btn-primary inline-flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {t('settings.notifications.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Palette className="w-6 h-6 mr-2 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">{t('settings.appearance.title')}</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="form-label">{t('settings.appearance.theme')}</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAppearanceChange('theme', 'light')}
                      className={`p-4 border-2 rounded-lg text-center ${
                        appearanceSettings.theme === 'light'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{t('settings.appearance.lightTheme')}</div>
                      <div className="text-sm text-gray-500">{t('settings.appearance.defaultTheme')}</div>
                    </button>
                    <button
                      onClick={() => handleAppearanceChange('theme', 'dark')}
                      className={`p-4 border-2 rounded-lg text-center ${
                        appearanceSettings.theme === 'dark'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{t('settings.appearance.darkTheme')}</div>
                      <div className="text-sm text-gray-500">{t('settings.appearance.comingSoon')}</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">{t('settings.appearance.language')}</label>
                  <select
                    className="form-input"
                    value={appearanceSettings.language}
                    onChange={(e) => handleAppearanceChange('language', e.target.value)}
                  >
                    <option value="en">{t('settings.appearance.english')}</option>
                    <option value="id">{t('settings.appearance.indonesian')}</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">{t('settings.appearance.dateFormat')}</label>
                  <select
                    className="form-input"
                    value={appearanceSettings.dateFormat}
                    onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">{t('settings.appearance.timeFormat')}</label>
                  <select
                    className="form-input"
                    value={appearanceSettings.timeFormat}
                    onChange={(e) => handleAppearanceChange('timeFormat', e.target.value)}
                  >
                    <option value="12-hour">{t('settings.appearance.12hour')}</option>
                    <option value="24-hour">{t('settings.appearance.24hour')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t mt-6">
                <button onClick={handleSaveAppearance} className="btn btn-primary inline-flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {t('settings.appearance.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <Database className="w-6 h-6 mr-2 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">{t('settings.system.title')}</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">{t('settings.system.version')}</span>
                    <span className="text-sm font-semibold text-gray-900">1.0.0</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">{t('settings.system.lastUpdated')}</span>
                    <span className="text-sm font-semibold text-gray-900">January 2, 2026</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">{t('settings.system.database')}</span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                      {t('settings.system.connected')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">{t('settings.system.server')}</span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                      {t('settings.system.online')}
                    </span>
                  </div>
                </div>
              </div>

              {user?.role === 'ADMIN' && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.system.adminTools')}</h3>
                  <div className="space-y-3">
                    <button className="w-full btn btn-secondary justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      {t('settings.system.backupDatabase')}
                    </button>
                    <button className="w-full btn btn-secondary justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      {t('settings.system.viewLogs')}
                    </button>
                    <button className="w-full btn btn-danger justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      {t('settings.system.clearCache')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
