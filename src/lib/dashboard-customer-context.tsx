'use client'

import { createContext, useContext, type ReactNode } from 'react'

const DashboardCustomerContext = createContext<string>('demo-customer-1')

export function DashboardCustomerProvider({
  customerId,
  children,
}: {
  customerId: string
  children: ReactNode
}) {
  return (
    <DashboardCustomerContext.Provider value={customerId}>
      {children}
    </DashboardCustomerContext.Provider>
  )
}

export function useDashboardCustomer(): string {
  return useContext(DashboardCustomerContext)
}
