import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUser, getLogs } from '../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

function getMealType(dateStr) {
  const hour = new Date(dateStr).getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 15) return 'Lunch';
  if (hour < 18) return 'Snacks';
  return 'Dinner';
}

export default function FoodLog() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // 0=Sun, 1=Mon...
  const [activeCategory, setActiveCategory] = useState('All');

  // Build the current week's dates
  const getWeekDates = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0=Sun
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return DAYS.map((label, i) => {
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

      const startDate = weekDates[0].dateStr;
      const endDate = weekDates[6].dateStr;
      const { data: logsData } = await getLogs(userData._id, startDate, endDate);
      setLogs(logsData);
    } catch (err) {
      console.log('No data yet');
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Get the selected date's log
  const selectedDateStr = weekDates.find(d => d.jsDay === selectedDay)?.dateStr ||
    new Date().toISOString().split('T')[0];
  const dayLog = logs.find(l => l.date === selectedDateStr);
  const meals = dayLog?.meals || [];

  // Filter by category
  const filteredMeals = activeCategory === 'All'
    ? meals
    : meals.filter(m => getMealType(m.loggedAt) === activeCategory);

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
      }}
    >
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a1a' }}>
        Food Log
      </h1>

      {/* Week Date Picker */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          gap: '4px',
        }}>
          {weekDates.map((d) => (
            <div
              key={d.label}
              className={`day-cell ${d.jsDay === selectedDay ? 'active' : ''}`}
              onClick={() => setSelectedDay(d.jsDay)}
            >
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: d.jsDay === selectedDay ? '#fff' : '#1a1a1a',
              }}>
                {d.date}
              </span>
              <span className="day-label" style={{
                fontSize: '12px',
                fontWeight: 500,
                color: d.jsDay === selectedDay ? '#fff' : '#999',
              }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card"
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#b0b0b0',
              }}
            >
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
                style={{ padding: '16px', overflow: 'hidden' }}
              >
                {/* Top row: image + name + calories */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                }}>
                  <div className="food-img">
                    <span style={{ fontSize: '26px' }}>🍽️</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>
                      {meal.foodName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                      {getMealType(meal.loggedAt)}
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a' }}>
                    {meal.calories} Cal
                  </div>
                </div>

                {/* Macro bars row */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  background: '#f8f8f8',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}>
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
  );
}

function MacroPill({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
        {value}g
      </div>
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
