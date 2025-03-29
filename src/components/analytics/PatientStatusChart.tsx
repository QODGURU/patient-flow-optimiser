
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientStatusData {
  status: string;
  count: number;
}

interface PatientStatusChartProps {
  data: PatientStatusData[];
  title?: string;
  className?: string;
  loading?: boolean;
}

const COLORS = ["#101B4C", "#00FFC8", "#8066DC", "#FFC107", "#FF3B3B", "#01C5C4"];

const PatientStatusChart = ({ data, title, className, loading = false }: PatientStatusChartProps) => {
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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          ) : (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientStatusChart;
