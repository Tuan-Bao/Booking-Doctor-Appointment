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
import { toast } from "react-toastify";

const { Title } = Typography;

const PatientList = () => {
  const navigate = useNavigate();
  const { API_URL } = useAppContext();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("username");
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
      toast.error("Failed to load specializations");
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
      toast.error("Failed to load patients");
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
      toast.success("Patient added successfully");
      setAddPatientModal(false);
      patientForm.resetFields();
      fetchPatients();
    } catch (err) {
      console.error("Error adding patient:", err);
      toast.error(err.response?.data?.message || "Failed to add patient");
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
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDoctors(response.data.doctors || []);
    } catch (err) {
      toast.error("Failed to search doctors");
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
      toast.success("Appointment added successfully");
      setAddAppointmentModal(false);
      appointmentForm.resetFields();
      searchForm.resetFields();
      setSelectedDoctor(null);
      setDoctors([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add appointment");
      console.log(err);
    }
  };

  const columns = [
    {
      title: "Name",
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
      title: "Health Insurance Code",
      dataIndex: "insurance_number",
      key: "insurance_number",
    },
    {
      title: "Citizen ID",
      dataIndex: "id_number",
      key: "id_number",
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
  const filteredPatients = patients.filter((patient) => {
    if (!searchText) return true;

    const searchValue = searchText.toLowerCase();
    // Kiểm tra giá trị tồn tại trước khi chuyển sang lowercase
    const hasValue = (value) =>
      value ? value.toString().toLowerCase().includes(searchValue) : false;

    switch (searchCriteria) {
      case "username":
        return hasValue(patient.user?.username);
      case "email":
        return hasValue(patient.user?.email);
      case "phone_number":
        return hasValue(patient.phone_number);
      case "address":
        return hasValue(patient.address);
      case "id_number":
        return hasValue(patient.id_number);
      case "insurance_number":
        return hasValue(patient.insurance_number);
      default:
        return true;
    }
  });

  return (
    <div className="patient-list">
      <Title className="patient-list-first-title" level={2}>
        Patients List
      </Title>
      <Card>
        <div
          className="patient-list-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <Select
              defaultValue="username"
              style={{ width: 120 }}
              onChange={(value) => setSearchCriteria(value)}
            >
              <Select.Option value="username">Name</Select.Option>
              <Select.Option value="email">Email</Select.Option>
              <Select.Option value="phone_number">Phone</Select.Option>
              <Select.Option value="address">Address</Select.Option>
              <Select.Option value="id_number">CID</Select.Option>
              <Select.Option value="insurance_number">
                Health Insurance Code
              </Select.Option>
            </Select>
            <Input
              placeholder={`Search by ${searchCriteria}`}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="add-patient-button"
            onClick={() => setAddPatientModal(true)}
          >
            Add Patient
          </Button>
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
            label="Citizen ID"
            rules={[{ required: true, message: "Please input Citizen ID!" }]}
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
          <Form.Item name="insurance_number" label="Health Insurance Code">
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
