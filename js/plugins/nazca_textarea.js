/**
 * Nazca Editor v0.1.0
 * Nazca Textarea. Used for text editing
 * JS Graphic Editor
 * @author Mikhail Baranovsky <mihrootk@gmail.com>
 * Copyright (c) 2014-2015 Mikhail Baranovsky
 */
 
(function( $ ) {
	
	var version = "0.1.0";
	
	var methods	= {};
	
	
	// Plugin definition.
	$.fn.nzc_textarea = function( method ) {
		
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
			
			if(!element_id) {
				return false;
			}
				
			
			var $_draggable = $(this);
			if($_draggable.hasClass('nazca-textarea-wrap')) {
				return false;
			}
			
			$_draggable
						.addClass( 'nazca-textarea-wrap' )
						.attr( 'data-element-id', element_id )
						.css('cursor', 'default');
			
			
			var $_textarea = $('<textarea id="nzc_t' + Math.round((Math.random() * (999999 - 0) + 0)) + '"></textarea>').appendTo($_draggable);

			
			_cloneAndMakeResizable( $_textarea, element_id );
			_attachEventHandlers( $_textarea, element_id );
			
		});
		
	}
	
	
	
	
	methods.remove = function ( ) {
		
		return this.each(function () {
			
			var $_draggable = $(this);
			if(!$_draggable.hasClass('nazca-textarea-wrap')) {
				return false;
			}
			
			
			_remove( $_draggable );
		});
		
	}
	
	
	
	
	function _remove( $_draggable, $_textarea ) {
		
		var $_space		= $_draggable.parents('.nazca-workspace');
			
		var element_id	= $_draggable.attr( 'data-element-id' );
		var $_element	= $_space.find('.element[data-id="' + element_id + '"]');
		
		
		if(typeof($_textarea) == 'undefined') {
			//Get Textarea jQuery object
			$_textarea	= $_draggable.children('textarea');
		}
		
		
		//Remove textarea shadow object
		$('.nzc_shadow[data-id="' + $_textarea.attr('id') + '"]').remove();
		
		
		
		//Back draggable to normal
		$_draggable
					.removeAttr( 'data-element-id' )
					.removeClass( 'nazca-textarea-wrap' )
					.css('cursor', 'move');
		//and remove appended textarea
		$_textarea.remove();	
		
		
		$(window).unbind('resize.nzc_textarea');
		
		if($_element.length) {
			
			$_element.unbind('nzc_remove.nzc_textarea');
			$_element.unbind('nzc_resize.nzc_textarea');
			$_element.unbind('nzc_draw.nzc_textarea');
			
			$_element.css('visibility', 'visible');
		}
		
		
		
		//No need to detach event handlers:
		//"To avoid memory leaks, jQuery removes other constructs such as data and event handlers from the child elements before removing the elements themselves." - http://api.jquery.com/empty/
			
			
	}
	
	
	function _cloneAndMakeResizable( $_textarea, element_id ) {
		
		var $_space		= $_textarea.parents('.nazca-workspace');
		var $_element	= $_space.find('.element[data-id="' + element_id + '"]');
		
		if(!$_element.length) {
			return false;
		}
		
		var _element = $_space.nazca('getElementData', element_id);

		var _styles	= {
						color:		$_element.css('color'),
						fontFamily:	$_element.css('fontFamily'),
						fontSize:	$_element.css('fontSize'),
						lineHeight:	$_element.css('lineHeight'),
						textAlign:	$_element.css('textAlign')
					};
		
		//Display textarea like element
		$_textarea
					.val( _element['desc'] )
					.css( _styles );
		//
		$_element.css('visibility', 'hidden');		
		
		

		
		/**
		 * Auto-growing textareas; technique ripped from Facebook
		 *
		 * http://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
		*/
		var $_shadow = $('.nzc_shadow[data-id="' + $_textarea.attr('id') + '"]');
		if(!$_shadow.length) {
			$_shadow = $('<div class="nzc_shadow"></div>').appendTo(document.body);
			//add data-id to shadow, so we can remove shadow element later
			$_shadow.attr('data-id', $_textarea.attr('id'));
		}
		
		$_shadow.css({
					position:    'absolute',
					top:         -10000,
					left:        -10000,
					width:       $_element.width(),
					fontSize:    _styles['fontSize'],
					fontFamily:  _styles['fontFamily'],
					lineHeight:  _styles['lineHeight'],
					resize:      'none',
					'word-wrap': 'break-word'
				})
		
			
		return true;
		
	}
	
	
	
	function _attachEventHandlers( $_textarea, element_id ) {
		
		var $_space		= $_textarea.parents('.nazca-workspace');
		var $_element	= $_space.find('.element[data-id="' + element_id + '"]');
		
		
		var $_nazca_resize_wrap		= $_textarea.parents('.nazca-resize-wrap');
		
		
		var $_shadow	= $('.nzc_shadow[data-id="' + $_textarea.attr('id') + '"]');
		
		
		var _update		= function(event) {
					
			var val = nzc_escapeHtml($_textarea.val());
	
			// Did enter get pressed?  Resize in this keydown event so that the flicker doesn't occur.
			if(event && event.data && event.data.event === 'keydown' && event.keyCode === 13) {
				val += '<br/>&nbsp;';
			}
	
			$_shadow.css('width', $_textarea.width());
			$_shadow.html(val); // Append '...' to resize pre-emptively.

			var new_height = $_shadow.height();
			if(new_height <= 0) {
				new_height = parseInt($_textarea.css('lineHeight'));
			}
			
			
			$_textarea.height( new_height );
			$_nazca_resize_wrap.height( new_height );
			
		}

		$_textarea
					.keydown({event:'keydown'}, _update)
					.bind('change keyup', function(event) {
						_update(event);
						$_textarea.parents('.nazca-workspace').nazca('setElementAttr', element_id, { desc: $_textarea.val() } );
						$_element.html( nzc_escapeHtml($_textarea.val()) );
					});		
		
		$(window).bind('resize.nzc_textarea', _update);
		
		$_element.bind('nzc_resize.nzc_textarea',function(event, data) {
			_update();
		});
		
		
		_update(null);
		
		
		//If element was updated from outside, update styles, etc.
		$_element.bind( 'nzc_draw.nzc_textarea', function() {
			_cloneAndMakeResizable( $_textarea, element_id );
			_update(null);
		}).bind( 'nzc_remove.nzc_textarea', function() {
			_remove($_textarea.parent(), $_textarea );
		});

	}
	
}( jQuery ));