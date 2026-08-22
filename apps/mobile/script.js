/**
 * Mobile App — Xennic Vision Integration
 * مرحله فعلی: اتصال مستقیم به vision-service (port 8003) — بدون عضویت و بدون سشن
 * مرحله بعدی (آماده برای اتصال به endpointهای زنیک):
 *   ۱. تغییر VISION به آدرس API اصلی (http://localhost:3000)
 *   ۲. افزودن header Authorization (در صورت نیاز به JWT) یا استفاده از endpoint عمومی
 *   ۳. تنظیم endpointها بر اساس مسیرهای /api/v1/* موجود در apps/api
 */

// پیکربندی اتصال — قابل تغییر برای اتصال به endpointهای پروژه زنیک
const VISION = 'http://localhost:8003';        // سرویس بینایی فعلی
const XENNIC_API = 'http://localhost:3000';     // API اصلی زنیک (آماده برای اتصال آینده)

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

function buildRow(label, value) {
  const safe = value === null || value === undefined ? '—' : String(value);
  return `<tr><td><strong>${label}</strong></td><td>${safe}</td></tr>`;
}

function renderNameplate(data, confidence) {
  const tbody = document.querySelector('#table-nameplate tbody');
  const rows = [
    ['سازنده', data.manufacturer],
    ['مدل', data.model],
    ['شماره سریال', data.serial_number],
    ['سال ساخت', data.year_of_manufacture],
    ['توان (kW)', data.power_kw],
    ['توان (HP)', data.power_hp],
    ['ولتاژ (V)', data.voltage_v],
    ['جریان (A)', data.current_a],
    ['فرکانس (Hz)', data.frequency_hz],
    ['ضریب توان', data.power_factor],
    ['راندمان (%)', data.efficiency_pct],
    ['تعداد قطب', data.poles],
    ['سرعت (RPM)', data.speed_rpm],
    ['کلاس عایق', data.insulation_class],
    ['نوع وظیفه', data.duty_type],
    ['نوع محفظه', data.enclosure_type],
    ['نوع اتصال', data.connection_type],
  ];
  // Merge extra fields
  if (data.extra_fields && typeof data.extra_fields === 'object') {
    for (const [k, v] of Object.entries(data.extra_fields)) {
      rows.push([k, v]);
    }
  }
  tbody.innerHTML = rows.map(r => buildRow(r[0], r[1])).join('');

  const confEl = document.getElementById('conf-nameplate');
  const confVal = confidence !== undefined ? Math.round(confidence * 100) : '--';
  confEl.textContent = 'اطمینان: ' + confVal + '%';
  confEl.style.background = confVal >= 80 ? 'rgba(34,197,94,0.1)' : confVal >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
  confEl.style.color = confVal >= 80 ? '#22c55e' : confVal >= 50 ? '#f59e0b' : '#ef4444';
  confEl.style.borderColor = confVal >= 80 ? 'rgba(34,197,94,0.25)' : confVal >= 50 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)';
}

function renderBill(data, confidence) {
  const tbody = document.querySelector('#table-bill tbody');
  const rows = [
    ['شماره قبض', data.bill_number],
    ['شناسه مشتری', data.customer_id],
    ['نام مشترک', data.customer_name],
    ['آدرس', data.address],
    ['دوره صورتحساب', data.billing_period],
    ['تاریخ صدور', data.issue_date],
    ['تاریخ سررسید', data.due_date],
    ['قرائت قبلی (kWh)', data.previous_reading_kwh],
    ['قرائت فعلی (kWh)', data.current_reading_kwh],
    ['مصرف (kWh)', data.consumption_kwh],
    ['میانگین روزانه', data.average_daily_consumption],
    ['هزینه انرژی', data.energy_charge],
    ['هزینه انتقال', data.transmission_charge],
    ['هزینه توزیع', data.distribution_charge],
    ['مالیات', data.tax],
    ['سایر هزینه‌ها', data.other_charges],
    ['مجموع کل', data.total_amount],
    ['وضعیت پرداخت', data.payment_status],
    ['تاریخ پرداخت', data.payment_date],
  ];
  // Line items as nested list
  if (data.line_items && Array.isArray(data.line_items) && data.line_items.length > 0) {
    rows.push(['جزئیات ردیف‌ها', data.line_items.map(i => i.description + (i.amount ? ' — ' + i.amount : '')).join(' | ')]);
  }
  // Extra fields
  if (data.extra_fields && typeof data.extra_fields === 'object') {
    for (const [k, v] of Object.entries(data.extra_fields)) {
      rows.push([k, v]);
    }
  }
  tbody.innerHTML = rows.map(r => buildRow(r[0], r[1])).join('');

  const confEl = document.getElementById('conf-bill');
  const confVal = confidence !== undefined ? Math.round(confidence * 100) : '--';
  confEl.textContent = 'اطمینان: ' + confVal + '%';
  confEl.style.background = confVal >= 80 ? 'rgba(34,197,94,0.1)' : confVal >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
  confEl.style.color = confVal >= 80 ? '#22c55e' : confVal >= 50 ? '#f59e0b' : '#ef4444';
  confEl.style.borderColor = confVal >= 80 ? 'rgba(34,197,94,0.25)' : confVal >= 50 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)';
}

async function handleFile(module, input) {
  const file = input.files[0];
  if (!file) return;

  const endpoint = module === 'nameplate' ? '/vision/nameplate/read' : '/vision/bill/read';
  const resultId = 'result-' + module;

  document.getElementById(resultId).hidden = false;
  const tbody = document.querySelector('#table-' + module + ' tbody');
  tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#94a3b8">در حال پردازش...</td></tr>';

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', 'read');

    const res = await fetch(VISION + endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('خطای سرور: ' + res.status);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.errors?.join('; ') || 'خطا در پردازش تصویر');
    }

    const data = json.data || {};
    const confidence = json.confidence;

    if (module === 'nameplate') renderNameplate(data, confidence);
    else renderBill(data, confidence);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#ef4444">خطا: ' + err.message + '</td></tr>';
    const confEl = document.getElementById('conf-' + module);
    confEl.textContent = 'خطا در پردازش';
    confEl.style.background = 'rgba(239,68,68,0.1)';
    confEl.style.color = '#ef4444';
    confEl.style.borderColor = 'rgba(239,68,68,0.25)';
  }
}

// Basic drag-over feedback
['file-nameplate', 'file-bill'].forEach(id => {
  const label = document.querySelector('label[for="' + id + '"]');
  label.addEventListener('dragover', (e) => { e.preventDefault(); label.classList.add('dragover'); });
  label.addEventListener('dragleave', () => label.classList.remove('dragover'));
  label.addEventListener('drop', (e) => {
    e.preventDefault();
    label.classList.remove('dragover');
    const dt = new DataTransfer();
    dt.items.add(e.dataTransfer.files[0]);
    document.getElementById(id).files = dt.files;
  });
});
