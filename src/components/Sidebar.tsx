import { useAuth } from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  UserRound, 
  Stethoscope, 
  MessageSquare, 
  Settings, 
  FileText, 
  Users, 
  Activity, 
  ClipboardList 
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'Doctors', path: '/admin/doctors' },
    { icon: UserRound, label: 'Patients', path: '/admin/patients' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: Activity, label: 'Analytics', path: '/admin/analytics' },
  ];

  const doctorLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    { icon: UserRound, label: 'My Patients', path: '/doctor/patients' },
    { icon: Stethoscope, label: 'Diagnoses', path: '/doctor/diagnoses' },
    { icon: MessageSquare, label: 'Messages', path: '/doctor/messages' },
  ];

  const patientLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Calendar, label: 'Book Appointment', path: '/patient/book' },
    { icon: ClipboardList, label: 'My Diagnoses', path: '/patient/diagnoses' },
    { icon: FileText, label: 'Prescriptions', path: '/patient/prescriptions' },
    { icon: MessageSquare, label: 'Chat with Doctor', path: '/patient/chat' },
  ];

  const links = user.role === 'admin' ? adminLinks : user.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="w-64 border-r border-stone-100 bg-white h-[calc(100vh-80px)] sticky top-20 p-6 flex flex-col justify-between">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6 px-4">
          Main Menu
        </p>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
              location.pathname.startsWith(link.path)
                ? "bg-stone-900 text-white shadow-lg shadow-stone-200"
                : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
            )}
          >
            <link.icon className={cn(
              "w-5 h-5",
              location.pathname.startsWith(link.path) ? "text-white" : "text-stone-400 group-hover:text-stone-900"
            )} />
            <span className="text-sm font-medium">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-stone-500 hover:bg-stone-50 hover:text-stone-900 rounded-xl transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
