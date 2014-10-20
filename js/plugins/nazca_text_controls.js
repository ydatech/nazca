/**
 * Nazca Editor v0.1.0
 * Nazca Text Element controls
 * JS Graphic Editor
 * @author Mikhail Baranovsky <mihrootk@gmail.com>
 * Copyright (c) 2014-2015 Mikhail Baranovsky
 */
 
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
						+'<li class="dropdown"><a class="nzc-t-font" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-font"></i> Font <span class="caret"></span></a>'
							+'<ul class="nzc-t-font-dropdown dropdown-menu" role="menu">'
								+'<li><a data-font="Arial">Arial</a></li>'
								+'<li><a data-font="Comic Sans MS">Comic Sans MS</a></li>'
								+'<li><a data-font="Georgia">Georgia</a></li>'
								+'<li><a data-font="Monotype Corsiva">Monotype Corsiva</a></li>'
								+'<li><a data-font="Times New Roman">Times New Roman</a></li>'
							+ '</ul></li>'
						+'<li><a class="nzc-t-align" data-value="left"><i class="fa fa-align-left"></i></a></li>'
						+'<li><a class="nzc-t-align" data-value="center"><i class="fa fa-align-center"></i></a></li>'
						+'<li><a class="nzc-t-align" data-value="right"><i class="fa fa-align-right"></i></a></li>'
						+'<li class="dropdown"><a class="nzc-t-color" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-adjust"></i> Color <span class="caret"></span></a>'
							+'<ul class="nzc-t-color-dropdown dropdown-menu" role="menu">'
								+'<li><a data-color="#000000">Black</a></li>'
								+'<li><a data-color="#1e84ab">Blue</a></li>'
								+'<li><a data-color="#f1c40f">Orange</a></li>'
								+'<li><a data-color="#ffffff">White</a></li>'
							+ '</ul></li>'
						+'<li><a class="nzc-t-delete"><i class="fa fa-trash"></i></a></li>'
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
		
		var workspace_element_id = $_controls.attr( 'data-element-id' );
		
		$_controls.find('.nzc-t-delete').click(function(e) {
			$_controls.parents('.nazca-workspace').nazca('removeElement', workspace_element_id );
		});
		
		$_controls.find('.nzc-t-align').click(function(e) {
			
			var ta;
			switch($(this).attr('data-value')) {
				
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
			
			$_controls.parents('.nazca-workspace').nazca('setElementAttr', workspace_element_id, { textAlign: ta } ).nazca('redrawElement', workspace_element_id);
			
		});
		
		$_controls.find('.nzc-t-font-dropdown>li>a').click(function(e) {
			
			$_controls.parents('.nazca-workspace').nazca('setElementAttr', workspace_element_id, { fontFamily: $(this).attr('data-font') } ).nazca('redrawElement', workspace_element_id);
			
		});
		
		$_controls.find('.nzc-t-color-dropdown>li>a').click(function(e) {
			
			$_controls.parents('.nazca-workspace').nazca('setElementAttr', workspace_element_id, { color: $(this).attr('data-color') } ).nazca('redrawElement', workspace_element_id);
			
		});
	
	}
	
}( jQuery ));