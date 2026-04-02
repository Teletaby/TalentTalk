import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      onLogin(password);
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Lock className="w-12 h-12 text-primary" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Enter admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}
