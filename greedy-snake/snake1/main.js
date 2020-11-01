/**
 * el 挂载的元素
 * attribute 贪吃蛇的属性
 */
class Game {
	constructor (el, attribute) {
		this.el = document.getElementById(el);
		// 获取画布的宽高
		this.el.elW = parseInt(window.getComputedStyle(this.el).width);
		this.el.elH = parseInt(window.getComputedStyle(this.el).height);
		this.init(attribute);
		this.keyListening();
	}
	// 初始化
	init(attribute) {
		this.attribute = {
			color: "red", // 颜色
			direction: "rigth", // 移动方向
			state: "pause", // 状态 run pause end
			grade: 0, // 分数
			body: [{x: 20, y: 0}, {x: 0, y: 0}], // 贪吃蛇身体
			wh: 20, // 矩形的宽高
			speed: 200 // 速度
		};
		if (attribute) {
			this.newAttribute = attribute;
			Object.keys(attribute).forEach(key => {
				this.attribute[key] = attribute[key];
			});
		}
		this.food ={
			x: 0,
			y: 0,
			color: 'red'
		}
		this.draw();
		this.foodDraw();
	}
	// 绘制贪吃蛇
	draw() {
		let el = this.el;
		let { body, wh, color } = this.attribute;
		// 确定浏览器是否支持canvans元素
		if (el.getContext) {
			let context = snakegame.getContext("2d");
			context.fillStyle = color;
			body.forEach( key => {
				context.fillRect(key.x, key.y, wh, wh);
			});
		}
	}
	// 随机生成食物
	foodDraw() {
		let el = this.el, wh = this.attribute.wh;
		this.food.x = Math.floor(Math.random()*(el.elW - wh)),
		this.food.y = Math.floor(Math.random()*(el.elH - wh));
		while (this.isOverlap()) {
			this.food.x = Math.floor(Math.random()*(el.elW - wh)),
			this.food.y = Math.floor(Math.random()*(el.elH - wh));
		}
		if (el.getContext) {
			let context = snakegame.getContext("2d");
			context.fillStyle = this.food.color;
			context.fillRect(this.food.x, this.food.y, wh, wh);
		}
	}
	// 判断食物是否与贪吃蛇的身体重叠
	isOverlap() {
		let { wh } = this.attribute;
		let food = this.food;
		let flag = false;
		function isIn(key, x, y) {
			if (key.x <= x && key.x + wh >= x && key.y <= y && key.y + wh >= y) {
				return true;
			} else {
				return false;
			}
		}
		this.attribute.body.forEach(key => {
			// 食物的上下左右四个点一个点在贪吃蛇的身体内就判断为重叠
			if (isIn(key, food.x, food.y) || isIn(key, food.x, food.y + wh) || isIn(key, food.x + wh, food.y) || isIn(key, food.x + wh, food.y + wh)) {
				flag = true;
			}
		});
		return flag;
	}
	// 清除图形
	clear(x, y, width, height) {
		// 确定浏览器是否支持canvans元素
		if (this.el.getContext) {
			let context = snakegame.getContext("2d");
			context.clearRect(x, y, width, height);
		}
	}
 // 游戏状态更新
	updateState(state) {
		this.attribute.state = state;
		if (state === "run") {
			this.run();
		} 
	}
	// 游戏线程
	run() {
		let { body, wh, speed} = this.attribute;
		let time = setInterval(() => {
			// 判断游戏线程是否在运行
			if (this.attribute.state !== 'run') {
				clearInterval(time);
			}
			let obj = {};
			switch(this.attribute.direction) {
				case 'left':
					obj['x'] = body[0].x - wh;
					obj['y'] = body[0].y;
					break;
				case 'rigth':
					obj['x'] = body[0].x + wh;
					obj['y'] = body[0].y;
					break;
				case 'up':
					obj['x'] = body[0].x;
					obj['y'] = body[0].y - wh;
					break;
				case 'down':
					obj['x'] = body[0].x;
					obj['y'] = body[0].y + wh;
					break;
			}
			body.unshift(obj);
			// 判断是否吃到食物 
			if (this.isOverlap()) {
				this.clear(this.food.x, this.food.y, wh, wh);
				this.attribute.grade++; 
				this.foodDraw();
				this.draw();
			} else {
				if (this.end()) {
					alert("游戏结束");
					this.updateState('end');
					clearInterval(time);
				} else {
					let item = body.pop();
					this.clear(item.x, item.y, wh, wh);
					this.draw();
				}
			}
		}, speed);
	}
	// 键盘事件监听
	keyListening() {
		document.onkeydown = (event) => {
			let e = event || window.event || arguments.callee.caller.arguments[0];
			if (e && e.keyCode === 87 && this.attribute.direction !== 'down') { // 按下W
				this.attribute.direction = 'up';
			}
			if (e && e.keyCode === 65 && this.attribute.direction !== 'rigth') { // 按下A
				this.attribute.direction = 'left';
			}
			if (e && e.keyCode === 68 && this.attribute.direction !== 'left') { // 按下D
				this.attribute.direction = 'rigth';
			}
			if (e && e.keyCode === 83 && this.attribute.direction !== 'up') { // 按下W
				this.attribute.direction = 'down';
			}
			if (e && e.keyCode === 32) { // 按下空格 
				let state;
				if (this.attribute.state === 'pause') {
					state = 'run';
				} 
				if (this.attribute.state === 'run') {
					state = 'pause';
				}
				this.updateState(state);
			}
			if (e && e.keyCode === 82) { // 按下R键
				this.reStart();
			}
		} 
	}
	// 是否死亡
	end() {
		let body = [...this.attribute.body];
		let obj = body.shift();
		let flag = false;
		if (obj.x < 0 || obj.x >= this.el.elW || obj.y < 0 || obj.y >= this.el.elH) {
			flag = true;
		}
		body.forEach(key => {
			if (key.x === obj.x && key.y === obj.y) {
				flag = true;
			}
		});
		return flag;
	}
	// 重新开始
	reStart() {
		// 清除整个画布
		this.clear(0, 0, this.el.elW, this.el.elH);
		// 重新开始
		this.init(this.newAttribute);
	}
}
let game = new Game("snakegame", {color: "yellow"});
let grade = document.getElementById("grade");
let oldGrade = game.attribute.grade;
setInterval(() => {
	if (oldGrade !== game.attribute.grade) {
		oldGrade = game.attribute.grade;
		grade.innerText = game.attribute.grade;
	}
}) 
