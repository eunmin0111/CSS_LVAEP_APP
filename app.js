const seed={sessions:[{id:1,date:'2026-09-03',studentId:'jordan',hours:1.5,status:'Held',notes:'Reading comprehension and vocabulary'},{id:2,date:'2026-09-08',studentId:'amina',hours:1,status:'Held',notes:'Conversation practice and goal setting'},{id:3,date:'2026-09-10',studentId:'jordan',hours:1.5,status:'Held',notes:'Workplace forms and writing'},{id:4,date:'2026-09-15',studentId:'amina',hours:1,status:'Held',notes:'Library resources and reading'},{id:5,date:'2026-09-17',studentId:'jordan',hours:1.5,status:'Held',notes:'Digital literacy practice'},{id:6,date:'2026-09-22',studentId:'amina',hours:1.5,status:'Held',notes:'Reading fluency and discussion'},{id:7,date:'2026-09-24',studentId:'jordan',hours:.5,status:'Held',notes:'Check-in and homework review'}],students:[{id:'jordan',name:'Jordan Lee',initials:'JL',focus:'Adult literacy · Workplace readiness',color:'#2f827d',goals:{economic:['Enter Employment','Achieve work-based project learner goal'],educational:['Increase involvement in school activities'],family:['Read to child(ren)'],community:[]}},{id:'amina',name:'Amina Hassan',initials:'AH',focus:'English language learning · Community engagement',color:'#cf8767',goals:{economic:['Retain Employment'],educational:['Achieve civics skills'],family:[],community:['Increase involvement in community activities']}}],homework:[{id:101,sessionId:1,studentId:'jordan',title:'Read pages 12–15 and note new words',due:'2026-09-08',credits:5,status:'Completed'},{id:102,sessionId:3,studentId:'jordan',title:'Complete workplace application draft',due:'2026-09-17',credits:10,status:'In progress'},{id:103,sessionId:6,studentId:'amina',title:'Practice new vocabulary with flashcards',due:'2026-09-29',credits:5,status:'Missing'}],requests:[],reportRequests:[]};

let data=JSON.parse(localStorage.getItem('lvaepTutorHub')||'null')||JSON.parse(JSON.stringify(seed));

data.homework??=[];
data.requests??=[];
data.reportRequests??=[];
data.tutoringSite??='Bloomfield Public Library';
data.tutoringTimes??={jordan:'Tuesdays · 5:00 PM',amina:'Thursdays · 6:00 PM'};
data.changeRequests??=[];
data.reportOverrides??={};

let selectedMonth='2026-09', reportMonth='2026-09', studentMonth='2026-09', removing=null;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],save=()=>localStorage.setItem('lvaepTutorHub',JSON.stringify(data)),student=id=>data.students.find(s=>s.id===id),month=d=>d.slice(0,7),sum=a=>a.reduce((n,x)=>n+Number(x.hours||0),0);
const reportMonths=()=>[...new Set(data.sessions.filter(s=>s.status==='Held').map(s=>month(s.date)))].sort().reverse();
const label=m=>new Date(m+'-01T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'}),date=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),short=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}),sessions=m=>data.sessions.filter(s=>month(s.date)===m),hours=n=>(Number.isInteger(n)?n:n.toFixed(1))+' hrs';
const goalList={economic:['Enter Employment','Retain Employment','Enter Occupational Skills Training Program','Enter Postsecondary Education','Obtain High School Diploma','Leave public assistance','Achieve work-based project learner goal'],educational:['Help more frequently with school','Increase contact with teachers','Increase involvement in school activities','Purchase books or magazines','Read to child(ren)','Visit the library'],family:['Obtain citizenship','Achieve civics skills'],community:['Increase involvement in community activities','Vote or register to vote']};

function latestDetails(){
    const latest=[...new Set(data.sessions.filter(s=>s.status==='Held').map(s=>month(s.date)))].sort().reverse()[0];return data.reportOverrides[latest]||{site:data.tutoringSite,times:data.tutoringTimes}
}

function notice(s){
    $('#toast').textContent=s;
    $('#toast').classList.add('show');
    setTimeout(()=>$('#toast').classList.remove('show'),3000)
}

function options(id,items,value){
    const e=$(id);
    e.innerHTML=items.map(x=>'<option value="'+x.value+'">'+x.text+'</option>').join('');
    e.value=items.some(x=>x.value===value)?value:items[0]?.value||''
}

function setup(){
    const ms=[...new Set(data.sessions.map(s=>month(s.date)))].sort().reverse();
    if(!ms.includes(selectedMonth))selectedMonth=ms[0]||'2026-09';
    options('#monthSelect',ms.map(m=>({value:m,text:label(m)})),selectedMonth);
    if(!ms.includes(studentMonth))studentMonth=ms[0]||'2026-09';
    options('#studentMonthSelect',ms.map(m=>({value:m,text:label(m)})),studentMonth);
    const ss=[{value:'all',text:'All students'},...data.students.map(s=>({value:s.id,text:s.name}))];
    options('#studentFilter',ss,$('#studentFilter').value||'all');
    options('#homeworkStudent',ss,$('#homeworkStudent').value||'all');
    $('#sessionStudent').innerHTML=data.students.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('');
    const reports=[...new Set(data.sessions.filter(s=>s.status==='Held').map(s=>month(s.date)))].sort().reverse();if(!reports.includes(reportMonth))reportMonth=reports[0]||'';options('#reportMonthSelect',reports.map(m=>({value:m,text:label(m)})),reportMonth);
}

function dashboard(){
    const list=sessions(selectedMonth),held=list.filter(s=>s.status==='Held'),total=sum(held),goals=data.students.reduce((n,s)=>n+Object.values(s.goals).flat().length,0);
    $('#monthHours').textContent=total;
    $('#activeStudents').textContent=data.students.length;
    $('#goalsMet').textContent=goals;
    $('#progressLabel').textContent=total+' / 10 hrs';
    $('#progressCopy').textContent=Math.min(100,Math.round(total*10))+'%';$
    ('#progressBar').style.width=Math.min(100,total*10)+'%';
    $('#recentSessions').innerHTML=data.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4).map(s=>'<div class="session-row"><div class="session-date">'+new Date(s.date+'T12:00:00').getDate()+'<small>'+new Date(s.date+'T12:00:00').toLocaleDateString('en-US',{month:'short'})+'</small></div><div><span class="session-name">'+student(s.studentId).name+'</span><span class="session-note">'+(s.notes||s.status)+'</span></div><span class="session-time">'+hours(s.hours)+'</span></div>').join('');
    $('#studentHourBars').innerHTML=data.students.map(st=>{const h=sum(held.filter(s=>s.studentId===st.id));return '<div class="student-hour-row"><span>'+st.name.split(' ')[0]+'</span><div class="mini-track"><div class="mini-bar" style="width:'+Math.min(100,h*20)+'%"></div></div><b>'+h+'</b></div>'}).join('');
}

function log(){
    const who=$('#studentFilter').value,list=sessions(selectedMonth).filter(s=>who==='all'||s.studentId===who).sort((a,b)=>b.date.localeCompare(a.date));
    $('#filteredTotal').textContent=hours(sum(list.filter(s=>s.status==='Held')));
    $('#hoursTable').innerHTML=list.map(s=>'<tr><td>'+date(s.date)+'</td><td><b>'+student(s.studentId).name+'</b></td><td>'+(s.status==='Held'?s.hours:'—')+'</td><td><span class="status-pill">'+s.status+'</span><span class="session-note">'+(s.notes||'')+'</span></td><td><button class="session-delete" data-delete="'+s.id+'">×</button></td></tr>').join('');
    $('#emptyHours').classList.toggle('hidden',!!list.length);
}

function homework(){
    const status=$('#homeworkStatus').value,who=$('#homeworkStudent').value,list=data.homework.filter(h=>(status==='all'||h.status===status)&&(who==='all'||h.studentId===who));
    $('#creditTotal').textContent=data.homework.filter(h=>h.status==='Completed').reduce((n,h)=>n+h.credits,0);
    $('#homeworkCount').textContent=list.length;
    $('#homeworkTable').innerHTML=list.map(h=>'<tr><td><b>'+student(h.studentId).name+'</b></td><td>'+h.title+'</td><td>'+date(h.due)+'</td><td>'+h.credits+'</td><td><select data-homework="'+h.id+'"><option '+(h.status==='In progress'?'selected':'')+'>In progress</option><option '+(h.status==='Completed'?'selected':'')+'>Completed</option><option '+(h.status==='Missing'?'selected':'')+'>Missing</option></select></td></tr>').join('');$('#emptyHomework').classList.toggle('hidden',!!list.length);
}

function achievements(){
    $('#achievementCount').textContent=data.students.reduce((n,s)=>n+Object.values(s.goals).flat().length,0);
    $('#achievementStudents').innerHTML=data.students.map(s=>'<article class="achievement-card"><header class="achievement-card-head"><div class="initial" style="background:'+s.color+'">'+s.initials+'</div><div><h3>'+s.name+'</h3><p>'+s.focus+'</p></div></header><div class="goals-grid">'+Object.entries(goalList).map(([group,items])=>'<div class="goal-group"><h4>'+group+'</h4>'+items.map(g=>'<label class="goal-option '+(s.goals[group].includes(g)?'done':'')+'"><input type="checkbox" '+(s.goals[group].includes(g)?'checked':'')+' data-student="'+s.id+'" data-group="'+group+'" data-goal="'+g+'"><span>'+g+'</span></label>').join('')+'</div>').join('')+'</div></article>').join('');
}

function report(){
    if(!reportMonth){$('#reportPeriod').textContent='No held sessions yet';
    $('#reportRows').innerHTML='';
    return}const list=sessions(reportMonth).filter(s=>s.status==='Held'),detail=data.reportOverrides[reportMonth]||{site:'Bloomfield Public Library',times:{jordan:'Tuesdays · 5:00 PM',amina:'Thursdays · 6:00 PM'}};$('#reportPeriod').textContent=label(reportMonth);$('#reportSite').textContent=detail.site;$('#reportSessions').textContent=list.length+' sessions';$('#reportStatus').textContent=data.reportRequests.some(r=>r.month===reportMonth)?'Submitted to staff':'Complete';$('#reportRows').innerHTML=data.students.map(st=>{const a=list.filter(s=>s.studentId===st.id);return '<tr><td><b>'+st.name+'</b></td><td>'+a.length+'</td><td>'+sum(a)+'</td><td>'+(a.length?[...new Set(a.map(s=>new Date(s.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'})))].join(', ')+' · '+detail.times[st.id]:'—')+'</td></tr>'}).join('');$('#reportTotal').textContent=sum(list);$('#reportAchievements').innerHTML=data.students.flatMap(s=>Object.values(s.goals).flat().map(g=>'<div class="report-achievement"><b>'+s.name+':</b> '+g+'</div>')).join('');
}
function students(){
    const detail=latestDetails();
    $('#currentSite').textContent=detail.site;
    $('#studentCards').innerHTML=data.students.map(s=>'<article class="student-card"><div class="student-card-head"><div class="initial" style="background:'+s.color+'">'+s.initials+'</div><div><h3>'+s.name+'</h3><p>'+s.focus+'</p></div></div><div class="student-stats"><div><b>'+sum(sessions(studentMonth).filter(x=>x.studentId===s.id&&x.status==='Held'))+'</b><span>held hours in '+label(studentMonth)+'</span></div><div><b>'+detail.times[s.id]+'</b><span>scheduled tutoring time</span></div></div><div class="button-row"><button class="primary-button" data-change="time" data-recipient="staff-and-student" data-student="'+s.id+'">Notify staff & student</button></div><br><button class="secondary-button" data-remove="'+s.id+'">Request to end tutoring</button></article>').join('')
}

function render(){
    setup();
    dashboard();
    log();
    homework();
    achievements();
    report();
    students()
}

function view(v){
    const b=$('[data-view="'+v+'"]');
    $$('.nav-item').forEach(x=>x.classList.toggle('active',x===b));
    $$('.view').forEach(x=>x.classList.toggle('active',x.id===v));
    $('#pageTitle').textContent=v==='dashboard'?'Good morning, Maya':b.textContent.trim();
    $('.sidebar').classList.remove('open')
}

function updateSessionState(){
    const held=$('#sessionStatus').value==='Held',assigned=$('#assignHomework').checked;
    $('#sessionHours').disabled=!held;
    $('#sessionHours').value=held?$('#sessionHours').value:'';
    $('#asyncHomeworkConfirm').classList.toggle('hidden',!assigned||held);if(held)$('#confirmAsyncHomework').checked=false
}

$$('.nav-item').forEach(b=>b.onclick=()=>view(b.dataset.view));
$$('.open-session').forEach(b=>b.onclick=()=>{$('#sessionDate').value=new Date().toISOString().slice(0,10);
    $('#sessionHours').value='';
    $('#sessionStatus').value='Held';
    $('#sessionNotes').value='';
    $('#assignHomework').checked=false;
    $('#confirmAsyncHomework').checked=false;
    $('#homeworkTitle').value='';
    $('#homeworkDue').value='';
    $('#homeworkFields').classList.add('hidden');updateSessionState();
    $('#sessionModal').showModal()});
    $('#assignHomework').onchange=e=>{$('#homeworkFields').classList.toggle('hidden',!e.target.checked);
        updateSessionState()};
        $('#sessionStatus').onchange=updateSessionState;
        $$('.cancel-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#sessionForm').onsubmit=e=>{e.preventDefault();const held=$('#sessionStatus').value==='Held',assigned=$('#assignHomework').checked;
    if(assigned&&!$('#homeworkTitle').value.trim()){notice('Add a homework title first.');
        return}if(assigned&&!held&&!$('#confirmAsyncHomework').checked){notice('Confirm that homework was assigned asynchronously.');
            return}const s={id:Date.now(),date:$('#sessionDate').value,studentId:$('#sessionStudent').value,hours:held?(+$('#sessionHours').value||0):0,status:$('#sessionStatus').value,notes:$('#sessionNotes').value};data.sessions.push(s);if(assigned)data.homework.push({id:Date.now()+1,sessionId:s.id,studentId:s.studentId,title:$('#homeworkTitle').value.trim(),due:$('#homeworkDue').value||s.date,credits:+$('#homeworkCredits').value||0,status:'In progress'});selectedMonth=month(s.date);
            if(held)reportMonth=selectedMonth;
            save();
            $('#sessionModal').close();
            render();
            notice(assigned?'Session and homework saved.':'Session saved and monthly report updated.')};
$('#monthSelect').onchange=e=>{selectedMonth=e.target.value;render()};$('#studentMonthSelect').onchange=e=>{studentMonth=e.target.value;students()};$('#studentFilter').onchange=log;$('#hoursTable').onclick=e=>{const id=+e.target.dataset.delete;if(id){data.sessions=data.sessions.filter(s=>s.id!==id);data.homework=data.homework.filter(h=>h.sessionId!==id);save();render();notice('Session and linked homework removed.')}};
$('#homeworkStatus').onchange=homework;$('#homeworkStudent').onchange=homework;$('#homeworkTable').onchange=e=>{const h=data.homework.find(x=>x.id===+e.target.dataset.homework);if(h){h.status=e.target.value;save();homework();notice('Homework status updated.')}};
$('#achievementStudents').onchange=e=>{const box=e.target;if(!box.dataset.student)return;const s=student(box.dataset.student),group=box.dataset.group,goal=box.dataset.goal;if(box.checked&&!s.goals[group].includes(goal))s.goals[group].push(goal);if(!box.checked)s.goals[group]=s.goals[group].filter(g=>g!==goal);save();achievements();dashboard();notice(box.checked?'Achievement recorded.':'Achievement unchecked.')};
let changeType='',changeRecipient='',changeStudent='';
function openChange(type,recipient,studentId){changeType=type;changeRecipient=recipient;changeStudent=studentId||'';const who=studentId?student(studentId).name:'all assigned students',detail=latestDetails();$('#changeTitle').textContent=type==='site'?'Request tutoring site change':'Request tutoring time change';$('#changeIntro').textContent='This request will notify LVAEP staff and '+(studentId?student(studentId).name:'every affected student')+' for '+who+'. It will update only the latest monthly report and can be reversed if either side denies it.';$('#changeValueLabel').firstChild.textContent=type==='site'?'New tutoring site':'New tutoring time';$('#changeValue').value=type==='site'?detail.site:(detail.times[studentId]||'');$('#changeMessage').value='';$('#changeModal').showModal()}
$('#studentCards').onclick=e=>{if(e.target.dataset.remove){removing=e.target.dataset.remove;$('#removeIntro').textContent='Let staff know why tutoring with '+student(removing).name+' has ended.';$('#removeModal').showModal()}if(e.target.dataset.change)openChange(e.target.dataset.change,e.target.dataset.recipient,e.target.dataset.student)};$$('[data-change="site"]').forEach(b=>b.onclick=()=>openChange('site','staff-and-student',''));$('#removeForm').onsubmit=e=>{e.preventDefault();data.requests.push({studentId:removing,reason:$('#removeReason').value});save();$('#removeModal').close();students();notice('Request sent to LVAEP staff.')};
$('#changeForm').onsubmit=e=>{e.preventDefault();const value=$('#changeValue').value.trim(),latest=reportMonths()[0],current=latestDetails(),detail={site:current.site,times:{...current.times}};if(changeType==='site')detail.site=value;else detail.times[changeStudent]=value;if(latest)data.reportOverrides[latest]=detail;data.changeRequests.push({type:changeType,recipient:'staff-and-student',studentId:changeStudent,value:value,message:$('#changeMessage').value,reportMonth:latest});save();$('#changeModal').close();render();notice('Request sent. The latest report now reflects the proposed change.')};
$('#reportMonthSelect').onchange=e=>{reportMonth=e.target.value;report()};$('#submitReport').onclick=()=>{if(!reportMonth)return notice('Log a held session before submitting a report.');$('#reportIntro').textContent='Send the '+label(reportMonth)+' attendance and achievement report to LVAEP staff for review.';$('#reportModal').showModal()};$('#reportForm').onsubmit=e=>{e.preventDefault();if(!data.reportRequests.some(r=>r.month===reportMonth))data.reportRequests.push({month:reportMonth,message:$('#reportMessage').value});save();$('#reportModal').close();report();notice(label(reportMonth)+' report sent to staff.')};
$('#downloadCsv').onclick=()=>{const rows=[['Date','Student','Hours','Status','Notes'],...sessions(reportMonth).map(s=>[s.date,student(s.studentId).name,s.hours,s.status,s.notes])];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));a.download='LVAEP-'+reportMonth+'-report.csv';a.click();notice('CSV report downloaded.')};$('#printReport').onclick=()=>window.print();$('#mobileMenu').onclick=()=>$('.sidebar').classList.toggle('open');$('#resetData').onclick=()=>{if(confirm('Reset all changes to the original example data?')){data=JSON.parse(JSON.stringify(seed));selectedMonth=reportMonth='2026-09';save();render()}};
render();
