
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConversionData {
  doctor: string;
  contacted: number;
  interested: number;
  booked: number;
}

interface ConversionRateChartProps {
  data: ConversionData[];
  title?: string;
  description?: string;
  className?: string;
}

const ConversionRateChart = ({ data, title, description, className }: ConversionRateChartProps) => {
  const { t } = useLanguage();
  
  const formattedData = useMemo(() => {
    return data.map(item => ({
      doctor: item.doctor,
      [t("contacted")]: item.contacted,
      [t("interested")]: item.interested,
      [t("booked")]: item.booked
    }));
  }, [data, t]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title || t("conversionRates")}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="doctor" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={t("contacted")} 
                fill="#4F86F7" 
                className="transition-all duration-300 hover:opacity-80"
              />
              <Bar 
                dataKey={t("interested")} 
                fill="#B19CD9" 
                className="transition-all duration-300 hover:opacity-80"
              />
              <Bar 
                dataKey={t("booked")} 
                fill="#77DD77" 
                className="transition-all duration-300 hover:opacity-80"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionRateChart;
