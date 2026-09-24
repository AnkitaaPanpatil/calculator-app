import { useMemo, useState } from 'react';

const buttons = [
  ['(', '(', 'secondary'], [')', ')', 'secondary'], ['mc', 'mc', 'secondary'], ['m+', 'm+', 'secondary'], ['mr', 'mr', 'secondary'],
  ['sin', 'sin(', 'function'], ['cos', 'cos(', 'function'], ['tan', 'tan(', 'function'], ['ln', 'ln(', 'function'], ['log', 'log10(', 'function'],
  ['sin⁻¹', 'asin(', 'function'], ['cos⁻¹', 'acos(', 'function'], ['tan⁻¹', 'atan(', 'function'], ['√', 'sqrt(', 'function'], ['x²', '^2', 'function'],
  ['7', '7', 'number'], ['8', '8', 'number'], ['9', '9', 'number'], ['÷', '/', 'operator'], ['⌫', 'backspace', 'secondary'],
  ['4', '4', 'number'], ['5', '5', 'number'], ['6', '6', 'number'], ['×', '*', 'operator'], ['C', 'clear', 'danger'],
  ['1', '1', 'number'], ['2', '2', 'number'], ['3', '3', 'number'], ['−', '-', 'operator'], ['π', 'pi', 'constant'],
  ['0', '0', 'number wide'], ['.', '.', 'number'], ['+', '+', 'operator'], ['=', 'equals', 'equals'],
];

const formatResult = (value) => {
  if (!Number.isFinite(value)) return 'Error';
  return String(Number(value.toPrecision(12)));
};

function evaluate(expression, degrees) {
  let source = expression
    .replaceAll('π', 'Math.PI')
    .replaceAll('^', '**')
    .replaceAll('sqrt(', 'Math.sqrt(')
    .replaceAll('ln(', 'Math.log(')
    .replaceAll('log10(', 'Math.log10(');

  const trig = degrees
    ? { sin: (x) => Math.sin(x * Math.PI / 180), cos: (x) => Math.cos(x * Math.PI / 180), tan: (x) => Math.tan(x * Math.PI / 180), asin: (x) => Math.asin(x) * 180 / Math.PI, acos: (x) => Math.acos(x) * 180 / Math.PI, atan: (x) => Math.atan(x) * 180 / Math.PI }
    : { sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan };
  source = source.replaceAll('sin(', 'trig.sin(').replaceAll('cos(', 'trig.cos(').replaceAll('tan(', 'trig.tan(').replaceAll('asin(', 'trig.asin(').replaceAll('acos(', 'trig.acos(').replaceAll('atan(', 'trig.atan(');

  if (!/^[0-9+*/%().,\sA-Za-z_\-]*$/.test(source)) throw new Error('Invalid expression');
  // Expressions are assembled only from the calculator buttons above.
  return Function('trig', `"use strict"; return (${source})`)(trig);
}

export default function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [degrees, setDegrees] = useState(false);
  const [dark, setDark] = useState(true);
  const [memory, setMemory] = useState(0);

  const display = useMemo(() => expression || result, [expression, result]);

  const press = (value) => {
    if (value === 'clear') return setExpression('');
    if (value === 'backspace') return setExpression((current) => current.slice(0, -1));
    if (value === 'equals') {
      try { setResult(formatResult(evaluate(expression || result, degrees))); setExpression(''); }
      catch { setResult('Error'); setExpression(''); }
      return;
    }
    if (value === 'mc') return setMemory(0);
    if (value === 'm+') return setMemory((current) => current + Number(result || 0));
    if (value === 'mr') return setExpression((current) => current + String(memory));
    if (result === 'Error') setResult('0');
    setExpression((current) => current + value);
  };

  return (
    <main className={dark ? 'app dark' : 'app'}>
      <section className="calculator" aria-label="Scientific calculator">
        <header>
          <div><p className="eyebrow">REACT CALCULATOR</p><h1>Scientific</h1></div>
          <button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? '☀' : '☾'}</button>
        </header>
        <div className="display-wrap">
          <div className="expression">{expression || 'Ready'}</div>
          <div className="display" aria-live="polite">{display}</div>
        </div>
        <div className="toolbar"><button className={degrees ? 'active' : ''} onClick={() => setDegrees(!degrees)}>{degrees ? 'DEG' : 'RAD'}</button><span>Memory: {memory}</span></div>
        <div className="keypad">
          {buttons.map(([label, value, kind]) => <button key={label} className={`key ${kind}`} onClick={() => press(value)}>{label}</button>)}
        </div>
        <p className="hint">Tip: use parentheses for complex expressions.</p>
      </section>
    </main>
  );
}
