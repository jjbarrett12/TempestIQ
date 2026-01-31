'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AssetList } from '@/components/dashboard/AssetList'
import { ActiveEvents } from '@/components/dashboard/ActiveEvents'
import { RecentNotifications } from '@/components/dashboard/RecentNotifications'

const DEMO_CUSTOMER_ID = 'demo-customer-1'

export default function DashboardPage() {
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

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ActiveEvents customerId={DEMO_CUSTOMER_ID} />
        </div>
        <div>
          <RecentNotifications customerId={DEMO_CUSTOMER_ID} />
        </div>
      </div>

      <div className="mt-8">
        <AssetList customerId={DEMO_CUSTOMER_ID} />
      </div>
    </>
  )
}
