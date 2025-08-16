import { useState } from "react";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import StudentManagement from "@/components/StudentManagement";
import AttendanceTracking from "@/components/AttendanceTracking";
import Reports from "@/components/Reports";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
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

  return (
    <Layout>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </Layout>
  );
};

export default Index;
