import React, { useState, useEffect } from 'react'
import { dashboardService, billingService, patientService, visitService } from '../services'
import { 
  Download, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Activity,
  Printer,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

const Reports = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState({
    patients: { total: 0, new: 0 },
    visits: { total: 0, completed: 0, cancelled: 0 },
    billing: { total: 0, paid: 0, unpaid: 0, revenue: 0 },
    topDiseases: [],
    topMedicines: []
  })

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, billingsRes, patientsRes, visitsRes] = await Promise.all([
        dashboardService.getStats().catch(err => ({ data: { stats: {} } })),
        billingService.getBillings({ limit: 1000 }).catch(err => ({ data: { billings: [] } })),
        patientService.getPatients({ limit: 1000 }).catch(err => ({ data: { patients: [] } })),
        visitService.getVisits({ limit: 1000 }).catch(err => ({ data: { visits: [] } }))
      ])

      const allPatients = patientsRes?.data?.patients || []
      const allVisits = visitsRes?.data?.visits || []
      const allBillings = billingsRes?.data?.billings || []
      const dashStats = dashboardRes?.data?.stats || {}
      
      const startDate = new Date(dateRange.startDate)
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999) // Include full end date
      
      // Filter patients in date range
      const patientsInRange = allPatients.filter(p => {
        const createdDate = new Date(p.createdAt)
        return createdDate >= startDate && createdDate <= endDate
      })
      
      // Filter visits in date range
      const visitsInRange = allVisits.filter(v => {
        const visitDate = new Date(v.scheduledAt || v.createdAt)
        return visitDate >= startDate && visitDate <= endDate
      })
      
      // Filter billings in date range
      const billingsInRange = allBillings.filter(b => {
        const billingDate = new Date(b.createdAt)
        return billingDate >= startDate && billingDate <= endDate
      })
      
      // Calculate billing statistics
      const paidBillings = billingsInRange.filter(b => b.status === 'PAID')
      const unpaidBillings = billingsInRange.filter(b => b.status === 'UNPAID')
      const totalRevenue = billingsInRange.reduce((sum, b) => {
        return sum + (b.status === 'PAID' ? parseFloat(b.total || 0) : 0)
      }, 0)

      setReportData({
        patients: {
          total: dashStats.totalPatients || allPatients.length || 0,
          new: patientsInRange.length
        },
        visits: {
          total: visitsInRange.length,
          completed: visitsInRange.filter(v => v.status === 'COMPLETED').length,
          cancelled: visitsInRange.filter(v => v.status === 'CANCELLED').length
        },
        billing: {
          total: billingsInRange.length,
          paid: paidBillings.length,
          unpaid: unpaidBillings.length,
          revenue: totalRevenue
        },
        topDiseases: [],
        topMedicines: []
      })
    } catch (error) {
      console.error('Failed to fetch report data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerateReport = () => {
    fetchReportData()
    toast.success('Report generated successfully')
  }

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hospital Report - ${dateRange.startDate} to ${dateRange.endDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
          .header h1 { font-size: 28px; color: #1f2937; margin-bottom: 10px; }
          .header p { color: #6b7280; font-size: 14px; }
          .date-range { text-align: center; margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .section { margin: 30px 0; }
          .section-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .stat-card { padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
          .stat-label { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
          .stat-value { font-size: 32px; font-weight: bold; color: #1f2937; }
          .footer { margin-top: 50px; text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Hospital Information System</h1>
          <p>Comprehensive Report</p>
        </div>
        
        <div class="date-range">
          <strong>Report Period:</strong> ${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}
        </div>
        
        <div class="section">
          <div class="section-title">Patient Statistics</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Patients</div>
              <div class="stat-value">${reportData.patients.total}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">New Patients (in period)</div>
              <div class="stat-value">${reportData.patients.new}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Visit Statistics</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Visits</div>
              <div class="stat-value">${reportData.visits.total}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Completed Visits</div>
              <div class="stat-value">${reportData.visits.completed}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Cancelled Visits</div>
              <div class="stat-value">${reportData.visits.cancelled}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Completion Rate</div>
              <div class="stat-value">${reportData.visits.total > 0 ? Math.round((reportData.visits.completed / reportData.visits.total) * 100) : 0}%</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Financial Statistics</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">Rp ${reportData.billing.revenue.toLocaleString('id-ID')}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Paid Bills</div>
              <div class="stat-value">${reportData.billing.paid}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Unpaid Bills</div>
              <div class="stat-value">${reportData.billing.unpaid}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Bills</div>
              <div class="stat-value">${reportData.billing.total}</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString('id-ID')}</p>
          <p>Hospital Information System - Confidential Report</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 100);
          }
        </script>
      </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['Hospital Report'],
      [`Period: ${dateRange.startDate} to ${dateRange.endDate}`],
      [],
      ['Patient Statistics'],
      ['Total Patients', reportData.patients.total],
      ['New Patients', reportData.patients.new],
      [],
      ['Visit Statistics'],
      ['Total Visits', reportData.visits.total],
      ['Completed Visits', reportData.visits.completed],
      ['Cancelled Visits', reportData.visits.cancelled],
      [],
      ['Financial Statistics'],
      ['Total Revenue', reportData.billing.revenue],
      ['Paid Bills', reportData.billing.paid],
      ['Unpaid Bills', reportData.billing.unpaid],
      ['Total Bills', reportData.billing.total]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hospital-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Report exported to CSV')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600">Generate and export comprehensive hospital reports</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Report Period
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleGenerateReport} 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportPDF} className="btn btn-primary inline-flex items-center">
            <Printer className="w-4 h-4 mr-2" />
            Print / PDF
          </button>
          <button onClick={handleExportCSV} className="btn btn-secondary inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Patient Statistics */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Patient Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-600">Total Patients</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">{reportData.patients.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-600">New Patients (in period)</div>
            <div className="text-3xl font-bold text-green-900 mt-2">{reportData.patients.new}</div>
            <div className="text-xs text-green-700 mt-1">Registered in selected period</div>
          </div>
        </div>
      </div>

      {/* Visit Statistics */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-600" />
          Visit Statistics
          <span className="ml-2 text-xs font-normal text-gray-500">(in selected period)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-600">Total Visits</div>
            <div className="text-3xl font-bold text-purple-900 mt-2">{reportData.visits.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-600">Completed</div>
            <div className="text-3xl font-bold text-green-900 mt-2">{reportData.visits.completed}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm font-medium text-red-600">Cancelled</div>
            <div className="text-3xl font-bold text-red-900 mt-2">{reportData.visits.cancelled}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-600">Completion Rate</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">
              {reportData.visits.total > 0 
                ? Math.round((reportData.visits.completed / reportData.visits.total) * 100) 
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Financial Statistics */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Financial Statistics
          <span className="ml-2 text-xs font-normal text-gray-500">(in selected period)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-600">Total Revenue</div>
            <div className="text-2xl font-bold text-green-900 mt-2">
              {formatCurrency(reportData.billing.revenue)}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-600">Paid Bills</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">{reportData.billing.paid}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-sm font-medium text-yellow-600">Unpaid Bills</div>
            <div className="text-3xl font-bold text-yellow-900 mt-2">{reportData.billing.unpaid}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-600">Total Bills</div>
            <div className="text-3xl font-bold text-purple-900 mt-2">{reportData.billing.total}</div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
            Key Performance Indicators
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Average Revenue per Patient</span>
              <span className="text-lg font-bold text-gray-900">
                {reportData.patients.total > 0 
                  ? formatCurrency(reportData.billing.revenue / reportData.patients.total)
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Payment Collection Rate</span>
              <span className="text-lg font-bold text-gray-900">
                {reportData.billing.total > 0 
                  ? Math.round((reportData.billing.paid / reportData.billing.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Average Visits per Day</span>
              <span className="text-lg font-bold text-gray-900">
                {Math.round(reportData.visits.total / 30)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-600" />
            System Activity Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Active Patients</span>
              <span className="text-lg font-bold text-gray-900">{reportData.patients.total}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Pending Visits</span>
              <span className="text-lg font-bold text-gray-900">
                {reportData.visits.total - reportData.visits.completed - reportData.visits.cancelled}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-600">Outstanding Payments</span>
              <span className="text-lg font-bold text-gray-900">{reportData.billing.unpaid}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
