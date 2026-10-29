
export const uid = () => Math.random().toString(36).slice(2, 10);

export const today = () => new Date().toLocaleDateString("sv");

// calcula quantos dias faltam até a data - se for um valor negativo ta atrasada
export const diffDays = (date) => Math.round((new Date(date) - new Date(today())) / 86400000);

// transforma em dd/mm
export const shortDate = (date) => date.slice(8, 10) + "/" + date.slice(5, 7);

export const isLate = (t) => !t.done && t.due && diffDays(t.due) < 0;

export function dueInfo(t) {
    if (!t.due) return null;

    const days = diffDays(t.due);
    const date = shortDate(t.due);

    if (t.done) return { label: date, cls: "border-prussian-blue-200 text-prussian-blue-600" };

    if (days < 0) return {
        label: `Atrasada ${date}`,
        cls: "border-berry-blush-800 bg-berry-blush-200 text-berry-blush-800 font-semibold"
    };

    if (days === 0) return {
        label: "Hoje",
        cls: "border-vintage-grape-800 bg-vintage-grape-200 text-vintage-grape-800 font-semibold"
    };

    if (days === 1) return {
        label: "Amanhã",
        cls: "border-vintage-grape-700 bg-vintage-grape-100 text-vintage-grape-800"
    };

    return {
        label: date,
        cls: "border-prussian-blue-300 bg-prussian-blue-50 text-prussian-blue-800"
    };
}

// exibe as pendentes primeiro e concluídas no fim
export function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        return (a.due || "9999").localeCompare(b.due || "9999");
    });
}
