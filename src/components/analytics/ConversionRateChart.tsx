
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

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
  loading?: boolean;
  layout?: "horizontal" | "vertical";
  hideKeys?: ("contacted" | "interested" | "booked")[];
  keyNames?: {
    contacted?: string;
    interested?: string;
    booked?: string;
  };
  colors?: {
    contacted?: string;
    interested?: string;
    booked?: string;
  };
}

const DEFAULT_COLORS = {
  contacted: "#4F86F7",
  interested: "#B19CD9",
  booked: "#77DD77"
};

const ConversionRateChart = ({ 
  data, 
  title, 
  description, 
  className,
  loading = false,
  layout = "horizontal",
  hideKeys = [],
  keyNames = {},
  colors = {}
}: ConversionRateChartProps) => {
  const { t } = useLanguage();
  
  const formattedData = useMemo(() => {
    return data.map(item => {
      const result: Record<string, any> = {
        doctor: item.doctor,
      };
      
      if (!hideKeys.includes("contacted")) {
        result[keyNames.contacted || t("contacted")] = item.contacted;
      }
      
      if (!hideKeys.includes("interested") && item.interested !== undefined) {
        result[keyNames.interested || t("interested")] = item.interested;
      }
      
      if (!hideKeys.includes("booked") && item.booked !== undefined) {
        result[keyNames.booked || t("booked")] = item.booked;
      }
      
      return result;
    });
  }, [data, t, hideKeys, keyNames]);

  const mergedColors = { ...DEFAULT_COLORS, ...colors };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title || t("conversionRates")}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-11/12" />
              <Skeleton className="h-12 w-10/12" />
              <Skeleton className="h-12 w-9/12" />
              <Skeleton className="h-12 w-8/12" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {layout === "horizontal" ? (
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
                  {!hideKeys.includes("contacted") && (
                    <Bar 
                      dataKey={keyNames.contacted || t("contacted")} 
                      fill={mergedColors.contacted}
                      className="transition-all duration-300 hover:opacity-80"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {!hideKeys.includes("interested") && (
                    <Bar 
                      dataKey={keyNames.interested || t("interested")} 
                      fill={mergedColors.interested}
                      className="transition-all duration-300 hover:opacity-80"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {!hideKeys.includes("booked") && (
                    <Bar 
                      dataKey={keyNames.booked || t("booked")} 
                      fill={mergedColors.booked}
                      className="transition-all duration-300 hover:opacity-80"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              ) : (
                <BarChart
                  data={formattedData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 80,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis type="number" />
                  <YAxis dataKey="doctor" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  {!hideKeys.includes("contacted") && (
                    <Bar 
                      dataKey={keyNames.contacted || t("contacted")} 
                      fill={mergedColors.contacted}
                      className="transition-all duration-300 hover:opacity-80"
                      radius={[0, 4, 4, 0]}
                    />
                  )}
                  {!hideKeys.includes("interested") && (
                    <Bar 
                      dataKey={keyNames.interested || t("interested")} 
                      fill={mergedColors.interested}
                      className="transition-all duration-300 hover:opacity-80"
                      radius={[0, 4, 4, 0]}
                    />
                  )}
                  {!hideKeys.includes("booked") && (
                    <Bar 
                      dataKey={keyNames.booked || t("booked")} 
                      fill={mergedColors.booked}
                      className="transition-all duration-300 hover:opacity-80"
                      radius={[0, 4, 4, 0]}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionRateChart;
