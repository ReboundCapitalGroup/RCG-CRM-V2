import React, { useState } from 'react'
import { X, Plus, Trash2, User, Phone, Mail, Users } from 'lucide-react'

export default function SkipTraceModal({ leadId, defendantName, onClose, onSave }) {
  const [contact, setContact] = useState({
    full_name: defendantName || '',
    age: '',
    phones: [{ number: '', type: 'mobile' }],
    emails: [{ email: '', type: 'personal' }],
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  })
  
  const [relatives, setRelatives] = useState([])
  const [showRelatives, setShowRelatives] = useState(false)

  const addPhone = () => {
    setContact({ ...contact, phones: [...contact.phones, { number: '', type: 'mobile' }] })
  }

  const removePhone = (index) => {
    setContact({ ...contact, phones: contact.phones.filter((_, i) => i !== index) })
  }

  const updatePhone = (index, field, value) => {
    const newPhones = [...contact.phones]
    newPhones[index][field] = value
    setContact({ ...contact, phones: newPhones })
  }

  const addEmail = () => {
    setContact({ ...contact, emails: [...contact.emails, { email: '', type: 'personal' }] })
  }

  const removeEmail = (index) => {
    setContact({ ...contact, emails: contact.emails.filter((_, i) => i !== index) })
  }

  const updateEmail = (index, field, value) => {
    const newEmails = [...contact.emails]
    newEmails[index][field] = value
    setContact({ ...contact, emails: newEmails })
  }

  const addRelative = () => {
    setRelatives([...relatives, { name: '', relationship: '', phones: [{ number: '', type: 'mobile' }], emails: [] }])
  }

  const removeRelative = (index) => {
    setRelatives(relatives.filter((_, i) => i !== index))
  }

  const updateRelative = (index, field, value) => {
    const newRelatives = [...relatives]
    newRelatives[index][field] = value
    setRelatives(newRelatives)
  }

  const addRelativePhone = (relIndex) => {
    const newRelatives = [...relatives]
    newRelatives[relIndex].phones.push({ number: '', type: 'mobile' })
    setRelatives(newRelatives)
  }

  const updateRelativePhone = (relIndex, phoneIndex, field, value) => {
    const newRelatives = [...relatives]
    newRelatives[relIndex].phones[phoneIndex][field] = value
    setRelatives(newRelatives)
  }

  const handleSave = () => {
    if (!contact.full_name.trim()) {
      alert('Name is required')
      return
    }

    onSave({ contact, relatives })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <User className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Skip Trace Contact</h2>
              <p className="text-sm text-slate-400">Add contact information manually</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={contact.full_name}
                  onChange={(e) => setContact({ ...contact, full_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
                <input
                  type="number"
                  value={contact.age}
                  onChange={(e) => setContact({ ...contact, age: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="35"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-300">Phone Numbers</label>
                <button
                  onClick={addPhone}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Phone
                </button>
              </div>
              <div className="space-y-2">
                {contact.phones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="tel"
                      value={phone.number}
                      onChange={(e) => updatePhone(index, 'number', e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      placeholder="(555) 123-4567"
                    />
                    <select
                      value={phone.type}
                      onChange={(e) => updatePhone(index, 'type', e.target.value)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="mobile">Mobile</option>
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                    </select>
                    {contact.phones.length > 1 && (
                      <button
                        onClick={() => removePhone(index)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-300">Email Addresses</label>
                <button
                  onClick={addEmail}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Email
                </button>
              </div>
              <div className="space-y-2">
                {contact.emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="email"
                      value={email.email}
                      onChange={(e) => updateEmail(index, 'email', e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      placeholder="john@example.com"
                    />
                    <select
                      value={email.type}
                      onChange={(e) => updateEmail(index, 'type', e.target.value)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                    </select>
                    {contact.emails.length > 1 && (
                      <button
                        onClick={() => removeEmail(index)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                <input
                  type="text"
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                <input
                  type="text"
                  value={contact.city}
                  onChange={(e) => setContact({ ...contact, city: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Miami"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                  <input
                    type="text"
                    value={contact.state}
                    onChange={(e) => setContact({ ...contact, state: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="FL"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">ZIP</label>
                  <input
                    type="text"
                    value={contact.zip}
                    onChange={(e) => setContact({ ...contact, zip: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="33101"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                value={contact.notes}
                onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                rows={3}
                placeholder="Additional information..."
              />
            </div>

            <div className="border-t border-slate-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Relatives
                </h3>
                <button
                  onClick={addRelative}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Relative
                </button>
              </div>

              {relatives.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No relatives added yet</p>
              ) : (
                <div className="space-y-4">
                  {relatives.map((relative, relIndex) => (
                    <div key={relIndex} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-white font-medium">Relative #{relIndex + 1}</h4>
                        <button
                          onClick={() => removeRelative(relIndex)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={relative.name}
                          onChange={(e) => updateRelative(relIndex, 'name', e.target.value)}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={relative.relationship}
                          onChange={(e) => updateRelative(relIndex, 'relationship', e.target.value)}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                          placeholder="Relationship (e.g., Spouse, Child)"
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        {relative.phones.map((phone, phoneIndex) => (
                          <div key={phoneIndex} className="flex gap-2">
                            <input
                              type="tel"
                              value={phone.number}
                              onChange={(e) => updateRelativePhone(relIndex, phoneIndex, 'number', e.target.value)}
                              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                              placeholder="Phone"
                            />
                            <select
                              value={phone.type}
                              onChange={(e) => updateRelativePhone(relIndex, phoneIndex, 'type', e.target.value)}
                              className="px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                            >
                              <option value="mobile">Mobile</option>
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                            </select>
                          </div>
                        ))}
                        <button
                          onClick={() => addRelativePhone(relIndex)}
                          className="text-sm text-amber-400 hover:text-amber-300"
                        >
                          + Add Phone
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700"
          >
            Save Contact
          </button>
        </div>
      </div>
    </div>
  )
}
