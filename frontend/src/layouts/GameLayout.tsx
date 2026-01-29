import React from "react";

import Header from "../components/header/Header";
import { Outlet } from "react-router";

const LayoutContent: React.FC = () => {
  return (
    <div className="flex w-full min-h-screen flex-col">
      <Header />
      <Outlet />
    </div>
  );
};

export default LayoutContent;
