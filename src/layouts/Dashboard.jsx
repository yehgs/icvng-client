//client
import React from 'react';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <section className="bg-white">
      <div className="container mx-auto p-3">
        {/* Content — full width; menu is mobile-only via hamburger */}
        <div className="bg-white min-h-[75vh]">
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
