import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import {
  Card,
  Tag,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  Tooltip,
  Modal,
  Descriptions,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  MoreOutlined,
  FileTextOutlined,
  FilterOutlined,
  MedicineBoxOutlined,
  StarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import "./Appointments.css";
import moment from "moment";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Appointments = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeStatus, setActiveStatus] = useState("scheduled");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const statusConfig = {
    scheduled: {
      color: "processing",
      icon: <ClockCircleOutlined />,
      label: "Scheduled",
    },
    completed: {
      color: "success",
      icon: <CheckCircleOutlined />,
      label: "Completed",
    },
    cancelled: {
      color: "error",
      icon: <CloseCircleOutlined />,
      label: "Cancelled",
    },
    no_show: {
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
      title: "Date",
      dataIndex: "checkin_time",
      key: "checkin_time",
      sorter: (a, b) => {
        const dateA = moment(a.checkin_time, "HH:mm:ss D/M/YYYY");
        const dateB = moment(b.checkin_time, "HH:mm:ss D/M/YYYY");
        return dateA - dateB;
      },
      render: (text) => {
        const [time, date] = text.split(" ");
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes} - ${date}`;
      },
    },
    {
      title: "Doctor",
      dataIndex: ["doctor", "user", "username"],
      key: "doctor",
      render: (text, record) => (
        <Space>
          <img
            src={
              record.doctor?.user?.avatar || "https://via.placeholder.com/40"
            }
            alt="Patient"
            className="doctor-avatar"
          />
          <span>{text || "Unknown"}</span>
        </Space>
      ),
    },
    {
      title: "Specialization",
      dataIndex: ["doctor", "specialization", "name"],
      key: "specialization",
      render: (text, record) => (
        <span>{record.doctor?.specialization?.name || "N/A"}</span>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text) => `${text || "N/A"}`,
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
      render: (_, record) => (
        <div className="action-dropdown">
          <MoreOutlined />
          <div className="action-menu">
            <div
              className="action-menu-item"
              onClick={() => handleViewDetails(record.appointment_id)}
            >
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
        `${API_URL}/appointment?page=${pagination.current}&limit=${
          pagination.pageSize
        }&status=${activeStatus}&date=${selectedDate.format("YYYY-MM-DD")}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
  }, [
    API_URL,
    activeStatus,
    pagination.current,
    pagination.pageSize,
    selectedDate,
  ]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setPagination({ ...pagination, current: 1 });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setPagination({ ...pagination, current: 1 });
  };

  const handleViewDetails = async (appointmentId) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/appointment/details/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedAppointment(response.data.appointmentDetails);
      setModalVisible(true);
    } catch (error) {
      console.log(error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="appointments-container">
      <Title className="admin-title" level={2}>
        Appointments Management
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Today"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Scheduled"
              value={stats.scheduled}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Cancelled"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="No Show"
              value={stats.no_show}
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
        <div className="date-filter-wrapper">
          <Tooltip title="Filter by date">
            <FilterOutlined className="filter-icon" />
          </Tooltip>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            allowClear={false}
            className="date-picker"
            suffixIcon={<CalendarOutlined style={{ color: "#1890ff" }} />}
          />
        </div>
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

      {/* Appointment Details Modal */}
      <Modal
        title="Appointment Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        className="appointment-details-modal"
      >
        {modalLoading ? (
          <div className="modal-loading">
            <Spin size="large" />
          </div>
        ) : selectedAppointment ? (
          <div className="appointment-details-content">
            <Row gutter={[24, 24]}>
              {/* Left Column */}
              <Col span={12}>
                <div className="medical-record-section">
                  <Title level={4}>
                    <FileTextOutlined /> Medical Record
                  </Title>
                  {selectedAppointment.medical_record ? (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Diagnosis">
                        {selectedAppointment.medical_record.diagnosis}
                      </Descriptions.Item>
                      <Descriptions.Item label="Treatment">
                        {selectedAppointment.medical_record.treatment}
                      </Descriptions.Item>
                      <Descriptions.Item label="Notes">
                        {selectedAppointment.medical_record.notes}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <div className="no-record">No medical record available</div>
                  )}
                </div>

                <div className="feedback-section">
                  <Title level={4}>
                    <StarOutlined /> Feedback
                  </Title>
                  {selectedAppointment.feedback ? (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Rating">
                        {selectedAppointment.feedback.rating || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Comment">
                        {selectedAppointment.feedback.comment || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <div className="no-record">No feedback available</div>
                  )}
                </div>
              </Col>

              {/* Right Column */}
              <Col span={12}>
                <div className="prescription-section">
                  <Title level={4}>
                    <MedicineBoxOutlined /> Prescription
                  </Title>
                  {selectedAppointment.prescription ? (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Medicine Details">
                        {selectedAppointment.prescription.medicine_details}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <div className="no-record">No prescription available</div>
                  )}
                </div>

                <div className="payment-section">
                  <Title level={4}>
                    <DollarOutlined /> Payment
                  </Title>
                  {selectedAppointment.payment ? (
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label="Amount">
                        {selectedAppointment.payment.amount?.toLocaleString()}{" "}
                        VNĐ
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Tag
                          color={
                            selectedAppointment.payment.status === "paid"
                              ? "success"
                              : "warning"
                          }
                        >
                          {selectedAppointment.payment.status?.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Payment Method">
                        {selectedAppointment.payment.payment_method || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <div className="no-record">No payment available</div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Appointments;
