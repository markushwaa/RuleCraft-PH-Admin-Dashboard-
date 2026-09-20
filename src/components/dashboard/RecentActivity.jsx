export default function RecentActivity({ activities = [] }) {
  if (!activities.length) return <p className="text-slate-500">No learner activity has been recorded yet.</p>;
  return (
    <div className="space-y-4">
      {activities.map((item, index) => (
        <div key={`${item.occurredAt}-${index}`} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-none">
          <div className="min-w-0">
            <p className="font-semibold text-slate-700">{item.user}</p>
            {item.kind === "exam" ? (
              <>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span>{item.action}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.resultStatus}
                  </span>
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Score: {item.score}/{item.totalQuestions} ({item.percentage}%)
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span>{item.action}</span>
                  {item.resultStatus && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{item.resultStatus}</span>}
                </p>
                {item.kind === "driving" && <p className="mt-1 text-sm font-medium text-slate-600">Score: {item.score}/100 ({item.percentage}%)</p>}
              </>
            )}
          </div>
          <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
        </div>
      ))}
    </div>
  );
}
