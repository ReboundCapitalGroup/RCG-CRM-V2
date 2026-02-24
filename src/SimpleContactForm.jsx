import React, { useState } from 'react'
import { Trash2, Edit2, Plus, X } from 'lucide-react'

export default function SimpleContactForm({ leadId, contacts, onSave, onDelete }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    secondary_phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    social_media: '',
    additional_info: ''
  })

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      phone: '',
      secondary_phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      social_media: '',
      additional_info: ''
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (contact) => {
    setFormData({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      date_of_birth: contact.date_of_birth || '',
      phone: contact.phone || '',
      secondary_phone: contact.secondary_phone || '',
      email: contact.email || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      zip: contact.zip || '',
      social_media: contact.social_media || '',
      additional_info: contact.additional_info || ''
    })
    setEditingId(contact.id)
    setIsAdding(true)
  }

  const handleSave = async () => {
    if (!formData.first_name.trim() && !formData.last_name.trim()) {
      alert('Please enter at least a first or last name')
      return
    }
    
    await onSave(formData, editingId)
    resetForm()
  }

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">
              {editingId ? 'Edit Contact' : 'Add New Contact'}
            </h4>
            <button onClick={resetForm} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Secondary Phone</label>
              <input
                type="tel"
                value={formData.secondary_phone}
                onChange={e => setFormData({...formData, secondary_phone: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                maxLength={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm uppercase"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">ZIP</label>
              <input
                type="text"
                value={formData.zip}
                onChange={e => setFormData({...formData, zip: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Social Media</label>
              <input
                type="text"
                value={formData.social_media}
                onChange={e => setFormData({...formData, social_media: e.target.value})}
                placeholder="Facebook, Instagram, etc."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Additional Information</label>
              <textarea
                value={formData.additional_info}
                onChange={e => setFormData({...formData, additional_info: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded font-semibold"
            >
              {editingId ? 'Update Contact' : 'Save Contact'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Contact Information
        </button>
      )}

      {/* Saved Contacts List */}
      {contacts && contacts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-400">Saved Contacts ({contacts.length})</h4>
          {contacts.map(contact => (
            <div key={contact.id} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-lg">
                    {contact.first_name} {contact.last_name}
                  </p>
                  {contact.date_of_birth && (
                    <p className="text-slate-400 text-sm">DOB: {contact.date_of_birth}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this contact?')) {
                        onDelete(contact.id)
                      }
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {contact.phone && (
                  <div className="text-slate-300">
                    <span className="text-slate-500">Phone:</span> {contact.phone}
                  </div>
                )}
                {contact.secondary_phone && (
                  <div className="text-slate-300">
                    <span className="text-slate-500">2nd Phone:</span> {contact.secondary_phone}
                  </div>
                )}
                {contact.email && (
                  <div className="text-slate-300 col-span-2">
                    <span className="text-slate-500">Email:</span> {contact.email}
                  </div>
                )}
                {contact.address && (
                  <div className="text-slate-300 col-span-2">
                    <span className="text-slate-500">Address:</span> {contact.address}
                    {contact.city && `, ${contact.city}`}
                    {contact.state && `, ${contact.state}`}
                    {contact.zip && ` ${contact.zip}`}
                  </div>
                )}
                {contact.social_media && (
                  <div className="text-slate-300 col-span-2">
                    <span className="text-slate-500">Social:</span> {contact.social_media}
                  </div>
                )}
                {contact.additional_info && (
                  <div className="text-slate-300 col-span-2">
                    <span className="text-slate-500">Notes:</span> {contact.additional_info}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
