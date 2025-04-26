import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Card,
  Avatar,
  Typography,
  Spin,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Rate,
  message,
} from "antd";
import {
  MailOutlined,
  StarOutlined,
  CalendarOutlined,
  BookOutlined,
  EditOutlined,
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./Profile.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Profile = () => {
  const { API_URL } = useAppContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [specializations, setSpecializations] = useState([]);
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
        // console.log(response.data.user);
        setProfile(response.data.user);
        form.setFieldsValue({
          username: response.data.user.username,
          email: response.data.user.email,
          degree: response.data.user.doctor.degree,
          experience_years: response.data.user.doctor.experience_years,
          description: response.data.user.doctor.description,
          specialization_id: response.data.user.doctor.specialization_id,
        });
      } catch (error) {
        message.error("Failed to fetch profile data");
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSpecializations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/specialization/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log(response.data.specializations);
        setSpecializations(response.data.specializations);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };

    fetchProfile();
    fetchSpecializations();
  }, [API_URL, form]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    form.setFieldsValue(profile);
    setEditing(false);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Create FormData object
      const formData = new FormData();

      // Only add fields that have changed
      const currentValues = form.getFieldsValue();
      const originalValues = {
        username: profile.username,
        email: profile.email,
        degree: profile.doctor.degree,
        experience_years: profile.doctor.experience_years,
        description: profile.doctor.description,
        specialization_id: profile.doctor.specialization_id,
      };

      Object.keys(currentValues).forEach((key) => {
        if (key === "avatar") {
          // Handle avatar file
          if (
            values.avatar &&
            values.avatar.fileList &&
            values.avatar.fileList[0]
          ) {
            const file = values.avatar.fileList[0].originFileObj;
            formData.append("avatar", file);
          }
        } else if (currentValues[key] !== originalValues[key]) {
          formData.append(key, currentValues[key]);
        }
      });

      // Only make the API call if there are changes
      if ([...formData.entries()].length > 0) {
        const response = await axios.patch(
          `${API_URL}/doctor/update`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.message === "Success") {
          toast.success("Profile updated successfully!");
          // Refresh profile data
          const updatedProfile = await axios.get(`${API_URL}/doctor/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setProfile(updatedProfile.data.user);
          setEditing(false);
        }
      } else {
        toast.info("No changes detected");
        setEditing(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
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
        <div className="profile-header">
          <Title level={2}>Doctor Profile</Title>
          {!editing && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              Edit Profile
            </Button>
          )}
        </div>

        {!editing ? (
          <>
            <div className="profile-avatar-section">
              <Avatar size={120} src={avatar} className="profile-avatar" />
              <div className="profile-info">
                <Title level={3} className="profile-name">
                  {username}
                </Title>
                <Text className="profile-role">{role}</Text>
                <div className="profile-rating">
                  <Rate disabled defaultValue={rating} />
                </div>
              </div>
            </div>

            <div className="profile-info-section">
              <div className="profile-info-item">
                <MailOutlined className="profile-icon" />
                <Text>Email: {email}</Text>
              </div>
              <div className="profile-info-item">
                <BookOutlined className="profile-icon" />
                <Text>Specialization: {specialization.name}</Text>
              </div>
              <div className="profile-info-item">
                <StarOutlined className="profile-icon" />
                <Text>Degree: {degree}</Text>
              </div>
              <div className="profile-info-item">
                <CalendarOutlined className="profile-icon" />
                <Text>Experience: {experience_years} years</Text>
              </div>
            </div>

            <div className="profile-description">
              <Title level={4}>About</Title>
              <Paragraph>{description}</Paragraph>
            </div>
          </>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="edit-profile-form"
          >
            <Form.Item
              name="username"
              label="Full Name"
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
              name="experience_years"
              label="Years of Experience"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} max={50} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="description" label="About">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="specialization_id"
              label="Specialization"
              rules={[
                {
                  required: true,
                  message: "Please select your specialization",
                },
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
            <Form.Item name="avatar" label="Profile Picture">
              <Upload
                maxCount={1}
                listType="picture"
                beforeUpload={() => false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Select New Picture</Button>
              </Upload>
            </Form.Item>
            <div className="form-actions">
              <Button
                onClick={handleCancel}
                icon={<CloseOutlined />}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Save Changes
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Profile;
