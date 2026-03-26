import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Search, Loader2, Clock, User, UserRound, CheckCircle, XCircle } from 'lucide-react';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { cn } from '../lib/utils';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const q = query(collection(db, 'appointments'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppointments(docs);
      setLoading(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      fetchAppointments();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.doctorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-serif text-stone-900">Appointment Management</h1>
        <p className="text-stone-500 font-sans">Monitor and manage all consultations across the system.</p>
      </header>

      <div className="bg-white border border-stone-100 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search by ID or status..." 
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
                <th className="pb-4 font-medium">Patient / Doctor</th>
                <th className="pb-4 font-medium">Schedule</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-300" />
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-stone-400 text-sm">
                    No appointments found in the system.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="group hover:bg-stone-50 transition-colors">
                    <td className="py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UserRound className="w-4 h-4 text-stone-400" />
                          <span className="text-sm font-medium text-stone-900">Patient: {app.patientId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-stone-400" />
                          <span className="text-sm text-stone-600">Doctor: {app.doctorId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Calendar className="w-4 h-4 text-stone-300" />
                          {app.date}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-400">
                          <Clock className="w-3 h-3" />
                          {app.timeSlot}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold",
                        app.status === 'confirmed' ? "bg-green-50 text-green-600" : 
                        app.status === 'pending' ? "bg-orange-50 text-orange-600" :
                        app.status === 'completed' ? "bg-blue-50 text-blue-600" :
                        "bg-red-50 text-red-600"
                      )}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(app.id, 'confirmed')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {app.status !== 'cancelled' && app.status !== 'completed' && (
                          <button 
                            onClick={() => updateStatus(app.id, 'cancelled')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
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
      </div>
    </div>
  );
}
