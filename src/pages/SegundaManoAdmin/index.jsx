import React from "react";
import "../../css/adminsidebar.css";

const AdminPortal = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* This div is equivalent to your #root mount point */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Segunda Mana Admin Portal</h1>
        <p className="text-gray-600 mt-2">
          This is the React version of your HTML entry page.
        </p>
      </div>
    </div>
  );
};

export default AdminPortal;
