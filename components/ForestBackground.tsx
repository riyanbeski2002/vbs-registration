'use client';

import { useEffect, useState } from 'react';

const r = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };

const RAIN = Array.from({ length: 65 }, (_, i) => ({
  id: i, x: r(i * 1.73) * 102 - 1, delay: r(i * 2.31) * 3.2,
  duration: 0.48 + r(i * 3.17) * 0.72, opacity: 0.07 + r(i * 4.79) * 0.18,
  height: 7 + Math.floor(r(i * 5.93) * 14), wobble: (r(i * 6.11) - 0.5) * 2.5,
}));

const MIST = [
  { y: 16, d: 14, dl: 0,   o: 0.055 }, { y: 36, d: 11, dl: 3.5, o: 0.065 },
  { y: 55, d: 16, dl: 1.8, o: 0.048 }, { y: 72, d: 12, dl: 5.2, o: 0.058 },
  { y: 88, d: 13, dl: 2.4, o: 0.052 },
];

const FLIES = [
  { x:11,y:26,d:3.8,dl:0.0,w:true  }, { x:27,y:61,d:4.5,dl:1.2,w:false },
  { x:66,y:21,d:3.5,dl:0.5,w:true  }, { x:83,y:50,d:4.2,dl:2.1,w:false },
  { x:47,y:37,d:5.0,dl:0.8,w:true  }, { x:56,y:71,d:3.3,dl:1.6,w:false },
  { x:31,y:16,d:4.8,dl:0.3,w:true  }, { x:77,y:83,d:3.7,dl:1.9,w:false },
  { x:7, y:77,d:4.1,dl:2.4,w:true  }, { x:91,y:31,d:3.6,dl:0.7,w:false },
  { x:53,y:87,d:4.4,dl:1.4,w:true  }, { x:19,y:47,d:5.2,dl:2.8,w:false },
  { x:39,y:56,d:3.9,dl:0.9,w:true  }, { x:87,y:14,d:4.0,dl:2.2,w:false },
  { x:63,y:43,d:4.6,dl:1.0,w:true  }, { x:74,y:65,d:3.4,dl:3.1,w:false },
];

const BUTTERFLIES = [
  { x:22, y:62, d:7,  dl:0,   c:'#ff8c42', sz:20 },
  { x:64, y:70, d:9,  dl:2.5, c:'#ffe156', sz:16 },
  { x:38, y:55, d:6,  dl:1.4, c:'#5ecfff', sz:18 },
  { x:76, y:78, d:10, dl:3.8, c:'#ff5fa2', sz:14 },
  { x:52, y:66, d:8,  dl:1.0, c:'#a0ff6a', sz:15 },
];

const BIRD_FLOCKS = [
  { y:10, n:5, dur:30, dl:0,  rtl:false },
  { y:7,  n:3, dur:42, dl:9,  rtl:true  },
  { y:15, n:6, dur:25, dl:18, rtl:false },
  { y:12, n:4, dur:38, dl:28, rtl:true  },
];

export default function ForestBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    setIsMobile(mq.matches);
  }, []);

  useEffect(() => {
    // Only run parallax on non-touch devices
    if (isMobile) return;
    let rafId = 0;
    document.documentElement.style.setProperty('--scroll', '0px');
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--scroll', `${window.scrollY}px`);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId); };
  }, [isMobile]);

  return (
    <div aria-hidden="true" style={{
      position:'fixed', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none',
      background:'linear-gradient(180deg,#010a03 0%,#021408 20%,#031c0c 45%,#042010 70%,#031808 90%,#020e06 100%)',
    }}>

      {/* ── Sky glow patches through canopy gaps ── */}
      <div style={{ position:'absolute', inset:0, background:[
        'radial-gradient(ellipse 55% 30% at 50% 1%, rgba(30,75,30,0.55) 0%, transparent 70%)',
        'radial-gradient(ellipse 25% 18% at 20% 2%, rgba(40,90,35,0.35) 0%, transparent 55%)',
        'radial-gradient(ellipse 25% 18% at 80% 2%, rgba(35,82,32,0.35) 0%, transparent 55%)',
      ].join(',') }} />

      {/* ── Sun corona ── */}
      <div style={{
        position:'absolute', top:'-4%', left:'50%', transform:'translateX(-50%)',
        width:'280px', height:'280px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(255,215,80,0.2) 0%, rgba(255,190,50,0.09) 35%, rgba(200,170,40,0.04) 60%, transparent 75%)',
        animation:'sun-pulse 9s ease-in-out infinite',
      }} />

      {/* ── Crepuscular god-rays ── */}
      <LightBeams />

      {/* ── Clouds barely visible through canopy ── */}
      <Clouds />

      {/* ── FAR CANOPY  parallax 0.05 ── */}
      <div style={{ position:'absolute', top:0, left:0, right:0, transform:'translateY(calc(var(--scroll,0px)*.05))', willChange:'transform' }}>
        <FarCanopy />
      </div>

      {/* ── WATERFALL (right side) parallax 0.10 ── */}
      <div style={{ position:'absolute', top:0, right:'2%', width:'20%', height:'75%', transform:'translateY(calc(var(--scroll,0px)*.10))', willChange:'transform' }}>
        <Waterfall />
      </div>

      {/* ── WATERFALL (left side) parallax 0.10 ── */}
      <div style={{ position:'absolute', top:0, left:'6%', width:'14%', height:'65%', transform:'translateY(calc(var(--scroll,0px)*.10))', willChange:'transform' }}>
        <WaterfallLeft />
      </div>

      {/* ── ELEPHANT far background parallax 0.05 (peeking between mid-canopy trees) ── */}
      <div style={{ position:'absolute', bottom:'20%', left:'56%', transform:'translateY(calc(var(--scroll,0px)*.05))', willChange:'transform' }}>
        <Elephant />
      </div>

      {/* ── MID CANOPY parallax 0.14 ── */}
      <div style={{ position:'absolute', top:0, left:0, right:0, transform:'translateY(calc(var(--scroll,0px)*.14))', willChange:'transform' }}>
        <MidCanopy />
        {/* BambooGrove at left center */}
        <div style={{ position:'absolute', top:'26%', left:'18%' }}>
          <BambooGrove />
        </div>
      </div>

      {/* ── FOREST PATH parallax 0.19 ── */}
      <div style={{ position:'absolute', inset:0, transform:'translateY(calc(var(--scroll,0px)*.19))', willChange:'transform' }}>
        <ForestPath />
      </div>

      {/* ── Mist (desktop only) ── */}
      {!isMobile && MIST.map((m,i) => (
        <div key={i} style={{ position:'absolute', top:`${m.y}%`, left:'-12%', width:'124%', height:'7%' }}>
          <div style={{ width:'100%', height:'100%',
            background:`radial-gradient(ellipse 65% 100% at 50% 50%, rgba(180,245,210,${m.o}) 0%, transparent 65%)`,
            animation:`mist-drift ${m.d}s ease-in-out ${m.dl}s infinite alternate`,
          }} />
        </div>
      ))}

      {/* ── NEAR TREES + Animals in canopy, parallax 0.26 ── */}
      <div style={{ position:'absolute', inset:0, transform:'translateY(calc(var(--scroll,0px)*.26))', willChange:'transform' }}>
        <NearTrees />
        {/* Monkey hanging at ~22% left, 20% down */}
        <div style={{ position:'absolute', top:'20%', left:'21%' }}><MonkeyHanging /></div>
        {/* Toucan replacing parrot */}
        <div style={{ position:'absolute', top:'17%', right:'28%' }}><ToucanPerched /></div>
      </div>

      {/* ── DEER in undergrowth parallax 0.32 ── */}
      <div style={{ position:'absolute', bottom:'8%', left:'14%', transform:'translateY(calc(var(--scroll,0px)*.32))', willChange:'transform' }}>
        <Deer />
      </div>

      {/* ── TIGER crouching in undergrowth parallax 0.32 (zIndex above foreground) ── */}
      <div style={{ position:'absolute', bottom:'10%', left:'32%', transform:'translateY(calc(var(--scroll,0px)*.32))', willChange:'transform', zIndex:19 }}>
        <Tiger />
      </div>

      {/* ── Dappled light on forest floor ── */}
      <DappledLight />

      {/* ── Butterflies (desktop only) ── */}
      {!isMobile && BUTTERFLIES.map((b,i) => (
        <div key={i} style={{ position:'absolute', left:`${b.x}%`, top:`${b.y}%`,
          animation:`butterfly-wander ${b.d}s ease-in-out ${b.dl}s infinite`, zIndex:18 }}>
          <Butterfly color={b.c} size={b.sz} delay={b.dl} />
        </div>
      ))}

      {/* ── Bird flocks (desktop only) ── */}
      {!isMobile && BIRD_FLOCKS.map((flock,i) => (
        <BirdFlock key={i} y={flock.y} count={flock.n} duration={flock.dur} delay={flock.dl} rtl={flock.rtl} />
      ))}

      {/* ── Rain ── */}
      <div style={{ position:'absolute', inset:0, zIndex:16 }}>
        {RAIN.map(d => (
          <div key={d.id} className="rain-drop" style={{
            position:'absolute', left:`${d.x}%`, top:'-30px',
            width:'1.5px', height:`${d.height}px`,
            background:`linear-gradient(180deg,transparent 0%,rgba(165,238,200,${d.opacity}) 50%,transparent 100%)`,
            animation:`rain-fall ${d.duration}s linear ${d.delay}s infinite`,
            transform:`rotate(${d.wobble}deg)`, borderRadius:'50%',
          }} />
        ))}
      </div>

      {/* ── Fireflies (desktop only) ── */}
      {!isMobile && (
        <div style={{ position:'absolute', inset:0, zIndex:22 }}>
          {FLIES.map((ff,i) => (
            <div key={i} style={{
              position:'absolute', left:`${ff.x}%`, top:`${ff.y}%`,
              width:ff.w?'3px':'2px', height:ff.w?'3px':'2px', borderRadius:'50%',
              background:ff.w?'#f5e060':'#90f094',
              boxShadow:ff.w?'0 0 9px 4px rgba(245,224,80,0.74)':'0 0 9px 4px rgba(130,245,140,0.70)',
              animation:`firefly-float ${ff.d}s ease-in-out ${ff.dl}s infinite`,
            }} />
          ))}
        </div>
      )}

      {/* ── FOREGROUND SILHOUETTES parallax 0.42 ── */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, transform:'translateY(calc(var(--scroll,0px)*.42))', willChange:'transform' }}>
        <Foreground />
      </div>

      {/* ── Corner ferns/creepers parallax 0.56 ── */}
      <div style={{ position:'absolute', inset:0, transform:'translateY(calc(var(--scroll,0px)*.56))', willChange:'transform' }}>
        <CornerFerns />
      </div>

      {/* ── Depth vignette ── */}
      <div style={{ position:'absolute', inset:0, zIndex:30, background:[
        'radial-gradient(ellipse 130% 65% at 50% 50%, transparent 38%, rgba(0,6,1,0.40) 100%)',
        'linear-gradient(180deg,rgba(0,6,1,0.20) 0%,transparent 16%,transparent 80%,rgba(0,4,1,0.45) 100%)',
      ].join(',') }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════════ */

function LightBeams() {
  const beams = [
    { l:'14%', a:'-14deg', d:7.0, dl:0.0 }, { l:'28%', a:'-6deg',  d:9.0, dl:2.0 },
    { l:'42%', a:'-2deg',  d:8.0, dl:4.5 }, { l:'50%', a:'1deg',   d:7.5, dl:0.8 },
    { l:'60%', a:'5deg',   d:9.5, dl:3.2 }, { l:'74%', a:'9deg',   d:7.0, dl:1.6 },
    { l:'86%', a:'13deg',  d:8.5, dl:2.8 },
  ];
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, height:'90%', pointerEvents:'none' }}>
      {beams.map((b,i) => (
        <div key={i} style={{
          position:'absolute', top:0, left:b.l,
          width:'90px', height:'78%',
          background:'linear-gradient(180deg,rgba(245,215,85,0.0) 0%,rgba(245,215,85,0.13) 12%,rgba(220,210,75,0.07) 55%,rgba(200,205,60,0.02) 80%,transparent 100%)',
          transform:`translateX(-50%) rotate(${b.a})`, transformOrigin:'top center',
          clipPath:'polygon(44% 0%,56% 0%,100% 100%,0% 100%)',
          animation:`light-pulse ${b.d}s ease-in-out ${b.dl}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function Clouds() {
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, height:'28%', overflow:'hidden', zIndex:2 }}>
      {[
        { x:-5,  y:0.5, w:320, h:70, d:95,  dl:0  },
        { x:35,  y:2,   w:240, h:55, d:130, dl:35 },
        { x:68,  y:0,   w:380, h:80, d:85,  dl:12 },
        { x:110, y:3,   w:200, h:50, d:110, dl:50 },
      ].map((c,i) => (
        <div key={i} style={{
          position:'absolute', top:`${c.y}%`, left:`${c.x}%`,
          width:`${c.w}px`, height:`${c.h}px`, borderRadius:'50%',
          background:'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(155,200,155,0.07) 0%, rgba(130,175,135,0.03) 55%, transparent 80%)',
          filter:'blur(10px)',
          animation:`cloud-drift ${c.d}s linear ${c.dl}s infinite`,
        }} />
      ))}
    </div>
  );
}

function FarCanopy() {
  return (
    <svg viewBox="0 0 1440 520" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', display:'block' }} preserveAspectRatio="xMidYMin slice">
      <defs>
        <radialGradient id="sky-haze" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#041e08" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#010a03" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="1440" height="220" fill="url(#sky-haze)" />
      <path d="M0,0 L1440,0 L1440,228 C1398,210 1355,240 1305,222 C1255,204 1222,235 1170,218 C1118,201 1088,232 1035,215 C982,198 952,230 898,213 C844,196 814,228 760,211 C706,194 676,227 622,210 C568,193 538,226 484,209 C430,192 400,225 346,208 C292,191 262,224 208,207 C154,190 124,223 70,206 L0,202 Z" fill="#020e04" opacity="0.96" />
      <path d="M0,0 L1440,0 L1440,185 C1418,172 1380,196 1332,180 C1284,164 1255,190 1205,175 C1155,160 1125,186 1075,171 C1025,156 995,182 945,167 C895,152 865,178 815,163 C765,148 735,174 685,159 C635,144 605,170 555,156 C505,142 475,168 425,154 C375,140 345,166 295,152 C245,138 215,164 165,150 C115,136 85,162 35,148 L0,144 Z" fill="#031208" opacity="0.9" />
      {/* Far canopy crowns */}
      <g fill="#031509" opacity="0.88">
        <ellipse cx="55"   cy="108" rx="92"  ry="82"  />
        <ellipse cx="225"  cy="85"  rx="112" ry="100" />
        <ellipse cx="415"  cy="102" rx="105" ry="92"  />
        <ellipse cx="612"  cy="78"  rx="122" ry="108" />
        <ellipse cx="808"  cy="95"  rx="115" ry="96"  />
        <ellipse cx="1005" cy="86"  rx="118" ry="102" />
        <ellipse cx="1198" cy="100" rx="108" ry="90"  />
        <ellipse cx="1378" cy="108" rx="98"  ry="86"  />
      </g>
      {/* Hanging vines from far canopy */}
      <g stroke="#021008" strokeWidth="1.8" fill="none" opacity="0.55" strokeLinecap="round">
        <path d="M175 172 Q179 245 173 322 Q170 365 174 405" strokeDasharray="3 8" />
        <path d="M425 180 Q428 252 422 330 Q419 372 423 412" strokeDasharray="3 8" />
        <path d="M690 168 Q693 240 687 318 Q684 360 688 400" strokeDasharray="3 8" />
        <path d="M960 174 Q963 246 957 324 Q954 366 958 406" strokeDasharray="3 8" />
        <path d="M1210 170 Q1213 242 1207 320 Q1204 362 1208 402" strokeDasharray="3 8" />
      </g>
      {/* Vine leaf nodes */}
      <g fill="#041c09" opacity="0.7">
        <ellipse cx="173" cy="238" rx="12" ry="8"  transform="rotate(-25,173,238)" />
        <ellipse cx="173" cy="285" rx="10" ry="6"  transform="rotate(20,173,285)" />
        <ellipse cx="422" cy="248" rx="11" ry="7"  transform="rotate(-20,422,248)" />
        <ellipse cx="422" cy="298" rx="10" ry="6"  transform="rotate(22,422,298)" />
        <ellipse cx="687" cy="232" rx="12" ry="8"  transform="rotate(-22,687,232)" />
        <ellipse cx="687" cy="280" rx="10" ry="7"  transform="rotate(18,687,280)" />
        <ellipse cx="957" cy="240" rx="11" ry="7"  transform="rotate(-18,957,240)" />
        <ellipse cx="1207" cy="235" rx="12" ry="8" transform="rotate(-24,1207,235)" />
      </g>
    </svg>
  );
}

function Waterfall() {
  return (
    <svg viewBox="0 0 320 720" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }} preserveAspectRatio="xMidYMin meet">
      <defs>
        <linearGradient id="wf-s1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(220,248,238,0.0)" />
          <stop offset="8%"   stopColor="rgba(225,250,242,0.85)" />
          <stop offset="88%"  stopColor="rgba(200,240,228,0.75)" />
          <stop offset="100%" stopColor="rgba(180,230,215,0.0)" />
        </linearGradient>
        <linearGradient id="wf-s2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(240,252,248,0.0)" />
          <stop offset="12%"  stopColor="rgba(245,255,250,0.92)" />
          <stop offset="85%"  stopColor="rgba(220,245,238,0.8)" />
          <stop offset="100%" stopColor="rgba(200,238,228,0.0)" />
        </linearGradient>
        <clipPath id="wf-clip">
          <path d="M128,0 L195,0 L192,40 L186,110 L180,210 L175,340 L172,480 L168,600 L158,720 L148,720 L144,600 L140,480 L137,340 L132,210 L126,110 L120,40 Z" />
        </clipPath>
        <radialGradient id="wf-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(80,180,155,0.45)" />
          <stop offset="60%"  stopColor="rgba(60,150,130,0.25)" />
          <stop offset="100%" stopColor="rgba(40,120,100,0.0)" />
        </radialGradient>
        <linearGradient id="wf-rainbow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,50,50,0.55)" />
          <stop offset="17%"  stopColor="rgba(255,140,0,0.55)" />
          <stop offset="34%"  stopColor="rgba(255,230,0,0.55)" />
          <stop offset="51%"  stopColor="rgba(50,200,60,0.55)" />
          <stop offset="68%"  stopColor="rgba(30,130,255,0.55)" />
          <stop offset="85%"  stopColor="rgba(100,30,220,0.55)" />
          <stop offset="100%" stopColor="rgba(180,0,200,0.55)" />
        </linearGradient>
      </defs>

      {/* Rocky cliff */}
      <path d="M90,0 L230,0 L248,55 L258,130 L252,240 L245,370 L238,510 L228,640 L210,720 L110,720 L92,640 L82,510 L75,370 L68,240 L62,130 L72,55 Z" fill="#0c1e0a" />
      {/* Rock texture lines */}
      <g stroke="#0a1808" strokeWidth="1.5" fill="none" opacity="0.65">
        <path d="M100,85  Q135,74  168,85  Q202,96  222,84" />
        <path d="M94,165  Q128,152 162,163 Q196,174 218,160" />
        <path d="M90,265  Q124,252 158,263 Q194,274 216,260" />
        <path d="M88,380  Q122,367 156,378 Q192,389 214,375" />
        <path d="M86,490  Q120,477 155,488 Q190,499 212,485" />
      </g>
      {/* Moss patches on rocks */}
      <g fill="#0d2a0c" opacity="0.7">
        <ellipse cx="108" cy="100" rx="14" ry="8" />
        <ellipse cx="210" cy="150" rx="12" ry="7" />
        <ellipse cx="100" cy="280" rx="16" ry="9" />
        <ellipse cx="215" cy="320" rx="13" ry="8" />
        <ellipse cx="104" cy="440" rx="18" ry="10" />
      </g>

      {/* Waterfall streams (clipped to channel) */}
      <g clipPath="url(#wf-clip)">
        <rect x="128" y="-720" width="5"  height="1440" fill="url(#wf-s1)" style={{ animation:'wf-flow 1.1s linear 0s infinite' }} />
        <rect x="136" y="-720" width="7"  height="1440" fill="url(#wf-s2)" style={{ animation:'wf-flow 0.85s linear 0.18s infinite' }} />
        <rect x="147" y="-720" width="6"  height="1440" fill="url(#wf-s1)" style={{ animation:'wf-flow 1.0s linear 0.35s infinite' }} />
        <rect x="157" y="-720" width="5"  height="1440" fill="url(#wf-s2)" style={{ animation:'wf-flow 1.2s linear 0.08s infinite' }} />
        <rect x="165" y="-720" width="4"  height="1440" fill="url(#wf-s1)" style={{ animation:'wf-flow 0.95s linear 0.45s infinite' }} />
        <rect x="172" y="-720" width="5"  height="1440" fill="url(#wf-s2)" style={{ animation:'wf-flow 1.15s linear 0.22s infinite' }} />
        {/* White froth highlights */}
        <rect x="140" y="-720" width="3"  height="1440" fill="rgba(255,255,255,0.35)" style={{ animation:'wf-flow 0.7s linear 0.1s infinite' }} />
        <rect x="158" y="-720" width="2"  height="1440" fill="rgba(255,255,255,0.28)" style={{ animation:'wf-flow 0.8s linear 0.3s infinite' }} />
      </g>

      {/* Spray / mist at base */}
      <ellipse cx="160" cy="685" rx="62" ry="22" fill="rgba(200,242,228,0.18)" style={{ animation:'wf-mist 2.2s ease-in-out 0s infinite alternate' }} />
      <ellipse cx="160" cy="678" rx="48" ry="16" fill="rgba(220,248,235,0.14)" style={{ animation:'wf-mist 2.8s ease-in-out 0.5s infinite alternate' }} />
      <ellipse cx="160" cy="672" rx="34" ry="11" fill="rgba(240,252,245,0.10)" style={{ animation:'wf-mist 2.0s ease-in-out 0.9s infinite alternate' }} />
      {/* Pool */}
      <ellipse cx="160" cy="698" rx="65" ry="20" fill="url(#wf-pool)" />
      <ellipse cx="160" cy="700" rx="45" ry="13" fill="rgba(100,190,168,0.2)" style={{ animation:'pool-ripple 3s ease-in-out 0s infinite' }} />
      <ellipse cx="160" cy="700" rx="28" ry="8"  fill="rgba(120,210,185,0.15)" style={{ animation:'pool-ripple 3s ease-in-out 0.8s infinite' }} />

      {/* Rainbow arc in mist zone */}
      <path d="M106,668 Q160,638 214,668" stroke="url(#wf-rainbow)" strokeWidth="4" fill="none" opacity="0.28" strokeLinecap="round" />
      <path d="M112,672 Q160,644 208,672" stroke="url(#wf-rainbow)" strokeWidth="2.5" fill="none" opacity="0.18" strokeLinecap="round" />

      {/* Pool shimmer lines */}
      <line x1="128" y1="696" x2="192" y2="696" stroke="rgba(180,240,220,0.18)" strokeWidth="1.2" style={{ animation:'pool-shimmer 3.2s ease-in-out 0s infinite' }} />
      <line x1="135" y1="701" x2="185" y2="701" stroke="rgba(160,230,210,0.14)" strokeWidth="1"   style={{ animation:'pool-shimmer 3.8s ease-in-out 1.1s infinite' }} />
      <line x1="140" y1="706" x2="180" y2="706" stroke="rgba(200,245,228,0.12)" strokeWidth="0.8" style={{ animation:'pool-shimmer 4.4s ease-in-out 2s infinite' }} />

      {/* Foam bubbles at pool base */}
      {[
        {cx:148,cy:688,r:4,dl:'0s'},{cx:162,cy:685,r:3.5,dl:'0.4s'},{cx:174,cy:689,r:3,dl:'0.8s'},
        {cx:155,cy:692,r:2.5,dl:'1.2s'},{cx:167,cy:687,r:4,dl:'1.6s'},{cx:143,cy:690,r:3,dl:'2.0s'},
        {cx:178,cy:686,r:2.5,dl:'0.6s'},{cx:158,cy:694,r:3.5,dl:'1.0s'},{cx:152,cy:683,r:2,dl:'1.8s'},{cx:171,cy:691,r:3,dl:'2.4s'},
      ].map((b,i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={b.r}
          fill="rgba(220,248,238,0.55)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"
          style={{ animation:`foam-bubble ${1 + (i % 3) * 0.5}s ease-in-out ${b.dl} infinite` }} />
      ))}

      {/* Crocodile — eyes + snout barely visible in pool */}
      <ellipse cx="142" cy="695" rx="22" ry="4" fill="#010c03" opacity="0.85" />
      <circle cx="135" cy="692" r="2.8" fill="#041a08" />
      <circle cx="135" cy="692" r="1.2" fill="#082e12" style={{ filter:'drop-shadow(0 0 2px rgba(50,200,80,0.35))' }} />
      <circle cx="150" cy="691" r="2.8" fill="#041a08" />
      <circle cx="150" cy="691" r="1.2" fill="#082e12" style={{ filter:'drop-shadow(0 0 2px rgba(50,200,80,0.35))' }} />

      {/* Vegetation flanking waterfall */}
      <g fill="#041a08" opacity="0.92">
        <ellipse cx="98"  cy="190" rx="32" ry="44" />
        <ellipse cx="222" cy="170" rx="30" ry="40" />
        <ellipse cx="90"  cy="360" rx="36" ry="48" />
        <ellipse cx="228" cy="390" rx="34" ry="44" />
        <ellipse cx="94"  cy="530" rx="38" ry="50" />
        <ellipse cx="224" cy="555" rx="36" ry="46" />
      </g>
      {/* Ferns near pool */}
      <g fill="#051e0a" opacity="0.88">
        <path d="M100,720 Q88,690 82,660 Q90,680 100,705" />
        <path d="M100,720 Q92,695 98,668 Q100,688 104,710" />
        <path d="M220,720 Q232,690 238,660 Q230,680 220,705" />
        <path d="M220,720 Q228,695 222,668 Q220,688 216,710" />
      </g>
    </svg>
  );
}

function MidCanopy() {
  return (
    <svg viewBox="0 0 1440 660" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', display:'block' }} preserveAspectRatio="xMidYMin slice">
      {/* Canopy fill */}
      <path d="M0,0 L1440,0 L1440,328 C1392,304 1348,332 1295,310 C1242,288 1210,320 1155,298 C1100,276 1068,308 1013,286 C958,264 926,298 871,276 C816,254 784,290 729,268 C674,246 642,284 587,262 C532,240 500,278 445,256 C390,234 358,272 303,250 C248,228 216,268 161,246 C106,224 74,264 19,242 L0,238 Z" fill="#020c05" opacity="0.95" />
      <path d="M0,0 L1440,0 L1440,282 C1408,264 1368,290 1315,274 C1262,258 1230,286 1175,270 C1120,254 1088,282 1033,266 C978,250 946,278 891,262 C836,246 804,274 749,258 C694,242 662,270 607,254 C552,238 520,266 465,250 C410,234 378,262 323,246 C268,230 236,258 181,243 C126,228 94,256 39,241 L0,236 Z" fill="#031108" opacity="0.88" />
      {/* Mid crowns */}
      <g fill="#021308" opacity="0.93">
        <ellipse cx="140"  cy="162" rx="108" ry="148" />
        <ellipse cx="365"  cy="140" rx="124" ry="165" />
        <ellipse cx="590"  cy="170" rx="118" ry="152" />
        <ellipse cx="812"  cy="148" rx="128" ry="158" />
        <ellipse cx="1032" cy="162" rx="120" ry="148" />
        <ellipse cx="1252" cy="152" rx="125" ry="155" />
        <ellipse cx="1440" cy="178" rx="98"  ry="132" />
        <ellipse cx="0"    cy="188" rx="94"  ry="122" />
      </g>
      {/* Tree trunks with slight taper */}
      <g fill="#010804" opacity="0.97">
        <path d="M130 298 Q134 460 127 660 Q138 460 150 298 Z" />
        <path d="M356 285 Q360 448 353 660 Q362 448 374 285 Z" />
        <path d="M581 295 Q585 458 578 660 Q588 458 600 295 Z" />
        <path d="M803 288 Q807 451 800 660 Q810 451 822 288 Z" />
        <path d="M1024 292 Q1028 455 1021 660 Q1031 455 1043 292 Z" />
        <path d="M1244 286 Q1248 449 1241 660 Q1251 449 1263 286 Z" />
      </g>
      {/* Aerial roots / creeper vines on trunks */}
      <g stroke="#010703" strokeWidth="1.5" fill="none" opacity="0.75" strokeLinecap="round">
        <path d="M127 320 Q118 370 115 440 Q112 500 118 560" />
        <path d="M150 310 Q158 360 162 430 Q165 495 160 555" />
        <path d="M353 308 Q344 358 341 428 Q338 490 344 550" />
        <path d="M374 300 Q382 350 386 420 Q389 484 384 544" />
        <path d="M578 315 Q570 365 567 435 Q564 500 570 558" />
        <path d="M600 305 Q608 355 612 425 Q615 488 610 548" />
      </g>
      {/* Creeper vine leaves */}
      <g fill="#031a08" opacity="0.8">
        <ellipse cx="116" cy="395" rx="10" ry="6" transform="rotate(-30,116,395)" />
        <ellipse cx="116" cy="450" rx="9"  ry="5" transform="rotate(25,116,450)" />
        <ellipse cx="161" cy="380" rx="10" ry="6" transform="rotate(28,161,380)" />
        <ellipse cx="341" cy="400" rx="10" ry="6" transform="rotate(-28,341,400)" />
        <ellipse cx="344" cy="460" rx="9"  ry="5" transform="rotate(22,344,460)" />
        <ellipse cx="385" cy="388" rx="10" ry="6" transform="rotate(26,385,388)" />
        <ellipse cx="567" cy="410" rx="10" ry="6" transform="rotate(-25,567,410)" />
        <ellipse cx="611" cy="392" rx="9"  ry="6" transform="rotate(24,611,392)" />
      </g>
      {/* Buttress roots */}
      <g fill="#010703" opacity="0.85">
        <path d="M133 660 Q122 545 110 430 Q124 515 131 595 Z" />
        <path d="M148 660 Q158 543 168 426 Q156 512 150 593 Z" />
        <path d="M358 660 Q347 543 335 426 Q349 512 356 593 Z" />
        <path d="M372 660 Q382 543 392 426 Q380 512 374 593 Z" />
      </g>
    </svg>
  );
}

function ForestPath() {
  return (
    <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="path-dirt" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#2e1e09" stopOpacity="0.88" />
          <stop offset="35%"  stopColor="#221608" stopOpacity="0.78" />
          <stop offset="75%"  stopColor="#160e05" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#0d0904" stopOpacity="0.42" />
        </linearGradient>
        <radialGradient id="dapple-1" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(245,210,80,0.18)" />
          <stop offset="100%" stopColor="rgba(245,210,80,0.0)" />
        </radialGradient>
        <radialGradient id="dapple-2" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(220,200,70,0.14)" />
          <stop offset="100%" stopColor="rgba(220,200,70,0.0)" />
        </radialGradient>
      </defs>
      {/* Path shape – winding perspective from bottom to vanish */}
      <path d="M548,900 C568,790 590,706 614,638 C638,568 660,518 682,470 C700,432 712,408 720,378 C726,355 726,335 720,318 L726,316 C732,333 732,355 726,378 C734,408 746,432 764,470 C786,518 808,568 832,638 C856,706 878,790 898,900 Z" fill="url(#path-dirt)" />
      {/* Path edge definition */}
      <path d="M548,900 C568,790 590,706 614,638 C638,568 660,518 682,470 C700,432 712,408 720,378 C726,355 726,335 720,318" stroke="rgba(100,65,25,0.30)" strokeWidth="2" fill="none" />
      <path d="M898,900 C878,790 856,706 832,638 C808,568 786,518 764,470 C746,432 734,408 726,378 C720,355 720,335 726,316" stroke="rgba(100,65,25,0.30)" strokeWidth="2" fill="none" />
      {/* Dappled light patches on path */}
      <g style={{ animation:'dapple-shift 4.5s ease-in-out 0s infinite alternate' }}>
        <ellipse cx="614" cy="808" rx="28" ry="13" fill="url(#dapple-1)" transform="rotate(-8,614,808)" />
        <ellipse cx="672" cy="665" rx="20" ry="9"  fill="url(#dapple-2)" transform="rotate(4,672,665)" />
        <ellipse cx="720" cy="490" rx="13" ry="6"  fill="url(#dapple-1)" transform="rotate(-3,720,490)" />
        <ellipse cx="756" cy="705" rx="22" ry="10" fill="url(#dapple-2)" transform="rotate(7,756,705)" />
        <ellipse cx="806" cy="838" rx="25" ry="11" fill="url(#dapple-1)" transform="rotate(-5,806,838)" />
      </g>
      <g style={{ animation:'dapple-shift 5.5s ease-in-out 2s infinite alternate' }}>
        <ellipse cx="586" cy="740" rx="16" ry="7"  fill="url(#dapple-2)" transform="rotate(5,586,740)" />
        <ellipse cx="710" cy="572" rx="11" ry="5"  fill="url(#dapple-1)" transform="rotate(-4,710,572)" />
        <ellipse cx="755" cy="610" rx="15" ry="7"  fill="url(#dapple-2)" transform="rotate(6,755,610)" />
        <ellipse cx="845" cy="770" rx="20" ry="9"  fill="url(#dapple-1)" transform="rotate(-7,845,770)" />
      </g>
      {/* Rocks on path edges */}
      <g fill="#1e1408" opacity="0.75">
        <ellipse cx="572" cy="852" rx="8"  ry="5" transform="rotate(18,572,852)" />
        <ellipse cx="558" cy="796" rx="6"  ry="4" transform="rotate(-12,558,796)" />
        <ellipse cx="566" cy="752" rx="9"  ry="5" transform="rotate(22,566,752)" />
        <ellipse cx="876" cy="835" rx="8"  ry="5" transform="rotate(-18,876,835)" />
        <ellipse cx="864" cy="778" rx="6"  ry="4" transform="rotate(14,864,778)" />
        <ellipse cx="870" cy="730" rx="8"  ry="4" transform="rotate(-20,870,730)" />
      </g>
      {/* Fallen leaves on path */}
      <g fill="#201408" opacity="0.65">
        <ellipse cx="598" cy="878" rx="9"  ry="4" transform="rotate(32,598,878)" />
        <ellipse cx="856" cy="868" rx="8"  ry="3" transform="rotate(-28,856,868)" />
        <ellipse cx="668" cy="748" rx="7"  ry="3" transform="rotate(18,668,748)" />
        <ellipse cx="775" cy="795" rx="8"  ry="3" transform="rotate(-22,775,795)" />
        <ellipse cx="635" cy="822" rx="6"  ry="3" transform="rotate(14,635,822)" />
        <ellipse cx="810" cy="852" rx="7"  ry="3" transform="rotate(-16,810,852)" />
      </g>
    </svg>
  );
}

function NearTrees() {
  return (
    <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} preserveAspectRatio="xMidYMin slice">
      <g fill="#000a02">
        {/* Left edge tree */}
        <path d="M-30 900 Q-24 500 -22 0 Q-14 500 2 900 Z" />
        <ellipse cx="-14" cy="78"  rx="82"  ry="128" />
        <ellipse cx="-32" cy="40"  rx="62"  ry="92"  />
        <ellipse cx="4"   cy="52"  rx="56"  ry="84"  />
        {/* Tree at ~315px */}
        <path d="M308 900 Q313 500 317 0 Q321 500 326 900 Z" />
        <ellipse cx="317" cy="92"  rx="94"  ry="142" />
        <ellipse cx="296" cy="52"  rx="74"  ry="110" />
        <ellipse cx="336" cy="60"  rx="70"  ry="102" />
        {/* Tree at ~625px */}
        <path d="M618 900 Q623 500 627 0 Q631 500 636 900 Z" />
        <ellipse cx="627" cy="98"  rx="98"  ry="140" />
        <ellipse cx="606" cy="56"  rx="76"  ry="114" />
        {/* Tree at ~935px */}
        <path d="M928 900 Q933 500 937 0 Q941 500 946 900 Z" />
        <ellipse cx="937" cy="90"  rx="92"  ry="138" />
        <ellipse cx="956" cy="52"  rx="72"  ry="108" />
        <ellipse cx="918" cy="58"  rx="68"  ry="100" />
        {/* Tree at ~1225px */}
        <path d="M1218 900 Q1223 500 1227 0 Q1231 500 1236 900 Z" />
        <ellipse cx="1227" cy="94" rx="95"  ry="138" />
        <ellipse cx="1246" cy="54" rx="74"  ry="107" />
        {/* Right edge tree */}
        <path d="M1458 900 Q1456 500 1459 0 Q1463 500 1469 900 Z" />
        <ellipse cx="1466" cy="78" rx="80"  ry="122" />
        <ellipse cx="1448" cy="42" rx="60"  ry="88"  />
      </g>
      {/* Creeper vines on near-tree trunks */}
      <g stroke="#000802" strokeWidth="2" fill="none" opacity="0.82" strokeLinecap="round">
        <path d="M-22 200 Q-35 280 -32 380 Q-28 460 -34 540" />
        <path d="M2 180 Q12 260 10 360 Q8 440 14 520" />
        <path d="M308 220 Q295 300 292 400 Q289 478 295 558" />
        <path d="M326 210 Q336 290 340 390 Q343 468 338 548" />
        <path d="M618 225 Q606 305 604 405 Q601 484 607 562" />
        <path d="M636 215 Q648 295 652 395 Q655 474 650 552" />
        <path d="M928 218 Q916 298 914 398 Q911 478 917 556" />
        <path d="M946 208 Q958 288 962 388 Q965 468 960 546" />
      </g>
      {/* Creeper leaves */}
      <g fill="#021606" opacity="0.82">
        <ellipse cx="-33" cy="318" rx="11" ry="7" transform="rotate(-28,-33,318)" />
        <ellipse cx="-31" cy="388" rx="10" ry="6" transform="rotate(22,-31,388)" />
        <ellipse cx="11"  cy="302" rx="11" ry="7" transform="rotate(26,11,302)" />
        <ellipse cx="293" cy="342" rx="11" ry="7" transform="rotate(-26,293,342)" />
        <ellipse cx="291" cy="418" rx="10" ry="6" transform="rotate(20,291,418)" />
        <ellipse cx="340" cy="328" rx="11" ry="7" transform="rotate(24,340,328)" />
        <ellipse cx="604" cy="355" rx="11" ry="7" transform="rotate(-24,604,355)" />
        <ellipse cx="652" cy="338" rx="10" ry="6" transform="rotate(22,652,338)" />
        <ellipse cx="914" cy="348" rx="11" ry="7" transform="rotate(-22,914,348)" />
        <ellipse cx="962" cy="330" rx="10" ry="6" transform="rotate(20,962,330)" />
      </g>
      {/* Buttress roots */}
      <g fill="#000802" opacity="0.9">
        <path d="M312 900 Q300 718 285 536 Q300 678 310 798 Z" />
        <path d="M325 900 Q337 716 349 532 Q336 676 327 796 Z" />
        <path d="M622 900 Q610 716 597 532 Q612 676 620 796 Z" />
        <path d="M634 900 Q646 716 658 532 Q645 676 636 796 Z" />
        <path d="M932 900 Q920 716 907 532 Q922 676 930 796 Z" />
        <path d="M944 900 Q956 716 968 532 Q955 676 946 796 Z" />
      </g>
    </svg>
  );
}

function MonkeyHanging() {
  return (
    <svg width="90" height="115" viewBox="0 0 90 115" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Branch */}
      <path d="M0 12 Q45 8 90 12" stroke="#010903" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Arm left */}
      <path d="M28 35 Q22 22 24 12" stroke="#010903" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Arm right */}
      <path d="M52 35 Q58 22 60 12" stroke="#010903" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Body */}
      <ellipse cx="40" cy="53" rx="16" ry="20" fill="#010903" />
      {/* Head */}
      <circle cx="40" cy="28" r="12" fill="#010903" />
      {/* Ears */}
      <circle cx="28" cy="26" r="5" fill="#010903" />
      <circle cx="52" cy="26" r="5" fill="#010903" />
      {/* Face detail – eye glints */}
      <circle cx="36" cy="25" r="2" fill="#021507" />
      <circle cx="44" cy="25" r="2" fill="#021507" />
      {/* Snout */}
      <ellipse cx="40" cy="31" rx="6" ry="4" fill="#021507" />
      {/* Legs */}
      <path d="M30 70 Q24 88 26 105" stroke="#010903" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M50 70 Q56 88 54 105" stroke="#010903" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Feet */}
      <circle cx="26" cy="107" r="4" fill="#010903" />
      <circle cx="54" cy="107" r="4" fill="#010903" />
      {/* Tail */}
      <path d="M40 70 Q62 88 68 108 Q70 118 62 115" stroke="#010903" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ToucanPerched() {
  return (
    <svg width="96" height="124" viewBox="0 0 96 124" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="toucan-bill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#f5c518" stopOpacity="0.9" />
          <stop offset="35%"  stopColor="#e07a12" stopOpacity="0.9" />
          <stop offset="70%"  stopColor="#c83808" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7a1808" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Branch */}
      <path d="M0 72 Q48 66 96 72" stroke="#010903" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Body */}
      <ellipse cx="46" cy="48" rx="22" ry="26" fill="#010903" />
      {/* Pale throat patch hint */}
      <ellipse cx="46" cy="42" rx="12" ry="14" fill="#021406" opacity="0.45" />
      {/* Head */}
      <circle cx="46" cy="20" r="16" fill="#010903" />
      {/* Large curved toucan bill */}
      <path d="M54 15 Q78 12 90 22 Q93 32 86 40 Q78 47 62 44 Q54 38 52 26 Z" fill="url(#toucan-bill)" />
      {/* Bill ridge */}
      <path d="M54 15 Q78 12 90 22" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" />
      {/* Bill tip hook */}
      <path d="M86 40 Q90 44 86 46 Q80 46 76 43" stroke="rgba(0,0,0,0.25)" strokeWidth="1" fill="none" />
      {/* Eye */}
      <circle cx="50" cy="15" r="3.5" fill="#010a04" />
      <circle cx="50" cy="15" r="1.5" fill="#000401" />
      <circle cx="51" cy="14" r="0.8" fill="#062010" />
      {/* Tail feathers */}
      <path d="M36 72 Q28 92 26 116" stroke="#010903" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M44 73 Q40 94 38 118" stroke="#010903" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M56 72 Q62 92 64 114" stroke="#010903" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* Talons */}
      <path d="M38 70 Q32 74 34 80" stroke="#010903" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 70 Q36 76 40 81" stroke="#010903" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M56 70 Q62 74 60 80" stroke="#010903" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M56 70 Q58 76 54 81" stroke="#010903" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Deer() {
  return (
    <svg width="145" height="130" viewBox="0 0 145 130" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.85 }}>
      {/* Body */}
      <ellipse cx="72" cy="72" rx="42" ry="26" fill="#010803" />
      {/* Neck */}
      <path d="M44 56 Q36 44 38 30" stroke="#010803" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Head */}
      <ellipse cx="30" cy="24" rx="14" ry="11" fill="#010803" transform="rotate(-18,30,24)" />
      {/* Snout */}
      <ellipse cx="20" cy="30" rx="7" ry="5" fill="#010a04" transform="rotate(-12,20,30)" />
      {/* Eye */}
      <circle cx="28" cy="20" r="2" fill="#011204" />
      {/* Ear */}
      <ellipse cx="40" cy="18" rx="5" ry="9" fill="#010803" transform="rotate(-22,40,18)" />
      {/* Antlers */}
      <path d="M32 14 Q28 6 24 1 M24 1 Q20 -2 17 0 M24 1 Q22 -4 26 -7" stroke="#010803" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 13 Q36 5 38 0 M38 0 Q34 -4 30 -3 M38 0 Q40 -5 44 -3" stroke="#010803" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Legs */}
      <line x1="46"  y1="94" x2="42"  y2="128" stroke="#010803" strokeWidth="6" strokeLinecap="round" />
      <line x1="60"  y1="96" x2="58"  y2="130" stroke="#010803" strokeWidth="6" strokeLinecap="round" />
      <line x1="84"  y1="94" x2="82"  y2="128" stroke="#010803" strokeWidth="6" strokeLinecap="round" />
      <line x1="98"  y1="92" x2="98"  y2="126" stroke="#010803" strokeWidth="6" strokeLinecap="round" />
      {/* Tail */}
      <ellipse cx="113" cy="60" rx="8" ry="11" fill="#021208" transform="rotate(18,113,60)" />
      {/* Undergrowth hiding lower body */}
      <path d="M0 108 Q20 95 40 102 Q60 90 80 98 Q100 88 120 96 Q138 90 145 100 L145 130 L0 130 Z" fill="#010603" opacity="0.7" />
    </svg>
  );
}

function DappledLight() {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:6, pointerEvents:'none' }}>
      {[
        { x:18, y:42, w:110, h:55, d:8,  dl:0   },
        { x:38, y:65, w:85,  h:42, d:11, dl:2.5 },
        { x:62, y:35, w:130, h:65, d:9,  dl:4.8 },
        { x:74, y:72, w:90,  h:45, d:10, dl:1.4 },
        { x:28, y:80, w:75,  h:38, d:12, dl:6.2 },
        { x:50, y:55, w:100, h:50, d:7,  dl:3.1 },
      ].map((p,i) => (
        <div key={i} style={{
          position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
          width:`${p.w}px`, height:`${p.h}px`,
          background:'radial-gradient(ellipse 70% 60% at 45% 45%, rgba(245,215,80,0.10) 0%, rgba(230,205,70,0.04) 55%, transparent 80%)',
          borderRadius:'50%', filter:'blur(6px)',
          animation:`dapple-shift ${p.d}s ease-in-out ${p.dl}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function Butterfly({ color, size, delay }: { color: string; size: number; delay: number }) {
  return (
    <svg width={size * 2.2} height={size * 1.6} viewBox="0 0 44 32" fill="none">
      <g style={{ animation:`wing-flap 0.38s ease-in-out ${delay}s infinite` }} >
        {/* Upper left wing */}
        <path d="M22 14 C16 8 6 4 2 8 C-2 12 4 18 22 14Z" fill={color} opacity="0.88" />
        {/* Lower left wing */}
        <path d="M22 16 C14 22 4 26 2 22 C0 18 8 15 22 16Z" fill={color} opacity="0.78" />
      </g>
      <g style={{ animation:`wing-flap 0.38s ease-in-out ${delay + 0.19}s infinite` }}>
        {/* Upper right wing */}
        <path d="M22 14 C28 8 38 4 42 8 C46 12 40 18 22 14Z" fill={color} opacity="0.88" />
        {/* Lower right wing */}
        <path d="M22 16 C30 22 40 26 42 22 C44 18 36 15 22 16Z" fill={color} opacity="0.78" />
      </g>
      {/* Body */}
      <path d="M22 8 L22 26" stroke="rgba(0,0,0,0.55)" strokeWidth="2" strokeLinecap="round" />
      {/* Antennae */}
      <path d="M22 8 Q18 3 16 0" stroke="rgba(0,0,0,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M22 8 Q26 3 28 0" stroke="rgba(0,0,0,0.45)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="0" r="1.5" fill="rgba(0,0,0,0.4)" />
      <circle cx="28" cy="0" r="1.5" fill="rgba(0,0,0,0.4)" />
    </svg>
  );
}

function BirdFlock({ y, count, duration, delay, rtl }: { y:number; count:number; duration:number; delay:number; rtl:boolean }) {
  const spread = 18 + count * 14;
  return (
    <div style={{
      position:'absolute', top:`${y}%`,
      [rtl ? 'right' : 'left']: '-180px',
      animation:`${rtl ? 'birds-fly-left' : 'birds-fly-right'} ${duration}s linear ${delay}s infinite`,
      zIndex:12,
    }}>
      <svg width={spread + 60} height={28} viewBox={`0 0 ${spread + 60} 28`}>
        {Array.from({ length: count }, (_,i) => {
          const x = 10 + (i / Math.max(count - 1, 1)) * spread;
          const vy = 10 + Math.sin(i * 1.4 + 0.6) * 5;
          return (
            <g key={i} transform={`translate(${x},${vy})`}>
              <path d="M0,0 C-4,-3 -8,-1.5 -10,0 M0,0 C4,-3 8,-1.5 10,0"
                stroke="#000d02" strokeWidth="1.8" fill="none" strokeLinecap="round"
                style={{ animation:`wing-flap ${0.5 + i * 0.06}s ease-in-out ${i * 0.1}s infinite` }} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Foreground() {
  return (
    <svg viewBox="0 0 1440 400" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', display:'block' }} preserveAspectRatio="xMidYMax slice">
      {/* Left bank */}
      <path d="M0,400 L0,195 C25,178 58,206 88,188 C118,170 145,200 172,182 C200,164 225,196 250,178 C270,162 288,192 308,178 L308,400 Z" fill="#000601" />
      {/* Right bank */}
      <path d="M1440,400 L1440,195 C1415,178 1382,206 1352,188 C1322,170 1295,200 1268,182 C1240,164 1215,196 1190,178 C1170,162 1152,192 1132,178 L1132,400 Z" fill="#000601" />
      {/* Large fern fronds – left */}
      <g fill="#010803" opacity="0.93">
        <path d="M40 220 Q10 195 -15 180 Q5 200 35 220Z" />
        <path d="M50 215 Q30 185 18 165 Q32 190 52 215Z" />
        <path d="M60 225 Q55 195 62 168 Q60 195 64 225Z" />
        <path d="M40 230 Q5 215 -20 205 Q5 218 38 232Z" />
        <path d="M30 240 Q-5 230 -25 225 Q-2 232 28 242Z" />
        <ellipse cx="75"  cy="198" rx="82"  ry="58"  transform="rotate(-18,75,198)"  />
        <ellipse cx="22"  cy="226" rx="65"  ry="48"  transform="rotate(-25,22,226)"  />
        <ellipse cx="148" cy="185" rx="70"  ry="48"  transform="rotate(-12,148,185)" />
        <ellipse cx="-10" cy="255" rx="55"  ry="40"  transform="rotate(-30,-10,255)" />
      </g>
      {/* Large fern fronds – right */}
      <g fill="#010803" opacity="0.93">
        <path d="M1400 220 Q1430 195 1455 180 Q1435 200 1405 220Z" />
        <path d="M1390 215 Q1410 185 1422 165 Q1408 190 1388 215Z" />
        <path d="M1380 225 Q1385 195 1378 168 Q1380 195 1376 225Z" />
        <path d="M1400 230 Q1435 215 1460 205 Q1435 218 1402 232Z" />
        <ellipse cx="1365" cy="198" rx="82"  ry="58"  transform="rotate(18,1365,198)"  />
        <ellipse cx="1418" cy="226" rx="65"  ry="48"  transform="rotate(25,1418,226)"  />
        <ellipse cx="1292" cy="185" rx="70"  ry="48"  transform="rotate(12,1292,185)"  />
        <ellipse cx="1450" cy="255" rx="55"  ry="40"  transform="rotate(30,1450,255)"  />
      </g>
      {/* Ground cover plants */}
      <path d="M0,400 L0,340 C55,322 110,348 165,332 C220,316 275,344 330,330 C430,314 530,336 630,322 C730,308 830,332 930,318 C1030,304 1130,328 1230,315 C1308,305 1374,322 1440,312 L1440,400 Z" fill="#000501" opacity="0.95" />
      {/* Small flowering plants along ground */}
      <g fill="#011005" opacity="0.82">
        <circle cx="180" cy="330" r="4" />
        <circle cx="195" cy="325" r="3" />
        <circle cx="190" cy="318" r="3.5" />
        <circle cx="820" cy="322" r="4" />
        <circle cx="835" cy="316" r="3" />
        <circle cx="828" cy="308" r="3.5" />
        <circle cx="1260" cy="318" r="4" />
        <circle cx="1275" cy="312" r="3" />
      </g>
    </svg>
  );
}

function CornerFerns() {
  return (
    <>
      {/* Top-left fern cluster */}
      <div className="leaf-animate" style={{ position:'absolute', left:'-8px', top:'-10px', opacity:0.88 }}>
        <TropicalLeaf size={148} />
      </div>
      <div className="leaf-animate-alt" style={{ position:'absolute', left:'85px', top:'-32px', opacity:0.58, transform:'rotate(24deg)' }}>
        <TropicalLeaf size={92} />
      </div>
      <div style={{ position:'absolute', left:'32px', top:'65px', opacity:0.45,
        animation:'leaf-sway 6s ease-in-out 1.5s infinite', transformOrigin:'bottom center' }}>
        <TropicalLeaf size={68} />
      </div>
      {/* Top-right fern cluster */}
      <div className="leaf-animate-alt" style={{ position:'absolute', right:'-8px', top:'-10px', opacity:0.88, transform:'scaleX(-1)' }}>
        <TropicalLeaf size={148} />
      </div>
      <div className="leaf-animate" style={{ position:'absolute', right:'85px', top:'-32px', opacity:0.58, transform:'rotate(-24deg) scaleX(-1)' }}>
        <TropicalLeaf size={92} />
      </div>
      <div style={{ position:'absolute', right:'32px', top:'65px', opacity:0.45,
        animation:'leaf-sway-alt 5.8s ease-in-out 2s infinite', transformOrigin:'bottom center' }}>
        <TropicalLeaf size={68} />
      </div>
    </>
  );
}

function TropicalLeaf({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 70 108" fill="none">
      <path d="M35 104C35 104 3 70 6 38C9 8 35 2 35 2C35 2 61 8 64 38C67 70 35 104 35 104Z" fill="#1a6636" opacity="0.82" />
      <path d="M35 104C35 104 3 70 6 38C9 8 35 2 35 2" stroke="#0a1e10" strokeWidth="1.2" fill="none" opacity="0.38" />
      <line x1="35" y1="2" x2="35" y2="104" stroke="#0a1e10" strokeWidth="1.6" opacity="0.22" />
      <path d="M35 52 C35 52 20 45 18 33" stroke="#0a1e10" strokeWidth="0.9" fill="none" opacity="0.28" />
      <path d="M35 65 C35 65 50 58 52 46" stroke="#0a1e10" strokeWidth="0.9" fill="none" opacity="0.28" />
      <path d="M35 78 C35 78 22 72 21 64" stroke="#0a1e10" strokeWidth="0.8" fill="none" opacity="0.22" />
    </svg>
  );
}

function Tiger() {
  return (
    <svg width="170" height="96" viewBox="0 0 170 96" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ animation:'tiger-breathe 4s ease-in-out infinite', opacity:0.92 }}>
      {/* Haunches / rear body */}
      <ellipse cx="128" cy="58" rx="26" ry="22" fill="#06250e" />
      {/* Main body – crouching low */}
      <ellipse cx="82" cy="62" rx="52" ry="20" fill="#071e0c" />
      {/* Neck */}
      <path d="M44 56 Q36 42 38 28" stroke="#071e0c" strokeWidth="15" strokeLinecap="round" fill="none" />
      {/* Head */}
      <ellipse cx="30" cy="24" rx="22" ry="17" fill="#07200d" />
      {/* Ears */}
      <path d="M22 12 Q18 3 22 -1 Q28 5 26 12 Z" fill="#06250e" />
      <path d="M37 10 Q42 1 46 4 Q44 11 38 12 Z" fill="#06250e" />
      {/* Snout / muzzle */}
      <ellipse cx="19" cy="28" rx="11" ry="8" fill="#0a2e12" />
      {/* Eyes — amber gleam */}
      <circle cx="24" cy="19" r="3.2" fill="#1a5c22" />
      <circle cx="24" cy="19" r="1.4" fill="#2d8a36" />
      <circle cx="36" cy="18" r="3.2" fill="#1a5c22" />
      <circle cx="36" cy="18" r="1.4" fill="#2d8a36" />
      {/* Tiger stripe markings — visibly darker */}
      <path d="M56 44 Q58 56 56 66" stroke="#020e04" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M70 40 Q72 54 70 68" stroke="#020e04" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.72" />
      <path d="M84 40 Q86 56 84 68" stroke="#020e04" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.70" />
      <path d="M98 42 Q100 56 98 66" stroke="#020e04" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.68" />
      <path d="M112 44 Q114 56 112 64" stroke="#020e04" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.62" />
      {/* Front legs */}
      <path d="M38 74 Q34 84 36 93" stroke="#071e0c" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M52 76 Q50 86 52 93" stroke="#071e0c" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Back legs */}
      <path d="M114 76 Q116 86 114 93" stroke="#071e0c" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M130 74 Q134 84 132 93" stroke="#071e0c" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Tail curling up */}
      <path d="M150 56 Q164 46 162 58 Q160 70 150 72" stroke="#06250e" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Undergrowth hiding legs */}
      <path d="M0 80 Q22 70 44 78 Q66 68 88 76 Q110 66 132 74 Q152 68 170 76 L170 96 L0 96 Z" fill="#010603" opacity="0.82" />
    </svg>
  );
}

function Elephant() {
  return (
    <svg width="230" height="168" viewBox="0 0 230 168" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ opacity:0.75 }}>
      {/* Body — massive silhouette */}
      <ellipse cx="126" cy="104" rx="78" ry="54" fill="#062010" />
      {/* Head */}
      <ellipse cx="44" cy="80" rx="40" ry="36" fill="#062010" />
      {/* Large ear */}
      <ellipse cx="18" cy="72" rx="24" ry="32" fill="#051c0e" transform="rotate(-8,18,72)" />
      {/* Trunk curving down */}
      <path d="M26 98 Q12 118 10 136 Q8 150 18 152 Q26 152 28 142" stroke="#062010" strokeWidth="13" strokeLinecap="round" fill="none" />
      {/* Tusk */}
      <path d="M32 100 Q22 114 30 122" stroke="#1a4a28" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Eye */}
      <circle cx="38" cy="70" r="3.5" fill="#1a5c28" />
      <circle cx="38" cy="70" r="1.5" fill="#2d8a44" />
      {/* Legs */}
      <rect x="66"  y="150" width="20" height="18" rx="5" fill="#062010" />
      <rect x="94"  y="150" width="20" height="18" rx="5" fill="#062010" />
      <rect x="136" y="150" width="20" height="18" rx="5" fill="#062010" />
      <rect x="164" y="150" width="20" height="18" rx="5" fill="#062010" />
      {/* Tail */}
      <path d="M200 108 Q216 120 212 138" stroke="#062010" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Undergrowth */}
      <path d="M0 148 Q32 136 64 144 Q96 134 128 142 Q160 134 192 142 Q212 136 230 144 L230 168 L0 168 Z" fill="#010603" opacity="0.75" />
    </svg>
  );
}

function BambooGrove() {
  const culms = [
    { x:8,   lean:-3, h:380, seed:1 },
    { x:34,  lean:2,  h:420, seed:2 },
    { x:62,  lean:-4, h:355, seed:3 },
    { x:88,  lean:1,  h:440, seed:4 },
    { x:114, lean:-2, h:395, seed:5 },
    { x:140, lean:3,  h:415, seed:6 },
    { x:164, lean:-1, h:365, seed:7 },
  ];
  return (
    <svg width="196" height="460" viewBox="0 0 196 460" fill="none" xmlns="http://www.w3.org/2000/svg">
      {culms.map((c, i) => {
        const topY = 460 - c.h;
        const nodeCount = Math.floor((c.h - 40) / 58);
        const w = 10 + (i % 3);
        return (
          <g key={i} style={{ transformOrigin:`${c.x + w/2}px 460px`, animation:`bamboo-sway 7s ease-in-out ${i * 0.5}s infinite` }}>
            {/* Culm body */}
            <rect x={c.x} y={topY} width={w} height={c.h} fill="#020e04" rx="1" />
            {/* Subtle taper — darker overlay at top */}
            <rect x={c.x + 1} y={topY} width={w - 2} height={c.h * 0.4} fill="#010a03" rx="1" opacity="0.3" />
            {/* Node rings */}
            {Array.from({ length: nodeCount }, (_, j) => {
              const ny = 460 - 40 - j * 58;
              return (
                <ellipse key={j} cx={c.x + w/2} cy={ny} rx={w/2 + 2.5} ry="2.8" fill="#031608" />
              );
            })}
            {/* Leaf cluster at top */}
            <path d={`M${c.x + w/2} ${topY + 16} Q${c.x - 18} ${topY + 2} ${c.x - 22} ${topY + 14}`}
              stroke="#031608" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d={`M${c.x + w/2} ${topY + 16} Q${c.x + w + 20} ${topY} ${c.x + w + 25} ${topY + 12}`}
              stroke="#031608" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d={`M${c.x + w/2} ${topY + 26} Q${c.x - 12} ${topY + 16} ${c.x - 14} ${topY + 28}`}
              stroke="#031608" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d={`M${c.x + w/2} ${topY + 26} Q${c.x + w + 14} ${topY + 16} ${c.x + w + 16} ${topY + 28}`}
              stroke="#031608" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Mid leaf pairs */}
            {nodeCount > 2 && (
              <>
                <path d={`M${c.x + w/2} ${460 - 40 - 58} Q${c.x - 16} ${460 - 54 - 58} ${c.x - 19} ${460 - 44 - 58}`}
                  stroke="#031608" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                <path d={`M${c.x + w/2} ${460 - 40 - 58} Q${c.x + w + 17} ${460 - 56 - 58} ${c.x + w + 20} ${460 - 46 - 58}`}
                  stroke="#031608" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function WaterfallLeft() {
  return (
    <svg viewBox="0 0 200 560" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }} preserveAspectRatio="xMidYMin meet">
      <defs>
        <linearGradient id="wfl-s1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(215,245,235,0.0)" />
          <stop offset="10%"  stopColor="rgba(220,248,238,0.75)" />
          <stop offset="88%"  stopColor="rgba(200,240,228,0.65)" />
          <stop offset="100%" stopColor="rgba(180,230,215,0.0)" />
        </linearGradient>
        <linearGradient id="wfl-s2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(235,252,248,0.0)" />
          <stop offset="12%"  stopColor="rgba(240,252,248,0.82)" />
          <stop offset="85%"  stopColor="rgba(220,244,236,0.70)" />
          <stop offset="100%" stopColor="rgba(200,236,226,0.0)" />
        </linearGradient>
        <clipPath id="wfl-clip">
          <path d="M82,0 L118,0 L115,30 L110,90 L106,190 L103,310 L101,430 L99,560 L88,560 L86,430 L84,310 L81,190 L77,90 L73,30 Z" />
        </clipPath>
        <radialGradient id="wfl-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(70,170,145,0.40)" />
          <stop offset="60%"  stopColor="rgba(50,140,120,0.22)" />
          <stop offset="100%" stopColor="rgba(30,110,90,0.0)" />
        </radialGradient>
      </defs>

      {/* Rocky cliff — different profile than right waterfall */}
      <path d="M58,0 L142,0 L150,42 L156,105 L152,208 L146,332 L140,462 L132,560 L68,560 L60,462 L54,332 L48,208 L44,105 L50,42 Z" fill="#0b1c09" />
      {/* Rock texture */}
      <g stroke="#090c06" strokeWidth="1.2" fill="none" opacity="0.55">
        <path d="M64,72 Q94,62 122,72 Q138,78 148,68" />
        <path d="M60,158 Q88,146 116,156 Q132,162 144,152" />
        <path d="M56,272 Q84,260 112,270 Q128,276 140,266" />
        <path d="M54,392 Q82,380 110,390 Q126,396 138,384" />
      </g>
      {/* Moss patches */}
      <g fill="#0c2809" opacity="0.62">
        <ellipse cx="70"  cy="90"  rx="10" ry="6" />
        <ellipse cx="130" cy="132" rx="9"  ry="5" />
        <ellipse cx="66"  cy="238" rx="12" ry="7" />
        <ellipse cx="133" cy="330" rx="10" ry="6" />
      </g>

      {/* Waterfall streams */}
      <g clipPath="url(#wfl-clip)">
        <rect x="82"  y="-560" width="5" height="1120" fill="url(#wfl-s1)" style={{ animation:'wf-flow 1.25s linear 0.1s infinite' }} />
        <rect x="90"  y="-560" width="7" height="1120" fill="url(#wfl-s2)" style={{ animation:'wf-flow 0.92s linear 0.32s infinite' }} />
        <rect x="100" y="-560" width="5" height="1120" fill="url(#wfl-s1)" style={{ animation:'wf-flow 1.08s linear 0.55s infinite' }} />
        <rect x="108" y="-560" width="4" height="1120" fill="url(#wfl-s2)" style={{ animation:'wf-flow 1.35s linear 0.18s infinite' }} />
        {/* Froth */}
        <rect x="94" y="-560" width="2.5" height="1120" fill="rgba(255,255,255,0.28)" style={{ animation:'wf-flow 0.78s linear 0.22s infinite' }} />
      </g>

      {/* Mist at base */}
      <ellipse cx="100" cy="534" rx="50" ry="17" fill="rgba(195,240,225,0.16)" style={{ animation:'wf-mist 2.5s ease-in-out 0.2s infinite alternate' }} />
      <ellipse cx="100" cy="528" rx="38" ry="12" fill="rgba(215,245,232,0.12)" style={{ animation:'wf-mist 3.1s ease-in-out 0.7s infinite alternate' }} />
      {/* Pool */}
      <ellipse cx="100" cy="548" rx="54" ry="17" fill="url(#wfl-pool)" />
      <ellipse cx="100" cy="550" rx="36" ry="11" fill="rgba(90,180,158,0.18)" style={{ animation:'pool-ripple 3.4s ease-in-out 0.5s infinite' }} />

      {/* Vegetation flanking */}
      <g fill="#031808" opacity="0.90">
        <ellipse cx="60"  cy="148" rx="26" ry="36" />
        <ellipse cx="140" cy="128" rx="24" ry="32" />
        <ellipse cx="56"  cy="302" rx="30" ry="38" />
        <ellipse cx="142" cy="322" rx="28" ry="34" />
        <ellipse cx="58"  cy="464" rx="32" ry="38" />
        <ellipse cx="140" cy="480" rx="28" ry="34" />
      </g>
    </svg>
  );
}
