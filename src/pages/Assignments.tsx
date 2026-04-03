import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Assignments = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Assignment
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You have no assignments.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assignments;
