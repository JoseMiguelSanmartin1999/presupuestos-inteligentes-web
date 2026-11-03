import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ApiError } from "@/services/api";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import {
  approveSavedBudgetPlan,
  generateBudget,
  getExpenseCategories,
  getSavedBudgetPlan,
  saveBudgetPlan,
  updateApprovedBudgetPlan,
  type ApiCategory,
  type FixedExpense,
  type GenerateBudgetResponse,
  type SavedBudgetPlan,
} from "@/services/budget.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryAllocation = { categoryId: string; amount: number };
type Period = { year: number; month: number };
type Action = "generate" | "save" | "approve" | null;
type Notice = { kind: "error" | "success"; message: string } | null;

interface BudgetProposalProps {
  onApproved?: () => void;
}

interface BudgetForm {
  monthlyIncome: string;
  savingsGoalPercent: string;
  fixedExpenses: FixedExpense[];
  categories: CategoryAllocation[];
}

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

const DEFAULT_FORM: BudgetForm = {
  monthlyIncome: "1200",
  savingsGoalPercent: "10",
  fixedExpenses: [{ name: "Arriendo", amount: 0 }],
  categories: [],
};

function nextBudgetPeriod(): Period {
  const now = new Date();

  const nextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  return {
    year: nextMonth.getFullYear(),
    month: nextMonth.getMonth() + 1,
  };
}

function getAvailablePeriods(): Period[] {
  const now = new Date();
  const periods: Period[] = [];
  // Mes anterior (-1), mes actual (0), próximo mes (+1), siguientes meses (+2, +3)
  for (let offset = -1; offset <= 3; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    periods.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return periods;
}

function formatPeriodLabel(p: Period): string {
  const d = new Date(p.year, p.month - 1, 1);
  const monthName = d.toLocaleString("es-EC", { month: "long" });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${p.year}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado. Intenta nuevamente.";
}

function normalizeExpenses(expenses: FixedExpense[]): FixedExpense[] {
  return expenses
    .map(({ name, amount }) => ({ name: name.trim(), amount: Number(amount) || 0 }))
    .filter(({ name, amount }) => name.length > 0 || amount !== 0);
}

function formFromSaved(plan: SavedBudgetPlan): BudgetForm {
  return {
    monthlyIncome: String(plan.monthlyIncome ?? 0),
    savingsGoalPercent: String(plan.savingsGoalPercent ?? 0),
    fixedExpenses: plan.fixedExpenses.map(({ name, amount }) => ({
      name,
      amount: Number(amount) || 0,
    })),
    categories: plan.categories.map(({ categoryId, amount }) => ({
      categoryId,
      amount: Number(amount) || 0,
    })),
  };
}

function totals(form: BudgetForm) {
  const income = Number(form.monthlyIncome) || 0;
  const savingsPercent = Number(form.savingsGoalPercent) || 0;
  const savings = (income * savingsPercent) / 100;
  const fixed = form.fixedExpenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const variable = form.categories.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const planned = savings + fixed + variable;
  return {
    income,
    savingsPercent,
    savings,
    fixed,
    variable,
    planned,
    remaining: income - planned,
  };
}

function validateForm(form: BudgetForm, requireCategories: boolean): string | null {
  const { income, savingsPercent, planned } = totals(form);
  if (!Number.isFinite(income) || income <= 0)
    return "Ingresa un ingreso mensual mayor que cero.";
  if (!Number.isFinite(savingsPercent) || savingsPercent < 0 || savingsPercent > 100)
    return "La meta de ahorro debe estar entre 0 % y 100 %.";

  for (const expense of form.fixedExpenses) {
    const name = expense.name.trim();
    const amount = Number(expense.amount);
    if (!name && amount === 0) continue;
    if (!name) return "Escribe el nombre de cada gasto fijo.";
    if (!Number.isFinite(amount) || amount < 0)
      return `El importe de «${name}» no es válido.`;
  }

  if (requireCategories && form.categories.length === 0)
    return "Agrega al menos una categoría antes de aprobar.";

  const ids = new Set<string>();
  for (const category of form.categories) {
    if (!category.categoryId || !Number.isFinite(category.amount) || category.amount <= 0)
      return "Cada categoría debe tener un importe mayor que cero.";
    if (ids.has(category.categoryId)) return "No puedes repetir categorías.";
    ids.add(category.categoryId);
  }
  if (planned > income + 0.000001)
    return "El ahorro, los gastos fijos y los presupuestos superan tus ingresos.";
  return null;
}

// La comparación se hace con valores normalizados y categorías ordenadas.
function formFingerprint(form: BudgetForm): string {
  return JSON.stringify({
    income: Number(form.monthlyIncome) || 0,
    savings: Number(form.savingsGoalPercent) || 0,
    expenses: normalizeExpenses(form.fixedExpenses).filter((expense) => expense.amount > 0),
    categories: [...form.categories].sort((a, b) => a.categoryId.localeCompare(b.categoryId)),
  });
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{currency.format(Number.isFinite(value) ? value : 0)}</p>
    </div>
  );
}

function StatusMessage({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const isError = notice.kind === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
        isError
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : "border-green-600/30 bg-green-600/5"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{notice.message}</span>
    </div>
  );
}

export function BudgetProposal({ onApproved }: BudgetProposalProps) {
  const [period, setPeriod] = useState<Period>(nextBudgetPeriod);
  const [form, setForm] = useState<BudgetForm>(DEFAULT_FORM);
  const [expenseCategories, setExpenseCategories] = useState<ApiCategory[]>([]);
  const [proposal, setProposal] = useState<GenerateBudgetResponse | null>(null);
  const [savedPlan, setSavedPlan] = useState<SavedBudgetPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<Action>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isEditing, setIsEditing] = useState(false);

  const savingRef = useRef(false);
  const approvingRef = useRef(false);
  const generatingRef = useRef(false);

  const availablePeriods = useMemo(() => getAvailablePeriods(), []);

  const setError = (message: string | null) => {
    setNotice(message ? { kind: "error", message } : null);
  };

  const summary = useMemo(() => totals(form), [form]);
  const isApproved = savedPlan?.status === "APPROVED";
  const hasChanges = savedPlan
    ? formFingerprint(form) !== formFingerprint(formFromSaved(savedPlan))
    : true;
  const busy = loading || action !== null;
  const fieldsDisabled = busy || (isApproved && !isEditing);
  const selectedIds = useMemo(
    () => new Set(form.categories.map((item) => item.categoryId)),
    [form.categories],
  );
  const availableCategories = expenseCategories.filter((item) => !selectedIds.has(item.id));

  useEffect(() => {
    let active = true;
    async function initialize() {
      const target = nextBudgetPeriod();
      try {
        const categories = await getExpenseCategories();
        if (active) setExpenseCategories(categories);
      } catch (error) {
        if (!active) return;
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las categorías.",
        );
      }

      try {
        const plan = await getSavedBudgetPlan(target.year, target.month);
        if (active) {
          setSavedPlan(plan);
          setPeriod({ year: plan.year, month: plan.month });
          setForm(formFromSaved(plan));
        }
      } catch (error) {
        if (!active) return;

        if (error instanceof ApiError && error.status === 404) {
          setSavedPlan(null);
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "No se pudo recuperar la propuesta guardada.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void initialize();
    return () => {
      active = false;
    };
  }, []);

  async function handlePeriodChange(newPeriod: Period) {
    if (isEditing) return;
    if (newPeriod.year === period.year && newPeriod.month === period.month) return;
    setPeriod(newPeriod);
    setLoading(true);
    setNotice(null);
    setProposal(null);
    setIsEditing(false);
    try {
      const plan = await getSavedBudgetPlan(newPeriod.year, newPeriod.month);
      setSavedPlan(plan);
      setForm(formFromSaved(plan));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setSavedPlan(null);
        setForm(DEFAULT_FORM);
        return;
      }
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo recuperar la propuesta guardada.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateForm<K extends keyof BudgetForm>(field: K, value: BudgetForm[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setNotice(null);
  }

  function updateExpense(index: number, changes: Partial<FixedExpense>) {
    updateForm("fixedExpenses", form.fixedExpenses.map((item, i) =>
      i === index ? { ...item, ...changes } : item,
    ));
  }

  function updateCategory(categoryId: string, amount: number) {
    updateForm(
      "categories",
      form.categories.map((item) =>
        item.categoryId === categoryId
          ? { ...item, amount: Number.isNaN(amount) ? 0 : amount }
          : item,
      ),
    );
  }

  function addCategory(categoryId: string) {
    if (!categoryId || selectedIds.has(categoryId)) return;
    updateForm("categories", [...form.categories, { categoryId, amount: 0 }]);
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (generatingRef.current || busy || isApproved) return;
    const validationError = validateForm({ ...form, categories: [] }, false);
    if (validationError) {
      setNotice({ kind: "error", message: validationError });
      return;
    }
    generatingRef.current = true;
    setAction("generate");
    setNotice(null);
    try {
      const result = await generateBudget({
        monthlyIncome: summary.income,
        savingsGoalPercent: summary.savingsPercent,
        fixedExpenses: normalizeExpenses(form.fixedExpenses).filter((item) => item.amount > 0),
      });
      setProposal(result);

      // Conservamos el período que el usuario tiene seleccionado actualmente en el selector
      // para evitar conflictos (409) con meses anteriores ya aprobados.
      updateForm(
        "categories",
        result.categories.map((item) => ({
          categoryId: item.categoryId,
          amount: Number(item.amount ?? item.proposedAmount ?? 0),
        })),
      );

      setNotice({
        kind: "success",
        message: `Propuesta calculada con éxito para ${formatPeriodLabel(period)}. Revisa los límites por categoría y guarda el borrador.`,
      });
    } catch (error) {
      setNotice({ kind: "error", message: errorMessage(error) });
    } finally {
      generatingRef.current = false;
      setAction(null);
    }
  }

  async function handleSave() {
    if (savingRef.current || busy || isApproved) return;
    const validationError = validateForm(form, false);
    if (validationError) {
      setNotice({ kind: "error", message: validationError });
      return;
    }
    savingRef.current = true;
    setAction("save");
    setNotice(null);
    try {
      const plan = await saveBudgetPlan({
        year: period.year,
        month: period.month,
        monthlyIncome: summary.income,
        savingsGoalPercent: summary.savingsPercent,
        fixedExpenses: normalizeExpenses(form.fixedExpenses).filter((item) => item.amount > 0),
        categories: form.categories,
      });
      setSavedPlan(plan);
      setPeriod({ year: plan.year, month: plan.month });
      setForm(formFromSaved(plan));
      setNotice({ kind: "success", message: "Borrador guardado correctamente." });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setNotice({
          kind: "error",
          message: `${error.message}. Este período ya tiene un presupuesto registrado o aprobado en la base de datos. Selecciona otro mes en el selector superior para continuar.`,
        });
        // Sincronizar el plan existente para actualizar el estado visual
        try {
          const existing = await getSavedBudgetPlan(period.year, period.month);
          setSavedPlan(existing);
          setForm(formFromSaved(existing));
        } catch {
          // Si no se puede obtener, se mantiene el estado previo
        }
      } else {
        setNotice({ kind: "error", message: errorMessage(error) });
      }
    } finally {
      savingRef.current = false;
      setAction(null);
    }
  }

  async function handleApprove() {
    if (approvingRef.current || busy || isApproved) return;
    if (!savedPlan) {
      setNotice({ kind: "error", message: "Guarda la propuesta antes de aprobarla." });
      return;
    }
    if (hasChanges) {
      setNotice({ kind: "error", message: "Guarda los cambios pendientes antes de aprobar." });
      return;
    }
    const validationError = validateForm(form, true);
    if (validationError) {
      setNotice({ kind: "error", message: validationError });
      return;
    }
    approvingRef.current = true;
    setAction("approve");
    setNotice(null);
    try {
      const result = await approveSavedBudgetPlan(savedPlan.id);
      setSavedPlan({ ...savedPlan, status: "APPROVED", approvedAt: new Date().toISOString() });
      setNotice({ kind: "success", message: result.message });
      onApproved?.();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setNotice({
          kind: "error",
          message: `${error.message}. Este presupuesto ya había sido aprobado previamente.`,
        });
        setSavedPlan((prev) =>
          prev ? { ...prev, status: "APPROVED", approvedAt: new Date().toISOString() } : null,
        );
      } else {
        setNotice({ kind: "error", message: errorMessage(error) });
      }
    } finally {
      approvingRef.current = false;
      setAction(null);
    }
  }

  async function handleUpdateApproved() {
    if (busy || !isApproved || !isEditing || !savedPlan) return;

    const validationError = validateForm(form, true);

    if (validationError) {
      setNotice({
        kind: "error",
        message: validationError,
      });
      return;
    }

    setAction("save");
    setNotice(null);

    try {
      const response = await updateApprovedBudgetPlan(savedPlan.id, {
        monthlyIncome: summary.income,
        savingsGoalPercent: summary.savingsPercent,
        fixedExpenses: normalizeExpenses(form.fixedExpenses).filter(
          (item) => item.amount > 0,
        ),
        categories: form.categories,
      });

      setSavedPlan(response.plan);
      setForm(formFromSaved(response.plan));
      setIsEditing(false);

      setNotice({
        kind: "success",
        message: response.message,
      });

      onApproved?.();
    } catch (error) {
      setNotice({
        kind: "error",
        message: errorMessage(error),
      });
    } finally {
      setAction(null);
    }
  }

  function handleCancelEdit() {
    if (!savedPlan || busy) return;

    setForm(formFromSaved(savedPlan));
    setIsEditing(false);
    setNotice(null);
  }

  const showPlan = Boolean(proposal || savedPlan || form.categories.length > 0 || !loading);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Presupuesto inteligente</h1>
          <p className="text-sm text-muted-foreground">
            Planifica tus ingresos, ahorro y límites de gasto mensuales.
          </p>

          {isApproved && !isEditing && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setIsEditing(true)}
              className="mt-3"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar presupuesto
            </Button>
          )}

          {isApproved && isEditing && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void handleUpdateApproved()}
                disabled={busy || !hasChanges}
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={busy}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar edición
              </Button>
            </div>
          )}
        </div>

        {/* Selector de período */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            aria-label="Seleccionar período a presupuestar"
            value={`${period.year}-${period.month}`}
            disabled={busy || isEditing}
            onChange={(e) => {
              const [year, month] = e.target.value.split("-").map(Number);
              void handlePeriodChange({ year, month });
            }}
            className="h-9 rounded-md border bg-background px-3 py-1 text-sm font-medium shadow-xs outline-none focus:ring-2 focus:ring-ring"
          >
            {availablePeriods.map((p) => (
              <option key={`${p.year}-${p.month}`} value={`${p.year}-${p.month}`}>
                {formatPeriodLabel(p)}
              </option>
            ))}
          </select>
        </div>
      </header>

      <StatusMessage notice={notice} />

      {loading && <p className="text-sm text-muted-foreground">Cargando información del presupuesto...</p>}

      {savedPlan && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Estado ({period.month}/{period.year}):</span>
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
              isApproved
                ? isEditing
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : hasChanges
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
            }`}
          >
            {isApproved
              ? isEditing
                ? "Aprobado (En edición)"
                : "Aprobado (Solo lectura)"
              : hasChanges
                ? "Borrador con cambios sin guardar"
                : "Borrador guardado"}
          </span>
          {isApproved && !isEditing && (
            <span className="text-xs text-muted-foreground">
              — Este período está cerrado. Para modificarlo, usa «Editar presupuesto» arriba, o selecciona otro mes.
            </span>
          )}
          {isApproved && isEditing && (
            <span className="text-xs text-muted-foreground">
              — Editando valores del presupuesto aprobado. Recuerda guardar los cambios cuando termines.
            </span>
          )}
        </div>
      )}

      {!savedPlan && !loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Estado ({period.month}/{period.year}):</span>
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Nuevo (Sin presupuesto registrado)
          </span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" /> Datos del presupuesto ({formatPeriodLabel(period)})
          </CardTitle>
          <CardDescription>Define tus ingresos y compromisos financieros del mes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthly-income">Ingresos mensuales ($)</Label>
                <Input id="monthly-income" type="number" min="0.01" step="0.01"
                  value={form.monthlyIncome} disabled={fieldsDisabled} required
                  onChange={(event) => updateForm("monthlyIncome", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings-goal">Meta de ahorro (%)</Label>
                <Input id="savings-goal" type="number" min="0" max="100" step="0.01"
                  value={form.savingsGoalPercent} disabled={fieldsDisabled} required
                  onChange={(event) => updateForm("savingsGoalPercent", event.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">Gastos fijos</h3>
                  <p className="text-xs text-muted-foreground">Por ejemplo, arriendo, internet y servicios.</p>
                </div>
                <Button type="button" variant="outline" size="sm" disabled={fieldsDisabled}
                  onClick={() => updateForm("fixedExpenses", [...form.fixedExpenses, { name: "", amount: 0 }])}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar gasto
                </Button>
              </div>
              {form.fixedExpenses.map((expense, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                  <Input aria-label={`Nombre del gasto fijo ${index + 1}`} placeholder="Nombre del gasto"
                    value={expense.name} disabled={fieldsDisabled}
                    onChange={(event) => updateExpense(index, { name: event.target.value })} />
                  <Input aria-label={`Importe del gasto fijo ${index + 1}`} type="number"
                    min="0" step="0.01" value={expense.amount} disabled={fieldsDisabled}
                    onChange={(event) => updateExpense(index, { amount: Number(event.target.value) })} />
                  <Button type="button" variant="ghost" size="icon" aria-label="Eliminar gasto fijo"
                    disabled={fieldsDisabled}
                    onClick={() => updateForm("fixedExpenses", form.fixedExpenses.filter((_, i) => i !== index))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 text-sm">
                <span className="text-muted-foreground">Total de gastos fijos</span>
                <strong>{currency.format(summary.fixed)}</strong>
              </div>
            </div>
            <Button type="submit" disabled={busy || isApproved}>
              {action === "generate" ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {action === "generate" ? "Generando propuesta..." : "Generar propuesta inteligente"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showPlan && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Propuesta para {formatPeriodLabel(period)}</CardTitle>
              <CardDescription>Resumen actualizado con los importes que estás editando.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Metric label="Ingresos" value={summary.income} />
                <Metric label="Ahorro objetivo" value={summary.savings} />
                <Metric label="Gastos fijos" value={summary.fixed} />
                <Metric label="Presupuesto por categorías" value={summary.variable} />
                <Metric label="Total planificado" value={summary.planned} />
                <Metric label="Saldo restante" value={summary.remaining} />
              </div>
              {proposal && proposal.warnings.length > 0 && (
                <div className="rounded-md border border-yellow-600/30 bg-yellow-600/5 p-4">
                  <p className="mb-2 flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" /> Observaciones de la generación
                  </p>
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {proposal.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Presupuestos por categoría</CardTitle>
              <CardDescription>Ajusta los límites, guarda el borrador y apruébalo cuando esté listo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {form.categories.map((item) => {
                const category = expenseCategories.find((entry) => entry.id === item.categoryId);
                return (
                  <div key={item.categoryId} className="grid gap-2 sm:grid-cols-[1fr_160px_auto] sm:items-center">
                    <Label htmlFor={`budget-${item.categoryId}`}>{category?.name ?? item.categoryId}</Label>
                    <Input id={`budget-${item.categoryId}`} type="number" min="0.01" step="0.01"
                      value={Number.isNaN(item.amount) ? "" : item.amount} disabled={fieldsDisabled}
                      onChange={(event) => updateCategory(item.categoryId, Number(event.target.value))} />
                    <Button type="button" variant="ghost" size="icon" disabled={fieldsDisabled}
                      aria-label={`Eliminar presupuesto de ${category?.name ?? "categoría"}`}
                      onClick={() => updateForm("categories", form.categories.filter((entry) => entry.categoryId !== item.categoryId))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              {(!isApproved || isEditing) && (
                <div className="flex flex-wrap gap-2">
                  <select aria-label="Seleccionar categoría para presupuestar"
                    className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
                    value="" disabled={busy || availableCategories.length === 0}
                    onChange={(event) => addCategory(event.target.value)}>
                    <option value="">{loading ? "Cargando categorías..." : "Agregar una categoría..."}</option>
                    {availableCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <Button type="button" variant="outline" disabled={busy || availableCategories.length === 0}
                    onClick={() => availableCategories[0] && addCategory(availableCategories[0].id)}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar primera
                  </Button>
                </div>
              )}

              {form.categories.length === 0 && (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No hay categorías presupuestadas para este período. Puedes generar una propuesta con el botón superior o agregar categorías manualmente con el selector de abajo.
                </p>
              )}

              <div className="flex justify-between rounded-md bg-muted/50 p-4 text-sm">
                <span>Saldo restante</span>
                <strong className={summary.remaining < 0 ? "text-destructive" : ""}>
                  {currency.format(summary.remaining)}
                </strong>
              </div>

              {!isApproved && (
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="outline" onClick={handleSave}
                    disabled={busy || isApproved || (!hasChanges && Boolean(savedPlan))}>
                    {action === "save" ? "Guardando..." : "Guardar borrador"}
                  </Button>
                  <Button type="button" onClick={handleApprove}
                    disabled={busy || isApproved || !savedPlan || hasChanges || form.categories.length === 0 || summary.remaining < 0}>
                    {action === "approve" ? "Aprobando..." : "Aprobar presupuesto"}
                  </Button>
                </div>
              )}
              {!savedPlan && <p className="text-xs text-muted-foreground">Guarda el borrador antes de aprobarlo.</p>}
              {savedPlan && hasChanges && !isApproved && (
                <p className="text-xs text-muted-foreground">Tienes cambios pendientes de guardar.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!showPlan && !loading && (
        <p className="text-sm text-muted-foreground">Genera una propuesta para empezar a planificar por categoría.</p>
      )}
    </section>
  );
}


