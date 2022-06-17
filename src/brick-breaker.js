/*
    License
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    MIT License
    Copyright (c) 2022, Boden McHale
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
	
    Future Modifications
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    - Random angle on start
    - More sfx
	- Round edges of rectangles
	- Bug: If the ball goes under the paddle it pops back up

    Author
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Twitter: @Boden_McHale https://twitter.com/Boden_McHale
    Blog: https://lostrabbitdigital.com/blog/
    Last Updated: June 16th 2022
*/

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

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

let pixelOffset = 1;

function playDeath()
{
	let deathSFX = new Array('audio/death.mp3', 'audio/death2.mp3');

	let randomSFX = deathSFX[Math.floor(Math.random() * deathSFX.length)];

	let chosenDeathSFX = new Audio(randomSFX);

	chosenDeathSFX.play();
}

function playBrickCollision()
{
	let brickCollisionSFX = new Audio('audio/brick-collision.mp3');
	brickCollisionSFX.play();
}

function playWallCollision()
{
	let wallCollisionSFX = new Audio('audio/wall-collision.mp3');
	wallCollisionSFX.play();
}

function collisonDetection()
{
	// Collision with right wall
	if (x + dx > canvas.width - ballRadius)
	{	
		dx -= dx + 2;
		playWallCollision();
	}
	// Collision with left wall
	if (x + dx < ballRadius)
	{
		dx -= dx - 2;
		playWallCollision();
	}

	// Collision with ceiling
	if (y + dy < ballRadius)
	{
		dy -= dy - 2;
		playWallCollision();
	}	

	// Collision with bricks
	for(c = 0; c < brickColumnCount; c++)
	{
		for(r = 0; r < brickRowCount; r++)
		{
			let b = bricks[c][r];

			if(b.status == 1)
			{
				// Bottom 
				if(x + dx > b.x && x + dx < b.x + brickWidth && y + dy > b.y && y + dy < b.y + brickHeight + ballRadius - pixelOffset)
				{
					dy -= dy - 2;
					b.status = 0;
					score++;
					playBrickCollision();

					if(brickColumnCount * brickRowCount == score)
					{
						playDeath();
						document.location.reload();
					}

				}

				// Top
				if(x + dx > b.x && x + dx < b.x + brickWidth && y + dy > b.y - ballRadius + pixelOffset && y + dy < b.y + brickHeight)
				{
					dy -= dy + 2;
					b.status = 0;
					score++;
					playBrickCollision();

					if(brickColumnCount * brickRowCount == score)
					{
						playDeath();
						document.location.reload();
					}
				}		

				// Left
				if(x + dx > b.x - ballRadius + pixelOffset && x + dx < b.x + brickWidth && y + dy > b.y && y + dy < b.y + brickHeight)
				{
					dx -= dx + 2;
					b.status = 0;
					score++;
					playBrickCollision();

					if(brickColumnCount * brickRowCount == score)
					{
						playDeath();
						document.location.reload();
					}
				}	

				// Right
				if(x + dx > b.x && x + dx < b.x + brickWidth + ballRadius - pixelOffset && y + dy > b.y && y + dy < b.y + brickHeight)
				{
					dx -= dx - 2;
					b.status = 0;
					score++;
					playBrickCollision();

					if(brickColumnCount * brickRowCount == score)
					{
						playDeath();
						document.location.reload();
					}
				}			
			}
		}
	}

	// Ball collision with bottom of screen
	if (y + dy > canvas.height + paddleHeight + (ballRadius * 2))
	{
		lives--;
		playDeath();

		x = canvas.width / 2;
		y = canvas.height - 30;
		dx = 2;
		dy = -2;
	}

	// Paddle collision with Wall
	if(rightPressed && paddleX < canvas.width - paddleWidth)
	{
		paddleX += 5;
	}
	else if(leftPressed && paddleX > 0)
	{
		paddleX -= 5;
	}

	// Paddle collision with Ball
	if(x > paddleX && x < paddleX + paddleWidth && y + dy > canvas.height - paddleHeight - ballRadius + pixelOffset)
	{
		playBrickCollision();
		dy -= dy + 2;
	}
}

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
		for(r = 0; r < brickRowCount; r++)
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

function draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawBricks();
	drawLives();
	drawBall();
	drawPaddle();
	drawScore();
	collisonDetection();

	// Check if the player is dead
	if(lives <= 0)
	{
		document.location.reload();
	}

	x += dx;
	y += dy;
}

setInterval(draw,10);