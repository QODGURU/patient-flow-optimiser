
import PatientStatusChart from "./PatientStatusChart";
import ConversionRateChart from "./ConversionRateChart";
import FollowUpTrendChart from "./FollowUpTrendChart";
import { DashboardData } from "./DashboardData";

export const DashboardCharts = () => {
  return (
    <DashboardData>
      {({
        patientStatusCounts,
        followUpTrendData,
        conversionRateData,
        treatmentCategories,
        channelPreferences,
        interactionOutcomes,
        conversionTrend,
        patientsLoading,
        followUpsLoading
      }) => (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientStatusChart 
              data={patientStatusCounts}
              loading={patientsLoading}
            />
            
            <ConversionRateChart 
              data={conversionRateData}
              loading={patientsLoading} 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FollowUpTrendChart 
              data={followUpTrendData}
              loading={followUpsLoading}
            />
            
            <CategoryDistributionChart 
              title="Communication Preferences"
              description="Patients by preferred contact method"
              data={channelPreferences}
              loading={patientsLoading}
              dataKey="channel"
              valueKey="count"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <BarChartVertical
              title="Interaction Outcomes"
              description="Patient responses to follow-ups"
              data={interactionOutcomes}
              loading={patientsLoading}
              categoryKey="outcome"
              valueKey="count"
            />
            
            <CategoryDistributionChart 
              title="Treatment Distribution"
              description="Patient counts by treatment category"
              data={treatmentCategories}
              loading={patientsLoading}
              dataKey="category"
              valueKey="count"
            />
            
            <TrendLineChart 
              title="Conversion Rate Trend"
              description="Weekly conversion rate"
              data={conversionTrend}
              loading={patientsLoading}
              xAxisKey="week"
              lineKey="rate"
              lineName="Conversion Rate (%)"
              lineColor="#00FFC8"
              formatTooltip={(value: number) => `${value.toFixed(1)}%`}
              formatXAxis={(value: string) => {
                const date = new Date(value);
                return `${date.getMonth()+1}/${date.getDate()}`;
              }}
            />
          </div>
        </div>
      )}
    </DashboardData>
  );
};

// Generic Bar Chart for category distribution
interface CategoryChartProps {
  title: string;
  description?: string;
  data: { [key: string]: any }[];
  loading: boolean;
  dataKey: string;
  valueKey: string;
  className?: string;
}

export const CategoryDistributionChart = ({
  title,
  description,
  data,
  loading,
  dataKey,
  valueKey,
  className
}: CategoryChartProps) => {
  return (
    <ConversionRateChart
      data={data.map(item => ({
        doctor: item[dataKey],
        contacted: item[valueKey],
        interested: 0, // Add missing required properties
        booked: 0      // Add missing required properties
      }))}
      title={title}
      description={description}
      className={className}
      loading={loading}
      hideKeys={["interested", "booked"]}
      keyNames={{
        contacted: "Count"
      }}
      colors={{
        contacted: "#8066DC"
      }}
    />
  );
};

// Vertical Bar Chart
interface BarChartVerticalProps {
  title: string;
  description?: string;
  data: { [key: string]: any }[];
  loading: boolean;
  categoryKey: string;
  valueKey: string;
  className?: string;
}

export const BarChartVertical = ({
  title,
  description,
  data,
  loading,
  categoryKey,
  valueKey,
  className
}: BarChartVerticalProps) => {
  return (
    <ConversionRateChart
      data={data.map(item => ({
        doctor: item[categoryKey],
        contacted: item[valueKey],
        interested: 0, // Add missing required properties
        booked: 0      // Add missing required properties
      }))}
      title={title}
      description={description}
      className={className}
      loading={loading}
      layout="vertical"
      hideKeys={["interested", "booked"]}
      keyNames={{
        contacted: "Count"
      }}
      colors={{
        contacted: "#101B4C"
      }}
    />
  );
};

// Line Chart for trends
interface TrendLineChartProps {
  title: string;
  description?: string;
  data: { [key: string]: any }[];
  loading: boolean;
  xAxisKey: string;
  lineKey: string;
  lineName: string;
  lineColor: string;
  formatTooltip?: (value: any) => string;
  formatXAxis?: (value: any) => string;
  className?: string;
}

export const TrendLineChart = ({
  title,
  description,
  data,
  loading,
  xAxisKey,
  lineKey,
  lineName,
  lineColor,
  formatTooltip,
  formatXAxis,
  className
}: TrendLineChartProps) => {
  return (
    <FollowUpTrendChart
      data={data.map(item => ({
        date: item[xAxisKey],
        calls: item[lineKey],
        messages: 0 // Add missing required property
      }))}
      title={title}
      description={description}
      className={className}
      loading={loading}
      hideKeys={["messages", "responses"]}
      keyNames={{
        calls: lineName
      }}
      colors={{
        calls: lineColor
      }}
      formatTooltip={formatTooltip}
      formatXAxis={formatXAxis}
    />
  );
};
