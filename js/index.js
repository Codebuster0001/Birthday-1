// Polyfill for requestAnimationFrame
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         function (callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

// Basic Variables
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    cw = window.innerWidth,
    ch = window.innerHeight,
    fireworks = [],
    particles = [],
    hue = 120,
    limiterTotal = 5,
    limiterTick = 0,
    timerTotal = 80,
    timerTick = 0,
    mousedown = false,
    mx = 0,
    my = 0;

// Set Canvas Dimensions
function resizeCanvas() {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Utility Functions
function random(min, max) {
  return Math.random() * (max - min) + min;
}

function calculateDistance(p1x, p1y, p2x, p2y) {
  var xDistance = p1x - p2x,
      yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// Firework Constructor and Methods
function Firework(sx, sy, tx, ty) {
  this.x = sx;
  this.y = sy;
  this.sx = sx;
  this.sy = sy;
  this.tx = tx;
  this.ty = ty;
  this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
  this.distanceTraveled = 0;
  this.coordinates = [];
  this.coordinateCount = 3;
  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  this.angle = Math.atan2(ty - sy, tx - sx);
  this.speed = 2;
  this.acceleration = 1.05;
  this.brightness = random(50, 70);
  this.targetRadius = 1;
}

Firework.prototype.update = function (index) {
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);

  if (this.targetRadius < 8) {
    this.targetRadius += 0.3;
  } else {
    this.targetRadius = 1;
  }

  this.speed *= this.acceleration;

  var vx = Math.cos(this.angle) * this.speed,
      vy = Math.sin(this.angle) * this.speed;

  this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

  if (this.distanceTraveled >= this.distanceToTarget) {
    createParticles(this.tx, this.ty);
    fireworks.splice(index, 1);
  } else {
    this.x += vx;
    this.y += vy;
  }
};

Firework.prototype.draw = function () {
  if (!ctx) return;

  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
  ctx.stroke();
};

// Particle Constructor and Methods
function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.coordinates = [];
  this.coordinateCount = 5;
  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);
  this.friction = 0.95;
  this.gravity = 1;
  this.hue = random(hue - 20, hue + 20);
  this.brightness = random(50, 80);
  this.alpha = 1;
  this.decay = random(0.015, 0.03);
}

Particle.prototype.update = function (index) {
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);
  this.speed *= this.friction;
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  this.alpha -= this.decay;

  if (this.alpha <= this.decay) {
    particles.splice(index, 1);
  }
};

Particle.prototype.draw = function () {
  if (!ctx) return;

  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
  ctx.stroke();
};

// Create Particle Explosion
function createParticles(x, y) {
  var particleCount = 30;
  while (particleCount--) {
    particles.push(new Particle(x, y));
  }
}

// Main Fireworks Loop
function loop() {
  requestAnimFrame(loop);

  hue += 0.5;

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = 'lighter';

  var i = fireworks.length;
  while (i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }

  i = particles.length;
  while (i--) {
    particles[i].draw();
    particles[i].update(i);
  }

  if (timerTick >= timerTotal) {
    if (!mousedown) {
      fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
      timerTick = 0;
    }
  } else {
    timerTick++;
  }

  if (limiterTick >= limiterTotal) {
    if (mousedown) {
      fireworks.push(new Firework(cw / 2, ch, mx, my));
      limiterTick = 0;
    }
  } else {
    limiterTick++;
  }
}

// Initialize Fireworks Loop
loop();

// Event Listeners for Mouse Interaction
window.addEventListener('mousemove', function(e) {
  mx = e.clientX;
  my = e.clientY;
});

window.addEventListener('mousedown', function(e) {
  mousedown = true;
});

window.addEventListener('mouseup', function(e) {
  mousedown = false;
});

// Gift Box Animation and Reveal
document.addEventListener("DOMContentLoaded", function () {
  var merrywrap = document.getElementById("merrywrap");
  if (!merrywrap) {
    console.error("Element with ID 'merrywrap' not found.");
    return;
  }

  var box = merrywrap.getElementsByClassName("giftbox")[0];
  if (!box) {
    console.error("Element with class 'giftbox' not found within 'merrywrap'.");
    return;
  }

  var step = 1;
  var stepDelays = [2000, 2000, 1000, 1000]; // Delays in milliseconds for each step

  function init() {
    box.addEventListener("click", openBox, false);
  }

  function stepClass(step) {
    merrywrap.className = 'merrywrap step-' + step;
  }

  function openBox() {
    stepClass(step);

    if (step === 4) {
      reveal();
      return;
    }

    setTimeout(openBox, stepDelays[step - 1]);
    step++;
  }

  init();
});

// Reveal Function to Display Fireworks and Canva Content
function reveal() {
  var merrywrap = document.querySelector('.merrywrap');
  if (merrywrap) {
    merrywrap.style.backgroundColor = 'transparent';
  } else {
    console.error("Element with class 'merrywrap' not found.");
  }

  // Fireworks animation is already running

  var videoContainer = document.getElementById('video');
  if (!videoContainer) {
    console.error("Element with ID 'video' not found.");
    return;
  }

  // Option 1: Provide a Direct Link to Canva Design
  var link = document.createElement("a");
  link.setAttribute("href", "https://www.canva.com/design/DAGTGRYw8Gs/Gj0PB4fVuKXXgj3A-ClpQA/watch?utm_content=DAGTGRYw8Gs&utm_campaign=designshare&utm_medium=link&utm_source=editor" );
  link.setAttribute("target", "_blank");
  link.innerText = "🎨Click here🎨";
  
  // Optional: Style the link
  link.style.color = '#fff';
  link.style.textDecoration = 'none';
  link.style.fontSize = '20px';
  link.style.display = 'inline-block';
  link.style.marginTop = '20px';
  link.style.padding = '10px 20px';
  link.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  link.style.borderRadius = '8px';
  link.style.transition = 'background-color 0.3s';
  
  link.addEventListener('mouseover', function() {
    link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  });
  
  link.addEventListener('mouseout', function() {
    link.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  });

  videoContainer.appendChild(link);

  // Option 2: Display an Exported Image or Video (Uncomment and use if available)
}
