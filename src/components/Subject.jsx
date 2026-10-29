import { useState } from "react";
import { sortTasks, dueInfo } from "../utils";
import Card from "./Card";

function Subject({ s, filter, onAddTask, onEditTask, onDeleteTask, onDelete }) {
    const [text, setText] = useState("");
    const [due, setDue] = useState("");
    const [saving, setSaving] = useState(false);

    // calcula concluídas e a porcentagem de progresso
    const done = s.tasks.filter((t) => t.done).length;
    const pct = s.tasks.length ? Math.round((done / s.tasks.length) * 100) : 0;
    
    // filtra e ordena tarefas
    const visible = sortTasks(s.tasks.filter(filter.test)).map((t) => ({ ...t, info: dueInfo(t) }));

    // adiciona uma tarefa
    const submit = async (e) => {
        e.preventDefault();
        if (!text.trim() || saving) return;

        setSaving(true);

        try {
            const saved = await onAddTask(s.id, text.trim(), due || null);

            // limpa o formulário depois de salvar
            if (saved) {
                setText("");
                setDue("");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card title={s.name} color={s.color} titleClass="text-lg font-bold" action={<button className="btn btn-ghost" onClick={onDelete}>Excluir</button>}>

            <div className="p-4">
                <p className="mb-2 text-sm text-prussian-blue-700"> {done} de {s.tasks.length} concluídas </p>

                <div className="mb-3 h-4 overflow-hidden rounded-md border-[2.5px] border-prussian-blue-900 bg-white">
                    <div className="seg h-full border-prussian-blue-900 transition-[width] duration-300" style={{ width: `${pct}%`, backgroundColor: s.color, borderRightWidth: pct ? 2.5 : 0 }} />
                </div>

                {s.tasks.length > 0 && visible.length === 0 && (
                    <p className="mb-3 text-sm text-prussian-blue-700"> Nenhuma tarefa neste filtro :( </p>
                )}

                {/* lista de tarefas */}
                <ul className="mb-3">
                    {visible.map((t) => (
                        <li key={t.id} className="flex items-center gap-2.5 border-b-2 border-dashed border-prussian-blue-200 py-2">
                            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                                <input type="checkbox" className="check" checked={t.done}
                                    onChange={() => onEditTask(s.id, t.id, { done: !t.done })} />

                                <span className="min-w-0 break-words">
                                    <span className={t.done ? "text-prussian-blue-600 line-through" : ""}>
                                        {t.text}
                                    </span>

                                    {/* mostra o prazo, se tiver */}
                                    {t.info && (
                                        <span className={`mt-0.5 block w-fit rounded border-2 px-1.5 text-xs leading-5 ${t.info.cls}`}>
                                            {t.info.label}
                                        </span>
                                    )}
                                </span>
                            </label>

                            {/* permite alterar a data */}
                            <input type="date" value={t.due || ""} onChange={(e) => onEditTask(s.id, t.id, { due: e.target.value || null })} title="Alterar prazo" className="w-9 flex-none cursor-pointer rounded-md border-0 bg-transparent p-1 text-transparent opacity-60 hover:opacity-100 [&::-webkit-datetime-edit]:hidden" />

                            <button className="btn btn-ghost" onClick={() => onDeleteTask(s.id, t.id)}>✕</button>
                        </li>
                    ))}
                </ul>

                {/* formulário para adicionar tarefas */}
                <form className="flex flex-wrap gap-2" onSubmit={submit}>
                    <input type="text" className="field min-w-[140px] flex-1" value={text} placeholder="Nova tarefa" onChange={(e) => setText(e.target.value)} />

                    <input type="date" className="field" value={due} onChange={(e) => setDue(e.target.value)} />

                    <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving ? "Salvando..." : "Adicionar"}
                    </button>
                </form>
            </div>
        </Card>
    );
}

export default Subject