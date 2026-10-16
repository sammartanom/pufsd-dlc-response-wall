const form = document.querySelector('#response-form');
const submitButton = document.querySelector('#submit-button');
const formMessage = document.querySelector('#form-message');
const grid = document.querySelector('#response-grid');
const loading = document.querySelector('#loading');
const empty = document.querySelector('#empty');
const count = document.querySelector('#response-count');
const fields = [...document.querySelectorAll('textarea')];
const viewButtons = [...document.querySelectorAll('.view-button')];
const focusControls = document.querySelector('#focus-controls');
const focusPosition = document.querySelector('#focus-position');
let items = [];
let currentView = 'themes';
let focusIndex = 0;

const prompts = [
  'We believe Pleasantville students are best served when technology…',
  'The line between helpful and harmful technology use is crossed when…',
  'By June 2027, we will know that we have succeeded if…'
];
fields.forEach(field => { const output=document.querySelector(`[data-count-for="${field.id}"]`); field.addEventListener('input',()=>output.value=field.value.length); });
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function answers(item){return [item.response_1,item.response_2,item.response_3];}
function personCard(item,index,focus=false){return `<article class="${focus?'focus-card':'response-card'}"><div class="card-top"><span class="card-label">Response ${index+1}</span></div>${answers(item).map((answer,i)=>`<div class="answer"><p class="answer-prompt">${prompts[i]}</p><p class="answer-text">${escapeHtml(answer)}</p></div>`).join('')}</article>`;}
function render(){focusControls.hidden=true;grid.className='';if(!items.length){grid.innerHTML='';empty.hidden=false;return;}empty.hidden=true;if(currentView==='themes'){grid.className='themes-view';grid.innerHTML=prompts.map((prompt,i)=>`<section class="theme-column"><div class="theme-heading">${prompt}</div>${items.map(item=>`<div class="theme-answer">${escapeHtml(answers(item)[i])}</div>`).join('')}</section>`).join('');}else if(currentView==='people'){grid.className='people-view';grid.innerHTML=items.map((item,i)=>personCard(item,i)).join('');}else{grid.className='focus-view';grid.innerHTML=personCard(items[focusIndex],focusIndex,true);focusControls.hidden=false;focusPosition.textContent=`${focusIndex+1} of ${items.length}`;}}
viewButtons.forEach(button=>button.addEventListener('click',()=>{currentView=button.dataset.view;viewButtons.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});render();}));
document.querySelector('#focus-prev').addEventListener('click',()=>{focusIndex=(focusIndex-1+items.length)%items.length;render();});
document.querySelector('#focus-next').addEventListener('click',()=>{focusIndex=(focusIndex+1)%items.length;render();});
async function loadResponses(){loading.hidden=false;empty.hidden=true;try{const response=await fetch('/api/responses',{headers:{accept:'application/json'}});if(!response.ok)throw new Error();const data=await response.json();items=data.responses||[];focusIndex=0;count.textContent=items.length?`${items.length} ${items.length===1?'response':'responses'}`:'';render();}catch{items=[];grid.innerHTML='';empty.hidden=false;empty.innerHTML='<p>Responses could not be loaded.</p>';}finally{loading.hidden=true;}}
form.addEventListener('submit',async event=>{event.preventDefault();formMessage.textContent='';formMessage.className='';if(!form.reportValidity())return;submitButton.disabled=true;submitButton.querySelector('span').textContent='Submitting…';try{const response=await fetch('/api/responses',{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({response1:form.response1.value,response2:form.response2.value,response3:form.response3.value,website:form.website.value})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Submission failed.');form.reset();fields.forEach(field=>document.querySelector(`[data-count-for="${field.id}"]`).value=0);formMessage.textContent='Responses submitted.';formMessage.classList.add('success');await loadResponses();document.querySelector('#responses-title').scrollIntoView({behavior:'smooth'});}catch(error){formMessage.textContent=error.message;formMessage.classList.add('error');}finally{submitButton.disabled=false;submitButton.querySelector('span').textContent='Submit responses';}});
loadResponses();
