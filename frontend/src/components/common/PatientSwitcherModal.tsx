import React, { useState } from 'react';
import { 
  X, 
  User, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Phone, 
  HeartHandshake,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { PatientProfile, RegionalState } from '../../types';

interface PatientSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (patient: PatientProfile) => void;
}

const NER_STATES: RegionalState[] = [
  'Assam',
  'Meghalaya',
  'Manipur',
  'Mizoram',
  'Nagaland',
  'Tripura',
  'Arunachal Pradesh',
  'Sikkim',
];

export const PatientSwitcherModal: React.FC<PatientSwitcherModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
}) => {
  const { patients, selectedPatient, setSelectedPatient, addPatient, fetchPatients } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // New patient form state
  const [formData, setFormData] = useState({
    name: '',
    age: '70',
    gender: 'male' as 'male' | 'female' | 'other',
    state: 'Assam' as RegionalState,
    district: 'Kamrup Metropolitan',
    primaryCaregiverName: '',
    primaryCaregiverContact: '',
    cognitiveProfileNote: 'Early-stage memory assistance and cognitive stimulation.',
  });

  if (!isOpen) return null;

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.hierarchy?.state?.toLowerCase().includes(q) ||
      p.hierarchy?.district?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (patient: PatientProfile) => {
    setSelectedPatient(patient);
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
    onClose();
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const newPatient = await addPatient({
        name: formData.name.trim(),
        age: parseInt(formData.age, 10) || 70,
        gender: formData.gender,
        preferredLanguage: formData.state === 'Nagaland' ? 'en' : 'as',
        hierarchy: {
          region: 'North Eastern Region',
          state: formData.state,
          district: formData.district,
          facilityId: 'fac-ghy-01',
          facilityName: `${formData.state} Regional Care Center`,
        },
        primaryCaregiverName: formData.primaryCaregiverName.trim() || 'Family Caregiver',
        primaryCaregiverContact: formData.primaryCaregiverContact.trim() || '+91 98640 12345',
        attendingClinicianName: 'Dr. Devashish Phukan',
        cognitiveProfileNote: formData.cognitiveProfileNote,
        elderlyModeEnabled: true,
        avatarUrl: formData.gender === 'female'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      });

      setSuccessMessage(`Patient ${newPatient.name} registered successfully!`);
      await fetchPatients();
      setIsAddingNew(false);
      handleSelect(newPatient);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#003366] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <User className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-2 py-0.5 rounded-full border border-amber-300/30">
                Patient Management
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white mt-0.5">
                {isAddingNew ? 'Register New Patient' : 'Select Active Patient'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-[#FAFBFD]">
          
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{successMessage}</span>
            </div>
          )}

          {!isAddingNew ? (
            <>
              {/* Action Bar: Search & Register Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by patient name, state, or district..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                  />
                </div>

                <button
                  onClick={() => setIsAddingNew(true)}
                  className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Register New Patient</span>
                </button>
              </div>

              {/* Patient List */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                  <span>Registered Patients ({filteredPatients.length}):</span>
                  <span>Currently Active: <strong className="text-[#003366]">{selectedPatient.name}</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredPatients.map((p) => {
                    const isSelected = selectedPatient.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between relative group ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-2 ring-emerald-600/20'
                            : 'bg-white border-slate-200 hover:border-[#003366] hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'}
                            alt={p.name}
                            className="w-11 h-11 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                              {isSelected && (
                                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>Age {p.age} · {p.hierarchy.state}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <HeartHandshake className="w-3 h-3 text-slate-400" />
                              <span>Caregiver: {p.primaryCaregiverName}</span>
                            </p>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                          isSelected ? 'text-emerald-700 font-bold' : 'text-slate-400'
                        }`} />
                      </div>
                    );
                  })}
                </div>

                {filteredPatients.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    No patients match your search. Click <strong>"+ Register New Patient"</strong> to add one.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Add New Patient Form */
            <form onSubmit={handleCreatePatient} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#003366]" />
                  <span>Enter Patient Clinical Profile Details</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  ← Back to Patient List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra Gogoi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Age</label>
                    <input
                      type="number"
                      min="40"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State Node</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value as RegionalState })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                  >
                    {NER_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">District / City</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Kamrup Metropolitan / Jorhat"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Primary Caregiver Name</label>
                  <input
                    type="text"
                    value={formData.primaryCaregiverName}
                    onChange={(e) => setFormData({ ...formData, primaryCaregiverName: e.target.value })}
                    placeholder="e.g. Sangeeta Gogoi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Caregiver Contact Number</label>
                  <input
                    type="tel"
                    value={formData.primaryCaregiverContact}
                    onChange={(e) => setFormData({ ...formData, primaryCaregiverContact: e.target.value })}
                    placeholder="+91 98640 12345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Clinical Profile & Memory Note</label>
                <textarea
                  rows={2}
                  value={formData.cognitiveProfileNote}
                  onChange={(e) => setFormData({ ...formData, cognitiveProfileNote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save & Select Patient'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Smriti-Setu Multi-Patient Framework · Government of India
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
