"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="adminShell">
      <form className="loginCard" onSubmit={login}>
        <img className="logoImage" src="/logo.svg" alt="Orken AI logo" />
        <h1>Admin Login</h1>
        <p>Sign in to manage Orken AI.</p>
        <input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="error">{error}</div>}
        <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </main>
  );
}