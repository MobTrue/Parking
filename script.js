document.addEventListener('DOMContentLoaded', () => {
  carregarVeiculos();
});

function adicionarVeiculo() {
  const modelo = document.getElementById('modelo').value.trim();
  const placa = document.getElementById('placa').value.trim();
  const horaEntrada = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!modelo || !placa) {
    mostrarAlerta('Por favor, preencha todos os campos corretamente.');
    return;
  }

  const tabela = document.getElementById('listaVeiculos').getElementsByTagName('tbody')[0];

  for (let i = 0; i < tabela.rows.length; i++) {
    if (tabela.rows[i].cells[1].innerText === placa) {
      mostrarAlerta('Esta placa já está cadastrada.');
      return;
    }
  }

  const novaLinha = tabela.insertRow();
  const celModelo = novaLinha.insertCell(0);
  const celPlaca = novaLinha.insertCell(1);
  const celHoraEntrada = novaLinha.insertCell(2);
  const celHoraSaida = novaLinha.insertCell(3);
  const celTotal = novaLinha.insertCell(4);
  const celAcoes = novaLinha.insertCell(5);

  celModelo.textContent = modelo;
  celPlaca.textContent = placa;
  celHoraEntrada.textContent = horaEntrada;
  celHoraSaida.innerHTML = '<i class="fa fa-clock icon"></i>';
  celTotal.textContent = 'R$0,00';

  const divAcoes = document.createElement('div');
  divAcoes.classList.add('act-buttons');
  divAcoes.innerHTML = `
    <button onclick="removerVeiculo(this)"><i class="fa fa-unlock-alt icon"></i></button>
    <button onclick="aplicarDesconto(this)"><i class="fa fa-percent icon"></i></button>
    <button onclick="excluirVeiculo(this)"><i class="fa fa-trash icon"></i></button>
  `;

  celAcoes.appendChild(divAcoes);

  salvarVeiculo({ modelo, placa, horaEntrada });

  limparCampos();
}

function removerVeiculo(button) {
  const linha = button.closest('tr');
  const placa = linha.cells[1].innerText;
  const veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
  const veiculoIndex = veiculos.findIndex(veiculo => veiculo.placa === placa);

  if (veiculos[veiculoIndex].horaSaida) {
    mostrarAlerta('Este veículo já foi liberado.');
    return;
  }

  const horaEntrada = linha.cells[2].innerText;
  const horaSaida = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const totalHoras = calcularHoras(horaEntrada, horaSaida);
  const valorTotal = calcularValor(totalHoras);

  linha.cells[4].innerText = `R$${valorTotal.toFixed(2)}`;

  linha.cells[3].innerHTML = horaSaida;
  linha.classList.add('liberado');
  button.disabled = true;

  veiculos[veiculoIndex].horaSaida = horaSaida;
  veiculos[veiculoIndex].valorTotal = valorTotal;
  localStorage.setItem('veiculos', JSON.stringify(veiculos));

  moverParaFinalDaLista(linha);
}

function aplicarDesconto(button) {
  const linha = button.closest('tr');
  let valorTotal = parseFloat(linha.cells[4].innerText.replace('R$', '').replace(',', '.'));

  if (isNaN(valorTotal)) {
    mostrarAlerta('Calcule o valor total antes de aplicar o desconto.');
    return;
  }

  valorTotal = Math.max(valorTotal - 5, 0);
  linha.cells[4].innerText = `R$${valorTotal.toFixed(2)}`;
}

function excluirVeiculo(button) {
  const linha = button.closest('tr');
  const placa = linha.cells[1].innerText;

  linha.remove();

  const veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
  const novosVeiculos = veiculos.filter(veiculo => veiculo.placa !== placa);
  localStorage.setItem('veiculos', JSON.stringify(novosVeiculos));
}

function calcularHoras(horaEntrada, horaSaida) {
  const [horaE, minutoE] = horaEntrada.split(':').map(Number);
  const [horaS, minutoS] = horaSaida.split(':').map(Number);

  let horas = horaS - horaE;
  let minutos = minutoS - minutoE;

  if (minutos < 0) {
    minutos += 60;
    horas -= 1;
  }

  if (minutos > 5) {
    horas += 1;
  }

  return horas;
}

function calcularValor(horas) {
  return horas * 5;
}

function mostrarAlerta(mensagem) {
  const alerta = document.createElement('div');
  alerta.classList.add('alert');
  alerta.textContent = mensagem;
  document.body.appendChild(alerta);

  setTimeout(() => {
    alerta.classList.add('show');
  }, 10);

  setTimeout(() => {
    alerta.classList.remove('show');
    setTimeout(() => {
      alerta.remove();
    }, 500);
  }, 3000);
}

function salvarVeiculo(veiculo) {
  const veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
  veiculos.push(veiculo);
  localStorage.setItem('veiculos', JSON.stringify(veiculos));
}

function carregarVeiculos() {
  const veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
  const tabela = document.getElementById('listaVeiculos').getElementsByTagName('tbody')[0];

  veiculos.forEach(veiculo => {
    const novaLinha = tabela.insertRow();
    const celModelo = novaLinha.insertCell(0);
    const celPlaca = novaLinha.insertCell(1);
    const celHoraEntrada = novaLinha.insertCell(2);
    const celHoraSaida = novaLinha.insertCell(3);
    const celTotal = novaLinha.insertCell(4);
    const celAcoes = novaLinha.insertCell(5);

    celModelo.textContent = veiculo.modelo;
    celPlaca.textContent = veiculo.placa;
    celHoraEntrada.textContent = veiculo.horaEntrada;
    celHoraSaida.innerHTML = veiculo.horaSaida || '<i class="fa fa-clock icon"></i>';
    celTotal.textContent = veiculo.valorTotal ? `R$${veiculo.valorTotal.toFixed(2)}` : 'R$0,00';

    const divAcoes = document.createElement('div');
    divAcoes.classList.add('act-buttons');
    divAcoes.innerHTML = `
      <button onclick="removerVeiculo(this)" ${veiculo.horaSaida ? 'disabled' : ''}><i class="fa fa-unlock-alt icon"></i></button>
      <button onclick="aplicarDesconto(this)"><i class="fa fa-percent icon"></i></button>
      <button onclick="excluirVeiculo(this)"><i class="fa fa-trash icon"></i></button>
    `;

    celAcoes.appendChild(divAcoes);

    if (veiculo.horaSaida) {
      novaLinha.classList.add('liberado');
    }
  });
}

function limparCampos() {
  document.getElementById('modelo').value = '';
  document.getElementById('placa').value = '';
}

function moverParaFinalDaLista(linha) {
  const tabela = document.getElementById('listaVeiculos').getElementsByTagName('tbody')[0];
  tabela.appendChild(linha);

  linha.style.transition = 'transform 0.3s ease-in-out';
  linha.style.transform = 'translateY(100%)';

  setTimeout(() => {
    linha.style.transform = 'none';
  }, 300);
}