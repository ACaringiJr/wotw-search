var Player_chapter = Player_subtype.extend({

	initialize_sections: function() {
 		this._super();

  		// chapter-specific stuff here

	},

	initialize2: function() {
  		this._super();

  		// chapter-specific stuff here
		
	
		var tbl_title = $('.tbl_title');
		var tbl_title_txt = tbl_title.text();
		
		if (match = tbl_title_txt.match(/(World Population during the Age of Agricultural Civilization)(1)/)) {
			
			tbl_title.html(match[1] + '<span tabindex="0" data-type="termref" data-term="fn_strayersources3ehs-pt02-sec2-002_1">1</span>');
		}
	
	}

});

player = new Player_chapter();