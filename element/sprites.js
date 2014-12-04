  // Renderizado de Sprites
  function Sprite(url, pos, size, speed, frames, dir, once) {
    this.pos = pos;
    this.size = size;
    this.speed = typeof speed === 'number' ? speed : 0;
    this.frames = frames;
    this._index = 0;
    this.url = url;
    this.dir = dir || 'horizontal';
    this.once = once;
  }

  Sprite.prototype.update = function (dt) {
    this._index += this.speed * dt;
  };

  Sprite.prototype.render = function (ctx) {
    var frame;

    if (this.speed > 0) {
      var max = this.frames.length;
      var idx = Math.floor(this._index);
      frame = this.frames[idx % max];

      if (this.once && idx >= max) {
        this.done = true;
        return;
      }
    } else {
      frame = 0;
    }


    var x = this.pos[0];
    var y = this.pos[1];

    if (this.dir == 'vertical') {
      y += frame * this.size[1];
    } else {
      x += frame * this.size[0];
    }

    ctx.drawImage(resources.get(this.url),
      x, y,
      this.size[0], this.size[1],
      0, 0,
      this.size[0], this.size[1]);
  };

// variables estaticas para un uso mas facil de las cordenadas

Sprite.player = {
  pos: [332, 33],
  size: [46, 36]
};

Sprite.bigLogo = {
  pos: [2, 2],
  size: [277, 140]
};

Sprite.barGreen = {
  pos: [280,0],
  size: [26,114]
};

Sprite.fireball = {
  pos: [286, 119],
  size: [12, 33]
};

Sprite.yellowAirplane = {
  centerPropeller: {
    pos: [335, 244],
    size: [55, 41]
  },
  rightPropeller: {
    pos: [401, 244],
    size: [55, 41]
  },
  leftPropeller: {
    pos: [599, 244],
    size: [55, 41]
  }
};
