import {
  FaTrophy,
} from "react-icons/fa";


function LeaderboardCard({
  rank,
  name,
  xp,
  level,
}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">


      <div className="flex items-center gap-4">


        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
            rank === 1
              ? "bg-yellow-500"
              : rank === 2
              ? "bg-slate-400"
              : rank === 3
              ? "bg-orange-500"
              : "bg-blue-600"
          }`}
        >

          {rank}

        </div>


        <div>

          <h3 className="font-bold text-slate-800">
            {name}
          </h3>

          <p className="text-sm text-slate-500">
            Level {level}
          </p>

        </div>


      </div>



      <div className="flex items-center gap-2 text-yellow-600 font-semibold">

        <FaTrophy />

        {xp} XP

      </div>


    </div>

  );

}


export default LeaderboardCard;