import { parentPort, workerData } from "node:worker_threads";

const nome = workerData.nome;
let todos;

function aplicarPoder(prof, alvo, dano) {
    switch (prof.nome) {
        case "Maikol":
            return { danoExtra: dano, log: "Maikol lançou um superkamehamehaaaaaaaaaaaaaa!" };
        case "Sekefe":
            return { contra: Math.floor(dano * 0.3), log: "Armou contra-ataque Luz da sabedoria!" };
        case "Iallen":
            prof.hp += 10;
            return { log: "Iallen se curou +10 HP com ondas sonoras de sua guitarra!" };
        case "Jivago":
            return { buffDef: 10, log: "Ativou defesa capilar!" };
        case "Mayllon":
            if (Math.random() < 0.2) return { danoExtra: dano * 2, log: "Mayllon usou o kaioken 20x Haaaaaaaa!" };
            return {};
        case "Jefferson":
            if (Math.random() < 0.2) return { esquiva: true, log: "Jefferson ativou o extinto superior!" };
            return {};
        case "Marcos":
            return { splash: 5, log: "Lançou final flash!" };
        default:
            return {};
    }
}

function escolherAlvo() {
    const vivos = Object.values(todos).filter(info => info.hp > 0 && info.nome !== nome);
    if (vivos.length === 0) return null;
    return vivos[Math.floor(Math.random() * vivos.length)];
}

function iniciarAtaque() {
    const eu = todos[nome];
    const intervalo = 1000 - eu.velocidade * 100; // tempo até o próximo ataque

    if (eu.hp <= 0) return;

    let alvo = escolherAlvo();

    if (alvo) {
        let dano = Math.max(1, eu.ataque - alvo.defesa);
        const efeito = aplicarPoder(eu, alvo, dano);

        if (efeito.danoExtra) dano += efeito.danoExtra;
        if (efeito.buffDef) eu.defesa += efeito.buffDef;
        if (efeito.log) parentPort.postMessage({ type: "log", text: `${nome}: ${efeito.log}` });

        // envia ataque com info de atacante


        if (efeito.contra) {
            eu.hp -= efeito.contra;
            parentPort.postMessage({ type: "log", text: `${alvo.nome} contra-atacou ${eu.nome} causando ${efeito.contra}` });
        }

        if (efeito.splash) {
            for (const p of Object.values(todos)) {
                if (p.nome !== nome && p !== alvo && p.hp > 0) {
                    parentPort.postMessage({ type: "hit", target: p.nome, dano: efeito.splash, atacante: nome });
                }
            }
        }
    }

    setTimeout(iniciarAtaque, intervalo);
}

parentPort.on("message", (mensagem) => {
    if (mensagem.type === "updateStatus") todos = mensagem.status;
    if (mensagem.type === "start") {
        todos = mensagem.status;
        iniciarAtaque();
    }
});
