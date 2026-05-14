
// ── Data ─────────────────────────────────────────────────────
const PROCEDURES = [
  { id:'wisdom',  label:'Wisdom tooth removal' },
  { id:'implants',label:'Dental implants' },
  { id:'bone',    label:'Bone graft / sinus lift' },
  { id:'jaw',     label:'Jaw (orthognathic) surgery' },
  { id:'expose',  label:'Orthodontic tooth exposure' },
  { id:'tissue',  label:'Soft tissue procedure' },
  { id:'cyst',    label:'Jaw cyst / bone lesion' },
  { id:'prepros', label:'Pre-prosthetic surgery' },
  { id:'other',   label:'Not sure / other' },
];

const LOCATIONS = [
  { id:'GPH', name:'Greenslopes Private Hospital',     addr:'Newdegate St, Greenslopes' },
  { id:'NW',  name:'North West Private Hospital',      addr:'137 Flockton St, Everton Park' },
  { id:'CAB', name:'Caboolture Private Hospital',      addr:'McKean St, Caboolture' },
  { id:'PEN', name:'Peninsula Private Hospital',       addr:'Cnr George & Florence Sts, Kippa-Ring' },
  { id:'BPV', name:'Brisbane Private Hospital',        addr:'259 Wickham Tce, Spring Hill' },
  { id:'CLE', name:'Wisdom Surgery Clinic Cleveland',  addr:'Cleveland' },
  { id:'TH',  name:'Telehealth',                       addr:'Video consultation — anywhere comfortable, and we can walk through your procedure together' },
  { id:'ANY', name:'No preference',                    addr:"If you've left your preferred times and are flexible about where you're seen, we'll match the most suitable location for your schedule." },
];

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
    <div class="loc-card" id="lc-${l.id}" onclick="toggleLoc('${l.id}')">
      <div class="loc-dot" id="ld-${l.id}"><div class="loc-dot-inner"></div></div>
      <div>
        <p style="font-size:14px;font-weight:600;color:#1e1a17;font-family:'DM Sans',sans-serif;">${l.name}</p>
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
    if (!document.getElementById('f-dob').value)               ok = showError('dob');
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
    if (!document.getElementById('f-refname').value.trim()) ok = showError('refname');
    if (!referralFile) { document.getElementById('e-referral').style.display = 'block'; ok = false; }
    else document.getElementById('e-referral').style.display = 'none';
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    ? ` — ${document.getElementById('f-phifund').value || 'Not specified'}` : '';

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
    ['Medicare',        v('medicare') || '—'],
    ['Referral letter', referralFile ? referralFile.name : '—'],
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
    firstName:        v('firstname'),
    lastName:         v('lastname'),
    dob:              v('dob'),
    phone:            v('phone'),
    email:            v('email'),
    suburb:           v('suburb'),
    patientType:      v('patienttype'),
    procedures:       selectedProcedures.map(id => PROCEDURES.find(p=>p.id===id)?.label),
    urgency:          v('urgency'),
    timeOfDay:        v('timeofday'),
    preferredDays:    days,
    notes:            v('notes'),
    locations:        selectedLocations.map(id => LOCATIONS.find(l=>l.id===id)?.name),
    refName:          v('refname'),
    refPractice:      v('refpractice'),
    refDate:          v('refdate'),
    medicare:         v('medicare'),
    phi:              phi ? phi.value : 'no',
    phiFund:          v('phifund'),
    referralFileName: referralFile ? referralFile.name : null,
  };

  // TODO: Supabase integration
  // const { data, error } = await supabase
  //   .from('appointment_requests')
  //   .insert([payload]);
  //
  // if (referralFile) {
  //   const { data: fileData, error: fileError } = await supabase.storage
  //     .from('referral-letters')
  //     .upload(`${Date.now()}-${referralFile.name}`, referralFile);
  // }

  console.log('Ready for Supabase:', payload);
  showSuccess();
}

function showSuccess() {
  document.getElementById('step-5').style.display    = 'none';
  document.getElementById('prog-wrap').style.display = 'none';
  document.getElementById('step-success').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
