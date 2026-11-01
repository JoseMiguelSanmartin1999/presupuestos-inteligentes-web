
  import { useEffect, useState } from "react";
  import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    CircleDollarSign,
    PiggyBank,
    Plus,
    Wallet,
    LayoutDashboard,
    ChartNoAxesCombined,
    Tags,
    LogOut,
  } from "lucide-react";

  import { Badge } from "@/components/ui/badge";
  import { BudgetProgress } from "@/components/dashboard/budget-progress";
  import { CategoryManagement } from "@/components/dashboard/category-management";
  import { DashboardHeader } from "@/components/dashboard/dashboard-header";
  import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
  import { MetricCard } from "@/components/dashboard/metric-card";
  import { RecentTransactions } from "@/components/dashboard/recent-transactions";
  import { SpendingChart } from "@/components/dashboard/spending-chart";
  import { TransactionForm } from "@/components/dashboard/transaction-form";
  import { MonthlyBudgets } from "@/components/dashboard/monthly-budgets";
  import { BudgetProposal } from "@/components/dashboard/budget-proposal";
  import { LoginForm } from "@/components/auth/login-form";
  import { ReceiptText } from "lucide-react";
  import { getDashboardData } from "@/services/dashboard.service";
  import {
    getAccessToken,
    getCurrentUser,
    logout,
    type AuthUser,
  } from "@/services/auth.service";

  import type { DashboardData } from "@/types/dashboard";
  type Section =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "categories"
  | "reports";
  const currency = (value: number) =>
    new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const dataSource = import.meta.env.VITE_DATA_SOURCE ?? "demo";

  function getMonthYearLabel(): string {
    return new Intl.DateTimeFormat("es-EC", {
      month: "long",
      year: "numeric",
    }).format(new Date());
  }

  export default function App() {
    const [authenticated, setAuthenticated] = useState<boolean>(() =>
      Boolean(getAccessToken()),
    );

    const [currentUser, setCurrentUser] = useState<AuthUser | null>(() =>
      getCurrentUser(),
    );

    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(() =>
      Boolean(getAccessToken()),
    );

    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeSection, setActiveSection] =
      useState<Section>("dashboard");

    const [dateLabel] = useState<string>(getMonthYearLabel);

    useEffect(() => {
      if (!authenticated) {
        return;
      }

      let cancelled = false;

      async function loadDashboard() {
        setLoading(true);
        setError(null);

        try {
          const result = await getDashboardData();

          if (!cancelled) {
            setData(result);
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : "No se pudieron cargar los datos financieros.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      void loadDashboard();

      return () => {
        cancelled = true;
      };
    }, [authenticated, refreshKey]);

    function handleLogout() {
      logout();
      setAuthenticated(false);
      setCurrentUser(null);
      setData(null);
      setError(null);
      setLoading(false);
      setTransactionModalOpen(false);
      setActiveSection("dashboard");
    }

    function handleLoginSuccess() {
      setData(null);
      setError(null);
      setCurrentUser(getCurrentUser());
      setAuthenticated(true);
      setLoading(true);
      setRefreshKey((current) => current + 1);
    }

    function handleTransactionCreated() {
      setTransactionModalOpen(false);
      setRefreshKey((current) => current + 1);
    }

    function navigateTo(section: Section) {
      setActiveSection(section);
    }

    if (!authenticated) {
      return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Barra lateral existente en escritorio */}
          <div className="hidden lg:block">
            <DashboardSidebar />
          </div>

          {/* Contenido principal */}
          <div className="min-w-0">
            <DashboardHeader />

            <main className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-8">
              {/* Navegación del módulo */}
              <nav
                aria-label="Navegación principal"
                className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => navigateTo("dashboard")}
                  aria-current={
                    activeSection === "dashboard" ? "page" : undefined
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    activeSection === "dashboard"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("budgets")}
                  aria-current={
                    activeSection === "budgets" ? "page" : undefined
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    activeSection === "budgets"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ChartNoAxesCombined size={17} />
                  Presupuestos
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo("categories")}
                  aria-current={
                    activeSection === "categories" ? "page" : undefined
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    activeSection === "categories"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Tags size={17} />
                  Categorías
                </button>
                  
                <button
                  type="button"
                  onClick={() => navigateTo("transactions")}
                  aria-current={
                    activeSection === "transactions" ? "page" : undefined
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    activeSection === "transactions"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ReceiptText size={17} />
                  Transacciones
                </button>

              </nav>

              {/* =========================================
                  SECCIÓN: DASHBOARD
              ========================================= */}
              {activeSection === "dashboard" && (
                <>
                  <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                          Resumen financiero
                        </h1>

                        <Badge
                          className={
                            dataSource === "api"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }
                        >
                          {dataSource === "api" ? "API REAL" : "DEMO"}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-500">
                        Aquí tienes una visión general de tus finanzas.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
                        <CalendarDays
                          size={17}
                          className="text-blue-600"
                        />
                        <span className="capitalize">{dateLabel}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTransactionModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Plus size={18} />
                        Nueva transacción
                      </button>
                    </div>
                  </section>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                    >
                      <p className="font-semibold">
                        No se pudo cargar el dashboard.
                      </p>

                      <p className="mt-1 break-words">{error}</p>

                      {dataSource === "api" && (
                        <p className="mt-2">
                          Comprueba que hayas iniciado sesión, que el token
                          siga vigente y que el backend permita las
                          peticiones del frontend.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setRefreshKey((current) => current + 1)
                        }
                        className="mt-3 rounded-lg border border-rose-300 px-3 py-2 font-medium transition hover:bg-rose-100"
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  {loading && (
                    <div
                      role="status"
                      className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500"
                    >
                      Cargando resumen financiero…
                    </div>
                  )}

                  {!loading && data && (
                    <>
                      {/* Indicadores financieros */}
                      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                          title="Balance del mes"
                          value={currency(data.balance)}
                          description="Ingresos menos gastos"
                          icon={Wallet}
                          iconClassName="bg-blue-50 text-blue-600"
                        />

                        <MetricCard
                          title="Ingresos del mes"
                          value={currency(data.income)}
                          description="Ingresos registrados"
                          icon={ArrowDownRight}
                          iconClassName="bg-emerald-50 text-emerald-600"
                        />

                        <MetricCard
                          title="Gastos del mes"
                          value={currency(data.expenses)}
                          description="Gastos registrados"
                          icon={ArrowUpRight}
                          iconClassName="bg-orange-50 text-orange-600"
                        />

                        <MetricCard
                          title="Tasa de ahorro"
                          value={`${data.savingsRate.toLocaleString(
                            "es-EC",
                            { maximumFractionDigits: 1 },
                          )}%`}
                          description="Porcentaje de ingresos"
                          icon={PiggyBank}
                          iconClassName="bg-violet-50 text-violet-600"
                        />
                      </section>

                      {/* Gráfico y resumen de presupuestos */}
                      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
                        <SpendingChart data={data.monthlyActivity} />
                        <BudgetProgress budgets={data.budgets} />
                      </section>

                      {/* Transacciones y balance */}
                      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
                        <RecentTransactions
                          transactions={data.recentTransactions}
                          onTransactionsChanged={handleTransactionCreated}
                        />

                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-sm">
                          <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-white/15">
                            <CircleDollarSign size={23} />
                          </div>

                          <p className="text-sm font-medium text-blue-100">
                            Balance del mes
                          </p>

                          <p className="mt-2 text-3xl font-bold tracking-tight">
                            {currency(data.balance)}
                          </p>

                          <p className="mt-3 max-w-xs text-sm leading-6 text-blue-100">
                            Diferencia entre tus ingresos y gastos
                            registrados durante el periodo seleccionado.
                          </p>

                          <div className="mt-6 h-px bg-white/20" />

                          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                            <span className="text-blue-100">
                              Estado del periodo
                            </span>

                            <span className="rounded-full bg-white/15 px-3 py-1 font-medium">
                              {data.balance >= 0
                                ? "Balance positivo"
                                : "Gastos superiores"}
                            </span>
                          </div>
                        </div>
                      </section>

                      <p className="text-center text-xs text-slate-400">
                        {dataSource === "demo"
                          ? "Modo demostración: los importes mostrados son ficticios y no provienen de tu cuenta."
                          : "Los importes financieros se obtienen de la API. Las secciones sin endpoints conectados pueden aparecer vacías."}
                      </p>
                    </>
                  )}
                </>
              )}
              
                {activeSection === "transactions" && (
                  <section className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                          Gestión de transacciones
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                          Consulta y administra tus ingresos y gastos.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTransactionModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Plus size={18} />
                        Nueva transacción
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                      <p className="text-sm text-slate-500">
                        Aquí mostraremos el historial de transacciones,
                        los filtros y las acciones de edición y eliminación.
                      </p>
                    </div>
                  </section>
                )}

              {/* =========================================
                  SECCIÓN: PRESUPUESTOS
              ========================================= */}
              {activeSection === "budgets" && (
                <section className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      Gestión de presupuestos
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                      Genera una propuesta según tus ingresos, gastos fijos
                      y gastos históricos. Revísala antes de aprobarla.
                    </p>
                  </div>

                  <BudgetProposal
                    onApproved={() => {
                      setRefreshKey((current) => current + 1);
                    }}
                  />

                  <MonthlyBudgets />
                </section>
              )}

              {/* =========================================
                  SECCIÓN: CATEGORÍAS
              ========================================= */}
              {activeSection === "categories" && (
                <section
                  id="gestion-categorias"
                  className="scroll-mt-6"
                >
                  <CategoryManagement />
                </section>
              )}

              {/* =========================================
                  SECCIÓN: INFORMES
              ========================================= */}
              {activeSection === "reports" && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Informes financieros
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Próximamente podrás consultar informes de ingresos,
                    gastos y evolución de tus presupuestos.
                  </p>
                </section>
              )}

              {/* =========================================
                  USUARIO Y CIERRE DE SESIÓN
              ========================================= */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {currentUser?.name ?? "Usuario"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {currentUser?.email ?? ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </main>
          </div>
        </div>

        {/* Modal de nueva transacción */}
        {transactionModalOpen && (
          <TransactionForm
            onClose={() => setTransactionModalOpen(false)}
            onCreated={handleTransactionCreated}
          />
        )}
      </div>
    );
  }
