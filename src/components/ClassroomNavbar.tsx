import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`
      }
    >
      {children}
    </RouterNavLink>
  );
};

const ClassroomNavbar = () => {
  return (
    <nav className="bg-white shadow-sm mb-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-start h-16">
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/stream">Stream</NavLink>
                <NavLink to="/classwork">Classwork</NavLink>
                <NavLink to="/assignments">Assignments</NavLink>
                <NavLink to="/people">People</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ClassroomNavbar;
