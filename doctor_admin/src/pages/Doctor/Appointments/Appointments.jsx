import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import {
  Card,
  Tag,
  Table,
  Space,
  Typography,
  Modal,
  Button,
  Select,
  Input,
  Form,
  message,
  Spin,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MoreOutlined,
  FileTextOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Appointments.css";
import { parse, isSameDay } from "date-fns";

const { Title } = Typography;
const { Option } = Select;

const Appointments = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeStatus, setActiveStatus] = useState("scheduled");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

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
      render: (text) => {
        const [time, date] = text.split(" ");
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes} - ${date}`;
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text) => {
        return text || "Unknown";
      },
    },
    // {
    //   title: "Fee",
    //   dataIndex: "fees",
    //   key: "fees",
    //   render: (text) => `${text.toLocaleString()} VNĐ`,
    // },
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
              onClick={() => handleAppointmentDetails(record.appointment_id)}
            >
              <FileTextOutlined />
              <span>Appointment Details</span>
            </div>
            <div
              className="action-menu-item"
              onClick={() =>
                handlePatientDetails(record.patient?.user?.user_id)
              }
            >
              <UserAddOutlined />
              <span>Patient Details</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/doctor/appointments?page=${pagination.current}&limit=${pagination.pageSize}&status=${activeStatus}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { appointments: fetchedAppointments } = response.data;

      // Filter appointments for today only
      const today = new Date();
      const todayAppointments = fetchedAppointments
        .filter((appt) => {
          const apptDate = parse(
            appt.appointment_datetime,
            "HH:mm:ss d/M/yyyy",
            new Date()
          );
          return isSameDay(apptDate, today);
        })
        .sort((a, b) => {
          const dateA = parse(a.checkin_time, "HH:mm:ss d/M/yyyy", new Date());
          const dateB = parse(b.checkin_time, "HH:mm:ss d/M/yyyy", new Date());
          return dateA - dateB; // ASC (tăng dần)
        });

      setAppointments(todayAppointments);
      setPagination({
        ...pagination,
        total: todayAppointments.length,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [API_URL, activeStatus, pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setPagination({ ...pagination, current: 1 });
  };

  // Handle Appointment Details Modal
  const handleAppointmentDetails = async (appointment_id) => {
    setModalLoading(true);
    setModalVisible(true);
    setSelectedAppointment(appointment_id);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/appointment/details/${appointment_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointmentDetails(res.data.appointmentDetails);
      form.setFieldsValue({
        status: res.data.appointmentDetails.status,
        diagnosis: res.data.appointmentDetails.medical_record?.diagnosis || "",
        treatment: res.data.appointmentDetails.medical_record?.treatment || "",
        notes: res.data.appointmentDetails.medical_record?.notes || "",
        medicine_details:
          res.data.appointmentDetails.prescription?.medicine_details || "",
      });
    } catch {
      message.error("Failed to load appointment details");
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setAppointmentDetails(null);
    setSelectedAppointment(null);
    form.resetFields();
  };

  // Handle Patient Details navigation
  const handlePatientDetails = (user_id) => {
    if (user_id) {
      navigate(`/doctor/patient/${user_id}`);
    } else {
      console.log("Patient information not found");
    }
  };

  return (
    <div className="appointments-container">
      <Title level={2}>Today Appointments</Title>

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

      {/* Appointment Details Modal */}
      <Modal
        title="Appointment Details"
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={580}
      >
        {modalLoading || !appointmentDetails ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: appointmentDetails.status,
              diagnosis: appointmentDetails.medical_record?.diagnosis || "",
              treatment: appointmentDetails.medical_record?.treatment || "",
              notes: appointmentDetails.medical_record?.notes || "",
              medicine_details:
                appointmentDetails.prescription?.medicine_details || "",
            }}
          >
            {/* STATUS */}
            <Form.Item label="Status" name="status">
              <Select
                style={{ width: "100%" }}
                onChange={async (value) => {
                  try {
                    setModalLoading(true);
                    const token = localStorage.getItem("token");
                    await axios.post(
                      `${API_URL}/appointment/${value}/${selectedAppointment}`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    message.success("Status updated");
                    fetchAppointments();
                  } catch {
                    message.error("Failed to update status");
                  } finally {
                    setModalLoading(false);
                    handleModalCancel();
                  }
                }}
              >
                {Object.entries(statusConfig)
                  .filter(([key]) =>
                    ["scheduled", "completed", "no_show"].includes(key)
                  )
                  .map(([status, config]) => (
                    <Option key={status} value={status}>
                      {config.label}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Divider />
            {/* MEDICAL RECORD */}
            <div className="modal-section-title">Medical Record</div>
            <Form.Item
              label="Diagnosis"
              name="diagnosis"
              rules={[{ required: true, message: "Please enter diagnosis" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter diagnosis..." />
            </Form.Item>
            <Form.Item
              label="Treatment"
              name="treatment"
              rules={[{ required: true, message: "Please enter treatment" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter treatment..." />
            </Form.Item>
            <Form.Item label="Notes" name="notes">
              <Input.TextArea rows={4} placeholder="Enter notes ..." />
            </Form.Item>
            <div className="modal-btn-group">
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    setModalLoading(true);
                    const token = localStorage.getItem("token");
                    let values = form.getFieldsValue([
                      "diagnosis",
                      "treatment",
                      "notes",
                    ]);
                    values = {
                      appointment_id: selectedAppointment,
                      diagnosis: values.diagnosis,
                      treatment: values.treatment,
                      notes: values.notes,
                    };
                    await axios.post(`${API_URL}/medical_record/add`, values, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    // message.success("Medical record added");
                    fetchAppointments();
                  } catch {
                    // message.error("Failed to add medical record");
                    console.log("Failed to add medical record");
                  } finally {
                    setModalLoading(false);
                    handleModalCancel();
                  }
                }}
                disabled={!!appointmentDetails.medical_record}
              >
                Add
              </Button>
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    setModalLoading(true);
                    const token = localStorage.getItem("token");
                    const values = form.getFieldsValue([
                      "diagnosis",
                      "treatment",
                      "notes",
                    ]);
                    await axios.patch(
                      `${API_URL}/medical_record/update/${appointmentDetails.medical_record.record_id}`,
                      values,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    // message.success("Medical record updated");
                    fetchAppointments();
                  } catch {
                    // message.error("Failed to update medical record");
                    console.log("Failed to update medical record");
                  } finally {
                    setModalLoading(false);
                  }
                }}
                disabled={!appointmentDetails.medical_record}
              >
                Update
              </Button>
            </div>
            <Divider />
            {/* PRESCRIPTION */}
            <div className="modal-section-title">Prescription</div>
            <Form.Item
              label="Medicine Details"
              name="medicine_details"
              rules={[
                { required: true, message: "Please enter medicine details" },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter medicine details..."
              />
            </Form.Item>
            <div className="modal-btn-group">
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    setModalLoading(true);
                    const token = localStorage.getItem("token");
                    let values = form.getFieldsValue(["medicine_details"]);
                    values = {
                      appointment_id: selectedAppointment,
                      medicine_details: values.medicine_details,
                    };
                    await axios.post(`${API_URL}/prescription/add`, values, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    // message.success("Prescription added");
                    fetchAppointments();
                  } catch {
                    // message.error("Failed to add prescription");
                    console.log("Failed to add prescription");
                  } finally {
                    setModalLoading(false);
                    handleModalCancel();
                  }
                }}
                disabled={!!appointmentDetails.prescription}
              >
                Add
              </Button>
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    setModalLoading(true);
                    const token = localStorage.getItem("token");
                    const values = form.getFieldsValue(["medicine_details"]);
                    await axios.patch(
                      `${API_URL}/prescription/update/${appointmentDetails.prescription.prescription_id}`,
                      values,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    // message.success("Prescription updated");
                    fetchAppointments();
                  } catch {
                    // message.error("Failed to update prescription");
                    console.log("Failed to update prescription");
                  } finally {
                    setModalLoading(false);
                  }
                }}
                disabled={!appointmentDetails.prescription}
              >
                Update
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
