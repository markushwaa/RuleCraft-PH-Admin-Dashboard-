function LessonCard({
  title,
  category,
  difficulty,
  status,
}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">


      <div className="flex items-start justify-between">


        <div>

          <h3 className="font-bold text-lg text-slate-800">
            {title}
          </h3>


          <p className="text-sm text-slate-500 mt-2">
            {category}
          </p>

        </div>



        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === "Published"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
          }`}
        >

          {status}

        </span>


      </div>



      <div className="mt-5">

        <span className="text-sm font-medium text-blue-600">
          Difficulty: {difficulty}
        </span>

      </div>


    </div>

  );

}


export default LessonCard;