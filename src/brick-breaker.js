// Set random angle on start
// Round edges of boxes
// Fix the ground bug

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 5;
const paddleHeight = 10;
const paddleWidth = 80;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = (canvas.height - paddleHeight) / 2;
let rightPressed = false;
let leftPressed = false;
const brickRowCount = 8;
const brickColumnCount = 6;
const brickWidth = 80;
const brickHeight = 20;
const brickPadding = 10;
const brickOffSetTop = 40;
const brickOffSetLeft = brickWidth;
let score = 0;
let lives = 3;
let bricks=[];

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

for(c = 0; c < brickColumnCount; c++)
{
	bricks[c] = [];
	for(r = 0; r < brickRowCount; r++)
	{
		bricks[c][r] = {x:0, y:0, status:1};
	}
}

function drawBricks()
{
	for(c = 0; c < brickColumnCount; c++)
	{
		for(r = 0;r < brickRowCount; r++)
		{
			if(bricks[c][r].status == 1)
			{
				let brickX = (c * (brickWidth + brickPadding) + brickOffSetLeft);
				let brickY = (r * (brickHeight + brickPadding) + brickOffSetTop);
				bricks[c][r].x = brickX;
				bricks[c][r].y = brickY;
				
				ctx.beginPath();
				ctx.rect(brickX,brickY,brickWidth,brickHeight);
				ctx.fillStyle="#8F00FF";
				ctx.fill();
				ctx.closePath();
			}

		}
	}
}

function keyDownHandler(e)
{
	// Right button
	if (e.keyCode == 39 || e.keyCode == 68)
	{
		rightPressed = true;
	}
	
	// Left button
	if (e.keyCode == 37 || e.keyCode == 65)
	{
		leftPressed = true;
	}
}

function keyUpHandler(e)
{
	// Right button
	if(e.keyCode == 39 || e.keyCode == 68)
	{
		rightPressed = false;
	}
	
	// Left button
	if (e.keyCode == 37 || e.keyCode == 65)
	{
		leftPressed = false;
	}
}

function drawBall()
{
	ctx.beginPath();
	ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
	ctx.fillStyle="#e0bb00";
	ctx.fill();
	ctx.closePath();
}

function drawPaddle()
{
	ctx.beginPath();
	ctx.rect(paddleX, canvas.height - (paddleHeight), paddleWidth, paddleHeight);
	ctx.fillStyle="#e0bb00";
	ctx.fill();
	ctx.closePath();
}

function collisonDetection()
{
	// Collision with right wall
	if (x + dx > canvas.width - ballRadius)
		dx -= dx + 2;

	// Collision with left wall
	if (x + dx < ballRadius)
		dx -= dx - 2;

	// Collision with ceiling
	if (y + dy < ballRadius)
		dy -= dy - 2;

	// Collision with bricks
	for(c = 0; c < brickColumnCount; c++)
	{
		for(r = 0; r < brickRowCount; r++)
		{
			let b = bricks[c][r];

			if(b.status == 1)
			{
				// Bottom 
				if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight + ballRadius)
				{
					dy -= dy - 2;
					b.status = 0;
					score++;

					if(brickColumnCount * brickRowCount == score)
					{
						document.location.reload();
					}

				}

				// Top
				if(x > b.x && x < b.x + brickWidth && y > b.y - ballRadius && y < b.y + brickHeight)
				{
					dy -= dy + 2;
					b.status = 0;
					score++;

					if(brickColumnCount * brickRowCount == score)
					{
						document.location.reload();
					}
				}		

				// Left
				if(x > b.x - ballRadius && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight)
				{
					dx -= dx + 2;
					b.status = 0;
					score++;

					if(brickColumnCount * brickRowCount == score)
					{
						document.location.reload();
					}
				}	

				// Right
				if(x > b.x && x < b.x + brickWidth + ballRadius && y > b.y && y < b.y + brickHeight)
				{
					dx -= dx - 2;
					b.status = 0;
					score++;

					if(brickColumnCount * brickRowCount == score)
					{
						document.location.reload();
					}
				}			
			}
		}
	}

	// Paddle Collisions
	if(rightPressed && paddleX < canvas.width - paddleWidth)
	{
		paddleX += 5;
	}
	else if(leftPressed && paddleX > 0)
	{
		paddleX -= 5;
	}

	// Bottom of the screen
	if(y + dy > canvas.height - paddleHeight - ballRadius)
	{
		if(x > paddleX && x < paddleX + paddleWidth)
		{
			dy -= dy + 2;
		}
		else 
        {
			lives--;
            
			if(!lives)
			{
		    	document.location.reload();
			}
	    }
	}
}

function drawScore()
{
	ctx.font="14px Courier new";
	ctx.fillStyle="#e0bb00";
	ctx.fillText("Score: " + score, brickOffSetLeft, brickOffSetTop - 10);
}

function drawLives()
{
	ctx.font="14px Courier new";
	ctx.fillStyle="#e0bb00";
	ctx.fillText(lives + " Lives", canvas.width - brickOffSetLeft + 20, brickOffSetTop - 10);
}

function draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawBricks();
	drawLives();
	drawBall();
	drawPaddle();
	drawScore();
	collisonDetection();

	if (y + dy < ballRadius)
    {
		dy -= dy;
    }
	


	x += dx;
	y += dy;
}

setInterval(draw,10);