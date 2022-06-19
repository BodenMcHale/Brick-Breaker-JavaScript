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
    - Setup paddle collision sfx

    Author
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Twitter: @Boden_McHale https://twitter.com/Boden_McHale
    Blog: https://lostrabbitdigital.com/blog/
    Last Updated: June 16th 2022
*/

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 0;
let dy = -2;

const ballRadius = 5;
const borderWidth = 5;
const ballColor = '#FFFFFF';

const paddleHeight = 10;
const paddleWidth = 80;
const paddleOffSetBottom = 5;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = (canvas.height - paddleHeight) / 2;
let paddleSpeed = 5;
const paddleColor = '#FFFFFF'; // White

let rightPressed = false;
let leftPressed = false;

const brickRowCount = 10;
const brickColumnCount = 11;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 8;
const brickOffSetTop = 30;
const brickOffSetLeft = 30;

const brickColor1 = '#00FFF2'; // Blue
const brickColor2 = '#FF000D'; // Light Red
const brickColor3 = '#00FF1B'; // Green
const brickColor4 = '#FF00E4'; // Pink
const brickColor5 = '#ffe800'; // Yellow
const brickColor6 = '#0027FF'; // Dark Blue
const brickColor7 = '#FF00C9'; // Pink
const brickColor8 = '#FF9A00'; // Orange
let brickColors = [brickColor1, brickColor2, brickColor3, brickColor4, brickColor5, brickColor6, brickColor7, brickColor8];
let chosenBrickColor;

let score = 0;
let lives = 3;

let isPaused = false;
let mute;
let bricks=[];
let maxScore = score;

// Used to visually clean up the collisions 
const pixelOffset = 1;



// Randomise the direction of the ball at the start of the game
setBallDirection();

function playDeath()
{
	// Plays a randomo death sound
	if (!mute)
	{
		let deathSFX = new Array('audio/death.mp3', 'audio/death2.mp3');

		let randomSFX = deathSFX[Math.floor(Math.random() * deathSFX.length)];
	
		let chosenDeathSFX = new Audio(randomSFX);
	
		chosenDeathSFX.play();
	}
}

function playBrickCollision()
{
	if (!mute)
	{
		let brickCollisionSFX = new Audio('audio/brick-collision.mp3');
		brickCollisionSFX.play();
	}
}

function playPaddleCollision()
{
	/*
	if (!mute)
	{
		let brickCollisionSFX = new Audio('audio/brick-collision.mp3');
		brickCollisionSFX.play();
	}
	*/
}

function playWallCollision()
{
	if (!mute)
	{
		let wallCollisionSFX = new Audio('audio/wall-collision.mp3');
		wallCollisionSFX.play();
	}
}

function reset()
{
	if (lives <= 0) // Death reset
	{
		// Reset stats and ball position
		x = canvas.width / 2;
		y = canvas.height - 30;
		dy = -2;
		score = 0;
		lives = 3;

		// Re-enable the bricks
		for(c = 0; c < brickColumnCount; c++)
		{
			for(r = 0; r < brickRowCount; r++)
			{
				if(bricks[c][r].status == 0)
				{
					bricks[c][r].status = 1;
					let brickX = (c * (brickWidth + brickPadding) + brickOffSetLeft);
					let brickY = (r * (brickHeight + brickPadding) + brickOffSetTop);
					bricks[c][r].x = brickX;
					bricks[c][r].y = brickY;

					ctx.beginPath();
					ctx.rect(brickX,brickY,brickWidth,brickHeight);
					setBrickColor();
					ctx.fillStyle = chosenBrickColor;
					ctx.fill();
					ctx.closePath();
				}
			}
		}
	}
	
	if (lives > 0) // Normal reset
	{
		// Reset stats and ball position
		x = canvas.width / 2;
		y = canvas.height - 30;
		dy = -2;
		score = 0;
	}
}

// Used for inital ball direction
function setBallDirection()
{
	let directions = [-4, -3, -2, -1, 1, 2, 3, 4];

	let randomDirection = directions[Math.floor(Math.random() * directions.length)];

	dx = randomDirection;
}

// Used for paddle and ball collision
function setBallDirectionPositive()
{
	let directions = [1, 2, 3, 4];

	let randomDirection = directions[Math.floor(Math.random() * directions.length)];

	dx = randomDirection;
}

// Used for paddle and ball collision
function setBallDirectionNegative()
{
	let directions = [-4, -3, -2, -1];

	let randomDirection = directions[Math.floor(Math.random() * directions.length)];

	dx = randomDirection;
}

function collisonDetection()
{
	// Collision with Paddle
	if(x >= paddleX && x <= paddleX + paddleWidth && y + dy >= canvas.height - paddleHeight - ballRadius - pixelOffset)
	{
		// This fixes the bug of the ball reappearing from under the paddle
		if (y + dy < canvas.height - paddleHeight - ballRadius - pixelOffset + paddleHeight)
		{
			playPaddleCollision();
			
			// Set the ball to the opposite angle, this will give the effect of a bounce
			if (dx < 0)
			{
				setBallDirectionNegative();
			}
	
			if (dx > 0)
			{
				setBallDirectionPositive();
			}
			
			dy -= dy + 2;
		}
	}

	// Collision with ceiling
	if (y + dy <= ballRadius)
	{
		playWallCollision();

		dy -= dy - 2;
	}

	// Collision with bottom of screen
	if (y + dy >= canvas.height + paddleHeight + (ballRadius * 2))
	{		
		playDeath();	

		lives--;
		reset();
	}

	// Collision with right wall
	if (x + dx >= canvas.width - ballRadius)
	{	
		playWallCollision();

		dx -= dx + 2;
	}

	// Collision with left wall
	if (x + dx <= ballRadius)
	{
		playWallCollision();

		dx -= dx - 2;
	}

	// Collision with bricks
	for (c = 0; c < brickColumnCount; c++)
	{
		for (r = 0; r < brickRowCount; r++)
		{
			let b = bricks[c][r];

			if (b.status == 1)
			{
				// Bottom 
				if (x + dx >= b.x && x + dx <= b.x + brickWidth && y + dy >= b.y && y + dy <= b.y + brickHeight + ballRadius + pixelOffset)
				{
					playBrickCollision();

					dy -= dy - 2;
					b.status = 0;
					score++;

					if(brickColumnCount * brickRowCount == score)
					{
						playDeath();

						reset();
					}

				}

				// Top
				if (x + dx >= b.x && x + dx <= b.x + brickWidth && y + dy >= b.y - ballRadius - pixelOffset && y + dy <= b.y + brickHeight)
				{
					playBrickCollision();

					dy -= dy + 2;
					b.status = 0;
					score++;

					if (brickColumnCount * brickRowCount == score)
					{
						playDeath();

						reset();
					}
				}		

				// Left
				if (x + dx >= b.x - ballRadius - pixelOffset && x + dx <= b.x + brickWidth && y + dy >= b.y && y + dy < b.y + brickHeight)
				{
					playBrickCollision();

					dx -= dx + 2;
					b.status = 0;
					score++;

					if(brickColumnCount * brickRowCount == score)
					{
						playDeath();

						reset();
					}
				}	

				// Right
				if (x + dx >= b.x && x + dx <= b.x + brickWidth + ballRadius + pixelOffset && y + dy >= b.y && y + dy < b.y + brickHeight)
				{
					playBrickCollision();

					dx -= dx - 2;
					b.status = 0;
					score++;

					if (brickColumnCount * brickRowCount == score)
					{
						playDeath();

						reset();
					}
				}			
			}
		}
	}

	// Paddle collision with right wall
	if (rightPressed && paddleX < canvas.width - paddleWidth - borderWidth)
	{
		paddleX += paddleSpeed;
	}
	
	// Paddle collision with left wall
	if (leftPressed && paddleX > 0 + borderWidth)
	{
		paddleX -= paddleSpeed;
	}
}

for (c = 0; c < brickColumnCount; c++)
{
	bricks[c] = [];
	for (r = 0; r < brickRowCount; r++)
	{
		bricks[c][r] = {x:0, y:0, status:1};
	}
}

// Sets a random brick color, this only runs once
let setBrickColor = (function() 
{
	let executed = false;
	
	return function()
	{
		if (!executed)
		{
			executed = true;
			let chooseRandomColor = Math.floor(Math.random() * brickColors.length);
			return chosenBrickColor = brickColors[chooseRandomColor];
		}
	};
})();

function drawBricks()
{
	for (c = 0; c < brickColumnCount; c++)
	{
		for (r = 0; r < brickRowCount; r++)
		{
			if (bricks[c][r].status == 1)
			{
				let brickX = (c * (brickWidth + brickPadding) + brickOffSetLeft);
				let brickY = (r * (brickHeight + brickPadding) + brickOffSetTop);
				bricks[c][r].x = brickX;
				bricks[c][r].y = brickY;
				
				ctx.beginPath();
				ctx.rect(brickX, brickY, brickWidth, brickHeight);
				setBrickColor();
				ctx.fillStyle = chosenBrickColor;
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
	ctx.fillStyle = ballColor;
	ctx.fill();
	ctx.closePath();
}

function drawPaddle()
{
	ctx.beginPath();
	ctx.rect(paddleX, canvas.height - (paddleHeight) - paddleOffSetBottom, paddleWidth, paddleHeight);
	ctx.fillStyle = paddleColor;
	ctx.fill();
	ctx.closePath();
}

function drawScore()
{
	spanScore = document.getElementById('score').innerHTML = score;

}

function drawMaxScore()
{
	spanScore = document.getElementById('max_score').innerHTML = maxScore;

}

function drawLives()
{
	spanScore = document.getElementById('lives').innerHTML = lives;
}

function controls()
{
	document.addEventListener('keydown', 
	function(event) 
	{
		if (event.key === 'ArrowLeft' || event.key === 'A' || event.key === 'a') 
		{
			leftPressed = true;
		}
		else if (event.key === 'ArrowRight' || event.key === 'D' || event.key === 'd') 
		{
			rightPressed = true;
		}
		else if (event.key === 'Enter')
		{
			isPaused = !isPaused;
			console.log(isPaused);
		}
	});

	document.addEventListener('keyup', 
	function(event) 
	{
		if (event.key === 'ArrowLeft' || event.key === 'A' || event.key === 'a') 
		{
			leftPressed = false;
		}
		else if (event.key === 'ArrowRight' || event.key === 'D' || event.key === 'd') 
		{
			rightPressed = false;
		}
	});
}

function draw()
{
	// Update maxScore if score is greater
	maxScore = score > maxScore ? score : maxScore;

	// Check if the game is paused
	if (isPaused)
	{
		return;
	}
	
	// Main game
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawBricks();
	drawLives();
	drawBall();
	drawPaddle();
	drawScore();
	drawMaxScore();
	collisonDetection();

	// Update the mute bool based on the checkbox
	mute = document.getElementById('muteCanvasCheckbox').checked;

	// Check if the player is dead
	if(lives <= 0)
	{
		reset();
	}

	x += dx;
	y += dy;
}

// Put outside of game loop to avoid registering multiple inputs from one key press
controls();


setInterval(draw,10);
