
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface PatientStatusData {
  status: string;
  count: number;
}

interface PatientStatusChartProps {
  data: PatientStatusData[];
  title?: string;
  className?: string;
}

const COLORS = ["#FFB347", "#4F86F7", "#B19CD9", "#77DD77", "#AEC6CF", "#FF6961"];

const PatientStatusChart = ({ data, title, className }: PatientStatusChartProps) => {
  const { t } = useLanguage();
  
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: t(item.status),
      value: item.count
    }));
  }, [data, t]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title || t("patientStatus")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                className="transition-all duration-300 hover:opacity-90"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, t("patients")]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientStatusChart;
