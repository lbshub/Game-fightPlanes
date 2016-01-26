/**
 * LBS fight planes(打飞机)
 * Date: 2015-12-15
 **/

;(function(exports) {
	'use strict';

	//飞机类
	function plane(opts) {
		opts = opts || {};
		this.x = opts.x; //x坐标
		this.y = opts.y; //y坐标
		this.w = opts.w; //宽
		this.h = opts.h; //高
		this.src = opts.src; //对应图片
		this.parent = opts.parent; //实例化的飞机插入到哪里
		this.hp = opts.hp || 1; //血量
		this.score = opts.score || 10; //分数
		this.status = opts.status || 'alive'; //是否死亡 alive活着 death死亡
		this.speed = opts.speed || 1; //移动速度
		this.dieTime = opts.dieTime || 100; //死亡持续时间 （血量为0时 多少时间后消失）
		this.time = 0;
		this.oImg = null; //实际飞机对象
		this.move = function() {
			this.oImg.style.top = this.oImg.offsetTop + this.speed + 'px';
		};
		this.init = function() {
			this.oImg = document.createElement('img');
			this.oImg.style.left = this.x + 'px';
			this.oImg.style.top = this.y + 'px';
			this.oImg.width = this.w;
			this.oImg.height = this.h;
			this.oImg.src = this.src;
			this.parent.appendChild(this.oImg);
		};
		this.init();
	}

	//子弹类
	function bullet(opts) {
		opts = opts || {};
		this.x = opts.x;
		this.y = opts.y;
		this.w = opts.w;
		this.h = opts.h;
		this.src = opts.src;
		this.parent = opts.parent;
		this.speed = opts.speed || 20;
		this.attack = opts.attack || 1; //子弹的攻击力 对应飞机的血量 
		this.oImg = null;
		this.move = function() {
			this.oImg.style.top = this.oImg.offsetTop - this.speed + 'px';
		};
		this.init = function() {
			this.oImg = document.createElement('img');
			this.oImg.style.left = this.x + 'px';
			this.oImg.style.top = this.y + 'px';
			this.oImg.width = this.w;
			this.oImg.height = this.h;
			this.oImg.src = this.src;
			this.parent.appendChild(this.oImg);
		};
		this.init();
	}

	//游戏中子弹和飞机的数据
	var gameImages = {
		//本机
		ourplane: {
			src: 'images/me.png',
			w: 70,
			h: 50,
			x: 0,
			y: 0
		},
		//子弹
		ourbullet: {
			src: 'images/bullet.png',
			w: 6,
			h: 14,
			x: 0,
			y: 0
		},
		//敌机
		enemyplane: [{
			src: 'images/dj-01.png',
			w: 80,
			h: 60,
			x: 0,
			y: -60,
			hp: 1,
			score: 10,
			speed: 10,
			dieTime: 100
		}, {
			src: 'images/dj-02.png',
			w: 90,
			h: 60,
			x: 0,
			y: -60,
			hp: 2,
			score: 20,
			speed: 6,
			dieTime: 150
		}, {
			src: 'images/dj-03.png',
			w: 130,
			h: 90,
			x: 0,
			y: -90,
			hp: 5,
			score: 50,
			speed: 4,
			dieTime: 200
		}, {
			src: 'images/dj-04.png',
			w: 120,
			h: 90,
			x: 0,
			y: -90,
			hp: 8,
			score: 80,
			speed: 3,
			dieTime: 250
		}, {
			src: 'images/dj-05.png',
			w: 140,
			h: 100,
			x: 0,
			y: -100,
			hp: 10,
			score: 100,
			speed: 1,
			dieTime: 300
		}]
	};

	//主程序
	exports.fightPlanes = function(opts) {
		opts = opts || {};
		this.parent = opts.parent || document.getElementsByTagName('body')[0];

		this.start = opts.start || function() {}; //游戏开始
		this.move = opts.move || function() {}; //游戏进行中 (实时刷新 分数 时间)
		this.end = opts.end || function() {}; //游戏结束

		this.count = 0;
		this.times = 0; //记录时间
		this.scores = 0; //记录分数 
		this.enemys = []; //敌机组
		this.bullets = []; //子弹组
		this.gameover = false; //游戏状态 为true表示结束
		this.timer = null;
		this.timeid = null;

		this.width = document.documentElement.clientWidth;
		this.height = document.documentElement.clientHeight;
		this.selfplane = null; //本机对象

		this.init();
	};
	fightPlanes.prototype = {
		init: function() {
			// this.play();
		},
		createPlane: function() {
			//创建本机
			var data = gameImages.ourplane;
			data.x = (this.width - data.w) / 2;
			data.y = this.height - data.h;
			data.parent = this.parent;
			this.selfplane = this.ourplane(data);
		},
		movePlane: function() {
			var _this = this;
			function ourPlaneMove(e) {
				if (_this.gameover) return;
				e.preventDefault();
				e.stopPropagation();
				if (e.target === _this.selfplane.oImg) {
					var point = e.touches ? e.touches[0] : e,
						x = point.pageX,
						y = point.pageY,
						l = x - _this.selfplane.w / 2,
						t = y - _this.selfplane.h / 2;
					l < 0 && (l = 0);
					l > _this.width - _this.selfplane.w && (l = _this.width - _this.selfplane.w);
					t < 0 && (t = 0);
					t > _this.height - _this.selfplane.h && (t = _this.height - _this.selfplane.h);
					_this.selfplane.oImg.style.left = l + 'px';
					_this.selfplane.oImg.style.top = t + 'px';
				}
			}
			this.on(this.parent, ['touchmove', 'pointermove', 'MSPointerMove', 'mousemove'], function(e) {
				ourPlaneMove(e);
			});
			// this.parent.addEventListener('touchmove', ourPlaneMove, false);
		},
		createEnemy: function() {
			if (this.count % 50 === 0) {
				//随机创建 
				var num = (Math.random() * gameImages.enemyplane.length) >> 0,
					data = gameImages.enemyplane[num];
				data.x = (Math.random() * (this.width - gameImages.enemyplane[num].w)) >> 0;
				data.parent = this.parent;
				this.enemys.push(this.enemyplane(data));
			}
		},
		moveEnemy: function() {
			if (this.enemys.length < 1) return;
			for (var i = 0, enemyslen = this.enemys.length; i < enemyslen; i++) {
				if (this.enemys[i].status === 'alive') {
					this.enemys[i].move();
					if (this.enemys[i].oImg.offsetTop > this.height + this.enemys[i].h) {
						this.parent.removeChild(this.enemys[i].oImg);
						this.enemys.splice(i, 1);
						enemyslen--;
					}
				} else if (this.enemys[i].status === 'death') {
					this.enemys[i].time += 20;
					if (this.enemys[i].time >= this.enemys[i].dieTime) {
						this.parent.removeChild(this.enemys[i].oImg);
						this.enemys.splice(i, 1);
						enemyslen--;
					}
				}
			}
		},
		createBullet: function() {
			if (this.count % 5 === 0) {
				var data = gameImages.ourbullet;
				data.x = parseInt(this.selfplane.oImg.style.left) + (this.selfplane.w - data.w) / 2;
				data.y = parseInt(this.selfplane.oImg.style.top) + data.h;
				data.parent = this.parent;
				this.bullets.push(this.ourbullet(data));
			}
		},
		moveBullet: function() {
			if (this.bullets.length < 1) return;
			for (var i = 0, bulletslen = this.bullets.length; i < bulletslen; i++) {
				this.bullets[i].move();
				if (this.bullets[i].oImg.offsetTop < 0) {
					this.parent.removeChild(this.bullets[i].oImg);
					this.bullets.splice(i, 1);
					bulletslen--;
				}
			}
		},
		ourplane: function(opts) {
			//实例化本机
			return new plane({
				x: opts.x,
				y: opts.y,
				w: opts.w,
				h: opts.h,
				src: opts.src,
				parent: opts.parent
			});
		},
		enemyplane: function(opts) {
			// 实例化敌机
			return new plane({
				x: opts.x,
				y: opts.y,
				w: opts.w,
				h: opts.h,
				src: opts.src,
				hp: opts.hp,
				score: opts.score,
				speed: opts.speed,
				dieTime: opts.dieTime,
				parent: opts.parent
			});
		},
		ourbullet: function(opts) {
			//实例化子弹
			return new bullet({
				x: opts.x,
				y: opts.y,
				w: opts.w,
				h: opts.h,
				src: opts.src,
				parent: opts.parent
			});
		},
		planeCollideEnemy: function() {
			if (this.enemys.length < 1) return;
			for (var i = 0, enemyslen = this.enemys.length; i < enemyslen; i++) {
				if (this.enemys[i].status === 'alive') {
					if (this.collide(this.selfplane, this.enemys[i])) {
						return !this.gameover && this.stop();
					}
				}
			}
		},
		bulletCollideEnemy: function() {
			if (this.enemys.length < 1) return;
			for (var m = 0, bulletslen = this.bullets.length; m < bulletslen; m++) {
				for (var n = 0, enemyslen = this.enemys.length; n < enemyslen; n++) {
					if (this.collide(this.bullets[m], this.enemys[n])) {
						this.enemys[n].hp -= this.bullets[m].attack;
						if (this.enemys[n].hp <= 0) {
							this.enemys[n].status = 'death';
							this.scores += this.enemys[n].score;
						}
						//删除子弹
						this.parent.removeChild(this.bullets[m].oImg);
						this.bullets.splice(m, 1);
						bulletslen--;
						break;
					}
				}
			}
		},
		collide: function(o, e) {
			var oL = o.oImg.offsetLeft,
				oT = o.oImg.offsetTop,
				oW = o.w,
				oH = o.h,
				eL = e.oImg.offsetLeft,
				eT = e.oImg.offsetTop,
				eW = e.w,
				eH = e.h;
			// 4 28 碰撞的深度值 实际需要根据飞机和子弹设置
			return ((oL < eL + eW - 4) && (oL + oW > eL + 4)) && ((oT < eT + eH - 28) && (oT + oH > eT + 28));
		},
		animate: function() {
			var _this = this;
			!function gamestart() {
				if (_this.gameover) return;
				_this.count++;

				//创建敌机
				_this.createEnemy();
				//移动敌机
				_this.moveEnemy();

				//创建子弹
				_this.createBullet();
				//移动子弹
				_this.moveBullet();

				//本机和敌机碰撞
				_this.planeCollideEnemy();
				//子弹和敌机碰撞
				_this.bulletCollideEnemy();

				_this.move && _this.move(_this.scores, _this.times);

				//重复 
				_this.timer = setTimeout(gamestart, 17);
			}();
		},
		timeing: function() {
			var _this = this;
			!function timeing() {
				if (_this.gameover) return;
				_this.timeid && _this.times++;
				_this.timeid = setTimeout(timeing, 1000);
			}();
		},
		clear: function() {
			this.timeid && clearTimeout(this.timeid);
			this.timeid = null;
			this.timer && clearTimeout(this.timer);
			this.timer = null;
		},
		reset: function() {
			this.gameover = false;
			this.count = 0;
			this.scores = 0;
			this.times = 0;
			this.enemys.length = 0;
			this.bullets.length = 0;
			this.selfplane = null;
			this.parent.innerHTML = '';
		},
		replay: function() {
			this.reset();
			this.play();
		},
		play: function() {
			if (!this.selfplane) {
				this.createPlane();
				this.movePlane();
				this.start && this.start();
			}
			this.timeing();
			this.animate();
		},
		pause: function() {
			this.clear();
		},
		stop: function() {
			this.gameover = true;
			this.clear();
			this.end && this.end(this.scores, this.times);
		},
		on: function(el, types, handler) {
            for (var i = 0, l = types.length; i < l; i++) el.addEventListener(types[i], handler, false);
        }
	};
}(window));