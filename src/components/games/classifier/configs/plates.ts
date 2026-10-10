/** مستكشفة حدود الصفائح – ربط أنواع حدود الصفائح بالظواهر والأماكن الناتجة عنها */
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

const PHEN: CardDef[] = [
  ['d','ظهر وسط المحيط','تصعد الصهارة بين الصفيحتين المتباعدتين وتتصلب، فتبني سلسلة جبلية في قاع المحيط.'],
  ['d','وادي الخسف','عندما تتباعد صفيحتان قاريتان تهبط القشرة بينهما ويتكوّن وادٍ طويل منخفض.'],
  ['d','تكوّن قشرة محيطية جديدة','الصهارة الصاعدة في منطقة التباعد تبرد وتصير قشرة محيطية حديثة.'],
  ['d','اتساع قاع المحيط','كلما تباعدت الصفيحتان أُضيفت قشرة جديدة في الوسط فاتسع قاع المحيط.'],
  ['c','أخدود بحري عميق','تغوص الصفيحة المحيطية الأكثر كثافة تحت الصفيحة الأخرى فيتكوّن أخدود عميق.'],
  ['c','سلاسل جبلية مطوية شاهقة','تصادم صفيحتين قاريتين يضغط الصخور ويطويها ويرفعها جبالًا عالية.'],
  ['c','قوس من الجزر البركانية','غوص صفيحة محيطية تحت أخرى محيطية يصهر الصخور فتصعد الصهارة وتبني جزرًا بركانية.'],
  ['c','نطاق الطرح: غوص صفيحة تحت أخرى','نطاق الطرح يتكوّن حيث تتقارب صفيحتان وتنزل إحداهما في الستار.'],
  ['c','استهلاك القشرة المحيطية القديمة','القشرة القديمة تغوص في الستار عند الحدود المتقاربة وتنصهر.'],
  ['t','صدع تنزلق الصخور على جانبيه أفقيًّا','الحركة الجانبية للصفيحتين تكسر الصخور على طول صدع تحويلي.'],
  ['t','لا تتكوّن قشرة ولا تُستهلك','عند الحدود التحويلية تنزلق الصفيحتان فقط، فتبقى مساحة القشرة كما هي.'],
  ['t','إزاحة جانبية للطرق ومجاري الأنهار','انزلاق الصفيحتين في اتجاهين متعاكسين يزيح كل ما يعبر الصدع.'],
  ['t','زلازل ضحلة بلا براكين','الاحتكاك بين الصفيحتين المنزلقتين يولّد زلازل، ولا تصعد صهارة لتكوّن براكين.']
]
const PLACE: CardDef[] = [
  ['d','البحر الأحمر','الصفيحة العربية تبتعد عن الصفيحة الإفريقية، والبحر الأحمر يتسع ببطء.'],
  ['d','جزيرة آيسلندا','تقع آيسلندا فوق ظهر وسط المحيط الأطلسي حيث تتباعد صفيحتان.'],
  ['d','وادي الخسف الإفريقي العظيم','شرق إفريقيا يتمزق ببطء، فتهبط القشرة مكوّنة واديًا طويلًا.'],
  ['d','ظهر وسط المحيط الأطلسي','أطول سلسلة جبلية على الأرض، وتتكوّن عندها قشرة محيطية جديدة.'],
  ['c','جبال الهيمالايا','الصفيحة الهندية تصطدم بالصفيحة الأوراسية وترفع أعلى جبال العالم.'],
  ['c','جبال الأنديز','صفيحة نازكا المحيطية تغوص تحت صفيحة أمريكا الجنوبية القارية.'],
  ['c','أخدود ماريانا','أعمق نقطة في المحيطات، وتكوّنت بغوص صفيحة المحيط الهادئ تحت صفيحة مجاورة.'],
  ['c','جزر اليابان','قوس جزر بركانية نشأ فوق نطاق طرح تغوص فيه صفيحة محيطية.'],
  ['c','جبال زاغروس','الصفيحة العربية تصطدم بالصفيحة الأوراسية فتنطوي الصخور وترتفع.'],
  ['t','صدع سان أندرياس في كاليفورنيا','صفيحة المحيط الهادئ تنزلق بمحاذاة صفيحة أمريكا الشمالية.'],
  ['t','صدع البحر الميت وخليج العقبة','الصفيحة العربية تنزلق شمالًا بمحاذاة الصفيحة الإفريقية.'],
  ['t','صدع شمال الأناضول في تركيا','صفيحة الأناضول تنزلق غربًا بمحاذاة الصفيحة الأوراسية وتسبب زلازل قوية.']
]

export const plates: ClassifierConfig = {
  title: ["مستكشفة", "حدود الصفائح"],
  intro: {
    big: "اربطي كل ظاهرة بالحدّ الذي يصنعها",
    say: "ستظهر لكِ ظاهرة أو مكان من العالم. اختاري نوع حدود الصفائح المسؤول عنه. اضغطي الآن على أي حدّ في الأسفل لتتعرّفي عليه قبل البدء.",
  },
  panels: {
    d: {
      name: "حدود متباعدة",
      hint: "الصفيحتان تبتعدان",
      info: "تبتعد الصفيحتان إحداهما عن الأخرى، فتصعد الصهارة لتملأ الفراغ وتتصلب مكوّنة قشرة جديدة.",
      draw: drawD,
    },
    c: {
      name: "حدود متقاربة",
      hint: "الصفيحتان تتصادمان",
      info: "تقترب الصفيحتان وتتصادمان، فتغوص إحداهما تحت الأخرى أو تنطوي الصخور وترتفع جبالًا.",
      draw: drawC,
    },
    t: {
      name: "حدود تحويلية",
      hint: "الصفيحتان تنزلقان جانبيًّا",
      info: "تنزلق الصفيحتان أفقيًّا في اتجاهين متعاكسين، فتتكوّن الصدوع وتحدث الزلازل دون براكين.",
      draw: drawT,
      shake: true,
    },
  },
  rounds: [
    {
      name: "الظواهر والتضاريس",
      say: "تسع ظواهر جيولوجية. أيّ حدّ يصنع كلًّا منها؟",
      kind: "ما الحدّ الذي يصنع هذه الظاهرة؟",
      panels: ["d", "c", "t"],
      cards: PHEN,
    },
    {
      name: "أماكن من العالم",
      say: "تسعة أماكن حقيقية على سطح الأرض. على أي نوع من الحدود يقع كل مكان؟",
      kind: "على أي حدّ يقع هذا المكان؟",
      panels: ["d", "c", "t"],
      cards: PLACE,
    },
    {
      name: "التحدي السريع",
      say: "عشرة أسئلة مختلطة، ولكل سؤال ١٥ ثانية. الإجابة الأسرع تكسب نقاطًا إضافية.",
      kind: "أجيبي قبل انتهاء الوقت",
      panels: ["d", "c", "t"],
      cards: [...PHEN, ...PLACE],
      timed: 15,
    },
  ],
  ranks: ["عالِمة صفائح خبيرة", "مستكشفة ماهرة", "بداية جيدة، حاولي من جديد"],
}
