// --- 1. LÓGICA DO MODAL (SETUP INICIAL) ---

function abrirModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
}

function confirmarConfiguracao() {
    const periodo = document.querySelector('input[name="periodo"]:checked').value;
    const modalidade = document.querySelector('input[name="modalidade"]:checked').value;

    let percentualSugerido = 0;
    if (modalidade === '2') { // Medicina
        percentualSugerido = (periodo === '2') ? 15 : 10;
    } else { // Outros Cursos
        percentualSugerido = (periodo === '2') ? 10 : 5;
    }

    // Preenche o campo formatado para o padrão brasileiro
    document.getElementById('percentualAntecipacao').value = percentualSugerido.toString().replace('.', ',');
    
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('setup-section').style.display = 'none';
    document.getElementById('calculator-form').style.display = 'block';
}

// --- FUNÇÃO AUXILIAR: TRATA VÍRGULA E PONTO DO INPUT BRASILEIRO ---
function parseInput(val) {
    if (!val) return 0; // Se o campo estiver vazio, retorna 0
    // Remove pontos (separadores de milhar) e troca a vírgula por ponto
    let strVal = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(strVal);
}

// --- 2. LÓGICA DA CALCULADORA ---
function calcularAntecipacao() {
    const valorIntegral = parseInput(document.getElementById('valorIntegral').value);
    const bolsa1 = parseInput(document.getElementById('bolsa1').value);
    const bolsa2 = parseInput(document.getElementById('bolsa2').value);
    const bolsa3 = parseInput(document.getElementById('bolsa3').value);
    const bolsa4 = parseInput(document.getElementById('bolsa4').value);
    
    const qtdParcelas = parseInt(document.getElementById('qtdParcelas').value);
    const valorExcepcional = parseInput(document.getElementById('valorExcepcional').value);
    let percAntecipacao = parseInput(document.getElementById('percentualAntecipacao').value);
    
    const resultadoDiv = document.getElementById('conteudoResultado');

    if (isNaN(valorIntegral) || isNaN(qtdParcelas)) {
        resultadoDiv.innerHTML = `<div class="result-block error"><p>Por favor, preencha o Valor Integral e a Quantidade de Parcelas.</p></div>`;
        document.getElementById('resultModalOverlay').style.display = 'flex';
        return;
    }

    let avisoDesconto = '';
    if (qtdParcelas >= 2 && qtdParcelas <= 4) {
        percAntecipacao = 0;
        avisoDesconto = `<div class="result-block warning" style="margin-bottom: 15px;"><p>⚠️ Antecipação de 2 a 4 mensalidades não é elegível para o desconto de antecipação.</p></div>`;
    }

    // 1. Cascata de Bolsas
    let valorComBolsa = valorIntegral * (1 - bolsa1 / 100);
    valorComBolsa = valorComBolsa * (1 - bolsa2 / 100);
    valorComBolsa = valorComBolsa * (1 - bolsa3 / 100);
    const valorMensalFinal = valorComBolsa * (1 - bolsa4 / 100);

    // 2. Lógica do Valor Bruto (Com ou Sem Exceção)
    let valorTotalBruto = 0;
    if (valorExcepcional > 0) {
        // Multiplica a base apenas pelos meses restantes e soma o boleto diferente
        valorTotalBruto = (valorMensalFinal * (qtdParcelas - 1)) + valorExcepcional;
    } else {
        // Multiplicação linear normal
        valorTotalBruto = valorMensalFinal * qtdParcelas;
    }
    
    // 3. Aplicação do desconto em cima do Valor Bruto já calculado
    const valorDescontoAntecipacao = valorTotalBruto * (percAntecipacao / 100);
    const valorTotalPago = valorTotalBruto - valorDescontoAntecipacao;
    
    // 4. Nova variável somando exatamente os dois créditos que vão para o sistema
    const valorTotalCreditos = valorTotalPago + valorDescontoAntecipacao;

    const formatarBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // --- IMPRESSÃO NO POP-UP ---
    resultadoDiv.innerHTML = `
        ${avisoDesconto}

        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 250px;">
                <div class="result-block summary" style="background-color: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-top: 0;">
                    <h3 style="color: #ffffff; text-align: center; margin-bottom: 10px;">Carnê Especial Gerado</h3>
                    <p>O valor total pago pelo aluno: <br><strong style="color: #1abc9c; font-size: 1.4em;">${formatarBRL(valorTotalPago)}</strong></p>
                </div>
                <p style="font-size: 0.85em; color: rgba(255, 255, 255, 0.6); margin-top: 15px; text-align: center;">* Lembre-se de inserir as ocorrências com o protocolo.</p>
            </div>
            
            <div style="flex: 1.2; min-width: 300px;">
                
                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #00bfff;">
                    <h3 style="margin-bottom: 15px; color: #00bfff; text-align: center; font-size: 1.1em; margin-top: 0;">Lançamento de Créditos (SIA)</h3>
                    <p style="font-size: 0.9em; margin-bottom: 5px; color: #ffffff;"><strong>Passo 1:</strong> 1º Lançamento do crédito por pagamento antecipado</p>
                    <p style="color: #ffffff;">Valor (Referente ao Boleto): <strong>${formatarBRL(valorTotalPago)}</strong></p>
                    <p style="font-size: 0.8em; color: rgba(255, 255, 255, 0.6); margin-top: 5px;">Motivo: Pagamento Antecipado (período/curso)</p>
                </div>

                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border-left: 3px solid #00bfff;">
                    <p style="font-size: 0.9em; margin-bottom: 5px; color: #ffffff;"><strong>Passo 2:</strong> 2º Lançamento do crédito de desconto por antecipação (${percAntecipacao.toString().replace('.', ',')}%)</p>
                    <p style="color: #ffffff;">Valor (Diferença do desconto): <strong>${formatarBRL(valorDescontoAntecipacao)}</strong></p>
                    <p style="font-size: 0.8em; color: rgba(255, 255, 255, 0.6); margin-top: 5px;">Motivo: Pagamento Antecipado (período/curso)</p>
                </div>
            </div>
        </div>

        <div style="margin-top: 20px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 6px; border-left: 3px solid #1abc9c;">
            <h4 style="color: #1abc9c; text-align: center; margin-bottom: 10px; font-size: 1em;">Resolução:</h4>
            <p style="color: #ffffff; font-size: 0.9em; line-height: 1.5; margin-bottom: 10px;">
                O carnê de antecipação foi gerado no valor de <strong>${formatarBRL(valorTotalPago)}</strong>, com o desconto de <strong>${percAntecipacao.toString().replace('.', ',')}%</strong> aplicado, conforme solicitado.
            </p>
            <p style="color: #ffffff; font-size: 0.9em; line-height: 1.5; margin-bottom: 10px;">
                Após a compensação do pagamento no SIA, será lançado um crédito de <strong>${formatarBRL(valorTotalPago)}</strong> e o desconto de <strong>${formatarBRL(valorDescontoAntecipacao)}</strong>, referente à diferença da porcentagem de <strong>${percAntecipacao.toString().replace('.', ',')}%</strong>, totalizando <strong>${formatarBRL(valorTotalCreditos)}</strong>.
            </p>
            <p style="color: #ffffff; font-size: 0.9em; line-height: 1.5;">
                Esse valor será utilizado para quitar integralmente as mensalidades do semestre antecipado, deixando-as zeradas.
            </p>
        </div>
    `;

    // Exibe o pop-up de resultado
    document.getElementById('resultModalOverlay').style.display = 'flex';
}

// Função para fechar o pop-up de resultado
function fecharModalResultado() {
    document.getElementById('resultModalOverlay').style.display = 'none';
}

// Função do Botão Limpar Tudo (reseta formulário e volta à tela inicial)
function limparTudo() {
    document.getElementById('calculator-form').reset();
    document.getElementById('calculator-form').style.display = 'none';
    document.getElementById('setup-section').style.display = 'block';
}

document.addEventListener('keydown', function(event) {
    const modalResultado = document.getElementById('resultModalOverlay');
    
    // Verifica se o pop-up de resultado está visível na tela
    if (modalResultado.style.display === 'flex') {
        if (event.key === 'Escape' || event.key === 'Esc' || event.key === 'Enter') {
            // Evita que o Enter acione acidentalmente outros botões por trás do modal
            event.preventDefault(); 
            fecharModalResultado();
        }
    }
});
