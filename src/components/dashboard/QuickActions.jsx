function QuickActions() {

  const actions = [
    "Add New User",
    "Create Lesson",
    "Review Reports",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      <div className="mb-5">

        <h2 className="text-lg font-bold text-slate-800">
          Quick Actions
        </h2>

        <p className="text-sm text-slate-500">
          Manage your platform quickly
        </p>

      </div>


      <div className="space-y-3">

        {actions.map((action, index) => (

          <button
            key={index}
            className="w-full text-left px-4 py-3 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white transition font-medium"
          >

            {action}

          </button>

        ))}

      </div>


    </div>
  );
}

export default QuickActions;