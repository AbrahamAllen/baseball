
function num(input, txt = 'px'){
	
	let output = input.replace(txt, '');
	return parseInt(output);
}

function popup(txt, func = false){
	try{document.getElementById('popup').remove()}catch{};
	
	let msg = new DOM(document.body, 'popup', func);
	if(!func){setTimeout(function(){msg.dom.remove()}, 750)};
	msg.dom.style.backgroundImage = 'url("assets/'+txt+'.png")';
	
	let popupaudio = new Audio('assets/audio/'+scoreboard.umpire+txt+'.mp3');
	popupaudio.play();
	
}



class DOM{
	constructor(parent, id, onclick = false, oncontextmenu = false){
		this.dom = document.createElement('div');
		this.dom.id = id;
		this.dom.className = 'unit';
		try{this.dom.style.backgroundImage = 'url("assets/'+id+'.png")'}catch{};
		this.dom.onclick = onclick;
		this.dom.oncontextmenu = oncontextmenu;
		parent.appendChild(this.dom);
	}
}

//controls offense details and inputs
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
	
	makeRunners(run = true){
		let runners = Object.values(this.runners);
		for(let runner of runners){
			if(runner){
				runner.build();
				if(run){runner.run()};
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
		this.runners = new Object();
	}
	
	returnRunners(){
		for(let runner of Object.values(this.runners)){
			if(runner.runback){
				runner.runback();
				return
			}
			if(runner.loc){
				runner.loc = runner.target+'to'+runner.origin;
				runner.run();
			}
		}
	}
	
	resetRunners(){
		for(let runner of Object.values(this.runners)){
			if(runner.loc){
				runner.safe(def.bases[runner.origin]);
			}
		}
		setTimeout(mound, 800);
	}
	
	steal(){
		for(let runner of Object.values(this.runners)){
			if(runner.stealing){
				runner.loc = runner.stealTarget;
				runner.run();
			}
		}
	}
	
	
}
//controls defense details and inputs
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
//base calss that allows animation and collision
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
		this.y+=this.dy;
		this.dom.dom.style.left = this.x.toString()+'px';
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
//pitcher class controled by defense
class Pitcher extends Unit{
	constructor(){
	super();
	this.dom = new DOM(document.body, 'pitcher');
	this.fruit = FRUITS[scoreboard.getFruit('def')];
	this.dom.dom.style.backgroundImage = "url('assets/"+this.fruit[0]+"/pitcher.png')"
	
	this.x = 700;
	this.xBind = [600,800];
	this.y = 100;
	this.spd = 4;
	
	def.selected = this;
	
	if(this.fruit[1] == 'L'){this.dom.dom.style.transform = 'scaleX(-1)'};
	
	this.windupAudio = new Audio('assets/'+scoreboard.getFruit('def')+'/windup.mp3');
	this.pitchAudio = new Audio('assets/'+scoreboard.getFruit('def')+'/action.mp3');
	}
	
	
	input(key){
		switch(key.key){
			case 'a' : if(!this.ball){this.dx = -this.spd}; break;
			case 'd' : if(!this.ball){this.dx = this.spd};break;
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
		this.windupAudio.play();
		this.ball = new PitchedBall(this);
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('def')+"/windup.png')";
	}}
	
	pitch(){
		this.windupAudio.pause();
		this.windupAudio.currentTime = 0;
		this.pitchAudio.play();
		if(this.ball.charge == 10){};
		this.ball.pitched();
		this.ball = false;
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('def')+"/pitcher.png')";
		off.steal();
	}

}
//unit created by pitcher 
class PitchedBall extends Unit{
	constructor(par){
		super();
		
		this.y = par.y+30;
		this.x = par.x-5;
		if(par.fruit[1] == 'L'){this.x = par.x+40};
		this.par = par;
		this.charge = 3;
		
		this.dom = new DOM(document.body, 'pitchedball');
		
		this.meter = new DOM(document.body, 'pitchchargemeter');
		this.meter.dom.style.width = '15px';
		this.meter.dom.style.left = this.x.toString()+'px';
		
		let me = this;
		this.interval = setInterval(function(){me.chargeUp()}, 100);
		
	}
	
	chargeUp(){
		this.charge+=1;
		if(this.charge > 10){this.maxCharge();clearInterval(this.interval)};
		this.meter.dom.style.width = (this.charge*5).toString()+'px';
	}
	
	maxCharge(){
		this.charge = 10;
		let me = this;
		setTimeout(function(){me.charge = 5; me.meter.dom.style.width = (me.charge*5).toString()+'px'; }, 300);
	}
	
	pitched(){
		this.meter.dom.remove();
		clearInterval(this.interval);
		let duration = Math.round(10/this.charge);
		this.dom.dom.style.animationDuration = duration.toString()+'s';
		this.dom.dom.style.animationName = 'pitched';
		this.dy = (this.charge*2);
		def.selected = this;
		
		let me = this;
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
		this.throwback = setTimeout(function(){def.selected = me.par}, 1500);
		this.callpitch();
		let me = this;
		this.dom.dom.remove();
	}
	
	hit(){
		this.dy*=-1;
		clearInterval(this.clear);
	}
	
	callpitch(){
		if(this.strike){scoreboard.strike()}else{scoreboard.ball()};
		
		for(let runner of Object.values(off.runners)){
			if(runner.stealing){
				clearInterval(this.throwback);
				setTimeout(function(){field(false, true)}, 300);
				off.holdcount = true;
			}
		}
	}
	
	contact(div){
		if(div == 'Plate'){
			this.strike = true;
		}
		
		if(div =='Catcher'){
			this.reset();
		}
	}
	
}
//batter class controled by offense
class Batter extends Unit{
	constructor(){
		super();
		this.dom = new DOM(document.body, 'batter');
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/batter.png')";
		this.fruit = FRUITS[scoreboard.getFruit('off')];
		
		if(this.fruit[1] == 'R'){this.x = 400; this.xBind = [300,540]};
		if(this.fruit[1] == 'L'){this.dom.dom.style.transform = 'scaleX(-1)'; this.x = 650; this.xBind = [580,800]};
		this.y = 420;
		
		this.spd = this.fruit[2];
		
		this.dom.dom.onmouseover = function(){off.selected.stop()};
		this.dom.dom.onmouseout = function(){off.selected.start()};
		this.stopped = false;
		this.state = 'stand';
		
		this.extra = new DOM(this.dom.dom, 'battermove');
		if(this.fruit[1] == 'R'){this.extra.dom.style.right = '0px'}else{this.extra.dom.style.left = '150px'}
		this.extra.dom.onmouseover = function(){off.selected.start()};
		
		this.chargeAudio = new Audio('assets/'+scoreboard.getFruit('off')+'/charge.mp3');
		this.swingAudio = new Audio('assets/'+scoreboard.getFruit('off')+'/action.mp3');
	}
	
	Minput(){
		if(!this.stopped && this.fruit[1] == 'R'){
			this.t = event.clientX;
			if(this.t < this.x){this.dx = -this.spd};
			if(this.t > this.x){this.dx = this.spd};
		}
		if(!this.stopped && this.fruit[1] == 'L'){
			this.t = event.clientX;
			if(this.t < this.x+200){this.dx = -this.spd};
			if(this.t > this.x+350){this.dx = this.spd};
		}	
	}
	
	LCinput(){
		switch(event.type){
			case 'mousedown' : if(event.button == 0){this.charge()}; break;
			case 'mouseup': if(event.button == 0){this.swing()}; break;
		}
	}
	
	RCinput(){
		if(event.type == 'mouseup'){this.bunt()};
	}
	
	stop(){
		let rect = this.dom.dom.getBoundingClientRect();
		let m = event.clientX-rect.left;
		if(m < 150 && this.fruit[1] == 'R'){
			this.t = this.x;
			this.dx = 0;
			this.stopped = true;
		}
		
		if(m > 200 && this.fruit[1] == 'L'){
			this.t = this.x;
			this.dx = 0;
			this.stopped = true;
		}
		
	}
	start(){
		this.stopped = false;
	}
	
	charge(){
	if(this.state == 'stand' && !this.bat){
		this.chargeAudio.play();
		this.bat = new Bat(this);
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/battercharge.png')";
	}}
	
	swing(){
	if(this.state == 'stand'){
		this.extra.dom.style.backgroundImage = '';
		this.chargeAudio.pause();
		this.chargeAudio.currentTime = 0;
		this.swingAudio.play();
		def.selected.strike = true;
		this.state = 'swing';
		if(this.fruit[1] == 'R'){this.bat.swingR()};
		if(this.fruit[1] == 'L'){this.bat.swingL()};
		if(this.bat.charge == 10){};
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
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/postswing.png')";
		this.bat = false;
		let me = this;
		setTimeout(function(){me.state = 'stand'; me.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/batter.png')"; me.extra.dom.style.backgroundImage = "url('assets/battermove.png')";}, 1500)
	}
	
	bunt(){
		if(this.state == 'bunting'){this.endBunt(); return};
		this.state = 'bunting';
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/bunt.png')";
		this.extra.dom.style.backgroundImage = "";
		
		this.bat = new Bat(this, true);
	}
	
	endBunt(){
		this.state = 'stand';
		this.extra.dom.style.backgroundImage = "url('assets/battermove.png')";
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/batter.png')";
		
		clearInterval(this.bat.bunting);
		this.bat.dom.dom.remove();
		this.bat = false;
	}
	
	walk(){
		new popup('walk');
		
		if(def.bases['first'].runner){
			if(def.bases['second'].runner){
				if(def.bases['third'].runner){
					def.bases['third'].runner.score();
				}
				def.bases['second'].runner.loc = 'thirdbase';
			}
			def.bases['first'].runner.loc = 'secondbase';
		}
		off.batter = new Runner();
		off.batter.loc = 'firstbase';
		setTimeout(function(){field(true, false)}, 800);
	}
	
}
//unit created by batter
class Bat extends Unit{
	constructor(par, bunt = false){
		super();
		
		if(bunt){this.bunt(par); return};
		if(par.fruit[1] == 'R'){this.x = par.x + 130};
		if(par.fruit[1] == 'L'){this.x = par.x};
		this.y = par.y + 190;
		this.par = par;
		this.charge = 3;
		this.dom = new DOM(document.body, 'bat');
		this.dom.dom.style.top = this.y+'px';
		this.dom.dom.style.left = this.x+'px';
		this.dom.dom.backgroundImage = '';
		this.hit = false;
		
		this.meter = new DOM(document.body, 'batchargemeter');
		this.meter.dom.style.width = '15px';
		this.meter.dom.style.left = this.par.x.toString()+'px';
		if(this.par.fruit[1] == 'L'){this.meter.dom.style.left = (this.par.x+200).toString()+'px'};
		
		let me = this;
		this.interval = setInterval(function(){me.chargeUp()}, 100);
		
		this.hitAudio = new Audio('assets/audio/hit.mp3');
		this.swingAudio = new Audio('assets/audio/swing.mp3');
	}
	
	chargeUp(){
		this.charge+=1;
		if(this.charge > 10){this.maxCharge();clearInterval(this.interval)};
		this.meter.dom.style.width = (this.charge*15).toString()+'px';
	}
	
	maxCharge(){
		this.charge = 10;
		let me = this;
		setTimeout(function(){me.charge = 5; me.meter.dom.style.width = (me.charge*15).toString()+'px'}, 300);
	}
	
	swingR(){
		this.swingAudio.play();
		clearInterval(this.interval);
		this.meter.dom.remove();
		let me = this.dom.dom;
		setTimeout(function(){me.style.width = '0px'}, 20);
		setTimeout(function(){me.style.width = '110px'}, 40);
		setTimeout(function(){me.style.width = '160px'}, 60);
		setTimeout(function(){me.style.width = '200px'}, 80);
		setTimeout(function(){me.style.width = '161px'}, 100);
		setTimeout(function(){me.style.width = '111px'}, 120);
		setTimeout(function(){me.remove()}, 140);
	}
	
	swingL(){
		this.swingAudio.play();
		clearInterval(this.interval);
		this.meter.dom.remove();
		let me = this.dom.dom;
		let x = this.x;
		setTimeout(function(){me.style.width = '0px'}, 20);
		setTimeout(function(){me.style.width = '110px'; me.style.left = (x+100).toString()+'px'}, 40);
		setTimeout(function(){me.style.width = '160px'; me.style.left = (x+50).toString()+'px'}, 60);
		setTimeout(function(){me.style.width = '200px'; me.style.left = (x+10).toString()+'px'}, 80);
		setTimeout(function(){me.style.width = '161px'; me.style.left = (x+50).toString()+'px'}, 100);
		setTimeout(function(){me.style.width = '111px'; me.style.left = (x+100).toString()+'px'}, 120);
		setTimeout(function(){me.remove()}, 140);
	}
	
	bunt(par){
		this.par = par;
		this.charge = 2;
		this.dom = new DOM(document.body, 'bat');
		this.dom.dom.backgroundImage = '';
		this.hit = false;
		
		let me = this;
		let offset;
		if(par.fruit[1] == 'R'){offset = 90};
		if(par.fruit[1] == 'L'){offset = 110};
		me.dom.dom.style.top = (par.y + 190).toString()+'px';
		this.bunting = setInterval(function(){ me.x = par.x; me.dom.dom.style.left = (me.x+offset).toString()+'px'}, 20);
		
		this.hitAudio = new Audio('assets/audio/hit.mp3');
		this.dom.dom.style.width = '150px';
	}
	
	contact(div){
		if(div == 'pitchedball' && this.hit == false){
			this.hit = true;
			this.hitAudio.play();
			let bat = {w: this.dom.dom.style.width, c: this.charge, x: this.x, h: this.par.fruit[1]};
			let ball = {c: def.selected.charge, x: def.selected.x, y: def.selected.y}
			setTimeout(function(){field(bat, ball)},300);
			def.selected.hit();
		}
	}
	
	animate(){
		this.collide();
	}
	
	
}
//created on field function with stats from pitchedball and bat
class HitBall extends Unit{
	constructor(bat, ball){
		super();
		this.dom = new DOM(document.getElementById('field'), 'hitball');
		
		off.ball = this;
		this.catchAudio = new Audio('assets/audio/catch.mp3');
		this.catchable = true;
		off.batter = new Runner();
		this.y = def.bases['home'].y-100;
		this.yBind = [-1000, 2500];
		this.xBind = [0, 3000];
		this.x = def.bases['home'].x+20;
		this.z = 20;
		this.t = 40;
		let me = this;
		this.interval = setInterval(function(){
			me.dom.dom.scrollIntoView({behavior: "auto", block: "center", inline: "center"});
			me.dom.dom.style.width = me.z+'px'; 
			me.dom.dom.style.height = me.z+'px'}, 20);
		
		this.setD(bat, ball);
		
		
	}
	
	setD(bat, ball){
		let X;
		if(bat.h == 'R'){	
			let xdif = ball.x-bat.x;
			let width = num(bat.w);
			X = (xdif/width);
		}else{
			let width = num(bat.w);
			let xdif = (bat.x+width)-ball.x;
			X = (xdif/width);
		}
		if(isNaN(X)){X = 0};
	
		this.dx = (X-0.5)*10;
		this.dy = -bat.c;
		this.max = bat.c*7;
		
		switch(bat.w){
			case '110px' : this.dx-=2; this.dy+=1; this.max-=10; break;
			case '160px' : this.dx-=1; this.max+=10; break;
			case '200px' : this.dy-=1; this.t-=10; this.max+=20; break;
			case '161px' : this.dx+=1; this.max+=10; break;
			case '111px' : this.dx+=2; this.dy+=1; this.max-=10; break;
			case '150px' : this.max = 20; this.dy = -3; break;
		}
		
		X*=100;
		if(X <= 30){this.dy+=2; this.max-=20}
		else if(X > 30 && X <= 60){this.dy++; this.max-=10}
		else if(X > 60 && X<=80){this.t-=10}
		else if(X > 80 && X <=90){this.dy-=1; this.max+=20; this.t-=20}
		else{this.dy+=1; this.max+=10; this.t+=20}
		if(bat.c == 3){this.dy*=2; this.max = 25};
		if(bat.c == 5){this.max+=20};
		if(this.max > 40){this.rise(this.t); this.makeSpot(); this.bounces = 0}else{this.bounces = Math.ceil(this.max/10); this.fall()};
		
		
	}
	
	rise(t){
		let me = this;
		
		this.rising = setInterval(function(){
			if(me.max > me.z){
				me.z++;
			}else{clearInterval(me.rising); me.fall()}
		}, t);
	}
	
	fall(){
		let me = this;
		this.falling = setInterval(function(){
			me.z--;
			if(me.z < 10){clearInterval(me.falling); me.land()};
		}, 40);
	}
	
	land(){
		if(this.y<300 && this.catchable == true){this.homerun()};
		this.checkFoul();
		this.catchable = false; scoreboard.airball = false;
		if(this.bounces > 0){this.gbounce(); console.log(this)}else{this.bounce()};
		this.spot.dom.remove();
	}
	
	bounce(){
		this.max-=20;
		this.dy=Math.ceil(this.dy/2);
		this.dx=Math.ceil(this.dx/3);
		if(this.max > 10){this.rise(20)}else{this.roll()};
	}
	
	gbounce(){
		console.log(this.bounces);
		this.bounces-=1;
		this.max = 20; 
		this.rise(40);
	}
	
	roll(){
		let me = this;
		this.rolling = setInterval(function(){
			me.dx*=0.8;
			me.dy*=0.8;
			if(me.dx > -0.5 && me.dx < 0.5 && me.dy < 0.5){
				clearInterval(me.rolling);
				me.dx = 0; me.dy = 0;
			}
		}, 500)
	}
	
	
	foul(){
		off.batter.destroy();
		off.resetRunners();
		this.destroy();
		scoreboard.foul();
		off.holdcount = true;
		new popup('foul');
		off.selected = false;
	}
	
	checkFoul(){	
	if(this.y <  1175 && this.catchable == false){return};
		let y = 2000-this.y;
		if(y < this.x-1525){
			this.foul();
		}
		if(y < -this.x+1475){
			this.foul();
		}
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
		let dxu = (this.t/20)*(this.max-20)*this.dx;
		let dyu = (this.t/20)*(this.max-20)*this.dy;
		let dxd = this.dx*2*(this.max-10);
		let dyd = this.dy*2*(this.max-10);
		
		let x = Math.round(this.x+dxd+dxu)-75;
		let y = Math.round(this.y+dyd+dyu)-100; 		
		
		this.spot = new DOM(document.getElementById('field'), 'spot');
		this.spot.dom.style.top = y.toString()+'px';
		this.spot.dom.style.left = x.toString()+'px';
		this.spot.dom.style.backgroundImage = 'url("assets/spot.gif")';
	}
	
	contact(div){
		if(div == 'fielder' && this.z < 30){
			if(this.catchable){off.batter.out(); off.returnRunners()}
			this.destroy();
			this.catchAudio.play();
			def.selected.ball = true;
		}
		
		if(div.includes('foul')){
			this.foul();
		}
		
	}
	
	destroy(){
		this.dom.dom.remove();
		off.ball = false;
		if(this.spot){this.spot.dom.remove()};
		clearInterval(this.interval);
		clearInterval(this.active);
		try{clearInterval(this.falling)}
		catch{clearInterval(this.rising)};
	}
	
	
}
//made selected defender on field funtion
class Fielder extends Unit{
	constructor(){
		super();
		this.dom = new DOM(document.getElementById('field'), 'fielder');
		this.fruit = FRUITS[scoreboard.getFruit('def')];
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('def')+"/fielder.png')"
		this.x = def.bases['second'].x;
		this.y = def.bases['second'].y+300;
		this.spd = FRUITS[scoreboard.getFruit('def')][2]*1.5;
		this.id = 'fielder';
		if(this.fruit[1] == 'L'){this.dom.dom.style.transform = 'scaleX(-1)'};
		
		this.throwAudio = new Audio('assets/'+scoreboard.getFruit('def')+'/action.mp3');
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
		console.log('scroll');
		this.dom.dom.scrollIntoView({behavior: "auto", block: "center", inline: "center"});
	}
	
	toss(){
		if(!this.ball){return};
		this.throwAudio.play();
		if(this.right){let ball = new TossedBall(this.x, this.y, 'first'); this.right = false}
		else if(this.up){let ball = new TossedBall(this.x, this.y, 'second'); this.up = false}
		else if(this.left){let ball = new TossedBall(this.x, this.y, 'third'); this.left = false}
		else if(this.down){let ball = new TossedBall(this.x, this.y, 'home'); this.down = false}
		else{let ball = new TossedBall(this.x, this.y, 'first')};
	}
	
	contact(div){
		if(div == 'tossedball' && def.selected.target.id == 'fielder'){
			def.selected.stop();
			def.selected.dom.dom.remove();
			this.ball = true;
			def.selected = this;
		}
	}
	
	
}
//unit created by fielder
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
		
		this.catchAudio = new Audio('assets/audio/catch.mp3');
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
		this.held = false;
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
		this.catchAudio.play();
		this.held = true;
		this.dx = 0;
		this.dy = 0;
		this.x = this.target.x;
		this.y = this.target.y;
	}
	
	contact(div){
		if(div.includes(this.target.id) && !this.held){
			this.stop();

		}
		
		
	}
	
}
//handeled by offense.runners, controlled by runner tracker
class Runner extends Unit{
	constructor(){
		super();
		this.spd = this.spd = FRUITS[scoreboard.getFruit('off')][2];
		this.loc = 'homebase';
		this.origin = 'home';
		this.target = 'first';
		this.stealing = false;
		this.x = def.bases['home'].x;
		this.y = def.bases['home'].y;
		this.id = Object.values(off.runners).length;
		off.runners[this.id] = this;
		
		this.mini = new Minirunner(this, this.id);
		
	}
	
	build(){
		this.dom = new DOM(document.getElementById('field'), 'runner'+this.id);
		this.dom.dom.className = 'unit runner';
		this.dom.dom.style.backgroundImage = "url('assets/"+scoreboard.getFruit('off')+"/runner.png')"
		let base = this.loc.replace('base', '');
		if(!this.stealing){
			this.x = def.bases[base].x;
			this.y = def.bases[base].y;
		}else{
			this.stealing = false;
			this.stealTarget = false;
		}
		this.mini.build();
	}
	
	remove(){
		this.dom.dom.remove();
		this.dom = true;
		this.mini.remove();
	}
	
	move(){
		this.x+=this.dx;
		this.y+=this.dy;
		if(this.dom.dom){this.dom.dom.style.left = this.x.toString()+'px'};
		if(this.dom.dom){this.dom.dom.style.top = this.y.toString()+'px'};
		
		this.checkBind();
	}
	
	run(){
		if(this.force){return};
		def.bases[this.origin].runner = false;
		switch(this.loc){
			case 'starttofirst' : this.dx=this.spd; this.dy=-this.spd; this.target = 'first'; this.dom.dom.style.transform = 'rotate(45deg)'; break;
			case 'firsttosecond' : this.dx=-this.spd; this.dy=-this.spd; this.target = 'second'; this.dom.dom.style.transform = 'rotate(315deg)';break;
			case 'secondtofirst' : this.dx=this.spd; this.dy=this.spd; this.target = 'first'; this.dom.dom.style.transform = 'rotate(135deg)';break;
			case 'secondtothird' : this.dx=-this.spd; this.dy=this.spd; this.target = 'third'; this.dom.dom.style.transform = 'rotate(225deg)'; break;
			case 'thirdtosecond' : this.dx=this.spd; this.dy=-this.spd; this.target = 'second'; this.dom.dom.style.transform = 'rotate(45deg)'; break;
			case 'thirdtohome' : this.dx=this.spd; this.dy=this.spd; this.target = 'home'; this.dom.dom.style.transform = 'rotate(135deg)';break;
			case 'hometothird' : this.dx=-this.spd; this.dy=-this.spd; this.target = 'third';this.dom.dom.style.transform = 'rotate(315deg)';break;
			case 'homebase': this.loc = 'starttofirst'; this.run(); break;
			case 'firstbase' : this.loc = 'firsttosecond'; this.run(); break;
			case 'secondbase' : this.loc = 'secondtothird'; this.run(); break;
			case 'thirdbase' : this.loc = 'thirdtohome'; this.run(); break;
		}
	}
	
	safe(base){
		if(base.id == 'home'){this.score(); return};
		if(off.ball.catchable){this.runback = function(){
			let base = def.bases[this.origin];
			this.loc = base.id+'to'+base.prev;
			this.run();
		}}else{this.runback = false};
		this.dx = 0;
		this.dy = 0;
		this.target = base.next;
		this.origin = base.id;
		base.runner = this;
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
		new popup('run');
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
	
	steal(loc){
		this.stealing = true;
		this.stealTarget = loc;
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
//visual unit appeneded to runner tracker
class Minirunner extends Unit{
	constructor(par, id){
		super();
		this.id = id;
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
		let x = (this.par.x-1000)/4;
		let y = (this.par.y-1100)/4;
		
		this.x = x;
		this.y = y;
		
		this.dom.dom.style.left = this.x.toString()+'px';
		this.dom.dom.style.top = this.y.toString()+'px';
		
	}
	
}
//static unit created on field
class Base extends Unit{
	constructor(id){
		super();
		
		this.id = id;
		let i = BaseNames.indexOf(id)+1;
		this.next = BaseNames[i];
		this.runner = false;
		
		switch(id){
			case 'first': this.x = 1875; this.y = 1575;  this.prev = 'start'; break;
			case 'second': this.x = 1475; this.y = 1175; this.prev = 'first'; break;
			case 'third': this.x = 1075; this.y = 1575;  this.prev = 'second';break;
			case 'home': this.x = 1475; this.y = 1975;  this.prev = 'third';break;
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
//off.selected, inputs control runners
class RunnerTracker{
	constructor(){
		
	}
	
	build(){
		this.dom = new DOM(document.body, 'Tracker');
		new DOM(this.dom.dom, 'firstInput');
		new DOM(this.dom.dom, 'secondInput');
		new DOM(this.dom.dom, 'thirdInput');
		new DOM(this.dom.dom, 'homeInput');
		for(let baseinput of this.dom.dom.childNodes){
			baseinput.style.backgroundImage = "url('assets/baseinput.png')"
		}
		new DOM(this.dom.dom, 'all');
		new DOM(this.dom.dom, 'BATAgain', function(){if(document.getElementById('field')){mound()}});
		
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
	
	stealInput(){
		this.dom.dom.addEventListener('mouseover', function(){off.store = off.selected; off.selected = off.track});
		this.dom.dom.addEventListener('mouseout', function(){off.selected = off.store; off.store = false});
	}
	
	moverunner(start, target){
		if(off.store){
			for(let runner of Object.values(off.runners)){
				if(runner.loc == start){
					runner.steal(target);
				}
			}
			return;
		}
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
//tracks gamestate and gamestats
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
		
		this.umpire = UMPS[Math.floor(Math.random()*UMPS.length)];
		
		this.holdcount = false;
		
		this.interval = setInterval(this.set, 50);
	}
	
	chooseFruit(fruit){
		if(!this.home.fruit){this.home.fruit = FRUITS[fruit]; new popup('confirmed'); document.getElementById('homeSelected').style.backgroundImage = 'url("assets/'+fruit+'select.png")';  return}
		if(!this.away.fruit){this.away.fruit = FRUITS[fruit]; new popup('confirmed'); document.getElementById('awaySelected').style.backgroundImage = 'url("assets/'+fruit+'select.png")'; return}
		new popup('both teams selected');
	}
	
	getFruit(pos){
		let fruit;
		if(this.away.pos == pos){fruit = this.away.fruit[0]};
		if(this.home.pos == pos){fruit = this.home.fruit[0]};
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
		document.getElementById('homepic').style.backgroundImage = 'url("assets/'+this.home.fruit[0]+'select.png")';
		document.getElementById('awaypic').style.backgroundImage = 'url("assets/'+this.away.fruit[0]+'select.png")';
		
	}
	
	reset(){
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
			this.balls = 0;
			this.out();
		}
		this.setStats();
	}
	
	ball(){
		this.balls++;
		new popup('ball');
		if(this.balls >= 4){
			clearTimeout(def.selected.throwback);
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
		if(this.inning > this.maxinning){this.endGame(); return}
		off.clearRunners();
		new popup('endInning');
		setTimeout(swap, 1500);
	}
	
	endGame(){
		while(document.body.childNodes.length > 0){
			document.body.childNodes[0].remove();
		}
		new popup('endGame', function(){location.reload()});
		this.build();
	}
	
	run(amt = 1){
		if(this.off == 'home'){this.homeruns+=amt}else{this.awayruns+=amt};
	}
}
//holds data for graphics
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
/* 	new DOM(document.body, 'leftfoula');
	new DOM(document.body, 'leftfoulb');
	new DOM(document.body, 'leftfoulc');
	new DOM(document.body, 'rightfoula');
	new DOM(document.body, 'rightfoulb');
	new DOM(document.body, 'rightfoulc'); */
	
	
	def.selected = new Fielder();
	def.mainfielder = def.selected;
	if(bat && ball){new HitBall(bat, ball)};
	if(bat && !ball){def.selected.setCam(); def.selected.ball = true};
	if(!bat && ball){def.selected = false; new TossedBall(975, 1950, 'home')};

	off.selected = off.track;
	off.selected.build();
	def.makeBases();
	off.makeRunners(ball);
}

function mound(){
	for(let runner of Object.values(off.runners)){
		if(!runner){continue};
		if(runner.loc.includes('to')){return};
	};
	
	for(let base of Object.values(def.bases)){
		base.ball = false;
	};
	
	try{
		def.selected.ball = false;
	}catch{
		
	}
	
	if(!scoreboard.holdcount){scoreboard.reset()};
	scoreboard.holdcount = false;
	while(document.body.childNodes.length > 0){
		document.body.childNodes[0].remove();
	}
	
	off.track.build();
	off.track.stealInput();
	scoreboard.build();
	new DOM(document.body, 'Plate');
	document.body.style.backgroundImage = "url('assets/moundBG.png')";
	off.selected = new Batter();
	def.selected = new Pitcher();
	new DOM(document.body, 'Catcher');	
}

function swap(){
	while(document.body.childNodes.length > 0){
		document.body.childNodes[0].remove();
	}
	
	new DOM(document.body, 'nextInning', mound);
	document.body.style.backgroundImage = "url('assets/moundBG.png')";
	let next = new DOM(document.body, 'battingNext');
	if(scoreboard.off == 'away'){next.dom.style.backgroundImage = "url('assets/"+scoreboard.away.fruit[0]+"/upnext.png')"};
	if(scoreboard.off == 'home'){next.dom.style.backgroundImage = "url('assets/"+scoreboard.home.fruit[0]+"/upnext.png')"};
	scoreboard.build();
}

function newGame(){
	def = new defense();
	off = new offense();
	scoreboard.maxinning = document.getElementById('inningsChoice').value;
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
	scoreboard.home.fruit = FRUITS['granny'];
	scoreboard.away.fruit = FRUITS['mario'];

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
	for(let fruit of Object.keys(FRUITS)){let fruitselect = new DOM(main.dom, fruit+'select', selectChar); fruitselect.dom.className = 'fruitSelect'}
	
	new DOM(document.body, 'startGame', function(){if(scoreboard.away.fruit && scoreboard.home.fruit){newGame()}});
	
	new DOM(document.body, 'selectedFruit');
	new DOM(document.body, 'awaySelected', function(){scoreboard.away.fruit = false; document.getElementById('awaySelected').style.backgroundImage = ''});
	new DOM(document.body, 'homeSelected', function(){scoreboard.home.fruit = false; document.getElementById('homeSelected').style.backgroundImage = ''});
	
	gameSettings();
}

function gameSettings(){
	let inningsChoice = document.createElement("input");
	inningsChoice.id = 'inningsChoice';
	inningsChoice.setAttribute("type", "text");
	inningsChoice.value = '3';
	document.body.appendChild(inningsChoice);
	new DOM(document.body, 'chooseinnings');
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
	window.location = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
}

new DOM(document.body, 'PlayButton', selectChars);
new DOM(document.body, 'PracticeButton', practice);
new DOM(document.body, 'HelpButton', help);

let gamescreen;
const BaseNames = ['first', 'second', 'third', 'home'];
const FRUITS = {
	
	'mario': ['mario', 'L', 3], 
	'granny': ['granny', 'R', 3],
	'avacado': ['avacado', 'R', 3]
	
	};
	
const UMPS = [
	'tutu/', 
	'avrami/'
]







