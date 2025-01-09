 //see http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
 function getURLParameter(name) {
	 return decodeURI(
		 (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	 );
 }

  //decode uri for find query string parameter call 'subsection', if it exists use it as the default index section to show
  var arga_wrapper_url      = null;
  var px_arga_wrapper_url   = "https://www.macmillanhighered.com/BFWglobal/js/ARGA/ARGA_wrapper.js";
  
  var section_param_name    = 'section';
  var section_param_value   = getURLParameter(section_param_name);
  var default_section_index = 0;
  var initial_section_index = default_section_index;

  var idxref_param_name     = 'idxref';
  var idxref_param_value    = getURLParameter(idxref_param_name);
  var default_idxref_id     = null;
  var initial_idxref_id     = default_idxref_id;

  //MT: this has to be the string 'null', not the object null
  if(section_param_value!=='null'){
	//window.alert("setting initial selection index from value "+section_param_value);
	initial_section_index = section_param_value;
  }

  //window.alert("initial_displayed_panel="+initial_displayed_panel);
  //window.alert(initial_section_index);
  if(idxref_param_value!=='null'){
	initial_idxref_id  = idxref_param_value;
  }
  //window.alert("initial idxref id="+initial_idxref_id);
// temporary; for use with Brightcove player.
var vidplayer;

// Include the ARGA_wrapper.js API. If "arga_api" is explicitly stated in the url string, get the wrapper file from there



if (location.search.search(/arga_api/i) > -1) {
	// URL might be escaped
	var loc_unescaped = unescape(location.search);
	if (loc_unescaped.search(/arga_api=([^\&]+)/i) > -1) {
		arga_wrapper_url = RegExp.$1;
		//document.write('<script language="JavaScript" type="text/javascript" src="' + RegExp.$1 + '"></scr' + 'ipt>');
	} else {
		alert("Looked for ARGA wrapper in search string but couldn't find it.");
	}
// if search string explicitly says to use the "digfir_arga" demo ARGA protocol, use it
} else if (location.search.search(/use_digfir_arga/i) > -1) {
	arga_wrapper_url = "https://www.macmillanhighered.com/BFWglobal/js/ARGA/ARGA_wrapper.js";
	//document.write('<script language="JavaScript" type="text/javascript" src="https://www.macmillanhighered.com/BFWglobal/js/ARGA/ARGA_wrapper.js"></scr' + 'ipt>');

// if search string includes an "entry_id" field, we're in an Angel portal, so include that arga_wrapper
} else if (location.search.search(/entry_id/i) > -1) {
	arga_wrapper_url = "https://www.macmillanhighered.com/BFWglobal/js/ARGA/ARGA_wrapper.js";
	//document.write('<script language="JavaScript" type="text/javascript" src="https://www.macmillanhighered.com/BFWglobal/js/ARGA/ARGA_wrapper.js"></scr' + 'ipt>');

// if search string includes "enrollmentid", we're in PX, so include that arga_wrapper
} else if (location.search.search(/enrollmentid/i) > -1) {
	arga_wrapper_url = px_arga_wrapper_url;
	//document.write('<script language="JavaScript" type="text/javascript" src="'+px_arga_wrapper_url+'"></scr' + 'ipt>');
	//document.write('<script language="JavaScript" type="text/javascript" src="https://www.macmillanhighered.com/BFWglobal/js/ARGA/ARGA_wrapper.js"></scr' + 'ipt>');
}
if(arga_wrapper_url!==null){
	document.write('<script language="JavaScript" type="text/javascript" src="'+arga_wrapper_url+'"></scr' + 'ipt>');
}

// if we don't detect any of these things in the search string, assume we're not using ARGA at all,
// so we don't have to include any arga_wrapper.

// define a "Open_ARGA_Report" function.  This should also be changed to use a different version
// of ARGA.  It's set up by default so that if we're not running in the context of Angel-Portal,
// the user just gets an alert saying "this report is coming".
function Open_ARGA_Report(qnum) {
	// in the Angel implementation, the following two things will be defined.
	if (ARGA_VARS != null && ARGA_VARS.getData_path != null && ARGA_VARS.getData_path != "") {
		// for Angel: open the G3 activity_report for the item
		var arga_server = ARGA_VARS.getData_path.replace(/(.*BFW).*/, "$1");
		var url = arga_server
			+ "/reports_g3/activity_report.asp"
			+ "?entry_id=" + ARGA_VARS.GET_FN('entry_id')
		
		// ideally we'd go right to a question number if provided, but this isn't currently
		// built into the Angel report interface
		if (qnum != null) {
			url += "&qnum=" + qnum;
		}
		
		// open the report in a new window.
		window.open(url);
	} else {
		Standard_Dialog.alert("This will show the instructor a report of her students' responses on this question.");
	}
}

function ______Figures() {}		// comment so that BBEdit's function menu works better
// PW: Define Figures as a class, so that it can be extended 
// by varieties of the standard player.
var Figures = Class.extend({

	// see http://code.google.com/p/swfobject/wiki/documentation
	// for documentation on swfobject
	process_swfs: function() {
		// we're not currently using this (swfobject is not being included)
		$("[data-mmtype='swf']").each(function(index, element) {
			var jq = $(element);
			var id = jq.attr("data-figure-id");
			var src = jq.attr("data-mmsrc");
			var attr = jq.attr("data-attr");
			if (attr == null) attr = "";
			attr = attr.split(/\s*,\s*/);
			
			// get default width and height from the placeholder image
			var width = jq.width();
			var height = jq.height();
			var version = "9.0.0";
			var params = new Object();
			for (var i = 0; i < attr.length; ++i) {
				var a = attr[i].split(/\s*=\s*/);
				if (a[0] == 'width') {
					width = a[1];
				} else if (a[0] == 'height') {
					height = a[1];
				} else if (a[0] == 'version') {
					version = a[1];
				} else {
					params[a[0]] = a[1];
				}
			}
			
			// set the id attribute to the id value from data-figure-id
			jq.attr("id", id);
			
			var x = swfobject.embedSWF(src, id, width, height, version, false, false, params);
		});
	},

	// http://www.longtailvideo.com/support/jw-player/jw-player-for-flash-v5/12536/configuration-options
	process_media: function() {
		// we're not currently using this (jwplayer is not being included)
		$("[data-mmtype='mp3']").each(function(index, element) {
			var jq = $(element);
			var id = jq.attr("data-figure-id");
			var mmsrc = jq.attr("data-mmsrc");	
			// http://www.longtailvideo.com/jw/upload/bunny.mp3
			// http://www.youtube.com/embed/CsGYh8AacgY
			var src = jq.attr("src");
			var attr = jq.attr("data-attr");
			if (attr == null) attr = "";
			attr = attr.split(/\s*,\s*/);
			
			var params = new Object();
			
			
			
			params.width = jq.width();
			params.height = jq.height() + 24;	// 24 is for the controler at the bottom
			params.file = mmsrc;
			params.image = src;
			params.controlbar = "bottom";
			params.screencolor = "ffffff";
			params["viral.allowmenu"] = "false";
			params["viral.onpause"] = "false";
			params["viral.oncomplete"] = "false";
			// determine url of flashplayer based on whether we're published or not
			if (UI_Elements.in_preview_mode()) {
				params.flashplayer = "/js/preview/player.swf";
			} else {
				params.flashplayer = "js/player.swf";
			}
			safe_log(params.flashplayer);
			for (var i = 0; i < attr.length; ++i) {
				var a = attr[i].split(/\s*=\s*/);
				params[a[0]] = a[1];
			}
	
			jwplayer(id).setup(params); 
		});
		//AF: this is less than ideal, but i had to make this a global variable so it can be accessed by the video players when they fire the templateloaded event.
		//		we should look into changing it.
		videos.templateReady = function (figureObjectID) {
			
			var vidplayer = brightcove.api.getExperience(figureObjectID);
			var experienceModule = vidplayer.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
			var playerModule = vidplayer.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
			

			

			
			var questionSequence = $("#" + figureObjectID).closest('[data-type="figure"]').nextAll('[data-block_type="question_sequence"], [data-block_type="question_sequence_one_at_a_time"]');

		   
			
			questionSequence.each(function (index, element) {
				if ($(element).attr("data-block_type") == "figure") {
					if ($(element).find(".BrightcoveExperience").size() > 0) {  //we have found another video following the current one, so stop
						return false;
					}
				}
				
				var questionSequenceIndex = $(element).attr("question_sequence_index");
				
				var questionSequenceMetaData = $(element).find('[data-type="box_inner"]').children('[data-type="metadata"]').find('[key="cuepoint"]').html();
				
				$(element).hide();

				if (questionSequenceMetaData != null) {
					var cuePointsModule = vidplayer.getModule(brightcove.api.modules.APIModules.CUE_POINTS);

					var CuePointType = brightcove.api.modules.CuePointsModule.CuePointType;
					var cuePoints = [{ name: figureObjectID, metadata: questionSequenceIndex, time: questionSequenceMetaData, type: CuePointType.CODE }];
					cuePointsModule.addCuePoints(videos[figureObjectID], cuePoints);
					

					
					videos.question_sequence_to_video_map[questionSequenceIndex] = figureObjectID;
				}


			});






			playerModule.addEventListener(brightcove.api.events.CuePointEvent.CUE, videos.cuePointEvent);
			
		};
		videos.cuePointEvent = function (e) {
			//get the player - the name property of the cuePoint is set to the ID of the Brightcove experience
			//so we can find the player here.
			
			var vidplayer = brightcove.api.getExperience(e.cuePoint.name);
			globalPlayer = brightcove.api.getExperience(e.cuePoint.name);
			safe_log("got vid player");
			var playerModule = vidplayer.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
			safe_log("got module");
			playerModule.pause(true);
			safe_log("paused");

			player.show_question_sequence(e.cuePoint.metadata, false);

			
		};
	
        $("[data-mmtype='mov']").each(function(index, element) {
            
            var jq      = $(element);
            var id      = jq.attr("data-figure-id");
            var mmsrc   = jq.attr("data-mmsrc");
            var src     = jq.attr("src");
            var attr    = jq.attr("data-attr");
            if (attr == null) attr = "";
            
            attr        = attr.split(/\s*,\s*/);
            
            var params  = new Object();
            for (var i = 0; i < attr.length; ++i) {
                var a = attr[i].split(/\s*=\s*/);
                params[a[0]] = a[1];
                safe_log("added param " + a[0] + ": " + a[1]);
            }

            /**
             * PDT-2610 A.Teller 14 July 2017
             * autoplay data attribute depended on, but may not exist. 
             * Handle this by using value of data-autoplay only if it's defined.
             * Otherwise set params.autoStart to 'false'
             */ 
            if (typeof jq.attr("data-autoplay") === "undefined") { 
                params.autoStart = false;
            } else {
                params.autoStart = jq.attr("data-autoplay") === "true" ? true : false;
            }

            var videoPlayerID = "";
            var videoPlayerKey = "";
            //if(params.showVideoControls == 'true'){
                //AF: This is the video player with playback controls. We are only using this one for right now.
                videoPlayerID = "1513003547001";
                
                if(jq.attr("data-playerid")){
                    videoPlayerID = jq.attr("data-playerid");
                }
                
                videoPlayerKey = "AQ~~,AAABXVHBMdE~,bnY9CM55Z1MLPZuidy4KYEC_16wi-U8Q";
            //}else{
            //  videoPlayerID = "1504927982001";
            //  videoPlayerKey = "AQ~~,AAABXVHBMdE~,bnY9CM55Z1PiqOYprq-NHmUPG2yKZ4U-";
            //}
            videos[id] = mmsrc;
            var BCL = {};
            BCL.markup = function (html, data) {
                var m;
                var i = 0;
                var match = html.match(data instanceof Array ? /{{\d+}}/g : /{{\w+}}/g) || [];

                while (m = match[i++]) {
                    html = html.replace(m, data[m.substr(2, m.length-4)]);
                }
                return html;
            };
            
            videos.templateLoad = function(e){
                //AF: For now, we are not using captions.
                var vidplayer = brightcove.api.getExperience(e);
                var CuePointType = brightcove.api.modules.CuePointsModule.CuePointType;
                var modExp = vidplayer.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
                modExp.addEventListener(brightcove.api.events.ExperienceEvent.TEMPLATE_READY, function (evt) { videos.templateReady(e); });
                
                //captionsModule.loadDFXP(player.md.video_caption_url + videos[e] + ".xml", videos[e]);
                //if needed, we can use these events to trigger code upon the success or error of loading captions.
                //if there is an error, it fails silently and just doesn't show captions.
                //captionsModule.addEventListener(brightcove.api.events.CaptionsEvent.DFXP_LOAD_SUCCESS, onDFXPLoadSuccess);
                //captionsModule.addEventListener(brightcove.api.events.CaptionsEvent.DFXP_LOAD_ERROR, onDFXPLoadError);
            }
            
            BCL.playerData = { "playerID" : videoPlayerID,
                    "playerKey" : videoPlayerKey,
                    "width" : element.width,
                    "height" : element.height,
                    "videoID" : mmsrc,
                    "autoStart" : params.autoStart};
            BCL.playerTemplate = "<div style=\"display:none\"></div><object id=\"" +  id  +"\" class=\"BrightcoveExperience\"><param name=\"bgcolor\" value=\"#64AAB2\" /><param name=\"width\" value=\"{{width}}\" /><param name=\"height\" value=\"{{height}}\" /><param name=\"playerID\" value=\"{{playerID}}\" /><param name=\"playerKey\" value=\"{{playerKey}}\" /><param name=\"isVid\" value=\"true\" /><param name=\"isUI\" value=\"true\" /><param name=\"dynamicStreaming\" value=\"true\" /><param name=\"@videoPlayer\" value=\"{{videoID}}\"; /><param name=\"templateLoadHandler\" value=\"videos.templateLoad\" /> <param name=\"autoStart\" value=\"{{autoStart}}\" /><param name=\"includeAPI\" value=\"true\" /><param name=\"secureHTMLConnections\" value=\"true\"/><param name=\"secureConnections\" value=\"true\"/></object>";
            var playerHTML = "";
            playerHTML = BCL.markup(BCL.playerTemplate, BCL.playerData);  //replaces placeholders with values
            jq.replaceWith(playerHTML);
            brightcove.createExperiences();

        });
    },

	process_iframes: function(jq) {
		if (jq == null) {
			jq = $("body");
		}
		
		jq.find("[data-mmtype='iframe']").each(function(index, element) {
			var jq = $(element);
			var id = jq.attr("data-figure-id");
			var src = jq.attr("data-mmsrc");
			var attr = jq.attr("data-attr");
			if (attr == null) attr = "";
			attr = attr.split(/\s*,\s*/);

			// get default width and height from the placeholder image
			var params = new Object();
			params.width = jq.width();
			params.height = jq.height();
			params.frameborder = "no";
			params.scrolling = "no";
			params.style = "margin:0px; padding:0px";
			params.src = src;
			
			for (var i = 0; i < attr.length; ++i) {
				var a = attr[i].split(/\s*=\s*/);
				params[a[0]] = a[1];
			}
			
			var pstring = "";
			for (var i in params) {
				pstring += ' ' + i + '="' + params[i] + '"';
			}
			
			jq.replaceWith('<iframe ' + pstring + '></iframe>');
		});
	},
	
	// extend this function to do something when the media player is done playing
	media_player_done: function(id) {
		
	},
	
	// show the figure -- which means shifting so that the figure is visible
	// we're not currently using this function, but I'm keeping it around in case we need it later
	show: function(ref) {
		// TODO: we assume here that the figure is part of the html page we currently have loaded.
		// this isn't a safe assumption; what we *should* do is have a table where we can look up
		// what html page the figure is in, and go to that page if necessary
		
		// find the figure we're referring to
		var jq = $(ref);
		var fig_id = jq.attr("data-refid");
		
		// get that figure's jquery object
		var fig_jq = $("[data-figure-id=" + fig_id + "]");
		
		// make sure we're in that figure's section
		var sec_jq = fig_jq.parents("[data-type=section]");
		var sec_index = sec_jq.attr("data-section-index");
		if (player.section_currently_showing != sec_index) {
			player.show_section(sec_index * 1);
		}
		
		// scroll to the figure
		$(window).scrollTo(fig_jq, 500);
	},
	
	// expand the figure -- which means (at least for now) popping it up in a new window
	expand: function(ref) {
		// TODO: we assume here that the figure is part of the html page we currently have loaded.
		// this isn't a safe assumption; what we *should* do is have a table where we can look up
		// the figure id's across the entire book/project
		// also we should really show the figure's number/caption...
		
		var figure_jq;
		// if ref is a string, find the figure based on that reference
		if (typeof ref == "string") {
			figure_jq = $("[data-type=figure][data-figure-id=" + ref + "]");
		
		// otherwise the figure should be an ancestor of ref
		} else {
			figure_jq = $(ref).parents('[data-type=figure]').first();
		}
		
		// get the src of the image to expand
		var altsrc = figure_jq.attr('data-altsrc');
		// not sure what to do with the title yet, if anything...
		// var title = figure_jq.find('[data-type=figure_text]').html().replace(/<.*?>/g, '');
		window.open(altsrc, 'fig_win');
	},
	
	init: function() {
		this.process_swfs();		// flash
		this.process_media();		// mp3s and other things that get played via the MediaPlayer
		
		// only load all iframes at once if player.md.preload_all_iframes is set to true
		// otherwise we do it as we load each section.
		if (player.md.preload_all_iframes == "true") {
			this.process_iframes();		// iframes
		}

		// Figure references in the text should pop up the figure, unless the figure isn't expandable
		$("[data-type='ref'][data-ui='figure']").each(function(index, element) {
			// get the figure's jquery object to determine if it's expandable
			var fig_id = $(element).attr("data-refid");	
			var fig_jq = $("[data-figure-id=" + fig_id + "]");
			
			// currently we can only expand images; this should change later
			var is_image = (fig_jq.find("[data-mmtype=image]").length > 0);
			if (fig_jq.attr("expandable") != "false" && is_image) {
				$(element).click(function() { return player.figures.expand($(this).attr("data-refid")) }).css("cursor", "pointer");
			}
		});
		
		// Now the figures themselves
		$("[data-type='figure']").each(function(index, element) {
			var jq = $(element);
			var ijq = $("[data-mmtype]", jq);	// the figure's main image will have a mmtype tag
			// get the figure id
			var id = jq.attr("data-figure-id");

			// if the figure is expandable, make the figure and its number clickable
			// currently we can only expand images; this should change later
			if (jq.attr("data-expandable") != "false" && ijq.attr("data-mmtype") == "image") {
				ijq.click(function() { return player.figures.expand(this) }).css("cursor", "pointer");
				$("[data-type='number']", jq).click(function() { return player.figures.expand(this) }).css("cursor", "pointer");
				
				// also, if altsrc isn't specified, set it to the image source
				if (jq.attr("data-altsrc") == undefined) {
					jq.attr("data-altsrc", ijq.attr("src"));
				}
			}
			
			// deal with attributes field on the image
			// note that multiple attributes must be separated by " | " -- at least one space 
			// surrounding each attribute. This allows "||" to be a valid part of an attribute
			var attr = ijq.attr("data-attr");
			if (attr != null) {
				attr = attr.split(/\s* \| \s*/);
				for (var i = 0; i < attr.length; ++i) {
					if (attr[i].search(/^(\w+)=(.*)/) > -1) {
						var key = RegExp.$1;
						var value = RegExp.$2;
						
						if (key == 'onclick') {
							ijq.click(new Function(value));
							ijq.css("cursor", "pointer");
	
						// default: just write them out as attributes of the image
						} else {
							ijq.attr(key, value);
							safe_log("Image attribute: set " + key + " to " + value);
						}
						
					} else if (attr[i] != "") {
						safe_log("Bad image attribute (" + i + "): '" + attr[i] + "'");
					}
				}
			}
		});
	}
});

function ______IdXRefs() {}		// comment so that BBEdit's function menu works better
// PW: Define IdXRefs as a class, so that it can be extended 
// by varieties of the standard player.
var IdXRefs = Class.extend({

	init: function() {
		// Deal with section links...
		/*
		$("[data-type='ref'][data-ui='embed']").each(function(index, element) {
			$(element).click(function() { return player.xrefs.open(this) });
		});
		*/

		// links
		
		var url           = window.location.pathname;
		var filename      = url.substring(url.lastIndexOf('/')+1);
		var last_index    = filename.lastIndexOf('.');
		this.file_root = null;
		if(last_index>-1){
			filename = filename.substring(0,last_index);
			var last_underscore = filename.lastIndexOf('_');
			if(last_underscore>-1){
				this.file_root  = filename.substring(0,last_underscore+1);
				this.file_index = filename.substring(last_underscore+1);
				//window.alert("["+this.file_root+"],["+this.file_index+"]")
				
			}
		}
		this.create_links($("body"));
	},

	create_links: function(jq) {
		var _file_root  = this.file_root;
		var _file_index = this.file_index;
		//window.alert(_file_root);
		jq.find("[data-type='idxref']").each(function(index, element) {
			// opening with a click event, as in the following line, doesn't work for queries;
			// in any case I think a "real" link is probably better anyway.
			// $(element).click(t.open_link).css("cursor", "pointer");
			
			var jq2        = $(element);
			jq2.addClass('xref_link');
			//jq2.css("cursor","pointer");
			//jq2.css("color", "#900");
			//jq2.css("background-color", "#ffc");
			var idxref_val = jq2.attr('data-idxref');
			if(idxref_val){
				var idxref_target = idxref_val.split(" ");
				var idxref_id     = idxref_target[0];
				var idxref_panel  = idxref_target[1];
				var idxref_file   = idxref_target[2];
				jq2.click(function(){ 
					var _new_file      = _file_root+idxref_file+".html";
					var _current_panel = player.section_currently_showing;
					//window.alert("currently showing panel "+_current_panel);
					if(_file_index==idxref_file || _file_root==null){
						if(_current_panel!=idxref_panel){
							
						//}else{
							player.show_section(idxref_panel);
						}
						player.highlight_element(idxref_id);
					}else{
						
						//window.alert("load "+_new_file+"?section="+idxref_panel);
						window.location = _new_file+"?section="+idxref_panel+"&idxref="+idxref_id;
					}
					//window.alert(":"+_file_root+","+_file_index);
					//window.alert("idxref_target id:"+idxref_id+", panel:"+idxref_panel+", file:"+idxref_file); 
					//if file is this file
					//   if panel is this panel
					//      highlight id el
					//   if different panel
					//      show panel
					//      highlight id el
					//if different file
					//    load file
					//    show panel
					//    highlight id el
				});
			}
			
			//jq2.replaceWith("<span style='color: #0c0;'>XXXX</span>");
			//jq2.replaceWith("<a target='_blank' href='" + jq2.attr("data-href") + "'>" + jq2.html() + "</a>");
		});
	}

});




function ______XRefs() {}		// comment so that BBEdit's function menu works better
// PW: Define XRefs as a class, so that it can be extended 
// by varieties of the standard player.
var XRefs = Class.extend({
	
	open: function(ref) {
		var jq = $(ref);
		
		player.jump_to_page(jq.attr("data-refid"));
		
		// return false to cancel link click
		return false;
	},
	
	// PW: not used anymore; see below
	open_link: function(e) {
		var jq = $(e.target);
		window.open(jq.attr("data-href"));
	},
	
	create_links: function(jq) {
		jq.find("[data-type='link']").each(function(index, element) {
			// opening with a click event, as in the following line, doesn't work for queries;
			// in any case I think a "real" link is probably better anyway.
			// $(element).click(t.open_link).css("cursor", "pointer");
			var jq2 = $(element)
			jq2.replaceWith("<a target='_blank' href='" + jq2.attr("data-href") + "'>" + jq2.html() + "</a>");
		});
	},
	
	init: function() {
		// Deal with section links...
		/*
		$("[data-type='ref'][data-ui='embed']").each(function(index, element) {
			$(element).click(function() { return player.xrefs.open(this) });
		});
		*/

		// links
		this.create_links($("body"));
	}
});


function ______Links() {}		// comment so that BBEdit's function menu works better
// PW: Define Links as a class, so that it can be extended 
// by varieties of the standard player.
var Links = Class.extend({
	links_opened: [],

	open: function(url, link_type) {
		// not sure what we'll do with link_type yet...
		
		// see if we've already opened this url
		for (var i = 0; i < links_opened.length; ++i) {
			// if we find that we've already opened it, break
			if (links_opened[i] == url) {
				break;
			}
		}
		// when we exit this loop, i will either be the index of a previously-
		// opened link, or links_opened.length. Do the same thing either way
		links_opened[i] = url;
		var w = window.open(url, "link_window_" + i);
		w.focus();
	},
	
	init: function() {
	
	}

});

// not doing anything with this at this point, but could do later
function ______Tables() {}		// comment so that BBEdit's function menu works better
var Tables = Class.extend({
	/*
	|| Column      || Min || Q1 || Median || Q3 || Max ||
	| Running Time |  89  | 121 |   134   | 145 |  201 |
	*/

	init: function() {
	}
});

// glossary terms and definitions
function ______Glossary() {}		// comment so that BBEdit's function menu works better
var Glossary = Class.extend({
	terms: {},
	
	show_definition: function(el) {
		var jq = $(el);
		var index = jq.attr("data-term");
		if (index == "" || index == null) {
			index = jq.html();
		}
		if (index != "" && index != null) {
			index = index.toLowerCase();
			var term = player.glossary.terms[index];
			var html;
			if (term == null) {
				html = "No definition found for " + index;
			} else {
				html = "<b>" + term.term + ":</b> " + term.definition;
			}
			Standard_Dialog.open(html, {"title": "Glossary"
				, "modal":false
				, "draggable":true
				, "buttons":"OK"
			});
		}
	},
	
	init: function() {
		var terms = this.terms;
		// find all terms
		$("[data-type='glossaryentry']").each(function(index, element) {
			var jq = $(element);
			var term = jq.find("[data-type='term']").html();
			var definition = jq.find("[data-type='definition']").html();
			if (term != "" && definition != "" && term != null && definition != null) {
				// index terms object by lower-case, html-stripped version of term
				var index = term.toLowerCase();
				index = index.replace(/<[^>]+>/, "");
				
				terms[index] = {'term': term, 'definition': definition};
			}
		});

		$("[data-type='termref']").each(function(index, element) {
			// opening with a click event, as in the following line, doesn't work for queries;
			// in any case I think a "real" link is probably better anyway.
			// $(element).click(t.open_link).css("cursor", "pointer");
			var jq = $(element);
			jq.click(function() { player.glossary.show_definition(this); });
		});
	}
});

function ______Variables() {}		// comment so that BBEdit's function menu works better
var Variables = Class.extend({
	vars: {},
	
	is_array: function(key) {
		return (this.vars[key] != null && typeof(this.vars[key]) == "object");
	},
	
	array_key: function(key) {
		if (key.charAt(0) == "@") {
			key = key.substr(1);
		}
		return key;
	},
		
	// random number >= min and <= max
	rand: function(min, max, places) {
		safe_log("rand(" + min + "," + max + "," + places + ")");
		min = this.evaluate(min);
		max = this.evaluate(max);
		places = this.evaluate(places);
		
		if (isNaN(min) || min == null || isNaN(max) || max == null) {
			this.error("rand(" + min + "," + max + "," + places + ")");
			return 1;
		}

		// default is 0 places (integer)
		if (isNaN(places) || places == null) {
			places = 0;
		}
		var mult = Math.pow(10, places);

		// note that we add one to max, but then use Math.floor in calculating val
		// this ensures that we have an equal chance of getting any...
		var val = Math.floor(Math.random() * ((max - min) * mult + 1)) / mult + min;

		// now make sure we have *exactly* the right places
		return this.round(val, places);
	},
	
	// round to *exactly* this number of places, returning a string
	round: function(val, places) {
		if (places == null) {
			places = 0;
		}
		
		// calculate mult value and multiply by that value, then round
		var mult = Math.pow(10, places);
		val = Math.round(val * mult);

		// note if val is negative and make it positive, then make it a string
		var is_negative = (val < 0);
		val = Math.abs(val) + "";
		
		// now use substr to get values of integer and decimal
		var stem = val.substr(0, val.length - places);
		// stem might be "0"
		if (stem == "") stem = "0";
		
		// if we're rounding to 0 places, just return the stem
		if (places == 0) {
			val = stem;
		
		// otherwise...
		} else {
			// get the decimal part of the number
			var dec = val.substr(-1*places);
			
			// pad left with zeros if necessary
			var zeros_to_add = places - dec.length;
			for (var i = 0; i < zeros_to_add; ++i) {
				dec = "0" + dec;
			}
			
			// and reconstruct the number
			val = stem + "." + dec;
		}
		
		// add the negative sign if necessary
		if (is_negative) {
			val = "-" + val;
		}
		
		return val;
	},
	
	// range is deprecated -- it's just an alias for rand
	range: function(min, max, places) {
		return this.rand(min, max, places);
	},
	
	// length of an array
	length: function(key) {
		key = this.array_key(key);
		
		if (this.is_array(key)) {
			return this.vars[key].length;
		} else {
			this.error("length function called without an array: " + key);
		}
	},

	// sum of an array
	sum: function(key) {
		key = this.array_key(key);
		
		if (this.is_array(key)) {
			var arr = this.vars[key];
			var sum = 0;
			for (var i = 0; i < arr.length; ++i) {
				sum += (arr[i] * 1);
			}
			
			if (isNaN(sum)) {
				this.error("error in sum function");
				return 1;
			} else {
				return sum;
			}
			
		} else {
			this.error("sum function called without an array: " + key);
			return 1;
		}
	},
	
	// mean of an array
	mean: function(key) {
		key = this.array_key(key);
		
		if (this.is_array(key)) {
			return (this.sum(key) / this.vars[key].length);
			
		} else {
			this.error("mean function called without an array: " + key);
			return 1;
		}
	},
	
	// indexed value of an array
	arrval: function(key, index) {
		if (this.is_array(key)) {
			// convert to number if possible
			var v = this.vars[key][index];
			if (!isNaN(1*v)) {
				return 1*v;
			} else {
				return v;
			}
		} else {
			this.error("arrval error function called without an array: " + key);
			return 1;
		}
	},
	
	math_fns: ["pow", "sqrt", "floor", "ceil", "abs", "acos", "asin", "atan", "atan2", "cos", "exp", "log", "max", "min", "sin", "tan"],
	this_fns: ["rand", "range", "round", "length", "sum", "mean"],
	// derived classes can define the below
	custom_fns: [],
	
	evaluate: function(args) {
		if (args == null || args === "") {
			return null;
		}
		args = "" + args;
		
		var original_args = args;
		
		// replace array references with arrval function calls
		args = args.replace(/\@(\w+)\s*\[\s*(.*?)\s*\]/, 'this.arrval("$1",$2)');
		
		// replace any previously-defined variables with their values
		args = this.replace_values_in_definitions(args);
		
		// then replace Math functions with "Math.x"
		for (var i = 0; i < this.math_fns.length; ++i) {
			args = args.replace(new RegExp("\\b" + this.math_fns[i] + "\\b", "g"), "Math." + this.math_fns[i]);
		}

		// then replace functions defined here and in custom with "this.x"
		for (var i = 0; i < this.this_fns.length; ++i) {
			args = args.replace(new RegExp(this.this_fns[i], "g"), "this." + this.this_fns[i]);
		}
		for (var i = 0; i < this.custom_fns.length; ++i) {
			args = args.replace(new RegExp(this.custom_fns[i], "g"), "this." + this.custom_fns[i]);
		}

		if (player.md.variable_debug == "true") {
			safe_log("evaluating: " + original_args + " :: " + args);
		}
		
		// then eval away!
		var val;
		try {
			val = eval(args);
		} catch(e) {
			this.error(args + " / " + e);
			val = 1;
		}
		
		return val;
	},
	
	replace_values_in_definitions: function (s) {
		s += "";
		if (s == null || s == "") {
			return s;
		}

		// first scalars
		for (var key in this.vars) {
			if (!this.is_array(key)) {
				s = s.replace(new RegExp("\\$" + key + "\\b", "g"), this.vars[key]);
				s = s.replace(new RegExp("\\$\\{" + key + "\\}", "g"), this.vars[key]);
			}
		}
		
		// then quote @ vars
		s = s.replace(/(\@\w+\b)/g, '"$1"');
		
		return s;
	},
	
	replace_values: function(s, wrap) {
		s += "";
		if (s == null || s == "") {
			return s;
		}
		
		for (var key in this.vars) {
			var rt = this.vars[key];
			
			// arrays are written as comma-separated values
			if (this.is_array(key)) {
				rt = rt.join(", ");
			}
			
			if (wrap == "span") {
				rt = "<span data-type='variable'>" + rt + "</span>";
			} else if (wrap == "img") {	
				// we could bold the variable values in HTS images, but that changes the meaning. Need to try to get HTS player to do a colored font (if it doesn't already)
				// rt = "%40B%7B" + rt + "%7D";
			}
			s = s.replace(new RegExp("(\\$|\\%24|\\@)" + key + "\\b", "g"), rt);
			s = s.replace(new RegExp("(\\$|\\%24|\\@)\\{" + key + "\\}", "g"), rt);

			

		}
		return s;
	},
	
	error: function(l) {
		safe_log("- bad variable definition: " + l);
	},
	
	get_variable_definitions: function() {
		var t = this;
		$("[data-type=metadata]").each(function(){
			var md = new Metadata({jq:$(this)});
			
			for (var key in md) {
				if (key.charAt(0) == "$" || key.charAt(0) == "@") {
					var val = md[key];
					var type = key.charAt(0);
					key = key.substr(1);
					
					// remove comment if there
					val = val.replace(/\s*\/\/.*/, "");
					
					// arrays
					if (type == "@") {
						// set of values: {1,2,3}
						if (val.search(/\{(.*)\}/) > -1) {
							val = RegExp.$1.split(/\s*,\s*/);
						
						// array of randomly generated values: @data: [10, 10-100, 1]
						} else if (val.search(/^\[\s*(\S+?)\s*,\s*(\S+?)\s*-\s*(\S*?)(\s*,\s*(\d+))?\s*\]/) > -1) {
							var n = RegExp.$1 * 1;
							var min = RegExp.$2;
							var max = RegExp.$3;
							var places = RegExp.$5;
							if (!isNaN(n)) {
								val = [];
								for (var i = 0; i < n; ++i) {
									val.push(t.rand(min, max, places));
								}
							}
						
						// if this doesn't work, make it a scalar with the string
						// hopefully the author will recognize this.
						}
					
					// scalars (start with "$")
					} else {
						// set of possibilities: {1,2,3}
						if (val.search(/^\{(.*)\}/) > -1) {
							var options = RegExp.$1.split(/\s*,\s*/);
							val = $.trim(options[t.rand(0, options.length-1)]);
						
						// range of values: [1-10,2] (,2 is optional)
						} else if (val.search(/^\[\s*(\S+?)\s*-\s*(\S*?)(\s*,\s*(\d+))?\s*\]/) > -1) {
							// this really just means a random number;
							// note that the range is inclusive -- the bottom
							// or top value could be chosen
							val = t.rand(RegExp.$1, RegExp.$2, RegExp.$4);
						
						// function (Math or defined here): eval pow($a,2)
						} else if (val.search(/^eval\s*(.*)/) > -1) {
							val = t.evaluate(RegExp.$1);
							
						// default: evaluate
						} else {
							val = t.evaluate(val);
						}
						
						// make sure val is a *string*
						val = "" + val;
					}
					
					if (player.md.variable_debug == "true") {
						safe_log("- " + key + " = " + val);
					}
					t.vars[key] = val;
				}
			}
			// do we need to remove that metadata block now?
		});
	},
	
	init: function() {
		// get definitions
		this.get_variable_definitions();
		
		var t = this;
		
		// replace in image src's (HTS formulas)
		$("img").each(function(){
			var src = $(this).attr("src");
			src = t.replace_values(src, "img");
			$(this).attr("src", src);
		});

		// vars in queries are replaced separately
		
		// now replace in the whole manuscript, wrapping in spans this time
		var html = $("#manuscript").html();
		html = this.replace_values(html, "span");
		$("#manuscript").html(html);
	}
});

function ______Interactions() {}		// comment so that BBEdit's function menu works better
// PW: Define Interactions as a class, so that it can be extended 
// by varieties of the standard player.
var Interactions = Class.extend({
	process_moreinfo_blocks: function() {
		$("[data-block_type=moreinfo]").each(function(index, element) {
			var jq = $(this);
			jq.attr("id", "moreinfo_block_" + index);
			var html = '<a data-type="moreinfo_link" href="javascript:player.interactions.show_moreinfo(' + index + ')">more info...</a> ';
			jq.before(html);
		});
	},
	
	show_moreinfo: function(index) {
		safe_log(index);
		$("#moreinfo_block_" + index).toggle();
	},
	
	process_onclick_blocks: function() {
		$("[data-onclick]").each(function(index, element) {
			var jq = $(this);
			
			// find parental box or section
			var parent = jq.parents("[data-type=box]");
			if (parent.length == 0) {
				parent = jq.parents("[data-type=section]");
			}
			if (parent.length == 0) {
				safe_log("process_onclick_blocks: couldn't find a parent for index: " + index);
			}

			// if there is one or more trigger item in the box, hitch the onclick event to it/them
			// we have to unbind click events first to make sure we don't do multiple binds
			var triggers = parent.find("[data-onclick_trigger=true]");
			if (triggers.length > 0) {
				triggers.css("cursor", "pointer").unbind("click").click(function() {
						// find parent
						var jq = $(this);
						var parent = jq.parents("[data-type=box]");
						if (parent.length == 0) {
							parent = jq.parents("[data-type=section]");
						}
						if (parent.length > 0) {
							// do onclick event on each data-onclick item
							parent.find("[data-onclick]").each(player.interactions.onclick_handler);
						}
					});
			// otherwise the whole parent is the target
			} else {
				parent.css("cursor", "pointer").unbind("click").click(function() { 
						$(this).find("[data-onclick]").each(player.interactions.onclick_handler);
					});
			}
		});
	},
	
	onclick_handler: function(index, element) {
		var action = $(element).attr("data-onclick");
		if (action == "show") {
			// add a "clicked" class to the trigger if the item is being shown here
			// (that is, if the item is at this point hidden)
			if (!$(element).is(":visible")) {
				$(element).parent().find("[data-onclick_trigger]").addClass("clicked");
			// otherwise we're hiding the item, so remove the "clicked" class below
			}
			$(element).slideToggle("fast", function() {
				// add a "clicked" class to the trigger if the item is being shown here
				// (that is, if the item is at this point hidden)
				if (!$(element).is(":visible")) {
					$(element).parent().find("[data-onclick_trigger]").removeClass("clicked");
				}
			});
		} else {
			player.interactions[action](element);
		}
	},
	
	init: function() {
		this.process_onclick_blocks();
		this.process_moreinfo_blocks();
	}
});

function ______Question() {}		// comment so that BBEdit's function menu works better
var Question = Class.extend({
	extract_metadata: function() {
		if (this.jq == null) {
			return;
		}
		
		this.md.add_from_jq(this.jq.find("[data-type=metadata]"));
	},
	
	// return whether or not metadata with the given key is set
	md_set: function(key) {
		return (this.md[key] != null);
	},
	
	is_complete: function() {
		for (var i = 0; i < this.queries.length; ++i) {
			if (!this.queries[i].userHasAnswered()) {
				return false;
			}
		}
		return true;
	},

	is_correct: function() {
		for (var i = 0; i < this.queries.length; ++i) {
			if (!this.queries[i].isCorrect()) {
				return false;
			}
		}
		return true;
	},
	
	get_weight: function() {
		return Math.round(this.points_possible / player.activity.total_points_possible * 100);
	},
	
	check_conditional: function(condition) {
		return "";
		
		// condition will be, e.g.:
		// ({1}=9) No, that's the intercept.
		// meaning that if the first query is equal to 9, condition is met
		if (condition.search(/\((.*?)\)\s*(.*)/) > -1) {
			var test = RegExp.$1;
			var s = RegExp.$2;
			
			// prepare for eval: first convert "=" to "==" (but allow == too)
			test = test.replace(/=/g, "==");
			test = test.replace(/====/g, "==");
			
			// now convert {1} to this.queries[0].user_answer;
			while (test.search(/\{(\d+)\}/) > -1) {
				var i = RegExp.$1 * 1 - 1;
				test = test.replace(/\{(\d+)\}/, "this.queries[" + i + "].user_answer");
			}
			
			// and test
			
			
		} else {
			safe_log("error with feedback_conditional: " + condition);
			return "";
		}
	},
	
	init: function(atts) {
		for (var j in atts) {
			this[j] = atts[j];
		}
		this.queries = new Array();
		this.tries = 0;
		this.gave_up = false;
		
		// extract question metadata
		this.md = new Metadata({lowercase_keys:true});
		
		// define any md items that need to be arrays
		this.md.feedback_conditional = [];
		this.md.next_step_conditional = [];
		this.md.model_update_conditional = [];
		
		this.extract_metadata();
	}
});

function ______Activity() {}		// comment so that BBEdit's function menu works better
// PW: Define Activity as a class, so that it can be extended 
// by varieties of the standard player. The player then instantiates an instance
// of Activity on load, after any extensions have been added
var Activity = Class.extend({
	// define a variable to refer to "this" (the class instance) within other contexts -- 
	// e.g. jquery "each" constructs.  Also define a variable to refer to the player that instantiates this
	activity: null,
	player: null,
	
	question_sequences: [],
	question_pools: [],
	questions: [],
	queries: [],
	question_being_initialized: null,		// this is used during initialization
	
	total_points_possible: 0,
	total_points_earned: 0,
	answered_all_queries: false,
	grade_percent: 0,

	feedbackTitle: "Feedback",
	
	query_responses_separator: "+++",
	query_responses_grade_separator: "^^^",
	
	question_submit_button_label: "Submit",
	
	xxtk: "websterfw",
	
	// this defines the label that will be sent in to ARGA for questions that have multiple parts
	mixed_question_type_label: "Mixed",

	encrypt: function(_string) {var k = +!!-~+!+!"", e = -~!+~~"", y = -~-~+!!~+''; var _return = [];for (var i=0;i<_string.length;i++) _return.push((-~_string.charCodeAt(i)*k*e*y/e).toString(16).toUpperCase());return _return.join().replace(/,/g,"");},
	
	decrypt: function(_string) {var k = +!!-~+!+!"", e = -~!+~~"", y = -~-~+!!~+''; var _return = "";for (var i=0;i<_string.length/3;i++) _return+=String.fromCharCode(~-(parseInt(_string.substring(i*y,i*y+y), 16)*e/k/e/y));return _return;},
	
	// functions to encode and decode special characters for ARGA submission, if necessary
	encode_for_ARGA: function(s) {
		// this function converts unicode characters to numeric entities, e.g. &#160;
		return Encoder.numEncode(s);
	},
	
	decode_for_ARGA: function(s) {
		return Encoder.htmlDecode(s);
	},
	
	instructor_question_controls: function(q, style) {
		// PW 5/2/2012: let's take these out for now.
		return "";
		
		// students can't see these
		if (player.activity.is_instructor() == false) {
			return "";
		}
		
		if (style == null) {
			style = "";
		}
		
		var html = "<div class='question_instructor_controls' style='" + style + "'>"
			+ "<button class='standard_button student_responses_button' onclick='player.activity.show_query_responses(" + q.index + ")'>Show Student<br />Responses</button>"
			+ "</div>"
		
		return html;
	},
	
	build_query: function(q_data, jq) {
		var a = player.activity;	// this fn gets called within the scope of a jquery each, so can't refer to "this"

		// trim leading and trailing white space
		q_data = jQuery.trim(q_data);
		
		// the first two letters of q_data must be the type
		var q_type = q_data.substr(0, 2);

		// multiple choice
		if (q_type == 'MC') {
			return (a.queries[a.queries.length] = new MC_Query(q_data, a.queries.length, jq));
		
		// fill-in
		} else if (q_type == 'FB') {
			return (a.queries[a.queries.length] = new FB_Query(q_data, a.queries.length, jq));

		// drop-down
		} else if (q_type == 'DD') {
			return (a.queries[a.queries.length] = new DD_Query(q_data, a.queries.length, jq));

		// checkbox
		} else if (q_type == 'CB') {
			return (a.queries[a.queries.length] = new CB_Query(q_data, a.queries.length, jq));

		// essay
		} else if (q_type == 'EQ' || q_type == 'ES') {
			return (a.queries[a.queries.length] = new Essay_Query(q_data, a.queries.length, jq));

		// matching
		} else if (q_type == 'MA') {
			return (a.queries[a.queries.length] = new MA_Query(q_data, a.queries.length, jq));

		// imagemap
		} else if (q_type == 'IM') {
			// the imagemap query type in particular needs access to the jquery object for the query.
			return (a.queries[a.queries.length] = new Imagemap_Query(q_data, a.queries.length, jq));

		// hidden
		} else if (q_type == 'HQ') {
			return (a.queries[a.queries.length] = new Hidden_Query(q_data, a.queries.length, jq));

		// add more as we develop them...
		} else {
			safe_log("Invalid question type: " + q_type);
			return null;
		}
	},

	// This fn is called onload for each query element
	add_query: function(index, element) {
		var a = player.activity;	// this fn gets called within the scope of a jquery each, so can't refer to "this"
		var jq = $(element);
		
		// build the query
		var text = jq.html();
		if (jq.attr("data-encrypted") == "true") {
			text = xxt.d(text, player.activity.xxtk);
			text = player.variables.replace_values(text, "plain");
		}
		var q = a.build_query(text, jq);
		
		if (q == null) {
			safe_log("Bad call to add_query: " + text);
			return;
		}
		
		// add the query to the current question
		a.question_being_initialized.queries.push(q);
		
		// and add a reference to the current question to the query
		q.parent_question = a.question_being_initialized;
		
		// write the query
		jq.html(q.getHTML());
		
		// if the query has a postInit function, call it
		// (this might, e.g., add event handlers)
		if (q.postInit != null) {
			q.postInit();
		}
		
		// convert links (we have to do it here, after the html has been decrypted)
		player.xrefs.create_links(jq);
		
		// unless this is the page queries question, show the query;
		// otherwise leave it hidden and add an attribute so we can see it
		if (!a.is_page_queries_question(a.question_being_initialized)) {
			jq.show();
		} else {
			jq.attr("data-page_query", "true");
		}
		
		// mark the query as processed
		jq.attr("data-processed", "true");
	},
	
	// atts to be specified must at least include:
	//   number
	//   title
	new_question: function(i, atts) {
		var a = player.activity;	// this fn gets called within the scope of a jquery each, so can't refer to "this"
		atts.index = i;
		var q = a.questions[i] = new Question(atts);
		return q;
	},
	
	// define the following two functions here so that they can be overridden
	get_question_number: function(q) {
		if (q.number != "" && q.number != null) {
			return q.number;
		} else {
			return q.index;		// remember that question 0 is reserved for page queries
		}
	},
	
	get_query_number: function(question, query_index) {
		var n = this.get_question_number(question);
		// if the question has more than one query, add a sub-index
		if (question.queries.length > 1) {
			n += String.fromCharCode(97 + query_index);	// 97 is "a"
		}
		return n;
	},
	
	is_page_queries_question: function(q) {
		return q.index == 0;
	},
	
	// return true if the user has student-level rights, false otherwise
	// if ARGA is not running, we assume student-level rights
	is_student: function() {
		if (!player.ARGA_running || Get_ARGA_Data('user_rights') != '3_instructor') {
			return true;
		} else {
			return false;
		}
	},
	
	// return true if we know the user has instructor-level rights, false otherwise
	// note that this is not exactly a mirror of is_student: if ARGA is not running,
	// both is_student *and* is_instructor will return true.  We do this to make
	// demoing activities more effective.  But it means we must make sure, if we're
	// using these functions, that if a student is viewing an activity
	// and ARGA is not running, we can't show them anything sensitive based on
	// is_instructor returning true.
	is_instructor: function() {
		if (!player.ARGA_running || Get_ARGA_Data('user_rights') == '3_instructor') {
			return true;
		} else {
			return false;
		}
	},
	
	ARGA_initialization_alert: function() {
		// This overrides the standard ARGA initialization message, which doesn't
		// tell the user he/she can resubmit (or tell him his grade)
		var grade = Get_ARGA_Grade();
		var due_date_passed = (Get_ARGA_Data("due_date_has_passed") == "1");
		var msg = "";
		var buttons;
		
		due_date_passed = false;
		
		if (grade != "" && grade != null && grade >= 0) {
			// if resubmissions are allowed...
			if (player.md.allow_resubmission == "true") {
				// if due date has not passed, give the student the option of resubmitting or reviewing
				if (!due_date_passed) {
					msg = "<p>You have completed this activity, and your grade (" + grade + "%) has been submitted. Would you like to:</p><ul>"
						+ "<li><b>Keep your current grade</b> and review your previous answers</li>"
						+ "<li>Or reset your submission and <b>try the activity again</b>?</li>"
						+ "</ul>"
						;
					buttons = [ {text:"Keep current grade", click: player.activity.ARGA_initialization_final}
							, {text: "Try Activity Again", click: function() {player.activity.ARGA_initialization_final("reset")}}
							];
						
				} else {
					msg = "<p>You have completed this activity, and your grade (" + grade + "%) has been submitted. Since the due date for the activity has now passed, you cannot re-submit answers to the activity questions.</p>"
					buttons = [ {text:"OK", click: player.activity.ARGA_initialization_final} ];
				}
				
			// resubmissions are not allowed
			} else {
				msg = "<p>You have completed this activity, and your grade (" + grade + "%) has been submitted.</p>"
					;
				buttons = [ {text:"OK", click: player.activity.ARGA_initialization_final} ];
			}
		
		// grade has not been submitted
		} else {
			// if due date has passed, tell the user "tough luck". Otherwise show nothing.
			if (due_date_passed) {
				msg = "<p>The due date for this activity has passed.  You can still review the activity, but no answers will be submitted and no grade will be recorded.</p>"
					;
				buttons = [ {text:"OK", click: player.activity.ARGA_initialization_final} ];
			}
		}
		
		// if we need a message, show it in a jquery UI dialog
		if (msg != "") {
			msg = "<div id='arga_init_dialog'>" + msg + "</div>";
			$("body").append(msg);
			$("#arga_init_dialog").dialog({title:"Please Note", width:450, modal:true, buttons: buttons});
		} else {
			player.activity.ARGA_initialization_final();
		}
	},
	
	ARGA_initialization_final: function(decision) {
		// close dialog if open
		$("#arga_init_dialog").dialog('close');

		// if user chose to reset the activity, reset all submitted answers and grade
		if (decision == "reset") {
			// PW: ARGA should really provide a function for resetting all data; for now I'll hack it
			ARGA_API.data = new Array();
			Set_ARGA_Grade(-1);
			player.user_has_received_completion_alert = false;
			Save_ARGA_Data({"show_progress":false});
			
			// start on section 0
			player.show_section(0);
		
		// else if user is here for the first time...
		} else if (player.ARGA_submission_initialized == false) {
			// initialize the questions
			player.activity.ARGA_Initialize_Questions();
			
			// and show the first questions
			player.show_section(0);
		
		// otherwise normal re-initialization
		} else {
			// if md.restore_previous_submissions is "true" (this is the default value), 
			// restore all saved answers
			if (player.md.restore_previous_submissions == "true") {
				player.activity.restore_saved_answers();
			}
			
			// grade the activity
			player.activity.grade_activity();
			
			// set user_has_received_completion_alert to true
			// if the user has already completed the activity
			if (Get_ARGA_Data("complete") == "yes") {
				player.user_has_received_completion_alert = true;
			}
			
			// restore to previously-viewed section if appropriate
			if (player.md.restore_last_viewed_section == "true") {
				player.restore_section();

			// otherwise show section 0
			} else {
				player.show_section(0);
			}
		}
	},
	
	// establish the "framework" for the activity's questions
	ARGA_Initialize_Questions: function() {
		for (var j = 0; j < this.questions.length; ++j) {
			var question = this.questions[j];
			
			// if md.question_report_text is set, we will submit the question as a whole, rather than as individual queries
			var query_correct_answers = "";
	
			// for each query in the question...
			for (var i = 0; i < question.queries.length; ++i) {
				var query = question.queries[i];
				
				// establish a question number to use
				var query_number = this.get_query_number(question, i);
				
				// get a query weight
				var query_weight = question.get_weight();
				// if the question has more than one query, divide weight accordingly
				if (question.queries.length > 1) {
					query_weight = Math.round(query_weight / question.queries.length);
				}
	
				// initialize the ARGA response, unless we're saving one response for the whole question
				if (!question.md_set("question_report_text")) {
					Set_ARGA_Question_Response({
						questionNum:'' + query_number,
						questionType:query.getQueryTypeForARGA(),
						questionText:this.encode_for_ARGA(query.getQueryTextForARGA()),
						correctAnswer:this.encode_for_ARGA(query.getCorrectAnswerForARGA()),
						learnerResponse:'',
						questionGrade:0,
						questionWeight:query_weight
						});
				
				// otherwise compose query roll-ups
				} else {
					if (query_correct_answers != "") {
						query_correct_answers += " / ";
					}
					query_correct_answers += query.getCorrectAnswerForARGA();
				}
			}
			
			// if we're initializing one response for the whole question, do so here
			if (question.md_set("question_report_text")) {
				var number = this.get_question_number(question);
				var type = question.md_set("question_type") ? question.md.question_type : this.mixed_question_type_label;
				var text = question.md.question_report_text;	// we wouldn't get to here if this wasn't set
	
				Set_ARGA_Question_Response({
					questionNum:'' + number,
					questionType: type,
					questionText:this.encode_for_ARGA(text),
					correctAnswer:this.encode_for_ARGA(query_correct_answers),
					learnerResponse:'',
					questionGrade:0,
					questionWeight:question.get_weight()
					});
			}
		}
	},

	ARGA_set_query_response: function(q, query_number, query_weight) {
		// return if ARGA isn't running
		if (!player.ARGA_running) return;
		
		// set arga response
		// note that we send the original grade in questionData so we can get it back when the user returns
		Set_ARGA_Question_Response({
			questionNum:'' + query_number,
			questionType:q.getQueryTypeForARGA(),
			questionText:this.encode_for_ARGA(q.getQueryTextForARGA()),
			correctAnswer:this.encode_for_ARGA(q.getCorrectAnswerForARGA()),
			learnerResponse:this.encode_for_ARGA(q.getUserAnswerForARGA()),
			questionGrade:q.getGradeForARGA(),
			questionWeight:query_weight,
			questionData:q.getOriginalGrade()
			});
	},
	
	ARGA_set_question_response: function(question, correct_answer, learner_response, grade, question_data) {
		// return if ARGA isn't running
		if (!player.ARGA_running) return;

		var number, type, text, weight;
		
		number = this.get_question_number(question);
		type = question.md_set("question_type") ? question.md.question_type : this.mixed_question_type_label;
		text = question.md.question_report_text;	// we wouldn't get to here if this wasn't set
		weight = question.get_weight();
		
		// set arga response
		Set_ARGA_Question_Response({
			questionNum:'' + number,
			questionType: type,
			questionText:this.encode_for_ARGA(text),
			correctAnswer:this.encode_for_ARGA(correct_answer),
			learnerResponse:this.encode_for_ARGA(learner_response),
			questionGrade:grade,
			questionWeight:weight,
			questionData:question_data
			});
	},
	
	ARGA_submit_data: function(show_progress) {
		if (show_progress == null) {
			show_progress = true;
		}
		Save_ARGA_Data({"show_progress":show_progress});
	},

	// Grade all queries, from all sections. 
	// This updates properties of the activity object (total_points_possible, 
	// answered_all_queries, etc.), which can be checked at any time.
	// So it should be called on load, after previously-entered query responses have been
	// restored, then after every question submission.
	grade_activity: function() {
		this.answered_all_queries = true;
		this.total_points_possible = 0;
		this.total_points_earned = 0;
		
		for (var x = 0; x < this.queries.length; x++) {
			var q = this.queries[x];
			
			// see if the user answered at all
			if (!q.userHasAnswered()) {
				this.answered_all_queries = false;
			}
			
			// add up points and score
			this.total_points_possible += q.getPointsPossible();
			this.total_points_earned += q.getPointsAwarded();
		}
		
		// if there aren't any questions, user gets 100% just for hitting the activity
		if (this.total_points_possible == 0) {
			this.grade_percent = 100;
		// else calculate grade percent, rounded to nearest whole percentage
		} else {
			this.grade_percent = Math.round((this.total_points_earned / this.total_points_possible) * 100);
		}
		
		// If all queries have been answered, do ARGA stuff
		if (player.ARGA_running) {
			if (this.answered_all_queries) {
				// set "complete" appropriately
				Set_ARGA_Data('complete', 'yes');
				// and save the grade
				Set_ARGA_Grade(this.grade_percent);
	
				// we don't want a partial grade set on the server until the student is done.
			
			// otherwise
			} else {
				// make sure "complete" is set to "no"
				Set_ARGA_Data('complete', 'no');
			}
	
			// note that we don't commit to the server in this function;
			// that has to be done separately.
		}
	},
	
	// This function goes through all questions (from all sections)
	// and restores answers from previous sessions that are retrieved via ARGA.
	// The function needs to be kept "in synch" with submit_question, so that everything
	// done in submit_question gets done here.
	restore_saved_answers: function() {
		// skip page queries (questions[0])
		for (var i = 1; i < this.questions.length; ++i) {
			var question = this.questions[i];

			// prepare for question_report_text questions
			var query_responses;
			if (question.md_set("question_report_text")) {
				query_responses = "" + Get_ARGA_QuestionData(this.get_question_number(question))
				query_responses = query_responses.split(this.query_responses_separator);
			}

			var restored_all_answers = true;			
			var all_answers_correct = true;
			for (var j = 0; j < question.queries.length; ++j) {
				var query = question.queries[j];
				
				var saved_answer, saved_grade;
				
				// get saved answer and grade out of the questionData for question_report_text questions
				if (question.md_set("question_report_text")) {
					if (query_responses[j] != null) {
						var arr = query_responses[j].split(this.query_responses_grade_separator);
						saved_answer = arr[0];
						saved_grade = arr[1];
					} else {
						saved_grade = saved_answer = "";
					}
					
				// or out of learnerResponse / questionData for single-query questions
				} else {
					var ARGA_question_number = this.get_query_number(question, j);
					saved_answer = Get_ARGA_LearnerResponse(ARGA_question_number);
					// we stored the original grade in questionData
					saved_grade = Get_ARGA_QuestionData(ARGA_question_number)
				}
				
				// if we found a grade...
				if (saved_grade !== "" && saved_grade >= 0) {
					// restore the answer
					query.restoreAnswerFromARGA(saved_answer);
					query.setGrade(saved_grade);
					
					// then re-render the query in review mode
					query.jq.html(query.getHTML("review"));
					
					if (query.isCorrect() == false) {
						all_answers_correct = false;
					}
					
				} else {
					restored_all_answers = false;
				}
			}
			
			if (restored_all_answers) {
				// update the submit div for the question
				this.update_question_action_div(i);

				// Show appropriate feedback. If the question responses were submitted, 
				// the student must have finished the question, so we don't have to worry
				// about hints.
				this.show_question_feedback(question, all_answers_correct, false);
				
				// if the item is in a sequence, show the next question
				this.show_next_question(question);
				
				// NEED TO CHECK TO MAKE SURE THIS IS WORKING PROPERLY
				// If the question is in a sequence and the sequence is complete, call show_closing_material
				var qs = question.question_sequence;
				if (qs != null && qs.sequence_complete == "partial") {
					this.show_closing_material(qs.index);
				}

				// update section status
				player.update_section_status();
			}
		}
	},
	
	add_question_sequence: function(index, element) {
		var a = player.activity;	// this fn gets called within the scope of a jquery each, so we can't refer to "this"

		var index = a.question_sequences.length;
		var qs = a.question_sequences[index] = new Object();
		var jq = $(element);
		jq.attr("question_sequence_index", index);
		qs.index = index;
		qs.jq = jq;
		qs.inner_jq = jq.find("[data-type=box_inner]").first();
		qs.questions = new Array();
		qs.sequence_complete = false;
		
		// note whether this is a "one-at-a-time" sequence
		qs.one_at_a_time = (jq.attr("data-block_type").search("one_at_a_time") > -1);
		
		// if it *is* a one-at-a-time sequence, then ...
		if (qs.one_at_a_time === true) {
			// anything below the questions is considered "closing material". Wrap this stuff in a div and hide it
			var question_found = false;
			qs.inner_jq.children().each(function(index, element) {
				var cjq = $(element);
				if (cjq.attr("data-type") == "question") {
					question_found = true;
				} else if (question_found == true) {
					if (jq.closing_material == null) {
						var html = "<div class='question_sequence_closing_material'></div>";
						qs.inner_jq.append(html);
						qs.closing_material = jq.find(".question_sequence_closing_material").first();
					}
					qs.closing_material.append(cjq.detach());
				}
			});
			
			// also show a navigator for the question sequence
			var html = "<div class='question_sequence_navigator'>"
				+ "Question "
				+ "<span id='question_sequence_index_" + qs.index + "'>1</span>"
				+ " of "
				+ "<span id='question_sequence_max_index_" + qs.index + "'>?</span>"
				+ "</div>"
				;
			qs.inner_jq.prepend(html);
		}
	},
	
	// define the code that generates the question submit button as a function so it can be overridden
	// (see env_sci_study_guide.js, for example)
	question_submit_button: function(q) {
		// define question_submit_button_label as a variable so it can be overridden
		var button_html = "<input class='standard_button question_submit_button' type='button' id='question_submit_button_" + q.index + "' value='" + player.activity.question_submit_button_label + "' />";
		
		return button_html;
	},
	
	add_question: function(index, element) {
		var a = player.activity;	// this fn gets called within the scope of a jquery each, so we can't refer to "this"
		
		var jq = $(element);
		
		// see if we're in a question_pool or question_sequence block
		var qs_parent = jq.parents("[data-block_type=question_sequence], [data-block_type=question_sequence_one_at_a_time]");

		var q = a.questions[a.questions.length] = new Question({
			"index": a.questions.length
			, "number": jQuery.trim($("[data-type='number']", jq).html())
			, "title": jQuery.trim($("[data-type='title']", jq).html())
			, "jq": jq
			, "points_possible": 0
		});

		// store the question index in the DOM too
		jq.attr("data-question_index", q.index);
				
		// get question queries		
		a.question_being_initialized = q;
		$("[data-type='query']", jq).each(a.add_query);

		// if the question has queries, add bling to the bottom
		if (q.queries.length > 0) {
			var html = "<div class='question_action_div' id='question_action_div_" + q.index + "'>";
			
			var submit_handler;
			// add a submit button if we're supposed to have one
			// (image map and matching questions, which should contain one and only one query, don't have submit buttons)
			if (q.queries[0].hasSubmitButton === true) {
				// "answer_one" pool mode (yet to be fully implemented...)
				if (q.pool_mode == 'answer_one') {
					html += "<input class='standard_button question_submit_button' type='button' id='question_submit_button_" + q.index + "' value='Answer This Query' />";
					submit_handler = player.activity.Show_Submit;
					
				} else {
					html += a.question_submit_button(q);
					submit_handler = player.activity.submit_question;
				}
			}
			
			// add a "give up" button if we're supposed to have one
			// (image map questions, which should contain one and only one query, should have this button)
			if (q.queries[0].hasGiveUpButton === true) {
				html += "<input class='standard_button question_submit_button' type='button' id='question_submit_button_" + q.index + "' value='Give Up' />";
					submit_handler = player.activity.give_up_question;
			}
			
			html += "</div>";
	
			jq.append(html);
			
			// bind the submit_handler function to the button, passing in the question_index
			$("#question_submit_button_" + q.index).click({question_index:q.index}, submit_handler);
			
			// float instructor controls to right of action button
			jq.prepend(a.instructor_question_controls(q));
			
			// also, determine question points and weight at this time
			for (var i = 0; i < q.queries.length; ++i) {
				q.points_possible += q.queries[i].getPointsPossible();
			}
			// round to two decimal places, in case there are decimals
			q.points_possible = Math.round(q.points_possible * 100) / 100;
		}
		
		// now that the question has been created, deal with sequences and pools
		if (qs_parent.length > 0) {
			// get sequence index and item
			var qs_index = qs_parent.attr("question_sequence_index") * 1;
			var qs = a.question_sequences[qs_index];
			
			// place in sequence
			var sequence_num = qs.questions.length;
			qs.questions[sequence_num] = q;
			
			// place reference to sequence in question
			q.question_sequence = qs;
			q.question_sequence_index = sequence_num;
			
			// if this isn't #1, hide the question
			if (sequence_num > 0) {
				jq.hide();
			}
			
			// update the sequence navigator if it's there
			$("#question_sequence_max_index_" + qs.index).html(sequence_num+1);
		}
	},
	
	add_page_queries: function() {
		var a = player.activity;	// this fn gets called within the scope of a jquery each, so can't refer to "this"
		var q = a.new_question(0, {
			  "number": "P"
			, "title": "Page Queries"
			});
		
		a.question_being_initialized = q;
		$("[data-type='query'][data-processed!='true']").each(a.add_query);
	},
		
	show_query_responses: function(query_index) {
		if (player.ARGA_running) {
			Open_ARGA_Report();
		} else {
			Standard_Dialog.alert("This will show the instructor a report of her students' responses on this question.");
		}
	},
	
	update_question_action_div: function(question_index) {
		var question = this.questions[question_index];

		// calculate points_awarded and points_possible
		var points_awarded = 0;
		var points_possible = 0;
		var points_provisional = false;
		for (var i = 0; i < question.queries.length; ++i) {
			var query = question.queries[i];
			points_awarded += query.getPointsAwarded();
			points_possible += query.getPointsPossible();
			if (query.pointsAreProvisional() == true) {
				points_provisional = true;
			}
		}

		// round to at most two decimal places
		points_awarded = Math.round(points_awarded * 100) / 100;
		points_possible = Math.round(points_possible * 100) / 100;
		
		// hide submit button (and any other similar buttons that might be added by subtypes), but show points earned
		var jq = $("#question_action_div_" + question.index);
		jq.find(".question_submit_button").hide();
		var points_html = "<div class='points_awarded_div'>Points awarded: " + points_awarded + " out of " + points_possible;

		if (points_provisional) {
			points_html += " (<a href='javascript:player.activity.explain_provisional()'>provisional</a>)";
		}
		points_html += "</div>";

		var jq = $("#question_action_div_" + question.index);
		jq.find(".points_awarded_div").remove();
		if (jq.find(".question_feedback").length > 0) {
			jq.find(".question_feedback").after(points_html);
		} else {
			jq.prepend(points_html);
		}
	},
	
	explain_provisional: function() {
		Standard_Dialog.alert("This grade may be changed by your instructor after reviewing your answer.");
	},

	show_next_question: function(question) {
		// if the item is in a sequence, show the next question
		if (question.question_sequence != null) {
			var qs = question.question_sequence;
			var next_qs_index = question.question_sequence_index + 1;
			var next_question = qs.questions[next_qs_index];
			
			// what we do next is a little different
			// depending on whether this is a one-at-a-time sequence
			if (qs.one_at_a_time === false) {
				// for *not* one at a time, just slide down the next item
				if (next_question != null) {
					next_question.jq.slideDown("fast", function() {
						// when we're done showing the new question, scroll down to it
						$(window).scrollTo($(this));
					});
				// if there is no next_question, sequence is complete.
				} else {
					qs.sequence_complete = "complete";
				}
				
			// for one-at-a-time, ...
			} else {
				// if we have a next question, change the question submit button 
				// to a button for showing the next item
				if (next_question != null) {
					$("#question_submit_button_" + question.index).val("Next Question")
						.unbind('click') 
						.click({"question":question, "next_question":next_question}, function(e) {
							// on click of this button, hide the current question and fade in the next one
							e.data.question.jq.hide();
							// use the below animation instead of fadeIn because it doesn't completely hide the item first
							// and thus doesn't cause the window to scroll to the top.
							e.data.next_question.jq.show()
								.css({opacity:0.25})
								.animate({opacity:1.0}, 500);
							
							$.scroll_item_onto_screen(e.data.next_question.jq, {duration:10, additional_padding:50});

							// update the sequence navigator
							var index = e.data.next_question.question_sequence_index + 1;
							var qs = e.data.question.question_sequence.index;
							$("#question_sequence_index_" + qs).html(index);
						})
						.show();
					
					// make sure the button is visible
					$.scroll_item_onto_screen($("#question_submit_button_" + question.index), {duration:10, additional_padding:50} );
				
				// else we're done with the sequence, so if sequence_complete is false...
				} else if (qs.sequence_complete === false) {
					var points_possible = 0;
					var points_awarded = 0;
					for (var i = 0; i < qs.questions.length; ++i) {
						for (var j = 0; j < qs.questions[i].queries.length; ++j) {
							var query = qs.questions[i].queries[j];
							points_awarded += query.getPointsAwarded();
							points_possible += query.getPointsPossible();
						}
					}

					// round to at most two decimal places
					points_awarded = Math.round(points_awarded * 100) / 100;
					points_possible = Math.round(points_possible * 100) / 100;
			
					var html = "<div class='question_sequence_review'>"
						+ "Total points awarded for this question sequence: <b>" + points_awarded + " out of " + points_possible + "</b> &nbsp; "
						+ "</div>"
						;
					
					safe_log(qs.closing_material);
					
					if (qs.closing_material != null) {
						// if student is reviewing (i.e. came back to the activity after completing in an earlier
						// session), the show_closing_material function will be called by restore_saved_answers
						var show_summary_text = "Show Summary"
						html += "<div class='question_sequence_review_button'><input class='standard_button' type='button' id='closing_material_button_" + qs.index + "' value='" + show_summary_text + "' onclick='player.activity.show_closing_material(" + qs.index + ")' /></div>"

						// if there's closing material we're *kind of* done with the sequence now;
						// set to "partial" so we won't add this html again
						qs.sequence_complete = "partial";
					
					// if there's no closing material, we're completely through with the sequence now.
					} else {
						qs.sequence_complete = "complete";
						// in this case we need to show the question_sequence_review right away
						html = html.replace(/class='question_sequence_review'/, "class='question_sequence_review' style='display:none'");
					}
					
					qs.inner_jq.append(html);
					
					$("#closing_material_button_" + qs.index).button();
					
				}
			}
		}
	},
	
	show_closing_material: function(qs_index) {
		var qs = player.activity.question_sequences[qs_index];
		qs.jq.find("[data-type=question]").hide();
		qs.jq.find(".question_sequence_navigator").hide();
		$("#closing_material_button_" + qs.index).hide();
		qs.closing_material.show()
			.css({opacity:0.25})
			.animate({opacity:1.0}, 500);
		qs.jq.find(".question_sequence_review").show()
			.css({opacity:0.25})
			.animate({opacity:1.0}, 500);
		qs.sequence_complete = "complete";
		player.update_section_status();
		player.update_navigation();
	},

	show_question_feedback: function(question, is_correct, try_again) {
		// remove prior feedback if there
		$("#question_feedback_" + question.index).remove();
		
		// if we don't have any feedback at all, return
		if (question.md.feedback == null && question.md.feedback_correct == null && question.md.feedback_incorrect == null && question.md.feedback_hint == null) {
			return;
		}

		var html = "<div class='question_feedback' id='question_feedback_" + question.index + "'>"
				+ "<div class='question_feedback_head'>" + this.feedbackTitle + "</div>";
		
		// include general feedback if there
		if (question.md.feedback != null) {
			html += "<div class='question_feedback_part'>" + question.md.feedback + "</div>";
		}
		
		// include correct feedback if there and the answer is correct
		if (is_correct && question.md.feedback_correct != null) {
			html += "<div class='question_feedback_part'>" + question.md.feedback_correct + "</div>";
		}

		// include incorrect or hint feedback if there and the answer is incorrect
		if (!is_correct) {
			var found_feedback_string = false;
			// if user gets to try again...
			if (try_again) {
				// check for feedback_conditional's
				if (question.md.feedback_conditional.length > 0) {
					for (var i in question.md.feedback_conditional) {
						var fbc = question.check_conditional(question.md.feedback_conditional[i]);
						if (fbc != "") {
							html += "<div class='question_feedback_part'>" + fbc + "</div>";
							found_feedback_string = true;
							break;
						}
					}
				}
				
				// if we didn't find a feedback string to use above, check for feedback_hint
				if (!found_feedback_string && question.md.feedback_hint != null) {
					html += "<div class='question_feedback_part'>" + question.md.feedback_hint + "</div>";
					found_feedback_string = true;
				}
			}
			
			// if we didn't find a feedback string to use above, check for feedback_incorrect
			if (!found_feedback_string && question.md.feedback_incorrect != null) {
				html += "<div class='question_feedback_part'>" + question.md.feedback_incorrect + "</div>";
			}
		}
		
		// close question_feedback div
		html += "</div>";
		
		// append the div, then fade it in
		$("#question_action_div_" + question.index).prepend(html);
		$("#question_feedback_" + question.index).fadeIn("fast", function() {
			// What I'd like to do here is check to make sure the feedback is all showing on the screen,
			// and scroll if necessary so that the feedback is all visible. But just doing "scrollTo"
			// isn't working properly in all situations.
			// $(window).scrollTo($(this), 0);
		});
	},
	
	give_up_question: function(question_index) {
		// the arg may be a number or an event object; in the latter case...
		if (typeof question_index == "object") {
			// extract the question_index from the object
			question_index = question_index.data.question_index;
		}
		var question = player.activity.questions[question_index];
		// give up on each query
		for (var i = 0; i < question.queries.length; ++i) {
			var query = question.queries[i];
			// the give_up function can return false if it doesn't want to give up
			// (usually because the user was prompted and said he didn't really want to give up)
			if (query.give_up() === false) {
				return;
			}
		}
		
		// mark the question as being given up on
		question.gave_up = true;
		
		// then call submit_question
		player.activity.submit_question(question_index);
	},
	
	submit_question: function(question_index) { 
		// the arg may be a number or an event object; in the latter case...
		if (typeof question_index == "object") {
			// extract the question_index from the object
			question_index = question_index.data.question_index;
		}
		
		var t = player.activity;
		
		var question = t.questions[question_index];
		
		var all_answers_correct = true;
		// for each query in the question...
		for (var i = 0; i < question.queries.length; ++i) {
			var query = question.queries[i];
			
			// evaluate the answer. If evaluateAnswer returns false, the answer isn't submittable at this time -- 
			// most likely because it's a free-response answer that needs to be evaluated via MAVE.
			var answer_submittable = query.evaluateAnswer(question_index);
			if (answer_submittable === false) {
				// as soon as we get an unsubmittable answer, we return. submit_question
				// will be called again, either by the callback fn of MAVE or because the student
				// resubmits. At that point we'll catch any additional free-response answers that need
				// checking, or we'll finish this loop here and move on.
				return;
			}
			all_answers_correct = all_answers_correct && query.isCorrect();
		}
		
		// if we made it to here, we're at least going to show which items are correct and incorrect
		// we might overwrite with review mode below, but that's OK
		for (var i = 0; i < question.queries.length; ++i) {
			var query = question.queries[i];
			query.jq.html(query.getHTML("review_correct_incorrect"));
		}
		
		// update question tries
		++question.tries;
				
		// if answer is incorrect, and max_tries is set, and # of tries is less than max_tries
		// (and the user didn't just give up)
		if ((!all_answers_correct && question.md.max_tries != null && question.tries < question.md.max_tries) && question.gave_up != true) {
			// tell user he can try again
			t.show_question_feedback(question, false, true);
			return;
		} else {
			t.show_question_feedback(question, all_answers_correct, false);
		}
		
		// if we make it to here we need to set ARGA info for the question, and show queries in review mode
		// if md.question_report_text is set, we submit the question as a whole, rather than as individual queries
		var query_correct_answers = "";
		var query_responses = "";
		var query_responses_for_questionData = "";
		var query_grade_sum = 0;
		// for each query in the question...
		for (var i = 0; i < question.queries.length; ++i) {
			var query = question.queries[i];
			
			// establish a question number to use
			var query_number = t.get_query_number(question, i);
			
			// get a query weight
			var query_weight = question.get_weight();
			// if the question has more than one query, divide weight accordingly
			if (question.queries.length > 1) {
				query_weight = Math.round(query_weight / question.queries.length);
			}

			// if credit_after_max_tries is set, give at least that credit now, as long as the student tried
			if (question.md.credit_after_max_tries != null) {
				var query_grade = query.getGradeForARGA();
				if (query_grade >= 0 && query_grade < question.md.credit_after_max_tries) {
					query.overrideGrade(question.md.credit_after_max_tries * 1);
				}
			}
			
			// set the ARGA response, unless we're saving one response for the whole question
			if (!question.md_set("question_report_text")) {
				t.ARGA_set_query_response(query, query_number, query_weight);
			
			// otherwise compose query roll-ups
			} else {
				if (query_correct_answers != "") {
					query_correct_answers += " / ";
					query_responses += " / ";
					query_responses_for_questionData += t.query_responses_separator;
				}
				query_correct_answers += query.getCorrectAnswerForARGA();
				query_responses += query.getUserAnswerForARGA();
				// see restore_saved_answers for how this is used later
				query_responses_for_questionData += query.getUserAnswerForARGA() 
					+ t.query_responses_grade_separator
					+ query.getOriginalGrade();
				query_grade_sum += query.getGradeForARGA() * 1;
			}
			
			// show in review mode, unless question metadata says not to show correct answers
			if (question.md.show_correct_answers != "false") {
				query.jq.html(query.getHTML("review"));
			}
		}
		
		// if we're saving one response for the whole question, save here
		if (question.md_set("question_report_text")) {
			var question_grade = Math.round(query_grade_sum / question.queries.length);
			t.ARGA_set_question_response(question, query_correct_answers, query_responses, question_grade, query_responses_for_questionData);
		}
		
		// grade the activity
		t.grade_activity();
		
		// then if ARGA is running, submit data; show_grade_saved_message will be called on completion.
		if (player.ARGA_running) {
			t.ARGA_submit_data();
		}
		
		// update the question_action_div
		t.update_question_action_div(question_index);
		
		// if the item is in a sequence, show the next question
		t.show_next_question(question);
		
		// update section status
		player.update_section_status();
	},
	
	process_page_queries_for_section: function(section_jq) {
		// if we have page queries in this section, add bling to the bottom of the page
		if ($("[data-page-query='true']", section_jq).length > 0) {
			var html = "<div class='question_action_div' id='question_action_div_0'>"
				// float instructor controls to right of action button
				+ this.instructor_question_controls(this.questions[0], 'float:right')
				+ "Page queries: "
				+ "<input class='page_query_submit_button' type='button' value='Show' />"
				+ "</div>"
				;
			
			// for now, this goes at the bottom of the section div
			section_jq.append(html);
			
			// bind the button to page_queries_show
			$(".page_query_submit_button", section_jq).click(player, this.page_queries_show);
		}
	},
	
	page_queries_show: function() {
		var section_jq = player.get_current_section_jq();
		
		// hide query_display items
		$("[data-type='query_display']", section_jq).hide();
		
		// then show the queries
		$("[data-type='query'][data-page_query='true']", section_jq).show();
		
		// and (for now) change the button so that it submits
		$(".page_query_submit_button", section_jq).attr("value", "Submit")
			.unbind().click(function(){player.activity.submit_question(0)});
	},
	
	show_grade_saved_message: function() {
		// if the user has answered all queries AND the user hasn't been told this already,
		// tell them now
		if (player.activity.answered_all_queries && !player.user_has_received_completion_alert) {
			setTimeout('Standard_Dialog.alert("You have completed the activity, and your grade has been submitted.");', 20);
			player.user_has_received_completion_alert = true;
		}
	},
	
	// the class init function
	init: function() {},
	
	// the "real" init function, which has to be called separately so that the object will be 
	// instantiated when it runs.
	initialize: function() {
		// reserve first question for page queries
		this.questions[0] = "";
		
		// process question_sequence and question_pool blocks
		$("[data-block_type=question_sequence], [data-block_type=question_sequence_one_at_a_time]").each(this.add_question_sequence);
		
		$("[data-type='question']").each(this.add_question);
		this.add_page_queries();

		// convert submit buttons to buttons using jquery ui
		$('.question_submit_button').button();
		$('.student_responses_button').button();
		
		// call grade_activity to set initial weights (it will get re-called
		// if we subsequently restore answers from ARGA)
		this.grade_activity();
	}

		// Remember: no comma after last item
});









function ______Player() {}		// comment so that BBEdit's function menu works better
// PW: Define Player as a class, so that it can be extended 
// by varieties of the standard player. We initialize the player
// on load, after any extensions have been added
var Player = Class.extend({
	manuscript_id: null,
	sections: [],
	videos: {},
	cuepoints: [],
	section_currently_showing: null,
	last_available_section: 0,
	ARGA_running: false,
	ARGA_submission_initialized: false,

	md: {},		// holder for metadata; see extract_metadata for default values
	
	// instances of other classes to be used
	activity: null,
	figures: null,
	xrefs: null,
	idxrefs: null,
	links: null,

	// ==========================
	// getters/setters
	get_manuscript_id: function() {
		return this.manuscript_id;
	},
	
	open_block_window: function(id) {
		var url = '/manuscript/preview/id/' + this.manuscript_id
			+ '/block/' + id
			+ '?ui=figure';
		window.open(url, 'popup', 'width=800,height=600');
	},
	
	// this should be replaced by the PX function
	jump_to_page: function(id) {
		var url = '/manuscript/preview/id/' + this.manuscript_id
			+ '/block/' + id
			// + '?ui=embed';
		
		// by replacing "pathname" instead of "location", we keep the same search string,
		// so the value of "ui" remains the same.
		window.location.pathname = url;
	},
	
	initialize_sections: function() {
		var player = this;	// define this so it's available inside the below function
		$("[data-type='section']").each(function(index, element) {
			var jq = $(element);
			
			// establish the section in the sections array; store its jq
			var s = player.sections[player.sections.length] = new Object();
			s.jq = jq;
			
			// set the section's index
			s.index = index;
			jq.attr("data-section-index", index).attr("id", "digfir_section_" + index);
			
			// extract the section's title and number
			s.number = jq.find("h2").find("[data-type=number]").html();
			s.title = jq.find("h2").find("[data-type=title]").html();
			
			// process page queries for the section
			player.activity.process_page_queries_for_section(jq);

			++player.section_count;
		});
		//window.alert("player.sections.length="+player.sections.length);
	},
	
	show_navigation: function() {
		var html = "<div id='section_navigation'>"
			+ "<a id='section_navigation_left' href='javascript:player.show_section(\"previous\")'>&laquo;</a>"
			// + "&nbsp;<a style='font-size:14px' href='javascript:player.show_toc()'>TOC</a>&nbsp;"
			+ "&nbsp;"
			+ "<a id='section_navigation_right' href='javascript:player.show_section(\"next\")'>&raquo;</a>"
			+ "</div>"
			
		$("#manuscript").prepend(html);
		$("#section_navigation").show();
	},
	
	update_navigation: function() {
		if (this.sections.length == 1) {
			$("#section_navigation").hide();
			return;
		}
		
		if (this.section_currently_showing == 0) {
			$("#section_navigation_left").css("visibility", "hidden");
		} else {
			$("#section_navigation_left").css("visibility", "visible");
		}

		if (this.section_currently_showing == this.sections.length - 1) {
			$("#section_navigation_right").css("visibility", "hidden");
		} else {
			$("#section_navigation_right").css("visibility", "visible");
		}
	}, 
	//MT: for idxref
		highlight_element: function(element_id){
		var the_element = $("#"+element_id);
		if(the_element){
			$('html, body').animate({
				scrollTop: the_element.offset().top
			},200);
			if(this.current_highlighted_element){
				this.current_highlighted_element.removeClass('xref_highlighted');
			}
			this.current_highlighted_element = the_element;
			this.current_highlighted_element.addClass('xref_highlighted');
			
			//the_element.css('border','1px solid #c00');
		}
		},
	
	show_toc: function() {
		// $("#toc").show();
	},
	
	get_current_section: function() {
		if (this.section_currently_showing != null) {
			return this.sections[this.section_currently_showing];
		} else {
			return null;
		}
	},
	
	get_current_section_jq: function() {
		if (this.section_currently_showing != null) {
			return $("[data-section-index=" + this.section_currently_showing + "]");
		} else {
			return null;
		}
	},
	
	showing_last_section: function() {
		return (this.section_currently_showing == (this.sections.length - 1));
	},

	showing_first_section: function() {
		return (this.section_currently_showing == 0);
	},
	
	// define the function that actually reveals a section
	// define this separately from show_section so we can override this
	show_section_animate: function(section_to_show, direction) {
		// hide currently showing section
		if (this.section_currently_showing != null) {
			this.get_current_section_jq().hide();
		}
		
		// get the jq for the section to show
		var jq = $("[data-section-index=" + section_to_show + "]");

		// if this is the first page, just show it -- no sliding
		if (this.section_currently_showing == null) {
			jq.show();
		} else {
			// first set the body so that it won't show a scrollbar
			$("body").css("overflow", "hidden");
			$("#manuscript").css("overflow", "hidden");
	
			var animate_item = "margin-left";
			var animate_object = { "margin-left": "0px" };
			var x = $("#manuscript").outerWidth();
			if (direction == "left") {
				direction = -1;
			} else {
				direction = 1;
			}
			
			// set the margin of scrollable_area so that it's completely outside of scrollable_area_wrapper
			// (this hides it, in addition to setting up for the animation)
			jq.css(animate_item, (direction * x) + "px").show();
	
			// and animate the margin back to 0
			jq.animate(animate_object, 500, "linear", function() {
					// when the animation is done, bring scrollbars back (if necessary)
					$("body").css("overflow","auto");
					$("#manuscript").css("overflow","visible");
				});
			// jq.fadeIn(500);
		}
		
		this.section_currently_showing = section_to_show;
	},
	
	show_section: function(section_to_show) {
		//window.alert(section_to_show);
		var direction = "right";
		if (section_to_show == "previous") {
			section_to_show = this.section_currently_showing - 1;
			direction = "left";
		} else if (section_to_show == "next") {
			section_to_show = this.section_currently_showing + 1;
		}
		
		if (section_to_show == null || isNaN(section_to_show) || section_to_show < 0 || section_to_show >= this.sections.length) {
			return;
		}
		
		// if user has to view sections in sequence and hasn't gotten up to this one, don't allow it
		if (this.md.sequenced_sections == "true" && section_to_show > this.last_available_section) {
			// but let instructors through
			if (player.activity.is_instructor()) {
				Standard_Dialog.alert("Please note: Students need to read and complete each section of the activity before moving on to the next section.  Instructors, however, can skip around between sections as they choose.");
			} else {
				Standard_Dialog.alert(this.md.section_sequence_message);
				return;
			}
		}
		
		this.show_section_animate(section_to_show, direction);
		
		// process iframes for the section, unless all were preloaded
		if (player.md.preload_all_iframes != "true") {
			this.figures.process_iframes(this.get_current_section().jq);		// iframes
		}
		
		this.update_section_status();
		this.update_navigation();
	},
	
	update_section_status: function() {
		if (this.section_currently_showing != null && this.last_available_section <= this.section_currently_showing) {
			var s = this.get_current_section();
			s.all_questions_answered = true;
			
			// if the current section has any questions, see if they've all been answered
			var qs_to_check = [];
			s.jq.find("[data-type=question]").each(function(index, element) {
				var q_index = $(element).attr("data-question_index");
				var question = player.activity.questions[q_index];
				s.all_questions_answered = s.all_questions_answered && question.is_complete();
				if (question.question_sequence != null) {
					for (var i = 0; i < qs_to_check.length; ++i) {
						if (qs_to_check[i] == question.question_sequence) break;
					}
					if (i == qs_to_check.length) {
						qs_to_check.push(question.question_sequence);
					}
				}
			});
			
			// now check question sequences to make sure they're done too
			s.all_question_sequences_completed = true;
			for (var i = 0; i < qs_to_check.length; ++i) {
				s.all_question_sequences_completed = s.all_question_sequences_completed && (qs_to_check[i].sequence_complete == "complete");
			}
			
			if (s.all_questions_answered && s.all_question_sequences_completed) {
				this.last_available_section = this.section_currently_showing + 1;
			}
		}
		
		this.fill_in_previous_query_responses();
		
		// if ARGA is initialized and we need to restore the user to his last position when he returns,
		if (this.ARGA_running && player.md.restore_last_viewed_section == "true") {
			// if we're viewing a page other than the one currently saved as LVS (last-viewed section)
			var lvs = Get_ARGA_Data("LVSX");
			if (this.section_currently_showing != null && this.section_currently_showing != lvs) {
				// store LVS/LAS to register the last-viewed/last-available page,
				// and save ARGA so it gets registered
				Set_ARGA_Data("LVSX", this.section_currently_showing);
				Set_ARGA_Data("LASX", this.last_available_section);

				this.activity.ARGA_submit_data(false);
			}
		}
	},
	
	fill_in_previous_query_responses: function() {
		// query_response_reference
		$("[data-block_type=query_response_reference]").each(function(index, element) {
			var jq = $(element);
			var query_ref = jq.attr("data-query_reference");
			// query_ref should be in format "X.Y", 
			// where X is the index (not the user-visible question number)
			// of the question and Y is the query within that question.
			var arr = query_ref.split(".");
			if (arr.length != 2 || isNaN(arr[0]*1) || isNaN(arr[1]*1)) {
				safe_log("bad query response reference: " + query_ref);
				return;
			}
			
			// look up the query response
			var question = player.activity.questions[arr[0]*1];
			if (question == null) {
				safe_log("bad query response reference (couldn't find question): " + query_ref);
				return;
			}
			
			// note that queries are indexed here from 0, but specified
			// in the XML as indexed from 1
			var query = question.queries[(arr[1]*1) - 1];
			if (query == null) {
				safe_log("bad query response reference (couldn't find query): " + query_ref);
				return;
			}
			
			// get response if there
			var resp;
			if (query.userHasAnswered()) {
				resp = query.getUserAnswerForARGA();
			} else {
				resp = "No response entered.";
			}
			
			// fill in the jq's html with the response
			jq.html(resp);
		});
	},
	
	// if we stored the last-viewed section in ARGA the standard way, restore
	restore_section: function() {
		// this should only be called if ARGA is initialized
		var lvs = Get_ARGA_Data("LVSX");
		var las = Get_ARGA_Data("LASX");
		
		// if we have a previously-stored LVS, show it now
		if (lvs != "" && las != "") {
			this.last_available_section = las * 1;
			this.show_section(lvs * 1);
		
		// otherwise show section 0
		} else {
			// first set LVS now so that we *don't* save ARGA in update_section_status --
			// there's no need to do so since nothing's happened yet
			Set_ARGA_Data("LVSX", "0");
			this.show_section(0);
		}
	},
	
	// used with extract_activity_metadata below
	required_metadata_val: function(key, default_val, force) {
		if (player.md[key] == null || force == true) {
			player.md[key] = default_val;
		}
	},
	
	// this should be called by any activity that uses an activity_config metadata block
	extract_activity_metadata: function() {
		// extract metadata from block_type=activity_config if it's there
		player.md = new Metadata({jq:$("[data-block_type=activity_config]"), lowercase_keys:true});

		// note that we use strings "false" and "true", rather than true boolean values.
		
		// whether or not sections must be completed in sequence, and warning to show if they try to go out of sequnce
		this.required_metadata_val("sequenced_sections", "false");
		this.required_metadata_val("section_sequence_message", "You must complete the sections in sequence.");
		
		// whether or not to restore students to their last-viewed section when they return
		this.required_metadata_val("restore_last_viewed_section", "true");

		// whether or not to restore student question submissions to previous values when they return
		this.required_metadata_val("restore_previous_submissions", "true");
		
		// whether or not to allow students to resubmit when they return
		this.required_metadata_val("allow_resubmission", "false");
		
		// whether or not to show debug info on variables
		this.required_metadata_val("variable_debug", "false");
		
		// note that in most cases we'll want to to keep the previous two items in sequence,
		// since if you want to allow resubmission you probably shouldn't restore previous answers
		// i.e. the two values will either be "true/false" or "false/true"

		// ARGA initialization constants
		this.required_metadata_val("ARGA_fail_silently", "true");
		this.required_metadata_val("ARGA_retrieve_class_data", "1");
		
		
		//Settings for Brightcove video player
		this.required_metadata_val("video_caption_url", "https://websterfw.com/videocaptions/");
		
		// activities can call the required_metadata_val function for additional md values, or to rewrite defaults
	},

	// ========================================
	// this is the class init function; we don't do anything here...
	init: function() {
	},
	
	// "real" initialization, called after the page loads
	// and after any extended versions of the class have been instantiated
	// by later js files
	initialize: function(id,panel){
		//console.log("player.initialize");
		this.manuscript_id = id;
		//this.initial_displayed_panel = 0;

		if(typeof panel !== 'undefined'){
			//initial_section_index = panel;
			//window.alert(this.initial_displayed_panel);
		}

		// extract metadata (this might be already done by the activity-specific
		// player, but that's OK; we'll just re-do it here, which is no problem.)
		this.extract_activity_metadata();

		// have to do variables first because that replaces the body html
		this.variables = new Variables();
		this.figures = new Figures();
		this.xrefs = new XRefs();
		this.idxrefs = new IdXRefs();
		this.links = new Links();
		this.activity = new Activity();
		this.interactions = new Interactions();
		this.tables = new Tables();
		this.glossary = new Glossary();
		
		// Prepare for activity functionality by getting ARGA data; 
		// that fn will call Initialize_ARGA_Session_Callback (see below)
		var success = false;
		if (window.Initialize_ARGA_Session != null) {
			success = Initialize_ARGA_Session({
				"fail_silently": (this.md.ARGA_fail_silently != "false"), 
				"retrieve_class_data": (this.md.ARGA_retrieve_class_data == 1 || this.md.ARGA_retrieve_class_data == "true" || this.md.ARGA_retrieve_class_data == true) ? 1 : 0,
				"cancel_initialization_alert": true
			});
		}
		if (!success) {
			this.ARGA_running = false;
			safe_log("running in non-ARGA mode");
			
			// We need to initialize the player after a timeout (mimicking what would happen
			// if ARGA was initialized and initialize2 was called on a callback) so that
			// inherited players will be called in the proper order.
			setTimeout("player.initialize2()", 1);
		} else {
			this.ARGA_running = true;
		}
	},
	
	initialize2: function() {
		// ARGA should now be initialized if it's running

		// if ARGA is running, note here whether or not *any* data has been saved for the user
		// that is, whether a submission has been initialized
		if (player.ARGA_running) {
			// we know something has been stored if "complete" is not an empty string
			if (Get_ARGA_Data("complete") != "") {
				this.ARGA_submission_initialized = true;
			}
		}
		
		// initialize activity (e.g. questions) and sections
		this.activity.initialize();
		this.initialize_sections();
		
		this.show_navigation();

		// if ARGA is running, do some things
		if (player.ARGA_running) {
			// show custom initialization alert
			// note that we do further initialization after that alert has been responded to;
			// see ARGA_initialization_final
			this.activity.ARGA_initialization_alert();
			
		// otherwise just show section 0
		} else {
			this.show_section(initial_section_index) //see top of file
			if(initial_idxref_id!=null){
				this.highlight_element(initial_idxref_id);
			}
		}
	}
	
});
videos = {};
videos.question_sequence_to_video_map = {};

// Define and establish the Player object; it'll be initialized on load (see above)
var player = new Player();

// callback for after initializing ARGA
function Initialize_ARGA_Session_Callback() {
	player.initialize2();
}

// callback for after a grade has been saved
function Save_ARGA_Data_Callback() {
	player.activity.show_grade_saved_message();
}
