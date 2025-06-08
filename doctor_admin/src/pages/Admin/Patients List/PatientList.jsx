import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import {
  Card,
  Table,
  Input,
  Button,
  Modal,
  Form,
  message,
  Space,
  Typography,
  Select,
  DatePicker,
  TimePicker,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./PatientList.css";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const PatientList = () => {
  const navigate = useNavigate();
  const { API_URL } = useAppContext();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [addPatientModal, setAddPatientModal] = useState(false);
  const [addAppointmentModal, setAddAppointmentModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientForm] = Form.useForm();
  const [appointmentForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  useEffect(() => {
    fetchPatients();
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/specialization/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpecializations(response.data.specializations || []);
    } catch (err) {
      message.error("Failed to load specializations");
      console.log(err);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/admin/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(response.data.patients || []);
    } catch (err) {
      message.error("Failed to load patients");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const formattedData = {
        ...values,
        date_of_birth: values.date_of_birth.format("YYYY-MM-DD"),
      };

      await axios.post(`${API_URL}/admin/add_patient_offline`, formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Patient added successfully");
      setAddPatientModal(false);
      patientForm.resetFields();
      fetchPatients();
    } catch (err) {
      console.error("Error adding patient:", err);
      message.error(err.response?.data?.message || "Failed to add patient");
    }
  };

  const handleSearchDoctors = async (values) => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/admin/search_doctors`,
        {
          specialization_id: values.specialization_id,
          shift_date: values.shift_date.format("YYYY-MM-DD"),
          shift_type: values.shift_type,
          start_time: values.time_range[0].format("HH:mm:ss"),
          end_time: values.time_range[1].format("HH:mm:ss"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDoctors(response.data.doctors || []);
    } catch (err) {
      message.error("Failed to search doctors");
      console.log(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddAppointment = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/appointment/book_offline`,
        {
          patient_id: selectedPatient.patient_id,
          doctor_id: selectedDoctor.doctor_id,
          reason: values.reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Appointment added successfully");
      setAddAppointmentModal(false);
      appointmentForm.resetFields();
      searchForm.resetFields();
      setSelectedDoctor(null);
      setDoctors([]);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to add appointment");
      console.log(err);
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: ["user", "username"],
      key: "username",
      render: (name, record) => (
        <span
          className="patient-name patient-link"
          style={{
            cursor: "pointer",
          }}
          onClick={() => navigate(`/admin/patient/${record.user.user_id}`)}
        >
          {name}
        </span>
      ),
      sorter: (a, b) => a.user.username.localeCompare(b.user.username),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (text) => (text === "male" ? "Male" : "Female"),
    },
    {
      title: "Date of Birth",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Insurance Number",
      dataIndex: "insurance_number",
      key: "insurance_number",
    },
    {
      title: "Id number",
      dataIndex: "id_number",
      key: "id_number",
    },
    {
      title: "ID Number",
      dataIndex: "id_number",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedPatient(record);
            setAddAppointmentModal(true);
          }}
        >
          Add Appointment
        </Button>
      ),
    },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.user.username.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="patient-list">
      <Title className="patient-list-first-title" level={2}>
        Patients List
      </Title>
      <Card>
        <div className="patient-list-header">
          <Space>
            <Input
              placeholder="Search patients"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="add-patient-button"
              onClick={() => setAddPatientModal(true)}
            >
              Add Patient
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPatients}
          rowKey="patient_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Add Patient"
        open={addPatientModal}
        onCancel={() => setAddPatientModal(false)}
        footer={null}
        className="add-patient-modal-wrapper"
      >
        <Form
          form={patientForm}
          layout="vertical"
          onFinish={handleAddPatient}
          className="add-patient-form"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input username!" }]}
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
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
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
            name="id_number"
            label="ID Number"
            rules={[{ required: true, message: "Please input ID number!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please input address!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="insurance_number" label="Insurance Number">
            <Input />
          </Form.Item>
          <Form.Item className="form-footer">
            <Space>
              <Button onClick={() => setAddPatientModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Add Patient
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Appointment"
        open={addAppointmentModal}
        onCancel={() => {
          setAddAppointmentModal(false);
          searchForm.resetFields();
          appointmentForm.resetFields();
          setSelectedDoctor(null);
          setDoctors([]);
        }}
        footer={null}
        width={800}
      >
        <div className="appointment-modal-content">
          <Form
            form={searchForm}
            layout="vertical"
            onFinish={handleSearchDoctors}
            className="search-doctors-form"
            onValuesChange={(changed) => {
              if (changed.shift_type) {
                // Khi shift_type thay đổi, gán default time_range
                const defaultRange =
                  changed.shift_type === "morning"
                    ? [dayjs("07:00", "HH:mm"), dayjs("12:00", "HH:mm")]
                    : [dayjs("13:00", "HH:mm"), dayjs("17:00", "HH:mm")];

                searchForm.setFieldsValue({ time_range: defaultRange });
              }
            }}
          >
            <div className="search-form-grid">
              <Form.Item
                name="specialization_id"
                label="Specialization"
                rules={[
                  { required: true, message: "Please select specialization!" },
                ]}
              >
                <Select>
                  {specializations.map((spec) => (
                    <Select.Option
                      key={spec.specialization_id}
                      value={spec.specialization_id}
                    >
                      {spec.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="shift_date"
                label="Date"
                rules={[{ required: true, message: "Please select date!" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="shift_type"
                label="Shift"
                rules={[{ required: true, message: "Please select shift!" }]}
              >
                <Select>
                  <Select.Option value="morning">Morning</Select.Option>
                  <Select.Option value="afternoon">Afternoon</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="time_range"
                label="Time Range"
                rules={[
                  { required: true, message: "Please select time range!" },
                ]}
              >
                <TimePicker.RangePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                />
              </Form.Item>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={searchLoading}>
                Search Doctors
              </Button>
            </Form.Item>
          </Form>

          {doctors.length > 0 && (
            <div className="doctors-list">
              <Title level={4}>Available Doctors</Title>
              <div className="doctors-grid">
                {doctors.map((doctor) => (
                  <Card
                    key={doctor.doctor_id}
                    className={`doctor-card ${
                      selectedDoctor?.doctor_id === doctor.doctor_id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <p>
                      <strong>Name:</strong> {doctor.user.username}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedDoctor ? (
            <Form
              form={appointmentForm}
              layout="vertical"
              onFinish={handleAddAppointment}
              className="appointment-form"
            >
              <Form.Item
                name="reason"
                label="Reason for Visit"
                rules={[{ required: true, message: "Please input reason!" }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Book Appointment
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <div>
              <Title level={4}>No doctor selected</Title>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PatientList;
