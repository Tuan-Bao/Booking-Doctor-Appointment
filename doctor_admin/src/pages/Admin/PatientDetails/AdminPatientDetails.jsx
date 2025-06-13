import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import {
  Card,
  Table,
  Button,
  Modal,
  Space,
  Typography,
  Tag,
  Spin,
  DatePicker,
  Descriptions,
  Avatar,
  Form,
  Input,
  Select,
  Popconfirm,
} from "antd";
import {
  EyeOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./AdminPatientDetails.css";
import { toast } from "react-toastify";

const { Title } = Typography;
const { Option } = Select;

const AdminPatientDetails = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPatientAppointments();
  }, [user_id]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = appointments.filter((appointment) => {
        // Parse the appointment date string
        const [, date] = appointment.checkin_time.split(" ");
        const [day, month, year] = date.split("/");
        const appointmentDate = dayjs(`${year}-${month}-${day}`);

        // Compare with selected date
        return appointmentDate.isSame(selectedDate, "day");
      });
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [selectedDate, appointments]);

  const fetchPatientAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/admin/patient_appointments/${user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(response.data.appointments);
      setUserInfo(response.data.user);
    } catch (err) {
      toast.error("Failed to load patient appointments");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (appointment) => {
    try {
      setViewDetailsModal(true);
      setDetailsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/appointment/details/${appointment.appointment_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointmentDetails(response.data.appointmentDetails);
    } catch (err) {
      toast.error("Failed to load appointment details");
      console.log(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePayment = async (appointment_id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/payment/offline/${appointment_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Payment successful");
      fetchPatientAppointments(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
      console.log(err);
    }
  };

  const handleCheckIn = async (appointment_id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/check_in_appointment/${appointment_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Check in successful");
      fetchPatientAppointments(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || "Check in failed");
      console.log(err);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      scheduled: { color: "blue", text: "Scheduled" },
      completed: { color: "green", text: "Completed" },
      cancelled: { color: "red", text: "Cancelled" },
      no_show: { color: "orange", text: "No Show" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "checkin_time",
      key: "checkin_time",
    },
    {
      title: "Booking Source",
      dataIndex: "booking_source",
      key: "booking_source",
      render: (text) => (text ? text : "N/A"),
    },
    {
      title: "Doctor",
      dataIndex: ["doctor", "user", "username"],
      key: "doctor",
    },
    {
      title: "Specialization",
      dataIndex: ["doctor", "specialization", "name"],
      key: "specialization",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Fees",
      dataIndex: "fees",
      key: "fees",
      render: (fees) => `$${fees}`,
    },
    {
      title: "Payment",
      dataIndex: ["payment", "status"],
      key: "payment",
      render: (status) => (
        <Tag color={status && status === "paid" ? "green" : "red"}>
          {status && status === "paid" ? "Paid" : "Unpaid"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          {record.status === "completed" &&
            record.payment &&
            record.payment.status === "pending" && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => handlePayment(record.appointment_id)}
              >
                Pay
              </Button>
            )}
          {record.status === "scheduled" &&
            record.arrival_status === "pending" && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                style={{ fontSize: 14, paddingLeft: 10, paddingRight: 10 }}
                onClick={() => handleCheckIn(record.appointment_id)}
              >
                Check In
              </Button>
            )}
        </Space>
      ),
    },
  ];

  const handleUpdateProfile = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/admin/update_patient/${user_id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully");
      setUpdateModalVisible(false);
      fetchPatientAppointments(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleDeletePatient = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/patient/delete_patient`, {
        data: { user_id },
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Patient deleted successfully");
      navigate(-1); // Go back to previous page
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to delete patient");
    }
  };

  return (
    <div className="patient-details">
      <div className="patient-details-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Back
        </Button>
        <Title className="patient-details-title" level={2}>
          Patient Details
        </Title>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                username: userInfo?.username,
                email: userInfo?.email,
                gender: userInfo?.patient?.gender,
                date_of_birth: userInfo?.patient?.date_of_birth
                  ? dayjs(userInfo.patient.date_of_birth)
                  : null,
                phone_number: userInfo?.patient?.phone_number,
                address: userInfo?.patient?.address,
                insurance_number: userInfo?.patient?.insurance_number,
                id_number: userInfo?.patient?.id_number,
              });
              setUpdateModalVisible(true);
            }}
          >
            Update Profile
          </Button>
          <Popconfirm
            title="Delete Patient"
            description="Are you sure you want to delete this patient? This action cannot be undone."
            onConfirm={handleDeletePatient}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete Patient
            </Button>
          </Popconfirm>
        </Space>
      </div>
      <Card>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Hiển thị thông tin người dùng */}
            {userInfo && (
              <div className="user-info" style={{ marginBottom: 24 }}>
                <Card type="inner" title="Patient Information" bordered={false}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Avatar
                      size={64}
                      src={userInfo.avatar}
                      style={{ marginRight: 24, background: "#87d068" }}
                    >
                      {userInfo.username?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 20 }}>
                        {userInfo.username}
                      </span>
                      <div style={{ color: "#888" }}>{userInfo.email}</div>
                    </div>
                  </div>
                  <Descriptions column={2} size="middle" bordered>
                    <Descriptions.Item label="Name">
                      {userInfo.username || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Gender">
                      {userInfo.patient?.gender === "male"
                        ? "Male"
                        : userInfo.patient?.gender === "female"
                        ? "Female"
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of Birth">
                      {userInfo.patient?.date_of_birth
                        ? dayjs(userInfo.patient.date_of_birth).format(
                            "DD/MM/YYYY"
                          )
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {userInfo.patient?.phone_number || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address" span={2}>
                      {userInfo.patient?.address || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Health Insurance Code">
                      {userInfo.patient?.insurance_number || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Citizen ID">
                      {userInfo.patient?.id_number || "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            )}
            <div className="appointments-section">
              <div className="appointments-header">
                <h3>Appointment History</h3>
                <div className="filter-section">
                  <DatePicker
                    placeholder="Filter by date"
                    format="DD/MM/YYYY"
                    onChange={(date) => setSelectedDate(date)}
                    allowClear
                    className="date-filter"
                  />
                  {selectedDate && (
                    <Button
                      type="primary"
                      icon={<FilterOutlined />}
                      onClick={() => setSelectedDate(null)}
                      className="clear-filter-button"
                      style={{ height: "30px" }}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={filteredAppointments}
                rowKey="appointment_id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        title="Appointment Details"
        open={viewDetailsModal}
        onCancel={() => {
          setViewDetailsModal(false);
          setAppointmentDetails(null);
        }}
        footer={null}
        width={800}
      >
        {detailsLoading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          appointmentDetails && (
            <div className="appointment-details">
              {appointmentDetails.medical_record ? (
                <div className="details-section">
                  <h4>Medical Record</h4>
                  <p>
                    <strong>Diagnosis:</strong>{" "}
                    {appointmentDetails.medical_record.diagnosis}
                  </p>
                  <p>
                    <strong>Treatment:</strong>{" "}
                    {appointmentDetails.medical_record.treatment}
                  </p>
                  <p>
                    <strong>Notes:</strong>{" "}
                    {appointmentDetails.medical_record.notes || "N/A"}
                  </p>
                </div>
              ) : (
                <div className="details-section">
                  <h4>No Medical Record</h4>
                </div>
              )}

              {appointmentDetails.prescription ? (
                <div className="details-section">
                  <h4>Prescription</h4>
                  <p>
                    <strong>Medications:</strong>{" "}
                    {appointmentDetails.prescription.medicine_details}
                  </p>
                </div>
              ) : (
                <div className="details-section">
                  <h4>No Prescription</h4>
                </div>
              )}

              {appointmentDetails.feedback ? (
                <div className="details-section">
                  <h4>Feedback</h4>
                  <p>
                    <strong>Rating:</strong>{" "}
                    {appointmentDetails.feedback.rating}
                  </p>
                  <p>
                    <strong>Comment:</strong>{" "}
                    {appointmentDetails.feedback.comment}
                  </p>
                </div>
              ) : (
                <div className="details-section">
                  <h4>No Feedback</h4>
                </div>
              )}
            </div>
          )
        )}
      </Modal>

      {/* Update Profile Modal */}
      <Modal
        title="Update Patient Profile"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          className="update-profile-form"
        >
          <Form.Item
            name="username"
            label="Name"
            rules={[{ required: true, message: "Please input name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select gender!" }]}
          >
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date_of_birth"
            label="Date of Birth"
            rules={[
              { required: true, message: "Please select date of birth!" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="phone_number"
            label="Phone Number"
            rules={[{ required: true, message: "Please input phone number!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please input address!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="insurance_number" label="Health Insurance Code">
            <Input />
          </Form.Item>

          <Form.Item name="id_number" label="Citizen ID">
            <Input />
          </Form.Item>

          <Form.Item style={{ marginTop: -10 }}>
            <Space>
              <Button
                style={{
                  backgroundColor: "#fff",
                  color: "blue",
                  border: "1px solid blue",
                }}
                htmlType="submit"
              >
                Update
              </Button>
              <Button
                style={{
                  backgroundColor: "#fff",
                  color: "red",
                  border: "1px solid red",
                }}
                onClick={() => setUpdateModalVisible(false)}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPatientDetails;
