'use client'

import Link from 'next/link'
import { AssetList } from '@/components/dashboard/AssetList'
import { ActiveEvents } from '@/components/dashboard/ActiveEvents'
import { RecentNotifications } from '@/components/dashboard/RecentNotifications'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

const CREW_CHECKLIST = [
  'Contact list pulled for affected zone',
  'Scripts ready (SMS / email / door hanger)',
  'Crews notified and dispatched',
  'Storm verification saved for proof',
]

export default function DashboardPage() {
  const customerId = useDashboardCustomer()
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event overview</h1>
        <Link
          href="/dashboard/assets/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Add location
        </Link>
      </div>

      {/* Crew deployment checklist */}
      <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Crew deployment checklist</h2>
        <p className="text-sm text-gray-600 mb-4">When a storm hits your zone, run through this so you move first.</p>
        <ul className="space-y-2">
          {CREW_CHECKLIST.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
        <Link href="/dashboard/scripts" className="inline-block mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          Get outreach scripts →
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ActiveEvents customerId={customerId} />
        </div>
        <div>
          <RecentNotifications customerId={customerId} />
        </div>
      </div>

      <div className="mt-8">
        <AssetList customerId={customerId} />
      </div>
    </>
  )
}
