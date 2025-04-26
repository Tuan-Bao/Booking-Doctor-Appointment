import React, { useState, useEffect } from "react";
import {
  Calendar,
  Card,
  TimePicker,
  Button,
  Typography,
  Tag,
  Space,
  Spin,
  Alert,
} from "antd";
import { ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import "./Schedule.css";

const { Title, Text } = Typography;

const Schedule = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  // Get the date range for the next 7 days
  const today = dayjs();
  const nextWeek = today.add(6, "day");

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/doctor/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTimeSlots(response.data.schedule || []);
    } catch (error) {
      toast.error("Failed to fetch schedule");
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleAddTimeSlot = async () => {
    if (!selectedDate || !selectedTime) {
      toast.warning("Please select both date and time");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const dateTime =
        selectedDate.format("YYYY-MM-DD") +
        " " +
        selectedTime.format("HH:mm:ss");

      await axios.post(
        `${API_URL}/doctor/schedule`,
        { datetime: dateTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Time slot added successfully");
      fetchSchedule();
      setSelectedTime(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add time slot");
      console.error("Error adding time slot:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (slotId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/doctor/schedule/${slotId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Time slot deleted successfully");
      fetchSchedule();
    } catch (error) {
      toast.error("Failed to delete time slot");
      console.error("Error deleting time slot:", error);
    } finally {
      setLoading(false);
    }
  };

  const dateCellRender = (date) => {
    const slotsForDate = timeSlots.filter(
      (slot) =>
        dayjs(slot.datetime).format("YYYY-MM-DD") === date.format("YYYY-MM-DD")
    );

    return (
      <ul className="schedule-slots">
        {slotsForDate.map((slot) => (
          <li key={slot.id}>
            <Tag
              color="error"
              icon={<ClockCircleOutlined />}
              closable
              onClose={() => handleDeleteTimeSlot(slot.id)}
            >
              {dayjs(slot.datetime).format("HH:mm")}
            </Tag>
          </li>
        ))}
      </ul>
    );
  };

  const disabledDate = (current) => {
    return current.isBefore(today, "day") || current.isAfter(nextWeek, "day");
  };

  return (
    <div className="schedule-container">
      <Card className="schedule-card">
        <Title level={2}>Manage Your Schedule</Title>
        <Alert
          message="Schedule Management"
          description="Select dates within the next 7 days to mark your unavailable time slots. These slots will not be available for patient bookings."
          type="info"
          showIcon
          className="schedule-alert"
        />

        <div className="schedule-content">
          <div className="calendar-section">
            <Calendar
              fullscreen={false}
              onSelect={handleDateSelect}
              dateCellRender={dateCellRender}
              disabledDate={disabledDate}
              value={selectedDate}
            />
          </div>

          <div className="time-picker-section">
            {selectedDate && (
              <Space
                direction="vertical"
                size="large"
                className="time-picker-container"
              >
                <Title level={4}>
                  Selected Date: {selectedDate?.format("MMMM D, YYYY")}
                </Title>
                <Space>
                  <TimePicker
                    format="HH:mm"
                    minuteStep={30}
                    value={selectedTime}
                    onChange={handleTimeSelect}
                    placeholder="Select time"
                    className="time-picker"
                  />
                  <Button
                    type="primary"
                    onClick={handleAddTimeSlot}
                    loading={loading}
                  >
                    Add Break Time
                  </Button>
                </Space>
              </Space>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Schedule;
