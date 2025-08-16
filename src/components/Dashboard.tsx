import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Clock, TrendingUp, Calendar } from "lucide-react";
import { storageService, initializeSampleData } from "@/lib/storage";
import { useMemo, useEffect } from "react";
import heroImage from "@/assets/education-hero.jpg";

const Dashboard = ({ onTabChange }: { onTabChange?: (tab: string) => void }) => {
  // Initialize sample data for new users
  useEffect(() => {
    initializeSampleData();
  }, []);

  const stats = useMemo(() => storageService.getAttendanceStats(), []);
  const students = useMemo(() => storageService.getStudents(), []);
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = useMemo(() => storageService.getAttendanceByDate(today), [today]);

  const quickStats = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-gradient-primary",
      change: "+2 this week"
    },
    {
      title: "Present Today", 
      value: stats.present,
      icon: UserCheck,
      color: "bg-gradient-accent",
      change: `${stats.attendanceRate}% rate`
    },
    {
      title: "Absent Today",
      value: stats.absent,
      icon: UserX, 
      color: "bg-destructive",
      change: stats.absent > 0 ? "Follow up needed" : "Great!"
    },
    {
      title: "Late Today",
      value: stats.late,
      icon: Clock,
      color: "bg-warning",
      change: "Track patterns"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-elegant">
        <div className="absolute inset-0 bg-gradient-primary/90" />
        <div 
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <div className="text-primary-foreground max-w-2xl">
                <h1 className="text-4xl font-bold mb-4">Welcome back, Teacher!</h1>
                <p className="text-xl opacity-90 mb-6">Track attendance, manage students, and monitor progress all in one place.</p>
                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => onTabChange?.('attendance')}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Mark Today's Attendance
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => onTabChange?.('reports')}
                  >
                    View Reports
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Overview */}
        <Card className="lg:col-span-2 shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.slice(0, 5).map((student) => {
                const attendance = todayAttendance.find(a => a.studentId === student.id);
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{student.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.studentId} • {student.class}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        attendance?.status === 'present' ? 'default' : 
                        attendance?.status === 'late' ? 'secondary' :
                        attendance?.status === 'absent' ? 'destructive' : 'outline'
                      }
                      className={
                        attendance?.status === 'present' ? 'bg-success hover:bg-success/80' :
                        attendance?.status === 'late' ? 'bg-warning text-warning-foreground hover:bg-warning/80' :
                        ''
                      }
                    >
                      {attendance?.status || 'Not marked'}
                    </Badge>
                  </div>
                );
              })}
              {students.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All Students ({students.length - 5} more)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-gradient-primary border-0 shadow-lg hover:shadow-xl transition-all"
              onClick={() => onTabChange?.('attendance')}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onTabChange?.('students')}
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Students
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onTabChange?.('reports')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onTabChange?.('reports')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Attendance History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;