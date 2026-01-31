'use client'

import Link from 'next/link'
import { AssetList } from '@/components/dashboard/AssetList'
import { useDashboardCustomer } from '@/lib/dashboard-customer-context'

export default function AssetsPage() {
  const customerId = useDashboardCustomer()
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        <Link
          href="/dashboard/assets/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Add location
        </Link>
      </div>
      <AssetList customerId={customerId} />
    </>
  )
}
