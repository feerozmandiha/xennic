# فرهنگ دوزبانه مهندسی — Bilingual Engineering Lexicon

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Overview

A comprehensive Persian-English engineering dictionary covering power systems, protection, equipment, standards, measurements, tariffs, building electrical, renewable energy, industrial control, smart grid, and general engineering terms. Each entry maps to a `BilingualTerm` node in the Xennic Knowledge Graph with `TRANSLATION_OF` edges. Minimum 500 high-priority terms.

---

## Entry Structure

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `lexicon_id` | string | Unique identifier | `XEN-LEX-POW-0001` |
| `en` | string | English canonical term | `Load Flow` |
| `fa` | string | Persian canonical term | `پخش بار` |
| `aliases` | array | Alternative forms in either language | `["Power Flow", "بار", "باردهی"]` |
| `context` | string | Usage context / domain | `Power system analysis` |
| `notes` | string | Translation notes, regional variations | `"پخش بار" is direct translation; common in university texts` |

---

## A. Power Systems — سیستم‌های قدرت (60+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-POW-0001 | Load Flow | پخش بار | Power Flow, باردهی | System analysis | — |
| XEN-LEX-POW-0002 | Short Circuit | اتصال کوتاه | SC, Fault, خطا | Fault analysis | — |
| XEN-LEX-POW-0003 | Voltage Drop | افت ولتاژ | VD | Cable sizing | — |
| XEN-LEX-POW-0004 | Power Factor | ضریب قدرت | PF, Cos φ | System analysis | — |
| XEN-LEX-POW-0005 | Active Power | توان اکتیو | Real Power, P | System parameters | — |
| XEN-LEX-POW-0006 | Reactive Power | توان راکتیو | Q | System parameters | — |
| XEN-LEX-POW-0007 | Apparent Power | توان ظاهری | S | System parameters | — |
| XEN-LEX-POW-0008 | Generation | تولید | Power Generation, تولید برق | Power plant | — |
| XEN-LEX-POW-0009 | Transmission | انتقال | Transmission Line | HV network | — |
| XEN-LEX-POW-0010 | Distribution | توزیع | MV/LV Network | Network | — |
| XEN-LEX-POW-0011 | Substation | پست برق | پست, Substation | Equipment | — |
| XEN-LEX-POW-0012 | Primary Substation | پست فوق‌توزیع | پست ۶۳/۲۰ kV | Tavanir | — |
| XEN-LEX-POW-0013 | Secondary Substation | پست توزیع | پست ۲۰/۰.۴ kV | Tavanir | — |
| XEN-LEX-POW-0014 | Feeder | فیدر | Feed, خروجی | Distribution | — |
| XEN-LEX-POW-0015 | Busbar | باسبار | Bus, Busway, شینه, باس | Switchgear | — |
| XEN-LEX-POW-0016 | Single Busbar | باسبار تکی | — | Configuration | — |
| XEN-LEX-POW-0017 | Double Busbar | باسبار دوبل | دو شینه | Configuration | — |
| XEN-LEX-POW-0018 | Ring Bus | باسبار حلقوی | حلقه | Configuration | — |
| XEN-LEX-POW-0019 | Breaker-and-a-Half | یک و نیم کلیدی | — | Configuration | — |
| XEN-LEX-POW-0020 | Voltage Level | سطح ولتاژ | رنج ولتاژ | Parameters | — |
| XEN-LEX-POW-0021 | Nominal Voltage | ولتاژ نامی | Rated Voltage | Parameters | — |
| XEN-LEX-POW-0022 | System Voltage | ولتاژ سیستم | Operating Voltage | Parameters | — |
| XEN-LEX-POW-0023 | Rated Frequency | فرکانس نامی | فرکانس ۵۰ هرتز | Parameters | Iran uses 50 Hz |
| XEN-LEX-POW-0024 | Base Load | بار پایه | — | Operation | — |
| XEN-LEX-POW-0025 | Peak Load | بار پیک | Peak Demand, پیک | Operation | — |
| XEN-LEX-POW-0026 | Load Curve | منحنی بار | Demand Profile | Analysis | — |
| XEN-LEX-POW-0027 | Load Factor | ضریب بار | Load Factor | Analysis | — |
| XEN-LEX-POW-0028 | Diversity Factor | ضریب غیرهمزمانی | ضریب همزمانی (inverse) | Planning | Tavanir usage differs |
| XEN-LEX-POW-0029 | Demand Factor | ضریب دیماند | — | Planning | — |
| XEN-LEX-POW-0030 | Loss Factor | ضریب تلفات | Loss Load Factor | Analysis | — |
| XEN-LEX-POW-0031 | Technical Loss | تلفات فنی | — | Network | — |
| XEN-LEX-POW-0032 | Non-Technical Loss | تلفات غیرفنی | Theft, سرقت | Network | — |
| XEN-LEX-POW-0033 | Transmission Line | خط انتقال | خط هوایی, OHL | Transmission | — |
| XEN-LEX-POW-0034 | Distribution Line | خط توزیع | Feeder, فیدر | Distribution | — |
| XEN-LEX-POW-0035 | Overhead Line | خط هوایی | OHL | Construction | — |
| XEN-LEX-POW-0036 | Underground Cable | کابل زیرزمینی | buried cable | Construction | — |
| XEN-LEX-POW-0037 | Conductor | هادی | سیم, Conductor wire | Materials | — |
| XEN-LEX-POW-0038 | ACSR Conductor | هادی ACSR | آلومینیوم-فولاد | Materials | — |
| XEN-LEX-POW-0039 | AAAC Conductor | هادی AAAC | All Aluminium | Materials | — |
| XEN-LEX-POW-0040 | Sag | افتادگی (خط) | شل بودن سیم | Line design | — |
| XEN-LEX-POW-0041 | Right of Way | حریم خط | RoW | Legal | — |
| XEN-LEX-POW-0042 | Corona | کرونا | Corona Discharge | HV phenomena | — |
| XEN-LEX-POW-0043 | Power Transformer | ترانسفورماتور قدرت | ترانس قدرت | Equipment | — |
| XEN-LEX-POW-0044 | Auto Transformer | اتوترانسفورماتور | Auto, اتو | Equipment | — |
| XEN-LEX-POW-0045 | Earthing Transformer | ترانس ارت | Zigzag Transformer | Equipment | Called "ترانس زاویه" in Iran |
| XEN-LEX-POW-0046 | Series Reactor | راکتور سری | Line Reactor | Equipment | — |
| XEN-LEX-POW-0047 | Shunt Reactor | راکتور موازی | Shunt Reactor | Equipment | — |
| XEN-LEX-POW-0048 | Capacitor Bank | بانک خازنی | خازن‌کمپان | Equipment | — |
| XEN-LEX-POW-0049 | Static Var Compensator | جبران‌ساز استاتیک | SVC | FACTS | — |
| XEN-LEX-POW-0050 | STATCOM | جبران‌ساز استاتیک سنکرون | STATCOM | FACTS | — |
| XEN-LEX-POW-0051 | HVDC | جریان مستقیم ولتاژ بالا | HVDC, HVdc | Transmission | — |
| XEN-LEX-POW-0052 | Grid Code | کد شبکه | Grid Code | Regulation | — |
| XEN-LEX-POW-0053 | Islanding | جزیره‌ای شدن | Island Operation | Operation | — |
| XEN-LEX-POW-0054 | Black Start | راه‌اندازی سیاه | راه‌اندازی مستقل | Restoration | — |
| XEN-LEX-POW-0055 | Load Shedding | قطع بار | باربری, Load shedding | Protection scheme | — |
| XEN-LEX-POW-0056 | Power Quality | کیفیت برق | PQ | General | — |
| XEN-LEX-POW-0057 | Voltage Sag | افت ولتاژ لحظه‌ای | Dip | PQ | — |
| XEN-LEX-POW-0058 | Voltage Swell | افزایش ولتاژ لحظه‌ای | Swell | PQ | — |
| XEN-LEX-POW-0059 | Harmonic Distortion | اعوجاج هارمونیکی | THD | PQ | — |
| XEN-LEX-POW-0060 | Interruption | قطعی برق | Outage, خاموشی | Reliability | — |
| XEN-LEX-POW-0061 | SAIDI | شاخص SAIDI | متوسط مدت قطعی | Reliability | — |
| XEN-LEX-POW-0062 | SAIFI | شاخص SAIFI | متوسط تعداد قطعی | Reliability | — |
| XEN-LEX-POW-0063 | Power System Stability | پایداری سیستم قدرت | Angle Stability | Analysis | — |
| XEN-LEX-POW-0064 | Transient Stability | پایداری گذرا | — | Analysis | — |
| XEN-LEX-POW-0065 | Voltage Stability | پایداری ولتاژ | — | Analysis | — |

## B. Protection — حفاظت (50+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-PRO-0001 | Protection Relay | رله حفاظتی | Relay, رله | General | — |
| XEN-LEX-PRO-0002 | Numerical Relay | رله عددی | Digital Relay | Relay types | — |
| XEN-LEX-PRO-0003 | Electromechanical Relay | رله الکترومکانیکی | Induction Disc | Relay types | — |
| XEN-LEX-PRO-0004 | Static Relay | رله استاتیک | Solid State | Relay types | — |
| XEN-LEX-PRO-0005 | Overcurrent Relay | رله اضافه جریان | ANSI 50/51 | Functions | — |
| XEN-LEX-PRO-0006 | Instantaneous Overcurrent | رله جریان لحظه‌ای | ANSI 50 | Functions | — |
| XEN-LEX-PRO-0007 | Time Overcurrent | رله جریان زمانی | ANSI 51, TOC | Functions | — |
| XEN-LEX-PRO-0008 | Earth Fault Relay | رله خطای زمین | ANSI 50N/51N, EF | Functions | — |
| XEN-LEX-PRO-0009 | Restricted Earth Fault | رله خطای زمین محدود | ANSI 64REF | Functions | — |
| XEN-LEX-PRO-0010 | Differential Relay | رله دیفرانسیل | ANSI 87 | Functions | — |
| XEN-LEX-PRO-0011 | Transformer Differential | دیفرانسیل ترانس | ANSI 87T | Functions | — |
| XEN-LEX-PRO-0012 | Busbar Differential | دیفرانسیل باسبار | ANSI 87B | Functions | — |
| XEN-LEX-PRO-0013 | Distance Relay | رله دیستانس | ANSI 21 | Functions | — |
| XEN-LEX-PRO-0014 | Zone 1 | زون ۱ | Zone 1 | Distance zones | — |
| XEN-LEX-PRO-0015 | Zone 2 | زون ۲ | Zone 2 | Distance zones | — |
| XEN-LEX-PRO-0016 | Zone 3 | زون ۳ | Zone 3 | Distance zones | — |
| XEN-LEX-PRO-0017 | Directional Relay | رله جهتی | ANSI 67 | Functions | — |
| XEN-LEX-PRO-0018 | Under Voltage Relay | رله کم‌فشاری | ANSI 27 | Functions | — |
| XEN-LEX-PRO-0019 | Over Voltage Relay | رله اضافه ولتاژ | ANSI 59 | Functions | — |
| XEN-LEX-PRO-0020 | Under Frequency Relay | رله کم‌فرکانسی | ANSI 81U | Functions | — |
| XEN-LEX-PRO-0021 | Over Frequency Relay | رله اضافه فرکانس | ANSI 81O | Functions | — |
| XEN-LEX-PRO-0022 | Reclosing Relay | رله بستن مجدد | ANSI 79 | Functions | — |
| XEN-LEX-PRO-0023 | Synchronism Check | رله سنکرون‌چک | ANSI 25 | Functions | — |
| XEN-LEX-PRO-0024 | Loss of Excitation | رله تحریک‌زدایی | ANSI 40 | Generator | — |
| XEN-LEX-PRO-0025 | Reverse Power | رله توان معکوس | ANSI 32 | Generator | — |
| XEN-LEX-PRO-0026 | Buchholz Relay | رله بوخهلتس | Buchholz | Transformer | — |
| XEN-LEX-PRO-0027 | Pressure Relief Valve | شیر فشارشکن | PRV | Transformer | — |
| XEN-LEX-PRO-0028 | Winding Temperature | دمای سیم‌پیچ | WTI | Transformer | — |
| XEN-LEX-PRO-0029 | Oil Temperature | دمای روغن | OTI | Transformer | — |
| XEN-LEX-PRO-0030 | Protection Coordination | هماهنگی حفاظتی | Coordination Study | Study | — |
| XEN-LEX-PRO-0031 | Time Dial | تایم دیال | TD, Time Multiplier | Setting | — |
| XEN-LEX-PRO-0032 | Pickup Current | جریان راه‌انداز | Pickup | Setting | — |
| XEN-LEX-PRO-0033 | Plug Setting | پلاگ ستینگ | PS | Setting | — |
| XEN-LEX-PRO-0034 | Time Multiplier Setting | ضریب زمان | TMS | Setting | — |
| XEN-LEX-PRO-0035 | Current Transformer | ترانسفورماتور جریان | CT | Instrument | — |
| XEN-LEX-PRO-0036 | Voltage Transformer | ترانسفورماتور ولتاژ | PT, VT | Instrument | — |
| XEN-LEX-PRO-0037 | CT Ratio | نسبت تبدیل CT | Ratio | Setting | — |
| XEN-LEX-PRO-0038 | CT Saturation | اشباع CT | Saturation | Phenomena | — |
| XEN-LEX-PRO-0039 | Knee Point Voltage | ولتاژ زانو | Vk | CT spec | — |
| XEN-LEX-PRO-0040 | Accuracy Class | کلاس دقت | Class 5P, 10P | CT spec | — |
| XEN-LEX-PRO-0041 | Burden | باردن | Load burden | CT spec | — |
| XEN-LEX-PRO-0042 | Relay Setting | ستینگ رله | Setting | Protection | — |
| XEN-LEX-PRO-0043 | Grading Margin | حاشیه هماهنگی | Margin | Coordination | — |
| XEN-LEX-PRO-0044 | Arc Flash | فلاش قوس | Arc Fault | Safety | — |
| XEN-LEX-PRO-0045 | Protection Scheme | طرح حفاظتی | Scheme | General | — |
| XEN-LEX-PRO-0046 | Unit Protection | حفاظت واحد | Unit Scheme | Schemes | — |
| XEN-LEX-PRO-0047 | Non-Unit Protection | حفاظت غیرواحد | Non-Unit Scheme | Schemes | — |
| XEN-LEX-PRO-0048 | Pilot Protection | حفاظت پایلوت | Pilot Wire | Schemes | — |
| XEN-LEX-PRO-0049 | Permissive Overreach | مجوز بیش‌کننده | POTT | Schemes | — |
| XEN-LEX-PRO-0050 | Blocking Scheme | طرح بلوکینگ | Blocking | Schemes | — |
| XEN-LEX-PRO-0051 | Auto-Reclosure | ریکلوز خودکار | Auto-Reclose | Schemes | — |
| XEN-LEX-PRO-0052 | Dead Time | زمان قطع | Dead Time | Reclose | — |
| XEN-LEX-PRO-0053 | Reclaim Time | زمان بازیابی | Reclaim | Reclose | — |

## C. Equipment — تجهیزات (80+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-EQP-0001 | Circuit Breaker | کلید قدرت | Breaker, CB | Switchgear | — |
| XEN-LEX-EQP-0002 | SF6 Circuit Breaker | کلید قدرت SF6 | SF6 CB | Switchgear | — |
| XEN-LEX-EQP-0003 | Vacuum Circuit Breaker | کلید قدرت خلأ | VCB | Switchgear | — |
| XEN-LEX-EQP-0004 | Air Circuit Breaker | کلید قدرت هوایی | ACB | Switchgear | — |
| XEN-LEX-EQP-0005 | Oil Circuit Breaker | کلید قدرت روغنی | OCB | Switchgear | — |
| XEN-LEX-EQP-0006 | Miniature Circuit Breaker | کلید مینیاتوری | MCB | LV | — |
| XEN-LEX-EQP-0007 | Moulded Case Circuit Breaker | کلید کامپکت | MCCB | LV | — |
| XEN-LEX-EQP-0008 | Residual Current Device | کلید محافظ جان | RCD, RCCB, محافظ جان | LV | — |
| XEN-LEX-EQP-0009 | Disconnector | سکسیونر | Isolator, Disconnect Switch | Switchgear | — |
| XEN-LEX-EQP-0010 | Load Break Switch | کلید قطع بار | LBS | Switchgear | — |
| XEN-LEX-EQP-0011 | Earthing Switch | کلید ارتینگ | E/S | Switchgear | — |
| XEN-LEX-EQP-0012 | Fuse | فیوز | Fuse Link | Protection | — |
| XEN-LEX-EQP-0013 | HRC Fuse | فیوز HRC | High Rupturing Capacity | Protection | — |
| XEN-LEX-EQP-0014 | Switchgear | تابلو برق | Panel, تابلو | General | — |
| XEN-LEX-EQP-0015 | LV Switchgear | تابلو برق فشارضعیف | LV Panel, تابلوی اصلی | LV | — |
| XEN-LEX-EQP-0016 | MV Switchgear | تابلو برق فشارمتوسط | MV Panel | MV | — |
| XEN-LEX-EQP-0017 | Ring Main Unit | آرام‌یو | RMU | MV | Pronounced "آرام‌یو" in Iran |
| XEN-LEX-EQP-0018 | Power Transformer | ترانسفورماتور قدرت | ترانس قدرت | Transformers | — |
| XEN-LEX-EQP-0019 | Distribution Transformer | ترانسفورماتور توزیع | ترانس توزیع | Transformers | — |
| XEN-LEX-EQP-0020 | Dry Type Transformer | ترانسفورماتور خشک | Dry Transformer | Transformers | — |
| XEN-LEX-EQP-0021 | Oil Immersed Transformer | ترانسفورماتور روغنی | Oil Transformer | Transformers | — |
| XEN-LEX-EQP-0022 | Pad Mounted Transformer | ترانسفورماتور زمینی | Pad Mount | Distribution | — |
| XEN-LEX-EQP-0023 | Pole Mounted Transformer | ترانسفورماتور هوایی | Pole Type | Distribution | — |
| XEN-LEX-EQP-0024 | Cast Resin Transformer | ترانسفورماتور رزینی | Resin Type | Transformers | — |
| XEN-LEX-EQP-0025 | Step-up Transformer | ترانسفورماتور افزاینده | Step-up | Generation | — |
| XEN-LEX-EQP-0026 | Step-down Transformer | ترانسفورماتور کاهنده | Step-down | Distribution | — |
| XEN-LEX-EQP-0027 | Isolation Transformer | ترانسفورماتور ایزوله | Isolating | Special | — |
| XEN-LEX-EQP-0028 | Furnace Transformer | ترانسفورماتور کوره | — | Special | — |
| XEN-LEX-EQP-0029 | Rectifier Transformer | ترانسفورماتور یکسوساز | Rectifier | Special | — |
| XEN-LEX-EQP-0030 | Booster Transformer | ترانسفورماتور بوستر | Booster | Special | — |
| XEN-LEX-EQP-0031 | Grounding Transformer | ترانسفورماتور ارتینگ | ترانس زاویه, Zigzag | Earthing | — |
| XEN-LEX-EQP-0032 | Tap Changer | تپ چنجر | OLTC | Transformers | — |
| XEN-LEX-EQP-0033 | OLTC | تپ چنجر تحت بار | On-Load Tap Changer | Transformers | — |
| XEN-LEX-EQP-0034 | De-energized Tap Changer | تپ چنجر بی‌بار | Off-Circuit Tap Changer | Transformers | — |
| XEN-LEX-EQP-0035 | Bushing | بوشینگ | مقره عبوری | Transformers | — |
| XEN-LEX-EQP-0036 | Conservator | منبع روغن | Oil Conservator | Transformers | — |
| XEN-LEX-EQP-0037 | Breather | تنفس‌کننده | Silica Gel Breather | Transformers | — |
| XEN-LEX-EQP-0038 | Cooling Fan | فن خنک‌کننده | Radiator Fan | Transformers | — |
| XEN-LEX-EQP-0039 | Oil Pump | پمپ روغن | Oil Circulation Pump | Transformers | — |
| XEN-LEX-EQP-0040 | Power Cable | کابل قدرت | کابل برق | Cables | — |
| XEN-LEX-EQP-0041 | Control Cable | کابل کنترل | کابل فرمان | Cables | — |
| XEN-LEX-EQP-0042 | Instrumentation Cable | کابل ابزار دقیق | کابل Instrument | Cables | — |
| XEN-LEX-EQP-0043 | Armoured Cable | کابل زره‌دار | SWA Cable | Cables | — |
| XEN-LEX-EQP-0044 | XLPE Cable | کابل XLPE | Cross-linked, اشعه‌ای | Cables | — |
| XEN-LEX-EQP-0045 | PVC Cable | کابل PVC | کابل پلاستیکی | Cables | — |
| XEN-LEX-EQP-0046 | EPR Cable | کابل EPR | Ethylene Propylene | Cables | — |
| XEN-LEX-EQP-0047 | Fire Resistant Cable | کابل ضد حریق | Fire Cable | Cables | — |
| XEN-LEX-EQP-0048 | Low Smoke Cable | کابل دود کم | LSOH, LSZH | Cables | — |
| XEN-LEX-EQP-0049 | Aerial Bundled Cable | کابل خودنگهدار | ABC, سش | Cables | "سش" in Iran |
| XEN-LEX-EQP-0050 | Single Core Cable | کابل تک‌رشته | 1C | Cables | — |
| XEN-LEX-EQP-0051 | Multi Core Cable | کابل چندرشته | Multicore | Cables | — |
| XEN-LEX-EQP-0052 | Induction Motor | موتور القایی | Asynchronous Motor | Motors | — |
| XEN-LEX-EQP-0053 | Synchronous Motor | موتور سنکرون | Synch Motor | Motors | — |
| XEN-LEX-EQP-0054 | Squirrel Cage Motor | موتور قفس سنجابی | Squirrel Cage | Motors | — |
| XEN-LEX-EQP-0055 | Wound Rotor Motor | موتور روتور سیم‌پیچی | Slip Ring Motor | Motors | — |
| XEN-LEX-EQP-0056 | DC Motor | موتور جریان مستقیم | DC Motor | Motors | — |
| XEN-LEX-EQP-0057 | Stepper Motor | موتور پله‌ای | Stepper | Motors | — |
| XEN-LEX-EQP-0058 | Servo Motor | موتور سروو | Servo | Motors | — |
| XEN-LEX-EQP-0059 | Generator | ژنراتور | ژنراتور, Alternator | Generation | — |
| XEN-LEX-EQP-0060 | Synchronous Generator | ژنراتور سنکرون | Alternator | Generation | — |
| XEN-LEX-EQP-0061 | Exciter | تحریک‌کننده | Excitation System | Generation | — |
| XEN-LEX-EQP-0062 | AVR | تنظیم‌کننده خودکار ولتاژ | Automatic Voltage Regulator | Generation | — |
| XEN-LEX-EQP-0063 | Governor | گاورنر | Speed Regulator | Generation | — |
| XEN-LEX-EQP-0064 | Surge Arrester | برقگیر | Lightning Arrester | Protection | — |
| XEN-LEX-EQP-0065 | Surge Protective Device | محافظ ولتاژ | SPD | LV | — |
| XEN-LEX-EQP-0066 | Discharge Counter | شمارنده تخلیه | Counter | Arrester | — |
| XEN-LEX-EQP-0067 | Reactor | راکتور | Reactor | Power system | — |
| XEN-LEX-EQP-0068 | Shunt Reactor | راکتور موازی | Shunt | Power system | — |
| XEN-LEX-EQP-0069 | Series Reactor | راکتور سری | Line Reactor | Power system | — |
| XEN-LEX-EQP-0070 | Damping Reactor | راکتور میرایی | — | Power system | — |
| XEN-LEX-EQP-0071 | Neutral Earthing Resistor | مقاومت زمین خنثی | NER | Earthing | — |
| XEN-LEX-EQP-0072 | Petersen Coil | سیم‌پیچ پترسون | Arc Suppression Coil | Earthing | — |
| XEN-LEX-EQP-0073 | Capacitor | خازن | Capacitor | General | — |
| XEN-LEX-EQP-0074 | Power Capacitor | خازن قدرت | Capacitor Bank | Power system | — |
| XEN-LEX-EQP-0075 | Filter Capacitor | خازن فیلتر | Harmonic Filter | PQ | — |
| XEN-LEX-EQP-0076 | Battery | باتری | باطری | DC system | "باطری" colloquial |
| XEN-LEX-EQP-0077 | Battery Charger | شارژر باتری | Rectifier | DC system | — |
| XEN-LEX-EQP-0078 | UPS | برق بدون وقفه | Uninterruptible Power Supply | DC system | — |
| XEN-LEX-EQP-0079 | Inverter | اینورتر | مبدل | Power electronics | — |
| XEN-LEX-EQP-0080 | Rectifier | یکسوساز | Rectifier | Power electronics | — |
| XEN-LEX-EQP-0081 | Converter | مبدل | Converter | Power electronics | — |
| XEN-LEX-EQP-0082 | Thyristor | تریستور | SCR | Power electronics | — |
| XEN-LEX-EQP-0083 | IGBT | آی‌جی‌بی‌تی | Insulated Gate Bipolar Transistor | Power electronics | — |
| XEN-LEX-EQP-0084 | Contactor | کنتاکتور | Magnetic Contactor | Control | — |
| XEN-LEX-EQP-0085 | Relay | رله | Relay | Control | Generic term |

## D. Standards — استانداردها (40+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-STD-0001 | IEC 60038 | استاندارد IEC 60038 | IEC voltage standards | Voltage | Standard voltages |
| XEN-LEX-STD-0002 | IEC 60076 | استاندارد IEC 60076 | IEC power transformers | Power transformer | Testing & specification |
| XEN-LEX-STD-0003 | IEC 60228 | استاندارد IEC 60228 | IEC conductor sizes | Cables | Cross-section classes |
| XEN-LEX-STD-0004 | IEC 60364 | استاندارد IEC 60364 | Low voltage installations | Building | Electrical installations |
| XEN-LEX-STD-0005 | IEC 60502 | استاندارد IEC 60502 | Power cables | Cables | Cables with extruded insulation |
| XEN-LEX-STD-0006 | IEC 60947 | استاندارد IEC 60947 | LV switchgear | Switchgear | LV switchgear and controlgear |
| XEN-LEX-STD-0007 | IEC 61000 | استاندارد IEC 61000 | EMC | EMC | Electromagnetic compatibility |
| XEN-LEX-STD-0008 | IEC 61850 | استاندارد IEC 61850 | Substation automation | Automation | Communication in substations |
| XEN-LEX-STD-0009 | IEC 62271 | استاندارد IEC 62271 | HV switchgear | Switchgear | HV switchgear and controlgear |
| XEN-LEX-STD-0010 | IEC 62305 | استاندارد IEC 62305 | Lightning protection | Lightning | Protection against lightning |
| XEN-LEX-STD-0011 | IEC 62443 | استاندارد IEC 62443 | Cybersecurity | IACS | Industrial cybersecurity |
| XEN-LEX-STD-0012 | IEEE 80 | استاندارد IEEE 80 | Substation grounding | Earthing | AC substation grounding |
| XEN-LEX-STD-0013 | IEEE 142 | استاندارد IEEE 142 | Industrial grounding | Earthing | Industrial & commercial power |
| XEN-LEX-STD-0014 | IEEE 519 | استاندارد IEEE 519 | Harmonic limits | PQ | Harmonic control in power systems |
| XEN-LEX-STD-0015 | IEEE 738 | استاندارد IEEE 738 | Conductor rating | Lines | Bare overhead conductor rating |
| XEN-LEX-STD-0016 | IEEE C37 | استاندارد IEEE C37 | Switchgear | Switchgear | Switchgear standards family |
| XEN-LEX-STD-0017 | ISIRI 132 | استاندارد ملی ۱۳۲ | ISIRI 132 | General | Iran national standard |
| XEN-LEX-STD-0018 | ISIRI 3636 | استاندارد ملی ۳۶۳۶ | ISIRI 3636 | Cables | Power cables standard |
| XEN-LEX-STD-0019 | Tavanir Standard | استاندارد توانیر | Tavanir Spec | Iran | Tavanir technical specification |
| XEN-LEX-STD-0020 | Tavanir Distribution | ضوابط توزیع توانیر | Tavanir Regulation | Iran | Tavanir distribution codes |
| XEN-LEX-STD-0021 | IEC 60044 | استاندارد IEC 60044 | Instrument transformers | CT/VT | Merged into IEC 61869 |
| XEN-LEX-STD-0022 | IEC 61869 | استاندارد IEC 61869 | Instrument transformers | CT/VT | Replaced IEC 60044 |
| XEN-LEX-STD-0023 | IEC 60034 | استاندارد IEC 60034 | Rotating machines | Motors | Electrical machines |
| XEN-LEX-STD-0024 | IEC 60027 | استاندارد IEC 60027 | Letter symbols | Notation | Electrical quantities symbols |
| XEN-LEX-STD-0025 | IEC 60071 | استاندارد IEC 60071 | Insulation coordination | Insulation | HV insulation levels |
| XEN-LEX-STD-0026 | IEC 60255 | استاندارد IEC 60255 | Measuring relays | Protection | Protection relay standards |
| XEN-LEX-STD-0027 | IEC 60287 | استاندارد IEC 60287 | Current rating | Cables | Cable current rating calculation |
| XEN-LEX-STD-0028 | IEC 60300 | استاندارد IEC 60300 | Dependability | Quality | Reliability management |
| XEN-LEX-STD-0029 | IEC 60755 | استاندارد IEC 60755 | RCD general | Protection | Residual current devices |
| XEN-LEX-STD-0030 | IEC 61082 | استاندارد IEC 61082 | Electrical diagrams | Drawing | Preparation of documents |
| XEN-LEX-STD-0031 | IEC 61131 | استاندارد IEC 61131 | PLC programming | Control | Programmable controllers |
| XEN-LEX-STD-0032 | IEC 61140 | استاندارد IEC 61140 | Protection against shock | Safety | Electric shock protection |
| XEN-LEX-STD-0033 | IEC 61386 | استاندارد IEC 61386 | Conduit systems | Wiring | Conduit specification |
| XEN-LEX-STD-0034 | IEC 61439 | استاندارد IEC 61439 | LV switchgear assemblies | Switchgear | Replaced IEC 60439 |
| XEN-LEX-STD-0035 | IEC 61508 | استاندارد IEC 61508 | Functional safety | Safety | Safety lifecycle |
| XEN-LEX-STD-0036 | IEC 61511 | استاندارد IEC 61511 | Process safety | Safety | Safety instrumented systems |
| XEN-LEX-STD-0037 | IEC 61537 | استاندارد IEC 61537 | Cable tray | Cables | Cable management systems |
| XEN-LEX-STD-0038 | IEC 62262 | استاندارد IEC 62262 | IK rating | Enclosure | Mechanical impact protection |
| XEN-LEX-STD-0039 | ISO 50001 | استاندارد ISO 50001 | Energy management | Energy | EnMS standard |
| XEN-LEX-STD-0040 | ISIRI 10811 | استاندارد ملی ۱۰۸۱۱ | ISIRI 10811 | Building | Electrical installations of buildings |
| XEN-LEX-STD-0041 | IEC 61970 | استاندارد IEC 61970 | CIM | EMS | Common Information Model |
| XEN-LEX-STD-0042 | IEEE 1547 | استاندارد IEEE 1547 | DER interconnection | Renewable | Grid interconnection of DER |

## E. Measurements — اندازه‌گیری‌ها (40+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-MEA-0001 | Voltage | ولتاژ | V, اختلاف پتانسیل | Electrical | — |
| XEN-LEX-MEA-0002 | Current | جریان | I, آمپر | Electrical | — |
| XEN-LEX-MEA-0003 | Resistance | مقاومت | R, اهم | Electrical | — |
| XEN-LEX-MEA-0004 | Impedance | امپدانس | Z | Electrical | — |
| XEN-LEX-MEA-0005 | Reactance | راکتانس | X | Electrical | — |
| XEN-LEX-MEA-0006 | Conductance | رسانایی | G, سیمنس | Electrical | — |
| XEN-LEX-MEA-0007 | Susceptance | سوسپتانس | B | Electrical | — |
| XEN-LEX-MEA-0008 | Admittance | ادمیتانس | Y | Electrical | — |
| XEN-LEX-MEA-0009 | Frequency | فرکانس | f, Hz | Electrical | — |
| XEN-LEX-MEA-0010 | Power | توان | P, توان الکتریکی | Electrical | — |
| XEN-LEX-MEA-0011 | Energy | انرژی | E, W·h | Electrical | — |
| XEN-LEX-MEA-0012 | Volt-Ampere | ولت-آمپر | VA | Electrical | — |
| XEN-LEX-MEA-0013 | Watt | وات | W | Unit | — |
| XEN-LEX-MEA-0014 | Volt | ولت | V | Unit | — |
| XEN-LEX-MEA-0015 | Ampere | آمپر | A | Unit | — |
| XEN-LEX-MEA-0016 | Ohm | اهم | Ω | Unit | — |
| XEN-LEX-MEA-0017 | Henry | هنری | H | Unit | Inductance |
| XEN-LEX-MEA-0018 | Farad | فاراد | F | Unit | Capacitance |
| XEN-LEX-MEA-0019 | Siemens | زیمنس | S | Unit | Conductance |
| XEN-LEX-MEA-0020 | Hertz | هرتز | Hz | Unit | Frequency |
| XEN-LEX-MEA-0021 | Energy Meter | کنتور برق | Watt-hour Meter, کنتور | Metering | — |
| XEN-LEX-MEA-0022 | Smart Meter | کنتور هوشمند | AMI Meter, کنتور دیجیتال | Metering | — |
| XEN-LEX-MEA-0023 | Multimeter | مولتی‌متر | DMM, AVO Meter | Testing | — |
| XEN-LEX-MEA-0024 | Clamp Meter | آمپرکلمپ | Clamp-on, کلمپ متر | Testing | — |
| XEN-LEX-MEA-0025 | Megohmmeter | مگر | میگر, Insulation Tester | Testing | — |
| XEN-LEX-MEA-0026 | Earth Tester | ارت‌سنج | Earth Resistance Tester | Testing | — |
| XEN-LEX-MEA-0027 | Power Analyzer | تحلیلگر توان | Power Quality Analyzer | Testing | — |
| XEN-LEX-MEA-0028 | Oscilloscope | اسیلوسکوپ | Scope, CRO | Testing | — |
| XEN-LEX-MEA-0029 | Thermography | ترموگرافی | Infrared, Thermal Imaging | Testing | — |
| XEN-LEX-MEA-0030 | Partial Discharge | تخلیه جزئی | PD | Testing | — |
| XEN-LEX-MEA-0031 | Hi-Pot Test | تست Hi-Pot | High Potential Test | Testing | — |
| XEN-LEX-MEA-0032 | Insulation Resistance | مقاومت عایقی | IR, میگر تست | Testing | — |
| XEN-LEX-MEA-0033 | Tan Delta | تان دلتا | Dissipation Factor | Testing | — |
| XEN-LEX-MEA-0034 | DGA | آنالیز گازهای محلول | Dissolved Gas Analysis | Testing | Transformer oil |
| XEN-LEX-MEA-0035 | Furan Analysis | آنالیز فوران | Furan | Testing | Paper degradation |
| XEN-LEX-MEA-0036 | Accuracy | دقت | Accuracy | Metrology | — |
| XEN-LEX-MEA-0037 | Precision | تکرارپذیری | Repeatability | Metrology | — |
| XEN-LEX-MEA-0038 | Calibration | کالیبراسیون | واسنجی | Metrology | — |
| XEN-LEX-MEA-0039 | Tolerance | تلرانس | تحمل | Metrology | — |
| XEN-LEX-MEA-0040 | Uncertainty | عدم قطعیت | Uncertainty | Metrology | — |
| XEN-LEX-MEA-0041 | Range | رنج | محدوده اندازه‌گیری | Metrology | — |
| XEN-LEX-MEA-0042 | Resolution | رزولوشن | تفکیک‌پذیری | Metrology | — |
| XEN-LEX-MEA-0043 | Sampling Rate | نرخ نمونه‌برداری | Sample Rate | Digital | — |

## F. Economics & Tariffs — اقتصاد و تعرفه (50+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-ECO-0001 | Tariff | تعرفه | Rate, نرخ | Billing | — |
| XEN-LEX-ECO-0002 | Energy Tariff | تعرفه انرژی | نرخ انرژی | Billing | — |
| XEN-LEX-ECO-0003 | Demand Tariff | تعرفه دیماند | Demand Charge | Billing | Tavanir |
| XEN-LEX-ECO-0004 | Time-of-Use Tariff | تعرفه ساعتی | TOU | Billing | — |
| XEN-LEX-ECO-0005 | Peak Tariff | تعرفه پیک | Peak Rate | Billing | — |
| XEN-LEX-ECO-0006 | Off-Peak Tariff | تعرفه غیرپیک | Off-Peak Rate | Billing | — |
| XEN-LEX-ECO-0007 | Mid-Peak Tariff | تعرفه میان‌پیک | Mid-Peak | Billing | — |
| XEN-LEX-ECO-0008 | Flat Tariff | تعرفه یکسان | Flat Rate | Billing | — |
| XEN-LEX-ECO-0009 | Block Tariff | تعرفه پلکانی | Step Rate | Billing | Increasing block |
| XEN-LEX-ECO-0010 | Seasonal Tariff | تعرفه فصلی | Seasonal Rate | Billing | — |
| XEN-LEX-ECO-0011 | Power Factor Penalty | جریمه ضریب قدرت | PF Penalty | Billing | Cos φ penalty |
| XEN-LEX-ECO-0012 | Power Factor Bonus | پاداش ضریب قدرت | PF Bonus | Billing | Cos φ incentive |
| XEN-LEX-ECO-0013 | Contracted Capacity | قدرت قراردادی | دیماند قراردادی | Billing | Tavanir |
| XEN-LEX-ECO-0014 | Billing Demand | دیماند صورتحساب | Measured Demand | Billing | — |
| XEN-LEX-ECO-0015 | Maximum Demand | حداکثر دیماند | MD | Billing | — |
| XEN-LEX-ECO-0016 | Service Connection Fee | هزینه انشعاب | Connection Charge | Billing | Tavanir |
| XEN-LEX-ECO-0017 | Electricity Surcharge | عوارض برق | Levy, عوارض | Billing | Regulatory charge |
| XEN-LEX-ECO-0018 | Fuel Adjustment | تعدیل سوخت | Fuel Cost Pass-through | Billing | — |
| XEN-LEX-ECO-0019 | Subsidy | یارانه | Subsidy | Billing | Energy subsidy |
| XEN-LEX-ECO-0020 | Targeted Subsidy | یارانه هدفمند | Targeted Subsidy Plan | Policy | — |
| XEN-LEX-ECO-0021 | Electricity Tax | مالیات برق | VAT, ارزش افزوده | Billing | — |
| XEN-LEX-ECO-0022 | Bill | صورتحساب | Invoice, قبض | Billing | — |
| XEN-LEX-ECO-0023 | Consumption Bill | قبض مصرف | Energy Bill | Billing | — |
| XEN-LEX-ECO-0024 | Cost of Energy | هزینه انرژی | Energy Cost | Economics | — |
| XEN-LEX-ECO-0025 | Levelized Cost | هزینه هم‌تراز | LCOE | Economics | — |
| XEN-LEX-ECO-0026 | Net Present Value | ارزش فعلی خالص | NPV | Economics | — |
| XEN-LEX-ECO-0027 | Internal Rate of Return | نرخ بازگشت داخلی | IRR | Economics | — |
| XEN-LEX-ECO-0028 | Payback Period | دوره بازگشت سرمایه | Payback | Economics | — |
| XEN-LEX-ECO-0029 | Energy Price | قیمت انرژی | Electricity Price | Economics | — |
| XEN-LEX-ECO-0030 | Marginal Price | قیمت نهایی | Marginal Cost | Economics | — |
| XEN-LEX-ECO-0031 | Feed-in Tariff | تعرفه تضمینی | FIT, خرید تضمینی | Renewable | — |
| XEN-LEX-ECO-0032 | Renewable Certificate | گواهی انرژی تجدیدپذیر | REC, گواهی سبز | Renewable | — |
| XEN-LEX-ECO-0033 | Carbon Credit | اعتبار کربن | Carbon Offset | Environment | — |
| XEN-LEX-ECO-0034 | Power Purchase Agreement | قرارداد خرید برق | PPA | Contract | — |
| XEN-LEX-ECO-0035 | Engineering Contract | قرارداد مهندسی | EPC Contract | Contract | — |
| XEN-LEX-ECO-0036 | Engineering Fee | هزینه مهندسی | Consultant Fee | Contract | — |
| XEN-LEX-ECO-0037 | Turnkey Contract | قرارداد کلیدگردان | EPC, Turnkey | Contract | — |
| XEN-LEX-ECO-0038 | Unit Price Contract | قرارداد واحد قیمت | Unit Rate | Contract | — |
| XEN-LEX-ECO-0039 | Lump Sum Contract | قرارداد مقطوع | Fixed Price | Contract | — |
| XEN-LEX-ECO-0040 | Escalation | تعدیل | Price Adjustment | Contract | — |
| XEN-LEX-ECO-0041 | Currency Fluctuation | نوسان ارز | Exchange Rate | Economics | Iran context |
| XEN-LEX-ECO-0042 | Rial | ریال | IRR | Currency | Iran currency |
| XEN-LEX-ECO-0043 | Toman | تومان | 10 Rials | Currency | Informal unit |
| XEN-LEX-ECO-0044 | Fiscal Year | سال مالی | سال بودجه‌ای | Calendar | Iran: Farvardin–Esfand |
| XEN-LEX-ECO-0045 | Budget Year | سال بودجه | Budget Year | Calendar | Persian calendar |
| XEN-LEX-ECO-0046 | Energy Subsidy | یارانه انرژی | Energy Support | Policy | — |
| XEN-LEX-ECO-0047 | Tiered Pricing | قیمت‌گذاری پلکانی | Increasing Block | Tariff | — |
| XEN-LEX-ECO-0048 | Cross Subsidy | یارانه متقاطع | Cross-subsidization | Tariff | — |
| XEN-LEX-ECO-0049 | Lifeline Tariff | تعرفه زندگی | Social Tariff | Tariff | Subsidized basic needs |
| XEN-LEX-ECO-0050 | Cost Reflective Tariff | تعرفه هزینه‌ای | Cost-based Tariff | Tariff | — |
| XEN-LEX-ECO-0051 | Wholesale Electricity Market | بازار عمده‌فروشی برق | Wholesale Market | Market | Iran electricity market |
| XEN-LEX-ECO-0052 | Retail Tariff | تعرفه خرده‌فروشی | Retail | Tariff | — |

## G. Building Electrical — تأسیسات برق ساختمان (40+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-BLD-0001 | Main Distribution Board | تابلو اصلی توزیع | MDB, تابلوی اصلی | Distribution | — |
| XEN-LEX-BLD-0002 | Sub Distribution Board | تابلو فرعی توزیع | SDB, تابلو فرعی | Distribution | — |
| XEN-LEX-BLD-0003 | Final Distribution Board | تابلو نهایی | FDB, کنتورخانه | Distribution | — |
| XEN-LEX-BLD-0004 | Riser | رایزر | Riser, Vertical Feeder | Distribution | — |
| XEN-LEX-BLD-0005 | Socket Outlet | پریز برق | Socket, پریز | Wiring | — |
| XEN-LEX-BLD-0006 | Switch | کلید | Switch, کلید تک‌پل | Wiring | — |
| XEN-LEX-BLD-0007 | Lighting | روشنایی | Illumination | Lighting | — |
| XEN-LEX-BLD-0008 | Luminaire | چراغ | Fixture, Lighting Fixture | Lighting | — |
| XEN-LEX-BLD-0009 | LED Luminaire | چراغ LED | LED | Lighting | — |
| XEN-LEX-BLD-0010 | Emergency Lighting | روشنایی اضطراری | Emergency Light | Lighting | — |
| XEN-LEX-BLD-0011 | Exit Light | چراغ خروج | Exit Sign | Lighting | — |
| XEN-LEX-BLD-0012 | Lux Level | سطح روشنایی | Illuminance | Design | — |
| XEN-LEX-BLD-0013 | Conduit | لوله برق | EMT, IMC, خرطومی, لوله فلزی | Wiring | — |
| XEN-LEX-BLD-0014 | Cable Tray | نردبان کابل | Cable Ladder, Tray | Wiring | — |
| XEN-LEX-BLD-0015 | Trunking | ترانکینگ | Cable Trunking, داکت | Wiring | — |
| XEN-LEX-BLD-0016 | Cable Duct | داکت کابل | Duct | Wiring | — |
| XEN-LEX-BLD-0017 | Earthing System | سیستم ارتینگ | Grounding System | Earthing | — |
| XEN-LEX-BLD-0018 | Earth Electrode | الکترود زمین | میله ارت, چاه ارت | Earthing | — |
| XEN-LEX-BLD-0019 | Earth Pit | چاه ارت | Earth Chamber | Earthing | Iran practice |
| XEN-LEX-BLD-0020 | Earthing Conductor | هادی ارت | Ground Wire | Earthing | — |
| XEN-LEX-BLD-0021 | Equipotential Bonding | هم‌پتانسیل‌سازی | Bonding | Earthing | — |
| XEN-LEX-BLD-0022 | Lightning Rod | برقگیر ساختمانی | Air Terminal, Franklin Rod | Lightning | — |
| XEN-LEX-BLD-0023 | Lightning Protection System | سیستم حفاظت صاعقه | LPS | Lightning | — |
| XEN-LEX-BLD-0024 | Surge Protection Device | محافظ ولتاژ | SPD | Lightning | — |
| XEN-LEX-BLD-0025 | Fire Alarm System | سیستم اعلام حریق | FAS | Safety | — |
| XEN-LEX-BLD-0026 | Smoke Detector | دتکتور دود | Smoke Detector | Fire alarm | — |
| XEN-LEX-BLD-0027 | Heat Detector | دتکتور حرارتی | Thermal Detector | Fire alarm | — |
| XEN-LEX-BLD-0028 | Manual Call Point | شستی اعلام حریق | MCP, Break Glass | Fire alarm | — |
| XEN-LEX-BLD-0029 | Fire Alarm Panel | تابلو اعلام حریق | FACP | Fire alarm | — |
| XEN-LEX-BLD-0030 | Voice Evacuation | اعلام صوتی | Voice Alarm | Fire alarm | — |
| XEN-LEX-BLD-0031 | Light Current | جریان ضعیف | ELV, Extra Low Voltage | Systems | — |
| XEN-LEX-BLD-0032 | Telephone Network | شبکه تلفن | Phone Line | Telecom | — |
| XEN-LEX-BLD-0033 | Data Network | شبکه دیتا | Structured Cabling | Telecom | — |
| XEN-LEX-BLD-0034 | CCTV | دوربین مداربسته | Closed Circuit TV | Security | — |
| XEN-LEX-BLD-0035 | Access Control | کنترل دسترسی | Door Access | Security | — |
| XEN-LEX-BLD-0036 | Load Estimation | تخمین بار | Load Calculation | Design | — |
| XEN-LEX-BLD-0037 | Diversity Factor | ضریب همزمانی | Coincidence Factor | Design | Building load |
| XEN-LEX-BLD-0038 | Single Line Diagram | تک‌خطی | SLD | Drawing | — |
| XEN-LEX-BLD-0039 | Riser Diagram | نمودار رایزر | Riser | Drawing | — |
| XEN-LEX-BLD-0040 | Electrical Room | اتاق برق | Electrical Closet | Space | — |
| XEN-LEX-BLD-0041 | Connection Box | جعبه انشعاب | Junction Box, ترمینال | Wiring | — |
| XEN-LEX-BLD-0042 | Genset | دیزل ژنراتور | Emergency Generator | Backup | — |

## H. Renewable Energy — انرژی تجدیدپذیر (40+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-REN-0001 | Photovoltaic | فتوولتائیک | PV, خورشیدی | Solar | — |
| XEN-LEX-REN-0002 | Solar Panel | پنل خورشیدی | پنل فتوولتائیک, PV Module | Solar | — |
| XEN-LEX-REN-0003 | Monocrystalline | مونوکریستال | Mono, تک‌کریستال | Solar | — |
| XEN-LEX-REN-0004 | Polycrystalline | پلی‌کریستال | Poly, چندکریستال | Solar | — |
| XEN-LEX-REN-0005 | Thin Film | لایه نازک | Thin Film, amorphous | Solar | — |
| XEN-LEX-REN-0006 | Inverter | اینورتر خورشیدی | Solar Inverter | Solar | — |
| XEN-LEX-REN-0007 | String Inverter | اینورتر رشته‌ای | String Inverter | Solar | — |
| XEN-LEX-REN-0008 | Micro Inverter | اینورتر میکرو | Micro Inverter | Solar | — |
| XEN-LEX-REN-0009 | Central Inverter | اینورتر مرکزی | Central | Solar | — |
| XEN-LEX-REN-0010 | MPPT | ردیاب نقطه حداکثر توان | Maximum Power Point Tracking | Solar | — |
| XEN-LEX-REN-0011 | Solar Farm | نیروگاه خورشیدی | Solar Plant, PV Plant | Solar | — |
| XEN-LEX-REN-0012 | Rooftop Solar | خورشیدی بام | Rooftop PV | Solar | — |
| XEN-LEX-REN-0013 | Ground Mount | نصب زمینی | Ground Mount | Solar | — |
| XEN-LEX-REN-0014 | Tracking System | ردیاب خورشیدی | Tracker | Solar | — |
| XEN-LEX-REN-0015 | Wind Turbine | توربین بادی | Wind Turbine | Wind | — |
| XEN-LEX-REN-0016 | Horizontal Axis Wind Turbine | توربین بادی محور افقی | HAWT | Wind | — |
| XEN-LEX-REN-0017 | Vertical Axis Wind Turbine | توربین بادی محور عمودی | VAWT | Wind | — |
| XEN-LEX-REN-0018 | Wind Farm | نیروگاه بادی | Wind Park, Wind Plant | Wind | — |
| XEN-LEX-REN-0019 | Capacity Factor | ضریب ظرفیت | CF | General | — |
| XEN-LEX-REN-0020 | Nameplate Capacity | ظرفیت نامی | Rated Capacity | General | — |
| XEN-LEX-REN-0021 | Energy Storage | ذخیره‌ساز انرژی | ESS, ذخیره انرژی | Storage | — |
| XEN-LEX-REN-0022 | Battery Energy Storage | باتری ذخیره انرژی | BESS | Storage | — |
| XEN-LEX-REN-0023 | Lithium Ion Battery | باتری لیتیوم یون | Li-ion | Storage | — |
| XEN-LEX-REN-0024 | Lead Acid Battery | باتری سرب اسید | Lead Acid | Storage | — |
| XEN-LEX-REN-0025 | Flow Battery | باتری جریانی | Flow Battery | Storage | — |
| XEN-LEX-REN-0026 | State of Charge | وضعیت شارژ | SoC | Storage | — |
| XEN-LEX-REN-0027 | Depth of Discharge | عمق تخلیه | DoD | Storage | — |
| XEN-LEX-REN-0028 | Round Trip Efficiency | راندمان رفت و برگشت | RTE | Storage | — |
| XEN-LEX-REN-0029 | Net Metering | صادرات-واردات | Net Billing, کنتور دوطرفه | Grid | Tavanir term |
| XEN-LEX-REN-0030 | Feed-in Tariff | تعرفه تضمینی خرید | FIT, خرید تضمینی برق | Policy | — |
| XEN-LEX-REN-0031 | Grid Connection | اتصال به شبکه | Interconnection | Grid | — |
| XEN-LEX-REN-0032 | Islanding | جزیره‌ای شدن | Anti-islanding | Grid | — |
| XEN-LEX-REN-0033 | Curtailment | محدودیت تولید | Curtailment | Grid | — |
| XEN-LEX-REN-0034 | Renewable Portfolio Standard | استاندارد سبد انرژی تجدیدپذیر | RPS | Policy | — |
| XEN-LEX-REN-0035 | Green Certificate | گواهی سبز | REC, Renewable Certificate | Policy | — |
| XEN-LEX-REN-0036 | Carbon Footprint | ردپای کربن | Carbon Emission | Environment | — |
| XEN-LEX-REN-0037 | GHG Emission | انتشار گاز گلخانه‌ای | Greenhouse Gas | Environment | — |
| XEN-LEX-REN-0038 | Biogas | بیوگاز | Biogas | Renewable | — |
| XEN-LEX-REN-0039 | Biomass | زیست‌توده | Biomass | Renewable | — |
| XEN-LEX-REN-0040 | Geothermal | زمین‌گرمایی | Geothermal | Renewable | — |
| XEN-LEX-REN-0041 | Distributed Generation | تولید پراکنده | DG, DER | Grid | — |
| XEN-LEX-REN-0042 | Virtual Power Plant | نیروگاه مجازی | VPP | Grid | — |

## I. Industrial Control — کنترل صنعتی (40+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-CTL-0001 | PLC | پی‌ال‌سی | Programmable Logic Controller | Control | — |
| XEN-LEX-CTL-0002 | SCADA | اسکادا | Supervisory Control | Control | — |
| XEN-LEX-CTL-0003 | DCS | دی‌سی‌اس | Distributed Control System | Control | — |
| XEN-LEX-CTL-0004 | RTU | آر‌تی‌یو | Remote Terminal Unit | Control | — |
| XEN-LEX-CTL-0005 | HMI | اچ‌ام‌آی | Human Machine Interface | Control | — |
| XEN-LEX-CTL-0006 | Ladder Logic | نردبانی | Ladder Diagram | PLC | — |
| XEN-LEX-CTL-0007 | Function Block Diagram | بلوک دیاگرام | FBD | PLC | — |
| XEN-LEX-CTL-0008 | Structured Text | متن ساختاریافته | ST | PLC | — |
| XEN-LEX-CTL-0009 | Ladder Diagram | نمودار نردبانی | LD | PLC | — |
| XEN-LEX-CTL-0010 | I/O Module | ماژول ورودی/خروجی | Input/Output | PLC | — |
| XEN-LEX-CTL-0011 | Analog Input | ورودی آنالوگ | AI | PLC | — |
| XEN-LEX-CTL-0012 | Digital Input | ورودی دیجیتال | DI | PLC | — |
| XEN-LEX-CTL-0013 | Analog Output | خروجی آنالوگ | AO | PLC | — |
| XEN-LEX-CTL-0014 | Digital Output | خروجی دیجیتال | DO | PLC | — |
| XEN-LEX-CTL-0015 | Sensor | سنسور | حسگر | Instrument | — |
| XEN-LEX-CTL-0016 | Actuator | عملگر | Actuator | Instrument | — |
| XEN-LEX-CTL-0017 | Transmitter | ترانسمیتر | فرستنده | Instrument | — |
| XEN-LEX-CTL-0018 | Pressure Transmitter | ترانسمیتر فشار | PT | Instrument | — |
| XEN-LEX-CTL-0019 | Temperature Transmitter | ترانسمیتر دما | TT | Instrument | — |
| XEN-LEX-CTL-0020 | Flow Meter | فلومتر | دبی‌سنج | Instrument | — |
| XEN-LEX-CTL-0021 | Level Transmitter | ترانسمیتر سطح | LT | Instrument | — |
| XEN-LEX-CTL-0022 | Proximity Sensor | سنسور مجاورتی | Proximity | Instrument | — |
| XEN-LEX-CTL-0023 | Photoelectric Sensor | سنسور فتوالکتریک | Photoeye | Instrument | — |
| XEN-LEX-CTL-0024 | Modbus | مودباس | Modbus RTU/TCP | Network | — |
| XEN-LEX-CTL-0025 | Profibus | پروفیباس | Profibus DP/PA | Network | — |
| XEN-LEX-CTL-0026 | Profinet | پروفینت | Profinet IO | Network | — |
| XEN-LEX-CTL-0027 | Ethernet/IP | اترنت/آی‌پی | Ethernet Industrial Protocol | Network | — |
| XEN-LEX-CTL-0028 | OPC UA | OPC UA | OPC Unified Architecture | Network | — |
| XEN-LEX-CTL-0029 | Modbus TCP | مودباس TCP | Modbus over Ethernet | Network | — |
| XEN-LEX-CTL-0030 | Fieldbus | فیلدباس | Fieldbus | Network | — |
| XEN-LEX-CTL-0031 | Motor Control Center | مرکز کنترل موتور | MCC | Control | — |
| XEN-LEX-CTL-0032 | Variable Frequency Drive | درایو فرکانس متغیر | VFD, VSD, اینورتر | Drive | — |
| XEN-LEX-CTL-0033 | Soft Starter | سافت‌استارتر | راه‌انداز نرم | Drive | — |
| XEN-LEX-CTL-0034 | Safety Relay | رله ایمنی | Safety | Safety | — |
| XEN-LEX-CTL-0035 | Safety PLC | پی‌ال‌سی ایمنی | Safety Controller | Safety | — |
| XEN-LEX-CTL-0036 | SIL | سطح یکپارچگی ایمنی | Safety Integrity Level | Safety | — |
| XEN-LEX-CTL-0037 | E-Stop | قطع اضطراری | Emergency Stop | Safety | — |
| XEN-LEX-CTL-0038 | Interlock | اینترلاک | قفل‌شدگی | Safety | — |
| XEN-LEX-CTL-0039 | Redundancy | افزونگی | Redundancy | Reliability | — |
| XEN-LEX-CTL-0040 | Process Variable | متغیر فرآیند | PV | Process | — |
| XEN-LEX-CTL-0041 | Setpoint | نقطه تنظیم | SP | Process | — |
| XEN-LEX-CTL-0042 | Control Loop | حلقه کنترل | Loop | Process | — |
| XEN-LEX-CTL-0043 | PID Controller | کنترل‌کننده PID | PID | Process | — |

## J. Smart Grid & Energy Management — شبکه هوشمند و مدیریت انرژی (30+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-SMG-0001 | Smart Grid | شبکه هوشمند | Smart Grid | General | — |
| XEN-LEX-SMG-0002 | Advanced Metering Infrastructure | زیرساخت اندازه‌گیری پیشرفته | AMI | Metering | — |
| XEN-LEX-SMG-0003 | Automatic Meter Reading | قرائت خودکار کنتور | AMR | Metering | — |
| XEN-LEX-SMG-0004 | Demand Response | پاسخ‌گویی بار | DR, Demand Side Management | Management | — |
| XEN-LEX-SMG-0005 | Load Shedding | مدیریت بار | Load Control | Management | — |
| XEN-LEX-SMG-0006 | Demand Side Management | مدیریت سمت مصرف | DSM | Management | — |
| XEN-LEX-SMG-0007 | Energy Efficiency | بهره‌وری انرژی | EE | Management | — |
| XEN-LEX-SMG-0008 | Energy Management System | سیستم مدیریت انرژی | EMS | Management | — |
| XEN-LEX-SMG-0009 | Building Management System | سیستم مدیریت ساختمان | BMS | Building | — |
| XEN-LEX-SMG-0010 | Energy Performance | عملکرد انرژی | Energy Performance | Efficiency | — |
| XEN-LEX-SMG-0011 | Specific Energy Consumption | مصرف ویژه انرژی | SEC | Efficiency | — |
| XEN-LEX-SMG-0012 | Energy Audit | ممیزی انرژی | Audit | Efficiency | — |
| XEN-LEX-SMG-0013 | Energy Baseline | خط پایه انرژی | EnB | ISO 50001 | — |
| XEN-LEX-SMG-0014 | Energy Performance Indicator | شاخص عملکرد انرژی | EnPI | ISO 50001 | — |
| XEN-LEX-SMG-0015 | ISO 50001 | استاندارد ISO 50001 | EnMS | Standard | — |
| XEN-LEX-SMG-0016 | Energy Review | مرور انرژی | Energy Review | ISO 50001 | — |
| XEN-LEX-SMG-0017 | Significant Energy Use | مصرف انرژی قابل‌توجه | SEU | ISO 50001 | — |
| XEN-LEX-SMG-0018 | Distributed Energy Resource | منبع انرژی توزیع‌شده | DER | Grid | — |
| XEN-LEX-SMG-0019 | Virtual Power Plant | نیروگاه مجازی | VPP | Grid | — |
| XEN-LEX-SMG-0020 | Microgrid | ریزشبکه | Microgrid | Grid | — |
| XEN-LEX-SMG-0021 | Island Mode | حالت جزیره‌ای | Islanding | Microgrid | — |
| XEN-LEX-SMG-0022 | Grid Tied | متصل به شبکه | Grid Connected | Microgrid | — |
| XEN-LEX-SMG-0023 | Vehicle to Grid | خودرو به شبکه | V2G | EV | — |
| XEN-LEX-SMG-0024 | Electric Vehicle | خودرو الکتریکی | EV, خودرو برقی | Transport | — |
| XEN-LEX-SMG-0025 | Charging Station | ایستگاه شارژ | EVSE | Transport | — |
| XEN-LEX-SMG-0026 | Smart Charger | شارژر هوشمند | Smart Charging | EV | — |
| XEN-LEX-SMG-0027 | IoT | اینترنت اشیا | Internet of Things | Technology | — |
| XEN-LEX-SMG-0028 | Digital Twin | دوقلوی دیجیتال | Digital Twin | Technology | — |
| XEN-LEX-SMG-0029 | Edge Computing | محاسبات لبه | Edge | Technology | — |
| XEN-LEX-SMG-0030 | Big Data | داده‌های حجیم | Big Data | Technology | — |
| XEN-LEX-SMG-0031 | Machine Learning | یادگیری ماشین | ML | AI | — |
| XEN-LEX-SMG-0032 | Forecasting | پیش‌بینی | Prediction | AI | Load/weather |
| XEN-LEX-SMG-0033 | Anomaly Detection | تشخیص ناهنجاری | Outlier Detection | AI | — |

## K. General Engineering — مهندسی عمومی (30+ terms)

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-GEN-0001 | Calculation | محاسبات | Calculation | General | — |
| XEN-LEX-GEN-0002 | Analysis | تحلیل | Analysis, آنالیز | General | — |
| XEN-LEX-GEN-0003 | Design | طراحی | Design | General | — |
| XEN-LEX-GEN-0004 | Simulation | شبیه‌سازی | Simulation | General | — |
| XEN-LEX-GEN-0005 | Specification | مشخصات فنی | Spec | General | — |
| XEN-LEX-GEN-0006 | Datasheet | دیتاشیت | Data Sheet | General | — |
| XEN-LEX-GEN-0007 | Standard | استاندارد | Standard | General | — |
| XEN-LEX-GEN-0008 | Regulation | مقررات | Regulation, ضابطه | General | — |
| XEN-LEX-GEN-0009 | Code | آیین‌نامه | Code, کد | General | — |
| XEN-LEX-GEN-0010 | Report | گزارش | Report | General | — |
| XEN-LEX-GEN-0011 | Drawing | نقشه | Drawing | General | — |
| XEN-LEX-GEN-0012 | Diagram | دیاگرام | Diagram | General | — |
| XEN-LEX-GEN-0013 | Schematic | شماتیک | Schematic | General | — |
| XEN-LEX-GEN-0014 | Layout | چیدمان | Layout | General | — |
| XEN-LEX-GEN-0015 | Project | پروژه | Project | General | — |
| XEN-LEX-GEN-0016 | Phase | فاز | Phase | General | — |
| XEN-LEX-GEN-0017 | Feasibility Study | مطالعات امکان‌سنجی | Feasibility | General | — |
| XEN-LEX-GEN-0018 | Preliminary Design | طراحی مقدماتی | Conceptual | General | — |
| XEN-LEX-GEN-0019 | Detailed Design | طراحی تفصیلی | Detail | General | — |
| XEN-LEX-GEN-0020 | Construction | ساخت | Construction, نصب | General | — |
| XEN-LEX-GEN-0021 | Commissioning | راه‌اندازی | Commissioning | General | — |
| XEN-LEX-GEN-0022 | Operation | بهره‌برداری | Operation | General | — |
| XEN-LEX-GEN-0023 | Maintenance | نگهداری | Maintenance, نت | General | — |
| XEN-LEX-GEN-0024 | Preventive Maintenance | نگهداری پیشگیرانه | PM | General | — |
| XEN-LEX-GEN-0025 | Corrective Maintenance | نگهداری اصلاحی | CM | General | — |
| XEN-LEX-GEN-0026 | Predictive Maintenance | نگهداری پیش‌بینیانه | PdM | General | — |
| XEN-LEX-GEN-0027 | Quality Assurance | تضمین کیفیت | QA | General | — |
| XEN-LEX-GEN-0028 | Quality Control | کنترل کیفیت | QC | General | — |
| XEN-LEX-GEN-0029 | Inspection | بازرسی | Inspection | General | — |
| XEN-LEX-GEN-0030 | Testing | تست | Testing, آزمون | General | — |
| XEN-LEX-GEN-0031 | Risk Assessment | ارزیابی ریسک | Risk Analysis | General | — |
| XEN-LEX-GEN-0032 | Safety | ایمنی | Safety, HSE | General | — |
| XEN-LEX-GEN-0033 | Environmental | زیست‌محیطی | Environmental | General | — |
| XEN-LEX-GEN-0034 | Procurement | تدارکات | Procurement | General | — |
| XEN-LEX-GEN-0035 | Tender | مناقصه | Tender | General | — |
| XEN-LEX-GEN-0036 | Bid | پیشنهاد | Bid, Offer | General | — |

---

## L. Iranian Energy Sector Terminology — اصطلاحات بخش انرژی ایران

| ID | EN | FA | Aliases | Context | Notes |
|----|----|----|---------|---------|-------|
| XEN-LEX-IRN-0001 | Tavanir | توانیر | Iran Power Generation & Transmission Co. | Utility | State-owned |
| XEN-LEX-IRN-0002 | SATBA | ساتبا | Renewable Energy Organization | Renewable | — |
| XEN-LEX-IRN-0003 | Iran Grid Management Company | شرکت مدیریت شبکه برق ایران | IGMC | Grid | — |
| XEN-LEX-IRN-0004 | Regional Electric Company | شرکت برق منطقه‌ای | REC, برق‌منطقه‌ای | Utility | — |
| XEN-LEX-IRN-0005 | Distribution Company | شرکت توزیع برق | توزیع | Utility | Provincial |
| XEN-LEX-IRN-0006 | Ministry of Energy | وزارت نیرو | توانیر, وزارت نیرو | Government | — |
| XEN-LEX-IRN-0007 | Iran Power Plant Company | شرکت تولید نیروی برق | تولید | Generation | — |
| XEN-LEX-IRN-0008 | Iran Electricity Market | بازار برق ایران | Pool, Market | Market | Wholesale |
| XEN-LEX-IRN-0009 | Power Contract | قرارداد قدرت | دیماند قراردادی | Billing | Tavanir |
| XEN-LEX-IRN-0010 | Demand Charge | هزینه دیماند | Demand Cost | Billing | — |
| XEN-LEX-IRN-0011 | Energy Charge | هزینه انرژی | Consumption Cost | Billing | — |
| XEN-LEX-IRN-0012 | Power Factor Adjustment | تعدیل ضریب قدرت | Cos φ Adjustment | Billing | — |
| XEN-LEX-IRN-0013 | Subsidy Adjustment | تعدیل یارانه | Subsidy Reduction | Billing | — |
| XEN-LEX-IRN-0014 | Season Factor | ضریب فصل | Seasonal Coefficient | Billing | — |
| XEN-LEX-IRN-0015 | Load Factor Discount | تخفیف ضریب بار | Load Factor | Billing | — |
| XEN-LEX-IRN-0016 | Maximum Demand Meter | کنتور حداکثر دیماند | MD Meter | Metering | — |
| XEN-LEX-IRN-0017 | Interval Meter | کنتور دوره‌ای | Time Interval Meter | Metering | 30-min intervals |
| XEN-LEX-IRN-0018 | Persian Calendar | تقویم شمسی | Solar Hijri Calendar | Calendar | Year 1404 etc. |
| XEN-LEX-IRN-0019 | Fiscal Year (Iran) | سال مالی | سال بودجه‌ای | Calendar | Farvardin to Esfand |
| XEN-LEX-IRN-0020 | Iranian Voltage Standard | استاندارد ولتاژ ایران | 20 kV / 400 V / 230 V | Standard | — |
| XEN-LEX-IRN-0021 | 20 kV Distribution | توزیع ۲۰ کیلوولت | MV Distribution | Standard | Primary distribution |
| XEN-LEX-IRN-0022 | 63 kV Sub-transmission | فوق‌توزیع ۶۳ کیلوولت | Sub-transmission | Standard | Iran-specific |
| XEN-LEX-IRN-0023 | Contracted Capacity Letter | نامه قدرت قراردادی | Capacity Letter | Billing | Tavanir document |
| XEN-LEX-IRN-0024 | Service Connection Permit | پروانه انشعاب | انشعاب | Billing | — |
| XEN-LEX-IRN-0025 | Load Allocation | تخصیص بار | Load Assignment | Planning | — |

---

## M. Lexicon → Graph & AI Mapping

Each lexicon entry maps to a `BilingualTerm` node in the Xennic Knowledge Graph with typed translation edges.

### M.1 Node Structure

```
BilingualTerm Node:
  lexicon_id: string     # XEN-LEX-{CAT}-{NNNN}
  en: string             # English term
  fa: string             # Persian term
  aliases: string[]      # Alternative forms
  context: string        # Domain
  embedding_en: float[]  # English embedding vector
  embedding_fa: float[]  # Persian embedding vector
  lang_tag: string       # "en" or "fa"
```

### M.2 Edge Types

| Edge | From | To | Property |
|------|------|----|----------|
| `TRANSLATION_OF` | BilingualTerm (EN) | BilingualTerm (FA) | `{ direction: "en→fa", confidence: 0.95 }` |
| `TRANSLATION_OF` | BilingualTerm (FA) | BilingualTerm (EN) | `{ direction: "fa→en", confidence: 0.95 }` |
| `HAS_ALIAS` | BilingualTerm | BilingualTerm | `{ alias_type: "alternative", lang: "en"|"fa" }` |

### M.3 Embedding Strategy

| Field | Embedding Model | Language Tag | Use Case |
|-------|----------------|--------------|----------|
| `en` | sentence-transformer (all-MiniLM-L6-v2) | `en` | English search queries |
| `fa` | sentence-transformer (paraphrase-multilingual-MiniLM-L12-v2) | `fa` | Persian search queries |
| `aliases[]` | Same model as parent | per alias | Expanded matching |

### M.4 Search Resolution Flow

```
Query (EN or FA)
  ↓
Normalize → strip diacritics, normalize Persian ye/ke
  ↓
Embed query → compare with all BilingualTerm embeddings (cosine similarity)
  ↓
Top N results → filter by confidence threshold (default: 0.75)
  ↓
Return canonical EN + FA with lexicon_id
```

- Queries in either language normalize to canonical FA and EN form.
- When a query term matches an alias, it resolves to the canonical FA/EN pair.
- Persian-specific preprocessing: normalize ی (ye) and ک (ke) characters, remove tashkeel.

### M.5 Graph RAG Integration

```
User Query "ضریب قدرت پایین است"
  ↓
Semantic Search → cosine similarity on embedding_fa
  ↓
Match: BilingualTerm{lexicon_id: XEN-LEX-POW-0004, en: "Power Factor", fa: "ضریب قدرت"}
  ↓
Graph Traversal → TRANSLATION_OF → BilingualTerm{en: "Power Factor"}
  ↓
Expand → SYNONYM_OF → "PF", "Cos φ", "Power Factor"
  ↓
Context Enrich → related nodes: Capacitor Bank, Power Factor Correction, PF Penalty
  ↓
Response Generation → bilingual answer with graph context
```

### M.6 Maintenance

| Action | Trigger | Process |
|--------|---------|---------|
| Add entry | New term gap in ingestion | Generate XEN-LEX-ID → embed both languages → add to graph |
| Update translation | Correction | Update fa field → re-embed → increment PATCH version |
| Deprecate entry | Obsolete term | Set `status: deprecated` → keep in graph for backward queries |
| Merge duplicates | Overlapping entries | Retain lower ID, redirect higher ID → update edges |

New entries are validated by the semantic layer for uniqueness (exact match + fuzzy match checks) before acceptance.
