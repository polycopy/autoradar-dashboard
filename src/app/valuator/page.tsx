import { getUniqueMakes } from "@/lib/queries";
import { ValuatorForm } from "@/components/valuator-form";

export const dynamic = "force-dynamic";

export default async function ValuatorPage() {
  const makes = await getUniqueMakes();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Valuador
        </h2>
        <p className="text-sm text-muted mt-1">
          Estimá el precio de mercado basado en publicaciones reales
        </p>
      </div>

      <ValuatorForm makes={makes} />
    </div>
  );
}
