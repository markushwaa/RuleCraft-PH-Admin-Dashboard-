import {
  FaArrowUp,
} from "react-icons/fa";

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}) {
  const Icon = icon;
  const tones = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", purple: "bg-violet-50 text-violet-600", orange: "bg-amber-50 text-amber-600" };
  return (
    <div className="admin-card group bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500 font-medium">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            {value}
          </h2>

        </div>


        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tones[color] || tones.blue}`}>
          {Icon && <Icon className="text-xl" />}

        </div>

      </div>


      {description && <div className="flex items-center gap-2 mt-5 text-sm text-green-600">

        <FaArrowUp />

        <span>
          {description}
        </span>

      </div>}

    </div>
  );
}

export default StatCard;
