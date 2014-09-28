//requires stats.js for debug mode

SG_ENGINE = (function(){

    /*
        Represents a camera
        Has a transform that represents it's current location
    */
    function Camera() {
        var _camera = {};
        _camera.transform = new Transform();

        return _camera;
    }

    /*
        Object representing a 2d location, angle, velocity, scale in space
        Create a Transform with `new Transform()`
    */
    function Transform() {
        var _x = 0, 
            _y = 0, 
            _vx = 0, 
            _vy = 0, 
            _sx = 1, 
            _sy = 1,
            _angle = 0,
            _va = 0;

        return {
            copy: function(transform) {
                if (transform) {
                    _x = transform.x();
                    _y = transform.y();
                    _vx = transform.vx();
                    _vy = transform.vy();
                    _sx = transform.sx();
                    _sy = transform.sy();
                    _angle = transform.angle();
                    _va = transform.va();
                }
                return this;
            },
            distance: function(transform) {
                return Math.sqrt(
                    Math.pow(transform.x() - _x, 2) + Math.pow(transform.y() - _y, 2)
                );
            },
            x: function(_) {
                if (_ != undefined) {
                    _x = _;
                    return this;
                } else {
                    return _x;
                }
            },
            y: function(_) {
                if (_ != undefined) {
                    _y = _;
                    return this;
                } else {
                    return _y;
                }
            },
            vx: function(_) {
                if (_ != undefined) {
                    _vx = _;
                    return this;
                } else {
                    return _vx;
                }
            },
            vy: function(_) {
                if (_ != undefined) {
                    _vy = _;
                    return this;
                } else {
                    return _vy;
                }
            },
            sx: function(_) {
                if (_ != undefined) {
                    _sx = _;
                    return this;
                } else {
                    return _sx;
                }
            },
            sy: function(_) {
                if (_ != undefined) {
                    _sy = _;
                    return this;
                } else {
                    return _sy;
                }
            },
            angle: function(_) {
                if (_ != undefined) {
                    _angle = _;
                    return this;
                } else {
                    return _angle;
                }
            },
            va: function(_) {
                if (_ != undefined) {
                    _va = _;
                    return this;
                } else {
                    return _va;
                }
            }
        };
    }

    /*
        Start game
        updatesPerSecond : desired update rate
        ctx2d : render context (eg. from canvas)
        updateGameFn : function called on game update
        renderGameFn : function called on game render, will be passed interpolation (0-1) and render ctx
        debug : if true, turn on fps stats
    */
    function initGameLoop(
            updatesPerSecond, 
            ctx2d, 
            updateGameFn, 
            renderGameFn, 
            debug) {

        var loops = 0,
            skipTicks = 1000 / updatesPerSecond, //in milliseconds
            maxFrameSkip = 10,
            nextGameTick = new Date().getTime()
            fpsStats = {};

        if (debug) {
            fpsStats = new Stats();
            fpsStats.setMode(0);

            // Align top-left
            fpsStats.domElement.style.position = 'fixed';
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
                updateGameFn(skipTicks);
                nextGameTick += skipTicks;
                if (nextGameTick < currentTime) {
                    nextGameTick = currentTime + skipTicks;
                }
                loops++;
            }

            var interpolation = (nextGameTick - currentTime) / skipTicks;
            interpolation = interpolation > 1 ? 1 : interpolation;
            interpolation = interpolation < 0 ? 0 : interpolation;
            renderGameFn(interpolation, ctx2d);
            fpsStats.end();
            window.requestAnimationFrame(_loop);
        };
        _loop();
    }

    return {
        initGameLoop: initGameLoop,
        Transform: Transform,
        Camera: Camera
    };
})();