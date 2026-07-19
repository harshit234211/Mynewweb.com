import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, XCircle, Save, Repeat, Clock, Image as ImageIcon } from 'lucide-react';

const GAME_CATEGORIES = [
  { id: 'BR Survival',      label: 'BR SURVIVAL' },
  { id: 'BR Per Kill',      label: 'BR PER KILL' },
  { id: 'Lone Wolf 1v1',    label: 'LONE WOLF 1V1' },
  { id: 'Lone Wolf 2v2',    label: 'LONE WOLF 2V2' },
  { id: 'Clash Squad 1v1',  label: 'CLASH SQUAD 1V1' },
  { id: 'Clash Squad 2v2',  label: 'CLASH SQUAD 2V2' },
  { id: 'Clash Squad 4v4',  label: 'CLASH SQUAD 4V4' },
  { id: 'CS Headshot',      label: 'CS HEADSHOT' },
  { id: 'UMP Only',         label: 'UMP ONLY' },
  { id: 'MP40 Only',        label: 'MP40 ONLY' },
  { id: 'Sniper Only',      label: 'SNIPER ONLY' },
  { id: 'Free Tournament',  label: 'FREE TOURNAMENT' },
  { id: 'Other',            label: 'OTHER MATCHES' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TemplatesManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    title: '', category: 'BR Survival', entryFee: 0, prizePool: 0, perKill: 0, totalSlots: 48,
    durationMins: 15, autoRepeat: true, repeatIntervalMins: 30, startTime: '09:00 AM', endTime: '11:00 PM',
    bannerUrl: '', status: 'active', rules: '', teamType: 'Solo', mode: 'Solo', map: 'Bermuda'
  });

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/templates`);
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openNew = () => {
    setFormData({
      title: 'New Tournament', category: 'BR Survival', entryFee: 10, prizePool: 50, perKill: 0, totalSlots: 48,
      durationMins: 15, autoRepeat: true, repeatIntervalMins: 30, startTime: '09:00 AM', endTime: '11:00 PM',
      bannerUrl: '', status: 'active', rules: '', teamType: 'Solo', mode: 'Solo', map: 'Bermuda'
    });
    setEditingTemplate(null);
    setShowModal(true);
  };

  const openEdit = (tmpl) => {
    setFormData({ ...tmpl });
    setEditingTemplate(tmpl);
    setShowModal(true);
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm("Are you sure? This will delete future empty matches for this template.")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingTemplate ? 'PUT' : 'POST';
      const url = editingTemplate ? `${API_URL}/templates/${editingTemplate._id}` : `${API_URL}/templates`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchTemplates();
        alert("Template saved successfully! Future tournaments are instantly regenerated.");
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.msg || 'Failed to save template'));
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm mt-4 border border-gray-100">
      <div className="flex justify-between items-center border-b pb-4 border-gray-100">
        <div>
          <h3 className="font-bold text-lg text-[#132040] flex items-center gap-2">
            <Repeat className="w-5 h-5 text-blue-500" /> Auto Templates
          </h3>
          <p className="text-xs text-gray-500 mt-1">Configure automated daily tournament generation</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1 active:scale-95 transition shadow-md shadow-blue-600/20">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="text-center py-4 text-gray-400 font-medium">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-semibold mb-2">No active templates found.</p>
            <p className="text-xs text-gray-400">Create one to start automatically generating daily tournaments!</p>
          </div>
        ) : templates.map(t => (
          <div key={t._id} className={\`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-colors \${t.status === 'active' ? 'bg-white border-gray-200 shadow-sm hover:border-blue-300' : 'bg-gray-50 border-gray-100 opacity-60'}\`}>
            
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className={\`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider \${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}\`}>{t.status}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{t.category}</span>
                <h4 className="font-bold text-base text-gray-900">{t.title}</h4>
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs mt-3">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Fee / Prize</span>
                  <span className="font-semibold text-gray-800">🪙 {t.entryFee} / 🪙 {t.prizePool}</span>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="flex flex-col">
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Time Window</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><Clock className="w-3 h-3" /> {t.startTime} - {t.endTime}</span>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="flex flex-col">
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Interval</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><Repeat className="w-3 h-3 text-blue-500" /> {t.autoRepeat ? \`Every \${t.repeatIntervalMins} mins\` : 'Once'}</span>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="flex flex-col">
                  <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Duration</span>
                  <span className="font-semibold text-gray-800">{t.durationMins} mins</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button onClick={() => openEdit(t)} className="flex-1 md:flex-none justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => deleteTemplate(t._id)} className="flex-1 md:flex-none justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#042e5a] to-[#132040] p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-bold text-lg">{editingTemplate ? 'Edit Template' : 'Create Template'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto grow space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Template Name</label>
                  <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none transition" 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Category (Game Mode)</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:border-blue-500 outline-none transition bg-white"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {GAME_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Entry Fee (🪙)</label>
                  <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900" 
                    value={formData.entryFee} onChange={e => setFormData({...formData, entryFee: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Prize Pool (🪙)</label>
                  <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-[#f5c518]" 
                    value={formData.prizePool} onChange={e => setFormData({...formData, prizePool: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Per Kill (🪙)</label>
                  <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900" 
                    value={formData.perKill} onChange={e => setFormData({...formData, perKill: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Total Slots</label>
                  <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900" 
                    value={formData.totalSlots} onChange={e => setFormData({...formData, totalSlots: Number(e.target.value)})} required />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2"><Clock className="w-4 h-4" /> Generation Timings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                    <input type="checkbox" id="autoRepeat" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                      checked={formData.autoRepeat} onChange={e => setFormData({...formData, autoRepeat: e.target.checked})} />
                    <label htmlFor="autoRepeat" className="text-sm font-bold text-gray-700 cursor-pointer flex-1">Auto Repeat Matches</label>
                  </div>
                  
                  {formData.autoRepeat && (
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1 text-blue-800">Repeat Interval (Mins)</label>
                      <select className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-900 bg-white"
                        value={formData.repeatIntervalMins} onChange={e => setFormData({...formData, repeatIntervalMins: Number(e.target.value)})}>
                        <option value={10}>Every 10 Minutes</option>
                        <option value={15}>Every 15 Minutes</option>
                        <option value={20}>Every 20 Minutes</option>
                        <option value={30}>Every 30 Minutes</option>
                        <option value={60}>Every 1 Hour</option>
                        <option value={120}>Every 2 Hours</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Start Time Window</label>
                    <input type="text" placeholder="09:00 AM" className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-900" 
                      value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">End Time Window</label>
                    <input type="text" placeholder="11:00 PM" className="w-full border border-blue-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-900" 
                      value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1 text-orange-600">Match Duration (Mins)</label>
                    <input type="number" className="w-full border border-orange-200 bg-orange-50 rounded-xl px-4 py-2 text-sm font-bold text-gray-900" 
                      title="How long the match stays LIVE before moving to Finished"
                      value={formData.durationMins} onChange={e => setFormData({...formData, durationMins: Number(e.target.value)})} required />
                  </div>
                </div>
                <p className="text-[10px] text-blue-700 font-medium">Matches will automatically generate starting from <strong className="text-blue-900 font-black">{formData.startTime}</strong> to <strong className="text-blue-900 font-black">{formData.endTime}</strong>{formData.autoRepeat ? \` every \${formData.repeatIntervalMins} minutes.\` : '.'}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Status</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 bg-white"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Team Type</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 bg-white"
                    value={formData.teamType} onChange={e => setFormData({...formData, teamType: e.target.value})}>
                    <option value="Solo">Solo</option>
                    <option value="Duo">Duo</option>
                    <option value="Squad">Squad</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Map</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 bg-white"
                    value={formData.map} onChange={e => setFormData({...formData, map: e.target.value})}>
                    <option value="Bermuda">Bermuda</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Nexterra">Nexterra</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Banner URL (Optional)</label>
                  <input type="text" placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900" 
                    value={formData.bannerUrl} onChange={e => setFormData({...formData, bannerUrl: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Tournament Rules (Optional)</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:border-blue-500 outline-none" 
                  value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})} placeholder="Enter match rules..." />
              </div>
              
              <div className="pt-4 border-t flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" className="bg-[#f5c518] hover:bg-[#e6b815] text-black px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-yellow-500/20">
                  <Save className="w-4 h-4" /> Save Template
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
