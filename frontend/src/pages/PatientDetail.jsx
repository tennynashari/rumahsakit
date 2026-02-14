import React from 'react'
import { useParams } from 'react-router-dom'

const PatientDetail = () => {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900">Patient Detail</h1>
        <p className="text-gray-600">Patient ID: {id}</p>
        <p className="text-sm text-yellow-600 mt-4">
          🚧 This page is under development. Patient detail view will show comprehensive patient information, medical history, visits, and records.
        </p>
      </div>
    </div>
  )
}

export default PatientDetail