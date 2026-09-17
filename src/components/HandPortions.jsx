import { useState, useMemo } from 'react';
import {
  toHandPortions, splitMeals, HAND_UNITS,
  selectBmr, tdee, calorieTarget, ACTIVITY, lbmFromBodyFat,
  recommendedGrams, lbToKg, ftInToCm, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import {
  ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY, GOALS, goalDelta, checkWeightTarget,
} from '../engine/safety.js';

/**
 * Converts macro targets into body-scaled hand portions, so tracking works
 * without a scale. Accepts macros directly, or derives them from body details.
 */
export default function HandPortions() {
  const [source, setSource] = useState('calculate');
  const [handSize, setHandSize] = useState('average');
  const [meals, setMeals] = useState('4');
  const [peri, setPeri] = useState('none');

  // direct entry
  const [pIn, setPIn] = useState('150');
  const [cIn, setCIn] = useState('250');
  const [fIn, setFIn] = useState('70');

  // derived entry
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('178');
  const [activity, setActivity] = useState('moderate');
  const [goal, setGoal] = useState('maintain');   // F-028

  const macros = useMemo(() => {
    if (source === 'direct') {
      return { p: +pIn || 0, c: +cIn || 0, f: +fIn || 0 };
    }
    const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
    const cm = units === 'imperial' ? ftInToCm(5, 10) : +height || 0;
    const input = { kg, cm, age: +age || 30, sex, lbm: null };
    const guard = checkWeightTarget({ currentKg: kg, cm, goal });
    if (!guard.ok) return { blocked: true, reason: guard.reason };

    const total = tdee(selectBmr(input, 'auto'), ACTIVITY[activity].factor);
    const target = calorieTarget(total, goalDelta(goal, total), sex, total);   // F-001, F-028
    const cals = target.intake;
    const g = recommendedGrams({ cals, kg, lbm: null });
    return { p: g.p, c: g.c, f: g.f, target };
  }, [source, pIn, cIn, fIn, units, sex, age, weight, height, activity, goal]);

  const portions = useMemo(
    () => toHandPortions({ proteinG: macros.p, carbsG: macros.c, fatG: macros.f, handSize }),
    [macros, handSize]);

  const mealPlan = useMemo(() => splitMeals({
    proteinG: macros.p, carbsG: macros.c, fatG: macros.f,
    meals: +meals, periIndex: peri === 'none' ? null : +peri,
  }), [macros, meals, peri]);

  const kcal = macros.p * 4 + macros.c * 4 + macros.f * 9;
  const perMeal = {
    p: portions.protein.whole / +meals,
    c: portions.carbs.whole / +meals,
    f: portions.fat.whole / +meals,
  };

  const ROWS = [
    ['protein', 'Protein', 'pro', portions.protein],
    ['carbs', 'Carbs', 'carb', portions.carbs],
    ['fat', 'Fat', 'fat', portions.fat],
  ];

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your targets">
          <Seg label="Macros from" value={source} onChange={setSource}
               options={[['calculate', 'Calculate them'], ['direct', 'I know them']]} />

          {source === 'direct' ? (
            <div className="row3">
              <Num label="Protein" value={pIn} onChange={setPIn} tag="g"
                 min={0} max={500} />
              <Num label="Carbs" value={cIn} onChange={setCIn} tag="g"
                 min={0} max={1500} />
              <Num label="Fat" value={fIn} onChange={setFIn} tag="g"
                 min={0} max={500} />
            </div>
          ) : (
            <>
              <Seg label="Units" value={units} onChange={setUnits}
                   options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />
              <Seg label="Sex" value={sex} onChange={setSex}
                   options={[['male', 'Male'], ['female', 'Female']]} />
              <div className="row2">
                <Num label="Age" value={age} onChange={setAge} tag="yrs"
                 min={AGE_MIN} max={AGE_MAX} />
                <Num label="Weight" value={weight} onChange={setWeight}
                     tag={units === 'imperial' ? 'lb' : 'kg'}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
              </div>
              {units === 'metric' && (
                <Num label="Height" value={height} onChange={setHeight} tag="cm"
                 min={120} max={230} />
              )}
              <Select label="Activity" value={activity} onChange={setActivity}>
                {Object.entries(ACTIVITY).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Select>
              <Seg label="Goal" value={goal} onChange={setGoal}
                   options={GOALS.map(g => [g.key, g.label])} />
            </>
          )}

          <div className="subhead">Portioning <span>your hand, your scale</span></div>
          <Select label="Hand size" value={handSize} onChange={setHandSize}
                  hint="Portions scale with your own hand, which is roughly proportional to your body.">
            <option value="small">Small</option>
            <option value="average">Average</option>
            <option value="large">Large</option>
          </Select>
          <div className="row2">
            <Select label="Meals per day" value={meals} onChange={setMeals}>
              {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} meals</option>)}
            </Select>
            <Select label="Bigger meal around training" value={peri} onChange={setPeri}>
              <option value="none">No preference</option>
              {Array.from({ length: +meals }, (_, i) => (
                <option key={i} value={i}>Meal {i + 1}</option>
              ))}
            </Select>
          </div>
        </Panel>

        <Panel label="Daily portions" dark
               incomplete={!(+weight > 0)}
               incompleteNote="Enter your details to see your daily portions."
               notice={(() => {
                 // Takes precedence over children, so no portions are rendered.
                 if (macros.blocked) return RAIL_COPY.currentBelowHealthy;
                 const scope = ageInScope(age);
                 if (scope.reason === 'young') return RAIL_COPY.underAge;
                 if (scope.reason === 'high') return RAIL_COPY.overAge;
                 return null;
               })()}>
          {macros.target?.belowFloor && (
            <div className="warnbar">
              {RAIL_COPY.belowFloor(macros.target.floor)}
            </div>
          )}
          <BigStat
            value={`${portions.protein.whole}·${portions.carbs.whole}·${portions.fat.whole}`}
            unit="palms · hands · thumbs"
            note={<>From {fmt(macros.p)}p / {fmt(macros.c)}c / {fmt(macros.f)}f
              — about <b>{fmt(kcal)} kcal</b>.</>} />

          <div className="fx-list tight">
            {ROWS.map(([key, label, cls, p]) => (
              <div className="fx" key={key}>
                <div className="fx-top">
                  <span className="fx-name">
                    <span className={`dot dot-${cls}`} />{label}
                  </span>
                  <span className="fx-val">
                    {p.whole}<small>{p.unit}{p.whole === 1 ? '' : 's'}</small>
                  </span>
                </div>
                <div className="fx-sub">
                  {fmt(p.totalGrams)} g total · about {Math.round(p.gramsPerUnit)} g per {p.unit}
                </div>
                <div className="fx-sub">{p.note}</div>
              </div>
            ))}
            <div className="fx">
              <div className="fx-top">
                <span className="fx-name">Vegetables</span>
                <span className="fx-val">{meals}<small>fists</small></span>
              </div>
              <div className="fx-sub">{HAND_UNITS.veg.note}</div>
            </div>
          </div>

          <div className="bartop">
            <span className="t">Per meal across {meals} meals</span>
          </div>
          <div className="mealtable">
            <div className="mt-head">
              <span>Meal</span><span>Protein</span><span>Carbs</span><span>Fat</span><span>kcal</span>
            </div>
            {mealPlan.map(m => (
              <div className={`mt-row ${m.isPeri ? 'peri' : ''}`} key={m.meal}>
                <span className="mt-n">{m.meal}{m.isPeri && <em>peri</em>}</span>
                <span>{m.proteinG}<small>g</small></span>
                <span>{m.carbsG}<small>g</small></span>
                <span>{m.fatG}<small>g</small></span>
                <span className="mt-k">{fmt(m.kcal)}</span>
              </div>
            ))}
          </div>

          <StatStrip items={[
            { label: 'Palms / meal', value: perMeal.p.toFixed(1) },
            { label: 'Handfuls / meal', value: perMeal.c.toFixed(1) },
            { label: 'Thumbs / meal', value: perMeal.f.toFixed(1) },
            { label: 'Daily kcal', value: fmt(kcal) },
          ]} />

          <Method>
            <p>
              Hand portions work because hand size scales roughly with body size, so the
              measure travels with you and needs no equipment. The trade-off is precision:
              a palm of chicken and a palm of salmon differ in both protein and fat, and
              individual hands vary. Expect an error of perhaps ten to twenty percent
              against weighed food.
            </p>
            <p>
              That is usually an acceptable price. A method you will actually use every day
              beats a more accurate one you abandon after a fortnight. If you later want
              precision for a specific phase, weigh food then.
            </p>
            <p className="refs">
              Hand-portion approach popularised by Precision Nutrition. Gram equivalents are
              the commonly used approximations and are deliberately expressed as ranges.
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
