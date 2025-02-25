import React from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "./AdminLayout";

const Admin = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default Admin;
