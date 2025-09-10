// ===================================================================================
// CHATBOT SCRIPT
// ===================================================================================

// --- Configuração Inicial ---
const usuarioLogadoEmail = sessionStorage.getItem('usuarioLogadoEmail');
if (!usuarioLogadoEmail) {
    window.location.href = 'Logar.html';
}

let contas = JSON.parse(localStorage.getItem('contas')) || [];
const usuarioAtual = contas.find(c => c.email === usuarioLogadoEmail);

if (!usuarioAtual || !usuarioAtual.dispositivos) {
    // Garante que o usuárioAtual e seus dispositivos existam
    if (usuarioAtual) {
        usuarioAtual.dispositivos = [];
    } else {
        // Redireciona se o usuário não for encontrado (segurança extra)
        window.location.href = 'Logar.html';
    }
}
let dispositivos = usuarioAtual.dispositivos; // Referência aos dispositivos do usuário logado

// Elementos do DOM
const chatMessagesEl = document.getElementById('chatMessages');
const chatInputEl = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const btnVoltar = document.getElementById('btnVoltar');
const relogioChatbotEl = document.getElementById('relogio-chatbot');

// --- Funções de UI ---
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    chatMessagesEl.appendChild(messageDiv);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight; // Rola para o final
}

function atualizarRelogio() {
    relogioChatbotEl.textContent = new Date().toLocaleTimeString('pt-BR');
}
setInterval(atualizarRelogio, 1000); // Inicia o relógio

// --- Persistência de Dados ---
function salvarDadosDoUsuario() {
    if (usuarioAtual) {
        usuarioAtual.dispositivos = dispositivos;
        localStorage.setItem('contas', JSON.stringify(contas));
    }
}

// --- Lógica do Chatbot ---

/**
 * Simula a interação com uma API de IA.
 * Em uma aplicação real, você faria uma requisição fetch para seu backend,
 * que por sua vez chamaria a API da Google Gemini.
 * Para este exemplo, faremos uma simulação de resposta e processamento de comandos.
 */
async function getBotResponse(userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    let response = "Desculpe, não entendi. Você pode tentar reformular ou perguntar sobre o aplicativo, produtos GoodWe, dispositivos ou status de energia.";

    // 1. Perguntas sobre o aplicativo
    if (lowerCaseMessage.includes('aplicativo') || lowerCaseMessage.includes('app') || lowerCaseMessage.includes('funciona')) {
        response = "Este aplicativo permite que você gerencie seus dispositivos de energia, visualize o consumo total e monitore o status da sua bateria. Você pode cadastrar, editar e desligar dispositivos, além de otimizar o consumo.";
    }
    // 2. Perguntas sobre produtos GoodWe (Placeholder)
    else if (lowerCaseMessage.includes('goodwe') || lowerCaseMessage.includes('inversor') || lowerCaseMessage.includes('bateria goodwe')) {
        response = "Os produtos GoodWe são soluções avançadas para energia solar, incluindo inversores e sistemas de armazenamento de bateria. Eles são conhecidos pela eficiência e confiabilidade. Para informações detalhadas sobre um modelo específico, consulte o site oficial ou um especialista. (Esta é uma resposta genérica, em um sistema real, a IA buscaria em uma base de conhecimento GoodWe).";
    }
    // 3. Cadastrar dispositivos
    else if (lowerCaseMessage.includes('cadastrar dispositivo') || lowerCaseMessage.includes('adicionar dispositivo')) {
        const parts = lowerCaseMessage.split(' ');
        const nomeIndex = parts.indexOf('nome');
        const importanciaIndex = parts.indexOf('importancia');
        const consumoIndex = parts.indexOf('consumo');

        if (nomeIndex !== -1 && importanciaIndex !== -1 && consumoIndex !== -1 &&
            parts[nomeIndex + 1] && parts[importanciaIndex + 1] && parts[consumoIndex + 1]) {

            const nome = parts[nomeIndex + 1];
            const importancia = parseInt(parts[importanciaIndex + 1]);
            const consumo = parseFloat(parts[consumoIndex + 1]);

            if (nome && !isNaN(importancia) && importancia >= 1 && importancia <= 3 && !isNaN(consumo) && consumo > 0) {
                const novoDispositivo = {
                    id: Date.now(),
                    nome: nome.replace(/_/g, ' '), // Permite nome com underscore para fácil parsing
                    importancia: importancia,
                    consumo: consumo,
                    ligado: true
                };
                dispositivos.push(novoDispositivo);
                salvarDadosDoUsuario();
                response = `Dispositivo '${novoDispositivo.nome}' com importância ${novoDispositivo.importancia} e consumo ${novoDispositivo.consumo} kWh cadastrado com sucesso!`;
            } else {
                response = "Para cadastrar um dispositivo, preciso do nome, importância (1-3) e consumo (kWh). Ex: 'cadastrar dispositivo nome_da_tv importancia 2 consumo 0.1'.";
            }
        } else {
            response = "Para cadastrar um dispositivo, preciso do nome, importância (1-3) e consumo (kWh). Ex: 'cadastrar dispositivo nome_da_tv importancia 2 consumo 0.1'.";
        }
    }
    // 4. Desligar dispositivos
    else if (lowerCaseMessage.includes('desligar dispositivo') || lowerCaseMessage.includes('desligar o') || lowerCaseMessage.includes('apagar o')) {
        const parts = lowerCaseMessage.split(' ');
        // Tenta encontrar o nome do dispositivo após "desligar" ou "apagar"
        const keywordIndex = parts.indexOf('desligar') !== -1 ? parts.indexOf('desligar') : parts.indexOf('apagar');
        
        let deviceNameToToggle = '';
        if (keywordIndex !== -1 && parts.length > keywordIndex + 1) {
            // Pega o resto da frase como nome
            deviceNameToToggle = parts.slice(keywordIndex + 1).join(' ').trim();
            // Remove "o", "a", "a luz", "o ar" etc. se estiver presente no início
            deviceNameToToggle = deviceNameToToggle.replace(/^(o|a|os|as)\s+/, '').replace(/^(luz|ar|tv|geladeira)\s+/, '');
        }

        if (deviceNameToToggle) {
            // Tenta encontrar o dispositivo pelo nome parcial ou completo
            const foundDevice = dispositivos.find(d => d.nome.toLowerCase().includes(deviceNameToToggle) && d.ligado);
            
            if (foundDevice) {
                foundDevice.ligado = false;
                salvarDadosDoUsuario();
                response = `Dispositivo '${foundDevice.nome}' foi desligado com sucesso.`;
            } else {
                response = `Não encontrei um dispositivo ligado chamado '${deviceNameToToggle}'. Você pode listar os dispositivos para verificar os nomes?`;
            }
        } else {
            response = "Para desligar um dispositivo, me diga o nome dele. Ex: 'desligar a TV' ou 'desligar o ar condicionado'.";
        }
    }
    // 5. Status de energia da casa
    else if (lowerCaseMessage.includes('status energia') || lowerCaseMessage.includes('consumo atual') || lowerCaseMessage.includes('nivel bateria')) {
        // Para pegar o nível da bateria, o chatbot precisaria ler diretamente do localStorage
        // o estado da bateria, que é simulado no index.html.
        // Aqui, vamos fazer uma leitura direta do localStorage de onde a bateria estaria salva.
        // Como a bateria não é salva no objeto do usuário (apenas dispositivos e limite),
        // teríamos que ajustar o `index.html` para salvar o estado da bateria também ou
        // simular um valor fixo. Por simplicidade, vamos calcular o consumo atual.

        const consumoTotalAtual = dispositivos.filter(d => d.ligado).reduce((acc, d) => acc + d.consumo, 0);
        
        // Em um cenário real, você recuperaria `nivelBateriaKWh` e `modoOperacao` do localStorage/banco de dados
        // Assumindo que o `index.html` estivesse salvando o estado da bateria no `usuarioAtual`
        // Exemplo: usuarioAtual.nivelBateriaKWh, usuarioAtual.modoOperacao, usuarioAtual.maxBateriaKWh
        // Para este exemplo, vou usar valores de referência ou apenas o consumo.
        
        response = `Seu consumo atual é de ${consumoTotalAtual.toFixed(2)} kWh.`;
        // Para informações da bateria, seria necessário salvar o estado da bateria no localStorage no `index.html`
        // e recuperá-lo aqui. Por exemplo, se `usuarioAtual.nivelBateriaKWh` estivesse disponível:
        // const nivelBateria = usuarioAtual.nivelBateriaKWh || 0;
        // const maxBateria = usuarioAtual.maxBateriaKWh || 3000;
        // const porcentagemBateria = (nivelBateria / maxBateria) * 100;
        // response += ` Sua bateria está em ${porcentagemBateria.toFixed(0)}% (${nivelBateria.toFixed(0)} kWh).`;
        // response += ` O modo de operação atual é '${usuarioAtual.modoOperacao || 'concessionaria'}'.`;
    }
    // 6. Listar dispositivos
    else if (lowerCaseMessage.includes('listar dispositivos') || lowerCaseMessage.includes('quais dispositivos tenho')) {
        if (dispositivos.length === 0) {
            response = "Você não tem nenhum dispositivo cadastrado.";
        } else {
            response = "Seus dispositivos cadastrados:\n";
            dispositivos.forEach(d => {
                response += `- ${d.nome} (Importância: ${d.importancia}, Consumo: ${d.consumo} kWh) - ${d.ligado ? 'Ligado' : 'Desligado'}\n`;
            });
        }
    }
    // Comandos de "ligar" dispositivo (opcional, já que o foco foi desligar)
    else if (lowerCaseMessage.includes('ligar dispositivo') || lowerCaseMessage.includes('ligar o')) {
        const parts = lowerCaseMessage.split(' ');
        const keywordIndex = parts.indexOf('ligar');
        let deviceNameToToggle = '';
        if (keywordIndex !== -1 && parts.length > keywordIndex + 1) {
            deviceNameToToggle = parts.slice(keywordIndex + 1).join(' ').trim();
            deviceNameToToggle = deviceNameToToggle.replace(/^(o|a|os|as)\s+/, '');
        }

        if (deviceNameToToggle) {
            const foundDevice = dispositivos.find(d => d.nome.toLowerCase().includes(deviceNameToToggle) && !d.ligado);
            
            if (foundDevice) {
                foundDevice.ligado = true;
                salvarDadosDoUsuario();
                response = `Dispositivo '${foundDevice.nome}' foi ligado com sucesso.`;
            } else {
                response = `Não encontrei um dispositivo desligado chamado '${deviceNameToToggle}'. Ele já pode estar ligado ou o nome está incorreto.`;
            }
        } else {
            response = "Para ligar um dispositivo, me diga o nome dele. Ex: 'ligar a TV'.";
        }
    }


    // --- Placeholder para integração real com a API da Gemini ---
    // Em um sistema real, se as regras acima não corresponderem,
    // você enviaria a `userMessage` para o seu backend.
    // Exemplo conceitual:
    /*
    const realAIResponse = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
    }).then(res => res.json()).then(data => data.text);

    if (realAIResponse) {
        // A IA poderia retornar um texto puro ou um JSON com ações a serem executadas
        // Por exemplo, { "action": "register_device", "name": "...", ... }
        // Você precisaria de lógica aqui para interpretar a resposta da IA.
        response = realAIResponse;
    }
    */
    // Fim do Placeholder

    return response;
}

// --- Event Listeners ---
sendMessageBtn.addEventListener('click', async () => {
    const userMessage = chatInputEl.value.trim();
    if (userMessage) {
        addMessage(userMessage, 'user');
        chatInputEl.value = '';
        const botResponse = await getBotResponse(userMessage);
        addMessage(botResponse, 'bot');
    }
});

chatInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessageBtn.click();
    }
});

btnVoltar.addEventListener('click', () => {
    window.location.href = 'index.html';
});