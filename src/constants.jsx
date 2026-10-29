import { isLate } from "./utils";

export const colors = ["#5d7bd5", "#b3809a", "#81b181", "#7db5a7", "#9987ab", "#c69fb3"];

// cria uma cor nova depois de usarmos alguma
const extraColor = (n) => `hsl(${(n * 137.5) % 360} 30% 62%)`;

// sempre temos seis cores, sem repetir as usadas
export function freeColors(used) {
    const free = colors.filter((c) => !used.includes(c));
    let n = 0;

    while (free.length < colors.length) {
        const color = extraColor(n++);
        if (!used.includes(color) && !free.includes(color)) free.push(color);
    }

    return free;
}

export const filters = [
    { id: "todas", label: "Todas", test: () => true },
    { id: "pendentes", label: "Pendentes", test: (t) => !t.done },
    { id: "atrasadas", label: "Atrasadas", test: isLate },
    { id: "concluidas", label: "Concluídas", test: (t) => t.done },
];