export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-48 rounded bg-gray-200" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-lg bg-gray-100" />
        <div className="h-64 rounded-lg bg-gray-100" />
      </div>
      <div className="h-48 rounded-lg bg-gray-100" />
    </div>
  )
}
