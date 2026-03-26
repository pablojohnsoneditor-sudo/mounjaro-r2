import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, ChevronDown, ArrowRight, Lock, ShieldCheck, CreditCard, Star, X } from 'lucide-react';

const CHECKOUT_URL = 'https://checkout.payt.com.br/6c16697d18ed7342b23a0b7245c31d5b';

interface QuizState {
  nome: string;
  faixa_idade: string;
  kg_perder: number;
  tipo_corpo: string;
  areas_gordura: string[];
  impacto_peso: string;
  felicidade: string;
  impedimento: string;
  beneficios: string[];
  peso_atual: number;
  altura: number;
  peso_desejado: number;
  rotina: string;
  sono: string;
  agua: string;
  corpo_sonho: string;
}

const INITIAL: QuizState = {
  nome: '', faixa_idade: '', kg_perder: 10, tipo_corpo: '',
  areas_gordura: [], impacto_peso: '', felicidade: '', impedimento: '',
  beneficios: [], peso_atual: 75, altura: 160, peso_desejado: 65,
  rotina: '', sono: '', agua: '', corpo_sonho: '',
};

const track = (ev: string) => {
  if ((window as any).clarity) (window as any).clarity('event', ev);
};

const calcIMC = (p: number, a: number) => parseFloat((p / Math.pow(a / 100, 2)).toFixed(1));

const imcCat = (imc: number) => {
  if (imc < 18.5) return { label: 'Abaixo do peso', color: '#3b82f6', pos: 5 };
  if (imc < 25)   return { label: 'Normal',         color: '#16a34a', pos: 30 };
  if (imc < 30)   return { label: 'Sobrepeso',      color: '#f59e0b', pos: 55 };
  if (imc < 35)   return { label: 'Obesidade I',    color: '#ef4444', pos: 75 };
  return               { label: 'Obesidade II+',    color: '#991b1b', pos: 90 };
};

const ProgressBar = ({ step, total }: { step: number; total: number }) => (
  <div className="w-full mb-4">
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-green-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.round((step / total) * 100)}%` }} />
    </div>
  </div>
);

// ── STEP 1: Idade ──────────────────────────────────────────────────────────
const StepIdade = ({ onNext }: { onNext: (v: string) => void }) => {
  const opts = [
    { label: '18 – 27 anos', img: 'https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/IDADE1.webp', value: '18-27' },
    { label: '28 – 39 anos', img: 'https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/IDADE2.webp', value: '28-39' },
    { label: '40 – 54 anos', img: 'https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/IDADE3.webp', value: '40-54' },
    { label: '55 anos ou mais', img: 'https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/IDADE4.webp', value: '55+' },
  ];
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Qual é a sua <span className="text-green-600">faixa de idade?</span></h1>
        <p className="text-sm text-gray-500">Isso nos ajuda a personalizar sua receita</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => onNext(o.value)}
            className="relative overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all">
            <img src={o.img} alt={o.label} className="w-full aspect-[3/4] object-cover" loading="lazy" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <span className="text-white font-bold text-sm">{o.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STEP 2: Kg perder ──────────────────────────────────────────────────────
const StepKg = ({ value, onNext }: { value: number; onNext: (v: number) => void }) => {
  const [kg, setKg] = useState(value);
  return (
    <div className="flex flex-col space-y-6 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Quantos <span className="text-green-600">kg quer perder?</span></h1>
        <p className="text-sm text-gray-500">Seja honesta — vamos criar seu plano personalizado</p>
      </div>
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="text-7xl font-black text-green-600 leading-none">{kg}<span className="text-2xl text-gray-400 ml-1">kg</span></div>
        <div className="flex space-x-2">
          {[-5,-1,+1,+5].map(d => (
            <button key={d} onClick={() => setKg(p => Math.max(1, Math.min(80, p + d)))}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-green-50 font-bold text-gray-700 transition-all">
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onNext(kg)} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all">
        Continuar
      </button>
    </div>
  );
};

// ── STEP 3: Tipo de corpo ──────────────────────────────────────────────────
const StepCorpo = ({ onNext }: { onNext: (v: string) => void }) => {
  const opts = [
    { label: 'Regular',    sublabel: 'Peso próximo do ideal',      emoji: '🟡', value: 'regular' },
    { label: 'Flácida',    sublabel: 'Perdi tônus muscular',       emoji: '🟠', value: 'flacida' },
    { label: 'Sobrepeso',  sublabel: 'Acima do peso ideal',        emoji: '🔴', value: 'sobrepeso' },
    { label: 'Obesidade',  sublabel: 'Preciso de suporte extra',   emoji: '🔴', value: 'obesidade' },
  ];
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Como você classificaria seu <span className="text-green-600">tipo de corpo?</span></h1>
        <p className="text-sm text-gray-500">Seja sincera para um resultado mais preciso</p>
      </div>
      <div className="grid gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => onNext(o.value)}
            className="flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-left">
            <span className="text-2xl mr-3">{o.emoji}</span>
            <div className="flex-1">
              <div className="font-bold text-gray-900">{o.label}</div>
              <div className="text-xs text-gray-500">{o.sublabel}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STEP 4: Áreas ──────────────────────────────────────────────────────────
const StepAreas = ({ onNext }: { onNext: (v: string[]) => void }) => {
  const [sel, setSel] = useState<string[]>([]);
  const opts = [
    { label: 'Barriga',    emoji: '👆', value: 'barriga' },
    { label: 'Coxas',      emoji: '🦵', value: 'coxas' },
    { label: 'Braços',     emoji: '💪', value: 'bracos' },
    { label: 'Glúteos',    emoji: '🍑', value: 'gluteos' },
    { label: 'Cintura',    emoji: '⬇️', value: 'cintura' },
    { label: 'Corpo todo', emoji: '🌟', value: 'corpo_todo' },
  ];
  const toggle = (v: string) => setSel(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Onde você mais quer <span className="text-green-600">reduzir gordura?</span></h1>
        <p className="text-sm text-gray-500">Selecione todas as áreas desejadas</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => toggle(o.value)}
            className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${sel.includes(o.value) ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}>
            <span className="text-xl mr-2">{o.emoji}</span>
            <span className="font-bold text-sm text-gray-800 flex-1">{o.label}</span>
            {sel.includes(o.value) && <Check className="w-4 h-4 text-green-600" />}
          </button>
        ))}
      </div>
      <button disabled={sel.length === 0} onClick={() => onNext(sel)}
        className="w-full bg-green-600 disabled:bg-gray-200 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:bg-green-700">
        Continuar
      </button>
    </div>
  );
};

// ── STEP 5: Nome ───────────────────────────────────────────────────────────
const StepNome = ({ onNext }: { onNext: (v: string) => void }) => {
  const [nome, setNome] = useState('');
  return (
    <div className="flex flex-col space-y-6 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Qual é o seu <span className="text-green-600">nome?</span></h1>
        <p className="text-sm text-gray-500">Para personalizar sua receita exclusiva</p>
      </div>
      <input type="text" value={nome} onChange={e => setNome(e.target.value)}
        placeholder="Digite seu primeiro nome" autoFocus
        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all text-gray-800 font-medium" />
      <button disabled={!nome.trim()} onClick={() => onNext(nome.trim())}
        className="w-full bg-green-600 disabled:bg-gray-200 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:bg-green-700">
        Continuar
      </button>
    </div>
  );
};

// ── STEP 6: Impacto ────────────────────────────────────────────────────────
const StepImpacto = ({ nome, onNext }: { nome: string; onNext: (v: string) => void }) => {
  const opts = [
    { label: 'Me sinto envergonhada com meu corpo',  emoji: '😔', value: 'vergonha' },
    { label: 'Afeta minha saúde e energia',          emoji: '😓', value: 'saude' },
    { label: 'Prejudica meus relacionamentos',       emoji: '💔', value: 'relac' },
    { label: 'Atrapalha minha rotina diária',        emoji: '😣', value: 'rotina' },
  ];
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900"><span className="text-green-600">{nome}</span>, como o peso <span className="text-green-600">impacta sua vida?</span></h1>
        <p className="text-sm text-gray-500">Escolha o que mais te afeta</p>
      </div>
      <div className="grid gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => onNext(o.value)}
            className="flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-left">
            <span className="text-2xl mr-3">{o.emoji}</span>
            <div className="flex-1 font-medium text-gray-800">{o.label}</div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STEP 7: Felicidade ─────────────────────────────────────────────────────
const StepFelicidade = ({ onNext }: { onNext: (v: string) => void }) => {
  const opts = [
    { label: 'Muito insatisfeita', emoji: '😢', value: 'muito_insatisfeita' },
    { label: 'Insatisfeita',       emoji: '😕', value: 'insatisfeita' },
    { label: 'Mais ou menos',      emoji: '😐', value: 'neutro' },
    { label: 'Satisfeita',         emoji: '🙂', value: 'satisfeita' },
  ];
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Como você está com sua <span className="text-green-600">aparência atual?</span></h1>
        <p className="text-sm text-gray-500">Seja honesta, ninguém vai julgar você aqui</p>
      </div>
      <div className="grid gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => onNext(o.value)}
            className="flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left">
            <span className="text-2xl mr-3">{o.emoji}</span>
            <div className="flex-1 font-medium text-gray-800">{o.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STEP 8: Impedimento ────────────────────────────────────────────────────
const StepImpedimento = ({ onNext }: { onNext: (v: string) => void }) => {
  const opts = [
    { label: 'Fome e ansiedade por comida',    emoji: '🍔', value: 'fome' },
    { label: 'Metabolismo lento',              emoji: '🐢', value: 'metabolismo' },
    { label: 'Falta de tempo para se cuidar',  emoji: '⏰', value: 'tempo' },
    { label: 'Tentei tudo e nada funciona',    emoji: '😤', value: 'tentei_tudo' },
  ];
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">O que mais <span className="text-green-600">te impede</span> de emagrecer?</h1>
        <p className="text-sm text-gray-500">Vamos resolver isso juntas</p>
      </div>
      <div className="grid gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => onNext(o.value)}
            className="flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-left">
            <span className="text-2xl mr-3">{o.emoji}</span>
            <div className="flex-1 font-medium text-gray-800">{o.label}</div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-600" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STEP 9: Explicação ─────────────────────────────────────────────────────
const StepExplicacao = ({ nome, onNext }: { nome: string; onNext: () => void }) => (
  <div className="flex flex-col space-y-5 fade-in">
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-bold text-gray-900">Ótimo, <span className="text-green-600">{nome}</span>!<br />Veja como funciona 🎉</h1>
    </div>
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
      <p className="text-sm font-bold text-green-800 text-center mb-2">Como funciona o Mounjaro de R$2?</p>
      <p className="text-sm text-gray-700 leading-relaxed">
        O <strong>Mounjaro de R$2</strong> é uma receita natural feita com ingredientes simples que você encontra em qualquer mercado por menos de R$2. Ela ativa o hormônio <strong>GLP-1</strong> — o mesmo responsável pelo efeito do Mounjaro original — de forma 100% natural e segura.
      </p>
    </div>
    <div className="space-y-3">
      {[
        { n: '1', t: 'Prepare em casa',      d: 'Ingredientes simples, menos de R$2' },
        { n: '2', t: 'Tome 2x ao dia',       d: 'Manhã e noite, em menos de 2 minutos' },
        { n: '3', t: 'Resultados em dias',   d: 'Desinche nos primeiros 3 a 5 dias' },
      ].map(i => (
        <div key={i.n} className="flex items-center bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-black text-sm mr-3 shrink-0">{i.n}</div>
          <div>
            <div className="font-bold text-gray-900 text-sm">{i.t}</div>
            <div className="text-xs text-gray-500">{i.d}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
      <p className="text-xs text-yellow-800 font-bold">💡 Ativa o GLP-1 — o mesmo hormônio do Mounjaro original — de forma natural e sem efeitos colaterais!</p>
    </div>
    <button onClick={onNext} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all">
      Entendi! Continuar 🚀
    </button>
  </div>
);

// ── STEP 10: Benefícios ────────────────────────────────────────────────────
const StepBeneficios = ({ onNext }: { onNext: (v: string[]) => void }) => {
  const [sel, setSel] = useState<string[]>([]);
  const opts = [
    { label: 'Emagrecer sem esforço e sem efeito sanfona', value: 'emagrecer' },
    { label: 'Sono mais profundo',                         value: 'sono' },
    { label: 'Mais energia e disposição ao longo do dia',  value: 'energia' },
    { label: 'Aumento da autoestima e confiança',          value: 'autoestima' },
    { label: 'Redução do estresse e ansiedade',            value: 'estresse' },
  ];
  const toggle = (v: string) => setSel(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Quais <span className="text-green-600">benefícios</span> você gostaria de ter?</h1>
        <p className="text-sm text-gray-500">Vamos personalizar a sua fórmula para maximizar os resultados</p>
      </div>
      <div className="grid gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => toggle(o.value)}
            className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${sel.includes(o.value) ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}>
            <span className="text-xl mr-3">👉</span>
            <div className="flex-1 font-medium text-gray-800">{o.label}</div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${sel.includes(o.value) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
              {sel.includes(o.value) && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>
        ))}
      </div>
      <button disabled={sel.length === 0} onClick={() => onNext(sel)}
        className="w-full bg-green-600 disabled:bg-gray-200 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:bg-green-700">
        Continuar
      </button>
    </div>
  );
};

// ── STEP 11: Depoimento ────────────────────────────────────────────────────
const StepDepoimento = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col space-y-5 fade-in">
    <div className="text-center space-y-1">
      <h1 className="text-2xl font-bold text-gray-900">🔥 Histórias Reais de <span className="text-green-600">Transformação!</span></h1>
      <p className="text-sm text-gray-500">📍 Depoimento: Fernanda – Porto Alegre-RS</p>
    </div>
    <img src="https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/ANTESDEPOIS.webp"
      alt="Antes e depois" className="w-full rounded-2xl shadow-md object-cover" loading="lazy" />
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
      <div className="flex items-center space-x-3">
        <img src="https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/AeD1.webp"
          alt="Fernanda" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <div className="font-bold text-gray-900 text-sm">Fernanda Oliveira</div>
          <div className="text-xs text-gray-500">Porto Alegre, RS</div>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">"Eu já tinha tentado de tudo para emagrecer. Com o Mounjaro de R$2 perdi 11kg sem academia e sem dieta radical! Minha fome diminuiu naturalmente."</p>
      <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
    </div>
    <button onClick={onNext} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all">
      Continuar
    </button>
  </div>
);

// ── STEP 12: Peso atual ────────────────────────────────────────────────────
const StepPesoAtual = ({ value, onNext }: { value: number; onNext: (v: number) => void }) => {
  const [v, setV] = useState(value);
  return (
    <div className="flex flex-col space-y-6 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Qual é o seu <span className="text-green-600">peso atual?</span></h1>
        <p className="text-sm text-gray-500">Vamos ajustar seu plano de acordo com seu corpo</p>
      </div>
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="text-7xl font-black text-green-600">{v}<span className="text-2xl text-gray-400 ml-1">kg</span></div>
        <div className="flex space-x-2">
          {[-5,-1,+1,+5].map(d => (
            <button key={d} onClick={() => setV(p => Math.max(30, Math.min(200, p + d)))}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-green-50 font-bold text-gray-700 transition-all">
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onNext(v)} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all">
        Continuar
      </button>
    </div>
  );
};

// ── STEP 13: Altura ────────────────────────────────────────────────────────
const StepAltura = ({ value, onNext }: { value: number; onNext: (v: number) => void }) => {
  const [v, setV] = useState(value);
  return (
    <div className="flex flex-col space-y-6 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Qual é a sua <span className="text-green-600">altura?</span></h1>
        <p className="text-sm text-gray-500">Isso nos ajuda a calcular a quantidade ideal</p>
      </div>
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="text-7xl font-black text-green-600">{v}<span className="text-2xl text-gray-400 ml-1">cm</span></div>
        <div className="flex space-x-2">
          {[-5,-1,+1,+5].map(d => (
            <button key={d} onClick={() => setV(p => Math.max(140, Math.min(210, p + d)))}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-green-50 font-bold text-gray-700 transition-all">
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onNext(v)} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all">
        Continuar
      </button>
    </div>
  );
};

// ── STEP 14: Peso desejado ─────────────────────────────────────────────────
const StepPesoDesejado = ({ pesoAtual, value, onNext }: { pesoAtual: number; value: number; onNext: (v: number) => void }) => {
  const [v, setV] = useState(value);
  const meta = pesoAtual - v;
  return (
    <div className="flex flex-col space-y-6 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Qual é o seu <span className="text-green-600">peso objetivo?</span></h1>
        <p className="text-sm text-gray-500">Isso nos ajudará a personalizar um plano especificamente para você</p>
      </div>
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="text-7xl font-black text-green-600">{v}<span className="text-2xl text-gray-400 ml-1">kg</span></div>
        {meta > 0 && (
          <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold border border-green-200">
            🎯 Meta: perder {meta} kg
          </div>
        )}
        <div className="flex space-x-2">
          {[-5,-1,+1,+5].map(d => (
            <button key={d} onClick={() => setV(p => Math.max(30, Math.min(pesoAtual - 1, p + d)))}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-green-50 font-bold text-gray-700 transition-all">
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => onNext(v)} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all">
        Continuar
      </button>
    </div>
  );
};

// ── STEP 15: Rotina ────────────────────────────────────────────────────────
const StepRotina = ({ onNext }: { onNext: (v: string) => void }) => {
  const opts = [
    { label: 'Trabalho fora e tenho rotina agitada',     emoji: '😰', value: 'agitada' },
    { label: 'Trabalho em casa com rotina flexível',      emoji: '😏', value: 'flexivel' },
    { label: 'Fico em casa cuidando da família',          emoji: '👩‍👧', value: 'casa' },
    { label: 'Outro',                                    emoji: '😐', value: 'outro' },
  ];
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Como é o seu <span className="text-green-600">dia a dia?</span></h1>
        <p className="text-sm text-gray-500">Sua rotina diária também faz diferença!</p>
      </div>
      <div className="grid gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => onNext(o.value)}
            className="flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left">
            <span className="text-2xl mr-3">{o.emoji}</span>
            <div className="flex-1 font-medium text-gray-800">{o.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STEP 16: Sono ──────────────────────────────────────────────────────────
const StepSono = ({ onNext }: { onNext: (v: string) => void }) => {
  const opts = [
    { label: 'Menos de 5 horas',    emoji: '😩', value: 'menos5' },
    { label: 'Entre 5 e 7 horas',   emoji: '😏', value: '5a7' },
    { label: 'Entre 7 e 9 horas',   emoji: '😴', value: '7a9' },
    { label: 'Mais de 9 horas',     emoji: '😐', value: 'mais9' },
  ];
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Quantas <span className="text-green-600">horas de sono</span> por noite?</h1>
        <p className="text-sm text-gray-500">O sono impacta diretamente no emagrecimento!</p>
      </div>
      <div className="grid gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => onNext(o.value)}
            className="flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left">
            <span className="text-2xl mr-3">{o.emoji}</span>
            <div className="flex-1 font-medium text-gray-800">{o.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STEP 17: Água ──────────────────────────────────────────────────────────
const StepAgua = ({ onNext }: { onNext: (v: string) => void }) => {
  const opts = [
    { label: 'Bebo apenas café ou chá',  emoji: '☕', value: 'cafe' },
    { label: '1–2 copos por dia',        emoji: '💧', value: '1a2' },
    { label: '2–6 copos por dia',        emoji: '💧', value: '2a6' },
    { label: 'Mais de 6 copos',          emoji: '💧', value: 'mais6' },
  ];
  return (
    <div className="flex flex-col space-y-5 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Quantos <span className="text-green-600">copos de água</span> por dia?</h1>
        <p className="text-sm text-gray-500">A hidratação influencia na perda de peso.</p>
      </div>
      <div className="grid gap-3">
        {opts.map(o => (
          <button key={o.value} onClick={() => onNext(o.value)}
            className="flex items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left">
            <span className="text-2xl mr-3">{o.emoji}</span>
            <div className="flex-1 font-medium text-gray-800">{o.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── STEP 18: Loading ───────────────────────────────────────────────────────
const StepLoading = ({ nome, onNext }: { nome: string; onNext: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [slide, setSlide] = useState(0);
  const called = useRef(false);
  const slides = [
    { img: 'https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/ANTESDEPOIS.webp', caption: 'Ana perdeu 11kg em 4 semanas' },
    { img: 'https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/ANTESDEPOISTOPO.webp', caption: 'Carol eliminou 8kg sem academia' },
  ];
  useEffect(() => {
    const t = setInterval(() => setProgress(p => {
      if (p >= 100) { clearInterval(t); if (!called.current) { called.current = true; setTimeout(onNext, 600); } return 100; }
      return p + 1;
    }), 50);
    return () => clearInterval(t);
  }, [onNext]);
  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % slides.length), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center space-y-6 py-4 fade-in">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Aguarde <span className="text-green-600">{nome}</span>...</h1>
        <p className="text-sm text-gray-500">Preparando o seu Mounjaro de R$2 personalizado</p>
      </div>
      <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-lg">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={s.img} alt={s.caption} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-3">
              <p className="text-white text-xs font-bold">{s.caption}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs text-gray-400 font-bold uppercase">
          <span>Preparando seu plano</span><span>{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="text-xs text-gray-400 italic animate-pulse">Analisando suas respostas...</p>
    </div>
  );
};

// ── STEP 19: Resultado IMC ─────────────────────────────────────────────────
const StepResultado = ({ state, onNext }: { state: QuizState; onNext: () => void }) => {
  const imc = calcIMC(state.peso_atual, state.altura);
  const cat = imcCat(imc);
  const meta = state.peso_atual - state.peso_desejado;
  return (
    <div className="flex flex-col space-y-4 fade-in">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">
          <span className="text-green-600">{state.nome}</span>, veja como o <span className="text-green-600">Mounjaro de R$2</span> está transformando vidas!
        </h1>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Índice de Massa Corporal (IMC)</p>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Seu IMC: <strong style={{ color: cat.color }}>{imc}</strong></span>
          <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: cat.color }}>{cat.label}</span>
        </div>
        <div className="relative h-4 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 rounded-full mt-2">
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-gray-700 rounded-full shadow-md"
            style={{ left: `${Math.min(Math.max(cat.pos, 5), 95)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Abaixo</span><span>Normal</span><span>Sobrepeso</span>
        </div>
      </div>
      <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-1">
        <p className="text-xs font-bold text-gray-600 mb-2">🔔 Sinais de alerta identificados:</p>
        {['Metabolismo lento dificultando o emagrecimento.','Cansaço constante e sensação de inchaço.','Acúmulo de gordura em áreas específicas.'].map((a, i) => (
          <div key={i} className="flex items-start text-xs text-red-700">
            <X className="w-3 h-3 mr-1 mt-0.5 shrink-0 text-red-500" />{a}
          </div>
        ))}
      </div>
      <div className="bg-green-50 border border-green-100 rounded-xl p-3">
        <p className="text-sm font-bold text-green-800">✅ Com o Mounjaro de R$2, seu corpo acelera a queima de gordura naturalmente!</p>
        <p className="text-xs text-green-700 mt-1 font-bold">🎯 Meta calculada para você: perder {meta > 0 ? meta : state.kg_perder} kg</p>
      </div>
      <div className="rounded-2xl overflow-hidden shadow-md">
        <img src="https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/ANTESDEPOIS.webp" alt="Resultado" className="w-full" loading="lazy" />
        <div className="bg-white p-3 text-center border-t border-gray-100">
          <p className="font-bold text-sm text-gray-900">"Perdi 11kg em 4 semanas com o Mounjaro de R$2!"</p>
          <p className="text-xs text-gray-500">Carol, 34 anos – Belo Horizonte, MG</p>
          <div className="flex justify-center mt-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
        </div>
      </div>
      <button onClick={onNext} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all">
        Continuar
      </button>
    </div>
  );
};

// ── STEP 20: Corpo dos sonhos ──────────────────────────────────────────────
const StepCorpoSonho = ({ onNext }: { onNext: (v: string) => void }) => (
  <div className="flex flex-col space-y-5 fade-in">
    <div className="text-center space-y-1">
      <h1 className="text-xl font-bold text-gray-900">Qual o <span className="text-green-600">corpo</span> dos seus <span className="text-green-600">sonhos?</span></h1>
      <p className="text-sm text-gray-500 underline">Escolha a opção abaixo:</p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: 'Em Forma', value: 'em_forma', img: 'https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/FORMA.webp' },
        { label: 'Natural',  value: 'natural',  img: 'https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/MAGRA.webp' },
      ].map(o => (
        <button key={o.value} onClick={() => onNext(o.value)}
          className="relative overflow-hidden rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all">
          <img src={o.img} alt={o.label} className="w-full aspect-[3/4] object-cover" loading="lazy" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-3 text-center">
            <span className="text-white font-bold text-sm">{o.label}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ── STEP 21: Vendas ────────────────────────────────────────────────────────
const StepVendas = ({ state }: { state: QuizState }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [timer, setTimer] = useState(600);
  const meta = state.peso_atual - state.peso_desejado;

  useEffect(() => {
    if (timer <= 0) { setTimer(600); return; }
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const comprar = useCallback(() => {
    track('compra_clicada');
    window.open(CHECKOUT_URL, '_blank');
  }, []);

  const faq = [
    { q: 'O Mounjaro de R$2 realmente funciona?',      a: 'Sim! A receita foi desenvolvida para ativar o hormônio GLP-1 naturalmente, o mesmo princípio do Mounjaro original, mas 100% natural e acessível.' },
    { q: 'Quanto tempo leva para ver resultados?',      a: 'Muitas clientes relatam desincharço nos primeiros 3 a 5 dias. A perda de peso significativa ocorre entre a 2ª e 4ª semana.' },
    { q: 'É seguro? Tem efeitos colaterais?',           a: 'Totalmente seguro! Por ser baseado em ingredientes naturais e alimentos comuns, não possui efeitos colaterais.' },
    { q: 'Como vou receber a receita?',                 a: 'Imediatamente após a confirmação do pagamento, você receberá acesso completo ao protocolo por e-mail.' },
    { q: 'E se não funcionar para mim?',                a: 'Oferecemos 30 dias de garantia incondicional. Se não ver resultados, devolvemos cada centavo.' },
    { q: 'Preciso comprar ingredientes caros?',         a: 'Não! Todos os ingredientes custam menos de R$2 e são encontrados em qualquer mercadinho.' },
  ];

  return (
    <div className="flex flex-col space-y-6 pb-20 fade-in">
      <div className={`p-3 rounded-xl flex items-center justify-center text-xs font-bold ${timer < 60 ? 'bg-red-600 text-white animate-pulse' : 'bg-red-50 text-red-600'}`}>
        <span>⏰ Seu plano expira em: {fmt(timer)}</span>
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          <span className="text-green-600">{state.nome}</span>, está pronta para transformar seu corpo?
        </h2>
        <p className="text-sm text-gray-500 italic">"Plano exclusivo gerado uma única vez — não saia desta página!"</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
          <img src="https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/ANTESjpg" alt="Antes" className="w-full aspect-[3/4] object-cover" loading="lazy" />
          <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-[10px] font-bold px-2 py-1 rounded-full">Antes 🖼️</div>
        </div>
        <div className="relative rounded-2xl overflow-hidden border-2 border-green-500">
          <img src="https://gkaoozgpeeeympskbcxq.supabase.co/storage/v1/object/public/IMGs/DEPOIS.jpg" alt="Depois" className="w-full aspect-[3/4] object-cover" loading="lazy" />
          <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">Depois ⭐</div>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="text-center">
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Seu Plano Exclusivo</span>
          <h3 className="text-lg font-bold text-gray-900">Protocolo de 30 dias personalizado 🎯</h3>
        </div>
        <div className="space-y-2">
          {[
            { s: 'SEMANA 1 🌿', d: 'Desinche e primeiros resultados' },
            { s: 'SEMANA 2 🔥', d: 'Perda de até 3 kg' },
            { s: 'SEMANA 3 ⚡', d: 'Perda de 5 a 7 kg' },
            { s: 'SEMANA 4 🏆', d: `Meta: -${meta > 0 ? meta : state.kg_perder} kg atingida`, h: true },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${item.h ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
              <div>
                <span className={`text-[10px] font-black uppercase ${item.h ? 'text-green-600' : 'text-gray-400'}`}>{item.s}</span>
                <p className="text-sm font-bold text-gray-800">{item.d}</p>
              </div>
              {item.h && <span className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded">META</span>}
            </div>
          ))}
        </div>
      </div>
      <div id="checkout-section" className="bg-white border-2 border-green-500 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-green-600 text-white text-center py-2 text-xs font-bold uppercase tracking-widest">Seu Plano Exclusivo</div>
        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">Mounjaro de R$2 <span className="text-green-600">+ Protocolo Completo</span></p>
            <p className="text-xs text-gray-400 uppercase font-bold">ACESSO VITALÍCIO</p>
          </div>
          <div className="space-y-1.5">
            {['Receita completa do Mounjaro de R$2','Protocolo de 30 dias passo a passo','Lista completa dos ingredientes','Dicas para acelerar resultados','Acesso vitalício ao conteúdo','3 bônus exclusivos'].map((item, i) => (
              <div key={i} className="flex items-center text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 mr-2 shrink-0" />{item}
              </div>
            ))}
          </div>
          <div className="text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-400">De <span className="line-through">R$ 197,00</span> por apenas</p>
            <p className="text-[80px] font-black text-green-600 leading-none py-2">R$47</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Acesso Imediato e Vitalício</p>
          </div>
          <button onClick={comprar}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl text-xl uppercase transition-all hover:scale-105 active:scale-95">
            QUERO COMEÇAR AGORA
          </button>
          <div className="flex justify-center space-x-4 pt-2">
            <div className="flex items-center text-xs text-gray-400"><Lock className="w-3 h-3 mr-1" />Compra Segura</div>
            <div className="flex items-center text-xs text-gray-400"><ShieldCheck className="w-3 h-3 mr-1" />Garantia 30 dias</div>
            <div className="flex items-center text-xs text-gray-400"><CreditCard className="w-3 h-3 mr-1" />Pix ou Cartão</div>
          </div>
        </div>
      </div>
      <div className="bg-yellow-50 border-2 border-yellow-200 p-5 rounded-2xl space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-black text-white text-sm">30</div>
          <h4 className="font-bold text-gray-900">Garantia de Reembolso Total</h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">Confiamos tanto na receita que oferecemos 30 dias de garantia. Se não ver resultados, reembolsamos cada centavo. RISCO ZERO PARA VOCÊ!</p>
      </div>
      <button onClick={comprar}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl text-xl uppercase transition-all">
        QUERO COMEÇAR AGORA
      </button>
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 text-center">Quem Usa Tem Resultado 😍👇</h3>
        {[
          { n: 'Luana Dias',      c: 'Betim, MG',      t: 'Recomendo muito! Estou usando há 2 semanas e já perdi peso e desinchei bastante!' },
          { n: 'Andressa Soares', c: 'Piracaia, SP',    t: 'Tomando há 5 dias e os resultados já estão aparecendo! Simplesmente MARAVILHOSO 🤩' },
          { n: 'Beatriz Mattos',  c: 'São Paulo, SP',   t: 'Muito bom!! baratinho e funciona!' },
        ].map((d, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="font-bold text-gray-900 text-sm">{d.n}</div>
            <div className="text-xs text-gray-400 mb-2">{d.c}</div>
            <p className="text-sm text-gray-700">{d.t}</p>
            <div className="flex mt-2">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 text-center">Perguntas Frequentes ❓</h3>
        {faq.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between p-4 bg-white text-left">
              <span className="text-sm font-bold text-gray-800">{item.q}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && (
              <div className="p-4 bg-gray-50 text-xs text-gray-600 leading-relaxed border-t border-gray-100">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── MAIN CONTROLLER ────────────────────────────────────────────────────────
const TOTAL = 21;

export default function Quiz() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<QuizState>(INITIAL);
  const update = (p: Partial<QuizState>) => setState(prev => ({ ...prev, ...p }));
  const next = useCallback(() => {
    setStep(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const evMap: Record<number, string> = {
      1: 'quiz_iniciado', 5: 'nome_capturado', 6: 'dor_selecionada',
      12: 'peso_definido', 18: 'loading_iniciado', 19: 'resultado_visto',
      21: 'pagina_vendas_vista',
    };
    if (evMap[step]) track(evMap[step]);
  }, [step]);

  const render = () => {
    switch (step) {
      case 1:  return <StepIdade        onNext={v => { update({ faixa_idade: v }); next(); }} />;
      case 2:  return <StepKg           value={state.kg_perder}   onNext={v => { update({ kg_perder: v }); next(); }} />;
      case 3:  return <StepCorpo        onNext={v => { update({ tipo_corpo: v }); next(); }} />;
      case 4:  return <StepAreas        onNext={v => { update({ areas_gordura: v }); next(); }} />;
      case 5:  return <StepNome         onNext={v => { update({ nome: v }); next(); }} />;
      case 6:  return <StepImpacto      nome={state.nome} onNext={v => { update({ impacto_peso: v }); next(); }} />;
      case 7:  return <StepFelicidade   onNext={v => { update({ felicidade: v }); next(); }} />;
      case 8:  return <StepImpedimento  onNext={v => { update({ impedimento: v }); next(); }} />;
      case 9:  return <StepExplicacao   nome={state.nome} onNext={next} />;
      case 10: return <StepBeneficios   onNext={v => { update({ beneficios: v }); next(); }} />;
      case 11: return <StepDepoimento   onNext={next} />;
      case 12: return <StepPesoAtual    value={state.peso_atual}  onNext={v => { update({ peso_atual: v }); next(); }} />;
      case 13: return <StepAltura       value={state.altura}      onNext={v => { update({ altura: v }); next(); }} />;
      case 14: return <StepPesoDesejado pesoAtual={state.peso_atual} value={state.peso_desejado} onNext={v => { update({ peso_desejado: v }); next(); }} />;
      case 15: return <StepRotina       onNext={v => { update({ rotina: v }); next(); }} />;
      case 16: return <StepSono         onNext={v => { update({ sono: v }); next(); }} />;
      case 17: return <StepAgua         onNext={v => { update({ agua: v }); next(); }} />;
      case 18: return <StepLoading      nome={state.nome} onNext={next} />;
      case 19: return <StepResultado    state={state} onNext={next} />;
      case 20: return <StepCorpoSonho   onNext={v => { update({ corpo_sonho: v }); next(); }} />;
      case 21: return <StepVendas       state={state} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-white flex flex-col shadow-sm">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 pt-4 pb-3">
          <div className="flex justify-center mb-2">
            <div className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-black tracking-wide">
              🌿 MOUNJARO DE R$2
            </div>
          </div>
          {step < TOTAL && <ProgressBar step={step} total={TOTAL} />}
        </div>
        <div className="flex-1 px-5 py-5">{render()}</div>
      </div>
    </div>
  );
}
