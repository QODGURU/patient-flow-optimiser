
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface FollowUpData {
  date: string;
  calls: number;
  messages: number;
  responses?: number;
}

interface FollowUpTrendChartProps {
  data: FollowUpData[];
  title?: string;
  description?: string;
  className?: string;
  loading?: boolean;
  hideKeys?: ("calls" | "messages" | "responses")[];
  keyNames?: {
    calls?: string;
    messages?: string;
    responses?: string;
  };
  colors?: {
    calls?: string;
    messages?: string;
    responses?: string;
  };
  formatTooltip?: (value: any) => string;
  formatXAxis?: (value: any) => string;
}

const DEFAULT_COLORS = {
  calls: "#FFB347",
  messages: "#B19CD9",
  responses: "#77DD77"
};

const FollowUpTrendChart = ({ 
  data, 
  title, 
  description, 
  className, 
  loading = false,
  hideKeys = [],
  keyNames = {},
  colors = {},
  formatTooltip,
  formatXAxis
}: FollowUpTrendChartProps) => {
  const { t } = useLanguage();
  
  const formattedData = useMemo(() => {
    return data.map(item => {
      const result: Record<string, any> = {
        date: item.date,
      };
      
      if (!hideKeys.includes("calls")) {
        result[keyNames.calls || t("calls")] = item.calls;
      }
      
      if (!hideKeys.includes("messages")) {
        result[keyNames.messages || t("messages")] = item.messages;
      }
      
      if (!hideKeys.includes("responses") && item.responses !== undefined) {
        result[keyNames.responses || t("responses")] = item.responses;
      }
      
      return result;
    });
  }, [data, t, hideKeys, keyNames]);

  const mergedColors = { ...DEFAULT_COLORS, ...colors };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title || t("followUps")}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {loading ? (
            <div className="space-y-2">
              <div className="flex items-end space-x-2">
                <Skeleton className="h-32 w-4" />
                <Skeleton className="h-44 w-4" />
                <Skeleton className="h-28 w-4" />
                <Skeleton className="h-40 w-4" />
                <Skeleton className="h-36 w-4" />
                <Skeleton className="h-24 w-4" />
                <Skeleton className="h-48 w-4" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </div>
          ) : (
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
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => 
                    formatTooltip ? [formatTooltip(value), ""] : [value, ""]
                  }
                />
                <Legend />
                {!hideKeys.includes("calls") && (
                  <Line 
                    type="monotone" 
                    dataKey={keyNames.calls || t("calls")} 
                    stroke={mergedColors.calls}
                    activeDot={{ r: 8 }}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                )}
                {!hideKeys.includes("messages") && (
                  <Line 
                    type="monotone" 
                    dataKey={keyNames.messages || t("messages")} 
                    stroke={mergedColors.messages}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                )}
                {!hideKeys.includes("responses") && (
                  <Line 
                    type="monotone" 
                    dataKey={keyNames.responses || t("responses")} 
                    stroke={mergedColors.responses}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpTrendChart;
