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
        groundFriction: 50000,
        groundElasticity: 2
    };

    function LevelPart(x1, y1, x2, y2, x3, y3, x4, y4) {

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
            initPhysics: function(offsetX, offsetY) {
                var physics = g.physicsSpace.addStaticShape(
                    new cp.PolyShape(g.physicsSpace.staticBody, 
                        [x1,y1,x2,y2,x3,y3,x4,y4], cp.v(offsetX, offsetY)));
                physics.setFriction(g.groundFriction);
                physics.setElasticity(g.groundElasticity);
                this.physics = physics;
                console.log(physics.getBB());
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
            initPhysics: function(offsetX, offsetY){
                levelParts.forEach(function(part){
                    part.initPhysics(offsetX, offsetY);
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
        g.nextLevel.initPhysics((g.currentLevelIndex + 1) * g.levelWidth, 0);
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
        g.previousLevel = g.levels[0];
        g.previousLevel.initPhysics(-g.levelWidth, 0);
        g.currentLevel = g.levels[1];
        g.currentLevel.initPhysics(0, 0);
        g.nextLevel = g.levels[2];
        g.nextLevel.initPhysics(g.levelWidth, 0);
    }

    /*
        Levels assume level width of 800...
    */
    function level0() {
        return new Level(
            [
                new LevelPart(0,50, 800,50, 800,0, 0,0)
            ], 20, 50);
    }

    function level1() {
        var cup = cupLevelParts(655,50,10,10);
        return new Level(
            [
                new LevelPart(0,50, 250,50, 250,0, 0,0),
                new LevelPart(250,50, 280,70, 280,0, 250,0),
                new LevelPart(280,70, 300,70, 300,0, 280,0),
                new LevelPart(300,70, 350,50, 350,0, 300,0),
                new LevelPart(350,50, 450,50, 450,0, 350,0),
                new LevelPart(450,50, 645,75, 645,0, 450,0),
                new LevelPart(645,50, 650,50, 650,0, 645,0),
                cup[0],
                cup[1],
                new LevelPart(660,50, 800,50, 800,0, 660,0)
            ], 310, 50);
    }

    function level2() {
        return new Level(
            [
                new LevelPart(0,50, 800,50, 800,0, 0,0)
            ], 20, 50);
    }

    function level3() {
        return new Level(
            [
                new LevelPart(0,50, 800,50, 800,0, 0,0)
            ], 20, 50);
    }

    function level4() {
        return new Level(
            [
                new LevelPart(0,50, 800,50, 800,0, 0,0)
            ], 20, 50);
    }

    function cupLevelParts(x, y, width, depth) {
        var cupDip = 4;
        return [
            new LevelPart(x-width,y-depth, x+2,y-depth-cupDip, x+2,y-10000, x-width,y-10000),
            new LevelPart(x-2,y-depth-cupDip, x+width,y-depth, x+width,y-10000, x-2,y-10000)
        ];
    }

    return {
        initLevelManager: initLevelManager,
        draw: drawLevels,
        update: updateLevels,
        isAnimatingLevelTransition: function(){return g.isAnimatingLevelTransition;},
        getRespawnLocation: function(){return [g.currentLevel.startx, g.currentLevel.starty];}
    };
})();