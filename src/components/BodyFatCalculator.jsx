import { useState, useMemo } from 'react';
import {
  bodyFatNavy, bodyFatDeurenberg, bodyFatSkinfold3, BODY_FAT_ERROR,
  SKINFOLD_SITES, bodyFatCategory, ffmi, ffmiBand,
  lbmFromBodyFat, bmi, waistToHeight,
  lbToKg, kgToLb, ftInToCm, cmToFtIn, fmt,
} from '../engine/index.js';
import { Seg, Num, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY } from '../engine/safety.js';

const IN_TO_CM = 2.54;

/**
 * Runs Navy tape, BMI-based and skinfold estimates together, each with its
 * published error range, so the user can see how much these methods disagree.
 */
export default function BodyFatCalculator() {
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('178');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  // Navy tape
  const [neck, setNeck] = useState('38');
  const [waist, setWaist] = useState('85');
  const [hip, setHip] = useState('95');
  // Skinfold (mm — same in both unit systems)
  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');
  const [s3, setS3] = useState('');

  const toCm = v => (units === 'imperial' ? (+v || 0) * IN_TO_CM : +v || 0);
  const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
  const cm = units === 'imperial' ? ftInToCm(+feet || 0, +inches || 0) : +height || 0;

  const switchUnits = to => {
    if (to === units) return;
    const conv = (v, f) => String(Math.round(f(+v || 0) * 10) / 10);
    if (to === 'imperial') {
      setWeight(String(Math.round(kgToLb(+weight || 0))));
      const { ft, in: i } = cmToFtIn(+height || 0);
      setFeet(String(ft)); setInches(String(i));
      setNeck(conv(neck, v => v / IN_TO_CM));
      setWaist(conv(waist, v => v / IN_TO_CM));
      setHip(conv(hip, v => v / IN_TO_CM));
    } else {
      setWeight(String(Math.round(lbToKg(+weight || 0))));
      setHeight(String(Math.round(ftInToCm(+feet || 0, +inches || 0))));
      setNeck(conv(neck, v => v * IN_TO_CM));
      setWaist(conv(waist, v => v * IN_TO_CM));
      setHip(conv(hip, v => v * IN_TO_CM));
    }
    setUnits(to);
  };

  const r = useMemo(() => {
    const a = +age || 0;
    const navy = bodyFatNavy({
      sex, cm, neckCm: toCm(neck), waistCm: toCm(waist),
      hipCm: sex === 'female' ? toCm(hip) : null,
    });
    const deuren = cm > 0 && kg > 0 ? bodyFatDeurenberg({ kg, cm, age: a, sex }) : null;
    const skin = (s1 || s2 || s3)
      ? bodyFatSkinfold3({ sex, age: a, s1, s2, s3 }) : null;

    const methods = [
      { key: 'navy', name: BODY_FAT_ERROR.navy.label, value: navy,
        err: BODY_FAT_ERROR.navy.plusMinus,
        note: 'Tape measurements. Free and repeatable if you measure the same spots each time.' },
      { key: 'skinfold', name: BODY_FAT_ERROR.skinfold.label, value: skin,
        err: BODY_FAT_ERROR.skinfold.plusMinus,
        note: 'Accurate in trained hands, unreliable in untrained ones.' },
      { key: 'deurenberg', name: BODY_FAT_ERROR.deurenberg.label, value: deuren,
        err: BODY_FAT_ERROR.deurenberg.plusMinus,
        note: 'Needs no measurement, but cannot tell muscle from fat.' },
    ];
    const available = methods.filter(m => m.value != null);
    const best = available[0] || null;         // Navy > skinfold > BMI-based
    const lbm = best ? lbmFromBodyFat(kg, best.value) : null;
    return {
      methods, available, best, lbm,
      fatMass: best ? kg - lbm : null,
      ffmi: lbm != null ? ffmi(lbm, cm) : null,
      bmi: bmi(kg, cm),
      whtr: waistToHeight(toCm(waist), cm),
    };
  }, [units, sex, age, weight, height, feet, inches, neck, waist, hip, s1, s2, s3]);

  const sites = SKINFOLD_SITES[sex];
  const lenTag = units === 'imperial' ? 'in' : 'cm';

  return (
    <div className="calc">
      <div className="calc-grid">
        <Panel label="Measurements">
          <Seg label="Units" value={units} onChange={switchUnits}
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
          {units === 'imperial' ? (
            <div className="field">
              <label>Height</label>
              <div className="row2">
                <div className="unit">
                  <input type="number" inputMode="decimal" min={3} max={8} step="1" value={feet} aria-label="Feet"
                         onWheel={e => e.currentTarget.blur()}
                         onChange={e => setFeet(e.target.value)} />
                  <span className="tag">ft</span>
                </div>
                <div className="unit">
                  <input type="number" inputMode="decimal" min={0} max={11} step="1" value={inches} aria-label="Inches"
                         onWheel={e => e.currentTarget.blur()}
                         onChange={e => setInches(e.target.value)} />
                  <span className="tag">in</span>
                </div>
              </div>
            </div>
          ) : (
            <Num label="Height" value={height} onChange={setHeight} tag="cm"
                 min={120} max={230} />
          )}

          <div className="subhead">Tape measurements <span>Navy method</span></div>
          <div className="row2">
            <Num label="Neck" value={neck} onChange={setNeck} tag={lenTag}
                 min={units === 'imperial' ? 8 : 20} max={units === 'imperial' ? 28 : 70} />
            <Num label="Waist" value={waist} onChange={setWaist} tag={lenTag}
                 min={units === 'imperial' ? 15 : 40} max={units === 'imperial' ? 80 : 200} />
          </div>
          {sex === 'female' && (
            <Num label="Hip" value={hip} onChange={setHip} tag={lenTag}
                 hint="Measured at the widest point."
                 min={units === 'imperial' ? 20 : 50} max={units === 'imperial' ? 80 : 200} />
          )}

          <div className="subhead">Skinfolds <span>optional · millimetres</span></div>
          <div className="row3">
            <Num label={sites[0]} value={s1} onChange={setS1} tag="mm" placeholder="—"
                 min={1} max={100} />
            <Num label={sites[1]} value={s2} onChange={setS2} tag="mm" placeholder="—"
                 min={1} max={100} />
            <Num label={sites[2]} value={s3} onChange={setS3} tag="mm" placeholder="—"
                 min={1} max={100} />
          </div>
          <p className="hint">Jackson-Pollock 3-site. Leave blank if you don't have calipers.</p>
        </Panel>

        <Panel label="Body fat estimate" dark
               incomplete={!(kg > 0 && cm > 0)}
               incompleteNote="Enter your measurements to see a body-fat estimate."
               notice={(() => {
                 const scope = ageInScope(age);
                 if (scope.reason === 'young') return RAIL_COPY.underAge;
                 if (scope.reason === 'high') return RAIL_COPY.overAge;
                 return null;
               })()}>
          {r.best ? (
            <>
              <BigStat value={`${r.best.value.toFixed(1)}%`}
                       unit={`± ${r.best.err}`}
                       note={<>Via <b>{r.best.name}</b> — {bodyFatCategory(r.best.value, sex)} range.</>} />
            <p className="cat-caveat">{RAIL_COPY.categoryCaveat}</p>

              <div className="bartop tight">
                <span className="t">Method comparison</span>
                <span className="total-badge">
                  <span className="kk">Agreeing</span>
                  <b>{r.available.length} of 3</b>
                </span>
              </div>

              <div className="fx-list">
                {r.methods.map(m => (
                  <div className={`fx ${m.key === r.best.key ? 'on' : ''} ${m.value == null ? 'off' : ''}`} key={m.key}>
                    <div className="fx-top">
                      <span className="fx-name">{m.name}</span>
                      <span className="fx-val">
                        {m.value != null
                          ? <>{m.value.toFixed(1)}<small>%</small></>
                          : <small>no data</small>}
                      </span>
                    </div>
                    {m.value != null && (
                      <div className="fx-range">
                        <span>{Math.max(0, m.value - m.err).toFixed(1)}%</span>
                        <div className="fx-track">
                          <i style={{
                            marginLeft: `${Math.min(85, Math.max(0, m.value - m.err) * 1.6)}%`,
                            width: `${Math.min(40, m.err * 3.2)}%`,
                          }} />
                        </div>
                        <span>{(m.value + m.err).toFixed(1)}%</span>
                      </div>
                    )}
                    <div className="fx-sub">{m.note}</div>
                  </div>
                ))}
              </div>

              <StatStrip items={[
                { label: 'Lean mass', value: fmt(r.lbm), unit: units === 'imperial' ? 'lb→kg' : 'kg' },
                { label: 'Fat mass', value: fmt(r.fatMass), unit: 'kg' },
                { label: 'FFMI', value: r.ffmi ? r.ffmi.toFixed(1) : '—' },
                { label: 'Waist:height', value: r.whtr ? r.whtr.toFixed(2) : '—' },
              ]} />

              <p className="foot-note">
                FFMI {r.ffmi ? r.ffmi.toFixed(1) : '—'} — {r.ffmi ? ffmiBand(r.ffmi) : '—'}.
                Waist-to-height above 0.50 is the common risk threshold and predicts
                cardiometabolic risk better than BMI.
              </p>
            </>
          ) : (
            <p className="goaltag">Enter your height plus neck and waist measurements to begin.</p>
          )}

          <Method>
            <p>
              Every body-fat method is an estimate with real error bars. The practical
              question is not which is true but which is <em>repeatable</em> — a method
              that is consistently three points off still tracks change correctly.
              Pick one, measure the same way each time, and follow the trend.
            </p>
            <p className="refs">
              Hodgdon JA &amp; Beckett MB, Naval Health Research Center 1984 ·
              Deurenberg P et al. 1991 · Jackson AS &amp; Pollock ML, Br J Nutr 1978 ·
              Siri WE 1961 · Ashwell M &amp; Gibson S, BMJ Open 2016
            </p>
          </Method>
        </Panel>
      </div>
    </div>
  );
}
