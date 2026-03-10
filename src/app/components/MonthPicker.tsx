import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  value: string; // YYYY-MM format
  onChange: (value: string) => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    if (value) {
      return parseInt(value.split('-')[0]);
    }
    return new Date().getFullYear();
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMonthSelect = (monthIndex: number) => {
    const month = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${selectedYear}-${month}`);
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    onChange(`${year}-${month}`);
    setSelectedYear(year);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return 'Select month';
    const [year, month] = value.split('-');
    const monthIndex = parseInt(month) - 1;
    return `${MONTH_FULL[monthIndex]} ${year}`;
  };

  const getCurrentMonth = () => {
    if (!value) return -1;
    const [year, month] = value.split('-');
    if (parseInt(year) !== selectedYear) return -1;
    return parseInt(month) - 1;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Input Field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-left flex items-center justify-between"
        style={{
          backgroundColor: 'var(--input-bg)',
          border: `1px solid var(--border)`,
          color: 'var(--text-primary)',
          '--tw-ring-color': 'var(--primary)'
        } as React.CSSProperties}
      >
        <span className={!value ? 'opacity-50' : ''}>
          {getDisplayValue()}
        </span>
        <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
      </button>

      {/* Picker Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 rounded-lg shadow-xl z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: `1px solid var(--border)`,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            minWidth: '280px'
          }}
        >
          {/* Year Selector */}
          <div
            className="flex items-center justify-between p-3 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span
              className="font-semibold text-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear(selectedYear + 1)}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-4 gap-2 p-3">
            {MONTHS.map((month, index) => {
              const isSelected = getCurrentMonth() === index;
              const isCurrentMonth = 
                new Date().getFullYear() === selectedYear &&
                new Date().getMonth() === index;

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthSelect(index)}
                  className="px-3 py-2 rounded text-sm font-medium transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--primary)'
                      : isCurrentMonth
                      ? 'var(--table-header)'
                      : 'transparent',
                    color: isSelected
                      ? 'white'
                      : 'var(--text-primary)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`
                  }}
                >
                  {month}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div
            className="flex items-center justify-between p-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--danger)' }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleThisMonth}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--primary)' }}
            >
              This month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
