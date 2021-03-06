import Vue from 'vue';

var app = new Vue({
	el: '#app',
	data: {
		artist: '',
		title: '',
		url: '',
		pic: '',
		lrc: '',
		sid: '',
		status: false,//false--->stop状态，显示start ; true--->play状态，显示stop
		clock: '',
		cnt: 0,
		allcnt: 0,
		lyricArr: [],
		arr: [{lrc: ' '},{lrc: ' '},{lrc: ' '},{lrc: ' '}],
		arrTemp: [],
		setLyric: false,
		noVolume: false,
		volume: 0.05,
		nowTime: '00:00',
		endTime: ''
	},
	created: function(){
		this.getSongs();
	},
	methods: {
		ajax: function(opts){
			var xmlhttp = new XMLHttpRequest();
			var value = '';

			xmlhttp.onreadystatechange = function(){
				if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
					if(xmlhttp.responseText[0] === '<'){
						console.log(1)
					}else{
						opts.success(xmlhttp.responseText);
					}
				}else if(xmlhttp.readyState === 4 && xmlhttp.status !== 200){
					opts.error()
				}
			};
			for(var key in opts.data){
				value += key + '=' + opts.data[key] + '&';
			}
			value = value.substr(0,value.length-1);

			if(opts.type.toLowerCase() === 'get'){
				xmlhttp.open('get',opts.url+'?'+value,true);
    			xmlhttp.send();
			}else if(opts.type.toLowerCase() === 'post'){
				xmlhttp.open('post',opts.url,true);
				xmlhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    			xmlhttp.send(value);
			}
		},
		getSongs: function(){
			var opts = {
				type: 'get',
				url: 'http://api.jirengu.com/fm/getSong.php',
				data: {
					channel: 'channel=6'
				},
				success: (responseText)=>{
					var response = JSON.parse(responseText);
					response = response.song[0];

					this.artist = response.artist;
					this.pic = response.picture;
					// this.lrc = response.lrc;//只是链接
					this.sid = response.sid;
					this.title = response.title;
					this.url = response.url;

					document.getElementsByTagName('article')[0].style.backgroundImage = 'url('+this.pic+')';
					var song = document.getElementsByTagName('audio')[0];
					var clock = setInterval(()=>{
						if(song.duration){
							clearInterval(clock);
							this.allcnt = song.duration;
							this.endTime = this.dealWithSeconds(this.allcnt);

							this.getLyric();

							// song.play();
							// this.status = true;

						}
					},100);  //获取歌词的频率
					setTimeout(this.playSong,2000) //2秒后开始播放

				},
				error: function(){
					console.log('getSongs error')
				}
			};

			this.ajax(opts);
		},
		getLyric: function(){
			// var sid = this.sid;
			var opts = {
				type: 'post',
				url: 'http://api.jirengu.com/fm/getLyric.php',
				data: {
					sid: this.sid
				},
				success: (responseText) => {
					var response = JSON.parse(responseText);
					this.lyric = response.lyric
					this.dealWithLyric(response.lyric);
				},
				error: function(){
					console.log('getLyric error')
				}
			};

			this.ajax(opts);
		},
		dealWithLyric : function(lyrictext){  //拿到时间+歌词，有几行就出现几次
			var lyric = lyrictext.split('\n');  //一堆一样的对象，每个对象里有若干个值，每个值对应一行字符串，内容是框时间+歌词
			var patt = /\[[0-9]{2}\:[0-9]{2}\.[0-9]{2}\]/g;  //时间正则
			for(var key in lyric){
				var timeArr = lyric[key].match(patt);  //一堆时间数组，每个数组只有一个对象，就是一个时间
				var lyrictxt = lyric[key].replace(patt,''); //歌词
				for(var prop in timeArr){  //prop是一堆0
					if((typeof parseInt(prop)) === 'number'){
						var count = timeArr[prop];  //count一行一行的时间在数组中

						count = count.substr(1,5);  //count一行一行的时间

						if(lyrictxt === '音乐来自百度FM, by 饥人谷'){
							lyrictxt = '音乐来自百度FM';
						}
						this.lyricArr[count] = lyrictxt;//lyricArr是个对象，每个时间键值对应一句歌词字符串
					}else{
						continue;
					}
				}
			}
			// console.log(this.lyricArr)//key-value 的歌词得到
			for(var lrc in this.lyricArr){ //此时的lrc就是上方的count，但此时count为...

				if(!!this.lyricArr[lrc]){
					var obj = {
						lrc: this.lyricArr[lrc]
					};
					obj.time = lrc;
					this.arr.push(obj);//加进data中的arr
				}
			}
			Object.assign(this.arrTemp,this.arr);
			// console.log(this.arrTemp);

		},
		dealWithSeconds: function(seconds){

			var min = Math.floor(seconds / 60);
			var seconds = Math.round(seconds - min*60);

			if(min<10){
				min = '0' + min;
			}
			if(seconds<10){
				seconds = '0' + seconds;
			}

			return (min+':'+seconds)
		},
		playSong: function(){
			var song = document.getElementsByTagName('audio')[0];
			var ele = document.getElementsByClassName('now')[0];

			this.status = true;
			clearInterval(this.clock);

			var interval = setInterval(function(){
				var list = document.getElementsByTagName('li');

				if(!!list[4].style){
					clearInterval(interval)
					list[4].style.color = 'rgb(0,172,122)';  //当前被唱到歌词的颜色
					list[0].style.color = 'rgba(193,193,193,0.1)';
					list[1].style.color = 'rgba(193,193,193,0.5)';
					list[8].style.color = 'rgba(193,193,193,0.5)';
					list[9].style.color = 'rgba(193,193,193,0.1)';
				}
			},100);

			song.volume = this.volume;

			song.play();

			this.clock = setInterval(() => {
				this.cnt ++;  //一个秒的计时器
				this.nowTime = this.dealWithSeconds(this.cnt);//计时
				if(!!this.lyricArr[this.nowTime]){
					this.arr.shift();
					if(this.setLyric){
						for(var key in this.arrTemp){
							if(this.arrTemp[key].time === this.dealWithSeconds(this.cnt)){
								var idx = this.arrTemp.indexOf(this.arrTemp[key])
								this.arr = this.arrTemp.slice(idx-4,this.arrTemp.length)
								this.setLyric = false;
								break;
							}
						}
					}
				}

				if(song.ended){
					this.playOther();
				}

				ele.style.width = (this.cnt/this.allcnt)*320 + 'px';

				// console.log(this.lyricArr[this.nowTime]);
			},1000);
		},
		stopSong: function(){
			var song = document.getElementsByTagName('audio')[0];
			song.pause();
			this.status = false;

			clearInterval(this.clock)
		},
		setProgress: function(){
			var ct = document.getElementsByClassName('process')[0];

			ct.addEventListener('mousemove',this.setWidth,false);

		},
		setOver: function(){
			var song = document.getElementsByTagName('audio')[0];
			var ct = document.getElementsByClassName('process')[0];
			var node = document.getElementsByClassName('now')[0];
			ct.removeEventListener('mousemove',this.setWidth);

			this.cnt = Math.floor(parseInt(node.style.width) * this.allcnt / 320);
			song.currentTime = this.cnt;
			this.setLyric = true;
			this.playSong();

		},
		setWidth: function(e){
			var song = document.getElementsByTagName('audio')[0];
			var ct = document.getElementsByClassName('process')[0];
			var node = document.getElementsByClassName('now')[0];

			node.style.width = e.pageX - ct.offsetLeft + 'px';
			this.cnt = Math.floor(parseInt(node.style.width) * this.allcnt / 320);
			song.currentTime = this.cnt;
			this.setLyric = true;
			this.playSong();
		},
		playOther: function(){ //清空
			var song = document.getElementsByTagName('audio')[0];
			var node = document.getElementsByClassName('now')[0];

			node.style.width = 0;

			this.cnt = 0;
			this.nowTime = '00:00';
			clearInterval(this.clock);
			this.arr = [{lrc: ' '},{lrc: ' '},{lrc: ' '},{lrc: ' '}];
			this.lyricArr = [];
			song.src = '';
			this.getSongs();
		},
		setVolume: function(e){
			var ct = document.getElementsByClassName('volume')[0];
			var node = document.getElementsByClassName('nowvolume')[0];
			var song = document.getElementsByTagName('audio')[0];

			node.style.width = e.pageX - ct.offsetLeft + 'px';
			this.volume = parseInt(node.style.width) / 100;
			if(this.volume === 0){
				this.noVolume = true;
			}else{
				this.noVolume = false;
			}
			song.volume = this.volume;
		},
		moveVolume: function(){
			var ct = document.getElementsByClassName('key')[0];

			ct.addEventListener('mousemove',this.setVolume,false);
		},
		moveOver: function(){
			var song = document.getElementsByTagName('audio')[0];
			var ct = document.getElementsByClassName('key')[0];
			var node = document.getElementsByClassName('now')[0];

			ct.removeEventListener('mousemove',this.setVolume);

		},
		toggleNoVolume: function(){
			var node = document.getElementsByClassName('nowvolume')[0];
			var song = document.getElementsByTagName('audio')[0];

			this.noVolume = ~ this.noVolume;
			if(this.noVolume){
				song.volume = 0;
				node.style.width = 0;
			}else{
				song.volume = this.volume;
				node.style.width = this.volume * 100 + 'px'
			}
		}
	}
});
