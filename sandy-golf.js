SG = (function(){

    var g = {
        //canvas
        //ctx2d
        //canvasWidth
        //canvasHeight
        //debug
        //world
        //physics
        PI_X2: 2 * Math.PI,
        updateInterval : 15 //updates per second
    };

    function updateGame() {
        var ball = g.world.ball;
        ball.update.call(ball);
    }

    function drawGame(dt, ctx) {
        var ball = g.world.ball;
        ctx.save();
        //change coordinate system
        ball.render.call(ball, dt, ctx);
        ctx.restore();
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
        g.world = {
            ball: {
                x: 50,
                y: 50,
                radius: 5,
                render: function(dt, ctx) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, g.PI_X2, false);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                },
                update: function() {

                }
            }
        };
    }

    function initMouse() {

    }

    function initGameLoop() {
        var loops = 0,
            skipTicks = 1000 / g.updateInterval,
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
