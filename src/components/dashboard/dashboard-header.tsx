import { Bell, ChevronDown, Search } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 sm:px-8">
      <div>
        <p className="text-sm text-slate-500">Espacio personal</p>
        <p className="font-semibold text-slate-900">Mi dashboard</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Buscar"
          className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            JM
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-800">Mi cuenta</p>
            <p className="text-xs text-slate-500">Usuario demo</p>
          </div>
          <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  );
}