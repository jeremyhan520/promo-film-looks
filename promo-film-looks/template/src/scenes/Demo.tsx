// Demo timeline: one shot per signature component, with illustrative placeholder content and art.
// Replace with the film's own scene files (one file per chapter). Scene names start with a key from config.SHOTS;
// all times are absolute seconds on the voiceover.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F, mix, r, EZ, useT, Scene, Ground, Heading, Print, Caption, MaskTitle, StatHit, useCount, CardRail, FeatureCard, DocPage, En, Card} from '../kit';

const Open: React.FC = () => {
  const t = useT();
  return (
    <MaskTitle lines={[{text: '追光而行', t0: 0.6}, {text: '启航未来', t0: 1.8}]} exitAt={3.2}>
      <Img src={staticFile('img/demo_a.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', scale: String(mix(1.2, 1.0, r(t, 0, 4.2, EZ.cam)))}} />
    </MaskTitle>
  );
};

const About: React.FC = () => (
  <Ground>
    <Heading num="Chapter I" zh="学院概况" en="About the school" t0={4.0} />
    <Print src="demo_b.jpg" x={120} y={400} w={820} h={500} t0={4.4} dir="l" caption="主楼" captionEn="Main hall" />
    <Print src="demo_c.jpg" x={1020} y={250} w={780} h={520} t0={4.9} dir="u" />
    <Card style={{left: 1020, top: 810, width: 780, height: 130}}>
      <div style={{padding: '34px 44px', fontFamily: F.sans, fontSize: 32, color: C.cInk}}>学科交叉 · 国际视野 · 创新育人</div>
    </Card>
  </Ground>
);

const Numbers: React.FC = () => {
  const n = useCount(86, 8.4);
  return (
    <Ground>
      <Heading num="Chapter I" zh="师资力量" en="Faculty" t0={8.3} />
      <div style={{position: 'absolute', left: 140, top: 420, fontFamily: F.num, fontSize: 200, color: C.ink, lineHeight: 1}}>{n}<span style={{fontSize: 70, color: C.gold, marginLeft: 10}}>位</span></div>
      <Caption x={140} y={650} t0={8.6} zh="专任教师" en="Full-time faculty" />
      <StatHit value="100" unit="%" at={9.6} x={980} y={400} />
      <Caption x={980} y={650} t0={9.9} zh="本科生导师制全覆盖" en="Every undergraduate has a mentor" />
    </Ground>
  );
};

const DIRS = [
  {at: 12.3, numeral: 'I', name: '张教授', title: ['人工智能', '与智能制造'] as [string, string], en: 'AI & intelligent manufacturing', fig: 'demo_fig1.jpg'},
  {at: 14.2, numeral: 'II', name: '李教授', title: ['复杂网络', '与系统科学'] as [string, string], en: 'Complex networks & systems', fig: 'demo_fig2.jpg'},
  {at: 16.0, numeral: 'III', name: '王教授', title: ['数字人文', '与社会治理'] as [string, string], en: 'Digital humanities & governance', fig: 'demo_fig3.jpg'},
];
const Research: React.FC = () => (
  <Ground>
    <Heading num="Chapter I" zh="研究方向" en="Research directions" t0={11.9} t1={12.65} />
    <Heading num="Chapter I" zh="三大方向" en="Three directions" t0={17.6} />
    <CardRail introAt={12.2} overviewAt={17.4} items={DIRS.map((k, i) => ({at: k.at, render: (t) =>
      <FeatureCard t={t} i={i} n={DIRS.length} at={k.at} numeral={k.numeral} label="方向负责人" name={k.name} title={k.title} en={k.en} fig={k.fig} />}))} />
  </Ground>
);

const Honours: React.FC = () => (
  <Ground>
    <Heading num="Chapter II" zh="荣誉成果" en="Honours" t0={19.2} />
    {[0, 1, 2].map((i) => <DocPage key={i} src="demo_doc.jpg" x={560 + i * 300} y={380} w={250} h={354} t0={19.5 + i * 0.15} />)}
    <En text="Certificates always hang straight" t0={20.2} size={20} style={{position: 'absolute', left: 560, top: 780}} />
  </Ground>
);

export const Demo: React.FC = () => (
  <>
    <Scene name="0.1 open" from={0} to={4.2} fade={0}><Open /></Scene>
    <Scene name="1.1 about" from={3.85} to={8.4}><About /></Scene>
    <Scene name="1.2 numbers" from={8.05} to={11.9}><Numbers /></Scene>
    <Scene name="1.3 research" from={11.55} to={19.2}><Research /></Scene>
    <Scene name="2.1 honours" from={18.85} to={22}><Honours /></Scene>
  </>
);
