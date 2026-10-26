
function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-white shadow-2xl">
        <p className="mb-3 text-sm font-medium tracking-widest text-emerald-400">
          PRESUPUESTOS INTELIGENTES
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          Tu dinero, bajo control.
        </h1>

        <p className="mt-4 leading-7 text-slate-300">
          Organiza tus ingresos, controla tus gastos y crea presupuestos
          personalizados.
        </p>

        <button className="mt-6 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
          Comenzar
        </button>
      </section>
    </main>
  )
}

export default App
