import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, UtensilsCrossed } from 'lucide-react';

export default function Timeline({ meals = [], onDelete }) {
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMealType = (dateStr) => {
    const hour = new Date(dateStr).getHours();
    if (hour < 11) return 'Breakfast';
    if (hour < 15) return 'Lunch';
    if (hour < 18) return 'Snack';
    return 'Dinner';
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Recent Food</h3>
        <span style={{ fontSize: '12px', color: '#999' }}>
          {meals.length} item{meals.length !== 1 ? 's' : ''}
        </span>
      </div>

      {meals.length === 0 ? (
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          color: '#b0b0b0',
        }}>
          <UtensilsCrossed size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ fontSize: '14px', color: '#999' }}>No meals logged yet</p>
          <p style={{ fontSize: '12px', marginTop: '4px', color: '#ccc' }}>Log your first meal above</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <AnimatePresence>
            {meals.map((meal, idx) => (
              <motion.div
                key={meal._id || idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderBottom: idx < meals.length - 1 ? '1px solid #f2f2f2' : 'none',
                }}
              >
                {/* Food emoji/icon placeholder */}
                <div className="food-img">
                  <span style={{ fontSize: '24px' }}>🍽️</span>
                </div>

                {/* Food info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    marginBottom: '2px',
                  }}>
                    {meal.foodName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {getMealType(meal.loggedAt)}
                  </div>
                </div>

                {/* Calories */}
                <div style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#1a1a1a',
                  marginRight: '4px',
                }}>
                  {meal.calories} Cal
                </div>

                {/* Delete */}
                {onDelete && (
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(meal._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ccc',
                      padding: '4px',
                      display: 'flex',
                    }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
