(function () {
  var oPlay = document.querySelector('.play');
  var oMyMusic = document.getElementById('myMusic');
  var mark = true; //播放音乐的标记
  //播放按钮
  oPlay.onclick = function () {
    var self = this;//this:谁用指向谁
    if(mark){
      oMyMusic.play();
      if(self.classList.value.indexOf("rotate") === -1){
        self.classList.add('rotate');
      }else{
        self.classList.remove('rotatePause');//动画的重启
      }
    }
    else{
      oMyMusic.pause();
      self.classList.add('rotatePause');//动画的暂停
    }
    mark = !mark;
  }
  //歌词同步
  var txt = document.getElementById('txt').value;
  var oLrc = document.getElementById('lrc');
  var lrcs = txt.split("[");//把歌词文档从[处切割开
  for(var i = 0; i < lrcs.length; i++){
    var lrc = lrcs[i].split("]");//把每一项处从]处切割
    var times = lrcs[i].split(".");
    var time = times[0].split(":");
    var ct = time[0] * 60 + time[1] * 1;//把时间转换成秒钟
    if(lrc[1]){//获取歌词
      oLrc.innerHTML += '<p id='+ct+'>' + lrc[1] + '</p>';//加个id属性
    }
  }
  //通过标签名获取所有的p标签
  var aP = document.getElementsByTagName("p");
  var n = 0;//当前歌词播放的行数
  //监听音乐的播放进度
  oMyMusic.addEventListener('timeupdate', function () {
    var cut = parseInt(this.currentTime);
    if(document.getElementById(cut)){
      for(var i = 0; i < aP.length; i++){//清空原来的active样式
       aP[i].classList.remove('activeP');
      }
      document.getElementById(cut).classList.add('activeP');
      if(aP[7+n] && aP[7+n].id == cut){//用与符号判断是否存在，解决结束时的报错问题
        oLrc.style.top = -n*20 + 'px';
        n++;
      }
    }
  });
  //监听音乐播放结束
  oMyMusic.addEventListener('ended', function () {
    oPlay.classList.add('rotatePause');//动画的暂停
    mark = true;
    oLrc.style.top = 0 + 'px';
    oLrc.style.transition = '.3s';
    n = 0;
  }, false);
  //使用canvas绘制音频
  //H5音频对象
  window.AudioContext = window.AudioContext ||
    window.webkitAudioContext || window.mozAudioContext;
  //原生js经动画
  window.requestAnimFrame = ( function () {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame() ||
      function (callback) {
        window.setTimeout( callback, 1000/60 );
      };
  })();
  //创建一个音频对象
  var actx = new AudioContext();
  //创建一个分析节点
  var analyser = actx.createAnalyser();
  //创建一个媒体源节点（音乐数据）
  var audioSrc = actx.createMediaElementSource(oMyMusic);
  //把媒体源和分析节点连接起来
  audioSrc.connect(analyser);
  //把分析机制和扬声器(目标点)连接起来
  analyser.connect(actx.destination);
  //设置canvas绘图颜色
  //canvas数据处理
  var can = document.getElementById("canvas");
  var cxt = can.getContext("2d");//设置canvas的绘图环境
  //设置渐变色
  //从上到中间的渐变色
  var color1 = cxt.createLinearGradient(can.width*0.5,0,can.width*0.5,100);
  color1.addColorStop(0,"#00f");//颜色的起点
  color1.addColorStop(0.5,"#f00");//颜色的中间点
  color1.addColorStop(1,"#0f0");//颜色的终点
  //从中间到下的渐变色
  var color2 = cxt.createLinearGradient(can.width*0.5,100,can.width*0.5,200);
  color2.addColorStop(0,"#0f0");//颜色的起点
  color2.addColorStop(0.5,"#f00");//颜色的中间点
  color2.addColorStop(1,"#00f");//颜色的终点
  //封装绘制频谱的方法
  var num = 100;
  function draw() {
    //创建一个与音频频次等长的数组
    var voicehigh = new Uint8Array(analyser.frequencyBinCount);//初始化的值：1024长度并且全0
    analyser.getByteFrequencyData(voicehigh);//获取缓存数据
    //音频数据步长
    var step = Math.round(voicehigh.length/num);
    //先清空画布 再绘制
    cxt.clearRect(0,0,can.width,can.height);
    for(var i = 0; i < num; i++){
      var high = voicehigh[step * i]/2;
      //绘制矩形
      cxt.fillStyle = color1;//设置fill方法的颜色
      cxt.fillRect(can.width*0.5+i*10,100,7,-high+1);//xy坐标 wh矩形的宽高
      cxt.fillRect(can.width*0.5-(i-1)*10,100,7,-high+1);
      //绘制矩形
      cxt.fillStyle = color2;//设置fill方法的颜色
      cxt.fillRect(can.width*0.5+i*10,100,7,high+1);
      cxt.fillRect(can.width*0.5-(i-1)*10,100,7,high+1);
    }
    requestAnimFrame(draw);
  }
  draw();
})();
