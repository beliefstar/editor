/**
 * editor.js
 * v1.0
 * author by zhenxin
 * @return {[type]} [description]
 */

var Editor = (function(){

	var menuItem = 'source | undo redo | bold italic underline strikethrough '+
		'| superscript subscript | removeformat | insertorderedlist insertunorderedlist '+
		'| selectall cleardoc | justifyleft justifycenter justifyright '+
		'| link unlink print preview '+
		'| horizontal';

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
		},
		createElem: function (_type) {
			return document.createElement(_type);
		},
		formHTML: function (_str) {
			_str = _str.replace(/</g, '&lt;');
			_str = _str.replace(/>/g, '&gt;');
			return _str;
		},
		toHTML: function (_str) {
			_str = _str.replace(/&lt;/g, '<');
			_str = _str.replace(/&gt;/g, '>');
			return _str;
		},
		removeElem(elem) {
			if (elem.nodeType == 1) {
				elem.parentNode.removeChild(elem);
			}
		},
		model: function (title, css, content, callback, closefn) {
			var me = this;
			var tpl = '<div class="edui-model '+css+'">\
							<div class="edui-model-head">\
								<h3>'+title+'</h3>\
								<div class="edui-close">&times;</div>\
								<div class="clearfix"></div>\
							</div>\
							<div class="edui-model-body">'+content+'</div>\
							<div class="edui-model-foot">\
								<button class="sure">确定</button>\
								<button class="edui-close">关闭</button>\
							</div>\
						</div>\
						<div class="edui-model-backdrop"></div>';
			var obj = me.createElem('div');
			obj.innerHTML = tpl;
			var close = function () {
				var model = this.parentNode.parentNode;
				var backdrop = model.parentNode.getElementsByClassName('edui-model-backdrop')[0];
				model.parentNode.removeChild(backdrop);
				model.parentNode.removeChild(model);
				closefn();
			}
			//callback.close = close;
			obj.getElementsByClassName('edui-close')[0].onclick = close;
			obj.getElementsByClassName('edui-close')[1].onclick = close;
			obj.getElementsByClassName('sure')[0].onclick = function () {
				callback(this, close);
			};
			return obj.childNodes;
		},
		strToDom: function(arg) {
		　　 var objE = document.createElement("div");
		　　 objE.innerHTML = arg;
		　　 return objE.childNodes;
		},
		replaceSelection: function(dom) {
		    if (window.getSelection) {
		        var selecter = window.getSelection();
	            var rang = selecter.getRangeAt(0);
	            rang.surroundContents(dom);
		    } else if (document.selection) {//ie
		        var selecter = document.selection.createRange();
		        selecter.select();
		        selecter.pasteHTML(dom);
		    }
		},
		selection: function () {
			if (window.getSelection) {
				return window.getSelection()//.toString();
			} else if (document.getSelection) {
				return document.getSelection();
			} else if (document.selection) {
				return document.selection.createRange()//.text;
			}else{
				return "";
			}
			
		},
		trim: function (text) {
			return text == null ?
			"" :
			( text + "" ).replace( /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "" );
		},
		arrIndexOf: function (arr, value) {
			var index = -1;
			this.each(arr, function (i, v) {
				if (v === value) { index = i; }
			})
			return index;
		},
		addClass(elem, clsName) {
			if (!this.isNode(elem)) return;
			var oldarr = elem.className.trim().split(' ');
			var flag = false;
			for (var i = 0; i < oldarr.length; i++) {
				if(oldarr[i].trim() == "") {
					oldarr.splice(i, 1);
					i--;
					continue;
				}
				if (oldarr[i].trim() == clsName) {
					flag = true;
					break;
				}
			}
			if (!flag) {
				oldarr.push(clsName);
				elem.className = oldarr.join(" ");
			}
		},
		removeClass(elem, clsName){
			if (!this.isNode(elem)) return;
			var oldarr = elem.className.trim().split(' ');
			var flag = false;
			for (var i = 0; i < oldarr.length; i++) {
				if (oldarr[i].trim() == clsName) {
					flag = true;
					oldarr.splice(i, 1);
					i--;
				}
			}
			if (flag) {
				elem.className = oldarr.join(" ");
			}
		},
		isNode(elem){
			if (elem.nodeType == 1) return true;
			return false;
		}
	}

	var execArr = 'bold italic underline strikethrough '+
		'superscript subscript removeformat insertorderedlist insertunorderedlist '+
		'selectall justifyleft justifycenter justifyright unlink';

	var catcharr = [];

	function editor(_elem){
		this.elem = document.getElementById(_elem);
		this.init();
	}

	editor.prototype = {

		init: function () {
			this.box();
			this.menu();
			this.render();

			this.undo = 0;
			this.undobtn = null;
			this.redobtn = null;
		},
		render: function () {
			document.body.spellcheck = false;
			var _elem = util.createElem('div');
			_elem.className = 'ed-container';
			this.elem.parentNode.insertBefore(_elem, this.elem);
			this.elem.parentNode.removeChild(this.elem);
			this.elem = _elem;
			this.elem.appendChild(this.menu);
			var _Box = util.createElem('div');
			_Box.className = 'ed-dialog-container';
			this.dialog = _Box;
			this.elem.appendChild(_Box);
			this.elem.appendChild(this.body);
		},
		menu: function () {
			var me = this,
				menubox = util.createElem('div');
			menubox.className = 'ed-menu clearfix';
			menubox.onmousedown = function (e) { e.preventDefault(); }

			util.each(menuItem.split(' '), function (i, v) {
				menubox.appendChild(me.menubutton(v));
			});

			this.menu = menubox;
		},
		menubutton: function (_type) {
			var me = this,
				item = util.createElem('div');
			if (_type === '|') {
				item.className = 'edui-icon-separator';
				return item;
			}
			item.className = 'edui-icon-' + _type;
			item.onmousedown = function () {
				if (!me.isfocus()) { me.bodycontainer.focus(); }
				me.menubuttonclick(_type,this);
			}

			return item;
		},
		menubuttonclick: function (_type, btn) {
			var me = this;

			if (util.arrIndexOf(execArr.split(' '), _type) >= 0) {
				document.execCommand(_type);
			}
			if (_type == "undo") {
				undo();
				return;
			}
			if (_type == "redo") {
				redo();
				return;
			}
			switch (_type){
				case 'source':
					source();
					break;
				case 'cleardoc':
					cleardoc();
					break;
				case 'link':
					link();
					break;
				case 'horizontal':
					horizontal();
					break;
			}
			catcharr.push(me.bodycontainer.innerHTML);
			if (catcharr.length > 10) {
				catcharr.shift();
			}

			function undo (){
				var len = catcharr.length - 1;
				if ((me.undo + 1) <= len) {
					me.undo++;
					util.removeClass(btn, "disable");
				} else {
					util.addClass(btn, "disable");
				}
				me.bodycontainer.innerHTML = catcharr[catcharr.length - me.undo - 1];
			}
			function redo (){
				if ((me.undo - 1) != -1) {
					me.undo--;
					util.removeClass(btn, "disable");
				} else {
					util.addClass(btn, "disable");
				}
				me.bodycontainer.innerHTML = catcharr[catcharr.length - me.undo - 1];
			}
			function source () {
				if (!me.sourceFlag) {
					var textarea = util.createElem('textarea');
					textarea.style['resize'] = 'none';
					textarea.style['border'] = 'none';
					textarea.style['padding'] = '0px';
					textarea.style['margin'] = '0px';
					textarea.style['overflow-y'] = 'auto';
					textarea.style['outline'] = 'none';
					textarea.style['width'] = '100%';
					textarea.style['min-height'] = '200px';
					textarea.value = me.bodycontainer.innerHTML;
					me.bodycontainer.style['display'] = 'none';
					me.body.appendChild(textarea);
					me.sourceFlag = true;
				} else {
					var text = me.body.getElementsByTagName('textarea')[0];
					me.bodycontainer.innerHTML = text.value;
					text.parentNode.removeChild(text);
					me.bodycontainer.style['display'] = 'block';
					me.bodycontainer.focus();
					me.sourceFlag = false;
				}
			}
			function cleardoc () {
				me.bodycontainer.innerHTML = '<div><br/></div>';
			}
			function link () {
				var selection = util.selection();
				var selectionstr = selection.toString();
				if (!selection.isCollapsed) {
					document.execCommand('createlink',false,'_edtor_demo_link');
				} else {
					var rng = selection.getRangeAt(0);
					rng.insertNode(util.strToDom('<a href="_edtor_demo_link"></a>')[0]);
				}
				var tpl = '<table class="edui-link-table">\
						<tr>\
							<td width="18%">链接地址：</td>\
							<td width="82%"><input id="urlto" style="width: 100%" type="text"></td>\
						</tr>\
						<tr>\
							<td>标题：</td>\
							<td><input id="urltitle" style="width: 100%" type="text"></td>\
						</tr>\
						<tr>\
							<td colspan="2">是否在新窗口打开： <input id="urlcheckbox" type="checkbox"></td>\
						</tr>\
					</table>';
				var temp = util.model('超链接', 'edui-model-link', tpl, function (btn, close) {

					var data = {
						urlto: util.trim(document.getElementById('urlto').value),
						urltitle: document.getElementById('urltitle').value,
						urlcheckbox: document.getElementById('urlcheckbox').checked
					}

					if (data.urlto == "") { return; }

					if ('https file ftp'.indexOf(data.urlto.substring(0, 4).toLowerCase()) < 0) {
						data.urlto = 'http://' + data.urlto;
					}

					util.each(me.bodycontainer.getElementsByTagName('a'), function (i, v) {
						if (v.getAttribute('href') == '_edtor_demo_link') {
							v.setAttribute('href', data.urlto);
							v.setAttribute('title', data.urltitle);
							v.setAttribute('target', data.urlcheckbox ? '_blank' : '_self');
							if (util.trim(selectionstr) == "") {
								v.innerHTML = data.urlto;
							}
						}
					});
					close.call(btn);
				}, function(){
					var arr = [];
					util.each(me.bodycontainer.getElementsByTagName('a'), function (i, v) {
						if (v.getAttribute('href') == '_edtor_demo_link') {
							arr.push(v);
						}
					});
					var len = arr.length;
					console.log(len);
					while(len-- != 0) {
						var text = arr[len].innerHTML;
						arr[len].outerHTML = text;
					}
				});

				me.dialog.appendChild(temp[0]);
				me.dialog.appendChild(temp[1]);
			}
			function horizontal (){
				var selection = util.selection();
				if (selection.isCollapsed) {
					var rng = selection.getRangeAt(0);
					rng.insertNode(util.strToDom('<hr>')[0]);
				}
			}
		},
		box: function () {
			var bodyBox = util.createElem('div');
			var bodyContainer = util.createElem('div');
			bodyBox.className = 'ed-body';
			bodyContainer.className = 'ed-body-container';
			var oldtext = '<div>' + this.elem.innerHTML + '</div>';
			bodyContainer.innerHTML = oldtext;
			catcharr.push(oldtext);
			this.elem.innerHTML = "";
			bodyContainer.designMode = "on";
			bodyContainer.contentEditable = "true";
			bodyBox.appendChild(bodyContainer);
			bodyContainer.setAttribute('id', this.elem.getAttribute('id'));
			this.body = bodyBox;
			this.bodycontainer = bodyContainer;
		},
		isfocus: function () {
			if(!this.bodycontainer) { return false; }
			if(document.activeElement === this.bodycontainer) {
				return true;
			}else {
				return false;
			}
		},
		getContent: function () {
			return this.bodycontainer.innerHTML;
		}
	}

	return editor;
}())
