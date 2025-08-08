import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type FixedBarChartData = {
  name: string
  value: number | number[] //fix this so that it allows multiple value keys 
}

// how to enforce headers being same length as data row?
interface FixedBarChartProps {
  data: FixedBarChartData[]
}

function randomColor() {
  // Generate a random purple variant (hue ~270-290, high saturation, medium-lightness)
  const hue = 270 + Math.floor(Math.random() * 20); // 270-290
  const saturation = 60 + Math.floor(Math.random() * 30); // 60-90%
  const lightness = 50 + Math.floor(Math.random() * 20); // 50-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


const FixedBarChart:React.FC<FixedBarChartProps> = (props:FixedBarChartProps) => {
  const chartConfig:ChartConfig = Object.fromEntries(
    props.data.map(el => [el.name, { label: el.name, color: randomColor() }])
  );
  console.log(props.data)
  console.log(props.data.map(el=>`<Bar dataKey=${el.name} fill={var(--color-${el.name})} radius={4}/>)`))
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={props.data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={0.1}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis domain={[0, 1]} tickCount={6} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="value" fill={`var(--color-${props.data[0].name})`} radius={4}/>
        {/*props.data.map(el=><Bar dataKey={el.name} fill={`var(--color-${el.name})`} radius={4}/>)*/}
      </BarChart>
    </ChartContainer>
  )
}

export default FixedBarChart