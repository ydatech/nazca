/**
 * Nazca Editor v0.1.0
 * JS Graphic Editor
 * @author Mikhail Baranovsky <mihrootk@gmail.com>
 * Copyright (c) 2014-2015 Mikhail Baranovsky
 */
 
 
var nzc_textAlign = {
					LEFT:	1,
					CENTER:	2,
					RIGHT:	3
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


//Nazca Workspace
(function( $ ) {
	
	var version = "0.1.0";
	
	var methods	= {};
	
	
	var workspace = {
		
		FACEBOOK:	{ width: 446, height: 374, ratio: 1.19518716577540 },
		
		//WIDE:		1.77777777777777 //16:9
		
	};
	
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
		UP: 38
	};
	
	var elementType = {
		IMAGE: 1,
		TEXT: 2
	};
	
	
	
	var _opts = {
		workspace: workspace.FACEBOOK
	};
	
	
	
	var touch = false;
	//Is touch events supported?
	if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		touch = true;
	} 
		
	console.log('Touch Events: ' + (touch ? 'supported' : 'not supported'));

	
	
	var _last_space_id	= 0;
	var _nazca_spaces	= {};
	
	
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
		
		return this.each(function() {		
			
			var $_nazca = $(this);
			
			if($_nazca.hasClass('nazca-workspace')) {
				return false;
			}
			
			
			$_nazca.addClass('nazca-workspace');
			
			
			var _width	= $_nazca.width();
			var _height	= $_nazca.height();
			
			var _ratio = _width / _height;
			if( _opts.workspace.ratio < _ratio) {
				_width	= _height * _opts.workspace.ratio;
			} else {
				_height	= _width * _opts.workspace.ratio;
			}
			
			$_nazca.css({width:_width, height:_height});
			
			
			
		
			var $_nazca_elements		= $('<div class="nazca-elements"></div>').appendTo($_nazca);
			var $_nazca_resize_wrap		= $('<div class="nazca-resize-wrap" style="display:none;"><div class="nazca-resize-draggable"></div><a class="nazca-resize-control top-left"></a><a class="nazca-resize-control left"></a><a class="nazca-resize-control top-right"></a><a class="nazca-resize-control bottom-left"></a><a class="nazca-resize-control right"></a><a class="nazca-resize-control bottom-right"></a></div>').appendTo($_nazca);
			var $_nazca_editor_controls	= $('<div class="nazca-editor-controls" style="display:none;"></div>').appendTo($_nazca);
			
			
			
			
			var _space_id = ++_last_space_id;
			_nazca_spaces[_space_id] = {
				
				$nazca: $_nazca,
				
				$nazca_elements:		$_nazca_elements,
				$nazca_resize_wrap:		$_nazca_resize_wrap,
				$nazca_editor_controls:	$_nazca_editor_controls,
				
				opts: opts,
				
				elements: [],
				active_element_id: 0,
				element_last_id: 0,
				
				scale_delta: _width / _opts.workspace.width
				
			};
			
			var _space = _nazca_spaces[_space_id];
			
			$_nazca.attr('data-nazca-id', _space_id);
			
			
			
			
			$(document).bind('mousedown dragstart touchstart', 
							function(e) {
											if(!_space['active_element_id']) {
												return false;
											}
											
											var $e = $(e.target);
											if(!$e.parents('.nazca-resize-wrap').length && !$e.hasClass('nazca-resize-wrap') 
												&& !$e.parents('.element').length && !$e.hasClass('element')
												&& !$e.parents('.nazca-editor-controls').length && !$e.hasClass('nazca-editor-controls')
												) {
												
												
												$_nazca_resize_wrap.hide();
												$_nazca_editor_controls.hide();
												
												
												//TODO: detach events?
												//Get draggable jQuery Obj
												var $_resize_draggable = _space.$nazca_resize_wrap.find('.nazca-resize-draggable');
												$_resize_draggable.nzc_textarea('remove');
											
											
												_space['active_element_id'] = 0;
												
											}
										}
						);
		
			
			$(document).bind('keydown', 
				function(e) {
					if(e.which == keyCode.DELETE && _space['active_element_id']) {
						
						var element_id = _space['active_element_id'];
						_removeElement( _space_id, element_id );
						 
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
		
		return this.each(function () {
			
			var $_nazca				= $(this);
			var $_nazca_elements	= $_nazca.find('.nazca-elements');
			
			if($_nazca_elements) {
				_clear($_nazca_elements);
			}
			
			delete _nazca_spaces[parseInt($_nazca.attr('data-nazca-id'))];
			
		});
		
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
		
		if( Object.prototype.toString.call( elements ) !== '[object Array]' ) {
			elements = [elements];
		}

		for(i in elements) {
			
			$element = _drawElement(_space_id, elements[i]);
			
			//Attach controls
			if( $element ) {
				_attach_handlers(_space_id, $element);
			}
			
		}
		
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
		var i, _e, _w, _h, _t, _l, _style;
		
		
		
		if(typeof element != 'object') {
			
			element = _getElementData( _space_id, element );
			
			if(!element) {
				return false;
			}
			
		}
		
		
		var $element = null;
			
			_e	= element;
			
			if(!_e['id']) {
				_e['id'] = ++_space.element_last_id;
				_space.elements.push(_e);
			} else {
				$element = _space.$nazca_elements.find('.element[data-id="' + _e['id'] + '"]');
			}

			//Scale
			_w	= Math.round(_e['width'] * scale_delta);
			_h	= Math.round(_e['height'] * scale_delta);
			_l	= Math.round(_e['x'] * scale_delta);
			_t	= Math.round(_e['y'] * scale_delta);
				
			switch( _e['type'] ) {	
						
				case elementType.IMAGE:
				
					_style = 'top:' + _t + 'px;left:' + _l + 'px;z-index:' + _e['id'] + ';width:' + _w + 'px;height:' + _h + 'px;';
					
					if($element) {
						$element.attr('style', _style);
					} else {
						$element = $('<div class="element image" data-id="' + _e['id'] + '" style="' + _style + '"><img src="' + _e['src'] + '" width="100%" height="100%" /></div>').appendTo(_space.$nazca_elements);
					}
					
				break;
				
				case elementType.TEXT:
					
					var align = _e['textAlign'] == 3 ? 'right' : ( _e['textAlign'] == 2 ? 'center' : 'left');
					
					_style = 'top:' + _t + 'px;left:' + _l + 'px;z-index:' + _e['id'] + ';width:' + _w + 'px;height:auto;font-family:' + _e['fontFamily'] +';font-size:' + _e['fontSize'] + 'px;line-height:' + Math.round( _e['fontSize'] * 1.2 ) + 'px;color:' + _e['color'] + ';text-align:' + align + ';';
					
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
					$.extend( _space.elements[i], key);
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
	function _clear( $_nazca_elements ) {
		
		$_nazca_elements.empty();
		
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
					
		var border_width = Math.round( parseFloat( _space.$nazca_resize_wrap.css('border-left-width') ) );
		var editor_controls_height = _space.$nazca_editor_controls.height() + 10;
  
		_attach_drag_events_handlers($element, { 
										container: parent_container,
										onDragStart: function() {
											
											_space.active_element_id = $element.attr('data-id');
																							
											//Fit resize controls wrap to element size
											//and set valid position
											_space.$nazca_resize_wrap.css({
												width:	$element.width() + border_width * 2,
												height:	$element.height() + border_width * 2,
												top:	parseFloat($element.css('top')) - border_width,
												left:	parseFloat($element.css('left')) - border_width,
												zIndex: parseInt($element.css('zIndex'))
											});
											
											
											//Show editor controls
											_space.$nazca_editor_controls.show();
											_space.$nazca_editor_controls.css({
												left:	parseFloat($element.css('left')) - border_width,
												top:	parseFloat($element.css('top')) - border_width - editor_controls_height
											});
											//detach old control plugin
											_space.$nazca_editor_controls.nzc_image_controls('remove');
											_space.$nazca_editor_controls.nzc_text_controls('remove');
											//attach necessary control plugin
											if($element.hasClass('image')) {
												_space.$nazca_editor_controls.nzc_image_controls('init', _space.active_element_id );
											} else {
												_space.$nazca_editor_controls.nzc_text_controls('init', _space.active_element_id );
											}
											
											
											
											//Show resize controls
											_space.$nazca_resize_wrap.show();
											
											
											
											//Get draggable jQuery Obj
											var $_resize_draggable = _space.$nazca_resize_wrap.find('.nazca-resize-draggable');
											
											//Attach textarea if needed
											$_resize_draggable.nzc_textarea('remove');
											if($element.hasClass('text')) {
												$_resize_draggable.nzc_textarea('init', _space.active_element_id );
											}
											
											//Resize controls are above element.. So we need to attach drag-bindings to controls-wrap
											//But first of all, detach old bindings from resize controls.. 
											_detach_drag_events_handlers( $_resize_draggable );
											_attach_drag_events_handlers( $_resize_draggable, { 
												draggable: _space.$nazca_resize_wrap.get(0),
												container: parent_container,
												onDrag: function( data ) {
													
													$element.css({
														'left': data.position[0] + border_width,
														'top': data.position[1] + border_width
													});
													
													_setElementAttr(_space_id, _space.active_element_id, {
														'x': Math.round((data.position[0] + border_width) / _space.scale_delta),
														'y': Math.round((data.position[1] + border_width) / _space.scale_delta)
													});
													
													_space.$nazca_resize_wrap.css({
														left:	data.position[0],
														top:	data.position[1]
													});	
													
													_space.$nazca_editor_controls.css({
														left:		data.position[0],
														top:		data.position[1] - editor_controls_height,
														display:	'none'
													});
												},
												onDragEnd: function(data) {
													_space.$nazca_editor_controls.show();
												}
											});
											
											
  
											
											
											
											var _detachResizeControls = function(resize_control_pos_name) {
												
												_detach_drag_events_handlers( _space.$nazca_resize_wrap.find('.' + resize_control_pos_name));
												
											};
											
											var width, height;
											var _attachResizeControls = function(resize_control_pos_name) {
												
												_attach_drag_events_handlers( _space.$nazca_resize_wrap.find('.' + resize_control_pos_name), {
													
													draggable: $element.get(0),
													container: parent_container,
													
													onDragStart: function() {
														width	= $element.width();
														height	= $element.height();
														
														_space.$nazca_editor_controls.hide();
													},
													onDrag: function( data ) {
														
														var new_width = null, new_height = null;
														
														
														switch(resize_control_pos_name) {
															
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
																_detach_drag_events_handlers( _space.$nazca_resize_wrap.find('.' + resize_control_pos_name));
																return false;
														
														}
  
														
														if( new_width <= 0 || ( new_height <= 0 && new_height !== null ) ) {
															return false;
														}
														
														
														var resize_wrap_css = {
															width: new_width + 2 * border_width,
															height: (new_height !== null ? new_height : $element.height()) + 2 * border_width
														};
														
														
														var element_css = {
															width:	new_width,
															height:	new_height !== null ? new_height : 'auto'
														};
														
														var editor_controls_css = {};

														
														switch(resize_control_pos_name) {
															
															case 'top-left':
																resize_wrap_css['left']	= data.position[0] - border_width;
																resize_wrap_css['top']	= data.position[1] - border_width;
																
																element_css['left']		= data.position[0];
																element_css['top']		= data.position[1];
																
																editor_controls_css['left']	= element_css['left'];
																editor_controls_css['top']	= resize_wrap_css['top'] -  editor_controls_height;
																
															break;
															
															case 'top-right':
																resize_wrap_css['top']	= data.position[1] - border_width;
																
																element_css['top']		= data.position[1];
																
																editor_controls_css['top']	= resize_wrap_css['top'] - editor_controls_height;
															break;
															
															case 'bottom-left':
																resize_wrap_css['left']	= data.position[0] - border_width;
																
																element_css['left']		= data.position[0];
																
																editor_controls_css['left'] = element_css['left'];
																
															break;
															
															case 'left':
																resize_wrap_css['left']	= data.position[0] - border_width;
																
																element_css['left'] = data.position[0];
																
																editor_controls_css['left'] = element_css['left'];
															default:
															break;
														
														}
														
														_space.$nazca_resize_wrap.css(resize_wrap_css);
														$element.css(element_css);
  
														_space.$nazca_editor_controls.css(editor_controls_css);
														
														
														
														var attributes = {}; var i, v, k;
														for(var i in element_css) {
															
															k = (i == 'left' ? 'x' : (i == 'top' ? 'y' : i) );
															v = Math.round( element_css[i] / _space.scale_delta );
															
															attributes[k] = v;
														}
														_setElementAttr(_space_id, _space.active_element_id, attributes);
														
														
														
														
														$element.trigger( 'nzc_resize', [ element_css ] );
													
													},
													onDragEnd: function() {
														_space.$nazca_editor_controls.show();
													}
												});
																							
											}
																									
  
  
											_detachResizeControls('top-left');
											_detachResizeControls('top-right');
											_detachResizeControls('bottom-left');
											_detachResizeControls('bottom-right');
											_detachResizeControls('left');
											_detachResizeControls('right');
											
											_space.$nazca_resize_wrap.removeClass('nazca-wh-resizable nazca-w-resizable');
												
											if($element.hasClass('image')) {
												
												_attachResizeControls('top-left');
												_attachResizeControls('top-right');
												_attachResizeControls('bottom-left');
												_attachResizeControls('bottom-right');
												
												_space.$nazca_resize_wrap.addClass('nazca-wh-resizable');
												
											} else {
												
												_attachResizeControls('left');
												_attachResizeControls('right');
												
												_space.$nazca_resize_wrap.addClass('nazca-w-resizable');
											
											}
											
											
										},
										onDrag: function( data ) {
											
											$element.css({
												'left': data.position[0],
												'top': data.position[1]
											});
											
											_setElementAttr(_space_id, _space.active_element_id, {
														'x': Math.round(data.position[0] / _space.scale_delta),
														'y': Math.round(data.position[1] / _space.scale_delta)
													});
											
											_space.$nazca_resize_wrap.css({
												left:	data.position[0] - border_width,
												top:	data.position[1] - border_width
											});
											
											
											_space.$nazca_editor_controls.css({
												left:	data.position[0] - border_width	,
												top:	data.position[1] - border_width - editor_controls_height,
												display: 'none'
											});
											
										},
										onDragEnd: function( data ) {
											_space.$nazca_editor_controls.show();
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
	
		
}( jQuery ));