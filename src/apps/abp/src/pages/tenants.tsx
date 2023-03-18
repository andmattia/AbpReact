import { AdminLayout, TenantCreate, TenantList } from "@abpreact/ui";
import { NextPage } from "next";
import React from "react";
import { AdminMenus } from "../utils/Constants";

interface Props {}

const Tenants: NextPage = ({}: Props) => {
  return (
    <AdminLayout menus={AdminMenus}>
      <TenantCreate />
      <div className="pt-8">
        <TenantList />
      </div>
    </AdminLayout>
  );
};

export default Tenants;
