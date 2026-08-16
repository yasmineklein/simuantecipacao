// --- 1. LÓGICA DO MODAL (SETUP INICIAL) ---

function abrirModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
}

function confirmarConfiguracao() {

    const periodo = document.querySelector('input[name="periodo"]:checked').value;
    const modalidade = document.querySelector('input[name="modalidade"]:checked').value;

    let percentualSugerido = 0;
    if (modalidade === '2') { // Medicina
        percentualSugerido = (periodo === '2') ? 12 : 8;
    } else { // Outros Cursos
        percentualSugerido = (periodo === '2') ? 10 : 5;
    }

    
    document.getElementById('percentualAntecipacao').value = percentualSugerido;
    
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('setup-section').style.display = 'none';
    
    document.getElementById('calculator-form').style.display = 'block';
}


// --- 2. LÓGICA DA CALCULADORA ---
function calcularAntecipacao() {
    const valorIntegral = parseFloat(document.getElementById('valorIntegral').value);
    
    // Captura as 4 bolsas (assume 0 se o campo estiver vazio)
    const bolsa1 = parseFloat(document.getElementById('bolsa1').value) || 0;
    const bolsa2 = parseFloat(document.getElementById('bolsa2').value) || 0;
    const bolsa3 = parseFloat(document.getElementById('bolsa3').value) || 0;
    const bolsa4 = parseFloat(document.getElementById('bolsa4').value) || 0;
    
    const qtdParcelas = parseInt(document.getElementById('qtdParcelas').value);
    let percAntecipacao = parseFloat(document.getElementById('percentualAntecipacao').value) || 0;
    
    const resultadoDiv = document.getElementById('resultado');

    if (isNaN(valorIntegral) || isNaN(qtdParcelas)) {
        resultadoDiv.innerHTML = `<div class="result-block error"><p>Por favor, preencha o Valor Integral e a Quantidade de Parcelas.</p></div>`;
        return;
    }

    let avisoDesconto = '';
    // Regra: mínimo de 5 parcelas para aplicar o desconto de antecipação
    if (qtdParcelas < 5) {
        percAntecipacao = 0;
        avisoDesconto = `<div class="result-block warning"><p>⚠️ Desconto de antecipação não aplicado (necessário antecipar 5 ou mais parcelas).</p></div>`;
    }

    // Cálculo em cascata das bolsas
    const valorAposBolsa1 = valorIntegral * (1 - bolsa1 / 100);
    const valorAposBolsa2 = valorAposBolsa1 * (1 - bolsa2 / 100);
    const valorAposBolsa3 = valorAposBolsa2 * (1 - bolsa3 / 100);
    const valorMensalFinalBolsas = valorAposBolsa3 * (1 - bolsa4 / 100);

    // Valores totais brutos e desconto final de antecipação
    const valorTotalBruto = valorMensalFinalBolsas * qtdParcelas;
    const valorDescontoAntecipacao = valorTotalBruto * (percAntecipacao / 100);
    const valorTotalPago = valorTotalBruto - valorDescontoAntecipacao;

    // Cálculo do total das "Bolsas Incentivo/Opcionais" (Bolsas 2, 3 e 4)
    // Subtraímos o valor final mensal do valor após a 1ª bolsa
    const descontoMensalIncentivo = valorAposBolsa1 - valorMensalFinalBolsas;
    const valorTotalBolsaIncentivo = descontoMensalIncentivo * qtdParcelas;
    
    // Formatador de moeda BRL
    const formatarBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // --- IMPRESSÃO DOS RESULTADOS NA TELA ---
    resultadoDiv.innerHTML = `
        ${avisoDesconto}

        <div class="result-block summary">
            <h2 style="font-size: 1.2rem; color: rgb(24, 22, 22); text-align: center;"> Valor Final da Antecipação</h2>

            <p>O valor total pago pelo aluno: <strong>${formatarBRL(valorTotalPago)}</strong></p>
        </div>
        
        <div class="result-block breakdown">
            <h3 style="font-size: 1.3rem; color: rgb(24, 22, 22); text-align: center;"> Lançamento de Créditos no Financeiro</h3>

            <p>Crédito de antecipação de semestralidade: <strong>${formatarBRL(valorTotalPago)}</strong></p>
            <p>Crédito da Bolsa Incentivo: <strong>${formatarBRL(valorTotalBolsaIncentivo)}</strong></p>
            <p>Valor total do Desconto de Antecipação: <strong>${formatarBRL(valorDescontoAntecipacao)}</strong></p>
        </div>
    `;
}