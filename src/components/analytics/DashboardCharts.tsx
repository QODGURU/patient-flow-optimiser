
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PatientStatusChart from "./PatientStatusChart";
import FollowUpTrendChart from "./FollowUpTrendChart";
import ConversionRateChart from "./ConversionRateChart";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  BarChart, 
  ResponsiveContainer, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  FunnelChart,
  Funnel,
  FunnelProps,
  LabelList
} from "recharts";

// Define the props for the DashboardCharts component
interface DashboardChartsProps {
  chartTypes?: string[];
}

export interface PatientStatusData {
  status: string;
  count: number;
}

export interface FollowUpData {
  date: string;
  calls: number;
  messages: number;
  responses?: number;
}

export interface ConversionData {
  doctor: string;
  contacted: number;
  interested: number;
  booked: number;
}

// Premium color palette
const PREMIUM_COLORS = [
  "#4361ee", "#3a0ca3", "#7209b7", "#f72585", 
  "#4cc9f0", "#4895ef", "#560bad", "#480ca8", 
  "#3f37c9", "#4361ee", "#4cc9f0", "#00b4d8"
];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartTypes = ["all"] }) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState("month");

  // Sample data for patient status
  const patientStatusData = [
    { status: "Interested", count: 37, color: PREMIUM_COLORS[0] },
    { status: "Not Interested", count: 24, color: PREMIUM_COLORS[1] },
    { status: "Pending", count: 45, color: PREMIUM_COLORS[2] },
    { status: "Contacted", count: 28, color: PREMIUM_COLORS[3] },
    { status: "Booked", count: 19, color: PREMIUM_COLORS[4] }
  ];

  // Sample data for conversion rate
  const conversionRateData = [
    { doctor: "Dr. Smith", contacted: 48, interested: 22, booked: 15 },
    { doctor: "Dr. Johnson", contacted: 52, interested: 19, booked: 12 },
    { doctor: "Dr. Williams", contacted: 38, interested: 24, booked: 18 },
    { doctor: "Dr. Brown", contacted: 45, interested: 20, booked: 14 }
  ];

  // Sample data for follow-up trend
  const followUpTrendData = (() => {
    const today = new Date();
    const data = [];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      data.unshift({
        date: dateStr,
        calls: Math.floor(Math.random() * 8) + 3,
        messages: Math.floor(Math.random() * 10) + 5,
        responses: Math.floor(Math.random() * 7) + 2
      });
    }
    
    return data;
  })();

  // Sample data for other charts
  const treatmentCategoriesData = [
    { category: "Dental", count: 32, color: PREMIUM_COLORS[0] },
    { category: "Orthodontics", count: 28, color: PREMIUM_COLORS[1] },
    { category: "Cosmetic", count: 25, color: PREMIUM_COLORS[2] },
    { category: "Surgical", count: 15, color: PREMIUM_COLORS[3] },
    { category: "Preventive", count: 20, color: PREMIUM_COLORS[4] },
  ];

  const channelPreferencesData = [
    { channel: "Call", count: 45, color: PREMIUM_COLORS[0] },
    { channel: "SMS", count: 32, color: PREMIUM_COLORS[1] },
    { channel: "Email", count: 18, color: PREMIUM_COLORS[2] },
    { channel: "Not Specified", count: 10, color: PREMIUM_COLORS[3] },
  ];

  const timePreferencesData = [
    { time: "Morning", count: 38, color: PREMIUM_COLORS[0] },
    { time: "Afternoon", count: 29, color: PREMIUM_COLORS[1] },
    { time: "Evening", count: 25, color: PREMIUM_COLORS[2] },
    { time: "Not Specified", count: 13, color: PREMIUM_COLORS[3] },
  ];

  const interactionOutcomesData = [
    { outcome: "Yes", count: 43, color: PREMIUM_COLORS[0] },
    { outcome: "No", count: 21, color: PREMIUM_COLORS[1] },
    { outcome: "Maybe", count: 18, color: PREMIUM_COLORS[2] },
    { outcome: "No Answer", count: 32, color: PREMIUM_COLORS[3] },
    { outcome: "Opt-out", count: 7, color: PREMIUM_COLORS[4] },
  ];

  // Lead funnel data
  const leadFunnelData = [
    { value: 100, name: 'Leads', fill: PREMIUM_COLORS[0] },
    { value: 80, name: 'Contacted', fill: PREMIUM_COLORS[1] },
    { value: 55, name: 'Interested', fill: PREMIUM_COLORS[2] },
    { value: 40, name: 'Consultation', fill: PREMIUM_COLORS[3] },
    { value: 20, name: 'Booked', fill: PREMIUM_COLORS[4] },
  ];

  // Function to render a premium pie chart
  const renderPieChart = (data: any[], dataKey: string, nameKey: string, title: string) => {
    return (
      <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">{title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || PREMIUM_COLORS[index % PREMIUM_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} patients`} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Function to render a premium bar chart
  const renderBarChart = (data: any[], dataKey: string, nameKey: string, title: string) => {
    return (
      <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">{title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30,
              }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={nameKey} 
                scale="point" 
                padding={{ left: 20, right: 20 }} 
                tick={{fontSize: 12}}
                tickLine={{stroke: '#ddd'}}
              />
              <YAxis 
                tick={{fontSize: 12}}
                tickLine={{stroke: '#ddd'}}
              />
              <Tooltip 
                formatter={(value) => [`${value} patients`, ""]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '6px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  border: '1px solid #eaeaea'
                }}
              />
              <Bar 
                dataKey={dataKey} 
                fill={PREMIUM_COLORS[0]}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Function to render lead funnel chart
  const renderLeadFunnel = () => {
    return (
      <Card className="col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Lead Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={400}>
            <FunnelChart>
              <Tooltip
                formatter={(value) => [`${value} leads`, ""]}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '6px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  border: '1px solid #eaeaea'
                }}
              />
              <Funnel
                dataKey="value"
                nameKey="name"
                data={leadFunnelData}
                isAnimationActive={true}
                labelLine={true}
              >
                <LabelList position="right" fill="#555" stroke="none" dataKey="name" />
                {leadFunnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Function to determine if a chart should be rendered
  const shouldRenderChart = (chartName: string) => {
    return chartTypes.includes("all") || chartTypes.includes(chartName);
  };

  // Define color objects for chart components that expect objects
  const chartColorObjects = {
    contacted: PREMIUM_COLORS[0],
    interested: PREMIUM_COLORS[1],
    booked: PREMIUM_COLORS[2]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {/* Lead Funnel (New) */}
      {shouldRenderChart("leadFunnel") && renderLeadFunnel()}
      
      {/* Main charts with premium styling */}
      {shouldRenderChart("patientStatus") && (
        <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-800">{t("patientStatusDistribution")}</h3>
            <PatientStatusChart data={patientStatusData} colors={PREMIUM_COLORS} />
          </CardContent>
        </Card>
      )}

      {shouldRenderChart("conversionRate") && (
        <Card className="col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-800">{t("conversionRateByDoctor")}</h3>
            <ConversionRateChart data={conversionRateData} colors={chartColorObjects} />
          </CardContent>
        </Card>
      )}

      {shouldRenderChart("followUpTrend") && (
        <Card className="col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-800">{t("followUpTrend")}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={followUpTrendData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 12}}
                  tickLine={{stroke: '#ddd'}}
                />
                <YAxis 
                  tick={{fontSize: 12}}
                  tickLine={{stroke: '#ddd'}}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: '1px solid #eaeaea'
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  stackId="1" 
                  stroke={PREMIUM_COLORS[0]} 
                  fill={PREMIUM_COLORS[0]} 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stackId="2" 
                  stroke={PREMIUM_COLORS[1]} 
                  fill={PREMIUM_COLORS[1]} 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="responses" 
                  stackId="3" 
                  stroke={PREMIUM_COLORS[2]} 
                  fill={PREMIUM_COLORS[2]} 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Additional charts */}
      {shouldRenderChart("treatmentCategories") &&
        renderPieChart(
          treatmentCategoriesData,
          "count",
          "category",
          t("treatmentCategoriesDistribution")
        )}

      {shouldRenderChart("channelPreferences") &&
        renderPieChart(
          channelPreferencesData,
          "count",
          "channel",
          t("patientChannelPreferences")
        )}

      {shouldRenderChart("timePreferences") &&
        renderPieChart(
          timePreferencesData,
          "count",
          "time",
          t("patientTimePreferences")
        )}

      {shouldRenderChart("interactionOutcomes") &&
        renderPieChart(
          interactionOutcomesData,
          "count",
          "outcome",
          t("interactionOutcomes")
        )}
    </div>
  );
};
