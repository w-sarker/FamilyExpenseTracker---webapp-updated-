import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Settings, Calendar, ChevronDown } from "lucide-react";
import api from "./api/axios";
import currencyFormatter from "./utils/currency";
import { format } from "date-fns";

import AuthGateway from "./components/AuthGateway";
import Layout from "./components/Layout";
import SummaryCard from "./components/SummaryCard";
import ExpenseForm from "./components/ExpenseForm";
import MonthlyBarChart from "./components/Charts/MonthlyBarChart";
import ExpenseDonutChart from "./components/Charts/ExpenseDonutChart";
import RecentExpenses from "./components/RecentExpenses";
import MemberSummary from "./components/MemberSummary";
import AdminModal from "./components/AdminModal";

// Generate month options for the last 2 years + future months
function generateMonthOptions() {
  const options = [];
  const now = new Date();

  // Go back 24 months and forward 6 months
  for (let i = -24; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }

  return options.reverse(); // Most recent first
}

const MONTH_OPTIONS = generateMonthOptions();

function Dashboard() {
  // Default to current month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [error, setError] = useState(null);

  // Data State
  const [budgetData, setBudgetData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[Frontend] Fetching data for month: ${currentMonth}`);

      const [budgetRes, dashboardRes, expensesRes] = await Promise.all([
        api.get(`/budget?month=${currentMonth}`),
        api.get(`/dashboard?month=${currentMonth}`),
        api.get(`/expenses?month=${currentMonth}`),
      ]);

      console.log("[Frontend] Budget Response:", budgetRes.data);
      console.log("[Frontend] Dashboard Response:", dashboardRes.data);
      console.log(
        "[Frontend] Expenses Count:",
        expensesRes.data.expenses?.length || 0
      );

      setBudgetData(budgetRes.data);
      setDashboardData(dashboardRes.data);
      setExpenses(expensesRes.data.expenses || []);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading Dashboard for {currentMonth}...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-500">
          <p className="text-xl mb-2">Error Loading Data</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const hasData = expenses.length > 0 || budgetData?.totalBudget > 0;

  const calculateCardVariant = (remainingBudget, totalBudget) => {
    if (!totalBudget) {
      return {
        variant: "red",
        label: "No budget set",
        animation: "animate-pulse",
      };
    }

    const percentageRemaining = (remainingBudget / totalBudget) * 100;

    if (percentageRemaining > 20) {
      return { variant: "green", label: null, animation: "" };
    } else if (percentageRemaining > 5) {
      return { variant: "orange", label: "Warning: Low Budget", animation: "" };
    } else {
      return {
        variant: "red",
        label: "Warning: Low Budget",
        animation: "animate-pulse",
      };
    }
  };

  const remainingBudgetCard = calculateCardVariant(
    budgetData?.remainingBudget || 0,
    budgetData?.totalBudget || 1 // Avoid division by zero
  );

  return (
    <Layout>
      {/* Month Selector */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-slate-500" />
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-slate-400 dark:text-slate-500">
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""} this month
        </span>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Total Spent"
          amount={budgetData?.totalSpent || 0}
          variant="red"
        />
        <SummaryCard
          title="Remaining Budget"
          amount={budgetData?.remainingBudget || 0}
          variant={remainingBudgetCard.variant}
          className={remainingBudgetCard.animation}
          footer={
            remainingBudgetCard.label && (
              <p className="text-sm text-red-500 dark:text-red-400 font-medium">
                {remainingBudgetCard.label}
              </p>
            )
          }
        />
        <SummaryCard
          title="This Month's Budget"
          amount={budgetData?.totalBudget || 0}
          variant="blue"
          action={
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold uppercase transition-colors flex items-center space-x-1 backdrop-blur-sm"
            >
              <Settings className="w-3 h-3" />
              <span>Edit</span>
            </button>
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Row 2: Input Form */}
        <ExpenseForm onSuccess={fetchData} currentMonth={currentMonth} />

        {/* Row 3: Charts */}
        {hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MonthlyBarChart data={dashboardData?.dailyTotals || []} />
            <ExpenseDonutChart data={dashboardData?.categoryBreakdown || {}} />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 transition-colors duration-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
              No data for {currentMonth}
            </p>
            <p className="text-sm">
              Add an expense above to get started, or select a different month.
            </p>
          </div>
        )}

        {/* Row 4: Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentExpenses expenses={expenses} />
          </div>
          <div>
            <MemberSummary data={dashboardData?.memberBreakdown || {}} />
          </div>
        </div>
      </div>

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentMonth={currentMonth}
        onSuccess={fetchData}
      />
    </Layout>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <AuthGateway />;
}
