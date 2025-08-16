import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import StudentManagement from "@/components/StudentManagement";
import AttendanceTracking from "@/components/AttendanceTracking";
import Reports from "@/components/Reports";
import Auth from "@/components/Auth";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (userData: { id: string; email: string; name: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
    setActiveTab("dashboard");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onTabChange={setActiveTab} />;
      case "students":
        return <StudentManagement />;
      case "attendance":
        return <AttendanceTracking />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </Layout>
  );
};

export default Index;
