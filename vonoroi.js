const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

const n_territory = 10;
let list_terr = [];

let drag_index=-1;
let mouse_x;
let mouse_y;

canvas.addEventListener('mousedown', set_drag_index);
canvas.addEventListener('mouseup',() => {drag_index=-1});
canvas.addEventListener('mousemove', (e) => moved_mouse(e.clientX,e.clientY));

for (let i = 0; i < n_territory; i++) {
  list_terr.push({
    index: i,
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    color: '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
  });
}

const rgb = list_terr.map(t => ({
  r: parseInt(t.color.slice(1, 3), 16),
  g: parseInt(t.color.slice(3, 5), 16),
  b: parseInt(t.color.slice(5, 7), 16),
}));


function set_drag_index(){
  for(let t=0; t<n_territory; t++){
    const dx = mouse_x - list_terr[t].x;
    const dy = mouse_y - list_terr[t].y;
    const dist2 = dx*dx + dy*dy;
    if(dist2 <= 16*16){
      drag_index=t;
      console.log(drag_index);
      return;
    }
  }
}

function moved_mouse(x,y){
  mouse_x = x;
  mouse_y = y;
  if (drag_index==-1) return;
  list_terr[drag_index].x = mouse_x;
  list_terr[drag_index].y = mouse_y;
}

function draw() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  // Draw Voronoi regions
  for (let j = 0; j < canvas.height; j++) {
    for (let i = 0; i < canvas.width; i++) {
      let minDist = Infinity;
      let minIndex = 0;

      for (let t = 0; t < n_territory; t++) {
        const dx = i - list_terr[t].x;
        const dy = j - list_terr[t].y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < minDist) {
          minDist = dist2;
          minIndex = t;
        }
      }

      const idx = (j * canvas.width + i) * 4;
      data[idx]     = rgb[minIndex].r;
      data[idx + 1] = rgb[minIndex].g;
      data[idx + 2] = rgb[minIndex].b;
      data[idx + 3] = 255;
    }
  }

  // Draw center dots directly into ImageData
  const radius = 8;
  for (let t = 0; t < n_territory; t++) {
    const cx = Math.round(list_terr[t].x);
    const cy = Math.round(list_terr[t].y);
    const r = rgb[t];

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const px = cx + dx;
          const py = cy + dy;
          if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
            const idx = (py * canvas.width + px) * 4;
            data[idx]     = Math.floor(r.r * 0.4);
            data[idx + 1] = Math.floor(r.g * 0.4);
            data[idx + 2] = Math.floor(r.b * 0.4);
            data[idx + 3] = 255;
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  requestAnimationFrame(draw);
}

draw();