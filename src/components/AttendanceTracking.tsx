import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, UserCheck, UserX, Clock, Save, Search } from "lucide-react";
import { storageService, Student, AttendanceRecord } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const AttendanceTracking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [students] = useState<Student[]>(storageService.getStudents());
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord['status']>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Load existing attendance for selected date
  useMemo(() => {
    const existingAttendance = storageService.getAttendanceByDate(selectedDate);
    const attendanceMap: Record<string, AttendanceRecord['status']> = {};
    const notesMap: Record<string, string> = {};
    
    existingAttendance.forEach(record => {
      attendanceMap[record.studentId] = record.status;
      if (record.notes) notesMap[record.studentId] = record.notes;
    });
    
    setAttendance(attendanceMap);
    setNotes(notesMap);
  }, [selectedDate]);

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleAttendanceChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleNotesChange = (studentId: string, note: string) => {
    setNotes(prev => ({ ...prev, [studentId]: note }));
  };

  const saveAttendance = () => {
    try {
      Object.entries(attendance).forEach(([studentId, status]) => {
        storageService.markAttendance(studentId, selectedDate, status, notes[studentId]);
      });
      
      toast({
        title: "Success",
        description: `Attendance saved for ${new Date(selectedDate).toLocaleDateString()}`
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to save attendance",
        variant: "destructive"
      });
    }
  };

  const getStatusCount = (status: AttendanceRecord['status']) => {
    return Object.values(attendance).filter(s => s === status).length;
  };

  const statusButtons = [
    { status: 'present' as const, label: 'Present', icon: UserCheck, color: 'bg-success' },
    { status: 'absent' as const, label: 'Absent', icon: UserX, color: 'bg-destructive' },
    { status: 'late' as const, label: 'Late', icon: Clock, color: 'bg-warning' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Tracking</h1>
          <p className="text-muted-foreground">Mark and manage student attendance</p>
        </div>
        
        <Button onClick={saveAttendance} className="bg-gradient-primary border-0 shadow-lg hover:shadow-xl">
          <Save className="w-4 h-4 mr-2" />
          Save Attendance
        </Button>
      </div>

      {/* Date and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <Label htmlFor="date" className="text-sm font-medium">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {statusButtons.map(({ status, label, icon: Icon, color }) => (
          <Card key={status} className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{getStatusCount(status)}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Attendance List */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{student.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.studentId} • {student.class}</p>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                  <div className="flex gap-2">
                    {statusButtons.map(({ status, label, color }) => (
                      <Button
                        key={status}
                        variant={attendance[student.id] === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAttendanceChange(student.id, status)}
                        className={attendance[student.id] === status ? `${color} hover:${color}/80 text-white border-0` : ''}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>

                  {attendance[student.id] && (
                    <div className="lg:min-w-64">
                      <Textarea
                        placeholder="Add notes (optional)"
                        value={notes[student.id] || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        className="min-h-16 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Add students to start tracking attendance"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracking;