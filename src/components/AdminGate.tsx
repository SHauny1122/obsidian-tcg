"use client";

import { FormEvent, ReactNode, useState } from "react";
import { shopConfig } from "@/config/shop";

const adminSessionKey = "pokemon-market-admin-unlocked";

export function AdminGate({ children }: { children: ReactNode }) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(
    () =>
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(adminSessionKey) === "true",
  );
  const [isDenied, setIsDenied] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password === shopConfig.temporaryAdminPassword) {
      window.sessionStorage.setItem(adminSessionKey, "true");
      setIsUnlocked(true);
      setIsDenied(false);
      setPassword("");
      return;
    }

    setIsDenied(true);
    setPassword("");
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  if (isDenied) {
    return (
      <section className="vault-panel mx-auto max-w-xl rounded-lg p-6 text-center sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Admin vault
        </p>
        <h1 className="mt-3 text-3xl font-bold text-stone-950">
          Access restricted
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          The password was not accepted. Admin tools are hidden.
        </p>
        <button
          type="button"
          onClick={() => setIsDenied(false)}
          className="vault-button-secondary mt-6 min-h-11 rounded-md px-5 py-2 text-sm font-semibold"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="vault-panel mx-auto max-w-xl rounded-lg p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
        Admin vault
      </p>
      <h1 className="mt-3 text-3xl font-bold text-stone-950">
        Enter admin password
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Temporary development protection only. Full authentication is not built
        yet.
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1.5 text-sm font-medium text-stone-800">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Development password"
            className="min-h-11 rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <button
          type="submit"
          className="vault-button min-h-12 rounded-md px-5 py-3 text-sm font-semibold shadow-sm sm:w-fit"
        >
          Unlock admin
        </button>
      </form>
    </section>
  );
}
