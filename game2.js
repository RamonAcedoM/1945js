
// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// The main game loop
var lastTime;
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;
    requestAnimFrame(main);
};


function init() {
    terrainPattern = ctx.createPattern(resources.get('space_pattern.png'), 'repeat');

    document.getElementById('play-again').addEventListener('click', function() {
        reset();
    });
    
    reset();
    lastTime = Date.now();
    main();
}

resources.load([
    '1945.png',
    'explosions.png',
    'bullets.png',
    'space_pattern.png',
    'asteroids.png',
    'player_sprites.png'
]);

resources.onReady(init);

// Game state
var player = {
    pos: [0, 0],
    sprite: new Sprite('player_sprites.png', [0,0], [40, 38], 16, [0, 1, 2, 3], 'vertical')
};

var bullets = [];
var enemies = [];
var explosions = [];

var lastFire = Date.now();
var gameTime = 0;
var isGameOver;
var terrainPattern;
var levelByScore = 0;
var level = 0;
    var cont = 1;

var score = 0;
var scoreEl = document.getElementById('score');

// Speed in pixels per second
var playerSpeed = 200;
var bulletSpeed = 500;
var enemySpeed = 100;

// Update game objects
function update(dt) {
    gameTime += dt;

    handleInput(dt);
    updateEntities(dt);
    // TODO: AQUI ESTA EL PEDAZO QUE HACE QUE APAREZCAN MÁS O MENOS ENEMIGOS, HAY QUE CAMBIARLO
    //       DEPENDIENDO DEL PUNTAJE DEL JUGADOR
    // It gets harder over time by adding enemies using this
    // equation: 1-.993^gameTime
    document.getElementById('level').style.display = 'block';
    switch(score) {
      case 0:
        levelByScore = 5;
        level = 1;
        enemySpeed = 100;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      case 1500:
        levelByScore = 10;
        level = 2;
        enemySpeed = 150;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      case 7500:
        levelByScore = 13;
        level = 3;
        enemySpeed = 200;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      case 15000:
        levelByScore = 16;
        level = 4;
        enemySpeed = 310;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      case 22000:
        levelByScore = 18;
        level = 5;
        enemySpeed = 400;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      case 35000:
        levelByScore = 21;
        level = 6;
        enemySpeed = 500;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      case 40000:
        levelByScore = 24;
        level = 7;
        enemySpeed = 600;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      case 45000:
        levelByScore = 30;
        level = 8;
        enemySpeed = 700;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      case 50000:
        levelByScore = 33;
        level = 9;
        enemySpeed = 800;
        document.getElementById('level').innerHTML = 'Level ' + level;
        break;
      default:
        break;
    }
    if(Math.random() < 1 - Math.pow(.993, levelByScore)) {
        enemies.push({
            pos: [canvas.width,
                  Math.random() * (canvas.height - 39)],
            sprite: new Sprite(
              'asteroids.png',
              [0, 0], 
              [72, 72],
              16, 
              [0, 1, 2, 3, 4])
        });
    }
    
    

    checkCollisions();

    scoreEl.innerHTML = score;
};

function handleInput(dt) {
    if(input.isDown('DOWN') || input.isDown('s')) {
        player.pos[1] += playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) {
        player.pos[1] -= playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
        player.pos[0] -= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
        player.pos[0] += playerSpeed * dt;
    }
    
  
    // ACCION DE DISPARAR SI PRESIONAS LA BARRA DE ESPACIO
  
    // TODO: REPRODUCIR SONIDO DE DISPARO
  
    if(input.isDown('SPACE') &&
       !isGameOver &&
       Date.now() - lastFire > 100) {
        var x = player.pos[0] + player.sprite.size[0] / 2;
        var y = player.pos[1] + player.sprite.size[1] / 2;
        bullets.push({ 
          pos: [x, y],
          dir: 'forward',
          sprite: new Sprite('bullets.png', [0, 0], [6, 6]) 
        });

        lastFire = Date.now();
        var shootS = new Audio('sounds/shoot2.wav');
        shootS.volume = 0.2;
        shootS.play();
        delete shootS
    }
}

function updateEntities(dt) {
    // Actualizar el jugador
    player.sprite.update(dt);

    // Actualizar todas las balitas
    for(var i=0; i<bullets.length; i++) {
        var bullet = bullets[i];

        switch(bullet.dir) {
        case 'up': bullet.pos[1] -= bulletSpeed * dt; break;
        case 'down': bullet.pos[1] += bulletSpeed * dt; break;
        default:
            bullet.pos[0] += bulletSpeed * dt;
        }

        // Remove the bullet if it goes offscreen
        if(bullet.pos[1] < 0 || bullet.pos[1] > canvas.height ||
           bullet.pos[0] > canvas.width) {
            bullets.splice(i, 1);
            i--;
        }
    }

    // Update all the enemies
    for(var i=0; i<enemies.length; i++) {
        enemies[i].pos[0] -= enemySpeed * dt;
        enemies[i].sprite.update(dt);

        // Remove if offscreen
        if(enemies[i].pos[0] + enemies[i].sprite.size[0] < 0) {
            enemies.splice(i, 1);
            i--;
        }
    }

    // Update all the explosions
    for(var i=0; i<explosions.length; i++) {
        explosions[i].sprite.update(dt);

        // Remove if animation is done
        if(explosions[i].sprite.done) {
            explosions.splice(i, 1);
            i--;
        }
    }
}

// Collisions

function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0], pos[1],
                    pos[0] + size[0], pos[1] + size[1],
                    pos2[0], pos2[1],
                    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions() {
    checkPlayerBounds();
    
    // Run collision detection for all enemies and bullets
    for(var i=0; i<enemies.length; i++) {
        var pos = enemies[i].pos;
        var size = enemies[i].sprite.size;

        for(var j=0; j<bullets.length; j++) {
            var pos2 = bullets[j].pos;
            var size2 = bullets[j].sprite.size;

            if(boxCollides(pos, size, pos2, size2)) {
                // Remove the enemy
                enemies.splice(i, 1);
                i--;

                // Add score
                score += 100;

                
                
                // Add an explosion
                explosions.push({
                    pos: pos,
                    sprite: new Sprite('explosions.png',
                                       [0, 0],
                                       [100, 100],
                                       16,
                                       [0, 1, 2, 3, 4, 5, 6, 7, 8],
                                       'vertical', 
                                       true)
                });
              
                // IGNORA LA VARIABLE SIN EL "VAR" LO PUSE PARA NO TENER QUE HACER EL ARREGLO
                // DE SONIDOS Y NO TENER QUE HACER UN SPLICE AL MISMO PARA ELIMINARLOS DE MEMORIA
                // SIMPLEMENTE HAGO UN "DELETE" DEL MISMO
                explo = new Audio("sounds/explosion.wav");
                explo.play();
                delete explo;

                // Remove the bullet and stop this iteration
                bullets.splice(j, 1);
                break;
            }
        }

        if(boxCollides(pos, size, player.pos, player.sprite.size)) {
            gameOver();
        }
    }
}

function checkPlayerBounds() {
    // Check bounds
    if(player.pos[0] < 0) {
        player.pos[0] = 0;
    }
    else if(player.pos[0] > canvas.width - player.sprite.size[0]) {
        player.pos[0] = canvas.width - player.sprite.size[0];
    }

    if(player.pos[1] < 0) {
        player.pos[1] = 0;
    }
    else if(player.pos[1] > canvas.height - player.sprite.size[1]) {
        player.pos[1] = canvas.height - player.sprite.size[1];
    }
}

// Draw everything
function render() {
    ctx.fillStyle = terrainPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render the player if the game isn't over
    if(!isGameOver) {
        renderEntity(player);
    }

    renderEntities(bullets);
    renderEntities(enemies);
    renderEntities(explosions);
};

function renderEntities(list) {
    for(var i=0; i<list.length; i++) {
        renderEntity(list[i]);
    }    
}

function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}

// Game over
function gameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
    isGameOver = true;

    if(cont == 1){
      var death = new Audio("sounds/Death.wav");
      death.play();
      cont = cont - 1;
    }
}

// Reset game to original state
function reset() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    document.getElementById('level').style.display = 'none';
    isGameOver = false;
    gameTime = 0;
    score = 0;

    enemies = [];
    bullets = [];

    player.pos = [50, canvas.height / 2];
};
