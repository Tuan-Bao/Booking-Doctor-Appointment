import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import { Card, Tag, Table, Space, Typography, Row, Col, Statistic } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  MoreOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "./Appointments.css";
import moment from "moment";

const { Title } = Typography;

const Appointments = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeStatus, setActiveStatus] = useState("waiting_for_confirmation");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    accepted: 0,
    cancelled: 0,
    completed: 0,
    notComing: 0,
  });

  const statusConfig = {
    waiting_for_confirmation: {
      color: "warning",
      icon: <ClockCircleOutlined />,
      label: "Pending",
    },
    accepted: {
      color: "processing",
      icon: <CheckCircleOutlined />,
      label: "Accepted",
    },
    cancelled: {
      color: "error",
      icon: <CloseCircleOutlined />,
      label: "Cancelled",
    },
    completed: {
      color: "success",
      icon: <CheckCircleOutlined />,
      label: "Completed",
    },
    patient_not_coming: {
      color: "default",
      icon: <UserOutlined />,
      label: "No Show",
    },
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: ["patient", "user", "username"],
      key: "patient",
      render: (text, record) => (
        <Space>
          <img
            src={
              record.patient?.user?.avatar || "https://via.placeholder.com/40"
            }
            alt="Patient"
            className="patient-avatar"
          />
          <span>{text || "Unknown"}</span>
        </Space>
      ),
    },
    {
      title: "Time",
      dataIndex: "appointment_datetime",
      key: "time",
      sorter: (a, b) => {
        const dateA = moment(a.appointment_datetime, "HH:mm:ss D/M/YYYY");
        const dateB = moment(b.appointment_datetime, "HH:mm:ss D/M/YYYY");
        return dateA - dateB;
      },
      render: (text) => {
        const [time, date] = text.split(" ");
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes} - ${date}`;
      },
    },
    {
      title: "Fee",
      dataIndex: "fees",
      key: "fees",
      render: (text) => `${text.toLocaleString()} VNĐ`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          icon={statusConfig[status].icon}
          color={statusConfig[status].color}
        >
          {statusConfig[status].label}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: () => (
        <div className="action-dropdown">
          <MoreOutlined />
          <div className="action-menu">
            <div className="action-menu-item">
              <FileTextOutlined />
              <span>Appointment Details</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/appointment/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(response.data);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/appointment?page=${pagination.current}&limit=${pagination.pageSize}&status=${activeStatus}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(response.data);
      const { appointments: fetchedAppointments, pagination: paginationData } =
        response.data;
      setAppointments(fetchedAppointments);
      setPagination({
        ...pagination,
        total: paginationData.total,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAppointments();
  }, [API_URL, activeStatus, pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <div className="appointments-container">
      <Title level={2}>Appointment Management</Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Today"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.waiting}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Accepted"
              value={stats.accepted}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Cancelled"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="No Show"
              value={stats.notComing}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#d9d9d9" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Status Filter Tags */}
      <div className="status-tags">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Tag
            key={status}
            icon={config.icon}
            color={activeStatus === status ? config.color : "default"}
            onClick={() => handleStatusChange(status)}
            className="status-tag"
          >
            {config.label}
          </Tag>
        ))}
      </div>

      {/* Appointments Table */}
      <Card className="appointments-table">
        <Table
          columns={columns}
          dataSource={appointments}
          loading={loading}
          rowKey="appointment_id"
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default Appointments;
