# Engineering Standards Matrix

Maps each electrical calculation plugin to its applicable engineering standards.

---

## Foundation (9 Plugins)

| Plugin ID                | Category   | Primary Standard | Secondary Standards |
| ------------------------ | ---------- | ---------------- | ------------------- |
| `ohms-law`               | Foundation | IEC 60027        | —                   |
| `power-calculation`      | Foundation | IEC 60027        | —                   |
| `energy-calculation`     | Foundation | IEC 60027        | —                   |
| `efficiency`             | Foundation | IEC 60034-1      | —                   |
| `power-factor`           | Foundation | IEEE 1459        | IEC 60027           |
| `three-phase-power`      | Foundation | IEC 60027        | —                   |
| `per-unit-conversion`    | Foundation | IEEE 141         | IEC 60027           |
| `symmetrical-components` | Foundation | IEEE 141         | IEC 60909           |
| `fault-current-base`     | Foundation | IEC 60909        | IEEE 141            |

## Cable (7 Plugins)

| Plugin ID                       | Category | Primary Standard           | Secondary Standards   |
| ------------------------------- | -------- | -------------------------- | --------------------- |
| `cable-sizing`                  | Cable    | IEC 60364-5-52             | NEC 2023              |
| `cable-voltage-drop`            | Cable    | IEC 60364-5-52             | NEC 2023              |
| `cable-ampacity`                | Cable    | IEC 60364-5-52             | IEEE 835, NEC 2023    |
| `cable-short-circuit-withstand` | Cable    | IEC 60364-5-54 / IEC 60724 | IEC 60287             |
| `cable-derating-grouping`       | Cable    | IEC 60364-5-52             | NEC 2023 Table 310.15 |
| `cable-derating-ambient`        | Cable    | IEC 60364-5-52             | NEC 2023 Table 310.15 |
| `cable-derating-soil`           | Cable    | IEC 60364-5-52             | IEC 60287             |

## Transformer (8 Plugins)

| Plugin ID                        | Category    | Primary Standard | Secondary Standards      |
| -------------------------------- | ----------- | ---------------- | ------------------------ |
| `transformer-sizing`             | Transformer | IEC 60076        | IEEE C57.12.00           |
| `transformer-efficiency`         | Transformer | IEC 60076-1      | IEEE C57.12.90           |
| `transformer-losses`             | Transformer | IEC 60076-1      | IEEE C57.12.90           |
| `transformer-regulation`         | Transformer | IEC 60076-1      | IEEE C57.12.00           |
| `transformer-impedance`          | Transformer | IEC 60076-5      | IEEE C57.12.10           |
| `transformer-temperature-rise`   | Transformer | IEC 60076-2      | IEEE C57.12.00           |
| `transformer-loading`            | Transformer | IEC 60076-7      | IEEE C57.91, IEEE C57.96 |
| `transformer-parallel-operation` | Transformer | IEC 60076-1      | IEEE C57.12.00           |

## Short Circuit (7 Plugins)

| Plugin ID               | Category      | Primary Standard | Secondary Standards |
| ----------------------- | ------------- | ---------------- | ------------------- |
| `sc-three-phase`        | Short Circuit | IEC 60909        | IEEE 141            |
| `sc-line-line`          | Short Circuit | IEC 60909        | IEEE 141            |
| `sc-single-line-ground` | Short Circuit | IEC 60909        | IEEE 141            |
| `sc-peak-current`       | Short Circuit | IEC 60909        | —                   |
| `sc-breaking-current`   | Short Circuit | IEC 60909        | IEEE C37.04         |
| `sc-making-current`     | Short Circuit | IEC 60909        | IEEE C37.04         |
| `sc-thermal-equivalent` | Short Circuit | IEC 60909        | IEEE 141            |

## Grounding (6 Plugins)

| Plugin ID                    | Category  | Primary Standard     | Secondary Standards |
| ---------------------------- | --------- | -------------------- | ------------------- |
| `grounding-earth-resistance` | Grounding | IEEE 80              | IEC 60364-5-54      |
| `grounding-grid-resistance`  | Grounding | IEEE 80              | IEEE 665            |
| `grounding-touch-voltage`    | Grounding | IEEE 80              | IEC 60364-5-54      |
| `grounding-step-voltage`     | Grounding | IEEE 80              | IEC 60364-5-54      |
| `grounding-conductor-sizing` | Grounding | IEEE 80 / NEC 250    | IEEE 665            |
| `grounding-rod-sizing`       | Grounding | IEEE 80 / NEC 250.52 | IEEE 665            |

## Protection (7 Plugins)

| Plugin ID                      | Category   | Primary Standard          | Secondary Standards |
| ------------------------------ | ---------- | ------------------------- | ------------------- |
| `protection-fuse-sizing`       | Protection | IEC 60269 / NEC 240       | IEEE 242            |
| `protection-mcb-selection`     | Protection | IEC 60898                 | IEEE 242            |
| `protection-mccb-selection`    | Protection | IEC 60947-2               | IEEE 242            |
| `protection-acb-selection`     | Protection | IEC 60947-2               | IEEE C37.13         |
| `protection-relay-ct-sizing`   | Protection | IEC 61869-2 / IEEE C57.13 | IEEE 242            |
| `protection-coordination`      | Protection | IEC 60909 / IEEE 242      | IEEE C37.112        |
| `protection-breaking-capacity` | Protection | IEC 60947-2               | IEEE C37.13         |

## Motor (6 Plugins)

| Plugin ID                     | Category | Primary Standard           | Secondary Standards |
| ----------------------------- | -------- | -------------------------- | ------------------- |
| `motor-current`               | Motor    | IEC 60034-1 / NEMA MG-1    | IEEE 3002.2         |
| `motor-starting-current`      | Motor    | IEC 60034-1 / NEMA MG-1    | IEEE 3002.2         |
| `motor-voltage-drop-starting` | Motor    | IEC 60034-1                | IEEE 141            |
| `motor-starting-method`       | Motor    | IEC 60034-1 / NEMA MG-1    | IEEE 3002.2         |
| `motor-cable-sizing`          | Motor    | IEC 60364-5-52 / NEMA MG-1 | IEEE 835            |
| `motor-protection-sizing`     | Motor    | IEC 60947-4-1 / NEMA ICS 2 | IEEE 3002.2         |

## Power Quality (5 Plugins)

| Plugin ID                    | Category      | Primary Standard         | Secondary Standards |
| ---------------------------- | ------------- | ------------------------ | ------------------- |
| `pq-power-factor-correction` | Power Quality | IEEE 1459 / IEC 61000    | IEC 60831-1         |
| `pq-capacitor-bank`          | Power Quality | IEC 60831 / IEEE 18      | IEEE 1036           |
| `pq-reactive-power`          | Power Quality | IEEE 1459                | IEC 61000-4-7       |
| `pq-harmonic-estimation`     | Power Quality | IEEE 519 / IEC 61000-2-4 | IEC 61000-4-7       |
| `pq-voltage-regulation`      | Power Quality | IEC 60038 / IEEE 141     | IEEE C57.15         |

---

## Standard Reference Summary

| Standard       | Scope                                                     |
| -------------- | --------------------------------------------------------- |
| IEC 60027      | Letter symbols for electrical quantities                  |
| IEC 60034-1    | Rotating electrical machines — rating and performance     |
| IEC 60038      | Standard voltages                                         |
| IEC 60076-1    | Power transformers — general                              |
| IEC 60076-2    | Power transformers — temperature rise                     |
| IEC 60076-5    | Power transformers — ability to withstand short circuit   |
| IEC 60076-7    | Power transformers — loading guide                        |
| IEC 60269      | Low-voltage fuses                                         |
| IEC 60287      | Current-carrying capacity of cables                       |
| IEC 60364-5-52 | Low-voltage installations — selection of cables           |
| IEC 60364-5-54 | Low-voltage installations — earthing arrangements         |
| IEC 60724      | Short-circuit temperature limits of cables                |
| IEC 60831      | Shunt power capacitors                                    |
| IEC 60898      | Circuit-breakers for overcurrent protection               |
| IEC 60909      | Short-circuit currents in three-phase AC systems          |
| IEC 60947-1    | Low-voltage switchgear — general                          |
| IEC 60947-2    | Low-voltage switchgear — circuit-breakers                 |
| IEC 60947-4-1  | Low-voltage switchgear — contactors and motor-starters    |
| IEC 61000      | Electromagnetic compatibility (EMC)                       |
| IEC 61869-2    | Current transformers                                      |
| IEEE 18        | Shunt power capacitors                                    |
| IEEE 80        | IEEE Guide for Safety in Substation Grounding             |
| IEEE 141       | IEEE Recommended Practice for Electric Power Distribution |
| IEEE 242       | Recommended Practice for Protection and Coordination      |
| IEEE 519       | Harmonic control in electrical power systems              |
| IEEE 665       | Guide for Generating Station Grounding                    |
| IEEE 835       | Standard Power Cable Ampacity Tables                      |
| IEEE 1459      | Standard Definitions for the Measurement of Power         |
| IEEE C57.12.00 | Standard for Transformers                                 |
| IEEE C37.04    | Rating Structure for AC HV Circuit Breakers               |
| IEEE C57.13    | Requirements for Instrument Transformers                  |
| IEEE 3002.2    | Recommended Practice for Motor Protection                 |
| NEMA MG-1      | Motors and Generators                                     |
| NEMA ICS 2     | Industrial Control and Systems                            |
| NEC 2023       | National Electrical Code (Articles 240, 250)              |

---

## Coverage Map

```
IEC 60027      ─── Foundation
IEC 60034-1    ─── Foundation, Motor
IEC 60038      ─── Power Quality
IEC 60076      ─── Transformer (all parts)
IEC 60269      ─── Protection
IEC 60364      ─── Cable, Grounding
IEC 60724      ─── Cable
IEC 60831      ─── Power Quality
IEC 60898      ─── Protection
IEC 60909      ─── Foundation, Short Circuit, Protection
IEC 60947      ─── Protection (all parts)
IEC 61000      ─── Power Quality
IEC 61869-2    ─── Protection
IEEE 18        ─── Power Quality
IEEE 80        ─── Grounding
IEEE 141       ─── Foundation, Power Quality
IEEE 242       ─── Protection
IEEE 519       ─── Power Quality
IEEE 665       ─── Grounding
IEEE 835       ─── Cable
IEEE 1459      ─── Foundation, Power Quality
IEEE C37       ─── Protection
IEEE C57       ─── Transformer
IEEE 3002.2    ─── Motor
NEMA MG-1      ─── Motor
NEMA ICS 2     ─── Motor
NEC 2023       ─── Cable, Grounding, Protection
```

**55 plugins · 28 standards · 8 categories**
