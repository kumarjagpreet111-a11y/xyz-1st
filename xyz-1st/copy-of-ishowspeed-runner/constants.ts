
export const CANVAS_WIDTH = window.innerWidth;
export const CANVAS_HEIGHT = window.innerHeight;

// Physics for Flappy/Speed style
export const GRAVITY = 0.55;
export const JUMP_STRENGTH = -8.5;

// Mode Configurations
export const MODES = {
  LITE: {
    name: 'LITE',
    speed: 4.0,
    gap: 280,
    gravity: 0.45,
    jump: -8,
    color: '#00ff88'
  },
  FLASH: {
    name: 'FLASH',
    speed: 7.5,
    gap: 220,
    gravity: 0.75,
    jump: -10,
    color: '#00eaff'
  },
  PRO: {
    name: 'PRO',
    speed: 5.5,
    gap: 180,
    gravity: 0.65,
    jump: -9,
    color: '#ff0055'
  }
};

export const GROUND_HEIGHT = 100;
export const GROUND_COLOR = '#111111';

export const PLAYER = {
  SIZE: Math.min(85, window.innerWidth * 0.22), // Slightly larger for the GIF visibility
  START_X: window.innerWidth * 0.2,
  COLOR: '#00eaff',
};

export const OBSTACLE = {
  WIDTH: Math.min(90, window.innerWidth * 0.22),
  SPAWN_DISTANCE: 380,
};

export const AUDIO_PATHS = {
  SUI: 'https://www.myinstants.com/media/sounds/sui-ishowspeed.mp3',
  BARK: 'https://www.myinstants.com/media/sounds/ishowspeed-barking.mp3',
  GAME_OVER: 'https://www.myinstants.com/media/sounds/ishowspeed-god-is-good.mp3',
};

export const ASSETS = {
  // Using the exact background link provided by the user
  BACKGROUND: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/089918d8-99ff-45de-a084-3fe85d0e3fcc/dg34rsu-29a3d144-dc3f-473e-a949-f73a4ba1ef7c.png/v1/fill/w_608,h_457,q_80,strp/flappy_bird_backdrop_by_lenaxux_dg34rsu-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDU3IiwicGF0aCI6Ii9mLzA4OTkxOGQ4LTk5ZmYtNDVkZS1hMDg0LTNmZTg1ZDBlM2ZjYy9kZzM0cnN1LTI5YTNkMTQ0LWRjM2YtNDczZS1hOTQ5LWY3M2E0YmExZWY3Yy5wbmciLCJ3aWR0aCI6Ijw9NjA4In1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.5bgLYqr2Y7cd3gRlEpriaRXC3pgbVvfUCDO3Mt7mpvk',
  PIPE_TOP: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/pipe-green.png',
  PIPE_BOTTOM: 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/pipe-green.png',
  // Updated flying object to the Tenor GIF provided by the user
  PLAYER: 'https://media.tenor.com/bkl4kbX9g8EAAAAM/speedddd.gif',
  GAME_OVER: 'https://image-cdn.essentiallysports.com/wp-content/uploads/IShowSpeed-4-640x640.png'
};
