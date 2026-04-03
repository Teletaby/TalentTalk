import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ClassroomStream = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Announce something to your class</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea className="w-full p-2 border rounded" placeholder="Share with your class..."></textarea>
          <div className="flex justify-end mt-2">
            <Button>Post</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No work due soon</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomStream;
