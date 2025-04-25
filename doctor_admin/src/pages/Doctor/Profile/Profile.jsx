import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import {
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Tag,
  Space,
  Divider,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  StarOutlined,
  CalendarOutlined,
  BookOutlined,
  PoundOutlined,
} from "@ant-design/icons";
import "./Profile.css";

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
  const { API_URL } = useAppContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/doctor/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL]);

  const showEditModal = () => {
    setIsModalVisible(true);
    const { username, email, avatar, doctor } = profile;
    form.setFieldsValue({
      username,
      email,
      avatar,
      degree: doctor.degree,
      experience_years: doctor.experience_years,
      description: doctor.description,
      specialization_id: doctor.specialization.specialization_id,
    });
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form data:", values);
        setIsModalVisible(false);
      })
      .catch((error) => {
        console.log("Validation failed:", error);
      });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return <div>Error loading profile</div>;
  }

  const { username, email, avatar, role, doctor } = profile;
  const { degree, experience_years, description, rating, specialization } =
    doctor;

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div className="profile-avatar-section">
              <Avatar
                size={200}
                src={avatar}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
              <Title level={3} className="profile-name">
                {username}
              </Title>
              <Tag color="blue" className="profile-role">
                {role}
              </Tag>
              <Button onClick={showEditModal} className="profile-edit-button">
                Edit Profile
              </Button>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <div className="profile-info-section">
              <Space direction="vertical" size="large">
                <div className="profile-info-item">
                  <MailOutlined className="profile-icon" />
                  <Text>Email : {email}</Text>
                </div>

                <div className="profile-info-item">
                  <BookOutlined className="profile-icon" />
                  <Text>Degree: {degree}</Text>
                </div>

                <div className="profile-info-item">
                  <CalendarOutlined className="profile-icon" />
                  <Text>Experience: {experience_years} years</Text>
                </div>

                <div className="profile-info-item">
                  <StarOutlined className="profile-icon" />
                  <Text>Rating: {rating}/5</Text>
                </div>

                <div className="profile-info-item">
                  <BookOutlined className="profile-icon" />
                  <Text>Specialization: {specialization.name}</Text>
                </div>

                <div className="profile-info-item">
                  <PoundOutlined className="profile-icon" />
                  <Text>Fees: {specialization.fees.toLocaleString()} VND</Text>
                </div>
              </Space>

              <Divider />

              <div className="profile-description">
                <Title level={4}>About</Title>
                <Text>{description}</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Edit Profile"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okText="Save"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Avatar" name="avatar">
            <Upload
              name="avatar"
              listType="picture-circle"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = () => {
                  form.setFieldsValue({ avatar: reader.result }); // base64
                };
                reader.readAsDataURL(file);
                return false; // Ngăn upload tự động
              }}
            >
              {form.getFieldValue("avatar") ? (
                <img
                  src={form.getFieldValue("avatar")}
                  alt="avatar"
                  style={{ width: "100%", borderRadius: "50%" }}
                />
              ) : (
                <div>Upload</div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item label="Username" name="username">
            {" "}
            <Input />{" "}
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: "email" }]}>
            {" "}
            <Input />{" "}
          </Form.Item>

          <Form.Item label="Degree" name="degree">
            {" "}
            <Input />{" "}
          </Form.Item>
          <Form.Item label="Experience (years)" name="experience_years">
            {" "}
            <Input type="number" min={0} />{" "}
          </Form.Item>
          <Form.Item label="Description" name="description">
            {" "}
            <Input.TextArea rows={3} />{" "}
          </Form.Item>
          <Form.Item label="Specialization" name="specialization_id">
            <Select>
              <Option value={1}>Pediatrics</Option>
              <Option value={2}>Dermatology</Option>
              <Option value={3}>Cardiology</Option>
              {/* You can load specialization list from API */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
