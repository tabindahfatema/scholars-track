import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Download, Calendar, Users, UserCheck } from "lucide-react";
import { storageService, Student, AttendanceRecord } from "@/lib/storage";

const Reports = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  
  const students = useMemo(() => storageService.getStudents(), []);
  const attendance = useMemo(() => storageService.getAttendance(), []);
  
  const classes = useMemo(() => {
    const classSet = new Set(students.map(s => s.class));
    return Array.from(classSet).sort();
  }, [students]);

  const filteredData = useMemo(() => {
    const filtered = attendance.filter(record => {
      const recordDate = record.date;
      const student = students.find(s => s.id === record.studentId);
      
      return recordDate >= dateFrom && 
             recordDate <= dateTo && 
             (selectedClass === "all" || student?.class === selectedClass);
    });
    
    return filtered;
  }, [attendance, students, dateFrom, dateTo, selectedClass]);

  const reportData = useMemo(() => {
    const studentMap = new Map(students.map(s => [s.id, s]));
    const filteredStudents = selectedClass === "all" 
      ? students 
      : students.filter(s => s.class === selectedClass);

    const studentStats = filteredStudents.map(student => {
      const studentAttendance = filteredData.filter(a => a.studentId === student.id);
      const present = studentAttendance.filter(a => a.status === 'present').length;
      const absent = studentAttendance.filter(a => a.status === 'absent').length;
      const late = studentAttendance.filter(a => a.status === 'late').length;
      const total = studentAttendance.length;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        student,
        present,
        absent,
        late,
        total,
        attendanceRate
      };
    });

    const overallStats = {
      totalStudents: filteredStudents.length,
      totalDays: new Set(filteredData.map(a => a.date)).size,
      totalPresent: filteredData.filter(a => a.status === 'present').length,
      totalAbsent: filteredData.filter(a => a.status === 'absent').length,
      totalLate: filteredData.filter(a => a.status === 'late').length,
      averageAttendance: studentStats.length > 0 
        ? Math.round(studentStats.reduce((sum, s) => sum + s.attendanceRate, 0) / studentStats.length)
        : 0
    };

    return { studentStats, overallStats };
  }, [students, filteredData, selectedClass]);

  const exportReport = () => {
    const csvContent = [
      ['Student Name', 'Student ID', 'Class', 'Present', 'Absent', 'Late', 'Total Days', 'Attendance Rate (%)'].join(','),
      ...reportData.studentStats.map(stat => [
        stat.student.name,
        stat.student.studentId,
        stat.student.class,
        stat.present,
        stat.absent,
        stat.late,
        stat.total,
        stat.attendanceRate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${dateFrom}-to-${dateTo}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Reports</h1>
          <p className="text-muted-foreground">Analyze attendance patterns and generate reports</p>
        </div>
        
        <Button onClick={exportReport} className="bg-gradient-accent border-0 shadow-lg hover:shadow-xl">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Class Filter</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(className => (
                    <SelectItem key={className} value={className}>{className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Students</p>
                <p className="text-2xl font-bold">{reportData.overallStats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Days Tracked</p>
                <p className="text-2xl font-bold">{reportData.overallStats.totalDays}</p>
              </div>
              <Calendar className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Present</p>
                <p className="text-2xl font-bold">{reportData.overallStats.totalPresent}</p>
              </div>
              <UserCheck className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg. Attendance</p>
                <p className="text-2xl font-bold">{reportData.overallStats.averageAttendance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student-wise Report */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Student-wise Attendance Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.studentStats.map((stat) => (
              <div key={stat.student.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{stat.student.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{stat.student.name}</h3>
                    <p className="text-sm text-muted-foreground">{stat.student.studentId} • {stat.student.class}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="font-semibold text-success">{stat.present}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="font-semibold text-destructive">{stat.absent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Late</p>
                    <p className="font-semibold text-warning">{stat.late}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <Badge 
                      variant={stat.attendanceRate >= 90 ? "default" : stat.attendanceRate >= 75 ? "secondary" : "destructive"}
                      className={
                        stat.attendanceRate >= 90 ? "bg-success hover:bg-success/80" :
                        stat.attendanceRate >= 75 ? "bg-warning text-warning-foreground hover:bg-warning/80" : ""
                      }
                    >
                      {stat.attendanceRate}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reportData.studentStats.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No data available</h3>
              <p className="text-muted-foreground">
                No attendance records found for the selected period and filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;