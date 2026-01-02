import React, { useState, useEffect } from 'react'
import { billingService, patientService, visitService } from '../services'
import { CreditCard, Receipt, DollarSign, FileText, Plus, Edit, Trash2, Search, Eye, Check, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

const Billing = () => {
  const [billings, setBillings] = useState([])
  const [patients, setPatients] = useState([])
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingBilling, setEditingBilling] = useState(null)
  const [viewingBilling, setViewingBilling] = useState(null)
  const [paymentBilling, setPaymentBilling] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    partiallyPaid: 0,
    totalRevenue: 0,
    pendingRevenue: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [formData, setFormData] = useState({
    patientId: '',
    visitId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0
  })
  const [paymentData, setPaymentData] = useState({
    amountPaid: ''
  })
  const [patientSearch, setPatientSearch] = useState('')
  const [visitSearch, setVisitSearch] = useState('')
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [showVisitDropdown, setShowVisitDropdown] = useState(false)

  useEffect(() => {
    fetchBillings()
    fetchStats()
    fetchPatients()
  }, [])

  const fetchBillings = async (page = pagination.page) => {
    try {
      setLoading(true)
      const response = await billingService.getBillings({ page, limit: pagination.limit })
      setBillings(response.data.billings || [])
      setPagination(prev => ({
        ...prev,
        page: response.data.pagination?.page || page,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      }))
    } catch (error) {
      toast.error('Failed to fetch billings')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await billingService.getBillingStats()
      setStats(response.data.stats)
    } catch (error) {
      console.error('Failed to fetch stats')
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await patientService.getPatients({ limit: 1000 })
      setPatients(response.data.patients || [])
    } catch (error) {
      console.error('Failed to fetch patients')
    }
  }

  const fetchPatientVisits = async (patientId) => {
    try {
      console.log('Fetching visits for patient:', patientId)
      const response = await visitService.getVisits({ patientId, limit: 100 })
      console.log('Fetched visits:', response.data.visits)
      setVisits(response.data.visits || [])
    } catch (error) {
      console.error('Failed to fetch visits')
      setVisits([])
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchBillings(newPage)
  }

  const handlePatientChange = (patientId) => {
    const selectedPatient = patients.find(p => p.id === patientId)
    setFormData(prev => ({ ...prev, patientId, visitId: '' }))
    setPatientSearch(selectedPatient ? `${selectedPatient.name} - ${selectedPatient.medicalRecordNo}` : '')
    setShowPatientDropdown(false)
    setVisitSearch('')
    setVisits([]) // Clear visits first
    if (patientId) {
      fetchPatientVisits(patientId)
    }
  }

  const handleVisitChange = (visitId) => {
    const selectedVisit = visits.find(v => v.id === visitId)
    setFormData(prev => ({ ...prev, visitId }))
    setVisitSearch(selectedVisit ? `#${selectedVisit.id} - ${selectedVisit.visitType}` : '')
    setShowVisitDropdown(false)
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value

    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = parseFloat(newItems[index].quantity || 0) * parseFloat(newItems[index].unitPrice || 0)
    }

    calculateTotals(newItems)
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }))
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    if (newItems.length === 0) {
      newItems.push({ description: '', quantity: 1, unitPrice: 0, amount: 0 })
    }
    calculateTotals(newItems)
  }

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    const tax = subtotal * 0.1 // 10% tax
    const discount = parseFloat(formData.discount) || 0
    const total = subtotal + tax - discount

    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      tax,
      total
    }))
  }

  const handleDiscountChange = (value) => {
    const discount = parseFloat(value) || 0
    const subtotal = formData.subtotal
    const tax = formData.tax
    const total = subtotal + tax - discount

    setFormData(prev => ({
      ...prev,
      discount,
      total
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      if (editingBilling) {
        await billingService.updateBilling(editingBilling.id, formData)
        toast.success('Billing updated successfully')
      } else {
        await billingService.createBilling(formData)
        toast.success('Billing created successfully')
      }
      setShowModal(false)
      setEditingBilling(null)
      resetForm()
      fetchBillings()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${editingBilling ? 'update' : 'create'} billing`)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await billingService.recordPayment(paymentBilling.id, paymentData)
      toast.success('Payment recorded successfully')
      setShowPaymentModal(false)
      setPaymentBilling(null)
      setPaymentData({ amountPaid: '' })
      fetchBillings()
      fetchStats()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (billing) => {
    setEditingBilling(billing)
    setFormData({
      patientId: billing.patientId,
      visitId: billing.visitId || '',
      items: billing.items,
      subtotal: parseFloat(billing.subtotal),
      tax: parseFloat(billing.tax),
      discount: parseFloat(billing.discount),
      total: parseFloat(billing.total)
    })
    setPatientSearch(billing.patient ? `${billing.patient.name} - ${billing.patient.medicalRecordNo}` : '')
    setVisitSearch(billing.visit ? `#${billing.visit.id} - ${billing.visit.visitType}` : '')
    if (billing.patientId) {
      fetchPatientVisits(billing.patientId)
    }
    setShowModal(true)
  }

  const handleView = async (billing) => {
    try {
      const response = await billingService.getBilling(billing.id)
      setViewingBilling(response.data.billing)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Failed to load billing details')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this billing?')) {
      try {
        await billingService.deleteBilling(id)
        toast.success('Billing deleted successfully')
        fetchBillings()
        fetchStats()
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete billing')
      }
    }
  }

  const handlePayment = (billing) => {
    setPaymentBilling(billing)
    setPaymentData({ amountPaid: billing.total })
    setShowPaymentModal(true)
  }

  const handlePrint = async (billing) => {
    try {
      // Fetch full billing details if needed
      const response = await billingService.getBilling(billing.id)
      const fullBilling = response.data.billing
      
      // Create print window
      const printWindow = window.open('', '_blank')
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt #${fullBilling.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 80mm; margin: 0 auto; }
            .receipt { border: 2px solid #000; padding: 15px; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .header h1 { font-size: 20px; margin-bottom: 5px; }
            .header p { font-size: 11px; }
            .section { margin: 10px 0; }
            .section-title { font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #000; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; }
            .items { margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
            .item-desc { flex: 1; }
            .item-qty { width: 30px; text-align: center; }
            .item-price { width: 80px; text-align: right; }
            .totals { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
            .total-row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; }
            .total-row.final { font-weight: bold; font-size: 14px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; }
            .payment { margin-top: 10px; border-top: 2px dashed #000; padding-top: 10px; }
            .footer { text-align: center; margin-top: 15px; border-top: 2px dashed #000; padding-top: 10px; font-size: 11px; }
            @media print {
              body { padding: 0; }
              .receipt { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>HOSPITAL INFORMATION SYSTEM</h1>
              <p>Jl. Rumah Sakit No. 123</p>
              <p>Tel: (021) 1234-5678</p>
            </div>
            
            <div class="section">
              <div class="section-title">RECEIPT #${fullBilling.id}</div>
              <div class="row">
                <span>Date:</span>
                <span>${new Date(fullBilling.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <div class="row">
                <span>Patient:</span>
                <span>${fullBilling.patient?.name || 'N/A'}</span>
              </div>
              <div class="row">
                <span>MR No:</span>
                <span>${fullBilling.patient?.medicalRecordNo || 'N/A'}</span>
              </div>
              ${fullBilling.visit ? `
              <div class="row">
                <span>Visit:</span>
                <span>#${fullBilling.visit.id} - ${fullBilling.visit.visitType}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="items">
              <div class="section-title">ITEMS</div>
              ${fullBilling.items.map(item => `
                <div class="item">
                  <div class="item-desc">${item.description}</div>
                  <div class="item-qty">${item.quantity}x</div>
                  <div class="item-price">${formatCurrency(item.amount)}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(fullBilling.subtotal)}</span>
              </div>
              <div class="total-row">
                <span>Tax (10%):</span>
                <span>${formatCurrency(fullBilling.tax)}</span>
              </div>
              ${fullBilling.discount > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-${formatCurrency(fullBilling.discount)}</span>
              </div>
              ` : ''}
              <div class="total-row final">
                <span>TOTAL:</span>
                <span>${formatCurrency(fullBilling.total)}</span>
              </div>
            </div>
            
            <div class="payment">
              <div class="section-title">PAYMENT INFO</div>
              <div class="row">
                <span>Status:</span>
                <span>${fullBilling.status.replace('_', ' ')}</span>
              </div>
              ${fullBilling.amountPaid > 0 ? `
              <div class="row">
                <span>Amount Paid:</span>
                <span>${formatCurrency(fullBilling.amountPaid)}</span>
              </div>
              ` : ''}
              ${fullBilling.balance > 0 ? `
              <div class="row">
                <span>Balance:</span>
                <span>${formatCurrency(fullBilling.balance)}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>Thank you for your payment!</p>
              <p>Keep this receipt for your records</p>
            </div>
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
    } catch (error) {
      toast.error('Failed to print receipt')
      console.error('Print error:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      patientId: '',
      visitId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0
    })
    setPatientSearch('')
    setVisitSearch('')
    setShowPatientDropdown(false)
    setShowVisitDropdown(false)
    setVisits([])
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      PAID: 'bg-green-100 text-green-800',
      UNPAID: 'bg-red-100 text-red-800',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredBillings = billings.filter(billing =>
    billing.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    billing.patient?.medicalRecordNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-sm text-gray-600">Manage patient billing and financial transactions</p>
        </div>
        <button onClick={() => { resetForm(); setEditingBilling(null); setShowModal(true) }} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Billing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Bills</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unpaid Bills</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.unpaid}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.pendingRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or medical record number..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Billings Table */}
      <div className="card p-0">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Subtotal</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBillings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No billings found
                    </td>
                  </tr>
                ) : (
                  filteredBillings.map((billing) => (
                    <tr key={billing.id} className="hover:bg-gray-50">
                      <td>
                        <div className="text-sm font-mono text-gray-900">#{billing.id}</div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">{billing.patient?.name}</div>
                        <div className="text-sm text-gray-500">{billing.patient?.medicalRecordNo}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">{formatDate(billing.createdAt)}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">{formatCurrency(billing.subtotal)}</div>
                      </td>
                      <td>
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(billing.total)}</div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(billing.status)}`}>
                          {billing.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleView(billing)}
                            className="text-primary-600 hover:text-primary-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePrint(billing)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {billing.status !== 'PAID' && (
                            <>
                              <button 
                                onClick={() => handlePayment(billing)}
                                className="text-green-600 hover:text-green-800"
                                title="Record Payment"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEdit(billing)}
                                className="text-yellow-600 hover:text-yellow-800"
                                title="Edit Billing"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {billing.status === 'UNPAID' && (
                            <button
                              onClick={() => handleDelete(billing.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete Billing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{pagination.page}</span> of{' '}
              <span className="font-medium">{pagination.pages}</span>
              {' '}({pagination.total} total billings)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {[...Array(pagination.pages)].map((_, index) => {
                  const pageNum = index + 1
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          pagination.page === pageNum
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return <span key={pageNum} className="px-2">...</span>
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Billing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBilling ? 'Edit Billing' : 'Create New Billing'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Patient <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Search patient by name or MRN..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value)
                        setShowPatientDropdown(true)
                        if (!e.target.value) {
                          setFormData(prev => ({ ...prev, patientId: '', visitId: '' }))
                          setVisits([])
                          setVisitSearch('')
                        }
                      }}
                      onFocus={() => setShowPatientDropdown(true)}
                      disabled={editingBilling}
                    />
                    {showPatientDropdown && !editingBilling && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {patients
                          .filter(patient => 
                            patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                            patient.medicalRecordNo.toLowerCase().includes(patientSearch.toLowerCase())
                          )
                          .map(patient => (
                            <div
                              key={patient.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handlePatientChange(patient.id)}
                            >
                              <div className="font-medium text-gray-900">{patient.name}</div>
                              <div className="text-sm text-gray-500">{patient.medicalRecordNo}</div>
                            </div>
                          ))
                        }
                        {patients.filter(patient => 
                          patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                          patient.medicalRecordNo.toLowerCase().includes(patientSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-sm">No patients found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {editingBilling && (
                    <p className="text-xs text-gray-500 mt-1">Patient cannot be changed when editing</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Visit (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="form-input"
                      placeholder={formData.patientId ? "Search visit by ID or type..." : "Select patient first"}
                      value={visitSearch}
                      onChange={(e) => {
                        setVisitSearch(e.target.value)
                        setShowVisitDropdown(true)
                        if (!e.target.value) {
                          setFormData(prev => ({ ...prev, visitId: '' }))
                        }
                      }}
                      onFocus={() => setShowVisitDropdown(true)}
                      disabled={!formData.patientId}
                    />
                    {showVisitDropdown && formData.patientId && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        <div
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, visitId: '' }))
                            setVisitSearch('')
                            setShowVisitDropdown(false)
                          }}
                        >
                          <div className="text-sm text-gray-600">No associated visit</div>
                        </div>
                        {visits
                          .filter(visit => 
                            visit.id.toString().includes(visitSearch.toLowerCase()) ||
                            visit.visitType.toLowerCase().includes(visitSearch.toLowerCase()) ||
                            visit.status.toLowerCase().includes(visitSearch.toLowerCase())
                          )
                          .map(visit => (
                            <div
                              key={visit.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleVisitChange(visit.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-gray-900">#{visit.id} - {visit.visitType}</span>
                                  <div className="text-sm text-gray-500">{new Date(visit.scheduledAt).toLocaleDateString()}</div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded ${
                                  visit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  visit.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                  visit.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {visit.status}
                                </span>
                              </div>
                            </div>
                          ))
                        }
                        {visits.filter(visit => 
                          visit.id.toString().includes(visitSearch.toLowerCase()) ||
                          visit.visitType.toLowerCase().includes(visitSearch.toLowerCase()) ||
                          visit.status.toLowerCase().includes(visitSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-sm">No visits found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label">Billing Items <span className="text-red-500">*</span></label>
                  <button type="button" onClick={addItem} className="text-primary-600 hover:text-primary-800 text-sm">
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Description"
                          className="form-input"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          className="form-input"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="Unit Price"
                          className="form-input"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 text-right text-sm font-medium">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="col-span-1">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium">{formatCurrency(formData.tax)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input w-32"
                      value={formData.discount}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary-600">{formatCurrency(formData.total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingBilling(null)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingBilling ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Billing Modal */}
      {showViewModal && viewingBilling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Billing Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Billing ID</label>
                  <p className="text-gray-900 font-mono">#{viewingBilling.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(viewingBilling.status)}`}>
                      {viewingBilling.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Patient</label>
                  <p className="text-gray-900">{viewingBilling.patient?.name}</p>
                  <p className="text-sm text-gray-500">{viewingBilling.patient?.medicalRecordNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-900">{formatDate(viewingBilling.createdAt)}</p>
                </div>
                {viewingBilling.visit && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Visit</label>
                    <p className="text-gray-900">#{viewingBilling.visit.id} - {viewingBilling.visit.visitType}</p>
                  </div>
                )}
                {viewingBilling.paidAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Paid At</label>
                    <p className="text-gray-900">{formatDate(viewingBilling.paidAt)}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Items</label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewingBilling.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(viewingBilling.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(viewingBilling.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium">-{formatCurrency(viewingBilling.discount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary-600">{formatCurrency(viewingBilling.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t mt-6">
              <button
                onClick={() => handlePrint(viewingBilling)}
                className="btn btn-primary inline-flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setViewingBilling(null)
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentBilling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h2>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Patient: <span className="font-medium text-gray-900">{paymentBilling.patient?.name}</span></div>
              <div className="text-sm text-gray-600">Total Amount: <span className="font-medium text-gray-900">{formatCurrency(paymentBilling.total)}</span></div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="form-label">Amount Paid (IDR) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({...paymentData, amountPaid: e.target.value})}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the amount received from the patient
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentBilling(null)
                    setPaymentData({ amountPaid: '' })
                  }}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing