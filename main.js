import { Worker } from "node:worker_threads";

const nomes = ["Maikol", "Sekefe", "Iallen", "Jivago", "Mayllon", "Jefferson", "Marcos"];

const workers = [];
const status = {};
let vivos = nomes.length;

nomes.forEach(nome => {
    status[nome] = {
        nome,
        hp: 100,
        ataque: Math.floor(Math.random() * 20) + 10,
        defesa: Math.floor(Math.random() * 10) + 5,
        velocidade: Math.floor(Math.random() * 5) + 1
    };
});

nomes.forEach(nome => {
    const lutador = new Worker("./professor.js", { workerData: { nome } });

    lutador.on("message", mensagem => {
        if (mensagem.type === "log") {
            console.log(mensagem.text);
        }

        if (mensagem.type === "hit") {

            const alvo = mensagem.target;
            const dano = mensagem.dano;

            if (status[alvo].hp <= 0) return;

            status[alvo].hp -= dano;
            
            console.log(`${mensagem.atacante} atacou ${alvo} causando ${dano} de dano. HP restante de ${alvo}: ${status[alvo].hp}`);

            if (status[alvo].hp <= 0) {
                console.log(`${alvo} foi derrotado!`);
                vivos--;
            }
        }
        workers.forEach(w => w.postMessage({ type: "updateStatus", status }));

        if (vivos === 1) {
            const vencedor = Object.values(status).find(p => p.hp > 0);
            console.log(`\n VENCEDOR: ${vencedor.nome} `);
            process.exit();
        }
    });
    workers.push(lutador);
});

setTimeout(() => {
    workers.forEach(worker => {
        worker.postMessage({ type: "start", status });
    });
}, 800);
