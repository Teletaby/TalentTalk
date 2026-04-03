import React from "react";
import ClassroomHeader from "@/components/ClassroomHeader";

import ClassroomNavbar from "@/components/ClassroomNavbar";

const ClassroomLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <ClassroomHeader />
      <ClassroomNavbar />
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

export default ClassroomLayout;
