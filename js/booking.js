
// ── Data ─────────────────────────────────────────────────────
const PROCEDURES = [
  { id:'wisdom',  label:'Wisdom tooth removal' },
  { id:'tooth',   label:'Other tooth removal' },
  { id:'implants',label:'Dental implants' },
  { id:'bone',    label:'Bone graft / sinus lift' },
  { id:'jaw',     label:'Jaw (orthognathic) surgery' },
  { id:'expose',  label:'Orthodontic tooth exposure' },
  { id:'tissue',  label:'Soft tissue procedure' },
  { id:'cyst',    label:'Jaw cyst / bone lesion' },
  { id:'other',   label:'Not sure / other' },
];

const LOCATIONS = [
  { id:'GPH', name:'Greenslopes Private Hospital',     addr:'Newdegate St, Greenslopes' },
  { id:'NW',  name:'North West Private Hospital',      addr:'137 Flockton St, Everton Park' },
  { id:'CAB', name:'Caboolture Private Hospital',      addr:'McKean St, Caboolture' },
  { id:'PEN', name:'Peninsula Private Hospital',       addr:'Cnr George & Florence Sts, Kippa-Ring' },
  { id:'CLE', name:'Ramsay Surgical Centre Cleveland',  addr:'19-21 Middle St, Cleveland' },
  { id:'TH',  name:'Telehealth',                       addr:'Video consultation — anywhere comfortable, and we can walk through your procedure together' },
  { id:'ANY', name:'No preference',                    addr:"If you've left your preferred times and are flexible about where you're seen, we'll match the most suitable location for your schedule." },
];

// ── Dates ────────────────────────────────────────────────────
// A native <input type="date"> renders in the *viewer's* OS locale, which
// puts a US-configured device into mm/dd/yyyy with no way for the page to
// override it. These are Australian patients, so the date fields are plain
// text with a day-first mask instead — same order on every device — and we
// convert to ISO only at the point of submission.

function maskAUDate(el) {
  const digits = el.value.replace(/\D/g, '').slice(0, 8);
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += '/' + digits.slice(2, 4);
  if (digits.length > 4) out += '/' + digits.slice(4, 8);
  el.value = out;
}

// Returns ISO (YYYY-MM-DD) for a valid dd/mm/yyyy, or '' if it isn't a real
// calendar date — the round-trip check rejects 31/02 and friends, which a
// plain regex would happily accept.
function auDateToISO(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((str || '').trim());
  if (!m) return '';
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (d.getFullYear() !== Number(yyyy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return '';
  return `${yyyy}-${mm}-${dd}`;
}

// For dates that arrive back from storage in ISO form.
function fmtDateAU(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

// ── State ─────────────────────────────────────────────────────
let currentStep        = 1;
let selectedProcedures = [];
let selectedLocations  = [];
let referralFile       = null;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildProcGrid();
  buildLocGrid();
});

function buildProcGrid() {
  document.getElementById('proc-grid').innerHTML = PROCEDURES.map(p => `
    <div class="proc-pill" id="pp-${p.id}" onclick="toggleProc('${p.id}')">
      <div class="proc-check" id="pc-${p.id}">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" style="display:none;" id="pcv-${p.id}"><polyline points="1 4 3.5 6.5 9 1"/></svg>
      </div>
      <span style="font-size:13px;color:#1e1a17;font-family:'DM Sans',sans-serif;">${p.label}</span>
    </div>`).join('');
}

function buildLocGrid() {
  document.getElementById('loc-grid').innerHTML = LOCATIONS.map(l => `
    <div class="loc-card${l.comingSoon ? ' loc-card-disabled' : ''}" id="lc-${l.id}"
         ${l.comingSoon ? '' : `onclick="toggleLoc('${l.id}')"`}>
      <div class="loc-dot" id="ld-${l.id}"><div class="loc-dot-inner"></div></div>
      <div>
        <p style="font-size:14px;font-weight:600;color:#1e1a17;font-family:'DM Sans',sans-serif;">
          ${l.name}${l.comingSoon ? ' <span style="font-size:11px;font-weight:600;color:#c4a84a;">· Coming soon</span>' : ''}
        </p>
        <p style="font-size:12px;color:#7a6655;margin-top:2px;font-family:'DM Sans',sans-serif;">${l.addr}</p>
      </div>
    </div>`).join('');
}

function toggleProc(id) {
  const idx = selectedProcedures.indexOf(id);
  if (idx === -1) selectedProcedures.push(id);
  else selectedProcedures.splice(idx, 1);
  document.getElementById('pp-' + id).classList.toggle('selected', selectedProcedures.includes(id));
  document.getElementById('pcv-' + id).style.display = selectedProcedures.includes(id) ? 'block' : 'none';
}

function toggleLoc(id) {
  if (id === 'ANY') {
    selectedLocations = ['ANY'];
  } else {
    selectedLocations = selectedLocations.filter(l => l !== 'ANY');
    const idx = selectedLocations.indexOf(id);
    if (idx === -1 && selectedLocations.length < 2) selectedLocations.push(id);
    else if (idx !== -1) selectedLocations.splice(idx, 1);
  }
  LOCATIONS.forEach(l => {
    document.getElementById('lc-' + l.id).classList.toggle('selected', selectedLocations.includes(l.id));
  });
}

function togglePHI(show) {
  document.getElementById('phi-fields').style.display = show ? 'grid' : 'none';
  // Collapsing the whole block has to take the second fund with it, or a
  // patient who switches Yes → No leaves a stale second fund in the payload.
  if (!show) document.getElementById('fund2-wrap').style.display = 'none';
  else toggleSecondFund();
}

// Hospital and extras with different insurers is common enough for OMS
// patients that we capture both funds rather than one plus a free-text note.
function isSplitCover() {
  return document.getElementById('f-covertype').value === 'Hospital & Extras (different funds)';
}

function toggleSecondFund() {
  document.getElementById('fund2-wrap').style.display = isSplitCover() ? 'block' : 'none';
}

// ── File upload ───────────────────────────────────────────────
function handleFileSelect(input) {
  if (input.files && input.files[0]) setFile(input.files[0]);
}
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.add('drag-over');
}
function handleDragLeave(e) {
  document.getElementById('upload-zone').classList.remove('drag-over');
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
}
function setFile(file) {
  const allowed = ['application/pdf','image/jpeg','image/png'];
  if (!allowed.includes(file.type)) { alert('Please upload a PDF, JPG or PNG file.'); return; }
  if (file.size > 10 * 1024 * 1024) { alert('File is too large. Please upload a file under 10 MB.'); return; }
  referralFile = file;
  document.getElementById('upload-placeholder').style.display = 'none';
  document.getElementById('upload-result').style.display = 'flex';
  document.getElementById('upload-filename').textContent = file.name;
  document.getElementById('upload-zone').classList.add('has-file');
  document.getElementById('e-referral').style.display = 'none';
}
function clearFile(e) {
  e.stopPropagation();
  referralFile = null;
  document.getElementById('f-referral').value = '';
  document.getElementById('upload-placeholder').style.display = 'block';
  document.getElementById('upload-result').style.display = 'none';
  document.getElementById('upload-zone').classList.remove('has-file');
}

// ── Validation ────────────────────────────────────────────────
function showError(id, msg) {
  const el  = document.getElementById('e-' + id);
  const inp = document.getElementById('f-' + id);
  if (el)  { el.style.display = 'block'; if (msg) el.textContent = msg; }
  if (inp) inp.classList.add('invalid');
  return false;
}
function clearError(id) {
  const el  = document.getElementById('e-' + id);
  const inp = document.getElementById('f-' + id);
  if (el)  el.style.display = 'none';
  if (inp) inp.classList.remove('invalid');
}

function validateStep(n) {
  let ok = true;
  if (n === 1) {
    ['firstname','lastname','dob','phone','email','patienttype'].forEach(f => clearError(f));
    if (!document.getElementById('f-firstname').value.trim())  ok = showError('firstname');
    if (!document.getElementById('f-lastname').value.trim())   ok = showError('lastname');
    // The picker used to guarantee a real date; a text field has to check.
    const dobRaw = document.getElementById('f-dob').value.trim();
    if (!dobRaw) ok = showError('dob');
    else if (!auDateToISO(dobRaw)) ok = showError('dob', 'Please enter a valid date as dd/mm/yyyy.');
    if (!document.getElementById('f-phone').value.trim())      ok = showError('phone');
    const em = document.getElementById('f-email').value.trim();
    if (!em || !/\S+@\S+\.\S+/.test(em)) ok = showError('email', 'Please enter a valid email.');
    if (!document.getElementById('f-patienttype').value)       ok = showError('patienttype');
  }
  if (n === 2) {
    clearError('procedure'); clearError('urgency');
    if (selectedProcedures.length === 0) { document.getElementById('e-procedure').style.display = 'block'; ok = false; }
    if (!document.getElementById('f-urgency').value) ok = showError('urgency');
  }
  if (n === 3) {
    const el = document.getElementById('e-location');
    if (selectedLocations.length === 0) { el.style.display = 'block'; ok = false; }
    else el.style.display = 'none';
  }
  if (n === 4) {
    clearError('refname');
    clearError('refdate');
    if (!document.getElementById('f-refname').value.trim()) ok = showError('refname');
    // Optional — but if they typed something it has to be a real date.
    const refRaw = document.getElementById('f-refdate').value.trim();
    if (refRaw && !auDateToISO(refRaw)) ok = showError('refdate', 'Please enter a valid date as dd/mm/yyyy.');
    // The referral letter is no longer required to proceed — patients who
    // don't have a digital copy can still submit and we follow up.
    document.getElementById('e-referral').style.display = 'none';
  }
  return ok;
}

// ── Navigation ────────────────────────────────────────────────
function nextStep(from) {
  if (!validateStep(from)) return;
  if (from === 4) buildReview();
  goTo(from + 1);
}
function prevStep(from) { goTo(from - 1); }

// Direct jump for design preview — no validation
function previewStep(n) { goTo(n); }

function goTo(n) {
  document.getElementById('step-' + currentStep).style.display = 'none';
  const next = document.getElementById('step-' + n);
  next.style.display = 'block';
  next.classList.remove('fade-up');
  void next.offsetWidth;
  next.classList.add('fade-up');
  currentStep = n;
  updateProgress();
  // Scroll to the progress bar, not page top — jumping to (0,0) sent
  // patients back past the hero/nav and away from the form they were
  // filling in every time a step changed.
  const anchor = document.getElementById('prog-wrap');
  if (anchor) {
    const navOffset = 80;
    const top = anchor.getBoundingClientRect().top + window.pageYOffset - navOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

function updateProgress() {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('ps' + i);
    el.classList.remove('active','done');
    if (i < currentStep)        el.classList.add('done');
    else if (i === currentStep) el.classList.add('active');
  }
}

// ── Review ────────────────────────────────────────────────────
function buildReview() {
  const days = ['Mon','Tue','Wed','Thu','Fri']
    .filter(d => document.getElementById('d-' + d.toLowerCase()).checked)
    .join(', ') || 'No preference';
  const phi    = document.querySelector('input[name="phi"]:checked');
  const phiVal = phi ? phi.value : 'no';
  const phiDetail = phiVal === 'yes'
    ? ` — ${document.getElementById('f-phifund').value || 'Not specified'}${document.getElementById('f-covertype').value ? ` (${document.getElementById('f-covertype').value})` : ''}${isSplitCover() && v('phifund2') ? ` + ${v('phifund2')} (extras)` : ''}` : '';

  const rows = [
    ['Name',            v('firstname') + ' ' + v('lastname')],
    ['Date of Birth',   v('dob')],
    ['Phone',           v('phone')],
    ['Email',           v('email')],
    ['Suburb',          v('suburb') || '—'],
    ['Patient type',    v('patienttype')],
    ['Procedures',      selectedProcedures.map(id => PROCEDURES.find(p=>p.id===id)?.label).join(', ')],
    ['Urgency',         v('urgency')],
    ['Time preference', v('timeofday')],
    ['Preferred days',  days],
    ['Location(s)',     selectedLocations.map(id => LOCATIONS.find(l=>l.id===id)?.name).join(', ')],
    ['Referrer',        v('refname') + (v('refpractice') ? ` — ${v('refpractice')}` : '')],
    ['Referral date',   v('refdate') || '—'],
    ["Doctor's Provider Number", v('provider') || '—'],
    ['Referral letter', referralFile ? referralFile.name
                        : document.getElementById('f-noreferral').checked ? "No copy — we'll help arrange one"
                        : '—'],
    ['Health insurance',phiVal === 'yes' ? `Yes${phiDetail}` : phiVal === 'no' ? 'No' : 'Not sure'],
  ];

  document.getElementById('review-content').innerHTML = rows.map(([k, val]) => `
    <div class="review-row">
      <span class="review-key">${k}</span>
      <span class="review-val">${val || '—'}</span>
    </div>`).join('');
}

function v(id) { return (document.getElementById('f-' + id)?.value || '').trim(); }

// ── Submit (Supabase integration pending) ─────────────────────
async function submitForm() {
  const consent = document.getElementById('consent-check');
  const ce      = document.getElementById('e-consent');
  if (!consent.checked) { ce.style.display = 'block'; return; }
  ce.style.display = 'none';

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const days = ['Mon','Tue','Wed','Thu','Fri']
    .filter(d => document.getElementById('d-' + d.toLowerCase()).checked)
    .join(', ') || 'No preference';
  const phi = document.querySelector('input[name="phi"]:checked');

  const payload = {
    first_name:      v('firstname'),
    last_name:        v('lastname'),
    // dob is a Postgres `date` column, so it has to go in as ISO even though
    // the patient typed dd/mm/yyyy. ref_date is stored ISO too, for sorting.
    dob:              auDateToISO(v('dob')) || null,
    phone:            v('phone'),
    email:            v('email'),
    suburb:           v('suburb'),
    patient_type:     v('patienttype'),
    procedures:       selectedProcedures.map(id => PROCEDURES.find(p=>p.id===id)?.label),
    urgency:          v('urgency'),
    time_of_day:      v('timeofday'),
    preferred_days:   days,
    notes:            v('notes'),
    locations:        selectedLocations.map(id => LOCATIONS.find(l=>l.id===id)?.name),
    ref_name:         v('refname'),
    ref_practice:     v('refpractice'),
    ref_date:         auDateToISO(v('refdate')) || null,
    provider_number:  v('provider'),
    phi:              phi ? phi.value : 'no',
    phi_fund:         v('phifund'),
    // The form has always collected a membership number and thrown it away —
    // it was never in the payload, so it never reached the practice.
    phi_num:          v('phinum'),
    phi_cover_type:   v('covertype'),
    phi_fund_2:       isSplitCover() ? v('phifund2') : '',
    phi_num_2:        isSplitCover() ? v('phinum2')  : '',
    no_referral_copy: document.getElementById('f-noreferral').checked,
  };

  try {
    const sb = supabase.createClient(
      'https://mhgdzxftvqpqwpxryurm.supabase.co',
      'sb_publishable_BtGpwhScIGtGO_Yx_LLKow_7HBigtxk'
    );

    // Upload the referral letter first — the row can reference its path,
    // and a failed booking doesn't leave an orphaned file.
    if (referralFile) {
      const path = `${Date.now()}-${referralFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: uploadError } = await sb.storage
        .from('appointment-referral-files')
        .upload(path, referralFile);
      if (uploadError) throw new Error('File upload failed: ' + uploadError.message);
      payload.referral_file_path = path;
    }

    // Generated client-side rather than read back after insert — anon
    // only has INSERT on this table, and .select() after insert needs
    // SELECT too, which 401s for a real visitor even though the row saved.
    const requestId = crypto.randomUUID();
    const { error: insertError } = await sb
      .from('appointment_requests')
      .insert({ id: requestId, ...payload });

    if (insertError) throw new Error('Could not submit your request: ' + insertError.message);

    // The booking is already saved at this point — a failure here means
    // "the practice wasn't emailed," not "the request was lost."
    const { error: notifyError } = await sb.functions.invoke('notify-appointment-request', {
      body: { request_id: requestId }
    });
    if (notifyError) {
      console.warn('Practice notification email failed (booking was still saved):', notifyError);
    }

    showSuccess();
  } catch (err) {
    console.error('Booking submission failed:', err);
    btn.textContent = 'Try again';
    btn.disabled = false;
    alert('Something went wrong sending your request. Please try again, or call the practice directly. ' + (err.message || ''));
  }
}

function showSuccess() {
  document.getElementById('step-5').style.display    = 'none';
  document.getElementById('prog-wrap').style.display = 'none';
  document.getElementById('step-success').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
