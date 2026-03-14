import { Suspense } from "react";
import { SignUpTestForm } from "./SignUpTestForm";

export default function TestSignUpPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-white">Test: Create account</h1>
      <p className="mb-6 text-white/70">
        Use this page to test sign-up and error messages.
      </p>

      <Suspense fallback={<p className="text-white/70">Loading form...</p>}>
        <SignUpTestForm />
      </Suspense>
    </main>
  );
}