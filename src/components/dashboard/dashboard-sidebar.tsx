
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

import { NavLink } from "react-router";

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Transacciones",
    path: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    label: "Presupuestos",
    path: "/budgets",
    icon: Wallet,
  },
  {
    label: "Categorías",
    path: "/categories",
    icon: Tags,
  },
  {
    label: "Informes",
    path: "/reports",
    icon: ChartNoAxesCombined,
  },
];

export function DashboardSidebar() {
  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      {/* Identidad de la aplicación */}
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

      {/* Navegación */}
      <nav
        className="flex-1 space-y-1 px-3 py-6"
        aria-label="Navegación principal"
      >
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Menú principal
        </p>

        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}

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

      {/* Información */}
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
