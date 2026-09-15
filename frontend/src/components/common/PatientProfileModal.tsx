import React, { useState, useEffect } from 'react';
import { 
  User, 
  Camera, 
  Upload, 
  Save, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Heart, 
  Phone, 
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { PatientProfile, RegionalLanguage } from '../../types';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({ isOpen, onClose }) => {
  const { selectedPatient, updatePatientProfile, user } = useAuthStore();

  const [name, setName] = useState(selectedPatient.name);
  const [age, setAge] = useState(selectedPatient.age.toString());
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(selectedPatient.gender);
  const [preferredLanguage, setPreferredLanguage] = useState<RegionalLanguage>(selectedPatient.preferredLanguage);
  const [avatarUrl, setAvatarUrl] = useState(selectedPatient.avatarUrl);
  const [caregiverName, setCaregiverName] = useState(selectedPatient.primaryCaregiverName);
  const [caregiverContact, setCaregiverContact] = useState(selectedPatient.primaryCaregiverContact);
  const [cognitiveNote, setCognitiveNote] = useState(selectedPatient.cognitiveProfileNote);
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(selectedPatient.name);
      setAge(selectedPatient.age.toString());
      setGender(selectedPatient.gender);
      setPreferredLanguage(selectedPatient.preferredLanguage);
      setAvatarUrl(selectedPatient.avatarUrl);
      setCaregiverName(selectedPatient.primaryCaregiverName);
      setCaregiverContact(selectedPatient.primaryCaregiverContact);
      setCognitiveNote(selectedPatient.cognitiveProfileNote);
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen, selectedPatient]);

  if (!isOpen) return null;

  // Handle local image file upload & convert to base64 preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Patient full name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await updatePatientProfile({
        name: name.trim(),
        age: parseInt(age, 10) || selectedPatient.age,
        gender,
        preferredLanguage,
        avatarUrl,
        primaryCaregiverName: caregiverName.trim(),
        primaryCaregiverContact: caregiverContact.trim(),
        cognitiveProfileNote: cognitiveNote.trim(),
      });

      setSuccessMsg('Profile details & photo updated successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#002B49] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                National Health Authority · ABHA Patient ID
              </span>
              <h3 className="font-serif font-bold text-lg text-white">
                Personal Patient Profile & Photo
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto bg-[#FAFBFD] flex-1 text-xs">
          
          {/* Status Feedback */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              {avatarUrl && avatarUrl.trim() !== '' ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#003366] shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#003366] to-[#00558F] text-white flex flex-col items-center justify-center font-black text-2xl border-2 border-[#003366] shadow-md select-none">
                  <span>{name ? name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'P'}</span>
                </div>
              )}
              <label
                htmlFor="patient-photo-input"
                className="absolute inset-0 bg-slate-950/60 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <Camera className="w-6 h-6 mb-1 text-amber-300" />
                <span className="text-[10px] font-bold">{avatarUrl ? 'Change' : 'Upload'}</span>
              </label>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-slate-900">Patient Profile Photo</h4>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Upload a clear portrait photograph. If empty, the system displays clean patient initials.
              </p>
              
              <div>
                <input
                  id="patient-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="patient-photo-input"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#003366]" />
                  <span>Choose Photo from Device</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Fields: Basic Information */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-serif font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Personal & Medical Identification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Preferred Language for Voice AI</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="as">Assamese (অসমীয়া)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="ne">Nepali (नेपाली)</option>
                  <option value="brx">Bodo (बड़ो)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Fields: Caregiver & Emergency Contacts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-serif font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Primary Family Caretaker & Emergency Contact</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Caregiver Name</label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Caregiver Mobile Contact</label>
                <input
                  type="text"
                  value={caregiverContact}
                  onChange={(e) => setCaregiverContact(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:border-[#003366]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Clinical / Cognitive Care Notes</label>
              <textarea
                rows={3}
                value={cognitiveNote}
                onChange={(e) => setCognitiveNote(e.target.value)}
                placeholder="Enter personal reminiscence preferences, music tastes, or memory reminders..."
                className="w-full px-3.5 py-2 text-xs font-medium text-slate-900 bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:border-[#003366]"
              />
            </div>
          </div>

          {/* Hospital & State Hierarchy Info (Read-Only) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-700 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block">Registered Healthcare Facility</span>
            <p className="font-bold text-slate-900">{selectedPatient.hierarchy.facilityName}</p>
            <p className="text-[11px] text-slate-600">
              {selectedPatient.hierarchy.district}, {selectedPatient.hierarchy.state} ({selectedPatient.hierarchy.region})
            </p>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-black text-white bg-[#003366] hover:bg-[#002244] shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
