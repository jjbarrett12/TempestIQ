import { redirect } from 'next/navigation'

export default function NewAssetRedirect() {
  redirect('/dashboard/areas/new')
}
