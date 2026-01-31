export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-200" />
        <div className="h-3 w-24 rounded bg-indigo-100" />
      </div>
    </div>
  )
}
