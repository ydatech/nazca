/**
 * Nazca Editor v0.1.0
 * JS Graphic Editor
 * @author Mikhail Baranovsky <mihrootk@gmail.com>
 * Copyright (c) 2014-2015 Mikhail Baranovsky
 */
 

window.nzc_fonts = window.nzc_fonts ? window.nzc_fonts : [
	['Arial', '', true],
	['Georgia', '', true],
	['Times New Roman', '', true]
];
 
var nzc_textAlign = {
					LEFT:	1,
					CENTER:	2,
					RIGHT:	3
};


var nzc_workspaceTypes = {
		FACEBOOK:	{ id: 1, width: 800, height: 669, ratio: 1.19518716577540 }
};


function nzc_escapeHtml(html) {
		
	_times= function(string, number) {
		for (var i=0, r=''; i<number; i++) r += string;
		return r;
	};

	html = html.replace(/</g, '&lt;')
							.replace(/&/g, "&amp;")
     						.replace(/</g, "&lt;")
							.replace(/>/g, '&gt;')
							.replace(/&/g, '&amp;')
							.replace(/\n$/, '<br/>&nbsp;')
							.replace(/\n/g, '<br/>')
							.replace(/ {2,}/g, function(space){ return _times('&nbsp;', space.length - 1) + ' ' });
	
	return html;
}


function nzc_loadFontStylesheet( font ) {
	
	var arrayOffset = null;
	if( typeof(font) === 'string' ) {
		for(var i in nzc_fonts) {
			if(nzc_fonts[i][0] === font) {
				arrayOffset = i;
				break;
			}
		}
	} else {
		arrayOffset = font;
	}
	
	if(arrayOffset === null) {
		return false;
	}
	
	var _stylesheetLink		= nzc_fonts[arrayOffset][1];
	var _stylesheetLoaded	= nzc_fonts[arrayOffset][2];
			
	if(!_stylesheetLoaded && _stylesheetLink) {
		var _stylesheet = document.createElement("link")
			_stylesheet.setAttribute("rel", "stylesheet")
			_stylesheet.setAttribute("type", "text/css")
			_stylesheet.setAttribute("href", _stylesheetLink)
				
			document.getElementsByTagName("head")[0].appendChild(_stylesheet)
				
			//Mark that font is loaded
			nzc_fonts[arrayOffset][2] = true;
			
	}
	
	return true;
}


//Nazca Workspace
(function( $ ) {
	
	var version = "0.1.0";
	
	var methods	= {};
	
	
	var keyCode = {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		CTRL: 17
	};
	
	var elementType = {
		IMAGE: 1,
		TEXT: 2
	};
	
	
	
	var _opts = {
		
		workspace: nzc_workspaceTypes.FACEBOOK,
		
		ratio_lock: true,
		
		resize_width_limit: 0,
		resize_height_limit: 0
		
	};
	
	
	
	var touch = false;
	//Is touch events supported?
	if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		touch = true;
	} 
		
	console.log('Touch Events: ' + (touch ? 'supported' : 'not supported'));

	
	
	var _last_space_id		= 0;
	var _nazca_spaces		= {};
	var _nazca_spaces_count	= 0;
	
	// Plugin definition.
	$.fn.nazca = function( method ) {
		
		if(typeof(method) === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
            $.error('Method ' + method + ' does not exists.');
        }
		
	};	

	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.init = function (userOpts) {
		
		var opts = $.extend( {}, _opts, userOpts );
		
		$('body').addClass('not-selectable');
		
		return this.each(function() {		
			
			var $_nazca = $(this);
			
			if($_nazca.hasClass('nazca-workspace')) {
				return false;
			}
			
			
			$_nazca.addClass('nazca-workspace');
			
			
			var _width	= $_nazca.innerWidth();
			var _height	= $_nazca.innerHeight();

			var _ratio = _width / _height;
			if( _opts.workspace.ratio < _ratio) {
				_width	= _height * _opts.workspace.ratio;
				$_nazca.innerWidth(_width);
			} else {
				_height	= _width * _opts.workspace.ratio;
				$_nazca.innerHeight(_height);
			}
			
			
		
			var $_nazca_elements		= $('<div class="nazca-elements"></div>').appendTo($_nazca);
			var $_nazca_resize_wrap		= $('<div class="nazca-resize-wrap" style="display:none;"><div class="nazca-resize-draggable"></div><a class="nazca-resize-control top-left"></a><a class="nazca-resize-control left"></a><a class="nazca-resize-control top-right"></a><a class="nazca-resize-control bottom-left"></a><a class="nazca-resize-control right"></a><a class="nazca-resize-control bottom-right"></a></div>').appendTo($_nazca);
			var $_nazca_editor_controls	= $('<div class="nazca-editor-controls" style="display:none;"></div>').appendTo($_nazca);
		 	var $_nazca_align_controls	= $('<div class="nazca-align-controls"><div class="nazca-align vertical na-vl"></div><div class="nazca-align vertical na-vr"></div><div class="nazca-align vertical na-vc"></div></div>').appendTo($_nazca);
			

			
			var _space_id = ++_last_space_id;
			_nazca_spaces_count++;
			
			_nazca_spaces[_space_id] = {
				
				$nazca: $_nazca,
				
				$nazca_elements:		$_nazca_elements,
				$nazca_resize_wrap:		$_nazca_resize_wrap,
				$nazca_editor_controls:	$_nazca_editor_controls,
				$nazca_align_controls:	$_nazca_align_controls,
				
				resize_wrap_border_width:	Math.round( parseFloat( $_nazca_resize_wrap.css('border-left-width') ) ),
				editor_controls_height:		$_nazca_editor_controls.height() + 10,
				
				opts: opts,
				
				elements: [],
				active_element_id: 0,
				element_last_id: 0,
				
				scale_delta: _width / _opts.workspace.width
				
			};
			
			var _space = _nazca_spaces[_space_id];
			
			$_nazca.attr('data-nazca-id', _space_id);
			
			
			
			var _hideResize = function() {
				
				$_nazca_resize_wrap.hide();
				$_nazca_editor_controls.hide();
				
				
				//TODO: detach events?
				//Get draggable jQuery Obj
				var $_resize_draggable = _space.$nazca_resize_wrap.find('.nazca-resize-draggable');
				$_resize_draggable.nzc_textarea('remove');
			
				if(_space['active_element_id']) {
					
					//If it was textarea and new value is empty string, we need to remove element
					var elementData = _getElementData( _space_id, _space['active_element_id'] );
					if(elementData && elementData.type == elementType.TEXT && elementData.desc == '') {
						_removeElement( _space_id, _space['active_element_id'] );
					}
					
					_space['active_element_id'] = 0;
							 
				}
				
				
				
			}
			
			$(document).bind('mousedown.nazca dragstart.nazca touchstart.nazca', 
							function(e) {
											if(!_space['active_element_id']) {
												return true;
											}
											
											var $e = $(e.target);
											if(!$e.parents('.nazca-resize-wrap').length && !$e.hasClass('nazca-resize-wrap') 
												&& !$e.parents('.element').length && !$e.hasClass('element')
												&& !$e.parents('.nazca-editor-controls').length && !$e.hasClass('nazca-editor-controls')
												) {
												
												_hideResize();
												
											}
										}
						);
		
			
			$(document).bind('keydown.nazca', 
				function(e) {

					switch(e.which) {
												
						case keyCode.ESCAPE:
							_hideResize();
						break;
						
						case keyCode.DELETE:
						//TODO: if textarea used do not delete element
						/*
							if(_space['active_element_id']) {
								
								var element_id = _space['active_element_id'];
								_removeElement( _space_id, element_id );
								 
							}
						*/
						break;
						
						default:
						break;
					}

				}
			);
			
		});
		
	}
	
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.reset = function() {
		
		$(document).unbind('mousedown.nazca dragstart.nazca touchstart.nazca keydown.nazca');
		
		return this.each(function () {
			
			var $_nazca				= $(this);
			var $_nazca_elements	= $_nazca.find('.nazca-elements');
			
			if($_nazca_elements) {
				_clear($_nazca_elements);
			}
			
			delete _nazca_spaces[parseInt($_nazca.attr('data-nazca-id'))];
			
			_nazca_spaces_count--;
			if(!_nazca_spaces_count) {
				$('body').removeClass('not-selectable');
			}
			
		});
		
	}
	
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _clear( $_nazca_elements ) {
		
		$_nazca_elements.empty();
		
	}
	
	
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.exportJSON = function() {
		
		var _spaces_data = [];
		
		this.each(function () {
			
			var $_nazca				= $(this);
			var _space_id			= $_nazca.attr('data-nazca-id');
			var _space_data			= [];
			
			for(var i in _nazca_spaces[_space_id].elements) {
				
				//Copy object. So we can modify changes
				var _element = $.extend( {} , _nazca_spaces[_space_id].elements[i]);
				delete _element['css'];
				
				_space_data.push( _element );
			
			}
			
			_spaces_data.push({'type' : _nazca_spaces[_space_id].opts.workspace.id, 'data' : _space_data });
			
		});
		
		return _spaces_data;
		
	}
	
	
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.addElements = function( elements ) {
		return this.each(function () {
			
			var $_nazca				= $(this);
			var _space_id			= $_nazca.attr('data-nazca-id');
			
			if(!_space_id) {
				return false;
			}
			
			_addElements( _space_id, elements );
			
		});
	}
	
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.addNewElement = function( element ) {
		return this.each(function () {
			
			var $_nazca				= $(this);
			var _space_id			= $_nazca.attr('data-nazca-id');
			
			if(!_space_id) {
				return false;
			}
			
			var _space		= _nazca_spaces[_space_id];
			var scale_delta	= _space.scale_delta
			
			var _n_width	= Math.round($_nazca.width() / scale_delta);
			var _n_height	= Math.round($_nazca.height() / scale_delta);
			
			
			
			element['x'] = 0; element['y'] = 0; 
			
			if(element.type == elementType.IMAGE) {
				var _ratio = element['width']/element['height'];
			
				if((_n_width/_n_height) > _ratio) {
					element['width']	= _n_width;
					element['height']	= Math.round(element['width'] / _ratio );
				} else {
					element['height']	= _n_height;						
					element['width']	= Math.round(element['height'] * _ratio);
				}
						
				if(element['width'] > _n_width) {
					element['x'] = Math.round((_n_width-element['width'])/2);
				}
				
				if(element['height'] > _n_height) {
					element['y'] = Math.round((_n_height-element['height'])/2);
				}
			} else if(element.type == elementType.TEXT) {
			
				element['x'] = Math.round((_n_width-element['width'])/2);
				element['y'] = Math.round((_n_height-element['fontSize'])/2);
				
			}

			var $element = _addElements( _space_id, element );
			if($element) {
				_onElementSelect( _space_id, $element )
			}
			
		});
	}
	
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.redrawElement = function( element_id ) {
		return this.each(function () {
			
			var $_nazca				= $(this);
			var _space_id			= $_nazca.attr('data-nazca-id');
			
			if(!_space_id) {
				return false;
			}
			
			var element = _getElementData( _space_id, element_id );
			
			if(element) {
				_drawElement(_space_id, element);
			}
			
		});
	}
	
	
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.getElementData = function( element_id ) {
		
		var $_nazca				= $(this);
		var _space_id			= $_nazca.attr('data-nazca-id');
		
		if(!_space_id) {
			return false;
		}
		
		
		return _getElementData( _space_id, element_id );
		
	}
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.setElementAttr = function( element_id, key, value ) {
		
		return this.each(function () {
			
			var $_nazca				= $(this);
			var _space_id			= $_nazca.attr('data-nazca-id');
			
			if(!_space_id) {
				return false;
			}
			
			_setElementAttr( _space_id, element_id, key, value || null );
			
		});
		
	}
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.removeElement = function( element_id ) {
		
		return this.each(function () {
			
			var $_nazca				= $(this);
			var _space_id			= $_nazca.attr('data-nazca-id');
			
			if(!_space_id) {
				return false;
			}
			
			_removeElement( _space_id, element_id );
			
		});
		
	}
	
	
	
	
	/**
	 * Sets calendar view mode 
	 * @param {enum} CALENDAR_MODES 
	 * @return {bool} rendering result
	 * @public
	 */
	methods.moveElement = function( element_id, direction ) {
		
		return this.each(function () {
			
			var $_nazca				= $(this);
			var _space_id			= $_nazca.attr('data-nazca-id');
			
			if(!_space_id) {
				return false;
			}
			
			_moveElement( _space_id, element_id, direction );
			
		});
		
	}
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _getElementData( _space_id, element_id ) {
		
		if(!_space_id) {
			return false;
		}
		
		var _space = _nazca_spaces[_space_id];
		
		for( var i in _space.elements ) {
			if(_space.elements[i]['id'] == element_id) {
				return _space.elements[i];
			}
		}
		
		return null;
		
	}
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _addElements( _space_id, elements ) {
		
		var _space = _nazca_spaces[_space_id];
		var $element;
		
		if( !_isArray( elements ) ) {
			elements = [elements];
		}

		for(i in elements) {
			
			$element = _drawElement(_space_id, elements[i]);
			
			//Attach controls
			if( $element ) {
				_attach_handlers(_space_id, $element);
			}
			
		}
		
		return elements.length === 1 ? $element : false;
		
	}	
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _drawElement( _space_id, element ) {
		
		var _space = _nazca_spaces[_space_id];
		
		var scale_delta = _space.scale_delta;
		var i, _e, _w, _h, _t, _l, _style, zIndex;
		
		
		
		if(typeof element != 'object') {
			
			element = _getElementData( _space_id, element );
			
			if(!element) {
				return false;
			}
			
		}
		
		
		var $element = null;
			
			_e	= element;
			
			if(!_e['id']) {
				
				_e['id']	= ++_space.element_last_id;
				zIndex		= _space.elements.push(_e);
				
			} else {
				
				$element	= _space.$nazca_elements.find('.element[data-id="' + _e['id'] + '"]');
				zIndex		= _e['css']['zIndex'];
				
			}

			//Scale
			_e['css']			= {};
			_e['css']['zIndex']	= zIndex;
			_e['css']['width']	= _w	= Math.round(_e['width'] * scale_delta);
			_e['css']['height']	= _h	= Math.round(_e['height'] * scale_delta);
			_e['css']['left']	= _l	= Math.round(_e['x'] * scale_delta);
			_e['css']['top']	= _t	= Math.round(_e['y'] * scale_delta);
			
				
			switch( _e['type'] ) {	
						
				case elementType.IMAGE:
				
					_style = 'top:' + _t + 'px;left:' + _l + 'px;z-index:' + zIndex + ';width:' + _w + 'px;height:' + _h + 'px;';
					
					if($element) {
						$element.attr('style', _style);
					} else {
						$element = $('<div class="element image" data-id="' + _e['id'] + '" style="' + _style + '"><img src="' + _e['src'] + '" width="100%" height="100%" /></div>').appendTo(_space.$nazca_elements);
					}
					
				break;
				
				case elementType.TEXT:
					
					nzc_loadFontStylesheet( _e['fontFamily'] );
					
					var align = _e['textAlign'] == 3 ? 'right' : ( _e['textAlign'] == 2 ? 'center' : 'left');
					
					_style = 'top:' + _t + 'px;left:' + _l + 'px;z-index:' + zIndex + ';width:' + _w + 'px;height:auto;font-family:' + _e['fontFamily'] +';font-size:' +  Math.round(_e['fontSize'] * scale_delta) + 'px;line-height:' + Math.round( _e['fontSize'] * 1.15  * scale_delta) + 'px;color:' + _e['color'] + ';text-align:' + align + ';';
					
					if($element) {
						$element.attr('style', _style).html(nzc_escapeHtml(_e['desc']));
					} else {
						$element = $('<div class="element text" data-id="' + _e['id'] + '" style="' + _style + '">' + nzc_escapeHtml(_e['desc']) + '</div>').appendTo(_space.$nazca_elements);
					}
					
				break;
				
				default:
				break;
				
			}
		
		
		
		$element.trigger( 'nzc_draw' );
			
		return $element;
			
	}
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _setElementAttr( _space_id, element_id, key, value ) {
		
		var _space = _nazca_spaces[_space_id];

		for( var i in _space.elements ) {
			if(_space.elements[i]['id'] == element_id) {
				
				if(key !== null && typeof key === 'object') {
					$.extend( true, _space.elements[i], key);
				} else {
					_space.elements[i][key] = value;
				}
					
				return true;
			}
		}
		
		return false;
	}
	

	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _removeElement( _space_id, element_id ) {
		
		var _space = _nazca_spaces[_space_id];

		for( var i in _space.elements ) {
			if(_space.elements[i]['id'] == element_id) {
				
				//TODO: Detach events?
				_space.$nazca_editor_controls.hide();
				_space.$nazca_resize_wrap.hide();
		
				_space.elements.splice(i,1);
				
				
				var $element = _space.$nazca_elements.find('.element[data-id="' + element_id + '"]');
				
				$element.trigger( 'nzc_remove' ).remove();
				
				_space['active_element_id'] = 0;
				
				return true;
			}
		}
		
		return false;
	}
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _moveElement( _space_id, element_id, direction ) {
		
		var _space	= _nazca_spaces[_space_id];
		var _status	= false; var _new_index;
		
		
		var i = _getElementIndex( _space_id, element_id );
		
		if(i !== false) {
			
			_new_index = _nearestIntersect( _space_id, i, direction );
			
			if(_new_index !== false) {
				
				_arrayMove(_space.elements, i, _new_index);
				_zIndexReset( _space_id );
				
				return true;
			}
				
		}

		
		return _status;
	}
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _nearestIntersect( _space_id, elementIndex, direction ) {
		
		var _space	= _nazca_spaces[_space_id];
		var _status	= false; var _new_index;
		
		var _length = _space.elements.length;
		
		var _start, _end, _e2;
		
		
		var _e1 = _space.elements[elementIndex];
		if(_e1.type == elementType.TEXT) {
			//TODO: something better?
			_e1['height'] = Math.round(_space.$nazca_elements.find('.element[data-id="' + _e1['id'] + '"]').height() / _space.scale_delta );
		}
		
		
		if(direction == 'back' && elementIndex > 0) {
			_start	= elementIndex-1;
			_end	= 0;
		}
		else if(direction == 'forward' && elementIndex < _length - 1) {	
			_start	= elementIndex+1;
			_end	= _length - 1;
		}

	
		for(var i = _start; (direction == 'back' ? i >= _end : i <= _end); (direction == 'back' ? i-- : i++)) {
			
			_e2 = _space.elements[i];
			
			if(_intersect(_e1, _e2)) {
				return i;
			}
			
		}
		
		return false;
	
	}
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _getElementIndex( _space_id, element_id ) {
		
		var _space = _nazca_spaces[_space_id];
		var _arrayOffset; var _status = false; var _new_index;

		for(var i in _space.elements) {
			
			i = parseInt(i);
			
			if(_space.elements[i]['id'] == element_id) {
				return i
			}
			
		}
		
		return false;
		
	}
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _zIndexReset( _space_id ) {
		
		var _space	= _nazca_spaces[_space_id];
		
		var _e;
		for(var i in _space.elements) {
			
			i = parseInt(i);
			
			_e1 = _space.elements[i];
			_e1['css']['zIndex']	= i + 1;
			_space.$nazca_elements.find('.element[data-id="' + _e1['id'] + '"]').css({'zIndex': _e1['css']['zIndex']});

			if(_space.active_element_id == _e1['id']) {
					_space.$nazca_resize_wrap.css({'zIndex': _e1['css']['zIndex']});
			}
			
		}
		
	}
	
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _onElementSelect( _space_id, $element ) {
		
		var _space = _nazca_spaces[_space_id];
		
		var resize_wrap_border_width	= _space.resize_wrap_border_width;
		var editor_controls_height		= _space.editor_controls_height;
  		
		
		var _element_id, _element;	
		
		_element_id					= $element.attr('data-id');
		_space.active_element_id	= _element_id;
		
		_element					= _getElementData( _space_id, _element_id ) ;
		
		
		//TODO: remove later.. now used by determination of text element height
		/*_element['css']['width']	= $element.width();
		_element['css']['height']	= $element.height();
		_element['css']['top']		= parseFloat($element.css('top'));
		_element['css']['left']		= parseFloat($element.css('left'));*/
		

		var	element_width_wb,
			element_height_wb;
			
		element_width_wb	= _element['css']['width'] + resize_wrap_border_width * 2;
		element_height_wb	= _element['css']['height'] + resize_wrap_border_width * 2;

		
		
														
		//Fit resize controls wrap to element size
		//and set valid position
		_space.$nazca_resize_wrap.css({
			width:	element_width_wb,
			height:	element_height_wb,
			top:	_element['css']['top'] - resize_wrap_border_width,
			left:	_element['css']['left'] - resize_wrap_border_width,
			zIndex: _element['css']['zIndex']
		});
		
		
		
		//Set and show valid controls
		_init_editor_controls( _space_id );
		
		
		
		//Show resize controls
		_space.$nazca_resize_wrap.show();
		
		
		
		//Init above element resize draggable
		_init_resize_draggable ( _space_id );
		
		
		//Init resize controls
		_init_resize_controls ( _space_id , _element['type'] );
		
	}
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _attach_handlers( _space_id, $element ) {
		
		var _space = _nazca_spaces[_space_id];
		
		var parent_container = _space.$nazca_elements.get(0);
					
		var resize_wrap_border_width	= _space.resize_wrap_border_width;
		var editor_controls_height		= _space.editor_controls_height;
  
  				
		var _element_id, _element;	
		_element_id					= $element.attr('data-id');
		_element					= _getElementData( _space_id, _element_id ) ;
		
									
		_attach_drag_events_handlers($element, { 
										container: parent_container,
										onDragStart: function() {
											
											_onElementSelect( _space_id, $element );

										},
										onDrag: function( data ) {
											
											_element['css']['left']	= data.position[0];
											_element['css']['top']	= data.position[1];
											
											$element.css({
												'left':	_element['css']['left'],
												'top':	_element['css']['top']
											});
											
											_setElementAttr(_space_id, _space.active_element_id, {
														'x': Math.round(data.position[0] / _space.scale_delta),
														'y': Math.round(data.position[1] / _space.scale_delta)
													});
											
											_space.$nazca_resize_wrap.css({
												left:	data.position[0] - resize_wrap_border_width,
												top:	data.position[1] - resize_wrap_border_width
											});
											
											
											_space.$nazca_editor_controls.css({
												left:	data.position[0] - resize_wrap_border_width	,
												top:	data.position[1] - resize_wrap_border_width - editor_controls_height,
												display: 'none'
											});
											
											
											
											//Set align controls
											_set_align_controls( _space_id );
											
										},
										onDragEnd: function( data ) {
											_space.$nazca_editor_controls.show();
											_hide_align_controls( _space_id );
										}
								}
							);
										
										
	}
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _init_resize_controls ( _space_id, _element_type ) {
		
		var _space		= _nazca_spaces[_space_id];
		
		//Resize controls
		_detachResizeControls( _space_id, ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right']);

		_space.$nazca_resize_wrap.removeClass('nazca-wh-resizable nazca-w-resizable');
			
		if( _element_type == elementType.IMAGE ) {
			
			_attachResizeControls( _space_id, ['top-left', 'top-right', 'bottom-left', 'bottom-right']);
			_space.$nazca_resize_wrap.addClass('nazca-wh-resizable');
			
		} else {
			
			_attachResizeControls( _space_id, ['left', 'right']);
			_space.$nazca_resize_wrap.addClass('nazca-w-resizable');
		
		}
		
	}
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _detachResizeControls ( _space_id, position_names ) {
		
		var _space		= _nazca_spaces[_space_id];
		
		//Convert to array if needed
		if( ! _isArray( position_names) ) {
			position_names = [position_names];
		}
		
		for(var i in position_names) {
			_detach_drag_events_handlers( _space.$nazca_resize_wrap.find('.' + position_names[i]));
		}
		
	};
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _attachResizeControls( _space_id, position_names ) {
		
		var _space		= _nazca_spaces[_space_id];
		
		var _element_id = _space.active_element_id;
		var _element	= _getElementData( _space_id, _element_id );
		
				
		var $element	= _space.$nazca_elements.find('.element[data-id="' + _element_id + '"]');	
		
		//Convert to array if needed
		if( ! _isArray( position_names) ) {
			position_names = [ position_names ];
		}
		
		var width, height, startDistance, endDistance, ratio;
		var position_name;
		
		for(var i in position_names) {
			
			position_name = position_names[i];			
			
			(function( position_name ) {
				
				var $rc = _space.$nazca_resize_wrap.find('.' + position_name);
				
				_attach_drag_events_handlers( $rc , {
					
					draggable: $element.get(0),
					container: _space.$nazca_elements.get(0),
					
					onDragStart: function() {
						
						width	= $element.width();
						height	= $element.height();
						
						startDistance = Math.sqrt( width * width + height * height );
						ratio = width / height;
						
						_space.$nazca_editor_controls.hide();
						
					},
					
					onDrag: function( data ) {
						
						var new_width = null, new_height = null;
						
	
						switch( position_name ) {
							
							case 'top-left':
								new_width	= width - data.distance[0];
								new_height	= height - data.distance[1];
							break;
							
							case 'top-right':
								new_width	= width + data.distance[0];
								new_height	= height - data.distance[1];
							break;
							
							case 'bottom-left':
								new_width	= width - data.distance[0];
								new_height	= height + data.distance[1];
							break;
							
							case 'bottom-right':
							
								new_width	= width + data.distance[0];
								new_height	= height + data.distance[1];
								
											
								
								
							break;
							
							
							case 'left':
								new_width	= width - data.distance[0];
							break;
							
							
							case 'right':
								new_width	= width + data.distance[0];
							break;																		
							
							
							default:
								_detach_drag_events_handlers( $rc );
								return false;
						
						}
				
						//If ratio lock set, we need to modify width'n'height values. The bigger the distance from the start point, the bigger width'n'height
						if( _space.opts.ratio_lock && new_height !== null ) {
							
							//TODO: new algorythm
							var _sqrt = Math.sqrt( new_width * new_width + new_height * new_height );

							new_width	= width * (_sqrt / startDistance);
							new_height	= new_width / ratio;
							
						}
						
						
						//No need to resize items below resize limit
						if( new_width <= _space.opts.resize_width_limit || ( new_height <= _space.opts.resize_height_limit && new_height !== null ) ) {
							return false;
						}
						

						
						var resize_wrap_css = {
							width: new_width + 2 * _space.resize_wrap_border_width,
							height: (new_height !== null ? new_height : $element.height()) + 2 * _space.resize_wrap_border_width
						};
						
						
						
						var editor_controls_css = {};
						
						
						switch( position_name ) {
							
							case 'top-left':
								
								_element['css']['left']		= _element['css']['left'] + _element['css']['width'] - new_width;
								_element['css']['top']		= _element['css']['top'] + _element['css']['height'] - new_height;
						
								resize_wrap_css['left']		= _element['css']['left'] - _space.resize_wrap_border_width;
								resize_wrap_css['top']		= _element['css']['top'] - _space.resize_wrap_border_width;
								
								
								editor_controls_css['left']	= _element['css']['left'];
								editor_controls_css['top']	= resize_wrap_css['top'] -  _space.editor_controls_height;
								
							break;
							
							case 'top-right':
							
								_element['css']['top']		= _element['css']['top'] + _element['css']['height'] - new_height;
							
								resize_wrap_css['top']		= _element['css']['top'] - _space.resize_wrap_border_width;
																
								editor_controls_css['top']	= resize_wrap_css['top'] - _space.editor_controls_height;
								
							break;
							
							case 'bottom-left':
								
								_element['css']['left']		= _element['css']['left'] + _element['css']['width'] - new_width;

								resize_wrap_css['left']		= _element['css']['left'] - _space.resize_wrap_border_width;
																
								editor_controls_css['left']	= _element['css']['left'];
								
							break;
							
							case 'left':
								
								_element['css']['left']		= _element['css']['left'] + _element['css']['width'] - new_width;
								
								resize_wrap_css['left']		= _element['css']['left'] - _space.resize_wrap_border_width;
																
								editor_controls_css['left']	= _element['css']['left'];
								
							default:
							break;
						
						}
						
						//Save new width and height
						_element['css']['width']	= new_width;
						_element['css']['height']	= new_height !== null ? new_height : 'auto'
						
						
						//Apply changes
						_space.$nazca_resize_wrap.css(resize_wrap_css);
						$element.css(_element['css']);
						_space.$nazca_editor_controls.css(editor_controls_css);
						
						
						//Recalc
						var attributes = {}; var i, v, k;
						for(var i in _element['css']) {
							
							k = (i == 'left' ? 'x' : (i == 'top' ? 'y' : i) );
							//TODO zIndex in css
							v = Math.round( _element['css'][i] / _space.scale_delta );
							
							attributes[k] = v;
						}
						_setElementAttr(_space_id, _space.active_element_id, attributes);
						
						
						
						//Trigger evebt
						$element.trigger( 'nzc_resize', [ _element['css'] ] );
						
						//Set align controls
						_set_align_controls( _space_id );
					
					},
					onDragEnd: function() {
						_space.$nazca_editor_controls.show();
						_hide_align_controls( _space_id );
					}
				});
				
			})( position_name );
			
		}
											  
	}
	
	
	
											
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _init_resize_draggable ( _space_id ) {
		
		var _space		= _nazca_spaces[_space_id];
		
		var _element_id = _space.active_element_id;
		var _element	= _getElementData( _space_id, _element_id );
		
		
		//Get draggable jQuery Obj
		var $_resize_draggable = _space.$nazca_resize_wrap.find('.nazca-resize-draggable');
		
		
		//Resize controls are above element.. So we need to attach drag-bindings to controls-wrap
		//But first of all, detach old bindings from resize controls.. 
		_detach_drag_events_handlers( $_resize_draggable );
		
		
		//Detach old textarea
		$_resize_draggable.nzc_textarea('remove');
		
		
		//Attach textarea if needed
		if( _element['type'] == elementType.TEXT ) {
			
			$_resize_draggable.nzc_textarea('init', _element_id );
			
		}
		else {
			
			_attach_drag_events_handlers( $_resize_draggable, { 
			
				draggable: _space.$nazca_resize_wrap.get(0),
				container: _space.$nazca_elements.get(0),
				
				onDrag: function( data ) {
					
					_element['css']['left']	= data.position[0];
					_element['css']['top']	= data.position[1];
											
					_space.$nazca_elements.find('.element[data-id="' + _element_id + '"]').css({
						'left':	_element['css']['left'] + _space.resize_wrap_border_width,
						'top':	_element['css']['top'] + _space.resize_wrap_border_width
					});
					
					_setElementAttr(_space_id, _space.active_element_id, {
						'x': Math.round((_element['css']['left'] + _space.resize_wrap_border_width) / _space.scale_delta),
						'y': Math.round((_element['css']['top'] + _space.resize_wrap_border_width) / _space.scale_delta)
					});
					
					_space.$nazca_resize_wrap.css({
						left:	_element['css']['left'],
						top:	_element['css']['top']
					});	
					
					_space.$nazca_editor_controls.css({
						left:		_element['css']['left'],
						top:		_element['css']['top'] - _space.editor_controls_height,
						display:	'none'
					});
					
					
					//Set align controls
					_set_align_controls( _space_id );
					
				},
				
				onDragEnd: function(data) {
					_space.$nazca_editor_controls.show();
					_hide_align_controls( _space_id );
				}
				
			});
			
		}
											
	}
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _init_editor_controls( _space_id ) {
		
		var _space		= _nazca_spaces[_space_id];
		
		var _element_id = _space.active_element_id;
		var _element	= _getElementData( _space_id, _element_id ) ;
		
		
		//Show editor controls
		_space.$nazca_editor_controls.show();
		_space.$nazca_editor_controls.css({
			left:	_element['css']['left'] - _space.resize_wrap_border_width,
			top:	_element['css']['top'] - _space.resize_wrap_border_width - _space.editor_controls_height
		});
		
		//detach old control plugin
		_space.$nazca_editor_controls.nzc_image_controls('remove');
		_space.$nazca_editor_controls.nzc_text_controls('remove');
		
		//attach necessary control plugin
		if( _element['type'] == elementType.IMAGE ) {
			_space.$nazca_editor_controls.nzc_image_controls('init', _element_id );
		} else {
			_space.$nazca_editor_controls.nzc_text_controls('init', _element_id );
		}
		
		//TODO: Remove this hack, 
		//If parent relative element have fixed width and we are to close to parents right border, elements in nazca_editor_controls panel can be breaked to fit remained space
		_space.$nazca_editor_controls.css({'position':'absolute', 'width':_space.$nazca_editor_controls.css({'position':'fixed', 'width':'auto'}).outerWidth()});
		
	}
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _set_align_controls( _space_id ) {

		var _space		= _nazca_spaces[_space_id];
		
		var _element_id = _space.active_element_id;
		var _element	= _getElementData( _space_id, _element_id ) ;
		
		var _height_increment = 50;
		
		$.each(_space.$nazca_align_controls.find('.vertical'), function(i,v) {
												
			var $a = $(this);
			var css = {
				height:	_element['css']['height'] + _space.resize_wrap_border_width * 2 + _height_increment,
				top:	_element['css']['top'] - _height_increment / 2,
				left:	_element['css']['left'],
			};
			
			if($a.hasClass('na-vc')) {
				css.left = css.left + _element['css']['width'] / 2;
			} else if($a.hasClass('na-vr')) {
				css.left = css.left + _element['css']['width'];
			}
			
			$a.css(css).addClass('on');
		});
		
	}
	
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _hide_align_controls( _space_id ) {
		
		var _space		= _nazca_spaces[_space_id];

		_space.$nazca_align_controls.find('.on').removeClass('on');
		
	}
	
	
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _attach_drag_events_handlers( $e , opts) {
		
		var data = opts;
		
		if( touch ) {
			$e.bind( 'touchstart', data, _mouse_down_touch_start);
		} else {
			$e.bind( 'dragstart', function() { return false; } );
			$e.bind( 'mousedown', data, _mouse_down_touch_start );
		}
	
	}
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _detach_drag_events_handlers( $e ) {
		
		if( touch ) {
			$e.unbind( 'touchstart' );
		} else {
			$e.unbind( 'dragstart' );
			$e.unbind( 'mousedown' );
		}
	
	}
	
	
	
	
	/**
	 * Desc
	 * @param {int} Workspace ID 
	 * @return {null} rendering result
	 * @private
	 */
	function _mouse_down_touch_start( jq_e ) {
			
		var _dragging = false;		
		
		
		var draggable		= jq_e.data.draggable || this;
		var $draggable		= $(draggable);
		
		
		
		var container	= jq_e.data.container || $draggable.parent().get(0);
		
		var onDragStart	= jq_e.data.onDragStart || null;
		var onDrag		= jq_e.data.onDrag || null;
		var onDragEnd	= jq_e.data.onDragEnd || null;
		


		var e = _fixEvent( jq_e.originalEvent );

		//Get thumb element coords
		var draggableCoords = _getCoords( draggable );
		var containerCoords = _getCoords( container );
	 
	 
		var shiftX = e.pageX - draggableCoords.left;
		var shiftY = e.pageY - draggableCoords.top;
		
		
		//save PageX, PageY during movement; TouchEnd event don't return coords
		var pageX = e.pageX;
		var pageY = e.pageY;
		
		
		var startLeft	= pageX - shiftX - containerCoords.left;
		var startTop	= pageY - shiftY - containerCoords.top;
		var newLeft		= startLeft;
		var newTop		= startTop;
		
		//Call onDragStart() if set
		if(onDragStart) {
			onDragStart.call( draggable );
		}
		
		
		//Mouse move || Touch move
		var _mMoveTMove = function(e) {
		  
			//Remove IOS overscroll, etc.
			if(touch) {
				e.preventDefault();
				e.stopPropagation();
			}
	
			//Dragging state trigger
			_dragging = true;
		
			
			e = _fixEvent( e.originalEvent );
		
			pageX = e.pageX;
			pageY = e.pageY;

			//  вычесть координату родителя, т.к. position: relative
			newLeft	= pageX - shiftX - containerCoords.left;
			newTop	= pageY - shiftY - containerCoords.top;

			
			//Call onDrag() if set
			if(onDrag) {
				
				onDrag.call( draggable ,  { position: [newLeft, newTop], distance: [newLeft - startLeft, newTop - startTop] } );
			
			} else {
				
				draggable.style.left	= newLeft + 'px';
				draggable.style.top		= newTop + 'px';
				draggable.style.right	= 'auto';
				draggable.style.bottom	= 'auto';
				
			}
			
		}
		
		
		
		
		//Mouse up || Touch end
		var _mUpTEnd = function(e) {
			
			_dragging = false;
			
			/*var newLeft			= pageX - shiftX - containerCoords.left;
			var rightEdge		= container.offsetWidth - draggable.offsetWidth;*/
			
			if(touch) {
				$('body').unbind('touchmove.nazcaEleDrag', _mMoveTMove);
				$('body').unbind('touchend.nazcaEleDrag', _mUpTEnd);
			} else {
				$(document).unbind('mousemove.nazcaEleDrag', _mMoveTMove);
				$(document).unbind('mouseup.nazcaEleDrag', _mUpTEnd);
			}
			
			//Call onDragEnd() if set
			if(onDragEnd) {
				onDragEnd.call( draggable ,  { position: [newLeft, newTop], distance: [newLeft - startLeft, newTop - startTop] } );
			}
			
		}
		
		
		
		//Unbind
		if(touch) {
			$('body').bind('touchmove.nazcaEleDrag', _mMoveTMove);
			$('body').bind('touchend.nazcaEleDrag', _mUpTEnd);
		} else {
			$(document).bind('mousemove.nazcaEleDrag', _mMoveTMove);
			$(document).bind('mouseup.nazcaEleDrag', _mUpTEnd);
		}
						
					
	}
	
	
	
	/**
	 * Used in drag'n'drop/touch features
	 * from http://learn.javascript.ru/play/tutorial/browser/events/slider-simple/index.html
	 * @param {Objet} Event
	 * @return {Objet} Event
	 * @private
	 */
	function _fixEvent(e) {
		
	  e = e || window.event;
	
	  if (!e.target) e.target = e.srcElement;
	
	  if(typeof(e.touches) != 'undefined' && e.touches.length == 1) {
		 
		  delete e.pageX;
		  delete e.pageY;
		  
		  e.pageX = e.touches[ 0 ].pageX;
		  e.pageY = e.touches[ 0 ].pageY;
	
	  }
	  else {
		  if (e.pageX == null && e.clientX != null ) { // если нет pageX..
			var html = document.documentElement;
			var body = document.body;
		
			e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0);
			e.pageX -= html.clientLeft || 0;
		
			e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0);
			e.pageY -= html.clientTop || 0;
		  }
		  
		   if (!e.which && e.button) {
			e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
		  }
	  } 
	
	  return e;
	  
	}
	
	
	
	/**
	 * Used in drag'n'drop/touch features
	 * @param {Object} DOMElement
	 * @return {Objet} Element position
	 * @private
	 */
	function _getCoords( elem ) {
		
		var box = elem.getBoundingClientRect();
	
		var body	= document.body;
		var docElem	= document.documentElement;
	
		var scrollTop	= window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft	= window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
	
		var clientTop	= docElem.clientTop || body.clientTop || 0;
		var clientLeft	= docElem.clientLeft || body.clientLeft || 0;
	
		var top		= box.top +  scrollTop - clientTop;
		var left	= box.left + scrollLeft - clientLeft;
	
		return { top: Math.round(top), left: Math.round(left) };
		
	}
	
	
	
	function _intersect( e1, e2 ) {
		
		//First rectangle
		var e1_x1 = e1.x;
		var e1_y1 = e1.y;
		
		var e1_x2 = e1.x + e1.width;
		var e1_y2 = e1.y + e1.height;
		
		
		//Second rectangle
		var e2_x1 = e2.x;
		var e2_y1 = e2.y;
		
		var e2_x2 = e2.x + e2.width;
		var e2_y2 = e2.y + e2.height;
		
		
		return !(e2_x1 > e1_x2 || e2_x2 < e1_x1 || e2_y1 > e1_y2 || e2_y2 < e1_y1);
		
	}
	
	
	function _isArray( o ) {
		
		return Object.prototype.toString.call( o ) === '[object Array]' ? true : false;
		
	}
	
	
	function _arrayMove(array, old_index, new_index) {
		
		if (new_index >= array.length) {
			var k = new_index - array.length;
			while ((k--) + 1) {
				array.push(undefined);
			}
		}
		return array.splice(new_index, 0, array.splice(old_index, 1)[0]);
		
	};
		
}( jQuery ));