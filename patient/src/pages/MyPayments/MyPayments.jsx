import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Typography, Spin, Card, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./MyPayments.css";
import { useAppContext } from "../../context/AppContext";

const MyPayments = () => {
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  const fetchAppointments = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/patient/payments?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(response.data.appointments);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleTableChange = (pagination) => {
    fetchAppointments(pagination.current, pagination.pageSize);
  };

  const handlePayment = (appointmentId) => {
    navigate(`/payment/${appointmentId}`);
  };

  const columns = [
    {
      title: "Doctor",
      dataIndex: ["doctor", "user", "username"],
      key: "doctor",
      render: (text, record) => (
        <div className="payment-doctor-info">
          <img
            src={record.doctor.user.avatar || "/default-avatar.png"}
            alt={text}
            className="payment-doctor-avatar"
          />
          <div className="payment-doctor-info-text">
            <div className="payment-doctor-name">{text}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Specialization",
      dataIndex: ["doctor", "specialization", "name"],
      key: "specialization",
    },
    {
      title: "Date",
      dataIndex: "checkin_time",
      key: "checkin_time",
      render: (text) => {
        if (!text) return "N/A";
        const [time, date] = text.split(" ");
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes} - ${date}`;
      },
    },
    {
      title: "Amount",
      dataIndex: ["payment", "amount"],
      key: "amount",
      render: (text) => (text ? `${text.toLocaleString()} VNĐ` : "N/A"),
    },
    {
      title: "Payment Status",
      dataIndex: ["payment", "status"],
      key: "payment_status",
      render: (status) => {
        const statusConfig = {
          paid: { color: "success", text: "PAID" },
          pending: { color: "warning", text: "PENDING" },
          failed: { color: "error", text: "FAILED" },
        };
        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.payment?.status === "pending") {
          return (
            <Button
              type="primary"
              onClick={() => handlePayment(record.appointment_id)}
            >
              Pay Now
            </Button>
          );
        } else {
          return (
            <Button type="default" style={{ width: "80px" }}>
              Paid
            </Button>
          );
        }
      },
    },
  ];

  return (
    <div className="payments-container">
      <Card title="Payment For Appointments" className="payments-card">
        <Spin spinning={loading}>
          {appointments.length > 0 ? (
            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="appointment_id"
              pagination={pagination}
              onChange={handleTableChange}
              loading={loading}
              className="payments-table"
            />
          ) : (
            <Empty description="No appointments found" />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default MyPayments;
