export function DemoBanner() {
  if (import.meta.env.VITE_DEMO_MODE !== 'true') {
    return null;
  }

  return (
    <div className="border-b border-brand-light bg-brand-light px-4 py-2 text-center text-xs font-medium text-brand-deep sm:text-sm">
      Demo pública: podés probar todo, pero los datos no se guardan y se
      reinician solos.
    </div>
  );
}
