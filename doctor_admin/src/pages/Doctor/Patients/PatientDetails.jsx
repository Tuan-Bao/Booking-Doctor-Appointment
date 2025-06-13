import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Spin,
  Descriptions,
  List,
  Collapse,
  Tag,
  Empty,
  Button,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import "./PatientDetails.css";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const PatientDetails = () => {
  const navigate = useNavigate();
  const { user_id } = useParams();
  const { API_URL } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchPatientDetails();
    // eslint-disable-next-line
  }, [user_id]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Gọi API lấy thông tin bệnh nhân và lịch sử khám
      const res = await axios.get(
        `${API_URL}/doctor/patient/${user_id}/appointments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log(res.data);
      setPatient(res.data.user);
      setAppointments(res.data.appointments || []);
    } catch {
      toast.error("Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-details-container">
      <Card className="patient-details-card">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="back-button"
          >
            Back
          </Button>
        </div>
        <Title level={2}>
          <UserOutlined /> Patient Details
        </Title>
        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <Spin size="large" />
          </div>
        ) : !patient ? (
          <Empty description="No patient information found" />
        ) : (
          <>
            <Descriptions
              bordered
              column={1}
              size="middle"
              className="patient-info"
            >
              <Descriptions.Item label="Name">
                {patient.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {patient.email}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {patient.patient.address}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {patient.patient.phone_number}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {patient.patient.gender}
              </Descriptions.Item>
              <Descriptions.Item label="D.O.B">
                {new Date(patient.patient.date_of_birth).toLocaleDateString(
                  "en-GB"
                )}
              </Descriptions.Item>
            </Descriptions>

            <Title level={4} style={{ marginTop: 32 }}>
              <CalendarOutlined /> Medical History
            </Title>
            {appointments.length === 0 ? (
              <Empty description="No medical history found" />
            ) : (
              <Collapse accordion>
                {appointments.map((appt) => (
                  <Panel
                    header={
                      <span>
                        {appt.checkin_time} -{" "}
                        <Tag color="blue">{appt.doctor?.user?.username}</Tag>
                        <Tag color="{appt.status === 'completed' ? 'green' : appt.status === 'cancelled' ? 'red' : 'orange'}">
                          {appt.status}
                        </Tag>
                      </span>
                    }
                    key={appt.appointment_id}
                  >
                    <div className="appointment-details">
                      <p>
                        <b>Doctor:</b> {appt.doctor?.user?.username}
                      </p>
                      <p>
                        <b>Specialization:</b>{" "}
                        {appt.doctor?.specialization?.name}
                      </p>
                      <p>
                        <b>Status:</b> {appt.status}
                      </p>
                      <p>
                        <b>Reason:</b> {appt.reason || <i>No reason</i>}
                      </p>
                      <p>
                        <b>Medical Record:</b>
                      </p>
                      <div className="medical-record-block">
                        <FileTextOutlined /> <span>Diagnosis:</span>{" "}
                        {appt.medical_record?.diagnosis || <i>No record</i>}
                        <br />
                        <FileTextOutlined /> <span>Treatment:</span>{" "}
                        {appt.medical_record?.treatment || <i>No record</i>}
                        <br />
                        <FileTextOutlined /> <span>Notes:</span>{" "}
                        {appt.medical_record?.notes || <i>No record</i>}
                      </div>
                      <p>
                        <b>Prescription:</b>
                      </p>
                      <div className="prescription-block">
                        <MedicineBoxOutlined /> <span>Medicine Details:</span>{" "}
                        {appt.prescription?.medicine_details || (
                          <i>No prescription</i>
                        )}
                      </div>
                    </div>
                  </Panel>
                ))}
              </Collapse>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default PatientDetails;
