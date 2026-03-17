import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #eee',
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: '13px', color: entry.color, fontWeight: 600 }}>
          {entry.name}: {entry.value}{entry.name === 'Calories' ? ' kcal' : 'g'}
        </p>
      ))}
    </div>
  );
};

export default function WeeklyChart({ logs = [], calorieGoal = 2000, viewMode = 'weekly' }) {
  const getChartData = () => {
    if (viewMode === 'daily') {
      const todayMeals = logs[0]?.meals || [];
      const hours = {};
      todayMeals.forEach(meal => {
        const hour = new Date(meal.loggedAt).getHours();
        const label = `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`;
        if (!hours[label]) hours[label] = { name: label, Calories: 0, Protein: 0 };
        hours[label].Calories += meal.calories;
        hours[label].Protein += meal.protein;
      });
      return Object.values(hours);
    }

    if (viewMode === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date();
      const dayOfWeek = today.getDay();

      return days.map((day, i) => {
        const targetDate = new Date(today);
        const diff = i - ((dayOfWeek + 6) % 7);
        targetDate.setDate(today.getDate() + diff);
        const dateStr = targetDate.toISOString().split('T')[0];

        const log = logs.find(l => l.date === dateStr);
        const totals = log?.meals?.reduce((acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
        }), { calories: 0, protein: 0 }) || { calories: 0, protein: 0 };

        return {
          name: day,
          Calories: totals.calories,
          Target: calorieGoal,
          Protein: totals.protein,
        };
      });
    }

    // monthly
    const weeks = [];
    const today = new Date();
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (w * 7 + 6));
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - w * 7);

      let totalCals = 0;
      let days = 0;
      logs.forEach(log => {
        const logDate = new Date(log.date);
        if (logDate >= weekStart && logDate <= weekEnd) {
          const t = log.meals?.reduce((a, m) => a + m.calories, 0) || 0;
          totalCals += t;
          days++;
        }
      });

      weeks.push({
        name: `Wk ${4 - w}`,
        Calories: days > 0 ? Math.round(totalCals / days) : 0,
        Target: calorieGoal,
      });
    }
    return weeks;
  };

  const data = getChartData();
  const title = viewMode === 'daily' ? "Today's Intake" :
    viewMode === 'weekly' ? 'Weekly Consistency' : 'Monthly Average';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px' }}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        {viewMode === 'weekly' ? (
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fill: '#999', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#999', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Target" fill="#f0f0f0" radius={[6, 6, 0, 0]} barSize={20} name="Target" />
            <Bar dataKey="Calories" fill="#8BC34A" radius={[6, 6, 0, 0]} barSize={20} name="Calories" />
          </BarChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8BC34A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8BC34A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fill: '#999', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#999', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Calories" stroke="#8BC34A" strokeWidth={2} fill="url(#colorCal)" name="Calories" />
            {data[0]?.Protein !== undefined && (
              <Area type="monotone" dataKey="Protein" stroke="#2196F3" strokeWidth={2} fill="url(#colorProt)" name="Protein" />
            )}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}
