var Player_chapter = Player_subtype.extend({

	initialize_sections: function() {
 		this._super();

  		// chapter-specific stuff here

	},

	initialize2: function() {
  		this._super();

  		// chapter-specific stuff here
		
		var $h2 = $('h2');
		var h2_txt = $h2.text();
		
		if (match = h2_txt.match(/(Review)/)) {
			$h2.remove();
		}
		if (match = h2_txt.match(/(Prologue): (From Cosmic History to Human History)/)) {
			$h2.text(match[1]);
			$h2.after('<p class="sub_t">' + match[2] + '</p>');
		}
	
		var tbl_title = $('.tbl_title');
		var tbl_title_txt = tbl_title.text();
		
		if (match = tbl_title_txt.match(/(The History of the Universe as a Cosmic Calendar)(2)/)) {
			
			tbl_title.html(match[1] + '<span tabindex="0" data-type="termref" data-term="fn_strayersources3ehs-ch102-section-1_2">2</span>');
		}
	
	}

});

player = new Player_chapter();