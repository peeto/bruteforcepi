/*
    BruteForcePi
    
    renders pretty circles (svg) that uses brute force to calculate pi
*/

function BruteForcePi(id, size=300) {
    this.id = id;
    this.size = size;
    
    this.getMax = () => Math.pow(10, this.resolution * 1);
    
    this.getCenter = () => [this.getMax() / 2, this.getMax() / 2];

    this.getCoords = () => [this.x, this.y];

    this.isIn = (c1, c2) => Math.sqrt(
            Math.pow(c1[0] - c2[0], 2)
            +
            Math.pow(c1[1] - c2[1], 2)
        ) <= this.getMax() / 2;
    
    this.doCalc = () => (this.inPI / this.count) * 4;

    this.getEl = name => document.getElementById( name );
    
    this.draw = () => {
        var el = this.getEl(this.id);
        var html = '<table>';
        html += '<tr><td><div id="' + this.id + 'draw"></div></td></tr>';
        html += '<tr><td>&nbsp;</td></tr>';
        html += '<tr><td><div id="' + this.id + 'history"></div></td></tr>';
        html += '</table>';
        el.innerHTML = html;
        
        var el = this.getEl(this.id + 'draw');
        var canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        canvas.id = this.id + 'draw';
        el.parentNode.replaceChild(canvas, el);
    };
    
    this.drawPixel = (coord, color) => {
        var el = this.getEl(this.id + 'draw');
        var ctx = el.getContext("2d");
        
        const hexToRgb = hex =>
            hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
             ,(m, r, g, b) => '#' + r + r + g + g + b + b)
            .substring(1).match(/.{2}/g)
            .map(x => parseInt(x, 16))
        
        let c = hexToRgb(color);
        let x = parseInt((coord[0] * this.size) / this.getMax());
        let y = parseInt((coord[1] * this.size) / this.getMax());
        ctx.fillStyle = "rgba("+c[0]+","+c[1]+","+c[2]+",255)";
        ctx.fillRect( x, y, 1, 1 );
    };
    
    this.clearCanvas = () => {
        var el = this.getEl(this.id + 'draw');
        const context = el.getContext('2d');
        context.clearRect(0, 0, this.size, this.size);
        
    };
    
    this.updateHistory = () => {
        let d = new Date();
        
        const numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        var el = this.getEl(this.id + 'history');
        var html = '<div>';
        html += this.resolution + ': ';
        html += '&pi;: ' + this.doCalc();
        html += ' Calculations: 10<sup>' + (this.resolution * 2) + '</sup>';
        let time = d.getTime() - this.startTime;
        html += ' Time (ms): ' + numberWithCommas(time);
        let perf = numberWithCommas(Math.round((Math.pow(10, this.resolution * 2) / (time / 1000))));
        html += ' Calcs per second: ~' + perf;
        html += '</div>' + el.innerHTML;
        el.innerHTML = html;
        
        this.startTime = 0;
    };
    
    this.dowWork = () => {
        var coord = this.getCoords();
        // is it within a circle?
        var isin = this.isIn(coord, this.getCenter());
        if (isin) {
            color = this.lastIn ? '#0000FF' : '#8080FF';
            this.lastIn = !!Math.floor(Math.random() * 2);
            this.inPI++;
        } else {
            // don't increment circle within square count
            color = this.lastOut ? '#FF0000' : '#FF8080';
            this.lastOut = !!Math.floor(Math.random() * 2);
        }
        // update
        this.count++;
        this.drawPixel(coord, color); // draw
        this.x++;
        // Check for new line
        if (this.x == this.getMax()) {
            this.x = 0;
            this.y++;
        }
    };
    
    this.init = () => {
        // initialize
        this.resolution = 1;
        this.x = 0;
        this.y = 0;
        this.count = 0;
        this.inPI = 0;
        this.lastIn = false;
        this.lastOut = false;
        this.workRate = 10000; // iterations per thread
        this.resolutionDelay = 2000; // delay (ms) between complete circles
        this.startTime = 0;
        // init UI
        this.draw();
    };
    
    this.run = me => {
        // If re/starting set start time and clear canvas
        if (me.startTime == 0) {
            let d = new Date();
            me.startTime = d.getTime();
            me.clearCanvas();
        }
        
        // Do me.workRate calc's in current thread
        while (me.y < me.getMax() && me.count % me.workRate) {
            me.dowWork();
        }
        // End this thread and start new thread to give the browser a break
        if (me.y < me.getMax()) {
            me.dowWork();
            
            window.setTimeout(me.run, 1, me);
        } else { // Complete calcs and start again at higher res
            me.y = 0;

            me.updateHistory();
            
            me.resolution++;
            me.count = 0;
            me.inPI = 0;
            
            window.setTimeout(me.run, me.resolutionDelay, me);
        }
    };
    
    this.go = () => {
        var me = this;
        me.init();
        
        window.setTimeout(me.run, 1, me);
        console.log('Started ' + me.id);
    };
    
    this.go();
    
}
