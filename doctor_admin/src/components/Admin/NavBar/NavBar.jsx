import { useState } from "react";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  BarChartOutlined,
  CalendarOutlined,
  TeamOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import "./NavBar.css";

const NavBar = () => {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(location.pathname);
  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <BarChartOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/appointments",
      icon: <CalendarOutlined />,
      label: "Appointments",
    },
    {
      key: "/admin/specializations",
      icon: <ProfileOutlined />,
      label: "Specializations",
    },
    {
      key: "/admin/doctors-list",
      icon: <TeamOutlined />,
      label: "Doctors List",
    },
    {
      key: "/admin/patients-list",
      icon: <TeamOutlined />,
      label: "Patients List",
    },
    {
      key: "/admin/schedule-manager",
      icon: <CalendarOutlined />,
      label: "Schedule Manager",
    },
  ];

  return (
    <div className="admin-navbar">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map((item) => ({
          ...item,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
        className="admin-menu"
      />
    </div>
  );
};

export default NavBar;
