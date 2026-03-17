import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Semi-circular calorie gauge + macro breakdown bars.
 * Matches the reference design with green gradient gauge on a light-green card.
 */
export default function CalorieGauge({ totals, goals }) {
  const current = totals?.calories || 0;
  const goal = goals?.calorieGoal || 2100;
  const percentage = Math.min((current / goal) * 100, 100);

  const protein = { current: totals?.protein || 0, goal: goals?.macroGoals?.protein || 150 };
  const carbs = { current: totals?.carbs || 0, goal: goals?.macroGoals?.carbs || 200 };
  const fat = { current: totals?.fat || 0, goal: goals?.macroGoals?.fat || 65 };

  // Animated sweep
  const sweep = useMotionValue(0);
  const animatedSweep = useTransform(sweep, [0, 100], [0, 180]);

  useEffect(() => {
    const controls = animate(sweep, percentage, {
      duration: 1.5,
      ease: [0.32, 0.72, 0, 1],
    });
    return controls.stop;
  }, [percentage]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Gauge Card */}
      <div className="card" style={{
        background: 'linear-gradient(180deg, #E8F5E9 0%, #C5E1A5 100%)',
        padding: '24px',
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Semi-circular gauge */}
        <div style={{
          position: 'relative',
          width: '220px',
          height: '130px',
          margin: '0 auto 8px',
        }}>
          <svg width="220" height="130" viewBox="0 0 220 130">
            {/* Background arc */}
            <path
              d="M 20 120 A 90 90 0 0 1 200 120"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <motion.path
              d="M 20 120 A 90 90 0 0 1 200 120"
              fill="none"
              stroke="#689F38"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="283"
              style={{
                strokeDashoffset: useTransform(animatedSweep, v => 283 - (v / 180) * 283),
              }}
            />
          </svg>

          {/* Center text */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '42px',
              fontWeight: 800,
              color: '#1a1a1a',
              lineHeight: 1,
            }}>
              {current.toLocaleString()}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginTop: '2px',
            }}>
              of {goal.toLocaleString()} Cal
            </div>
          </div>
        </div>

        {/* Macronutrient Breakdown */}
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '14px',
          fontWeight: 500,
        }}>
          Macronutrient breakdown
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
        }}>
          <MacroStat label="Protein" value={protein.current} goal={protein.goal} color="#689F38" />
          <MacroStat label="Carbs" value={carbs.current} goal={carbs.goal} color="#FFC107" />
          <MacroStat label="Fat" value={fat.current} goal={fat.goal} color="#FF7043" />
        </div>
      </div>
    </motion.div>
  );
}

function MacroStat({ label, value, goal, color }) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);

  return (
    <div style={{ textAlign: 'center', flex: '1', maxWidth: '120px' }}>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
        {value}g
      </div>
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>{label}</div>
      <div className="macro-bar-track">
        <motion.div
          className="macro-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
