import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ShieldCheck, BrainCircuit, Users, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Landing() {
  const { user, login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate(`/${user.role}/dashboard`);
    } else {
      login();
    }
  };

  return (
    <div className="bg-[#f5f2ed] min-h-screen font-serif">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070"
            alt="Medical Professional"
            className="w-full h-full object-cover opacity-20 grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-4 block">
              Excellence in Healthcare
            </span>
            <h1 className="text-6xl md:text-8xl font-light leading-tight mb-8 text-stone-900">
              Sareen <span className="italic">Medical</span> Care
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-12 font-sans">
              AI-powered diagnosis and personalized patient management for a healthier tomorrow.
              Experience the future of healthcare with Dr. Devendra Sareen.
            </p>
            <button
              onClick={handleGetStarted}
              disabled={isLoggingIn}
              className="px-12 py-4 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors flex items-center gap-2 mx-auto font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Connecting...' : (user ? 'Go to Dashboard' : 'Consult Now')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-8 text-stone-400">
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl font-light text-stone-900">20+</span>
            <span className="text-[10px] uppercase tracking-widest">Years Exp</span>
          </div>
          <div className="w-px h-12 bg-stone-200" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl font-light text-stone-900">10k+</span>
            <span className="text-[10px] uppercase tracking-widest">Patients</span>
          </div>
          <div className="w-px h-12 bg-stone-200" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl font-light text-stone-900">4.9/5</span>
            <span className="text-[10px] uppercase tracking-widest">Rating</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-template-columns-3 gap-12">
            <FeatureCard
              icon={<BrainCircuit className="w-8 h-8" />}
              title="AI Diagnosis"
              description="Intelligent symptom analysis and diagnosis suggestions powered by advanced AI."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Secure Records"
              description="Your medical history is protected with enterprise-grade security and encryption."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Expert Care"
              description="Direct access to specialized doctors and personalized treatment plans."
            />
          </div>
        </div>
      </section>

      {/* About Dr. Sareen */}
      <section className="py-24 bg-[#f5f2ed]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=2070"
                alt="Dr. Devendra Sareen"
                className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-xl max-w-xs">
                <p className="text-stone-600 italic font-sans text-sm">
                  "Our mission is to combine human expertise with artificial intelligence to provide the most accurate healthcare possible."
                </p>
                <p className="mt-4 font-bold text-stone-900">- Dr. Devendra Sareen</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-4 block">
              Meet the Expert
            </span>
            <h2 className="text-5xl font-light mb-8 text-stone-900">
              Pioneering <span className="italic">Modern</span> Medicine
            </h2>
            <p className="text-stone-600 mb-8 font-sans leading-relaxed">
              Dr. Devendra Sareen is a world-renowned specialist with over two decades of experience in complex medical diagnosis and patient care. His approach integrates traditional clinical excellence with cutting-edge technology.
            </p>
            <ul className="space-y-4 font-sans text-stone-700">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                Specialist in Internal Medicine & Cardiology
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                Pioneer in AI-assisted Clinical Diagnosis
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
                Member of International Medical Research Council
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="p-12 border border-stone-100 rounded-3xl hover:shadow-xl transition-all"
    >
      <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-8 text-stone-900">
        {icon}
      </div>
      <h3 className="text-2xl font-light mb-4 text-stone-900">{title}</h3>
      <p className="text-stone-500 font-sans leading-relaxed">{description}</p>
    </motion.div>
  );
}
