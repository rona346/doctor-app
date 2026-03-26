import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { BrainCircuit, Stethoscope, AlertCircle, ArrowRight, Loader2, ClipboardList, Send } from 'lucide-react';
import { getDiagnosisSuggestions } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function DiagnosisSystem() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    const result = await getDiagnosisSuggestions(symptoms);
    setSuggestions(result || "No suggestions found.");
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-serif text-stone-900">AI Diagnosis Assistant</h1>
        <p className="text-stone-500 max-w-xl mx-auto font-sans">
          Input patient symptoms for AI-powered diagnostic suggestions and clinical guidance.
        </p>
      </header>

      <div className="grid md:grid-cols-1 gap-8">
        <section className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-400 font-bold mb-4">
                Patient Symptoms & Medical History
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe symptoms in detail (e.g., duration, severity, associated pain, etc.)"
                className="w-full h-48 p-6 bg-stone-50 border-none rounded-2xl text-stone-900 focus:ring-2 focus:ring-stone-200 outline-none resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-400 text-xs italic">
                <AlertCircle className="w-4 h-4" />
                <span>AI suggestions are for guidance only. Doctor's final authority is required.</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !symptoms.trim()}
                className="px-8 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    Analyze Symptoms
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {suggestions && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-serif">AI Diagnostic Suggestions</h2>
              </div>
              
              <div className="prose prose-invert max-w-none font-sans leading-relaxed text-stone-300">
                <ReactMarkdown>{suggestions}</ReactMarkdown>
              </div>

              {user?.role === 'doctor' && (
                <div className="mt-12 pt-12 border-t border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
                  <p className="text-sm text-stone-400 italic">
                    Would you like to proceed with this diagnosis and generate a prescription?
                  </p>
                  <button className="px-8 py-3 bg-white text-stone-900 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-2 font-bold text-sm">
                    Proceed to Prescription
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <BrainCircuit className="absolute -bottom-12 -right-12 w-64 h-64 text-white/5" />
          </motion.section>
        )}
      </div>
    </div>
  );
}
