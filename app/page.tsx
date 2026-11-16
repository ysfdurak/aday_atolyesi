import { redirect } from 'next/navigation';

// Kök adres çalışma alanına yönlenir; ?lang=en gibi sorgu değerleri korunur (İngilizce tanıtım turu).
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams))
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) query.append(key, v);
  const qs = query.toString();
  redirect('/workspace.html' + (qs ? '?' + qs : ''));
}
