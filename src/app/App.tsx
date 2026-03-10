import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, User, TrendingUp, Palette } from 'lucide-react';
import { MonthPicker } from './components/MonthPicker';
import '../styles/themes.css';

interface Habit {
  id: string;
  name: string;
  completedDays: number[];
}

interface TrackerData {
  name: string;
  month: string;
  habits: Habit[];
}

interface MonthlyData {
  habits: Habit[];
}

interface AllMonthsData {
  [monthKey: string]: MonthlyData; // e.g., "2026-03": { habits: [...] }
}

const STORAGE_KEY = 'habitTrackerData';
const MONTHS_DATA_KEY = 'habitTrackerMonthsData';
const THEME_STORAGE_KEY = 'habitTrackerTheme';

type Theme = 'light' | 'dark' | 'coffee' | 'mint' | 'ocean' | 'lavender';

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'coffee', label: 'Coffee', icon: '☕' },
  { value: 'mint', label: 'Mint', icon: '🌿' },
  { value: 'ocean', label: 'Ocean', icon: '🌊' },
  { value: 'lavender', label: 'Lavender', icon: '💜' }
];

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (savedTheme as Theme) || 'light';
  });

  const [data, setData] = useState<TrackerData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      name: '',
      month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      habits: Array.from({ length: 10 }, (_, i) => ({
        id: `habit-${i}`,
        name: '',
        completedDays: []
      }))
    };
  });

  const [monthsData, setMonthsData] = useState<AllMonthsData>(() => {
    const stored = localStorage.getItem(MONTHS_DATA_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {};
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Save to localStorage whenever monthsData changes
  useEffect(() => {
    localStorage.setItem(MONTHS_DATA_KEY, JSON.stringify(monthsData));
  }, [monthsData]);

  // Save current month's habit data whenever habits change
  useEffect(() => {
    if (data.month) {
      setMonthsData(prev => ({
        ...prev,
        [data.month]: {
          habits: data.habits
        }
      }));
    }
  }, [data.habits, data.month]);

  const updateName = (name: string) => {
    setData(prev => ({ ...prev, name }));
  };

  const updateMonth = (month: string) => {
    // Load data for the selected month if it exists, otherwise create empty habits
    const monthData = monthsData[month];
    
    setData(prev => ({ 
      ...prev, 
      month,
      habits: monthData?.habits || Array.from({ length: 10 }, (_, i) => ({
        id: `habit-${i}`,
        name: '',
        completedDays: []
      }))
    }));
  };

  const updateHabitName = (index: number, name: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map((h, i) => 
        i === index ? { ...h, name } : h
      )
    }));
  };

  const toggleDay = (habitIndex: number, day: number) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map((h, i) => {
        if (i !== habitIndex) return h;
        const completedDays = h.completedDays.includes(day)
          ? h.completedDays.filter(d => d !== day)
          : [...h.completedDays, day];
        return { ...h, completedDays };
      })
    }));
  };

  // Calculate daily scores
  const getDailyScore = (day: number): number => {
    return data.habits.filter(h => h.name && h.completedDays.includes(day)).length;
  };

  // Get max possible score (number of active habits)
  const maxScore = data.habits.filter(h => h.name.trim()).length;

  // Prepare chart data
  const chartData = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    score: getDailyScore(i + 1)
  }));

  // Get days in selected month
  const getDaysInMonth = () => {
    if (!data.month) return 31;
    const [year, month] = data.month.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth();
  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div 
      className={`theme-${theme} min-h-screen p-2 sm:p-4 md:p-8 transition-colors duration-300`}
      style={{
        background: `linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-to))`
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300 relative"
          style={{
            backgroundColor: 'var(--card-bg)',
            boxShadow: `0 10px 15px -3px var(--shadow)`
          }}
        >
          {/* Theme Selector - Compact */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="appearance-none px-2 py-1.5 pr-7 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: `1px solid var(--border)`,
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--primary)'
                } as React.CSSProperties}
              >
                {themes.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
              <Palette 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                style={{ color: 'var(--text-secondary)' }}
              />
            </div>
          </div>

          <h1 
            className="text-2xl sm:text-3xl mb-4 sm:mb-6 text-center transition-colors duration-300 pr-16"
            style={{ color: 'var(--text-accent)' }}
          >
            Monthly Habit Tracker
          </h1>
          
          {/* User Details */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label 
                className="flex items-center gap-2 mb-2 text-sm sm:text-base transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                <User className="w-4 h-4" />
                Name
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: `1px solid var(--border)`,
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--primary)'
                } as React.CSSProperties}
              />
            </div>
            <div>
              <label 
                className="flex items-center gap-2 mb-2 text-sm sm:text-base transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                <Calendar className="w-4 h-4" />
                Month
              </label>
              <MonthPicker
                value={data.month}
                onChange={updateMonth}
              />
            </div>
          </div>
        </div>

        {/* Habit Tracking Table */}
        <div 
          className="rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--card-bg)',
            boxShadow: `0 10px 15px -3px var(--shadow)`
          }}
        >
          <h2 
            className="text-lg sm:text-xl mb-3 sm:mb-4 transition-colors duration-300"
            style={{ color: 'var(--text-primary)' }}
          >
            Daily Habit Tracker
          </h2>
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th 
                    className="p-1.5 sm:p-2 text-left text-xs sm:text-sm min-w-[120px] sm:min-w-[150px] sticky left-0 z-10 transition-colors duration-300"
                    style={{
                      border: `1px solid var(--border)`,
                      backgroundColor: 'var(--table-header)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Habit
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th 
                      key={i} 
                      className="p-1 sm:p-2 text-center text-xs sm:text-sm w-8 sm:w-10 transition-colors duration-300"
                      style={{
                        border: `1px solid var(--border)`,
                        backgroundColor: 'var(--table-header)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.habits.map((habit, habitIndex) => (
                  <tr key={habit.id}>
                    <td 
                      className="p-1.5 sm:p-2 sticky left-0 z-10 transition-colors duration-300"
                      style={{
                        border: `1px solid var(--border)`,
                        backgroundColor: 'var(--card-bg)'
                      }}
                    >
                      <input
                        type="text"
                        value={habit.name}
                        onChange={(e) => updateHabitName(habitIndex, e.target.value)}
                        placeholder={`Habit ${habitIndex + 1}`}
                        className="w-full px-1.5 sm:px-2 py-1 text-xs sm:text-sm rounded focus:outline-none focus:ring-1 transition-all duration-300"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          border: `1px solid var(--border-light)`,
                          color: 'var(--text-primary)',
                          '--tw-ring-color': 'var(--primary)'
                        } as React.CSSProperties}
                      />
                    </td>
                    {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                      const day = dayIndex + 1;
                      const isCompleted = habit.completedDays.includes(day);
                      return (
                        <td 
                          key={day} 
                          className="p-1 sm:p-2 text-center transition-colors duration-300"
                          style={{ border: `1px solid var(--border)` }}
                        >
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleDay(habitIndex, day)}
                            disabled={!habit.name.trim()}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 transition-all duration-300"
                            style={{
                              accentColor: 'var(--primary)'
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Score Section */}
        <div 
          className="rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--card-bg)',
            boxShadow: `0 10px 15px -3px var(--shadow)`
          }}
        >
          <h2 
            className="text-lg sm:text-xl mb-3 sm:mb-4 transition-colors duration-300"
            style={{ color: 'var(--text-primary)' }}
          >
            Daily Scores
          </h2>
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <div className="flex gap-1.5 sm:gap-2 min-w-max sm:grid sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-31">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const score = getDailyScore(day);
                const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
                
                return (
                  <div key={day} className="flex flex-col items-center min-w-[44px] sm:min-w-0">
                    <div 
                      className="text-[10px] sm:text-xs mb-1 transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      D{day}
                    </div>
                    <div 
                      className="w-full h-10 sm:h-12 rounded flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300"
                      style={{
                        backgroundColor: percentage >= 70 ? 'var(--success)' : percentage >= 40 ? 'var(--warning)' : 'var(--danger)',
                        color: 'white',
                        opacity: score === 0 ? 0.3 : 1
                      }}
                    >
                      {score}/{maxScore}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Graph */}
        <div 
          className="rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--card-bg)',
            boxShadow: `0 10px 15px -3px var(--shadow)`
          }}
        >
          <h2 
            className="flex items-center gap-2 text-lg sm:text-xl mb-3 sm:mb-4 transition-colors duration-300"
            style={{ color: 'var(--text-primary)' }}
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Progress Graph
          </h2>
          <div className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%" key={`container-${data.month}`}>
              <LineChart data={chartData.slice(0, daysInMonth)} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" key="grid" stroke="var(--border)" />
                <XAxis 
                  key="xaxis"
                  dataKey="day"
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fontSize: 12, fill: 'var(--text-secondary)' }}
                  stroke="var(--border)"
                />
                <YAxis 
                  key="yaxis"
                  domain={[0, Math.max(maxScore, 10)]}
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  label={{ value: 'Habit Score', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'var(--text-secondary)' }}
                  stroke="var(--border)"
                />
                <Tooltip 
                  key="tooltip"
                  formatter={(value: number) => [`${value} habits`, 'Score']}
                  labelFormatter={(day) => `Day ${day}`}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Line 
                  key="habit-line"
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', r: 3 }}
                  activeDot={{ r: 5, fill: 'var(--primary-light)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Motivational Quote */}
        <div 
          className="rounded-lg shadow-lg p-6 sm:p-8 text-center transition-all duration-300"
          style={{
            background: `linear-gradient(to right, var(--primary), var(--secondary))`,
            boxShadow: `0 10px 15px -3px var(--shadow)`
          }}
        >
          <p className="text-lg sm:text-xl md:text-2xl text-white italic leading-relaxed">
            "Success is the product of daily habits."
          </p>
          <p className="mt-2 text-sm sm:text-base opacity-90" style={{ color: 'white' }}>
            — Stay consistent, stay motivated
          </p>
        </div>
      </div>
    </div>
  );
}