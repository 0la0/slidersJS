/****************************************************************
 *
 *  HTML5 UI SLIDER
 *  IMPLEMENTED ON A CANVAS GRAPHICS CONTEXT
 *  WORKS WITH BOTH MOUSE AND TOUCH
 *
 *  Constructor takes:
 *
 *    -An "update function" to which the slider passes
 *     its value [0 - 1]. This parameter is mandatory.
 *    -An existing DOM element ID that will contain
 *     the slider. This parameter is mandatory.
 *    -A UI label (String) for the slider.
 *    -A color for the slider bar. (A CSS formated string).
 *    -Width of the slider (CSS formated)
 *    -Height of the slider (CSS formated)
 *
 ***************************************************************/


function Slider (updateFunct, parentElId, label, fillstyle, w, h) {
  if (!arguments.length) {
    console.log('error: no arguments in constructor');
    return;
  }
  if (updateFunct == null) {
    console.log('error: an update function is needed');
    return;
  }
  if (parentElId == null) {
    console.log('error: needs a DOM element for slider');
    return;
  }
  if (label == null) {
    label = '';
  }
  if (fillstyle == null) {
    fillstyle = '#666666';
  }
  if (w == null || w == isNaN) {
    if (this instanceof VertSlider) {
      w = 20;
    } else {
      w = 100;
    }
  }
  if (h == null || h == isNaN) {
    if (this instanceof VertSlider) {
      h = 100;
    } else {
      h = 20;
    }
  }
  this.labelEl = document.createElement('div');
  this.labelEl.appendChild(document.createTextNode(label));
  this.canvasEl = document.createElement('canvas');
  this.canvasEl.style.background = '#ffffff';
  this.canvasEl.style.border = '1px solid #333333';
  this.outputEl = document.createElement('div');
  var parentEl = document.getElementById(parentElId);
  parentEl.appendChild(this.labelEl);
  parentEl.appendChild(this.canvasEl);
  parentEl.appendChild(this.outputEl);

  this.val = 0;
  this.lastVal = 0;
  this.width;
  this.height;
  this.canvasEl.width;
  this.canvasEl.height;
  this.fillstyle = fillstyle;
  this.g2d = this.canvasEl.getContext('2d');
  this.setSize(w, h);
  this.g2d.clearRect(0, 0, w, h);
  this.g2d.fillStyle = fillstyle;
  this.mouseIsDown = false;
  this.rafIsInQueue = false;
  this.outputIsOverridden = false;
  this.updateFunct = updateFunct;

  this.setVal(0);
}

/**
 *	SET THE SIZE OF THE UI ELEMENT
 **/
Slider.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
  this.canvasEl.width = width;
  this.canvasEl.height = height;
  this.g2d.width = this.canvasEl.width;
  this.g2d.height = this.canvasEl.height;
  this.g2d.fillStyle = this.fillstyle;
}

/**
 *	SETS THE CSS CLASS OF THE SLIDER ELEMENTS
 **/
Slider.prototype.setClass = function (className) {
  if (className == null) {
    console.log('error: no class given');
    return; 
  }
  this.labelEl.className = className;
  this.canvasEl.className = className;
  this.outputEl.className = className;
}

/**
 *	SETS THE VALUE BASED ON A NORMALIZED INPUT [0 - 1]
 **/
Slider.prototype.setValue = function (val) {
  if (val < 0 || val > 1) {
    console.log('error: input value outOfBounds, try [0 - 1]');
    return;
  }
  if (this instanceof VertSlider) {
    this.setVal(val * this.height);
  } else {
    this.setVal(val * this.width);
  }
}

/**
 *	SETS THE REGULAR VALUE AND UPDATES THE UI
 **/
Slider.prototype.setVal = function (val) {
  if (val < 0) {
    val = 0;
  }
  this.lastVal = this.val;
  this.val = val;
  this.updateFunct(this.getVal());
  if (!this.rafIsInQueue) {
    this.rafIsInQueue = true;
    var update = this.renderVal();
    requestAnimationFrame(function () {
      update;
    });
  }
}

/**
 *	COMMON RENDER VALUE PROCEDURES
 **/
Slider.prototype.renderVal = function () {
  if (!this.outputIsOverridden) {
    this.outputEl.innerHTML = this.getVal();	
  }
  this.rafIsInQueue = false;
}

/**
 *	COMMON CANVAS LISTENERS
 **/
Slider.prototype.registerListeners = function (obj) {
  //-----------MOUSE LISTENERS----------------//
  obj.canvasEl.addEventListener('mouseup', function (e) {
    e.preventDefault();
    if (obj.mouseIsDown) {
      obj.mouseIsDown = false;
    }
  }, false);
  obj.canvasEl.addEventListener('mouseout', function (e) {
    e.preventDefault();
    if (obj.mouseIsDown) {
      obj.mouseIsDown = false;
    }
  }, false);
  //-----------TOUCH LISTENERS----------------//
  obj.canvasEl.addEventListener('touchend', function (e) {
    e.preventDefault();
    obj.mouseIsDown = false;
  }, false);
}



/************************************************
 *            VERTICAL SLIDER
 *            INHERITS SLIDER
 ***********************************************/
VertSlider.prototype = new Slider();
VertSlider.prototype.constructor = VertSlider;
function VertSlider (updateFunct, parentElId, label, fillstyle, w, h) {
  Slider.call(this, updateFunct, parentElId, label, fillstyle, w, h);
  this.registerListeners(this);
} 

/**
 *	SETS THE VALUE AND UPDATES THE UI
 **/
VertSlider.prototype.setVal = function (val) {
  //check for outOfBounds error that can happen with touch
  if (val > this.height) {
    val = this.height;
  }
  Slider.prototype.setVal.call(this, val);
}

/**
 *	RETURNS THE NORMALIZED VALUE [0 - 1]
 **/
VertSlider.prototype.getVal = function () {
  return Math.round((this.val / this.height) * 100) / 100;
}

/**
 *	VERTICAL SPECIFIC RENDER
 **/
VertSlider.prototype.renderVal = function () {
  Slider.prototype.renderVal.call(this);
  this.g2d.clearRect(0, this.height - this.lastVal - 11, this.width, 22);
  this.g2d.fillRect(0, this.height - this.val - 10, this.width, 20);
}

/**
 *	VERTICAL SPECIFIC LISTENERS
 **/
VertSlider.prototype.registerListeners = function (obj) {
  Slider.prototype.registerListeners.call(this, obj);
  //-----------MOUSE LISTENERS----------------//
  obj.canvasEl.addEventListener('mousedown', function (e) {
    e.preventDefault();
    obj.mouseIsDown = true;
    obj.setVal(obj.height - (e.pageY - obj.canvasEl.offsetTop));
  }, false);
  obj.canvasEl.addEventListener('mousemove', function (e) {
    e.preventDefault();
    if (obj.mouseIsDown){
      obj.setVal(obj.height - (e.pageY - obj.canvasEl.offsetTop));
    }
  }, false);
  //-----------TOUCH LISTENERS----------------//
  obj.canvasEl.addEventListener('touchstart', function (e) {
    e.preventDefault();
    for (var i = 0; i < e.touches.length; i++) {
      if (e.touches[i].target === this) {
        obj.mouseIsDown = true;
        obj.setVal(
          obj.height - (e.touches[i].pageY - obj.canvasEl.offsetTop)
        );
      }
    }
  }, false);
  obj.canvasEl.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (obj.mouseIsDown){
      for (var i = 0; i < e.touches.length; i++) {
        if (e.touches[i].target === this) {
          obj.setVal(
            obj.height - (e.touches[i].pageY - obj.canvasEl.offsetTop)
          );
        }
      }
    }
  }, false);
}

/************************************************
 *            HORIZONTAL SLIDER
 *            INHERITS SLIDER
 ***********************************************/
HorizSlider.prototype = new Slider();
HorizSlider.prototype.constructor = HorizSlider; 
function HorizSlider (updateFunct, parentElId, label, fillstyle, w, h) {
  Slider.call(this, updateFunct, parentElId, label, fillstyle, w, h);
  this.registerListeners(this);
}

/**
 *	SETS THE VALUE AND UPDATES THE UI
 **/
HorizSlider.prototype.setVal = function (val) {
  //check for outOfBounds error that can happen with touch
  if (val > this.width) {
    val = this.width;
  }
  Slider.prototype.setVal.call(this, val);
}

/**
 *	RETURNS THE NORMALIZED VALUE [0 - 1]
 **/
HorizSlider.prototype.getVal = function () {
  return Math.round((this.val / this.width) * 100) / 100;
}

/**
 *	HORIZONTAL SPECIFIC RENDER
 **/
HorizSlider.prototype.renderVal = function () {
  Slider.prototype.renderVal.call(this);
  this.g2d.clearRect(this.lastVal - 11, 0, 22, this.height);
  this.g2d.fillRect(this.val - 10, 0, 20, this.height);
}

/**
 *	HORIZONTAL SPECIFIC LISTENERS
 **/
HorizSlider.prototype.registerListeners = function (obj) {
  Slider.prototype.registerListeners.call(this, obj);
  //-----------MOUSE LISTENERS----------------//
  obj.canvasEl.addEventListener('mousedown', function (e) {
    e.preventDefault();
    obj.mouseIsDown = true;
    obj.setVal(e.pageX - obj.canvasEl.offsetLeft);
  }, false);
  obj.canvasEl.addEventListener('mousemove', function (e) {
    e.preventDefault();
    if (obj.mouseIsDown){
      obj.setVal(e.pageX - obj.canvasEl.offsetLeft);
    }
  }, false);
  //-----------TOUCH LISTENERS----------------//
  obj.canvasEl.addEventListener('touchstart', function (e) {
    e.preventDefault();
    for (var i = 0; i < e.touches.length; i++) {
      if (e.touches[i].target === this) {
        obj.mouseIsDown = true;
        obj.setVal(e.touches[i].pageX - obj.canvasEl.offsetLeft);
      }
    }
  }, false);
  obj.canvasEl.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (obj.mouseIsDown){
      for (var i = 0; i < e.touches.length; i++) {
        if (e.touches[i].target === this) {
          obj.setVal(e.touches[i].pageX - obj.canvasEl.offsetLeft);
        }
      }
    }
  }, false);
}