import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const q = query(
        collection(db, 'appointments'), 
        where('patientId', '==', user?.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppointments(docs);
      setLoading(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">My Appointments</h1>
          <p className="text-stone-500 font-sans">View and manage your upcoming consultations.</p>
        </div>
        <Link
          to="/patient/book"
          className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm font-sans w-fit"
        >
          <Calendar className="w-4 h-4" />
          Book New Appointment
        </Link>
      </header>

      <div className="bg-white border border-stone-100 rounded-3xl p-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-stone-400 border-b border-stone-50">
                <th className="pb-4 font-medium">Doctor</th>
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
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-stone-400 text-sm">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((app) => (
                  <tr key={app.id} className="group hover:bg-stone-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-stone-900">Dr. {app.doctorId}</span>
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
                      <button className="p-2 text-stone-900 hover:bg-stone-100 rounded-lg transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </button>
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
