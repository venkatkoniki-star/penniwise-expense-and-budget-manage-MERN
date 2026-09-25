import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MonthPicker = ({ month, year, onChange }) => {
  const goPrev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const goNext = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <div className="month-picker">
      <button onClick={goPrev}><ChevronLeft size={16} /></button>
      <div className="month-label">{MONTH_NAMES[month - 1]} {year}</div>
      <button onClick={goNext}><ChevronRight size={16} /></button>
    </div>
  );
};

export default MonthPicker;
