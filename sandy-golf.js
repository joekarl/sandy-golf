//requires engine.js, chipmunk.js, sandy-golf-levels.js

SG = (function(){

    var g = {
        //canvas
        //ctx2d
        //canvasWidth
        //canvasHeight
        //debug
        //world
        //physicsSpace
        ballRadius: 2,
        PI_X2: 2 * Math.PI,
        time: 0,
        gravity: -0.05,
        updatesPerSecond : 60 //updates per second
    };

    function updateGame() {
        //step physics (already fixed timestep so step by 1)
        g.physicsSpace.step(1);

        var ball = g.world.ball;
        ball.update.call(ball);

        SG_LEVELS.update();
    }

    function drawGame(dt, ctx) {
        clearScreen(ctx);

        //render ball
        var ball = g.world.ball;
        ctx.save();
        var tx = ball.transform.x() + dt * ball.transform.vx() + g.camera.transform.x();
        var ty = -ball.transform.y() + g.canvasHeight + dt * ball.transform.vy() + g.camera.transform.y();
        ctx.translate(tx, ty);
        ball.render.call(ball, ctx);
        ctx.restore();

        var arrow = g.world.arrow;
        arrow.render.call(arrow, ctx);

        ctx.save();
        ctx.translate(g.camera.transform.x(), g.camera.transform.y() + g.canvasHeight);
        ctx.scale(1, -1);
        SG_LEVELS.draw(ctx);
        ctx.restore();
    }

    function clearScreen(ctx) {
        ctx.translate(0,0);
        ctx.scale(1,1);
        ctx.rotate(0);
        ctx.fillStyle = "#D6AD71";
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
        g.camera = new SG_ENGINE.Camera();
        initWorld();
        initMouse(canvas);
        SG_ENGINE.initGameLoop(g.updatesPerSecond, g.ctx2d, updateGame, drawGame, debug);
    }

    function initWorld() {
        g.physicsSpace = new cp.Space();
        //g.physicsSpace.iterations = 1000;
        g.physicsSpace.gravity = cp.v(0, g.gravity);

        SG_LEVELS.initLevelManager(g.physicsSpace, g.camera, g.canvasWidth);

        var spawnLocation = SG_LEVELS.getRespawnLocation();
        var spawnVecPos = cp.v(spawnLocation[0], spawnLocation[1] + g.ballRadius);

        var ballBody = g.physicsSpace.addBody(new cp.Body(50, 5));
        ballBody.setPos(spawnVecPos);
        var ballShape = g.physicsSpace.addShape(new cp.CircleShape(ballBody, g.ballRadius, cp.vzero));
        ballShape.setFriction(20);
        ballShape.setElasticity(0.15);

        g.world = {
            ball: {
                transform: new SG_ENGINE.Transform(),
                render: function(ctx) {
                    ctx.beginPath();
                    ctx.arc(0, 0, g.ballRadius, 0, g.PI_X2, false);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                },
                update: function() {
                    var pos = ballBody.getPos();
                    var vel = ballBody.getVel();
                    this.transform.x(pos.x);
                    this.transform.y(pos.y);
                    this.transform.vx(vel.x);
                    this.transform.vy(vel.y);
                }
            },
            arrow: {
                transform: new SG_ENGINE.Transform(),
                active: false,
                render: function(ctx) {
                    if(this.active) {
                        ctx.beginPath();
                        ctx.moveTo(this.transform.x(), this.transform.y());
                        ctx.lineTo(this.transform.x() + this.transform.vx(), this.transform.y() + this.transform.vy());
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
        };

    }

    function initMouse(canvas) {
        var state = 'notdragging',
            arrow = g.world.arrow,
            arrowTransform = arrow.transform;

        function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left - 5,
                y: evt.clientY - rect.top - 5
            };
        }

        canvas.addEventListener('mousedown', function(e){
            var pos = getMousePos(canvas, e);
            state = 'dragging';
            arrowTransform.x(pos.x);
            arrowTransform.y(pos.y);
            arrowTransform.vx(0);
            arrowTransform.vy(0);
            arrow.active = true;
            console.log("start drag " + pos.x + ":" + pos.y);
        });

        canvas.addEventListener('mousemove', function(e){
            var pos = getMousePos(canvas, e);
            if (state == 'dragging') {
                arrowTransform.vx(arrowTransform.x() - pos.x);
                arrowTransform.vy(arrowTransform.y() - pos.y);
                console.log("Dragging " + pos.x + ":" + pos.y);
            }
        });

        canvas.addEventListener('mouseup', function(e){
            var pos = getMousePos(canvas, e);
            state = 'notdragging';
            arrow.active = false;
            console.log("end drag " + pos.x + ":" + pos.y);
        });
    }

    return {
        init: initGame
    };
})();
