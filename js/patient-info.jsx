
const { useState, useRef, useEffect } = React;

function Field({ label, required, error, help, children, cls='' }) {
  return (
    <div className={`fgroup ${cls}`}>
      {label && <label>{label}{required && <span className="req"> *</span>}</label>}
      {children}
      {help && <div className="helper">{help}</div>}
      {error && <div className="errmsg">{error}</div>}
    </div>
  );
}
function RG({ options, value, onChange, name }) {
  return <div className="rg">{options.map(o=><label key={o} className={`pill ${value===o?'sel':''}`}><input type="radio" name={name} checked={value===o} onChange={()=>onChange(o)}/><span className="pr"/>{o}</label>)}</div>;
}
function CG({ options, value=[], onChange }) {
  const tog=o=>value.includes(o)?onChange(value.filter(v=>v!==o)):onChange([...value,o]);
  return <div className="cg">{options.map(o=><label key={o} className={`pill ${value.includes(o)?'sel':''}`} onClick={()=>tog(o)}><span className="pc">{value.includes(o)?'✓':''}</span>{o}</label>)}</div>;
}
function Tog({ checked, onChange, children }) {
  return <div className={`tog ${checked?'on':''}`} onClick={()=>onChange(!checked)}><div className="togbox">{checked&&<svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div><div className="togtxt">{children}</div></div>;
}
function Dv({ label }) {
  return <div style={{margin:'22px 0 16px'}}><div className="subh">{label}</div></div>;
}
function ConsentCheck({ title, body, checked, onChange, label='I have read and agree to the above' }) {
  return (
    <div className={`cblock ${checked?'agreed':''}`}>
      <div className="chead">{title}</div>
      <div className="cbody" dangerouslySetInnerHTML={{__html:body}}/>
      <div className="cfoot" onClick={()=>onChange(!checked)}>
        <div className={`cchk ${checked?'on':''}`}>{checked&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
        <span>{label}</span>
      </div>
    </div>
  );
}
function ConsentRadio({ title, body, value, onChange, options }) {
  return (
    <div className={`cblock ${value?'agreed':''}`}>
      <div className="chead">{title}</div>
      <div className="cbody" dangerouslySetInnerHTML={{__html:body}}/>
      <div className="cropts">{options.map(o=><div key={o} className={`cropt ${value===o?'sel':''}`} onClick={()=>onChange(o)}><div className="crdot"/><span>{o}</span></div>)}</div>
    </div>
  );
}
function UBox({ value, onChange, label='Tap to upload', sub='PDF, JPG, PNG, HEIC' }) {
  const hf=e=>{const f=e.target.files[0];if(f)onChange(f.name);};
  return (
    <div className="ubox">
      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.heic" onChange={hf}/>
      {value
        ? <div style={{color:'var(--teal-dark)',fontWeight:500,fontSize:13,display:'flex',alignItems:'center',gap:6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>{value}</div>
        : <><div className="ubox-lbl">{label}</div><div className="ubox-sub">{sub}</div></>}
    </div>
  );
}
function SigPad({ onSign, isEmpty, setEmpty }) {
  const ref=useRef(null),drw=useRef(false),lp=useRef(null);
  const gp=(e,c)=>{const r=c.getBoundingClientRect(),sx=c.width/r.width,sy=c.height/r.height;const cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;return{x:(cx-r.left)*sx,y:(cy-r.top)*sy};};
  const start=e=>{e.preventDefault();drw.current=true;lp.current=gp(e,ref.current);};
  const move=e=>{e.preventDefault();if(!drw.current)return;const c=ref.current,ctx=c.getContext('2d'),pos=gp(e,c);ctx.beginPath();ctx.moveTo(lp.current.x,lp.current.y);ctx.lineTo(pos.x,pos.y);ctx.strokeStyle='#152d4a';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();lp.current=pos;setEmpty(false);onSign(c.toDataURL());};
  const end=()=>{drw.current=false;};
  const clear=()=>{const c=ref.current;c.getContext('2d').clearRect(0,0,c.width,c.height);setEmpty(true);onSign(null);};
  useEffect(()=>{const c=ref.current;c.width=(c.offsetWidth||600)*(window.devicePixelRatio||1);c.height=300;},[]);
  return (
    <div className="sig-wrap">
      <canvas ref={ref} onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end}/>
      {isEmpty&&<div className="sig-ph"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2.121 2.121 0 010 3L9 16H6v-3z"/></svg>Sign here</div>}
      {!isEmpty&&<button className="sig-clear" onClick={clear}>Clear</button>}
    </div>
  );
}

/* ── STEP 1 ── */
function Step1({d,set,err}) {
  return <>
    {/* WELCOME MESSAGE — to be written by Dr Raymond. Wrap in a div with teal-light background once ready. */}
    <div className="intro-checks">
      <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'var(--mid)',marginBottom:6}}>Before you start</div>
      <Tog checked={d.complexNeeds} onChange={v=>set('complexNeeds',v)}>I have complex needs and prefer to provide my health records in a different format — please contact me to discuss.</Tog>
      <Tog checked={d.hasConfidential} onChange={v=>set('hasConfidential',v)}>I have confidential information I do not wish to include on this form — my surgeon will discuss this with me at my consultation.</Tog>
    </div>
    <div className="fg">
      <div className="fgroup s2"><label>Title<span className="req"> *</span></label><RG options={['Mr','Mrs','Ms','Miss','Dr','Mx','Other']} value={d.title} onChange={v=>set('title',v)} name="title"/>{err.title&&<div className="errmsg">{err.title}</div>}</div>
      <Field label="Surname" required error={err.surname}><input type="text" value={d.surname} onChange={e=>set('surname',e.target.value)} className={err.surname?'err':''} placeholder="Family name"/></Field>
      <Field label="Given Names" required error={err.givenNames}><input type="text" value={d.givenNames} onChange={e=>set('givenNames',e.target.value)} className={err.givenNames?'err':''} placeholder="All given names"/></Field>
      <Field label="Preferred Name" help="What would you like us to call you?"><input type="text" value={d.preferredName} onChange={e=>set('preferredName',e.target.value)} placeholder="Preferred name"/></Field>
      <Field label="Date of Birth" required error={err.dob}><input type="text" inputMode="numeric" placeholder="DD/MM/YYYY" value={d.dob} onChange={e=>set('dob',e.target.value)} className={err.dob?'err':''}/></Field>
      <Field label="Country of Birth"><input type="text" value={d.countryBirth} onChange={e=>set('countryBirth',e.target.value)} placeholder="e.g. Australia"/></Field>
      <div className="fgroup"><label>Gender <span style={{fontWeight:400,textTransform:'none',fontSize:10,color:'var(--muted)'}}>as per Medicare card</span></label><RG options={['Male','Female','Non-binary','Other']} value={d.gender} onChange={v=>set('gender',v)} name="gender"/>{d.gender==='Other'&&<input type="text" value={d.genderOther} onChange={e=>set('genderOther',e.target.value)} placeholder="Please specify" style={{marginTop:8}}/>}</div>
      <div className="fgroup s2"><label>Pronouns</label><RG options={['He / Him','She / Her','They / Them','Other']} value={d.pronouns} onChange={v=>set('pronouns',v)} name="pronouns"/>{d.pronouns==='Other'&&<input type="text" value={d.pronounsOther} onChange={e=>set('pronounsOther',e.target.value)} placeholder="Please specify" style={{marginTop:8}}/>}</div>
    </div>
    <Dv label="Contact Details"/>
    <div className="fg c2">
      <div className="fgroup s2"><Field label="Residential Address" required error={err.address}><input type="text" value={d.address} onChange={e=>set('address',e.target.value)} className={err.address?'err':''} placeholder="Street address"/></Field></div>
      <Field label="Suburb" required error={err.suburb}><input type="text" value={d.suburb} onChange={e=>set('suburb',e.target.value)} className={err.suburb?'err':''} placeholder="Suburb"/></Field>
      <div className="fg c2">
        <Field label="State"><select value={d.state} onChange={e=>set('state',e.target.value)}><option value="">Select</option>{['NSW','VIC','QLD','SA','WA','TAS','ACT','NT'].map(s=><option key={s}>{s}</option>)}</select></Field>
        <Field label="Postcode" required error={err.postcode}><input type="text" maxLength="4" value={d.postcode} onChange={e=>set('postcode',e.target.value)} className={err.postcode?'err':''} placeholder="0000"/></Field>
      </div>
      <div className="fgroup s2"><Field label="Postal Address" help="Leave blank if same as above"><input type="text" value={d.postalAddress} onChange={e=>set('postalAddress',e.target.value)} placeholder="Postal address (if different)"/></Field></div>
      <div className="fgroup">
        <label>Mobile<span className="req"> *</span></label>
        <input type="tel" value={d.mobile} onChange={e=>set('mobile',e.target.value)} className={err.mobile?'err':''} placeholder="04XX XXX XXX"/>
        <div className="helper">Primary number for appointment confirmations</div>
        {err.mobile&&<div className="errmsg">{err.mobile}</div>}
        <label style={{display:'flex',alignItems:'center',gap:6,textTransform:'none',letterSpacing:0,fontSize:12,fontWeight:400,marginTop:6,cursor:'pointer'}} onClick={()=>set('noSMSmobile',!d.noSMSmobile)}>
          <div style={{width:14,height:14,borderRadius:3,border:'2px solid',borderColor:d.noSMSmobile?'var(--teal)':'var(--border)',background:d.noSMSmobile?'var(--teal)':'white',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
            {d.noSMSmobile&&<svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          Do not send SMS to this number
        </label>
      </div>
      <Field label="Home / Work Phone"><input type="tel" value={d.homePhone} onChange={e=>set('homePhone',e.target.value)} placeholder="(0X) XXXX XXXX"/></Field>
      <div className="fgroup s2"><Field label="Email Address" required error={err.email}><input type="email" value={d.email} onChange={e=>set('email',e.target.value)} className={err.email?'err':''} placeholder="your@email.com"/></Field></div>
    </div>
    <Dv label="Demographics"/>
    <div className="fg c2">
      <Field label="Occupation"><input type="text" value={d.occupation} onChange={e=>set('occupation',e.target.value)} placeholder="Your occupation"/></Field>
      <Field label="Language Spoken at Home"><input type="text" value={d.language} onChange={e=>set('language',e.target.value)} placeholder="e.g. English, Mandarin"/></Field>
      <div className="fgroup s2"><label>Interpreter Required?</label><RG options={['No','Yes']} value={d.interpreter} onChange={v=>set('interpreter',v)} name="interp"/></div>
      <div className="fgroup s2"><label>Are you of Aboriginal or Torres Strait Islander origin?</label><RG options={['No','Yes — Aboriginal','Yes — Torres Strait Islander','Yes — Both']} value={d.indigenous} onChange={v=>set('indigenous',v)} name="indigenous"/></div>
    </div>
    <Dv label="Living Arrangements"/>
    <div className="fg c2">
      <div className="fgroup"><label>Do you live alone?</label><RG options={['No','Yes']} value={d.liveAlone} onChange={v=>set('liveAlone',v)} name="livealone"/></div>
      <div className="fgroup"><label>Is someone available to drive you home from surgery and stay with you?</label><RG options={['Yes','No','Unsure']} value={d.hasCarer} onChange={v=>set('hasCarer',v)} name="hascarer"/></div>
    </div>
  </>;
}

/* ── STEP 2 ── */
function Step2({d,set}) {
  const diff=d.fundCover==='Hospital & Extras (different funds)';
  return <>
    <Dv label="Medicare"/>
    <div className="fg c2">
      <Field label="Medicare Card Number"><input type="text" value={d.medicareNum} onChange={e=>set('medicareNum',e.target.value)} placeholder="XXXX XXXXX X"/></Field>
      <div className="fg c2">
        <Field label="Reference No." help="Individual number on card"><input type="text" maxLength="1" value={d.medicareRef} onChange={e=>set('medicareRef',e.target.value)} placeholder="1"/></Field>
        <Field label="Expiry"><input type="text" value={d.medicareExpiry} onChange={e=>set('medicareExpiry',e.target.value)} placeholder="MM/YYYY"/></Field>
      </div>
    </div>
    <Dv label="Pension / Health Care Card"/>
    <div className="fg c2">
      <Field label="Card Type"><select value={d.pensionType} onChange={e=>set('pensionType',e.target.value)}><option value="">Select type</option><option>Pensioner Concession Card (PCC)</option><option>Health Care Card (HCC)</option><option>Low Income Health Care Card</option></select></Field>
      <Field label="Card Number"><input type="text" value={d.pensionNum} onChange={e=>set('pensionNum',e.target.value)} placeholder="Card number"/></Field>
      <Field label="Expiry Date"><input type="text" value={d.pensionExpiry} onChange={e=>set('pensionExpiry',e.target.value)} placeholder="DD/MM/YYYY"/></Field>
    </div>
    <Dv label="DVA (Department of Veterans' Affairs)"/>
    <div className="fg c2">
      <Field label="DVA Card Number"><input type="text" value={d.dvaNum} onChange={e=>set('dvaNum',e.target.value)} placeholder="DVA card number"/></Field>
      <Field label="Card Type"><select value={d.dvaType} onChange={e=>set('dvaType',e.target.value)}><option value="">Select type</option><option>Gold</option><option>White</option><option>Orange</option><option>N/A</option></select></Field>
      <div className="fgroup"><label>Eligible for DVA transport?</label><RG options={['No','Yes']} value={d.dvaTransport} onChange={v=>set('dvaTransport',v)} name="dvatransport"/></div>
      <div className="fgroup"><label>Do you have a DVA advocate?</label><RG options={['No','Yes']} value={d.dvaAdvocate} onChange={v=>set('dvaAdvocate',v)} name="dvaadvocate"/></div>
      {d.dvaAdvocate==='Yes'&&<><Field label="Advocate Name"><input type="text" value={d.dvaAdvocateName} onChange={e=>set('dvaAdvocateName',e.target.value)} placeholder="Full name"/></Field><Field label="Advocate Email"><input type="email" value={d.dvaAdvocateEmail} onChange={e=>set('dvaAdvocateEmail',e.target.value)} placeholder="email@example.com"/></Field></>}
    </div>
    <Dv label="Private Health Insurance"/>
    <div className="fg c2">
      <Field label="Fund Name"><input type="text" value={d.fundName} onChange={e=>set('fundName',e.target.value)} placeholder="e.g. Medibank, Bupa, HCF"/></Field>
      <Field label="Membership Number"><input type="text" value={d.fundNum} onChange={e=>set('fundNum',e.target.value)} placeholder="Membership number"/></Field>
      <Field label="Policy Number"><input type="text" value={d.fundPolicy} onChange={e=>set('fundPolicy',e.target.value)} placeholder="Policy number"/></Field>
      <Field label="Cover Type"><select value={d.fundCover} onChange={e=>set('fundCover',e.target.value)}><option value="">Select</option><option>Hospital Cover Only</option><option>Extras Cover Only (Dental)</option><option>Hospital &amp; Extras (same fund)</option><option>Hospital &amp; Extras (different funds)</option></select></Field>
      {diff&&<><Field label="Extras Fund Name" cls="s2"><input type="text" value={d.fund2Name} onChange={e=>set('fund2Name',e.target.value)} placeholder="Extras fund name"/></Field><Field label="Extras Membership No."><input type="text" value={d.fund2Num} onChange={e=>set('fund2Num',e.target.value)} placeholder="Membership number"/></Field></>}
    </div>
  </>;
}

/* ── STEP 3 ── */
function Step3({d,set,err}) {
  return <>
    <Dv label="Emergency Contact & Next of Kin"/>
    <div className="fg c2">
      <Field label="Contact Name" required error={err.ecName}><input type="text" value={d.ecName} onChange={e=>set('ecName',e.target.value)} className={err.ecName?'err':''} placeholder="Full name"/></Field>
      <Field label="Relationship" required error={err.ecRel}><select value={d.ecRel} onChange={e=>set('ecRel',e.target.value)} className={err.ecRel?'err':''}><option value="">Select relationship</option>{['Spouse / Partner','Parent','Sibling','Child','Friend','Guardian','Carer','Other'].map(r=><option key={r}>{r}</option>)}</select></Field>
      <Field label="Mobile" required error={err.ecMobile}><input type="tel" value={d.ecMobile} onChange={e=>set('ecMobile',e.target.value)} className={err.ecMobile?'err':''} placeholder="04XX XXX XXX"/></Field>
      <Field label="Alternative Phone"><input type="tel" value={d.ecPhone} onChange={e=>set('ecPhone',e.target.value)} placeholder="Home or work number"/></Field>
      <div className="fgroup s2" style={{gap:8}}>
        <Tog checked={d.ecAuthorise} onChange={v=>set('ecAuthorise',v)}>I authorise Wisdom Surgery Clinic to accept calls and emails from this person and discuss information relevant to my appointments, billing and care.</Tog>
        <Tog checked={d.ecDecisionMaker} onChange={v=>set('ecDecisionMaker',v)}>This person is legally authorised to make decisions about my treatment on my behalf if I am unable to do so.</Tog>
      </div>
    </div>
    <Dv label="Referral"/>
    <div className="abox">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p>As a specialist practice, we generally have received a referral before seeing you. <strong>If we have not received your referral, please upload one below</strong> or leave your referring doctor's name and contact number.</p>
    </div>
    <div className="fg" style={{marginBottom:14}}>
      <Field label="Reason for Referral / Chief Complaint" help="What is bringing you to our clinic today?"><textarea value={d.reasonVisit} onChange={e=>set('reasonVisit',e.target.value)} rows={3} placeholder="e.g. Wisdom tooth pain, jaw surgery consult, implant assessment…"/></Field>
    </div>
    <div className="fg c2">
      <Field label="Referring Doctor / Dentist Name"><input type="text" value={d.refName} onChange={e=>set('refName',e.target.value)} placeholder="Dr / dentist full name"/></Field>
      <Field label="Referrer Phone"><input type="tel" value={d.refPhone} onChange={e=>set('refPhone',e.target.value)} placeholder="(0X) XXXX XXXX"/></Field>
      <div className="fgroup s2"><label>Upload Referral <span style={{fontWeight:400,textTransform:'none',fontSize:'10.5px',color:'var(--muted)'}}>— optional</span></label><UBox value={d.referralFile} onChange={v=>set('referralFile',v)} label="Upload your referral document" sub="Accepts PDF, JPG, PNG, HEIC"/></div>
    </div>
  </>;
}

/* ── STEP 4 ── */
function Step4({d,set}) {
  const conditions=['Diabetes','Hypertension','Heart Disease / Angina','Heart Failure','Pacemaker / Defibrillator','Stroke / TIA','Epilepsy','Asthma / COPD','Bleeding / Clotting Disorder','Thyroid Condition','Arthritis','Osteoporosis / Osteopenia','Kidney Disease','Liver Disease','HIV / AIDS','Hepatitis B or C','Cancer (current or past)','Head / Neck Radiation','Bisphosphonate / Denosumab use','Immunosuppression','Depression / Anxiety','Sleep Apnoea','GORD / Reflux'];
  return <>
    <Dv label="General Health"/>
    <div className="fg">
      <Field label="Usual GP / Medical Centre" help="Name and practice"><input type="text" value={d.gp} onChange={e=>set('gp',e.target.value)} placeholder="Dr Smith — City Medical Centre"/></Field>
      <div className="fgroup"><label>Allergies</label><RG options={['No Known Allergies','Yes — I have allergies']} value={d.allergyStatus} onChange={v=>set('allergyStatus',v)} name="allergy"/></div>
      {d.allergyStatus==='Yes — I have allergies'&&<Field label="Please list all allergies and reactions"><textarea value={d.allergyList} onChange={e=>set('allergyList',e.target.value)} rows={3} placeholder="e.g. Penicillin — rash; Latex — swelling; Aspirin — GI upset…"/></Field>}
    </div>
    <Dv label="Current Medications"/>
    <div className="fg">
      <div className="fgroup"><label>Upload Medication List <span style={{fontWeight:400,textTransform:'none',fontSize:'10.5px',color:'var(--muted)'}}>— from GP, pharmacy or hospital</span></label><UBox value={d.medicationFile} onChange={v=>set('medicationFile',v)} label="Upload medication list instead of typing" sub="Accepts PDF, JPG, PNG, HEIC"/></div>
      <Field label="Or type medications here" help="Include all prescribed, over-the-counter, vitamins and supplements — with doses and frequency"><textarea value={d.medications} onChange={e=>set('medications',e.target.value)} rows={3} placeholder="e.g. Metformin 500mg twice daily, Aspirin 100mg daily…"/></Field>
      <div className="fgroup"><label>Are you taking any of the following? <span style={{fontWeight:400,textTransform:'none',fontSize:'10px',color:'var(--muted)'}}>select all that apply</span></label><CG options={['Warfarin','Aspirin (daily)','Clopidogrel (Plavix)','Rivaroxaban (Xarelto)','Apixaban (Eliquis)','Other blood thinners / anticoagulants','Steroids (long-term)']} value={d.bloodThinners} onChange={v=>set('bloodThinners',v)}/>{d.bloodThinners&&d.bloodThinners.length>0&&<div className="wflag"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Please inform reception — blood thinner management may be required before your procedure.</div>}</div>
    </div>
    <Dv label="Medical History"/>
    <div className="fg">
      <div className="fgroup"><label>Past Medical Conditions <span style={{fontWeight:400,textTransform:'none',fontSize:'10px',color:'var(--muted)'}}>select all that apply</span></label><CG options={conditions} value={d.conditions} onChange={v=>set('conditions',v)}/></div>
      <Field label="Other medical history, surgeries or hospitalisations"><textarea value={d.medHistory} onChange={e=>set('medHistory',e.target.value)} rows={3} placeholder="Any other conditions, previous surgeries, hospitalisations…"/></Field>
    </div>
    <Dv label="Anaesthetic & Surgical History"/>
    <div className="fg c2">
      <div className="fgroup"><label>Previous anaesthetic?</label><RG options={['No','Yes']} value={d.prevAnaes} onChange={v=>set('prevAnaes',v)} name="prevAnaes"/></div>
      <div className="fgroup"><label>Any adverse anaesthetic reactions?</label><RG options={['No','Yes','Unsure']} value={d.anaesReaction} onChange={v=>set('anaesReaction',v)} name="anaesReaction"/></div>
      {(d.anaesReaction==='Yes'||d.anaesReaction==='Unsure')&&<div className="fgroup s2"><Field label="Please describe the reaction"><textarea value={d.anaesReactionDetail} onChange={e=>set('anaesReactionDetail',e.target.value)} rows={2} placeholder="Describe the reaction and when it occurred…"/></Field></div>}
      <div className="fgroup s2"><label>Previous oral / jaw surgery?</label><RG options={['No','Yes']} value={d.prevOralSurg} onChange={v=>set('prevOralSurg',v)} name="prevOralSurg"/></div>
      {d.prevOralSurg==='Yes'&&<div className="fgroup s2"><Field label="Details"><textarea value={d.prevOralSurgDetail} onChange={e=>set('prevOralSurgDetail',e.target.value)} rows={2} placeholder="Type of procedure, approximate date, where performed…"/></Field></div>}
    </div>
    <Dv label="Lifestyle"/>
    <div className="fg c2">
      <div className="fgroup"><label>Smoking / Tobacco use</label><RG options={['Non-smoker','Current smoker','Ex-smoker']} value={d.smoker} onChange={v=>set('smoker',v)} name="smoker"/></div>
      <div className="fgroup"><label>Alcohol use</label><RG options={['None','Occasional','Moderate (≤14/wk)','Heavy (>14/wk)']} value={d.alcohol} onChange={v=>set('alcohol',v)} name="alcohol"/></div>
      <div className="fgroup s2"><label>Pregnancy / Breastfeeding (if applicable)</label><RG options={['Not applicable','Not pregnant / breastfeeding','Pregnant','Breastfeeding','Possibly pregnant']} value={d.pregnancy} onChange={v=>set('pregnancy',v)} name="pregnancy"/></div>
    </div>
  </>;
}

/* ── STEP 5 ── */
function Step5({d,set,sigData,setSigData,sigEmpty,setSigEmpty,err}) {
  return <>
    <ConsentCheck title="Privacy Policy & Information Collection"
      body="I consent to the collection, use and disclosure of my personal health information for the purpose of providing medical and surgical services, processing billing (including Medicare and DVA), and sending appointment reminders by SMS, email, or post. We may also use anonymised information for clinical research and education. Information is handled in accordance with the <em>Privacy Act 1988</em> (Cth), the Australian Privacy Principles, and applicable Queensland legislation. You have the right to access your patient record. <a href='patient-information.html' target='_blank'>View our Privacy Policy →</a>"
      checked={d.consentPrivacy} onChange={v=>set('consentPrivacy',v)}/>
    <ConsentRadio title="My Health Record"
      body="Where you participate in the My Health Record system, Wisdom Surgery Clinic may upload relevant health information including specialist letters, referral responses, event summaries, and discharge summaries. <strong>Queensland note:</strong> HIV/AIDS status and notifiable conditions cannot be uploaded without your explicit consent. Medicare encounter data will appear in your My Health Record regardless of your preferences — this is managed by Services Australia. You may manage your preferences at <a href='https://www.myhealthrecord.gov.au' target='_blank'>myhealthrecord.gov.au</a> or call 1800 723 471."
      value={d.consentMHR} onChange={v=>set('consentMHR',v)}
      options={['I agree to this practice uploading letters and documents to my My Health Record about my Specialist Oral and Maxillofacial care','I decline to have reports or correspondence uploaded to My Health Record by this practice']}/>
    <ConsentCheck title="AI Clinical Scribe — Lyrebird Health"
      body="Wisdom Surgery Clinic uses <strong>Lyrebird Health</strong>, an Australian AI medical scribe, to assist with clinical documentation. With your consent, Lyrebird may be used during consultations to transcribe the conversation and generate clinical notes for Dr Raymond's review.<ul><li>All transcription is performed within Australia — your data is not transferred overseas</li><li>Audio recordings are destroyed immediately after transcription</li><li>Personal identifying information is redacted before AI processing</li><li>All data is encrypted; only Dr Raymond can access your data</li><li>Notes are deleted from Lyrebird's servers after seven days by default</li></ul>Lyrebird is a documentation tool only — it does not make clinical decisions. All notes are reviewed and approved by Dr Raymond. You may decline at any time without affecting your care. <a href='https://www.lyrebirdhealth.com/au/patient' target='_blank'>Learn more →</a>"
      checked={d.consentAI} onChange={v=>set('consentAI',v)}
      label="I consent to the use of Lyrebird Health AI scribe during my consultations"/>
    <ConsentCheck title="Communication Consent"
      body="I consent to receiving appointment reminders, recalls, invoices, and other communications related to my healthcare via email, SMS, and/or post, using the contact details provided. Documents sent to the contact details provided will be deemed received, unless Wisdom Surgery Clinic is notified of an error in those details. I may change my communication preferences or opt out at any time."
      checked={d.consentComms} onChange={v=>set('consentComms',v)}/>
    <ConsentCheck title="Accuracy of Information"
      body="I certify that the information provided in this form is accurate and complete to the best of my knowledge. I understand it is my ongoing responsibility to inform the practice of any changes to my health, medications, personal, or insurance details prior to future appointments."
      checked={d.consentAccuracy} onChange={v=>set('consentAccuracy',v)}/>
    {err.consent&&<div className="errmsg" style={{marginBottom:12}}>{err.consent}</div>}
    <div className="fdiv"/>
    <div className="fg c2" style={{marginBottom:16}}>
      <Field label="Patient Full Name (print)" required error={err.sigName}><input type="text" value={d.sigName} onChange={e=>set('sigName',e.target.value)} className={err.sigName?'err':''} placeholder="Print full legal name"/></Field>
      <Field label="Date"><input type="text" value={new Date().toLocaleDateString('en-AU')} readOnly style={{background:'var(--cream)',color:'var(--mid)',cursor:'default'}}/></Field>
      <Field label="Legal Decision-Maker / Guardian Full Name" help="If applicable — parent, guardian, or EPOA"><input type="text" value={d.decisionMakerName} onChange={e=>set('decisionMakerName',e.target.value)} placeholder="Full name (if not the patient)"/></Field>
      {d.decisionMakerName&&<Field label="Relationship to Patient"><select value={d.decisionMakerRel} onChange={e=>set('decisionMakerRel',e.target.value)}><option value="">Select</option>{['Mother','Father','Legal Guardian','EPOA','Daughter','Son','Husband','Wife','Partner','Other'].map(r=><option key={r}>{r}</option>)}</select></Field>}
    </div>
    {d.decisionMakerName&&<div className="abox" style={{marginBottom:16}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p style={{fontSize:12.5}}>If you hold an EPOA, Advance Health Directive, or court order, please bring a copy to your first appointment.</p></div>}
    <Field label="Signature" required error={err.sig}><div style={{marginTop:4}}><SigPad onSign={setSigData} isEmpty={sigEmpty} setEmpty={setSigEmpty}/></div></Field>
  </>;
}

/* ── STEP 6 ── */
function Step6({d,set,err}) {
  const FIN=`By accepting financial responsibility I agree that:<ul>
    <li>I am responsible for all consultation, surgical, review, and associated fees</li>
    <li>A written fee estimate will be provided before booking surgery</li>
    <li>Consultation fees are payable at the time of booking</li>
    <li>Surgical fees are to be paid in full before the procedure date, unless otherwise agreed in writing</li>
    <li>In the event of non-payment, recovery costs including debt collection fees may be added to the outstanding balance</li>
    <li>Late cancellations (less than 48 hours notice) may incur an administrative fee</li>
  </ul>`;
  const cards=[{id:'self',title:'I am the patient, I am 18+ years old, and I accept financial responsibility'},{id:'parent',title:'The patient is under 18 — I am the parent or legal guardian'},{id:'other',title:'Another individual has agreed to be the Account Holder (patient 18+)'},{id:'org',title:'A third-party organisation will be paying (e.g. DVA, WorkCover)'}];
  return <>
    <div className="abox" style={{marginBottom:20}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p>Please nominate the <strong>Account Holder</strong> — the person responsible for paying all fees. This does not affect who makes medical decisions.</p></div>
    <div className="acards">
      {cards.map(card=>(
        <div key={card.id} className={`acard ${d.accountType===card.id?'sel':''}`}>
          <div className="acard-head" onClick={()=>set('accountType',card.id)}><div className="acard-radio"/><div className="acard-title">{card.title}</div></div>
          {d.accountType===card.id&&(
            <div className="acard-body">
              {(card.id==='self')&&<><div className="fagree" dangerouslySetInnerHTML={{__html:FIN}}/><Tog checked={d.consentFinancial} onChange={v=>set('consentFinancial',v)}>I have read and agree to the Financial Responsibility Agreement above.</Tog></>}
              {(card.id==='parent'||card.id==='other')&&<>
                <div className="fg c2" style={{marginBottom:16}}>
                  <Field label="Account Holder Full Name" required error={err.ahName}><input type="text" value={d.ahName} onChange={e=>set('ahName',e.target.value)} className={err.ahName?'err':''} placeholder="Full legal name"/></Field>
                  <Field label="Relationship to Patient"><select value={d.ahRel} onChange={e=>set('ahRel',e.target.value)}><option value="">Select</option>{(card.id==='parent'?['Mother','Father','Legal Guardian','Other']:['Spouse / Partner','Parent','Child','Sibling','EPOA','Other']).map(r=><option key={r}>{r}</option>)}</select></Field>
                  <Field label="Email" required error={err.ahEmail}><input type="email" value={d.ahEmail} onChange={e=>set('ahEmail',e.target.value)} className={err.ahEmail?'err':''} placeholder="email@example.com"/></Field>
                  <Field label="Phone" required error={err.ahPhone}><input type="tel" value={d.ahPhone} onChange={e=>set('ahPhone',e.target.value)} className={err.ahPhone?'err':''} placeholder="04XX XXX XXX"/></Field>
                  <div className="fgroup s2"><Field label="Mailing Address"><input type="text" value={d.ahAddress} onChange={e=>set('ahAddress',e.target.value)} placeholder="Street address, suburb, state, postcode"/></Field></div>
                </div>
                {card.id==='other'&&<div className="inote" style={{marginBottom:12}}>Being an Account Holder does not entitle you to disclosure of confidential medical information, nor to make treatment decisions on behalf of the patient. Invoices will show the patient's name, item numbers, and dates of service.</div>}
                <div className="fagree" dangerouslySetInnerHTML={{__html:FIN}}/>
                <Tog checked={d.consentFinancial} onChange={v=>set('consentFinancial',v)}>I have read and agree to the Financial Responsibility Agreement above.</Tog>
              </>}
              {card.id==='org'&&<>
                <div className="fg c2" style={{marginBottom:16}}>
                  <div className="fgroup s2"><Field label="Organisation" required error={err.orgName}><select value={d.orgName} onChange={e=>set('orgName',e.target.value)} className={err.orgName?'err':''}><option value="">Select organisation</option>{["DVA (Department of Veterans' Affairs)",'WorkCover Queensland','Public Trustee','Other'].map(o=><option key={o}>{o}</option>)}</select></Field>{d.orgName==='Other'&&<input type="text" value={d.orgNameOther} onChange={e=>set('orgNameOther',e.target.value)} placeholder="Organisation name" style={{marginTop:8}}/>}</div>
                  <Field label="Contact Person"><input type="text" value={d.orgContact} onChange={e=>set('orgContact',e.target.value)} placeholder="Full name"/></Field>
                  <Field label="Phone"><input type="tel" value={d.orgPhone} onChange={e=>set('orgPhone',e.target.value)} placeholder="Phone number"/></Field>
                  <div className="fgroup s2"><Field label="Email"><input type="email" value={d.orgEmail} onChange={e=>set('orgEmail',e.target.value)} placeholder="email@example.com"/></Field></div>
                </div>
                <div className="inote">Appointments cannot be confirmed until written agreement to cover fees has been received from the organisation.</div>
              </>}
            </div>
          )}
        </div>
      ))}
    </div>
    {err.accountType&&<div className="errmsg" style={{marginTop:10}}>{err.accountType}</div>}
    <div className="kinfo">
      <h4>Key Payment Information</h4>
      <ul>
        <li>Fee estimates are provided in writing before surgery is booked</li>
        <li>Consultation fees are payable at the time of booking</li>
        <li>Surgical fees are finalised and payable before the procedure date</li>
        <li>Wisdom Surgery Clinic does not participate in no-gap or known-gap schemes — an out-of-pocket cost will typically apply</li>
      </ul>
    </div>
    {d.accountType&&d.accountType!=='org'&&<div style={{marginTop:16}}>
      <Tog checked={d.consentPayTerms} onChange={v=>set('consentPayTerms',v)}>I understand and agree to the fee and payment terms described above.</Tog>
      {err.consentPayTerms&&<div className="errmsg" style={{marginTop:4}}>{err.consentPayTerms}</div>}
    </div>}
  </>;
}

/* ── CONFIG ── */
const STEPS=[
  {label:'Personal\nDetails',      icon:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z'},
  {label:'Medicare\n& Funding',    icon:'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'},
  {label:'Emergency\n& Referral',  icon:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'},
  {label:'Health\nHistory',        icon:'M22 12h-4l-3 9L9 3l-3 9H2'},
  {label:'Consent\n& Sign',        icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'},
  {label:'Financial\nResponsibility',icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'},
];
const HEADERS=[
  ['01 / 06','Patient Personal Details','Your current contact and demographic information.'],
  ['02 / 06','Medicare & Health Funding','Help us process your billing accurately. All fields optional.'],
  ['03 / 06','Emergency Contact & Referral','Who to contact in an emergency, and your referring practitioner.'],
  ['04 / 06','Health History','Your medical background helps us provide the safest care.'],
  ['05 / 06','Consent & Signature','Please review and sign the following consent items.'],
  ['06 / 06','Financial Responsibility','Nominate the Account Holder and agree to payment terms.'],
];

/* ── APP ── */
function FormApp() {
  const [step,setStep]=useState(0);
  const [submitted,setSubmitted]=useState(false);
  const [errors,setErrors]=useState({});
  const [sigData,setSigData]=useState(null);
  const [sigEmpty,setSigEmpty]=useState(true);
  const [s1,setS1]=useState({complexNeeds:false,hasConfidential:false,title:'',surname:'',givenNames:'',preferredName:'',dob:'',countryBirth:'',gender:'',genderOther:'',pronouns:'',pronounsOther:'',address:'',suburb:'',state:'',postcode:'',postalAddress:'',mobile:'',noSMSmobile:false,homePhone:'',email:'',occupation:'',language:'',interpreter:'',indigenous:'',liveAlone:'',hasCarer:''});
  const [s2,setS2]=useState({medicareNum:'',medicareRef:'',medicareExpiry:'',pensionType:'',pensionNum:'',pensionExpiry:'',dvaNum:'',dvaType:'',dvaTransport:'',dvaAdvocate:'',dvaAdvocateName:'',dvaAdvocateEmail:'',fundName:'',fundNum:'',fundPolicy:'',fundCover:'',fund2Name:'',fund2Num:''});
  const [s3,setS3]=useState({ecName:'',ecRel:'',ecMobile:'',ecPhone:'',ecAuthorise:false,ecDecisionMaker:false,refName:'',refPhone:'',referralFile:'',reasonVisit:''});
  const [s4,setS4]=useState({gp:'',allergyStatus:'No Known Allergies',allergyList:'',medicationFile:'',medications:'',bloodThinners:[],conditions:[],medHistory:'',prevAnaes:'',anaesReaction:'',anaesReactionDetail:'',prevOralSurg:'',prevOralSurgDetail:'',smoker:'',alcohol:'',pregnancy:''});
  const [s5,setS5]=useState({consentPrivacy:false,consentMHR:'',consentAI:false,consentComms:false,consentAccuracy:false,sigName:'',decisionMakerName:'',decisionMakerRel:''});
  const [s6,setS6]=useState({accountType:'',consentFinancial:false,consentPayTerms:false,ahName:'',ahRel:'',ahEmail:'',ahPhone:'',ahAddress:'',orgName:'',orgNameOther:'',orgContact:'',orgPhone:'',orgEmail:''});
  const setters=[(k,v)=>setS1(p=>({...p,[k]:v})),(k,v)=>setS2(p=>({...p,[k]:v})),(k,v)=>setS3(p=>({...p,[k]:v})),(k,v)=>setS4(p=>({...p,[k]:v})),(k,v)=>setS5(p=>({...p,[k]:v})),(k,v)=>setS6(p=>({...p,[k]:v}))];

  const validate=()=>{
    const e={};
    if(step===0){if(!s1.title)e.title='Please select a title';if(!s1.surname.trim())e.surname='Surname is required';if(!s1.givenNames.trim())e.givenNames='Given name(s) required';if(!s1.dob)e.dob='Date of birth required';else if(!/^\d{2}\/\d{2}\/\d{4}$/.test(s1.dob))e.dob='Please enter date as DD/MM/YYYY';if(!s1.address.trim())e.address='Address required';if(!s1.suburb.trim())e.suburb='Suburb required';if(!s1.postcode.trim())e.postcode='Postcode required';if(!s1.mobile.trim())e.mobile='Mobile required';if(!s1.email.trim())e.email='Email required';else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s1.email))e.email='Please enter a valid email';}
    if(step===2){if(!s3.ecName.trim())e.ecName='Contact name required';if(!s3.ecRel)e.ecRel='Relationship required';if(!s3.ecMobile.trim())e.ecMobile='Mobile required';}
    if(step===4){if(!s5.consentPrivacy||!s5.consentMHR||!s5.consentAI||!s5.consentComms||!s5.consentAccuracy)e.consent='Please agree to all consent items above to proceed.';if(!s5.sigName.trim())e.sigName='Please print your full name';if(sigEmpty)e.sig='Signature is required';}
    if(step===5){if(!s6.accountType)e.accountType='Please select who will be responsible for the account.';if(s6.accountType==='parent'||s6.accountType==='other'){if(!s6.ahName.trim())e.ahName='Account holder name required';if(!s6.ahEmail.trim())e.ahEmail='Email required';if(!s6.ahPhone.trim())e.ahPhone='Phone required';}if(s6.accountType==='org'&&!s6.orgName)e.orgName='Please select an organisation';if(s6.accountType&&s6.accountType!=='org'&&!s6.consentFinancial)e.consent='Please agree to the Financial Responsibility Agreement.';if(s6.accountType&&s6.accountType!=='org'&&!s6.consentPayTerms)e.consentPayTerms='Please agree to the payment terms.';}
    return e;
  };

  const next=()=>{const e=validate();if(Object.keys(e).length){setErrors(e);window.scrollTo({top:0,behavior:'smooth'});return;}setErrors({});if(step<5){setStep(s=>s+1);window.scrollTo({top:0,behavior:'smooth'});}else setSubmitted(true);};
  const back=()=>{setErrors({});setStep(s=>s-1);window.scrollTo({top:0,behavior:'smooth'});};

  if(submitted) return (
    <div className="success-card">
      <div className="success-icon"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00b4cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
      <h2 style={{fontSize:24,fontWeight:500,color:'var(--navy)',marginBottom:10}}>Registration Complete</h2>
      <p style={{fontSize:15,color:'var(--mid)',lineHeight:1.65,maxWidth:420,margin:'0 auto'}}>Thank you{s1.preferredName?`, ${s1.preferredName}`:s1.givenNames?`, ${s1.givenNames.split(' ')[0]}`:''}. Your new patient registration has been received. Our team will be in touch shortly to confirm your details.</p>
      <div className="stag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Confirmation will be sent to {s1.email}</div>
    </div>
  );

  const views=[
    <Step1 d={s1} set={setters[0]} err={errors}/>,
    <Step2 d={s2} set={setters[1]} err={errors}/>,
    <Step3 d={s3} set={setters[2]} err={errors}/>,
    <Step4 d={s4} set={setters[3]} err={errors}/>,
    <Step5 d={s5} set={setters[4]} sigData={sigData} setSigData={setSigData} sigEmpty={sigEmpty} setSigEmpty={setSigEmpty} err={errors}/>,
    <Step6 d={s6} set={setters[5]} err={errors}/>,
  ];
  const [num,title,desc]=HEADERS[step];

  return <>
    <div className="progress-wrap">
      <div className="progress-steps">
        {STEPS.map((s,i)=>(
          <div key={i} className="progress-step" onClick={()=>{setErrors({});setStep(i);window.scrollTo({top:0,behavior:'smooth'});}}>
            {i<STEPS.length-1&&<div className={`step-connector ${i<step?'done':''}`}/>}
            <div className={`step-dot ${i===step?'active':i<step?'done':''}`}>
              {i<step?<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3 6-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>:i+1}
            </div>
            <div className={`step-label ${i===step?'active':i<step?'done':''}`}>{s.label.split('\n').map((l,j)=><span key={j} style={{display:'block'}}>{l}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="fcard" key={step}>
      <div className="fcard-header">
        <div><div className="sec-num">{num}</div><div className="sec-title">{title}</div><div className="sec-desc">{desc}</div></div>
        <img src="https://anna-bryan-joys.github.io/wisdomsurgery/brand_assets/WisdomSurgery_Logo_Circle.PNG" alt="" style={{height:50,width:50,objectFit:'contain',flexShrink:0,opacity:0.92}}/>
      </div>
      <div className="fcard-body">{views[step]}</div>
    </div>
    <div className="nav-wrap">
      {step>0?<button className="fbtn fbtn-ghost" onClick={back}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Back</button>:<div/>}
      <button className="fbtn fbtn-primary" onClick={next}>
        {step<5?<>Continue <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>:<>Submit Registration <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg></>}
      </button>
    </div>
  </>;
}

ReactDOM.createRoot(document.getElementById('form-root')).render(<FormApp/>);
