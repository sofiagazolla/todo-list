import { useState } from "react";
import { filters, freeColors } from "../constants";
import Card from "./Card";

function Header({ filter, usedColors, onFilterChange, onAddSubject, userName, onLogout }) {
    const [name, setName] = useState("");
    const [choice, setChoice] = useState(null);
    const [saving, setSaving] = useState(false);

    // mostra só as cores disponiveis
    const options = freeColors(usedColors);
    const color = options.includes(choice) ? choice : options[0];

    // adiciona a categoria
    const submit = async (e) => {
        e.preventDefault();
        if (!name.trim() || saving) return;
        setSaving(true);
        try {
            const saved = await onAddSubject(name.trim(), color);
            // limpa o formulário depois de salvar
            if (saved) {
                setName("");
                setChoice(null);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card title="To-do" titlebarClass="bg-[#ded2ee]" titleClass="font-semibold" action={<button className="btn btn-ghost" onClick={onLogout}>Sair</button>} className="mb-7">

            <div className="p-5">
            
                <h1 className="mb-1 text-3xl font-bold tracking-tight sm:text-4xl"> Olá, {userName}! </h1>
                <p className="mb-5 text-prussian-blue-700"> Seja muito bem vinda(o) </p>

                {/* formulário para adicionar categorias */}
                <form className="flex flex-wrap items-center gap-3" onSubmit={submit}>
                    <input type="text" className="field min-w-[220px] flex-1" value={name} placeholder="Nome da categoria" onChange={(e) => setName(e.target.value)} />
                    
                    {/* cores disponíveis */}
                    <div className="flex gap-2">
                        {options.map((c) => (
                            <button type="button" key={c} onClick={() => setChoice(c)} className={`h-7 w-7 cursor-pointer rounded-md border-[2.5px] border-prussian-blue-900 ${choice === c ? "ring-2 ring-vintage-grape-700 ring-offset-2 scale-110" : ""}`} style={{ backgroundColor: c }} aria-label={`Cor ${c}`} aria-pressed={choice === c} />
                        ))}
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving ? "Adicionando..." : "Adicionar"}
                    </button>
                </form>

                {/* filtros */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-prussian-blue-700">Mostrar:</p>
                    {filters.map((f) => (
                        <button type="button" key={f.id} className={f.id === filter.id ? "btn btn-primary" : "btn"} onClick={() => onFilterChange(f)}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
}

export default Header