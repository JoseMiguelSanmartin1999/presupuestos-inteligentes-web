
import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  Settings,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type DashboardSection =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "categories"
  | "reports";

export interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
}

interface NavigationItem {
  label: string;
  section: DashboardSection;
  icon: LucideIcon;
}

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    section: "dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Transacciones",
    section: "transactions",
    icon: ArrowLeftRight,
  },
  {
    label: "Presupuestos",
    section: "budgets",
    icon: Wallet,
  },
  {
    label: "Categorías",
    section: "categories",
    icon: Tags,
  },
  {
    label: "Informes",
    section: "reports",
    icon: ChartNoAxesCombined,
  },
];

export function DashboardSidebar({
  activeSection,
  onNavigate,
}: DashboardSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
          <Wallet size={21} />
        </div>

        <div>
          <p className="font-bold tracking-tight text-slate-900">
            Presupuestos
          </p>
          <p className="text-xs text-slate-500">
            Inteligentes
          </p>
        </div>
      </div>

      <nav
        className="flex-1 space-y-1 px-3 py-6"
        aria-label="Navegación lateral"
      >
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Menú principal
        </p>

        {navigation.map(({ label, section, icon: Icon }) => {
          const isActive = activeSection === section;

          return (
            <button
              key={section}
              type="button"
              onClick={() => onNavigate(section)}
              aria-current={isActive ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={19} />
              {label}
            </button>
          );
        })}

        <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Preferencias
        </p>

        <div className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400">
          <Settings size={19} />
          Configuración
          <span className="ml-auto text-[10px]">
            Próximamente
          </span>
        </div>
      </nav>

      <div className="m-4 rounded-2xl bg-slate-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <CreditCard
            size={17}
            className="text-blue-600"
          />
          Controla tus finanzas
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Organiza tus ingresos y toma mejores decisiones financieras.
        </p>
      </div>
    </aside>
  );
}

