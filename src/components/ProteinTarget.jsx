import { useState, useMemo } from 'react';
import {
  proteinTarget, lbmFromBodyFat, lbToKg, kgToLb, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { eligibility, AGE_MIN, AGE_MAX } from '../engine/safety.js';

export default function ProteinTarget() {
  const [units, setUnits] = useState('metric');
  const [weight, setWeight] = useState('80');
  const [bodyfat, setBodyfat] = useState('');
  const [deficit, setDeficit] = useState('none');
  const [age, setAge] = useState('30');

  const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
  const bf = bodyfat === '' ? null : Math.min(60, Math.max(3, +bodyfat));
  const lbm = lbmFromBodyFat(kg, bf);

  const switchUnits = to => {
    if (to === units) return;
    setWeight(String(Math.round(to === 'imperial' ? kgToLb(+weight || 0) : lbToKg(+weight || 0))));
    setUnits(to);
  };

  const r = useMemo(() => proteinTarget({ kg, lbm, deficit }), [kg, lbm, deficit]);
  // Refusal decided by the engine, the same way every other tool decides it.
  const gate = eligibility({ age });

  const perMeal = n => Math.round(r.midG / n);

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Your details">
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />
          <div className="row2">
            <Num label="Bodyweight" value={weight} onChange={setWeight}
                 tag={units === 'imperial' ? 'lb' : 'kg'}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
            <Num label="Body fat" value={bodyfat} onChange={setBodyfat} tag="%"
                 placeholder="—"
                 min={1} max={70} />
          </div>
          <p className="hint">
            In a calorie deficit, body fat lets the target use your lean body mass, which is
            how the deficit range is defined.
          </p>

          <div className="row2">
            <Select label="Calorie deficit" value={deficit} onChange={setDeficit}>
              <option value="none">No — maintenance or surplus</option>
              <option value="deficit">Yes — cutting</option>
            </Select>
            <Num label="Age" value={age} onChange={setAge} tag="yrs" min={AGE_MIN} max={AGE_MAX} />
          </div>
        </Panel>

        <Panel label="Daily protein" dark
               notice={gate.refused ? gate.copy : undefined}
               incomplete={gate.incomplete || !(kg > 0)}
               incompleteNote="Enter your bodyweight to see a protein target.">
          <BigStat value={`${r.lowG}–${r.highG}`} unit="grams / day"
                   note={<>Scaled from your <b>{r.basis}</b> at
                     {' '}{r.perKgLow.toFixed(1)}–{r.perKgHigh.toFixed(1)} g/kg.</>} />
          {r.leanMassNeedsBodyFat && (
            <p className="foot-note">
              The deficit range is set per kg of lean mass, so it needs your body fat. Without
              it, this is the everyday range; lean people in a hard cut may need more.
            </p>
          )}

          {/* Fixed, not conditional: the tool does not ask about kidney disease (decided
              2026-10-20, option b). Inside the panel, so a refusal replaces it with the
              numbers. Source: NIDDK, "Healthy Eating for Adults with Chronic Kidney
              Disease", reviewed January 2025. */}
          <div className="warnbar">
            Have kidney disease? This range was not set for you. Some people with chronic
            kidney disease need a moderate amount of protein so waste doesn't build up in the
            blood, while people on dialysis may need more. Work out the right amount with a
            dietitian or doctor.
          </div>

          <div className="bartop tight">
            <span className="t">Where to sit in the range</span>
          </div>
          <div className="fx-list compact">
            <div className="fx">
              <div className="fx-top">
                <span className="fx-name">Lower end</span>
                <span className="fx-val">{r.lowG}<small>g</small></span>
              </div>
              <div className="fx-sub">{r.inDeficit && !r.leanMassNeedsBodyFat
                ? 'For a gentler cut, or if you carry more fat.' : 'Enough for most people who train.'}</div>
            </div>
            <div className="fx on">
              <div className="fx-top">
                <span className="fx-name">Midpoint<em className="fx-tag">Sensible default</em></span>
                <span className="fx-val">{r.midG}<small>g</small></span>
              </div>
              <div className="fx-sub">A reasonable target for most people, most of the time.</div>
            </div>
            <div className="fx">
              <div className="fx-top">
                <span className="fx-name">Upper end</span>
                <span className="fx-val">{r.highG}<small>g</small></span>
              </div>
              <div className="fx-sub">{r.inDeficit && !r.leanMassNeedsBodyFat
                ? 'For a harder cut, or when you are already lean.' : 'The top of the range most exercisers need.'}</div>
            </div>
          </div>

          <div className="bartop">
            <span className="t">Split across meals</span>
          </div>
          <div className="pcttable">
            {[3, 4, 5, 6].map(n => (
              <div className="pctrow" key={n}>
                <span className="pp">{n}×</span>
                <span className="pw">{perMeal(n)}<small>g</small></span>
                <span className="pr">per meal</span>
              </div>
            ))}
          </div>

          <StatStrip items={[
            { label: 'Basis', value: lbm != null ? fmt(lbm) : fmt(kg), unit: 'kg' },
            { label: 'Target', value: r.midG, unit: 'g' },
            { label: 'From protein', value: fmt(r.midG * 4), unit: 'kcal' },
            { label: 'Range width', value: r.highG - r.lowG, unit: 'g' },
          ]} />

          <p className="foot-note">
            The "30 g per meal absorption limit" is a myth. Larger single doses are handled
            fine, and the daily total is what drives outcomes. Spreading intake across three
            or four meals is convenient and probably marginally better, but it is not the
            lever it is often presented as.
          </p>

          <Method>
            <p>
              The everyday range is 1.4 to 2.0 g per kg of bodyweight, the International
              Society of Sports Nutrition's figure for most people who exercise. A meta-analysis
              of 49 trials found gains in lean mass levelled off at about 1.6 g per kg, with a
              wide margin of uncertainty, from 1.0 to 2.2.
            </p>
            <p>
              In a calorie deficit the range is 2.3 to 3.1 g per kg of lean body mass, from a
              review of resistance-trained athletes dieting. Its authors advise the higher end
              the harder the cut and the leaner you are.
            </p>
            <p>
              There is no adjustment for age. A European expert group recommends at least 1.0
              to 1.2 g per kg for people over 65, or 1.2 if active, which the everyday range
              already exceeds.
            </p>
            <p className="refs">
              Jäger R et al., J Int Soc Sports Nutr 2017 · Morton RW et al., Br J Sports Med 2018 ·
              Helms ER et al., J Int Soc Sports Nutr 2014 · Bauer J et al., J Am Med Dir Assoc 2013 ·
              NIDDK, healthy eating with chronic kidney disease, 2025
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
