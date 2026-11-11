const subjects = [
 {id:"math",name:"Mathematics",book:"Ganita Prakash",icon:"∑",color:"blue",parts:[
  {name:"Part I",chapters:["A Square and A Cube","Power Play","A Story of Numbers","Quadrilaterals","Number Play","We Distribute, Yet Things Multiply","Proportional Reasoning–1"]},
  {name:"Part II",chapters:["Fractions in Disguise","The Baudhayana-Pythagoras Theorem","Proportional Reasoning-2","Exploring Some Geometric Themes","Tales by Dots and Lines","Algebra Play","Area"]}
 ]},
 {id:"science",name:"Science",book:"Curiosity",icon:"⚗",color:"green",chapters:["Exploring the Investigative World of Science","The Invisible Living World: Beyond Our Naked Eye","Health: The Ultimate Treasure","Electricity: Magnetic and Heating Effects","Exploring Forces","Pressure, Winds, Storms, and Cyclones","Particulate Nature of Matter","Nature of Matter: Elements, Compounds, and Mixtures","The Amazing World of Solutes, Solvents, and Solutions","Light: Mirrors and Lenses","Keeping Time with the Skies","How Nature Works in Harmony","Our Home: Earth, a Unique Life Sustaining Planet"]},
 {id:"sst",name:"Social Science",book:"Exploring Society: India and Beyond",icon:"◎",color:"orange",parts:[
  {name:"Part I",chapters:["Natural Resources and Their Use","Reshaping India’s Political Map","The Rise of the Marathas","The Colonial Era in India","Universal Franchise and India’s Electoral System","The Parliamentary System: Legislature and Executive","Factors of Production"]},
  {name:"Part II",chapters:["World Geography: Some Glimpses","India’s Long Road to Independence","A Journey Through Indian Architecture","The Role of the Judiciary in Our Society","Citizenship: Rights and Duties","Dynamics of Population","India’s Urban Landscape","Cultural Currents: 13th to 17th Centuries"]}
 ]},
 {id:"english",name:"English",book:"Poorvi",icon:"Aa",color:"purple",parts:[
  {name:"Unit 1: Wit and Wisdom",chapters:["The Wit that Won Hearts","A Concrete Example","Wisdom Paves the Way"]},
  {name:"Unit 2: Values and Dispositions",chapters:["A Tale of Valour: Major Somnath Sharma and the Battle of Badgam","Somebody’s Mother","Verghese Kurien—I Too Had a Dream"]},
  {name:"Unit 3: Mystery and Magic",chapters:["The Case of the Fifth Word","The Magic Brush of Dreams","Spectacular Wonders"]},
  {name:"Unit 4: Environment",chapters:["The Cherry Tree","Harvest Hymn","Waiting for the Rain"]},
  {name:"Unit 5: Science and Curiosity",chapters:["Feathered Friend","Magnifying Glass","Bibha Chowdhuri: The Beam of Light that Lit the Path for Women in Indian Science"]}
 ]},
 {id:"hindi",name:"Hindi",book:"Malhar",icon:"अ",color:"pink",chapters:["स्वदेश","दो गौरैया","एक आशीर्वाद","हरिहर","कबीर के दोहे","एक टोकरी भर मिट्टी","मत बाँधो","नए मेहमान","आदमी का अनुपात","तरुण का स्वप्न"]}
];
const STORAGE="boardprep_class8_data_v1";
let state;
try { state=JSON.parse(localStorage.getItem(STORAGE)||'{}')||{}; } catch { state={}; }
state.completed ||= []; state.tasks ||= []; state.mistakes ||= []; state.scores ||= []; state.custom ||= {};
state.focusSessions ||= []; state.points=Number.isFinite(state.points)?state.points:0; state.activeFocus ||= null;
// Migrate earlier SST completion keys to the explicit Part I structure.
state.completed=state.completed.map(k=>{const m=String(k).match(/^sst::(\d+)$/);return m&&Number(m[1])<7?`sst:Part I:${m[1]}`:k;});
let currentSubject="math",currentChapter=0,currentTab="notes";
const $=id=>document.getElementById(id);
const save=()=>{localStorage.setItem(STORAGE,JSON.stringify(state));renderStats();renderFocus();};
const allChapters=()=>subjects.flatMap(s=>(s.parts||[{name:"",chapters:s.chapters}]).flatMap(p=>p.chapters.map((name,i)=>({key:`${s.id}:${p.name}:${i}`,subject:s,part:p.name,name,index:i}))));
function showPage(page){document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$(`${page}Page`).classList.remove("hidden");document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("pageTitle").textContent=({dashboard:"Dashboard",subjects:"Subjects & Chapters",planner:"Study Planner",mistakes:"Mistake Book"})[page]||"Learning";$("crumb").textContent=page==="dashboard"?"YOUR LEARNING SPACE":"BOARDPREP / "+page.toUpperCase();$("sidebar").classList.remove("open");}
function renderStats(){const chapters=allChapters();$("subjectCount").textContent=subjects.length;$("doneCount").textContent=state.completed.length;$("chapterTotal").textContent=`of ${chapters.length} listed chapters`;let pct=Math.round(state.completed.length/chapters.length*100);$("progressPercent").textContent=pct+"%";$("progressBar").style.width=pct+"%";$("progressText").textContent=`${state.completed.length} of ${chapters.length} chapters marked complete.`;$("averageScore").textContent=state.scores.length?Math.round(state.scores.reduce((a,b)=>a+b,0)/state.scores.length)+"%":"—";$("streak").textContent=state.streak||"0 days";$("pointsTotal").textContent=state.points||0;$("focusSessionsTotal").textContent=`${state.focusSessions.length} completed sessions`;$("subjectCards").innerHTML=subjects.map(s=>{let c=allChapters().filter(x=>x.subject.id===s.id),done=c.filter(x=>state.completed.includes(x.key)).length;return `<button class="subject-card" data-subject="${s.id}"><div class="subject-symbol ${s.color}">${s.icon}</div><strong>${s.name}</strong><small>${s.book}</small><div class="mini-track"><i style="width:${c.length?done/c.length*100:0}%"></i></div><small>${done}/${c.length} chapters complete</small></button>`}).join("");document.querySelectorAll("[data-subject]").forEach(b=>b.onclick=()=>{currentSubject=b.dataset.subject;showPage("subjects");renderSubjects();});}
function renderSubjects(filter=""){const s=subjects.find(x=>x.id===currentSubject)||subjects[0];$("subjectList").innerHTML=subjects.map(x=>`<button class="subject-pick ${x.id===s.id?"active":""}" data-pick="${x.id}">${x.icon} &nbsp; ${x.name}</button>`).join("");document.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{currentSubject=b.dataset.pick;renderSubjects($("subjectSearch").value)});$("selectedSubject").textContent=s.name;$("selectedBook").textContent="NCERT TEXTBOOK";$("selectedSubtitle").textContent=s.book;$("selectedCount").textContent=allChapters().filter(x=>x.subject.id===s.id).length+" chapters";let groups=s.parts||[{name:"",chapters:s.chapters}];$("chapterList").innerHTML=groups.map(g=>`${g.name?`<div class="eyebrow" style="grid-column:1/-1;margin:10px 0 0">${g.name}</div>`:""}${g.chapters.map((name,i)=>{let key=`${s.id}:${g.name}:${i}`;if(filter&&!`${s.name} ${s.book} ${name}`.toLowerCase().includes(filter.toLowerCase()))return "";return `<button class="chapter-row" data-chapter="${encodeURIComponent(key)}"><span class="chapter-num">${i+1}</span><span><strong>${name}</strong><small>${g.name||s.book} · Open learning centre</small></span>${state.completed.includes(key)?'<span class="tick">✓</span>':""}</button>`}).join("")}`).join("");document.querySelectorAll("[data-chapter]").forEach(b=>b.onclick=()=>openChapter(decodeURIComponent(b.dataset.chapter))); }
function openChapter(key){let item=allChapters().find(c=>c.key===key);if(!item)return;currentSubject=item.subject.id;currentChapter=key;currentTab="notes";$("chapterSubjectLabel").textContent=item.subject.name.toUpperCase();$("chapterTitle").textContent=item.name;$("chapterBookLabel").textContent=`${item.subject.book} · Class 8 · ${item.part||"NCERT"}`;$("markComplete").textContent=state.completed.includes(key)?"✓ Completed":"○ Mark complete";$("markComplete").classList.toggle("is-done",state.completed.includes(key));showPage("chapter");renderTabs();}
function solutionUrl(item){
 const s=item.subject, n=item.index+1;
 if(s.id==="math") return item.part==="Part II"?`https://www.teachoo.com/subjects/cbse-maths/class-8/chapter-${n}-ganita-prakash-ii/`:`https://www.teachoo.com/subjects/cbse-maths/class-8/chapter-${n}-ganita-prakash/`;
 if(s.id==="science") return `https://www.teachoo.com/subjects/science/class-8/chapter-${n}-curiosity/`;
 if(s.id==="english") { const all=s.parts.flatMap(x=>x.chapters); const idx=all.indexOf(item.name)+1; return `https://www.teachoo.com/subjects/english-school/class-8/poorvi/chapter-${idx}/`; }
 if(s.id==="sst") return item.part==="Part II"?`https://clearstudy.in/ncert-solutions/class-8/social-science/exploring-society/part-2/chapter-${n}/`:`https://clearstudy.in/ncert-solutions/class-8/social-science/exploring-society/chapter-${n}/`;
 if(s.id==="hindi") return `https://saraswatacademy.in/hindi_class8/chapters/hindi_8_ch${n}.html`;
 return "https://ncert.nic.in/textbook.php";
}
function practiceQuestions(item){
 const title=item.name;
 const templates={
  math:[`Explain the main mathematical idea in “${title}” in your own words.`,`Write the important definitions used in “${title}”.`,`List the rules, properties or formulae that are useful in this chapter.`,`Show one simple worked example related to “${title}”, with all steps.`,`Create a numerical problem from this chapter and solve it.`,`Explain why the method used in this chapter works.`,`What common mistake should a student avoid in “${title}”?`,`Give a real-life situation where an idea from this chapter is useful.`,`Compare two related concepts or methods from this chapter.`,`Solve one textbook example again without looking at the solution.`,`Explain how you would check whether an answer from this chapter is correct.`,`Make a small diagram, table or number pattern that explains one idea from the chapter.`,`Write a question from this chapter that needs more than one step to solve.`,`If one value in a problem changes, explain how the answer or method may change.`,`Write a short revision summary of the most important ideas in “${title}”.`],
  science:[`What is the central scientific idea explored in “${title}”? Explain it briefly.`,`Define five important scientific terms from this chapter.`,`Describe one process or phenomenon discussed in “${title}”.`,`Give one everyday example that demonstrates an idea from this chapter.`,`Explain why the main process or phenomenon in this chapter occurs.`,`Draw and label a diagram related to “${title}”, if applicable.`,`State two observations that support an important idea in this chapter.`,`What would happen if one important condition in this chapter changed?`,`Differentiate between two related terms or processes from this chapter.`,`Describe a simple, safe observation or model that could help explain this topic.`,`Mention two uses or applications of the knowledge in this chapter.`,`Identify one misconception a learner might have about this topic and correct it.`,`Explain one cause-and-effect relationship from this chapter.`,`Write a short answer connecting this chapter to daily life or the environment.`,`Summarise the five most important points from “${title}”.`],
  sst:[`What is the main theme of “${title}”? Explain it in a short paragraph.`,`Define five important terms used in this chapter.`,`Identify the key people, places, institutions or geographical features mentioned.`,`Explain two important causes or factors discussed in this chapter.`,`Describe two major effects or consequences related to this topic.`,`Give one example from India that helps explain an idea in this chapter.`,`Arrange three important events or stages in the correct sequence, where relevant.`,`How does this chapter connect with people's everyday lives?`,`Explain one difference or comparison discussed in this chapter.`,`What evidence, map, source or example supports an important point?`,`Why is the topic “${title}” important for understanding India or the world?`,`Write a short note on one important concept from this chapter.`,`Explain one challenge or problem discussed and suggest a balanced response.`,`Create a three-point timeline, map note or concept chart for this chapter.`,`Write a five-point revision summary of “${title}”.`],
  english:[`Who or what is central to “${title}”? Describe briefly.`,`Write the central idea or theme of “${title}”.`,`Describe an important event, image or idea from the text.`,`What does the title “${title}” suggest? Explain your answer.`,`Choose an important character or speaker and describe their qualities.`,`What lesson, value or message can readers take from this text?`,`Explain an important line, incident or image in your own words.`,`Identify two words from the text and use each in a new sentence.`,`Describe how the writer creates interest, emotion, humour or suspense.`,`How does the setting or situation influence the text?`,`Write a short character sketch or description of the speaker.`,`What evidence from the text supports your interpretation?`,`Suggest another suitable title and give a reason.`,`Write a short paragraph connecting the text with a real-life experience.`,`Summarise “${title}” in 5–6 sentences.`],
  hindi:[`‘${title}’ पाठ/कविता का मुख्य भाव अपने शब्दों में लिखिए।`,`इस पाठ के पाँच महत्वपूर्ण शब्द चुनकर उनके अर्थ लिखिए।`,`पाठ के प्रमुख पात्र, कवि या लेखक का संक्षिप्त परिचय दीजिए।`,`‘${title}’ शीर्षक की सार्थकता स्पष्ट कीजिए।`,`पाठ की किसी महत्वपूर्ण पंक्ति/घटना का भावार्थ लिखिए।`,`इस पाठ से आपको क्या शिक्षा या संदेश मिलता है?`,`पाठ में व्यक्त किसी एक प्रमुख भावना का वर्णन कीजिए।`,`पाठ के आधार पर दो प्रश्न बनाइए और उनके उत्तर लिखिए।`,`किसी एक पात्र/वक्ता के स्वभाव की दो विशेषताएँ लिखिए।`,`पाठ की भाषा-शैली की दो विशेषताएँ बताइए।`,`पाठ से संबंधित एक उदाहरण अपने जीवन या समाज से दीजिए।`,`पाठ में आए किसी कठिन शब्द का वाक्य में प्रयोग कीजिए।`,`यदि आप लेखक/कवि होते, तो पाठ के अंत में क्या परिवर्तन करते?`,`‘${title}’ का सारांश 5–6 वाक्यों में लिखिए।`,`इस पाठ का सबसे प्रभावशाली विचार कौन-सा लगा और क्यों?`]
 };
 return templates[item.subject.id]||templates.sst;
}
function renderTabs(){
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===currentTab));
 const saved=state.custom[currentChapter]||{}; const item=allChapters().find(c=>c.key===currentChapter); let content="";
 if(currentTab==="notes")content=`<div class="content-head"><h3>Write Your Own Notes</h3><small>Your notes are saved on this device</small></div><div class="content-block"><h4>Your personal chapter notebook</h4><p>Write summaries, key concepts, definitions, formulas, examples and points your teacher highlighted.</p></div><textarea class="editor-area" id="notesEditor" placeholder="Write your own notes for this chapter here…">${escapeHtml(saved.notes||"")}</textarea><button class="primary-btn save-content" data-save="notes">Save my notes</button>`;
 if(currentTab==="solutions")content=`<div class="content-head"><h3>NCERT Exercise Solutions</h3><small>${escapeHtml(item.subject.book)} · ${escapeHtml(item.name)}</small></div><div class="placeholder-note" style="margin-bottom:12px">Solutions are displayed in this chapter workspace. The reference material is loaded inside the app frame; it will not intentionally open a separate browser tab. An internet connection is required.</div><iframe class="solutions-frame" title="NCERT solutions for ${escapeHtml(item.name)}" src="${solutionUrl(item)}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="strict-origin-when-cross-origin"></iframe><p class="muted" style="margin-top:10px">If the provider prevents embedded viewing, its page may not load inside this app. This depends on that website's security settings.</p>`;
 if(currentTab==="practice"){
  const qs=practiceQuestions(item); const answers=saved.practiceAnswers||{};
  content=`<div class="content-head"><h3>15 Chapter Practice Questions</h3><small>Original revision questions · ${qs.length} total</small></div><div class="placeholder-note" style="margin-bottom:14px">Answer these in your own words. These are additional practice questions, not copied NCERT exercise questions. Your answers are saved on this device.</div>${qs.map((q,i)=>`<div class="question practice-question"><strong>${i+1}. ${escapeHtml(q)}</strong><textarea class="editor-area practice-answer" data-practice="${i}" placeholder="Write your answer here…">${escapeHtml(answers[i]||"")}</textarea></div>`).join("")}<button class="primary-btn save-content" id="savePractice">Save all answers</button><span id="practiceSaved" class="muted" style="margin-left:12px"></span>`;
 }
 if(currentTab==="test") currentTab="practice";
 $("chapterContent").innerHTML=content;
 document.querySelectorAll("[data-save]").forEach(b=>b.onclick=()=>{let type=b.dataset.save;state.custom[currentChapter]=state.custom[currentChapter]||{};state.custom[currentChapter][type]=$("notesEditor").value;save();b.textContent="Saved ✓";});
 if(currentTab==="practice"){$("savePractice").onclick=()=>{state.custom[currentChapter]=state.custom[currentChapter]||{};const a={};document.querySelectorAll("[data-practice]").forEach(x=>a[x.dataset.practice]=x.value);state.custom[currentChapter].practiceAnswers=a;save();$("practiceSaved").textContent="Answers saved ✓";};}
}
const FOCUS_MS=25*60*1000, FOCUS_POINTS=50;
let focusTicker=null;
function fmtTime(ms){const total=Math.max(0,Math.ceil(ms/1000));return `${String(Math.floor(total/60)).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;}
function finishFocus(){
  if(!state.activeFocus || state.activeFocus.status!=="running") return;
  const session=state.activeFocus;
  if(Date.now()<session.endsAt) return;
  // Store a permanent completion record before clearing the active timer.
  // The session id prevents a refresh from ever awarding the same points twice.
  if(!state.focusSessions.some(x=>x.id===session.id)){
    state.focusSessions.unshift({
      id:session.id,
      startedAt:session.startedAt,
      completedAt:new Date(session.endsAt).toISOString(),
      durationMinutes:25,
      points:FOCUS_POINTS
    });
    state.points=(state.points||0)+FOCUS_POINTS;
  }
  state.activeFocus=null;
  save();
  if($("focusStatus")) $("focusStatus").textContent="Session completed! 50 points added to your total.";
  if($("focusStart")) $("focusStart").textContent="Start another session";
  if(focusTicker){clearInterval(focusTicker);focusTicker=null;}
}
function remainingFocus(){if(!state.activeFocus)return FOCUS_MS;return state.activeFocus.status==="running"?Math.max(0,state.activeFocus.endsAt-Date.now()):Math.max(0,state.activeFocus.remainingMs??FOCUS_MS);}
function renderFocus(){
  if(!$("focusClock"))return;
  const active=state.activeFocus, remaining=remainingFocus();
  $("focusClock").textContent=fmtTime(remaining);
  $("focusStart").textContent=!active?"Start focus":active.status==="paused"?"Resume focus":"Focus running";
  $("focusStart").disabled=!!active&&active.status==="running";
  $("focusPause").disabled=!active||active.status!=="running";
  if(!active) $("focusStatus").textContent="Complete a full 25-minute session to earn 50 points.";
  else if(active.status==="paused") $("focusStatus").textContent="Session paused. Your remaining time and start record are saved on this device.";
  else $("focusStatus").textContent="Stay focused. Start time and end time are saved automatically.";
  $("focusHistoryCount").textContent=`${state.focusSessions.length} sessions`;
  $("focusHistory").innerHTML=state.focusSessions.length?state.focusSessions.slice(0,8).map(x=>`<div class="focus-history-row"><span>${new Date(x.completedAt).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span><strong>+${x.points} pts</strong></div>`).join(""):'<p class="muted">Your completed sessions will appear here.</p>';
}
function startFocus(){
  if(state.activeFocus?.status==="running")return;
  if(!state.activeFocus){
    const now=Date.now();
    state.activeFocus={id:`focus-${now}`,status:"running",startedAt:new Date(now).toISOString(),endsAt:now+FOCUS_MS,remainingMs:FOCUS_MS};
  } else {
    state.activeFocus.status="running";
    state.activeFocus.endsAt=Date.now()+Math.max(0,state.activeFocus.remainingMs||0);
    delete state.activeFocus.remainingMs;
  }
  save();
  if(focusTicker)clearInterval(focusTicker);
  focusTicker=setInterval(()=>{if(!state.activeFocus)return;if(remainingFocus()<=0){finishFocus();return;}$("focusClock").textContent=fmtTime(remainingFocus());},250);
}
function pauseFocus(){
  if(!state.activeFocus||state.activeFocus.status!=="running")return;
  state.activeFocus.remainingMs=remainingFocus();
  state.activeFocus.status="paused";
  state.activeFocus.lastPausedAt=new Date().toISOString();
  delete state.activeFocus.endsAt;
  if(focusTicker){clearInterval(focusTicker);focusTicker=null;}
  save();
}
function resetFocus(){
  if(focusTicker){clearInterval(focusTicker);focusTicker=null;}
  state.activeFocus=null;
  save();
  $("focusStatus").textContent="Timer reset. This unfinished session was not awarded points.";
}
function initFocus(){
  // If a full session elapsed while the page was closed, recover and award it once.
  if(state.activeFocus?.status==="running"&&Date.now()>=state.activeFocus.endsAt)finishFocus();
  $("focusStart").onclick=startFocus;
  $("focusPause").onclick=pauseFocus;
  $("focusReset").onclick=resetFocus;
  renderFocus();
  if(state.activeFocus?.status==="running"){
    focusTicker=setInterval(()=>{if(!state.activeFocus)return;if(remainingFocus()<=0){finishFocus();return;}$("focusClock").textContent=fmtTime(remainingFocus());},250);
  }
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden&&state.activeFocus?.status==="running"){
      if(remainingFocus()<=0)finishFocus();else renderFocus();
    }
  });
}
function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fillSelects(){let opts=subjects.map(s=>`<option value="${s.id}">${s.name}</option>`).join("");$("taskSubject").innerHTML=opts;$("mistakeSubject").innerHTML=opts;}
function renderTasks(){$("taskCount").textContent=state.tasks.length+" tasks";$("taskList").innerHTML=state.tasks.length?state.tasks.map((t,i)=>`<div class="task-row ${t.done?"done":""}"><input type="checkbox" data-task="${i}" ${t.done?"checked":""}><span>${escapeHtml(t.text)} <small> · ${subjects.find(s=>s.id===t.subject)?.name||""} · ${t.date||"No date"}</small></span><button data-del-task="${i}">✕</button></div>`).join(""):'<p class="muted">No tasks yet. Add your first study goal above.</p>';document.querySelectorAll("[data-task]").forEach(b=>b.onchange=()=>{state.tasks[+b.dataset.task].done=b.checked;save();renderTasks()});document.querySelectorAll("[data-del-task]").forEach(b=>b.onclick=()=>{state.tasks.splice(+b.dataset.delTask,1);save();renderTasks()});}
function renderMistakes(){$("mistakeList").innerHTML=state.mistakes.length?state.mistakes.map((m,i)=>`<div class="mistake-card"><button class="delete-btn" data-del-mistake="${i}">✕</button><small>${subjects.find(s=>s.id===m.subject)?.name||""} · ${escapeHtml(m.chapter)}</small><p>${escapeHtml(m.text)}</p></div>`).join(""):'<p class="muted">Your saved mistakes will appear here.</p>';document.querySelectorAll("[data-del-mistake]").forEach(b=>b.onclick=()=>{state.mistakes.splice(+b.dataset.delMistake,1);save();renderMistakes()});}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>showPage(b.dataset.page));document.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>showPage(b.dataset.goto));$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");$("continueBtn").onclick=()=>{let next=allChapters().find(c=>!state.completed.includes(c.key))||allChapters()[0];openChapter(next.key)};$("subjectSearch").oninput=e=>renderSubjects(e.target.value);$("backToSubjects").onclick=()=>{showPage("subjects");renderSubjects()};$("chapterTabs").onclick=e=>{let b=e.target.closest("[data-tab]");if(!b)return;currentTab=b.dataset.tab;renderTabs()};$("markComplete").onclick=()=>{if(state.completed.includes(currentChapter))state.completed=state.completed.filter(x=>x!==currentChapter);else state.completed.push(currentChapter);save();$("markComplete").textContent=state.completed.includes(currentChapter)?"✓ Completed":"○ Mark complete";renderSubjects();};$("addTask").onclick=()=>{let text=$("taskInput").value.trim();if(!text)return;state.tasks.push({text,subject:$("taskSubject").value,date:$("taskDate").value,done:false});$("taskInput").value="";save();renderTasks()};$("addMistake").onclick=()=>{let text=$("mistakeText").value.trim();if(!text)return;state.mistakes.unshift({subject:$("mistakeSubject").value,chapter:$("mistakeChapter").value||"Unspecified chapter",text});$("mistakeText").value="";$("mistakeChapter").value="";save();renderMistakes()};$("today").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});fillSelects();renderStats();renderSubjects();renderTasks();renderMistakes();initFocus();
