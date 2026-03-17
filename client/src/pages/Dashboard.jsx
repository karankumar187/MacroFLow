import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import CalorieGauge from '../components/MacroRings';
import FoodInput from '../components/FoodInput';
import Timeline from '../components/Timeline';
import WeeklyChart from '../components/WeeklyChart';
import PhotoUpload from '../components/PhotoUpload';
import { getUser, getTodayLog, getLogs, parseAndLogFood, uploadFoodPhoto, deleteMeal } from '../services/api';

const DAYS_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const VIEW_MODES = [
  { key: 'daily', label: 'Day', icon: Calendar },
  { key: 'weekly', label: 'Week', icon: BarChart3 },
  { key: 'monthly', label: 'Month', icon: TrendingUp },
];

function getMealType(dateStr) {
  const hour = new Date(dateStr).getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 15) return 'Lunch';
  if (hour < 18) return 'Snacks';
  return 'Dinner';
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showPhoto, setShowPhoto] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('weekly');

  // Build the current week's dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return DAYS_LABELS.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        label,
        date: d.getDate(),
        dateStr: d.toISOString().split('T')[0],
        isToday: d.toDateString() === today.toDateString(),
        jsDay: d.getDay(),
      };
    });
  };

  const weekDates = getWeekDates();

  const loadData = useCallback(async () => {
    try {
      const { data: userData } = await getUser();
      setUser(userData);

      const { data: todayData } = await getTodayLog(userData._id);
      setTodayLog(todayData);

      // Get last 30 days of logs
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const { data: logsData } = await getLogs(userData._id, startDate, endDate);
      setLogs(logsData);
    } catch (err) {
      console.log('No user profile yet — create one in Goals');
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFoodSubmit = async (text) => {
    if (!user) {
      alert('Please create a profile first on the Goals page!');
      return;
    }
    await parseAndLogFood(user._id, text);
    await loadData();
  };

  const handlePhotoUpload = async (file) => {
    if (!user) return;
    await uploadFoodPhoto(user._id, file);
    await loadData();
  };

  const handleDeleteMeal = async (mealId) => {
    if (!todayLog?._id) return;
    await deleteMeal(todayLog._id, mealId);
    await loadData();
  };

  const totals = todayLog?.totals || todayLog?.meals?.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // Motivational tip
  const calPct = (totals.calories / (user?.calorieGoal || 2100)) * 100;
  const tipText = calPct > 80 ? "Almost at your daily goal! Great work! 🎉" :
    calPct > 50 ? "Great progress! Stay consistent today 💪" :
    "You're one meal closer to your goal — keep going!";

  // Food log: selected day's meals
  const selectedDateStr = weekDates.find(d => d.jsDay === selectedDay)?.dateStr
    || new Date().toISOString().split('T')[0];
  const dayLog = logs.find(l => l.date === selectedDateStr);
  const dayMeals = dayLog?.meals || (selectedDateStr === new Date().toISOString().split('T')[0] ? (todayLog?.meals || []) : []);
  const filteredMeals = activeCategory === 'All'
    ? dayMeals
    : dayMeals.filter(m => getMealType(m.loggedAt) === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '900px',
        width: '100%',
        paddingBottom: '100px',
      }}
    >
      {/* ====== HEADER ====== */}
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a1a' }}>Home</h1>

      {/* ====== MOTIVATIONAL TIPS ====== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="card"
        style={{
          background: 'linear-gradient(135deg, #FCE4EC, #F8BBD0)',
          padding: '18px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>
            Motivational Tips
          </div>
          <div style={{ fontSize: '14px', color: '#444', lineHeight: 1.5 }}>{tipText}</div>
        </div>
        <div style={{
          width: '50px', height: '50px', borderRadius: '16px',
          background: 'rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginLeft: '12px',
        }}>
          <Flame size={24} color="#e91e63" />
        </div>
      </motion.div>

      {/* ====== SMART FOOD INPUT ====== */}
      <FoodInput onSubmit={handleFoodSubmit} onPhotoClick={() => setShowPhoto(true)} />

      {/* ====== CALORIE GAUGE + MACROS ====== */}
      <CalorieGauge totals={totals} goals={user || {}} />

      {/* ====== RECENT FOOD (Today) ====== */}
      <Timeline meals={todayLog?.meals || []} onDelete={handleDeleteMeal} />

      {/* ====== DIVIDER ====== */}
      <div style={{ height: '1px', background: '#eee', margin: '4px 0' }} />

      {/* ====== FOOD LOG SECTION ====== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', marginBottom: '12px' }}>
          Food Log
        </h2>

        {/* Week Date Picker */}
        <div className="card" style={{ padding: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '4px' }}>
            {weekDates.map((d) => (
              <div
                key={d.label}
                className={`day-cell ${d.jsDay === selectedDay ? 'active' : ''}`}
                onClick={() => setSelectedDay(d.jsDay)}
              >
                <span style={{
                  fontSize: '18px', fontWeight: 700,
                  color: d.jsDay === selectedDay ? '#fff' : '#1a1a1a',
                }}>
                  {d.date}
                </span>
                <span className="day-label" style={{
                  fontSize: '12px', fontWeight: 500,
                  color: d.jsDay === selectedDay ? '#fff' : '#999',
                }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '12px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`tab-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {filteredMeals.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card"
                style={{ padding: '32px 20px', textAlign: 'center', color: '#b0b0b0' }}>
                <p style={{ fontSize: '14px', color: '#999' }}>No meals logged for this day</p>
              </motion.div>
            ) : (
              filteredMeals.map((meal, idx) => (
                <motion.div
                  key={meal._id || idx}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card"
                  style={{ padding: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div className="food-img"><span style={{ fontSize: '26px' }}>🍽️</span></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{meal.foodName}</div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{getMealType(meal.loggedAt)}</div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a' }}>{meal.calories} Cal</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', background: '#f8f8f8', borderRadius: '12px', padding: '12px 14px' }}>
                    <MacroPill label="Protein" value={meal.protein} color="#8BC34A" />
                    <MacroPill label="Carbs" value={meal.carbs} color="#FFC107" />
                    <MacroPill label="Fat" value={meal.fat} color="#FF7043" />
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ====== DIVIDER ====== */}
      <div style={{ height: '1px', background: '#eee', margin: '4px 0' }} />

      {/* ====== ANALYTICS SECTION ====== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>Analytics</h2>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            background: '#fff',
            borderRadius: '12px',
            padding: '3px',
            border: '1px solid #eee',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            {VIEW_MODES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: viewMode === key ? '#E8F5E9' : 'transparent',
                  color: viewMode === key ? '#689F38' : '#999',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <WeeklyChart logs={logs} calorieGoal={user?.calorieGoal || 2000} viewMode={viewMode} />
        </div>

        {/* Quick Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px' }}>
          <StatCard
            label="Avg Calories"
            value={logs.length > 0 ? Math.round(logs.reduce((sum, l) =>
              sum + (l.meals?.reduce((a, m) => a + m.calories, 0) || 0), 0) / logs.length) : 0}
            unit="kcal"
            color="#8BC34A"
          />
          <StatCard
            label="Avg Protein"
            value={logs.length > 0 ? Math.round(logs.reduce((sum, l) =>
              sum + (l.meals?.reduce((a, m) => a + m.protein, 0) || 0), 0) / logs.length) : 0}
            unit="g"
            color="#2196F3"
          />
          <StatCard
            label="Days Tracked"
            value={logs.length}
            unit="days"
            color="#FF7043"
          />
        </div>
      </motion.div>

      {/* Photo Upload Modal */}
      <PhotoUpload isOpen={showPhoto} onClose={() => setShowPhoto(false)} onUpload={handlePhotoUpload} />
    </motion.div>
  );
}

function MacroPill({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>{value}g</div>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>{label}</div>
      <div className="macro-bar-track">
        <motion.div
          className="macro-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color }) {
  return (
    <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
      <div style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#b0b0b0', marginTop: '2px' }}>{unit}</div>
      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{label}</div>
    </div>
  );
}
