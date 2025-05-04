import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, Typography, Alert } from "antd";
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
} from "@ant-design/icons";
import { Column, Pie, Line } from "@ant-design/plots";
import axios from "axios";
import "./Dashboard.css";

const { Title } = Typography;

const Dashboard = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // useEffect(() => {
  //   console.log("appointment trend: ", chartData.appointmentTrend);
  // }, [chartData]);

  const processChartData = (appointments, specializations) => {
    // Process status distribution for pie chart
    const statusCounts = appointments.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    // console.log("statusCounts: ", statusCounts);
    // const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    //   type: status.replace(/_/g, " ").toUpperCase(),
    //   value: count,
    // }));
    const statusData = Object.entries(statusCounts).map(([status, count]) => {
      let typeName = status.replace(/_/g, " ").toUpperCase();
      if (typeName === "WAITING FOR CONFIRMATION") {
        typeName = "PENDING";
      } else if (typeName === "PATIENT NOT COMING") {
        typeName = "NO SHOW";
      }
      return {
        type: typeName,
        value: count,
      };
    });

    // console.log("statusData: ", statusData);
    // Process appointment trend data (by date) for line chart
    const appointmentsByDate = appointments.reduce((acc, app) => {
      const date = app.appointment_datetime.split(" ")[1];
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
    const specData = specializations.map((spec) => ({
      name: spec.name,
      appointments: appointments.filter(
        (app) => app.doctor.specialization_id === spec.specialization_id
      ).length,
    }));

    setChartData({
      statusDistribution: statusData,
      appointmentTrend: trendData,
      specializationDistribution: specData,
    });
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      setLoading(true);
      setError(null);

      const [
        appointmentsRes,
        paidAppointmentsRes,
        doctorsRes,
        patientsRes,
        specializationsRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/appointment/all`, { headers }),
        axios.get(`${API_URL}/appointment/paid`, { headers }),
        axios.get(`${API_URL}/doctor/all`, { headers }),
        axios.get(`${API_URL}/patient/all`, { headers }),
        axios.get(`${API_URL}/specialization/all`, { headers }),
      ]);

      setStats({
        totalAppointments: appointmentsRes.data.appointments.length || 0,
        paidAppointments: paidAppointmentsRes.data.paidAppointments.length || 0,
        totalDoctors: doctorsRes.data.doctors.length || 0,
        totalPatients: patientsRes.data.patients.length || 0,
        totalSpecializations:
          specializationsRes.data.specializations.length || 0,
      });

      processChartData(
        appointmentsRes.data.appointments,
        specializationsRes.data.specializations
      );
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
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
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
      <Title className="admin-title" level={2}>
        Dashboard Overview
      </Title>

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
