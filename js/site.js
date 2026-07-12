
document.addEventListener('DOMContentLoaded',function(){
  // floating mobile CTA bar (H5 conversion pattern) — only on non-contact pages
  if(location.pathname.indexOf('contact')===-1){
    var cta=document.createElement('a');
    cta.className='mobile-cta';
    cta.href='contact.html';
    cta.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Get a Free Quote';
    document.body.appendChild(cta);
  }
  // year
  var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
  // header shadow on scroll
  var h=document.querySelector('header.site');
  function onScroll(){ if(window.scrollY>10) h.classList.add('scrolled'); else h.classList.remove('scrolled'); }
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
  // close mobile menu on link click
  document.querySelectorAll('#m a').forEach(function(a){a.addEventListener('click',function(){document.getElementById('m').classList.remove('open');});});
  // faq accordion
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var item=q.parentElement, a=item.querySelector('.faq-a');
      var open=item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(i){i.classList.remove('open');i.querySelector('.faq-a').style.maxHeight=null;});
      if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
    });
  });
  // gallery filter
  document.querySelectorAll('.filter').forEach(function(f){
    f.addEventListener('click',function(){
      document.querySelectorAll('.filter').forEach(function(x){x.classList.remove('active');});
      f.classList.add('active');
      var cat=f.getAttribute('data-cat');
      document.querySelectorAll('.gshot').forEach(function(g){
        g.style.display=(cat==='all'||g.getAttribute('data-cat')===cat)?'':'none';
      });
    });
  });
  // contact form -> Formspree (email + dashboard), with inline success
  var form=document.getElementById('quoteForm');
  if(form){
    // TODO: 把 FORM_ID 替换为你的 Formspree 表单 ID（在 formspree.io 创建表单后获得）
    var FORMSPREE_ENDPOINT='https://formspree.io/f/FORM_ID';
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=form.querySelector('button[type=submit]');
      var orig=btn.innerHTML;
      btn.disabled=true; btn.innerHTML='Sending…';
      fetch(FORMSPREE_ENDPOINT,{
        method:'POST',
        body:new FormData(form),
        headers:{'Accept':'application/json'}
      }).then(function(r){
        if(r.ok){
          document.getElementById('formOk').style.display='block';
          form.reset();
          document.getElementById('formOk').scrollIntoView({behavior:'smooth',block:'center'});
        }else{
          alert('Sorry, something went wrong. Please email us directly.');
        }
      }).catch(function(){
        alert('Network error. Please email us directly.');
      }).finally(function(){
        btn.disabled=false; btn.innerHTML=orig;
      });
    });
  }
});
