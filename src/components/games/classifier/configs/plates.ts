/**
 * مستكشفة حدود الصفائح – ناتج التعلم: الصفائح الأرضية وعلاقتها بالزلازل والبراكين.
 * المحتوى مأخوذ من: ملخص التفوق، العلوم
 * - الصف الثالث المتوسط، الفصل الدراسي الأول، درس «الصفائح الأرضية وعلاقتها بالزلازل والبراكين» (ص ١٩–٢١، ٦٨–٦٩)
 * - الصف الأول المتوسط، الفصل الدراسي الأول، درس «صفائح الأرض المتحركة» (ص ٣٥–٣٦)
 */
import type { CardDef, ClassifierConfig, G } from "../types"

function arrow(g: G, x: number, y: number, ang: number, ph: number){
  g.save(); g.translate(x,y); g.rotate(ang); g.translate(Math.sin(ph*4)*3,0);
  g.lineJoin='round'; g.beginPath();
  g.moveTo(-15,-4);g.lineTo(3,-4);g.lineTo(3,-10);g.lineTo(17,0);g.lineTo(3,10);g.lineTo(3,4);g.lineTo(-15,4);g.closePath();
  g.fillStyle='#fff'; g.strokeStyle='#07141d'; g.lineWidth=2; g.stroke(); g.fill(); g.restore();
}
function mantle(g: G){
  const m=g.createLinearGradient(0,60,0,200); m.addColorStop(0,'#a03a1c'); m.addColorStop(1,'#3d130e');
  g.fillStyle=m; g.fillRect(0,0,300,200);
}
function sea(g: G, path?: Path2D){
  const w=g.createLinearGradient(0,0,0,90); w.addColorStop(0,'#2aa9c8'); w.addColorStop(1,'#145d7a');
  g.fillStyle=w; if(path) g.fill(path); else g.fillRect(0,0,300,75);
}
function drawD(g: G, ph: number){
  mantle(g); sea(g);
  // rising magma
  const mg=g.createLinearGradient(0,60,0,200); mg.addColorStop(0,'#ffe27a'); mg.addColorStop(.4,'#ff9a2e'); mg.addColorStop(1,'#e5432d');
  g.save(); g.shadowColor='#ffb347'; g.shadowBlur=16; g.fillStyle=mg;
  g.beginPath(); g.moveTo(112,200); g.bezierCurveTo(138,150,142,100,144,58); g.lineTo(156,58); g.bezierCurveTo(158,100,162,150,188,200); g.closePath(); g.fill(); g.restore();
  for(let i=0;i<5;i++){const p=(ph*.35+i/5)%1; g.fillStyle='rgba(255,240,170,'+(1-p)+')';
    g.beginPath(); g.arc(150+Math.sin(i*9+ph)*7*(1-p),195-p*125,4*(1-p)+1.5,0,7); g.fill()}
  const off=(ph*14)%22;
  for(const s of [-1,1]){
    const P=new Path2D(); const X=(x: number)=>150+s*x;
    P.moveTo(X(160),74); P.lineTo(X(52),74); P.lineTo(X(9),56); P.lineTo(X(9),100); P.lineTo(X(160),102); P.closePath();
    g.fillStyle='#55697c'; g.fill(P); g.save(); g.clip(P);
    for(let k=0;k<8;k++){const d=9+k*22+off; g.strokeStyle=d<34?'rgba(255,170,70,.9)':'rgba(255,255,255,.2)'; g.lineWidth=d<34?4:2;
      g.beginPath(); g.moveTo(X(d),50); g.lineTo(X(d),104); g.stroke()}
    g.restore(); g.strokeStyle='#8fa5b8'; g.lineWidth=2; g.beginPath(); g.moveTo(X(160),74); g.lineTo(X(52),74); g.lineTo(X(9),56); g.stroke();
    arrow(g,X(88),128,s<0?Math.PI:0,ph);
  }
}
function drawC(g: G, ph: number){
  mantle(g);
  g.fillStyle='#173a52'; g.fillRect(0,0,300,60);
  const W=new Path2D(); W.moveTo(0,52);W.lineTo(163,52);W.lineTo(140,88);W.lineTo(118,80);W.lineTo(0,80);W.closePath(); sea(g,W);
  // continent with mountains and a volcano
  const C=new Path2D();
  [[140,86],[165,52],[182,46],[196,36],[205,45],[215,17],[222,17],[235,45],[251,33],[264,45],[300,40],[300,150],[192,150],[158,104]].forEach((p,i)=>i?C.lineTo(p[0],p[1]):C.moveTo(p[0],p[1]));
  C.closePath();
  const cg=g.createLinearGradient(0,20,0,150); cg.addColorStop(0,'#e6bd63'); cg.addColorStop(1,'#9a7436'); g.fillStyle=cg; g.fill(C);
  // conduit + blobs
  g.save(); g.shadowColor='#ffb347'; g.shadowBlur=10; g.strokeStyle='#ff9a2e'; g.lineWidth=4; g.lineCap='round';
  g.beginPath(); g.moveTo(203,152); g.quadraticCurveTo(222,90,218,19); g.stroke(); g.restore();
  for(let i=0;i<4;i++){const p=(ph*.4+i/4)%1; g.fillStyle='rgba(255,238,160,'+(1-p*.6)+')'; g.beginPath(); g.arc(205+p*13,150-p*130,3,0,7); g.fill()}
  g.fillStyle='#e5432d'; g.fillRect(214,15,9,5);
  for(let i=0;i<5;i++){const p=(ph*.45+i/5)%1; g.fillStyle='rgba(215,220,225,'+(.75*(1-p))+')';
    g.beginPath(); g.arc(218+Math.sin(i*5+p*5)*7+p*8,13-p*16,3+p*6,0,7); g.fill()}
  // subducting oceanic slab
  const Sl=new Path2D(); Sl.moveTo(0,80);Sl.lineTo(115,80);Sl.quadraticCurveTo(140,82,158,104);Sl.lineTo(228,200);Sl.lineTo(196,200);Sl.lineTo(138,118);Sl.quadraticCurveTo(126,103,108,102);Sl.lineTo(0,102);Sl.closePath();
  g.fillStyle='#55697c'; g.fill(Sl); g.save(); g.clip(Sl); g.strokeStyle='rgba(255,255,255,.22)'; g.lineWidth=2;
  const off=(ph*14)%22;
  for(let k=-1;k<13;k++){const s=k*22+off; g.beginPath();
    if(s<114){g.moveTo(s,78);g.lineTo(s,104)} else if(s>138){const u=s-138; const px=158+.589*u, py=104+.808*u; g.moveTo(px+3,py-2); g.lineTo(px-23,py+16)}
    g.stroke()}
  g.restore(); g.strokeStyle='#8fa5b8'; g.lineWidth=2; g.beginPath(); g.moveTo(0,80);g.lineTo(115,80);g.quadraticCurveTo(140,82,158,104);g.lineTo(228,200); g.stroke();
  arrow(g,58,128,0,ph); arrow(g,262,105,Math.PI,ph);
}
function drawT(g: G, ph: number){
  const off=(ph*16)%200;
  const side=(x0: number, w: number, shift: number, base: string)=>{
    g.save(); g.beginPath(); g.rect(x0,0,w,200); g.clip(); g.fillStyle=base; g.fillRect(x0,0,w,200);
    for(const r of [-1,0,1]){const y=r*200+shift;
      g.fillStyle='rgba(70,130,70,.55)'; g.fillRect(20,y+12,70,26); g.fillRect(190,y+92,80,24); g.fillRect(96,y+170,60,18); g.fillRect(170,y+14,50,20);
      g.strokeStyle='#3fbfdc'; g.lineWidth=9; g.lineCap='butt'; g.beginPath(); g.moveTo(-5,y+64);
      for(let x=0;x<=305;x+=15) g.lineTo(x,y+64+Math.sin(x*.045)*7); g.stroke();
      g.strokeStyle='#3b3f46'; g.lineWidth=11; g.beginPath(); g.moveTo(-5,y+146); g.lineTo(305,y+146); g.stroke();
      g.strokeStyle='#f3e9c4'; g.lineWidth=1.5; g.setLineDash([8,7]); g.beginPath(); g.moveTo(-5,y+146); g.lineTo(305,y+146); g.stroke(); g.setLineDash([]);
    }
    g.restore();
  };
  side(0,150,-off,'#c2a964'); side(150,150,off,'#b09755');
  for(let i=0;i<3;i++){const p=(ph*.5+i/3)%1; g.strokeStyle='rgba(255,255,255,'+(.7*(1-p))+')'; g.lineWidth=2; g.beginPath(); g.arc(150,100,8+p*70,0,7); g.stroke()}
  g.save(); g.shadowColor='#e5432d'; g.shadowBlur=8; g.strokeStyle='#2a1512'; g.lineWidth=4; g.lineJoin='round'; g.beginPath(); g.moveTo(150,-5);
  for(let y=10;y<=210;y+=20) g.lineTo(150+((y/20)%2?4:-4),y); g.stroke(); g.restore();
  arrow(g,76,104,-Math.PI/2,ph); arrow(g,224,104,Math.PI/2,ph);
}

/** بقعة ساخنة: كتل من الماجما تندفع من أعماق الأرض في وسط الصفيحة */
function drawH(g: G, ph: number){
  mantle(g); sea(g);
  const mg=g.createLinearGradient(0,60,0,200); mg.addColorStop(0,'#ffe27a'); mg.addColorStop(.5,'#ff9a2e'); mg.addColorStop(1,'#e5432d');
  g.save(); g.shadowColor='#ffb347'; g.shadowBlur=18; g.fillStyle=mg;
  g.beginPath(); g.moveTo(132,200); g.bezierCurveTo(128,160,142,120,146,72); g.lineTo(154,72); g.bezierCurveTo(158,120,172,160,168,200); g.closePath(); g.fill(); g.restore();
  for(let i=0;i<5;i++){const p=(ph*.3+i/5)%1; g.fillStyle='rgba(255,240,170,'+(1-p)+')';
    g.beginPath(); g.arc(150+Math.sin(i*7+ph)*6*(1-p),196-p*120,4*(1-p)+1.5,0,7); g.fill()}
  const P=new Path2D(); P.moveTo(-10,74); P.lineTo(310,74); P.lineTo(310,100); P.lineTo(-10,100); P.closePath();
  g.fillStyle='#55697c'; g.fill(P);
  const off=(ph*10)%30;
  g.save(); g.clip(P); g.strokeStyle='rgba(255,255,255,.2)'; g.lineWidth=2;
  for(let x=-30+off;x<320;x+=30){g.beginPath(); g.moveTo(x,72); g.lineTo(x,102); g.stroke()}
  g.restore();
  // سلسلة جزر بركانية: أقدمها يبتعد مع حركة الصفيحة
  [[150,1],[150-30,0.75],[150-60,0.5]].forEach(([x,s])=>{
    g.fillStyle='#6b4f2a'; g.beginPath(); g.moveTo(x-22*s,74); g.lineTo(x,74-34*s); g.lineTo(x+22*s,74); g.closePath(); g.fill();
  });
  g.fillStyle='#e5432d'; g.fillRect(146,38,8,5);
  arrow(g,60,128,Math.PI,ph);
}

const SIGNS: CardDef[] = [
  ['d','تتحرك فيها الصفائح مبتعدة عن بعضها','حدود التباعد: تتحرك فيها الصفائح مبتعدة عن بعضها.'],
  ['d','تسبب شقوقًا (صدوعًا) طويلة تسمى حفر الانهدام','تسبب حدود التباعد حدوث شقوق (صدوع) طويلة تسمى حفر الانهدام، والتي سرعان ما تملأ باللابة التي تتصلب مكونة البازلت (توسع المحيط).'],
  ['d','تمتلئ الشقوق باللابة التي تتصلب مكونة البازلت (توسع المحيط)','عند حدود التباعد تملأ حفر الانهدام باللابة التي تتصلب مكونة البازلت (توسع المحيط).'],
  ['d','تؤثر في الصفائح قوى شد باتجاهين متعاكسين','تتحرك الصفائح مبتعدة عن بعضها نتيجة قوى الشد التي تؤثر عليها باتجاهين متعاكسين.'],
  ['c','مناطق التحام الصفائح بعضها ببعض','حدود التقارب هي مناطق التحام الصفائح بعضها ببعض، وهناك أنواع من التقارب.'],
  ['c','تقارب قاري – قاري ينتج عنه تكوين الجبال الشاهقة','في التقارب القاري – القاري ينتج تكوين الجبال الشاهقة، والزلازل فيها متوسطة العمق.'],
  ['c','تنزلق الصفيحة الأثقل تحت الأخف وتنبثق البراكين وتتكون أقواس الجزر','في التقارب المحيطي – المحيطي ينزلق أحدهما (الأثقل) تحت الآخر (الأخف)، وينتج عن ذلك انبثاق البراكين وتكون أقواس الجزر.'],
  ['c','تتكون أخاديد وزلازل عميقة','في التقارب المحيطي – القاري تتكون أخاديد وزلازل عميقة.'],
  ['c','مناطق الطرح: تغوص فيها صفيحة تحت أخرى','تتشكل البراكين في مناطق الطرح، وهي المناطق التي تغوص فيها صفيحة تحت أخرى عند التقارب.'],
  ['t','تنزلق الصفائح أفقيًا بمحاذاة بعضها البعض','حدود الانزلاق (التحويلية): تنشأ الحركة عن قوى قص أو احتكاك عبر صدوع انزلاقية نتيجة انزلاق الصفائح أفقيًا بمحاذاة بعضها البعض.'],
  ['t','لا ينتج عنها زيادة ولا نقص في حجم القشرة الأرضية','تسمى حدود الانزلاق بالحدود المحافظة لأنه لا ينتج عنها زيادة ولا نقص في حجم القشرة الأرضية، إنما هي تحركات جانبية أفقية.'],
  ['t','تحدث فيها الزلازل الضحلة','عند حدود الانزلاق (التحويلية) تحدث الزلازل الضحلة.'],
  ['t','تتحرك صفيحة نحو الشمال بينما تتحرك صفيحة مجاورة لها نحو الجنوب','من أمثلة حركة الصفائح التحويلية (الانزلاقية) تحرك صفيحة نحو الشمال بينما تتحرك صفيحة مجاورة لها نحو الجنوب، وينشأ عن ذلك تكون الصدوع وحدوث الزلازل.'],
]
const PLACES: CardDef[] = [
  ['d','تشكل المحيط الأطلسي بين قارتي إفريقيا وأمريكا','مثال على حدود التباعد: تباعد قارتي إفريقيا وأمريكا وتشكل المحيط الأطلسي بينهما.'],
  ['d','النشاط الزلزالي والبركاني على امتداد البحر الأحمر','يتركز النشاط الزلزالي والبركاني في المملكة على امتداد البحر الأحمر وحتى خليج العقبة، وتمثل هذه المناطق حدود تباعد بين الصفيحة العربية والصفيحة الإفريقية.'],
  ['d','حرة رهط بالمدينة المنورة','من أمثلة الحرات في مناطق حدود التباعد بين الصفيحة العربية والصفيحة الإفريقية: حرة رهط والشاقة.'],
  ['c','جبال الهيمالايا','جبال الهيمالايا تكونت بتقارب قاري – قاري حيث التحمت شبه القارة الهندية بقارة آسيا.'],
  ['c','جبال زاجروس في إيران','جبال زاجروس جبال مطوية تكونت نتيجة تقارب صفيحة أوراسيا مع الصفيحة العربية.'],
  ['c','جبال الأنديز في أمريكا الجنوبية','جبال الأنديز مثال على التقارب المحيطي – القاري.'],
  ['c','حلقة النار داخل المحيط الهادي','حلقة النار داخل المحيط الهادي مثال على التقارب المحيطي – المحيطي، وينتج عنه تكون أقواس الجزر.'],
  ['t','فالق سان أندرياس في ولاية كاليفورنيا','فالق سان أندرياس الشهير في ولاية كاليفورنيا مثال على حدود الانزلاق (التحويلية).'],
  ['t','فالق البحر الميت','فالق البحر الميت يبدأ في البحر الأحمر ويعبر البحر الميت ولبنان وسوريا وصولًا إلى تركيا، وهو مثال على حدود الانزلاق.'],
  ['t','تكوين خليج العقبة','عند حدود الانزلاق تحدث الزلازل الضحلة مثل تكوين خليج العقبة.'],
  ['h','جزر هاواي','تكونت جزر هاواي بفعل البقع الساخنة.'],
  ['h','مراكز بركانية نشطة لا تكون في حدود الصفائح بل قد تكون في وسطها','البقع الساخنة مراكز بركانية نشطة لا تكون في حدود الصفائح بل قد تكون في وسطها.'],
  ['h','ارتفاع غير عادي في درجة الحرارة في بقعة في أعماق الأرض','تظهر البقع الساخنة بسبب وجود ارتفاع غير عادي في درجة الحرارة في بقعة في أعماق الأرض، مما يسبب اندفاع كتل كبيرة من الماجما للصعود.'],
]

export const plates: ClassifierConfig = {
  title: ["مستكشفة", "حدود الصفائح"],
  intro: {
    big: "اربطي كل ظاهرة بالحدّ الذي يصنعها",
    say: "ستظهر لكِ ظاهرة أو مكان من العالم. اختاري نوع حدود الصفائح المسؤول عنه. اضغطي الآن على أي لوحة في الأسفل لتتعرّفي عليها قبل البدء.",
  },
  panels: {
    d: {
      name: "حدود التباعد",
      hint: "الصفائح تبتعد",
      info: "تتحرك فيها الصفائح مبتعدة عن بعضها، فتسبب شقوقًا طويلة تسمى حفر الانهدام تملأ باللابة التي تتصلب مكونة البازلت.",
      draw: drawD,
    },
    c: {
      name: "حدود التقارب",
      hint: "الصفائح تلتحم",
      info: "مناطق التحام الصفائح بعضها ببعض، ومن أنواعها: قاري – قاري، ومحيطي – محيطي، ومحيطي – قاري.",
      draw: drawC,
    },
    t: {
      name: "حدود الانزلاق (التحويلية)",
      hint: "انزلاق أفقي",
      info: "تنزلق الصفائح أفقيًا بمحاذاة بعضها البعض، ولا ينتج عنها زيادة ولا نقص في حجم القشرة الأرضية، وتحدث فيها الزلازل الضحلة.",
      draw: drawT,
      shake: true,
    },
    h: {
      name: "البقع الساخنة",
      hint: "في وسط الصفيحة",
      info: "مراكز بركانية نشطة تظهر بسبب ارتفاع غير عادي في درجة الحرارة في بقعة في أعماق الأرض، ولا تكون في حدود الصفائح بل قد تكون في وسطها.",
      draw: drawH,
    },
  },
  rounds: [
    {
      name: "الظواهر والحركة",
      say: "ظواهر تحدث عند حدود الصفائح. أيّ حدّ يصنع كلًّا منها؟",
      kind: "ما الحدّ الذي يصنع هذه الظاهرة؟",
      panels: ["d", "c", "t"],
      cards: SIGNS,
    },
    {
      name: "أماكن من العالم",
      say: "أماكن حقيقية على سطح الأرض. هل تقع على حدود تباعد أم تقارب أم انزلاق، أم فوق بقعة ساخنة؟",
      kind: "أين يقع هذا المكان؟",
      panels: ["d", "c", "t", "h"],
      cards: PLACES,
    },
    {
      name: "التحدي السريع",
      say: "عشرة أسئلة مختلطة، ولكل سؤال ١٥ ثانية. الإجابة الأسرع تكسب نقاطًا إضافية.",
      kind: "أجيبي قبل انتهاء الوقت",
      panels: ["d", "c", "t", "h"],
      cards: [...SIGNS, ...PLACES],
      timed: 15,
    },
  ],
  ranks: ["عالِمة صفائح خبيرة", "مستكشفة ماهرة", "بداية جيدة، حاولي من جديد"],
  source: "ملخص التفوق، الصف الثالث المتوسط، الفصل الدراسي الأول (ص ١٩–٢١، ٦٨–٦٩)، والصف الأول المتوسط، الفصل الدراسي الأول (ص ٣٥–٣٦)",
}
