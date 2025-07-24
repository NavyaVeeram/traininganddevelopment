import * as React from 'react';
import { YearCalendar } from '@mui/x-date-pickers/YearCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

export default function ScrollableYearPicker({ selectedYear, onYearChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        style={{
          maxHeight: 250,      // Limit height
          overflowY: 'auto',   // Enable scroll
          border: '1px solid #ccc',
          borderRadius: 8,
          background: '#fff',
          padding: 8,
        }}
      >
        <YearCalendar
          value={dayjs().year(selectedYear)}
          onChange={(newValue) => {
            onYearChange(newValue.year());
          }}
        />
      </div>
    </LocalizationProvider>
  );
}
