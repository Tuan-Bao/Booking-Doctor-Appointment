import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Avatar,
  Row,
  Col,
  Typography,
  Spin,
  Rate,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Select,
  Space,
  Popconfirm,
} from "antd";
import { toast } from "react-toastify";
import { useAppContext } from "../../../context/AppContext";
import {
  UserOutlined,
  StarOutlined,
  CalendarOutlined,
  TeamOutlined,
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./DoctorList.css";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const AdminDoctorList = () => {
  const { API_URL } = useAppContext();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("username");
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    // specializations: 0,
    avgRating: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const handleAddDoctor = () => {
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  const handleDelete = async (user_id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/doctor/delete/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Doctor deleted successfully");
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete doctor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("specialization_id", values.specialization_id);
      formData.append("degree", values.degree);
      formData.append("experience_years", values.experience_years);
      formData.append("description", values.description);
      if (fileList[0]) {
        formData.append("avatar", fileList[0]);
      }
      await axios.post(`${API_URL}/doctor/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Doctor added successfully");
      setModalVisible(false);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add doctor");
      setModalVisible(false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImg = file.type.startsWith("image/");
      if (!isImg) {
        toast.error("Only images are allowed");
        return false;
      }
      setFileList([file]);
      return false;
    },
    onRemove: () => setFileList([]),
    fileList,
  };

  const fetchSpecs = async () => {
    setLoadingSpecs(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/specialization/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpecializations(data.specializations);
      // setStats((prev) => ({
      //   ...prev,
      //   specializations: data.specializations.length,
      // }));
    } catch (err) {
      toast.error("Failed to load specializations");
      console.error(err);
    } finally {
      setLoadingSpecs(false);
    }
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API_URL}/doctor/all`;
      if (selectedSpec) {
        url += `?specialization_id=${selectedSpec}`;
      }
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(data);
      setDoctors(data.doctors);

      // Cập nhật thống kê
      const avgRating =
        data.doctors.reduce((acc, curr) => acc + curr.rating, 0) /
        data.doctors.length;

      setStats((prev) => ({
        ...prev,
        total: data.doctors.length,
        avgRating: avgRating,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load doctors");
      console.error(err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    if (!searchText) return true;
    const value = searchText.toLowerCase();
    switch (searchCriteria) {
      case "username":
        return doctor.user?.username?.toLowerCase().includes(value);
      case "email":
        return doctor.user?.email?.toLowerCase().includes(value);
      case "degree":
        return doctor.degree?.toLowerCase().includes(value);
      default:
        return true;
    }
  });

  // 1. Lấy list chuyên khoa
  useEffect(() => {
    fetchSpecs();
  }, [API_URL]);

  // 2. Lấy list bác sĩ (có filter nếu selectedSpec có giá trị)
  useEffect(() => {
    fetchDoctors();
  }, [API_URL, selectedSpec]);

  const columns = [
    {
      title: "Avatar",
      dataIndex: ["user", "avatar"],
      key: "avatar",
      width: 80,
      render: (src) => (
        <Avatar
          src={src}
          size="large"
          icon={!src && <UserOutlined />}
          className="avatar"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: ["user", "username"],
      key: "username",
      render: (name, record) => (
        <span
          className="doctor-name doctor-link"
          style={{
            cursor: "pointer",
            color: "#1890ff",
          }}
          onClick={() => navigate(`/admin/doctor/${record.user.user_id}`)}
        >
          {name}
        </span>
      ),
      sorter: (a, b) => a.user.username.localeCompare(b.user.username),
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      render: (email) => <span className="doctor-email">{email}</span>,
    },
    {
      title: "Specialization",
      dataIndex: ["specialization", "name"],
      key: "specialization",
      render: (name) => <span className="doctor-specialization">{name}</span>,
      filters: specializations.map((s) => ({
        text: s.name,
        value: s.specialization_id,
      })),
      onFilter: (val, rec) => rec.specialization.specialization_id === val,
    },
    {
      title: "Degree",
      dataIndex: ["degree"],
      key: "degree",
      render: (degree) => <span className="doctor-degree">{degree}</span>,
    },
    {
      title: "Experience",
      dataIndex: ["experience_years"],
      key: "exp",
      render: (years) => (
        <span className="doctor-experience">
          <CalendarOutlined /> {years} years
        </span>
      ),
      sorter: (a, b) => a.experience_years - b.experience_years,
    },
    {
      title: "Rating",
      dataIndex: ["rating"],
      key: "rating",
      render: (rating) => (
        <span className="doctor-rating">
          <Rate disabled defaultValue={rating} /> ({rating})
        </span>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "Action",
      key: "actions",
      width: "10%",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this specialization?"
            onConfirm={() => handleDelete(record.user.user_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              loading={loading}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-doctor-list">
      <Title className="admin-title" level={2}>
        Doctor Management
      </Title>

      <Row gutter={[24, 24]} className="stats-row">
        {/* <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Specializations"
              value={stats.specializations}
              prefix={
                <ExperimentOutlined
                  className="stat-icon"
                  style={{ background: "#fff7e6", color: "#fa8c16" }}
                />
              }
            />
          </Card>
        </Col> */}

        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Doctors"
              value={stats.total}
              prefix={
                <TeamOutlined
                  className="stat-icon"
                  style={{ background: "#e6f4ff", color: "#1890ff" }}
                />
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Average Rating"
              value={stats.avgRating.toFixed(2)}
              prefix={
                <StarOutlined
                  className="stat-icon"
                  style={{ background: "#fff1f0", color: "#f5222d" }}
                />
              }
              suffix="/5"
            />
          </Card>
        </Col>
      </Row>

      <Card size="small" className="spec-filter-card">
        <Row gutter={[8, 8]}>
          <Col>
            <Tag
              color={!selectedSpec ? "blue" : "default"}
              onClick={() => setSelectedSpec(null)}
              style={{ cursor: "pointer" }}
            >
              All Specializations
            </Tag>
          </Col>
          {loadingSpecs ? (
            <Col>
              <Spin size="small" />
            </Col>
          ) : (
            specializations.map((spec) => (
              <Col key={spec.specialization_id}>
                <Tag
                  color={
                    selectedSpec === spec.specialization_id ? "blue" : "default"
                  }
                  onClick={() => setSelectedSpec(spec.specialization_id)}
                  style={{ cursor: "pointer" }}
                >
                  {spec.name}
                </Tag>
              </Col>
            ))
          )}
        </Row>
      </Card>

      <Card className="doctor-table-card">
        <div className="doctor-table-header">
          {/* Thanh tìm kiếm */}
          <Card
            className="doctor-search-card"
            style={{ marginBottom: 16, marginLeft: 16 }}
          >
            <Space>
              <Select
                defaultValue="username"
                value={searchCriteria}
                style={{ width: 120 }}
                onChange={setSearchCriteria}
              >
                <Select.Option value="username">Name</Select.Option>
                <Select.Option value="email">Email</Select.Option>
                <Select.Option value="degree">Degree</Select.Option>
              </Select>
              <Input
                placeholder={`Search by ${searchCriteria}`}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 240 }}
                className="search-input"
              />
            </Space>
          </Card>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="add-doctor-button"
            onClick={handleAddDoctor}
          >
            Add Doctor
          </Button>
        </div>
        <Table
          rowKey="doctor_id"
          columns={columns}
          dataSource={filteredDoctors}
          loading={loadingDoctors}
          // pagination={{
          //   pageSize: 10,
          //   showTotal: (total) => `Total ${total} doctors`,
          //   showSizeChanger: true,
          //   showQuickJumper: true,
          // }}
        />
        <Modal
          title="Add Doctor"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="username"
              label="Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }]}
            >
              <Input.Password className="admin-doctor-list-password-form-item" />
            </Form.Item>

            <Form.Item
              name="specialization_id"
              label="Specialization"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select specialization">
                {specializations.map((s) => (
                  <Select.Option
                    key={s.specialization_id}
                    value={s.specialization_id}
                  >
                    {s.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="degree"
              label="Degree"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="experience_years"
              label="Experience (years)"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item label="Avatar">
              <Upload {...uploadProps} listType="picture">
                <Button icon={<UploadOutlined />}>Upload Avatar</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  className="cancel-button-doctor-admin"
                  onClick={() => setModalVisible(false)}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create Doctor
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AdminDoctorList;
