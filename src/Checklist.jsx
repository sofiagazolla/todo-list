import { useEffect, useState, useRef } from "react";
import { supabase } from "./lib/supabase";
import { filters } from "./constants";
import { uid } from "./utils";
import Header from "./components/Header";
import Subject from "./components/Subject";

function Checklist({ userId, userName, onLogout }) {
    const [subjects, setSubjects] = useState([]);
    const [filter, setFilter] = useState(filters[0]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [error, setError] = useState("");

    // guardam exclusões p poder desfazer
    const history = useRef(null);
    const busy = useRef(false);

    useEffect(() => {
        let active = true;

        // busca e carrega os dados do banco
        async function loadData() {
            // consulta as duas tabelas do banco
            const [categories, tasks] = await Promise.all([
                supabase.from("subjects").select("id, name, color").eq("user_id", userId),
                supabase.from("tasks").select("id, subject_id, text, done, due").eq("user_id", userId)
            ]);

            if (!active) return;

            if (categories.error || tasks.error) {
                setLoadError((categories.error || tasks.error).message);
            } else {
                // associa as tarefas e as categorias usando subject_id
                const data = categories.data.map((s) => ({
                    ...s,
                    tasks: tasks.data.filter((t) => t.subject_id === s.id)
                        .map((t) => ({ id: t.id, text: t.text, done: t.done, due: t.due }))
                }));

                setSubjects(data);
            }

            setLoading(false);
        }

        loadData().catch((err) => {
            if (active) {
                setLoadError(err.message || "Não foi possível carregar os dados.");
                setLoading(false);
            }
        });

        // evita atualizar os estados depois que o componente é desmontado
        return () => { active = false; };
    }, [userId]);

    // exibe erros e retorna false
    const showError = (err) => {
        setError(err.message || "Não foi possível salvar a alteração.");
        return false;
    };

    // adiciona uma nova categoria, usando insert
    const addSubject = async (name, color) => {
        setError("");
        const s = { id: uid(), name, color, tasks: [] };

        const { error } = await supabase.from("subjects").insert({
            id: s.id, user_id: userId, name, color
        });

        if (error) return showError(error);
        setSubjects((current) => [...current, s]);
        return true;
    };

    // deleta uma categoria e suas tarefas, usando delete
    const deleteSubject = async (s) => {
        if (busy.current) return;
        if (s.tasks.length > 0 && !window.confirm(`Excluir “${s.name}” e todas as tarefas dela?`)) return;

        busy.current = true;
        setError("");

        try {
            const { error } = await supabase.from("subjects").delete().eq("id", s.id).eq("user_id", userId).select("id").single();

            if (error) return showError(error);

            const index = subjects.findIndex((x) => x.id === s.id);

            setSubjects((current) => current.filter((x) => x.id !== s.id));

            history.current = { type: "subject", subject: s, index };
        } catch (err) {
            showError(err);
        } finally {
            busy.current = false;
        }
    };

    // adiciona uma tarefa, usando insert
    const addTask = async (subjectId, text, due) => {
        setError("");
        const task = { id: uid(), text, done: false, due };

        const { error } = await supabase.from("tasks").insert({
            ...task, subject_id: subjectId, user_id: userId
        });

        if (error) return showError(error);

        setSubjects((current) => current.map((s) =>
            s.id === subjectId ? { ...s, tasks: [...s.tasks, task] } : s
        ));

        return true;
    };

    // atualiza uma tarefa no banco -> usada para mudar o estado ou a data dela
    const editTask = async (subjectId, taskId, changes) => {
        setError("");

        const { error } = await supabase.from("tasks").update(changes).eq("id", taskId).eq("user_id", userId);

        if (error) return showError(error);

        setSubjects((current) => current.map((s) =>
            s.id === subjectId
                ? { ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, ...changes } : t) }
                : s
        ));
    };

    // exclui uma tarefa do banco e da categoria
    const deleteTask = async (subjectId, taskId) => {
        if (busy.current) return;

        const task = subjects.find((s) => s.id === subjectId)?.tasks.find((t) => t.id === taskId);
        if (!task) return;

        busy.current = true;
        setError("");

        try {
            const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId).select("id").single();

            if (error) return showError(error);

            setSubjects((current) => current.map((s) =>
                s.id === subjectId
                    ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }
                    : s
            ));

            history.current = { type: "task", subjectId, task };
        } catch (err) {
            showError(err);
        } finally {
            busy.current = false;
        }
    };

    // desfaz a última exclusão
    const undo = async () => {
        if (busy.current || !history.current) return;

        const last = history.current;
        busy.current = true;
        setError("");

        try {
            if (last.type === "task") {
                // recupera a tarefa excluída
                const { error } = await supabase.from("tasks").insert({
                    ...last.task, subject_id: last.subjectId, user_id: userId
                });

                if (error) return showError(error);

                setSubjects((current) => current.map((s) =>
                    s.id === last.subjectId
                        ? { ...s, tasks: [...s.tasks, last.task] }
                        : s
                ));
            } else {
                // recupera a categoria excluída
                const s = last.subject;

                const { error } = await supabase.from("subjects").insert({
                    id: s.id, user_id: userId, name: s.name, color: s.color
                });

                if (error) return showError(error);

                // recupera as tarefas da categoria
                if (s.tasks.length > 0) {
                    const tasks = s.tasks.map((t) => ({
                        ...t, subject_id: s.id, user_id: userId
                    }));

                    const { error: tasksError } = await supabase.from("tasks").insert(tasks);

                    if (tasksError) {
                        // desfaz a restauração parcial se as tarefas falharem
                        const { error: rollbackError } = await supabase.from("subjects").delete().eq("id", s.id).eq("user_id", userId);

                        if (rollbackError) {
                            return showError({ message: "Erro ao restaurar a categoria. Atualize a página para sincronizar os dados." });
                        }

                        return showError(tasksError);
                    }
                }

                setSubjects((current) => {
                    const next = [...current];
                    next.splice(Math.max(0, Math.min(last.index, next.length)), 0, s);
                    return next;
                });
            }

            history.current = null;
        } catch (err) {
            showError(err);
        } finally {
            busy.current = false;
        }
    };

    // detecta ctrl z para desfazer
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z" || e.shiftKey || e.altKey) return;

            // mantém o ctrl z normal dos campos
            if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]")) return;
            if (!history.current || busy.current) return;

            e.preventDefault();
            undo();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo]);

    // exibe uma mensagem enquanto carrega
    if (loading) return <main className="mx-auto max-w-6xl px-4 pt-8">Carregando tarefas...</main>;

    // exibe um erro e deixa tentar de novo
    if (loadError) return (
        <main className="mx-auto max-w-6xl px-4 pt-8">
            <p role="alert">Erro ao carregar: {loadError}</p>
            <button className="btn mt-3" onClick={() => window.location.reload()}>Tentar novamente</button>
        </main>
    );

    return (
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
            <Header usedColors={subjects.map((s) => s.color)} filter={filter} onFilterChange={setFilter} onAddSubject={addSubject} userName={userName} onLogout={onLogout} />

            {error && <p role="alert" className="mb-5 text-sm text-berry-blush-800">Erro ao salvar: {error}</p>}

            {subjects.length === 0 ? (
                <div className="win border-dashed bg-berry-blush-50/80 px-4 py-10 text-center text-prussian-blue-700 shadow-none">
                    Nenhuma categoria ainda. Digite o nome de uma acima para começar.
                </div>
            ) : (
                <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
                    {subjects.map((s) => (
                        <div key={s.id} className="mb-6 break-inside-avoid">
                            <Subject s={s} filter={filter} onAddTask={addTask} onEditTask={editTask} onDeleteTask={deleteTask} onDelete={() => deleteSubject(s)} />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default Checklist;
