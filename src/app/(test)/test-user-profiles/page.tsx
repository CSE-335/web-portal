import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function TestUserProfilesPage() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("user_profiles").select("*");

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-bold text-white">
        user_profiles select test
      </h1>

      {error ? (
        <div className="rounded border border-red-500/50 bg-red-950/30 p-4 text-red-200">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-sm">{error.message}</p>
          <p className="mt-1 text-xs opacity-80">Code: {error.code}</p>
        </div>
      ) : (
        <div className="rounded border border-white/20 bg-white/5 p-4 text-white">
          <p className="font-semibold text-green-400">Select succeeded</p>
          <p className="mt-1 text-sm text-white/80">
            Rows: {data?.length ?? 0}
          </p>
          <pre className="mt-3 overflow-auto rounded bg-black/30 p-3 text-sm">
            {JSON.stringify(data ?? [], null, 2)}
          </pre>
        </div>
      )}

      <p className="mt-4 text-sm text-white/60">
        Page: /test-user-profiles — data loaded on the server.
      </p>
    </main>
  );
}
