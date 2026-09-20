function UserTable() {

  const users = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juan@gmail.com",
      level: 5,
      xp: 3200,
      progress: "85%",
      status: "Active",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@gmail.com",
      level: 8,
      xp: 5200,
      progress: "95%",
      status: "Active",
    },
    {
      id: 3,
      name: "Carlos Reyes",
      email: "carlos@gmail.com",
      level: 3,
      xp: 1800,
      progress: "60%",
      status: "Inactive",
    },
  ];


  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">


      <table className="w-full">


        <thead className="bg-slate-50 border-b">

          <tr>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              User
            </th>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Level
            </th>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              XP
            </th>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Progress
            </th>

            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
              Status
            </th>

          </tr>

        </thead>


        <tbody>


          {users.map((user)=>(

            <tr
              key={user.id}
              className="border-b last:border-none hover:bg-slate-50"
            >

              <td className="px-6 py-4">

                <p className="font-semibold text-slate-800">
                  {user.name}
                </p>

                <p className="text-sm text-slate-500">
                  {user.email}
                </p>

              </td>


              <td className="px-6 py-4">
                Level {user.level}
              </td>


              <td className="px-6 py-4">
                {user.xp} XP
              </td>


              <td className="px-6 py-4">
                {user.progress}
              </td>


              <td className="px-6 py-4">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
                >

                  {user.status}

                </span>

              </td>


            </tr>

          ))}


        </tbody>


      </table>


    </div>
  );
}


export default UserTable;