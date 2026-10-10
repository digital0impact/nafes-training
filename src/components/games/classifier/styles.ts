/** تنسيقات محرّك ألعاب التصنيف، محصورة داخل الحاوية .pbx حتى لا تتعارض مع تنسيقات المنصة */
export const CLASSIFIER_STYLES = `
.pbx{
  --abyss:#0b1d2a; --deep:#12303f; --ridge:#1c4558;
  --foam:#ecf6f2; --muted:#a5c0c4;
  --magma:#ff9a2e; --lava:#e5432d; --crust:#e6bd63; --sea:#3fbfdc;
  --ok:#62d68d; --bad:#ff7466; --ink:#07141d;
}
.pbx *{box-sizing:border-box}
.pbx{background:linear-gradient(180deg,var(--abyss) 0%,#0f2937 55%,#2b1612 100%) var(--abyss);color:var(--foam);font-size:17px;line-height:1.6;padding:18px 16px 26px;border-radius:24px}
.pbx .app{max-width:980px;margin-inline:auto;display:flex;flex-direction:column;gap:16px}
.pbx .top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 16px}
.pbx .title{font-weight:800;font-size:clamp(26px,5vw,38px);margin:0;line-height:1.15;color:var(--crust);text-wrap:balance}
.pbx .title span{color:var(--foam)}
.pbx .hud{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pbx .chip{background:var(--deep);border:1px solid var(--ridge);border-radius:999px;padding:4px 14px;font-weight:700;font-size:15px;white-space:nowrap}
.pbx .chip b{font-weight:800;font-size:20px;color:var(--magma);margin-inline-start:4px}
.pbx button{font:inherit;color:inherit;cursor:pointer}
.pbx button:focus-visible{outline:3px solid var(--sea);outline-offset:3px}
.pbx .ghost{background:transparent;border:1px solid var(--ridge);border-radius:999px;padding:4px 14px;font-size:15px;font-weight:500}
.pbx .ghost:hover{border-color:var(--sea)}
.pbx .track{height:8px;background:var(--deep);border-radius:99px;overflow:hidden}
.pbx .track i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--magma),var(--crust));border-radius:99px;transition:width .35s}
.pbx [data-el="timer"] i{background:var(--sea);transition:none}
.pbx .pcard{
  background:var(--deep);border:2px solid var(--ridge);border-radius:22px;
  padding:22px clamp(16px,4vw,34px);text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center;
  box-shadow:0 14px 0 -6px rgba(0,0,0,.28);min-height:210px;justify-content:center
}
.pbx .pcard.good{border-color:var(--ok)}
.pbx .pcard.wrong{border-color:var(--bad);animation:pbxShake .4s}
.pbx .kind{font-size:14px;font-weight:700;letter-spacing:.02em;color:var(--sea)}
.pbx .big{font-weight:800;font-size:clamp(26px,5.6vw,42px);line-height:1.25;margin:0;text-wrap:balance}
.pbx .say{margin:0;max-width:62ch;color:var(--muted);min-height:1.6em}
.pbx .say strong{color:var(--foam)}
.pbx .say.good strong{color:var(--ok)}
.pbx .say.wrong strong{color:var(--bad)}
.pbx .go{
  background:var(--magma);color:var(--ink);border:0;border-radius:14px;padding:10px 30px;
  font-weight:800;font-size:22px;box-shadow:0 5px 0 #b3560c;transition:transform .08s,box-shadow .08s
}
.pbx .go:hover{transform:translateY(-1px)}
.pbx .go:active{transform:translateY(4px);box-shadow:0 1px 0 #b3560c}
.pbx .panels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,2vw,18px)}
.pbx .panels[data-n="2"]{grid-template-columns:repeat(2,minmax(0,1fr));max-width:680px;width:100%;margin-inline:auto}
.pbx .panels[data-n="4"]{grid-template-columns:repeat(4,minmax(0,1fr))}
.pbx .panels[data-n="5"]{grid-template-columns:repeat(5,minmax(0,1fr))}
.pbx .panels[data-n="4"] .name,.pbx .panels[data-n="5"] .name{font-size:clamp(15px,2.4vw,21px)}
.pbx .panel{
  background:var(--deep);border:2px solid var(--ridge);border-radius:18px;padding:8px 8px 12px;
  display:flex;flex-direction:column;gap:4px;align-items:center;text-align:center;min-width:0;
  transition:transform .12s,border-color .12s
}
.pbx .panel:hover:not(:disabled){transform:translateY(-4px);border-color:var(--crust)}
.pbx .panel:disabled{cursor:default}
.pbx .panel canvas{width:100%;aspect-ratio:3/2;border-radius:12px;display:block;background:var(--abyss)}
.pbx .panel .name{font-weight:800;font-size:clamp(17px,3.6vw,26px);line-height:1.2;color:var(--crust)}
.pbx .panel .move{font-size:clamp(12px,2.4vw,15px);color:var(--muted);line-height:1.35}
.pbx .panel .key{font-size:12px;color:var(--muted);border:1px solid var(--ridge);border-radius:6px;padding:0 7px}
.pbx .panel.hit{border-color:var(--ok);box-shadow:0 0 0 4px rgba(98,214,141,.25);animation:pbxPop .45s}
.pbx .panel.miss{border-color:var(--bad);animation:pbxShake .4s}
.pbx .panel.reveal{border-color:var(--ok);border-style:dashed}
.pbx .panel.pick{border-color:var(--sea)}
@keyframes pbxPop{40%{transform:scale(1.06)}}

@keyframes pbxShake{20%{transform:translateX(7px)}40%{transform:translateX(-7px)}60%{transform:translateX(5px)}80%{transform:translateX(-4px)}}
.pbx .stars{display:flex;gap:6px;direction:ltr}
.pbx .stars svg{width:54px;height:54px}
.pbx .rows{width:100%;max-width:520px;display:flex;flex-direction:column;gap:8px;text-align:start}
.pbx .row{display:grid;grid-template-columns:10em 1fr 3.2em;gap:10px;align-items:center;font-size:15px}
.pbx .row .track i{background:var(--ok)}
.pbx .row span:last-child{font-variant-numeric:tabular-nums;text-align:end}
.pbx .missed{width:100%;max-width:620px;text-align:start;margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:15px}
.pbx .missed li{border-inline-start:3px solid var(--bad);padding-inline-start:10px;color:var(--muted)}
.pbx .missed b{color:var(--foam)}
.pbx .sub{font-weight:800;font-size:20px;margin:6px 0 0;color:var(--sea)}
@media (max-width:620px){.pbx .panels[data-n="4"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.pbx .panels[data-n="5"]{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:480px){.pbx .panel .key{display:none}
.pbx .pcard{min-height:190px}}

@media (prefers-reduced-motion:reduce){.pbx *{animation:none!important;transition:none!important}}

.pbx [hidden]{display:none!important}
.pbx .title,.pbx .sub,.pbx .big,.pbx .say{margin:0}
.pbx .sub{margin-top:6px}
`
