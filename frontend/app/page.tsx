import { AuthProvider } from '@/contexts/auth-context'
import { DataProvider } from '@/contexts/data-context'
import { RealtyMatchApp } from '@/components/realty-match-app'

export default function Home() {
  return (
    <AuthProvider>
      <DataProvider>
        <RealtyMatchApp />
      </DataProvider>
    </AuthProvider>
  )
}
