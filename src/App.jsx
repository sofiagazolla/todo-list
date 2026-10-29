
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Checklist from "./Checklist";

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // verifica se o usuario já esta logado
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // encerra a sessão do usuario
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) alert(error.message);
    };

    if (loading) return <p className="p-8">Carregando...</p>;
    if (!session) return <Auth />;

    // utiliza o nome cadastrado ou, se não existir, o início do e-mail
    const userName = session.user.user_metadata?.name || session.user.email?.split("@")[0] || "você";

    return (
        <Checklist key={session.user.id} userId={session.user.id} userName={userName} onLogout={logout} />
    );
}

export default App