//require chipmunk.js

SG_LEVELS = (function(){

    var g = {
        //previousLevel
        //currentLevel
        //nextLevel
        //physicsSpace
        //camera
        levels: [], //list of levels
        currentLevelIndex: 1, //index of level currently on
        animatingLevelTransition: false, //are we currently animating levels
        groundFriction: 1,
        groundElasticity: 2
    };

    function LevelPart(x1, y1, x2, y2, x3, y3, x4, y4, offsetX, offsetY) {

        return {
            x1: x1,
            x2: x2, 
            x3: x3,
            x4: x4,
            y1: y1,
            y2: y2, 
            y3: y3,
            y4: y4,
            //physics: physics
            initPhysics: function() {
                var physics = g.physicsSpace.addStaticShape(
                    new cp.PolyShape(g.physicsSpace.staticBody, 
                        [x1,y1,x2,y2,x3,y3,x4,y4], cp.v(offsetX, offsetY)));
                physics.setFriction(g.groundFriction);
                physics.setElasticity(g.groundElasticity);
                this.physics = physics;
            },
            destroyPhysics: function() {
                g.physicsSpace.removeStaticShape(this.physics);
            }
        };
    }

    function Level(levelParts, startx, starty) {
        return {
            draw: function(ctx, offset) {
                ctx.fillStyle = "#D68A44";
                levelParts.forEach(function(part){
                    ctx.beginPath();
                    ctx.moveTo(part.x1 + offset, part.y1);
                    ctx.lineTo(part.x2 + offset, part.y2);
                    ctx.lineTo(part.x3 + offset, part.y3);
                    ctx.lineTo(part.x4 + offset, part.y4);
                    ctx.lineTo(part.x1 + offset, part.y1);
                    ctx.fill();
                    ctx.closePath();
                });
            },
            startx: startx,
            starty: starty,
            initPhysics: function(){
                levelParts.forEach(function(part){
                    part.initPhysics();
                });
            },
            destroyPhysics: function() {
                levelParts.forEach(function(part){
                    part.destroyPhysics();
                });
            }
        };
    }

    function updateLevels() {
        if(g.animatingLevelTransition) {

        } else {
            //do nothing...
        }
    }

    function drawLevels(ctx) {
        g.previousLevel.draw(ctx, -g.levelWidth);
        g.currentLevel.draw(ctx, 0);
        if (g.nextLevel) {
            g.nextLevel.draw(ctx, g.levelWidth);
        }
    }

    /*
        advance the level or 
    */
    function advanceLevel() {
        if (++currentLevelIndex > g.levels.length) {
            return false;
        }
        g.previousLevel.destroyPhysics();
        g.previousLevel = g.currentLevel;
        g.currentLevel = g.nextLevel;
        g.nextLevel = g.levels[g.currentLevelIndex];
        g.nextLevel.initPhysics();
        return true;
    }

    /*
        physicsSpace: chipmunk physics space to attach levels to
    */
    function initLevelManager(physicsSpace, camera, levelWidth) {
        g.physicsSpace = physicsSpace;
        g.camera = camera;
        g.levelWidth = levelWidth;
        g.levels.push(level0());
        g.levels.push(level1());
        g.levels.push(level2());
        g.levels.push(level3());
        g.levels.push(level4());
        g.previousLevel = g.levels[g.currentLevelIndex - 1];
        g.previousLevel.initPhysics();
        g.currentLevel = g.levels[g.currentLevelIndex];
        g.currentLevel.initPhysics();
        g.nextLevel = g.levels[g.currentLevelIndex + 1];
        g.nextLevel.initPhysics();
    }

    function level0() {
        return new Level(
            [
                new LevelPart(0,50, g.levelWidth,50, g.levelWidth,0, 0,0, -1 * g.levelWidth, 0)
            ], 20, 50);
    }

    function level1() {
        return new Level(
            [
                new LevelPart(0,50, g.levelWidth,50, g.levelWidth,0, 0,0, 0 * g.levelWidth, 0)
            ], 50, 50);
    }

    function level2() {
        return new Level(
            [
                new LevelPart(0,50, g.levelWidth,50, g.levelWidth,0, 0,0, 1 * g.levelWidth, 0)
            ], 20, 50);
    }

    function level3() {
        return new Level(
            [
                new LevelPart(0,50, g.levelWidth,50, g.levelWidth,0, 0,0, 2 * g.levelWidth, 0)
            ], 20, 50);
    }

    function level4() {
        return new Level(
            [
                new LevelPart(0,50, g.levelWidth,50, g.levelWidth,0, 0,0, 3 * g.levelWidth, 0)
            ], 20, 50);
    }

    return {
        initLevelManager: initLevelManager,
        draw: drawLevels,
        update: updateLevels,
        isAnimatingLevelTransition: function(){return g.isAnimatingLevelTransition;},
        getRespawnLocation: function(){return [g.currentLevel.startx, g.currentLevel.starty];}
    };
})();