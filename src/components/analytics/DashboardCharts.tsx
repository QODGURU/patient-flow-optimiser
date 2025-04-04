
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PatientStatusChart from "./PatientStatusChart";
import FollowUpTrendChart from "./FollowUpTrendChart";
import ConversionRateChart from "./ConversionRateChart";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

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

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartTypes = ["all"] }) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState("month");

  // Sample data for patient status
  const patientStatusData = [
    { status: "Interested", count: 37 },
    { status: "Not Interested", count: 24 },
    { status: "Pending", count: 45 },
    { status: "Contacted", count: 28 },
    { status: "Booked", count: 19 }
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
    { category: "Dental", count: 32 },
    { category: "Orthodontics", count: 28 },
    { category: "Cosmetic", count: 25 },
    { category: "Surgical", count: 15 },
    { category: "Preventive", count: 20 },
  ];

  const channelPreferencesData = [
    { channel: "Call", count: 45 },
    { channel: "SMS", count: 32 },
    { channel: "Email", count: 18 },
    { channel: "Not Specified", count: 10 },
  ];

  const timePreferencesData = [
    { time: "Morning", count: 38 },
    { time: "Afternoon", count: 29 },
    { time: "Evening", count: 25 },
    { time: "Not Specified", count: 13 },
  ];

  const interactionOutcomesData = [
    { outcome: "Yes", count: 43 },
    { outcome: "No", count: 21 },
    { outcome: "Maybe", count: 18 },
    { outcome: "No Answer", count: 32 },
    { outcome: "Opt-out", count: 7 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  // Function to render a simple distribution chart
  const renderDistributionChart = (data: any[], dataKey: string, nameKey: string, title: string) => {
    return (
      <Card className="col-span-1">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">{title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Function to render a simple bar chart
  const renderBarChart = (data: any[], dataKey: string, nameKey: string, title: string) => {
    return (
      <Card className="col-span-1">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">{title}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barSize={20}
            >
              <XAxis dataKey={nameKey} scale="point" padding={{ left: 10, right: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill="#8884d8" background={{ fill: "#eee" }} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const shouldRenderChart = (chartName: string) => {
    return chartTypes.includes("all") || chartTypes.includes(chartName);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {/* Main charts */}
      {shouldRenderChart("patientStatus") && (
        <Card className="col-span-1">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">{t("patientStatusDistribution")}</h3>
            <PatientStatusChart data={patientStatusData} />
          </CardContent>
        </Card>
      )}

      {shouldRenderChart("conversionRate") && (
        <Card className="col-span-1">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">{t("conversionRateByDoctor")}</h3>
            <ConversionRateChart data={conversionRateData} />
          </CardContent>
        </Card>
      )}

      {shouldRenderChart("followUpTrend") && (
        <Card className="col-span-2">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">{t("followUpTrend")}</h3>
            <FollowUpTrendChart data={followUpTrendData} />
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

// Helper function to render pie charts
const renderPieChart = (data: any[], dataKey: string, nameKey: string, title: string) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
  
  return (
    <Card className="col-span-1">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
