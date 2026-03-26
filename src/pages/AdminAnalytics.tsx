import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, Users, Stethoscope, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { cn } from '../lib/utils';

const data = [
  { name: 'Jan', patients: 400, revenue: 2400 },
  { name: 'Feb', patients: 300, revenue: 1398 },
  { name: 'Mar', patients: 200, revenue: 9800 },
  { name: 'Apr', patients: 278, revenue: 3908 },
  { name: 'May', patients: 189, revenue: 4800 },
  { name: 'Jun', patients: 239, revenue: 3800 },
  { name: 'Jul', patients: 349, revenue: 4300 },
];

const COLORS = ['#1c1917', '#44403c', '#78716c', '#a8a29e', '#d6d3d1'];

export default function AdminAnalytics() {
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    activeConsultations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsSnap, doctorsSnap, appointmentsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'patient'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'doctor'))),
        getDocs(collection(db, 'appointments')),
      ]);

      setStats({
        totalPatients: patientsSnap.size,
        totalDoctors: doctorsSnap.size,
        totalAppointments: appointmentsSnap.size,
        activeConsultations: appointmentsSnap.docs.filter(d => d.data().status === 'confirmed').length,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const metrics = [
    { label: 'Patient Growth', value: stats.totalPatients, trend: '+12.5%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Doctor Efficiency', value: '94%', trend: '+2.1%', icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Consultation Rate', value: stats.totalAppointments, trend: '+18.2%', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'System Uptime', value: '99.9%', trend: 'Stable', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-serif text-stone-900">System Analytics</h1>
        <p className="text-stone-500 font-sans">Deep dive into system performance and medical metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            whileHover={{ y: -4 }}
            className="p-6 bg-white border border-stone-100 rounded-2xl shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", metric.bg, metric.color)}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                metric.trend.startsWith('+') ? "text-green-600 bg-green-50" : "text-stone-400 bg-stone-50"
              )}>
                {metric.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : null}
                {metric.trend}
              </div>
            </div>
            <p className="text-3xl font-bold text-stone-900">{metric.value}</p>
            <p className="text-xs text-stone-400 uppercase tracking-widest">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white border border-stone-100 rounded-3xl p-8">
          <h2 className="text-xl font-serif text-stone-900 mb-8">Patient Inflow Trend</h2>
          <div className="h-80 w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="patients" stroke="#1c1917" fillOpacity={1} fill="url(#colorPatients)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="bg-white border border-stone-100 rounded-3xl p-8">
          <h2 className="text-xl font-serif text-stone-900 mb-8">Consultation Distribution</h2>
          <div className="h-80 w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f5f2ed' }}
                  />
                  <Bar dataKey="patients" fill="#1c1917" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <section className="md:col-span-2 bg-white border border-stone-100 rounded-3xl p-8">
          <h2 className="text-xl font-serif text-stone-900 mb-8">Revenue Forecast</h2>
          <div className="h-80 w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#1c1917" strokeWidth={3} dot={{ r: 4, fill: '#1c1917' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="bg-white border border-stone-100 rounded-3xl p-8">
          <h2 className="text-xl font-serif text-stone-900 mb-8">Department Load</h2>
          <div className="h-80 w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Cardiology', value: 400 },
                      { name: 'Neurology', value: 300 },
                      { name: 'Pediatrics', value: 300 },
                      { name: 'General', value: 200 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {['Cardiology', 'Neurology', 'Pediatrics', 'General'].map((dept, i) => (
              <div key={dept} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-stone-600">{dept}</span>
                </div>
                <span className="font-medium text-stone-900">{[400, 300, 300, 200][i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
