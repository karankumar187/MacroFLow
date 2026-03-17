import { NavLink } from 'react-router-dom';
import { Home, Target, Sparkles, UtensilsCrossed, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/profile', icon: Target, label: 'Goals' },
  { to: '/chat', icon: Sparkles, label: 'Ask AI' },
];

// Desktop Sidebar
function DesktopSidebar() {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="desktop-sidebar"
      style={{
        width: '220px',
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #eee',
        flexDirection: 'column',
        padding: '24px 12px',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 12px',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8BC34A, #689F38)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <UtensilsCrossed size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '17px', color: '#1a1a1a' }}>MacroFlow</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }} end={to === '/'}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isActive ? '#E8F5E9' : 'transparent',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <Icon
                    size={20}
                    color={isActive ? '#689F38' : '#999'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#689F38' : '#666',
                  }}>
                    {label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User info + Logout at bottom */}
      <div style={{ marginTop: 'auto' }}>
        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: '12px',
          background: '#fafafa',
          marginBottom: '8px',
        }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserIcon size={16} color="#689F38" />
            </div>
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#1a1a1a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#999',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            width: '100%',
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
        >
          <LogOut size={18} color="#FF7043" />
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#FF7043' }}>Log Out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}

// Mobile Bottom Navigation
function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} style={{ textDecoration: 'none' }} end={to === '/'}>
          {({ isActive }) => (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '4px 8px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? '#E8F5E9' : 'transparent',
                transition: 'background 0.2s',
              }}>
                <Icon
                  size={20}
                  color={isActive ? '#689F38' : '#b0b0b0'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#689F38' : '#b0b0b0',
              }}>
                {label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <BottomNav />
    </>
  );
}
