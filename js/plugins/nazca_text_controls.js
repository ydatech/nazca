/**
 * Nazca Editor v0.1.0
 * Nazca Text Element controls
 * JS Graphic Editor
 * @author Mikhail Baranovsky <mihrootk@gmail.com>
 * Copyright (c) 2014-2015 Mikhail Baranovsky
 */
 
 
var nzc_font_sizes	= [12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 48, 56, 64, 72, 80, 88, 96, 104, 120, 144];
var nzc_font_colors	= ['#000000', '#ffffff', '#1e84ab', '#f1c40f', '#009900', '#cc0000'];

  
(function( $ ) {
	
	var version = "0.1.0";
	
	var methods	= {};
	
	
	// Plugin definition.
	$.fn.nzc_text_controls = function( method ) {
		
		if(typeof(method) === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
            $.error('Method ' + method + ' does not exists.');
        }
		
	};	


	methods.init = function ( element_id ) {
		
		
		return this.each(function () {
			
			if(!element_id)
				return false;
				
			var $_controls = $(this);
			
			if($_controls.hasClass('nazca-text-controls')) {
				return false;
			}
			
			$_controls.addClass( 'nazca-text-controls' );
			$_controls.attr( 'data-element-id', element_id );
						
			
			
			var _html;
			_html	= '<ul class="nav nav-nzc-controls">'
						+'<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-font"></i> Font <span class="caret"></span></a>'
							+'<ul class="nzc-t-font-dropdown dropdown-menu" role="menu">';
				
				for(var i in nzc_fonts) {
					
					_html += '<li><a class="nzc-control" data-type="font" data-value="' + i + '">' + nzc_fonts[i][0] + '</a></li>';
					
				}
							
								
			_html			+='</ul></li>'
						+'<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-text-height"></i> <span class="caret"></span></a>'
							+'<ul class="nzc-t-fsize-dropdown dropdown-menu" role="menu">';
				
				for(var i in nzc_font_sizes) {
					
					_html += '<li><a class="nzc-control" data-type="font_size" data-value="' + nzc_font_sizes[i] + '">' + nzc_font_sizes[i] + 'px</a></li>';
					
				}
				
			_html			+='</ul></li>'
						+'<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-adjust"></i> Color <span class="caret"></span></a>'
							+'<ul class="nzc-t-color-dropdown dropdown-menu" role="menu">';
				
				for(var i in nzc_font_colors) {
					
					_html += '<li><a class="nzc-control" data-type="color" data-value="' + nzc_font_colors[i] + '"><i style="display:block; width:25px; height:25px; background-color:' + nzc_font_colors[i] + '; border-radius:50%; box-shadow: inset 2px 2px 1px rgba(0,0,0,.15),inset -1px -1px 0 rgba(255,255,255,.25);"></i></a></li>';
					
				}
			
			_html			+='</ul></li>'
						+'<li><a class="nzc-control" data-type="delete"><i class="fa fa-trash"></i></a></li>'
						+'<li><a class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-caret-down"></i></a>'
						+'<ul class="dropdown-menu" role="menu">'
							+'<li><a class="nzc-control" data-type="align" data-value="left"><i class="fa fa-align-left"> Left</i></a></li>'
							+'<li><a class="nzc-control" data-type="align" data-value="center"><i class="fa fa-align-center"></i> Center</a></li>'
							+'<li><a class="nzc-control" data-type="align" data-value="right"><i class="fa fa-align-right"></i> Right</a></li>'
							+'<li class="divider"></li>'
							+'<li><a class="nzc-control" data-type="move" data-value="forward">Move forward</a></li>'
							+'<li><a class="nzc-control" data-type="move" data-value="back">Move back</a></li>'
						+'</ul></li>'		
					+'</ul>';
			
			$_controls.html(_html);
			
			
			
			
			_attachEventHandlers( $_controls );
			
		});
		
	}
	
	
	methods.remove = function ( userOpts ) {
		
		return this.each(function () {
			
			var $_controls = $(this);
			if(!$_controls.hasClass('nazca-text-controls')) {
				return false;
			}
			
			$_controls.removeClass( 'nazca-text-controls' );
			$_controls.removeAttr( 'data-element-id' );
			
			$_controls.empty();
			
			//No need to detach event handlers:
			//"To avoid memory leaks, jQuery removes other constructs such as data and event handlers from the child elements before removing the elements themselves." - http://api.jquery.com/empty/
			
		});
		
	}
	
	
	
	function _attachEventHandlers( $_controls ) {
		
		var workspace_element_id	= $_controls.attr( 'data-element-id' );
		var $_space					= $_controls.parents('.nazca-workspace');
				
		
		$_controls.find('.nzc-control').click(function(e) {
			
			var $e = $(this);
			
			var _type	= $e.attr('data-type');
			var _value	= $e.attr('data-value');
			
			switch(_type) {
				
				case 'font':
					
					var arrayOffset = parseInt(_value);
					nzc_loadFontStylesheet( arrayOffset );
					$_space.nazca('setElementAttr', workspace_element_id, { fontFamily: nzc_fonts[arrayOffset][0] } ).nazca('redrawElement', workspace_element_id);
					
				break;
				
				case 'font_size':
					
					$_space.nazca('setElementAttr', workspace_element_id, { fontSize: _value } ).nazca('redrawElement', workspace_element_id);
					
				break;
				
				case 'color':
					
					$_space.nazca('setElementAttr', workspace_element_id, { color: _value } ).nazca('redrawElement', workspace_element_id);
					
				break;
				
				
				case 'align':
					
					var ta;
					switch( _value ) {
						
						case 'left':
							ta = nzc_textAlign.LEFT;
						break;
						
						case 'center':
							ta = nzc_textAlign.CENTER;
						break;
						
						case 'right':
							ta = nzc_textAlign.RIGHT;
						break;
						
						default:
						break;
						
					}
					
					$_space.nazca('setElementAttr', workspace_element_id, { textAlign: ta } ).nazca('redrawElement', workspace_element_id);
					
				break;
				
				
				case 'delete':
				
					$_space.nazca('removeElement', workspace_element_id );
					
				break;
				
				
				case 'move':
				
					switch( _value ) {
						
						case 'forward':
							$_space.nazca('moveElement', workspace_element_id, 'forward' );
						break;
						
						case 'back':
							$_space.nazca('moveElement', workspace_element_id, 'back' );
						break;
						
						default:
						break;
						
					}
					
				break;
				
				
				default:
				break;
				
			}
			
		});
		

		
	}
	
}( jQuery ));