(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'scene3d-background';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) { canvas.remove(); return; }
  const otecEmblem = new Image();
  otecEmblem.src = 'images/otech-emblem-background.png';

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let scrollY = window.scrollY;
  let scrollKick = 0;
  let lastScroll = window.scrollY;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let lastFrame = 0;
  let sceneTime = 0;
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
  if (saveData || mobile || lowPower) { canvas.remove(); return; }
  const focal = 760;

  const makeStars = () => Array.from({ length: mobile ? 42 : 84 }, () => ({
    x: Math.random(), y: Math.random(), z: 100 + Math.random() * 900,
    radius: .7 + Math.random() * 1.6,
    phase: Math.random() * Math.PI * 2
  }));

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = makeStars();
  };

  const rotate = (point, yaw, pitch, roll = 0) => {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const cr = Math.cos(roll), sr = Math.sin(roll);
    const x = point.x * cy + point.z * sy;
    const z = -point.x * sy + point.z * cy;
    const y = point.y * cp - z * sp;
    const z2 = point.y * sp + z * cp;
    return { x: x * cr - y * sr, y: x * sr + y * cr, z: z2 };
  };

  const project = (point, cx, cy, scale) => {
    const perspective = focal / (focal + point.z);
    return { x: cx + point.x * perspective * scale, y: cy + point.y * perspective * scale, p: perspective };
  };

  const spherePoint = (lat, lon, radius) => ({
    x: radius * Math.cos(lat) * Math.cos(lon),
    y: radius * Math.sin(lat),
    z: radius * Math.cos(lat) * Math.sin(lon)
  });

  const drawSphere = (cx, cy, radius, yaw, pitch, opacity = 1) => {
    const latitudes = mobile ? 7 : 11;
    const longitudes = mobile ? 18 : 28;
    const transform = point => project(rotate(point, yaw, pitch, -.12), cx, cy, 1);

    const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius * 1.25);
    glow.addColorStop(0, `rgba(57,155,160,${.13 * opacity})`);
    glow.addColorStop(.55, `rgba(215,154,80,${.045 * opacity})`);
    glow.addColorStop(1, 'rgba(22,123,131,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 1;
    for (let row = 1; row < latitudes; row++) {
      const lat = -Math.PI / 2 + Math.PI * row / latitudes;
      ctx.beginPath();
      for (let i = 0; i <= longitudes; i++) {
        const q = transform(spherePoint(lat, Math.PI * 2 * i / longitudes, radius));
        if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      }
      ctx.strokeStyle = row === Math.floor(latitudes / 2) ? 'rgba(215,154,80,.52)' : 'rgba(22,123,131,.33)';
      ctx.stroke();
    }
    for (let column = 0; column < longitudes; column += 2) {
      ctx.beginPath();
      for (let i = 0; i <= latitudes * 2; i++) {
        const lat = -Math.PI / 2 + Math.PI * i / (latitudes * 2);
        const q = transform(spherePoint(lat, Math.PI * 2 * column / longitudes, radius));
        if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      }
      ctx.strokeStyle = 'rgba(14,52,69,.26)';
      ctx.stroke();
    }
    for (let i = 0; i < 32; i++) {
      const q = transform(spherePoint(0, Math.PI * 2 * i / 32, radius));
      ctx.fillStyle = i % 4 === 0 ? 'rgba(215,154,80,.8)' : 'rgba(22,123,131,.62)';
      ctx.beginPath();
      ctx.arc(q.x, q.y, i % 4 === 0 ? 2.1 : 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // An inclined orbital ring gives the globe a second visible depth plane.
    ctx.save();
    ctx.globalAlpha = opacity * .7;
    ctx.beginPath();
    for (let i = 0; i <= 90; i++) {
      const t = Math.PI * 2 * i / 90;
      const p = rotate({ x: Math.cos(t) * radius * 1.3, y: Math.sin(t) * radius * .42, z: 0 }, yaw * .35, .88 + pitch * .2, -.32);
      const q = project(p, cx, cy, 1);
      if (!i) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(215,154,80,.53)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  };

  const drawCube = (cx, cy, radius, yaw, pitch, opacity = 1) => {
    const points = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
      points.push(project(rotate({ x:x*radius, y:y*radius, z:z*radius }, yaw, pitch, yaw*.22), cx, cy, 1));
    }
    const edges = [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]];
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(22,123,131,.42)';
    edges.forEach(([a,b], i) => {
      ctx.beginPath(); ctx.moveTo(points[a].x, points[a].y); ctx.lineTo(points[b].x, points[b].y); ctx.stroke();
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(215,154,80,.82)';
        ctx.beginPath(); ctx.arc(points[a].x, points[a].y, 2.2, 0, Math.PI*2); ctx.fill();
      }
    });
    ctx.restore();
  };

  const drawChip = (cx, cy, radius, yaw, pitch, opacity = 1, label = 'ECS') => {
    const transform = point => project(rotate(point, yaw, pitch, -.14), cx, cy, 1);
    const face = [
      {x:-radius,y:-radius,z:0},{x:radius,y:-radius,z:0},
      {x:radius,y:radius,z:0},{x:-radius,y:radius,z:0}
    ].map(transform);
    const back = [
      {x:-radius,y:-radius,z:-22},{x:radius,y:-radius,z:-22},
      {x:radius,y:radius,z:-22},{x:-radius,y:radius,z:-22}
    ].map(transform);

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.lineJoin = 'round';
    // A visible extruded package, its four chip sides, and a glowing die surface.
    for (let i = 0; i < 4; i++) {
      const next = (i+1)%4;
      ctx.beginPath();
      ctx.moveTo(face[i].x,face[i].y); ctx.lineTo(face[next].x,face[next].y);
      ctx.lineTo(back[next].x,back[next].y); ctx.lineTo(back[i].x,back[i].y);
      ctx.closePath();
      ctx.fillStyle = i%2 ? 'rgba(14,82,92,.25)' : 'rgba(215,154,80,.14)';
      ctx.fill(); ctx.strokeStyle = 'rgba(14,91,103,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    ctx.beginPath(); face.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.closePath();
    ctx.fillStyle = 'rgba(211,240,233,.34)'; ctx.fill();
    ctx.strokeStyle = 'rgba(12,94,102,.9)'; ctx.lineWidth = 1.8; ctx.stroke();

    // Inner silicon die with a visible pin grid.
    const dieRadius = radius*.55;
    const die = [
      {x:-dieRadius,y:-dieRadius,z:2},{x:dieRadius,y:-dieRadius,z:2},
      {x:dieRadius,y:dieRadius,z:2},{x:-dieRadius,y:dieRadius,z:2}
    ].map(transform);
    ctx.beginPath(); die.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.closePath();
    ctx.fillStyle = 'rgba(230,246,238,.5)'; ctx.fill();
    ctx.strokeStyle = 'rgba(22,123,131,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
    const padCount = 6;
    for (let i=0;i<padCount;i++) {
      const v = -dieRadius*.72 + i*(dieRadius*1.44/(padCount-1));
      for (const side of [-1,1]) {
        const top = transform({x:v,y:side*dieRadius*.86,z:4});
        const left = transform({x:side*dieRadius*.86,y:v,z:4});
        ctx.fillStyle = 'rgba(215,154,80,.9)';
        ctx.fillRect(top.x-2,top.y-2,4,4); ctx.fillRect(left.x-2,left.y-2,4,4);
      }
    }

    // Gull-wing package pins with right-angle PCB traces and terminal nodes.
    const pinCount = mobile ? 5 : 7;
    for (let i=0;i<pinCount;i++) {
      const u = -radius*.68 + i*(radius*1.36/(pinCount-1));
      for (const side of [-1,1]) {
        const routes = [
          [{x:u,y:side*radius,z:0},{x:u,y:side*(radius+18),z:0},{x:u+Math.sign(u||1)*14,y:side*(radius+28),z:0}],
          [{x:side*radius,y:u,z:0},{x:side*(radius+18),y:u,z:0},{x:side*(radius+28),y:u+Math.sign(u||1)*14,z:0}]
        ];
        routes.forEach(route => {
          const pts = route.map(transform);
          ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
          ctx.strokeStyle = 'rgba(12,102,113,.78)'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.fillStyle = 'rgba(215,154,80,.94)'; ctx.beginPath(); ctx.arc(pts[2].x,pts[2].y,2.5,0,Math.PI*2); ctx.fill();
        });
      }
    }

    // Label stays crisp and legible while the package rotates in 3D.
    const center = transform({x:0,y:0,z:7});
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(8,57,69,.92)'; ctx.font = `700 ${Math.max(13,radius*.19)}px Manrope, sans-serif`;
    ctx.fillText(label,center.x,center.y-6);
    ctx.fillStyle = 'rgba(14,82,92,.78)'; ctx.font = `600 ${Math.max(7,radius*.07)}px "DM Mono", monospace`;
    ctx.fillText('VLSI  ·  FPGA  ·  IoT',center.x,center.y+radius*.13);

    // Signal orbit and small satellite nodes distinguish the chip from a generic cube.
    ctx.beginPath();
    for(let i=0;i<=100;i++){
      const t=Math.PI*2*i/100;
      const p=transform({x:Math.cos(t)*radius*1.58,y:Math.sin(t)*radius*.48,z:Math.sin(t*2)*8});
      if(!i)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
    }
    ctx.strokeStyle='rgba(215,154,80,.7)'; ctx.lineWidth=1.4; ctx.stroke();
    for(let i=0;i<4;i++){
      const t=i*Math.PI*.5+sceneTime*.9;
      const p=transform({x:Math.cos(t)*radius*1.58,y:Math.sin(t)*radius*.48,z:0});
      ctx.fillStyle=i%2?'rgba(22,123,131,.95)':'rgba(215,154,80,.98)';
      ctx.beginPath();ctx.arc(p.x,p.y,3.4,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  };

  const drawSignal = (y, scroll, time, opacity = 1) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    const amplitude = mobile ? 15 : 28;
    const shift = (time*58 + scroll*.22) % 150;
    for(let lane=0;lane<2;lane++){
      ctx.beginPath();
      for(let x=-20;x<=width+20;x+=4){
        const phase=(x+shift+lane*44)/110;
        const yy=y + lane*13 + Math.sin(phase)*amplitude + Math.sin(phase*.42)*amplitude*.35;
        if(x===-20)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
      }
      ctx.strokeStyle=lane?'rgba(215,154,80,.58)':'rgba(15,123,132,.68)';
      ctx.lineWidth=lane?1.1:1.5;
      ctx.setLineDash(lane?[5,8]:[]);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for(let i=0;i<7;i++){
      const x=((i*width/6 + shift*1.3)%(width+24))-12;
      const phase=(x+shift)/110;
      const yy=y+Math.sin(phase)*amplitude+Math.sin(phase*.42)*amplitude*.35;
      ctx.fillStyle=i%3?'rgba(15,123,132,.8)':'rgba(215,154,80,.95)';
      ctx.beginPath();ctx.arc(x,yy,2.7,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  };

  const drawOtecEmblem = (scroll, time) => {
    if (!otecEmblem.complete || !otecEmblem.naturalWidth) return;
    const size = mobile ? Math.min(width*.56,250) : Math.min(width*.34,390);
    const travel = height + size*1.8;
    const y = ((height*.2 - scroll*.24) % travel + travel) % travel - size*.36;
    const drift = .5 + .5*Math.sin(time*.28 + scroll*.0007);
    const x = width*(.2 + .6*drift) + pointerX*12;
    const yaw = Math.sin(time*.38 + scroll*.001)*.36;
    const roll = Math.sin(time*.24 + scroll*.0008)*.045;

    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(roll);
    ctx.transform(Math.cos(yaw),0,Math.sin(yaw)*.12,1,0,0);
    ctx.globalAlpha = mobile ? .72 : .84;

    // Moving signal orbit marks this as a live department emblem in the scene.
    ctx.beginPath();
    ctx.ellipse(0,0,size*.56,size*.47,Math.sin(time*.18)*.16,0,Math.PI*2);
    ctx.strokeStyle = 'rgba(22,123,131,.52)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([7,10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // The supplied O-TEC brain/circuit/monitor mark remains intact and readable.
    ctx.drawImage(otecEmblem,-size/2,-size/2,size,size);

    const pulse = .62 + Math.sin(time*1.6)*.2;
    ctx.fillStyle = `rgba(22,123,131,${pulse})`;
    ctx.beginPath(); ctx.arc(size*.48,Math.sin(time)*size*.13,3.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  };

  const render = timestamp => {
    frame = requestAnimationFrame(render);
    if (document.hidden || timestamp - lastFrame < 30) return;
    lastFrame = timestamp;
    const time = timestamp * .00022;
    sceneTime = time;
    const scrollFactor = scrollY * .00125;
    scrollKick *= .94;
    ctx.clearRect(0, 0, width, height);

    // Moving point field: perspective scaling and parallax provide the scroll depth.
    const projectedStars = [];
    for (const star of stars) {
      const p = rotate({
        x:(star.x-.5)*width,
        y:(star.y-.5)*height + scrollY*.13,
        z:star.z
      }, Math.sin(time*.4)*.08 + pointerX*.018, Math.cos(time*.3)*.06, 0);
      const q = project(p, width/2, height/2, 1);
      const wrapY = ((q.y % (height+30)) + (height+30)) % (height+30) - 15;
      projectedStars.push({x:q.x,y:wrapY,z:star.z,r:star.radius*q.p,phase:star.phase});
    }
    for (let i = 0; i < projectedStars.length; i++) {
      const a = projectedStars[i];
      for (let j = i + 1; j < projectedStars.length; j++) {
        const b = projectedStars[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist2 = dx*dx+dy*dy;
        if (dist2 < (mobile ? 62 : 108)**2 && Math.abs(a.z-b.z) < 240) {
          const alpha = (1 - Math.sqrt(dist2)/(mobile?62:108)) * .23;
          ctx.strokeStyle = `rgba(22,123,131,${alpha})`;
          ctx.lineWidth = .7;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
      const pulse = .62 + Math.sin(time*2 + a.phase)*.25;
      ctx.fillStyle = `rgba(14,52,69,${pulse})`;
      ctx.beginPath(); ctx.arc(a.x,a.y,Math.max(.7,a.r),0,Math.PI*2); ctx.fill();
    }

    // Repeat the main globe vertically so it drifts through the page as the reader scrolls.
    const radius = Math.min(width*.17, mobile ? 112 : 162);
    const travel = height + radius*3;
    const baseY = ((height*.35 - scrollY*.20) % travel + travel) % travel - radius;
    const centerX = width * .76 + pointerX*17;
    drawChip(centerX, baseY, radius, time + scrollFactor + scrollKick*.2, .2 + Math.sin(time*.8)*.1, .98, 'ECS');
    drawChip(width*.13 - pointerX*10, ((height*.72-scrollY*.14)%(height+radius*2)+(height+radius*2))%(height+radius*2)-radius, radius*.56, -time*.65-scrollFactor*.35, .34, .74, 'IoT');
    drawSignal(height*.82 - (scrollY*.10 % (height*.55)), scrollY, time, .85);
    drawOtecEmblem(scrollY,time);

    // Scroll and cursor gently bend the orbit field rather than moving the page itself.
    const ambient = ctx.createRadialGradient(width*.50,height*.5,0,width*.50,height*.5,Math.max(width,height)*.8);
    ambient.addColorStop(0,'rgba(22,123,131,.035)');
    ambient.addColorStop(1,'rgba(22,123,131,0)');
    ctx.fillStyle = ambient;
    ctx.fillRect(0,0,width,height);
  };

  window.addEventListener('resize', resize, { passive:true });
  window.addEventListener('scroll', () => {
    const next = window.scrollY;
    scrollKick = Math.min(2.5, scrollKick + Math.abs(next-lastScroll)*.003);
    lastScroll = next;
    scrollY = next;
  }, { passive:true });
  window.addEventListener('pointermove', event => {
    pointerX = (event.clientX / Math.max(width,1) - .5) * 2;
    pointerY = (event.clientY / Math.max(height,1) - .5) * 2;
  }, { passive:true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else { lastFrame = 0; frame = requestAnimationFrame(render); }
  });

  resize();
  frame = requestAnimationFrame(render);
})();
