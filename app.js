(() => {
  const $ = (id) => document.getElementById(id);
  const sections = [
    { title: "Personal information", fields: [
      {key:"name", label:"Full name", value:"", placeholder:"Full Name", wide:true},
      {key:"job", label:"Professional title", value:"", placeholder:"Your Professional Title", wide:true},
      {key:"email", label:"Email address", value:"", placeholder:"you@example.com"},
      {key:"phone", label:"Phone number", value:"", placeholder:"+63 9123456789"},
      {key:"location", label:"Complete Address", value:"", placeholder:"House Number, Street, Barangay, Municipality / City, Province, Country, Zip Code", wide:true},
      {key:"summary", label:"Professional summary", value:"", placeholder:"Write a short introduction highlighting your experience, strengths, and career goals.", type:"textarea", wide:true}
    ]},
    { title: "Work experience", fields: []},
    { title: "Education", fields: []},
    { title: "Skills & languages", fields: [
      {key:"website", label:"Website / LinkedIn (optional)", value:"", placeholder:"linkedin.com/in/yourname", wide:true}
    ]}
  ];
  const templates = ["Modern","Classic","Professional","Elegant","Minimal"];
  const skillExamples=["Communication","Problem Solving","Project Management","Microsoft Office"];
  const languageExamples=["English","Spanish"];
  const state = {step:0, template:"Modern", photo:"", photoSize:128, titleDisabled:false, summaryHeading:"Profile", experience:[{job:"",company:"",startMonth:"",startYear:"",endMonth:"",endYear:"",description:""}],education:[{degree:"",school:"",start:"",end:"",description:"",descriptionNone:false,descriptionTouched:false}],skills:["","","",""],languages:["",""],values:{}};
  const photoUpload = document.querySelector(".photo-upload");
  const photoUploadHome = photoUpload.parentElement;
  const photoSizeSelect = document.createElement("select");
  photoSizeSelect.id = "photoSize";
  photoSizeSelect.className = "photo-size-select";
  photoSizeSelect.setAttribute("aria-label", "Profile photo size");
  [[72,"Small"],[96,"Medium"],[128,"Large"]].forEach(([size,label])=>{
    const option=document.createElement("option");option.value=String(size);option.textContent=label;
    photoSizeSelect.append(option);
  });
  photoSizeSelect.value=String(state.photoSize);
  photoUpload.querySelector(".photo-controls").insertBefore(photoSizeSelect,$("removePhoto"));
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
    photoUploadHome.append(photoUpload); photoUpload.hidden=state.step!==0;
    $("stepCount").textContent = `Step ${state.step+1} of ${sections.length}`;
    $("fields").innerHTML = `<h3 class="form-section-title">${section.title}</h3><div class="field-grid">${section.fields.map(f=>f.key==="name"?`
      <div class="name-photo-row wide"><div class="field name-field">
        <label for="field-${f.key}">${f.label}</label>
        <input id="field-${f.key}" data-key="${f.key}" value="${escapeHTML(state.values[f.key])}" placeholder="${escapeHTML(f.placeholder||"")}">
      </div><div class="photo-slot"></div></div>`:`
      <div class="field ${f.wide?"wide":""}">
        ${f.key==="job"?`<div class="title-label-row"><label for="field-${f.key}">${f.label}</label><button type="button" class="none-toggle ${state.titleDisabled?"active":""}" aria-pressed="${state.titleDisabled}">${state.titleDisabled?"Add professional title":"None"}</button></div>`:`<label for="field-${f.key}">${f.label}</label>`}
        ${f.key==="summary"?`<label class="summary-choice-label" for="summaryHeading">Summary heading in resume</label><select class="summary-heading-select" id="summaryHeading"><option value="Profile" ${state.summaryHeading==="Profile"?"selected":""}>Profile</option><option value="About Me" ${state.summaryHeading==="About Me"?"selected":""}>About Me</option></select>`:""}
        ${f.type==="textarea"
          ? `<textarea id="field-${f.key}" data-key="${f.key}" rows="${f.key==="summary"?4:5}" placeholder="${escapeHTML(f.placeholder||"")}">${escapeHTML(state.values[f.key])}</textarea>`
          : `<input id="field-${f.key}" data-key="${f.key}" value="${escapeHTML(state.values[f.key])}" placeholder="${escapeHTML(f.placeholder||"")}" ${f.key==="job"&&state.titleDisabled?"disabled":""}>`}
      </div>`).join("")}</div>`;
    if(state.step===1) {
      $("fields").innerHTML=`<h3 class="form-section-title">Work experience</h3><div class="experience-list">${state.experience.map((job,index)=>`
        <section class="entry-card"><div class="entry-heading"><strong>Experience ${index+1}</strong>${state.experience.length>1?`<button type="button" class="text-button" data-remove-experience="${index}">Remove</button>`:""}</div>
          <div class="field-grid"><div class="field"><label>Job title</label><input data-experience="${index}" data-part="job" value="${escapeHTML(job.job)}" placeholder="Job Title"></div>
          <div class="field"><label>Company name</label><input data-experience="${index}" data-part="company" value="${escapeHTML(job.company)}" placeholder="Company Name"></div>
          <div class="field"><label>Start month</label><input data-experience="${index}" data-part="startMonth" value="${escapeHTML(job.startMonth)}" placeholder="Jan"></div>
          <div class="field"><label>Start year</label><input data-experience="${index}" data-part="startYear" value="${escapeHTML(job.startYear)}" placeholder="2023"></div>
          <div class="field"><label>End month</label><input data-experience="${index}" data-part="endMonth" value="${escapeHTML(job.endMonth)}" placeholder="Month or Present"></div>
          <div class="field"><label>End year</label><input data-experience="${index}" data-part="endYear" value="${escapeHTML(job.endYear)}" placeholder="Year or Present"></div>
          <div class="field wide"><label>Description</label><textarea data-experience="${index}" data-part="description" rows="3" placeholder="Describe your responsibilities and achievements.">${escapeHTML(job.description)}</textarea></div></div>
        </section>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addExperience">+ Add experience</button>`;
    }
    if(state.step===2) {
      $("fields").innerHTML=`<h3 class="form-section-title">Education</h3><div class="education-list">${state.education.map((edu,index)=>`
        <section class="entry-card"><div class="entry-heading"><strong>Education ${index+1}</strong>${state.education.length>1?`<button type="button" class="text-button" data-remove-education="${index}">Remove</button>`:""}</div>
          <div class="field-grid"><div class="field"><label>Degree or qualification</label><input data-education="${index}" data-part="degree" value="${escapeHTML(edu.degree)}" placeholder="Degree or qualification"></div>
          <div class="field"><label>School name</label><input data-education="${index}" data-part="school" value="${escapeHTML(edu.school)}" placeholder="School name"></div>
          <div class="field"><label>Start year</label><input data-education="${index}" data-part="start" value="${escapeHTML(edu.start)}" placeholder="Year"></div>
          <div class="field"><label>End year</label><input data-education="${index}" data-part="end" value="${escapeHTML(edu.end)}" placeholder="Year"></div>
          <div class="field wide"><div class="title-label-row"><label>Description</label><button type="button" class="none-toggle ${edu.descriptionNone?"active":""}" data-description-none="${index}" aria-pressed="${edu.descriptionNone}">${edu.descriptionNone?"Add Description":"None"}</button></div><textarea data-education="${index}" data-part="description" rows="3" placeholder="Relevant coursework, honors, or achievements." ${edu.descriptionNone?"disabled":""}>${escapeHTML(edu.description)}</textarea></div></div>
        </section>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addEducation">+ Add education</button>`;
    }
    if(state.step===3) {
      $("fields").innerHTML=`<h3 class="form-section-title">Skills &amp; languages</h3><div class="repeat-section"><h4>Skills</h4><div class="repeat-list">${state.skills.map((value,index)=>`<div class="repeat-row"><input data-skill="${index}" value="${escapeHTML(value)}" placeholder="${skillExamples[index]||"Skill"}"><button type="button" class="text-button" data-remove-skill="${index}" aria-label="Remove skill">Remove</button></div>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addSkill">+ Add skill</button></div><div class="repeat-section"><h4>Languages</h4><div class="repeat-list">${state.languages.map((value,index)=>`<div class="repeat-row"><input data-language="${index}" value="${escapeHTML(value)}" placeholder="${languageExamples[index]||"Language"}"><button type="button" class="text-button" data-remove-language="${index}" aria-label="Remove language">Remove</button></div>`).join("")}</div><button type="button" class="btn btn-light add-entry" id="addLanguage">+ Add language</button></div><div class="field wide website-field"><label for="field-website">Website / LinkedIn (optional)</label><input id="field-website" data-key="website" value="${escapeHTML(state.values.website)}" placeholder="linkedin.com/in/yourname"></div>`;
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
    const noneToggle=$("fields").querySelector(".none-toggle:not([data-description-none])");
    if(noneToggle) noneToggle.addEventListener("click",()=>{
      state.titleDisabled=!state.titleDisabled;
      if(state.titleDisabled) state.values.job="";renderPreview();
      renderForm();
    });
    $("fields").querySelectorAll("[data-experience]").forEach(el=>el.addEventListener("input",()=>{
      state.experience[Number(el.dataset.experience)][el.dataset.part]=el.value;renderPreview();
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
    $("fields").querySelectorAll("[data-description-none]").forEach(button=>button.addEventListener("click",()=>{
      const edu=state.education[Number(button.dataset.descriptionNone)];edu.descriptionNone=!edu.descriptionNone;
      if(edu.descriptionNone) edu.description="";
      renderPreview();renderForm();
    }));
    $("fields").querySelectorAll("[data-remove-education]").forEach(button=>button.addEventListener("click",()=>{
      state.education.splice(Number(button.dataset.removeEducation),1);renderPreview();renderForm();
    }));
    $("addEducation")?.addEventListener("click",()=>{
      state.education.push({degree:"",school:"",start:"",end:"",description:"",descriptionNone:false,descriptionTouched:false,isNew:true});renderPreview();renderForm();
    });
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
    const pageWidth=content.clientWidth;
    const frameStyle=getComputedStyle(frame);
    const pageHeight=frame.clientHeight-parseFloat(frameStyle.paddingTop)-parseFloat(frameStyle.paddingBottom);
    const contentHeight=content.scrollHeight;
    if(!pageWidth||!pageHeight||contentHeight<=pageHeight) return 1;
    const scale=Math.min(1,(pageHeight-12)/contentHeight);
    content.style.width=`${pageWidth/scale}px`;
    content.style.height=`${pageHeight/scale}px`;
    content.style.minHeight=`${pageHeight/scale}px`;
    content.style.transformOrigin="top left";
    content.style.transform=`scale(${scale})`;
    frame.dataset.fitScale=String(scale);
    return scale;
  }
  function renderPreview() {
    const v=state.values;
    const photo=state.photo ? `<img class="avatar" src="${state.photo}" alt="Profile photo">` : "";
    const contactRow=(type,value)=>`<p class="contact-row">${contactIcon(type)}<span>${escapeHTML(value)}</span></p>`;
    const contact=`<div class="contact">${contactRow("email",v.email.trim()||"you@example.com")}${contactRow("phone",v.phone.trim()||"+63 9123456789")}${contactRow("location",v.location.trim()||"House Number, Street, Barangay, Municipality / City, Province, Country, Zip Code")}${v.website.trim()?contactRow("website",v.website):""}</div>`;
    const expContent=state.experience.map((job,index)=>{
      const example=index===0||job.isNew;
      const title=[job.job.trim()||(example?"Job Title":""),job.company.trim()||(example?"Company Name":"")].filter(Boolean).join(" | ");
      const startMonth=job.startMonth.trim()||(example?"Jan":"");
      const startYear=job.startYear.trim()||(example?"2023":"");
      const endIsPresent=/present/i.test(job.endMonth)||/present/i.test(job.endYear);
      const endMonth=endIsPresent?"":job.endMonth.trim();
      const endYear=endIsPresent?"":job.endYear.trim()||(example?"Present":"");
      const dates=[ [startMonth,startYear].filter(Boolean).join(" "), endIsPresent?"Present":[endMonth,endYear].filter(Boolean).join(" ") ].filter(Boolean).join(" – ");
      const description=job.description.trim()||(example?"Describe your responsibilities and achievements. Add measurable results where possible.":"");
      const lines=[title,dates,description].filter(Boolean);
      return lines.length?`<div class="item">${textLines(lines.join("\n"))}</div>`:"";
    }).join("");
    const exp=section("Work experience",expContent);
    const eduContent=state.education.map(item=>{
      const example=state.education.indexOf(item)===0||item.isNew;
      const title=[item.degree.trim()||(example?"Degree or Qualification":""),item.school.trim()||(example?"School Name":"")].filter(Boolean).join(" | ");
      const years=[item.start.trim()||(example?"2016":""),item.end.trim()||(example?"2020":"")].filter(Boolean).join(" – ");
      const description=item.descriptionNone?"":item.description.trim()||(example&&!item.descriptionTouched?"Relevant coursework, honors, or achievements.":"");
      const lines=[title,years,description].filter(Boolean);
      return lines.length?`<div class="item">${textLines(lines.join("\n"))}</div>`:"";
    }).join("");
    const edu=section("Education",eduContent);
    const skills=section("Skills",listItems(state.skills.map((value,index)=>value.trim()||skillExamples[index]||"").filter(Boolean).join("\n")));
    const languages=section("Languages",listItems(state.languages.map((value,index)=>value.trim()||languageExamples[index]||"").filter(Boolean).join("\n")));
    const summaryText=v.summary.trim()||"Write a short introduction highlighting your experience, strengths, and career goals.";
    const header=`<h2>${escapeHTML(v.name.trim()||"Full Name")}</h2><div class="subtitle">${escapeHTML(v.job.trim()||(state.titleDisabled?"":"Your Professional Title"))}</div>`;
    let html="";
    if(state.template==="Modern") html=`<aside class="side">${photo}${section("Contact",contact)}${skills}${languages}</aside><div class="main">${header}${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}</div>`;
    if(state.template==="Classic") html=`<div class="main"><div class="classic-header"><div class="classic-identity">${header}</div></div>${section("Contact",contact)}${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${skills}${languages}</div>`;
    if(state.template==="Minimal") html=`<div class="main"><div class="minimal-header"><div class="minimal-identity">${header}</div>${photo}</div>${section("Contact",contact)}${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${skills}${languages}</div>`;
    if(state.template==="Elegant") html=`<div class="hero">${photo}<div>${header}</div></div><div class="body">${section("Contact",contact)}${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${skills}${languages}</div>`;
    if(state.template==="Professional") html=`<div class="hero">${photo}<div>${header}${contact}</div></div><div class="body">${section(state.summaryHeading,textLines(summaryText))}${exp}${edu}${skills}${languages}</div>`;
    $("resumePreview").className=`resume ${state.template.toLowerCase()}`;
    $("resumePreview").style.setProperty("--photo-size",`${state.photoSize}px`);
    const photoTextSizes=state.photo?({72:[18,9,7.5],96:[21,10,8],128:[24,11,8.5]}[state.photoSize]):[20,9,8];
    $("resumePreview").style.setProperty("--photo-header-size",`${photoTextSizes[0]}px`);
    $("resumePreview").style.setProperty("--photo-subtitle-size",`${photoTextSizes[1]}px`);
    $("resumePreview").style.setProperty("--photo-detail-size",`${photoTextSizes[2]}px`);
    $("resumePreview").innerHTML=`<div class="resume-inner">${html}</div>`;
    fitResumeToPage($("resumePreview").querySelector(".resume-inner"));
    $("photoThumb").src=state.photo || "data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="#edf1f7"/><circle cx="40" cy="29" r="14" fill="#b5c0d2"/><path d="M12 80Q14 48 40 48T68 80" fill="#b5c0d2"/></svg>');
  }
  function renderTemplates() {
    $("templateGrid").innerHTML=templates.map(name=>`<button type="button" class="template-option ${state.template===name?"selected":""}" data-template="${name}">
      <div class="mini-page ${name==="Elegant"?"mini-elegant":""}"><div class="mini-side ${(["Classic","Minimal","Elegant"].includes(name)?"hidden":"")}"></div><div class="mini-lines"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
      <strong>${name}</strong><small>${state.template===name?"✓ Selected":"Select layout"}</small>
    </button>`).join("");
    $("templateGrid").querySelectorAll("[data-template]").forEach(button=>button.addEventListener("click",()=>{
      state.template=button.dataset.template;renderTemplates();renderPreview();
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
    const bounds=resume.getBoundingClientRect();
    const captureWidth=Math.round(bounds.width);
    const captureHeight=Math.round(bounds.height);
    Object.assign(resume.style,{position:"fixed",left:"0",top:"0",width:`${captureWidth}px`,height:`${captureHeight}px`,minHeight:`${captureHeight}px`,maxWidth:"none",minWidth:"0",aspectRatio:"210 / 297",margin:"0",overflow:"hidden",zIndex:"2147483647",pointerEvents:"none"});
    fitResumeToPage(content);
    const restore=()=>{
      if(originalFrameStyle===null) resume.removeAttribute("style"); else resume.setAttribute("style",originalFrameStyle);
      if(originalContentStyle===null) content.removeAttribute("style"); else content.setAttribute("style",originalContentStyle);
      if(originalFitScale===undefined) delete resume.dataset.fitScale; else resume.dataset.fitScale=originalFitScale;
      buttons.forEach(button=>{button.disabled=false;button.removeAttribute("aria-busy");});

    };
    try {
      await Promise.all([...resume.querySelectorAll("img")].map(image=>image.decode().catch(()=>{})));
      const width=captureWidth;
      const height=captureHeight;
      const canvas=await window.html2canvas(resume,{
        scale:4,
        x:0,
        y:0,
        width,
        height,
        windowWidth:document.documentElement.clientWidth,
        windowHeight:document.documentElement.clientHeight,
        useCORS:true,
        backgroundColor:"#ffffff",
        scrollX:0,
        scrollY:0
      });
      const pdf=new window.jspdf.jsPDF({unit:"mm",format:"a4",orientation:"portrait",compress:true});
      pdf.addImage(canvas.toDataURL("image/jpeg",.98),"JPEG",0,0,210,297,undefined,"FAST");
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
    if(state.step<sections.length-1){state.step++;renderForm();}
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
  $("removePhoto").addEventListener("click",()=>{state.photo="";$("photo").value="";renderPreview();});
  $("downloadTop").addEventListener("click",downloadPDF);
  $("downloadPreview").addEventListener("click",downloadPDF);
  window.addEventListener("beforeprint",()=>fitResumeToPage($("resumePreview").querySelector(".resume-inner")));
  window.addEventListener("afterprint",renderPreview);
  $("themeToggle").addEventListener("click",()=>setTheme(document.body.dataset.theme === "dark" ? "light" : "dark"));
  setTheme(localStorage.getItem("resume-builder-theme") === "dark" ? "dark" : "light");
  renderForm();renderTemplates();renderPreview();
})();
