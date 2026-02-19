import React, { useState, useEffect } from 'react'
import { Search, LogOut, Eye, Plus, Upload, Download, Users as UsersIcon, FileText, DollarSign, Calendar, TrendingUp, MapPin, User, ArrowUpDown, Trash2 } from 'lucide-react'
import { supabase } from './supabase'
import SkipTraceModal from './SkipTraceModal'
import ContactsSection from './ContactsSection'

export default function App() {
  const [user, setUser] = useState(null)
  const [leads, setLeads] = useState([])
  const [users, setUsers] = useState([])
  const [view, setView] = useState('login')
  const [selectedLead, setSelectedLead] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: 'all', type: 'all', county: 'all', state: 'all' })
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadText, setUploadText] = useState('')
  const [showSkipTrace, setShowSkipTrace] = useState(false)
  const [leadContacts, setLeadContacts] = useState([])
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [editingNote, setEditingNote] = useState(null)
  const [editNoteText, setEditNoteText] = useState('')

  useEffect(() => {
    if (user) loadData()
  }, [user])

  useEffect(() => {
    if (user?.role !== 'admin') {
      const style = document.createElement('style')
      style.innerHTML = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        input, textarea {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
      `
      document.head.appendChild(style)
      
      document.addEventListener('contextmenu', (e) => e.preventDefault())
      document.addEventListener('copy', (e) => e.preventDefault())
      document.addEventListener('cut', (e) => e.preventDefault())
      
      const originalLog = console.log
      console.log = () => {}
      
      return () => {
        document.head.removeChild(style)
        console.log = originalLog
      }
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [leadsRes, usersRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*')
      ])
      
      if (leadsRes.data) setLeads(leadsRes.data)
      if (usersRes.data) setUsers(usersRes.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const loadNotes = async (leadId) => {
    const { data } = await supabase.from('notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
    return data || []
  }

  const loadContacts = async (leadId) => {
    const { data: contacts } = await supabase
      .from('contacts')
      .select(`
        *,
        phones:phone_numbers(*),
        emails:emails(*),
        addresses:addresses(*),
        relatives:relatives(*, relative:relative_contact_id(*))
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    
    return contacts || []
  }

  const saveSkipTrace = async (data) => {
    const { contact, relatives } = data
    
    try {
      const contactData = {
        lead_id: selectedLead.id,
        full_name: contact.full_name,
        first_name: contact.full_name.split(' ')[0],
        last_name: contact.full_name.split(' ').slice(-1)[0],
        contact_type: 'defendant',
        age: contact.age || null,
        current_address: contact.address || null,
        current_city: contact.city || null,
        current_state: contact.state || null,
        skip_traced: true,
        skip_trace_date: new Date().toISOString(),
        data_source: 'manual',
        notes: contact.notes || null
      }
      
      const { data: insertedContact } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single()
      
      if (insertedContact) {
        const phones = contact.phones
          .filter(p => p.number.trim())
          .map((p, i) => ({
            contact_id: insertedContact.id,
            phone_number: p.number,
            phone_type: p.type,
            is_primary: i === 0,
            data_source: 'manual'
          }))
        
        if (phones.length > 0) {
          await supabase.from('phone_numbers').insert(phones)
        }
        
        const emails = contact.emails
          .filter(e => e.email.trim())
          .map((e, i) => ({
            contact_id: insertedContact.id,
            email_address: e.email,
            email_type: e.type,
            is_primary: i === 0,
            data_source: 'manual'
          }))
        
        if (emails.length > 0) {
          await supabase.from('emails').insert(emails)
        }
        
        if (contact.address) {
          await supabase.from('addresses').insert([{
            contact_id: insertedContact.id,
            street_address: contact.address,
            city: contact.city,
            state: contact.state,
            zip_code: contact.zip,
            address_type: 'current',
            is_current: true,
            data_source: 'manual'
          }])
        }
        
        for (const relative of relatives) {
          if (!relative.name.trim()) continue
          
          const relData = {
            lead_id: selectedLead.id,
            full_name: relative.name,
            first_name: relative.name.split(' ')[0],
            last_name: relative.name.split(' ').slice(-1)[0],
            contact_type: 'relative',
            relationship: relative.relationship,
            skip_traced: false,
            data_source: 'manual'
          }
          
          const { data: relContact } = await supabase
            .from('contacts')
            .insert([relData])
            .select()
            .single()
          
          if (relContact) {
            await supabase.from('relatives').insert([{
              contact_id: insertedContact.id,
              relative_contact_id: relContact.id,
              relationship_type: relative.relationship || 'relative',
              data_source: 'manual'
            }])
            
            const relPhones = relative.phones
              .filter(p => p.number.trim())
              .map(p => ({
                contact_id: relContact.id,
                phone_number: p.number,
                phone_type: p.type,
                data_source: 'manual'
              }))
            
            if (relPhones.length > 0) {
              await supabase.from('phone_numbers').insert(relPhones)
            }
          }
        }
        
        await supabase
          .from('leads')
          .update({
            skip_trace_status: 'completed',
            skip_trace_date: new Date().toISOString(),
            primary_contact_id: insertedContact.id
          })
          .eq('id', selectedLead.id)
        
        const updatedContacts = await loadContacts(selectedLead.id)
        setLeadContacts(updatedContacts)
        setShowSkipTrace(false)
        
        alert('Contact saved successfully!')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save contact: ' + err.message)
    }
  }

  const login = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('username', form.get('username'))
      .eq('password', form.get('password'))
      .single()
    
    if (data) {
      setUser(data)
      setView('dashboard')
    } else {
      alert('Invalid credentials')
    }
  }

  const logout = () => {
    setUser(null)
    setView('login')
    setSelectedLead(null)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('leads').update({ status, last_modified: new Date().toISOString() }).eq('id', id)
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l))
    if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status })
  }

  const assign = async (id, userId) => {
    await supabase.from('leads').update({ assigned_to: userId, last_modified: new Date().toISOString() }).eq('id', id)
    setLeads(leads.map(l => l.id === id ? { ...l, assigned_to: userId } : l))
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, assigned_to: userId })
    }
  }

  const deleteLead = async (id, caseName) => {
    try {
      await supabase.from('leads').delete().eq('id', id)
      setLeads(leads.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete lead')
    }
  }

  const addNote = async () => {
    if (!note.trim() || !selectedLead) return
    const newNote = {
      lead_id: selectedLead.id,
      text: note,
      author: user.name,
      created_at: new Date().toISOString()
    }
    await supabase.from('notes').insert([newNote])
    setNote('')
    const notes = await loadNotes(selectedLead.id)
    setSelectedLead({ ...selectedLead, notes })
  }

  const updateNote = async (noteId, newText) => {
    if (!newText.trim()) return
    await supabase.from('notes').update({ text: newText }).eq('id', noteId)
    const notes = await loadNotes(selectedLead.id)
    setSelectedLead({ ...selectedLead, notes })
    setEditingNote(null)
    setEditNoteText('')
  }

  const deleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return
    await supabase.from('notes').delete().eq('id', noteId)
    const notes = await loadNotes(selectedLead.id)
    setSelectedLead({ ...selectedLead, notes })
  }

  const uploadLeads = async () => {
    if (!uploadText.trim()) return alert('Paste JSON data')
    try {
      const data = JSON.parse(uploadText)
      const formatted = data.map(l => ({
        id: l.id,
        case_number: l.caseNumber,
        county: l.county,
        lead_type: l.leadType,
        auction_date: l.auctionDate,
        property_address: l.propertyAddress,
        property_city: l.propertyCity,
        property_zip: l.propertyZip,
        assessed_value: l.assessedValue,
        judgment_amount: l.judgmentAmount,
        sold_amount: l.soldAmount,
        surplus: l.surplus,
        defendants: l.defendants,
        plaintiffs: l.plaintiffs,
        parcel_id: l.parcelId,
        case_url: l.caseUrl,
        zillow_url: l.zillowUrl,
        property_appraiser_url: l.propertyAppraiserUrl,
        status: l.status || 'New'
      }))
      await supabase.from('leads').upsert(formatted)
      loadData()
      setUploadText('')
      alert(`Uploaded ${data.length} leads!`)
    } catch {
      alert('Invalid JSON')
    }
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `leads_${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const viewLead = async (lead) => {
    const [notes, contacts] = await Promise.all([
      loadNotes(lead.id),
      loadContacts(lead.id)
    ])
    setSelectedLead({ ...lead, notes })
    setLeadContacts(contacts)
    setView('detail')
  }

  const filtered = leads.filter(l => {
    if (user?.role !== 'admin' && l.assigned_to !== user?.id) return false
    if (filters.status !== 'all' && l.status !== filters.status) return false
    if (filters.type !== 'all' && l.lead_type !== filters.type) return false
    if (filters.county !== 'all' && l.county !== filters.county) return false
    if (filters.state !== 'all') {
      const county = l.county || ''
      if (county.includes('-')) {
        const stateCode = county.split('-')[0].trim()
        if (stateCode !== filters.state) return false
      } else {
        return false
      }
    }
    if (search) {
      const s = search.toLowerCase()
      return (l.case_number?.toLowerCase().includes(s)) ||
             (l.property_address?.toLowerCase().includes(s)) ||
             (l.county?.toLowerCase().includes(s)) ||
             (l.defendants?.toLowerCase().includes(s))
    }
    return true
  })

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.auction_date ? new Date(a.auction_date) : new Date(0)
      const dateB = b.auction_date ? new Date(b.auction_date) : new Date(0)
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    }
    if (sortBy === 'surplus') {
      const surpA = parseFloat((a.surplus || '0').replace(/[$,]/g, ''))
      const surpB = parseFloat((b.surplus || '0').replace(/[$,]/g, ''))
      return sortOrder === 'desc' ? surpB - surpA : surpA - surpB
    }
    return 0
  })

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    interested: leads.filter(l => l.status === 'Interested').length,
    surplus: leads.filter(l => l.lead_type === 'Surplus').length,
    future: leads.filter(l => l.lead_type === 'Future Auction').length,
    totalSurplus: leads.reduce((sum, l) => {
      if (l.surplus && l.status !== 'Dead') {
        const amount = parseFloat(l.surplus.replace(/[$,]/g, ''))
        return sum + (amount > 0 ? amount : 0)
      }
      return sum
    }, 0)
  }

  const counties = [...new Set(leads.map(l => l.county))].filter(Boolean).sort()
  const states = [...new Set(leads.map(l => {
    const county = l.county || ''
    if (county.includes('-')) {
      const stateCode = county.split('-')[0].trim()
      if (stateCode.length === 2) return stateCode.toUpperCase()
    }
    return null
  }))].filter(Boolean).sort()

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-amber-400 text-xl">Loading...</div>
    </div>
  )

  if (view === 'login') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Ctext x='10' y='60' font-family='Arial' font-size='40' font-weight='bold' fill='%233b82f6'%3ERCG%3C/text%3E%3Cpath d='M 150 20 L 180 50 L 150 80' stroke='%233b82f6' stroke-width='8' fill='none'/%3E%3C/svg%3E" alt="RCG" className="w-32 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Rebound Capital Group</h1>
          <p className="text-slate-400">Lead Management System</p>
        </div>
        <form onSubmit={login} className="space-y-4">
          <input name="username" placeholder="Username" className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500" required />
          <input name="password" type="password" placeholder="Password" className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500" required />
          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700">Sign In</button>
        </form>
      </div>
    </div>
  )

  if (view === 'admin') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-white">← Back</button>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <button onClick={logout} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" /> Upload Leads
          </h2>
          <textarea value={uploadText} onChange={e => setUploadText(e.target.value)} placeholder='Paste JSON: [{"id":"LEAD_00001",...}]' className="w-full h-64 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500" />
          <button onClick={uploadLeads} className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700">Upload</button>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-amber-400" /> Users
          </h2>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-slate-400 text-sm">@{u.username} • {u.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {u.role.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (view === 'detail' && selectedLead) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-white">← Back</button>
          <button onClick={logout} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${selectedLead.lead_type === 'Surplus' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {selectedLead.lead_type}
                  </span>
                  <h1 className="text-3xl font-bold text-white mb-2">{selectedLead.property_address}</h1>
                  <p className="text-slate-400">{selectedLead.county} • {selectedLead.case_number}</p>
                </div>
                <select value={selectedLead.status} onChange={e => updateStatus(selectedLead.id, e.target.value)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg">
                  <option>New</option><option>Contacted</option><option>Interested</option><option>Not Interested</option><option>Dead</option>
                </select>
              </div>
              {selectedLead.surplus && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold">Surplus</span>
                    <span className="text-2xl font-bold text-emerald-400">{selectedLead.surplus}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-amber-400" /> Case Parties
              </h2>
              {selectedLead.defendants && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-300 mb-2">Defendants:</p>
                  <div className="space-y-2">
                    {selectedLead.defendants.split(';').map((def, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                        <p className="text-white font-medium">{def.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedLead.plaintiffs && (
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-2">Plaintiffs:</p>
                  <div className="space-y-2">
                    {selectedLead.plaintiffs.split(';').map((plt, i) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg border border-blue-500/20">
                        <p className="text-white font-medium">{plt.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" /> Property Details
              </h2>
              <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Property Address</p>
                <p className="text-white font-semibold text-lg">{selectedLead.property_address}</p>
                {selectedLead.property_city && (
                  <p className="text-slate-300 text-sm">
                    {selectedLead.property_city}
                    {selectedLead.property_zip && `, ${selectedLead.property_zip}`}
                  </p>
                )}
              </div>
              {selectedLead.parcel_id && (
                <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Parcel ID</p>
                  <p className="text-white font-mono">{selectedLead.parcel_id}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Assessed Value</p>
                  <p className="text-white font-semibold text-lg">{selectedLead.assessed_value || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Judgment Amount</p>
                  <p className="text-white font-semibold text-lg">{selectedLead.judgment_amount || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Sold Amount</p>
                  <p className="text-white font-semibold text-lg">{selectedLead.sold_amount || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Auction Date</p>
                  <p className="text-white font-semibold">{selectedLead.auction_date || 'N/A'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedLead.case_url && (
                  <a href={selectedLead.case_url} target="_blank" rel="noopener noreferrer" 
                     className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium">
                    View Case →
                  </a>
                )}
                {selectedLead.zillow_url && (
                  <a href={selectedLead.zillow_url} target="_blank" rel="noopener noreferrer" 
                     className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium">
                    View on Zillow →
                  </a>
                )}
                {selectedLead.property_appraiser_url && (
                  <a href={selectedLead.property_appraiser_url} target="_blank" rel="noopener noreferrer" 
                     className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium">
                    Property Appraiser →
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {user?.role === 'admin' && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Assign</h3>
                <select value={selectedLead.assigned_to || ''} onChange={e => assign(selectedLead.id, e.target.value || null)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg">
                  <option value="">Unassigned</option>
                  {users.filter(u => u.role === 'user').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                Contacts
              </h3>
              <ContactsSection 
                contacts={leadContacts}
                lead={selectedLead}
                onSkipTrace={(selected) => {
                  setSelectedTarget(selected)
                  setShowSkipTrace(true)
                }}
              />
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Notes</h3>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {(selectedLead.notes || []).map(n => (
                  <div key={n.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-slate-400 text-xs font-medium">{n.author}</span>
                      <div className="flex gap-2">
                        <span className="text-slate-500 text-xs">{new Date(n.created_at).toLocaleDateString()}</span>
                        <button 
                          onClick={() => {
                            setEditingNote(n.id)
                            setEditNoteText(n.text)
                          }}
                          className="text-amber-400 text-xs hover:underline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteNote(n.id)}
                          className="text-red-400 text-xs hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {editingNote === n.id ? (
                      <div className="space-y-2">
                        <textarea 
                          value={editNoteText}
                          onChange={e => setEditNoteText(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateNote(n.id, editNoteText)}
                            className="px-3 py-1 bg-amber-500 text-white rounded text-xs"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => {
                              setEditingNote(null)
                              setEditNoteText('')
                            }}
                            className="px-3 py-1 bg-slate-600 text-white rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white text-sm">{n.text}</p>
                    )}
                  </div>
                ))}
              </div>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add note..." className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:border-amber-500" rows={3} />
              <button onClick={addNote} className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700">Add Note</button>
            </div>
          </div>
        </div>
      </div>
      {showSkipTrace && (
        <SkipTraceModal
          leadId={selectedLead.id}
          defendantName={selectedTarget?.name || selectedLead.defendants?.split(';')[0]?.trim()}
          onClose={() => {
            setShowSkipTrace(false)
            setSelectedTarget(null)
          }}
          onSave={saveSkipTrace}
        />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Rebound Capital Group</h1>
              <p className="text-xs text-slate-400">Lead Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <>
                <button onClick={() => setView('admin')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" /> Admin
                </button>
                <button onClick={exportData} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export
                </button>
              </>
            )}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg">
              <span className="text-white font-medium">{user?.name}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${user?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <button onClick={logout} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total</span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">New</span>
              <Plus className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.new}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Contacted</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400">{stats.contacted}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Interested</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{stats.interested}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Surplus</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{stats.surplus}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Future</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.future}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 col-span-2 md:col-span-3 lg:col-span-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-slate-400 text-xs font-medium">Total Recoverable</span>
                <p className="text-3xl font-bold text-emerald-400">
                  ${stats.totalSurplus.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400 opacity-50" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-slate-400 text-sm">Sort by:</span>
          <button 
            onClick={() => {
              if (sortBy === 'date') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
              } else {
                setSortBy('date')
                setSortOrder('desc')
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${sortBy === 'date' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button 
            onClick={() => {
              if (sortBy === 'surplus') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
              } else {
                setSortBy('surplus')
                setSortOrder('desc')
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${sortBy === 'surplus' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Surplus {sortBy === 'surplus' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
            </div>
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-lg">
              <option value="all">All Statuses</option>
              <option>New</option><option>Contacted</option><option>Interested</option><option>Not Interested</option><option>Dead</option>
            </select>
            <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} className="px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-lg">
              <option value="all">All Types</option>
              <option>Surplus</option>
              <option>Future Auction</option>
            </select>
            <select value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })} className="px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-lg">
              <option value="all">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.county} onChange={e => setFilters({ ...filters, county: e.target.value })} className="px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-lg">
              <option value="all">All Counties</option>
              {counties.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {selectedLeads.length > 0 && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 mb-4 flex items-center justify-between">
            <span className="text-white font-medium">{selectedLeads.length} leads selected</span>
            <div className="flex gap-2">
              {user?.role === 'admin' && (
                <>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        selectedLeads.forEach(id => assign(id, e.target.value))
                        setSelectedLeads([])
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg"
                  >
                    <option value="">Assign to...</option>
                    {users.filter(u => u.role === 'user').map(u => 
                      <option key={u.id} value={u.id}>{u.name}</option>
                    )}
                  </select>
                  <button 
                    onClick={() => {
                      if (window.confirm(`Delete ${selectedLeads.length} leads?`)) {
                        selectedLeads.forEach(id => {
                          const lead = leads.find(l => l.id === id)
                          deleteLead(id, lead?.case_number)
                        })
                        setSelectedLeads([])
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Delete Selected
                  </button>
                </>
              )}
              <button 
                onClick={() => setSelectedLeads([])}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700/50">
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300" style={{width: '40px'}}>
                  <input 
                    type="checkbox"
                    checked={sortedFiltered.length > 0 && selectedLeads.length === sortedFiltered.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads(sortedFiltered.map(l => l.id))
                      } else {
                        setSelectedLeads([])
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                  />
                </th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300" style={{width: '110px'}}>Case #</th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300" style={{width: '90px'}}>County</th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300">Property</th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300" style={{width: '60px'}}>Type</th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300" style={{width: '75px'}}>Date</th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300" style={{width: '90px'}}>Surplus</th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300" style={{width: '75px'}}>Status</th>
                <th className="text-left px-2 py-2 text-xs font-semibold text-slate-300" style={{width: '120px'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiltered.map((l, i) => (
                <tr key={l.id} className={`border-b border-slate-700/30 hover:bg-slate-700/30 ${i % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                  <td className="px-2 py-2" style={{width: '40px'}}>
                    <input 
                      type="checkbox"
                      checked={selectedLeads.includes(l.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads([...selectedLeads, l.id])
                        } else {
                          setSelectedLeads(selectedLeads.filter(id => id !== l.id))
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                    />
                  </td>
                  <td className="px-2 py-2 text-white font-mono text-xs truncate" style={{width: '110px'}}>{l.case_number}</td>
                  <td className="px-2 py-2 text-slate-300 text-xs truncate" style={{width: '90px'}}>{l.county?.split('-')[1] || l.county}</td>
                  <td className="px-2 py-2 text-white text-xs truncate">{l.property_address}</td>
                  <td className="px-2 py-2" style={{width: '60px'}}>
                    <span className={`px-1 py-0.5 rounded text-xs font-semibold block text-center ${l.lead_type === 'Surplus' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {l.lead_type === 'Surplus' ? 'Surp' : 'Futr'}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-slate-300 text-xs" style={{width: '75px'}}>{l.auction_date ? new Date(l.auction_date).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: '2-digit'}) : '—'}</td>
                  <td className="px-2 py-2 text-emerald-400 font-semibold text-xs truncate" style={{width: '90px'}}>{l.surplus || '—'}</td>
                  <td className="px-2 py-2" style={{width: '75px'}}>
                    <span className={`px-1 py-0.5 rounded text-xs font-semibold block text-center ${
                      l.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                      l.status === 'Contacted' ? 'bg-amber-500/20 text-amber-400' :
                      l.status === 'Interested' ? 'bg-emerald-500/20 text-emerald-400' :
                      l.status === 'Not Interested' ? 'bg-slate-500/20 text-slate-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{l.status === 'Not Interested' ? 'NoInt' : l.status}</span>
                  </td>
                  <td className="px-2 py-2" style={{width: '120px'}}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => viewLead(l)} className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      {user?.role === 'admin' && (
                        <button onClick={() => {
                          if (window.confirm(`Delete ${l.case_number}?`)) {
                            deleteLead(l.id, l.case_number)
                          }
                        }} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">
                          Del
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedFiltered.length === 0 && <div className="text-center py-12 text-slate-400">No leads found</div>}
        </div>
      </div>
    </div>
  )
}
