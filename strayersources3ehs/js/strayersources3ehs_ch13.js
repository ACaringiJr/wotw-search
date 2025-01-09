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
		
		if (match = tbl_title_txt.match(/(Ethnic Composition of Colonial Societies in Latin America \(1825\))(18)/)) {
			
			tbl_title.html(match[1] + '<span tabindex="0" data-type="termref" data-term="fn_strayersources3ehs-ch13-sec2-005_18">18</span>');
		}
	
	}

});

player = new Player_chapter();
