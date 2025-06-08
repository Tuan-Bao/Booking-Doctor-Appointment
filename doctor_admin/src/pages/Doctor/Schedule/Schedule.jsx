import React, { useState, useEffect } from "react";
import { Card, Typography, Tag, Spin, Alert, Empty } from "antd";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import "./Schedule.css";

const { Title, Text } = Typography;

const Schedule = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetchShifts();
  }, []);

  // useEffect(() => {
  //   console.log(shifts);
  // }, [shifts]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/doctor/shifts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Lấy ngày hiện tại (dd/mm/yyyy)
      const today = new Date();
      const todayStr = today.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Lọc các ca làm từ hôm nay trở về sau
      const filteredShifts = (response.data.shifts || []).filter((shift) => {
        // shift.shift_date dạng dd/mm/yyyy
        const [d, m, y] = shift.shift_date.split("/");
        const shiftDate = new Date(`${y}-${m}-${d}`);
        // So sánh ngày
        return shiftDate >= new Date(todayStr.split("/").reverse().join("-"));
      });

      setShifts(filteredShifts);
    } catch (error) {
      toast.error("Failed to fetch shifts");
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group shifts by date
  const groupedShifts = shifts.reduce((acc, shift) => {
    const date = shift.shift_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="schedule-container">
        <Card className="schedule-card">
          <div className="loading-container">
            <Spin size="large" />
            <Text>Loading schedule...</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <Card className="schedule-card">
        <Title level={2}>Work Schedule</Title>
        <Alert
          message="Schedule Information"
          description="View your work schedule for the upcoming days. Each time slot shows your working hours."
          type="info"
          showIcon
          className="schedule-alert"
        />

        <div className="schedule-content">
          {Object.keys(groupedShifts).length === 0 ? (
            <Empty description="No shifts scheduled" />
          ) : (
            Object.entries(groupedShifts).map(([date, dateShifts]) => (
              <div key={date} className="schedule-date-group">
                <div className="schedule-date-header">
                  <CalendarOutlined />
                  <Text strong>{date}</Text>
                </div>
                <div className="schedule-shifts">
                  {dateShifts.map((shift) => (
                    <div key={shift.shift_id} className="schedule-item">
                      <div className="schedule-time">
                        <ClockCircleOutlined />
                        <Text strong>
                          {shift.start_time} - {shift.end_time}
                        </Text>
                      </div>
                      <Tag
                        color={
                          shift.shift_type === "morning" ? "blue" : "orange"
                        }
                      >
                        {shift.shift_type === "morning"
                          ? "Morning Shift"
                          : "Afternoon Shift"}
                      </Tag>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Schedule;
