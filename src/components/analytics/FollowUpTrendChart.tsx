
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface FollowUpData {
  date: string;
  calls: number;
  messages: number;
  responses: number;
}

interface FollowUpTrendChartProps {
  data: FollowUpData[];
  title?: string;
  description?: string;
  className?: string;
}

const FollowUpTrendChart = ({ data, title, description, className }: FollowUpTrendChartProps) => {
  const { t } = useLanguage();
  
  const formattedData = useMemo(() => {
    return data.map(item => ({
      date: item.date,
      [t("calls")]: item.calls,
      [t("messages")]: item.messages,
      [t("responses")]: item.responses
    }));
  }, [data, t]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title || t("followUps")}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={t("calls")} 
                stroke="#FFB347" 
                activeDot={{ r: 8 }}
                className="transition-all duration-300 hover:opacity-80"
              />
              <Line 
                type="monotone" 
                dataKey={t("messages")} 
                stroke="#B19CD9"
                className="transition-all duration-300 hover:opacity-80"
              />
              <Line 
                type="monotone" 
                dataKey={t("responses")} 
                stroke="#77DD77"
                className="transition-all duration-300 hover:opacity-80"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpTrendChart;
