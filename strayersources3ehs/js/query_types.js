

// ===========================================================================
function ______Query() {}
var Query = Class.extend({
	// ========================================
	// define and set defaults for variables
	hasSubmitButton: true,
	hasGiveUpButton: false,
	query_source: "",
	query_index: -1,		// index for the query; will be supplied on initialization
	query_number: "",		// query number to be used for display purposes
	query_data: "",			// "query data" received back from ARGA
	query_text: "",
	query_text_for_ARGA: "",	// does not necessarily need to be set
	points_possible: 1,		// default 1 point per query
	grade: -1,				// percentage; -1 means not answered
	original_grade: -1,		// the "original grade" can be overridden; make sure we keep it
	md: null,				// metadata -- has to be initialized in init
	imagemap_initialized: false,
	
	line_separator: new RegExp("\\n|\\~\\~"),
	
	
	// ========================================
	// initialization
	init: function(source, index, jq){
		this.query_source = source;
		this.query_index = index;
		this.jq = jq;
		this.md = {};
		
		this.parseSource();
	},
	
	// this must be implemented by query types; note that init does not	
	parseSource: function() {
		// do whatever needs to be done with query_source
		
	},

    im_init: function(jq) {
    	// jq coming in should refer to the *question*
    	// only run this if the question has imchoices in it
    	
    	// get choices out of imchoice tags
    	var choices = [];
    	jq.find("[data-type=imchoice]").each(function(index, element) {
    		var html = $(element).html();
    		var c;
    		eval("c=" + html);
    		c.id = choices.length;
    		choices.push(c);
    	});
    	
    	if (choices.length == 0) {
    		return;
    	}
		
		// get the figure div; assume the figure we're dealing with here is the last one in the question
        var wrap = jq.find('[data-type=figure]').last();
        
        // wrap the figure's image in the "pic_container" div
        // (also make sure the image doesn't get the pointer cursor)
        var img = wrap.find("img").first().css("cursor", "default");

        // make sure enclosing boxes are wide enough to fit the image
        var w = img.width();
        wrap.parents("[data-type=box]").width(w + 20);

        // pic_container (or figure) needs to be the same size as the image
		var picContainer = $("<span>")
			.addClass("pic_container")
			.append(img);
		wrap.prepend(picContainer);
        
		// set up map

        // Need to append timestamp to map's name attribute
        // WebKit has problems if the same name is reused.
        var timestamp = new Date().getTime() + "_" + this.query_index;
        
        img.attr("usemap", '#question-map-'+timestamp);

        // Most browsers use the name attr for the useMap reference
        // but IE 7 & below needs to have the ID set the same
        var currMap = $('<map>')
                        .attr('name', 'question-map-'+timestamp)
                        .attr('id', 'question-map-'+timestamp)
                        .insertAfter(img);
		
        wrap.find('canvas').remove();
        currMap.find('area').remove();

        for (var j = 0; j < choices.length; j++) {
            var shapes = eval(choices[j].code);
            var config = {
                id: 'choice-' + this.query_index + "_" + choices[j].id,
                choice_id: choices[j].id,
                shapes: shapes,
                color: choices[j].color,
                opacity: 0.5,
                tq: this		// have to pass in a reference to this question
            };
            AdvMap.addArea(currMap, config, this);
        }
        
        // img.click(function() {return false;}).css("cursor", "default");
    },

	// extract metadata from a line
	extractMetadata: function(l) {
		if (l.search(/^\_(\w+):\s*(.*)/) > -1) {
			var name = RegExp.$1;
			var value = RegExp.$2;
			name = name.toLowerCase();
			value = $.trim(value);
			
			if (value != "") {
				// store the name/value pair in the item's metadata array
				this.md[name] = value;
			}
		}
	},
		
	finish_inline_query: function(correct_answer, mode) {
		// if mode is "delivery" (default) or this.md.no_correct_answer is true, 
		// don't show this at all
		if (mode == 'delivery' || mode == '' || mode == null || this.md.no_correct_answer == "true") {
			return "";
		}

		var s = "";
		
		// image that indicates if the query is correct or incorrect
		if (mode == 'review' || mode == 'review_correct_incorrect') {
			var fbclass, alt;
			if (this.isCorrect()) {
				fbclass = 'query_correct_feedback_span';
				alt = 'Correct';
				
			} else {
				fbclass = 'query_incorrect_feedback_span';
				alt = 'Incorrect';
			}
			
			s += "<span class='" + fbclass + "' alt='" + alt + "'>&nbsp;</span>";
			//s += "<img class='query_correct_incorrect_icon' src='" + UI_Elements.relative_file_url(img_src) + "' alt='" + alt + "'>";
		}

		// correct answer -- we show this in both review and preview mode, 
		// but not in review_correct_incorrect mode
		// also don't show it if there *is* no correct answer
		if (mode != 'review_correct_incorrect' && this.md.no_correct_answer != "true") {
			s += '<span class="query_correct_answer_span">' + correct_answer + '</span>';
		}
		
		s += "</span>";
		
		return s;
	},

	
	// ========================================
	// setters
	
	setQueryNumber: function(qn) {
		this.query_number = qn;
	},
	
	setQueryTextForARGA: function(qt) {
		this.query_text_for_ARGA = qt
	},

	setQueryData: function(qd) {
		this.query_data = qd;
	},
	
	setGrade: function(g) {
		this.grade = g;
		this.original_grade = this.grade;
	},
	
	overrideGrade: function(g) {
		this.grade = g;
	},
	
	setPointsPossible: function(pp) {
		this.points_possible = pp;
	},
	
	// this should be implemented for each query type
	restoreAnswerFromARGA: function(answer) {
	},
	
	// =========================================
	// getters
	
	getQueryNumber: function() {
		return this.query_number;
	},
	
	getQueryTextForARGA: function() {
		if (this.query_text_for_ARGA != null && this.query_text_for_ARGA != "") {
			return this.query_text_for_ARGA;
		} else if (this.query_text != null && this.query_text != "") {
			return this.query_text;
		} else {
			return "see page for question context";
		}
	},
	
	getPointsPossible: function() {
		return this.points_possible * 1;
	},
	
	// return true if points awarded for this query are "provisional" -- i.e. subject to review by instructor
	// by default this will be false
	pointsAreProvisional: function() {
		return false;
	},
	
	getPointsAwarded: function() {
		if (this.grade != null && this.grade >= 0) {
			return this.grade / 100 * this.points_possible;
		} else {
			return 0;
		}
	},
	
	// return whether the student's original answer was correct (even if the grade was overridden)
	isCorrect: function() {
		return (this.original_grade == 100);
	},

	getQueryNumberForARGA: function() {
		if (this.query_number == null || this.query_number == "") {
			return "" + this.query_index;
		} else {
			return this.query_number;
		}
	},
	
	// this should be implemented for each query type
	getQueryTypeForARGA: function() {
		return 'query type';
	},

	// this should return -1 if it's not answered, or the grade if we have one
	getGradeForARGA: function() {
		return this.grade;
	},
	
	getOriginalGrade: function() {
		return this.original_grade;
	},
	
	// this should be implemented by query types
	getCorrectAnswerForARGA: function() {
		return "correct answer";
	},
	
	// this should be implemented by query types
	getUserAnswerForARGA: function() {
		return "user answer";
	},

	// this must be implemented by query types
	// mode should be "delivery", "review", or "review_correct_incorrect"; "delivery" is assumed
	getHTML: function(mode) {
		return "query html; mode: " + mode;
	},

	// standard way to get the query text for a query
	// this often won't be used.
	query_text_html: function() {
		if (this.query_text != "" && this.md._hide_query_text != "true") {
			// replace newlines with <br />
			var qt = jQuery.trim(this.query_text).replace(/\n/g, "<br>")

			return "<p class='query_text'>" + qt + "</p>"
		} else {
			return "";
		}
	},
	
	// if grade is > -1, the user has answered
	userHasAnswered: function() {
		return (this.grade > -1);
	},
	
	// allow for a function that allows the user to give up
	give_up: function() {
		// but by default we return "false", which means the user *can't* give up...
		return false;
	},
	
	// this must be implemented by query types. 
	// It must set this.grade to something >= 0 (if it's a graded query type)
	// and must return true if the answer is OK to be submitted, false otherwise
	evaluateAnswer: function() {
		// what to do here is completely query-specific
		return true;
	}
	
});


// ===========================================================================
function ______FB_Query() {}
var FB_Query = Query.extend({
	// ========================================
	// define and set defaults for variables specific to this question type
	user_answer: "",
	
	// fn to be used for comparing answers
	answer_transform: function(s) {
		s = "" + s;
		
		// lower case
		s = s.toLowerCase();
		
		// remove leading and trailing spaces
		s = jQuery.trim(s);
		
		// remove dashes and spaces not at the start of the string
		s = s.replace(/(.+)[\s-]/g, "$1");
		
		// return s
		return s;
	},
	
	// ========================================
	// initialization
	parseSource: function() {
		// lines might start with "FB:"; if so, strip it out
		var s = this.query_source.replace(/^FB:\s*/, "");

		// if line ends with "~~\d+", that's points
		if (s.search(/(.*)~~([\.\d]+)$/) > -1) {
			s = RegExp.$1;
			this.points_possible = RegExp.$2;
		}

		// split and go through the lines
		var lines = s.split(this.line_separator);

		this.query_text = "";
		
		for (var i = 0; i < lines.length; ++i) {
			// get line and trim
			var l = jQuery.trim(lines[i]);
			
			// points_possible
			if (l.search(/^_points:\s*(\d+)/i) > -1) {
				this.points_possible = RegExp.$1;
			
			// answer
			} else if (l.search(/^\*\s*(.*)/i) > -1) {
				var ans = RegExp.$1;
				
				// if answer starts with "!!", it's case sensitive
				if (ans.substr(0, 2) == "!!") {
					this.md.case_sensitive = "true";
					
					// strip the !! out of answer
					ans = ans.substr(2);
				}
				
				// if answer ends with "??", any answer is correct
				// (there should still be a "sample" answer specified)
				if (ans.substr(-2, 2) == "??") {
					this.md.no_correct_answer = "true";
					
					// strip the ?? out of answer
					ans = ans.replace(/\?\?$/, "");
				}
				
				// if answer ends with "##\d+", that's the blank size
				if (ans.search(/\#\#(\d+)$/) > -1) {
					this.md.blank_size = RegExp.$1;
					ans = ans.replace(/\#\#\d+$/, "");
				}
				
				// take out anything in parens and replace common entities
				ans = ans.replace(/\s*\(.*?\)/g, "");
				ans = ans.replace(/ *\&ndash; */g, "-");
				ans = ans.replace(/ *\&nbsp; */g, " ");
				
				// split multiple answers, which can be specified with "_"'s
				// first deal with escaped _'s
				ans = ans.replace(/\\_/g, "&#95;");
				this.answers = ans.split(/_/);
				
				// clean up answers
				for (var j = 0; j < this.answers.length; ++j) {
					// Replace &#95;s with literal "_"s in correct answers so they match user input
					this.answers[j] = jQuery.trim(this.answers[j].replace(/\&#95;/g, "_"));
				}
				
				// the "official" correct answer is the first answer
				this.correct_answer = this.answers[0];
				
				// see if the answer is numeric or string
				if (isNaN(this.correct_answer * 1)) {
					this.answerType = "string";

				} else {
					this.answerType = "numeric";
				}
				
				// If the immediately-following line contains *only* a number,
				// its points_possible
				if (lines[i+1] != null && lines[i+1].search(/^\d+$/) > -1) {
					this.points_possible = lines[i+1]*1;
					i += 1;
				}
				
			// metadata -- starts with "_[a-zA-Z]"
			} else if (l.search(/^\_[a-zA-Z]/) > -1) {
				this.extractMetadata(l);

			// by default add it to the query text
			} else {
				this.query_text += l + "\n";
			}
		}
		
		// now we should be done with the query text. Strip spaces
		this.query_text = jQuery.trim(this.query_text);
	},

	// ========================================
	// extend query functions
	
	setQueryData: function(qd) {
		this._super(qd);
		
		// for fb questions, if we get question_data, that's the user's answer
		this.user_answer = qd;
	},

	restoreAnswerFromARGA: function(answer) {
		// for fb questions, the user's answer is stored directly
		this.user_answer = answer;
	},

	getQueryTypeForARGA: function() {
		return 'fill-in-the-blank';
	},

	getCorrectAnswerForARGA: function() {
		return this.correct_answer;
	},

	getUserAnswerForARGA: function() {
		if (this.user_answer == null || this.user_answer == "") {
			return "Not answered";
		} else {
			return this.user_answer;
		}
	},

	// mode should be "delivery" or "review" or "review_correct_incorrect"; "delivery" is assumed
	getHTML: function(mode) {
		var html = "";

		// start with the query text, if there is any
		html += this.query_text_html();

		// determine how big the response blank should be, unless one was specified
		var blank_size = this.md.blank_size;
		if (blank_size == "" || blank_size == null || isNaN(blank_size * 1)) {
			var s = "" + this.correct_answer;
			blank_size = (s.length + 2);
		}

		// if student hasn't answered or we're in preview mode, use an empty string for the input value
		var val, disabled;
		var fb_string = "";
		if (!this.userHasAnswered() || mode == 'preview') {
			val = "";
			disabled = "";

		// otherwise we have an answer, so fill it in
		} else {
			// make sure we convert double quotes to &#34; for placement in 'value="xxx"' attributes
			val = this.user_answer.replace(/\"/g, "&#34;");
			
			// also disable the input in this case, if we're not in review_correct_incorrect mode
			// or if the user got it right
			if (mode != "review_correct_incorrect" || this.isCorrect()) {
				disabled = "disabled";
			}
		}
		
		html += '<span style="white-space:nowrap">'
			+ '<input type="text" class="query_fb_input" id="query_answer_' + this.query_index + '" size="' + blank_size + '" value="' + val + '" ' + disabled + ' />'
			;
		html += this.finish_inline_query(this.correct_answer, mode);
		
		html += '</span>';

		return html;
	},
	
	evaluateAnswer: function() {
		this.user_answer = jQuery.trim($("#query_answer_" + this.query_index).val());
		
		var is_correct = false;
		
		// if there's no one correct answer, any answer is correct!
		if (this.md.no_correct_answer == "true" || this.answers == null) {
			is_correct = true;

		// MT: 2013-08-22 fix as perPpepper's suggestion for DF-26
		// NEXT ELSE IF IS NEW CODE
		// assume that an empty string is never correct
		} else if (this.user_answer === "") {
			is_correct = false;
		} else {
			for (var i = 0; i < this.answers.length; ++i) {
				var ca_comp = this.answers[i];
				var sa_comp = this.user_answer;
				
				// if this is *not* case sensitive...
				if (this.md.case_sensitive != "true") {
					// convert to lower case
					ca_comp = ca_comp.toLowerCase();
					sa_comp = sa_comp.toLowerCase();
	
					// if ca_comp is a number and case_sensitive is false...
					if (!isNaN(ca_comp * 1)) {
						// MOVE THIS TO ANOTHER FUNCTION SO WE CAN USE IT ELSEWHERE
						
						// see how many decimal places ca_comp has
						var dec = ca_comp.replace(/.*\.(.*)/, "$1");
						var factor = Math.pow(10, dec.length);
						
						// convert ca_comp to a number
						ca_comp = ca_comp * 1;
						
						// convert sa_comp to a number and round to the given number of places
						sa_comp = Math.round(factor * sa_comp) / factor;
					}
				}
				
				// now evaluate against this answer
				if (sa_comp == ca_comp) {
					is_correct = true;
					break;
				}
			}
		}

		// set grade accordingly
		if (is_correct) {
			this.setGrade(100);
		} else {
			this.setGrade(0);
		}
		
		return true;
	}
});


// ===========================================================================
function ______DD_Query() {}
var DD_Query = Query.extend({
	// ========================================
	// define and set defaults for variables specific to this query type
	choices: new Array(),
	choice_order: new Array(),
	correct_answer_index: null,
	user_answer_index: null,
	
	// ========================================
	// initialization
	parseSource: function() {
		// initialize vars
		this.choices = new Array();
		this.correct_answer_index = null;
		this.user_answer_index = null;
		
		// DD's are always one line only -- if query_text is specified, it's via metadata (see below)
		this.query_text = "";
		
		// the line might start with "DD:"; if so, strip it out
		var s = jQuery.trim(this.query_source.replace(/^DD:\s*/, ""));
		
		// if line ends with "~~\d+", that's points
		if (s.search(/(.*)~~([\.\d]+)$/) > -1) {
			s = RegExp.$1;
			this.points_possible = RegExp.$2;
		}

		// if the line starts with "!!", don't scramble
		if (s.substr(0, 2) == "!!") {
			this.md.never_scramble = "true";
			
			// strip the !! out of answer
			s = s.replace(/^\!\!/, "");
		}

		// if the line ends with "??", any answer is correct
		if (s.substr(-2, 2) == "??") {
			this.md.no_correct_answer = "true";
			
			// strip the ?? out of answer
			s = s.replace(/\?\?$/, "");
		}

		// if any commas were sent in as "\,", turn them into &#44;
		s = s.replace(/\\,/g, "&#44;");

		// likewise, turn "\*" into &#42;
		s = s.replace(/\\\*/g, "&#42;");

		// we might have &#34;'s indicating double quotes in the answers;
		// convert these to actual double quotes so that they display properly (though it might not matter)
		s = s.replace(/\&#34;/g, '"');
		
		// answer string should be something like "choice 1, choice2, *correct choice"
		// so split it and find the correct answer
		var answers = s.split(/,\s*/);
		var correctChoice = -1;
		for (var i = 0; i < answers.length; ++i) {
			var ans = answers[i];

			// look for points...
			if (ans.search(/^_points:\s*(\d+)/i) > -1) {
				this.points_possible = RegExp.$1;

				// skip to the next answer
				continue;
			
			// or query text
			} else if (ans.search(/^_query_text:\s*(.*)/i) > -1) {
				this.query_text = RegExp.$1;

				// skip to the next answer
				continue;
			

			// or metadata -- starts with "_[a-zA-Z]"
			} else if (ans.search(/^\_[a-zA-Z]/) > -1) {
				this.extractMetadata(ans);

				// skip to the next answer
				continue;
				
			// if we've found the correct answer...
			} else if (ans.substr(0,1) == "*") {
				// if we already got a correctChoice, there's an error
				if (this.correct_answer_index != null) {
					return "<b>error in pulldown answer (too many correct answers): " + s + "</b>";
				}
				
				// otherwise this one is correct
				this.correct_answer_index = i;
				
				// strip the leading *
				ans = ans.substr(1);
			}
			
			// convert &#42;s to literal *'s now; also convert commas
			ans = ans.replace(/\&#42;/g, '*');
			ans = ans.replace(/\&#44;/g, ',');
			
			// transfer to choices, trimming in the process
			this.choices.push(jQuery.trim(ans));
		}
		
		// note: answers will be coded 0, 1, 2, 3, etc., with correctChoice numbered accordingly
		// (e.g. if first answer is correct, correctChoice is 0)
		
		// if we didn't get a correct choice, or if there aren't enough items,
		// that's an error
		if (this.correct_answer_index == null) {
			return "<b>error in pull down answer (no correct answer specified): " + s + "</b>";
		} else if (this.choices.length <= 1) {
			return "<b>error in pulldown answer (0 or 1 choices specified): " + s + "</b>";
		}

		// shuffle choices, unless md.never_scramble is true
		this.choice_order = new Array();
		for (var j = 0; j < this.choices.length; ++j) this.choice_order[j] = j;
		if (this.md.never_scramble != "true") {
			this.choice_order.shuffle();
		}
				
		// deal with error handling...
	},

	// ========================================
	// extend query functions
	
	setQueryData: function(qd) {
		this._super(qd);
		
		// for DD queries, if we get query_data, that's the user's answer index
		if (qd != "" && qd != null && !isNaN(qd * 1)) {
			this.user_answer_index = qd * 1;
		}
	},

	restoreAnswerFromARGA: function(answer) {
		// find the choice that the user gave
		for (var i = 0; i < this.choices.length; ++i) {
			if (this.choices[i] == answer) {
				this.user_answer_index = i;
				return;
			}
		}
	},

	getQueryTypeForARGA: function() {
		return 'drop-down';
	},

	getCorrectAnswerForARGA: function() {
		return this.choices[this.correct_answer_index];
	},

	getUserAnswerForARGA: function() {
		if (this.user_answer_index == null || this.choices[this.user_answer_index] == null) {
			return 'Not answered';
		} else {
			return this.choices[this.user_answer_index];
		}
	},

	// mode should be "delivery" or "review" or "review_correct_incorrect"; "delivery" is assumed
	getHTML: function(mode) {
		var html = "";

		// DD's never have query text
		// Start a nobr tag for the item
		html = '<span class="query_dd_select_span">';
		
		// if we're in preview mode or 
		// (a student answer has been given and we're not in review_correct_incorrect mode), 
		// or the student got it correct
		// disable the select
		var disabled = "";
		if (mode == 'preview' || (mode != 'review_correct_incorrect' && this.user_answer_index != null) || this.isCorrect()) {
			disabled = "disabled";
		}
	
		html += '<select class="query_dd_select" id="query_answer_' + this.query_index + '" ' + disabled + '>'
			+ '<option value="-1">--------</option>'
		
		for (var j = 0; j < this.choices.length; ++j) {
			var index = this.choice_order[j];
			var selected = "";
			// select the student answer, unless we're in preview mode
			if (this.user_answer_index == index && mode != 'preview') {
				selected = "selected"
			}
			html += '<option value="' + index + '" ' + selected + '>' + this.choices[index] + '</option>';
		}
		html += '</select>'
		html += this.finish_inline_query(this.choices[this.correct_answer_index], mode);

		// Close off the nobr tag for the item
		html += '</span>';

		return html;
	},
	
	evaluateAnswer: function() {
		// get the user's selected answer, which will be 0-based
		this.user_answer_index = $('#query_answer_' + this.query_index).val() * 1;
		
		// set grade accordingly (if this.md.no_correct_answer is true, any answer is correct)
		if (this.user_answer_index == this.correct_answer_index || this.md.no_correct_answer == "true") {
			this.setGrade(100);
		} else {
			this.setGrade(0);
		}

		return true;
	}
});



// ===========================================================================
function ______CB_Query() {}
var CB_Query = Query.extend({
	// ========================================
	// define and set defaults for variables specific to this query type
	choices: new Array(),
	choice_order: new Array(),
	correct_answer_index: null,
	user_answer_index: null,
	
	// ========================================
	// initialization
	parseSource: function() {
		// initialize vars
		this.choices = new Array();
		this.correct_answer_index = null;
		this.user_answer_index = null;
		
		// CB's are always one line only -- if query_text is specified, it's via metadata (see below)
		this.query_text = "";
		
		// the line might start with "CB:"; if so, strip it out
		var s = jQuery.trim(this.query_source.replace(/^CB:\s*/, ""));
		
		// if line ends with "~~\d+", that's points
		if (s.search(/(.*)~~([\.\d]+)$/) > -1) {
			s = RegExp.$1;
			this.points_possible = RegExp.$2;
		}

		// if the line ends with "??", any answer is correct
		if (s.substr(-2, 2) == "??") {
			this.md.no_correct_answer = "true";
			
			// strip the ?? out of answer
			s = s.replace(/\?\?$/, "");
		}

		// if any commas were sent in as "\,", turn them into &#44;
		s = s.replace(/\\,/g, "&#44;");

		// likewise, turn "\*" into &#42;
		s = s.replace(/\\\*/g, "&#42;");

		// we might have &#34;'s indicating double quotes in the answers;
		// convert these to actual double quotes so that they display properly (though it might not matter)
		s = s.replace(/\&#34;/g, '"');

		// answer string should be something like "choice 1, *correct choice"
		// so split it and find the correct answer
		var answers = s.split(/,\s*/);
		var correctChoice = -1;
		for (var i = 0; i < answers.length; ++i) {
			var ans = answers[i];

			// look for points...
			if (ans.search(/^_points:\s*(\d+)/i) > -1) {
				this.points_possible = RegExp.$1;

				// skip to the next answer
				continue;
			
			// or query text
			} else if (ans.search(/^_query_text:\s*(.*)/i) > -1) {
				this.query_text = RegExp.$1;

				// skip to the next answer
				continue;
			

			// or metadata -- starts with "_[a-zA-Z]"
			} else if (ans.search(/^\_[a-zA-Z]/) > -1) {
				this.extractMetadata(ans);

				// skip to the next answer
				continue;
				
			// if we've found the correct answer...
			} else if (ans.substr(0,1) == "*") {
				// if we already got a correctChoice, there's an error
				if (this.correct_answer_index != null) {
					return "<b>error in checkbox answer (too many correct answers): " + s + "</b>";
				}
				
				// otherwise this one is correct
				this.correct_answer_index = i;
				
				// strip the leading *
				ans = ans.substr(1);
			}
			
			// convert &#42;s to literal *'s now; also convert commas
			ans = ans.replace(/\&#42;/g, '*');
			ans = ans.replace(/\&#44;/g, ',');
			
			// transfer to choices, trimming in the process
			this.choices.push(jQuery.trim(ans));
		}
		
		// note: answers will be coded as 0 and 1, with correctChoice numbered accordingly
		// (e.g. if first answer is correct, correctChoice is 0)

		// if we didn't get a correct choice, or if there aren't exactly 2 items,
		// that's an error
		if (this.correct_answer_index == null) {
			return "<b>error in checkbox answer (no correct answer specified): " + s + "</b>";
		} else if (this.choices.length != 2) {
			return "<b>error in checkbox answer (more or less than 2 choices specified): " + s + "</b>";
		}
	},

	// ========================================
	// extend query functions
	
	setQueryData: function(qd) {
		this._super(qd);
		
		// for CB queries, if we get query_data, that's the user's answer index
		if (qd != "" && qd != null && !isNaN(qd * 1)) {
			this.user_answer_index = qd * 1;
		}
	},

	restoreAnswerFromARGA: function(answer) {
		// find the choice that the user gave
		for (var i = 0; i < this.choices.length; ++i) {
			if (this.choices[i] == answer) {
				this.user_answer_index = i;
				return;
			}
		}
	},

	getQueryTypeForARGA: function() {
		return 'checkbox';
	},

	getCorrectAnswerForARGA: function() {
		return this.choices[this.correct_answer_index];
	},

	getUserAnswerForARGA: function() {
		if (this.user_answer_index == null || this.choices[this.user_answer_index] == null) {
			return 'Not answered';
		} else {
			return this.choices[this.user_answer_index];
		}
	},

	// mode should be "delivery" or "review" or "review_correct_incorrect"; "delivery" is assumed
	getHTML: function(mode) {
		var html = "";

		// CB's never have query text
		
		// if we're in preview mode or 
		// (a student answer has been given and we're not in review_correct_incorrect mode), 
		// or the student got it correct
		// disable the checkbox
		var disabled = "";
		if (mode == 'preview' || (mode != 'review_correct_incorrect' && this.user_answer_index != null) || this.isCorrect()) {
			disabled = "disabled";
		}
		
		// if user has answered with choice 0, it should be checked, unless we're in preview mode
		var checked = "";
		if (this.user_answer_index === 0 && mode != 'preview') {
			checked = "checked"
		}
	
		html += '<input type="checkbox" class="query_cb" id="query_answer_' + this.query_index + '" ' + disabled + ' ' + checked + '>';
		
		html += this.finish_inline_query(this.choices[this.correct_answer_index], mode);
		
		return html;
	},
	
	evaluateAnswer: function() {
		// find out if the user checked the box
		var checkbox_was_checked = ($('#query_answer_' + this.query_index).attr('checked') == true);
		
		if (checkbox_was_checked) {
			this.user_answer_index = 0;
		} else {
			this.user_answer_index = 1;
		}

		// set grade accordingly (if this.md.no_correct_answer is true, any answer is correct)
		if (this.user_answer_index == this.correct_answer_index || this.md.no_correct_answer == "true") {
			this.setGrade(100);
		} else {
			this.setGrade(0);
		}
		
		return true;
	}
});


// ===========================================================================
function ______MC_Query() {}
var MC_Query = Query.extend({
	// ========================================
	// define and set defaults for variables specific to this query type
	choices: new Array(),
	choice_ids: new Array(),
	correct_answer_index: null,
	user_answer_index: null,
	
	// ========================================
	// initialization
	parseSource: function() {
		// initialize vars
		this.choices = new Array();
		this.choices_fb = new Array();
		this.choice_ids = new Array();
		this.correct_answer_index = null;
		this.user_answer_index = null;
		
		// lines might start with "MC:"; if so, strip it out
		var s = this.query_source.replace(/^MC:\s*/, "");

		// split and go through the lines
		var lines = s.split(this.line_separator);
		
		this.query_text = "";
		
		// the first choice has to be "a" or "A"
		var choice_re = /^[\*]?([aA])[\.:\)]/;
		
		for (var i = 0; i < lines.length; ++i) {
			// get line and trim whitespace
			var l = $.trim(lines[i]);
			
			// choice
			if (l.search(choice_re) > -1) {
				var ident = RegExp.$1;
				var choice = l.replace(/^[\*]?\w[\.:\)]\s*/, "");
				ident = ident.toUpperCase();
				
				// extract feedback for the choice, if there
				var choice_text = choice.replace(/\s*\[\[(.*?)\]\]\s*$/, "");
				var choice_fb = null;
				if (choice != choice_text) {
					choice_fb = RegExp.$1;
					
					// if feedback is simply "correct" or "incorrect", ignore it.
					if (choice_fb.toLowerCase() == 'correct' || choice_fb.toLowerCase() == 'incorrect') {
						choice_fb = null;
					}
				}

				this.choices.push(choice_text);
				this.choices_fb.push(choice_fb);
				this.choice_ids.push(ident);
				
				// if line started with *, it's the correct answer
				if (l.search(/^[\*]/) > -1) {
					correct_choice = ident;
					this.correct_answer_index = this.choice_ids.length - 1;
				}
				
				// update choice_re so that any letter is OK from here on
				choice_re = /^[\*]?(\w)[\.:\)]/;

			// points_possible
			} else if (l.search(/^_points:\s*(\d+)/i) > -1) {
				this.points_possible = RegExp.$1;
			
			// metadata -- starts with "_[a-zA-Z]"
			} else if (l.search(/^\_[a-zA-Z]/) > -1) {
				this.extractMetadata(l);

			// by default add it to the query text
			} else {
				this.query_text += l + "\n";
			}
		}
		
		// if the query starts with \d\.\s*, strip it out
		// *no, this version doesn't work; it also strips out "1." from "5TB-1.png"*//
		// this.query_text = this.query_text.replace(/(\n?)\d+\.\s*/, "\1");

		// now we should be done with the query text. Strip trailing white space
		this.query_text = this.query_text.replace(/\s*$/, "");

		// shuffle choices, unless md.never_scramble is true
		this.choice_order = new Array();
		for (var j = 0; j < this.choices.length; ++j) this.choice_order[j] = j;
		if (this.md.never_scramble != "true") {
			this.choice_order.shuffle();
		}
		
		// if no correct answer was given, we need to explicitly note that.
		if (this.correct_answer_index == null) {
			this.md.no_correct_answer = "true";
		}
		
		// replace any remaining \n's with <br><br>
		// NO: we're doing this in getHTML instead now
		// this.query_text = this.query_text.replace(/\n/g, "<br><br>");
	},
	
	// function that returns a string to show based on whether the user got it correct
	correct_incorrect_feedback: function(mode, is_correct) {
		var html = "";

		// get correct answer as presented to user
		for (var i = 0; i < this.choices.length; ++i) {
			if (this.choice_order[i] == this.correct_answer_index) {
				break;
			}
		}
		
		// if the question explicitly defines feedback for the user's answer, use it as the feedback
		if (this.user_answer_index != null && this.choices_fb[this.user_answer_index] != null) {
			html += this.choices_fb[this.user_answer_index];
		} 
		
		// the correct answer will be highlighted in green, so there's no reason to say anything more.
		
		// now, if we got any feedback, enclose it in a div
		if (html != "") {
			html = "<div class='query_mc_feedback_correct_incorrect'>" + html + "</div>";
		}

		return html;
	},

	// ========================================
	// extend query functions
	
	setQueryData: function(qd) {
		this._super(qd);
		
		// for MC queries, if we get query_data, that's the user's answer index
		if (qd != "" && qd != null && !isNaN(qd * 1)) {
			this.user_answer_index = qd * 1;
		}
	},

	restoreAnswerFromARGA: function(answer) {
		// the choice letter should be the first character of answer (see getUserAnswerForARGA below)
		var choice_id = answer.substr(0,1);
		
		// find the choice that the user gave
		for (var i = 0; i < this.choice_ids.length; ++i) {
			if (this.choice_ids[i] == choice_id) {
				this.user_answer_index = i;
				return;
			}
		}
	},

	getQueryTypeForARGA: function() {
		return 'multiple choice';
	},

	getCorrectAnswerForARGA: function() {
		if (this.md.no_correct_answer == "true") {
			return "no correct answer";
		} else {
			return this.choice_ids[this.correct_answer_index] + ". " + this.choices[this.correct_answer_index];
		}
	},

	getUserAnswerForARGA: function() {
		if (this.user_answer_index == null || this.choices[this.user_answer_index] == null) {
			return 'Not answered';
		} else {
			return this.choice_ids[this.user_answer_index] + ". " + this.choices[this.user_answer_index];
		}
	},

	// mode should be "delivery" or "review"; "delivery" is assumed
	getHTML: function(mode) {
		// initialize imagemap elements
		if (this.imagemap_initialized === false) {
			var question_jq = this.jq.parent();
			this.im_init(question_jq);
			this.imagemap_initialized = true;
		}

		// start with the query text, if there
		var html = this.query_text_html();
		
		// wrap answers in a p tag
		html += "<p>";
		
		// Build answer selection
		var is_correct = false;
		for (var z = 0; z < this.choices.length; z++) {
			var index = this.choice_order[z];
			// if this is review mode... 
			var checked = "";
			var disabled = "";
			var radio_style = "query_mc_other_choice";
			if (mode == 'review' || mode == 'review_correct_incorrect' || mode == 'preview') {
				// if it's the correct choice, it should be marked in green
				if (index == this.correct_answer_index) {
					// but only if we're *not* in review_correct_incorrect mode or this is the user's choice
					if (mode != 'review_correct_incorrect' || index == this.user_answer_index) {
						radio_style = "query_mc_correct_choice";
					}
					
					// if this is what the user chose, he got it correct
					if (index == this.user_answer_index) {
						is_correct = true;
					}

				// else if it's the user's choice (and this.md.no_correct_answer is not true), it should be marked in red
				} else if (index == this.user_answer_index && this.md.no_correct_answer != "true") {
					radio_style = "query_mc_incorrect_user_choice";
				}
				
				// and the input should be disabled, unless we're in review_correct_incorrect mode
				if (mode != "review_correct_incorrect") {
					disabled = "disabled";
				}
			}

			// if this is the choice the user clicked, it's checked (regardless of mode)
			if (index == this.user_answer_index) {
				checked = "checked";
			}
			
			// Create radio button input plus label
			html += "<table class='query_mc_choice_table' border='0' cellpadding='0' cellspacing='0'><tr>"
				+ "<td><div class='" + radio_style + "'>"
				+ "<input class='query_mc_choice_radio' type='radio' name='query_answer_" + this.query_index + "' "
				+ " id='query_answer_" + this.query_index + "_" + index + "' "
				+ " value='" + index + "' "
				+ checked + " "
				+ disabled + " "
				+ " /></div></td>"
				+ "<td>" + this.choice_ids[z] + ".</td>"
				+ "<td><label id='query_answer_label_" + this.query_index + "_" + index + "' "
				+ " for='query_answer_" + this.query_index + "_" + index + "'>"
				+ this.choices[index]
				+ "</label></td>"
				+ "</tr></table>";
		}

		// get a possible feedback string; this fn will take account of mode
		html += this.correct_incorrect_feedback(mode, is_correct);

		html += "</p>";
		
		return html;
	},
	
	evaluateAnswer: function() {
		// get the user's selected answer, which will be 0-based
		this.user_answer_index = $('input:radio[name=query_answer_' + this.query_index + ']:checked').val() * 1;
		
		// set grade accordingly (if this.md.no_correct_answer is true, any answer is correct)
		if (this.user_answer_index == this.correct_answer_index || this.md.no_correct_answer == "true") {
			this.setGrade(100);
		} else {
			this.setGrade(0);
		}
		
		return true;
	}
});


// ===========================================================================
function ______Essay_Query() {}
var Essay_Query = Query.extend({
	// ========================================
	// define and set defaults for variables specific to this query type
	user_answer: "",
	user_answer_is_submittable: false,
	answer_was_just_entered: false,
	
	// ========================================
	// initialization
	parseSource: function() {
		// set points_are_provisional metadata default; it can be overridden by
		// an explicit metadata line (_points_are_provisional: false)
		this.md.points_are_provisional = "true";
		
		// lines might start with "EQ:" or "ES:"; if so, strip it out
		var s = this.query_source.replace(/^EQ:\s*/, "");
		s = s.replace(/^ES:\s*/, "");

		// split and go through the lines
		var lines = s.split(this.line_separator);
		
		this.query_text = "";
		
		for (var i = 0; i < lines.length; ++i) {
			// get line and trim
			var l = jQuery.trim(lines[i]);
			
			// points_possible
			if (l.search(/^_points:\s*(\d+)/i) > -1) {
				this.points_possible = RegExp.$1;

			// metadata -- starts with "_[a-zA-Z]"
			} else if (l.search(/^\_[a-zA-Z]/) > -1) {
				this.extractMetadata(l);

			// by default add it to the query text
			} else {
				this.query_text += l + "\n";
			}
		}
		
		// now we should be done with the query text. Strip spaces
		this.query_text = jQuery.trim(this.query_text);
		
		// replace any remaining \n's with <br>
		this.query_text = this.query_text.replace(/\n/g, "<br>");
	},

	// ========================================
	// extend query functions
	
	setQueryData: function(qd) {
		this._super(qd);
		
		// for essay queries, if we get query_data, that's the user's answer
		this.user_answer = qd;
	},

	restoreAnswerFromARGA: function(answer) {
		this.user_answer = answer;
	},

	getQueryTypeForARGA: function() {
		return 'essay';
	},

	getCorrectAnswerForARGA: function() {
		return "Answers will vary";
	},

	getUserAnswerForARGA: function() {
		if (this.user_answer == null || this.user_answer == "") {
			return "Not answered";
		} else {
			return this.user_answer;
		}
	},
	
	// unless overridden by custom js or metadata,
	// all points awarded for essay questions are provisional
	pointsAreProvisional: function() {
		return (this.md.points_are_provisional == "true");
	},

	// mode should be "delivery" or "review" or "review_correct_incorrect"; "delivery" is assumed
	getHTML: function(mode) {
		// start with the query text, if there
		var html = this.query_text_html();

		var val, disabled;
		if (!this.userHasAnswered() || mode == 'preview') {
			val = "";
			disabled = "";

		// otherwise we have an answer, so fill it in
		} else {
			// make sure we convert double quotes to &#34; for placement in 'value="xxx"' attributes
			val = this.user_answer;
			
			// convert breaks to newlines
			val = val.replace(/<br *(\/)?>/g, "\n");
			
			// also disable the input if we're not in review_correct_incorrect mode
			if (mode != "review_correct_incorrect") {
				disabled = "disabled";
			}
		}

		html += "<textarea id='query_answer_" + this.query_index + "' class='query_essay_ta' " + disabled + ">"
			+ val + "</textarea>";

		// if answer was just entered and grade is 100, also show the "provisional" message
		// (unless for this question it isn't provisional)
		if (this.answer_was_just_entered && this.grade == 100 && this.md.points_are_provisional == "true") {
			html += "<div class='essay_question_evaulation_feedback'>Your answer has been provisionally accepted. You'll get full credit for now, but your instructor may update your grade later after evaluating it.</div>";
		}

		return html;
	},
	
	userHasAnswered: function() {
		return (this.user_answer != "" && this.user_answer != null);
	},

	unique_word_count: function(s) {
		if (s == null) {
			return 0;
		}
		s = "" + s;
		if (s == "") {
			return 0;
		}
		
		// split s into words
		var arr = s.split(/\W+/);
		
		// sort them
		arr = arr.sort();
		
		// then count unique words
		var last = null;
		var count = 0;
		for (var i = 0; i < arr.length; ++i) {
			if (arr[i] != last && arr[i] != "") {	
				++count;
				last = arr[i];
			}
		}
		
		return count;
	},
	
	set_evaluation_feedback: function(html) {
		// set message below the textarea
		html = "<div class='essay_question_evaulation_feedback' id='essay_question_evaulation_feedback_" + this.query_index + "'>" + html + "</div>";
		$("#essay_question_evaulation_feedback_" + this.query_index).remove();
		$("#query_answer_" + this.query_index).after(html);
	},
	
	focus_user_input: function() {
		setTimeout('$("#query_answer_' + this.query_index + '").select();', 50);
	},
	
	evaluateAnswer: function(question_index) {
		// if user_answer_is_submittable is true, we're already ready to proceed
		if (this.user_answer_is_submittable == true) {
			return true;
		}
		
		// otherwise, get the user's answer
		var raw_answer = $.trim($("#query_answer_" + this.query_index).val());

		// replace newlines with breaks in recorded answer
		this.user_answer = raw_answer.replace(/\n/g, "<br/>");
		
		// if answer is blank and author didn't explicitly say to accept answers, make them enter something.
		if (raw_answer == "" && this.md.accept_blank_answers != "true") {
			this.set_evaluation_feedback("You must enter an answer.");
			this.focus_user_input();
			// return false, to say that we can't yet evaluate the answer.
			return false;
			
		// else check with MAVE if specified
		} else if (this.md.mave_question_id != null) {
			var t = this;
			
			MAVE.validate_answer(this.md.mave_question_id, raw_answer, {
				callback_fn:function(x) {
						t.MAVE_callback(x);
					}
				, max_similarity_score: this.md.max_similarity_score
				, min_valid_score: this.md.min_valid_score
				, max_question_text_score: this.md.max_question_text_score
				, validity_criterion: this.md.validity_criterion
				, plagiarism_criterion: this.md.plagiarism_criterion
				});
			
			// store the question_index, so we'll be able to re-call player.submit_question on callback
			this.question_index = question_index;
			
			// return false, to say that we can't yet evaluate the answer.
			return false;
		
		// otherwise evaluate here...
		} else {
			// if we have a min word count, compare to it
			if (this.md.min_word_count != null) {
				// If the answer has fewer than x unique words, it's not submittable
				var word_count = this.unique_word_count(this.user_answer);
				if (word_count < this.md.min_word_count * 1) {
					this.set_evaluation_feedback("Your answer is not long enough. Please elaborate and resubmit.");
					this.focus_user_input();
					// return false, to say that we can't yet evaluate the answer.
					return false;
				}
			}
			// If we make it to here, assume anything is OK.
			this.setGrade(100);
			this.answer_was_just_entered = true;
			this.user_answer_is_submittable = true;
			return true;
		}
	},
	
	MAVE_callback: function(answer_is_valid) {
		// if MAVE has cleared the answer to be submitted...
		if (answer_is_valid === true) {
			this.setGrade(100);
			this.answer_was_just_entered = true;
			this.user_answer_is_submittable = true;
			// re-call activity.submit_question
			player.activity.submit_question(this.question_index);
		
		// otherwise just put a feedback message saying the student needs to resubmit and throw focus
		} else {
			this.set_evaluation_feedback("Please revise your answer and resubmit.");
			this.focus_user_input();
		}
	}
});

// ===========================================================================
function ______Hidden_Query() {}
var Hidden_Query = Query.extend({
	// ========================================
	// define and set defaults for variables specific to this query type
	user_answer: "",
	question_type: "custom",
	
	// ========================================
	// initialization
	parseSource: function() {
		// lines might start with "HQ:"; if so, strip it out
		var s = this.query_source.replace(/^HQ:\s*/, "");

		// split and go through the lines
		var lines = s.split(this.line_separator);
		
		this.query_text = "";
		
		for (var i = 0; i < lines.length; ++i) {
			// get line and trim
			var l = jQuery.trim(lines[i]);
			
			// points_possible
			if (l.search(/^_points:\s*(\d+)/i) > -1) {
				this.points_possible = RegExp.$1;

			// answer
			} else if (l.search(/^\*\s*(.*)/i) > -1) {
				var ans = RegExp.$1;
				
				// if answer ends with "??", any answer is correct
				// (there should still be a "sample" answer specified)
				if (ans.substr(-2, 2) == "??") {
					this.md.no_correct_answer = "true";
					
					// strip the ?? out of answer
					ans = ans.replace(/\?\?$/, "");
				}
				
				// split multiple answers, which can be specified with "_"'s
				// first deal with escaped _'s
				ans = ans.replace(/\\_/g, "&#95;");
				this.answers = ans.split(/_/);
				
				// clean up answers
				for (var i = 0; i < this.answers.length; ++i) {
					// Replace &#95;s with literal "_"s in correct answers so they match user input
					this.answers[i] = jQuery.trim(this.answers[i].replace(/\&#95;/g, "_"));
				}
				
				// the "official" correct answer is the first answer
				this.correct_answer = this.answers[0];
				
			// metadata -- starts with "_[a-zA-Z]"
			} else if (l.search(/^\_[a-zA-Z]/) > -1) {
				this.extractMetadata(l);

			// by default add it to the query text
			} else {
				this.query_text += l + "\n";
			}
		}
		
		// now we should be done with the query text. Strip spaces
		this.query_text = jQuery.trim(this.query_text);
		
		// replace any remaining \n's with <br>
		this.query_text = this.query_text.replace(/\n/g, "<br>");
	},

	// ========================================
	// extend query functions
	
	setQueryData: function(qd) {
		this._super(qd);
		
		// for essay queries, if we get query_data, that's the user's answer
		this.user_answer = qd;
	},

	restoreAnswerFromARGA: function(answer) {
		this.user_answer = answer;
	},

	getQueryTypeForARGA: function() {
		return this.question_type;
	},

	getCorrectAnswerForARGA: function() {
		return this.correct_answer;
	},

	getUserAnswerForARGA: function() {
		if (this.user_answer == null || this.user_answer == "") {
			return "Not answered";
		} else {
			return this.user_answer;
		}
	},

	// mode should be "delivery" or "review" or "review_correct_incorrect"; "delivery" is assumed
	getHTML: function(mode) {
		// start with the query text, if there
		var html = this.query_text_html();

		var val;
		if (!this.userHasAnswered() || mode == 'preview') {
			val = "";

		// otherwise we have an answer, so fill it in
		} else {
			// replace breaks with newlines
			val = this.user_answer.replace(/<br\s*\/*>/g, "\n");
		}

		html += '<input type="hidden" class="query_fb_input" id="query_answer_' + this.query_index + '" value="' + val + '" />';
		
		return html;
	},
	
	// Hidden queries exist so that other interactive elements can fill them in,
	// so we need a setUserAnswer function for them.
	setUserAnswer: function(a) {
		this.user_answer = a;
	},
	
	userHasAnswered: function() {
		return (this.user_answer != "" && this.user_answer != null);
	},
	
	evaluateAnswer: function() {
		// get the user's answer -- NO (3/23/2012): use setUserAnswer instead
		// this.user_answer = $("#query_answer_" + this.query_index).val();
		
		var is_correct = false;
		
		// if there's no one correct answer, any answer is correct!
		if (this.md.no_correct_answer == "true") {
			is_correct = true;
		
		} else {
			for (var i = 0; i < this.answers.length; ++i) {
				if (this.answers[i] == this.user_answer) {
					is_correct = true;
					break;
				}
			}
		}

		// set grade accordingly
		if (is_correct) {
			this.setGrade(100);
		} else {
			this.setGrade(0);
		}
		
		return true;
	}
});

// ===========================================================================
// Matching question
/*
Click on an item in the left column, then click the item in the right column that matches it.

A. Antecedent::The infant is fed and is no longer hungry.
B. Behavior::Infant cries and establishes contact with its mother.
C. Consequence::An infant is hungry.
*/


function ______MA_Query() {}
var MA_Query = Query.extend({
	// ========================================
	// define and set defaults for variables specific to this query type
	pairs: null,//new Array(), //MT (2013-10-11): need to instantiate that this with parseSource function() below see DF-152 
	right_side_order: new Array(),
	correct_answer: "",
	query_complete: false,
	hasSubmitButton: false,
	
	last_clicked_side: null,
	last_clicked_index: null,
	answers_correct: 0,
	
	//choices: new Array(),
	//choice_ids: new Array(),
	//correct_answer_index: null,
	//user_answer_index: null,
	
	// ========================================
	// initialization
	parseSource: function() {
		// initialize vars
		
		// lines might start with "MA:"; if so, strip it out
		var s = this.query_source.replace(/^MA:\s*/, "");
		//MT (2013-10-11): need to re-instantiate a new Array with each new object/query.
		this.pairs = new Array();

		// split and go through the lines
		var lines = s.split(this.line_separator);
		
		this.query_text = "";
		
		var points_explicitly_specified = false;
		
		// the first choice has to be "a" or "A"
		var choice_re = /^([aA])[\.:\)]/;
		
		for (var i = 0; i < lines.length; ++i) {
			// get line and trim whitespace
			var l = $.trim(lines[i]);
			
			// pair
			if (l.search(choice_re) > -1) {
				// remove opening letter
				l = l.replace(/^\w[\.:\)]\s*/, "");
				
				// split at ::
				var pair = l.split(/\s*::\s*/);
				if (pair.length < 0) {
					pair = [l, "Bad matching pair"];
				}
				this.pairs.push(pair);
				
				if (this.correct_answer != "") this.correct_answer += "; ";
				this.correct_answer += pair[0] + " &rarr; " + pair[1];
				
				// update choice_re so that any letter is OK from here on
				choice_re = /^(\w)[\.:\)]/;

			// points_possible
			} else if (l.search(/^_points:\s*(\d+)/i) > -1) {
				this.points_possible = RegExp.$1;
				points_explicitly_specified = true;
			
			// metadata -- starts with "_[a-zA-Z]"
			} else if (l.search(/^\_[a-zA-Z]/) > -1) {
				this.extractMetadata(l);

			// by default add it to the query text
			} else {
				this.query_text += l + "\n";
			}
		}
		
		// now we should be done with the query text. Strip trailing white space
		this.query_text = this.query_text.replace(/\s*$/, "");

		// shuffle right_side_order
		this.right_side_order = new Array();
		for (var j = 0; j < this.pairs.length; ++j) this.right_side_order[j] = j;
		this.right_side_order.shuffle();
		
		// if points weren't explicitly specified, set to the number of pairs
		if (!points_explicitly_specified) {
			this.points_possible = this.pairs.length;
		}
	},

	// ========================================
	// extend query functions
	
	setQueryData: function(qd) {
		this._super(qd);
		
		// for MA queries, if we get query_data, that's whether or not the user has completed the question
		if (qd != "" && qd != null) {
			this.query_complete = ((qd + "") == "true");
		}
	},

	restoreAnswerFromARGA: function(answer) {
		if (answer == 'Completed') {
			this.query_complete = true;
		}
	},

	getQueryTypeForARGA: function() {
		return 'matching';
	},

	getCorrectAnswerForARGA: function() {
		// not sure what to do here...
		return this.correct_answer;
	},

	getUserAnswerForARGA: function() {
		if (this.query_complete == false) {
			return 'Not complete';
		} else {
			return 'Completed';
		}
	},

	// mode should be "delivery" or "review"; "delivery" is assumed
	getHTML: function(mode) {
		// start with the query text, if there
		var html = this.query_text_html();
		
		html += "<div class='query_matching_table_div' id='query_matching_div" + this.query_index + "'><table class='query_matching_table'>";

		var left_column = "";
		var right_column = "";
		

		// if we're in review mode and the student has completed the query, show the answers...
		if (mode == 'review' || mode == 'review_correct_incorrect' || mode == 'preview') {
			
			
			html += "<tr>"
				+ "<td class='query_matching_table_td_correct' colspan='2' style='border-top:0px;'>Correct Matches:</td>"
				+ "</tr>"
				+ "<tr>";
			/**
				+ "<td class='query_matching_table_td_left_bottom'>" + left_column + "</td>"
				+ "<td class='query_matching_table_td_right_bottom'>" + right_column + "</td>"
				+ "</tr>"
				;
			**/
				for (var i = 0; i < this.pairs.length; ++i) {
				    // ADD ARROWS
					html += "<tr>"
					      + "<td>"
					      + "<div class='query_matching_item correct' answer_index='" + i + "'>" + "<div class='query_matching_arrow'>➜</div>" + this.pairs[i][0] + "</div>"
					      + "</td>"
						  + "<td>"
						  + "<div class='query_matching_item correct' answer_index='" + i + "'>" + this.pairs[i][1] + "</div>"
						  + "</td>"
						  + "</tr>";
				}

		// otherwise show the clickable areas
		} else {

			for (var i = 0; i < this.pairs.length; ++i) {
				left_column += "<div class='query_matching_item' answer_index='" + i + "'>" + this.pairs[i][0] + "</div>";
				right_column += "<div class='query_matching_item' answer_index='" + this.right_side_order[i] + "'>" + this.pairs[this.right_side_order[i]][1] + "</div>";
			}
			
			html += 
				  "<tr>"
				+ "<td class='query_matching_table_td_left'>" + left_column + "</td>"
				+ "<td class='query_matching_table_td_right'>" + right_column + "</td>"
				+ "</tr><tr>"
				+ "<td class='query_matching_table_td_correct' colspan='2' style='display:none'>Correct Matches:</td>"
				+ "</tr>"
				//+ "<tr>"
				//+ "<td class='query_matching_table_td_left_bottom' style='background-color: #fcc; display:none'></td>"
				//+ "<td class='query_matching_table_td_right_bottom' style='display:none'></td>"
				//+ "</tr>"
				;
		}
		
		// close off the table and enclosing div
		html += "</table></div>";
		
		return html;
	},
	
	postInit: function() {
		var qjq = $("#query_matching_div" + this.query_index);
		var tq = this;
		
		qjq.find(".query_matching_table_td_left").each(function(index, element) {
			var jq = $(element);
			jq.find('.query_matching_item').click(function() { tq.left_clicked(this); }).addClass("active");
			// 			jq.find('.query_matching_item').click({"tq": tq}, tq.left_clicked(this); }).addClass("active");

		});
	
		qjq.find(".query_matching_table_td_right").each(function(index, element) {
			var jq = $(element);
			jq.find('.query_matching_item').click(function() { tq.right_clicked(this); });
		});

	},

	left_clicked: function(el) {
		var jq = $(el);
		var left_side = jq.parent();
		var right_side = jq.parent().parent().find(".query_matching_table_td_right");
		
		// get index of this item
		var answer_index = jq.attr("answer_index");
		
		// de-highlight all left-side items and right-side items
		left_side.find(".query_matching_item").removeClass("chosen");
		right_side.find(".query_matching_item").not(".answered").removeClass("incorrect").addClass("active");
		
		
		// highlight this item
		jq.addClass("chosen");
		
		// note that it's chosen
		this.last_clicked_side = "left";
		this.last_clicked_index = answer_index;
	},
	
	right_clicked: function(el) {

		if (this.last_clicked_side != "left") {
			Standard_Dialog.alert("Click on an item in the left column first.");
			return;
		}
		
		var jq = $(el);
		var right_side = jq.parent();
		var left_side = jq.parent().parent().find(".query_matching_table_td_left");
		
		// get index of this item
		var answer_index = jq.attr("answer_index");
		
		// get handle to the item on the left side
		var left_side_item = left_side.find("[answer_index=" + answer_index + "]");
		
		if (answer_index != this.last_clicked_index) {
			jq.addClass("incorrect");
			this.last_clicked_side = null;
			this.last_clicked_index = null;
			right_side.find(".query_matching_item").removeClass("active");
			setTimeout(function() {
				jq.removeClass("incorrect");
				if (this.last_clicked_index == null) {
					left_side.find(".query_matching_item").removeClass("chosen");
				}
			}, 1000);
		} else {
			this.last_clicked_side = "right";
			
			// right-side items aren't active anymore and shouldn't have the "incorrect" class.
			right_side.find(".query_matching_item").removeClass("active").removeClass("incorrect");
			
			// this item isn't clickable ever anymore
			jq.unbind();
			
			// kill the "chosen" class on the left side; it shouldn't be clickable either 
			left_side_item.removeClass("chosen").unbind().removeClass("active");
		
			// move the correct item down
			var table = right_side.parent().parent();
			table.find(".query_matching_table_td_correct").show();
			table.find(".query_matching_table_td_left_bottom").show();
			table.find(".query_matching_table_td_right_bottom").show();
			var left_side_bottom = table.find(".query_matching_table_td_left_bottom");
			var right_side_bottom = table.find(".query_matching_table_td_right_bottom");
			
			var new_left = left_side_item.clone().addClass("correct");
			var new_right = jq.clone().addClass("correct");
			new_left.prepend("<div class='query_matching_arrow'>➜</div>");
			//left_side_bottom.append(new_left);
			//right_side_bottom.append(new_right);

			var new_left_2 = $('<td></td>');
			new_left_2.append(new_left);

			var new_right_2 = $('<td></td>');
			new_right_2.append(new_right);

			var new_row = $("<tr></tr>").append(new_left_2).append(new_right_2);
			new_row.appendTo(table);

			//var _height = right_side_bottom.height();
			//window.alert(_height)
			//left_side_bottom.height(_height);
	
			++this.answers_correct;
	
			// add the "answered" class to both sides
			left_side_item.addClass("correct");
			jq.addClass("correct");
			var t = this;
			setTimeout(function() {
				left_side_item.removeClass("correct").addClass("answered");
				jq.removeClass("correct").addClass("answered");
				if (t.answers_correct == t.pairs.length) {
					t.question_done(table);
				}
			}, 1000);
		}
	},
	
	question_done: function(table) {
		table.find(".query_matching_table_td_correct").css("border-top","0px");
		table.find(".query_matching_table_td_left").hide();
		table.find(".query_matching_table_td_right").hide();
		
		// set query_complete to true, then call the parent question's submit function
		// which will in turn call evaluateAnswer below.
		this.query_complete = true;
		player.activity.submit_question(this.parent_question.index);
	},
	
	evaluateAnswer: function() {
		// if query_complete is still false, user hasn't finished
		if (this.query_complete == true) {
			this.setGrade(100);
			return true;
		} else {
			this.setGrade(0);
			return false;
		}
	}
});

// ===========================================================================
function ______Imagemap_Query() {}
var Imagemap_Query = Query.extend({
	// ========================================
	// define and set defaults for variables specific to this query type
	hasSubmitButton: false,
	hasGiveUpButton: true,
	user_answer: "",
	
	// ========================================
	// brought along from old imagemap player...
    answerStack: {},
    questionComplete: false,
	
	// the following should be set via metadata
	validator: "oneCorrectAnswer",		// could also be "allCorrectAnswers"
	scorer: "infiniteAttempts",
    default_feedback: "",
    highlight: true,
	
   	// need a reference to this query in some places; this gets defined in im_init
   //	tq: null,
	
    im_init: function(jq) {
    	// jq coming in should refer to the imagemap *question*
    	
    	// get some things from metadata (if the metadata overrides defaults)
    	var pq = this.parent_question;
    	if (pq.md_set("im_validator")) this.validator = pq.md.im_validator;
    	if (pq.md_set("im_scorer")) this.scorer = pq.md.im_scorer;
    	if (pq.md_set("im_default_feedback")) this.default_feedback = pq.md.im_default_feedback;
    	if (pq.md_set("im_highlight")) this.highlight = (pq.md.im_highlight == "true");
    	
    	// get choices out of imchoice tags
    	this.choices = [];
    	// need a reference to this for inside "each" function
    	var tq = this;
    	jq.find("[data-type=imchoice]").each(function(index, element) {
    		var html = $(element).html();
    		var c;
    		eval("c=" + html);
    		c.id = tq.choices.length;
    		tq.choices.push(c);
    	});

        // Setup choicesById
        this.choicesById = {};
        for(var i=0; i<this.choices.length; i++) {
            this.choicesById[this.choices[i].id] = this.choices[i];
        }

		// find correct choices
		this.correctChoices = [];
		for( var j = 0; j<this.choices.length; j++ ) {
			if ( this.choices[j].type == 'correct' ) {
				this.correctChoices.push( this.choices[j].id );
			}
		}

		// Set correct answers string, for reporting purposes
		var correctAnswers = [];
		for ( var i = 0; i < this.choices.length; i++ ) {
			if ( this.choices[i].type == "correct" ) {
				correctAnswers.push( this.choices[i].title );
			}
		}
		correctAnswers.sort();
		this.correct_answer = correctAnswers.join(', ');
		
		// set up last few data structures
        this.questionComplete = false;
        this.answerStack = [];
		
		// get the figure div
        this.wrap = jq.find('[data-type=figure]');
        
        // wrap the figure's image in the "pic_container" div
        var img = this.wrap.find("img").first();
        
        // make sure the image *doesn't* have any other events on it
        // (it probably will have had a click event added by the figure initialization procedure)
        img.unbind();

        // make sure enclosing boxes are wide enough to fit the image
        var w = img.width();
        this.wrap.parents("[data-type=box]").width(w + 20);

        // pic_container (or figure) needs to be the same size as the image
		var pc = $("<a>")
			.addClass("pic_container")
			.attr("href", "#")
			//.click(this.clickHandler)
			.append(img);
		this.wrap.prepend(pc);
        this.picContainer = pc;
        
        // initialize the status-modal window
        this.statusmodal_init();
		
		// set up map

        // Need to append timestamp to map's name attribute
        // WebKit has problems if the same name is reused.
        var timestamp = new Date().getTime() + "_" + this.query_index;
        
        img.attr("usemap", '#question-map-'+timestamp);
        img.click({"tq": this}, this.clickHandler);

        // Most browsers use the name attr for the useMap reference
        // but IE 7 & below needs to have the ID set the same
        this.currMap = $('<map>')
                        .attr('name', 'question-map-'+timestamp)
                        .attr('id', 'question-map-'+timestamp)
                        .insertAfter(this.picContainer);
		
		// finally, draw the question (draws the choices)
        this.drawQuestion();
    },
    
    drawQuestion: function() {

        var show_selected_choices = false;
        // show_selected_choices = this.showSelectedChoices.is(':checked');

        this.wrap.find('canvas').remove();
        this.currMap.find('area').remove();

        for (var j = 0; j < this.choices.length; j++) {
            var shapes = eval(this.choices[j].code);
            var config = {
                id: 'choice-' + this.query_index + "_" + this.choices[j].id,
                choice_id: this.choices[j].id,
                shapes: shapes,
                color: this.choices[j].color,
                opacity: 0,
                onClick: this.clickHandler,
                tq: this		// have to pass in a reference to this question
            };

            if ( show_selected_choices && this._inArray(this.choices[j].id, this.answerStack) ) {
                config.opacity = 0.5;
            }

            if ( this.highlight ) {
                config.hover = {
                    opacity: 0.5
                };
            }
            AdvMap.addArea(this.currMap, config, this);
        }
    },
    
    clickHandler: function(e, $area, tq) {
        e.preventDefault();
        e.stopPropagation();
        
        if (tq == null) {
        	tq = e.data.tq;
        }

        tq.choiceDescription.show();

        tq.statusmodal_flash();

        if (e.target.tagName.toLowerCase() == 'area') {
            var opts = $(e.target).data('opts');
            tq.answerStack.push( opts.choice_id );

            // if ( tq.answerStack.length > 0 ) { tq.showSelectedChoicesWrapper.show(); }

            tq.loadAnswer(opts.choice_id);
			
			/*
            if ( tq.showSelectedChoices.is(':checked') ) {
                tq.drawQuestion();
            }
            */

            // Call Question's "validator" -- which determines whether or not the user has gotten the question correct
            if (tq.questionValidators[tq.validator](tq)) {
            	// if the user's done, set questionComplete to true, then call the parent question's submit function
            	// which will in turn call evaluateAnswer below.
		        tq.questionComplete = true;
		        player.activity.submit_question(tq.parent_question.index);
            }
            
        } else {
            tq.loadAnswer();
            tq.answerStack.push( [e.pageX, e.pageY] );
        }

        if ( !tq.statusModal.is(':visible') ) { tq.statusmodal_open(tq); }
        
        // move the modal window to near the place where the user clicked
        var top = e.pageY + 50;
        var left = e.pageX + 50;
        var window_width = $(window).width();
        if (left + tq.statusModal.width() > window_width) {
        	left = window_width - tq.statusModal.width() - 50;
        }
        tq.statusmodal_move(tq, left, top);
    },
    
    loadAnswer: function( choice_id ) {
        var choice = this.choicesById[choice_id];

        // Setup default, then override below
        var type = 'incorrect';
        var typename = 'Incorrect';
        var description = this.default_feedback;

        if ( choice !== null && typeof choice != "undefined" ) {
            type = choice.type;
            typename = choice.type.substr(0,1).toUpperCase() + choice.type.substr(1,choice.type.length);
            description = choice.description;
        }
        var desc = '<div class="status_modal_header">'+typename+'</div>';
        if ( description != '' ) {
            desc += '<p>'+description+'</p>';
        }
        if ( type == 'incorrect' ) {
            this.statusModal.addClass('incorrect').removeClass('correct');
        } else {
            this.statusModal.addClass('correct').removeClass('incorrect');
        }
        this.choiceDescription.html(desc);
    },
    
    questionValidators: {
        // User must get one correct answer to complete question
        oneCorrectAnswer: function(tq) {
            for( i = 0; i < tq.answerStack.length; i++ ) {
                if ( tq._inArray( tq.answerStack[i], tq.correctChoices ) ) {
                    return true;
                }
            }
            return false;
        },

        // User must get all the correct answers to complete question
        allCorrectAnswers: function(tq) {
            for( i = 0; i < tq.correctChoices.length; i++ ) {
                if ( !tq._inArray( tq.correctChoices[i], tq.answerStack ) ) {
                    return false;
                }
            }
            return true;
        }
    },

    // Each question scorer function must support two modes:
    // 
    // 1) Info: if the function argument is boolean true, the function should return an object with the keys "title" and "description"
    // 2) Score: otherwise, the function should score the question & return the score (a percentage, generally 0, 100, or 50)
    // 
    //     Correct choices for a question can be found in tq.correctChoices.
    //     The answer stack for a question can be found in tq.answerStack
    //
    questionScorers: {
        // User gets full credit as long as they eventually gets the correct answer
        infiniteAttempts: function(arg) {
        	var tq;
            if (arg === true) {
                return {
                    title: 'Infinite Attempts',
                    description: 'User gets full credit as long as they eventually get the correct answer(s)'
                };
            } else {
            	tq = arg;
            }

            if (tq.validator == 'allCorrectAnswers') {
                for (i = 0; i < tq.correctChoices.length; i++) {
                    if (!tq._inArray(tq.correctChoices[i], tq.answerStack)) {
                        return 0;
                    }
                }
                return 100;

            } else { // oneCorrectAnswer
                for (i = 0; i < tq.correctChoices.length; i++) {
                    if (tq._inArray(tq.correctChoices[i], tq.answerStack)) {
                        return 100;
                    }
                }
            }

            return 0;
        },

        // User gets full credit only if they click the correct answer(s) first (and no credit otherwise)
        oneAttempt: function(arg) {
        	var tq;
        	//MT: changing this line as per Adam's request in DF-46
        	//if (info_only === true) {
            if (arg === true) {
                return {
                    title: 'One Attempt',
                    description: 'User gets full credit only if they click the correct answer(s) first (and no credit otherwise)'
                };
            } else {
            	tq = arg;
            }

            if (tq.validator == 'allCorrectAnswers') {
                // Get a list of the user's unique answers (so duplicat
                var uniqueAnswers = tq._uniqueArray(tq.answerStack);

                // Get the users first {n} answers based on # correct choices
                var userAnswers = uniqueAnswers.slice(0, tq.correctChoices.length);

                for (var i = 0; i < tq.correctChoices.length; i++) {
                    if (!tq._inArray(tq.correctChoices[i], userAnswers)) {
                        return 0;
                    }
                }

                return 100;

            } else { // oneCorrectAnswer
                // Their first answer is correct
                if (tq._inArray(tq.answerStack[0], tq.correctChoices)) {
                    return 100;

                } else {
                    return 0;
                }
            }
        },

        // User gets full credit if they click the correct answer(s) first
        // and half credit if the user eventually finds the correct answer(s)
        oneAttemptFullElseHalf: function(arg) {
        	var tq;
        	//MT: changing this line as per Adam's request in DF-46
        	if (arg === true){
            //if (info_only === true) {
                return {
                    title: 'One Attempt full credit, otherwise half',
                    description: 'User gets full credit if they click the correct answer(s) first and half credit if the user eventually finds the correct answer(s)'
                };
            } else {
            	tq = arg;
            }
            
            var firstTime = tq.questionScorers.oneAttempt(tq);

            // If user got it the first time(s)
            if (firstTime != 0) {
                return firstTime;

            } else {
                return tq.questionScorers.infiniteAttempts(tq) / 2;
            }
        }
    },

	statusmodal_init: function() {
		// add the popin to el.wrap
		this.wrap.append('<div id="status_modal_' + this.query_index + '" class="status-modal im-rounded-top im-rounded-bottom"><div class="title-bar im-rounded-top" title="Drag"><span class="title">Feedback</span><a href="#" class="close"></a></div><div class="modal-body im-rounded-bottom"><div class="choice-description"></div><div class="show-selected-choices-wrapper"><!-- <label><input type="checkbox" class="show-selected-choices" value="true" /> Show previous choices</label> --></div></div></div>');

		this.statusModal = $('#status_modal_' + this.query_index)
							.draggable({handle: '.title-bar'});

		this.statusModal.find('.close').click({"tq":this}, this.statusmodal_close);
		
		this.picContainer.append('<a class="status-collapsed" href="#"><span class="icon"></span></a>');
		this.statusModalCollapsed = this.picContainer.find('.status-collapsed').click({"tq":this}, this.statusmodal_open);

		// this.showSelectedChoices = this.statusModal.find('.show-selected-choices').change(this.drawQuestion);
		// this.showSelectedChoicesWrapper = this.statusModal.find('.show-selected-choices-wrapper').hide();
		// this.showSelectedChoicesWrapper.hide();

		this.choiceDescription = this.statusModal.find('.choice-description');
		this.choiceDescription.hide();

		this.statusModal.removeClass('correct').removeClass('incorrect');
	},
	
	statusmodal_move: function(tq, left, top) {
		tq.statusModal.css({"left":left, "top":top});
	},

	statusmodal_close: function(e) {
		var tq;
		if (e.data != null) {
			tq = e.data.tq;

			e.preventDefault();
			e.stopPropagation();
		} else {
			tq = e;
		}

		e.preventDefault();
		e.stopPropagation();

		tq.statusModal.fadeOut('fast');
		tq.statusModalCollapsed.removeClass('disabled').fadeTo('fast', 1);
	},
	
	statusmodal_open: function(e) {
		var tq;
		if (e.data != null) {
			tq = e.data.tq;

			e.preventDefault();
			e.stopPropagation();
		} else {
			tq = e;
		}
		
		tq.statusModalCollapsed.fadeTo('fast', 0, function() { $(tq).addClass('disabled'); }).blur();
		tq.statusModal.fadeIn('fast');
	},
	
	statusmodal_flash: function() {
		this.statusModal.addClass('flash');
		setTimeout("$('#status_modal_" + this.query_index + "').removeClass('flash');", 200);
	},
    
    _inArray: function(item, array) {
        var res = $.inArray(item, array);
        if ( typeof res == "number" && res >= 0 ) { return true; }
        else { return false; }
    },
	
    _uniqueArray: function(array) {
        var r = new Array();
        o:for(var i = 0, n = array.length; i < n; i++) {
            for(var x = 0, y = r.length; x < y; x++)
            {
                if(r[x]==array[i])
                {
                    continue o;
                }
            }
            r[r.length] = array[i];
        }
        return r;
    },
	
	
	
	// ========================================
	// initialization
	parseSource: function() {
		// lines might start with "IM:"; if so, strip it out
		var s = this.query_source.replace(/^IM:\s*/, "");

		// Each imagemap query must be the sole query in a question.
		var lines = s.split(this.line_separator);
		
		this.query_text = "";
		
		for (var i = 0; i < lines.length; ++i) {
			// get line and trim
			var l = jQuery.trim(lines[i]);
			
			// points_possible
			if (l.search(/^_points:\s*(\d+)/i) > -1) {
				this.points_possible = RegExp.$1;

			// metadata -- starts with "_[a-zA-Z]"
			} else if (l.search(/^\_[a-zA-Z]/) > -1) {
				this.extractMetadata(l);

			// by default add it to the query text
			} else {
				this.query_text += l + "\n";
			}
			
			// note that answers are specified by imchoice divs
		}
		
		// now we should be done with the query text. Strip spaces
		this.query_text = jQuery.trim(this.query_text);
		
		// replace any remaining \n's with <br>
		this.query_text = this.query_text.replace(/\n/g, "<br>");
	},

	// ========================================
	// extend query functions
	
	setQueryData: function(qd) {
		this._super(qd);
		
		// if we get query_data, that's the user's answer
		this.user_answer = qd;
	},

	restoreAnswerFromARGA: function(answer) {
		this.user_answer = answer;
	},

	getQueryTypeForARGA: function() {
		var scorerInfo = this.questionScorers[this.scorer](true);
		return "image map (" + scorerInfo.title + ")";
	},

	getCorrectAnswerForARGA: function() {
		return this.correct_answer;
	},

	getUserAnswerForARGA: function() {
		if (this.user_answer == null || this.user_answer == "") {
			return "Not answered";
		} else {
			return this.user_answer;
		}
	},

	// mode should be "delivery" or "review" or "review_correct_incorrect"; "delivery" is assumed
	getHTML: function(mode) {
		// for imagemap questions, we need to initialize the elements here
		if (this.imagemap_initialized === false) {
			var question_jq = this.jq.parent();
			this.im_init(question_jq);
			this.imagemap_initialized = true;
		}

		// start with the query text, if there
		var html = this.query_text_html();
		
		// for now, at least, we don't do anything different in different modes.
		
		if (!this.userHasAnswered() || mode == 'preview') {
			// no previous answer to show

		// otherwise we have an answer, so ...?
		} else {

		}
		
		// do we need to do anything else here???
		
		return html;
	},
	
	userHasAnswered: function() {
		return (this.user_answer != "" && this.user_answer != null);
	},

	give_up: function() {
		// prompt the user
		var r = confirm("Are you sure you want to give up on this question? To try to answer the question, click on the image.");
		if (r === true) {
			// in the old activity player you see the modal with this message:
			// "The correct answer(s) are now highlighted in the image."
			
			this.questionComplete = true;
			// evaluateAnswer will subsequently be called, which will set grade and so forth.
			
		} else {
			return false;
		}
	},
	
	evaluateAnswer: function() {
		// if questionComplete is still false, user hasn't finished
		if (this.questionComplete === false) {
			return false;
		}
		
		// showSelectedChoicesWrapper is not currently used, but we might use it again in the future
        // this.showSelectedChoicesWrapper.hide();

		// Get labels for learner clicks
		var learnerResponse = [];
		for ( var i = 0; i < this.answerStack.length; i++ ) {
			if ( typeof this.answerStack[i] === "object" ) {
				learnerResponse.push( "Background (incorrect)" );
			} else {
				learnerResponse.push( this.choicesById[this.answerStack[i]].title + ' (' + this.choicesById[this.answerStack[i]].type + ')' );
			}
		}
		
		// set the user_answer to this set of labels
		this.user_answer = learnerResponse.join(', ');
		
		// grade the question
		var questionGrade = this.questionScorers[this.scorer](this);
		this.setGrade(questionGrade);
		
        // here we attempt to show the correct choices, but I don't think this works.
        // should we try to put a big check mark in the middle of the correct answer(s)??
        for (var j = 0; j < this.choices.length; j++) {
        	var id = '#choice-' + this.query_index + "_" + this.choices[j].id;
            if (this.choices[j].type == 'correct') {
            	$(id).show();
            } else {
            	$(id).hide();
			}            	
        }

		return true;
	}
});


