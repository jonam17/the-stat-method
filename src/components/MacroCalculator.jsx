import { useState, useMemo, useRef, useEffect } from 'react';
import {
  selectBmr, tdee, calorieTarget, ACTIVITY,
  lbmFromBodyFat, bmi,
  recommendedPercent, recommendedGrams, resolveSplit, convertSplit,
  lbToKg, kgToLb, ftInToCm, cmToFtIn, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel } from './ToolShell.jsx';
import {
  ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY, GOALS, goalDelta,
  checkEnergyAvailability, checkWeightTarget, ageAccuracyNote,
} from '../engine/safety.js';

/**
 * Macro & calorie calculator island.
 * All maths lives in src/engine — this component only handles state and markup.
 */
export default function MacroCalculator({ compact = false }) {
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('178');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('maintain');   // F-028: proportional goals
  const [bodyfat, setBodyfat] = useState('');
  const [formula, setFormula] = useState('auto');
  const [mode, setMode] = useState('pct');
  const [split, setSplit] = useState(null);

  const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
  const cm = units === 'imperial' ? ftInToCm(+feet || 0, +inches || 0) : +height || 0;
  const bf = bodyfat === '' ? null : Math.min(60, Math.max(3, +bodyfat));

  const r = useMemo(() => {
    const lbm = lbmFromBodyFat(kg, bf);
    const input = { kg, cm, age: +age || 0, sex, lbm };
    const bmr = selectBmr(input, formula) ?? selectBmr(input, 'mifflin');
    const total = tdee(bmr, ACTIVITY[activity].factor);
    // F-028: deficit/surplus scales with maintenance instead of a flat kcal figure.
    // Refuse to produce a cutting target for someone already below a healthy
    // weight — same rail as the deficit planner (see safety.js).
    const guard = checkWeightTarget({ currentKg: kg, cm, goal });
    if (!guard.ok) return { blocked: true, reason: guard.reason };

    const delta = goalDelta(goal, total);
    const target = calorieTarget(total, delta, sex, total);   // F-001/F-028
    // F-029: energy availability, using the above-sedentary portion of TDEE as a
    // rough proxy for training expenditure.
    const exerciseKcal = Math.max(0, Math.round(bmr * (ACTIVITY[activity].factor - 1.2)));
    const ea = checkEnergyAvailability({ intakeKcal: target.intake, ffmKg: lbm, exerciseKcal });
    const cals = target.intake;
    const recommended = mode === 'grams'
      ? recommendedGrams({ cals, kg, lbm })
      : recommendedPercent({ cals, kg, lbm });
    const raw = split || recommended;
    const resolved = resolveSplit({ raw, cals, mode });
    const usingLeanMass = formula === 'katch' || formula === 'cunningham'
      || (formula === 'auto' && lbm != null);
    return { bmr, tdee: total, cals, target, delta, ea, lbm, bmi: bmi(kg, cm), raw, usingLeanMass, ...resolved };
  }, [kg, cm, age, sex, activity, goal, bf, formula, split, mode]);

  // Clear any manual split when the underlying body inputs change.
  const bodyKey = `${kg}|${cm}|${age}|${sex}|${activity}|${bf}|${formula}`;
  const prevKey = useRef(bodyKey);
  useEffect(() => {
    if (prevKey.current !== bodyKey) { prevKey.current = bodyKey; setSplit(null); }
  }, [bodyKey]);

  /**
   * Toggling units must CONVERT the entered values, not reinterpret them.
   * Without this, switching metric -> imperial reads "80" as 80 lb rather than
   * converting 80 kg to 176 lb, producing a nonsensical BMI.
   */
  const switchUnits = to => {
    if (to === units) return;
    if (to === 'imperial') {
      setWeight(String(Math.round(kgToLb(+weight || 0))));
      const { ft, in: inch } = cmToFtIn(+height || 0);
      setFeet(String(ft));
      setInches(String(inch));
    } else {
      setWeight(String(Math.round(lbToKg(+weight || 0))));
      setHeight(String(Math.round(ftInToCm(+feet || 0, +inches || 0))));
    }
    setUnits(to);
  };

  const clamp = v => {
    if (v === '') return '';
    const n = Math.round(+v) || 0;
    return mode === 'grams' ? Math.max(0, Math.min(2000, n)) : Math.max(0, Math.min(100, n));
  };
  const setMacro = key => e => {
    const cur = split || r.raw;
    setSplit({ p: cur.p, c: cur.c, f: cur.f, [key]: clamp(e.target.value) });
  };
  const switchMode = to => {
    if (to === mode) return;
    setSplit(convertSplit({ raw: split || r.raw, cals: r.cals, to }));
    setMode(to);
  };

  const goalLabel = { cut: 'lose fat', maintain: 'maintain', gain: 'build muscle' }[goal];
  const goalDetail = GOALS.find(g => g.key === goal)?.blurb ?? '';

  const MACROS = [
    ['p', 'Protein', 'pro'],
    ['c', 'Carbs', 'carb'],
    ['f', 'Fat', 'fat'],
  ];

  return (
    <div className={`calc ${compact ? 'calc--compact' : ''}`}>
      {/*
        Narrow viewports must stack the two panels, which hides the result below
        the fold while the user is typing. This bar keeps the number in view so
        the calculator never looks unresponsive. Hidden above 760px, where the
        results panel sits beside the inputs anyway.
      */}
      <div className="calc-stickybar" aria-hidden="true">
        <div className="sb-cal">
          <b>{fmt(r.cals)}</b><span>kcal/day</span>
        </div>
        <div className="sb-macros">
          {MACROS.map(([k, label, cls]) => (
            <span key={k} className={`sb-m ${r.over ? 'err' : ''}`}>
              <i className={`dot dot-${cls}`} />{r.grams[k]}<em>g</em>
            </span>
          ))}
        </div>
      </div>

      <div className="calc-grid">
        {/* ---------------- inputs ---------------- */}
        <section className="panel">
          <div className="panel-label">Your details</div>

          <Seg label="Units" value={units} onChange={switchUnits} options={[
            ['metric', 'Metric'], ['imperial', 'Imperial'],
          ]} />
          <Seg label="Sex" value={sex} onChange={setSex} options={[
            ['male', 'Male'], ['female', 'Female'],
          ]} />

          <div className="row2">
            <Num label="Age" value={age} onChange={setAge} tag="yrs"
                 min={AGE_MIN} max={AGE_MAX} />
            <Num label="Weight" value={weight} onChange={setWeight}
                 tag={units === 'imperial' ? 'lb' : 'kg'}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
          </div>

          {units === 'imperial' ? (
            <div className="field">
              <label>Height</label>
              <div className="row2">
                <Unit value={feet} onChange={setFeet} tag="ft" min={3} max={8} step="1" />
                <Unit value={inches} onChange={setInches} tag="in" min={0} max={11} step="1" />
              </div>
            </div>
          ) : (
            <Num label="Height" value={height} onChange={setHeight} tag="cm"
                 min={120} max={230} />
          )}

          <div className="field">
            <label htmlFor="activity">Activity level</label>
            <select id="activity" value={activity} onChange={e => setActivity(e.target.value)}>
              {Object.entries(ACTIVITY).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <Seg label="Goal" value={goal} onChange={setGoal} options={[
            ...GOALS.map(g => [g.key, g.label]),
          ]} />

          <div className="row2">
            <Num label={<>Body fat <span className="opt">(optional)</span></>}
                 value={bodyfat} onChange={setBodyfat} tag="%" placeholder="—"
                 hint="Unlocks lean-mass protein and Katch-McArdle." min={1} max={70} />
            <div className="field">
              <label htmlFor="formula">BMR formula</label>
              <select id="formula" value={formula} onChange={e => setFormula(e.target.value)}>
                <option value="auto">Auto</option>
                <option value="mifflin">Mifflin-St Jeor</option>
                <option value="harris">Harris-Benedict</option>
                <option value="katch">Katch-McArdle</option>
                <option value="cunningham">Cunningham</option>
                <option value="owen">Owen</option>
              </select>
            </div>
          </div>
        </section>

        {/* ---------------- results ---------------- */}
        {/* F-014: panel-level aria-live removed — it re-announced the whole
            panel on every keystroke. F-005: out-of-scope ages get an
            explanation instead of results. */}
        <section className="panel results">
          <div className="panel-label">Daily targets</div>
          {(() => {
            if (r.blocked) return <p className="notice">{RAIL_COPY.currentBelowHealthy}</p>;
            const scope = ageInScope(age);
            if (scope.reason === 'young') return <p className="notice">{RAIL_COPY.underAge}</p>;
            if (scope.reason === 'high') return <p className="notice">{RAIL_COPY.overAge}</p>;
            return null;
          })()}
          {ageInScope(age).ok && !r.blocked && <>
          {ageAccuracyNote(age) && (
            <p className="cat-caveat">{ageAccuracyNote(age)}</p>
          )}

          <div className="cal">
            <div className="num">{fmt(r.cals)}</div>
            <div className="u">kcal / day</div>
          </div>
          <p className="goaltag">To <b>{goalLabel}</b> — {goalDetail}.</p>

          <div className="bartop">
            <div className="modewrap">
              <span className="t">Macro split</span>
              <div className="seg mini" role="group" aria-label="Input unit">
                {[['pct', '%'], ['grams', 'g']].map(([m, lbl]) => (
                  <button key={m} type="button" aria-pressed={mode === m}
                          onClick={() => switchMode(m)}>{lbl}</button>
                ))}
              </div>
            </div>
            <span className={`total-badge ${r.over ? 'over' : r.under ? 'under' : ''}`}>
              <span className="kk">Total</span>
              {mode === 'grams' ? (
                <>
                  <b>{fmt(r.macroKcal)} kcal</b>
                  {r.over && <span className="warn">+{fmt(r.macroKcal - r.cals)} over</span>}
                  {r.under && <span className="low">{fmt(r.macroKcal - r.cals)} under</span>}
                </>
              ) : (
                <>
                  <b>{Math.round(r.totalPct)}%</b>
                  {r.over && <span className="warn">+{Math.round(r.totalPct - 100)} over</span>}
                  {r.under && <span className="low">{Math.round(r.totalPct - 100)} under</span>}
                </>
              )}
            </span>
          </div>

          <div className="bar">
            {MACROS.map(([k, , cls]) => {
              const w = (r.pct[k] / (r.totalPct || 1)) * 100;
              return (
                <div key={k} className={`seg-fill fill-${cls}`} style={{ width: `${w}%` }}>
                  <span>{w >= 9 ? `${Math.round(r.pct[k])}%` : ''}</span>
                </div>
              );
            })}
          </div>

          <div className="macros">
            {MACROS.map(([k, label, cls]) => (
              <div key={k} className={`mcard ${r.over ? 'err' : ''}`}>
                <div className="k"><span className={`dot dot-${cls}`} />{label}</div>
                <div className="pctwrap">
                  <input type="number" min="0" max={mode === 'grams' ? 2000 : 100} step="1" inputMode="numeric"
                         aria-label={`${label} ${mode === 'grams' ? 'grams' : 'percentage'}`}
                         aria-invalid={r.over || undefined}
                         value={r.raw[k]} onChange={setMacro(k)} />
                  <span className="pc">{mode === 'grams' ? 'g' : '%'}</span>
                </div>
                <div className="der">
                  <b>{mode === 'grams' ? Math.round(r.pct[k]) : r.grams[k]}</b>
                  {mode === 'grams' ? '%' : ' g'}
                </div>
              </div>
            ))}
          </div>

          {r.ea?.low && !r.target?.belowFloor && (
            <div className="warnbar">{RAIL_COPY.lowEA(r.ea.ea)}</div>
          )}

          {r.target?.belowFloor && (
            <div className="warnbar">
              {r.target.maintenanceBelowFloor
                ? RAIL_COPY.maintenanceBelowFloor(r.target.floor)
                : <>{RAIL_COPY.belowFloor(r.target.floor)}</>}
            </div>
          )}

          <div className="sumrow">
            <span className={`der ${r.over ? 'warn' : ''}`}>
              {mode === 'grams'
                ? <>= <b>{Math.round(r.totalPct)}%</b> of your {fmt(r.cals)} kcal target</>
                : <>= <b>{fmt(r.macroKcal)}</b> kcal from macros</>}
            </span>
            <button className="reset" type="button" onClick={() => setSplit(null)}>
              Reset to recommended
            </button>
          </div>

          <div className="strip">
            <Stat label="BMR" value={fmt(r.bmr)} unit="kcal" />
            <Stat label="TDEE" value={fmt(r.tdee)} unit="kcal" />
            <Stat label="BMI" value={r.bmi.toFixed(1)} />
            <Stat label={r.lbm != null ? 'Lean mass' : 'Protein basis'}
                  value={r.lbm != null ? fmt(r.lbm) : 'BW'}
                  unit={r.lbm != null ? 'kg' : ''} />
          </div>

          <details className="method">
            <summary>Method &amp; sources</summary>
            <p>
              Energy uses the <strong>{FORMULA_NAMES[formula] ?? 'Mifflin-St Jeor'}</strong> equation
              {r.usingLeanMass ? ' (lean-mass based)' : ''}, multiplied by an activity factor for
              TDEE. Protein is set from {bf != null
                ? 'lean body mass (≈2.2 g/kg)'
                : 'body weight (≈1.8 g/kg)'}, fat is floored at 0.8 g/kg for hormonal health,
              and carbohydrate fills the remainder.
            </p>
            <p className="refs">
              Mifflin MD et al., <em>Am J Clin Nutr</em> 1990 · Roza &amp; Shizgal 1984 ·
              Katch &amp; McArdle · Cunningham 1980 · Helms ER et al.,
              <em> The Muscle and Strength Pyramid</em>
            </p>
          </details>
        </>}
        </section>
      </div>
    </div>
  );
}

const FORMULA_NAMES = {
  auto: 'Mifflin-St Jeor', mifflin: 'Mifflin-St Jeor', harris: 'Harris-Benedict',
  katch: 'Katch-McArdle', cunningham: 'Cunningham', owen: 'Owen',
};


const Unit = ({ value, onChange, tag, min, max, step = 'any' }) => (
  <div className="unit">
    <input type="number" inputMode="decimal" min={min} max={max} step={step}
           value={value} aria-label={tag === 'ft' ? 'Feet' : 'Inches'}
           onWheel={e => e.currentTarget.blur()}
           onChange={e => onChange(e.target.value)} />
    <span className="tag">{tag}</span>
  </div>
);

const Stat = ({ label, value, unit }) => (
  <div className="stat">
    <div className="l">{label}</div>
    <div className="v">{value}{unit && <small>{unit}</small>}</div>
  </div>
);
