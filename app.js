(() => {
  const $ = (id) => document.getElementById(id);
  const sections = [
    { title: "Personal information", fields: [
      {key:"name", label:"Full name", value:"", placeholder:"Full Name", wide:true},
      {key:"job", label:"Professional title", value:"", placeholder:"Your Professional Title", wide:true},
      {key:"email", label:"Email address", value:"", placeholder:"you@example.com"},
      {key:"phone", label:"Phone number", value:"", placeholder:"+63 9123456789"},
      {key:"location", label:"Complete Address", value:"", placeholder:"House Number, Street, Barangay, Municipality / City, Province, Country, Zip Code", wide:true},
      {key:"age", label:"Age (optional)", value:"", placeholder:"e.g. 20", noExperienceOnly:true},
      {key:"nationality", label:"Nationality (optional)", value:"", placeholder:"e.g. Filipino", noExperienceOnly:true},
      {key:"nickname", label:"Nickname (optional)", value:"", placeholder:"e.g. Ria", noExperienceOnly:true},
      {key:"sex", label:"Sex (optional)", value:"", placeholder:"Optional", noExperienceOnly:true},
      {key:"birthday", label:"Birthday (optional)", value:"", placeholder:"e.g. January 1, 2005", noExperienceOnly:true},
      {key:"birthplace", label:"Birthplace (optional)", value:"", placeholder:"City or municipality", noExperienceOnly:true},
      {key:"fatherName", label:"Father's name (optional)", value:"", placeholder:"Full name", noExperienceOnly:true},
      {key:"motherName", label:"Mother's name (optional)", value:"", placeholder:"Full name", noExperienceOnly:true},
      {key:"civilStatus", label:"Civil status (optional)", value:"", placeholder:"Optional", noExperienceOnly:true},
      {key:"religion", label:"Religion (optional)", value:"", placeholder:"Optional", noExperienceOnly:true},
      {key:"summary", label:"Professional summary", value:"", placeholder:"Write a short introduction highlighting your experience, strengths, and career goals.", type:"textarea", wide:true},
    ]},
    { title: "Work experience", fields: [{key:"experienceNote",label:"Experience note",value:"",placeholder:"No formal work experience yet. Willing to learn and contribute.",type:"textarea",wide:true,noExperienceOnly:true}]},
    { title: "Education", fields: []},
    { title: "Skills & languages", fields: [
      {key:"strengths", label:"Strengths (optional)", value:"", placeholder:"Willingness to learn, communication, teamwork", type:"textarea", wide:true, noExperienceOnly:true},
      {key:"website", label:"Website / LinkedIn (optional)", value:"", placeholder:"linkedin.com/in/yourname", wide:true}
    ]}
  ];
  const templates = ["Modern","Classic","Professional","Elegant","Minimal","Executive","Compact","Sidebar","Timeline","Monochrome"];
  const skillExamples=["Communication","Problem Solving","Project Management","Microsoft Office"];
  const languageExamples=["English","Spanish"];
  const state = {step:0, template:"Modern", noExperienceMode:false, photo:"", photoSize:120, photoShape:"circle", resumeFontSize:"1",resumeFontWeight:"regular",resumePalette:"navy",titleDisabled:false, summaryHeading:"Profile", previewPage:0,previewPages:[0],previewContentHeight:707,experience:[{job:"",company:"",startMonth:"",startYear:"",endMonth:"",endYear:"",description:"",isExample:true}],education:[{degree:"",degreeNone:false,school:"",start:"",end:"",description:"",descriptionNone:false,descriptionTouched:false,isExample:true}],skills:["","","",""],languages:["",""],projects:[],references:[],values:{}};
  state.certifications=[];
  state.certificationFormat="two-line";
  const photoUpload = document.querySelector(".photo-upload");
  const photoUploadHome = photoUpload.parentElement;
  const photoSizeSelect = document.createElement("select");
  photoSizeSelect.id = "photoSize";
  photoSizeSelect.className = "photo-size-select";
  photoSizeSelect.setAttribute("aria-label", "Profile photo size");
  [[84,"Small"],[120,"Normal"],[156,"Large"]].forEach(([size,label])=>{
    const option=document.createElement("option");option.value=String(size);option.textContent=label;
    photoSizeSelect.append(option);
  });
  photoSizeSelect.value=String(state.photoSize);
  const photoSizeNote=document.createElement("span");
  photoSizeNote.className="photo-size-note";
  photoSizeNote.textContent="Normal (2 × 2 in) is recommended.";
  const photoShapeControl=document.createElement("div");
  photoShapeControl.className="photo-shape-control";
  photoShapeControl.setAttribute("role","group");
  photoShapeControl.setAttribute("aria-label","Profile photo shape");
  [["circle","Circle"],["square","Square"]].forEach(([shape,label])=>{
    const button=document.createElement("button");
    button.type="button";
    button.className="photo-shape-button";
    button.dataset.photoShape=shape;
    button.textContent=label;
    button.setAttribute("aria-pressed",String(state.photoShape===shape));
    photoShapeControl.append(button);
  });
  const photoControls=photoUpload.querySelector(".photo-controls");
  const photoAdjustments=document.createElement("div");
  photoAdjustments.className="photo-adjustments";
  photoAdjustments.append(photoSizeSelect,photoShapeControl);
  photoControls.insertBefore(photoSizeNote,$("removePhoto"));
  photoControls.insertBefore(photoAdjustments,$("removePhoto"));
  sections.flatMap(s=>s.fields).forEach(f=>state.values[f.key]=f.value);

  function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.dataset.theme = isDark ? "dark" : "light";
    localStorage.setItem("resume-builder-theme", isDark ? "dark" : "light");
    $("themeToggle").setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    $("themeToggle").title = isDark ? "Switch to light mode" : "Switch to dark mode";
    $("themeToggle").querySelector("span").textContent = isDark ? "☀" : "☾";
    $("themeToggle").querySelector(".theme-label").textContent = isDark ? "Light mode" : "Dark mode";
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function textLines(value) {
    return escapeHTML(value).split("\n").map(line=>`<p>${line || "&nbsp;"}</p>`).join("");
  }
  function normalizeResumeText(value) {
    return String(value||"").replace(/\u00a0/g," ").replace(/[ \t]+/g," ").trim();
  }
  function extractResumeSections(lines) {
    const headings={
      personal:/^(personal information|contact information|contact details|personal details)$/i,
      summary:/^(professional summary|summary|profile|professional profile|career objective|objective|about me)$/i,
      experience:/^(work experience|professional experience|employment history|work history|experience)$/i,
      education:/^(education|educational background|academic background|qualifications)$/i,
      skills:/^(skills|key skills|core competencies|technical skills|areas of expertise)$/i,
      languages:/^(languages|language skills)$/i,
      references:/^(professional references|references|reference)$/i,
      projects:/^(projects|projects & activities|selected projects)$/i,
      ignored:/^(certifications|certificates|awards|honors|interests|volunteer experience|publications)$/i
    };
    const result={header:[],personal:[],summary:[],experience:[],education:[],skills:[],languages:[],references:[],projects:[]};
    let current="header";
    lines.forEach(line=>{
      const clean=normalizeResumeText(line).replace(/[:：]$/,"" );
      const section=Object.entries(headings).find(([,pattern])=>pattern.test(clean));
      if(section){current=section[0]==="ignored"?"ignored":section[0];return;}
      if(clean)result[current]?.push(clean);
    });
    return result;
  }
  function parseResumeDateRange(line) {
    const datePart="(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?\\s+)?(?:19|20)\\d{2}|Present";
    const match=normalizeResumeText(line).match(new RegExp(`(${datePart})\\s*(?:-|–|—|to)\\s*(${datePart})`,"i"));
    if(!match)return null;
    const parse=value=>{
      const month=value.match(/^([A-Za-z]+)\s+/i);
      const year=value.match(/(?:19|20)\d{2}/);
      return {month:month?month[1]:"",year:year?year[0]:value};
    };
    return {start:parse(match[1]),end:parse(match[2])};
  }
  function splitResumeEntryTitle(value,kind) {
    const parts=normalizeResumeText(value).split(/\s+\|\s+|\s+[•·]\s+|\s+at\s+/i);
    if(kind==="experience")return {job:parts[0]||"",company:parts.slice(1).join(" | ")};
    const schoolIndex=parts.findIndex(part=>/college|university|school|institute|academy|polytechnic|lyceum/i.test(part));
    if(schoolIndex>=0)return {degree:parts.filter((_,index)=>index!==schoolIndex).join(" | "),school:parts[schoolIndex]};
    return {degree:parts[0]||"",school:parts.slice(1).join(" | ")};
  }
  function parseResumeEntries(lines,kind) {
    const dateIndexes=[];
    lines.forEach((line,index)=>{if(parseResumeDateRange(line))dateIndexes.push(index);});
    return dateIndexes.map((dateIndex,entryIndex)=>{
      const range=parseResumeDateRange(lines[dateIndex]);
      const titleLine=lines[dateIndex-1]||"";
      const previousLine=lines[dateIndex-2]||"";
      const canJoinPrevious=previousLine&&!/^[•·*▪◦-]\s*/.test(previousLine)&&previousLine.length<90&&!/[.!?]$/.test(previousLine)&&!parseResumeDateRange(previousLine);
      const title=splitResumeEntryTitle(canJoinPrevious?`${previousLine} | ${titleLine}`:titleLine,kind);
      const nextTitleIndex=dateIndexes[entryIndex+1]===undefined?lines.length:dateIndexes[entryIndex+1]-1;
      const description=lines.slice(dateIndex+1,nextTitleIndex).filter(line=>line&&!/^(references|certifications|projects)$/i.test(line));
      const hasListMarkers=description.some(line=>/^[\s]*[+«»‹›•·▪◦*–—-]+\s*/.test(line));
      const descriptionLines=description.map(line=>({
        marked:/^[\s]*[+«»‹›•·▪◦*–—-]+\s*/.test(line),
        text:normalizeResumeText(line).replace(/^[+«»‹›•·▪◦*–—-]+\s*/,"")
      })).filter(line=>line.text);
      const bullets=[];
      if(!hasListMarkers&&descriptionLines.length)bullets.push(descriptionLines.map(line=>line.text).join(" "));
      else {
        let foundBullet=false;
        descriptionLines.forEach(line=>{
          if(line.marked){bullets.push(`• ${line.text}`);foundBullet=true;}
          else if(!foundBullet&&bullets.length&&!bullets[bullets.length-1].startsWith("• "))bullets[bullets.length-1]+=` ${line.text}`;
          else if(!foundBullet)bullets.push(line.text);
          else bullets[bullets.length-1]+=` ${line.text}`;
        });
      }
      if(kind==="experience")return {...title,startMonth:range.start.month,startYear:range.start.year,endMonth:range.end.year==="Present"?"":range.end.month,endYear:range.end.year,description:bullets.join("\n")};
      return {...title,start:range.start.year,end:range.end.year,description:bullets.join("\n"),degreeNone:false,descriptionNone:false,descriptionTouched:true};
    }).filter(entry=>Object.values(entry).some(value=>typeof value==="string"&&value.trim()));
  }
  function parseResumeReferences(lines) {
    const references=[];
    let current=null;
    const startReference=()=>{current={name:"",relationship:"",title:"",company:"",phone:"",email:""};references.push(current);};
    lines.forEach(line=>{
      const clean=normalizeResumeText(line).replace(/^[•·▪◦*-]\s*/,"");
      if(/^reference\s*\d*$/i.test(clean)){if(!current||Object.values(current).some(Boolean))startReference();return;}
      const labeled=clean.match(/^(name|relationship|title|position|company|phone(?: number)?|email)\s*[:|–-]\s*(.+)$/i);
      if(labeled){
        if(!current)startReference();
        const key={name:"name",relationship:"relationship",title:"title",position:"title",company:"company","phone number":"phone",phone:"phone",email:"email"}[labeled[1].toLowerCase()];
        if(key)current[key]=labeled[2].trim();
        return;
      }
      const email=clean.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      if(email){if(!current)startReference();current.email=email[0];return;}
      if(!current||current.name||Object.values(current).some(Boolean))startReference();
      if(!current.name)current.name=clean;
    });
    return references.filter(reference=>Object.values(reference).some(value=>value.trim()));
  }
  function parseResumeProjects(lines) {
    const projects=[];
    let current=null;
    lines.forEach(line=>{
      const clean=normalizeResumeText(line).replace(/^[•·▪◦*-]\s*/,"");
      const labeled=clean.match(/^(project|activity|organization|course|year|description)\s*[:|–-]\s*(.*)$/i);
      if(/^project\s*\d*$/i.test(clean)){if(current)projects.push(current);current={name:"",context:"",year:"",description:""};return;}
      if(!current)current={name:"",context:"",year:"",description:""};
      if(labeled){
        const key={project:"name",activity:"name",organization:"context",course:"context",year:"year",description:"description"}[labeled[1].toLowerCase()];
        if(key)current[key]=labeled[2];
      }else if(/^(19|20)\d{2}$/.test(clean))current.year=clean;
      else if(!current.name)current.name=clean;
      else if(!current.context)current.context=clean;
      else current.description+=(current.description?"\n":"")+clean;
    });
    if(current)projects.push(current);
    return projects.filter(project=>Object.values(project).some(value=>value.trim()));
  }
  function parseResumeDetails(text) {
    const lines=String(text||"").split(/\r?\n/).map(normalizeResumeText).filter(Boolean);
    const sections=extractResumeSections(lines);
    const allText=lines.join("\n");
    const parsed={values:{},experience:parseResumeEntries(sections.experience,"experience"),education:parseResumeEntries(sections.education,"education"),skills:[],languages:[],references:parseResumeReferences(sections.references),projects:parseResumeProjects(sections.projects)};
    const email=allText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phone=allText.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
    const website=allText.match(/(?:https?:\/\/|www\.|linkedin\.com\/in\/|github\.com\/)[^\s,]*/i);
    if(email)parsed.values.email=email[0];
    if(phone)parsed.values.phone=normalizeResumeText(phone[0]);
    if(website)parsed.values.website=website[0].replace(/[),.;]+$/g,"");
    const personalLines=[...sections.personal,...sections.header];
    const labels={
      name:/^(?:full\s+)?name\s*[:|–-]\s*(.+)$/i,
      job:/^(?:professional\s+title|job\s+title|title|occupation)\s*[:|–-]\s*(.+)$/i,
      email:/^(?:e-?mail|email\s+address)\s*[:|–-]\s*(.+)$/i,
      phone:/^(?:phone|phone\s+number|mobile|contact\s+number)\s*[:|–-]\s*(.+)$/i,
      location:/^(?:address|location|complete\s+address)\s*[:|–-]\s*(.+)$/i,
      age:/^age\s*[:|–-]\s*(.+)$/i,
      nationality:/^nationality\s*[:|–-]\s*(.+)$/i,
      nickname:/^nickname\s*[:|–-]\s*(.+)$/i,
      sex:/^(?:sex|gender)\s*[:|–-]\s*(.+)$/i,
      birthday:/^(?:birthday|date\s+of\s+birth)\s*[:|–-]\s*(.+)$/i,
      birthplace:/^birthplace\s*[:|–-]\s*(.+)$/i,
      fatherName:/^father(?:'s)?\s+name\s*[:|–-]\s*(.+)$/i,
      motherName:/^mother(?:'s)?\s+name\s*[:|–-]\s*(.+)$/i,
      civilStatus:/^(?:civil\s+status|marital\s+status)\s*[:|–-]\s*(.+)$/i,
      religion:/^religion\s*[:|–-]\s*(.+)$/i,
      summary:/^(?:professional\s+)?summary\s*[:|–-]\s*(.+)$/i,
      website:/^(?:website|linkedin|portfolio)\s*[:|–-]\s*(.+)$/i
    };
    personalLines.forEach(line=>Object.entries(labels).forEach(([key,pattern])=>{const match=line.match(pattern);if(match&&!parsed.values[key])parsed.values[key]=match[1].trim();}));
    const topLines=personalLines.slice(0,16);
    const name=topLines.find(line=>line.length<65&&/[A-Za-z]/.test(line)&&!/@|\d{3}|https?:|linkedin|resume|curriculum vitae/i.test(line)&&!/(street|avenue|road|city|province|country|address|email|phone)/i.test(line));
    if(name&&!parsed.values.name)parsed.values.name=name.replace(/^(?:full\s+)?name\s*[:|–-]\s*/i,"");
    const roleWords=/engineer|developer|manager|designer|analyst|assistant|coordinator|specialist|consultant|teacher|nurse|accountant|executive|technician|support|sales|marketing|writer|intern|director|officer|administrator/i;
    const role=topLines.find(line=>line!==name&&line.length<90&&roleWords.test(line)&&!parseResumeDateRange(line));
    if(role&&!parsed.values.job)parsed.values.job=role;
    const address=topLines.find(line=>line!==name&&line.length<130&&/(street|st\.|avenue|ave\.|road|rd\.|city|province|country|address|philippines|usa|united states)/i.test(line)&&!/@|\d{7,}/.test(line));
    if(address&&!parsed.values.location)parsed.values.location=address;
    if(sections.summary.length&&!parsed.values.summary)parsed.values.summary=sections.summary.join("\n");
    if(!parsed.experience.length&&sections.experience.length)parsed.values.experienceNote=sections.experience.join("\n");
    if(sections.skills.length)parsed.values.strengths=sections.skills.join("\n");
    const cleanListItem=value=>normalizeResumeText(value).replace(/^[+«»‹›•·▪◦*–—-]+\s*/,"");
    parsed.skills=sections.skills.join(",").split(/[\n,;|•·▪◦]+/).map(cleanListItem).filter(value=>value&&value.length<70);
    parsed.languages=sections.languages.join(",").split(/[\n,;|•·▪◦]+/).map(cleanListItem).filter(value=>value&&value.length<50);
    return parsed;
  }
  async function readResumePdf(file) {
    const bytes=new Uint8Array(await file.arrayBuffer());
    if(new TextDecoder().decode(bytes.slice(0,5))!=="%PDF-")throw new Error("That file is not a valid PDF. Choose a PDF resume.");
    $("resumeImportStatus").textContent="Reading PDF text…";
    const pdfjs=await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.worker.mjs";
    const documentTask=pdfjs.getDocument({data:bytes,enableScripting:false,isEvalSupported:false});
    const pdf=await documentTask.promise;
    if(pdf.numPages>25)throw new Error("This PDF has more than 25 pages. Please upload a shorter resume PDF.");
    let text="";
    for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
      const page=await pdf.getPage(pageNumber);
      const content=await page.getTextContent();
      const rows=new Map();
      content.items.forEach(item=>{
        if(!item.str?.trim())return;
        const y=Math.round(item.transform?.[5]||0);
        if(!rows.has(y))rows.set(y,[]);
        rows.get(y).push({x:item.transform?.[4]||0,text:item.str});
      });
      const pageText=[...rows.entries()].sort((a,b)=>b[0]-a[0]).map(([,items])=>items.sort((a,b)=>a.x-b.x).map(item=>item.text).join(" ")).join("\n");
      text+=pageText+"\n";
      page.cleanup();
    }
    if(text.replace(/\s/g,"").length<45){
      $("resumeImportStatus").textContent="Scanned PDF detected. Running OCR…";
      const tesseract=await new Promise((resolve,reject)=>{
        if(window.Tesseract){resolve(window.Tesseract);return;}
        const script=document.createElement("script");
        script.src="https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js";
        script.onload=()=>resolve(window.Tesseract);
        script.onerror=()=>reject(new Error("OCR could not load. Check your internet connection and try again."));
        document.head.append(script);
      });
      if(!tesseract?.createWorker)throw new Error("OCR is unavailable in this browser.");
      const worker=await tesseract.createWorker("eng",1,{logger:message=>{
        if(message.status==="recognizing text")$("resumeImportStatus").textContent="Scanning PDF with OCR… "+Math.round((message.progress||0)*100)+"%";
      }});
      try{
        text="";
        for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
          $("resumeImportStatus").textContent="Scanning PDF page "+pageNumber+" of "+pdf.numPages+"…";
          const page=await pdf.getPage(pageNumber);
          const viewport=page.getViewport({scale:2});
          const canvas=document.createElement("canvas");
          canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
          const context=canvas.getContext("2d");
          if(!context)throw new Error("This browser cannot scan PDF pages.");
          await page.render({canvasContext:context,viewport}).promise;
          const result=await worker.recognize(canvas);
          text+=result.data.text+"\n";
          canvas.width=canvas.height=1;
          page.cleanup();
        }
      }finally{await worker.terminate();}
    }
    if(typeof pdf.cleanup==="function")await pdf.cleanup().catch(()=>{});
    if(typeof documentTask.destroy==="function")await documentTask.destroy().catch(()=>{});
    return text;
  }
  async function importResumePdf(file) {
    const status=$("resumeImportStatus");
    try{
      if(!file)return;
      if(!/\.pdf$/i.test(file.name))throw new Error("Only PDF files are accepted.");
      if(file.size>25*1024*1024)throw new Error("The PDF must be 25 MB or smaller.");
      const details=parseResumeDetails(await readResumePdf(file));
      const importedFields=Object.entries(details.values).filter(([,value])=>value?.trim());
      if(!importedFields.length&&!details.experience.length&&!details.education.length&&!details.skills.length&&!details.languages.length&&!details.references.length&&!details.projects.length){
        throw new Error("No resume details could be read. This PDF may be image-only or use an unsupported layout.");
      }
      importedFields.forEach(([key,value])=>state.values[key]=value);
      if(details.experience.length)state.experience=details.experience;
      if(details.education.length)state.education=details.education;
      if(details.skills.length)state.skills=details.skills;
      if(details.languages.length)state.languages=details.languages;
      if(details.references.length)state.references=details.references;
      if(details.projects.length)state.projects=details.projects;
      if(details.values.job)state.titleDisabled=false;
      state.step=0;
      renderForm();renderPreview();
      const counts=[importedFields.length?importedFields.length+" details":"",details.experience.length?details.experience.length+" experience entries":"",details.education.length?details.education.length+" education entries":"",details.skills.length?details.skills.length+" skills":"",details.languages.length?details.languages.length+" languages":"",details.references.length?details.references.length+" references":"",details.projects.length?details.projects.length+" projects":""].filter(Boolean);
      status.textContent="Imported "+counts.join(", ")+". Review the fields and correct anything that needs adjustment.";
    }catch(error){
      console.error("Resume PDF import failed",error);
      status.textContent=error.message||"Could not read that PDF. Try another file.";
    }finally{$("resumePdf").value="";}
  }
  function descriptionMarkup(value) {
    let html="",listType="";
    const closeList=()=>{if(listType){html+=`</${listType}>`;listType="";}};
    String(value||"").split("\n").forEach(line=>{
      const numbered=line.match(/^\s*\d+[.)]\s*(.*)$/);
      const bullet=line.match(/^\s*(?:•|[-–*])\s*(.*)$/);
      const match=numbered||bullet;
      if(match){
        const nextType=numbered?"ol":"ul";
        if(listType!==nextType){closeList();listType=nextType;html+=`<${listType}>`;}
        html+=`<li>${escapeHTML(match[1])||"&nbsp;"}</li>`;
      }else{
        closeList();html+=`<p>${line?escapeHTML(line):"&nbsp;"}</p>`;
      }
    });
    closeList();return html;
  }
  function section(title, content) { return `<h3>${title}</h3>${content}`; }
  function contactIcon(type) {
    const shapes={
      email:`<rect x="2" y="3.5" width="12" height="9" rx="1"/><path d="m2.5 4.5 5.5 4 5.5-4"/>`,
      phone:`<path d="M4 2.5 2.8 3.7c-.7.7.6 3.2 2.8 5.5s4.8 3.5 5.5 2.8l1.2-1.2-2.5-2-1.3 1c-1-.5-2-1.5-2.5-2.5l1-1.3-2-2.5Z"/>`,
      location:`<path d="M13 6.5c0 4-5 8-5 8s-5-4-5-8a5 5 0 1 1 10 0Z"/><circle cx="8" cy="6.5" r="1.7"/>`,
      website:`<path d="M6.5 3H13v6.5M13 3 6 10"/><path d="M11 9.5V13H3V5h3.5"/>`
    };
    return `<svg class="contact-icon" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${shapes[type]}</svg>`;
  }
  function listItems(value) {
    return String(value || "").split(/[\n,]+/).map(v=>v.trim()).filter(Boolean).map(v=>`<p>• ${escapeHTML(v)}</p>`).join("");
  }
  function renderForm() {
    const section = sections[state.step];
    const noExperienceForm=state.template==="No Experience"||state.noExperienceMode;
    $("resumeImport").hidden=state.step!==0;
    photoUploadHome.append(photoUpload); photoUpload.hidden=state.step!==0;
    $("stepCount").textContent = `Step ${state.step+1} of ${sections.length}`;
    document.querySelectorAll(".step")[1].querySelector("span").textContent=state.template==="No Experience"?"Experience":"Experience";
    $("fields").innerHTML = `<h3 class="form-section-title">${section.title}</h3><div class="field-grid">${section.fields.filter(f=>!f.noExperienceOnly||noExperienceForm).map(f=>f.key==="name"?`
      <div class="name-photo-row wide"><div class="field name-field">
        <label for="field-${f.key}">${f.label}</label>
        <input id="field-${f.key}" data-key="${f.key}" value="${escapeHTML(state.values[f.key])}" placeholder="${escapeHTML(state.template==="No Experience"&&f.key==="summary"?"Describe your career goals, strengths, and what you hope to contribute.":state.template==="No Experience"&&f.key==="job"?"Target role or position":f.placeholder||"")}">
      </div><div class="photo-slot"></div></div>`:`
      <div class="field ${f.wide?"wide":""}">
        ${f.key==="job"?`<div class="title-label-row"><label for="field-${f.key}">${f.label}</label><button type="button" class="none-toggle ${state.titleDisabled?"active":""}" data-title-none aria-pressed="${state.titleDisabled}">${state.titleDisabled?"Add professional title":"None"}</button></div>`:`<label for="field-${f.key}">${f.label}</label>`}
        ${f.key==="summary"?`<label class="summary-choice-label" for="summaryHeading">Summary heading in resume</label><select class="summary-heading-select" id="summaryHeading"><option value="Profile" ${state.summaryHeading==="Profile"?"selected":""}>Profile</option><option value="About Me" ${state.summaryHeading==="About Me"?"selected":""}>About Me</option>${noExperienceForm?`<option value="Career Objective" ${state.summaryHeading==="Career Objective"?"selected":""}>Career Objective</option>`:""}</select>`:""}
        ${f.type==="textarea"
          ? `<textarea id="field-${f.key}" data-key="${f.key}" rows="${f.key==="summary"?4:5}" placeholder="${escapeHTML(noExperienceForm&&f.key==="summary"?"Describe your career goals, strengths, and what you hope to contribute.":noExperienceForm&&f.key==="job"?"Target role or position":f.placeholder||"")}">${escapeHTML(state.values[f.key])}</textarea>`
          : `<input id="field-${f.key}" data-key="${f.key}" value="${escapeHTML(state.values[f.key])}" placeholder="${escapeHTML(noExperienceForm&&f.key==="summary"?"Describe your career goals, strengths, and what you hope to contribute.":noExperienceForm&&f.key==="job"?"Target role or position":f.placeholder||"")}" ${f.key==="job"&&state.titleDisabled?"disabled":""}>`}
      </div>`).join("")}</div>`;
    if(state.template==="No Experience"&&!state.experience.length)state.experience.push({job:"",company:"",startMonth:"",startYear:"",endMonth:"",endYear:"",description:""});
    const experienceEntries=state.template==="No Experience"||state.noExperienceMode?state.experience.slice(0,1):state.experience;
    if(state.step===1) {
      $("fields").innerHTML=`<h3 class="form-section-title">Work experience</h3><div class="experience-list">${experienceEntries.map((job,index)=>`
        <section class="entry-card"><div class="entry-heading"><strong>Experience ${index+1}</strong><div class="entry-heading-actions"><button type="button" class="experience-move-button" data-move-experience="${index}" data-direction="-1" aria-label="Move experience ${index+1} up" title="Move up" ${index===0?"disabled":""}>&#8593;</button><button type="button" class="experience-move-button" data-move-experience="${index}" data-direction="1" aria-label="Move experience ${index+1} down" title="Move down" ${index===experienceEntries.length-1?"disabled":""}>&#8595;</button>${experienceEntries.length>1?`<button type="button" class="text-button" data-remove-experience="${index}">Remove</button>`:""}</div></div>
          <div class="field-grid"><div class="field"><label>Job title</label><input data-experience="${index}" data-part="job" value="${escapeHTML(job.job)}" placeholder="Job Title"></div>
          <div class="field"><label>Company name</label><input data-experience="${index}" data-part="company" value="${escapeHTML(job.company)}" placeholder="Company Name"></div>
          <div class="field-pair"><div class="field"><label>Start month</label><input data-experience="${index}" data-part="startMonth" value="${escapeHTML(job.startMonth)}" placeholder="Jan"></div>
          <div class="field"><label>Start year</label><input data-experience="${index}" data-part="startYear" value="${escapeHTML(job.startYear)}" placeholder="2023"></div></div>
          <div class="field-pair"><div class="field"><label>End month</label><input data-experience="${index}" data-part="endMonth" value="${escapeHTML(job.endMonth)}" placeholder="Month or Present"></div>
          <div class="field"><label>End year</label><input data-experience="${index}" data-part="endYear" value="${escapeHTML(job.endYear)}" placeholder="Year or Present"></div></div>
          <div class="field wide"><label>Description</label><div class="description-tools" role="toolbar" aria-label="Description formatting"><button type="button" class="description-tool-button" data-format-kind="experience" data-format-index="${index}" data-format-style="bullet">• Bullets</button><button type="button" class="description-tool-button" data-format-kind="experience" data-format-index="${index}" data-format-style="numbered">1. Numbered</button><button type="button" class="description-tool-button" data-format-kind="experience" data-format-index="${index}" data-format-style="dash">– Dashes</button><button type="button" class="description-tool-button" data-format-kind="experience" data-format-index="${index}" data-format-style="clear">Clear</button></div><textarea data-experience="${index}" data-part="description" rows="3" placeholder="Describe your responsibilities and achievements.">${escapeHTML(job.description)}</textarea></div></div>
        </section>`).join("")}</div>${state.template==="No Experience"||state.noExperienceMode?"":`<button type="button" class="btn btn-light add-entry" id="addExperience">+ Add experience</button>`}`;
    }
    if(state.step===1 && (state.template==="No Experience"||state.noExperienceMode)) {
      $("fields").insertAdjacentHTML("beforeend",`<h4 class="noexp-subheading">Projects &amp; activities</h4><div class="experience-list">${state.projects.map((project,index)=>`<section class="entry-card"><div class="entry-heading"><strong>Project ${index+1}</strong>${state.projects.length>1?`<button type="button" class="text-button" data-remove-project="${index}">Remove</button>`:""}</div><div class="field-grid"><div class="field"><label>Project or activity</label><input data-project="${index}" data-part="name" value="${escapeHTML(project.name)}" placeholder="Academic or personal project"></div><div class="field"><label>Organization or course</label><input data-project="${index}" data-part="context" value="${escapeHTML(project.context)}" placeholder="School, course, or organization"></div><div class="field"><label>Year</label><input data-project="${index}" data-part="year" value="${escapeHTML(project.year)}" placeholder="Year"></div><div class="field wide"><label>Description</label><textarea data-project="${index}" data-part="description" rows="3" placeholder="Describe what you created, contributed, or learned.">${escapeHTML(project.description)}</textarea></div></div></section>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addProject">+ Add project or activity</button>`);
    }
    if(state.step===2) {
      $("fields").innerHTML=`<h3 class="form-section-title">Education</h3><div class="education-list">${state.education.map((edu,index)=>`
        <section class="entry-card"><div class="entry-heading"><strong>Education ${index+1}</strong><div class="entry-heading-actions"><button type="button" class="experience-move-button" data-move-education="${index}" data-direction="-1" aria-label="Move education ${index+1} up" title="Move up" ${index===0?"disabled":""}>&#8593;</button><button type="button" class="experience-move-button" data-move-education="${index}" data-direction="1" aria-label="Move education ${index+1} down" title="Move down" ${index===state.education.length-1?"disabled":""}>&#8595;</button>${state.education.length>1?`<button type="button" class="text-button" data-remove-education="${index}">Remove</button>`:""}</div></div>
          <div class="field-grid"><div class="field"><div class="title-label-row"><label>Degree or qualification</label><button type="button" class="none-toggle ${edu.degreeNone?"active":""}" data-degree-none="${index}" aria-pressed="${edu.degreeNone}">${edu.degreeNone?"Add":"None"}</button></div><input data-education="${index}" data-part="degree" value="${escapeHTML(edu.degree)}" placeholder="Degree or qualification" ${edu.degreeNone?"disabled":""}></div>
          <div class="field"><label>School name</label><input data-education="${index}" data-part="school" value="${escapeHTML(edu.school)}" placeholder="School name"></div>
          <div class="field"><label>Start year</label><input data-education="${index}" data-part="start" value="${escapeHTML(edu.start)}" placeholder="Year"></div>
          <div class="field"><label>End year</label><input data-education="${index}" data-part="end" value="${escapeHTML(edu.end)}" placeholder="Year"></div>
          <div class="field wide"><div class="title-label-row"><label>Description</label><button type="button" class="none-toggle ${edu.descriptionNone?"active":""}" data-description-none="${index}" aria-pressed="${edu.descriptionNone}">${edu.descriptionNone?"Add Description":"None"}</button></div><div class="description-tools" role="toolbar" aria-label="Description formatting"><button type="button" class="description-tool-button" data-format-kind="education" data-format-index="${index}" data-format-style="bullet" ${edu.descriptionNone?"disabled":""}>• Bullets</button><button type="button" class="description-tool-button" data-format-kind="education" data-format-index="${index}" data-format-style="numbered" ${edu.descriptionNone?"disabled":""}>1. Numbered</button><button type="button" class="description-tool-button" data-format-kind="education" data-format-index="${index}" data-format-style="dash" ${edu.descriptionNone?"disabled":""}>– Dashes</button><button type="button" class="description-tool-button" data-format-kind="education" data-format-index="${index}" data-format-style="clear" ${edu.descriptionNone?"disabled":""}>Clear</button></div><textarea data-education="${index}" data-part="description" rows="3" placeholder="Relevant coursework, honors, or achievements." ${edu.descriptionNone?"disabled":""}>${escapeHTML(edu.description)}</textarea></div></div>
        </section>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addEducation">+ Add education</button>`;
    }
    if(state.step===2) {
      $("fields").insertAdjacentHTML("beforeend",`<h3 class="form-section-title certifications-form-title">Certifications</h3><p class="muted certification-guidance">Include credentials relevant to the role. Add the issuer and date earned; include an expiry date if applicable.</p><div class="certification-editor-list">${state.certifications.map((cert,index)=>`<section class="entry-card certification-card"><div class="entry-heading"><strong>Certification ${index+1}</strong><button type="button" class="text-button" data-remove-certification="${index}">Remove</button></div><div class="field-grid"><div class="field"><label>Certificate or certification</label><input data-certification="${index}" data-part="name" value="${escapeHTML(cert.name)}" placeholder="Certificate name"></div><div class="field"><label>Issuing organization</label><input data-certification="${index}" data-part="issuer" value="${escapeHTML(cert.issuer)}" placeholder="Organization"></div><div class="field"><label>Date earned</label><input data-certification="${index}" data-part="year" value="${escapeHTML(cert.year)}" placeholder="Month Year"></div><div class="field"><label>Expiration (optional)</label><input data-certification="${index}" data-part="expiry" value="${escapeHTML(cert.expiry)}" placeholder="Month Year"></div><div class="field wide"><label>Description (optional)</label><textarea data-certification="${index}" data-part="description" rows="2" placeholder="Relevant skills or topics covered.">${escapeHTML(cert.description)}</textarea></div></div></section>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addCertification">+ Add certification</button>`);
      $("fields").querySelector(".certifications-form-title").insertAdjacentHTML("afterend",`<div class="certification-format-picker" role="group" aria-label="Certification display format"><button type="button" class="certification-format-option ${state.certificationFormat==="one-line"?"selected":""}" data-certification-format="one-line" aria-pressed="${state.certificationFormat==="one-line"}"><strong>One-line</strong><small>Fast and ATS friendly</small></button><button type="button" class="certification-format-option ${state.certificationFormat==="two-line"?"selected":""}" data-certification-format="two-line" aria-pressed="${state.certificationFormat==="two-line"}"><strong>Two-line</strong><small>Easy to read</small></button><button type="button" class="certification-format-option ${state.certificationFormat==="in-progress"?"selected":""}" data-certification-format="in-progress" aria-pressed="${state.certificationFormat==="in-progress"}"><strong>In progress</strong><small>Expected completion</small></button></div>`);
      $("fields").querySelectorAll('[data-certification][data-part="year"]').forEach(input=>{input.closest(".field").querySelector("label").textContent=state.certificationFormat==="in-progress"?"Expected completion date":"Date earned";input.placeholder="Month Year";});
    }
    if(state.step===3) {
      $("fields").innerHTML=`<h3 class="form-section-title">Skills &amp; languages</h3><div class="repeat-section"><h4>Skills</h4><div class="repeat-list">${state.skills.map((value,index)=>`<div class="repeat-row"><input data-skill="${index}" value="${escapeHTML(value)}" placeholder="${skillExamples[index]||"Skill"}"><button type="button" class="text-button" data-remove-skill="${index}" aria-label="Remove skill">Remove</button></div>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addSkill">+ Add skill</button></div><div class="repeat-section"><h4>Languages</h4><div class="repeat-list">${state.languages.map((value,index)=>`<div class="repeat-row"><input data-language="${index}" value="${escapeHTML(value)}" placeholder="${languageExamples[index]||"Language"}"><button type="button" class="text-button" data-remove-language="${index}" aria-label="Remove language">Remove</button></div>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addLanguage">+ Add language</button></div><div class="field wide website-field"><label for="field-website">Website / LinkedIn (optional)</label><input id="field-website" data-key="website" value="${escapeHTML(state.values.website)}" placeholder="linkedin.com/in/yourname"></div>`;
      $("fields").insertAdjacentHTML("beforeend",`<div class="repeat-section reference-form"><h4>${state.references.length===1?"Professional Reference":"Professional References"}</h4><div class="reference-list">${state.references.map((reference,index)=>`<section class="entry-card reference-card"><div class="entry-heading"><strong>Reference ${index+1}</strong><button type="button" class="text-button" data-remove-reference="${index}">Remove</button></div><div class="field-grid"><div class="field"><label>Name</label><input data-reference="${index}" data-part="name" value="${escapeHTML(reference.name)}" placeholder="Full name"></div><div class="field"><label>Relationship</label><input data-reference="${index}" data-part="relationship" value="${escapeHTML(reference.relationship)}" placeholder="e.g. Former supervisor"></div><div class="field"><label>Title</label><input data-reference="${index}" data-part="title" value="${escapeHTML(reference.title)}" placeholder="e.g. Senior Manager"></div><div class="field"><label>Company</label><input data-reference="${index}" data-part="company" value="${escapeHTML(reference.company)}" placeholder="Company name"></div><div class="field"><label>Phone number</label><input data-reference="${index}" data-part="phone" value="${escapeHTML(reference.phone)}" placeholder="Phone number"></div><div class="field"><label>Email</label><input type="email" data-reference="${index}" data-part="email" value="${escapeHTML(reference.email)}" placeholder="Email address"></div></div></section>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addReference">+ Add reference</button></div>`);
    }
    if(state.step===0) $("fields").querySelector(".photo-slot").append(photoUpload);
    document.querySelectorAll(".step").forEach((b,i)=>b.classList.toggle("active",i===state.step));
    $("back").hidden = state.step===0;
    $("next").textContent = state.step===sections.length-1 ? "Review resume ✓" : "Continue →";
    $("fields").querySelectorAll("[data-key]").forEach(el=>el.addEventListener("input",()=>{
      state.values[el.dataset.key]=el.value;
      renderPreview();
    }));
    const summaryHeadingSelect=$("fields").querySelector("#summaryHeading");
    if(summaryHeadingSelect) summaryHeadingSelect.addEventListener("change",()=>{state.summaryHeading=summaryHeadingSelect.value;renderPreview();});
    const noneToggle=$("fields").querySelector("[data-title-none]");
    if(noneToggle) noneToggle.addEventListener("click",()=>{
      state.titleDisabled=!state.titleDisabled;
      if(state.titleDisabled) state.values.job="";renderPreview();
      renderForm();
    });
    $("fields").querySelectorAll("[data-reference]").forEach(el=>el.addEventListener("input",()=>{state.references[Number(el.dataset.reference)][el.dataset.part]=el.value;renderPreview();}));
    $("fields").querySelectorAll("[data-remove-reference]").forEach(button=>button.addEventListener("click",()=>{state.references.splice(Number(button.dataset.removeReference),1);renderForm();renderPreview();}));
    $("addReference")?.addEventListener("click",()=>{state.references.push({name:"",relationship:"",title:"",company:"",phone:"",email:""});renderForm();});
    $("fields").querySelectorAll("[data-project]").forEach(el=>el.addEventListener("input",()=>{state.projects[Number(el.dataset.project)][el.dataset.part]=el.value;renderPreview();}));
    $("fields").querySelectorAll("[data-remove-project]").forEach(button=>button.addEventListener("click",()=>{state.projects.splice(Number(button.dataset.removeProject),1);renderPreview();renderForm();}));
    $("addProject")?.addEventListener("click",()=>{state.projects.push({name:"",context:"",year:"",description:""});renderPreview();renderForm();});
    $("fields").querySelectorAll("[data-experience]").forEach(el=>el.addEventListener("input",()=>{
      state.experience[Number(el.dataset.experience)][el.dataset.part]=el.value;renderPreview();
    }));
    $("fields").querySelectorAll("[data-format-style]").forEach(button=>button.addEventListener("click",()=>{
      const index=Number(button.dataset.formatIndex),kind=button.dataset.formatKind;
      const selector=kind==="experience"?`[data-experience="${index}"][data-part="description"]`:`[data-education="${index}"][data-part="description"]`;
      const textarea=$("fields").querySelector(selector);
      if(!textarea||textarea.disabled)return;
      const value=textarea.value,start=textarea.selectionStart,end=textarea.selectionEnd;
      const lineStart=value.lastIndexOf("\n",start-1)+1;
      const endPosition=end>start&&value[end-1]==="\n"?end-1:end;
      const nextBreak=value.indexOf("\n",endPosition);
      const lineEnd=nextBreak<0?value.length:nextBreak;
      const selectedLines=value.slice(lineStart,lineEnd).split("\n");
      const style=button.dataset.formatStyle;
      const formatted=selectedLines.map((line,lineIndex)=>{
        const content=line.replace(/^\s*(?:(?:•|[-–*])|\d+[.)])\s*/,"");
        if(style==="bullet")return content?`• ${content}`:"• ";
        if(style==="numbered")return `${lineIndex+1}. ${content}`;
        if(style==="dash")return content?`– ${content}`:"– ";
        return content;
      }).join("\n");
      textarea.value=value.slice(0,lineStart)+formatted+value.slice(lineEnd);
      textarea.dispatchEvent(new Event("input",{bubbles:true}));
      textarea.focus();textarea.setSelectionRange(lineStart,lineStart+formatted.length);
    }));
    $("fields").querySelectorAll('[data-part="description"][data-experience], [data-part="description"][data-education]').forEach(textarea=>textarea.addEventListener("keydown",event=>{
      if(event.key!=="Enter"||textarea.selectionStart!==textarea.selectionEnd)return;
      const value=textarea.value,caret=textarea.selectionStart;
      const lineStart=value.lastIndexOf("\n",caret-1)+1;
      const lineEndIndex=value.indexOf("\n",caret);
      const lineEnd=lineEndIndex<0?value.length:lineEndIndex;
      const line=value.slice(lineStart,lineEnd);
      const unordered=line.match(/^(\s*)([•*]|[-–])(\s+)/);
      const ordered=line.match(/^(\s*)(\d+)([.)])(\s+)/);
      const marker=unordered||ordered;
      if(!marker)return;
      const prefix=marker[0];
      if(!line.slice(prefix.length).trim()){
        event.preventDefault();
        textarea.value=value.slice(0,lineStart)+line.slice(prefix.length)+value.slice(lineEnd);
        textarea.setSelectionRange(lineStart,lineStart);
      }else{
        event.preventDefault();
        const nextPrefix=ordered?`${ordered[1]}${Number(ordered[2])+1}${ordered[3]}${ordered[4]}`:prefix;
        const insertion=`\n${nextPrefix}`;
        textarea.value=value.slice(0,caret)+insertion+value.slice(caret);
        const nextCaret=caret+insertion.length;
        textarea.setSelectionRange(nextCaret,nextCaret);
      }
      textarea.dispatchEvent(new Event("input",{bubbles:true}));
    }));
    $("fields").querySelectorAll("[data-move-experience]").forEach(button=>button.addEventListener("click",()=>{
      const index=Number(button.dataset.moveExperience);
      const target=index+Number(button.dataset.direction);
      if(target<0||target>=state.experience.length)return;
      [state.experience[index],state.experience[target]]=[state.experience[target],state.experience[index]];
      renderPreview();renderForm();
    }));
    $("fields").querySelectorAll("[data-remove-experience]").forEach(button=>button.addEventListener("click",()=>{
      state.experience.splice(Number(button.dataset.removeExperience),1);renderPreview();renderForm();
    }));
    $("addExperience")?.addEventListener("click",()=>{
      state.experience.push({job:"",company:"",startMonth:"",startYear:"",endMonth:"",endYear:"",description:"",isNew:true});renderPreview();renderForm();
    });
    $("fields").querySelectorAll("[data-education]").forEach(el=>el.addEventListener("input",()=>{
      const item=state.education[Number(el.dataset.education)];item[el.dataset.part]=el.value;
      if(el.dataset.part==="description") item.descriptionTouched=true;
      renderPreview();
    }));
    $("fields").querySelectorAll("[data-degree-none]").forEach(button=>button.addEventListener("click",()=>{
      const edu=state.education[Number(button.dataset.degreeNone)];edu.degreeNone=!edu.degreeNone;
      if(edu.degreeNone) edu.degree="";
      renderPreview();renderForm();
    }));
    $("fields").querySelectorAll("[data-description-none]").forEach(button=>button.addEventListener("click",()=>{
      const edu=state.education[Number(button.dataset.descriptionNone)];edu.descriptionNone=!edu.descriptionNone;
      if(edu.descriptionNone) edu.description="";
      renderPreview();renderForm();
    }));
    $("fields").querySelectorAll("[data-move-education]").forEach(button=>button.addEventListener("click",()=>{
      const index=Number(button.dataset.moveEducation);
      const target=index+Number(button.dataset.direction);
      if(target<0||target>=state.education.length)return;
      [state.education[index],state.education[target]]=[state.education[target],state.education[index]];
      renderPreview();renderForm();
    }));
    $("fields").querySelectorAll("[data-remove-education]").forEach(button=>button.addEventListener("click",()=>{
      state.education.splice(Number(button.dataset.removeEducation),1);renderPreview();renderForm();
    }));
    $("addEducation")?.addEventListener("click",()=>{
      state.education.push({degree:"",degreeNone:false,school:"",start:"",end:"",description:"",descriptionNone:false,descriptionTouched:false,isNew:true});renderPreview();renderForm();
    });
    $("fields").querySelectorAll("[data-certification]").forEach(el=>el.addEventListener("input",()=>{state.certifications[Number(el.dataset.certification)][el.dataset.part]=el.value;renderPreview();}));
    $("fields").querySelectorAll("[data-certification-format]").forEach(button=>button.addEventListener("click",()=>{state.certificationFormat=button.dataset.certificationFormat;renderForm();renderPreview();}));
    $("fields").querySelectorAll("[data-remove-certification]").forEach(button=>button.addEventListener("click",()=>{state.certifications.splice(Number(button.dataset.removeCertification),1);renderPreview();renderForm();}));
    $("addCertification")?.addEventListener("click",()=>{state.certifications.push({name:"",issuer:"",year:"",expiry:"",description:""});renderForm();});
    $("fields").querySelectorAll("[data-skill]").forEach(input=>input.addEventListener("input",()=>{
      state.skills[Number(input.dataset.skill)]=input.value;renderPreview();
    }));
    $("fields").querySelectorAll("[data-language]").forEach(input=>input.addEventListener("input",()=>{
      state.languages[Number(input.dataset.language)]=input.value;renderPreview();
    }));
    $("fields").querySelectorAll("[data-remove-skill]").forEach(button=>button.addEventListener("click",()=>{
      state.skills.splice(Number(button.dataset.removeSkill),1);renderPreview();renderForm();
    }));
    $("fields").querySelectorAll("[data-remove-language]").forEach(button=>button.addEventListener("click",()=>{
      state.languages.splice(Number(button.dataset.removeLanguage),1);renderPreview();renderForm();
    }));
    $("addSkill")?.addEventListener("click",()=>{state.skills.push("");renderForm();});
    $("addLanguage")?.addEventListener("click",()=>{state.languages.push("");renderForm();});
  }
  function fitResumeToPage(content) {
    content.style.removeProperty("transform");
    content.style.removeProperty("transform-origin");
    content.style.removeProperty("width");
    content.style.removeProperty("height");
    content.style.removeProperty("min-height");
    const frame=content.closest("#resumePreview");
    if(!frame) return 1;
    frame.dataset.fitScale="1";
    return 1;
  }
  function getResumePageBreaks(frame) {
    const frameTop=frame.getBoundingClientRect().top;
    const contentColumn=frame.querySelector(".main,.sidebar-main,.mono-main,.noexp-main,.body,.executive-body,.compact-body,.timeline-body")||frame;
    const positions=[];
    const addPosition=element=>{
      const position=element.getBoundingClientRect().top-frameTop;
      if(position>0)positions.push(Math.round(position));
    };
    contentColumn.querySelectorAll("h3").forEach(addPosition);
    contentColumn.querySelectorAll(".item,.professional-reference").forEach(element=>{
      if(element.previousElementSibling?.tagName!=="H3")addPosition(element);
    });
    contentColumn.querySelectorAll(".contact-row").forEach(row=>{
      const contact=row.parentElement;
      if(!(contact.firstElementChild===row&&contact.previousElementSibling?.tagName==="H3"))addPosition(row);
    });
    contentColumn.querySelectorAll("p").forEach(paragraph=>{
      if(paragraph.closest(".item,.professional-reference,.contact"))return;
      if(paragraph.previousElementSibling?.tagName!=="H3")addPosition(paragraph);
    });
    return [...new Set(positions)].sort((a,b)=>a-b);
  }
  function getResumePageStarts(frame,totalHeight) {
    const pageHeight=707,pagePadding=25;
    const breakPoints=getResumePageBreaks(frame);
    const starts=[0];
    let sourceY=0,pageIndex=0;
    while(totalHeight-sourceY>pageHeight-(pageIndex?pagePadding:0)){
      const capacity=pageHeight-(pageIndex?pagePadding:0);
      const maxEnd=Math.min(totalHeight,sourceY+capacity);
      const earliestUsefulBreak=sourceY+Math.round(capacity*.55);
      const candidates=breakPoints.filter(position=>position>=earliestUsefulBreak&&position<=maxEnd);
      const endY=candidates.length?candidates[candidates.length-1]:maxEnd;
      if(endY<=sourceY)break;
      starts.push(endY);sourceY=endY;pageIndex++;
    }
    return starts;
  }
  function setMobilePreviewGeometry(frame) {
    const stage=frame.closest(".preview-stage");
    const mobile=window.matchMedia("(max-width: 700px)").matches;
    if(!stage) return;
    if(!mobile) {
      frame.style.removeProperty("width");
      frame.style.removeProperty("max-width");
      frame.style.removeProperty("left");
      frame.style.removeProperty("--mobile-preview-scale");
      frame.style.height="707px";
      frame.style.minHeight="707px";
      frame.style.aspectRatio="210 / 297";
      frame.style.overflow="hidden";
      frame.style.position="relative";
      frame.style.transform="none";
      stage.style.removeProperty("height");
      return;
    }
    const stageStyle=getComputedStyle(stage);
    const horizontalPadding=parseFloat(stageStyle.paddingLeft)+parseFloat(stageStyle.paddingRight);
    const verticalPadding=parseFloat(stageStyle.paddingTop)+parseFloat(stageStyle.paddingBottom);
    const availableWidth=Math.max(1,stage.clientWidth-horizontalPadding);
    const scale=Math.min(1,availableWidth/500);
    frame.style.width="500px";
    frame.style.height="707px";
    frame.style.minHeight="707px";
    frame.style.maxWidth="none";
    frame.style.aspectRatio="auto";
    frame.style.overflow="hidden";
    frame.style.position="relative";
    frame.style.setProperty("--mobile-preview-scale",String(scale));
    frame.style.transform="scale(var(--mobile-preview-scale))";
    frame.style.transformOrigin="top left";
    frame.style.left=`${(availableWidth-500*scale)/2}px`;
    stage.style.height=`${Math.ceil(707*scale+verticalPadding)}px`;
  }
  function applyResumeAppearance(frame) {
    const palettes={
      navy:{accent:"#34578c",sidebar:"#192a46",sidebarText:"#ffffff",heading:"#26344b",tint:"#f1f3f6",rule:"#cdd6e4"},
      teal:{accent:"#087f78",sidebar:"#123c3b",sidebarText:"#ffffff",heading:"#173a38",tint:"#e8f5f3",rule:"#a8d8d2"},
      burgundy:{accent:"#923c50",sidebar:"#4b1f2b",sidebarText:"#ffffff",heading:"#3d2028",tint:"#f7ecef",rule:"#dfb8c1"},
      purple:{accent:"#6551a8",sidebar:"#33265f",sidebarText:"#ffffff",heading:"#302452",tint:"#f0edfa",rule:"#c8bfe7"},
      charcoal:{accent:"#46576a",sidebar:"#29313b",sidebarText:"#ffffff",heading:"#252d36",tint:"#edf0f3",rule:"#c3ccd5"}
    };
    const palette=palettes[state.resumePalette]||palettes.navy;
    const weights={regular:[400,700],medium:[500,700],bold:[700,800]}[state.resumeFontWeight]||[400,700];
    frame.style.setProperty("--resume-font-scale",state.resumeFontSize);
    frame.style.setProperty("--resume-font-weight",String(weights[0]));
    frame.style.setProperty("--resume-heading-weight",String(weights[1]));
    frame.style.setProperty("--resume-accent",palette.accent);
    frame.style.setProperty("--resume-sidebar",palette.sidebar);
    frame.style.setProperty("--resume-sidebar-text",palette.sidebarText);
    frame.style.setProperty("--resume-heading-color",palette.heading);
    frame.style.setProperty("--resume-tint",palette.tint);
    frame.style.setProperty("--resume-rule",palette.rule);
  }
  function showPreviewPage(pageIndex) {
    const frame=$("resumePreview");
    const inner=frame.querySelector(".resume-inner");
    if(!inner)return;
    state.previewPage=Math.max(0,Math.min(pageIndex,state.previewPages.length-1));
    frame.style.transform="none";
    const pageStart=state.previewPages[state.previewPage]||0;
    const pageEnd=state.previewPages[state.previewPage+1]??state.previewContentHeight;
    const pagePadding=state.previewPage?25:0;
    frame.style.position="relative";
    frame.style.height="707px";
    frame.style.minHeight="707px";
    frame.style.aspectRatio="210 / 297";
    frame.style.overflow="hidden";
    inner.style.transform=pageStart?`translateY(${pagePadding-pageStart}px)`:"none";
    inner.style.transformOrigin="top left";
    const frameRect=frame.getBoundingClientRect();
    const contentColumn=frame.querySelector(".main,.sidebar-main,.mono-main,.noexp-main,.body,.executive-body,.compact-body,.timeline-body")||inner;
    const contentRect=contentColumn.getBoundingClientRect();
    const mainMask=frame.querySelector(".resume-page-main-mask");
    const sideMask=frame.querySelector(".resume-page-side-mask");
    const mainBottomMask=frame.querySelector(".resume-page-main-bottom-mask");
    const sideBottomMask=frame.querySelector(".resume-page-side-bottom-mask");
    if(mainMask){
      mainMask.style.display=pagePadding?"block":"none";
      mainMask.style.left=`${contentRect.left-frameRect.left}px`;
      mainMask.style.width=`${contentRect.width}px`;
      mainMask.style.height=`${pagePadding}px`;
      const contentColor=getComputedStyle(contentColumn).backgroundColor;
      mainMask.style.backgroundColor=contentColor==="rgba(0, 0, 0, 0)"?"#ffffff":contentColor;
    }
    const bottomTop=Math.min(707,pagePadding+pageEnd-pageStart);
    if(mainBottomMask){
      mainBottomMask.style.display=bottomTop<707?"block":"none";
      mainBottomMask.style.left=`${contentRect.left-frameRect.left}px`;
      mainBottomMask.style.width=`${contentRect.width}px`;
      mainBottomMask.style.top=`${bottomTop}px`;
      mainBottomMask.style.height=`${Math.max(0,707-bottomTop)}px`;
      const contentColor=getComputedStyle(contentColumn).backgroundColor;
      mainBottomMask.style.backgroundColor=contentColor==="rgba(0, 0, 0, 0)"?"#ffffff":contentColor;
    }
    const sidePanel=frame.querySelector(".side,.sidebar-side,.mono-side,.noexp-side");
    if(sideMask&&sidePanel&&pagePadding){
      const sideRect=sidePanel.getBoundingClientRect();
      const sideColor=getComputedStyle(sidePanel).backgroundColor;
      sideMask.style.display="block";
      sideMask.style.left=`${sideRect.left-frameRect.left}px`;
      sideMask.style.width=`${sideRect.width}px`;
      sideMask.style.height=`${pagePadding}px`;
      sideMask.style.backgroundColor=sideColor==="rgba(0, 0, 0, 0)"||sideColor==="transparent"?"#ffffff":sideColor;
    }else if(sideMask)sideMask.style.display="none";
    if(sideBottomMask&&sidePanel&&bottomTop<707){
      const sideRect=sidePanel.getBoundingClientRect();
      const sideColor=getComputedStyle(sidePanel).backgroundColor;
      sideBottomMask.style.display="block";
      sideBottomMask.style.left=`${sideRect.left-frameRect.left}px`;
      sideBottomMask.style.width=`${sideRect.width}px`;
      sideBottomMask.style.top=`${bottomTop}px`;
      sideBottomMask.style.height=`${Math.max(0,707-bottomTop)}px`;
      sideBottomMask.style.backgroundColor=sideColor==="rgba(0, 0, 0, 0)"||sideColor==="transparent"?"#ffffff":sideColor;
    }else if(sideBottomMask)sideBottomMask.style.display="none";
    $("resumePageCount").textContent=`${state.previewPage+1} / ${state.previewPages.length}`;
    $("resumePageCount").parentElement.hidden=state.previewPages.length<=1;
    $("previousResumePage").disabled=state.previewPage===0;
    $("nextResumePage").disabled=state.previewPage>=state.previewPages.length-1;
    setMobilePreviewGeometry(frame);
  }
  function renderPreview() {
    const v=state.values;
    const photo=state.photo ? `<img class="avatar" src="${state.photo}" alt="Profile photo">` : "";
    const contactRow=(type,value)=>`<p class="contact-row">${contactIcon(type)}<span>${escapeHTML(value)}</span></p>`;
    const contact=`<div class="contact">${contactRow("email",v.email.trim()||"you@example.com")}${contactRow("phone",v.phone.trim()||"+63 9123456789")}${contactRow("location",v.location.trim()||"House Number, Street, Barangay, Municipality / City, Province, Country, Zip Code")}${v.website.trim()?contactRow("website",v.website):""}</div>`;
    const personalInformation=[["Nickname",v.nickname],["Age",v.age],["Sex",v.sex],["Birthday",v.birthday],["Birthplace",v.birthplace],["Father's name",v.fatherName],["Mother's name",v.motherName],["Civil status",v.civilStatus],["Nationality",v.nationality],["Religion",v.religion]].filter(([,value])=>value.trim());
    const personalInformationMarkup=state.noExperienceMode&&personalInformation.length?`<h3 class="personal-information-heading">Personal information</h3><div class="personal-information-list">${personalInformation.map(([label,value])=>`<p class="personal-information-row"><strong>${escapeHTML(label)}</strong><span>${escapeHTML(value)}</span></p>`).join("")}</div>`:"";
    const expContent=state.experience.map((job,index)=>{
      const example=job.isExample||job.isNew;
      const title=[job.job.trim()||(example?"Job Title":""),job.company.trim()||(example?"Company Name":"")].filter(Boolean).join(" | ");
      const startMonth=job.startMonth.trim()||(example?"Jan":"");
      const startYear=job.startYear.trim()||(example?"2023":"");
      const endIsPresent=/present/i.test(job.endMonth)||/present/i.test(job.endYear);
      const endMonth=endIsPresent?"":job.endMonth.trim();
      const endYear=endIsPresent?"":job.endYear.trim()||(example?"Present":"");
      const dates=[ [startMonth,startYear].filter(Boolean).join(" "), endIsPresent?"Present":[endMonth,endYear].filter(Boolean).join(" ") ].filter(Boolean).join(" – ");
      const description=job.description.trim()||(example?"Describe your responsibilities and achievements. Add measurable results where possible.":"");
      const titleLine=title?`<p><strong>${escapeHTML(title)}</strong></p>`:"";
      const content=titleLine+(dates?textLines(dates):"")+(description?descriptionMarkup(description):"");
      return content?`<div class="item">${content}</div>`:"";
    }).join("");
    const noExperienceEntryContent=state.experience.slice(0,1).filter(job=>[job.job,job.company,job.startMonth,job.startYear,job.endMonth,job.endYear,job.description].some(value=>value.trim())).map(job=>{
      const title=[job.job.trim(),job.company.trim()].filter(Boolean).join(" | ");
      const start=[job.startMonth.trim(),job.startYear.trim()].filter(Boolean).join(" ");
      const endIsPresent=/present/i.test(job.endMonth)||/present/i.test(job.endYear);
      const end=endIsPresent?"Present":[job.endMonth.trim(),job.endYear.trim()].filter(Boolean).join(" ");
      const dates=[start,end].filter(Boolean).join(" – ");
      return `<div class="item">${title?`<p><strong>${escapeHTML(title)}</strong></p>`:""}${dates?textLines(dates):""}${job.description.trim()?descriptionMarkup(job.description):""}</div>`;
    }).join("");
    const noExperienceProjectContent=state.projects.map(project=>{const parts=[project.name.trim(),project.context.trim(),project.year.trim(),project.description.trim()].filter(Boolean);return parts.length?`<div class="item">${textLines(parts.join("\n"))}</div>`:"";}).join("");
    const noExperienceContent=(noExperienceEntryContent||textLines("No formal work experience yet. Willing to learn and contribute."))+(noExperienceProjectContent?section("Projects & activities",noExperienceProjectContent):"");
    const exp=section("Work experience",state.noExperienceMode?noExperienceContent:expContent);
    const eduContent=state.education.map(item=>{
      const example=item.isExample||item.isNew;
      const degree=item.degreeNone?"":item.degree.trim()||(example?"Degree or Qualification":"");
      const school=item.school.trim()||(example?"School Name":"");
      const title=degree||school?`<p>${degree?`${escapeHTML(degree)}${school?" | ":""}`:""}${school?`<strong>${escapeHTML(school)}</strong>`:""}</p>`:"";
      const years=[item.start.trim()||(example?"2016":""),item.end.trim()||(example?"2020":"")].filter(Boolean).join(" – ");
      const description=item.descriptionNone?"":item.description.trim()||(example&&!item.descriptionTouched?"Relevant coursework, honors, or achievements.":"");
      const content=title+(years?textLines(years):"")+(description?descriptionMarkup(description):"");
      return content?`<div class="item">${content}</div>`:"";
    }).join("");
    const edu=section(state.template==="No Experience"?"Educational background":"Education",eduContent);
    const certificationsContent=state.certifications.map(cert=>{
      const name=cert.name.trim(),issuer=cert.issuer.trim(),year=cert.year.trim(),expiry=cert.expiry.trim(),description=cert.description.trim();
      if(!name&&!issuer&&!year&&!expiry&&!description)return "";
      const title=name?`${escapeHTML(name)}${year&&state.certificationFormat!=="in-progress"?` (${escapeHTML(year)})`:""}`:escapeHTML(year);
      if(state.certificationFormat==="one-line")return `<div class="certification-item"><p class="certification-one-line"><strong>${title}</strong>${issuer?` | ${escapeHTML(issuer)}`:""}${expiry?` | Expires ${escapeHTML(expiry)}`:""}</p>${description?descriptionMarkup(description):""}</div>`;
      if(state.certificationFormat==="in-progress")return `<div class="certification-item"><p class="certification-name"><strong>${title}</strong></p>${issuer?`<p class="certification-issuer"><em>${escapeHTML(issuer)}</em></p>`:""}<p class="certification-expiry">In progress${year?` (Expected ${escapeHTML(year)})`:""}</p>${description?descriptionMarkup(description):""}</div>`;
      return `<div class="certification-item"><p class="certification-name"><strong>${title}</strong></p>${issuer?`<p class="certification-issuer"><em>${escapeHTML(issuer)}</em></p>`:""}${expiry?`<p class="certification-expiry">Expires ${escapeHTML(expiry)}</p>`:""}${description?descriptionMarkup(description):""}</div>`;
    }).filter(Boolean).join("");
    const certifications=certificationsContent?section("Professional Certificates",`<div class="certification-grid">${certificationsContent}</div>`):"";
    const sidebarCertifications=state.noExperienceMode?"":certifications;
    const mainCertifications=state.noExperienceMode?certifications:"";
    const skills=section("Skills",listItems(state.skills.map((value,index)=>value.trim()||skillExamples[index]||"").filter(Boolean).join("\n")));
    const languages=section("Languages",listItems(state.languages.map((value,index)=>value.trim()||languageExamples[index]||"").filter(Boolean).join("\n")));
    const summaryText=v.summary.trim()||(state.template==="No Experience"?"Motivated student or recent graduate eager to apply my strengths, learn quickly, and contribute to a team.":"Write a short introduction highlighting your experience, strengths, and career goals.");
    const header=`<h2>${escapeHTML(v.name.trim()||"Full Name")}</h2><div class="subtitle">${escapeHTML(v.job.trim()||(state.titleDisabled?"":"Your Professional Title"))}</div>`;
    const renderedReferences=state.references.map(reference=>{
      const lines=[["Relationship",reference.relationship],["Title",reference.title],["Company",reference.company],["Phone number",reference.phone],["Email",reference.email]].filter(([,value])=>value.trim());
      if(!reference.name.trim()&&!lines.length)return "";
      return `<div class="professional-reference">${reference.name.trim()?`<p class="professional-reference-name">${escapeHTML(reference.name.trim())}</p>`:""}${lines.length?`<ul>${lines.map(([label,value])=>`<li><strong>${label}:</strong> ${escapeHTML(value.trim())}</li>`).join("")}</ul>`:""}</div>`;
    }).filter(Boolean);
    const referencesSection=renderedReferences.length?`<h3 class="professional-references-heading">${renderedReferences.length===1?"Professional Reference":"Professional References"}</h3>${renderedReferences.join("")}`:"";
    let html="";
    if(state.template==="Modern") html=`<aside class="side">${photo}${section("Contact",contact)}${edu}${skills}${sidebarCertifications}${languages}${referencesSection}</aside><div class="main">${header}${section(state.summaryHeading,textLines(summaryText))}${exp}${mainCertifications}</div>`;
    if(state.template==="Classic") html=`<div class="main"><div class="classic-header"><div class="classic-identity">${header}</div></div>${section("Contact",contact)}${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${certifications}${skills}${languages}${referencesSection}</div>`;
    if(state.template==="Minimal") html=`<div class="main"><div class="minimal-header"><div class="minimal-identity">${header}</div>${photo}</div>${section("Contact",contact)}${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${certifications}${skills}${languages}${referencesSection}</div>`;
    if(state.template==="Elegant") html=`<div class="hero">${photo}<div>${header}</div></div><div class="body">${section("Contact",contact)}${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${certifications}${skills}${languages}${referencesSection}</div>`;
    if(state.template==="Professional") html=`<div class="hero">${photo}<div>${header}${contact}</div></div><div class="body">${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${certifications}${skills}${languages}${referencesSection}</div>`;
    if(state.template==="Executive") html=`<div class="executive-header">${photo}<div>${header}${contact}</div></div><div class="executive-body">${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${certifications}${skills}${languages}${referencesSection}</div>`;
    if(state.template==="Compact") html=`<div class="compact-header"><div>${header}${contact}</div>${photo}</div><div class="compact-body">${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${certifications}${skills}${languages}${referencesSection}</div>`;
    if(state.template==="Sidebar") html=`<div class="sidebar-main">${header}${section(state.summaryHeading,textLines(summaryText))}${exp}${mainCertifications}</div><aside class="sidebar-side">${photo}${section("Contact",contact)}${edu}${skills}${sidebarCertifications}${languages}${referencesSection}</aside>`;
    if(state.template==="Timeline") html=`<div class="timeline-header"><div class="timeline-identity">${header}</div>${photo}</div><div class="timeline-body">${section("Contact",contact)}${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${certifications}${skills}${languages}${referencesSection}</div>`;
    if(state.template==="Monochrome") html=`<div class="mono-header">${photo}<div>${header}</div></div><div class="mono-grid"><div class="mono-main">${section(state.summaryHeading,textLines(summaryText))}${exp}${mainCertifications}</div><aside class="mono-side">${section("Contact",contact)}${edu}${skills}${sidebarCertifications}${languages}${referencesSection}</aside></div>`;
    if(state.template==="No Experience") { const detailRows=[["Nickname",v.nickname],["Age",v.age],["Sex",v.sex],["Birthday",v.birthday],["Birthplace",v.birthplace],["Father's name",v.fatherName],["Mother's name",v.motherName],["Civil status",v.civilStatus],["Nationality",v.nationality],["Religion",v.religion]].filter(([,value])=>value.trim()).map(([label,value])=>`<p class="noexp-detail"><strong>${label}</strong><span>${escapeHTML(value)}</span></p>`).join(""); const projectItems=state.projects.map(project=>{const parts=[project.name.trim(),project.context.trim(),project.year.trim(),project.description.trim()].filter(Boolean);return parts.length?`<div class="item">${textLines(parts.join("\n"))}</div>`:"";}).join(""); const expNote=v.experienceNote.trim(); const expNoteContent=expNote?`<div class="item noexp-experience-entry"><p><strong>Relevant Experience</strong></p>${descriptionMarkup(expNote)}</div>`:textLines("No formal work experience yet. Willing to learn and contribute."); const strengthItems=listItems(v.strengths.trim()||"Willingness to learn\nCommunication\nTeamwork"); html=`<aside class="noexp-side">${photo}${section("Contact",contact)}${detailRows?section("Personal information",detailRows):""}${skills}${section("Strengths",strengthItems)}${languages}</aside><div class="noexp-main">${header}${section(state.summaryHeading,textLines(summaryText))}${edu}${section("Experience",expNoteContent)}${projectItems?section("Projects & activities",projectItems):""}${referencesSection}</div>`; }
    const previewFrame=$("resumePreview");
    previewFrame.className=`resume ${state.template.toLowerCase().replace(/\s+/g,"-")}`;
    applyResumeAppearance(previewFrame);
    previewFrame.style.height="auto";
    previewFrame.style.minHeight="707px";
    previewFrame.style.aspectRatio="auto";
    previewFrame.style.overflow="visible";
    previewFrame.style.position="relative";
    previewFrame.style.transform="none";
    if(window.matchMedia("(max-width: 700px)").matches){previewFrame.style.width="500px";previewFrame.style.maxWidth="none";}
    else{previewFrame.style.removeProperty("width");previewFrame.style.removeProperty("max-width");previewFrame.style.removeProperty("left");}
    const previewWidth=previewFrame.clientWidth||500;
    const renderedPhotoSize=Math.round(previewWidth*state.photoSize/500);
    previewFrame.style.setProperty("--photo-size",`${renderedPhotoSize}px`);
    previewFrame.style.setProperty("--photo-radius",state.photoShape==="circle"?"50%":"0");
    const photoTextSizes=state.photo?({84:[18,9,7.5],120:[21,10,8],156:[24,11,8.5]}[state.photoSize]):[20,9,8];
    previewFrame.style.setProperty("--photo-header-size",`${photoTextSizes[0]}px`);
    previewFrame.style.setProperty("--photo-subtitle-size",`${photoTextSizes[1]}px`);
    previewFrame.style.setProperty("--photo-detail-size",`${photoTextSizes[2]}px`);
    previewFrame.innerHTML=`<div class="resume-inner">${html}</div><div class="resume-page-mask resume-page-main-mask" aria-hidden="true"></div><div class="resume-page-mask resume-page-side-mask" aria-hidden="true"></div><div class="resume-page-mask resume-page-main-bottom-mask" aria-hidden="true"></div><div class="resume-page-mask resume-page-side-bottom-mask" aria-hidden="true"></div>`;
    if(personalInformationMarkup) {
      const sidebar=previewFrame.querySelector(".side,.sidebar-side,.mono-side,.noexp-side");
      if(sidebar) {
        const contactBlock=sidebar.querySelector(".contact");
        if(contactBlock)contactBlock.insertAdjacentHTML("afterend",personalInformationMarkup);
        else sidebar.insertAdjacentHTML("beforeend",personalInformationMarkup);
      } else {
        const main=previewFrame.querySelector(".main,.body,.executive-body,.compact-body,.sidebar-main,.timeline-body,.mono-main,.noexp-main")||previewFrame.querySelector(".resume-inner");
        const anchor=[...main.querySelectorAll("h3")].find(heading=>/^(work experience|experience|education|educational background)$/i.test(heading.textContent.trim()));
        if(anchor)anchor.insertAdjacentHTML("beforebegin",personalInformationMarkup);
        else main.insertAdjacentHTML("beforeend",personalInformationMarkup);
      }
    }
    if(state.template==="No Experience") {
      const experienceHeading=[...previewFrame.querySelectorAll(".noexp-main h3")].find(heading=>heading.textContent.trim()==="Experience");
      if(experienceHeading) {
        experienceHeading.textContent="Work experience";
        const entries=state.noExperienceMode?noExperienceEntryContent:state.experience.slice(0,1).filter(job=>[job.job,job.company,job.startMonth,job.startYear,job.endMonth,job.endYear,job.description].some(value=>value.trim())).map(job=>{
          const title=[job.job.trim(),job.company.trim()].filter(Boolean).join(" | ");
          const start=[job.startMonth.trim(),job.startYear.trim()].filter(Boolean).join(" ");
          const endIsPresent=/present/i.test(job.endMonth)||/present/i.test(job.endYear);
          const end=endIsPresent?"Present":[job.endMonth.trim(),job.endYear.trim()].filter(Boolean).join(" ");
          const dates=[start,end].filter(Boolean).join(" – ");
          return `<div class="item">${title?`<p><strong>${escapeHTML(title)}</strong></p>`:""}${dates?textLines(dates):""}${job.description.trim()?descriptionMarkup(job.description):""}</div>`;
        }).join("");
        let content=experienceHeading.nextElementSibling;
        while(content&&content.tagName!=="H3") {const next=content.nextElementSibling;content.remove();content=next;}
        experienceHeading.insertAdjacentHTML("afterend",entries||"<p>No formal work experience yet. Willing to learn and contribute.</p>");
      }
    }
    fitResumeToPage(previewFrame.querySelector(".resume-inner"));
    state.previewContentHeight=Math.max(707,previewFrame.scrollHeight);
    state.previewPages=getResumePageStarts(previewFrame,state.previewContentHeight);
    state.previewPage=Math.min(state.previewPage,state.previewPages.length-1);
    showPreviewPage(state.previewPage);
    $("photoThumb").style.borderRadius=state.photoShape==="circle"?"50%":"0";
    $("photoThumb").src=state.photo || "data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="#edf1f7"/><circle cx="40" cy="29" r="14" fill="#b5c0d2"/><path d="M12 80Q14 48 40 48T68 80" fill="#b5c0d2"/></svg>');
  }
  function renderTemplates() {
    document.querySelector(".template-count").textContent=`${templates.length} templates`;
    $("templateGrid").innerHTML=templates.map(name=>`<button type="button" class="template-option ${state.template===name?"selected":""}" data-template="${name}">
      <div class="mini-page mini-${name.toLowerCase().replace(/\s+/g,"-")}"><div class="mini-side ${(["Classic","Minimal","Elegant","Compact","Timeline"].includes(name)?"hidden":"")}"></div><div class="mini-lines"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
      <strong>${name}</strong><small>${state.template===name?"✓ Selected":"Select layout"}</small>
    </button>`).join("");
    if(state.noExperienceMode) $("templateGrid").querySelectorAll("[data-template]").forEach(button=>{button.querySelector("small").textContent=button.dataset.template===state.template?"Selected no-experience style":"No-experience version";});
    $("templateGrid").querySelectorAll("[data-template]").forEach(button=>button.addEventListener("click",()=>{
      const previousTemplate=state.template;state.template=button.dataset.template;if(state.template==="No Experience"&&previousTemplate!=="No Experience")state.summaryHeading="Career Objective";else if(previousTemplate==="No Experience"&&state.summaryHeading==="Career Objective")state.summaryHeading="Profile";renderTemplates();renderForm();renderPreview();
    }));
  }
  async function downloadPDF() {
    if(typeof window.html2canvas!=="function"||typeof window.jspdf?.jsPDF!=="function") {
      alert("The PDF tools could not load. Please refresh while connected to the internet and try again.");
      return;
    }
    const fileBase=(state.values.name.trim()||"resume").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resume";
    const buttons=[$("downloadTop"),$("downloadPreview")];
    buttons.forEach(button=>{button.disabled=true;button.setAttribute("aria-busy","true");});

    const resume=$("resumePreview");
    const content=resume.querySelector(".resume-inner");
    const originalFrameStyle=resume.getAttribute("style");
    const originalContentStyle=content.getAttribute("style");
    const originalFitScale=resume.dataset.fitScale;
    const pageMasks=[...resume.querySelectorAll(".resume-page-mask")];
    const originalPageMaskDisplays=pageMasks.map(mask=>mask.style.display);
    pageMasks.forEach(mask=>mask.style.display="none");
    // Capture the full-height resume without shrinking its typography.
    const captureWidth=500;
    Object.assign(resume.style,{position:"fixed",left:"0",top:"0",width:`${captureWidth}px`,height:"auto",minHeight:"707px",maxWidth:"none",minWidth:"0",aspectRatio:"auto",margin:"0",overflow:"visible",zIndex:"2147483647",pointerEvents:"none",transform:"none",transformOrigin:"top left"});
    fitResumeToPage(content);
    const restore=()=>{
      if(originalFrameStyle===null) resume.removeAttribute("style"); else resume.setAttribute("style",originalFrameStyle);
      if(originalContentStyle===null) content.removeAttribute("style"); else content.setAttribute("style",originalContentStyle);
      if(originalFitScale===undefined) delete resume.dataset.fitScale; else resume.dataset.fitScale=originalFitScale;
      pageMasks.forEach((mask,index)=>mask.style.display=originalPageMaskDisplays[index]);
      buttons.forEach(button=>{button.disabled=false;button.removeAttribute("aria-busy");});

    };
    try {
      await Promise.all([...resume.querySelectorAll("img")].map(image=>image.decode().catch(()=>{})));
      const width=captureWidth;
      const height=Math.max(707,resume.scrollHeight,content.scrollHeight);
      resume.style.height=`${height}px`;
      const pageStarts=getResumePageStarts(resume,height);
      const canvas=await window.html2canvas(resume,{
        scale:4,
        x:0,
        y:0,
        width,
        height,
        windowWidth:document.documentElement.clientWidth,
        windowHeight:Math.max(document.documentElement.clientHeight,height),
        useCORS:true,
        backgroundColor:"#ffffff",
        scrollX:0,
        scrollY:0
      });
      const pdf=new window.jspdf.jsPDF({unit:"mm",format:"a4",orientation:"portrait",compress:true});
      const pageCanvasHeight=Math.round(canvas.width*297/210);
      const captureScale=canvas.width/width;
      const pageStartPixels=pageStarts.map(position=>Math.round(position*captureScale));
      const pageTopPadding=Math.round(25*captureScale);
      const pageCount=pageStartPixels.length;
      const frameRect=resume.getBoundingClientRect();
      const sidePanel=resume.querySelector(".side,.sidebar-side,.mono-side,.noexp-side");
      const sideStyle=sidePanel?getComputedStyle(sidePanel):null;
      const sideRect=sidePanel?sidePanel.getBoundingClientRect():null;
      const sideColor=sideStyle?.backgroundColor;
      const sideHasColor=sideColor&&sideColor!=="rgba(0, 0, 0, 0)"&&sideColor!=="transparent";
      for(let pageIndex=0;pageIndex<pageCount;pageIndex++){
        const sourceY=pageStartPixels[pageIndex];
        const endY=pageIndex+1<pageCount?pageStartPixels[pageIndex+1]:canvas.height;
        const pageOffset=pageIndex===0?0:pageTopPadding;
        const sliceHeight=endY-sourceY;
        const pageCanvas=document.createElement("canvas");
        pageCanvas.width=canvas.width;pageCanvas.height=pageCanvasHeight;
        const pageContext=pageCanvas.getContext("2d");
        if(!pageContext)throw new Error("PDF page rendering is unavailable.");
        pageContext.fillStyle="#ffffff";pageContext.fillRect(0,0,pageCanvas.width,pageCanvas.height);
        if(sideHasColor){
          const ratio=canvas.width/width;
          const sideX=Math.max(0,(sideRect.left-frameRect.left)*ratio);
          const sideWidth=Math.min(pageCanvas.width-sideX,sideRect.width*ratio);
          pageContext.fillStyle=sideColor;pageContext.fillRect(sideX,0,sideWidth,pageCanvas.height);
        }
        pageContext.drawImage(canvas,0,sourceY,canvas.width,sliceHeight,0,pageOffset,canvas.width,sliceHeight);
        if(pageIndex>0)pdf.addPage();
        pdf.addImage(pageCanvas.toDataURL("image/jpeg",.98),"JPEG",0,0,210,297,undefined,"FAST");
      }
      pdf.save(`${fileBase}.pdf`);
    } catch(error) {
      console.error("PDF download failed",error);
      alert("The PDF could not be generated. Please try again.");
    } finally {
      restore();
    }
  }  document.querySelectorAll(".step").forEach(button=>button.addEventListener("click",()=>{
    state.step=Number(button.dataset.step);renderForm();
  }));
  $("back").addEventListener("click",()=>{state.step=Math.max(0,state.step-1);renderForm();});
  $("next").addEventListener("click",()=>{
    if(state.step<sections.length-1){
      state.step++;
      renderForm();
      requestAnimationFrame(()=>document.querySelector(".editor").scrollIntoView({behavior:"smooth",block:"start"}));
    }
    else { $("resumePreview").scrollIntoView({behavior:"smooth",block:"center"}); }
  });
  async function makeCenteredSquarePhoto(file) {
    const source=await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error("The photo could not be read."));
      reader.readAsDataURL(file);
    });
    const image=await new Promise((resolve,reject)=>{
      const photo=new Image();
      photo.onload=()=>resolve(photo);
      photo.onerror=()=>reject(new Error("This image format cannot be opened by your browser."));
      photo.src=source;
    });
    const side=Math.min(image.naturalWidth,image.naturalHeight);
    const x=(image.naturalWidth-side)/2;
    const y=(image.naturalHeight-side)/2;
    const canvas=document.createElement("canvas");
    canvas.width=1024;
    canvas.height=1024;
    const context=canvas.getContext("2d");
    if(!context) throw new Error("Photo cropping is unavailable in this browser.");
    context.drawImage(image,x,y,side,side,0,0,1024,1024);
    return canvas.toDataURL("image/jpeg",.92);
  }
  $("photo").addEventListener("change",async event=>{
    const file=event.target.files?.[0]; if(!file)return;

    try {
      state.photo=await makeCenteredSquarePhoto(file);
      renderPreview();
    } catch(error) {
      console.error("Photo upload failed",error);
      alert(error.message||"The photo could not be uploaded. Please try another image.");
      event.target.value="";
    }
  });
  photoSizeSelect.addEventListener("change",()=>{state.photoSize=Number(photoSizeSelect.value);renderPreview();});
  photoShapeControl.querySelectorAll("[data-photo-shape]").forEach(button=>button.addEventListener("click",()=>{state.photoShape=button.dataset.photoShape;photoShapeControl.querySelectorAll("[data-photo-shape]").forEach(option=>option.setAttribute("aria-pressed",String(option===button)));renderPreview();}));
  $("removePhoto").addEventListener("click",()=>{state.photo="";$("photo").value="";renderPreview();});
  $("downloadTop").addEventListener("click",downloadPDF);
  $("downloadPreview").addEventListener("click",downloadPDF);
  $("resumeFontSize").addEventListener("change",event=>{state.resumeFontSize=event.target.value;renderPreview();});
  $("resumeFontWeight").addEventListener("change",event=>{state.resumeFontWeight=event.target.value;renderPreview();});
  $("resumePalette").addEventListener("change",event=>{state.resumePalette=event.target.value;renderPreview();});
  $("noExperienceMode").addEventListener("change",event=>{state.noExperienceMode=event.target.checked;if(event.target.checked&&state.summaryHeading==="Profile")state.summaryHeading="Career Objective";else if(!event.target.checked&&state.template!=="No Experience"&&state.summaryHeading==="Career Objective")state.summaryHeading="Profile";renderForm();renderTemplates();renderPreview();});
  $("resumePdf").addEventListener("change",event=>importResumePdf(event.target.files?.[0]));
  $("previousResumePage").addEventListener("click",()=>showPreviewPage(state.previewPage-1));
  $("nextResumePage").addEventListener("click",()=>showPreviewPage(state.previewPage+1));
  window.addEventListener("beforeprint",()=>fitResumeToPage($("resumePreview").querySelector(".resume-inner")));
  window.addEventListener("afterprint",renderPreview);
  $("themeToggle").addEventListener("click",()=>setTheme(document.body.dataset.theme === "dark" ? "light" : "dark"));
  setTheme(localStorage.getItem("resume-builder-theme") === "dark" ? "dark" : "light");
  window.addEventListener("resize",()=>renderPreview());
  renderForm();renderTemplates();renderPreview();
})();
