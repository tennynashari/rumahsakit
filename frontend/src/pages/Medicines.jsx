import React, { useState, useEffect } from 'react'
import { medicineService } from '../services'
import { Pill, Plus, Edit, Trash2, Search, Package, AlertTriangle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const Medicines = () => {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [viewingMedicine, setViewingMedicine] = useState(null)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    price: '',
    isActive: true
  })
  const [batchData, setBatchData] = useState({
    batchNo: '',
    stock: '',
    expiryDate: ''
  })

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async (page = pagination.page) => {
    try {
      setLoading(true)
      const response = await medicineService.getMedicines({ page, limit: pagination.limit })
      setMedicines(response.data.medicines || [])
      setPagination(prev => ({
        ...prev,
        page: response.data.pagination?.page || page,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      }))
    } catch (error) {
      toast.error('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchMedicines(newPage)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      if (editingMedicine) {
        await medicineService.updateMedicine(editingMedicine.id, formData)
        toast.success('Medicine updated successfully')
      } else {
        await medicineService.createMedicine(formData)
        toast.success('Medicine created successfully')
      }
      setShowModal(false)
      setEditingMedicine(null)
      resetForm()
      fetchMedicines()
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${editingMedicine ? 'update' : 'create'} medicine`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBatchSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await medicineService.addBatch(selectedMedicine.id, batchData)
      toast.success('Batch added successfully')
      setShowBatchModal(false)
      setBatchData({ batchNo: '', stock: '', expiryDate: '' })
      fetchMedicines()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add batch')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      name: medicine.name,
      description: medicine.description || '',
      unit: medicine.unit,
      price: medicine.price,
      isActive: medicine.isActive
    })
    setShowModal(true)
  }

  const handleView = async (medicine) => {
    try {
      const response = await medicineService.getMedicine(medicine.id)
      setViewingMedicine(response.data.medicine)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Failed to load medicine details')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineService.deleteMedicine(id)
        toast.success('Medicine deleted successfully')
        fetchMedicines()
      } catch (error) {
        toast.error('Failed to delete medicine')
      }
    }
  }

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await medicineService.deleteBatch(batchId)
        toast.success('Batch deleted successfully')
        const response = await medicineService.getMedicine(viewingMedicine.id)
        setViewingMedicine(response.data.medicine)
        fetchMedicines()
      } catch (error) {
        toast.error('Failed to delete batch')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      unit: '',
      price: '',
      isActive: true
    })
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
      day: 'numeric'
    })
  }

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.description && medicine.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const stats = {
    total: medicines.length,
    inStock: medicines.filter(m => m.totalStock > 0).length,
    lowStock: medicines.filter(m => m.totalStock > 0 && m.totalStock < 20).length,
    outOfStock: medicines.filter(m => m.totalStock === 0).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy & Medicines</h1>
          <p className="text-sm text-gray-600">Manage medicine inventory and stock</p>
        </div>
        <button onClick={() => { resetForm(); setEditingMedicine(null); setShowModal(true) }} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Medicines</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inStock}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.outOfStock}</p>
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
            placeholder="Search by medicine name or description..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Medicines Table */}
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
                  <th>Medicine Name</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No medicines found
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td>
                        <div className="text-sm font-mono text-gray-900">#{medicine.id}</div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        {medicine.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{medicine.description}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-gray">{medicine.unit}</span>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">{formatCurrency(medicine.price)}</div>
                      </td>
                      <td>
                        <div className="text-sm font-semibold text-gray-900">{medicine.totalStock || 0}</div>
                      </td>
                      <td>
                        {medicine.isActive ? (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">Inactive</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleView(medicine)}
                            className="text-primary-600 hover:text-primary-800"
                            title="View Details & Batches"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(medicine)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit Medicine"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedMedicine(medicine)
                              setShowBatchModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Add Batch"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(medicine.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              {' '}({pagination.total} total medicines)
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

      {/* Add/Edit Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Medicine Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Paracetamol"
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Medicine description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Unit <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="e.g., Tablet, Capsule"
                  />
                </div>

                <div>
                  <label className="form-label">Price (IDR) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {editingMedicine && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingMedicine(null)
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
                  {submitting ? 'Saving...' : editingMedicine ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {showBatchModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add Batch - {selectedMedicine.name}
            </h2>
            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div>
                <label className="form-label">Batch Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={batchData.batchNo}
                  onChange={(e) => setBatchData({...batchData, batchNo: e.target.value})}
                  placeholder="e.g., BATCH-2026-001"
                />
              </div>

              <div>
                <label className="form-label">Stock Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  className="form-input"
                  value={batchData.stock}
                  onChange={(e) => setBatchData({...batchData, stock: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="form-label">Expiry Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={batchData.expiryDate}
                  onChange={(e) => setBatchData({...batchData, expiryDate: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchModal(false)
                    setSelectedMedicine(null)
                    setBatchData({ batchNo: '', stock: '', expiryDate: '' })
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
                  {submitting ? 'Adding...' : 'Add Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Medicine Details Modal */}
      {showViewModal && viewingMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Medicine Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Medicine ID</label>
                  <p className="text-gray-900 font-mono">#{viewingMedicine.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{viewingMedicine.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Unit</label>
                  <p className="text-gray-900">{viewingMedicine.unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <p className="text-gray-900">{formatCurrency(viewingMedicine.price)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Stock</label>
                  <p className="text-gray-900 font-semibold">{viewingMedicine.totalStock || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p>
                    {viewingMedicine.isActive ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">Inactive</span>
                    )}
                  </p>
                </div>
              </div>

              {viewingMedicine.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Description</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{viewingMedicine.description}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Batches</label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch No</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewingMedicine.batches && viewingMedicine.batches.length > 0 ? (
                        viewingMedicine.batches.map((batch) => (
                          <tr key={batch.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{batch.batchNo}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{batch.stock}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatDate(batch.expiryDate)}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleDeleteBatch(batch.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                            No batches available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setViewingMedicine(null)
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Medicines