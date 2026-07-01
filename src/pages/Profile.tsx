import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Stethoscope, Mail, Calendar, Heart, Award, Save, CheckCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Dynamic profile states
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  
  // Doctor specific states
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setDisplayName(data.displayName || '');
        setPhone(data.phone || '');
        setGender(data.gender || '');
        setDob(data.dob || '');
        setBloodGroup(data.bloodGroup || '');
        setAllergies(data.allergies || '');
        setChronicConditions(data.chronicConditions || '');
        setSpecialization(data.specialization || '');
        setExperience(data.experience ? String(data.experience) : '');
      }
      setLoading(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user?.uid}`);
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      const updates: Record<string, any> = {
        displayName,
        phone,
      };

      if (user.role === 'patient') {
        updates.gender = gender;
        updates.dob = dob;
        updates.bloodGroup = bloodGroup;
        updates.allergies = allergies;
        updates.chronicConditions = chronicConditions;
      } else if (user.role === 'doctor') {
        updates.specialization = specialization;
        updates.experience = Number(experience) || 0;
      }

      await updateDoc(userRef, updates);
      
      // Update local state if needed (or wait for auth reload)
      user.displayName = displayName;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h2 className="text-2xl font-serif text-stone-800 mb-4">Please log in to view your profile</h2>
        <button
          onClick={login}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1 block">
          Settings & Preferences
        </span>
        <h1 className="text-4xl font-serif font-light text-stone-900">
          User <span className="italic">Profile</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`}
                alt={displayName}
                className="w-full h-full rounded-full object-cover border border-stone-200"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 p-1.5 bg-stone-900 text-white rounded-full border border-white">
                {user.role === 'admin' && <Shield className="w-4 h-4" />}
                {user.role === 'doctor' && <Stethoscope className="w-4 h-4" />}
                {user.role === 'patient' && <User className="w-4 h-4" />}
              </div>
            </div>
            
            <h2 className="text-xl font-serif text-stone-900 mb-1">{displayName || 'User'}</h2>
            <span className="inline-block px-3 py-1 bg-stone-100 text-stone-700 text-xs font-mono rounded-full uppercase tracking-wider mb-4">
              {user.role}
            </span>

            <div className="text-left space-y-3 pt-4 border-t border-stone-100 text-sm text-stone-600">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
            <form onSubmit={handleSave} className="space-y-6">
              <h3 className="text-lg font-serif text-stone-900 pb-2 border-b border-stone-100">
                Personal Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors"
                  />
                </div>
              </div>

              {/* Patient Specific Fields */}
              {user.role === 'patient' && (
                <>
                  <h3 className="text-lg font-serif text-stone-900 pt-4 pb-2 border-b border-stone-100">
                    Medical Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                        Blood Group
                      </label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                        Allergies
                      </label>
                      <textarea
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="List any known food or medical allergies"
                        rows={3}
                        className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                        Chronic Conditions
                      </label>
                      <textarea
                        value={chronicConditions}
                        onChange={(e) => setChronicConditions(e.target.value)}
                        placeholder="List any ongoing chronic conditions (e.g. Diabetes, Asthma)"
                        rows={3}
                        className="w-full px-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Doctor Specific Fields */}
              {user.role === 'doctor' && (
                <>
                  <h3 className="text-lg font-serif text-stone-900 pt-4 pb-2 border-b border-stone-100">
                    Professional Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                        Specialization
                      </label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g. Cardiologist"
                          className="w-full pl-11 pr-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                        Experience (Years)
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="number"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="e.g. 15"
                          min="0"
                          className="w-full pl-11 pr-4 py-2.5 bg-[#fcfbfa] border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-stone-100">
                {success && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-green-600 text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Profile updated successfully!</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
