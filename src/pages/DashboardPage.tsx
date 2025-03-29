
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalPatients: number;
  pendingPatients: number;
  contactedPatients: number;
  interestedPatients: number;
  notInterestedPatients: number;
  coldLeads: number;
  totalFollowUps: number;
  pendingFollowUps: number;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    pendingPatients: 0,
    contactedPatients: 0,
    interestedPatients: 0,
    notInterestedPatients: 0,
    coldLeads: 0,
    totalFollowUps: 0,
    pendingFollowUps: 0,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Get patient counts by status
        let query = supabase.from('patients').select('status', { count: 'exact' });
        
        // Filter by doctor if not admin
        if (user?.role !== "admin") {
          query = query.eq('doctor_id', user?.id);
        }
        
        const { count: totalPatients } = await query;
        
        // Get pending patients
        query = supabase.from('patients').select('id', { count: 'exact' }).eq('status', 'Pending');
        if (user?.role !== "admin") {
          query = query.eq('doctor_id', user?.id);
        }
        const { count: pendingPatients } = await query;
        
        // Get contacted patients
        query = supabase.from('patients').select('id', { count: 'exact' }).eq('status', 'Contacted');
        if (user?.role !== "admin") {
          query = query.eq('doctor_id', user?.id);
        }
        const { count: contactedPatients } = await query;
        
        // Get interested patients
        query = supabase.from('patients').select('id', { count: 'exact' }).eq('status', 'Interested');
        if (user?.role !== "admin") {
          query = query.eq('doctor_id', user?.id);
        }
        const { count: interestedPatients } = await query;
        
        // Get not interested patients
        query = supabase.from('patients').select('id', { count: 'exact' }).eq('status', 'Not Interested');
        if (user?.role !== "admin") {
          query = query.eq('doctor_id', user?.id);
        }
        const { count: notInterestedPatients } = await query;
        
        // Get cold leads
        query = supabase.from('patients').select('id', { count: 'exact' }).eq('status', 'Cold');
        if (user?.role !== "admin") {
          query = query.eq('doctor_id', user?.id);
        }
        const { count: coldLeads } = await query;
        
        // Get follow-ups stats
        let followUpsQuery = supabase.from('follow_ups').select('id', { count: 'exact' });
        if (user?.role !== "admin") {
          followUpsQuery = followUpsQuery.eq('created_by', user?.id);
        }
        const { count: totalFollowUps } = await followUpsQuery;
        
        // Get pending follow-ups (using next_interaction)
        const now = new Date().toISOString();
        query = supabase.from('patients')
          .select('id', { count: 'exact' })
          .not('next_interaction', 'is', null)
          .lt('next_interaction', now);
          
        if (user?.role !== "admin") {
          query = query.eq('doctor_id', user?.id);
        }
        const { count: pendingFollowUps } = await query;
        
        setStats({
          totalPatients: totalPatients || 0,
          pendingPatients: pendingPatients || 0,
          contactedPatients: contactedPatients || 0,
          interestedPatients: interestedPatients || 0,
          notInterestedPatients: notInterestedPatients || 0,
          coldLeads: coldLeads || 0,
          totalFollowUps: totalFollowUps || 0,
          pendingFollowUps: pendingFollowUps || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          variant: "destructive",
          title: "Failed to load dashboard data",
          description: "Please try refreshing the page.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const patientStatusData = [
    { name: 'Pending', value: stats.pendingPatients },
    { name: 'Contacted', value: stats.contactedPatients },
    { name: 'Interested', value: stats.interestedPatients },
    { name: 'Not Interested', value: stats.notInterestedPatients },
    { name: 'Cold', value: stats.coldLeads },
  ];

  const followUpData = [
    { name: 'Total Follow-ups', value: stats.totalFollowUps },
    { name: 'Pending Follow-ups', value: stats.pendingFollowUps },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome {user?.name}! Here's an overview of your patient follow-up statistics.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-t-4 border-medical-teal border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Interested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.interestedPatients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Not Interested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.notInterestedPatients}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cold Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coldLeads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Follow-ups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFollowUps}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingFollowUps}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="patient-status">
            <TabsList>
              <TabsTrigger value="patient-status">Patient Status</TabsTrigger>
              <TabsTrigger value="follow-ups">Follow-up Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="patient-status">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={patientStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {patientStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="follow-ups">
              <Card>
                <CardHeader>
                  <CardTitle>Follow-up Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={followUpData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
