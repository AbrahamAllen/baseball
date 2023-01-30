
function num(input, txt = 'px'){
	
	let output = input.replace(txt, '');
	return parseInt(output);
}

function popup(txt, func = false){
	try{document.getElementById('popup').remove()}catch{};
	
	let msg = new DOM(document.body, 'popup', func);
	if(!func){setTimeout(function(){msg.dom.remove()}, 750)};
	msg.dom.style.backgroundImage = 'url("assets/'+txt+'.png")';
	
	
}


class DOM{
	constructor(parent, id, onclick = false, oncontextmenu = false){
		this.dom = document.createElement('div');
		this.dom.id = id;
		this.dom.className = 'unit';
		this.dom.style.backgroundImage = 'url("assets/'+id+'.png")';
		this.dom.onclick = onclick;
		this.dom.oncontextmenu = oncontextmenu;
		parent.appendChild(this.dom);
	}
}

class offense{
	constructor(){
		this.runners = new Object();
		this.track = new RunnerTracker();
		this.holdcount = false;
		
	}
	
	control(){
	try{	
		if(event.type == 'mousemove'){
			off.selected.Minput();
		}else if(event.button == 0){
			off.selected.LCinput();
		}else{
			off.selected.RCinput();
		}
	}catch{
		
	}
	}
	
	makeRunners(){
		let runners = Object.values(this.runners);
		for(let runner of runners){
			if(runner){
				runner.build();
				runner.run();
			}
		}
	}
	
	makeminis(){
		let runners = Object.values(this.runners);
		for(let runner of runners){
			if(runner){
				runner.mini.build();
			}
		}
	}
	
	clearRunners(){
		for(let runner of Object.values(this.runners)){
			if(runner){
				runner.destroy();
			}
		}
	}
	
	resetRunners(){
		this.selected.backAll();
		for(let runner of Object.keys(this.runners)){
			if(runner.loc){runner.force = true}
		}
	}
	
	
}

class defense{
	constructor(){
		this.bases = {'first' : new Base('first'), 'second' : new Base('second'), 'third' : new Base('third'), 'home' : new Base('home')}
	}
	
	control(key){
		event.preventDefault();
		def.selected.input(key);
	}
	
	stopControl(key){
		def.selected.stopInput(key);
	}
	
	makeBases(){
		for(let base of Object.values(this.bases)){
			base.display();
		}
	}
	
}

class Unit{
	constructor(){
		this.x;
		this.y;
		this.dx = 0;
		this.dy = 0;
		
		let a = this;
		this.active = setInterval(function(){a.animate()}, 20);
	}
	
	move(){
		
		this.x+=this.dx;
		this.dom.dom.style.left = this.x.toString()+'px';
		
		this.y+=this.dy;
		this.dom.dom.style.top = this.y.toString()+'px';
		
		this.checkBind();
	}
	
	checkBind(){
		if(this.xBind){	
			if(this.x > this.xBind[1]){this.x = this.xBind[1]};
			if(this.x < this.xBind[0]){this.x= this.xBind[0]};
		}
		
		if(this.yBind){
			if(this.y < this.yBind[0]){this.y= this.yBind[0]};
			if(this.y > this.yBind[1]){this.y= this.yBind[1]};
		}
		
			this.dom.dom.style.left = this.x.toString()+'px'
			this.dom.dom.style.top = this.y.toString()+'px'
	}
	
	collide(){
		let units = document.getElementsByClassName('unit');
		
		for(let i = 0; i < units.length; i++){
			this.check(units[i]);
		}
	}
	
	check(div){
		let me = getComputedStyle(this.dom.dom);
		let obj = getComputedStyle(div);
		
		if(num(me.left)+num(me.width) > num(obj.left) &&  num(me.left) < num(obj.left)+num(obj.width) && num(me.top)+num(me.height) > num(obj.top) &&  num(me.top) < num(obj.top)+num(obj.height)){
			this.contact(div.id);
		}			
		
	}
	
	animate(){
		if(!this.dom){return};
		this.move();
		this.collide();
	}
	
	contact(div){
		
	}
	
}

class Pitcher extends Unit{
	constructor(){
	super();
	this.dom = new DOM(document.body, 'pitcher');
	this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('def')+"/pitcher.png')"
	
	this.x = 700;
	this.xBind = [600,800];
	this.y = 140;
	this.spd = 4;
	
	def.selected = this;
	}
	
	
	input(key){
		switch(key.key){
			case 'a' : this.dx = -this.spd; break;
			case 'd' : this.dx = this.spd;break;
			case ' ' : this.windup(); break;
		}
	}
	
	stopInput(key){
		switch(key.key){
			case 'a' : if(this.dx = -5){this.dx = 0}; break;
			case 'd' : if(this.dx = 5){this.dx = 0};break;
			case ' ' : this.pitch(); break;
		}
	}
	
	windup(){
	if(!this.ball){
		this.ball = new PitchedBall(this);
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('def')+"/windup.png')"
	}}
	
	pitch(){
		this.ball.pitched();
		this.ball = false;
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('def')+"/pitcher.png')"
	}

}

class PitchedBall extends Unit{
	constructor(par){
		super();
		
		this.y = 170;
		this.x = par.x-5;
		this.par = par;
		this.charge = 3;
		
		this.dom = new DOM(document.body, 'pitchedball');
		
		let me = this;
		this.interval = setInterval(function(){me.chargeUp()}, 100);
		
	}
	
	chargeUp(){
		this.charge+=1;
		if(this.charge > 10){this.charge = 5; clearInterval(this.interval)};
	}
	
	pitched(){
		clearInterval(this.interval);
		let duration = Math.round(10/this.charge);
		this.dom.dom.style.animationDuration = duration.toString()+'s';
		this.dom.dom.style.animationName = 'pitched';
		this.dy = (this.charge*2);
		def.selected = this;
		
		let me = this;
		this.clear = setTimeout(function(){me.reset()}, 3000);
	}
	
	
	input(key){
		this.key = key.key;
		let a = this;
		switch(a.key){
			case 'a' : a.dx=this.curve(-1); break;
			case 'd' : a.dx=this.curve(1); break;
			default: return;
		}
	}
	
	stopInput(key){
		if(key.key != this.key){return};
		this.key = key.key;
		let a = this;
		switch(a.key){
			case 'a' : a.dx=0; break;
			case 'd' : a.dx=0; break;
			default: return;
		}
	}
	
	curve(dir){
		let dx = 0;
		dx = 6-this.charge;
		
		if(dx<=0){dx=2};
		if(dx>5){dx=5};
		return dx*dir;
	}
	
	reset(){
		this.callpitch();
		let me = this;
		setTimeout(function(){def.selected = me.par}, 1500);
		this.dom.dom.remove();
	}
	
	hit(){
		this.dy*=-1;
		clearInterval(this.clear);
	}
	
	callpitch(){
		if(this.strike){scoreboard.strike()}else{scoreboard.ball()};
	}
	
	contact(div){
		if(div == 'Plate'){
			this.strike = true;
		}
	}
	
}

class Batter extends Unit{
	constructor(){
		super();
		this.dom = new DOM(document.body, 'batter');
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/batter.png')";
		
		this.x = 400;
		this.xBind = [300,520];
		this.y = 420;
		
		this.spd = 4;
		
		this.dom.dom.onmouseover = function(){off.selected.stop()};
		this.dom.dom.onmouseleave = function(){off.selected.start()};
		this.stopped = false;
		this.state = 'stand';
	}
	
	Minput(){
	if(!this.stopped){
		this.t = event.clientX;
		if(this.t < this.x){this.dx = -this.spd};
		if(this.t > this.x){this.dx = this.spd};
	}}
	
	LCinput(){
		switch(event.type){
			case 'mousedown' : if(event.button == 0){this.charge()}; break;
			case 'mouseup': if(event.button == 0){this.swing()}; break;
		}
	}
	
	RCinput(){
		this.state = 'bunting';
	}
	
	stop(){
		this.t = this.x;
		this.dx = 0;
		this.stopped = true;
	}
	start(){
		this.stopped = false;
	}
	
	charge(){
	if(this.state == 'stand'){
		this.bat = new Bat(this);
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/battercharge.png')"
	}}
	
	swing(){
	if(this.state == 'stand'){
		def.selected.strike = true;
		this.state = 'swing';
		this.dom.dom.style.width = '400px';
		this.bat.swing();
		let me = this;
		let i = 0;
		this.swinging = setInterval(function(){
			me.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/swing/"+i.toString()+".png')";
			i++;
			if(i >= 9){me.stopswing()}
		}, 20)
	}
	}
	
	stopswing(){
		clearInterval(this.swinging); 
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/batter.png')";
		this.dom.dom.style.width = '150px';
		let me = this;
		setTimeout(function(){me.state = 'stand'}, 3000)
	}
	
	bunt(){
		
	}
	
	walk(){
		
	}
	
}

class Bat extends Unit{
	constructor(par){
		super();
		
		this.x = par.x + 130;
		this.y = par.y + 190;
		this.par = par;
		this.charge = 3;
		this.dom = new DOM(document.body, 'bat');
		this.dom.dom.backgroundImage = '';
		this.hit = false;
		
		let me = this;
		this.interval = setInterval(function(){me.chargeUp()}, 100);
	}
	
	chargeUp(){
		this.charge+=1;
		if(this.charge > 10){this.charge = 5; clearInterval(this.interval)};
	}
	
	swing(){
		clearInterval(this.interval);
		let me = this.dom.dom;
		setTimeout(function(){me.style.width = '0px'}, 20);
		setTimeout(function(){me.style.width = '110px'}, 40);
		setTimeout(function(){me.style.width = '160px'}, 60);
		setTimeout(function(){me.style.width = '200px'}, 80);
		setTimeout(function(){me.style.width = '161px'}, 100);
		setTimeout(function(){me.style.width = '111px'}, 120);
		setTimeout(function(){me.remove()}, 140);
		
	}
	
	contact(div){
		if(div == 'pitchedball' && this.hit == false){
			this.hit = true;
			let bat = {w: this.dom.dom.style.width, c: this.charge, x: this.x};
			let ball = {c: def.selected.charge, x: def.selected.x, y: def.selected.y}
			setTimeout(function(){field(bat, ball)},300);
			def.selected.hit();
		}
	}
	
	
}

class HitBall extends Unit{
	constructor(bat, ball){
		super();
		this.dom = new DOM(document.getElementById('field'), 'hitball');
		
		off.batter = new Runner();
		this.y = 1800;
		this.yBind = [0, 2500];
		this.xBind = [0, 2000];
		this.x = 980;
		this.z = 20;
		let me = this;
		this.interval = setInterval(function(){
			me.dom.dom.scrollIntoView({behavior: "auto", block: "center", inline: "center"});
			me.dom.dom.style.width = me.z+'px'; 
			me.dom.dom.style.height = me.z+'px'}, 20);
		
		this.setD(bat, ball);
		
		
	}
	
	setD(bat, ball){
		this.dy -= Math.ceil(bat.c);
		this.max = 40;
		if(bat.c == 3){this.max-=20};
		if(bat.c > 5){this.max+=10};
		if(bat.c > 8){this.max+=20};
		
		switch(bat.w){
			case '110px' : this.dx = -3; this.max-=20; break;
			case '160px' : this.dx = -1; this.dy--; this.max-=10; break;
			case '200px' : this.dx = 0; this.dy-=2; this.max+=30; break;
			case '161px' : this.dx = 1; this.dy--; this.max+=20; break;
			case '111px' : this.dx = 3; this.max+=10; break;
		}
		
		let xdif = ball.x-bat.x;
		let width = num(bat.w);
		let X = (xdif/width)*100;
		if(X <= 20){this.dx-=3; this.dy+=2; this.max+=20}
		else if(X > 20 && X <= 50){this.dx-=2;this.dy++; this.max-=10;}
		else if(X > 50 && X<=70){this.dx--; this.max+=20}
		else if(X > 70 && X <=80){this.dy-=2; this.max+=30}
		else if(X > 80 && X <=95){this.dx++; this.max-=10}
		else{this.dx+=3; this.dy+=2; this.max+=20}
		
		if(this.max <= 0){this.max = 10};
		if(this.max > 30){this.rise(this.max); this.catchable = true; this.makeSpot()}else{this.type = Math.ceil(this.max/5); this.fall()};
	}
	
	rise(max){
		let me = this;
		this.rising = setInterval(function(){
			me.z++;
			if(me.z > max){clearInterval(me.rising); me.fall()};
		}, 40);
	}
	
	fall(){
		let me = this;
		this.falling = setInterval(function(){
			me.z--;
			if(me.z < 16){clearInterval(me.falling); me.bounce()};
		}, 40);
	}
	
	bounce(){
		if(this.catchable){this.land()};
		if(this.type > 0){this.Gbounce(); return};
		this.max=Math.ceil(this.max/2);
		this.dy=Math.ceil(this.dy/2);
		this.dx=Math.ceil(this.dx*.7);
		if(this.max > 10){this.rise(this.max)}
	}
	
	Gbounce(){
		this.rise(this.max);
		this.type--;
		
	}
	
	land(){
		if(this.y<300 && this.catchable == true){this.homerun()}
		this.catchable = false;
		this.spot.dom.remove();
	}
	
	foul(){
		off.resetRunners();
		off.batter.destroy();
		this.destroy();
		scoreboard.foul();
		off.holdcount = true;
		new popup('foul');
	}
	
	homerun(){
		this.destroy();
		let x = 0;
		for(let runner of Object.values(off.runners)){if(runner){x++}};
		off.clearRunners();
		scoreboard.run(x);
		new popup('homerun');
	}
	
	makeSpot(){
		let dx = this.dx*4*(this.max-16);
		let dy = this.dy*4*(this.max-16);
		
		let x = this.x+dx-75;
		let y = this.y+dy-75;
		
		this.spot = new DOM(document.getElementById('field'), 'spot');
		this.spot.dom.style.top = y.toString()+'px';
		this.spot.dom.style.left = x.toString()+'px';
		this.spot.dom.style.backgroundImage = 'url("assets/spot.gif")';
	}
	
	contact(div){
		if(div == 'fielder' && this.z < 30){
			if(this.catchable){off.batter.out(); off.resetRunners()}
			this.destroy();
			def.selected.ball = true;
		}
		
		if(div.includes('foul')){
			this.foul();
		}
		
	}
	
	destroy(){
		this.dom.dom.remove();
		if(this.spot){this.spot.dom.remove()};
		clearInterval(this.interval);
	}
	
	
	
	
}

class Fielder extends Unit{
	constructor(){
		super();
		this.dom = new DOM(document.getElementById('field'), 'fielder');
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('def')+"/fielder.png')"
		this.x = 940;
		this.y = 1200;
		this.spd = 6;
		this.id = 'fielder';
	}
	
	input(key){
		switch(key.key){
			case 'a' : this.left = true; this.right = false;break;
			case 'd' : this.right = true; this.left = false;break;
			case 'w' : this.up = true; this.down = false;break;
			case 's' : this.down = true; this.up = false;break;
			case ' ' : if(!this.ball){a.dive()};break;
			default: return;
		}
	}
	
	stopInput(key){
		switch(key.key){
			case 'a' : this.left = false;break;
			case 'd' : this.right = false;break;
			case 'w' : this.up = false;break;
			case 's' : this.down = false;break;
			case ' ' : if(this.ball == true){this.toss();this.ball = false};break;
		}
		this.key = undefined;
	}
	
	move(){
		if(this.ball){this.setCam()};
		if(this.right){this.dx=this.spd};
		if(this.left){this.dx=-this.spd;};
		if(!this.left && !this.right){this.dx = 0}; 
		this.x+=this.dx;
		this.dom.dom.style.left = this.x.toString()+'px';
		
		
		if(this.up){this.dy=-this.spd};
		if(this.down){this.dy=this.spd};
		if(!this.up && !this.down){this.dy = 0};
		this.y+=this.dy;
		this.dom.dom.style.top = this.y.toString()+'px';
		
		this.checkBind();
	}
	
	setCam(){
		this.dom.dom.scrollIntoView({behavior: "auto", block: "center", inline: "center"});
	}
	
	toss(){
		if(!this.ball){return};
		if(this.right){let ball = new TossedBall(this.x, this.y, 'first'); this.right = false}
		else if(this.up){let ball = new TossedBall(this.x, this.y, 'second'); this.up = false}
		else if(this.left){let ball = new TossedBall(this.x, this.y, 'third'); this.left = false}
		else if(this.down){let ball = new TossedBall(this.x, this.y, 'home'); this.down = false}
		else{let ball = new TossedBall(this.x, this.y, 'first')};
	}
	
	contact(div){
		if(div == 'tossedball' && def.selected.target.id == 'fielder'){;
			def.selected.stop();
			def.selected.dom.dom.remove();
			this.ball = true;
			def.selected = this;
		}
	}
	
	
}

class TossedBall extends Unit{
	constructor(x,y,target){
		super();

		this.dom = new DOM(document.getElementById('field'), 'tossedball');
		
		this.x = x;
		this.y = y;
		this.target = def.bases[target];
		
		let me = this;
		this.focuson = setInterval(function(){me.dom.dom.scrollIntoView({behavior: "auto", block: "center", inline: "center"})}, 10);
		
		this.held = false;
		def.selected = this;
		this.toss();
	}
	
	input(key){
		switch(key.key){
			case 'a' : this.left = true; this.right = false;break;
			case 'd' : this.right = true; this.left = false;break;
			case 'w' : this.up = true; this.down = false;break;
			case 's' : this.down = true; this.up = false;break;
			default: return;
		}
	}
	
	stopInput(key){
		switch(key.key){
			case 'a' : this.left = false;break;
			case 'd' : this.right = false;break;
			case 'w' : this.up = false;break;
			case 's' : this.down = false;break;
			case ' ' : if(this.held == true){this.retarget()};break;
		}
		this.key = undefined;
	}
	
	toss(){
		let vx = this.target.x-this.x;
		let vy = this.target.y-this.y;
		let M = Math.sqrt((vx*vx)+(vy*vy));
		
		this.dx = 20*vx/M;
		this.dy = 20*vy/M;
	}
	
	retarget(){
		this.target.ball=false;
		if(this.right){this.target = def.bases['first']}
		else if(this.down){this.target = def.bases['home']}
		else if(this.up){this.target = def.bases['second']}
		else if(this.left){this.target = def.bases['third']}
		else{this.target = def.mainfielder};
		this.toss();
	}
	
	
	stop(){
		this.held = true;
		this.dx = 0;
		this.dy = 0;
		this.x = this.target.x;
		this.y = this.target.y;
	}
	
	contact(div){
		if(div.includes(this.target.id)){
			this.stop();

		}
		
		
	}
	
}

class Runner extends Unit{
	constructor(){
		super();
		this.spd = 3;
		this.loc = 'homebase';
		this.origin = 'home';
		this.target = 'first';
		
		this.id = Object.values(off.runners).length;
		off.runners[this.id] = this;
		
		this.mini = new Minirunner(this, this.id);
		
	}
	
	build(){
		this.dom = new DOM(document.getElementById('field'), 'runner'+this.id);
		this.dom.dom.className = 'unit runner';
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/runner.png')"
		
		let base = this.loc.replace('base', '');
		this.x = def.bases[base].x;
		this.y = def.bases[base].y;
		
		this.mini.build();
	}
	
	remove(){
		this.dom.dom.remove();
		this.dom = true;
		this.mini.remove();
	}
	
	run(){
		if(this.force){return};
		switch(this.loc){
			case 'starttofirst' : this.dx=this.spd; this.dy=-this.spd; this.target = 'first'; break;
			case 'firsttosecond' : this.dx=-this.spd; this.dy=-this.spd; this.target = 'second';break;
			case 'secondtofirst' : this.dx=this.spd; this.dy=this.spd; this.target = 'first'; break;
			case 'secondtothird' : this.dx=-this.spd; this.dy=this.spd; this.target = 'third'; break;
			case 'thirdtosecond' : this.dx=this.spd; this.dy=-this.spd; this.target = 'second'; break;
			case 'thirdtohome' : this.dx=this.spd; this.dy=this.spd; this.target = 'home'; break;
			case 'hometothird' : this.dx=-this.spd; this.dy=-this.spd; this.target = 'third';break;
			case 'homebase': this.loc = 'starttofirst'; this.run(); break;
			case 'firstbase' : this.loc = 'firsttosecond'; this.run(); break;
			case 'secondbase' : this.loc = 'secondtothird'; this.run(); break;
			case 'thirdbase' : this.loc = 'thirdtohome'; this.run(); break;
		}
	}
	
	safe(base){
		if(base.id == 'home'){this.score(); return};
		this.dx = 0;
		this.dy = 0;
		this.target = base.next;
		this.origin = base.id;
		
		this.remove();
		this.loc = base.id+'base';
		this.build();
		this.force = false;
	}
	
	destroy(){
		this.remove();
		clearInterval(this.active);
		off.runners[this.id] = false;
	}
	
	out(){
		this.destroy();
		scoreboard.out();
	}
	
	score(){
		this.destroy();
		scoreboard.run();
	}
	
	setforce(){
		if(this.loc == 'starttofirst'){this.force = true; return}
		let base = def.bases[this.origin];
		for(let runner of Object.values(off.runners)){
			if(runner.loc == base.prev+'to'+base.id || runner.loc == base.id+'base'){
				this.force = true; return;
			}
			this.force = false
		}
		
	}
	
	contact(div){
		if(div == 'fielder' && def.selected.ball && !this.loc.includes('base')){
			this.out();
		}
		
		if(div.includes('runner') && div != this.dom.dom.id){
			this.out();
		}
	}
}

class Minirunner extends Unit{
	constructor(par, id){
		super();
		this.par = par;
	}
	
	
	build(){
		this.dom = new DOM(document.getElementById('Tracker'), this.id+'mini');
		this.dom.dom.className = 'minirunner';
	}
	
	remove(){
		this.dom.dom.remove();
		this.dom = false;
	}
	
	animate(){
		if(!this.dom){return};
		let x = (this.par.x-500)/4;
		let y = (this.par.y-1000)/4;
		
		this.x = x;
		this.y = y;
		
		this.dom.dom.style.left = this.x.toString()+'px';
		this.dom.dom.style.top = this.y.toString()+'px';
		
	}
	
}

class Base extends Unit{
	constructor(id){
		super();
		
		this.id = id;
		let i = BaseNames.indexOf(id)+1;
		this.next = BaseNames[i];
		
		switch(id){
			case 'first': this.x = 1375; this.y = 1500;  this.prev = 'start'; break;
			case 'second': this.x = 975; this.y = 1100; this.prev = 'first'; break;
			case 'third': this.x = 575; this.y = 1500;  this.prev = 'second';break;
			case 'home': this.x = 975; this.y = 1900;  this.prev = 'third';break;
		}
	}
	
	display(){
		this.dom = new DOM(document.getElementById('field'), this.id);
		this.dom.dom.className = 'unit base';
	}
	
	contact(div){
		if(div.includes('runner')){
			let id = div.replace('runner', '');
			let runner = off.runners[id];
			if(runner.target != this.id){return};
			this.checkTagOut(runner);
		}
		
		if(div == 'fielder'){
			if(def.selected.ball){
				this.checkForceOut();
			}
		}
		
		if(div == 'tossedball' && def.selected.target.id == this.id){
			this.checkForceOut();
			this.ball = true;
		}
	}
	
	checkTagOut(runner){
		if(this.ball){runner.out()}
		else{runner.safe(this)};
	}
	
	checkForceOut(){
		for(let runner of Object.values(off.runners)){
			if(runner.loc == this.prev+'to'+this.id || runner.loc == this.next+'to'+this.id){
				runner.setforce(); if(runner.force == true){runner.out()}
			}
		}
	}
	
}

class RunnerTracker{
	constructor(){
		
	}
	
	build(){
		this.dom = new DOM(document.body, 'Tracker');
		new DOM(this.dom.dom, 'firstInput');
		new DOM(this.dom.dom, 'secondInput');
		new DOM(this.dom.dom, 'thirdInput');
		new DOM(this.dom.dom, 'homeInput');
		new DOM(this.dom.dom, 'all');
		new DOM(this.dom.dom, 'BATAgain', function(){mound()});
		
		this.interval = setInterval(this.set, 20);
		off.makeminis();
	}
	
	newrunner(start, target, runner){
		this.basepath[start+'path'] = runner;
		runner.build(start, target, start+'path');
	}
	
	Minput(){
		this.mouse = {x: event.clientX, y: event.clientY};
	}
	
	
	LCinput(){
		if(this.mouse.x > 95 && this.mouse.x < 145 && this.mouse.y > 0 && this.mouse.y < 50){this.moverunner('firstbase', 'firsttosecond'); this.moverunner('secondtofirst', 'firsttosecond')};
		if(this.mouse.x > 0 && this.mouse.x < 50 && this.mouse.y > 100 && this.mouse.y < 150){this.moverunner('secondbase', 'secondtothird'); this.moverunner('thirdtosecond', 'secondtothird')};
		if(this.mouse.x > 95 && this.mouse.x < 145 && this.mouse.y > 220 && this.mouse.y < 280){this.moverunner('thirdbase', 'thirdtohome'); this.moverunner('hometothird', 'thirdtohome')};
		if(this.mouse.x > 100 && this.mouse.x < 150 && this.mouse.y > 100 && this.mouse.y < 150){this.forwardAll()};
	
	}
	
	RCinput(){
		if(this.mouse.x > 210 && this.mouse.x < 280 && this.mouse.y > 100 && this.mouse.y < 150){this.moverunner('firsttosecond', 'secondtofirst')};
		if(this.mouse.x > 95 && this.mouse.x < 145 && this.mouse.y > 0 && this.mouse.y < 50){this.moverunner('secondtothird', 'thirdtosecond')};
		if(this.mouse.x > 0 && this.mouse.x < 50 && this.mouse.y > 100 && this.mouse.y < 150){this.moverunner('thirdtohome', 'hometothird')};
		if(this.mouse.x > 100 && this.mouse.x < 150 && this.mouse.y > 100 && this.mouse.y < 150){this.backAll()};
	}
	
	moverunner(start, target){
		for(let runner of Object.values(off.runners)){
			if(runner.loc == start){
				runner.loc = target;
				runner.run();
			}
		}
	}
	
	forwardAll(){
		this.moverunner('firstbase', 'firsttosecond'); this.moverunner('secondtofirst', 'firsttosecond');
		this.moverunner('secondbase', 'secondtothird'); this.moverunner('thirdtosecond', 'secondtothird');
		this.moverunner('thirdbase', 'thirdtohome'); this.moverunner('hometothird', 'thirdtohome');
	}
	
	backAll(){
		this.moverunner('firsttosecond', 'secondtofirst');
		this.moverunner('secondtothird', 'thirdtosecond');
		this.moverunner('thirdtohome', 'hometothird');
	}
	
	set(){
	try{	
		let dom = document.getElementById('Tracker');
		dom.style.left = pageXOffset+'px';
		dom.style.top = pageYOffset+'px';
	}catch{}}
	
	
	
}

class Scoreboard{
	constructor(){
		this.outs = 0;
		this.strikes = 0;
		this.balls = 0;	
		
		this.homeruns = 0;
		this.awayruns = 0;
		
		this.inning = 1;
		
		this.home = new Team('home');
		this.away = new Team('away');
		this.home.pos = 'def';
		this.away.pos = 'off';
		this.off = 'away';
		this.def = 'home'
		
		this.holdcount = false;
		
		this.interval = setInterval(this.set, 50);
	}
	
	chooseFruit(fruit){
		if(!this.home.fruit){this.home.fruit = fruit; new popup('confirmed'); return}
		if(!this.away.fruit){this.away.fruit = fruit; new popup('confirmed'); return}
		else{new popup('both teams selected')}
	}
	
	getFruit(pos){
		let fruit;
		if(this.away.pos == pos){fruit = this.away.fruit};
		if(this.home.pos == pos){fruit = this.home.fruit};
		return fruit;
	}
	
	build(){
		this.dom = new DOM(document.body, 'scoreboard');
		new DOM(this.dom.dom, 'outs');
		new DOM(this.dom.dom, 'strikes');
		new DOM(this.dom.dom, 'balls');
		new DOM(this.dom.dom, 'homeruns');
		new DOM(this.dom.dom, 'awayruns');
		new DOM(this.dom.dom, 'inning');
		new DOM(this.dom.dom, 'atbat');
		new DOM(this.dom.dom, 'homepic');
		new DOM(this.dom.dom, 'awaypic');
		for(let div of this.dom.dom.children){
			div.className = 'scoreboardItem';
		}
		
		this.setStats();
	}
	
	setStats(){
		document.getElementById('outs').style.width = (this.outs*46).toString()+'px';
		document.getElementById('strikes').innerText = this.strikes;
		document.getElementById('balls').innerText = this.balls;
		document.getElementById('homeruns').innerText = this.homeruns;
		document.getElementById('awayruns').innerText = this.awayruns;
		document.getElementById('inning').innerText = this.inning;
		document.getElementById('atbat').style.backgroundImage = 'url("assets/'+this.getFruit('off')+'select.png")';
		document.getElementById('homepic').style.backgroundImage = 'url("assets/'+this.home.fruit+'select.png")';
		document.getElementById('awaypic').style.backgroundImage = 'url("assets/'+this.away.fruit+'select.png")';
		
	}
	
	reset(){
		console.log(off.holdcount);
		this.strikes = 0;
		this.balls = 0;
	}
	
	set(){
	try{	
		let dom = document.getElementById('scoreboard');
		dom.style.left = pageXOffset+window.innerWidth-400+'px';
		dom.style.top = pageYOffset+'px';
	}catch{}}
	
	strike(){
		this.strikes++;
		new popup('strike');
		if(this.strikes >= 3){
			this.strikes = 0;
			this.out();
		}
		this.setStats();
	}
	
	ball(){
		this.balls++;
		new popup('ball');
		if(this.balls >= 4){
			this.balls = 0;
			off.selected.walk();
		}
		this.setStats();
	}
	
	foul(){
		if(this.strikes != 2){this.strikes++};
		new popup('foul');
		this.holdcount = true;
		this.setStats();
	}
	
	out(){
		this.outs++;
		new popup('out');
		if(this.outs >= 3){
			this.outs = 0;
			this.swap();
			this.outs = 0;		
		}
	}
	
	swap(){
		if(this.off == 'home'){this.off = 'away'; this.away.pos = 'off'; this.home.pos = 'def'; this.inning++}else{this.off = 'home'; this.away.pos = 'def'; this.home.pos = 'off'};
		off.clearRunners();
		new popup('endInning');
		setTimeout(swap, 1500);
	}
	
	run(amt = 1){
		if(this.off == 'home'){this.homeruns+=amt}else{this.awayruns+=amt};
	}
}

class Team{
	constructor(type){
		this.type = type;
		this.fruit = false;
		this.pos;
	}
	
}

function field(bat, ball){
	while(document.body.childNodes.length > 0){
		document.body.childNodes[0].remove();
	}
	
	
	document.body.style.backgroundImage = '';
	
	new DOM(document.body, 'field'); 
	new DOM(document.body, 'leftfoula');
	new DOM(document.body, 'leftfoulb');
	new DOM(document.body, 'leftfoulc');
	new DOM(document.body, 'rightfoula');
	new DOM(document.body, 'rightfoulb');
	new DOM(document.body, 'rightfoulc');
	
	new HitBall(bat, ball);
	def.selected = new Fielder();
	def.mainfielder = def.selected;
	off.selected = off.track;
	off.selected.build();
	def.makeBases();
	off.makeRunners();
}

function mound(){
	for(let runner of Object.values(off.runners)){
		if(!runner){continue};
		if(runner.loc.includes('to')){return};
	};
	
	for(let base of Object.values(def.bases)){
		base.ball = false;
	};
	
	if(!scoreboard.holdcount){scoreboard.reset()};
	scoreboard.holdcount = false;
	while(document.body.childNodes.length > 0){
		document.body.childNodes[0].remove();
	}
	
	off.track.build();
	
	scoreboard.build();
	new DOM(document.body, 'Plate');
	document.body.style.backgroundImage = "url('assets/moundBG.png')";
	off.selected = new Batter();
	def.selected = new Pitcher();	
}

function swap(){
	while(document.body.childNodes.length > 0){
		document.body.childNodes[0].remove();
	}
	
	new DOM(document.body, 'nextInning', mound);
	scoreboard.build();
}

function newGame(){
	def = new defense();
	off = new offense();
	document.addEventListener('keydown', def.control);
	document.addEventListener('keyup', def.stopControl);

	document.addEventListener('mousemove', off.control);
	document.addEventListener('mousedown', off.control);
	document.addEventListener('mouseup', off.control);
	window.addEventListener('contextmenu', function(){event.preventDefault()});
	
	mound();
}

function practice(){
	def = new defense();
	off = new offense();
	scoreboard = new Scoreboard();
	scoreboard.home.fruit = 'granny';
	scoreboard.away.fruit = 'mario';

	document.addEventListener('keydown', def.control);
	document.addEventListener('keyup', def.stopControl);

	document.addEventListener('mousemove', off.control);
	document.addEventListener('mousedown', off.control);
	document.addEventListener('mouseup', off.control);
	window.addEventListener('contextmenu', function(){event.preventDefault()});
	
	mound();
}

function selectChars(){
	while(document.body.childNodes.length > 0){
		document.body.childNodes[0].remove();
	}
	
	scoreboard = new Scoreboard();
	
	new DOM(document.body, 'charSelect');
	let main = new DOM(document.body, 'charHolder');
	for(let fruit of fruitlist){let fruitselect = new DOM(main.dom, fruit+'select', selectChar); fruitselect.dom.className = 'fruitSelect'}
	
	new DOM(document.body, 'startGame', function(){if(scoreboard.away.fruit){newGame()}});
}

function selectChar(){
	let fruit = this.id.replace('select', '');
	new popup('acceptfruit', 
		function(){		
			let rect = this.getBoundingClientRect();
			let x = event.clientX-rect.left;
			if(x < 150){scoreboard.chooseFruit(fruit)};
			this.remove();
		});
}


function help(){
	
}

new DOM(document.body, 'PlayButton', selectChars);
new DOM(document.body, 'PracticeButton', practice);
new DOM(document.body, 'HelpButton', help);


const BaseNames = ['first', 'second', 'third', 'home'];
const fruitlist = ['mario', 'granny'];







