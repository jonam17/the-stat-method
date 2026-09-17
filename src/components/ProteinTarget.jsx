import { useState, useMemo } from 'react';
import {
  proteinTarget, lbmFromBodyFat, lbToKg, kgToLb, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';

export default function ProteinTarget() {
  const [units, setUnits] = useState('metric');
  const [weight, setWeight] = useState('80');
  const [bodyfat, setBodyfat] = useState('');
  const [deficit, setDeficit] = useState('none');
  const [trainingAge, setTrainingAge] = useState('intermediate');
  const [older, setOlder] = useState('no');

  const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
  const bf = bodyfat === '' ? null : Math.min(60, Math.max(3, +bodyfat));
  const lbm = lbmFromBodyFat(kg, bf);

  const switchUnits = to => {
    if (to === units) return;
    setWeight(String(Math.round(to === 'imperial' ? kgToLb(+weight || 0) : lbToKg(+weight || 0))));
    setUnits(to);
  };

  const r = useMemo(() => proteinTarget({
    kg, lbm, deficit, trainingAge, older: older === 'yes',
  }), [kg, lbm, deficit, trainingAge, older]);

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
            Supplying body fat switches the target to lean body mass, which matters a great
            deal if you carry significant fat — fat tissue contributes almost nothing to
            protein requirement.
          </p>

          <div className="subhead">Context <span>these shift the range</span></div>
          <Select label="Calorie deficit" value={deficit} onChange={setDeficit}
                  hint="Protein needs rise as calories fall, to protect lean mass.">
            <option value="none">None — maintenance or surplus</option>
            <option value="moderate">Moderate deficit</option>
            <option value="aggressive">Aggressive deficit</option>
          </Select>
          <div className="row2">
            <Select label="Training age" value={trainingAge} onChange={setTrainingAge}>
              <option value="novice">Under a year</option>
              <option value="intermediate">One to five years</option>
              <option value="advanced">Five years or more</option>
            </Select>
            <Select label="Over 60" value={older} onChange={setOlder}
                    hint="Anabolic resistance raises the floor.">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
        </Panel>

        <Panel label="Daily protein" dark
               incomplete={!(kg > 0)}
               incompleteNote="Enter your bodyweight to see a protein target.">
          <BigStat value={`${r.lowG}–${r.highG}`} unit="grams / day"
                   note={<>Scaled from your <b>{r.basis}</b> at
                     {' '}{r.perKgLow.toFixed(1)}–{r.perKgHigh.toFixed(1)} g/kg.</>} />

          <div className="bartop tight">
            <span className="t">Where to sit in the range</span>
          </div>
          <div className="fx-list compact">
            <div className="fx">
              <div className="fx-top">
                <span className="fx-name">Lower end</span>
                <span className="fx-val">{r.lowG}<small>g</small></span>
              </div>
              <div className="fx-sub">Sufficient at maintenance or in a surplus.</div>
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
              <div className="fx-sub">Worth reaching for in an aggressive cut, or when older.</div>
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
              Ranges follow the trained-population literature. Meta-analytic work suggests
              benefits plateau at roughly 1.6 g per kg of bodyweight for muscle gain, with
              higher intakes justified in a deficit where protein protects lean mass. Scaling
              from lean body mass rather than total weight avoids inflating the target for
              people carrying more fat.
            </p>
            <p className="refs">
              Morton RW et al., Br J Sports Med 2018 · Helms ER et al.,
              Int J Sport Nutr Exerc Metab 2014 · Institute of Medicine DRI, 2005
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
