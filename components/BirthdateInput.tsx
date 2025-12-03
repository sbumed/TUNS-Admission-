
import React, { useState, useEffect, useMemo } from 'react';

interface BirthdateInputProps {
  value: string; // Expects YYYY-MM-DD
  onChange: (value: string) => void;
  required?: boolean;
  title?: string;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const BirthdateInput: React.FC<BirthdateInputProps> = ({ value, onChange, required, title = 'วันเกิด' }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // When the component loads or the external value changes, parse it and set internal state
  useEffect(() => {
    if (value) {
      const [gregorianYear, monthIndex, dayOfMonth] = value.split('-');
      if (gregorianYear && monthIndex && dayOfMonth) {
        setDay(String(parseInt(dayOfMonth, 10)));
        setMonth(String(parseInt(monthIndex, 10)));
        setYear(String(parseInt(gregorianYear, 10) + 543));
      }
    } else {
        setDay('');
        setMonth('');
        setYear('');
    }
  }, [value]);

  // When internal state changes, call the onChange prop with the formatted date string
  useEffect(() => {
    if (day && month && year) {
      const gregorianYear = parseInt(year, 10) - 543;
      const monthPadded = String(month).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      onChange(`${gregorianYear}-${monthPadded}-${dayPadded}`);
    } else {
      onChange('');
    }
  }, [day, month, year, onChange]);
  
  const currentBuddhistYear = new Date().getFullYear() + 543;
  // Creates a range of years for students aged ~6 to 20
  const years = useMemo(() => Array.from({ length: 15 }, (_, i) => currentBuddhistYear - 20 + i).reverse(), [currentBuddhistYear]);
  
  const daysInMonth = useMemo(() => {
    if (!month || !year) return 31;
    const m = parseInt(month, 10);
    const y = parseInt(year, 10) - 543; // Gregorian year for Date object
    return new Date(y, m, 0).getDate();
  }, [month, year]);

  // Adjust day if it becomes invalid (e.g., changing month from March 31st to February)
  useEffect(() => {
    if (parseInt(day, 10) > daysInMonth) {
        setDay(String(daysInMonth));
    }
  }, [month, year, day, daysInMonth]);

  return (
    <div>
        <label className="block text-sm font-medium text-gray-700">{title}</label>
        <div className="grid grid-cols-3 gap-x-2 mt-1">
          <select
            name="birth_day"
            aria-label="Day of birth"
            className="p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required={required}
          >
            <option value="">-- วัน --</option>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            name="birth_month"
            aria-label="Month of birth"
            className="p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required={required}
          >
            <option value="">-- เดือน --</option>
            {THAI_MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            name="birth_year"
            aria-label="Year of birth"
            className="p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 bg-white"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required={required}
          >
            <option value="">-- ปี พ.ศ. --</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
    </div>
  );
};

export default BirthdateInput;
