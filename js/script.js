/* ConvertePro — conversor de moedas e unidades. As tabelas ficam em js/unidades.js */

const $ = (s) => document.querySelector(s);
const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const API_COTACAO = 'https://open.er-api.com/v6/latest/USD';

const banco = {
  ler(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  salvar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } }
};

const estado = { cat: banco.ler('convertepro_cat', 'moeda'), ultimoEditado: 'de', fonteMoeda: 'referência offline' };
let historico = banco.ler('convertepro_hist', []);

/* ---------- Números em formato brasileiro ---------- */
function lerNumero(txt) {
  const limpo = String(txt).trim().replace(/\s/g, '');
  if (!limpo || limpo === '-') return NaN;
  // Aceita 1.234,56 e também 1234.56
  const n = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  return Number(n);
}
function formatar(n, cat) {
  if (!Number.isFinite(n)) return '';
  const casas = cat === 'moeda' ? 2 : Math.abs(n) >= 1000 ? 2 : Math.abs(n) >= 1 ? 4 : 6;
  return n.toLocaleString('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: cat === 'moeda' ? 2 : 0 });
}

/* ---------- Conversão ---------- */
function converter(valor, de, para, cat = estado.cat) {
  const c = CATEGORIAS[cat];
  const u1 = c.unidades[de], u2 = c.unidades[para];
  if (cat === 'temperatura') return u2.deBase(u1.paraBase(valor));
  if (cat === 'moeda') return (valor / u1.fator) * u2.fator; // fator = unidades por 1 dólar
  return (valor * u1.fator) / u2.fator;
}

function rotulo(cat, cod, n) {
  const u = CATEGORIAS[cat].unidades[cod];
  if (cat === 'moeda') return Math.abs(n) === 1 ? u.sing : u.plural;
  return `${u.nome.toLowerCase().replace(/ \(.*\)/, '')}${Math.abs(n) === 1 || cat === 'temperatura' ? '' : 's'}`.replace(/(ês)s$/, '$1es').replace(/(r)s$/, '$1es');
}

/* ---------- Interface ---------- */
function renderAbas() {
  $('#abas').innerHTML = Object.entries(CATEGORIAS).map(([id, c]) =>
    `<button class="aba ${id === estado.cat ? 'ativa' : ''}" role="tab" aria-selected="${id === estado.cat}" data-cat="${id}">${c.nome}</button>`).join('');
}

function preencherSelects() {
  const c = CATEGORIAS[estado.cat];
  const opcoes = Object.entries(c.unidades).map(([cod, u]) => `<option value="${cod}">${estado.cat === 'moeda' ? `${cod} · ${u.nome}` : u.nome}</option>`).join('');
  $('#unid-de').innerHTML = opcoes; $('#unid-para').innerHTML = opcoes;
  const salvo = banco.ler(`convertepro_par_${estado.cat}`, c.padrao);
  $('#unid-de').value = c.unidades[salvo[0]] ? salvo[0] : c.padrao[0];
  $('#unid-para').value = c.unidades[salvo[1]] ? salvo[1] : c.padrao[1];
}

function calcular() {
  const de = $('#unid-de').value, para = $('#unid-para').value, cat = estado.cat;
  const origem = estado.ultimoEditado === 'de' ? '#valor-de' : '#valor-para';
  const destino = estado.ultimoEditado === 'de' ? '#valor-para' : '#valor-de';
  const v = lerNumero($(origem).value);
  if (!Number.isFinite(v)) { $(destino).value = ''; $('#frase').textContent = 'Digite um número para converter.'; renderTabela(); return; }
  const r = estado.ultimoEditado === 'de' ? converter(v, de, para) : converter(v, para, de);
  $(destino).value = formatar(r, cat);

  const vDe = estado.ultimoEditado === 'de' ? v : r, vPara = estado.ultimoEditado === 'de' ? r : v;
  $('#frase').innerHTML = `<b>${formatar(vDe, cat)}</b> ${escapar(rotulo(cat, de, vDe))} = <b>${formatar(vPara, cat)}</b> ${escapar(rotulo(cat, para, vPara))}`;
  $('#fonte').textContent = cat === 'moeda' ? `Cotação: ${estado.fonteMoeda}. Valores apenas informativos.` : '';
  renderTabela();
  banco.salvar(`convertepro_par_${cat}`, [de, para]);
  registrarDepois(vDe, de, vPara, para);
}

function renderTabela() {
  const de = $('#unid-de').value, para = $('#unid-para').value, cat = estado.cat;
  $('#th-de').textContent = cat === 'moeda' ? de : CATEGORIAS[cat].unidades[de].nome;
  $('#th-para').textContent = cat === 'moeda' ? para : CATEGORIAS[cat].unidades[para].nome;
  const valores = cat === 'temperatura' ? [-10, 0, 10, 20, 25, 30, 37, 100] : [1, 5, 10, 25, 50, 100, 500, 1000];
  $('#tabela').innerHTML = valores.map((v) => `<tr><td>${formatar(v, cat)}</td><td class="num">${formatar(converter(v, de, para), cat)}</td></tr>`).join('');
}

// Histórico: registra depois que a pessoa para de digitar
let timerHist;
function registrarDepois(vDe, de, vPara, para) {
  clearTimeout(timerHist);
  timerHist = setTimeout(() => {
    const item = { cat: estado.cat, de, para, vDe, vPara, ts: Date.now() };
    const ultimo = historico[0];
    if (ultimo && ultimo.cat === item.cat && ultimo.de === de && ultimo.para === para && ultimo.vDe === vDe) return;
    historico = [item, ...historico].slice(0, 8);
    banco.salvar('convertepro_hist', historico); renderHistorico();
  }, 1200);
}
function renderHistorico() {
  $('#historico').innerHTML = historico.length ? historico.map((h, i) => `
    <li><button data-i="${i}"><span>${formatar(h.vDe, h.cat)} ${escapar(h.cat === 'moeda' ? h.de : h.de)} → <b>${formatar(h.vPara, h.cat)} ${escapar(h.para)}</b></span><small>${CATEGORIAS[h.cat].nome}</small></button></li>`).join('')
    : '<li class="vazio">Suas conversões aparecem aqui.</li>';
}
$('#historico').addEventListener('click', (e) => {
  const b = e.target.closest('[data-i]'); if (!b) return;
  const h = historico[Number(b.dataset.i)];
  trocarCategoria(h.cat, false);
  $('#unid-de').value = h.de; $('#unid-para').value = h.para;
  $('#valor-de').value = formatar(h.vDe, h.cat); estado.ultimoEditado = 'de'; calcular();
});
$('#limpar-hist').addEventListener('click', () => { historico = []; banco.salvar('convertepro_hist', historico); renderHistorico(); });

function trocarCategoria(cat, resetarValor = true) {
  estado.cat = cat; banco.salvar('convertepro_cat', cat);
  renderAbas(); preencherSelects();
  if (resetarValor) { $('#valor-de').value = cat === 'temperatura' ? '25' : '1'; estado.ultimoEditado = 'de'; }
  calcular();
}

$('#abas').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) trocarCategoria(b.dataset.cat); });
$('#valor-de').addEventListener('input', () => { estado.ultimoEditado = 'de'; calcular(); });
$('#valor-para').addEventListener('input', () => { estado.ultimoEditado = 'para'; calcular(); });
['#valor-de', '#valor-para'].forEach((id) => $(id).addEventListener('keypress', (e) => { if (!/[\d,.\-]/.test(e.key)) e.preventDefault(); }));
$('#unid-de').addEventListener('change', calcular);
$('#unid-para').addEventListener('change', calcular);
$('#trocar').addEventListener('click', () => {
  const d = $('#unid-de').value; $('#unid-de').value = $('#unid-para').value; $('#unid-para').value = d;
  $('#trocar').classList.remove('girar'); void $('#trocar').offsetWidth; $('#trocar').classList.add('girar');
  estado.ultimoEditado = 'de'; calcular();
});

/* ---------- Cotações atuais (com fallback) ---------- */
async function atualizarCotacoes() {
  const cache = banco.ler('convertepro_cotacoes', null);
  const aplicar = (rates, quando) => {
    Object.entries(CATEGORIAS.moeda.unidades).forEach(([cod, u]) => { if (rates[cod]) u.fator = rates[cod]; });
    estado.fonteMoeda = `atualizada em ${new Date(quando).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
  };
  if (cache && Date.now() - cache.ts < 6 * 3600e3) { aplicar(cache.rates, cache.ts); calcular(); return; }
  try {
    const r = await fetch(API_COTACAO);
    const dados = await r.json();
    if (dados.result !== 'success') throw new Error();
    banco.salvar('convertepro_cotacoes', { rates: dados.rates, ts: Date.now() });
    aplicar(dados.rates, Date.now());
  } catch {
    if (cache) aplicar(cache.rates, cache.ts);
    else estado.fonteMoeda = 'valores de referência (sem conexão com o serviço de cotação)';
  }
  if (estado.cat === 'moeda') calcular();
}

renderHistorico();
trocarCategoria(CATEGORIAS[estado.cat] ? estado.cat : 'moeda');
atualizarCotacoes();
