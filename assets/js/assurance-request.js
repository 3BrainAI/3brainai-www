/* Local email preparation only. No transport, storage, analytics or access grant. */
(() => {
 'use strict';
 const form=document.querySelector('#assurance-request');
 if(!form) return;
 const result=document.querySelector('#assurance-result');
 const draft=document.querySelector('#assurance-draft');
 const openEmail=document.querySelector('#assurance-open-email');
 const status=document.querySelector('#assurance-status');
 const recipient='contact@3brain.ai';
 const subject='Assurance information request - 3BrainAI';
 const purposes=new Map([['customer','Customer due diligence'],['partner','Partner due diligence'],['investor','Investor due diligence'],['security','Security review'],['other','Other']]);
 const categories=new Map([['architecture','Architecture and data flows'],['governance','Governance and responsibilities'],['delivery','Change, release and access controls'],['evidence','Evidence lineage and limitations'],['vendors','Third-party services'],['resilience','Incident and continuity information']]);
 const ndaStates=new Map([['yes','Yes'],['no','No'],['unsure','Not sure']]);
 const field=name=>form.elements.namedItem(name);
 const clear=()=>{result.hidden=true;draft.value='';openEmail.removeAttribute('href');openEmail.hidden=true;};
 const announce=text=>{status.textContent=text;};
 form.addEventListener('submit',event=>{
  event.preventDefault(); clear();
  for(const name of ['name','organisation','email','role']) {
   const el=field(name),value=el.value.trim();
   el.setCustomValidity(!value?'Complete this field.':/[\r\n\x00-\x1f]/.test(value)?'Use one line of text.':value.length>el.maxLength?'Shorten this field to the stated limit.':'');
  }
  field('purpose').setCustomValidity(purposes.has(field('purpose').value)?'':'Choose a listed purpose.');
  field('nda').setCustomValidity(ndaStates.has(field('nda').value)?'':'Choose an NDA status.');
  const selected=[...form.querySelectorAll('[name="categories[]"]:checked')];
  const categoryError=selected.length&&selected.every(el=>categories.has(el.value))?'':'Select at least one information category.';
  form.querySelector('[name="categories[]"]').setCustomValidity(categoryError);
  const context=field('context').value.trim();
  field('context').setCustomValidity(context.length>1200?'Use no more than 1,200 characters.':'');
  if(!form.reportValidity()){announce('Please complete the required fields. No draft has been prepared.');return;}
  const body=[
   'Hello 3BrainAI,','',
   'I would like to discuss the availability of scoped assurance information.','',
   'Full name: '+field('name').value.trim(),
   'Organisation: '+field('organisation').value.trim(),
   'Work email: '+field('email').value.trim(),
   'Role: '+field('role').value.trim(),
   'Purpose: '+purposes.get(field('purpose').value),
   'Information requested: '+selected.map(el=>categories.get(el.value)).join('; '),
   'Existing NDA: '+ndaStates.get(field('nda').value),
   '', 'Context: '+(context||'Not provided.'), '',
   'I have read the privacy notice. This initial enquiry contains non-confidential information only.'
  ].join('\n');
  draft.value='To: '+recipient+'\nSubject: '+subject+'\n\n'+body;
  const mailto='mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  // Large mailto URLs are unreliable in email applications; the copyable draft
  // remains available at every length and is never silently truncated.
  if(mailto.length<=1800){openEmail.href=mailto;openEmail.hidden=false;}
  result.hidden=false;
  announce('Draft prepared. Nothing has been sent. Review and send it from your email application.');
  result.focus();
 });
 const stale=()=>{
  for(const el of form.elements) if(typeof el.setCustomValidity==='function')el.setCustomValidity('');
  if(!result.hidden){clear();announce('Details changed. Prepare the draft again.');}
 };
 form.addEventListener('input',stale);form.addEventListener('change',stale);
 form.addEventListener('reset',()=>{clear();for(const el of form.elements)if(typeof el.setCustomValidity==='function')el.setCustomValidity('');announce('Form cleared.');});
 form.querySelector('[type=submit]').disabled=false;
})();
