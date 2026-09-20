import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";



function ProgressChart({users}){


  return (

    <div className="h-80">


      <ResponsiveContainer width="100%" height="100%">


        <BarChart data={users}>


          <XAxis
            dataKey="name"
          />


          <YAxis/>


          <Tooltip/>


          <Bar
            dataKey="progress"
            fill="#2563eb"
          />


        </BarChart>


      </ResponsiveContainer>


    </div>

  );

}


export default ProgressChart;