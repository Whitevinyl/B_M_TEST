function Point( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
}


function Vector( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
}


function logPosition(minpos,maxpos,minval,maxval,value) {
    var minlval = Math.log(minval);
    var maxlval = Math.log(maxval);
    var scale = (maxlval - minlval) / (maxpos - minpos);
    return minpos + (Math.log(value) - minlval) / scale;
}


function valueInRange(value,floor,ceiling) {
    if (value < floor) {
        value = floor;
    }
    if (value> ceiling) {
        value = ceiling;
    }
    return value;
}


// LERP TWEEN / EASE //
function lerp(current,destination,speed) {
    return current + (((destination-current)/100) * speed);
}


function stripUriMeta(uri) {
    return uri.split(',')[1];
}


function fmod(a,b) {
    return a % b;
}


function arg(a,b) {
    if (a !== undefined || null) {
        return a;
    } else {
        return b;
    }
}


module.exports = {
    Point: Point,
    Vector: Vector,
    TAU: 2*Math.PI,

    logPosition: logPosition,
    valueInRange: valueInRange,
    lerp: lerp,
    stripUriMeta: stripUriMeta,
    fmod: fmod,
    arg: arg
};