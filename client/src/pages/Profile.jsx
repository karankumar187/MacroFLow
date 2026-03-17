import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Scale, Target, Activity, Utensils, Save,
  Loader2, CheckCircle2, Zap
} from 'lucide-react';
import { createOrUpdateUser, getUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Office job, little exercise' },
  { value: 'light', label: 'Light', desc: '1-3 days/week exercise' },
  { value: 'moderate', label: 'Moderate', desc: '3-5 days/week exercise' },
  { value: 'active', label: 'Active', desc: '6-7 days/week exercise' },
  { value: 'veryActive', label: 'Very Active', desc: 'Hard training + physical job' },
];

const dietStyles = [
  { value: 'balanced', label: 'Balanced', desc: '30P / 40C / 30F', color: '#8BC34A' },
  { value: 'highProtein', label: 'High Protein', desc: '40P / 35C / 25F', color: '#2196F3' },
  { value: 'keto', label: 'Keto', desc: '25P / 5C / 70F', color: '#9C27B0' },
  { value: 'lowFat', label: 'Low Fat', desc: '35P / 50C / 15F', color: '#FF7043' },
];

export default function Profile() {
  const [form, setForm] = useState({
    name: '', email: '', currentWeight: '', targetWeight: '',
    height: '', age: '', gender: 'male',
    activityLevel: 'moderate', dietStyle: 'balanced',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { updateUser } = useAuth();

  useEffect(() => {
    getUser().then(res => {
      setUser(res.data);
      setForm({
        name: res.data.name || '',
        email: res.data.email || '',
        currentWeight: res.data.currentWeight || '',
        targetWeight: res.data.targetWeight || '',
        height: res.data.height || '',
        age: res.data.age || '',
        gender: res.data.gender || 'male',
        activityLevel: res.data.activityLevel || 'moderate',
        dietStyle: res.data.dietStyle || 'balanced',
      });
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        currentWeight: parseFloat(form.currentWeight),
        targetWeight: parseFloat(form.targetWeight),
        height: parseFloat(form.height),
        age: parseInt(form.age),
      };
      const { data } = await createOrUpdateUser(payload);
      setUser(data);
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        flex: 1,
        padding: '20px',
        maxWidth: '700px',
        width: '100%',
      }}
    >
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a1a', marginBottom: '20px' }}>
        Goals
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Personal Info */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <User size={16} color="#8BC34A" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>Personal Info</h3>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px' }}>Name</label>
              <input className="input-field" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Your name" required />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px' }}>Email</label>
              <input className="input-field" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="email@example.com" required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '80px' }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px' }}>Age</label>
              <input className="input-field" type="number" value={form.age} onChange={(e) => handleChange('age', e.target.value)} placeholder="25" required />
            </div>
            <div style={{ flex: 1, minWidth: '80px' }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px' }}>Height (cm)</label>
              <input className="input-field" type="number" value={form.height} onChange={(e) => handleChange('height', e.target.value)} placeholder="175" required />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px' }}>Gender</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => handleChange('gender', g)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 500, textTransform: 'capitalize',
                      background: form.gender === g ? '#E8F5E9' : '#f2f2f2',
                      color: form.gender === g ? '#689F38' : '#999',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                  >{g}</button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weight Goals */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Scale size={16} color="#2196F3" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>Weight Goals</h3>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px' }}>Current Weight (kg)</label>
              <input className="input-field" type="number" step="0.1" value={form.currentWeight} onChange={(e) => handleChange('currentWeight', e.target.value)} placeholder="75" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#999', display: 'block', marginBottom: '6px' }}>Target Weight (kg)</label>
              <input className="input-field" type="number" step="0.1" value={form.targetWeight} onChange={(e) => handleChange('targetWeight', e.target.value)} placeholder="70" required />
            </div>
          </div>
        </motion.div>

        {/* Activity Level */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Activity size={16} color="#FF7043" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>Activity Level</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activityLevels.map(al => (
              <button key={al.value} type="button" onClick={() => handleChange('activityLevel', al.value)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: form.activityLevel === al.value ? '#FFF3E0' : '#fafafa',
                  transition: 'all 0.2s', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: form.activityLevel === al.value ? '#E65100' : '#1a1a1a' }}>{al.label}</span>
                  <span style={{ fontSize: '11px', color: '#999', marginLeft: '8px' }}>{al.desc}</span>
                </div>
                {form.activityLevel === al.value && <CheckCircle2 size={16} color="#FF7043" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Diet Style */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Utensils size={16} color="#9C27B0" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>Diet Style</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {dietStyles.map(ds => (
              <motion.button
                key={ds.value} type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChange('dietStyle', ds.value)}
                style={{
                  padding: '14px', borderRadius: '14px', cursor: 'pointer',
                  background: form.dietStyle === ds.value ? `${ds.color}15` : '#fafafa',
                  border: form.dietStyle === ds.value ? `2px solid ${ds.color}50` : '2px solid transparent',
                  textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: form.dietStyle === ds.value ? ds.color : '#1a1a1a', marginBottom: '2px' }}>
                  {ds.label}
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>{ds.desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* TDEE Display */}
        {user && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Zap size={16} color="#FFC107" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>Your Calculated Goals</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'TDEE', value: `${user.tdee}`, unit: 'kcal', color: '#FFC107' },
                { label: 'Goal', value: `${user.calorieGoal}`, unit: 'kcal', color: '#8BC34A' },
                { label: 'Protein', value: `${user.macroGoals?.protein}`, unit: 'g', color: '#2196F3' },
                { label: 'Carbs/Fat', value: `${user.macroGoals?.carbs}/${user.macroGoals?.fat}`, unit: 'g', color: '#FF7043' },
              ].map((stat, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '12px',
                  background: '#fafafa', borderRadius: '12px',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '10px', color: '#b0b0b0', marginTop: '2px' }}>{stat.unit}</div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
          style={{
            padding: '14px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
          }}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle2 size={18} />
              Saved! Goals Calculated ✨
            </>
          ) : (
            <>
              <Save size={18} />
              Save & Calculate Goals
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
