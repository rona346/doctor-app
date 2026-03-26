import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Calendar, Clock, User, Stethoscope, ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { User as UserType } from '../types';
import { cn } from '../lib/utils';

export default function AppointmentBooking() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<UserType | null>(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => doc.data() as UserType);
      setDoctors(docs);
    };
    fetchDoctors();
  }, []);

  const handleBook = async () => {
    if (!selectedDoctor || !date || !timeSlot || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        doctorId: selectedDoctor.uid,
        date,
        timeSlot,
        symptoms,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (error) {
      console.error('Booking error:', error);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-8 py-24">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-serif text-stone-900">Appointment Requested</h1>
        <p className="text-stone-500 font-sans">
          Your appointment request with {selectedDoctor?.displayName} has been sent. 
          You will receive a notification once it's confirmed.
        </p>
        <button
          onClick={() => window.location.href = '/patient/dashboard'}
          className="px-8 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-sans"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-stone-900">Book an Appointment</h1>
        <p className="text-stone-500 max-w-xl mx-auto font-sans">
          Select a specialist and choose a convenient time slot for your consultation.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          <section className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-serif text-stone-900 mb-8">1. Select Specialist</h2>
            <div className="grid grid-cols-1 gap-4">
              {doctors.map((doctor) => (
                <button
                  key={doctor.uid}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={cn(
                    "flex items-center justify-between p-6 border rounded-2xl transition-all text-left group",
                    selectedDoctor?.uid === doctor.uid
                      ? "border-stone-900 bg-stone-50 shadow-lg"
                      : "border-stone-50 hover:bg-stone-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={doctor.photoURL}
                      alt={doctor.displayName}
                      className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-medium text-stone-900">{doctor.displayName}</h4>
                      <p className="text-xs text-stone-400">{doctor.specialization} • {doctor.experience} yrs exp</p>
                    </div>
                  </div>
                  {selectedDoctor?.uid === doctor.uid && (
                    <CheckCircle className="w-5 h-5 text-stone-900" />
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-serif text-stone-900 mb-8">2. Symptoms & Details</h2>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms briefly..."
              className="w-full h-32 p-6 bg-stone-50 border-none rounded-2xl text-stone-900 focus:ring-2 focus:ring-stone-200 outline-none resize-none font-sans"
            />
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-serif text-stone-900 mb-8">3. Schedule</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">
                  Select Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-4 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none font-sans"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">
                  Select Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={cn(
                        "p-3 text-xs font-medium rounded-xl transition-all",
                        timeSlot === slot
                          ? "bg-stone-900 text-white shadow-lg"
                          : "bg-stone-50 text-stone-500 hover:bg-stone-100"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-serif mb-6">Summary</h2>
            <div className="space-y-4 mb-8">
              <SummaryItem icon={User} label="Doctor" value={selectedDoctor?.displayName || 'Not selected'} />
              <SummaryItem icon={Calendar} label="Date" value={date || 'Not selected'} />
              <SummaryItem icon={Clock} label="Time" value={timeSlot || 'Not selected'} />
            </div>
            <button
              onClick={handleBook}
              disabled={loading || !selectedDoctor || !date || !timeSlot}
              className="w-full py-4 bg-white text-stone-900 rounded-xl hover:bg-stone-100 transition-colors font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
            </button>
            <p className="text-[10px] text-stone-500 text-center mt-4 uppercase tracking-widest">
              Secure Checkout
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-stone-400 text-xs">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
