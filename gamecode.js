let turnStep = 0;
let operator = {ID: [], HP: [], X: [], Y: []};
let alien = {ID: [], HP: [], X: [], Y: []};
//Vertical walls are described by the coordinate to the left of the wall. Horizontal walls are described by the coordinate below the wall.
let wall = {vertical: {X: [4], Y:[3]}, horizontal: {X: [], Y:[]}};
let smoke = {X: [], Y:[]};


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

//Returns what team or what unit ID is on a given tile. Output: String
function checkTile(x,y,type) {
    var faction
    var ID
    for (i=0; i < operator.X.length; i++) {
        checkX = (operator.X[i]);
        for (j=0; j < operator.Y.length; j++) {
            checkY = (operator.Y[j]);
            if (checkX == x && checkY == y) {
                faction = "operator";
                ID = j+1;
            }
        }
    }
    for (i=0; i < alien.X.length; i++) {
        checkX = (alien.X[i]);
        for (j=0; j < alien.Y.length; j++) {
            checkY = (alien.Y[j]);
            if (checkX == x && checkY == y) {
                faction = "operator";
                ID = j+1;
            }
        }
    }
    if (type == "faction") {
        return faction;
    } else if (type == "ID") {
        return ID;
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

console.log(canSee(1,1,5,2,10));
//This function is called when a unit is meant to be killed. If it's an alien, it is removed from the game. If it's an operator, they enter a DBNO state.
function kill(x,y) {
    
}