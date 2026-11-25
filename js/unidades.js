/* Unidades do ConvertePro.
   Cada unidade tem um "fator" em relação à unidade base da categoria.
   Temperatura usa funções próprias (paraBase / deBase), porque não é proporcional. */

const CATEGORIAS = {
  moeda: {
    nome: 'Moedas', base: 'USD', padrao: ['USD', 'BRL'],
    // Cotações de referência (aproximadas) usadas se não for possível buscar as atuais.
    // Valor = quanto 1 dólar vale em cada moeda.
    unidades: {
      BRL: { nome: 'Real brasileiro', sing: 'real', plural: 'reais', fator: 5.40 },
      USD: { nome: 'Dólar americano', sing: 'dólar', plural: 'dólares', fator: 1 },
      EUR: { nome: 'Euro', sing: 'euro', plural: 'euros', fator: 0.92 },
      GBP: { nome: 'Libra esterlina', sing: 'libra', plural: 'libras', fator: 0.79 },
      JPY: { nome: 'Iene japonês', sing: 'iene', plural: 'ienes', fator: 150 },
      CAD: { nome: 'Dólar canadense', sing: 'dólar canadense', plural: 'dólares canadenses', fator: 1.38 },
      CHF: { nome: 'Franco suíço', sing: 'franco suíço', plural: 'francos suíços', fator: 0.88 },
      CNY: { nome: 'Yuan chinês', sing: 'yuan', plural: 'yuans', fator: 7.2 },
      ARS: { nome: 'Peso argentino', sing: 'peso argentino', plural: 'pesos argentinos', fator: 1000 }
    }
  },
  comprimento: {
    nome: 'Comprimento', base: 'm', padrao: ['km', 'mi'],
    unidades: {
      mm: { nome: 'Milímetro', fator: 0.001 }, cm: { nome: 'Centímetro', fator: 0.01 }, m: { nome: 'Metro', fator: 1 },
      km: { nome: 'Quilômetro', fator: 1000 }, in: { nome: 'Polegada', fator: 0.0254 }, ft: { nome: 'Pé', fator: 0.3048 },
      yd: { nome: 'Jarda', fator: 0.9144 }, mi: { nome: 'Milha', fator: 1609.344 }
    }
  },
  peso: {
    nome: 'Peso', base: 'kg', padrao: ['kg', 'lb'],
    unidades: {
      mg: { nome: 'Miligrama', fator: 1e-6 }, g: { nome: 'Grama', fator: 0.001 }, kg: { nome: 'Quilograma', fator: 1 },
      t: { nome: 'Tonelada', fator: 1000 }, oz: { nome: 'Onça', fator: 0.028349523125 }, lb: { nome: 'Libra', fator: 0.45359237 }
    }
  },
  temperatura: {
    nome: 'Temperatura', base: 'C', padrao: ['C', 'F'],
    unidades: {
      C: { nome: 'Celsius (°C)', paraBase: (v) => v, deBase: (v) => v },
      F: { nome: 'Fahrenheit (°F)', paraBase: (v) => (v - 32) * 5 / 9, deBase: (v) => v * 9 / 5 + 32 },
      K: { nome: 'Kelvin (K)', paraBase: (v) => v - 273.15, deBase: (v) => v + 273.15 }
    }
  },
  volume: {
    nome: 'Volume', base: 'l', padrao: ['l', 'gal'],
    unidades: {
      ml: { nome: 'Mililitro', fator: 0.001 }, l: { nome: 'Litro', fator: 1 }, m3: { nome: 'Metro cúbico', fator: 1000 },
      xic: { nome: 'Xícara (240 ml)', fator: 0.24 }, floz: { nome: 'Onça líquida (EUA)', fator: 0.0295735 }, gal: { nome: 'Galão (EUA)', fator: 3.785411784 }
    }
  },
  velocidade: {
    nome: 'Velocidade', base: 'ms', padrao: ['kmh', 'mph'],
    unidades: {
      ms: { nome: 'Metro por segundo', fator: 1 }, kmh: { nome: 'Quilômetro por hora', fator: 1 / 3.6 },
      mph: { nome: 'Milha por hora', fator: 0.44704 }, kn: { nome: 'Nó', fator: 0.514444 }
    }
  }
};
