import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./MyProfile.css";

const MyProfile = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    date_of_birth: "",
    gender: "",
    address: "",
    phone_number: "",
    insurance_number: "",
    id_number: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/patient/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        setProfile(response.data.user);
        setFormData({
          username: response.data.user.username || "",
          email: response.data.user.email || "",
          date_of_birth: response.data.user.patient?.date_of_birth || "",
          gender: response.data.user.patient?.gender || "",
          address: response.data.user.patient?.address || "",
          phone_number: response.data.user.patient?.phone_number || "",
          insurance_number: response.data.user.patient?.insurance_number || "",
          id_number: response.data.user.patient?.id_number || "",
        });
        setPreviewAvatar(response.data.user.avatar || "");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append avatar if changed
      if (avatar) {
        formDataToSend.append("avatar", avatar);
      }

      const response = await axios.patch(
        `${API_URL}/patient/update`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.message === "Success") {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        fetchProfile(); // Refresh profile data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        date_of_birth: profile.patient?.date_of_birth || "",
        gender: profile.patient?.gender || "",
        address: profile.patient?.address || "",
        phone_number: profile.patient?.phone_number || "",
        insurance_number: profile.patient?.insurance_number || "",
        id_number: profile.patient?.id_number || "",
      });
      setPreviewAvatar(profile.avatar || "");
      setAvatar(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      <div className="profile-content">
        <div className="profile-avatar">
          <img src={previewAvatar || "/default-avatar.png"} alt="Profile" />
          {isEditing && (
            <div className="avatar-upload">
              <label htmlFor="avatar-upload" className="upload-button">
                Change Avatar
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Name</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter name"
              />
            ) : (
              <div className="profile-info">{formData.username}</div>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            ) : (
              <div className="profile-info">{formData.email}</div>
            )}
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                name="date_of_birth"
                value={
                  formData.date_of_birth
                    ? new Date(formData.date_of_birth)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleInputChange}
              />
            ) : (
              <div className="profile-info">
                {formData.date_of_birth
                  ? new Date(formData.date_of_birth).toLocaleDateString()
                  : "Not set"}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Gender</label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <div className="profile-info">
                {formData.gender
                  ? formData.gender.charAt(0).toUpperCase() +
                    formData.gender.slice(1)
                  : "Not set"}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Address</label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                rows={3}
              />
            ) : (
              <div className="profile-info">
                {formData.address || "Not set"}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            ) : (
              <div className="profile-info">
                {formData.phone_number || "Not set"}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Health Insurance Code</label>
            {isEditing ? (
              <input
                type="text"
                name="insurance_number"
                value={formData.insurance_number}
                onChange={handleInputChange}
                placeholder="Enter health insurance code"
              />
            ) : (
              <div className="profile-info">
                {formData.insurance_number || "Not set"}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Citizen ID</label>
            {isEditing ? (
              <input
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleInputChange}
                placeholder="Enter Citizen ID"
              />
            ) : (
              <div className="profile-info">
                {formData.id_number || "Not set"}
              </div>
            )}
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button
                type="button"
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Update Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-button"
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
