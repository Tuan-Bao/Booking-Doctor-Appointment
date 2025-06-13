import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Typography,
  Alert,
  DatePicker,
  Space,
} from "antd";
import { useAppContext } from "../../../context/AppContext";
import {
  CalendarOutlined,
  DollarCircleOutlined,
  UserOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { Column, Pie, Line } from "@ant-design/plots";
import axios from "axios";
import dayjs from "dayjs";
import "./Dashboard.css";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    paidAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalSpecializations: 0,
  });
  const [chartData, setChartData] = useState({
    statusDistribution: [],
    appointmentTrend: [],
    specializationDistribution: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (allAppointments.length > 0) {
      processChartData(allAppointments);
    }
  }, [dateRange, allAppointments]);

  const processChartData = (appointments) => {
    // Filter appointments by date range if dateRange exists
    const filteredAppointments = dateRange
      ? appointments.filter((app) => {
          const appointmentDate = dayjs(app.checkin_time, "HH:mm:ss D/M/YYYY");
          return (
            appointmentDate.isAfter(dateRange[0]) &&
            appointmentDate.isBefore(dateRange[1].add(1, "day"))
          );
        })
      : appointments;
    console.log("filteredAppointments: ", filteredAppointments);
    // Process status distribution for pie chart
    const statusCounts = filteredAppointments.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, count]) => {
      let typeName = status.replace(/_/g, " ").toUpperCase();
      return {
        type: typeName,
        value: count,
      };
    });

    // Process appointment trend data (by date) for line chart
    const appointmentsByDate = filteredAppointments.reduce((acc, app) => {
      const date = app.checkin_time.split(" ")[1];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const trendData = Object.entries(appointmentsByDate)
      .map(([date, count]) => ({
        date,
        appointments: count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Process specialization distribution for column chart
    const specData =
      stats.specializations?.map((spec) => ({
        name: spec.name,
        appointments: filteredAppointments.filter(
          (app) => app.doctor.specialization_id === spec.specialization_id
        ).length,
      })) || [];

    setChartData({
      statusDistribution: statusData,
      appointmentTrend: trendData,
      specializationDistribution: specData,
    });

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalAppointments: filteredAppointments.length,
      paidAppointments: filteredAppointments.filter(
        (app) => app.payment?.status === "paid"
      ).length,
    }));
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      setLoading(true);
      setError(null);

      const [appointmentsRes, doctorsRes, patientsRes, specializationsRes] =
        await Promise.all([
          axios.get(`${API_URL}/appointment/all`, { headers }),
          axios.get(`${API_URL}/doctor/all`, { headers }),
          axios.get(`${API_URL}/patient/all`, { headers }),
          axios.get(`${API_URL}/specialization/all`, { headers }),
        ]);

      setAllAppointments(appointmentsRes.data.appointments);
      setStats((prev) => ({
        ...prev,
        totalDoctors: doctorsRes.data.doctors.length || 0,
        totalPatients: patientsRes.data.patients.length || 0,
        totalSpecializations:
          specializationsRes.data.specializations.length || 0,
        specializations: specializationsRes.data.specializations,
      }));

      processChartData(appointmentsRes.data.appointments);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const pieConfig = {
    data: chartData.statusDistribution,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      text: "value",
      position: "spider",
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
    interactions: [{ type: "element-active" }],
  };

  const lineConfig = {
    data: chartData.appointmentTrend,
    xField: "date",
    yField: "appointments",
    smooth: true,
    lineStyle: {
      lineWidth: 3,
      stroke: "#1890ff",
    },
    point: {
      size: 5,
      shape: "circle",
    },
    label: {
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
  };

  const columnConfig = {
    data: chartData.specializationDistribution,
    xField: "name",
    yField: "appointments",
    label: {
      position: "top",
      style: {
        fill: "#000000",
        opacity: 0.8,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title className="admin-title" level={2}>
          Dashboard Overview
        </Title>
        <Space className="dashboard-filters">
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            allowClear={true}
            className="date-range-picker"
            placeholder={["Start Date", "End Date"]}
          />
        </Space>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="dashboard-alert"
        />
      )}

      <Row gutter={[24, 24]} className="dashboard-stats">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Appointments"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Paid Appointments"
              value={stats.paidAppointments}
              prefix={<DollarCircleOutlined style={{ color: "#52c41a" }} />}
              suffix={`/ ${stats.totalAppointments}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Doctors"
              value={stats.totalDoctors}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={12}>
          <Card>
            <Statistic
              title="Total Patients"
              value={stats.totalPatients}
              prefix={<TeamOutlined style={{ color: "#fa8c16" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={12}>
          <Card>
            <Statistic
              title="Total Specializations"
              value={stats.totalSpecializations}
              prefix={<MedicineBoxOutlined style={{ color: "#eb2f96" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard-charts">
        <Col xs={24} lg={12}>
          <Card title="Appointment Status Distribution">
            <Pie {...pieConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Appointments by Specialization">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Appointment Trend">
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
