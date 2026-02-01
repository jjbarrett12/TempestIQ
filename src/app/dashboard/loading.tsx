export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="h-9 w-64 rounded bg-gray-200" />
      <div className="h-4 w-96 rounded bg-gray-100" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-24 rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-44 rounded-xl bg-gray-100" />
        <div className="h-44 rounded-xl bg-gray-100" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-lg bg-gray-100" />
        <div className="h-64 rounded-lg bg-gray-100" />
      </div>
      <div className="h-48 rounded-lg bg-gray-100" />
    </div>
  )
}
