import { useState, useMemo } from 'react';
import {
  allMaxHr, heartRateZones, kcalFromMets, findActivity, ACTIVITIES,
  vo2maxCooper, vo2maxFromHr, lbToKg, kgToLb, fmt,
} from '../engine/index.js';
import { Seg, Num, Select, Panel, BigStat, StatStrip, Method } from './ToolShell.jsx';
import { ageInScope, AGE_MIN, AGE_MAX, RAIL_COPY } from '../engine/safety.js';

export default function CardioCalculator({ mode = 'zones' }) {
  const [tab, setTab] = useState(mode);
  const [units, setUnits] = useState('metric');
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [restHr, setRestHr] = useState('60');
  const [activity, setActivity] = useState('Running, 10 km/h');
  const [minutes, setMinutes] = useState('30');
  const [cooper, setCooper] = useState('');

  const kg = units === 'imperial' ? lbToKg(+weight || 0) : +weight || 0;
  const switchUnits = to => {
    if (to === units) return;
    setWeight(String(Math.round(to === 'imperial' ? kgToLb(+weight || 0) : lbToKg(+weight || 0))));
    setUnits(to);
  };

  const r = useMemo(() => {
    const a = +age || 0;
    const rest = restHr === '' ? null : +restHr;
    const formulas = allMaxHr(a, sex);
    const maxHr = formulas.find(f => f.preferred).value;
    const zones = heartRateZones(maxHr, rest);
    const act = findActivity(activity);
    const mins = +minutes || 0;
    const burned = act ? kcalFromMets(act.mets, kg, mins) : 0;
    const perHour = act ? kcalFromMets(act.mets, kg, 60) : 0;
    const vo2 = cooper ? vo2maxCooper(+cooper) : (rest ? vo2maxFromHr(maxHr, rest) : null);
    const vo2Source = cooper ? 'Cooper 12-minute test' : (rest ? 'Resting/max heart rate' : null);
    return { formulas, maxHr, zones, act, burned, perHour, mins, vo2, vo2Source, rest };
  }, [age, sex, restHr, activity, minutes, kg, cooper]);

  return (
    <div className="calc">
      <div className="seg full tabs" role="group" aria-label="Calculator mode">
        <button type="button" aria-pressed={tab === 'zones'} onClick={() => setTab('zones')}>
          Heart rate zones
        </button>
        <button type="button" aria-pressed={tab === 'burn'} onClick={() => setTab('burn')}>
          Calories burned
        </button>
      </div>

      <div className="calc-grid">
        <Panel label={tab === 'zones' ? 'Your details' : 'Your session'}>
          <Seg label="Units" value={units} onChange={switchUnits}
               options={[['metric', 'Metric'], ['imperial', 'Imperial']]} />

          {tab === 'zones' ? (
            <>
              <Seg label="Sex" value={sex} onChange={setSex}
                   options={[['male', 'Male'], ['female', 'Female']]} />
              <div className="row2">
                <Num label="Age" value={age} onChange={setAge} tag="yrs"
                 min={AGE_MIN} max={AGE_MAX} />
                <Num label="Resting HR" value={restHr} onChange={setRestHr} tag="bpm"
                     placeholder="—"
                 min={30} max={120} />
              </div>
              <p className="hint">
                Resting heart rate switches the calculation to the Karvonen method, which
                accounts for your conditioning. Measure it on waking, before getting up.
              </p>
              <Num label="Cooper test distance (optional)" value={cooper} onChange={setCooper}
                   tag="m" placeholder="—"
                   hint="Distance covered in a 12-minute maximal run, for a VO₂ max estimate."
                 min={500} max={6000} />
            </>
          ) : (
            <>
              <Num label="Bodyweight" value={weight} onChange={setWeight}
                   tag={units === 'imperial' ? 'lb' : 'kg'}
                 min={units === 'imperial' ? 50 : 25} max={units === 'imperial' ? 700 : 320} />
              <Select label="Activity" value={activity} onChange={setActivity}>
                {ACTIVITIES.map(g => (
                  <optgroup label={g.group} key={g.group}>
                    {g.items.map(i => (
                      <option key={i.name} value={i.name}>{i.name} · {i.mets} METs</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              <Num label="Duration" value={minutes} onChange={setMinutes} tag="min"
                 min={1} max={600} />
              <p className="hint">
                MET values come from the Compendium of Physical Activities. They are
                population averages — actual cost varies with skill, terrain and intensity.
              </p>
            </>
          )}
        </Panel>

        {tab === 'zones' ? (
          <Panel label="Training zones" dark
               notice={(() => {
                 const scope = ageInScope(age);
                 if (scope.reason === 'young') return RAIL_COPY.underAge;
                 if (scope.reason === 'high') return RAIL_COPY.overAge;
                 return null;
               })()}>
            <BigStat value={fmt(r.maxHr)} unit="bpm max"
                     note={<>Estimated with <b>Tanaka</b>{r.rest
                       ? <> · zones use the Karvonen reserve method</>
                       : <> · add a resting heart rate for more personal zones</>}.</>} />

            <div className="zones">
              {r.zones.map(z => (
                <div className={`zone z${z.zone}`} key={z.zone}>
                  <div className="z-head">
                    <span className="z-n">Zone {z.zone}</span>
                    <span className="z-name">{z.name}</span>
                    <span className="z-bpm">{fmt(z.lowBpm)}–{fmt(z.highBpm)}<small>bpm</small></span>
                  </div>
                  <div className="z-bar"><i style={{ width: `${z.zone * 20}%` }} /></div>
                  <div className="z-use">{z.use}</div>
                </div>
              ))}
            </div>

            <div className="bartop">
              <span className="t">Max HR formulas compared</span>
            </div>
            <div className="fx-list compact">
              {r.formulas.map(f => (
                <div className={`fx ${f.preferred ? 'on' : ''}`} key={f.key}>
                  <div className="fx-top">
                    <span className="fx-name">
                      {f.name}{f.preferred && <em className="fx-tag">Preferred</em>}
                    </span>
                    <span className="fx-val">{fmt(f.value)}<small>bpm</small></span>
                  </div>
                </div>
              ))}
            </div>

            <StatStrip items={[
              { label: 'Max HR', value: fmt(r.maxHr), unit: 'bpm' },
              { label: 'Resting', value: r.rest ? fmt(r.rest) : '—', unit: r.rest ? 'bpm' : '' },
              { label: 'HR reserve', value: r.rest ? fmt(r.maxHr - r.rest) : '—', unit: r.rest ? 'bpm' : '' },
              { label: 'VO₂ max', value: r.vo2 ? r.vo2.toFixed(1) : '—' },
            ]} />

            {r.vo2Source && (
              <p className="foot-note">VO₂ max estimated via {r.vo2Source}.</p>
            )}

            <Method>
              <p>
                "220 − age" (Fox) is the familiar formula but overestimates in younger
                adults and underestimates in older ones. Tanaka is better validated across
                age groups, so it is used here. Any max-HR formula carries roughly ±10 bpm
                of individual variation — a real maximal test is the only precise answer.
              </p>
              <p className="refs">
                Tanaka H et al., J Am Coll Cardiol 2001 · Karvonen MJ et al. 1957 ·
                Gulati M et al., Circulation 2010 · Cooper KH, JAMA 1968
              </p>
            </Method>
          </Panel>
        ) : (
          <Panel label="Energy cost" dark>
            <BigStat value={fmt(r.burned)} unit="kcal burned"
                     note={<><b>{r.act?.name}</b> for {r.mins} minutes at {r.act?.mets} METs.</>} />

            <StatStrip items={[
              { label: 'Per hour', value: fmt(r.perHour), unit: 'kcal' },
              { label: 'Per minute', value: (r.perHour / 60).toFixed(1), unit: 'kcal' },
              { label: 'METs', value: r.act?.mets ?? '—' },
              { label: 'Weekly ×3', value: fmt(r.burned * 3), unit: 'kcal' },
            ]} />

            <div className="bartop">
              <span className="t">Same duration, other activities</span>
            </div>
            <div className="fx-list compact">
              {ACTIVITIES.flatMap(g => g.items)
                .filter(i => i.name !== r.act?.name)
                .sort((a, b) => Math.abs(a.mets - (r.act?.mets ?? 0)) - Math.abs(b.mets - (r.act?.mets ?? 0)))
                .slice(0, 5)
                .map(i => (
                  <div className="fx" key={i.name}>
                    <div className="fx-top">
                      <span className="fx-name">{i.name}</span>
                      <span className="fx-val">{fmt(kcalFromMets(i.mets, kg, r.mins))}<small>kcal</small></span>
                    </div>
                  </div>
                ))}
            </div>

            <Method>
              <p>
                Energy cost is calculated as METs × 3.5 × bodyweight (kg) ÷ 200 per minute,
                the standard ACSM metabolic equation. This includes the calories you would
                have burned at rest anyway, so the <em>additional</em> cost of exercise is
                somewhat lower than the figure shown. Wearable estimates are typically
                optimistic; treat all of these as approximations.
              </p>
              <p className="refs">
                Ainsworth BE et al., Compendium of Physical Activities,
                Med Sci Sports Exerc 2011 · ACSM Guidelines for Exercise Testing
              </p>
            </Method>
          </Panel>
        )}
      </div>
    </div>
  );
}
