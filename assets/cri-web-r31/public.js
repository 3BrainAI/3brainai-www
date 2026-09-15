/* Local review behaviour only. No request transport, analytics, remote assets or access provisioning. */
(function(){
 'use strict';
 const cfg=JSON.parse(document.getElementById('n4-config').textContent);
 const body=document.querySelector('.cri-n4')||document.body;body.classList.add('js-ready');
 const nav=document.getElementById('primary-nav'),menu=document.querySelector('.menu-button');
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
 // The second, larger public folio is never inserted on an initial viewport <= 760px.
 const desktop=window.matchMedia('(min-width: 761px)');
 function mountDesktop(){if(desktop.matches)document.querySelectorAll('template[data-desktop-only]').forEach(t=>{t.replaceWith(t.content.cloneNode(true));});}
 mountDesktop();desktop.addEventListener('change',mountDesktop);
 document.querySelectorAll('[data-copy-link]').forEach(button=>button.addEventListener('click',async()=>{
  const status=button.nextElementSibling;
  const url=new URL(button.dataset.copyLink,location.origin).href;
  try{
   await navigator.clipboard.writeText(url);
   if(status)status.textContent='Link copied.';
  }catch{
   if(status)status.textContent='Copy this link: '+url;
  }
 }));
 const form=document.querySelector('form[data-n4-form]');
 let prepare=null,setPurposeFromHash=null;
 if(form){
  const f=cfg.form,copy=cfg.form_copy,fields={};
  for(const el of form.querySelectorAll('[name]'))fields[el.name]=el;
  const message=form.querySelector('.form-message'),draftBox=form.querySelector('.email-draft'),draftArea=draftBox.querySelector('textarea');
  const submit=form.querySelector('[data-prepare]');submit.disabled=false;
  let touched=false,hasDraft=false;
  function get(){const raw={};for(const [name,el]of Object.entries(fields))raw[name]=el.value;return CRI_N4_Rules.validate(raw,f,copy);}
  function clearErrors(){for(const [name,el]of Object.entries(fields)){el.removeAttribute('aria-invalid');const err=form.querySelector('[data-error="'+name+'"]');if(err){err.hidden=true;err.textContent='';}}}
  function showErrors(r){clearErrors();for(const [name,err]of Object.entries(r.errors)){if(fields[name])fields[name].setAttribute('aria-invalid','true');const node=form.querySelector('[data-error="'+name+'"]');if(node){node.textContent=err;node.hidden=false;}}}
  function announce(text,kind,focus){message.textContent=text;message.className='form-message '+kind;message.hidden=false;if(focus)message.focus();}
  function refreshPurpose(){const p=f.purposes.find(p=>p.value===fields.purpose.value);submit.textContent=p?p.button:f.purposes[0].button;if(fields.context){const required=f.context_required_for.includes(fields.purpose.value);fields.context.required=required;fields.context.setAttribute('aria-required',String(required));}}
  function stale(){if(hasDraft){hasDraft=false;draftArea.value='';draftBox.hidden=true;announce(copy.draft_stale,'stale',false);}}
  prepare=function(){touched=true;const r=get();showErrors(r);if(!r.valid){hasDraft=false;draftBox.hidden=true;draftArea.value='';announce(copy.error_summary,'error',true);return;}draftArea.value=CRI_N4_Rules.draft(r,f);draftBox.hidden=false;hasDraft=true;announce(copy.preview_success,'ready',true);};
  form.addEventListener('submit',e=>{e.preventDefault();prepare();});
  form.addEventListener('input',()=>{stale();refreshPurpose();if(touched)showErrors(get());});
  form.addEventListener('change',()=>{stale();refreshPurpose();if(touched)showErrors(get());});
  form.addEventListener('reset',()=>{touched=false;hasDraft=false;clearErrors();draftArea.value='';draftBox.hidden=true;message.textContent='';message.className='form-message';message.hidden=true;window.setTimeout(refreshPurpose,0);});
  setPurposeFromHash=function(hash){const purpose=CRI_N4_Rules.purposeFromAnchor(hash,f);if(purpose){fields.purpose.value=purpose;stale();refreshPurpose();if(touched)showErrors(get());}};
  function routePurpose(){setPurposeFromHash(location.hash);}
  window.addEventListener('hashchange',routePurpose);refreshPurpose();routePurpose();
  document.querySelectorAll('[data-state]').forEach(button=>button.addEventListener('click',()=>{
   const state=button.dataset.state;
   if(state==='empty'){form.reset();form.scrollIntoView();return;}
   fields.email.value=state==='invalid'?'reviewer@':'reviewer@example.org';
   fields.organisation.value=state==='invalid'?'':'Example institution';fields.role.value='Risk reviewer';
   fields.question.value=state==='invalid'?'Review':'I would like to assess how the model review separates a declaration from a scoped technical reply.';
   if(fields.context)fields.context.value=state==='invalid'?'':'An anonymised construction milestone; model context only.';
   prepare();
  }));
 }
 document.addEventListener('click',e=>{
  const a=e.target.closest('a');if(!a)return;
  const target=a.dataset.canonical;
  if(target&&setPurposeFromHash&&target.split('#')[0]===cfg.route)setPurposeFromHash('#'+(target.split('#')[1]||''));
  // All email links in a review artifact show the address without opening a mail client.
  if(target&&target.startsWith('mailto:')&&!cfg.publicCandidate){e.preventDefault();const note=document.getElementById('review-message');note.textContent='Review preview: '+target.slice(7)+'. No email was opened or sent.';note.hidden=false;note.focus();return;}
  if(target&&cfg.embedded&&cfg.routes.includes(target.split('#')[0])){e.preventDefault();parent.postMessage({type:'cri-n4-navigate',target},'*');}
 });
 window.addEventListener('message',e=>{if(e.source!==parent||!cfg.embedded)return;if(e.data?.type==='cri-n4-state'){document.querySelector('[data-state="'+String(e.data.state).replace(/[^a-z]/g,'')+'"]')?.click();}if(e.data?.type==='cri-n4-anchor'&&/^#[a-z0-9-]+$/.test(e.data.hash)){location.hash=e.data.hash;document.getElementById(e.data.hash.slice(1))?.scrollIntoView();}});
})();
