/**
 * editor.js
 * v1.0
 * @return {[type]} [description]
 */

var Editor = (function(){

	var menuItem = 'bold italic redo undo underline strikethrough superscript subscript insertorderedlist insertunorderedlist '+
		'cleardoc selectall link unlink print preview justifyleft justifycenter justifyright justifyfull removeformat horizontal drafts';

	var util = {
		each: function (obj, callback) {
			if (obj.length === +obj.length) {
				for (var i = 0, l = obj.length; i < l; i++) {
					if (callback.call(obj[i], i, obj[i])) {
						return i;
					}
				}
			} else {
				for (var i in obj) {
					if (callback.call(obj[i], i, obj[i])) {
						return i;
					}
				}
			}
		}
	}

	function editor(_elem){
		this.elem = document.getElementById(_elem);
		this.init();
	}

	editor.prototype = {

		init: function () {
			this.box();
			this.menu();
			this.render();
		},
		render: function () {
			document.body.spellcheck = false;
			var _elem = this.createElem('div');
			_elem.className = 'ed-container';
			this.elem.parentNode.insertBefore(_elem, this.elem);
			this.elem.parentNode.removeChild(this.elem);
			this.elem = _elem;
			this.elem.appendChild(this.menu);
			this.elem.appendChild(this.body);
		},
		menu: function () {
			var _self = this;
			var menubox = this.createElem('div');
			menubox.className = 'ed-menu';
			menubox.onmousedown = function (e) { e.preventDefault(); }

			util.each(menuItem.split(' '), function (i, v) {
				var item = _self.createElem('button');
				item.onmousedown = function () {
					if (!_self.isfocus()) {_self.body.focus();}
					document.execCommand(v);
				}
				item.innerHTML = v;
				menubox.appendChild(item);
			});

			this.menu = menubox;
		},
		box: function () {
			var bodyBox = this.createElem('div');
			bodyBox.className = 'ed-body';
			bodyBox.innerHTML = this.elem.innerHTML;
			this.elem.innerHTML = "";
			bodyBox.designMode = "on";
			bodyBox.contentEditable = "true";
			this.body = bodyBox;
		},
		createElem: function (_type) {
			return document.createElement(_type);
		},
		isfocus: function () {
			if(!this.body) { return false; }
			if(document.activeElement === this.body) {
				return true;
			}else {
				return false;
			}
		}
	}

	return editor;
}())
//插入图片
//document.execCommand(insertimage, "true", "img/icons.png");

function  aa(){
	var boxRipper = document.getElementById('editor-box');

	box.designMode = "on";
	box.contentEditable = "true";

	function exec(_type) {
		//console.log(getContent());
		//document.execCommand("insertHTML", "false","<hr>");
		document.execCommand(_type, "false", null);
	}
	function getContent () {
		return window.getSelection().toString();
	}
	var stateDiv = document.getElementById('state');

	document.onclick = function(){
		if (isFocus(box)) {
			stateDiv.innerHTML = 'true';
		} else {
			stateDiv.innerHTML = 'false';
		}
	}
	function isFocus (elem) {
		if(elem.nodeType !== 1) { return; }
		if(document.activeElement === elem) {
			return true;
		}else {
			return false;
		}
	}
	

}