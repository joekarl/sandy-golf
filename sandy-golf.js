SG = (function(){

    var g = {
        //canvas
        //ctx2d
        //canvasWidth
        //canvasHeight
        //debug
        //world
        //physicsSpace
        ballRadius: 5,
        PI_X2: 2 * Math.PI,
        time: 0,
        updatesPerSecond : 15 //updates per second
    };

    function updateGame() {
        //step physics (already fixed timestep so step by 1)
        g.physicsSpace.step(1);

        var ball = g.world.ball;
        ball.update.call(ball);
    }

    function drawGame(dt, ctx) {
        clearScreen(ctx);

        //render ball
        var ball = g.world.ball;
        ctx.save();
        var tx = ball.x + dt * ball.dx;
        var ty = -ball.y + g.canvasHeight + dt * ball.dy;
        ctx.translate(tx, ty);
        ball.render.call(ball, ctx);
        ctx.restore();
    }

    function clearScreen(ctx) {
        ctx.translate(0,0);
        ctx.scale(1,1);
        ctx.rotate(0);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect (0, 0, g.canvasWidth, g.canvasHeight);
        ctx.fillStyle = undefined;
        ctx.strokeStyle = undefined;
    }

    function initGame(canvas, debug) {
        g.canvas = canvas;
        g.canvasWidth = canvas.width;
        g.canvasHeight = canvas.height;
        g.ctx2d = canvas.getContext('2d');
        g.debug = !!debug;
        initMouse();
        initWorld();
        initGameLoop();
    }

    function initWorld() {
        g.physicsSpace = new cp.Space();
        g.physicsSpace.gravity = cp.v(0, -1);

        var ballBody = g.physicsSpace.addBody(new cp.Body(100, 5));
        ballBody.setPos(cp.v(50,250));
        var ballShape = g.physicsSpace.addShape(new cp.CircleShape(ballBody, g.ballRadius, cp.v(50,250)));
        ballShape.setFriction(0.7);

        g.world = {
            ball: {
                //vx
                //vy
                //x
                //y
                dx: 0,
                dy: 0,
                body: ballBody,
                render: function(ctx) {
                    ctx.beginPath();
                    ctx.arc(0, 0, g.ballRadius, 0, g.PI_X2, false);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                },
                update: function() {
                    var pos = this.body.getPos();
                    var vel = this.body.getVel();
                    this.x = pos.x;
                    this.y = pos.y;
                    this.dx = vel.x;
                    this.dy = vel.y;
                }
            }
        };
    }

    function initMouse() {

    }

    function initGameLoop() {
        var loops = 0,
            skipTicks = 1000 / g.updatesPerSecond, //in milliseconds
            maxFrameSkip = 10,
            nextGameTick = new Date().getTime()
            ctx = g.ctx2d,
            fpsStats = {};

        if (g.debug) {
            fpsStats = new Stats();
            fpsStats.setMode(0);

            // Align top-left
            fpsStats.domElement.style.position = 'absolute';
            fpsStats.domElement.style.left = '0px';
            fpsStats.domElement.style.top = '0px';
            document.body.appendChild(fpsStats.domElement);
        } else {
            fpsStats.begin = fpsStats.end = function(){/*noop*/};
        }

        var _loop = function() {
            fpsStats.begin();
            loops = 0;
            var currentTime = new Date().getTime();

            while (currentTime > nextGameTick && loops < maxFrameSkip) {
                updateGame(skipTicks);
                nextGameTick += skipTicks;
                if (nextGameTick < currentTime) {
                    nextGameTick = currentTime + skipTicks;
                }
                loops++;
            }

            var interpolation = (nextGameTick - currentTime) / skipTicks;
            interpolation = interpolation > 1 ? 1 : interpolation;
            interpolation = interpolation < 0 ? 0 : interpolation;
            drawGame(interpolation, ctx);
            fpsStats.end();
            window.requestAnimationFrame(_loop);
        };
        _loop();
    }

    return {
        init: initGame
    };
})();
