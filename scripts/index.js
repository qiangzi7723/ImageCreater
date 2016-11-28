$(function() {

    // var canvas = $('#canvas');
    var container = $('#portrait-container');
    var rem = parseInt($('html').css('font-size'));
    var size = 2.4;


    // var ctx = canvas[0].getContext('2d');

    var moveBox = $('#portrait-container');
    var mask = $('.portrait-mask');
    var roleImg = $('.role-img');
    var createBtn = $('.btn-create');
    var createShowing = $('.create-showing');
    var createWrap = $('.create-wrap');
    var createText = $('.create-text');
    var fileImage = $('.file-image');
    var portraitBtnWrap = $('.portrait-btn-wrap');
    var uploadBtnWrap = $('.upload-btn-wrap');
    var againBtn = $('.btn-again');
    var resetBtn = $('.btn-reset');
    var list = $('.img-wrapper ul');


    var imageList = {};
    var defaultImage = 'images/111.jpg';

    // 配置表
    var configJSON = {
        bg: '',
        role: defaultImage,
        foreground: [
            'images/bg001.png',
            'images/bg002.png',
            'images/bg003.png',
            'images/bg004.png',
            'images/bg005.png',
        ]
    }


    // 分为两组预加载
    var imgLoaded = 0;
    var currentLoadedImg = 0;
    var currentLoadedImg2 = 0;
    // 除去foreground这个特殊的数组
    var totalImg = Object.keys(configJSON).length - 1;
    var totalImg2 = configJSON.foreground.length;

    for (var index in configJSON) {
        if (typeof configJSON[index] != 'string') continue;
        imageList[index] = new Image();
        imageList[index].onload = imageList[index].onerror = function() {
            ++currentLoadedImg;
            if (currentLoadedImg == totalImg) {
                imgLoaded++;
                if (imgLoaded >= 2) {
                    // 加载完毕执行回调
                    var imgCreaterObj = new imageCreater();
                    imgCreaterObj.init();
                }
            }
        };
        imageList[index].src = configJSON[index];
    }

    for (var i = 0; i < totalImg2; i++) {
        var name = 'foreground_' + i;
        imageList[name] = new Image();
        imageList[name].onload = imageList[name].onerror = function() {
            currentLoadedImg2++;
            if (currentLoadedImg2 == totalImg2) {
                imgLoaded++;
                if (imgLoaded >= 2) {
                    // 加载完毕执行回调
                    var imgCreaterObj = new imageCreater();
                    imgCreaterObj.init();
                }
            }
        }
        imageList[name].src = configJSON.foreground[i];
    }

    var imageCreater = function() {
        this.hammerManager = new Hammer.Manager(moveBox[0]);
        this.image = {
            x: 0,
            y: 0,
            scale: 1,
            centerX: 2 * size * rem / 2,
            centerY: 2 * size * rem / 2
        };
        this.start = {
            x: 0,
            y: 0,
            scale: 1
        };
        this.index = 0;
    };

    imageCreater.prototype.init = function() {
        this.bindPreventDefault();
        // this.draw();
        this.bindEvent();
        this.bindHammerEvent();
        // 根据配置表配置轮播图的5张图片
        this.configImage();
        // 绑定轮播图事件
        this.bindSlide();
        // 绑定上传图片回调
        this.uploadImage();
        // 绑定再做一个事件
        this.bindBackEvent();
        // 绑定复原头像的事件
        this.resetImageEvent();
    };

    imageCreater.prototype.resetImageEvent = function() {
        resetBtn.on('tap', function() {
            mask.show();
            uploadBtnWrap.hide();
            portraitBtnWrap.show();
            this.setImageSrc(defaultImage);
            this.resetTransform();
            this.maskHide();
        }.bind(this));
    };

    imageCreater.prototype.bindBackEvent = function() {
        againBtn.on('tap', function() {
            setTimeout(function() {
                createShowing.hide();
            }, 400);
            this.maskHide();
            createShowing.removeClass('animated fadeInDown');
            createShowing.addClass('animated fadeOutUp');
        }.bind(this))
    };

    imageCreater.prototype.maskHide = function() {
        setTimeout(function() {
            mask.hide();
        }, 400);
    }

    imageCreater.prototype.uploadImage = function() {
        var self = this;
        fileImage.on('change', function() {
            var fileList = this.files;
            if (fileList[0]) {
                var url = window.URL.createObjectURL(fileList[0]);
                // 修改按钮的显示
                if (portraitBtnWrap.css('display') == 'block') {
                    portraitBtnWrap.hide();
                    uploadBtnWrap.show();
                }
                self.setImageSrc(url);
                self.resetTransform();
            }
            $(this).val("");
        });
    };

    // 更改图片的src 
    imageCreater.prototype.setImageSrc = function(url) {
        roleImg.css('background-image', 'url("' + url + '")');
        imageList.role = new Image();
        imageList.role.src = url;
    }

    //重置图片的transform
    imageCreater.prototype.resetTransform = function() {
        // 每次上传新的图片都需要重置一次transform
        var value = [
            'translate(' + 0 + 'px,' + 0 + 'px)',
            'scale(' + 1 + ')'
        ];
        roleImg.css('transform', value.join(''));
        this.image = {
            x: 0,
            y: 0,
            scale: 1,
            centerX: 2 * size * rem / 2,
            centerY: 2 * size * rem / 2
        };
        this.start = {
            x: 0,
            y: 0,
            scale: 1
        };
    };

    //根据参数图片配置挂件 
    imageCreater.prototype.configImage = function() {
        // 动态添加挂件
        var str = '';
        // 动态添加挂件对应的小点
        var str2 = '';
        var configList = configJSON.foreground;
        for (var i = 0, len = configList.length; i < len; i++) {
            str += '<li style="background-image:url(' + configList[i] + ');"></li>';
            str2 += '<li class="portrait-tip"></li>';
        }
        list.append(str);
        if (configList.length == 1) return;
        $('.bow').show();
        $('.portrait-tips').append(str2);
    };

    imageCreater.prototype.bindSlide = function() {
        var self = this;
        var slideTab = $('.img-wrapper').swipeSlide({
            continuousScroll: true,
            autoSwipe: false,
            lazyLoad: false,
            transitionType: 'linear',
            index: 0,
            speed: 4000,
            firstCallback: function(i) {
                $('.portrait-tip').eq(i).addClass('cur');
            },
            callback: function(i) {
                $('.portrait-tip').eq(i).addClass('cur').siblings().removeClass('cur');
                self.index = i;
            }
        });
        $('.left').on('tap', function(i) {
            slideTab[0].goTo('prev');
        });
        $('.right').on('tap', function(i) {
            slideTab[0].goTo('next');
        });
    };

    // 阻止双击默认事件
    imageCreater.prototype.bindPreventDefault = function() {
        document.body.ontouchmove = function(event) {
            event.preventDefault();
        };

        var agent = navigator.userAgent.toLowerCase(); //检测是否是ios
        var iLastTouch = null; //缓存上一次tap的时间
        if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0) {
            document.body.addEventListener('touchend', function(event) {
                var iNow = new Date()
                    .getTime();
                iLastTouch = iLastTouch || iNow + 1 /** 第一次时将iLastTouch设为当前时间+1 */ ;
                var delta = iNow - iLastTouch;
                if (delta < 500 && delta > 0) {
                    event.preventDefault();
                    return false;
                }
                iLastTouch = iNow;
            }, false);
        }
    };

    // 绑定hammer事件 如pinch
    imageCreater.prototype.bindHammerEvent = function() {
        this.hammerManager.add(new Hammer.Pinch());
        // threshold设置检测的最小阀值
        this.hammerManager.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
        // 改变pinch回调的this指向
        this.hammerManager.on('pinchstart pinchmove', this._onPinch.bind(this));
        this.hammerManager.on('panstart panmove', this._onPan.bind(this));
    };

    // 移动图片
    imageCreater.prototype._onPan = function(e) {
        if (e.type == 'panstart') {
            this.start.x = this.image.x;
            this.start.y = this.image.y;
        }
        this.image.x = this.start.x + e.deltaX;
        this.image.y = this.start.y + e.deltaY;
        this._updateTransform();
    };

    // 缩放图片
    imageCreater.prototype._onPinch = function(e) {
        if (e.type == 'pinchstart') {
            this.start.scale = this.image.scale;
        }
        this.image.scale = this.start.scale * e.scale;
        this._updateTransform();
    };

    // 通过css3更新图片的位置
    imageCreater.prototype._updateTransform = function() {
        // 每次更新都要更新translate以及scale 因为只更新一个会被覆盖
        var value = [
            'translate(' + this.image.x + 'px,' + this.image.y + 'px)',
            'scale(' + this.image.scale + ')'
        ];
        roleImg.css('transform', value.join(''));
    };


    // 私有，绘制图片
    imageCreater.prototype._draw = function(ctx, img, x, y, scale) {
        ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);
    };

    imageCreater.prototype.drawRole = function(ctx) {
        // 绘制底色，白色
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 2 * rem * size, 2 * rem * size);

        // 要做图片的适配，以最大边为缩放参考，做到contain效果
        if (imageList.role.width > imageList.role.height) {
            var scaleRole = size * 2 * rem / imageList.role.width;
        } else {
            scaleRole = size * 2 * rem / imageList.role.height;
        }

        scaleRole = scaleRole * this.image.scale;

        //这是一段神奇的代码 x y 是修正缩放之后的位置差
        var width = imageList.role.width * 2 * scaleRole / 2;
        var height = imageList.role.height * 2 * scaleRole / 2;

        var x = this.image.centerX - width / 2;
        var y = this.image.centerY - height / 2;

        this._draw(ctx, imageList.role, this.image.x * 2 + x, this.image.y * 2 + y, scaleRole);
    };

    imageCreater.prototype.drawBg = function(ctx) {

        // 绘制前景 根据当前轮播的index绘制
        var name = 'foreground_' + (this.index);
        var scaleBg = size * 2 * rem / imageList[name].width;
        this._draw(ctx, imageList[name], 0, 0, scaleBg);
    };

    imageCreater.prototype.showing = function(canvas) {
        var data = canvas.toDataURL("image/jpeg", 1.0);
        var str = '<img src="';
        str += canvas.toDataURL();
        str += '" class="img"/>';
        str += '<p class="create-text">长按图片保存</p>';
        createWrap.empty();
        createWrap.append(str);
        createShowing.show();
        mask.show();
        createShowing.removeClass('animated fadeOutUp');
        createShowing.addClass('animated fadeInDown');
    };

    imageCreater.prototype.createImg = function() {

        var canvas = $('<canvas></canvas>');
        // 高清适配
        canvas.css('width', size * rem + 'px');
        canvas.css('height', size * rem + 'px');
        canvas[0].width = size * 2 * rem;
        canvas[0].height = size * 2 * rem;

        //这部分只是为了显示canvas绘制的内容 用于测试 
        //canvas.css('position', 'absolute');
        //canvas.css('left', '0');
        //canvas.css('top', '0');
        // canvas.css('border', '1px solid black')

        var ctx = canvas[0].getContext('2d');

        this.drawRole(ctx);
        this.drawBg(ctx);
        this.showing(canvas[0]);

    };

    // 绑定html事件
    imageCreater.prototype.bindEvent = function() {
        createBtn.on('tap', function() {
            this.createImg();
        }.bind(this));
    }


});
