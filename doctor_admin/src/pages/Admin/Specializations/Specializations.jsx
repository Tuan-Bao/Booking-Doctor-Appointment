import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Popconfirm,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useAppContext } from "../../../context/AppContext";
import axios from "axios";
import "./Specialization.css";

const { Title } = Typography;

const Specializations = () => {
  const { API_URL } = useAppContext();
  const [form] = Form.useForm();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [originalRecord, setOriginalRecord] = useState(null);

  const fetchSpecializations = async (
    page = pagination.current,
    pageSize = pagination.pageSize
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/specialization?page=${page}&limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSpecializations(response.data.specializations);
      setPagination({
        current: response.data.currentPage,
        pageSize: pageSize,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      toast.error("Failed to fetch specializations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, [API_URL]);

  const handleTableChange = (newPagination) => {
    fetchSpecializations(newPagination.current, newPagination.pageSize);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFileList([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.specialization_id);
    setOriginalRecord(record);
    setFileList([
      {
        uid: "-1",
        name: "image.png",
        status: "done",
        url: record.image,
      },
    ]);
    form.setFieldsValue({
      name: record.name,
      fees: record.fees,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    setLoadingAdd(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/specialization/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Specialization deleted successfully");
      fetchSpecializations();
    } catch (error) {
      toast.error("Failed to delete specialization");
      console.error(error);
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoadingAdd(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      let hasChange = false;

      if (editingId) {
        if (values.name !== originalRecord?.name) {
          formData.append("name", values.name);
          hasChange = true;
        }
        if (values.fees !== originalRecord?.fees) {
          formData.append("fees", values.fees);
          hasChange = true;
        }
        if (fileList[0]?.uid !== "-1") {
          formData.append("image", fileList[0]);
          hasChange = true;
        }
        if (!hasChange) {
          toast.info("No changes detected.");
          return;
        }
        await axios.patch(
          `${API_URL}/specialization/update/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Specialization updated successfully");
      } else {
        formData.append("name", values.name);
        formData.append("fees", values.fees);
        if (fileList[0]) {
          formData.append("image", fileList[0]);
        }
        await axios.post(`${API_URL}/specialization/create`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Specialization created successfully");
      }

      setModalVisible(false);
      fetchSpecializations();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save specialization"
      );
      console.error(error);
    } finally {
      setLoadingAdd(false);
    }
  };

  const columns = [
    // {
    //   title: "ID",
    //   dataIndex: "specialization_id",
    //   key: "specialization_id",
    //   width: "10%",
    // },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: "15%",
      render: (image) => (
        <img
          src={image}
          alt="specialization"
          className="specialization-image"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "30%",
    },
    {
      title: "Fees (VNĐ)",
      dataIndex: "fees",
      key: "fees",
      width: "25%",
      render: (fees) => fees.toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this specialization?"
            onConfirm={() => handleDelete(record.specialization_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              loading={loadingAdd}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        toast.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        toast.error("Image must be smaller than 2MB!");
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <div className="specializations-container">
      <Title className="admin-title" level={2}>
        Specialization Management
      </Title>
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Specializations"
              value={specializations.length}
              prefix={
                <ExperimentOutlined
                  className="stat-icon"
                  style={{ background: "#fff7e6", color: "#fa8c16" }}
                />
              }
            />
          </Card>
        </Col>
      </Row>
      <Card>
        <div className="specializations-header">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="add-button"
          >
            Add Specialization
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={specializations}
          rowKey="specialization_id"
          loading={loading}
          pagination={
            //   {
            //   ...pagination,
            //   showSizeChanger: true,
            //   showQuickJumper: true,
            //   showTotal: (total) => `Total ${total} items`,
            //   pageSizeOptions: ["10", "20", "50"],
            // }
            pagination
          }
          onChange={handleTableChange}
        />

        <Modal
          title={editingId ? "Edit Specialization" : "Add Specialization"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ fees: 0 }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please input the name!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="fees"
              label="Fees (VNĐ)"
              rules={[{ required: true, message: "Please input the fees!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                min={0}
              />
            </Form.Item>

            <Form.Item label="Image">
              <Upload {...uploadProps} listType="picture" maxCount={1}>
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>

            <Form.Item className="form-actions">
              <Space>
                <Button
                  type="primary"
                  className="cancel-button-specialization-admin"
                  onClick={() => setModalVisible(false)}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loadingAdd}>
                  {editingId ? "Update" : "Create"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default Specializations;
