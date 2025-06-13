// Mock data for doctors and their schedules
export const mockDoctors = [
  {
    doctor_id: "D001",
    name: "Dr. John Smith",
    specialization: "Cardiology",
  },
  {
    doctor_id: "D002",
    name: "Dr. Sarah Johnson",
    specialization: "Neurology",
  },
  {
    doctor_id: "D003",
    name: "Dr. Michael Lee",
    specialization: "Pediatrics",
  },
  {
    doctor_id: "D004",
    name: "Dr. Michael Lao",
    specialization: "Pediatrics",
  },
];

export const mockSpecializations = [
  { id: "S001", name: "Cardiology" },
  { id: "S002", name: "Neurology" },
  { id: "S003", name: "Pediatrics" },
];

// Shift types configuration
export const shiftConfig = {
  morning: {
    label: "Morning Shift",
    defaultTime: {
      start: "07:00",
      end: "11:00",
    },
    bgColor: "#1890ff", // Blue
  },
  afternoon: {
    label: "Afternoon Shift",
    defaultTime: {
      start: "13:00",
      end: "17:00",
    },
    bgColor: "#fffbe6", // Light yellow
  },
  custom: {
    label: "Custom Shift",
    bgColor: "#f0f0f0", // Light gray
    defaultTime: {
      start: "09:00",
      end: "17:00",
    },
  },
};

// Helper function to get Monday of current week
export const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

// Helper function to get week dates from Monday
export const getWeekDates = (startDate) => {
  if (!(startDate instanceof Date) || isNaN(startDate)) {
    startDate = new Date();
  }
  const dates = [];
  for (let i = 0; i < 7; i++) {
    // Monday to Sunday
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Format date as dd/mm/yyyy
export const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Format date with weekday
export const formatDateWithWeekday = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return "";
  }

  return `${formatDate(date)}`;
};

// Calculate total hours for a shift
export const calculateHours = (start, end) => {
  if (!start || !end) return 0;
  try {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    if (
      isNaN(startHour) ||
      isNaN(startMinute) ||
      isNaN(endHour) ||
      isNaN(endMinute)
    ) {
      return 0;
    }
    return endHour - startHour + (endMinute - startMinute) / 60;
  } catch (error) {
    console.error("Error calculating hours:", error);
    return 0;
  }
};

// Initial schedule state (empty)
export const initialSchedule = {};
