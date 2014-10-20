/**
 * Nazca Editor v0.1.0
 * Nazca Image Element controls
 * JS Graphic Editor
 * @author Mikhail Baranovsky <mihrootk@gmail.com>
 * Copyright (c) 2014-2015 Mikhail Baranovsky
 */
 
(function( $ ) {
	
	var version = "0.1.0";
	
	var methods	= {};
	
	
	// Plugin definition.
	$.fn.nzc_image_controls = function( method ) {
		
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
			
			if($_controls.hasClass('nazca-image-controls')) {
				return false;
			}
			
			$_controls.addClass( 'nazca-image-controls' );
			$_controls.attr( 'data-element-id', element_id );
						
			
			
			var _html;
			_html	= '<ul class="nav nav-nzc-controls">'
						+'<li><a class="nzc-i-delete"><i class="fa fa-trash"></i></a></li>'
					+'</ul>';
			
			$_controls.html(_html);
			
			
			
			
			_attachEventHandlers( $_controls );
			
		});
		
	}
	
	
	methods.remove = function ( userOpts ) {
		
		return this.each(function () {
			
			var $_controls = $(this);
			if(!$_controls.hasClass('nazca-image-controls')) {
				return false;
			}
			
			$_controls.removeClass( 'nazca-image-controls' );
			$_controls.removeAttr( 'data-element-id' );
			
			$_controls.empty();
			
			//No need to detach event handlers:
			//"To avoid memory leaks, jQuery removes other constructs such as data and event handlers from the child elements before removing the elements themselves." - http://api.jquery.com/empty/
			
		});
		
	}
	
	
	
	function _attachEventHandlers( $_controls ) {
		
		var workspace_element_id = $_controls.attr( 'data-element-id' );
		
		$_controls.find('.nzc-i-delete').click(function(e) {
			$_controls.parents('.nazca-workspace').nazca('removeElement', workspace_element_id );
		});

	}
	
}( jQuery ));