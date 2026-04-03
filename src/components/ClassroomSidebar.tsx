import { NavLink } from "react-router-dom";
import { Home, Settings, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClassroomSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export function ClassroomSidebar({ isOpen, onClose, onLogout }: ClassroomSidebarProps) {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Interviews", path: "/" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 transform transition-transform duration-200 md:relative md:top-0 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 space-y-2">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink key={path} to={path}>
              {({ isActive }) => (
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={onClose}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              )}
            </NavLink>
          ))}
        </div>

        {onLogout && (
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
