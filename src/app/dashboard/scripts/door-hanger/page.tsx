'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type StormContext = {
  stormType: string
  date: string
  areaName: string
  areaDescription: string
  neighborhoods: string[]
}

function DoorHangerContent() {
  const params = useSearchParams()
  const stormId = params.get('stormId')
  const company = params.get('company') || 'Your Company'
  const phone = params.get('phone') || '(555) 123-4567'
  const address = params.get('address') || ''

  const [ctx, setCtx] = useState<StormContext | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!stormId) {
      setLoading(false)
      return
    }
    fetch(`/api/scripts/storm-context?stormId=${encodeURIComponent(stormId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setCtx({
            stormType: data.stormType,
            date: data.date,
            areaName: data.areaName,
            areaDescription: data.areaDescription,
            neighborhoods: data.neighborhoods ?? [],
          })
        } else {
          setCtx(null)
        }
      })
      .catch(() => setCtx(null))
      .finally(() => setLoading(false))
  }, [stormId])

  const handlePrint = () => window.print()

  if (!stormId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8">
        <p className="text-slate-600">No storm selected. Go back to Scripts and generate a door hanger.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8">
        <p className="text-slate-600">Loading storm details…</p>
      </div>
    )
  }

  const area = address || ctx?.areaDescription || 'Your area'
  const stormInfo = ctx ? `${ctx.stormType} · ${ctx.date}` : 'Storm event'

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: 4in 9in; margin: 0.25in; }
              body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
              .door-hanger { box-shadow: none !important; }
            }
          `,
        }}
      />

      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700"
        >
          Print door hanger
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      <div className="min-h-screen bg-slate-200 p-8 flex items-center justify-center print:p-0 print:bg-white">
        <div
          className="door-hanger w-[384px] h-[864px] print:w-[4in] print:h-[9in] bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 rounded-lg shadow-2xl overflow-hidden flex flex-col"
          style={{ aspectRatio: '4/9' }}
        >
          <div className="flex-1 p-6 flex flex-col justify-between text-white">
            <div>
              <div className="inline-block px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold uppercase tracking-wider rounded">
                Storm alert
              </div>
              <h1 className="mt-4 text-2xl font-bold leading-tight">
                {stormInfo}
              </h1>
              <p className="mt-2 text-indigo-100 text-sm">
                {area}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-lg font-semibold">
                Free roof & siding inspection
              </p>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Your property was in the storm impact zone. We offer no-obligation inspections to document damage for insurance claims.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-indigo-500/50">
              <p className="text-xs text-indigo-200 uppercase tracking-wider mb-1">Call or text</p>
              <p className="text-xl font-bold">{phone}</p>
              <p className="text-sm text-indigo-200 mt-2">{company}</p>
            </div>
          </div>

          <div className="h-2 bg-amber-400" aria-hidden />
        </div>
      </div>
    </>
  )
}

export default function DoorHangerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading…</p>
      </div>
    }>
      <DoorHangerContent />
    </Suspense>
  )
}
