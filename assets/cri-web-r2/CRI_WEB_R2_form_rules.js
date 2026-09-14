/* Pure validation shared by the preview runtime and Node checks. No network or storage. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CRI_N4_Rules=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const limits={email:254,organisation:120,role:120,question:1200,context:500};
 function validate(raw,config,copy){
  const values={},errors={};
  for(const key of [...Object.keys(limits),'purpose'])values[key]=String(raw[key]??'').trim();
  for(const key of ['email','organisation','role','question'])if(!values[key])errors[key]=copy.required;
  for(const [key,max] of Object.entries(limits))if(values[key].length>max)errors[key]=copy.too_long+' ('+max+' characters)';
  if(values.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(values.email))errors.email=copy.email_invalid;
  for(const key of ['organisation','role'])if(/[\r\n\u0000-\u001f\u007f]/u.test(values[key]))errors[key]=copy.required;
  if(values.question&&values.question.length<12)errors.question=copy.question_short;
  const purpose=config.purposes.find(p=>p.value===values.purpose);
  if(!purpose)errors.purpose=copy.purpose_invalid;
  if(config.context_required_for.includes(values.purpose)&&!values.context)errors.context=copy.context_required;
  return {valid:Object.keys(errors).length===0,values,errors,purpose};
 }
 function draft(result,config){
  if(!result.valid)throw new Error('Cannot prepare an invalid request.');
  const v=result.values,p=result.purpose;
  const lines=['To: '+p.recipient,'Subject: '+p.subject,'','Professional email: '+v.email,'Organisation / affiliation: '+v.organisation,'Role: '+v.role,'Purpose: '+p.label,'',config.question_label,v.question];
  if(config.context_label&&v.context)lines.push('',config.context_label,v.context);
  lines.push('','Please review the professional context and advise the appropriate next step.');
  return lines.join('\n');
 }
 function purposeFromAnchor(hash,config){const candidate={'#brief-request':'brief','#readiness-form':'readiness'}[hash];return candidate&&config.purposes.some(p=>p.value===candidate)?candidate:null;}
 return {limits,validate,draft,purposeFromAnchor};
});
