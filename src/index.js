import "./styles.css";

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
ctx.font = "50px Impact";

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];
class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;

    //처음에 상자로 테스트할 때 with와 height
    //this.width = 100;
    //this.height = 50;

    //이렇게 하면 모두 크기를 절반으로 줄이는데 같은 사이즈
    //this.width = this.spriteWidth / 2;
    //this.height = this.spriteHeight / 2;

    //다양한 크기를 만들어보자
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;

    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;

    this.image = new Image();
    this.image.src = "../assets/img/raven.png";
    this.frame = 0;
    this.maxFrame = 4;

    this.timeSinceFlap = 0;
    // 이걸로 날개짓 속도를 조정할 수 있다.
    //this.flapInterval = 100;

    this.flapInterval = Math.random() * 50 + 50;

    //각 object의 배경 색을 random하게 만들어본다는 의미인가?
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255)
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
    this.hasTrail = Math.random() > 0.5;
  }

  update(deltaTime) {
    // 위 아래로 가는데 canvas를 넘어가면 바운스하도록
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }

    this.x -= this.directionX;

    // 어떤 애는 아래로/위로 갈 수 있도록 해보자
    this.y += this.directionY;

    //왼쪽 밖으로 나가면 mark해서 나중에 지울꺼
    if (this.x < 0 - this.width) this.markedForDeletion = true;

    // 이렇게 해서 모든 object의 frame이 animation frame 한번 할때마다
    // 넘어가서 날개짓을 엄청 빨리 했는데
    //if (this.frame > this.maxFrame) this.frame = 0;
    //else this.frame++;
    //console.log(deltaTime);

    // deltaTime을 이용해서 어느정도 일정하게? 우아하게? 날개짓 한다.
    this.timeSinceFlap += deltaTime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;

      //꼬리 particle 효과
      if (this.hasTrail) {
        //좀 더 예쁘게;;;; 여러 particle이 남는 효과 아녀
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }

    //와... 이거 하나로 이 게임 난이도가 급상승!
    if (this.x < 0 - this.width) gameOver = true;
  }

  draw() {
    //이렇게 하면 잘 보이는데 collision detection을 위해서
    //ctx.fillStyle = this.color;
    //ctx.fillRect(this.x, this.y, this.width, this.height);

    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let explosions = [];
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "../assets/img/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "../assets/sound/boom.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      // frame 끝나면 사라지도록...
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size / 4,
      this.size,
      this.size
    );
  }
}

let particles = [];
class Particle {
  constructor(x, y, size, color) {
    this.size = size;

    this.x = x + this.size / 2 + Math.random() * 50 - 25;
    this.y = y + this.size / 3 + Math.random() * 50 - 25;

    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + 35;
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.3;
    if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
  }
  draw() {
    ctx.save();
    // 이거 넣으면 모든 object가 번쩍이는데
    // ctx.save/ctx.restore가 들어가면 희한하게 particle만 반짝이게 된다!
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;

    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 50, 75);
  // 입체적인 효과!
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 55, 80);
}

function drawGameOver() {
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText(
    "Game over your score is " + score,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillStyle = "white";
  ctx.fillText(
    "Game over your score is " + score,
    canvas.width / 2 + 5,
    canvas.height / 2 + 5
  );
}

window.addEventListener("click", function (e) {
  //color picking해보는데 오류 : collision을 위한 canvas가 별도로 필요한 것인가?
  //const detectPixelColor = ctx.getImageData(e.x, e.y, 1, 1);
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  //console.log(detectPixelColor);
  const pc = detectPixelColor.data;
  ravens.forEach((object) => {
    if (
      object.randomColors[0] == pc[0] &&
      object.randomColors[1] == pc[1] &&
      object.randomColors[2] == pc[2]
    ) {
      // collision detected by color
      // 굳이 이렇게 안 해도 되는거 아닌가... 아님 이게 더 정확한 건가?
      // 아마 각 object의 색이 다 달라져야... 각각을 다르게 잡아낼 수 잇기 때문에 이렇게 쓰는 거?
      object.markedForDeletion = true;
      score++;

      explosions.push(new Explosion(object.x, object.y, object.width));
      //console.log(explosions);
    }
  });
});

//const raven = new Raven();

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
  //raven.update();
  //raven.draw();

  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  //console.log(timestamp)
  timeToNextRaven += deltaTime;
  //console.log(deltaTime)

  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    //console.log(ravens);

    //크기 순으로 정렬하는 이유는... 크기 순서대로 object 레이어를
    ravens.sort(function (a, b) {
      return a.width - b.width;
    });
  }

  drawScore();

  //이런 것도 잘 안 보던 코드라서 알아둬야 할 필요가 있음.
  //[...ravens].forEach((object) => object.update(deltaTime));
  //[...ravens].forEach((object) => object.draw());

  // 각 object에 대해 따로 update/draw하지 않고 여기서 한꺼번에 가능!
  //[...ravens, ...explosions, ...particles].forEach((object) => object.update(deltaTime));
  //[...ravens, ...explosions, ...particles].forEach((object) => object.draw());

  //object 그리는 순서를 달리하면 레이어를 다르게 해서 그릴 수 있다.
  [...particles, ...ravens, ...explosions].forEach((object) =>
    object.update(deltaTime)
  );
  [...particles, ...ravens, ...explosions].forEach((object) => object.draw());

  //marked 된거는 삭제해
  ravens = ravens.filter((object) => !object.markedForDeletion);
  explosions = explosions.filter((object) => !object.markedForDeletion);
  particles = particles.filter((object) => !object.markedForDeletion);
  // object를 지워야 할 필요가 있다.
  //console.log(ravens);

  if (!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

animate(0);
