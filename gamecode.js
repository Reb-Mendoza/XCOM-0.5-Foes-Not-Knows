let turnStep = 0;
let abilityButtonCount = 0;
let selected = {X: 0, Y: 0};
let operator = {ID: [], Action: [], MaxAmmo: [], Ammo: [], MaxMoves: [], Moves: [], MaxHP: [], HP: [], X: [], Y: []};
let alien = {ID: [], Action: [], MaxMoves: [], Moves: [], MaxHP: [], HP: [], X: [], Y: []};
let buttonsPressable = 0;
let controlMode = 0;
//Vertical walls are described by the coordinate to the left of the wall. Horizontal walls are described by the coordinate below the wall.
let wall = {vertical: {X: [4], Y:[3]}, horizontal: {X: [], Y:[]}};
let smoke = {X: [], Y:[]};

//Causes the textbow in the HUD to change.
function text(value) {
    var HUDText = string(value);
    var entity = document.querySelector('#hudText');
    entity.setAttribute("value", HUDText);
}
//Returns the absolute value of a number input. Output: Number
function abs(x) {
    if (x < 0) {
        x = x * -1
    }
    return x
}

//Returns the distance between two number inputs. Output Number
function dist(x,targetX) {
    return abs(targetX - x);
}

//Returns what team or what unit index is on a given tile. Output: String
function checkTile(x,y,type) {
    var faction
    var index
    for (i=0; i < operator.X.length; i++) {
        checkX = (operator.X[i]);
        for (j=0; j < operator.Y.length; j++) {
            checkY = (operator.Y[j]);
            if (checkX == x && checkY == y) {
                faction = "operator";
                index = j;
            }
        }
    }
    for (i=0; i < alien.X.length; i++) {
        checkX = (alien.X[i]);
        for (j=0; j < alien.Y.length; j++) {
            checkY = (alien.Y[j]);
            if (checkX == x && checkY == y) {
                faction = "operator";
                index = j;
            }
        }
    }
    if (type == "faction") {
        return faction;
    } else if (type == "index") {
        return index;
    }
}

//Returns whether or not there is a wall on a tile, given a position and a direction. Output: Boolean
function checkIfWall(x,y,direction) {
    if (direction == "vertical") {
        for (k=0; k < wall.vertical.X; k++) {
            if ((wall.vertical.X[k] == x) && (wall.vertical.Y[k] == y)) {
                return true;
            }
        }
        return false;
    } else if (direction == "horizontal") {
        for (k=0; k < wall.horizontal.X; k++) {
            if ((wall.horizontal.X[k] == x) && (wall.horizontal.Y[k] == y)) {
                return true;
            }
        }
        return false;
    }
}

//Returns whether or not there is a line of fire between two points given an initial position, a target position, and a sight range. Output: Boolean
function canHit(x,y,targetX,targetY,range) {
    if ((dist(x,targetX) > 1) && (dist(y,targetY) > 1)) {
        return false;
    } else if ((dist(x,targetX) <= range) && (dist(y,targetY) <= range)) {
        return true;
    } else {
        return false;
    }
}

//Returns whether or not there is a line of sight between two points given an initial position, a target position, and a sight range. Output: Boolean
//This differs from canHit in that it considers how walls and smoke block vision between those two points.
function canSee(x,y,targetX,targetY,range) {
    if (canHit(x,y,targetX,targetY,range) == true) {
        //Corner case.
        if ((dist(x,targetX) == 1) && (dist(y,targetY) == 1)) {
            let verticalCheck = true;
            let horizontalCheck = true;
            let verticalVar = 0;
            let horizontalVar = 0;
            if (x > targetX) {
                verticalVar = -1;
            }
            if (y > targetY) {
                horizontalVar = -1;
            }
            if ((checkIfWall((x+verticalVar),(y+((horizontalVar*2)+1)),"vertical")) == true) {
                verticalCheck = false;
            }
            if ((checkIfWall((x+((verticalVar*2)+1)),(y+horizontalVar),"horizontal")) == true) {
                horizontalCheck = false;
            }
            if ((horizontalCheck == false) && (verticalCheck == false)) {
                return false;
            }
        //Straight line case.
        } else if ((x == targetX) || (y == targetY)) {
            if (x == targetX) {
                if (y < targetY) {
                    console.log("for")
                    for (i=0; i < dist(y,targetY); i++) {
                        if (checkIfWall(x,y+j,"horizontal")) {
                            return false;
                        }
                    }
                }
                if (y > targetY) {
                    for (i=0; i < dist(y,targetY); i++) {
                        if (checkIfWall(x,y-(i+1),"horizontal") == true) {
                            return false;
                        }
                    }
                }
                return true;
            } else if (y == targetY) {
                if (x < targetX) {
                    for (i=0; i < dist(x,targetX); i++) {
                        if (checkIfWall(x+i,y,"vertical") == true) {
                            return false;
                        }
                    }
                }
                if (x > targetX) {
                    for (i=0; i < dist(x,targetX); i++) {
                        if (checkIfWall(x-(i+1),y,"vertical") == true) {
                            return false;
                        }
                    }
                }
                return true;
            }
        //Skewed shot case.
        } else {
            var verticalVar = 0;
            var horizontalVar = 0;
            var index = 0;
            if (x > targetX) {
                verticalVar = -1;
            }
            if (y > targetY) {
                horizontalVar = -1;
            }
            if (dist(x,targetX) == 1) {
                for (j=1; j < dist(y,targetY); j++) {
                    if (y > targetY) {
                        index = j * -1;
                    } else {
                        index = j;
                    }
                    if ((canSee(x,y,x,targetY-index,(targetY-index-y)) == true) && ((checkIfWall((x+verticalVar),(targetY-index),"vertical")) == false) && (canSee((x+((verticalVar*2)+1)),(targetY-index),targetX,targetY,(index)))) {
                        return true;
                    }
                }
                return false;
            } else if (dist(y,targetY) == 1) {
                for (j=1; j < dist(x,targetX); j++) {
                    if (x > targetX) {
                        index = j * -1;
                    } else {
                        index = j;
                    }
                    if ((canSee(x,y,targetX-index,y,(targetX-index-x)) == true) && ((checkIfWall((targetX-index),(y+horizontalVar),"horizontal")) == false) && (canSee((targetX-index),(y+((horizontalVar*2)+1)),targetX,targetY,(index)))) {
                        return true;
                    }
                }
                return false;
            }
        }
    } else {
        return false;
    }
}

//This function is called when a unit is meant to be killed. If it's an alien, it is removed from the game. If it's an operator, they enter a DBNO state.
function kill(x,y) {
    var index = (checkTile(x,y,"index"));
    if (checkTile(x,y,"faction") == "operator") {

    } else if (checkTile(x,y,"faction") == "alien") {
        alien.HP.splice(index,1)
        alien.X.splice(index,1)
        alien.Y.splice(index,1)
    }

}

//Reduce the HP stat of a unit by a specified amount. If its HP reaches below 1, kill it.
function damage(x,y,amount) {
    var index = (checkTile(x,y,"index"));
    var newHP;
    if (checkTile(x,y,"faction") == "operator") {
        operator.HP[index] = operator.HP[index] - amount;
        newHP = operator.HP[index];
    } else if (checkTile(x,y,"faction") == "alien") {
        alien.HP[index] = alien.HP[index] - amount;
        newHP = alien.HP[index];
    }
    if (newHP < 1) {
        kill(x,y);
    }
}

//Increase the HP stat of a unit by a specified amount, up to a cap.
function heal(x,y,amount) {
    var index = (checkTile(x,y,"index"));
    if (checkTile(x,y,"faction") == "operator") {
        if ((operator.HP[index] + amount) > operator.MaxHP[index]) {
            amount = operator.MaxHP[index] - operator.HP[index]
        }
        operator.HP[index] = operator.HP[index] + amount;
    } else if (checkTile(x,y,"faction") == "alien") {
        if ((alien.HP[index] + amount) > alien.MaxHP[index]) {
            amount = alien.MaxHP[index] - alien.HP[index]
        }
        alien.HP[index] = alien.HP[index] + amount;
    }
}

//Move a unit one space in a given direction.
function move(x,y,direction) {
    var index = checkTile(x,y,"index");
    var faction = checkTile(x,y,"faction");
    if (direction == "up") {
        if (faction == "operator") {
            operator.Y[index] = operator.Y[index] + 1;
        } else if (faction == "alien") {
            alien.Y[index] = alien.Y[index] + 1;
        }
    } else if (direction == "down") {
        if (faction == "operator") {
            operator.Y[index] = operator.Y[index] - 1;
        } else if (faction == "alien") {
            alien.Y[index] = alien.Y[index] - 1;
        }
    } else if (direction == "left") {
        if (faction == "operator") {
            operator.X[index] = operator.X[index] - 1;
        } else if (faction == "alien") {
            alien.X[index] = alien.X[index] - 1;
        }
    } else if (direction == "right") {
        if (faction == "operator") {
            operator.X[index] = operator.X[index] + 1;
        } else if (faction == "alien") {
            alien.X[index] = alien.X[index] + 1;
        }
    }
}

//Check whether or not a shot that has been fired hits. Output: Boolean
function toHit(x,y,targetX,targetY,weapon) {
    
}

//Check what type of unit has been selected. If it's an operator, show its controls. If it's an alien, show its description, ONLY if it had line of sight.
function selectUnit(x,y) {
    if (checkTile(x,y,"faction") == "operator") {
        selected.X = x
        selected.Y = y
        showButtons();
    } else if (checkTile(x,y,"faction") == "alien") {
        selected.X = x
        selected.Y = y
        hideButtons();
    }
}

//Check what action is tied to which button in the HUD, then call that action to be performed.
function action(buttonNumber) {
    console.log("action" + toString(buttonNumber))
    //Movement
    if (buttonNumber == 1) {
        controlMode = 1;
        text("WASD - Operator moves one tile in that dierection, if possible.\nEsc - Cancel movement.");
    //Fire Weapon
    } else if (buttonNumber == 2) {
        if ((operator.Action[checkTile(selected.X, selected.Y, "index")]) == 2) {
            if ((operator.Ammo[checkTile(selected.X, selected.Y, "index")]) > 0) {
                controlMode = 2;
                text("Click to select a target for your operator to aim at.\nEsc - Cancel action");
            } else {
                text("Operator needs to reload their weapon before firing.");
            }
        } else {
            text("Operator does not have enough time this turn to fire their weapon.");
        }
    } else if (buttonNumber == 3) {

    } else if (buttonNumber == 4) {

    } else if (buttonNumber == 5) {

    } else if (buttonNumber == 6) {

    } 
}

//Show HUD buttons. Based on which operator you've selected.
function showButtons() {
    buttonsPressable = 1;
    
}

//Hide HUD buttons.
function hideButtons() {
    buttonsPressable = 0;

}

AFRAME.registerComponent("controls", {
    init: function () {
        //Actions
        this.el.addEventListener("keydown:Digit1", function() {
            console.log("1 pressed!");
            if (buttonsPressable == 1) {
                action(1);
            }
        });
        this.el.addEventListener("keydown:Digit2", function() {
            console.log("2 pressed!");
            if (buttonsPressable == 1) {
                action(2);
            }
        });
        this.el.addEventListener("keydown:Digit3", function() {
            console.log("3 pressed!");
            if (buttonsPressable == 1) {
                action(3);
            }
        });
        this.el.addEventListener("keydown:Digit4", function() {
            console.log("4 pressed!");
            if (buttonsPressable == 1) {
                action(4);
            }
        });
        this.el.addEventListener("keydown:Digit5", function() {
            console.log("5 pressed!");
            if (buttonsPressable == 1) {
                action(5);
            }
        });
        this.el.addEventListener("keydown:Digit6", function() {
            console.log("6 pressed!");
            if (buttonsPressable == 1) {
                action(6);
            }
        });
        //Movement Actions
        this.el.addEventListener("keydown:KeyW", function() {
            console.log("W pressed!");
            if (controlMode == 1) {
                move(selected.X, selected.Y, "up");
            }
        });
        this.el.addEventListener("keydown:KeyA", function() {
            console.log("A pressed!");
            if (controlMode == 1) {
                move(selected.X, selected.Y, "left");
            }
        });
        this.el.addEventListener("keydown:KeyS", function() {
            console.log("S pressed!");
            if (controlMode == 1) {
                move(selected.X, selected.Y, "down");
            }
        });
        this.el.addEventListener("keydown:KeyD", function() {
            console.log("D pressed!");
            if (controlMode == 1) {
                move(selected.X, selected.Y, "right");
            }
        });
        //Other
        this.el.addEventListener("keydown:Escape", function() {
            console.log("Esc pressed!");
            if (controlMode != 0) {
                controlMode = 0;
            }
        });
        this.el.addEventListener("keydown:Escape", function() {
            console.log("Esc pressed!");
            if (controlMode == 1) {
                action(6);
            }
        });
    }
});

AFRAME.registerComponent("ability-button", {
    schema: {
        number: {type: 'number', default: 0}
    },
    init: function () {
        var buttonNumber = el.getAttribute('number');
        this.el.addEventListener("click", function() {
            if (buttonsPressable == 1) {
                action(buttonNumber);
            }
        });
    }
});

AFRAME.registerComponent("unit", {
    schema: {
        x: {type: 'number', default: 1},
        y: {type: 'number', default: 1},
      },
    init: function () {
        this.el.addEventListener("click", function() {
            var xValue = el.getAttribute('x');
            var yValue = el.getAttribute('y');
            selectUnit(xValue,yValue);
        });
    }
});