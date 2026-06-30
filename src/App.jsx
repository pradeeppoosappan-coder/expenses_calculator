import { lazy, Suspense, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Layout from '@/components/Layout'
import DashboardPage from '@/components/Dashboard/DashboardPage'
import IncomeList from '@/components/Income/IncomeList'
import ExpenseList from '@/components/Expenses/ExpenseList'
import { ToastProvider, useToast } from '@/components/ui/toast'
import { useFinancialData } from '@/hooks/useFinancialData'

// Lazy-load the AI Import page (and its heavier parsing logic)
const ImportPage = lazy(() => import('@/components/Import/ImportPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  )
}

function AppInner() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('dashboard')
  const fd = useFinancialData()

  const goToImport = () => setActiveTab('import')

  const handleLoadSample = () => {
    fd.loadSampleData()
    toast({ variant: 'success', title: 'Sample data loaded' })
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <DashboardPage
          incomes={fd.incomes}
          expenses={fd.expenses}
          onGoToImport={goToImport}
          onLoadSample={handleLoadSample}
        />
      )}

      {activeTab === 'income' && (
        <IncomeList
          incomes={fd.incomes}
          addIncome={fd.addIncome}
          updateIncome={fd.updateIncome}
          deleteIncome={fd.deleteIncome}
          onGoToImport={goToImport}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpenseList
          expenses={fd.expenses}
          addExpense={fd.addExpense}
          updateExpense={fd.updateExpense}
          deleteExpense={fd.deleteExpense}
          onGoToImport={goToImport}
        />
      )}

      {activeTab === 'import' && (
        <Suspense fallback={<PageLoader />}>
          <ImportPage
            addMany={fd.addMany}
            findDuplicate={fd.findDuplicate}
            onImported={() => setActiveTab('dashboard')}
          />
        </Suspense>
      )}
    </Layout>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}
