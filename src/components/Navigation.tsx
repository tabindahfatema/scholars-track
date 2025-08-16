import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, Calendar, Users, Home } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'attendance', label: 'Mark Attendance', icon: Calendar },
    { id: 'students', label: 'Manage Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-lg mb-8">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 min-w-fit transition-all duration-200",
            activeTab === tab.id && "bg-gradient-primary text-primary-foreground shadow-lg"
          )}
        >
          <tab.icon className="w-4 h-4 mr-2" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default Navigation;