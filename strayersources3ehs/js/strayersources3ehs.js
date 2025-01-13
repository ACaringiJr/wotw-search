document.addEventListener("DOMContentLoaded", function () {
  // Function to highlight proper nouns and numbers
  function highlightTextOnPage() {
    // Regex patterns for proper nouns and numbers
    const properNounRegex = /\b[A-Z][a-z]*\b/g; // Match words starting with capital letters
    const numberRegex = /\b\d+\b/g; // Match numbers

    // Function to process a text node
    function processTextNode(textNode) {
      const text = textNode.nodeValue;

      // Split text into parts
      const parts = text.split(/(\b[A-Z][a-z]*\b|\b\d+\b)/g); // Split on proper nouns and numbers
      const fragment = document.createDocumentFragment();

      let isSentenceStart = true; // Track sentence start

      parts.forEach((part) => {
        const isProperNoun = properNounRegex.test(part);
        const isNumber = numberRegex.test(part);

        // Skip highlighting for proper nouns at the start of sentences
        if (isProperNoun && isSentenceStart) {
          isSentenceStart = false; // After the first word, continue processing normally
          fragment.appendChild(document.createTextNode(part)); // Append unmodified text
          return;
        }

        // Reset sentence start after punctuation
        if (/[.!?]\s*$/.test(part)) {
          isSentenceStart = true;
        }

        if (isProperNoun) {
          const span = document.createElement("span");
          span.style.backgroundColor = "#e0b3ff";
          span.style.borderRadius = "3px";
          span.style.padding = "2px";
          span.textContent = part;
          fragment.appendChild(span);
        } else if (isNumber) {
          const span = document.createElement("span");
          span.style.backgroundColor = "#add8e6";
          span.style.borderRadius = "3px";
          span.style.padding = "2px";
          span.textContent = part;
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    }

    // Function to recursively process all child nodes
    function traverseAndHighlight(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(traverseAndHighlight);
      }
    }

    // Start processing the body of the document
    traverseAndHighlight(document.body);
  }

  // Call the function to highlight text on the current page
  highlightTextOnPage();
});


/* 
   This is the standard template you should add to your book JS file before 
   customizing.

   Uncomment any of the configuration options to change the default behavior (see 
   https://macmillanhighered.atlassian.net/wiki/display/MP/Player+Configuration+Options
   for descriptions of the options).

*/

/**************************************
  Set this to the DF book ID (Subtype)
 **************************************/
xBookUtils.bookID = "strayersources3ehs";

var Player_subtype = Player_manuscript_type.extend({
    
    //cfg_removeRawHtmlDivs: "on",

    //cfg_showAnswer: "on",
    //cfg_showAnswerAutoWrapThis: "off",
    
    //cfg_Box_moveTitle: "all",
    //cfg_Box_moveTitleExclude: "",

    //cfg_Figures_targetDefault: "_blank",
    //cfg_Figures_resizeDivWidth: "off",

    cfg_Figures_autoHtml: "on",
    cfg_LH_autoHtml: "on",

    //cfg_LH_externalTargetDefault: "_pop",
    cfg_LH_internalTargetDefault: "_pop",
    cfg_LH_ebookTargetDefault: "_pop",
    //cfg_LH_imageTargetDefault: "_blank",

    cfg_LH_useOpenContent: "on",
    cfg_LH_useLinksFile: "on",
    
    //cfg_Glossary_hoverTerms: "on",
    //cfg_Glossary_useStickyDiv: "on",
    //cfg_Glossary_hoverTermsNoClick: "",

    initialize_sections: function() {
	
      // Do not delete this
      this._super();
	
      // Anything that needs to be done before the page displays 
      // should be done here.
	
	
    }, // end initialize_sections
    

    /* 
       You will most likely not make any changes to the initialize
       method unless you know exactly what you are doing :-)
    */
    initialize: function(id) {
	
      // Do not delete this
      this._super(id);
	
      this.xrefs = new XRefs_manuscript_subtype();
      this.glossary = new Glossary_manuscript_subtype();
      this.figures = new Figures_manuscript_subtype();	
	
    }, // end initialize
    
    initialize2: function() {
	
      // Do not delete this
      this._super();

      var link_handler = new LinkHandler();

      // Anything that can be done after the page displays 
      // should be done here.

      safe_log("in main content frame: " + xBookUtils.inMainContentFrame());
    
      var ch_num = $("#manuscript").data("chapter-number");

      $('[data-block_type="hr1"]').append('<hr class="green"/>');
      $('[data-block_type="hr2"]').append('<hr class="blue"/>');

      // add superscript to AP box titles
      $("h3").each(function() {
        var $h3 = $(this);
        var h3_txt = $h3.text();

        if (match = h3_txt.match(/(PRACTICING AP)(®)( HISTORICAL THINKING)/)) {
          $h3.html(match[1] + '<sup>' + match[2] + '</sup>' + match[3]);
        }
        else if (match = h3_txt.match(/(AP)(®)( EXAM TIP)/)) {
          $h3.html(match[1] + '<sup>' + match[2] + '</sup>' + match[3]);
        }
        else if (match = h3_txt.match(/(SNAPSHOT): (.*)/)) {
          $h3.html(match[1] + '<span class="tbl_title">' + match[2] + '</span>');
        }
      });

      // add chapter timeline link to print page box
      if ($('#print_page_box').length > 0) {
        $('#print_page_box:not([class])').addClass('first_pg');
        if (ch_num < 24) {
          $('#print_page_header').append('<span class="timeline"><a href="' + xBookUtils.getBaseUrl() + 'asset/table/timeline_ch' + ch_num + '.html" target="_pop" data-type="lh-link">Chapter Map of Time</a></span>');
        }

        if (ch_num < 3 || ch_num === 201) {
          $('#print_page_header').append('<span class="landmarks"><a href="' + xBookUtils.getBaseUrl() + 'asset/img_ch201/STR_02272_PT01_UN01.html" target="_pop" data-type="lh-link">Part/Period Landmarks</a></span>');
        }
        else if (ch_num < 7 || ch_num === 202) {
          $('#print_page_header').append('<span class="landmarks"><a href="' + xBookUtils.getBaseUrl() + 'asset/img_ch202/STR_02272_PT02_UN01.html" target="_pop" data-type="lh-link">Part/Period Landmarks</a></span>');
        }
        else if (ch_num < 13 || ch_num === 203) {
          $('#print_page_header').append('<span class="landmarks"><a href="' + xBookUtils.getBaseUrl() + 'asset/img_ch203/STR_02272_PT03_UN01.html" target="_pop" data-type="lh-link">Part/Period Landmarks</a></span>');
        }
        else if (ch_num < 16 || ch_num === 204) {
          $('#print_page_header').append('<span class="landmarks"><a href="' + xBookUtils.getBaseUrl() + 'asset/img_ch204/STR_02272_PT04_UN01.html" target="_pop" data-type="lh-link">Part/Period Landmarks</a></span>');
        }
        else if (ch_num < 20 || ch_num === 205) {
          $('#print_page_header').append('<span class="landmarks"><a href="' + xBookUtils.getBaseUrl() + 'asset/img_ch205/STR_02272_PT05_UN01.html" target="_pop" data-type="lh-link">Part/Period Landmarks</a></span>');
        }
        else if (ch_num <= 23 || ch_num === 206) {
          $('#print_page_header').append('<span class="landmarks"><a href="' + xBookUtils.getBaseUrl() + 'asset/img_ch206/STR_02272_PT06_UN01.html" target="_pop" data-type="lh-link">Part/Period Landmarks</a></span>');
        }
      }
      else {
        $("[data-type='section']").prepend("<div class='page_num'><p class='chrono_link'><a href='" + xBookUtils.getBaseUrl() + "asset/table/timeline_ch" + ch_num + ".html' target='_pop' data-type='lh-link'>Chapter Map of Time</a></p></div>");

        if (ch_num < 3) {
          $('.page_num').append("<p class='landmark_link'><a href='" + xBookUtils.getBaseUrl() + "asset/img_ch201/STR_02272_PT01_UN01.html' target='_pop' data-type='lh-link'>Part/Period Landmarks</a></p>");
        }
        else if (ch_num < 7) {
          $('.page_num').append("<p class='landmark_link'><a href='" + xBookUtils.getBaseUrl() + "asset/img_ch202/STR_02272_PT02_UN01.html' target='_pop' data-type='lh-link'>Part/Period Landmarks</a></p>");
        }
        else if (ch_num < 13) {
          $('.page_num').append("<p class='landmark_link'><a href='" + xBookUtils.getBaseUrl() + "asset/img_ch203/STR_02272_PT03_UN01.html' target='_pop' data-type='lh-link'>Part/Period Landmarks</a></p>");
        }
        else if (ch_num < 16) {
          $('.page_num').append("<p class='landmark_link'><a href='" + xBookUtils.getBaseUrl() + "asset/img_ch204/STR_02272_PT04_UN01.html' target='_pop' data-type='lh-link'>Part/Period Landmarks</a></p>");
        }
        else if (ch_num < 20) {
          $('.page_num').append("<p class='landmark_link'><a href='" + xBookUtils.getBaseUrl() + "asset/img_ch205/STR_02272_PT05_UN01.html' target='_pop' data-type='lh-link'>Part/Period Landmarks</a></p>");
        }
        else if (ch_num <= 23) {
          $('.page_num').append("<p class='landmark_link'><a href='" + xBookUtils.getBaseUrl() + "asset/img_ch206/STR_02272_PT06_UN01.html' target='_pop' data-type='lh-link'>Part/Period Landmarks</a></p>");
        }
      }
      
      if ($('[data-block_type="zoom"]').length > 0) {
        $('body').addClass('zoom');
        var $h2 = $('h2');
        var h2_txt = $h2.text();
    
        if (match = h2_txt.match(/(ZOOMING IN): (.*)/)) {
          $h2.text(match[2]);
        }
      }
      if ($('[data-block_type="reflections"]').length > 0) {
        $('body').addClass('reflections');
        var $h2 = $('h2');
        var h2_txt = $h2.text();
    
        if (match = h2_txt.match(/(REFLECTIONS): (.*)/)) {
          $h2.text(match[1]);
          $h2.after('<p class="sub_t">' + match[2] + '</p>');
        }
      }

      if ($('[data-block_type="ch_rev"]').length > 0) {
        $('body').addClass('ch_rev');
        var $h2 = $('h2');
        var h2_txt = $h2.text();
    
        $h2.before('<h1>Chapter Review</h1>');
      }

      if ($('[data-block_type="preface"]').length > 0) {
        $('body').addClass('preface');
      }

      if ($('[data-block_type="pt_intro"]').length > 0) {
        $('body').addClass('pt_intro');
        var $h2 = $('h2');
        var h2_txt = $h2.text();
    
        if (match = h2_txt.match(/(PART [^:]+): ([^:]+)/)) {
          var part = match[1];
          var title = match[2];

          $h2.text(title);
          $h2.before('<p class="pt_num">' + part + '</p>');
        }
      }
  
      if ($('[data-block_type="big_pic"]').length > 0) {
        $('body').addClass('big_pic');
        var $h2 = $('h2');
        var h2_txt = $h2.text();
    
        if (match = h2_txt.match(/(THE BIG PICTURE): (.*)/)) {
          $h2.text(match[2]);
          $h2.before('<p class="pt_num">' + match[1] + '</p>');
        }
    
      }
  
      if ($('[data-block_type="pt_bhead"]').length > 0) {
        $('body').addClass('pt_bhead');
        var $h2 = $('h2');
        var h2_txt = $h2.text();
        
        if (match = h2_txt.match(/UNDERSTANDING AP®THEMES IN PART .*/)) {
          $h2.after('<hr/>');
          $h2.addClass('theme');
        }
        
      }

    } // end initialize2
    
}); // end Player_subtype


// Do not delete this
player = new Player_subtype();
