/*
    bruteforcepi
    
    renders a pretty (svg) that uses plotting random dots to calculate pi
*/

function bruteforcepi(id, size=300) {
    this.id = id;
    this.sizeMult = 1000000;
    this.size = size * this.sizeMult;
    this.speed = 1;
    this.stepspeed = 100;
    this.lastIn = false;
    this.lastOut = false;
    
    this.getEl = function (name) {
        return document.getElementById(name);
    }
    
    this.setValue = function (name, value) {
        this.getEl(this.id + name).innerHTML = value;
    }
    
    this.getValue = function (name) {
        return parseInt(this.getEl(this.id + name).innerHTML);
    }
    
    this.incValue = function (name) {
        this.setValue(name, this.getValue(name)+1);
    }
    
    this.draw = function () {
        var el = this.getEl(this.id);
        var html = '<table><tr>';
        html += '<td><div id="' + this.id + 'draw"></div></td>';
        html += '<td>&nbsp;</td>';
        html += '<td>';
        html += 'id ' + this.id + '<br />';
        html += 'Within circle <span id="' + this.id + 'in"></span><br />';
        html += 'Total calculations <span id="' + this.id + 'total"></span><br />';
        html += '&pi; <span id="' + this.id + 'calc"></span>';
        html += '</td></tr></table>';
        el.innerHTML = html;
    }
    
    this.getCenter = function () {
        // return the coordinate of the center of the square
        return [this.size/2, this.size/2];
    }

    this.getRandCoord = function () {
        // get a random coordinate within the square
        return [Math.random() * this.size, Math.random() * this.size];
    }

    this.isIn = function (c1, c2) {
        // without even pretending to know what a circle is
        // determine if a coordinate (c1) is within a circle
        // by determining if it's distance from the center of the square (c2)
        // is equal to or less than the radius (size / 2)
        return Math.sqrt( 
            Math.pow(c1[0] - c2[0], 2)
            +
            Math.pow(c1[1] - c2[1], 2)
        ) <= this.size / 2;
    }

    this.drawPixel = function (coord, color) {
        var el = this.getEl(this.id + 'draw');
        var ctx = el.getContext("2d");
        
        ctx.strokeStyle = color;
        ctx.beginPath();
        // ugh, I have to use 2*pi (6.5 ;) (arc length in radians) to draw a round cirle 1 pixel wide :(
        ctx.arc(coord[0] / this.sizeMult, coord[1] / this.sizeMult, 1, 0, 6.5);
        ctx.stroke();
    }
    
    this.doCalc = function () {
        // pi is equal to the number of coordinates within a circle
        // divided by the number of corrdinates withing a square
        // times 4
        this.setValue('calc', (this.getValue('in') / this.getValue('total')) * 4);
    }
    
    this.init = function () {
        // initialize
        this.draw();
        var el = this.getEl(this.id + 'draw');
        var canvas = document.createElement('canvas');
        canvas.width = this.size / this.sizeMult;
        canvas.height = this.size / this.sizeMult;
        canvas.id = this.id + 'draw';
        el.parentNode.replaceChild(canvas, el);
        this.setValue('in', '0');
        this.setValue('total', '0');
        this.setValue('calc', '0');
    }
    
    this.run = function () {
        //this = instance;
        // get a random coordinate
        var coord = this.getRandCoord();
        // is it within a circle?
        var isin = this.isIn(coord, this.getCenter());
        if (isin) {
            color = this.lastIn ? '#0000FF' : '#8080FF';
            this.lastIn = !this.lastIn;
            this.incValue('in'); // increment circle within square count
        } else {
            // don't increment circle within square count
            color = this.lastOut ? '#FF0000' : '#FF8080';
            this.lastOut = !this.lastOut;
        }
        // update
        this.drawPixel(coord, color); //draw
        this.incValue('total'); // increment number of calculations
        this.doCalc(); // calculate pi
    }
    
    this.go = function () {
        var me = this;
        me.init();
        
        // run 'run' every 'speed' milliseconds
        window.setInterval(function() {
            for (var i=0; i<me.stepspeed; i++) {
                me.run();
            }
        }, me.speed);
        
        console.log('Started ' + me.id);
    }
    
    this.go();
    
}

/*
    bruteforcepimachine
    
    creates a factory of "count" workers to detrmine pi
    and averages their results to get a better result (?)
*/
function bruteforcepimachine(id, count=10, size=300) {
    this.starttime = Date.now();
    this.id = id;
    this.count = count;
    this.size = size;
    this.speed = 10;
    
    // borrow the getEl function from bruteforcepi
    this.getEl = function (name) {
        return document.getElementById(name);
    }
    
    this.calc = function() {
        var total = 0;
        var totalpi = 0;
        var el;
        var avg = this.getEl(this.id + 'average');
        var time = this.getEl(this.id + 'time');
        var complete = this.getEl(this.id + 'complete');
        var runtime = new Date(Date.now() - this.starttime);

        // total each workers calculation of pi
        for (var i = 0; i < this.count; i++) {
            el = this.getEl(this.id + 'contain' + i + 'calc');
            totalpi += parseFloat( el.innerHTML );
            el = this.getEl(this.id + 'contain' + i + 'total');
            total += parseFloat( el.innerHTML );
        }
        // the average is total work / workers
        avg.innerHTML = totalpi / count;
        var days = Math.floor(runtime / 864e5),
            hours = Math.floor(runtime % 864e5 / 36e5),
            minutes = Math.floor(runtime % 36e5 / 60000),
            seconds = Math.floor(runtime % 60000 / 1000);
        var strtime = '' + seconds + 's';
        if (minutes != 0 || hours != 0) strtime = minutes + 'm:' + strtime;
        if (hours != 0) strtime = '' + hours + 'h:' + strtime;
        if (days > 0) strtime = '' + days + ' days ' + strtime;
        time.innerHTML = strtime;
        complete.innerHTML = total;
}
    
    this.init = function() {
        this.starttiime = Date.now();
        var me = this;
        var worker;
        var el = this.getEl(this.id);
        
        // container for an "average" of pi
        var html = '<div>';
        html += 'Workers: ' + this.count + '<br />';
        html += 'Work completed: <span id="' + this.id + 'complete"></span><br />';
        html += 'Run time: <span id="' + this.id + 'time"></span><br />';
        html += 'Average &pi;: <span id="' + this.id + 'average"></span><br /><br />';
        html += '</div>';
        // build "count" containers
        for (var i = 0; i < this.count; i++) {
            html += '<div id="' + this.id + 'contain' + i + '"></div>';
        }
        el.innerHTML = html;
        // start "count" bruteforcepi's
        for (i = 0; i < this.count; i++) {
            worker = new bruteforcepi(this.id + 'contain' + i, this.size);
        }
        // binding for average
        // I can't bind to a span change so I'll rely on things are happening over time.
        // The workers could be in an inconsisent state so I'm not sure if averages help
        window.setInterval(function() {
            me.calc();
        }, me.speed);
        
    }
    
    this.init();
}

