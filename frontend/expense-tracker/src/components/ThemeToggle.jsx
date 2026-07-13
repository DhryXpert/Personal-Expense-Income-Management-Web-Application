import { useTheme } from '../context/ThemeContext';
import { LuSun, LuMoon } from 'react-icons/lu';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="theme-toggle-btn"
    >
      {theme === 'dark' ? <LuSun size={20} /> : <LuMoon size={20} />}
    </button>
  );
}
