import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Avatar,
  Descriptions,
  Tag,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Space,
  Popconfirm,
  Spin,
  Select,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  StarOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);
import "./AdminDoctorDetails.css";
import { toast } from "react-toastify";

const { Title } = Typography;

const AdminDoctorDetails = () => {
  const navigate = useNavigate();
  const { user_id } = useParams();
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [shiftModal, setShiftModal] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [shiftForm] = Form.useForm();
  const [shiftLoading, setShiftLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  useEffect(() => {
    fetchDoctorDetails(user_id);
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

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const fetchDoctorDetails = async (user_id) => {
    setLoading(true);
    try {
      const [profileRes, apptRes] = await Promise.all([
        api.get(`/admin/doctor_profile/${user_id}`),
        api.get(`/admin/doctor_appointments/${user_id}`),
      ]);
      setDoctor(profileRes.data.user);
      setAppointments(apptRes.data.appointments || []);

      const today = dayjs().startOf("day");
      const doctorShifts = (
        profileRes.data.user.doctor.doctor_shifts || []
      ).filter((shift) => {
        return dayjs(shift.shift_date).isSameOrAfter(today, "day");
      });
      setShifts(doctorShifts);
    } catch (err) {
      toast.error(err.message || "Failed to load doctor details");
      console.log(err);
    } finally {
      setLoading(false);
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

  // Shift CRUD
  const openAddShift = () => {
    setEditShift(null);
    shiftForm.resetFields();
    setShiftModal(true);
  };
  const openEditShift = (shift) => {
    setEditShift(shift);
    shiftForm.setFieldsValue({
      shift_date: dayjs(shift.shift_date),
      shift_type: shift.shift_type,
      start_time: dayjs(shift.start_time, "HH:mm"),
      end_time: dayjs(shift.end_time, "HH:mm"),
    });
    setShiftModal(true);
  };
  const handleDeleteShift = async (shift_id) => {
    setShiftLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/doctor_shift/${shift_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Shift deleted");
      fetchDoctorDetails(user_id);
    } catch {
      toast.error("Failed to delete shift");
    } finally {
      setShiftLoading(false);
    }
  };
  const handleShiftSubmit = async (values) => {
    setShiftLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        doctor_id: doctor.doctor.doctor_id,
        shift_date: values.shift_date.format("YYYY-MM-DD"),
        shift_type: values.shift_type,
        start_time: values.start_time.format("HH:mm"),
        end_time: values.end_time.format("HH:mm"),
      };

      if (editShift) {
        await axios.patch(
          `${API_URL}/admin/doctor_shift/${editShift.shift_id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Shift updated");
      } else {
        await axios.post(`${API_URL}/admin/doctor_shift`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Shift added");
      }
      setShiftModal(false);
      fetchDoctorDetails(user_id);
    } catch {
      toast.error("Failed to save shift");
    } finally {
      setShiftLoading(false);
    }
  };

  const handleShiftTypeChange = (value) => {
    if (value === "morning") {
      shiftForm.setFieldsValue({
        start_time: dayjs("07:00", "HH:mm"),
        end_time: dayjs("12:00", "HH:mm"),
      });
    } else if (value === "afternoon") {
      shiftForm.setFieldsValue({
        start_time: dayjs("13:00", "HH:mm"),
        end_time: dayjs("17:00", "HH:mm"),
      });
    }
  };

  const shiftColumns = [
    { title: "Date", dataIndex: "shift_date", key: "shift_date" },
    { title: "Type", dataIndex: "shift_type", key: "shift_type" },
    {
      title: "Start",
      dataIndex: "start_time",
      key: "start_time",
    },
    {
      title: "End",
      dataIndex: "end_time",
      key: "end_time",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditShift(record)}
          />
          <Popconfirm
            title="Delete this shift?"
            okText="Delete"
            cancelText="Cancel"
            onConfirm={() => handleDeleteShift(record.shift_id)}
          >
            <Button icon={<DeleteOutlined />} danger loading={shiftLoading} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/appointment/details/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedAppointment(response.data.appointmentDetails);
    } catch (err) {
      toast.error("Failed to load appointment details");
      console.log(err);
    }
  };

  const handleViewAppointment = (record) => {
    fetchAppointmentDetails(record.appointment_id);
    setViewModal(true);
  };

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "80px auto" }} />
    );
  }

  return (
    <div className="admin-doctor-details">
      <div className="doctor-details-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Back
        </Button>
        <Title className="doctor-details-title" level={2}>
          Doctor's Details Information
        </Title>
      </div>
      <Card className="doctor-profile-card">
        <Space align="start" size={32}>
          <Avatar size={100} src={doctor.avatar} icon={<UserOutlined />} />
          <div>
            <Title className="doctor-name-title" level={3}>
              {doctor.username}
            </Title>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Email">
                {doctor.email}
              </Descriptions.Item>
              <Descriptions.Item label="Specialization">
                {doctor.doctor.specialization?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Degree">
                {doctor.doctor.degree}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {doctor.doctor.experience_years} years
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <Tag color="gold">{doctor.doctor.rating || "N/A"}/5</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {doctor.doctor.description}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Space>
      </Card>

      <Card className="doctor-appointments-card" title="Appointment History">
        <div className="appointment-filter">
          <DatePicker
            placeholder="Filter by date"
            format="DD/MM/YYYY"
            onChange={(date) => setSelectedDate(date)}
            allowClear
            style={{ width: 200, marginBottom: 10, marginLeft: 900 }}
          />
        </div>
        <Table
          dataSource={filteredAppointments}
          rowKey="appointment_id"
          columns={[
            {
              title: "Patient",
              dataIndex: ["patient", "user", "username"],
              key: "patient",
            },
            {
              title: "Booking Source",
              dataIndex: "booking_source",
              key: "booking_source",
              render: (text) => (text ? text : "N/A"),
            },
            {
              title: "Date",
              dataIndex: "checkin_time",
              key: "checkin_time",
              render: (text) => (text ? text : "N/A"),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status) => getStatusTag(status),
            },
            { title: "Reason", dataIndex: "reason", key: "reason" },
            { title: "Fees", dataIndex: "fees", key: "fees" },
            {
              title: "Action",
              key: "action",
              render: (_, record) => (
                <Button
                  type="link"
                  onClick={() => handleViewAppointment(record)}
                >
                  View
                </Button>
              ),
            },
          ]}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card className="doctor-shifts-card" title="Shifts">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddShift}
          style={{ marginBottom: 16 }}
        >
          Add Shift
        </Button>
        <Table
          dataSource={shifts}
          rowKey="shift_id"
          columns={shiftColumns}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editShift ? "Edit Shift" : "Add Shift"}
        open={shiftModal}
        onCancel={() => setShiftModal(false)}
        footer={null}
        confirmLoading={shiftLoading}
      >
        <Form form={shiftForm} layout="vertical" onFinish={handleShiftSubmit}>
          <Form.Item
            name="shift_date"
            label="Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="shift_type"
            label="Type"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Morning", value: "morning" },
                { label: "Afternoon", value: "afternoon" },
              ]}
              onChange={handleShiftTypeChange}
            />
          </Form.Item>
          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item className="shift-form-footer">
            <Space>
              <Button
                type="primary"
                className="cancel-button"
                onClick={() => setShiftModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                className="submit-button"
                htmlType="submit"
                loading={shiftLoading}
              >
                {editShift ? "Update" : "Add"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Appointment Details"
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        className="appointment-details-modal"
      >
        {selectedAppointment && (
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
        )}
      </Modal>
    </div>
  );
};

export default AdminDoctorDetails;
