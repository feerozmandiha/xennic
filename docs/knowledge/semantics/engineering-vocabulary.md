# واژگان مهندسی — Engineering Vocabulary

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Purpose — هدف

Define the official engineering terminology of the Xennic platform. Every term has a unique ID, bilingual name, formal definition, domain classification, and usage rules. This vocabulary is the authoritative source for all term resolution in AI services, knowledge retrieval, and engineering documentation.

---

## Term Structure — ساختار اصطلاح

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `term_id` | String (pattern: `XEN-TERM-{DOMAIN}-{NNNN}`) | ✅ | Unique identifier for the term |
| `name_en` | Text | ✅ | English canonical name |
| `name_fa` | Text | ✅ | Persian canonical name |
| `definition` | Text | ✅ | Formal definition in English (with Persian equivalent in parentheses) |
| `domain` | Array[Enum] | ✅ | Engineering domain codes from taxonomy (1.x.x) |
| `related_concepts` | Array[Text] | Optional | Links to canonical concept IDs from `concepts/canonical-concepts.md` |
| `related_standards` | Array[Text] | Optional | Tier 1–2 standard references (IEC, IEEE, ISIRI, Tavanir, etc.) |
| `allowed_usage` | Text | Optional | Context rules for when to use this term |
| `deprecated_terms` | Array[Text] | Optional | Terms that should NOT be used; replaced by this canonical term |
| `graph_mapping` | Text | Optional | How this term maps to Knowledge Graph entities and concepts |
| `embedding_note` | Text | Optional | Guidance for embedding — which term form to use for vector indexing |

---

## 1. Power Systems — سیستم‌های قدرت (1.1.x)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-PWR-0001 | Active Power | توان اکتیو | The real component of electrical power that performs useful work, measured in watts (W). (بخش واقعی توان الکتریکی که کار مفید انجام می‌دهد) | 1.1 | XEN-CON-POWER-QUALITY-006 | IEC 60050-131 | Real Power |
| XEN-TERM-PWR-0002 | Reactive Power | توان راکتیو | The imaginary component of electrical power that sustains electromagnetic fields, measured in VAR. (بخش موهومی توان الکتریکی که میدان‌های الکترومغناطیسی را حفظ می‌کند) | 1.1 | XEN-CON-POWER-QUALITY-006 | IEC 60050-131 | — |
| XEN-TERM-PWR-0003 | Apparent Power | توان ظاهری | The vector sum of active and reactive power, measured in VA. (مجموع برداری توان اکتیو و راکتیو) | 1.1 | — | IEC 60050-131 | — |
| XEN-TERM-PWR-0004 | Power Factor | ضریب توان | The ratio of active power to apparent power, indicating how efficiently electrical power is used. (نسبت توان اکتیو به توان ظاهری) | 1.1 | XEN-CON-POWER-QUALITY-006 | IEC 60050-131, IEEE 519 | PF |
| XEN-TERM-PWR-0005 | Load Flow | پخش بار | Steady-state analysis of voltage magnitudes and phase angles in a power network under given generation and load conditions. (تحلیل حالت ماندگار ولتاژ و زاویه فاز در شبکه قدرت) | 1.1 | XEN-CON-LOAD-FLOW-002 | IEC 60038, IEEE 399 | Power Flow |
| XEN-TERM-PWR-0006 | Short Circuit | اتصال کوتاه | An unintentional connection between two or more conductive points at different potentials, resulting in excessive current flow. (اتصال ناخواسته بین دو یا چند نقطه با پتانسیل متفاوت) | 1.1, 1.2 | XEN-CON-SHORT-CIRCUIT-001 | IEC 60909, IEEE C37.010 | SC, Fault |
| XEN-TERM-PWR-0007 | Voltage Regulation | تنظیم ولتاژ | The ability of a system to maintain constant voltage under varying load conditions, expressed as a percentage. (توانایی سیستم در حفظ ولتاژ ثابت در شرایط بار متغیر) | 1.1 | XEN-CON-VOLTAGE-DROP-003 | IEC 60038 | VR |
| XEN-TERM-PWR-0008 | Frequency | فرکانس | The number of complete AC cycles per second, measured in hertz (Hz). Iran's nominal grid frequency is 50 Hz. (تعداد سیکل‌های کامل در ثانیه) | 1.1 | — | IEC 60038, Tavanir Grid Code | f |
| XEN-TERM-PWR-0009 | Phase | فاز | One of the conductors carrying alternating current in a polyphase system, typically three phases in power systems (R, S, T or L1, L2, L3). (یکی از هادی‌های حامل جریان متناوب در سیستم چندفازه) | 1.1 | — | IEC 60050-141 | — |
| XEN-TERM-PWR-0010 | Neutral | نول | The reference point of a polyphase system that carries unbalanced current and provides a return path. (نقطه مرجع سیستم چندفازه که جریان نامتعادل را حمل می‌کند) | 1.1 | — | IEC 60364 | N |
| XEN-TERM-PWR-0011 | Grid | شبکه برق | The interconnected network of generation, transmission, and distribution systems that supplies electrical power. (شبکه به‌هم‌پیوسته تولید، انتقال و توزیع برق) | 1.1 | — | IEC 60050-601 | Power Grid, Utility Network |
| XEN-TERM-PWR-0012 | Islanding | جزیره‌ای شدن | A condition where a distributed generator continues to energize a portion of the grid after the main supply is disconnected. (شرایطی که ژنراتور پراکنده پس از قطع شبکه اصلی به تغذیه بخشی از شبکه ادامه می‌دهد) | 1.1, 1.8 | — | IEEE 1547, Tavanir DG Regulation | — |
| XEN-TERM-PWR-0013 | Synchronization | سنکرون‌سازی | The process of matching voltage, frequency, and phase angle of a generator to the grid before connection. (فرآیند هماهنگ‌سازی ولتاژ، فرکانس و زاویه فاز ژنراتور با شبکه) | 1.1 | — | IEC 60034, IEEE 1547 | Synch |
| XEN-TERM-PWR-0014 | Load Shedding | قطع بار | The deliberate reduction of load to maintain grid stability during generation deficit or contingency events. (کاهش عمدی بار برای حفظ پایداری شبکه) | 1.1, 1.1.5 | — | IEEE C37.117, Tavanir Grid Code | UFLS |
| XEN-TERM-PWR-0015 | Black Start | راه‌اندازی سیاه | The procedure to restore a power station or grid from a complete shutdown without external power supply. (روش راه‌اندازی نیروگاه یا شبکه از حالت خاموش کامل بدون منبع تغذیه خارجی) | 1.1 | — | IEEE 1547, Tavanir Grid Code | — |

---

## 2. Protection — حفاظت (1.2.x)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-PROT-0001 | Overcurrent | جریان زیاد | A protection function that operates when current exceeds a predetermined threshold above rated value. (تابع حفاظتی که هنگام عبور جریان از آستانه تعیین شده عمل می‌کند) | 1.2 | XEN-CON-PROT-COORD-004 | IEEE C37.112, IEC 60255 | OC |
| XEN-TERM-PROT-0002 | Earth Fault | خطای زمین | A fault condition where current flows from a phase conductor to earth through an unintended path. (شرایط خطا که جریان از فاز به زمین از مسیر ناخواسته عبور می‌کند) | 1.2 | — | IEC 60255, IEEE C37.91 | Ground Fault, EF |
| XEN-TERM-PROT-0003 | Differential Protection | حفاظت تفاضلی | A protection scheme based on the comparison of currents entering and leaving a protected zone. (طرح حفاظتی مبتنی بر مقایسه جریان‌های ورودی و خروجی از منطقه حفاظت شده) | 1.2 | — | IEEE C37.91, IEC 60255 | Diff |
| XEN-TERM-PROT-0004 | Distance Protection | حفاظت دیستانس | A protection function that measures impedance to a fault and operates based on distance from the relay location. (تابع حفاظتی که ایمپدانس تا خطا را اندازه‌گیری کرده و بر اساس فاصله عمل می‌کند) | 1.2 | — | IEEE C37.113, IEC 60255 | Distance Relay, 21 |
| XEN-TERM-PROT-0005 | Directional Protection | حفاظت جهتی | A protection function that operates based on the direction of fault current flow relative to a reference point. (تابع حفاظتی که بر اساس جهت جریان خطا نسبت به نقطه مرجع عمل می‌کند) | 1.2 | — | IEEE C37.113, IEC 60255 | Directional OC, 67 |
| XEN-TERM-PROT-0006 | Block | بلاک | A control signal that prevents a protection element from operating under specific conditions. (سیگنال کنترلی که از عملکرد المان حفاظتی در شرایط خاص جلوگیری می‌کند) | 1.2 | — | IEEE C37.2 | Blocking |
| XEN-TERM-PROT-0007 | Trip | تریپ | A command signal that causes a circuit breaker to open and isolate a faulted circuit. (سیگنال فرمان که باعث باز شدن کلید و جداسازی مدار خطادار می‌شود) | 1.2 | — | IEEE C37.2 | — |
| XEN-TERM-PROT-0008 | Close | فرمان بستن | A command signal that causes a circuit breaker to close and energize a circuit. (سیگنال فرمان که باعث بستن کلید و برقدار شدن مدار می‌شود) | 1.2 | — | IEEE C37.2 | — |
| XEN-TERM-PROT-0009 | Pickup | پیکاپ | The threshold value at which a protection element starts to operate. (مقدار آستانه‌ای که المان حفاظتی در آن شروع به کار می‌کند) | 1.2 | — | IEEE C37.112, IEC 60255 | Pick-up, Start |
| XEN-TERM-PROT-0010 | Dropout | دراپ‌اوت | The value below which a protection element resets after having picked up. (مقداری که المان حفاظتی پس از پیکاپ در آن بازنشانی می‌شود) | 1.2 | — | IEEE C37.112 | Reset |
| XEN-TERM-PROT-0011 | Time Dial | تایم دیال | A multiplier that adjusts the operating time of an inverse-time overcurrent relay. (ضریبی که زمان عملکرد رله جریان زیاد معکوس را تنظیم می‌کند) | 1.2 | — | IEEE C37.112, IEC 60255 | TMS, Time Multiplier |
| XEN-TERM-PROT-0012 | Plug Setting | تنظیم پلاگ | The current tap setting on an electromechanical relay that determines the pickup current. (تنظیم تپ جریان روی رله الکترومکانیکی که جریان پیکاپ را تعیین می‌کند) | 1.2 | — | IEEE C37.112 | Tap Setting |
| XEN-TERM-PROT-0013 | Relay Coordination | هماهنگی رله | The systematic selection of relay settings to ensure selective fault clearance while minimizing disruption to the healthy network. (انتخاب سیستماتیک تنظیمات رله برای اطمینان از قطع انتخابی خطا) | 1.2 | XEN-CON-PROT-COORD-004 | IEEE 242, IEC 60909 | Protection Coordination |
| XEN-TERM-PROT-0014 | Zone | زون | A defined section of a power system protected by a specific protection scheme with clear boundaries. (بخش مشخصی از سیستم قدرت که توسط طرح حفاظتی معینی محافظت می‌شود) | 1.2 | — | IEEE C37.113 | Protection Zone |
| XEN-TERM-PROT-0015 | Reach | ریچ | The maximum distance (impedance) along a line that a distance protection element can detect faults. (حداکثر فاصله (ایمپدانس) در طول خط که المان حفاظتی دیستانس می‌تواند خطا را تشخیص دهد) | 1.2 | — | IEEE C37.113 | — |

---

## 3. Distribution — توزیع (1.1.3)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-DIST-0001 | Feeder | فیدر | A medium-voltage circuit that supplies power from a substation to distribution points or end users. (مدار فشار متوسط که برق را از پست به نقاط توزیع یا مصرف‌کنندگان منتقل می‌کند) | 1.1.3 | — | IEC 60050-601 | — |
| XEN-TERM-DIST-0002 | Distributor | توزیع‌کننده | A low-voltage conductor from which service connections are taken to supply individual consumers. (هادی فشار ضعیف که انشعابات سرویس به مصرف‌کنندگان از آن گرفته می‌شود) | 1.1.3 | — | IEC 60050-601 | — |
| XEN-TERM-DIST-0003 | Service Mains | سرویس اصلی | The underground cable or overhead conductor connecting the distribution network to a consumer's premises. (کابل زمینی یا هوایی که شبکه توزیع را به محل مصرف‌کننده متصل می‌کند) | 1.1.3 | — | IEC 60364 | Service Line |
| XEN-TERM-DIST-0004 | RMU | آر‌ام‌یو (Ring Main Unit) | A factory-assembled, sealed switchgear unit used in MV distribution networks for ring configuration. (یونیت سوئیچ‌گیر کارخانه‌ای و مهر و موم شده برای شبکه توزیع فشار متوسط به صورت حلقه) | 1.1.3 | — | IEC 62271-200 | Ring Main Unit |
| XEN-TERM-DIST-0005 | Sectionalizer | سکشنالایزر | A switching device that automatically isolates a faulted section of a distribution line after a recloser has opened. (دستگاه کلیدزنی که به طور خودکار بخش خطادار خط توزیع را جدا می‌کند) | 1.1.3 | — | IEEE C37.63 | — |
| XEN-TERM-DIST-0006 | Recloser | ریکلوزر | An automatic switching device that interrupts and re-energizes a circuit to clear temporary faults. (دستگاه کلیدزنی خودکار که برای رفع خطاهای موقتی مدار را قطع و وصل می‌کند) | 1.1.3 | — | IEEE C37.60 | Auto-recloser |
| XEN-TERM-DIST-0007 | Fuse Cutout | کات‌اوت فیوز | An overhead distribution protection device combining a fuse element with a visible disconnect. (دستگاه حفاظتی خطوط هوایی توزیع شامل المان فیوز با قطع‌کننده قابل مشاهده) | 1.1.3 | — | IEEE C37.42, ISIRI | Cutout, Dropout Fuse |
| XEN-TERM-DIST-0008 | Distribution Transformer | ترانسفورماتور توزیع | A transformer that steps down voltage from MV to LV for final delivery to consumers. (ترانسفورماتوری که ولتاژ را از فشار متوسط به فشار ضعیف برای مصرف‌کننده کاهش می‌دهد) | 1.1.3, 1.7.2 | XEN-CON-TRANSFORMER-SIZE-008 | IEC 60076, ISIRI 1-3 | DT |
| XEN-TERM-DIST-0009 | Pole | پایه | A vertical structure supporting overhead distribution lines and associated equipment. (سازه عمودی حامل خطوط هوایی توزیع و تجهیزات وابسته) | 1.1.3 | — | IEC 60364 | Utility Pole |
| XEN-TERM-DIST-0010 | Underground Cable | کابل زمینی | A cable installed below ground level for power distribution, protected from environmental exposure. (کابل نصب شده در زیر زمین برای توزیع برق) | 1.1.3, 1.4.1 | XEN-CON-CABLE-SIZE-009 | IEC 60502, ISIRI 607 | UG Cable |
| XEN-TERM-DIST-0011 | Overhead Line | خط هوایی | An unsulated or insulated conductor suspended on poles or towers for power transmission or distribution. (هادی لخت یا عایق‌دار آویخته بر پایه‌ها یا دکل‌ها) | 1.1.3 | — | IEC 60364, IEC 60050-601 | OHL, O/H Line |
| XEN-TERM-DIST-0012 | Conductor | هادی | A material that allows the flow of electrical current, typically copper or aluminum in power systems. (ماده‌ای که عبور جریان الکتریکی را ممکن می‌سازد) | 1.1.3 | — | IEC 60050-121 | — |
| XEN-TERM-DIST-0013 | Service Drop | انشعاب سرویس | The overhead conductor from the distribution pole to the consumer's building. (هادی هوایی از پایه توزیع تا ساختمان مصرف‌کننده) | 1.1.3 | — | IEC 60364, ISIRI | — |

---

## 4. Transmission — انتقال (1.1.2)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-TRN-0001 | Transmission Line | خط انتقال | An overhead or underground line operating at HV/EHV that carries bulk power between substations over long distances. (خط هوایی یا زمینی فشار قوی/فوق فشار قوی برای انتقال عمده برق بین پست‌ها) | 1.1.2 | — | IEC 60050-601, IEEE 738 | TL |
| XEN-TERM-TRN-0002 | EHV | فرافشار (EHV) | Extra High Voltage — voltage levels above 230 kV and up to 800 kV for bulk power transmission. (سطوح ولتاژ بالای ۲۳۰ کیلوولت تا ۸۰۰ کیلوولت) | 1.1.2 | — | IEC 60038, IEEE 1313 | Extra High Voltage |
| XEN-TERM-TRN-0003 | HVAC | جریان متناوب فشار قوی | High Voltage Alternating Current — the conventional method for AC power transmission at high voltages. (روش معمول انتقال برق با جریان متناوب در ولتاژهای بالا) | 1.1.2 | — | IEC 60038 | — |
| XEN-TERM-TRN-0004 | HVDC | جریان مستقیم فشار قوی | High Voltage Direct Current — a transmission technology using DC for long-distance or submarine power transfer. (تکنولوژی انتقال با جریان مستقیم برای مسافت‌های طولانی یا زیر دریا) | 1.1.2 | — | IEC 60038, IEEE 1313 | — |
| XEN-TERM-TRN-0005 | Tower | دکل | A tall steel lattice or tubular structure supporting overhead transmission line conductors. (سازه بلند فولادی مشبک یا لوله‌ای حامل هادی‌های خطوط انتقال) | 1.1.2 | — | IEEE 951, IEC 60826 | Transmission Tower, Pylon |
| XEN-TERM-TRN-0006 | Insulator | مقره | A non-conductive device that supports and separates live conductors from grounded structures. (وسیله غیرهادی که هادی‌های برقدار را از سازه‌های ارت جدا می‌کند) | 1.1.2 | — | IEC 60383, ISIRI | — |
| XEN-TERM-TRN-0007 | Conductor Bundle | باندل هادی | A configuration of multiple sub-conductors per phase used in EHV lines to reduce corona and reactance. (چیدمان چند هادی فرعی در هر فاز برای کاهش کرونا و راکتانس) | 1.1.2 | — | IEEE 738 | Bundle |
| XEN-TERM-TRN-0008 | Corona | کرونا | Partial electrical discharge that occurs when electric field strength exceeds the breakdown threshold of air around conductors. (تخلیه الکتریکی جزئی هنگام عبور شدت میدان الکتریکی از آستانه شکست هوا) | 1.1.2 | — | IEEE 1313, IEC 60050-121 | — |
| XEN-TERM-TRN-0009 | Sag | افتادگی | The vertical distance between the lowest point of a suspended conductor and the straight line between its support points. (فاصله عمودی بین پایین‌ترین نقطه هادی آویخته و خط راست بین نقاط تکیه‌گاه) | 1.1.2 | — | IEEE 738, IEC 60826 | Conductor Sag |
| XEN-TERM-TRN-0010 | Tension | کشش | The longitudinal mechanical force applied to a conductor to maintain proper sag and clearance. (نیروی مکانیکی طولی اعمال شده به هادی برای حفظ افتادگی و فاصله مناسب) | 1.1.2 | — | IEEE 738, IEC 60826 | Mechanical Tension |
| XEN-TERM-TRN-0011 | Series Compensation | جبران‌سازی سری | Series capacitors installed in transmission lines to reduce inductive reactance and increase power transfer capacity. (خازن‌های سری نصب شده در خطوط انتقال برای کاهش راکتانس القایی) | 1.1.2 | — | IEEE 824, IEC 60143 | SC |
| XEN-TERM-TRN-0012 | Shunt Reactor | راکتور شنت | An inductive device connected to a transmission line to absorb reactive power and control voltage rise. (وسیله القایی متصل به خط انتقال برای جذب توان راکتیو و کنترل افزایش ولتاژ) | 1.1.2 | — | IEC 60076-6, IEEE C57.21 | — |
| XEN-TERM-TRN-0013 | Shunt Capacitor | خازن شنت | A capacitor bank connected to a transmission or distribution bus for reactive power compensation. (بانک خازنی متصل به باس انتقال یا توزیع برای جبران‌سازی توان راکتیو) | 1.1.2 | — | IEEE 18, IEC 60871 | SC Bank |
| XEN-TERM-TRN-0014 | Line Trap | تله خط | A tuned LC circuit inserted in series with a transmission line to block carrier communication frequencies. (مدار LC تنظیم شده در سری با خط برای مسدود کردن فرکانس‌های مخابرات حامل) | 1.1.2 | — | IEC 60353 | Wave Trap |
| XEN-TERM-TRN-0015 | Coupling Capacitor | خازن کوپلاژ | A capacitor used to connect power line carrier (PLC) equipment to HV transmission lines. (خازن برای اتصال تجهیزات PLC به خطوط انتقال فشار قوی) | 1.1.2 | — | IEC 60358 | CC, PLC Capacitor |

---

## 5. Renewable Energy — انرژی تجدیدپذیر (1.8.x)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-REN-0001 | Solar PV | فتوولتائیک خورشیدی | A technology that converts sunlight directly into electrical energy using semiconducting photovoltaic cells. (فناوری تبدیل مستقیم نور خورشید به انرژی الکتریکی با سلول‌های نیمه‌هادی) | 1.8.1 | — | IEC 61215, IEC 61730 | Solar Panel |
| XEN-TERM-REN-0002 | Inverter | اینورتر | A power electronic device that converts DC to AC for grid connection or standalone operation. (دستگاه الکترونیک قدرت که DC را به AC تبدیل می‌کند) | 1.8.1, 1.8.4 | — | IEC 62109, IEEE 1547 | Solar Inverter |
| XEN-TERM-REN-0003 | String | استرینگ | A series-connected group of solar PV panels that together produce DC power at a specified voltage. (گروه سری از پنل‌های فتوولتائیک که با هم توان DC در ولتاژ مشخص تولید می‌کنند) | 1.8.1 | — | IEC 61215, IEC 62548 | PV String |
| XEN-TERM-REN-0004 | Array | آرایه | A complete assembly of PV panels consisting of multiple strings connected in parallel. (مجموعه کامل پنل‌های فتوولتائیک از چند استرینگ موازی) | 1.8.1 | — | IEC 61215, IEC 62548 | PV Array |
| XEN-TERM-REN-0005 | MPPT | ردیاب نقطه حداکثر توان | Maximum Power Point Tracking — an algorithm that continuously adjusts the operating point to extract maximum power from a PV array. (الگوریتم تنظیم مداوم نقطه کار برای استخراج حداکثر توان) | 1.8.1 | — | IEC 62109, IEEE 1547 | Maximum Power Point Tracker |
| XEN-TERM-REN-0006 | Irradiance | تابش | The power of solar radiation incident on a surface per unit area, measured in W/m². (توان تابش خورشید بر سطح واحد) | 1.8.1 | — | IEC 60904 | Solar Irradiance, GHI |
| XEN-TERM-REN-0007 | Capacity Factor | ضریب ظرفیت | The ratio of actual energy produced over a period to the maximum possible energy at rated capacity. (نسبت انرژی تولیدی واقعی به حداکثر انرژی ممکن در ظرفیت نامی) | 1.8 | — | IEEE 1547 | CF |
| XEN-TERM-REN-0008 | Wind Turbine | توربین بادی | A rotating machine that converts kinetic energy of wind into electrical energy. (ماشین دواری که انرژی جنبشی باد را به انرژی الکتریکی تبدیل می‌کند) | 1.8.2 | — | IEC 61400 | WT |
| XEN-TERM-REN-0009 | Nacelle | ناسل | The housing at the top of a wind turbine tower that contains the generator, gearbox, and other components. (محفظه بالای برج توربین بادی شامل ژنراتور، گیربکس و سایر اجزا) | 1.8.2 | — | IEC 61400 | — |
| XEN-TERM-REN-0010 | Blade Pitch | گام پره | The angle of the wind turbine blades relative to the rotor plane, adjusted to control power output. (زاویه پره‌های توربین بادی نسبت به صفحه روتور برای کنترل توان خروجی) | 1.8.2 | — | IEC 61400 | Pitch Angle |
| XEN-TERM-REN-0011 | Battery Energy Storage | ذخیره‌ساز انرژی باتری | A system that stores electrical energy in electrochemical cells for later discharge. (سیستمی که انرژی الکتریکی را در سلول‌های الکتروشیمیایی ذخیره کرده و بعد تخلیه می‌کند) | 1.8.3 | — | IEC 62619, IEEE 1547 | BESS |
| XEN-TERM-REN-0012 | C-Rate | نرخ C | The rate at which a battery is charged or discharged relative to its rated capacity. (نرخ شارژ یا دشارژ باتری نسبت به ظرفیت نامی) | 1.8.3 | — | IEC 62619 | C Rate |
| XEN-TERM-REN-0013 | Depth of Discharge | عمق دشارژ | The percentage of battery capacity that has been discharged relative to total capacity. (درصد ظرفیت باتری تخلیه شده نسبت به ظرفیت کل) | 1.8.3 | — | IEC 62619 | DoD |
| XEN-TERM-REN-0014 | State of Charge | وضعیت شارژ | The current charge level of a battery expressed as a percentage of its full capacity. (سطح شارژ فعلی باتری به درصد ظرفیت کامل) | 1.8.3 | — | IEC 62619 | SoC |
| XEN-TERM-REN-0015 | Round Trip Efficiency | راندمان رفت و برگشت | The ratio of energy retrieved from a storage system to the energy put in, expressed as a percentage. (نسبت انرژی خروجی از ذخیره‌ساز به انرژی ورودی) | 1.8.3 | — | IEC 62619 | RTE |

---

## 6. Electrical Machines — ماشین‌های الکتریکی (1.6.x)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-MCH-0001 | Stator | استاتور | The stationary part of an electrical machine that contains the main winding and magnetic circuit. (بخش ثابت ماشین الکتریکی که سیم‌پیچ اصلی و مدار مغناطیسی را دارد) | 1.6 | — | IEC 60034 | — |
| XEN-TERM-MCH-0002 | Rotor | روتور | The rotating part of an electrical machine that interacts with the stator magnetic field. (بخش دوار ماشین الکتریکی که با میدان مغناطیسی استاتور تعامل دارد) | 1.6 | — | IEC 60034 | — |
| XEN-TERM-MCH-0003 | Air Gap | فاصله هوایی | The physical gap between the stator and rotor of an electrical machine through which magnetic flux passes. (شکاف فیزیکی بین استاتور و روتور که شار مغناطیسی از آن عبور می‌کند) | 1.6 | — | IEC 60034 | — |
| XEN-TERM-MCH-0004 | Field Winding | سیم‌پیچ میدان | The winding that produces the main magnetic field in a synchronous machine or DC machine. (سیم‌پیچی که میدان مغناطیسی اصلی را در ماشین سنکرون یا DC تولید می‌کند) | 1.6 | — | IEC 60034 | Excitation Winding |
| XEN-TERM-MCH-0005 | Armature | آرمیچر | The winding where the main voltage is induced by the magnetic field, typically on the rotor of DC machines and stator of AC machines. (سیم‌پیچی که ولتاژ اصلی در آن القا می‌شود) | 1.6 | — | IEC 60034 | — |
| XEN-TERM-MCH-0006 | Commutator | کموتاتور | A mechanical rectifier on DC machine rotors that converts AC induced in the armature to DC at the brushes. (یکسوکننده مکانیکی روی روتور ماشین DC که جریان متناوب را به DC تبدیل می‌کند) | 1.6 | — | IEC 60034 | — |
| XEN-TERM-MCH-0007 | Slip | لغزش | The difference between synchronous speed and rotor speed in an induction motor, expressed as a percentage. (تفاوت سرعت سنکرون و سرعت روتور در موتور القایی) | 1.6 | — | IEC 60034 | s |
| XEN-TERM-MCH-0008 | Torque | گشتاور | The rotational force produced by a motor or required by a load, measured in N·m. (نیروی دورانی تولید شده توسط موتور یا مورد نیاز بار) | 1.6 | — | IEC 60034 | — |
| XEN-TERM-MCH-0009 | Efficiency | راندمان | The ratio of mechanical output power to electrical input power of a motor or generator. (نسبت توان خروجی مکانیکی به توان ورودی الکتریکی) | 1.6 | — | IEC 60034-30 | η |
| XEN-TERM-MCH-0010 | Starting Current | جریان راه‌اندازی | The high current drawn by a motor during the initial acceleration period, typically 5–7 times the full load current. (جریان بالای کشیده شده توسط موتور در دوره شتاب اولیه) | 1.6 | — | IEC 60034 | Inrush Current, LRC |
| XEN-TERM-MCH-0011 | Locked Rotor | روتور قفل | A condition where the motor rotor is prevented from turning while voltage is applied. (شرایطی که روتور موتور از چرخش جلوگیری می‌شود) | 1.6 | — | IEC 60034 | Locked Rotor Condition |
| XEN-TERM-MCH-0012 | Full Load | بار کامل | The operating condition where a machine delivers its rated power output. (شرایط کاری که ماشین توان خروجی نامی خود را تحویل می‌دهد) | 1.6 | — | IEC 60034 | Rated Load |
| XEN-TERM-MCH-0013 | No Load | بی‌باری | The operating condition where a machine runs without any connected load. (شرایط کاری که ماشین بدون هیچ باری کار می‌کند) | 1.6 | — | IEC 60034 | — |
| XEN-TERM-MCH-0014 | Rated Power | توان نامی | The maximum continuous output power a machine is designed to deliver under specified conditions. (حداکثر توان خروجی مداوم که ماشین در شرایط مشخص تحویل می‌دهد) | 1.6 | — | IEC 60034 | Pn, Nominal Power |
| XEN-TERM-MCH-0015 | Power Factor (Machine) | ضریب توان (ماشین) | The ratio of real power to apparent power drawn by a motor from the supply, varying with load. (نسبت توان حقیقی به ظاهری کشیده شده توسط موتور) | 1.6 | XEN-CON-POWER-QUALITY-006 | IEC 60034 | PF, Cos φ |

---

## 7. Power Electronics — الکترونیک قدرت (cross-domain)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-PEL-0001 | Rectifier | یکسوکننده | A power electronic circuit that converts AC to DC. (مدار الکترونیک قدرت که AC را به DC تبدیل می‌کند) | 1.6.3, 1.8 | — | IEC 60146, IEEE 519 | — |
| XEN-TERM-PEL-0002 | Inverter | اینورتر | A power electronic circuit that converts DC to AC at a desired frequency and voltage. (مدار الکترونیک قدرت که DC را به AC در فرکانس و ولتاژ مطلوب تبدیل می‌کند) | 1.6.3, 1.8 | — | IEC 60146, IEEE 519 | VFD Inverter |
| XEN-TERM-PEL-0003 | Converter | مبدل | A general term for any power electronic circuit that changes voltage, current, or frequency form. (اصطلاح عمومی برای هر مدار الکترونیک قدرت که شکل ولتاژ، جریان یا فرکانس را تغییر می‌دهد) | 1.6.3, 1.8 | — | IEC 60146 | Power Converter |
| XEN-TERM-PEL-0004 | Thyristor | تریستور | A four-layer semiconductor switching device that can be triggered into conduction by a gate signal. (قطعه نیمه‌هادی چهارلایه که با سیگنال گیت هدایت می‌شود) | 1.6.3 | — | IEC 60747 | SCR |
| XEN-TERM-PEL-0005 | IGBT | آی‌جی‌بی‌تی | Insulated Gate Bipolar Transistor — a voltage-controlled power semiconductor with high input impedance and low on-state voltage. (ترانزیستور دوقطبی با گیت عایق) | 1.6.3, 1.8 | — | IEC 60747 | IGCT (related) |
| XEN-TERM-PEL-0006 | MOSFET | ماسفت | Metal-Oxide-Semiconductor Field Effect Transistor — a voltage-controlled device used in low to medium power switching applications. (ترانزیستور اثر میدانی اکسید-فلز-نیمه‌هادی) | 1.6.3 | — | IEC 60747 | Power MOSFET |
| XEN-TERM-PEL-0007 | Diode | دیود | A two-terminal semiconductor device that conducts current in only one direction. (قطعه نیمه‌هادی دوپایه که جریان را فقط در یک جهت هدایت می‌کند) | 1.6.3 | — | IEC 60747 | Power Diode |
| XEN-TERM-PEL-0008 | PWM | مدولاسیون پهنای پالس | Pulse Width Modulation — a technique for controlling power delivery by varying the duty cycle of switching signals. (تکنیک کنترل توان با تغییر چرخه وظیفه سیگنال‌های کلیدزنی) | 1.6.3, 1.8 | — | IEEE 519 | Pulse Width Modulation |
| XEN-TERM-PEL-0009 | Harmonic Filter | فیلتر هارمونیک | A passive or active device that attenuates specific harmonic frequencies in power systems. (دستگاه غیرفعال یا فعال که فرکانس‌های هارمونیک خاص را تضعیف می‌کند) | 1.1.4, 1.6.3 | XEN-CON-HARMONICS-007 | IEEE 519, IEC 61000 | Filter |
| XEN-TERM-PEL-0010 | Snubber | اسنابر | A protective RC or RCD circuit that limits voltage spikes and dv/dt across power semiconductor devices. (مدار حفاظتی RC یا RCD که پیک ولتاژ را محدود می‌کند) | 1.6.3 | — | IEC 60146 | — |
| XEN-TERM-PEL-0011 | DC Link | لینک DC | The intermediate DC bus in a power converter system that stores energy and provides a stable DC voltage between rectifier and inverter stages. (باس DC میانی در مبدل که بین مراحل یکسوکننده و اینورتر انرژی ذخیره می‌کند) | 1.6.3, 1.8 | — | IEC 60146 | DC Bus |
| XEN-TERM-PEL-0012 | Switching Frequency | فرکانس کلیدزنی | The rate at which a power semiconductor device switches on and off, determining harmonic content and switching losses. (نرخ روشن و خاموش شدن قطعات نیمه‌هادی قدرت) | 1.6.3 | — | IEC 60146 | fsw |
| XEN-TERM-PEL-0013 | Duty Cycle | چرخه وظیفه | The ratio of on-time to total switching period in a PWM signal, expressed as a percentage. (نسبت زمان روشن به دوره کل در سیگنال PWM) | 1.6.3 | — | IEC 60146 | D |
| XEN-TERM-PEL-0014 | Boost | بوست | A DC-DC converter topology that steps up voltage from input to output. (توپولوژی مبدل DC-DC افزاینده ولتاژ) | 1.6.3, 1.8 | — | IEC 60146 | Step-Up Converter |
| XEN-TERM-PEL-0015 | Buck | باک | A DC-DC converter topology that steps down voltage from input to output. (توپولوژی مبدل DC-DC کاهنده ولتاژ) | 1.6.3 | — | IEC 60146 | Step-Down Converter |

---

## 8. Measurement — اندازه‌گیری (cross-domain)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-MEAS-0001 | CT | ترانسفورماتور جریان | Current Transformer — an instrument transformer that steps down high current for measurement and protection. (ترانسفورماتور ابزاری که جریان بالا را برای اندازه‌گیری کاهش می‌دهد) | 1.2, 1.5 | — | IEC 61869, IEEE C57.13 | Current Transformer |
| XEN-TERM-MEAS-0002 | PT | ترانسفورماتور ولتاژ | Potential Transformer — an instrument transformer that steps down high voltage for measurement and protection. (ترانسفورماتور ابزاری که ولتاژ بالا را کاهش می‌دهد) | 1.2, 1.5 | — | IEC 61869, IEEE C57.13 | VT, Voltage Transformer |
| XEN-TERM-MEAS-0003 | Meter | کنتور | A device that measures electrical energy consumption or other electrical parameters. (وسیله اندازه‌گیری مصرف انرژی الکتریکی یا پارامترهای دیگر) | 1.1.5 | — | IEC 62053, ISIRI | Energy Meter, Electric Meter |
| XEN-TERM-MEAS-0004 | Transducer | ترانسدیوسر | A device that converts one form of energy or signal to another for measurement or control purposes. (وسیله تبدیل یک شکل انرژی یا سیگنال به دیگری) | 1.10.2 | — | IEC 60688 | Sensor (in measurement context) |
| XEN-TERM-MEAS-0005 | Accuracy Class | کلاس دقت | A classification that defines the maximum allowable error of an instrument transformer or meter. (طبقه‌بندی که حداکثر خطای مجاز ترانسفورماتور ابزاری یا کنتور را تعریف می‌کند) | 1.2, 1.5 | — | IEC 61869, IEC 62053 | Class |
| XEN-TERM-MEAS-0006 | Burden | باردن | The load impedance connected to the secondary of an instrument transformer, expressed in VA. (امپدانس بار متصل به ثانویه ترانسفورماتور ابزاری) | 1.2 | — | IEC 61869 | VA Burden |
| XEN-TERM-MEAS-0007 | Ratio | نسبت | The turns ratio of an instrument transformer relating primary to secondary values. (نسبت دور ترانسفورماتور ابزاری) | 1.2 | — | IEC 61869 | CT Ratio, PT Ratio |
| XEN-TERM-MEAS-0008 | Phase Angle Error | خطای زاویه فاز | The angular difference between primary and secondary phasors in an instrument transformer. (اختلاف زاویه بین فازور اولیه و ثانویه در ترانسفورماتور ابزاری) | 1.2 | — | IEC 61869, IEEE C57.13 | φ Error |
| XEN-TERM-MEAS-0009 | Power Analyzer | تحلیل‌گر توان | A digital instrument that measures and records power quality parameters including harmonics, flicker, and transients. (ابزار دیجیتال اندازه‌گیری و ثبت پارامترهای کیفیت توان) | 1.1.4 | XEN-CON-POWER-QUALITY-006 | IEC 61000-4-30 | PQ Analyzer, Power Quality Analyzer |
| XEN-TERM-MEAS-0010 | Oscilloscope | اسیلوسکوپ | An electronic test instrument that displays changing signal voltages as waveforms. (ابزار تست الکترونیکی که ولتاژهای متغیر را به صورت شکل موج نمایش می‌دهد) | 1.2 | — | — | Scope, O-Scope |
| XEN-TERM-MEAS-0011 | Data Logger | دیتا لاگر | An electronic device that records measurements over time for subsequent analysis. (دستگاه الکترونیکی ثبت اندازه‌گیری‌ها در طول زمان) | 1.1.5, 1.10.2 | — | — | Logger |
| XEN-TERM-MEAS-0012 | SCADA | اسکادا | Supervisory Control and Data Acquisition — a system for remote monitoring and control of industrial processes and power networks. (سیستم نظارت و کنترل از راه دور فرآیندهای صنعتی و شبکه برق) | 1.10.1, 1.1 | — | IEC 60870, IEC 61850, IEEE C37.1 | — |

---

## 9. Energy Management — مدیریت انرژی (1.1.5 + cross-domain)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-ENM-0001 | Demand | دیماند | The average electrical power consumed over a specified interval, typically measured in kW. (میانگین توان الکتریکی مصرف شده در بازه مشخص) | 1.1.5 | XEN-CON-DEMAND-010 | IEC 60050-601, Tavanir Tariff | Maximum Demand |
| XEN-TERM-ENM-0002 | Load Profile | پروفایل بار | A graphical or tabular representation of electrical load variation over time. (نمایش گرافیکی یا جدولی تغییرات بار الکتریکی در طول زمان) | 1.1.5 | XEN-CON-ENERGY-CONSUMPTION-011 | IEC 62053 | Load Curve |
| XEN-TERM-ENM-0003 | Peak Demand | دیماند اوج | The highest demand recorded over a specified period, used for tariff and capacity planning. (بیشترین دیماند ثبت شده در دوره مشخص) | 1.1.5 | XEN-CON-DEMAND-010 | Tavanir Tariff | Peak Load |
| XEN-TERM-ENM-0004 | Energy Consumption | مصرف انرژی | The total electrical energy used over a period, measured in kWh or MWh. (کل انرژی الکتریکی مصرف شده در یک دوره) | 1.1.5 | XEN-CON-ENERGY-CONSUMPTION-011 | IEC 62053 | Consumption |
| XEN-TERM-ENM-0005 | Load Factor | ضریب بار | The ratio of average load to peak load over a specified period. (نسبت بار متوسط به بار اوج در دوره مشخص) | 1.1.5 | — | IEEE 141 | LF |
| XEN-TERM-ENM-0006 | Diversity Factor | ضریب همزمانی | The ratio of the sum of individual maximum demands to the maximum demand of the entire system. (نسبت مجموع حداکثر دیماندهای فردی به حداکثر دیماند کل سیستم) | 1.1.5 | — | IEEE 141, Tavanir Regulation | Coincidence Factor (inverse) |
| XEN-TERM-ENM-0007 | Demand Factor | ضریب دیماند | The ratio of maximum demand to the total connected load of a system. (نسبت حداکثر دیماند به مجموع بار نصب شده) | 1.1.5 | — | IEEE 141 | DF |
| XEN-TERM-ENM-0008 | Utilization Factor | ضریب بهره‌برداری | The ratio of the maximum demand of a system to the rated capacity of the system. (نسبت حداکثر دیماند سیستم به ظرفیت نامی سیستم) | 1.1.5 | — | IEEE 141 | UF |
| XEN-TERM-ENM-0009 | Load Management | مدیریت بار | Techniques and strategies to control or shift electrical load to improve system efficiency and reduce peak demand. (روش‌ها و استراتژی‌های کنترل یا جابجایی بار) | 1.1.5 | — | — | LM |
| XEN-TERM-ENM-0010 | DSM | مدیریت سمت تقاضا | Demand Side Management — programs and actions by utilities to influence consumer electricity usage patterns. (برنامه‌ها و اقدامات شرکت برق برای تأثیر بر الگوی مصرف) | 1.1.5 | — | IEC 62053, ISO 50001 | Demand Side Management |
| XEN-TERM-ENM-0011 | Energy Audit | ممیزی انرژی | A systematic inspection and analysis of energy use in a facility to identify efficiency opportunities. (بازرسی و تحلیل سیستماتیک مصرف انرژی در تأسیسات) | 1.1.5 | — | ISO 50002 | Audit |
| XEN-TERM-ENM-0012 | Benchmarking | محک‌زنی | The process of comparing energy performance against a reference or standard. (فرآیند مقایسه عملکرد انرژی با مرجع یا استاندارد) | 1.1.5 | — | ISO 50006, IPMVP | Energy Benchmarking |
| XEN-TERM-ENM-0013 | Baseline | خط پایه | A reference energy consumption level used to measure savings from efficiency measures. (سطح مرجع مصرف انرژی برای اندازه‌گیری صرفه‌جویی) | 1.1.5 | — | IPMVP, ISO 50015 | Energy Baseline |
| XEN-TERM-ENM-0014 | M&V | اندازه‌گیری و تأیید | Measurement and Verification — the process of quantifying energy savings achieved by efficiency projects. (فرآیند کمی‌سازی صرفه‌جویی انرژی حاصل از پروژه‌های بهینه‌سازی) | 1.1.5 | — | IPMVP, ISO 50015 | Measurement & Verification |
| XEN-TERM-ENM-0015 | ISO 50001 | ایزوی ۵۰۰۰۱ | International standard for energy management systems (EnMS) providing a framework for continuous energy performance improvement. (استاندارد بین‌المللی سیستم مدیریت انرژی) | 1.1.5 | — | ISO 50001 | EnMS |

---

## 10. Smart Grid — هوشمندسازی شبکه (cross-domain)

| term_id | name_en | name_fa | definition | domain | related_concepts | related_standards | deprecated_terms |
|---------|---------|---------|------------|--------|-----------------|-------------------|------------------|
| XEN-TERM-SMG-0001 | Smart Meter | کنتور هوشمند | An advanced meter that records energy consumption at intervals and communicates data bidirectionally to the utility. (کنتور پیشرفته با ثبت مصرف در بازه‌های زمانی و ارتباط دوطرفه با شرکت برق) | 1.1.5 | — | IEC 62052, IEC 62056, ISIRI | AMI Meter |
| XEN-TERM-SMG-0002 | AMI | زیرساخت اندازه‌گیری پیشرفته | Advanced Metering Infrastructure — an integrated system of smart meters, communications, and data management for bidirectional utility-customer interaction. (سیستم یکپارچه کنتورهای هوشمند، ارتباطات و مدیریت داده) | 1.1.5 | — | IEC 62056, IEEE 2030.5 | AMI |
| XEN-TERM-SMG-0003 | DER | منابع انرژی پراکنده | Distributed Energy Resources — small-scale power generation or storage units connected to the distribution network. (واحدهای تولید یا ذخیره مقیاس کوچک متصل به شبکه توزیع) | 1.8 | — | IEEE 1547, IEC 61850 | Distributed Generation, DG |
| XEN-TERM-SMG-0004 | VPP | نیروگاه مجازی | Virtual Power Plant — an aggregation of DERs managed as a single power plant for grid services. (تجمیع منابع انرژی پراکنده که به عنوان یک نیروگاه واحد مدیریت می‌شود) | 1.8, 1.1 | — | IEC 62786 | Virtual Power Plant |
| XEN-TERM-SMG-0005 | Microgrid | ریزشبکه | A localized group of loads and energy resources that can operate connected to or independently from the main grid. (گروه محلی از بارها و منابع انرژی که می‌تواند متصل یا مستقل از شبکه اصلی کار کند) | 1.8, 1.1 | — | IEEE 2030.7, IEC 62898 | μGrid |
| XEN-TERM-SMG-0006 | Demand Response | پاسخگویی بار | A program that incentivizes consumers to reduce or shift electricity usage during peak periods. (برنامه تشویقی مصرف‌کنندگان برای کاهش یا جابجایی مصرف در زمان اوج) | 1.1.5 | — | IEEE 2030.5, IEC 62786 | DR |
| XEN-TERM-SMG-0007 | Net Metering | اندازه‌گیری خالص | A billing mechanism that credits solar or DG owners for excess electricity fed back to the grid. (مکانیزم صورتحساب که مالکان خورشیدی را برای برق تزریقی به شبکه اعتبار می‌دهد) | 1.8.4 | — | Tavanir Net Metering Regulation | — |
| XEN-TERM-SMG-0008 | Time of Use | زمان مصرف | A tariff structure where electricity prices vary by time of day to reflect generation costs. (ساختار تعرفه‌ای که قیمت برق بر اساس زمان روز متغیر است) | 1.1.5 | — | Tavanir Tariff | ToU, TOU |
| XEN-TERM-SMG-0009 | Dynamic Pricing | قیمت‌گذاری پویا | A tariff where electricity prices change in real-time based on wholesale market conditions. (تعرفه‌ای که قیمت برق در زمان واقعی بر اساس شرایط بازار تغییر می‌کند) | 1.1.5 | — | IEEE 2030.5 | Real-Time Pricing |
| XEN-TERM-SMG-0010 | Grid Edge | لبه شبکه | The interface between the utility distribution system and customer-side resources, including DERs and smart loads. (مرز بین سیستم توزیع شرکت برق و منابع سمت مشتری) | 1.1 | — | IEEE 1547 | Edge of Grid |
| XEN-TERM-SMG-0011 | Fault Location | مکان‌یابی خطا | Techniques for determining the geographic location of a fault on a distribution or transmission line. (روش‌های تعیین موقعیت جغرافیایی خطا روی خط توزیع یا انتقال) | 1.2, 1.1 | — | IEEE C37.114 | FL |
| XEN-TERM-SMG-0012 | Self Healing | خودترمیمی | The ability of a smart grid to automatically detect, isolate, and restore service after a fault without human intervention. (توانایی شبکه هوشمند در تشخیص، جداسازی و بازیابی خودکار پس از خطا) | 1.1 | — | IEEE 2030.7 | FLISR |
| XEN-TERM-SMG-0013 | State Estimation | تخمین حالت | A mathematical algorithm that estimates the current operating state of a power system from available measurements. (الگوریتم ریاضی تخمین وضعیت جاری سیستم قدرت از اندازه‌گیری‌های موجود) | 1.1 | — | IEEE C37.118 | SE |
| XEN-TERM-SMG-0014 | PMU | واحد اندازه‌گیری فازور | Phasor Measurement Unit — a device that measures synchronized voltage and current phasors using GPS time reference. (دستگاه اندازه‌گیری فازورهای ولتاژ و جریان هماهنگ با GPS) | 1.1 | — | IEEE C37.118 | Synchrophasor |
| XEN-TERM-SMG-0015 | Synchrophasor | سنکروفازور | A time-synchronized phasor measurement that captures both magnitude and phase angle with a common time reference. (فازور هماهنگ که بزرگی و زاویه فاز را با مرجع زمانی مشترک اندازه‌گیری می‌کند) | 1.1 | — | IEEE C37.118 | — |

---

## Iranian Terminology Context — بافت اصطلاحات ایرانی

Iran's power industry operates under a unique regulatory and technical framework. The following section documents terms, references, and variations specific to the Iranian context.

### Tavanir-Specific Terms (اصطلاحات اختصاصی توانیر)

| Iranian Term | Equivalent EN | FA Description | Xennic Canonical ID | Notes |
|-------------|---------------|----------------|---------------------|-------|
| دیماند | Demand (maximum) | میانگین توان مصرفی در بازه ۳۰ دقیقه‌ای که مبنای صورتحساب است | XEN-TERM-ENM-0001 | Tavanir uses 30-minute integration; differs from 15-minute in some jurisdictions |
| ضریب همزمانی | Diversity Factor | نسبت مجموع حداکثر دیماندهای مشترکان به دیماند کل پست | XEN-TERM-ENM-0006 | Tavanir publishes specific factors for residential, commercial, industrial |
| قدرت قراردادی | Contract Capacity | دیماند توافق شده بین مشترک و شرکت توزیع در قرارداد | XEN-TERM-ENM-0001 (variant) | Used in tariff calculations; subject to penalty if exceeded |
| دیماند قرائت شده | Measured Demand | حداکثر دیماند ثبت شده توسط کنتور در دوره صورتحساب | XEN-TERM-ENM-0003 | Basis for actual billing demand |
| پیک‌سایی | Peak Shaving | کاهش دیماند در ساعات پیک با مدیریت مصرف یا ذخیره‌ساز | XEN-TERM-ENM-0009 | — |
| ضریب بار | Load Factor | نسبت انرژی مصرفی به حاصل‌ضرب دیماند در ساعت | XEN-TERM-ENM-0005 | Key tariff parameter in Iran |

### ISIRI Standard References (مراجع استاندارد ISIRI)

| ISIRI Standard | Title EN | Title FA | Equivalent International | Domain |
|---------------|----------|----------|------------------------|--------|
| ISIRI 1-3 | Voltage Levels | سطوح ولتاژ | IEC 60038 | 1.1 |
| ISIRI 607 | Power Cables | کابل‌های قدرت | IEC 60502 | 1.4.1 |
| ISIRI 132 | Earthing Systems | سیستم‌های ارتینگ | IEEE 80, IEC 62305 | 1.3.1 |
| ISIRI 108 | Protection Relays | رله‌های حفاظتی | IEC 60255 | 1.2.2 |
| ISIRI 1-6 | Standard Voltages | ولتاژهای استاندارد | IEC 60038 | 1.1 |
| ISIRI 19000 | Energy Management | مدیریت انرژی | ISO 50001 | 1.1.5 |

### Regional Distribution Company Terminology Variations (تفاوت‌های منطقه‌ای)

| Term | Company A (Tehran) | Company B (Bakhtar) | Company C (Mazandaran) | Canonical |
|------|-------------------|---------------------|----------------------|----------|
| Demand | دیماند | دیماند | دیماند | XEN-TERM-ENM-0001 |
| Contract Capacity | قدرت قراردادی | ظرفیت قراردادی | قدرت قراردادی | XEN-TERM-ENM-0001 (variant) |
| Energy Bill | صورتحساب برق | قبوض برق | قبض برق | — |
| Peak Hours | ساعات اوج | ساعات پیک | ساعات اوج | — |
| Low Load Hours | ساعات کم‌باری | ساعات غیرپیک | ساعات کم‌باری | — |

### Persian Tariff Terminology (اصطلاحات تعرفه‌ای ایران)

| Persian Term | EN Translation | Description |
|-------------|----------------|-------------|
| قیمت نهایی برق | Final Electricity Price | Total price per kWh including all components |
| هزینه سوخت | Fuel Cost | Cost component reflecting fuel used in thermal generation |
| عوارض | Levies | Government-imposed charges on electricity consumption |
| دیماند اشتراک | Subscription Demand | Base demand level included in fixed charge |
| قیمت انرژی | Energy Price | Price per kWh for active energy consumption |
| قیمت دیماند | Demand Price | Price per kW of demand |
| هزینه انتقال | Transmission Cost | Cost of high-voltage transmission network |
| هزینه توزیع | Distribution Cost | Cost of medium/low-voltage distribution network |
| جریمه دیماند | Demand Penalty | Penalty for exceeding contracted demand |
| پیک‌سایی | Peak Shaving | Reduction of peak demand through management |

### Differences from IEC Terminology (تفاوت‌ها با اصطلاحات IEC)

| Aspect | Iranian Practice | International (IEC) Equivalent | Implication |
|--------|-----------------|-------------------------------|-------------|
| Primary Distribution Voltage | 20 kV | 11 kV / 33 kV | Equipment selection differs; 20 kV is standard in Iran |
| Secondary Distribution | 400/230 V (3-phase 4-wire) | 400/230 V (similar, but earthing varies) | TN-C-S more common in Iran |
| EHV Levels | 132 kV / 230 kV / 400 kV | 110 kV / 220 kV / 400 kV | 132 kV and 230 kV differ from IEC 60038 preferred values |
| Earthing System | TN-C-S predominantly | TN, TT, IT per IEC 60364 | Neutral grounding practices differ |
| Protection Philosophy | Distance + O/C + E/F | Similar but Tavanir-specific coordination intervals | Relay settings based on Tavanir directives |
| Transformer Standard Taps | ±2.5% (Iran) | ±2.5% (IEC 60076) | Similar but specific tap ranges per Tavanir |
| Frequency Tolerance | 50 Hz ± 0.5 Hz | 50 Hz ± 1% (IEC 60038) | Tighter tolerance in Iran |
| Metering Interval | 30 minutes | 15 minutes (Europe) / 60 minutes (some) | Impacts demand calculation for tariffs |

---

## Semantic Layer → Graph Mapping — نگاشت لایه معنایی به گراف

Each term in the engineering vocabulary is designed for direct mapping to a Knowledge Graph. The following conventions govern the graph representation:

### Node Mapping

| Semantic Element | Graph Element | Label | Properties |
|-----------------|---------------|-------|------------|
| Term (canonical) | Node | `SemanticTerm` | `term_id`, `name_en`, `name_fa`, `definition`, `domain`, `allowed_usage` |
| Term (deprecated) | Node | `DeprecatedTerm` | `term_id`, `name_en`, `name_fa`, `definition`, `superseded_by` |
| Domain (from taxonomy) | Node | `Domain` | `code` (1.x.x), `name_fa`, `name_en` |
| Standard reference | Node | `Standard` | `standard_id`, `title`, `tier`, `edition` |
| Canonical Concept | Node | `Concept` | `concept_id`, `name_en`, `name_fa` |

### Edge Mapping

| Source | Target | Edge Type | Description |
|--------|--------|-----------|-------------|
| `SemanticTerm` | `Domain` | `CLASSIFIED_UNDER` | Term belongs to a taxonomy domain |
| `SemanticTerm` | `Concept` | `REFERENCES_CONCEPT` | Term maps to a canonical concept |
| `DeprecatedTerm` | `SemanticTerm` (canonical) | `DEPRECATED_BY` | Deprecated term replaced by canonical |
| `SemanticTerm` | `SemanticTerm` (synonym) | `EQUIVALENT_TO` | Synonym relationship between terms |
| `SemanticTerm` | `Standard` | `REFERENCED_IN` | Term is defined or referenced by a standard |
| `SemanticTerm` | `SemanticTerm` (related) | `RELATED_TERM` | General related-term relationship |

### Embedding Strategy

| Priority | Text Source | Use Case |
|----------|-------------|----------|
| **Primary** | `name_en + ": " + definition` | Vector search index for English queries |
| **Secondary** | `name_fa + ": " + definition` | Vector search index for Persian queries |
| **Tertiary** | `name_en` only | Fast lookup, autocomplete |
| **Metadata** | `term_id`, `domain`, `related_standards` | Graph traversal, filtering, hybrid retrieval |

### Query Resolution Flow

```
User Query (FA or EN)
  → Pre-processing: acronym expansion, unit normalization, fuzzy matching
    → Bilingual lexicon lookup (FA → canonical OR EN → canonical)
      → Canonical term ID resolved
        → Embedding search on primary/secondary text
        → Graph traversal for context (domain, standards, concepts)
          → Combined result to AI service
```

### Graph RAG Query Examples

| Query Type | Pattern | Example |
|------------|---------|---------|
| **Synonym expansion** | MATCH (d:DeprecatedTerm)-[:DEPRECATED_BY]->(c:SemanticTerm) RETURN c | Find canonical term for "Power Flow" |
| **Domain grouping** | MATCH (t:SemanticTerm)-[:CLASSIFIED_UNDER]->(d:Domain {code: '1.1.3'}) RETURN t | All distribution terms |
| **Concept bridging** | MATCH (t:SemanticTerm)-[:REFERENCES_CONCEPT]->(c:Concept) RETURN t, c | Terms that reference short-circuit concept |
| **Standard cross-ref** | MATCH (t:SemanticTerm)-[:REFERENCED_IN]->(s:Standard) WHERE s.tier = 1 RETURN t, s | Terms validated by Tier 1 standards |
| **Multilingual lookup** | MATCH (t:SemanticTerm) WHERE t.name_fa CONTAINS 'دیماند' OR t.name_en CONTAINS 'demand' RETURN t | Cross-language term discovery |

---

## Term Index — نمایه اصطلاحات

| Domain | Code | Count | Start ID |
|--------|------|-------|----------|
| Power Systems | 1.1.x | 15 | XEN-TERM-PWR-0001 |
| Protection | 1.2.x | 15 | XEN-TERM-PROT-0001 |
| Distribution | 1.1.3 | 13 | XEN-TERM-DIST-0001 |
| Transmission | 1.1.2 | 15 | XEN-TERM-TRN-0001 |
| Renewable Energy | 1.8.x | 15 | XEN-TERM-REN-0001 |
| Electrical Machines | 1.6.x | 15 | XEN-TERM-MCH-0001 |
| Power Electronics | cross-domain | 15 | XEN-TERM-PEL-0001 |
| Measurement | cross-domain | 12 | XEN-TERM-MEAS-0001 |
| Energy Management | 1.1.5 + cross | 15 | XEN-TERM-ENM-0001 |
| Smart Grid | cross-domain | 15 | XEN-TERM-SMG-0001 |
| **Total** | — | **145+** | — |

---

## Version History — تاریخچه نسخه

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Tir 1405 | Initial draft — 145+ engineering terms across 10 domains, Iranian terminology context, and graph mapping |

---

> For the conceptual model that these terms reference, see `concepts/canonical-concepts.md`. For the taxonomy domain codes used in term classification, see `governance/taxonomy.md`.
