import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Lead, LeadStatus } from '@/types/lead';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface LeadStatusChartProps {
  leads: Lead[];
}

const STATUS_COLORS = {
  'New': 'hsl(var(--primary))',
  'Contacted': 'hsl(var(--warning))',
  'Qualified': 'hsl(var(--secondary))',
  'Converted': 'hsl(var(--success))',
  'Lost': 'hsl(var(--destructive))',
};

export const LeadStatusChart = ({ leads }: LeadStatusChartProps) => {
  // Calculate status distribution
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<LeadStatus, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_COLORS[status as LeadStatus],
  }));

  const chartConfig = {
    count: {
      label: "Leads",
    },
    New: {
      label: "New",
      color: STATUS_COLORS.New,
    },
    Contacted: {
      label: "Contacted", 
      color: STATUS_COLORS.Contacted,
    },
    Qualified: {
      label: "Qualified",
      color: STATUS_COLORS.Qualified,
    },
    Converted: {
      label: "Converted",
      color: STATUS_COLORS.Converted,
    },
    Lost: {
      label: "Lost",
      color: STATUS_COLORS.Lost,
    },
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Lead Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        
        {/* Status Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-muted-foreground">
                {item.status}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};