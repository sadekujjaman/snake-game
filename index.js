window.onload = () => {
  main();
};

let grid_canvas = null;
let grid_canvas_ctx = null;
let grid_canvas_data = null;
let grid_canvas_width = null;
let grid_canvas_height = null;
let square_size = 30;
let grid_line_color = [255, 0, 0, 255];
let grid_width = 0;
let grid_height = 0;

let snake_canvas = null;
let snake_canvas_ctx = null;
let snake_canvas_data = null;
let snake_canvas_width = null;
let snake_canvas_height = null;
let snake_square_size = square_size - 5;
let snake_line_color = [0, 0, 255, 255];
let snake_fill_color = [0, 255, 0, 255];
let snake = [];
let initial_snake = [];
initial_snake.push([6, 5]);
initial_snake.push([5, 5]);
initial_snake.push([4, 5]);
let snake_dir = [1, 0];
let initial_snake_dir = [1, 0];
let prev_snake_dir = [0, 0];
let snake_interval_time = 300;
let snake_interval_id = null;

let food_canvas = null;
let food_canvas_ctx = null;
let food_canvas_data = null;
let food_canvas_width = null;
let food_canvas_height = null;
let food_circle_radius = 10;
let food_fill_color = [0, 255, 0, 255];
let food_grid = [];
let food_cell = [];
let food_interval_time = 3000;
let food_interval_id = null;

let score = 0;

function main() {
  score = 0;
  document.getElementById("score").innerHTML = score;
  document.getElementById("game-over").style.display = "none";
  window.addEventListener("keydown", keyDownListener, false);

  make_grid();

  initiate_snake();

  initiate_food();

  snake_canvas.addEventListener("click", gridCanvasClick, false);
}
function gridCanvasClick(e) {
  var element = grid_canvas;
  let offsetX = 0;
  let offsetY = 0;

  if (element.offsetParent) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  x = e.pageX - offsetX;
  y = e.pageY - offsetY;
  if (x % square_size == 0 || y % square_size == 0) {
    return;
  }
  flood_fill(
    x,
    y,
    getRandomColor(),
    getPixel(x, y, grid_canvas_data),
    grid_canvas_data
  );
  grid_canvas_ctx.putImageData(grid_canvas_data, 0, 0);
}

function getRandomColor() {
  let red = Math.floor(Math.random() * 255);
  let green = Math.floor(Math.random() * 255);
  let blue = Math.floor(Math.random() * 255);
  let alpha = Math.floor(Math.random() * 255);
  return [red, green, blue, alpha];
}

function make_grid() {
  grid_canvas = document.querySelectorAll("canvas")[0];
  grid_canvas_ctx = grid_canvas.getContext("2d");
  grid_canvas_width = grid_canvas.width;
  grid_canvas_height = grid_canvas.height;

  grid_canvas_ctx.clearRect(0, 0, grid_canvas_width, grid_canvas_height);
  grid_canvas_data = grid_canvas_ctx.getImageData(
    0,
    0,
    grid_canvas_width,
    grid_canvas_height
  );

  grid_width = parseInt(grid_canvas_width / square_size);
  grid_height = parseInt(grid_canvas_height / square_size);
  for (let i = 0; i <= grid_width; i++) {
    let x1 = i * square_size;
    let y1 = 0;
    let x2 = x1;
    let y2 = grid_canvas_height;
    draw_line([x1, y1], [x2, y2], grid_line_color, grid_canvas_data);
  }
  for (let i = 0; i <= grid_height + 1; i++) {
    let x1 = 0;
    let y1 = i * square_size;
    let x2 = grid_canvas_height;
    let y2 = y1;
    draw_line([x1, y1], [x2, y2], grid_line_color, grid_canvas_data);
  }

  grid_canvas_ctx.putImageData(grid_canvas_data, 0, 0);
}

function initiate_snake() {
  snake_canvas = document.querySelectorAll("canvas")[1];
  snake_canvas_ctx = snake_canvas.getContext("2d");
  snake_canvas_width = snake_canvas.width;
  snake_canvas_height = snake_canvas.height;
  snake = initial_snake;
  snake_dir = initial_snake_dir;
  generate_snake();
  snake_interval_id = setInterval(update_snake, snake_interval_time);
}

function generate_snake() {
  snake_canvas_ctx.clearRect(0, 0, snake_canvas_width, snake_canvas_height);
  snake_canvas_data = snake_canvas_ctx.getImageData(
    0,
    0,
    snake_canvas_width,
    snake_canvas_height
  );

  for (let i = 0; i < snake.length; i++) {
    generate_snake_rect(snake[i]);
  }

  snake_canvas_ctx.putImageData(snake_canvas_data, 0, 0);
}

function generate_snake_rect(cell) {
  let start_x = cell[0] * square_size;
  let start_y = cell[1] * square_size;

  let end_x = start_x + square_size;
  let end_y = start_y + square_size;

  let padding = 5;
  start_x += padding;
  start_y += padding;
  end_x -= padding;
  end_y -= padding;

  draw_line(
    [start_x, start_y],
    [end_x, start_y],
    snake_line_color,
    snake_canvas_data
  );
  draw_line(
    [end_x, start_y],
    [end_x, end_y],
    snake_line_color,
    snake_canvas_data
  );
  draw_line(
    [start_x, start_y],
    [start_x, end_y],
    snake_line_color,
    snake_canvas_data
  );
  draw_line(
    [start_x, end_y],
    [end_x, end_y],
    snake_line_color,
    snake_canvas_data
  );
}

function initiate_food() {
  food_canvas = document.querySelectorAll("canvas")[2];
  food_canvas_ctx = food_canvas.getContext("2d");
  food_canvas_width = food_canvas.width;
  food_canvas_height = food_canvas.height;

  food_interval_id = setInterval(food_render, food_interval_time);
  food_render();
}

function food_render() {
  food_canvas_ctx.clearRect(0, 0, food_canvas_width, food_canvas_height);
  food_canvas_data = food_canvas_ctx.getImageData(
    0,
    0,
    food_canvas_width,
    food_canvas_height
  );

  generate_new_food();
  let start_x = food_cell[0] * square_size;
  let start_y = food_cell[1] * square_size;

  let cx = parseInt(start_x + square_size / 2);
  let cy = parseInt(start_y + square_size / 2);
  drawCircle(cx, cy, food_circle_radius, food_fill_color, food_canvas_data);

  let original_color = getPixel(cx, cy, food_canvas_data);
  flood_fill(cx, cy, food_fill_color, original_color, food_canvas_data);
  food_canvas_ctx.putImageData(food_canvas_data, 0, 0);
}

function generate_new_food() {
  let x = Math.floor(Math.random() * grid_width);
  let y = Math.floor(Math.random() * grid_height);
  while ((food_cell[0] == x && food_cell[1] == y) || isSnakeCell([x, y])) {
    x = Math.floor(Math.random() * grid_width);
    y = Math.floor(Math.random() * grid_height);
  }
  food_cell = [x, y];
}

function draw_line(p1, p2, color, data) {
  let dx = Math.abs(p2[0] - p1[0]);
  let dy = Math.abs(p2[1] - p1[1]);
  let flag = 0;
  if (dy > dx) {
    p1 = [p1[1], p1[0]];
    p2 = [p2[1], p2[0]];
    flag = 1;
  }

  if (p1[0] > p2[0]) {
    let temp = p1;
    p1 = p2;
    p2 = temp;
  }

  dx = Math.abs(p2[0] - p1[0]);
  dy = Math.abs(p2[1] - p1[1]);
  let dT = 2.0 * (dy - dx);
  let dS = 2.0 * dy;
  let d = 2 * dy - dx;

  let inc_x = -1;
  let inc_y = -1;
  if (p2[0] - p1[0] > 0) {
    inc_x = 1;
  }
  if (p2[1] - p1[1] > 0) {
    inc_y = 1;
  }

  let steps = dx;
  let x = p1[0];
  let y = p1[1];

  for (let i = 0; i < steps + 1; i++) {
    if (flag == 1) {
      putPixel(Math.round(y), Math.round(x), color, data);
    } else {
      putPixel(Math.round(x), Math.round(y), color, data);
    }
    if (d < 0) {
      d = d + dS;
    } else {
      y = y + inc_y;
      d = d + dT;
    }
    x = x + inc_x;
  }
}

function drawCircles() {
  for (let i = 0; i < cloudPointsCounts; i++) {
    drawCircle(
      cloudPoints[i][0],
      cloudPoints[i][1],
      cloudPoints[i][2],
      cloudPointsColor[i]
    );
  }
}

function drawCircle(cx, cy, r, color, data) {
  let x = 0;
  let y = r;
  let p = 3 - 2 * r;
  while (x <= y) {
    putPixel(cx + x, cy + y, color, data);
    putPixel(cx + y, cy + x, color, data);
    putPixel(cx + y, cy - x, color, data);
    putPixel(cx + x, cy - y, color, data);
    putPixel(cx - x, cy - y, color, data);
    putPixel(cx - y, cy - x, color, data);
    putPixel(cx - y, cy + x, color, data);
    putPixel(cx - x, cy + y, color, data);
    if (p < 0) {
      p = p + 4 * x + 6;
    } else {
      p = p + 4 * (x - y) + 10;
      y = y - 1;
    }
    x = x + 1;
  }
}

function flood_fill(seedx, seedy, fill_color, original_color, data) {
  let queue = [];
  queue.push([seedx, seedy]);
  let dx = [1, 0, -1, 0];
  let dy = [0, 1, 0, -1];
  let visited = new Array(grid_canvas_height);
  for (let i = 0; i < grid_canvas_height; i++) {
    visited[i] = new Array(grid_canvas_width);
    for (let j = 0; j < grid_canvas_width; j++) {
      visited[i][j] = 0;
    }
  }
  putPixel(seedx, seedy, fill_color, data);
  while (queue.length > 0) {
    let top = queue.shift();
    for (let i = 0; i < dx.length; i++) {
      let x = top[0] + dx[i];
      let y = top[1] + dy[i];
      if (
        x >= 0 &&
        y >= 0 &&
        x < grid_canvas_width &&
        y < grid_canvas_height &&
        !visited[y][x] &&
        isSameColor(getPixel(x, y, data), original_color)
      ) {
        queue.push([x, y]);
        visited[y][x] = 1;
        putPixel(x, y, fill_color, data);
      }
    }
  }
}

function isSameColor(color1, color2) {
  return (
    color1[0] == color2[0] &&
    color1[1] == color2[1] &&
    color1[2] == color2[2] &&
    color1[3] == color2[3]
  );
}

function getPixel(x, y, data) {
  let index = (y * grid_canvas_width + x) * 4;
  var rgb = [
    data.data[index],
    data.data[index + 1],
    data.data[index + 2],
    data.data[index + 3],
  ];
  return rgb;
}

function putPixel(x, y, color, data) {
  var index = (y * grid_canvas_width + x) * 4;
  data.data[index + 0] = color[0];
  data.data[index + 1] = color[1];
  data.data[index + 2] = color[2];
  data.data[index + 3] = color[3];
}

let tail_cell = null;
function keyDownListener(e) {
  if (e.keyCode == 40) {
    // down
    if (snake_dir[1] == -1) {
      return;
    }

    snake_dir = [0, 1];
    // update_snake();
  }
  if (e.keyCode == 39) {
    // right
    if (snake_dir[0] == -1) {
      return;
    }
    snake_dir = [1, 0];
    // update_snake();
  }
  if (e.keyCode == 38) {
    // up
    if (snake_dir[1] == 1) {
      return;
    }
    snake_dir = [0, -1];
    // update_snake();
  }
  if (e.keyCode == 37) {
    // left
    if (snake_dir[0] == 1) {
      return;
    }
    snake_dir = [-1, 0];
    // update_snake();
  }
}

function update_snake() {
  let front_cell = snake[0];
  front_cell = [
    (front_cell[0] + snake_dir[0] + grid_width) % grid_width,
    (front_cell[1] + snake_dir[1] + grid_height) % grid_height,
  ];
  if (isSnakeCell(front_cell)) {
    gameOver();
  }
  if (isFoodCell(front_cell)) {
    score += 1;
    food_canvas_ctx.clearRect(0, 0, food_canvas_width, food_canvas_height);
    document.getElementById("score").innerHTML = score;
    food_cell = [-10, -10];
  } else {
    tail_cell = snake.pop();
  }
  prev_snake_dir = snake_dir;
  snake.unshift(front_cell);
  generate_snake();
}
let wait_interval_id = null;
function gameOver() {
  if (snake_interval_id) {
    clearInterval(snake_interval_id);
  }
  if (food_interval_id) {
    clearInterval(food_interval_id);
  }
  window.removeEventListener("keydown", keyDownListener, true);

  document.getElementById("game-over").style.display = "block";
}

function isFoodCell(cell) {
  return cell[0] == food_cell[0] && cell[1] == food_cell[1];
}
function isSnakeCell(cell) {
  for (let i = 0; i < snake.length; i++) {
    const snake_cell = snake[i];
    if (snake_cell[0] == cell[0] && snake_cell[1] == cell[1]) {
      return true;
    }
  }
  return false;
}
