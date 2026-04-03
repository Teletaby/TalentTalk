import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ClassroomHeader = () => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img src="/logo.svg" alt="TalentTalk" className="h-8 w-8 mr-3" />
        <h1 className="text-xl font-bold text-gray-700">TalentTalk Classroom</h1>
      </div>
      <div>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default ClassroomHeader;
