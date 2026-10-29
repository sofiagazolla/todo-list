
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "./Card";

function Auth() {
    const [register, setRegister] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // cadastro/login
    const submit = async (e) => {
        e.preventDefault();
        if (register && !name.trim()) return;

        setLoading(true);
        setMessage("");

        try {
            // ou cria uma conta ou entra em uma existente
            const { data, error } = register
                ? await supabase.auth.signUp({ email, password, options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin } })
                : await supabase.auth.signInWithPassword({ email, password });

            // exibe erros ou pede que confirme o email
            if (error) {
                setMessage(error.message);
            } else if (register && !data.session) {
                setMessage("Confira seu e-mail para confirmar o cadastro!");
            }
        } catch (err) {
            setMessage(err.message || "Não foi possível realizar a autenticação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="mx-auto max-w-md px-4 pt-20">
            <Card title="To-do" titlebarClass="bg-[#ded2ee]" titleClass="font-semibold">
                <div className="p-5">
                    <h1 className="mb-5 text-center text-3xl font-bold">
                        {register ? "Criar conta ♡" : "Bem-vinda(o)! ♡"}
                    </h1>

                    <form className="flex flex-col gap-3" onSubmit={submit}>
                        {register && (
                            <input type="text" className="field" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
                        )}

                        <input type="email" className="field" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                        <input type="password" className="field" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={register ? "new-password" : "current-password"} minLength={6} required />

                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? "Carregando..." : register ? "Cadastrar" : "Entrar"}
                        </button>
                    </form>

                    {message && (
                        <p className="mt-3 text-sm text-prussian-blue-700" role="status">{message}</p>
                    )}

                    <button type="button" className="btn btn-ghost mt-4 text-base underline" onClick={() => { setRegister(!register); setMessage(""); }}>
                        {register ? "Já tenho uma conta" : "Criar uma conta"}
                    </button>
                </div>
            </Card>
        </main>
    );
}

export default Auth