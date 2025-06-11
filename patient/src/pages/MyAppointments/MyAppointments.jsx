import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Table,
  Select,
  DatePicker,
  Space,
  Tag,
  Card,
  Spin,
  Empty,
  Modal,
  Descriptions,
  Typography,
  Row,
  Col,
  Button,
  Rate,
  Form,
  Input,
} from "antd";
import {
  MoreOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  StarOutlined,
  DollarOutlined,
  StarFilled,
} from "@ant-design/icons";
import { format } from "date-fns";
import "./MyAppointments.css";

const { Title } = Typography;

const MyAppointments = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    date: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackForm] = Form.useForm();

  useEffect(() => {
    fetchAppointments();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      if (filters.date) {
        params.date = format(filters.date, "yyyy-MM-dd");
      }

      const response = await axios.get(`${API_URL}/patient/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (response.data.appointments) {
        setAppointments(response.data.appointments);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      current: 1, // Reset về trang 1 khi thay đổi filter
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "processing";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
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
      toast.error(
        error.response?.data?.message || "Failed to fetch appointment details"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/appointment/cancel_appointment_patient/${selectedAppointment.appointment_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment cancelled successfully");
      setModalVisible(false);
      fetchAppointments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel appointment"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Feedback submit
  const handleFeedbackSubmit = async (values) => {
    if (!selectedAppointment) return;
    setFeedbackLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (selectedAppointment.feedback) {
        // Update feedback
        await axios.patch(
          `${API_URL}/feedback/update/${selectedAppointment.feedback.feedback_id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Feedback updated successfully");
      } else {
        // Add feedback
        await axios.post(
          `${API_URL}/feedback/add`,
          { appointment_id: selectedAppointment.appointment_id, ...values },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Feedback submitted successfully");
      }
      setFeedbackModalVisible(false);
      handleViewDetails(selectedAppointment.appointment_id); // reload details
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const columns = [
    {
      title: "Doctor",
      dataIndex: ["doctor", "user", "username"],
      key: "doctor",
      render: (text, record) => (
        <div className="my-appointments-doctor-info">
          <img
            src={record.doctor.user.avatar || "/default-avatar.png"}
            alt={text}
            className="doctor-avatar"
          />
          <div className="my-appointments-doctor-info-text">
            <div className="my-appointments-doctor-name">{text}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Specialization",
      dataIndex: ["doctor", "specialization", "name"],
      key: "specialization",
    },
    // {
    //   title: "Appointment Time",
    //   dataIndex: "appointment_datetime",
    //   key: "appointment_datetime",
    //   render: (text) => format(new Date(text), "HH:mm dd/MM/yyyy"),
    // },
    {
      title: "Date",
      dataIndex: "checkin_time",
      key: "checkin_time",
      render: (text) => {
        const [time, date] = text.split(" ");
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes} - ${date}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Reason ",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
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

  return (
    <div className="appointments-container">
      <Card title="My Appointments" className="appointments-card">
        <div className="filters">
          <Space size="middle">
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange("status", value)}
              value={filters.status || undefined}
            >
              <Option value="scheduled">Scheduled</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="no_show">No Show</Option>
            </Select>

            <DatePicker
              placeholder="Filter by date"
              onChange={(date) => handleFilterChange("date", date)}
              value={filters.date}
              allowClear
            />
          </Space>
        </div>

        <Spin spinning={loading}>
          {appointments.length > 0 ? (
            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="appointment_id"
              pagination={pagination}
              onChange={handleTableChange}
              className="appointments-table"
            />
          ) : (
            <Empty description="No appointments found" />
          )}
        </Spin>
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
                  {selectedAppointment.status === "completed" &&
                  (!selectedAppointment.payment ||
                    selectedAppointment.payment.status !== "paid") ? (
                    <div className="no-record">
                      You need to pay to view the medical record.
                    </div>
                  ) : selectedAppointment.medical_record ? (
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
                  {selectedAppointment.status === "completed" ? (
                    <>
                      {selectedAppointment.feedback ? (
                        <>
                          <Descriptions bordered column={1}>
                            <Descriptions.Item label="Rating">
                              <StarFilled
                                style={{
                                  color: "#fadb14",
                                  marginRight: 4,
                                  fontSize: 16,
                                }}
                              />
                              {selectedAppointment.feedback.rating || 0}/5
                            </Descriptions.Item>
                            <Descriptions.Item label="Comment">
                              {selectedAppointment.feedback.comment || "N/A"}
                            </Descriptions.Item>
                          </Descriptions>
                          <Button
                            type="primary"
                            style={{ marginTop: 20 }}
                            onClick={() => {
                              feedbackForm.setFieldsValue({
                                rating: selectedAppointment.feedback.rating,
                                comment: selectedAppointment.feedback.comment,
                              });
                              setFeedbackModalVisible(true);
                            }}
                          >
                            Update Feedback
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="no-record">No feedback available</div>
                          <Button
                            type="primary"
                            style={{ marginTop: 20 }}
                            onClick={() => {
                              feedbackForm.resetFields();
                              setFeedbackModalVisible(true);
                            }}
                          >
                            Write Feedback
                          </Button>
                        </>
                      )}
                    </>
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
                  {selectedAppointment.status === "completed" &&
                  (!selectedAppointment.payment ||
                    selectedAppointment.payment.status !== "paid") ? (
                    <div className="no-record">
                      You need to pay to view the prescription.
                    </div>
                  ) : selectedAppointment.prescription ? (
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
            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 24,
              }}
            >
              {selectedAppointment.status === "scheduled" && (
                <Button
                  danger
                  loading={modalLoading}
                  onClick={handleCancelAppointment}
                >
                  Cancel Appointment
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Feedback Modal */}
      <Modal
        title={
          selectedAppointment?.feedback ? "Update Feedback" : "Write Feedback"
        }
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={handleFeedbackSubmit}
          initialValues={{ rating: 5, comment: "" }}
        >
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: "Please rate your experience" }]}
          >
            <Rate allowClear={false} />
          </Form.Item>
          <Form.Item name="comment" label="Comment">
            <Input.TextArea rows={4} placeholder="Write your feedback..." />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={feedbackLoading}
              block
            >
              {selectedAppointment?.feedback
                ? "Update Feedback"
                : "Submit Feedback"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyAppointments;
