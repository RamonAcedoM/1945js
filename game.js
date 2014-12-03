function Game() {
  this.config = {
    gameWidth: 500,
    gameHeight: 500,
    fps: 50
  };
  //Variables del jugador
  this.lives = 3;
  this.powerUps = {
  };
  this.bounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  //Teclas básicas de entrada
  this.inputKeys = {
  };
  //Estado del juego
  this.states = [
  ];
  //El canvas sobre el que vamos a dibujar
  this.gameCanvas = null;
}
Game.prototype.init = function (gC) {
  //Inicializar con el canvas del juego
  this.gameCanvas = gC;
  //Obtener las dimensiones del canvas
  this.gameWidth = gC.width;
  this.gameHeight = gC.height;
  //Definir los límites del juego
  this.bounds = {
    top: gC.height / 2 - this.config.gameHeight / 2,
    right: gC.width / 2 + this.config.gameWidth / 2,
    bottom: gC.height / 2 + this.config.gameHeight / 2,
    left: gC.width / 2 - this.config.gameWidth / 2
  };
};
//Devuelve el estado del juego
Game.prototype.cState = function () {
  if (this.states.length > 0) {
    return this.states[this.states.length - 1];
  } else {
    return null;
  }
};
Game.prototype.enterState = function (state) {
  //Estamos en algun estado de juego?
  if (this.cState()) {
    if (this.cState().leave) {
      this.cState().leave(game);
    }
    this.states.pop();
  }
  if (state.enter) {
    state.enter(game);
  }
  //Definimos el estado actual

  this.states.push(state);
};
function gameLoop(game) {
  var currentState = game.cState();
  if (currentState) {
    var dt = 1 / game.config.fps;
    var ctx = game.gameCanvas.getContext('2d');
    if (currentState.update) {
      currentState.update(game, dt);
    }
    if (currentState.draw) {
      currentState.draw(game, dt, ctx);
    }
  }
}
function WelcomeState() {
}
Game.prototype.start = function () {
  this.enterState(new WelcomeState());
  this.lives = 3;
  var game = this;
  this.intervalId = setInterval(function () {
    gameLoop(game);
  }, 1000 / this.config.fps);
};

WelcomeState.prototype.draw = function (game, dt, ctx) {
  ctx.clearRect(0, 0, game.width, game.height);
  ctx.font = '30px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'center';
  ctx.textAlign = 'center';
  ctx.fillText('Space Invaders', game.width / 2, game.height / 2 - 40);
  ctx.font = '16px Arial';
  ctx.fillText('Press \'Space\' to start.', game.width / 2, game.height / 2);
};
var game = new Game();
var cc = document.getElementById('gameCanvas');
cc.width = 600;
cc.height = 600;
game.init(cc);
game.start();