// ===================================================================================
// SEÇÃO 1: CONFIGURAÇÃO INICIAL E AUTENTICAÇÃO
// ===================================================================================

const usuarioLogadoEmail = sessionStorage.getItem('usuarioLogadoEmail');
if (!usuarioLogadoEmail) {
    window.location.href = 'Logar.html';
}

let dispositivos = [];
let contas = JSON.parse(localStorage.getItem('contas')) || [];
const usuarioAtual = contas.find(c => c.email === usuarioLogadoEmail);

// REMOVIDO: Variáveis de simulação de bateria movidas para status_energia.js
// REMOVIDO: otimizacaoAutomaticaRealizada movida para status_energia.js

// Mapeamento de todos os elementos do HTML para variáveis JavaScript
// REMOVIDO: limiteOtimizacaoInputEl e btnSalvarLimiteEl movidos para status_energia.js
// REMOVIDO: bateriaInternaEl e bateriaPorcentagemEl movidos para status_energia.js
// REMOVIDO: btnMudarModoEl movido para status_energia.js
const lista = document.getElementById("listaDispositivos");
// REMOVIDO: statusConsumo movido para status_energia.js
// REMOVIDO: btnVerificarConsumo movido para status_energia.js
// REMOVIDO: mensagemDiv movido para status_energia.js
const btnDeslogar = document.getElementById("btnDeslogar");
const relogioEl = document.getElementById('relogio');
const climaInfoEl = document.getElementById('clima-info');
const modalCadastro = document.getElementById('modalDispositivo');
const formCadastro = document.getElementById("formDispositivo");
const btnAbrirModalCadastro = document.getElementById('btnAbrirModal');
const btnFecharModalCadastro = modalCadastro.querySelector('.close-btn');
const modalEdicao = document.getElementById('modalEditarDispositivo');
const formEdicao = document.getElementById("formEditarDispositivo");
const btnFecharModalEdicao = modalEdicao.querySelector('.close-btn-edit');
const btnExcluirDispositivo = document.getElementById('btnExcluirDispositivo');
const btnAbrirChatbot = document.getElementById('btnAbrirChatbot');
const btnVerStatusEnergia = document.getElementById('btnVerStatusEnergia'); // NOVO: Referência ao botão de status de energia


// ===================================================================================
// SEÇÃO 2: PERSISTÊNCIA DE DADOS (localStorage)
// ===================================================================================

/**
 * Salva os dados do usuário (dispositivos) no localStorage.
 * Agora foca principalmente nos dispositivos, pois dados de bateria e otimização
 * são gerenciados em status_energia.js.
 */
function salvarDadosDoUsuario() {
    if (usuarioAtual) {
        usuarioAtual.dispositivos = dispositivos;
        // REMOVIDO: Salvamento de limiteOtimizacao, nivelBateriaKWh, estadoBateria, modoOperacao, maxBateriaKWh
        // movido para status_energia.js
        localStorage.setItem('contas', JSON.stringify(contas));
    }
}

/**
 * Carrega os dados do usuário do localStorage quando a página é iniciada.
 * Agora foca principalmente nos dispositivos.
 */
function carregarDadosDoUsuario() {
    if (usuarioAtual) {
        if (!usuarioAtual.dispositivos || !Array.isArray(usuarioAtual.dispositivos)) {
            usuarioAtual.dispositivos = [];
        }
        dispositivos = usuarioAtual.dispositivos;

        // REMOVIDO: Carregamento de limiteOtimizacao, nivelBateriaKWh, estadoBateria, modoOperacao
        // movido para status_energia.js
        
        // Atualiza a interface com os dados carregados
        atualizarLista();
        // REMOVIDO: atualizarConsumoTotal(), atualizarDisplayBateria(), atualizarBotaoModo()
        // movidos ou removidos.
    }
}


// ===================================================================================
// SEÇÃO 3: SIMULAÇÃO DA BATERIA E OTIMIZAÇÃO AUTOMÁTICA
// ===================================================================================

// REMOVIDO: simularBateria() movida para status_energia.js
// REMOVIDO: otimizarConsumo() movida para status_energia.js


// ===================================================================================
// SEÇÃO 4: FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE (UI)
// ===================================================================================

// REMOVIDO: atualizarDisplayBateria() movida para status_energia.js
// REMOVIDO: atualizarBotaoModo() movida para status_energia.js

/** Atualiza o relógio a cada segundo. */
function atualizarRelogio() { relogioEl.textContent = new Date().toLocaleTimeString('pt-BR'); }

/** Busca e exibe os dados do clima da localização do usuário. */
function buscarClima() { 
    const apiKey = 'OPEN_WEATHER_API_KEY'; /* Substitua pela sua chave */ 
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( 
            (position) => { 
                const { latitude, longitude } = position.coords; 
                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`; 
                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => { 
                        climaInfoEl.innerHTML = `<span>${Math.round(data.main.temp)}°C, ${data.weather[0].description}</span><img id="clima-icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Ícone do clima">`; 
                    })
                    .catch(() => climaInfoEl.textContent = 'Erro ao obter clima.'); 
            }, 
            () => climaInfoEl.textContent = 'Permita a localização.'
        ); 
    } else {
        climaInfoEl.textContent = 'Geolocalização não suportada pelo navegador.';
    }
}

/** Abre o modal de edição preenchido com os dados do dispositivo selecionado. */
function abrirModalEdicao(id) { const dispositivo = dispositivos.find(d => d.id === id); if (dispositivo) { document.getElementById('dispositivoIdEdit').value = dispositivo.id; document.getElementById('nomeDispositivoEdit').value = dispositivo.nome; document.getElementById('importanciaDispositivoEdit').value = dispositivo.importancia; document.getElementById('consumoDispositivoEdit').value = dispositivo.consumo; modalEdicao.style.display = 'flex'; } }

/** Alterna o estado (ligado/desligado) de um dispositivo. */
function alternarEstado(id) { 
    const index = dispositivos.findIndex(d => d.id === id); 
    if (index !== -1) { 
        dispositivos[index].ligado = !dispositivos[index].ligado; 
        salvarDadosDoUsuario(); // Salva os dispositivos após a alteração
        // REMOVIDO: atualizarConsumoTotal() daqui, pois agora é na página de status.
    } 
}

/** Recria a lista de dispositivos no HTML com base nos dados atuais. */
function atualizarLista() { 
    lista.innerHTML = ""; 
    if (!dispositivos || dispositivos.length === 0) { 
        lista.innerHTML = `<li style="padding: 12px; color: #6c757d;">Nenhum dispositivo cadastrado</li>`; 
        return; 
    } 
    dispositivos.sort((a, b) => a.importancia - b.importancia); 
    dispositivos.forEach(d => { 
        const li = document.createElement("li"); 
        li.className = "device-item"; 
        li.innerHTML = `
            <div class="device-info">
                <strong>${d.nome}</strong><br>
                Importância: ${d.importancia} | Consumo: ${d.consumo} kWh
            </div>
            <div class="device-actions">
                <label class="switch">
                    <input type="checkbox" onchange="alternarEstado(${d.id})" ${d.ligado ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <button class="edit-btn" onclick="abrirModalEdicao(${d.id})">Editar</button>
            </div>
        `; 
        lista.appendChild(li); 
    }); 
}

// REMOVIDO: atualizarConsumoTotal() movida para status_energia.js


// ===================================================================================
// SEÇÃO 5: EVENT LISTENERS (Ações do Usuário)
// ===================================================================================

btnDeslogar.addEventListener('click', () => { sessionStorage.removeItem('usuarioLogadoEmail'); window.location.href = 'Logar.html'; });

// REMOVIDO: btnSalvarLimiteEl movido para status_energia.js
// REMOVIDO: btnVerificarConsumo movido para status_energia.js
// REMOVIDO: btnMudarModoEl movido para status_energia.js

// Controles para abrir e fechar os modais (pop-ups)
btnAbrirModalCadastro.addEventListener('click', () => modalCadastro.style.display = 'flex');
btnFecharModalCadastro.addEventListener('click', () => {
    modalCadastro.style.display = 'none';
    formCadastro.reset(); // Limpa o formulário ao fechar
});
btnFecharModalEdicao.addEventListener('click', () => modalEdicao.style.display = 'none');
window.addEventListener('click', (event) => { 
    if (event.target === modalCadastro) {
        modalCadastro.style.display = 'none';
        formCadastro.reset(); // Limpa o formulário ao clicar fora
    }
    if (event.target === modalEdicao) modalEdicao.style.display = 'none'; 
});

// Lida com o cadastro de um novo dispositivo
formCadastro.addEventListener("submit", (e) => { 
    e.preventDefault(); 
    const dispositivo = { 
        id: Date.now(), 
        nome: document.getElementById("nomeDispositivo").value.trim(), 
        importancia: parseInt(document.getElementById("importanciaDispositivo").value), 
        consumo: parseFloat(document.getElementById("consumoDispositivo").value), 
        ligado: true 
    }; 
    dispositivos.push(dispositivo); 
    salvarDadosDoUsuario(); 
    atualizarLista(); 
    // REMOVIDO: atualizarConsumoTotal() daqui, pois agora é na página de status.
    formCadastro.reset(); 
    modalCadastro.style.display = 'none'; 
});

// Lida com a edição de um dispositivo existente
formEdicao.addEventListener("submit", (e) => { 
    e.preventDefault(); 
    const id = document.getElementById('dispositivoIdEdit').value; 
    const index = dispositivos.findIndex(d => d.id == id); 
    if (index !== -1) { 
        dispositivos[index].nome = document.getElementById('nomeDispositivoEdit').value; 
        dispositivos[index].importancia = parseInt(document.getElementById('importanciaDispositivoEdit').value); 
        dispositivos[index].consumo = parseFloat(document.getElementById('consumoDispositivoEdit').value); 
    } 
    salvarDadosDoUsuario(); 
    atualizarLista(); 
    // REMOVIDO: atualizarConsumoTotal() daqui, pois agora é na página de status.
    modalEdicao.style.display = 'none'; 
});

// Lida com a exclusão de um dispositivo
btnExcluirDispositivo.addEventListener('click', () => { 
    const id = document.getElementById('dispositivoIdEdit').value; 
    if (confirm('Tem certeza que deseja excluir este dispositivo?')) { 
        dispositivos = dispositivos.filter(d => d.id != id); 
        salvarDadosDoUsuario(); 
        atualizarLista(); 
        // REMOVIDO: atualizarConsumoTotal() daqui, pois agora é na página de status.
        modalEdicao.style.display = 'none'; 
    } 
});

btnAbrirChatbot.addEventListener('click', () => {
    window.location.href = 'chatbot.html';
});

// NOVO: Event listener para o botão de ver status de energia
btnVerStatusEnergia.addEventListener('click', () => {
    window.location.href = 'status_energia.html';
});

// ===================================================================================
// SEÇÃO 6: INICIALIZAÇÃO DA PÁGINA
// ===================================================================================
    
carregarDadosDoUsuario();
// REMOVIDO: setInterval(simularBateria, 2000) movido para status_energia.js
setInterval(atualizarRelogio, 1000);
buscarClima();