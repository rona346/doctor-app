import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Plus, Search, MoreVertical, X, Loader2, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User as UserType } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { cn } from '../lib/utils';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [newDoc, setNewDoc] = useState({
    email: '',
    displayName: '',
    specialization: '',
    experience: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setDoctors(docs);
      setLoading(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const doctorData: Partial<UserType> = {
        uid: `doc_${Date.now()}`,
        email: newDoc.email,
        displayName: newDoc.displayName,
        role: 'doctor',
        specialization: newDoc.specialization,
        experience: Number(newDoc.experience),
        isActive: true,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(newDoc.displayName)}&background=random`,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', doctorData.uid!), doctorData);
      setSuccess(true);
      setTimeout(() => {
        setShowAddModal(false);
        setSuccess(false);
        setNewDoc({ email: '', displayName: '', specialization: '', experience: '' });
        fetchDoctors();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
    setSubmitting(false);
  };

  const toggleDoctorStatus = async (doctor: UserType) => {
    try {
      await updateDoc(doc(db, 'users', doctor.uid), {
        isActive: !doctor.isActive
      });
      fetchDoctors();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${doctor.uid}`);
    }
  };

  const deleteDoctor = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      fetchDoctors();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">Doctor Management</h1>
          <p className="text-stone-500 font-sans">Manage medical professionals and their specialties.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm font-sans"
        >
          <Plus className="w-4 h-4" />
          Add New Doctor
        </button>
      </header>

      <div className="bg-white border border-stone-100 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search by name or specialization..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-stone-400 border-b border-stone-50">
                <th className="pb-4 font-medium">Doctor</th>
                <th className="pb-4 font-medium">Specialization</th>
                <th className="pb-4 font-medium">Experience</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-300" />
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400 text-sm">
                    No doctors found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.uid} className="group hover:bg-stone-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={doc.photoURL} alt={doc.displayName} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-medium text-stone-900">{doc.displayName}</p>
                          <p className="text-xs text-stone-400">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-stone-600">{doc.specialization}</td>
                    <td className="py-4 text-sm text-stone-600">{doc.experience} Years</td>
                    <td className="py-4">
                      <button 
                        onClick={() => toggleDoctorStatus(doc)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors",
                          doc.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                        )}
                      >
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteDoctor(doc.uid)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors"
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
      </div>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {success ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif text-stone-900">Doctor Added Successfully</h3>
                  <p className="text-stone-500 text-sm">The profile has been created and added to the system.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-serif text-stone-900 mb-2">Add New Doctor</h2>
                  <p className="text-stone-500 text-sm mb-8">Create a new professional profile for the system.</p>

                  <form onSubmit={handleAddDoctor} className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={newDoc.displayName}
                        onChange={e => setNewDoc({...newDoc, displayName: e.target.value})}
                        className="w-full p-4 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none"
                        placeholder="Dr. Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={newDoc.email}
                        onChange={e => setNewDoc({...newDoc, email: e.target.value})}
                        className="w-full p-4 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none"
                        placeholder="jane.smith@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Specialization</label>
                        <input 
                          required
                          type="text" 
                          value={newDoc.specialization}
                          onChange={e => setNewDoc({...newDoc, specialization: e.target.value})}
                          className="w-full p-4 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none"
                          placeholder="Cardiology"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Experience (Yrs)</label>
                        <input 
                          required
                          type="number" 
                          value={newDoc.experience}
                          onChange={e => setNewDoc({...newDoc, experience: e.target.value})}
                          className="w-full p-4 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none"
                          placeholder="10"
                        />
                      </div>
                    </div>
                    <button 
                      disabled={submitting}
                      className="w-full py-4 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-bold text-sm flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Profile'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
