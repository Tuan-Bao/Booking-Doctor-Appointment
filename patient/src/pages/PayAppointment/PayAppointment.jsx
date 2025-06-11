import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Typography,
  Spin,
  Divider,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import "./PayAppointment.css";

const { Title, Text } = Typography;

const PayAppointment = () => {
  const { appointment_id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointment_id]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/appointment/payment/${appointment_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointment(response.data.appointment);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch appointment details"
      );
      navigate("/payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/payment/momo/${appointment_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.paymentUrl) {
        // Redirect to MoMo payment page
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error("Failed to create payment URL");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pay-appointment-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="pay-appointment-container">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/payment")}
        className="pay-appointment-back-button"
      >
        Back to Payments
      </Button>

      <Row gutter={24}>
        {/* Left Column - Payment Summary */}
        <Col xs={24} md={8}>
          <Card className="pay-appointment-payment-card">
            <Title level={4} className="pay-appointment-payment-title">
              Payment Summary
            </Title>
            <div className="pay-appointment-payment-summary">
              <div className="pay-appointment-payment-amount">
                <Text>Total Amount</Text>
                <Title level={3} className="pay-appointment-amount">
                  {appointment.payment.amount.toLocaleString()} VNĐ
                </Title>
              </div>
              <Divider />
              <div className="pay-appointment-payment-method">
                <Text>Payment Method</Text>
                <div className="pay-appointment-momo-logo">
                  <img
                    src={`https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png`}
                    alt="MoMo"
                    style={{ width: "100px", height: "100px" }}
                  />
                </div>
              </div>
              {appointment.payment.status === "pending" && (
                <Button
                  type="primary"
                  size="large"
                  icon={<DollarOutlined />}
                  onClick={handlePayment}
                  className="pay-appointment-button"
                  block
                >
                  Pay with MoMo
                </Button>
              )}
            </div>
          </Card>
        </Col>

        {/* Right Column - Appointment Details */}
        <Col xs={24} md={16}>
          <Card className="pay-appointment-details-card">
            <Title level={4} className="pay-appointment-details-title">
              Appointment Details
            </Title>
            <div className="pay-appointment-details">
              <div className="pay-appointment-section">
                <Title level={5} style={{ marginTop: "10px" }}>
                  <UserOutlined /> Doctor Information
                </Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Name">
                    {appointment.doctor.user.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="Specialization">
                    {appointment.doctor.specialization.name}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <Divider />

              <div className="pay-appointment-section">
                <Title level={5}>
                  <CalendarOutlined /> Appointment Information
                </Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Date">
                    {appointment.checkin_time
                      ? appointment.checkin_time.split(" ")[1]
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Time">
                    {appointment.checkin_time
                      ? appointment.checkin_time.split(" ")[0]
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reason">
                    {appointment.reason || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <Divider />

              <div className="pay-appointment-section">
                <Title level={5}>
                  <DollarOutlined /> Payment Status
                </Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Status">
                    <Text
                      type={
                        appointment.payment.status === "paid"
                          ? "success"
                          : appointment.payment.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {appointment.payment.status.toUpperCase()}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PayAppointment;
