// digfir_ebook.js

/* This is for the xBookUtils library defined at the end of this file. */

if (typeof xBookUtils == "undefined") {
    var xBookUtils = {};
}

xBookUtils.DFVersionNumber = "20160527-001";

/*
  Added by Bruce 12/12/2013

  This class defines a link handler for all <a> tags in the manuscript div.

  To use the link handler, add the following to intialize2:

    var link_handler = new LinkHandler();

*/

var LinkHandler = Class.extend({
    
    externalTargetDefault: "_blank",
    internalTargetDefault: "_blank",
    ebookTargetDefault: "_self",

    // If an href points directly to an image file in the asset/ directory
    // then it will pop by default.  Change this to "_blank" in order to have
    // it open in a new blank window instead
    imageTargetDefault: "_pop",

    // Set this to "on" if you want all internal image links to open
    // using supp_win.html (which will allow you to set the width)
    // NOTE: this is turned on with the global cfg_displayImagesInSuppHtml setting
    displayImagesInSuppHtml: "off",

    // If your altsrc points to an image and you want it to automatically open the
    // corresponding html file instead (same file path/name as the image except 
    // extension ends in .html) set this to "on"
    autoHtml: "off",

    // Turn on to read in asset/links.js for link aliases
    useLinksFile: "off",

    // Turn on use of openContent in PX
    useOpenContent: "off",

    // target="_pop"
    fn_pop: function(href, target, $jqLinkObj, event) {
	if (event !== undefined) {
	    event.stopImmediatePropagation();
	}

	xBookUtils.debug("LinkHandler::fn_pop: received href = " + href);
	
	// If href is a px ID then open it with openContent
	if (/^px:/.test(href)) {
	    var item_id = "";
	    var hash_target = "";
	    
	    // need to check for hash target
	    var hash_match = href.match(/px:(.*)#(.*)/);
	    if (hash_match !== null) {
		item_id = hash_match[1];
		hash_target = hash_match[2];
	    }
	    else {
		item_id = href.replace(/^px:/, "");
	    }
	    
	    // bypass openContent and call the URL directly
	    top.PX.DataManager.GetItemById(item_id).then(function(E){
		if (E) {
		    var new_url = "";
		    var curr_url = top.window.location.href.replace(/#.*/, "");

		    if (!xBookUtils.emptyValue(hash_target)) {
			hash_target = "&anchor_id=" + hash_target;
		    }

		    // toc=syllabusfilter is needed to keep Home button from displaying
		    if (E.SubContainerIds !== null && E.SubContainerIds !== undefined && E.SubContainerIds.length > 0) {
			new_url = curr_url + "#state/item/" + E.SubContainerIds[0].Value + "/" + item_id + "?mode=Preview&renderIn=supp&toc=syllabusfilter" + hash_target;
		    }
		    else {
			new_url = curr_url + "#state/item/" + item_id + "?mode=Preview&renderIn=supp&toc=syllabusfilter" + hash_target;
		    }

		    new_url += "&xBookSuppWin=1";

		    xBookUtils.debug("Loading URL directly: " + new_url);
		    xBookUtils.openPXSuppWin({url: new_url});
		}
	    });
	    
	    return false;
	}


	// Links to other pages in the book need to be opened in the
	// special page navigator supp window
	if (xBookUtils.ebookPage(href)) {
	    // If we are already in the supp win nav page then we can just 
	    // bring up the next page directly
	    if (xBookUtils.inSuppWinNavPage()) {
		href = xBookUtils.getBaseUrl() + href;
		window.location.href = href;
	    }
	    else {
		xBookUtils.openPageSuppWin({page: href});
	    }
	    return false;
	}
	
	// special processing for internal links (file in asset/)
	if (!xBookUtils.externalUrl(href)) {
	    // special cases for images
	    if (/\.(jpg|gif|png|tiff)$/.test(href)) {
		// do we autoconvert image file name to html file name?
		if (this.autoHtml === "on") {
		    href = href.replace(/\.(jpg|gif|png|tiff)$/, ".html");
		}
		// or do we use supp_win.html to display image?
		else if (this.displayImagesInSuppHtml === "on") {
		    var width = $jqLinkObj.attr('data-htmlwidth');
		    if (!xBookUtils.emptyValue(width) && /^\d+$/.test(width)) {
			width = "&imgwidth=" + width;
		    }
		    else {
			width = "";
		    }
		    href = "asset/supp_win.html?bookid=" + xBookUtils.getBookId() + "&image=" + href + width + "&baseurl=" + xBookUtils.getBaseUrl();
		}
	    } // end special image case
	    
	    href = xBookUtils.getBaseUrl() + href;
	}

	xBookUtils.openSuppWin({url: href});
	return false;
    }, // end fn_pop

    // target="_blank"
    fn_blank: function(href, target, $jqLinkObj, event) {
	if (event !== undefined) {
	    event.stopImmediatePropagation();
	}

	xBookUtils.debug("LinkHandler::fn_blank: received href = " + href);
	
	// If href is a px ID then open it with openContent
	if (/^px:/.test(href)) {
	    var item_id = "";
	    var hash_target = "";

	    // need to check for hash target
	    var hash_match = href.match(/px:(.*)#(.*)/);
	    if (hash_match !== null) {
		item_id = hash_match[1];
		hash_target = hash_match[2];
	    }
	    else {
		item_id = href.replace(/^px:/, "");
	    }
	    
	    // bypass openContent and call the URL directly
	    top.PX.DataManager.GetItemById(item_id).then(function(E){
		if (E) {
		    var new_url = "";
		    var curr_url = top.window.location.href.replace(/#.*/, "");
		    
		    if (!xBookUtils.emptyValue(hash_target)) {
			hash_target = "&anchor_id=" + hash_target;
		    }
		    
		    if (E.SubContainerIds !== null && E.SubContainerIds !== undefined && E.SubContainerIds.length > 0) {
			new_url = curr_url + "#state/item/" + E.SubContainerIds[0].Value + "/" + item_id + "?mode=Preview&renderIn=fne" + hash_target;
		    }
		    else {
			new_url = curr_url + "#state/item/" + item_id + "?mode=Preview&renderIn=fne" + hash_target;
		    }
		    
		    xBookUtils.debug("Loading URL directly: " + new_url);
		    // Use the item_id for the target so we don't open up a 
		    // zillion new windows for the same page
		    top.window.open(new_url, item_id);
		}
	    });
	    
	    return false;
	}

	// special processing for internal links (file in asset/)
	if (!xBookUtils.externalUrl(href)) {	    
	    // special cases for images
	    if (/\.(jpg|gif|png|tiff)$/.test(href)) {
		// do we autoconvert image file name to html file name?
		if (this.autoHtml === "on") {
		    href = href.replace(/\.(jpg|gif|png|tiff)$/, ".html");
		}
		// or do we use supp_win.html to display image?
		else if (this.displayImagesInSuppHtml === "on") {
		    var width = $jqLinkObj.attr('data-htmlwidth');
		    if (!xBookUtils.emptyValue(width) && /^\d+$/.test(width)) {
			width = "&imgwidth=" + width;
		    }
		    else {
			width = "";
		    }
		    href = "asset/supp_win.html?bookid=" + xBookUtils.getBookId() + "&image=" + href + width + "&baseurl=" + xBookUtils.getBaseUrl();
		}
	    } // end special image case

	    href = xBookUtils.getBaseUrl() + href;
	}
	
	// in order to keep from opening a zillion different windows for the same
	// href, create a unique target
	var href_target = href.replace(/[^a-zA-Z0-9]/g, "");
	if (href_target.length > 50) {
	    href_target = href_target.substr(href_target.length - 50);
	}
	xBookUtils.debug("href_target: " + href_target);

	if (xBookUtils.inMainContentFrame()) {
	    window.open(href, href_target);
	}
	else {
	    if (window.opener) {
		window.opener.open(href, href_target);
	    }
	    else {
		window.open(href, href_target);
	    }
	}
	return false;
    }, // end fn_blank

    // target="_self"
    fn_self: function(href, target, $jqLinkObj, event) {
	if (event !== undefined) {
	    event.stopImmediatePropagation();	
	}

	xBookUtils.debug("LinkHandler::fn_self: received href = " + href);
	
	// If we are in PX then we better have a PX ID
	if (xBookUtils.inPX()) {
	    var item_id = "";
	    var hash_target = "";
	    var hash_target_string = "";
	    
	    if (/^px:/.test(href)) {
		// need to check for hash target
		var hash_match = href.match(/px:(.*)#(.*)/);
		if (hash_match !== null) {
		    item_id = hash_match[1];
		    hash_target = hash_match[2];
		}
		else {
		    item_id = href.replace(/^px:/, "");
		}
		
		xBookUtils.debug("LinkHandler::fn_self: item_id = " + item_id + ", hash_target = " + hash_target);

		// bypass openContent and call the URL directly
		var render_in = xBookUtils.getDefaultPXRender();
		top.PX.DataManager.GetItemById(item_id).then(function(E){
		    if (E) {
			var new_url = "";
			var curr_url = top.window.location.href.replace(/#.*/, "");
			
			if (!xBookUtils.emptyValue(hash_target)) {
			    hash_target_string = "&anchor_id=" + hash_target;
			    if (xBookUtils.inPXSuppWin()) {
				hash_target_string += ":ts" + xBookUtils.generateRandomNumber(999,99999);
			    }
			}
			
			// Determine opener render_in if we are in supp window
			if (xBookUtils.inPXSuppWin()) {
			    /*
			    // Grab current URL of main content window
			    var px_url = top.window.opener.location.href;
			    xBookUtils.debug("opener URL: " + px_url);
			    
			    // If we are already viewing the page in PX then
			    // set render_in to whatever the page is rendered in
			    if (px_url.indexOf("/" + item_id + "?") > -1) {
			    	// Grab current renderIn of main content window
				var px_render = xBookUtils.getURLParameter('renderIn', px_url);
				xBookUtils.debug("Setting render_in to: " + px_render);
				render_in = px_render;
			    }
			    */
			    render_in = xBookUtils.getDefaultPXRender("opener");
			}

			if (E.SubContainerIds !== null && E.SubContainerIds !== undefined && E.SubContainerIds.length > 0) {
			    new_url = curr_url + "#state/item/" + E.SubContainerIds[0].Value + "/" + item_id + "?mode=Preview&toc=syllabusfilter&readOnly=False&renderIn=" + render_in + hash_target_string;
			}
			else {
			    new_url = curr_url + "#state/item/" + item_id + "?mode=Preview&toc=syllabusfilter&readOnly=False&renderIn=" + render_in + hash_target_string;
			}
			
			xBookUtils.debug("Loading URL directly: " + new_url);
			
			if (xBookUtils.inPXSuppWin()) {
			    xBookUtils.debug("loading in window " + player.PXWindowName);
			    window.open(new_url, player.PXWindowName);
			}
			else {
			    top.window.location = new_url;
			}
			
			return false;
		    }
		});
	    }
	    // allow non-ebook URL/file paths in supp window
	    else if (!xBookUtils.ebookPage(href) && xBookUtils.inPXSuppWin()) {
		xBookUtils.debug("LinkHandler::fn_self: non-ebook page URL in supp window");
		if (!xBookUtils.externalUrl(href)) {
		    href = xBookUtils.getBaseUrl() + href;
		}
		xBookUtils.debug("LinkHandler::fn_self: " + href);
		top.window.location = href;
		return false;
	    }
	    else {
		xBookUtils.debug("LinkHandler::fn_self: can't open " + href + " with target _self");
	    }
	    return false;
	} // end if (xBookUtils.inPX())
	
	// If we get here then we are in the wrapper and href better be
	// an ebook page
	/*
	 *
	 * We need to allow non-ebook pages because we may have a link to a non-ebook
	   page resource with an PX ID (e.g. LC Activity, a link to a different ebook, 
	   a link to an ARGA activity).
	if (!xBookUtils.ebookPage(href)) {
	    xBookUtils.debug("LinkHandler::fn_self: non-ebook page link attempting target=_self");
	    return false;
	}
	*/

	if (xBookUtils.inMainContentFrame()) {
	    window.open(href, "_self");
	}
	else {
	    if (window.top.opener) {
		window.top.opener.open(href, "_self");
	    }
	    else if (window.opener) {
		window.opener.open(href, "_self");
	    }
            else {
		window.open(href, "_self");
	    }
	}
	return false;
    }, // end fn_self

    FN_HREF_EMPTY: function(href, target, $jqLinkObj, event) {
	if (event !== undefined) {
	    event.stopImmediatePropagation();
	}
	safe_log("LinkHandler: href is empty");
	return false;
    }, // end FN_HREF_EMPTY

    FN_DEFAULT: function(href, target, $jqLinkObj, event) {
	if (event !== undefined) {
	    event.stopImmediatePropagation();
	}

	// If href is a px ID then open it with openContent
	if (/^px:/.test(href)) {
	    var item_id = "";
	    var hash_target = "";

	    // need to check for hash target
	    var hash_match = href.match(/px:(.*)#(.*)/);
	    if (hash_match !== null) {
		item_id = hash_match[1];
		hash_target = hash_match[2];
	    }
	    else {
		item_id = href.replace(/^px:/, "");
	    }
	    
	    xBookUtils.debug("LinkHandler::FN_DEFAULT: item_id = " + item_id + ", hash_target = " + hash_target);

	    // bypass openContent and call the URL directly
	    top.PX.DataManager.GetItemById(item_id).then(function(E){
		if (E) {
		    var new_url = "";
		    var curr_url = top.window.location.href.replace(/#.*/, "");
		    
		    if (!xBookUtils.emptyValue(hash_target)) {
			hash_target = "&anchor_id=" + hash_target;
		    }
		    
		    if (E.SubContainerIds !== null && E.SubContainerIds !== undefined && E.SubContainerIds.length > 0) {
			new_url = curr_url + "#state/item/" + E.SubContainerIds[0].Value + "/" + item_id + "?mode=Preview&renderIn=fne" + hash_target;
		    }
		    else {
			new_url = curr_url + "#state/item/" + item_id + "?mode=Preview&renderIn=fne" + hash_target;
		    }
		    
		    xBookUtils.debug("Loading URL directly: " + new_url);
		    // Use the item_id for the target so we don't open up a 
		    // zillion new windows for the same page
		    top.window.open(new_url, item_id);
		}
	    });

	    return false;
	}
	
	// special processing for internal links (file in asset/)
	if (!xBookUtils.externalUrl(href)) {
	    // special cases for images
	    if (/\.(jpg|gif|png|tiff)$/.test(href)) {
		// do we autoconvert image file name to html file name?
		if (this.autoHtml === "on") {
		    href = href.replace(/\.(jpg|gif|png|tiff)$/, ".html");
		}
		// or do we use supp_win.html to display image?
		else if (this.displayImagesInSuppHtml === "on") {
		    var width = $jqLinkObj.attr('data-htmlwidth');
		    if (!xBookUtils.emptyValue(width) && /^\d+$/.test(width)) {
			width = "&imgwidth=" + width;
		    }
		    else {
			width = "";
		    }
		    href = "asset/supp_win.html?bookid=" + xBookUtils.getBookId() + "&image=" + href + width + "&baseurl=" + xBookUtils.getBaseUrl();
		}
	    } // end special image case
	    
	    href = xBookUtils.getBaseUrl() + href;
	}
	
	if (xBookUtils.inMainContentFrame()) {
	    window.open(href, target);
	    return false;
	}
	else {
	    window.opener.open(href, target);
	    return false;
	}
    }, // end FN_DEFAULT

    /* 
       getHref: This returns either a URL (fully qualified or relative) or a
       PX Item ID (px:item_id) or empty string if no href can be found on link
    */
    getHref: function($link) {
	var data_href;
	var data_px;
	var data_alias;
	
	// links will be <a> tags and have normal target
	if ($link[0].tagName === "a" ||
	    $link[0].tagName === "A") {
	    data_href = $.trim($link.attr('href'));
	}
	// non-links will have data-target
	else {
	    data_href = $.trim($link.attr('data-href'));
	}

	// if href is pointing to a local ID on the page then return it
	if (/^#/.test(data_href)) {
	    return data_href;
	}

	data_px = $.trim($link.attr('data-href-px'));
        if (!data_px) {
            data_px = $.trim($link.attr('data-hrefpx'));
        }
	data_alias = $.trim($link.attr('data-href-alias'));
        if (!data_alias) {
            data_alias = $.trim($link.attr('data-hrefalias'));
        }
        
	// If data_alias is empty then check if there is an alias value in data_href
	if (xBookUtils.emptyValue(data_alias)) {
	    if (!xBookUtils.emptyValue(data_href)) {
		var alias_match = data_href.match(/^alias:\s*(.*)/);
		if (alias_match !== null) {
		    xBookUtils.debug("getHref: found alias in href: " + alias_match[1]);
		    data_alias = alias_match[1];
		    data_href = ""; // this is important
		}
	    }
	}
	
	// If data_px is empty then check if there is a px value in href
	//if (xBookUtils.inPX()) {
	if (xBookUtils.emptyValue(data_px)) {
	    if (!xBookUtils.emptyValue(data_href)) {
		var px_match = data_href.match(/^px:\s*(.*)/);
		if (px_match !== null) {
		    xBookUtils.debug("getHref: found px ID in href: " + px_match[1]);
		    data_px = px_match[1];
		    data_href = ""; // this is important
		}
	    }
	}
	//}

	// This needs to be checked because it is possible that both data-href-px was
	// set and a px link was in href
	if (/^px:/.test(data_href)) {
	    data_href = "";
	}
	// This needs to be checked because it is possible that both data-href-alias was
	// set and an alias link was in href
	else if (/^alias:/.test(data_href)) {
	    data_href = "";
	}
	
	// Alias values override data attributes so check if we have 
	// alias values for href/px in links object
	if (!xBookUtils.emptyValue(data_alias)) {

	    // get href for alias
	    var alias_href = this.getAliasValue('href', data_alias);
	    if (!xBookUtils.emptyValue(alias_href)) {
		data_href = alias_href;
	    }
	    
	    // get px for alias
	    var alias_px = this.getAliasValue('px', data_alias);
	    if (!xBookUtils.emptyValue(alias_px)) {
		data_px = alias_px;
	    }
	    // If there is no px alias value and we are in PX, then check for px 
	    // value on data_href (double indirection)
	    else if (xBookUtils.inPX() && !xBookUtils.emptyValue(data_href)) {
		alias_px = this.getAliasValue('px', data_href);
		if (!xBookUtils.emptyValue(alias_px)) {
		    data_px = alias_px;
		}
	    }
	}
	
	// If we are in PX and data_px is still empty then check xBookUtils.links 
	// for PX ID attached to href
	if (xBookUtils.inPX() && xBookUtils.emptyValue(data_px) && !xBookUtils.emptyValue(data_href)) {
	    if (data_href in xBookUtils.links) {
		data_px = xBookUtils.links[data_href].px;
	    }

	    // If we didn't find a px: value for the href then check if the 
	    // href is an ebook page with an attached hash target and check 
	    // just the ebook page
	    if (xBookUtils.emptyValue(data_px) && xBookUtils.ebookPage(data_href)) { 
		var hash_match = data_href.match(/(.*)#(.*)/);
		if (hash_match !== null) {
		    if (hash_match[1] in xBookUtils.links) {
			data_px = xBookUtils.links[hash_match[1]].px;
		    }
		    // data_px could still be empty after above if so we 
		    // need to check before we add the hash
		    if (!xBookUtils.emptyValue(data_px)) {
			data_px += "#" + hash_match[2];
		    }
		}
	    } 
	}
	
	// If we have a PX value then check if we need to add a target anchor
	// hash from the href value
	if (!xBookUtils.emptyValue(data_px) && !xBookUtils.emptyValue(data_href) &&
	    !(/#/.test(data_px)) && /#/.test(data_href)) {
	    var href_hash_match = data_href.match(/(#.+)/);
	    if (href_hash_match !== null) {
		data_px += href_hash_match[1];
	    }
	}

	// At this point we have data_href and data_px set to their 
	// final values.

	xBookUtils.debug("getHref: data_href = " + data_href + ", data_px = " + data_px);
	
	//  If we are not in PX 
	if (!xBookUtils.inPX()) {
	    // If we only have a px ID then return it (the LinkHandler will need to 
	    // deal with this appropriately)
	    if (xBookUtils.emptyValue(data_href) && !xBookUtils.emptyValue(data_px)) {
		//xBookUtils.debug("getHRef: ERROR: We are not in PX but only have a PX ID");
		//throw new Error("Link will only work in PX");
		xBookUtils.debug("getHRef: We are not in PX but only have a PX ID");
		return "px:" + data_px;
	    }
	    // Otherwise return href
	    xBookUtils.debug("getHRef: not in PX, returning data_href: " + data_href);
	    return data_href;
	}
	/*** From here on, we are in PX ***/
	//  If useOpenContent is not turned on then return href
	else if (this.useOpenContent === "off") {
	    xBookUtils.debug("getHRef: useOpenContent is off, returning data_href: " + data_href);
	    return data_href;
	}
	// In PX: send PX Item ID if we have one, otherwise href
	else {
	    xBookUtils.debug("getHRef: in PX, returning...");
	    if (!xBookUtils.emptyValue(data_px)) {
		xBookUtils.debug("data_px: " + data_px);
		return "px:" + data_px;
	    }
	    xBookUtils.debug("data_href: " + data_href);
	    return data_href;
	}
    },
    
    getAliasValue: function(type, alias) {
	if (xBookUtils.emptyValue(alias)) {
	    return "";
	}

	if (!xBookUtils.emptyValue(xBookUtils.links[alias])) {
	    if (type === "href") {
		return xBookUtils.links[alias].href;
	    }
	    else if (type === "px") {
		return xBookUtils.links[alias].px;
	    }
	    else if (type === "target") {
		return xBookUtils.links[alias].target;
	    }
	}

	// If we don't find an alias value return empty string
	return "";
    },

    getTarget: function($link) {
	var data_target;
	var data_href;
	var data_alias;

	// normal <a> tags and will have normal target attribute
	if ($link[0].tagName === "a" ||
	    $link[0].tagName === "A") {
	    data_target = $.trim($link.attr('target'));
	    data_href = $.trim($link.attr('href'));
	}
	// non-<a> links (data-href) will have data-target attribute
	else {
	    data_target = $.trim($link.attr('data-target'));
	    data_href = $.trim($link.attr('data-href'));
	}
	data_alias = $.trim($link.attr('data-href-alias'));
        if (!data_alias) {
            data_alias = $.trim($link.attr('data-hrefalias'));
        }
        
	// If we don't have a data-href-alias attribute check if we have an
	// alias in the href attribute
	if (xBookUtils.emptyValue(data_alias)) {
	    if (!xBookUtils.emptyValue(data_href)) {
		var alias_match = data_href.match(/^alias:\s*(.*)/);
		if (alias_match !== null) {
		    data_alias = alias_match[1];
		    // We need to clear the 'href' value because it was 
		    // actually an alias value
		    data_href = "";
		}
	    }
	}

	// If data_href is either a px or alias value, blank it out
	if (/^(px|alias):/.test(data_href)) {
	    data_href = "";
	}

	// If we have an alias, check if it has an href or target value
	// since alias values override hard coded values
	if (!xBookUtils.emptyValue(data_alias)) {
	    var alias_href = this.getAliasValue('href', data_alias);
	    if (!xBookUtils.emptyValue(alias_href)) {
		data_href = alias_href;
	    }
	    var alias_target = this.getAliasValue('target', data_alias);
	    if (!xBookUtils.emptyValue(alias_target)) {
		data_target = alias_target;
	    }
	}
	
	// If we don't have a data_href value and target is not defined then 
	// we can't tell what type of link this is and need to throw an error
	if (xBookUtils.emptyValue(data_href) && xBookUtils.emptyValue(data_target)) {
	    throw new Error("Can't determine target");
	}

	var set_by_xrefs = $.trim($link.attr('data-xrefs-target'));
	var linkTarget = data_target;
	
	// set target if none exists or target was set by XRefs
	if (xBookUtils.emptyValue(linkTarget) || (set_by_xrefs === "1")) {
	    // link to image
	    if (!xBookUtils.externalUrl(data_href) &&
		/asset\/[\w\/\-\.]+\.(jpg|gif|png|tiff)$/.test(data_href)) {
		if (!xBookUtils.emptyValue(this.imageTargetDefault)) {
		    linkTarget = this.imageTargetDefault;
		}
		else {
		    linkTarget = "_pop";
		}
	    }		
	    // link to ebook page
	    else if (xBookUtils.ebookPage(data_href)) {
		if (!xBookUtils.emptyValue(this.ebookTargetDefault)) {
		    linkTarget = this.ebookTargetDefault;
		}
		else {
		    linkTarget = "_self";
		}
	    }
	    // link to external resource
	    else if (xBookUtils.externalUrl(data_href)) {
		if (!xBookUtils.emptyValue(this.externalDefault)) {
		    linkTarget = this.externalTargetDefault;
		}
		else {
		    linkTarget = "_blank";
		}
	    }
	    // link to internal resource (this also acts as a default)
	    else {
		if (!xBookUtils.emptyValue(this.internalDefault)) {
		    linkTarget = this.internalTargetDefault;
		}
		else {
		    linkTarget = "_blank";
		}
	    }
	}

	// Special handling for _ebook target (should be handled same as
	// for an ebook page above).
	if (linkTarget === "_ebook") {
	    xBookUtils.debug("getTarget: setting target for _ebook");
	    if (!xBookUtils.emptyValue(this.ebookTargetDefault)) {
		linkTarget = this.ebookTargetDefault;
	    }
	    else {
		linkTarget = "_self";
	    }
	}

	xBookUtils.debug("getTarget: " + linkTarget);
	
	return linkTarget;

    },

    init: function() {

	// configurable variables
	this.externalTargetDefault = player.cfg_LH_externalTargetDefault || this.externalTargetDefault;
	this.internalTargetDefault = player.cfg_LH_internalTargetDefault || this.internalTargetDefault;
	this.ebookTargetDefault = player.cfg_LH_ebookTargetDefault || this.ebookTargetDefault;
	this.imageTargetDefault = player.cfg_LH_imageTargetDefault || this.imageTargetDefault;
	this.displayImagesInSuppHtml = player.cfg_displayImagesInSuppHtml || this.displayImagesInSuppHtml;
	this.autoHtml = player.cfg_LH_autoHtml || this.autoHtml;
	this.useOpenContent = player.cfg_LH_useOpenContent || this.useOpenContent;

	// Check if we need to load asset/links.js file
	this.useLinksFile = player.cfg_LH_useLinksFile || this.useLinksFile;
	if (this.useLinksFile === "on") {
	    var linksFile = xBookUtils.getBaseUrl() + "asset/links.js";
	    var body = document.getElementsByTagName("body")[0];
	    var script = document.createElement('script');
	    script.setAttribute('type','text/javascript');
	    script.setAttribute('src', linksFile);
	    body.appendChild(script);
	}

	// save off current object context for use in handler below
	var that = this;

	$("#manuscript").delegate("a[data-type='lh-link'], [data-href], [data-href-px], [data-hrefpx], [data-href-alias], [data-hrefalias]", 'click keydown', function(event) {
	    
	    // we only want to handle Enter key
	    if (event.type === "keydown" && event.keyCode != 13) {
		return;
	    }

	    var $clickedLink = $(this);

	    var linkHref;
	    var linkTarget;
	    var a_tag = false;
	    
	    if ($clickedLink[0].tagName === "a" ||
		$clickedLink[0].tagName === "A") {
		a_tag = true;
	    }

	    try {
		linkTarget = that.getTarget($clickedLink);
	    }
	    catch(err) {
		if (event !== undefined) {
		    event.stopImmediatePropagation();
		}
		safe_log("LinkHandler: " + err.message);
		return false;
	    }

	    // If link is disabled do nothing
	    if (linkTarget === "_disable" || linkTarget === "_disabled") {
		if (event !== undefined) {
		    event.stopImmediatePropagation();
		}
		return false;
	    }
	    
	    // get linkHref, it will either be a URL (full or relative), a PX Item ID
	    // (px:item_id) or empty
	    linkHref = that.getHref($clickedLink);

	    // linkHref will either be a URL (full or relative), a PX Item ID
	    // (px:item_id) or empty
	    /*
	    try {
		linkHref = that.getHref($clickedLink);
	    }
	    catch(err) {
		if (event !== undefined) {
		    event.stopImmediatePropagation();
		}
		$("<div>This is a link to a PX resource and will only work when viewing the book in PX. (1)</div>").dialog({
		    modal: true,
		    buttons: [{
			text: "OK",
			click: function () {
			    $(this).dialog("close");
			}
		    }]
		});
		return false;
	    }
	    */
	    
	    // Special handling for PX resource links in the Wrapper
	    if (/^px:/.test(linkHref) && !xBookUtils.inPX()) {
		if (event !== undefined) {
		    event.stopImmediatePropagation();
		}
		$("<div>This is a link to a PX resource and will only work when viewing the book in PX.</div>").dialog({
		    modal: true,
		    buttons: [{
			text: "OK",
			click: function () {
			    $(this).dialog("close");
			}
		    }]
		});
		return false;
	    }
	    
	    // If href attribute is empty then send link to special empty 
	    // handler if it exists, otherwise do nothing
	    if (xBookUtils.emptyValue(linkHref)) {
		if (typeof that["FN_HREF_EMPTY"] === 'function') {
		    return that["FN_HREF_EMPTY"](linkHref, linkTarget, $clickedLink, event);
		}
		if (event !== undefined) {
		    event.stopImmediatePropagation();
		}
		safe_log("LinkHandler: href is empty");
		return false;
	    }

	    // Check for local anchor (href starts with '#')
	    if (/^#/.test(linkHref)) {
		if (event !== undefined) {
		    event.stopImmediatePropagation();
		}

		xBookUtils.scrollToElement(linkHref);
		return false;
	    }
	    
	    // If we have an 'external' link and it isn't http(s) protocol 
	    // then let it bubble
	    if ((/^[a-zA-Z0-9\+\.\-]+:/.test(linkHref)) && !(/^px:/.test(linkHref))) {
		var l_pattern = /^https?:/i;
		if (!(l_pattern.test(linkHref))) {
		    if (a_tag) {
			return true;
		    }
		    else {
			if (event !== undefined) {
			    event.stopImmediatePropagation();
			}
			safe_log("Can't call URL " + linkHref + " from <" + $clickedLink[0].tagName + ">");
			return false;
		    }
		}
	    }

	    // name of the function to call to handle link
	    var fn_name = "fn" + linkTarget;

	    // If function is defined then call it
	    if (typeof that[fn_name] === 'function') {
		return that[fn_name](linkHref, linkTarget, $clickedLink, event);
	    }
	    else if (typeof that["FN_DEFAULT"] === 'function') {
		return that["FN_DEFAULT"](linkHref, linkTarget, $clickedLink, event);
	    }
	    // Otherwise let browser handle it 
	    else {
		$clickedLink.attr('href', linkHref);
		return true;
	    }
	}); // end delegate
    } // end init
}); // end LinkHandler


/*
  Added by Bruce 11/19/2013

  Update expand method on figures so they open in supp window.

  To add this functionality to your ebook, add the following to the player init method
  in your book's custom JS file *AFTER* the call to _super:

    this.figures = new Figures_manuscript_subtype();
*/

var Figures_manuscript_subtype = Figures.extend({

    // If your altsrc points to an image and you want it to automatically open the
    // corresponding html file instead (same file path/name as the image except 
    // extension ends in .html) set this to "on"
    autoHtml: "off",
    
    // By default images will pop in the supp window. Set this to "_blank" to
    // have them open in a new browser window instead
    targetDefault: "_pop",

    // By default the imagesLoaded plugin is attached to each figure in order 
    // to shrink the figure <div> to the same width as the <img>.  Set this
    // to "off" to turn this behavior off:
    resizeDivWidth: "on",

    // Set this to "on" if you want all internal image links to open
    // using supp_win.html (which will allow you to set the width)
    // NOTE: this is turned on with the global cfg_displayImagesInSuppHtml setting
    displayImagesInSuppHtml: "off",

    expand: function(image_ref) {
	
	// don't call _super, we are overriding this method
	
	var $parentDiv; // figure <div> around image
	
	// If image_ref is a string then assume it is the image ID 
	if (typeof image_ref === "string") {
	    $parentDiv = $("[data-type=figure][data-figure-id='" + image_ref + "']");
	} 
	else {
	    $parentDiv = $(image_ref).parents('[data-type=figure]').first();
	}
	
	if ($parentDiv.length < 1) {
	    safe_log("Figures_manuscript_subtype.expand: Can't find parent div for image");
	    return false;
	}
	
	var $image = $parentDiv.children('img');

	// If the img is not directly under the figure div then check if it has been
	// converted by captionjs
	if ($image.length == 0) {
	    $image = $parentDiv.children('figure').children('div').children('img');
	}
	
	if ($image.length == 0) {
	    safe_log("Figures_manuscript_subtype.expand: Can't find image div for image");
	    return false;
	}
	
	// By default, if no altsrc is defined in the xml then the player 
	// should have set it to the image src path.  But if for some reason
	// altsrc doesn't exist then set it to the img src anyway.
	var altsrc = ($parentDiv.attr('data-altsrc') || $image.attr('src'));	
	if (xBookUtils.emptyValue(altsrc)) {
	    safe_log("Figures_manuscript_subtype.expand: Can't find altsrc for figure");
	    return false;
	}

	// If we are in brainhoney, then we need to make sure the altsrc
	// has the proper absolute path
	if (xBookUtils.inBrainhoneyPlayer() && !xBookUtils.externalUrl(altsrc)) {
	    if (!/^\/brainhoney\//.test(altsrc)) {
		altsrc = xBookUtils.getBaseUrl() + altsrc;
	    }
	}

	// Target can be passed in through data-target attribute in xml.  If 
	// not present then use default.
	var target = ($parentDiv.attr('data-target') || this.targetDefault);

	// special checks for internal altsrc urls
	if (!xBookUtils.externalUrl(altsrc)) {
	    // make sure altsrc starts with 'asset/'

	    // brb, 2014-05-18: We need to remove this check for brainhoney
	    // compatibility. If developers are manually setting the altsrc 
	    // attribute on <figure> then they need to have the proper file path.
	    /*
	    if (!/^asset/.test(altsrc)) {
		altsrc = "asset/" + altsrc;
	    }
	    */

	    // We don't want to open a million different windows for the same figure
	    if (target === "_blank") {
		target = "fig_win";  // this matches Player default
	    }
	    
	    // Are we auto converting image file to html file?
	    if (this.autoHtml === "on") {
		altsrc = altsrc.replace(/\.(jpg|gif|png|tiff)$/, ".html");
	    }
	    // Or do we want to use supp_win.html to open internal image links?
	    else if (this.displayImagesInSuppHtml === "on") {
		var width = $parentDiv.attr('data-htmlwidth');
		if (!xBookUtils.emptyValue(width) && /^\d+$/.test(width)) {
		    width = "&imgwidth=" + width;
		}
		else {
		    width = "";
		}
		altsrc = "asset/supp_win.html?bookid=" + xBookUtils.getBookId() + "&image=" + altsrc + width + "&baseurl=" + xBookUtils.getBaseUrl();
	    }
	}
	
	if (target === "_pop") {
	    xBookUtils.openSuppWin({url: altsrc});
	}
	else {
	    window.open(altsrc, target);
	}
    }, // end expand

    init: function(context) {

	// configurable variables
	this.autoHtml = player.cfg_Figures_autoHtml || this.autoHtml;
	this.targetDefault = player.cfg_Figures_targetDefault || this.targetDefault;
	this.resizeDivWidth = player.cfg_Figures_resizeDivWidth || this.resizeDivWidth;
	this.displayImagesInSuppHtml = player.cfg_displayImagesInSuppHtml || this.displayImagesInSuppHtml;

        // Don't call _super here, it has already been called by Player.initialize

	// save resizeDivWidth so we can use it in the each() below
	var resize_div_width = this.resizeDivWidth;

	$('[data-type="figure"]').each(function() {
	    var $figureDiv = $(this);

	    /* 
	       There is a bug in Figure.init in player.js in which a
	       click handler is being added to every image in the
	       figure div (such as images in the caption) instead of
	       just the main figure image. So we need to remove click
	       handler on those other images.
	    */
	    // Any images in the figure div that have an empty data-mmtype
	    // should not have a click handler
	    $('[data-mmtype=""]', $figureDiv).unbind('click');

	    // First, set the 'id' on the figure <div>
	    var fig_id = $figureDiv.attr('id');
	    var fig_data_id = $figureDiv.attr('data-figure-id');
	    
	    if (xBookUtils.emptyValue(fig_id) && !xBookUtils.emptyValue(fig_data_id)) {
		$figureDiv.attr('id', fig_data_id);
	    }
	    
	    var $image = $figureDiv.children('img');

	    if ($image.length == 0) {
		return;
	    }

	    // If data-width is set on <figure> then set width of
	    // of figure <div> and <img> to data-width
	    var fig_width = $.trim($figureDiv.attr('data-width'));

	    if (!xBookUtils.emptyValue(fig_width) && /^\d+$/.test(fig_width)) {
		$figureDiv.attr('data-layout-width', '');
		$image.attr('width', fig_width);
		$figureDiv.css('width', fig_width + "px");
	    }
	    // Otherwise, if resizeDivWidth is requested then attach to each
	    // figure
	    else if (resize_div_width === "on") {
		$figureDiv.imagesLoaded(function($images, $proper, $broken) {
		    $proper.each(function() {
			var $image = $(this);
			// Since we may have added additional elements between the
			// image and the figure div (for credits) we need to use
			// closest() instead of parent() to get figure div
			var $parent = $image.closest('[data-type="figure"]');
			
			if ($parent.length != 0) {
			    var img_width = $image.width();
			    if (img_width > 0) {
				$parent.css("width", img_width + "px");
			    }
			}
		    });
		});
	    }
	}); // end each()	
    } // end init()
}); // end Figures_manuscript_subtype


/*
  Added 12/23/2015 by Bruce.  

  Adds ability to align table columns by character:

  <td align="char" char="CH">

  where CH can be a single character or string.

*/
var Tables_manuscript_subtype = Tables.extend({

    init: function() {
	this._super();

	// fix any tables with data-align-char
	this._set_data_align_char();
    },
    
    // call this function at the end of initialize2
    align_columns: function() {
	
	// align tables with align="char"
	this._align_table_columns();
    },
    
    // set the 'char' attribute for any tables that have data-align-char assigned
    _set_data_align_char: function() {
	
	var that = this;
	
	$("[data-type='table'][data-align-char]").each(function() {
	    var $this = $(this);
	    var align_char = $this.attr('data-align-char');
	    if (xBookUtils.emptyValue(align_char)) {
		return;
	    }
	    xBookUtils.debug("setting align char to " + align_char + " for table #" + $this.attr('id'));
	    
	    var $rows = $this.children('table').children("tbody").children('tr');
	    
	    $rows.each(function() {
		$.each(this.cells, function(col){
		    var $td = $(this);
		    
		    if (!that._has_char_align($td)) {
			return;
		    }
		    
		    $td.attr("char", align_char);
		});
	    });
	});
    },

    _align_table_columns: function() {

	var that = this;
	
	$("#manuscript").find("table").each(function() {
	    
	    var $table = $(this);
	    
	    if ($table.parent().attr('data-char-align') === "false") {
		xBookUtils.debug("table #" + $table.parent().attr('id') + " data-char-align='false'");
		return;
	    }
	    
	    var hasCharAlign = []; // stores alignment info for each column
	    var $rows = $table.children("tbody").children('tr');
	    
	    // find the columns that have character alignment
	    $rows.each(function() {
		$.each(this.cells, function(col){
		    var $td = $(this);
		    
		    if (!that._has_char_align($td)) {
			return;
		    }
		    
		    // if we already have an align char set for the column we are done
		    if (hasCharAlign[col] !== undefined &&
			hasCharAlign[col].ch !== undefined) {
			return;
		    }
		    
		    // find char we are aligning on
		    var align_char = $td.attr('char');
		    if (align_char === undefined) {
			align_char = "."; // default
		    }
		    
		    // set align char for this colum
		    hasCharAlign[col] = {};
		    hasCharAlign[col].ch = align_char;
		    xBookUtils.debug("table #" + $table.parent().attr('id') + " column " + col + " is aligned on char " + align_char);
		});
	    });
	    
	    // If we didn't find any columns with char align then we are done
	    if (hasCharAlign.length < 1) {
		return;
	    }
	    
	    // 1. add internal spans
	    // 2. get width of align char
	    // 3. for each column, get max width of left and right span
	    $rows.each(function() {
		$.each(this.cells, function(col){
		    var $td = $(this);
		    
		    if (!that._has_char_align($td)) {
			return;
		    }
		    
		    // Search for align char in <td>
		    var align_char = hasCharAlign[col].ch;
		    // escape special chars
		    align_char = align_char.replace(/([.*])/, "\\$1");
		    var regexp = new RegExp("(.*)(" + align_char + ")(.*)")
		    var html = $td.html();
		    var new_html;
		    var dmatch = html.match(regexp);
		    
		    // if <td> has alignment character
		    if (dmatch !== null) {
			new_html = "<span class='char-align-table'><span class='char-align-left'>" + dmatch[1] + "</span><span class='char-align-middle'>" + dmatch[2] + "</span><span class='char-align-right'>" + dmatch[3] + "</span></span>";
			$td.html(new_html);
			
			if (hasCharAlign[col].hasalignchar !== true) {
			    hasCharAlign[col].hasalignchar = true;
			    var $ch_align_span = $td.find('.char-align-middle');
			    hasCharAlign[col].chwidth = $ch_align_span.width();
			}
			
			// get width of align char if needed
			if (hasCharAlign[col].charwidth === undefined) {
			    hasCharAlign[col].charwidth = $td.find('.char-align-middle').width();
			}
			// get width of left span and set max left width if needed
			var left_width = $td.find('.char-align-left').width();
			if (hasCharAlign[col].maxleftwidth === undefined) {
			    hasCharAlign[col].maxleftwidth = left_width;
			}
			else if (left_width > hasCharAlign[col].maxleftwidth) {
			    hasCharAlign[col].maxleftwidth = left_width;
			}
			// get width of right span and set max right width if needed
			var right_width = $td.find('.char-align-right').width();
			if (hasCharAlign[col].maxrightwidth === undefined) {
			    hasCharAlign[col].maxrightwidth = right_width;
			}
			else if (right_width > hasCharAlign[col].maxrightwidth) {
			    hasCharAlign[col].maxrightwidth = right_width;
			}
		    }
		    // if <td> does not have alignment char
		    else {
			new_html = "<span class='char-align-table'><span class='char-align-left'>" + html + "</span><span class='char-align-middle'></span><span class='char-align-right'></span></span>";
			$td.html(new_html);
			// get width of left span and set max left width if needed
			var left_width = $td.find('.char-align-left').width();
			if (hasCharAlign[col].maxleftwidth === undefined) {
			    hasCharAlign[col].maxleftwidth = left_width;
			}
			else if (left_width > hasCharAlign[col].maxleftwidth) {
			    hasCharAlign[col].maxleftwidth = left_width;
			}
			// right width will always be 0
			if (hasCharAlign[col].maxrightwidth === undefined) {
			    hasCharAlign[col].maxrightwidth = 0;
			}
		    }
		});
	    });
	    
	    // go through cells one more time adding padding where necessary
	    var font_size;
	    $rows.each(function() {
		$.each(this.cells, function(col){
		    var $td = $(this);
		    
		    if (!that._has_char_align($td)) {
			return;
		    }
		    
		    // find font size if needed
		    if (font_size === undefined) {
			var style = window.getComputedStyle($td[0], null);
			font_size = parseFloat(style.fontSize);
		    }
		    
		    var $table_align = $td.children('.char-align-table');
		    var left_width = $table_align.children('.char-align-left').width();
		    
		    // If left width is less than maxleftwidth then pad to maxleftwidth
		    if (left_width < hasCharAlign[col].maxleftwidth) {
			$table_align.css('padding-left', ((hasCharAlign[col].maxleftwidth - left_width) / font_size) + "em");
		    }
		    
		    var right_width = $table_align.children('.char-align-right').width();
		    var right_padding = 0;
		    
		    if (right_width < hasCharAlign[col].maxrightwidth) {
			right_padding = hasCharAlign[col].maxrightwidth - right_width;
		    }
		    
		    var $align_ch = $table_align.children('.char-align-middle');
		    if (hasCharAlign[col].hasalignchar == true &&
			$align_ch.text() != hasCharAlign[col].ch) {
			right_padding += hasCharAlign[col].chwidth;
		    }
		    
		    if (right_padding > 0) {
			$table_align.css('padding-right', (right_padding / font_size) + "em");
		    }		    
		});
	    });
	}); // end for each table
    }, // end align_table_columns
    
    // argument should be a jQuery <td> object
    _has_char_align: function($td) {
	// getAttribute is a workaround for IE
	var align_value = $td[0].getAttribute("align");
	if (align_value !== "char") {
	    return false;
	}
	return true;
    }
    
}); // end Tables_manuscript_subtype


/* 
   Added by Bruce 11/08/2013
   
   Updates Glossary class as follows:
   
   - accesses terms from a central hash table instead of embedded in the page
   - hash table is defined in asset/terms.js and/or chapter-specific JS files
   - places the pop-up window near the mouse click to avoid scrolling issues in PX
   
   This class works in conjunction with the xBookUtils object (specifically, it uses
   the xBookUtils.terms object as the hash table to store the term/definitions pairs).  
   By default, it will load them from asset/term.js. Using the terms.js file 
   for both glossary terms and footnotes can create quite a big file.  As an alternative, 
   you can define chapter specific entries (such as footnotes) in the book's 
   chapter-specific JS files.
   
   To add this functionality to your book, add the following to the player init method
   in your book's custom JS file *AFTER* the call to _super:
   
     this.glossary = new Glossary_manuscript_subtype();

   Glossary terms should be defined in the xml as usual: 
     
     <termref term="key">...</termref>

   where key is the key(term) in the hash table 

   Footnotes should be defined in the xml as

     <termref term="fn_key">...</termref>

   The leading "fn_" on the key denotes it as a footnote
     
   Entries defined in asset/terms.js and the chapter-specific JS files 
   should be added to the xBookUtils.terms object:
   
     xBookUtils.terms['term'] = "definition";
   
   If you aren't going to use asset/terms.js then you can add {terms: false}
   to the context object in order to prevent the browser from trying to load it.

     this.glossary = new Glossary_manuscript({terms: false});
*/

var Glossary_manuscript_subtype = Glossary.extend({

    // turn this "on" to make glossary terms pop on hover instead of click
    hoverTerms: "off",

    // specify termrefs that should not be clickable 
    hoverTermsNoClick: "",

    // turn on to use new sticky div
    useStickyDiv: "off",

    // div used to display gloss/footnotes using hover
    hoverDiv: undefined,

    // div used to display "sticky" (dragable) gloss/footnotes
    stickyDiv: undefined,

    // holds timer id for remove_hover
    hoverTimer: undefined,
    
    // Called by click handler
    // This is the old default version of displaying click terms
    show_definition: function(term, Xclick, Yclick, $element) {

	var Xcoord = Xclick - 225;
	var Ycoord = (Yclick - $(document).scrollTop()) + 25;
	
	// Determine whether we have a glossary term or footnote
	var type; // will be set to either "Glossary" or "Footnote"
	
	if (/^fn_/.test(term)) {
	    type = "Footnote";
	}
	else {
	    type = "Glossary";
	}
	
	var entry = this.get_entry(term);

	// If we didn't find an entry show standard error message
	if (entry === undefined) {
	    Standard_Dialog.open("Can't find entry", {
		"title": type, 
		"modal": false, 
		"draggable": true, 
		"buttons": "none", 
		"position": [Xcoord, Ycoord]
	    });
	    safe_log("Glossary.show_definition: Can't find " + type + " entry for '" + term + "'");
	    return;
	}
	
	Standard_Dialog.open(entry, {
	    "title": type, 
	    "modal": false, 
	    "draggable": true, 
	    "buttons": "none", 
	    "position": [Xcoord, Ycoord],
            "element": $element
	});
	return;

    }, // end show_definition
    
    // This is the new way of displaying both click and hover terms
    show_term_def: function(term, Xclick, Yclick_top, Yclick_bottom, type) {

	// Save off local copy to increase speed
	var h_div;
	if (type === "hover") {
	    h_div = this.hoverDiv;
	}
	else {
	    h_div = this.stickyDiv;
	}
	
	var entry = this.get_entry(term);
	
	if (entry === undefined) {
	    entry = "Can't find entry";
	    safe_log("Glossary.show_hover_definition: Can't find entry for '" + term + "'");
	}
	
	// add data-type here so styling is in place before we
	// calculate height
	h_div.attr("data-type", this.get_prefix(term));
	h_div.css({"left": "-999px", "display": "block"});
	h_div.children('.glossary-content').html(entry);
	
	var Xcoord = 0;
	var Ycoord = 0;
	
	// Don't let left side of the div go past left side of page
	var p_width = h_div.outerWidth();
	if (Xclick - (p_width/2) > 9) {
	    Xcoord = Xclick - (p_width/2);
	}
	else {
	    Xcoord = 10;
	}

	// Display div above mouse by default

	if (type === "keydown") {
	    h_div.addClass("keydown");
	}
	else {
	    h_div.removeClass("keydown");
	}

	// top of viewport 
	var win_top_px = $(document).scrollTop();

	if (xBookUtils.inBrainhoneyPlayer()) {
	    win_top_px = $('#examcontainer').parent().scrollTop();
	}

	// height of hover div with content
	var p_height = h_div.outerHeight();

	// top of hover div with content
	var p_top_px = Yclick_top - p_height - 10;

	// Don't let top of the div go past top of viewport
	if (p_top_px > win_top_px) {
	    Ycoord = p_top_px;
	}
	else {
	    Ycoord = Yclick_bottom + 10;
	}
	
	h_div.css({"top": Ycoord + "px", "left": Xcoord + "px"});

	if (type === "keydown") {
	    document.getElementById('glossary-sticky-kb-leave').focus();
	}
    },

    get_entry: function(key) {
        key = key.replace(/{/g, "<");
	key = key.replace(/}/g, ">");

	var lc_key = key.toLowerCase();
	
	var entry = xBookUtils.terms[key];
	if (entry === undefined) {
	    entry = xBookUtils.terms[lc_key];
	}
	if (entry === undefined) {
	    entry = xBookUtils.terms[lc_key.singularize()];
	}
	if (entry === undefined) {
	    entry = xBookUtils.terms[lc_key.pluralize()];
	}
	if (entry === undefined) {
	    entry = xBookUtils.terms[key.singularize()];
	}
	if (entry === undefined) {
	    entry = xBookUtils.terms[key.pluralize()];
	}

	// If we found an entry return it
	if (entry !== undefined) {
	    return xBookUtils.prepareMarkup(entry);
	}
	
	// We didn't find the entry in the terms array so check for
	// the entry in the traditional <glossary>
	$('[data-type="glossaryentry"]').each(function() {
	    var $this = $(this);
	    var term = $this.children('[data-type="term"]').html();
	    if (key === term || lc_key === term) {
		entry = $this.children('[data-type="definition"]').html();
		return false;
	    }
	}); // end inner each

	return entry;
    },

    get_prefix: function (data_term) {
	var term_prefix = "gl";  // default is glossary

	// data_term may be undefined because no term attribute was set,
	// in this case it is a glossary def
	if (data_term === undefined) {
	    return term_prefix;
	}

	var pre_match = data_term.match(/^([a-z][a-z])_/);
	if (pre_match !== null) {
	    term_prefix = pre_match[1];
	}
	return term_prefix;
    },

    handle_mouse_event: function(element, event) {

	if (event === undefined || event === null) {
	    safe_log("Glossary.handle_mouse_event: empty event");
	    return;
	}

	var $element = $(element);

	var mouse_type = $element.attr('data-mouse');

	// set mouse type if not specified in html
	if (mouse_type !== "click" && 
	    mouse_type !== "hover" && 
	    mouse_type !== "noclick") {
	    
	    // mouse_type is 'click' by default
	    mouse_type = "click";

	    // local copy for speed
	    var hover = this.hoverTerms;
	    
	    // If hover is turned on globally we need to check if this 'type'
	    // has click turned off
	    if (hover === "on" || hover === "all") {
		var noclick_array = this.hoverTermsNoClick.split(",");
		if ($.inArray(this.get_prefix($element.attr('data-term')), noclick_array) >= 0) {
		    mouse_type = "noclick";
		}
		else {
		    mouse_type = "hover";
		}
	    }
	    else if (hover !== "off" && !xBookUtils.emptyValue(hover)) {
		var hover_array = hover.split(",");
		if ($.inArray(this.get_prefix($element.attr('data-term')), hover_array) >= 0) {
		    mouse_type = "hover";
		}
	    }
	}
	
	var $termref = $element;
	var term = $termref.attr("data-term"); 
	var offset = $termref.offset();
	// bitwise OR will truncate the decimal points
	var term_top = offset.top|0;

	if (xBookUtils.inBrainhoneyPlayer()) {
	    term_top += $('#examcontainer').parent().scrollTop();
	}

	var term_center = offset.left + (($termref.outerWidth())/2)|0;
	//var term_bottom = (offset.top + $termref.outerHeight())|0;
	var term_bottom = (term_top + $termref.outerHeight())|0;

	// If there is no data-term attribute than use the html in the span
	if (xBookUtils.emptyValue(term)) {
	    term = $termref.html();
	    
	    if (xBookUtils.emptyValue(term)) {
		safe_log("Glossary.handle_mouse_event: can't find term value");
		return false;
	    }
	}

	if (event.type === "click") {
	    if (mouse_type !== "noclick") {

                if (this.hoverTerms === "on") {
		    this.hoverDiv.css("display", "none");
                }

		if (this.useStickyDiv === "on") {
		    this.show_term_def(term, term_center, term_top, term_bottom, "click");
		}
		else {
		    this.show_definition(term, offset.left, offset.top, $element);
		}
	    }
	}
	else if (event.type === "mouseenter") {
	    if (mouse_type !== "click") {
		clearTimeout(this.hoverTimeout);
		this.hoverDiv.attr('data-mouse-active', '1');
		this.show_term_def(term, term_center, term_top, term_bottom, "hover");
	    }
	}
	else if (event.type === "mouseleave") {
	    if (mouse_type !== "click") {
		this.hoverDiv.attr('data-mouse-active', '0');
		this.hoverTimer = setTimeout(this.remove_hover, 1000);
	    }
	}
	else if (event.type === "keydown") {
	    // 13 = Enter key
	    if (event.keyCode == 13) {

		$termref.attr('data-last-focus', '1');
                if (this.useStickyDiv === "on") {
		    this.show_term_def(term, term_center, term_top, term_bottom, "keydown");
                }
                else {
                    this.show_definition(term, offset.left, offset.top);
                }
	    }
	}
    },

    remove_hover: function() {
	// Since we are calling this from setTimeout we need to refer to
	// the class variables through the player object
	clearTimeout(player.glossary.hoverTimeout);
	var mouse_active = player.glossary.hoverDiv.attr('data-mouse-active');
	if (mouse_active != 1) {
	    player.glossary.hoverDiv.css("display", "none");
	}
    },

    init: function(context) {
	
	// By default load asset/terms.js but if you don't need it to 
	// load then you can pass {terms: false} in the context object
	if (context !== undefined && context.terms !== undefined && 
	    context.terms === false) {
	    // do nothing if context.terms is false
	}
	else {
	    var termsFile = xBookUtils.getBaseUrl() + "asset/terms.js";
	    var body = document.getElementsByTagName("body")[0];
	    var script = document.createElement('script');
	    script.setAttribute('type','text/javascript');
	    script.setAttribute('src', termsFile);
	    body.appendChild(script);
	}
	
	this.hoverTerms = player.cfg_Glossary_hoverTerms || this.hoverTerms;
	this.hoverTermsNoClick = player.cfg_Glossary_hoverTermsNoClick || this.hoverTermsNoClick;
	this.useStickyDiv = player.cfg_Glossary_useStickyDiv || this.useStickyDiv;
	
	// Remove the click handler to terms added by init() in the parent class
	$("span[data-type='termref']").each(function() {
	    var $this = $(this);
	    $this.unbind('click');
	    $this.attr('tabindex', '0');
	});
	
	// Local copy for speed
	var $man = $('#manuscript');
	
	if ($man.length > 0) {

            var that = this;

            if (this.hoverTerms === "on") {
	        // Add div for terms
	        this.hoverDiv = $('<div id="glossary-hover-div" class="termdef-popup"><div class="glossary-content"></div></div>');
	        $man.append(this.hoverDiv);
                
	        this.hoverDiv.mouseenter(function() {
		    clearTimeout(this.hoverTimer);
		    $(this).attr('data-mouse-active', '1');
	        });
	        
	        this.hoverDiv.mouseleave(function() {
		    $(this).attr('data-mouse-active', '0');
		    that.hoverTimer = setTimeout(that.remove_hover, 1000);
	        });
            } // end if hoverTerms
	    
	    if (this.useStickyDiv === "on") {
		this.stickyDiv = $('<div id="glossary-sticky-div" class="termdef-popup"><div class="glossary-top-bar"><span id="glossary-sticky-close" tabindex="0"></span></div><div class="glossary-content"></div><div id="glossary-sticky-kb">[<span id="glossary-sticky-kb-leave" tabindex="0">Leave</span>] [<span id="glossary-sticky-kb-close" tabindex="0">Close</span>]</div></div>');
		$man.append(this.stickyDiv);
		this.stickyDiv.draggable({
		    cancel: ".glossary-close, .glossary-content",
		    handle: ".glossary-top-bar",
		    containment: "#manuscript"
		});
	
		this.stickyDiv.delegate('#glossary-sticky-close, #glossary-sticky-kb-close','keydown click', function(event) {
		    if (event.keyCode == 13 || event.type === "click") {
			that.stickyDiv.css('display', 'none');
			// return focus to last term clicked
			var $last_focus = $('[data-last-focus="1"]');
			if ($last_focus.length > 0) {
			    $last_focus.attr('data-last-focus', '0');
			    $last_focus.focus();
			}
		    }
		});
		this.stickyDiv.delegate('#glossary-sticky-kb-leave','keydown click', function(event) {
		    if (event.keyCode == 13 || event.type === "click") {
			// return focus to last term clicked
			var $last_focus = $('[data-last-focus="1"]');
			if ($last_focus.length > 0) {
			    $last_focus.attr('data-last-focus', '0');
			    $last_focus.focus();
			}
		    }
		});
	    } // end if useStickyDiv

            if (this.hoverTerms === "on") {
	        $man.delegate('[data-type="termref"]', 'mouseenter mouseleave click', function(event) {
		    player.glossary.handle_mouse_event(this, event);
	        });
            }
            else {
                $man.delegate('[data-type="termref"]', 'click', function(event) {
		    player.glossary.handle_mouse_event(this, event);
	        });
            }

	} // end if manuscript 
    } // end init
}); // end Glossary


/*
  Added by Bruce 11/03/2013

  Updates create_links to use the xBookUtils.create_links function,
  which adds the following:

  - honors the target attribute if set in the XML
  - keeps any custom data types set in the XML

  To use this updated create_links method add the following *AFTER* 
  the call to this._super in the initialize method for Player_subtype
  in your book's custom js file:

    this.xrefs = new XRefs_manuscript_subtype();

*/
var XRefs_manuscript_subtype = XRefs.extend({
    create_links: function(jq) {
	xBookUtils.create_links(jq);
    }
});


var Activity_manuscript_type = Activity.extend({
    // don't show any initialization alerts for ebook pages
    ARGA_initialization_alert: function() {
	// ... unless a md value says to override that
	if (player.md.show_standard_arga_initialization == "true") {
	    this._super();
	} else {
	    // we just have to call ARGA_initialization_final
	    player.activity.ARGA_initialization_final();
	}
    },
    
    // also don't show grade saved message
    show_grade_saved_message: function() {
	// ... unless a md value says to override that
	if (player.md.show_standard_arga_grade_saved_message == "true") {
	    this._super();
	}
    }
    
});


var Player_manuscript_type = Player.extend({

    // Global config variables
    // set to "on" to automatically remove wrapper <div>s around rawhtml
    removeRawHtmlDivs: "off",
    // set to "on" to enable 'show answer' button
    showAnswer: "off",
    // set to "off" to turn off auto wrapping of answers embedded in xml
    showAnswerWrapThis: "on",
    // set to "on" to automatically move box title (h3) out of inner box
    Box_moveTitle: "off",
    // block_types (separated by commas)  
    Box_moveTitleExclude: "",
    // Hack to fix duplicate title header in XB doc viewer
    XBDocumentViewerHeaderFix: "off",
    // Remove the notes button in the XB doc viewer (cfg_XBDocumentViewerHeaderFix
    // must be turned on).
    XBDocumentViewerRemoveNotes: "off",

    // Add default page number functionality
    pageNumbers: "on",
    // Prefix string to be shown before page number in print_page_box
    PPB_prefix: "Printed Page ",
    // 'Continuation' string to be shown after page number if in print_page_box 
    PPB_continued: "(cont.)",
    // Prefix string to be shown before page number in page_starts
    pageStart_prefix: "Page ",
    // Hide/Show page numbers menu item in print_page_box
    PPM_pageNumberToggle: "on",
    // 'Go to page' menu item in print_page_box
    PPM_pageJump: "on",
    // Check for supp_content and add menu toggle if found
    PPM_supplementalContent: "on",
    
    // There is currently a bug in PX where if we open up ebook pages with
    // renderIn=supp the Home button (among others) still appear.  This removes them.
    removePXSuppButtons: "on",
    
    // This variable is intended to be private and will be set accordingly when the
    // player loads.  Developers should not touch this variable.
    PXWindowName: "", // This will hold the "name" of the outermost PX main window

    show_section_animate: function(section_to_show, direction) {
	// make sure modal window is closed
	$("#toc_dialog").dialog("close");
	
	// slide in using parent function
	this._super(section_to_show, direction);
	
	// update slide_number and title
	$(".slide_title").html(this.get_current_section().title);
	$(".slide_number").find("span").html((section_to_show+1) + " of " + this.sections.length + " ");
	
	// if this is the first/last section, dim the previous/next button
	if (this.section_currently_showing == 0) {
	    $(".previous_button").addClass("button_dimmed");
	} else {
	    $(".previous_button").removeClass("button_dimmed");
	}
	
	if (this.section_currently_showing == (this.sections.length - 1)) {
	    $(".next_button").addClass("button_dimmed");
	} else {
	    $(".next_button").removeClass("button_dimmed");
	}
        $(document).trigger('df-content-rendered'); //added as DF-57
	
    },
    
    show_navigation: function() {
	// if there are no subsections, there's no navigation to show
	if (this.sections.length == 1) {
	    return;
	}
	
	var table = "<table><tr>"
	    + "<td>"+ UI_Elements.get_button_html({
		extra_class: "toolbar_button prev_next_buttons previous_button",
		label: this.md.previous_page_button, 
		fn: 'player.show_section("previous")'
	    }) + "</td>"
	
	    + "<td>"+ UI_Elements.get_button_html({
		extra_class: "toolbar_button slide_number",
		label: "1 of " + this.sections.length, 
		fn: 'player.show_toc()'
	    }) + "</td>"
	
	    + "<td>"+ UI_Elements.get_button_html({
		extra_class: "toolbar_button prev_next_buttons next_button",
		label: this.md.next_page_button, 
		fn: 'player.show_section("next")'
	    }) + "</td>"
	
	    + "</tr></table>"
	
	$("#manuscript").prepend("<div id='toolbar_top' class='toolbar'>" + table + "</div>");
	$("#manuscript").append("<div id='toolbar_bottom' class='toolbar'>" + table + "</div>");
	$("#toolbar").show();
	
	// icons for toolbar and next buttons...
	$('.previous_button').button({
            icons: {
                primary: "ui-icon-circle-triangle-w"
            }
        });
	$('.next_button').button({
            icons: {
                secondary: "ui-icon-circle-triangle-e"
            }
        });
	$('.slide_number').button({
            icons: {
                secondary: "ui-icon-circle-triangle-s"
            }
        });
	
	// activate all other buttons
	UI_Elements.activate_buttons();
    },
    
    show_toc: function() {
	$("#toc_dialog").remove();
	
	var html = "";
	for (var i = 0; i < this.sections.length; ++i) {
	    var s = this.sections[i];
	    var extra_style = "";
	    if (this.md.sequenced_sections == "true" && i > this.last_available_section) {
		extra_style = "toc_section_not_available";
	    }
	    html += "<div class='toc_section_title " + extra_style + "'"
		+ " onclick='player.show_section(" + i + ")'"
		+ ">"
	    ;
	    if (s.number != null) {
		html += s.number + " ";
	    }
	    html += s.title 
		+ "</div>"
	    ;
	}
	
	if (this.md.sequenced_sections == "true") {
	    html = "<div id='toc_head'>Click on a slide to view it. Note: Grey slides are not accessible until preceding slides have been viewed or completed.</div>" + html;
	}
	
	html = "<div id='toc_dialog'>" + html + "</div>";
	$("body").append(html);
	$("#toc_dialog").dialog({title:"Jump To...", width:450, modal:true, buttons: [ {text:"OK", click: function() {$("#toc_dialog").dialog("close");}}]});
    },
    
    extract_activity_metadata: function() {
	this._super();
	
	this.required_metadata_val("next_page_button", "Read on!", true);
	this.required_metadata_val("previous_page_button", "Back up", true);
	
	// by default we do not require students to go through slides in order,
	// and we restore them to their last-viewed slide when they return.
	this.required_metadata_val("sequenced_sections", "false");
	this.required_metadata_val("restore_last_viewed_section", "true");
	this.required_metadata_val("section_sequence_message", "You must read each page, and complete any questions on the page, in sequence.");
    },
    
    
    initialize_sections: function() {
	
        // Added by Bruce 11/03/2013
        // Save original ID on each section to data-sec-id before _super replaces it.
	$('[data-type="section"]').each(function() {
            var $this = $(this);
	    $this.attr('data-sec-id', $this.attr('id'));
	});
	
        this._super();
	
	// Add class to body if we are viewing page in supp window
	(function() {
	    try {
		var $supp_iframe = $('#xBookSuppWinNavPageFrame', window.parent.document);
		if ($supp_iframe.length != 0) {
		    $("body").addClass("xBookSuppWinNavPage");
		}
	    }
	    catch(err) { }
	})();
	
	if (this.removeRawHtmlDivs === "on") {
	    $('[data-type="rawhtml"]').each(function() {
		var $this = $(this);
		var raw_content = $this.contents();
		$this.replaceWith(raw_content);
	    });
	}
	
	var boxMoveTitle = this.Box_moveTitle;
	if (boxMoveTitle === "all") {
	    var excludes_array = this.Box_moveTitleExclude.split(",");
	    $('[data-type="box"]').each(function() {
		$this = $(this);
		var block_type = $this.attr('data-block_type');
		if (!xBookUtils.emptyValue(block_type)) {
		    if ($.inArray(block_type, excludes_array) >= 0) {
			return;
		    }
		}
		$this.each(xBookUtils.moveBoxTitle);
	    });
	}
	else if (boxMoveTitle !== "off") {
	    var includes_array = this.Box_moveTitle.split(",");
	    $('[data-type="box"]').each(function() {
		$this = $(this);
		var block_type = $this.attr('data-block_type');
		if (!xBookUtils.emptyValue(block_type)) {
		    if ($.inArray(block_type, includes_array) >= 0) {
			$this.each(xBookUtils.moveBoxTitle);
		    }
		}
	    });
	}

	if (this.showAnswer === "on") {
	    // Add click handler for show answer buttons
	    $('.show_answer_button').live("click", function() {
		$this = $(this);
		
		// Show Answer button must have a target (this should
		// always be the case but we'll check anyway)
		var target_id = $this.attr('data-target');
		if (xBookUtils.emptyValue(target_id)) {
		    safe_log("showAnswer: no target set on button");
		    return;
		}
		
		// Make sure target(answer) container exists
		var $container = $("#" + target_id);
		if ($container.length < 1) {
		    safe_log("showAnswer: target #" + target_id + " does not exist");
		    return;
		}
		
		// Toggle the 'show_answer_button_on' class for both the
		// button and the answer container
		$this.toggleClass('show_answer_button_on');
		$container.toggleClass('show_answer_button_on');
	    });

	    // Look for any elements with data-show-answer
            var wrap_answer = this.showAnswerWrapThis;
	    $('[data-show-answer]').each(function() {
		var $this = $(this);
		
		// If we've already found an answer for this element we are done
		if ($this.attr('data-found-show-answer') === "true") {
		    return;
		}
		
		var answer_id = $this.attr('id');
		var type = $this.attr('data-show-answer');
		
		if (type === "this") {
		    var this_wrap = $this.attr('data-show-answer-wrap');

                    $this.attr('data-found-show-answer', "true");
                    // Do we need to wrap this answer in a box?
		    if ((wrap_answer === "on" && this_wrap !== "false") ||
			this_wrap === "true") {
			$this.before("<button data-target='" + answer_id + "-wrapper' class='show_answer_button'></button>");
			$this.wrap(function() {
			    return "<div id='" + answer_id + "-wrapper' class='show_answer_container' data-found-show-answer='true'></div>";
			});
			$this.before("<h3 class='show_answer_title'></h3>");
		    }
                    else {
		        $this.before("<button data-target='" + answer_id + "' class='show_answer_button'></button>");
		        $this.addClass('show_answer_container');
                    }
		}
		else if (type === "array") {
		    // Check if answer is stored in xBookUtils.showAnswers array
		    $this.each(xBookUtils.checkShowAnswer);
		}
	    });
	} // end showAnswer === "on"

    }, // end initialize_sections
    
    initialize: function(id) {
	
	xBookUtils.debug("digfir_ebook.js version number: " + xBookUtils.DFVersionNumber);

	this.removePXSuppButtons = this.cfg_removePXSuppButtons || this.removePXSuppButtons;
	if (this.removePXSuppButtons === "on" && xBookUtils.inPXSuppWin()) {
	    xBookUtils.removePXSuppControls();
	}
	
	var $body = $('body');
	var $html = $('html');

	if (xBookUtils.inBrainhoneyPlayer()) {
	    $html.addClass('bh_player');
	    $body.addClass('bh_html_quiz_ebook');
	}

	// Set scrollWindow (if needed) - currently this is only used for
	// the docviewer in PX
	if (xBookUtils.inDocViewer()) {
	    try {
		//xBookUtils.scrollWindow = window.parent.parent.parent;
		xBookUtils.scrollWindow = top.window;
		xBookUtils.debug("initialize: setting scroll window to top (" + xBookUtils.scrollWindow.name + ")");		 
	    }
	    catch(err) { 
		safe_log("initialize: Can't get scrollWindow in docviewer");
		xBookUtils.scrollWindow = undefined;
	    }
	}

	// We need to do this before _super because the original XRefs.create_links
	// will wipe out any custom data-attributes we have set on the link spans
	// and it won't honor the target set in the XML.
	// 
	// Really, we should change XRefs.create_links do everything that 
	// xBookUtils.create_links is doing and then it wouldn't be necessary 
	// to call this here or even extend XRefs in the first place.
	xBookUtils.create_links($body);

	this._super(id);
	
	// Add height to <div> around <object> so PX will calculate
	// content height correctly.  Do this after_super() so that
	// Figure media has been processed.
	$('object').each(function() {
            var $this = $(this);

	    // We always want to wrap a <div> around the <object> so we 
	    // ensure that we are setting the height on the correct <div>
	    $this.wrap('<div class="df_obj_div"></div>');

            var height = $this.attr('height');
	    if (xBookUtils.emptyValue(height) || height < 1) {
		var $param = $this.children('[name="height"]');
		if ($param.length > 0) {
		    height = $param.attr('value');
		}
	    }
	    if (xBookUtils.emptyValue(height) || height < 1) {
		height = $this.height();
	    }

	    // Set the height on the parent <div> we added above
            if (!xBookUtils.emptyValue(height) && height > 0) {
		var $parent = $this.parent('.df_obj_div');
		$parent.css('height', height + "px");
            }
	    
        });

        // set some global config variables
	this.removeRawHtmlDivs = this.cfg_removeRawHtmlDivs || this.removeRawHtmlDivs;
        this.showAnswer = this.cfg_showAnswer || this.showAnswer;
        this.showAnswerWrapThis = this.cfg_showAnswerWrapThis || this.showAnswerWrapThis;
	this.Box_moveTitle = this.cfg_Box_moveTitle || this.Box_moveTitle;
	this.Box_moveTitleExclude = this.cfg_Box_moveTitleExclude || this.Box_moveTitleExclude;
	this.XBDocumentViewerHeaderFix = this.cfg_XBDocumentViewerHeaderFix || this.XBDocumentViewerHeaderFix;
	this.XBDocumentViewerRemoveNotes = this.cfg_XBDocumentViewerRemoveNotes || this.XBDocumentViewerRemoveNotes;

	// page numbering configs
	this.pageNumbers = this.cfg_pageNumbers || this.pageNumbers;
	this.PPB_prefix = this.cfg_PPB_prefix || this.PPB_prefix;
	this.PPB_continued = this.cfg_PPB_continued || this.PPB_continued;
	this.pageStart_prefix = this.cfg_pageStart_prefix || this.pageStart_prefix;
	this.PPM_pageNumberToggle = this.cfg_PPM_pageNumberToggle || this.PPM_pageNumberToggle;
	this.PPM_pageJump = this.cfg_PPM_pageJump || this.PPM_pageJump;
	this.PPM_supplementalContent = this.cfg_PPM_supplementalContent || this.PPM_supplementalContent;
	
	if (this.XBDocumentViewerHeaderFix === "on") {
	    xBookUtils.FixXBDocViewHeader();
	}

	// after we call this.super, re-initialize the activity to the custom
	// activity type for this manuscript
	this.activity = new Activity_manuscript_type();
    },

    initialize2: function() {
        this._super();

	/* PXWindowName: We need the window of the main PX content frame to have 
	   a "name" so we can target links from the supp window.  If the window
	   already has a name then we'll just it otherwise we create a unique
	   name and assign it to the window.  PXWindowName will hold whatever
	   name we end up with. */
	if (xBookUtils.inPXFrame()) {
	    try {
		// get outermost parent  
		//var frame_parent = window.parent.parent.parent;
		var frame_parent = top.window;

		// if name is not empty then set PXWindowName to name
		if (!xBookUtils.emptyValue(frame_parent.name)) {
		    this.PXWindowName = frame_parent.name;
		    xBookUtils.debug("In main PX window, found PX window name " + frame_parent.name);
		}
		else {
		    this.PXWindowName = "PXWindowName" + xBookUtils.generateRandomNumber(999, 999999);
		    frame_parent.name = this.PXWindowName;
		    xBookUtils.debug("In main PX window, did not find PX window name, setting name to " + this.PXWindowName);
		}
	    }
	    catch(err) {
		xBookUtils.debug("In main PX windos, can't set PX window name: " + err.message);
	    }
	}
	/* If we are in the supp window then we need to set PXWindowName to the
	   name of the main PX content frame. */
	if (xBookUtils.inPXSuppWin()) {
	    try {
		this.PXWindowName = top.window.opener.name;
		xBookUtils.debug("In suppwin, setting PXWindowName to " + this.PXWindowName);
	    }
	    catch(err) {
		xBookUtils.debug("In suppwin, can't determine PX window name: " + err.message);
	    }
	}
	
	// If not running in ARGA mode and not in the main wrapper frame then disable
	// all questions
	var ARGA_questions = $('[data-type="question"]');
        /*
	if (ARGA_questions.length > 0 && this.ARGA_running === false && !xBookUtils.inDFWrapper()) {
	    xBookUtils.debug("Not in ARGA mode and not in wrapper, disabling all questions");
	    
	    ARGA_questions.each(function() {
		var $this = $(this);
		xBookUtils.debug("Disabling question " + $this.attr('id'));
		$this.children('.question_action_div').remove();
		$this.find('input[type="radio"]').attr("disabled",true);
		$this.find('textarea').attr("disabled",true);
		$this.find('input').attr("disabled",true);
		$this.find('.query_matching_item').unbind('click').removeClass('active');
	    });
	}
        */
	
	// Add listener for hashchange
	/* We are going to brute force this with a timer that looks for changes
	   in the anchor_id URL param but eventually we should change this to 
	   a listener on the 'hashchange' event */
	if (xBookUtils.inPXFrame()) {
	    xBookUtils.initAnchorId = xBookUtils.getURLParameter('anchor_id');
	    xBookUtils.debug("Setting initAnchorId to " + xBookUtils.initAnchorId);

	    setInterval(function() {
		var curr_anchor_id = xBookUtils.getURLParameter('anchor_id');
		if (xBookUtils.initAnchorId !== curr_anchor_id) {
		    xBookUtils.initAnchorId = curr_anchor_id;
		    xBookUtils.scrollToElement(curr_anchor_id);
		    xBookUtils.debug("Detected change in anchor_id, setting initAnchorId to " + xBookUtils.initAnchorId);
		}
	    }, 500);
	    
	}
	
	// get brightcove videos using <object> to play in brainhoney
	if (xBookUtils.inBrainhoneyPlayer()) {
	    if ($('object.BrightcoveExperience').length > 0) {
		brightcove.createExperiences();
	    }
	}

	// If we are in docviewer on PX then we need to make sure the scroll bar starts
	// in the correct position, unless "fragment" is in the URL which is the PX
	// method of targetting an ID and we don't want to mess with that.
	var px_fragment = xBookUtils.getURLParameter("fragment");
	if (xBookUtils.emptyValue(px_fragment)) {
	    if (xBookUtils.inDocViewer()) {
		xBookUtils.debug("initialize2: no fragment detected in URL, setting initial scroll bar position for docviewer to " + xBookUtils.getPageHeaderHeight());
		xBookUtils.scrollWindow.scrollTo(0,xBookUtils.getPageHeaderHeight()); 
	    }
	    
	    // Check for anchor fragment on URL
	    if (!xBookUtils.emptyValue(xBookUtils.pageCompleteURL.attr('fragment'))) {
		var anchor_elem = document.getElementById(xBookUtils.pageCompleteURL.attr('fragment'));
		xBookUtils.debug("anchor_elem: " + anchor_elem);
		if (anchor_elem !== null) {
		    if (xBookUtils.inDocViewer()) {
			
		    }
		    else {
			xBookUtils.debug("scrolling to: " + anchor_elem);
			anchor_elem.scrollIntoView();
		    }
		}
	    }
	}
	else {
	    xBookUtils.debug("initialize2: detected fragment value (" + px_fragment + ") in URL, disabling autoscroll to top");
	}

	// Check for anchor id
	var top_anchor_id = xBookUtils.getURLParameter("anchor_id");
	if (!xBookUtils.emptyValue(top_anchor_id)) {
	    xBookUtils.debug("Found anchor_id " + top_anchor_id);
	    var anchor_timer =  setInterval(function() {
		var page_loaded = xBookUtils.PXPageLoaded();
		if (page_loaded === true) {
		    xBookUtils.scrollToElement(top_anchor_id);
		    clearInterval(anchor_timer);
		}
		// if page_loaded is 'false' or 'undefined' then we try again
	    }, 500);
	}
	
	// Check if we need to process questions
	// First convert any HTML Quiz questions to Native PX
	(function () {
	    if (xBookUtils.inDFWrapper() || xBookUtils.inDFEbookSuppWin()) {
		$("a\\:question").each(function() {
		    $this = $(this);
		    
                    var $metadata = $this.find('[data-type="metadata"]');
		    
                    if ($metadata.length > 0) {
			$metadata.appendTo($(this).parent());
                    }	
		    
		    var queryid = $this.attr('queryid');
		    $this.attr('data-type', 'query_display');
		    $this.attr('questionid', queryid);	    
		});
	    }
	})();
        (function () {
	    var $questions = $('[data-type="question"]').has('[data-type="query_display"]');
	    if ($questions.length > 0) {
		xBookUtils.procNativePXQuestions($questions);
	    }
        })();
	
	// add tabindex to any elements that are clickable
	$('[data-href]').each(function() {
	    $this = $(this);
	    var tabindex = $this.attr('tabindex');
	    if (xBookUtils.emptyValue(tabindex)) {
		$this.attr('tabindex', '0');
	    }
	});

	// Set up print page box/page numbers
	if (this.pageNumbers === "on") {
	    xBookUtils.setupPageNumbers();
	}
	   
	// Disable any ebook page links if viewing in LC page viewer
	// We will need to expand this to take aliases into account
	// Note: If it is an alias maybe we should de-activate it regardless
	// what it points to?
	if (xBookUtils.inLCViewer()) {
	    $('a').each(function() {
		var $this = $(this);
		var href = $this.attr('href');
		
		if (!xBookUtils.emptyValue(href)) {		    
		    if (xBookUtils.ebookPage(href)) {
			var link_html = $this.html();
			$this.replaceWith("<span>" + link_html + "</span>");
		    }
		}
	    });
	}

        // termrefs: make keypress trigger a click
        $("#manuscript").delegate("[data-type='termref']", "keypress", function(event) {
            if (event.keyCode == 13) {
                $(this).trigger("click");
            }
        });
        
	if (xBookUtils.inPXSuppWin()) {
	    xBookUtils.fixSuppWinBlueBarBug();
	}
    }

}); // end Player_manuscript_type


player = new Player_manuscript_type();


/******************************************************** 

  xBookUtils: Library of common functionality for ebooks.

*********************************************************/

/* 
 * inflection-js: find singular/plural of noun
 * http://code.google.com/p/inflection-js/
 */
if(window&&!window.InflectionJS){window.InflectionJS=null}InflectionJS={uncountable_words:['equipment','information','rice','money','species','series','fish','sheep','moose','deer','news'],plural_rules:[[new RegExp('(m)an$','gi'),'$1en'],[new RegExp('(pe)rson$','gi'),'$1ople'],[new RegExp('(child)$','gi'),'$1ren'],[new RegExp('^(ox)$','gi'),'$1en'],[new RegExp('(ax|test)is$','gi'),'$1es'],[new RegExp('(octop|vir)us$','gi'),'$1i'],[new RegExp('(alias|status)$','gi'),'$1es'],[new RegExp('(bu)s$','gi'),'$1ses'],[new RegExp('(buffal|tomat|potat)o$','gi'),'$1oes'],[new RegExp('([ti])um$','gi'),'$1a'],[new RegExp('sis$','gi'),'ses'],[new RegExp('(?:([^f])fe|([lr])f)$','gi'),'$1$2ves'],[new RegExp('(hive)$','gi'),'$1s'],[new RegExp('([^aeiouy]|qu)y$','gi'),'$1ies'],[new RegExp('(x|ch|ss|sh)$','gi'),'$1es'],[new RegExp('(matr|vert|ind)ix|ex$','gi'),'$1ices'],[new RegExp('([m|l])ouse$','gi'),'$1ice'],[new RegExp('(quiz)$','gi'),'$1zes'],[new RegExp('s$','gi'),'s'],[new RegExp('$','gi'),'s']],singular_rules:[[new RegExp('(m)en$','gi'),'$1an'],[new RegExp('(pe)ople$','gi'),'$1rson'],[new RegExp('(child)ren$','gi'),'$1'],[new RegExp('([ti])a$','gi'),'$1um'],[new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$','gi'),'$1$2sis'],[new RegExp('(hive)s$','gi'),'$1'],[new RegExp('(tive)s$','gi'),'$1'],[new RegExp('(curve)s$','gi'),'$1'],[new RegExp('([lr])ves$','gi'),'$1f'],[new RegExp('([^fo])ves$','gi'),'$1fe'],[new RegExp('([^aeiouy]|qu)ies$','gi'),'$1y'],[new RegExp('(s)eries$','gi'),'$1eries'],[new RegExp('(m)ovies$','gi'),'$1ovie'],[new RegExp('(x|ch|ss|sh)es$','gi'),'$1'],[new RegExp('([m|l])ice$','gi'),'$1ouse'],[new RegExp('(bus)es$','gi'),'$1'],[new RegExp('(o)es$','gi'),'$1'],[new RegExp('(shoe)s$','gi'),'$1'],[new RegExp('(cris|ax|test)es$','gi'),'$1is'],[new RegExp('(octop|vir)i$','gi'),'$1us'],[new RegExp('(alias|status)es$','gi'),'$1'],[new RegExp('^(ox)en','gi'),'$1'],[new RegExp('(vert|ind)ices$','gi'),'$1ex'],[new RegExp('(matr)ices$','gi'),'$1ix'],[new RegExp('(quiz)zes$','gi'),'$1'],[new RegExp('s$','gi'),'']],apply_rules:function(str,rules,skip,override){if(override){str=override}else{var ignore=(skip.indexOf(str.toLowerCase())>-1);if(!ignore){for(var x=0;x<rules.length;x++){if(str.match(rules[x][0])){str=str.replace(rules[x][0],rules[x][1]);break}}}}return str}};if(!String.prototype._uncountable_words){String.prototype._uncountable_words=InflectionJS.uncountable_words}if(!String.prototype._plural_rules){String.prototype._plural_rules=InflectionJS.plural_rules}if(!String.prototype._singular_rules){String.prototype._singular_rules=InflectionJS.singular_rules}if(!String.prototype.pluralize){String.prototype.pluralize=function(plural){return InflectionJS.apply_rules(this,this._plural_rules,this._uncountable_words,plural)}}if(!String.prototype.singularize){String.prototype.singularize=function(singular){return InflectionJS.apply_rules(this,this._singular_rules,this._uncountable_words,singular)}}

/*
 * Purl (A JavaScript URL parser) v2.3.1
 * Developed and maintanined by Mark Perkins, mark@allmarkedup.com
 * Source repository: https://github.com/allmarkedup/jQuery-URL-Parser
 * Licensed under an MIT-style license. See https://github.com/allmarkedup/jQuery-URL-Parser/blob/master/LICENSE for details.
 */
;(function(factory){if(typeof define==='function'&&define.amd){define(factory)}else{window.purl=factory()}})(function(){var tag2attr={a:'href',img:'src',form:'action',base:'href',script:'src',iframe:'src',link:'href',embed:'src',object:'data'},key=['source','protocol','authority','userInfo','user','password','host','port','relative','path','directory','file','query','fragment'],aliases={'anchor':'fragment'},parser={strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/},isint=/^[0-9]+$/;function parseUri(url,strictMode){var str=decodeURI(url),res=parser[strictMode||false?'strict':'loose'].exec(str),uri={attr:{},param:{},seg:{}},i=14;while(i--){uri.attr[key[i]]=res[i]||''}uri.param['query']=parseString(uri.attr['query']);uri.param['fragment']=parseString(uri.attr['fragment']);uri.seg['path']=uri.attr.path.replace(/^\/+|\/+$/g,'').split('/');uri.seg['fragment']=uri.attr.fragment.replace(/^\/+|\/+$/g,'').split('/');uri.attr['base']=uri.attr.host?(uri.attr.protocol?uri.attr.protocol+'://'+uri.attr.host:uri.attr.host)+(uri.attr.port?':'+uri.attr.port:''):'';return uri}function getAttrName(elm){var tn=elm.tagName;if(typeof tn!=='undefined')return tag2attr[tn.toLowerCase()];return tn}function promote(parent,key){if(parent[key].length===0)return parent[key]={};var t={};for(var i in parent[key])t[i]=parent[key][i];parent[key]=t;return t}function parse(parts,parent,key,val){var part=parts.shift();if(!part){if(isArray(parent[key])){parent[key].push(val)}else if('object'==typeof parent[key]){parent[key]=val}else if('undefined'==typeof parent[key]){parent[key]=val}else{parent[key]=[parent[key],val]}}else{var obj=parent[key]=parent[key]||[];if(']'==part){if(isArray(obj)){if(''!==val)obj.push(val)}else if('object'==typeof obj){obj[keys(obj).length]=val}else{obj=parent[key]=[parent[key],val]}}else if(~part.indexOf(']')){part=part.substr(0,part.length-1);if(!isint.test(part)&&isArray(obj))obj=promote(parent,key);parse(parts,obj,part,val)}else{if(!isint.test(part)&&isArray(obj))obj=promote(parent,key);parse(parts,obj,part,val)}}}function merge(parent,key,val){if(~key.indexOf(']')){var parts=key.split('[');parse(parts,parent,'base',val)}else{if(!isint.test(key)&&isArray(parent.base)){var t={};for(var k in parent.base)t[k]=parent.base[k];parent.base=t}if(key!==''){set(parent.base,key,val)}}return parent}function parseString(str){return reduce(String(str).split(/&|;/),function(ret,pair){try{pair=decodeURIComponent(pair.replace(/\+/g,' '))}catch(e){}var eql=pair.indexOf('='),brace=lastBraceInKey(pair),key=pair.substr(0,brace||eql),val=pair.substr(brace||eql,pair.length);val=val.substr(val.indexOf('=')+1,val.length);if(key===''){key=pair;val=''}return merge(ret,key,val)},{base:{}}).base}function set(obj,key,val){var v=obj[key];if(typeof v==='undefined'){obj[key]=val}else if(isArray(v)){v.push(val)}else{obj[key]=[v,val]}}function lastBraceInKey(str){var len=str.length,brace,c;for(var i=0;i<len;++i){c=str[i];if(']'==c)brace=false;if('['==c)brace=true;if('='==c&&!brace)return i}}function reduce(obj,accumulator){var i=0,l=obj.length>>0,curr=arguments[2];while(i<l){if(i in obj)curr=accumulator.call(undefined,curr,obj[i],i,obj);++i}return curr}function isArray(vArg){return Object.prototype.toString.call(vArg)==="[object Array]"}function keys(obj){var key_array=[];for(var prop in obj){if(obj.hasOwnProperty(prop))key_array.push(prop)}return key_array}function purl(url,strictMode){if(arguments.length===1&&url===true){strictMode=true;url=undefined}strictMode=strictMode||false;url=url||window.location.toString();return{data:parseUri(url,strictMode),attr:function(attr){attr=aliases[attr]||attr;return typeof attr!=='undefined'?this.data.attr[attr]:this.data.attr},param:function(param){return typeof param!=='undefined'?this.data.param.query[param]:this.data.param.query},fparam:function(param){return typeof param!=='undefined'?this.data.param.fragment[param]:this.data.param.fragment},segment:function(seg){if(typeof seg==='undefined'){return this.data.seg.path}else{seg=seg<0?this.data.seg.path.length+seg:seg-1;return this.data.seg.path[seg]}},fsegment:function(seg){if(typeof seg==='undefined'){return this.data.seg.fragment}else{seg=seg<0?this.data.seg.fragment.length+seg:seg-1;return this.data.seg.fragment[seg]}}}}purl.jQuery=function($){if($!=null){$.fn.url=function(strictMode){var url='';if(this.length){url=$(this).attr(getAttrName(this[0]))||''}return purl(url,strictMode)};$.url=purl}};purl.jQuery(window.jQuery);return purl});

/* 
   jScrollElement plugin

   This plugin causes an element to behave as if it had
   position:fixed.  We can't actually use position:fixed in PX
   due to the way vertical scrolling is implemented, so use this
   plugin instead.

   Usage: jQueryObj.jScrollElement(); 

*/
(function(a){a.fn.jScrollElement=function(c){var d=a.extend({},a.fn.jScrollElement.defaults,c);return this.each(function(){var f=a(this);var g=a("#fne-content",window.parent.document);if(g.length<1){g=a(window.top.document)}var e=new b(f);g.scroll(function(){f.stop().animate(e.getMargin(g),d.speed)})});function b(e){this.min=e.offset().top;this.originalMargin=parseInt(e.css("margin-top"),10)||0;this.getMargin=function(h){var f=e.parent().height()-e.outerHeight();var g=this.originalMargin;if(h.scrollTop()>=this.min){g=g+d.top+h.scrollTop()-this.min}if(g>f){g=f}return({marginTop:g+"px"})}}};a.fn.jScrollElement.defaults={speed:"fast",top:10}})(jQuery);

/*
 * jQuery imagesLoaded plugin v2.1.2
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */
/* 
   This plugin allows you to execute a callback function once all of 
   the images on the page have been loaded:
   
     $('#manuscript').imagesLoaded(callback);

*/
(function(c,q){var m="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(f){function n(){var b=c(j),a=c(h);d&&(h.length?d.reject(e,b,a):d.resolve(e));c.isFunction(f)&&f.call(g,e,b,a)}function p(b){k(b.target,"error"===b.type)}function k(b,a){b.src===m||-1!==c.inArray(b,l)||(l.push(b),a?h.push(b):j.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),r&&d.notifyWith(c(b),[a,e,c(j),c(h)]),e.length===l.length&&(setTimeout(n),e.unbind(".imagesLoaded",
p)))}var g=this,d=c.isFunction(c.Deferred)?c.Deferred():0,r=c.isFunction(d.notify),e=g.find("img").add(g.filter("img")),l=[],j=[],h=[];c.isPlainObject(f)&&c.each(f,function(b,a){if("callback"===b)f=a;else if(d)d[b](a)});e.length?e.bind("load.imagesLoaded error.imagesLoaded",p).each(function(b,a){var d=a.src,e=c.data(a,"imagesLoaded");if(e&&e.src===d)k(a,e.isBroken);else if(a.complete&&a.naturalWidth!==q)k(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=m,a.src=d}):
n();return d?d.promise(g):g}})(jQuery);


// purl object for easy access to URL info
xBookUtils.pageCompleteURL = $.url();

// glossary/footnotes hash table
if (typeof xBookUtils.terms == "undefined") {
    xBookUtils.terms = {};
}
// show answer hash table
xBookUtils.showAnswers = {};
// store link aliases
if (typeof xBookUtils.links == "undefined") {
    xBookUtils.links = {};
}

// store config values for supplemental content
xBookUtils.supp_content = {};
xBookUtils.supp_content['IN'] = { hide: "Hide instructor notes", show: "Show instructor notes", instructor_only: true, visible: true, order: 5 };
xBookUtils.supp_content['GN'] = { hide: "Hide notes", show: "Show notes", instructor_only: false, visible: true, order: 2 };

// scrollbar window
xBookUtils.scrollWindow = undefined;

// turn this on to print debug statements
xBookUtils.printDebugStatements = "off";

// initial anchor_id hash
xBookUtils.initAnchorId = undefined;


/* 
   getBookId: Return book ID (pulled from the URL).  If for some reason this
   fails (which it really shouldn't) return undefined.
*/

xBookUtils.getBookId = function() {
    
    if (!xBookUtils.emptyValue(xBookUtils.bookID)) {
	return xBookUtils.bookID;
    }

    var baseURL = xBookUtils.getBaseUrl();
    var match = baseURL.match(/\/([^\/]+)\/$/);
    if (match != null) {
	// redefine function so we don't have to do all this work next time
	xBookUtils.getBookId = function() { return match[1]; }
	return match[1];
    }
    return undefined;
}


/*
  getChapter: Returns the current (numeric) chapter.  Return undefined if 
  chapter can't be determined.

  1. Looks for data-chapter-number on manuscript div (this should always happen)
  2. Look for chapter number in URL (as a backup in case the above failed)
*/

xBookUtils.getChapter = function () {
    
    // Check for data-chapter-number on manuscript div
    var $manuscript = $("#manuscript");
    
    if ($manuscript.length > 0) {
	var chapter_number = $manuscript.attr('data-chapter-number');
	if (!xBookUtils.emptyValue(chapter_number)) {
	    // redefine function so we don't have to do all this work next time
	    xBookUtils.getChapter = function() { return chapter_number; }
	    return chapter_number;
	}
    }
    
    // Look at URL
    var pageUrl = xBookUtils.getPageUrl();
    var match = pageUrl.match(/_ch(\d+)_/);
    if (match != null) {
	// redefine function so we don't have to do all this work next time
	xBookUtils.getChapter = function() { return match[1]; }
	return match[1];
    }
    
    return undefined;
}


/* 
   getPageUrl: Returns URL of page (not including hash fragment or query string).
*/

xBookUtils.getPageUrl = function() {
    // Check query string for "ContentUrl" or Url"
    var url = xBookUtils.getURLParameter('ContentUrl');
    if (url === undefined) {
	url = xBookUtils.getURLParameter('Url');
    }
    if (url !== undefined) {
	// redefine function so we don't have to do all this work next time
	xBookUtils.getPageUrl = function() { return url; }
	return url;
    }
    // Otherwise return standard url
    var returnUrl = xBookUtils.pageCompleteURL.attr('protocol') + "://" + xBookUtils.pageCompleteURL.attr('host') + xBookUtils.pageCompleteURL.attr('path');

    // redefine function so we don't have to do all this work next time
    xBookUtils.getPageUrl = function() { return returnUrl; }
    return returnUrl;
}


/* 
   getBaseUrl: Get the 'base' URL for the book (the url for the main[root]
   directory of the book).  You can then tack on filename paths to create a URL
   to a specific page.

   This function always returns a URL with a trailing '/'.
*/

xBookUtils.getBaseUrl = function() {

    // Check if we are in the HTML Quiz Brainhoney player
    if (xBookUtils.inBrainhoneyPlayer()) {
	return xBookUtils.pageCompleteURL.attr('protocol') + "://" + xBookUtils.pageCompleteURL.attr('host') + "/brainhoney/resource/" + xBookUtils.discipline[xBookUtils.getPXTier()]  + "/digital_first_content/trunk/test/" + xBookUtils.getBookId() + "/";
    }

    // We must use getPageUrl to make sure we get the correct
    // URL on PX
    var curr_page_url = xBookUtils.getPageUrl();
    
    // remove trailing filename (everything after the last '/')
    var match = curr_page_url.match(/(.*\/).*/);
    var base_url = match[1];
    
    // remove asset/ (and all trailing directories) if found
    base_url = base_url.replace(/\/asset\/.*/, "/");

    // redefine function so we don't have to do all this work next time
    xBookUtils.getBaseUrl = function() { return base_url; }
    return base_url; 
}


/*
  getURLParameter: Return value of query string URL parameter.
  Return undefined if parameter does not exist in query string.
  'url' is optional and will be used as the url to search through
  if provided (it is assumed the url will be a PX URL).
*/

xBookUtils.getURLParameter = function(paramName, url) {
    
    if (!xBookUtils.emptyValue(url)) {
	// We need to remove '#' from URL so Purl can parse it correctly
	url = url.replace(/#/, "");
	url = url.replace(/\/\//, "/");
	url = $.url(url);
	return url.param(paramName);
    }

    var local_param = xBookUtils.pageCompleteURL.param(paramName);
    if (!xBookUtils.emptyValue(local_param)) {
	return local_param;
    }
    
    // If we didn't find the param in the local URL then check the top URL
    if (paramName === "anchor_id" || paramName === "renderIn" ||
	paramName === "xBookSuppWin" || paramName === "fragment") {
	try {
	    var top_url = top.window.location + "";
	    // We need to remove '#' from URL so Purl can parse it correctly
	    top_url = top_url.replace(/#/, "");
	    top_url = top_url.replace(/\/\//, "/");
	    top_url = $.url(top_url);
	    return top_url.param(paramName);
	}
	catch(err) {
	}
    }
    
    // We couldn't find the param
    return undefined;
}


/* 
   externalUrl: Return true if the url is pointing to an external resource.
   Otherwise return false.
*/

xBookUtils.externalUrl = function(url) {
    if (typeof url !== "string") {
	return false;
    }

    var trimmedUrl = $.trim(url);
    if (/^[a-zA-Z0-9\+\.\-]+:\/\//.test(trimmedUrl)) {
	return true;
    }
    return false;
}


/*
  getSectionNumForId(id): Returns the section number for the 'id' that can then be 
  passed into show_section().

    - If 'id' is already an ID of a section then return its section number
    - If 'id' is an ID of any other element on the page then return the
      parent section number of that element
    - Otherwise, return undefined.

  This function assumes it will not be called until all the section IDs have been 
  set by player.initialize_sections().
*/

xBookUtils.getSectionNumForId = function(id) {

    // If id is undefined, return null
    if (id === undefined || id === null) {
	return undefined;
    }

    if (/^\d+$/.test(id)) {
	return id;
    }
    
    var secMatch = id.match(/^digfir_section_(\d+)$/);
    if (secMatch !== null) {
	return secMatch[1];
    }
    
    // Find parent 'section div' of 'id' and return parent's ID
    var $elem = $("#" + id);
    if ($elem.length > 0) {
	var $parent = $elem.first().parents("[data-type='section']");
	if ($parent.length > 0) {
	    var p_id = $parent.first().attr("id");
	    if (p_id != undefined) {
		var parMatch = p_id.match(/^digfir_section_(\d+)$/);
		if (parMatch != null) {
		    return parMatch[1];
		}
	    }
	}
    }

    // We didn't find anything
    return undefined;
}


/* 
   ebookPage: Return true if the url is pointing to an internal ebook page.
   Otherwise return false.
*/

xBookUtils.ebookPage = function(url) {
    if (/^[a-zA-Z0-9_\- ]+\.html([#\?].*)?$/.test(url)) {
	return true;
    }
    return false;
}


/*
  emptyValue(value): Returns true if the value is:
                     - undefined
		     - null
		     - zero length
		     - contains only space characters (no non-space characters)
  
  Otherwise returns false.

  This function is primarily used to ensure that an attribute has a defined value.

*/

xBookUtils.emptyValue = function (value) {
    if (value === undefined || value === null || 
	value.length == 0 || !/\S/.test(value)) {
	return true;
    }
    return false;
}


/*
  inPX: Return true if the page is being viewed in PX, otherwise return false.
  
*/

xBookUtils.inPX = function() {
    
    if (xBookUtils.inPXFrame() || xBookUtils.inPXSuppWin()) {
	return true;
    }
    // We could still be in a supp window in PX, so check the URL.
    // P.S. Not sure if this is the most reliable way to check this?
    if (/dlap\.bfwpub\.com/.test(window.location.href)) {
	return true;
    }
    if (/macmillanhighered\.com\/brainhoney/.test(window.location.href)) {
	return true;
    }
    return false;
}


/*
  inPXFrame: Return true if the page is being viewed in the main PX content frame,
  otherwise return false.
*/

xBookUtils.inPXFrame = function() {
    
    // if we are in the supp window we aren't in the main content frame
    if (xBookUtils.inPXSuppWin()) {
	return false;
    }
    
    try {
        if (top.PxPage) {
	    return true;
        }
    }
    catch(err) { }
    return false;
}


/* 
   inMainContentFrame: Return true if we are viewing the page in the PX main 
   content frame or the DF wrapper main content frame or as just a stand-alone
   page on DF.  Otherwise return false.  

   This is used primarily to figure out if the page is being viewed in a supp
   window.

*/

xBookUtils.inMainContentFrame = function() {

    // Check if we are in the supp win nav page
    if (xBookUtils.inSuppWinNavPage()) {
        xBookUtils.inMainContentFrame = function() { return false; }
	return false;
    }
    
    if (xBookUtils.inPX()) {
	if (xBookUtils.inPXFrame()) {
            xBookUtils.inMainContentFrame = function() { return true; }
	    return true;
	}
        xBookUtils.inMainContentFrame = function() { return false; }
	return false;
    }
    
    // DF checks
    try {
        if (top.DFwrapper) {
            xBookUtils.inMainContentFrame = function() { return true; }
	    return true;
        }
    }
    catch(err) { }
    
    xBookUtils.inMainContentFrame = function() { return false; }
    return false;
}


/*
  inDFWrapper: Return true if we are viewing the page in the DF wrapper, 
  otherwise return false;
*/

xBookUtils.inDFWrapper = function() {
    try {
        if (top.DFwrapper) {
	    return true;
        }
    }
    catch(err) { }
    return false;
}


/*
  inDFEbookSuppWin: Return true if we are viewing the page in the special ebook
  page viewer (supp_win.html) on digfir-published.
*/

xBookUtils.inDFEbookSuppWin = function() {
    var url;
    try {
	url = parent.window.location.href;
	if (/digfir-published.*supp_win\.html/.test(url)) {
	    return true;
	}
    }
    catch(err) {
	return false;
    }
    return false;
}


/*
  inPXSuppWin: Return true if we are viewing page in the special supplemental
  window navigation page for ebook pages.  Otherwise return false.
*/

xBookUtils.inPXSuppWin = function() {
    var url_render = xBookUtils.getURLParameter('renderIn');
    if (!xBookUtils.emptyValue(url_render) && url_render === "supp") {
	xBookUtils.inPXSuppWin = function() { return true; }
	return true;
    }
    xBookUtils.inPXSuppWin = function() { return false; }
	return false;
}


/*
  inSuppWinNavPage: Return true if we are viewing page in the special supplemental
  window navigation page for ebook pages.  Otherwise return false.
*/

xBookUtils.inSuppWinNavPage = function() {
    var $supp_iframe;

    try {
	$supp_iframe = $('#xBookSuppWinNavPageFrame', window.parent.document);
    }
    catch(err) {
	return false;
    }

    if ($supp_iframe.length > 0) {
	xBookUtils.inSuppWinNavPage = function() { return true; }
	return true;
    }

    xBookUtils.inSuppWinNavPage = function() { return false; }
    return false;    
}


/*
  inLCViewer: Returns true if we are viewing the page in the LC dialog page viewer, 
  otherwise returns false.
*/
xBookUtils.inLCViewer = function() {
    try {
	// This is the best test I can find for determining if we are
	// viewing the page in the LC page viewer.  
	var $fne_lc_div = $("iframe#content", window.parent.document);
	if ($fne_lc_div.length == 1) {
	    xBookUtils.inLCViewer = function() { return true; }
	    return true;
	}
    }
    catch (err) { }

    xBookUtils.inLCViewer = function() { return false; }
    return false;
}


/*
  inDocViewer: Returns true if we are viewing the page in the PX docviewer
*/
xBookUtils.inDocViewer = function() {
    var url_render = xBookUtils.getURLParameter('renderIn');
    if (!xBookUtils.emptyValue(url_render) && url_render === "docviewer") {
	xBookUtils.inDocViewer = function() { return true; }
	return true;
    }

    xBookUtils.inDocViewer = function() { return false; }
    return false;
}


/*
  openSuppWin: Opens a URL (should not be an ebook page) in a supp window.  The URL
  can be to an external resource (e.g. http://www.slashdot.org) or an internal book 
  resource (e.g. asset/ch5/ch5_fig_1.jpg).  The URL should not be another ebook
  page (please use xBookUtils.openPageSuppWin to open ebook pages in supp window).

  This function takes a context object as its argument.  A url is required in the
  context:

    xBookUtils.openSuppWin({url: URL});

  If the url is not fully qualified then it will be assumed that it is a relative 
  path to a file in the book.

  Other context variables that may be passed in (you should not use these
  unless you really know what you are doing and have a very good reason):

  - name (the name of the supp window object)
  - width (width of supp window)
  - height (height of supp window)
  - top (pixels from top of screen where it will be displayed [do not include "px"])
  - left (pixels from left of screen where it will be displayed [do not include "px"])

  *** READ THIS ***
  To reiterate, if you need to open an ebook page in a supp window, please use:

    xBookUtils.openPageSuppWin

*/

xBookUtils.openSuppWin = function (context) {
    if (context.url === undefined) {
	safe_log("xBookUtils.openSuppWin: url not defined");
	return false;
    }

    var defaults = {
        name: "xBookSuppWin",
        width: 780,
        height: 600,
	top: 10,
	left: 10
    };

    if (!xBookUtils.emptyValue(player.cfg_suppWinWidth) && 
	/^\d+$/.test(player.cfg_suppWinWidth)) {
	defaults.width = player.cfg_suppWinWidth;
    }

    var args = $.extend(defaults, context);

    // If url is not fully qualified then assume it is a path to a file name
    // for the current book and open it with the base url
    if (!xBookUtils.externalUrl(args.url)) {
	args.url = xBookUtils.createInternalUrl(args.url);
    }

    // Open supp window 
    var suppWin = window.open(args.url, args.name, "top=" + args.top + ",left=" + args.left + ",width=" + args.width + ",height=" + args.height + ",menubar,resizable,scrollbars", true);
    suppWin.focus();
    return true;
}

/*
  openPXSuppWin: For opening PX resources in supp window.

    xBookUtils.openPXSuppWin({url: href});
   
  href must be in PX format (e.g. http://www.macmillanhighered.com/launchpad/dtu10e/466316/Home#/launchpad/item/bsi__B0D9F4F4__BC13__4879__A5C6__2630D5297097)

*/

xBookUtils.openPXSuppWin = function (context) {
    if (context.url === undefined) {
	safe_log("xBookUtils.openPXSuppWin: url not defined");
	return false;
    }

    var defaults = {
        name: "xBookPXSuppWin",
        width: 850,
        height: 800,
	top: 10,
	left: 10
    };

    var args = $.extend(defaults, context);

    // Open supp window
    // Open from top.window so that the opener won't disappear in supp window
    var top_win = top.window;

    var suppWin = top_win.open(args.url, args.name, "top=" + args.top + ",left=" + args.left + ",width=" + args.width + ",height=" + args.height + ",menubar,resizable,scrollbars", true);
    suppWin.focus();
    return true;
}


/*
  openPageSuppWin: Open an ebook page in a supp window. The context object should
  contain the filename of the page to open:

   xBookUtils.openPageSuppWin({page: "strayer2e_ch1_1.html"}); 

  You will also need the supp_win.html file in the book's asset/ directory (see
  Bruce if you don't have a copy).

*/

xBookUtils.openPageSuppWin = function(context) {
    
    if (context.page === undefined) {
	safe_log("xBookUtils.openPageSuppWin: page not passed into context");
	return false;
    }
    var page = context.page;
    
    // We may have a hash fragment
    var match = page.match(/^(\/)?([a-zA-Z0-9_\- ]+\.html)(#.*)?$/);
    
    if (match === null) {
	safe_log("xBookUtils.openPageSuppWin: Invalid page (" + page + ")");
	return false;
    }
    
    var target = "";
    if (/^#.+/.test(match[3])) {
	target = match[3];
	target = target.slice(1);
	target = "&target=" + target;
    }
    
    var suppWinLink = xBookUtils.getBaseUrl() + "asset/supp_win.html?bookid=" + xBookUtils.getBookId() + "&manuscript=" + match[2] + target + "&baseurl=" + xBookUtils.getBaseUrl();
    xBookUtils.openSuppWin({url: suppWinLink, name: "xBookSuppWinNavPage", width: 875, height: 900});   
}


/* 
   create_links(jQuery_Object): Converts all the link <span>s in the jQuery
   Object to <a> tags.  Unlike the original XRefs.create_links, this one
   will honor the target attribute set in the XML and will also include
   any custom data attributes.

   This is used to replace the original create_links in XRefs.

*/

xBookUtils.create_links = function($jqObj) {

    $jqObj.find("[data-type='link']").each(function() {
	var $linkElement = $(this);
	var linkUrl = $.trim($linkElement.attr('data-href'));
	var linkTarget = $.trim($linkElement.attr('data-target'));
	
	// This should never happen, but just in case
	// This can be empty now.  Must be dealt with in LinkHandler.
	/*
	if (xBookUtils.emptyValue(linkUrl)) {
	    return true;
	}
	*/
	
	// include any custom data attributes
	var data_attrs = "";
	var data = $linkElement.data();
	for(var prop in data){
	    if (prop !== "type" && prop !== "href" && prop !== "target" &&
		prop !== "xrefs-target") {
		data_attrs = data_attrs + " data-" + prop + "=\"" + data[prop] + "\"";
	    }
	}
	
	/* brb: We don't need to do this any more since the link 
	   handler can take care of default targets for us but some
	   books might still depend on this or some books may not use
	   the link handler.  So add a custom data attribute if we
	   set the default so that we know it was set here
	   and then we can override it somewhere else if needed. */
	
	var data_xrefs_def = "";
	if (xBookUtils.emptyValue(linkTarget)) {
	    // XRefs.create_links sets all links to target="_blank"
	    // so if no target was set in XML then do the same
	    linkTarget="_blank";
	    data_xrefs_def = " data-xrefs-target=\"1\"";
	}
	
	$linkElement.replaceWith("<a data-type=\"lh-link\" target=\"" + linkTarget + "\" href=\"" + linkUrl + "\"" + data_xrefs_def + data_attrs + ">" + $linkElement.html() + "</a>");
    });   
}


/*
  procNativePXQuestions: This does a bunch of internal processing if your book
  uses Native PX (html) questions.  You will never call the function directly 
  in your javascript.

*/

xBookUtils.procNativePXQuestions = function($questions) {
    /* Define some private helper functions */
    function convertTags(b){var a=$("<div>");a.append(b);var c=a.find('[data-type="link"]');if(c.length>0){a.find('[data-type="link"]').replaceWith(function(){var d=$(this);var e=false;var f="";if(this.attributes!==undefined){$.each(this.attributes,function(){if(this.specified){var g=this.name;var h=this.value;if(g==="data-type"){return true}if(g==="data-href"){g="href"}if(g==="data-target"){g="target";e=true}f=f+" "+g+"='"+h+"'"}})}if(!e){f=f+" target='_blank' data-xrefs-target='1'"}return"<a"+f+"data-type='lh-link'>"+d.html()+"</a>"})}return a.html()};
    
    function getQuestionType(b){var a;if(b!=undefined){a=b}else{a=$('[data-type="question"]')}if(a.length<1){return null}var c=a.first().find('[data-encrypted="true"]');if(c.length==0){return"PX"}return"ARGA"};
    
    function loadPXQuestions(g){var a;if(g!=undefined){a=g}else{a=$('[data-type="question"]')}if(a.length<1){return null}function j(l){if(l===undefined){safe_log("fix_xml: text undefined");return l}l=l.replace(/<!\[CDATA\[/g,"");l=l.replace(/\]\]>/g,"");l=l.replace(/<(\?xml [^>]+|requests [^>]+|\/requests|\/?output)>/g,"");l=l.replace(/<body>/g,"<div class='body'>");l=l.replace(/<question [^>]+ questionid="([^"]+)" score="([^"]+)">/g,"<div class='question' id='$1' data-score='$2'>");l=l.replace(/<question [^>]+ questionid="([^"]+)"([^>]+)?>/g,"<div class='question' id='$1'>");l=l.replace(/<interaction type="([^"]+)"([^>]+)?>/g,"<div class='interaction' data-type='$1'>");l=l.replace(/<\/(interaction|question|body)>/g,"</div>");l=l.replace(/<answer><value>(.*?)<\/value><\/answer>/g,"<div class='answer'>$1</div>");l=l.replace(/<meta>.*?<\/meta>/g,"");l=l.replace(/<choice id="([^"]+)"([^>]+)?><div class='body'>/g,"<div class='choice' data-letter='$1'>");l=l.replace(/<\/div><\/choice>/g,"</div>");l=l.replace(/<\/div><feedback>(.*?)<\/feedback>/g,"<div class='fb'>$1</div></div>");return l}var h=xBookUtils.getPageUrl();var e=h.replace(/(.*)\.html$/,"$1");var c=e+"_dlap.xml";var i=null;try{$.ajax({url:c,cache:false,dataType:"text",async:false,success:function(l){i=l},error:function(l,n,m){safe_log("Couldn't read "+c)}})}catch(d){safe_log("ajax error retrieving "+c+": "+d.message);return}if(i==null){return}var b=j(i);var f=$("<div>").append(b).remove();var k=1;a.each(function(q,p){var m=$(p);var o=m.find("[data-type='query_display']");var n=o.attr("questionid");var r=f.find("#"+n);var v=r.find(".interaction");var t;if(v.data("type")=="essay"){var s=r.find(".body").html();t="<div class='bh question-render content websterfw-essay'><div id='view2'><div class='bh essay-question'><div><span class='question-number'>undefined. </span>"+s+"</div></div></div></div>";o.html(t)}else{if(v.data("type")=="choice"){t="<div class='bh question-render content'><div id='view2'><div class='bh multiple-choice-question'><div><span class='question-number'>undefined. </span>";var l=r.find(".body").html();t+=l+"</div><table><tbody>";var u=1;r.find(".choice").each(function(w,x){var y=$(x);t+="<tr><td class='question-choice'>&#9711;&#160;</td><td data-letter='"+y.data("letter")+"'>"+y.html()+"</tr>";u++});t+="</tbody></table></div></div></div>";o.html(t)}else{if(v.data("type")=="text"){t="<div class='bh question-render content'><div id='view3'><div class='bh text-question'><div><span class='question-number'>undefined. </span>";t+=r.find(".body").html();t+=' <input type="text" style="width:200px" id="view3_1_text" class="" disabled>';t+="</div></div></div></div></div>";o.html(t)}}}k++;m.children("[data-type='query_display']").css("display","block")})};

    // Get all the questions on the page
    //var $questions = $('[data-type="question"]');

    // If there are no questions then we are done
    if ($questions.length < 1) {
	return;
    }

    // If they aren't Native PX questions then we are done
    if (getQuestionType($questions) != "PX") {
	return;
    }

    // If we are in a supp window then we need to load the question text
    if (!xBookUtils.inMainContentFrame() && !xBookUtils.inDFEbookSuppWin()) {
	loadPXQuestions($questions);
    }
    // Else if we are in DF then we need to load the complete questions
    else if (!xBookUtils.inPX()) {
	var df_wrapper_script = document.createElement('script');
	df_wrapper_script.setAttribute('type','text/javascript');
	df_wrapper_script.setAttribute('src', "../../../wrapper/asset/wrapper_xbook.js");
	document.getElementsByTagName("body")[0].appendChild(df_wrapper_script);
    }
    
    // Fix up tags in question text:
    // - convert links <span>s to <a>s
    
    // Constants to use for the timer
    var MAX_TIMER_RUNS = 40;
    var CURR_TIMER_RUN = 1;
    
    var $remainingQuestions = $();
    
    // Go through each question and process the question text.  Keep trying
    // until all questions have been processed.
    var quesTimerId = setInterval(function() {
	
	// when we start each timer interval we assume we will
	// have no questions left to process by the end
	$remainingQuestions = $(); // length = 0
	
	// go through each question and process question text
	$questions.each(function(index, element) {
	    var $quesElem = $(element);
	    
	    // Get the question text.
	    // brb: The following selector is horrific but we have no choice
	    // because PX does not put a class on the <div> containing the
	    // question text.
	    var $quesText = $quesElem.find('[data-type="query_display"] > .question-render > div > .bh > div:first-child');
	    
	    // If there is no question text yet then we need to wait longer
	    if ($quesText.length == 0) {
		// save off the remaining questions we have left to process
		$remainingQuestions = $questions.slice(index);
		// exit each() loop
		return false;
	    }
	    
	    // process the question text
	    $quesText.html(convertTags($quesText.html()));
	    
	    // If this is an M/C question then we need to processs each option
	    if ($quesElem.find(".multiple-choice-question").length > 0) {
		var $optionText = $quesElem.find("td.question-choice + td");
		$optionText.each(function() {
		    var $this = $(this);
		    $this.html(convertTags($this.html()));
		});
	    }
	    
	    
	}); // end each()
	
	// if we don't have any questions left, we are done
	if ($remainingQuestions.length < 1) {
	    clearInterval(quesTimerId);
	    $(document).trigger('procNativePXQuestions');
	    return;
	}
	
	// fallback safety trigger so we don't do this indefinitely
	if (CURR_TIMER_RUN >= MAX_TIMER_RUNS) {
	    safe_log("We ran out of attempts while processing question text");
	    clearInterval(quesTimerId);
	    $(document).trigger('procNativePXQuestions');
	    return;
	}
	
	$questions = $remainingQuestions;
	CURR_TIMER_RUN++;		
    }, 200); // end setInterval()
}

// Old function to process Native PX Questions.  Had to be called manually
// in initialize2.  Not needed any more.
xBookUtils.processNativePXQuestions = function() {
    return true;
}


/* 
   checkShowAnswer: This function is designed to be used with jQuery each().  Each
   element is checked for a corresponding answer in xBookUtils.showAnswers.  If found, 
   a 'show answer' button is attached to the element which will display the answer.
*/

xBookUtils.checkShowAnswer = function() {
    var $this = $(this);
    
    // The element needs to have an ID
    var elem_id = $this.attr('id');
    if (xBookUtils.emptyValue(elem_id)) {
	return;
    }
    
    // If we've already found an answer for this element we are done
    if ($this.attr('data-found-show-answer') === "true") {
	return;
    }
    
    var tag = this.nodeName.toLowerCase();
    if (elem_id in xBookUtils.showAnswers) {
	if (tag === "div") {
	    $this.append("<button data-target='" + elem_id + "-show-answer' class='show_answer_button'></button><div id='" + elem_id + "-show-answer' class='show_answer_container'><h3 class='show_answer_title'></h3>" + xBookUtils.showAnswers[elem_id]  + "</div>");
	}
	else {
	    $this.after("<button data-target='" + elem_id + "-show-answer' class='show_answer_button'></button><div id='" + elem_id + "-show-answer' class='show_answer_container'><h3 class='show_answer_title'></h3>" + xBookUtils.showAnswers[elem_id]  + "</div>");
	}
	$this.attr('data-found-show-answer', 'true');
    }
}


/*
  moveBoxTitle: This function is designed to be used with jQuery each().  Moves
  the h3 box title out of the inner box.
*/
xBookUtils.moveBoxTitle = function() {
    var $this = $(this);
    
    if (($this.attr('data-type') !== "box") ||
	($this.attr('data-move-title') === "false")) {
	return;
    }
    var $inner_box = $this.children('[data-type="box_inner"]');
    if ($inner_box.length != 1) {
	return;
    }
    var $h3_title = $inner_box.children('h3[data-for_type="box"]');
    if ($h3_title.length != 1) {
	return;
    }
    $inner_box.before($h3_title);
}


/*
  prepareMarkup(content): Before dynamically inserting content into the page 
  (such as glossary defs/footnotes) we need to fix it up (such as adding the
  domain to the src attribute).
*/
xBookUtils.prepareMarkup = function (content) {
    
    // Fix src attribute if needed
    content = content.replace(/src=['"]([^"']+)['"]/g, function($0, $1) {
	var path = $1;
	if (!/^http/.test(path)) {
	    return "src='" + xBookUtils.getBaseUrl() + path + "'";
	}
	return "src='" + path + "'";
    });
    
    // Add data-type="lh-link" to <a>s
    content = content.replace(/<a( [^>]+)?>/g, function($0, $1) {
	var attrs = $1;
	if (!/lh-link/.test(attrs)) {
	    return "<a data-type='lh-link'" + attrs + ">";
	}
	return "<a" + attrs + ">";
    });
    
    return content;
}


/* 
   createInternalUrl: This function takes a file path to a resource in the ebook
   and returns the fully qualified URL for the resource.  The path must start
   with either "asset/" or "/brainhoney".
*/
xBookUtils.createInternalUrl = function(path) {

    if (!xBookUtils.externalUrl(path)) {
	// If path starts with 'asset' then we always add the Base URL
	if (/^asset/.test(path)) {
	    path = xBookUtils.getBaseUrl() + path;
	}
	// If path starts with '/brainhoney' then we only add the server domain
	else if (/^\/brainhoney/.test(path)) {
	    path = xBookUtils.pageCompleteURL.attr('protocol') + "://" + xBookUtils.pageCompleteURL.attr('host') + path;
	}
    }
    return path;
}


/*
  inBrainhoneyPlayer: Returns true if the page has been sent through the 
  brainhoney player (primarily if the book was built with HTML Quiz q.d.m).  
  Otherwise returns false.
*/
xBookUtils.inBrainhoneyPlayer = function() {
    if (/Content\/Exam\/Player\.aspx/.test(xBookUtils.pageCompleteURL.attr('path'))) {
	return true; 
    }
    return false;
}


/*
  getPXTier: Returns the tier (dev, qa, pr, www[production])
*/
xBookUtils.getPXTier = function() {
    var host = xBookUtils.pageCompleteURL.attr('host');
    if (/^dev/.test(host)) {
	return "dev";
    }
    if (/^qa/.test(host)) {
	return "qa";
    }
    if (/^pr/.test(host)) {
	return "pr";
    }
    return "www";
}


/*
  XBDocumentViewerHeaderFix: Removes the duplicate title in the XB document
  viewer header.  Also shrinks the various buttons in the header to make them
  a little less obtrusive.  Removes the Notes button if 
  cfg_XBDocumentViewerRemoveNotes is turned on.
*/
xBookUtils.FixXBDocViewHeader = function() {

    // We must be in the BH quiz player
    if (!xBookUtils.inBrainhoneyPlayer()) {
	return;
    }

    // We must be in the XB document viewer
    var $docviewer_header;
    try {
	$docviewer_header = $('.docviewer-header', window.parent.parent.parent.document);
	if ($docviewer_header.length != 1) {
	    return;
	}
    }
    catch(err) {
	return;
    }

    $docviewer_header.css('padding-top', '0').css('border-top', '1px solid #d3d3d3').css('height', '32px');
	
    var $content_courseb_title = $docviewer_header.children('#content-courseb-title');
    $content_courseb_title.css('display', 'none');
    
    var $notes_button = $docviewer_header.find('button.notes');
    $notes_button.css('padding', '0 5px').css('height', '30px').css('border', '1px solid #d7d7d7').css('border-top', '0').css('border-bottom', '0').css('border-radius', '0');
    if (player.XBDocumentViewerRemoveNotes === "on") {
	$notes_button.css('display', 'none')
    }

    var $back = $docviewer_header.find('#back');
    $back.css('border', '1px solid #d7d7d7').css('border-top', '0').css('border-bottom', '0').css('border-radius', '0').css('height', '30px');
    
    var $next = $docviewer_header.find('#next');
    $next.css('border', '1px solid #d7d7d7').css('border-top', '0').css('border-bottom', '0').css('border-radius', '0').css('height', '30px');
    
    var $fne_actions = $docviewer_header.find('#fne-actions');
    $fne_actions.css('vertical-align', 'top');
    
    var $fullscreen = $docviewer_header.find('#content-fullscreen');
    $fullscreen.css('display', 'inline-block').css('height', '30px').css('position', 'static').css('padding-left', '15px').css('padding-top', '0.15em');
    
    
    var $gearbox = $docviewer_header.find('.gearbox');
    
    var timer_id = setInterval(function() {
	if ($gearbox.length > 0) {
	    $gearbox.css('width', '5em').css('height', '30px');
	    if (player.XBDocumentViewerRemoveNotes === "on") {
		$gearbox.css('display', 'none')
	    }
	    clearInterval(timer_id);
	}
	else {
	    $gearbox = $docviewer_header.find('.gearbox');
	}
    }, 500);
    
    $notes_button.hover(
	function() {
	    $(this).css('background-color', '#d7d7d7');
	    $(this).css('cursor', 'pointer');
	    
	}, function() {
	    $(this).css('background-color', '#fff');
	    $(this).css('cursor', 'default');
	    
	}
    );
}


/*
  getPageHeaderHeight: return height (in pixels) of the PX headers above 
  the ebook page (currently only works for pages in docviewer.
*/
xBookUtils.getPageHeaderHeight = function() {

    if (xBookUtils.inDocViewer()) {

	if (xBookUtils.scrollWindow === undefined) {
	    safe_log("getPageHeaderHeight: scrollWindow is undefined in docviewer");
	    return 0;
	}
	
	var $page_zone_info;
	var $home_activation;
	
	try {
	    $page_zone_info = $('#PX_PAGE_ZONE_INFO', xBookUtils.scrollWindow.document);
	    $home_activation = $('#PX_HOME_Activation', xBookUtils.scrollWindow.document);
	}
	catch(err) {
	    safe_log("getPageHeaderHeight: can't calculate docviewer header height: " + err.message);
	    return 0;
	}
	
	// Adding 12 for margin at top
	return($page_zone_info.height() + $home_activation.height() + 12);
	
    } // end if in docviewer

    // all others we just return 0 for now
    return 0;

}


xBookUtils.debug = function(text) {
    if (xBookUtils.printDebugStatements === "on") {
	safe_log("debug: " + text);
    }
}


/* Display the DataSet pop up window */ 
xBookUtils.RL_ShowDataSets = function(title, url, offset) {
    
    // add dataset pop-in div if needed
    if ($('#rl_datasetpopin').length == 0) {
	var $popin = $('<div id="rl_datasetpopin"><div class="rl_dataset-header"><p class="rl_dataset-close">X</p></div><div class="rl_dataset-content"></div></div>');
	$('#manuscript').append($popin);
	$popin.draggable({
	    cancel: ".rl_dataset-content, .rl_dataset-close",
	    handle: ".rl_dataset-header"//,
	    //containment: "#manuscript"
	});
	$('#manuscript #rl_datasetpopin .rl_dataset-close').click(function() { 
	    $('#rl_datasetpopin').removeClass('show');
	});
    }
    
    // the 'title' arg is either the file name of the TI-Calc dataset or the base
    // name of all datasets (no extension)
    
    // add a '/' to end of url if needed
    if (url.charAt(url.length-1) != "/") {
        url = url + "/";
    }
    
    var file_name = title;
    //we need chapter number because of chapter subfolders.
    var chapter = file_name.charAt(2) + file_name.charAt(3);
    if (chapter[0] == '0') {
	chapter = chapter.substr(1);
    }
    
    var ti_calc_ext = "8XM"; // default file extension for TI-Calc
    // if the title passed in has an extension, then we need to grab the file name and ext
    // brb - if the 'title' has an extension then it is the TI-Calc file name
    if (title.match(/(.*)\.(.*)/)) {
        file_name = RegExp.$1;
        ti_calc_ext = RegExp.$2;
    }
    
    var dsbody = '<table>'
    
        + '<tr><th><b>File Format</b></th></tr>'
    
        + '<td><a href="' + url + 'Mac-Text/Chapter ' + chapter + '/' + file_name +'.txt" target="_blank">Mac Text</a></td></tr>'
        
        + '<td><a href="' + url + 'PC-Text/Chapter ' + chapter + '/' + file_name +'.txt" target="_blank">PC Text</a></td></tr>'
    
        + '<td><a href="' + url + 'Excel/Chapter ' + chapter + '/' + file_name +'.xls" target="_blank">Excel</a></td></tr>'
    
        + '<td><a href="' + url + 'Minitab/Chapter ' + chapter + '/'  + file_name + '.mtw" target="_blank">Minitab</a></td></tr>'
    
        + '<td><a href="' + url + 'R/Chapter ' + chapter + '/' + file_name + '.rda" target="_blank">R</a></td></tr>'
    
        + '<td><a href="' + url + 'SPSS/Chapter ' + chapter + '/'  + file_name + '.por" target="_blank">SPSS</a></td></tr>'
    
        + '<td><a href="' + url + 'TI-Calc/Chapter ' + chapter + '/' + file_name + '.' + ti_calc_ext + '" target="_blank">TI Calc</a></td></tr>'
    
        + '<td><a href="' + url + 'JMP/Chapter ' + chapter + '/' + file_name + '.jmp" target="_blank">JMP</a></td></tr>'
    
        + '<td><a href="' + url + 'CSV/Chapter ' + chapter + '/' + file_name + '.csv" target="_blank">CSV</a></td></tr>'
    
        + '</div>';
    
    $('#rl_datasetpopin .rl_dataset-content').html(dsbody);
    
    // place popin
    $('#rl_datasetpopin').css({"top": offset.top + "px", "left": offset.left + "px"});
    
    $('#rl_datasetpopin').addClass('show');    
}


/*
  scrollToElement: scroll page to the element id.
*/
xBookUtils.scrollToElement = function(id) {

    if (xBookUtils.emptyValue(id)) {
	xBookUtils.debug("scrollToElement: id passed in is empty");
	return;
    }
    
    id = id.replace(/#/, "");
    id = id.replace(/:ts\d+$/, "");
    
    if (xBookUtils.emptyValue(id)) {
	xBookUtils.debug("scrollToElement: id passed in is empty");
	return;
    }
    
    var anchor_elem = document.getElementById(id);
    
    if (anchor_elem !== null) {

	xBookUtils.debug("scrollToElement: scrolling to #" + id); 

	anchor_elem.scrollIntoView();
	
	// If we are in the docviewer then we need to take into account
	// the headers at the top of the page.
	if (xBookUtils.inDocViewer()) {
	    
	    // find position of element we are targeting
	    var offset = $(anchor_elem).offset();
	    
	    // scroll to the element 'top' offest plus the height
	    // of the headers
	    try {
		xBookUtils.scrollWindow.scrollTo(0,(offset.top +  xBookUtils.getPageHeaderHeight()));
	    }
	    catch(err) {
		safe_log("scrollToElement: error scrolling to #" + id + ": " + err.message);
	    }
	}
    }
    else {
	xBookUtils.debug("scrollToElement: can't find local anchor ID #" + id);
    }
}


/*
  generateRandomNumber: generates random number between minimum, maximum.
*/
xBookUtils.generateRandomNumber = function(minimum, maximum) {
    return (Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
}


/*
  getDefaultPXRender: gets the default renderIn value for the PX content frame.
  This value is either 'docviewer' or 'fne'.
  Pass in "opener" to check the opener renderIn.
*/
xBookUtils.getDefaultPXRender = function(win) {

    if (!(xBookUtils.inPXFrame()) && !(xBookUtils.inPXSuppWin())) {
	xBookUtils.debug("getDefaultPXRender called but we are not in PX");
	// return 'fne' because it is safe
	return "fne";
    }

    /*
    var top_win_doc;

    try  {
	top_win_doc = top.window.document;
    }
    catch(err) {
	safe_log("getDefaultPXRender: Can't get top window: " + err.message);
	// return 'fne' because it is safe
	return "fne";
    }

    if ($('#fne-header', top_win_doc).length > 0) {
	xBookUtils.debug("getDefaultPXRender: fne");
	return "fne";
    }
    else {
	xBookUtils.debug("getDefaultPXRender: docviewer");
	return "docviewer";
    }
    */

    // get top window URL
    var top_url;
    if (win === "opener") {
	try {
	    top_url = top.window.opener.location.href;
	}
	catch(err) {
	    safe_log("getDefaultPXRender: Can't get URL for opener: " + err.message);
	    return "fne";
	}
    }
    else {
	try {
	    top_url = top.window.location.href;
	}
	catch(err) {
	    safe_log("getDefaultPXRender: Can't get URL for window: " + err.message);
	    return "fne";
	}
    }
    
    if (/renderIn=docviewer/.test(top_url)) {
	xBookUtils.debug("getDefaultPXRender: docviewer");
	return "docviewer";
    }
    else {
	xBookUtils.debug("getDefaultPXRender: fne");
	return "fne";
    }
    
}


/*
  PXPageLoaded: Determine if page has finished loading in PX (i.e.
  the heights on the iframes have been finalized and the scroll bars set).
  Return 'true' if page has loaded, 'false' if page is still loading, 
  'undefined' if we can't determine.

*/
xBookUtils.PXPageLoaded = function() {
    var top_win_doc;

    try {
	top_win_doc = top.window.document;
    }
    catch(err) {
	safe_log("PXPageLoaded: Can't get top window: " + err.message);
	return undefined;
    }

    if ($('#loader .load-block-container .load-message', top_win_doc).length < 1) { 
	return true;
    }
    
    xBookUtils.debug("PXPageLoaded: page has not finished loading");
    return false;
}


/* Returns true if the page is being viewed by an instructor in PX.  Otherwise returns false.
   Always returns true if viewing page in the wrapper. */
xBookUtils.isInstructor = function() {
    if (xBookUtils.inPX()){
	try {
	    if (top.PxPage.Context.User.IsInstructor === "true") {
		return true;
	    }
	    return false;
	}
	catch(e) {
	    safe_log("xBookUtils.isInstructor: error referencing top.PxPage: " + e.message);
	    return false;
	}
    }
    if (xBookUtils.inDFWrapper()) {
	try {
	    var $wrapper_body = $('body', top.window.document);
	    if ($wrapper_body.hasClass('wrapper_student_view')) {
		return false;
	    }
	    return true;
	}
	catch(e) {
	    safe_log("xBookUtils.isInstructor: error referencing top.window: " + e.message);
	    return false;
	}
    }
    return false;
}


/* This removes the Home, Edit, Assign, and Results button from the PX supp window.  
   In certain circumstances these buttons are not being remove automatically by PX.
   Once this bug is fixed in PX this function will be meaningless but it won't hurt
   anything keep it around.
*/
xBookUtils.removePXSuppControls = function() {
    
    // We must be in the PX supp window
    if (!xBookUtils.inPXSuppWin()) {
	return;
    }
    
    var $fne_header;
    try {
	$fne_header = $('#fne-header', window.parent.parent.parent.document);
	if ($fne_header.length != 1) {
	    $fne_header = $('#fne-header', window.parent.parent.document);
	    if ($fne_header.length != 1) {
		$fne_header = $('#fne-header', window.parent.document);
		if ($fne_header.length != 1) {
		    $fne_header = $('#fne-header', window.document);
		    if ($fne_header.length != 1) {
			xBookUtils.debug("removePXSuppControls: Can't find fne-header");
			return;
		    }
		}
	    }
	}
    }
    catch(err) {
	xBookUtils.debug("removePXSuppControls: caught err: " + err.message);
	return;
    }

    $fne_header.find('#fne-header-view a.faceplate-fne-home-icon').css('display', 'none');
    $fne_header.find('#fne-header-view #fne-actions #fne-item-assign').css('display', 'none');
    $fne_header.find('#fne-header-view #fne-actions #fne-edit').css('display', 'none');
    $fne_header.find('#fne-header-view #fne-actions #fne-item-results').css('display', 'none');
}


// Work around bug when loading ebook page into freshly opened
// supp window that displays too much of the fne-content div below
// the horizontal scrollbar (it creates a "blue bar" at the bottom)
xBookUtils.fixSuppWinBlueBarBug = function() {
    if (xBookUtils.inPXSuppWin()) {
	if (!top.window.ebookSuppWindowHasBeenResized) {
	    // just resizing the window by 1 pixel removes the blue bar
	    top.window.resizeBy(1,1);
	    top.window.focus();
	    top.window.ebookSuppWindowHasBeenResized = true;
	}
    }
}


// Call this function to enable page numbers
xBookUtils.setupPageNumbers = function() {
    xBookUtils._createPrintPageBox();
    xBookUtils._createPrintPageMenu();
    xBookUtils._processPageStarts();
} // end xBookUtils.setupPageNumbers


// Add print page box at top of page
xBookUtils._createPrintPageBox = function() {

    if (player.PPB_prefix === undefined) {
	player.PPB_prefix = "Printed Page ";
    }
    if (player.PPB_continued === undefined) {
	player.PPB_continued = "(cont.)";
    }
    
    // Add print_page box (only on the first section)
    $('[data-type="section"]').first().each(function() {
	var $this = $(this);
	var print_page = $this.attr('data-print_page');
	
	// If we didn't find a print_page attribute on the section
	// then we are done (this is bad)
	if (xBookUtils.emptyValue(print_page)) {
	    xBookUtils.debug("createPrintPageBox: No print_page attribute on first section");
	    return;
	}
	
	// Add print_page box
	$this.prepend('<div id="print_page_box"><div id="print_page_header"><span id="print_page_number">' + player.PPB_prefix + print_page + '</span><span id="print_page_number_cont"></span><span id="print_page_icon"></span></div><div id="print_page_menu"></div></div>');
	
	// Check if there is a page_start for the print_page number
	var $page_start = $("#" + xBookUtils.bookID + "_page_" + print_page);
	// If the page_start is not on this page then this is a continuation
	if ($page_start.length < 1) {
	    $('#print_page_box').addClass('continued');
	    $('#print_page_number_cont').html(player.PPB_continued);
	}
	// Otherwise, we can remove the page_start since the page number
	// is already displayed in the print_page_box
	else {
	    $page_start.remove();
	}	    
    });
} // end xBookUtils._createPrintPageBox


// Add various items to print page menu drop down list
xBookUtils._createPrintPageMenu = function() {

    // Add show/hide page number toggle if there are page_starts on the page
    if (player.PPM_pageNumberToggle === undefined ||
	player.PPM_pageNumberToggle === "on") {
	if ($('[data-block_type="page_start"]').length > 0) {
	    
	    // Turn on menu
	    xBookUtils._enablePrintPageMenu();
	    
	    // Add item to menu
	    $('#print_page_menu ul').append('<li id="page_start_toggle" role="menuitem"><a href="javascript:void(0);">Hide page numbers</a></li>');
	    
	    // Add handler
	    $('#page_start_toggle a').click(function() {
		var $manuscript = $('#manuscript');
		$manuscript.toggleClass('hide_page_start');
		if ($manuscript.hasClass('hide_page_start')) {
		    $('#page_start_toggle a').text("Show page numbers");
		}
		else {
		    $('#page_start_toggle a').text("Hide page numbers");
		}
		xBookUtils.collapsePrintPageMenu();
		$('#print_page_icon a').focus();
	    });
	}
    } // end page number toggle
    
    // Add "Go to page" menu item
    if ((player.PPM_pageJump === undefined || player.PPM_pageJump === "on") &&
	xBookUtils.inMainContentFrame()) {
	
	// Turn on menu (if needed)
	xBookUtils._enablePrintPageMenu();
	
	// Add item to menu
	$('#print_page_menu ul').append('<li id="jump_to_page" role="menuitem"><a href="javascript:void(0);">Go to page</a></li>');
	
	// Add handler
	$('#jump_to_page a').click(function(event) {
	    xBookUtils.collapsePrintPageMenu();
	    
	    var value = prompt("Enter page number");
	    
	    if (value === null) {
		$('#print_page_icon a').focus();
		return;
	    }

	    // always do the following
	    value = $.trim(value);
	    value = value.replace(/\s/g, "");
	    
	    var orig_value = value;
	    
	    if (value.length < 1) {
		alert("Please enter a page number in the box");
		$('#print_page_icon a').focus();
		return;
	    }
	    
	    // Does the value have a corresponding page alias in links?
	    if (xBookUtils.links.hasOwnProperty("page_" + value)) {
		value = "page_" + value; 
	    }
	    // Does the value have a corresponding sec alias in links?
	    else if (xBookUtils.links.hasOwnProperty("sec_" + value)) {
		value = "sec_" + value; 
	    }
	    // if we don't have a page/sec entry in links then try a few
		// more conversions on the value entered
	    else {
		// We used to do these two automatically so we need to keep
		// them here in case older books relied on them
		value = value.toLowerCase();
		value = value.replace(/[^a-z0-9]/g, "_");
		
		if (xBookUtils.links.hasOwnProperty("page_" + value)) {
		    value = "page_" + value; 
		}
		else if (xBookUtils.links.hasOwnProperty("sec_" + value)) {
		    value = "sec_" + value; 
		}
		else {
		    safe_log("Can't find alias for " + orig_value);
		    $('#print_page_icon a').focus();
		    alert("Can't find page number " + orig_value + " in ebook");
		    return;
		}
	    }
	    
	    // goto ebook page
	    if ($('#jump_to_page_link').length == 0) {
		$('#manuscript').append('<a id="jump_to_page_link"></a>');
	    }
	    var $jumpToLink = $('#jump_to_page_link');
	    $jumpToLink.attr('data-type', 'lh-link');
	    $jumpToLink.attr('href', "alias:" + value);
	    $jumpToLink.attr('target', '_self');
	    $jumpToLink.click();
	});
    } // end "Go to page"
    
    // check for supplemental content
    if (player.PPM_supplementalContent === undefined ||
	player.PPM_supplementalContent === "on") {
	
	// get array of all different data-supp_content values
	var supp_content_types = $("[data-supp_content]").map(function(){return $(this).attr("data-supp_content");}).get();
	
	// if there are no data-supp_content values on page then we are done
	if (supp_content_types.length == 0) {
	    xBookUtils.debug("xBookUtils._createPrintPageMenu: No supp_content found on page");
	    return;
	}
	
	// set the order for the menu 
	var supp_content_list = []; // the official array we keep the order in
	
	// go through each data-supp_content type we found on the page and
	// if it has an order specified place it in supp_content_list in that order
	for (var i=0; i<supp_content_types.length; i++) {
	    var order = xBookUtils.supp_content[supp_content_types[i]].order;
	    // If the order attribute exists and it is a number and this order has
	    // not already been placed in supp_content_list[] then add it
	    if (order !== undefined && /^\d+$/.test(order) && supp_content_list[order] === undefined) {
		xBookUtils.debug("found order " + order + " for " + supp_content_types[i]);
		supp_content_list[order] = supp_content_types[i];
	    }
	    // Otherwise set the order to NA and we will just add it to the end of the menu
	    else {
		xBookUtils.supp_content[supp_content_types[i]].order = "NA";
	    }
	}
	// go through supp_content_list again looking for order == NA and add them to end
	// of supp_content_list[] in the order found
	for (var i=0; i<supp_content_types.length; i++) {
	    var order = xBookUtils.supp_content[supp_content_types[i]].order;
	    if (order === "NA") {
		supp_content_list.push(supp_content_types[i]);
	    }
	}
	
	// go through supp_content_list[] and set up menu item for each
	// supp_content type
	for (var i=0; i<supp_content_list.length; i++) {
	    
	    // There will be holes in this array so skip any that aren't defined
	    if (supp_content_list[i] === undefined) {
		continue;
	    }
	    
	    var type = supp_content_list[i];
	    var menu_item_id = "supp_content_" + type;
	    
	    // If this supp_content type is marked instructor_only then skip it
	    // if this page is not being viewed by an instructor
	    if (xBookUtils.supp_content[type].instructor_only === true) {
		if (!xBookUtils.isInstructor()) {
		    xBookUtils.debug("Skipping supp_content_" + type + ": instructor_only");
		    continue;
		}
	    }
	    
	    xBookUtils.debug("Setting up menu item for supp_content_" + type);
	    
	    // Add to menu
	    xBookUtils._enablePrintPageMenu();
	    $('#print_page_menu ul').append('<li id="' + menu_item_id + '" role="menuitem"><a href="javascript:void(0);">' + xBookUtils.supp_content[type].show +  '</a></li>');
	    
	    var $manuscript = $('#manuscript');
	    var $menu_item_link = $("#" + menu_item_id + " a");
	    
	    // Default is to display this content
	    if (xBookUtils.supp_content[type].visible !== false) {
		$manuscript.addClass(menu_item_id);
		$menu_item_link.text(xBookUtils.supp_content[type].hide);
	    }
	    else {
		$manuscript.removeClass(menu_item_id);
		$menu_item_link.text(xBookUtils.supp_content[type].show);
	    }
	    
	    // Add handler
	    $menu_item_link.click({m_i_i: menu_item_id, t: type}, function(e) {
		xBookUtils.debug("handling click for " + e.data.m_i_i);
		
		$manuscript.toggleClass(e.data.m_i_i);
		if ($manuscript.hasClass(e.data.m_i_i)) {
		    $("#" + e.data.m_i_i + " a").text(xBookUtils.supp_content[e.data.t].hide);
		}
		else {
		    $("#" + e.data.m_i_i + " a").text(xBookUtils.supp_content[e.data.t].show);
		}
		xBookUtils.collapsePrintPageMenu();
		$('#print_page_icon a').focus();
	    });	
	} // end for
    } // end if supplementContent
} // end xBookUtils._createPrintPageMenu


//xBookUtils.supp_content['IN'] = { hide: "Hide instructor notes", show: "Show instructor notes", instructor_only: true, visible: true, order: 5 };

// type must be one of the types defined in xBookUtils.supp_content
xBookUtils.toggleSuppContent = function(type) {
    xBookUtils.debug("xBookUtils.toggleSuppContent: toggling supp content type " + type);
    
    if (xBookUtils.supp_content[type] === undefined) {
	xBookUtils.debug("xBookUtils.toggleSuppContent: " + type + " not defined in xBookUtils.supp_content");
	return;
    }
    
    var type_class = "supp_content_" + type;
    var $manuscript = $("#manuscript");
    
    $manuscript.toggleClass(type_class);

    // At some point we will want to update aria-hidden on the supp content itself

    
    // update the print page menu (if a print page menu item doesn't exist for this
    // supp content type then this is harmless)
    if ($manuscript.hasClass(type_class)) {
	$("#print_page_menu #" + type_class + " a").text(xBookUtils.supp_content[e.data.t].hide);
    }
    else {
	$("#print_page_menu #" + type_class + " a").text(xBookUtils.supp_content[e.data.t].show);
    }
}


// Add the print page menu drop down list and add handler for icon.
// This function can safely be called more than once.  It will only "enable"
// the menu if it hasn't already been enabled.
xBookUtils._enablePrintPageMenu = function() {
    
    var $print_page_icon = $('#print_page_icon');
    var $print_page_box = $('#print_page_box');
    var $print_page_menu = $('#print_page_menu');
    var $print_page_icon_a = $('#print_page_icon a');
    
    $print_page_icon.addClass('enable');
    $print_page_box.attr('role', 'menu');

    // Add <ul> for menu drop down list (if it hasn't already been added)
    if ($print_page_menu.children('ul').length < 1) {
	$print_page_menu.append("<ul></ul>");
	$print_page_menu.attr('role','group').attr('aria-expanded','false').attr('aria-hidden','true').attr('aria-labelledby','print_page_icon_a'); 
    }

    // If menu icon has already been added we are done
    if ($print_page_icon_a.length > 0) {
	return;
    }
    
    $print_page_icon.html('<a id="print_page_icon_a" href="javascript:void(0)" title="Show menu" aria-expanded="false" aria-haspopup="true" aria-owns="print_page_menu" aria-controls="print_page_menu"><span class="text">Menu</span></a>');
    
    $print_page_icon_a = $('#print_page_icon a');
    
    // set handler on menu icon
    $print_page_icon_a.click(function(event) {
	if ($print_page_box.hasClass('expanded')) {
	    xBookUtils.collapsePrintPageMenu();
	}
	else {
	    xBookUtils.expandPrintPageMenu(event);
	}
    });
    
    // key handler for print page menu
    $(document).keydown(function(event) {
	// We only need to handle up/down arrows, esc and space
	if (event.keyCode != 38 && event.keyCode != 40 &&
	    event.keyCode != 27 && event.keyCode != 32) {
	    return;
	}
	
	// get element currently in focus
	var $active_el = $(':focus');
	
	// If active element is not in the print_page_menu or is
	// not the print_page_icon then we do nothing
	if ($active_el.parents('#print_page_menu').length == 0 &&
	    ($active_el.attr('id') !== "print_page_icon_a")) {
	    return;
	}
	
	event.preventDefault();
	
	// esc - collapses menu anytime
	if (event.keyCode == 27) {
	    xBookUtils.collapsePrintPageMenu();
	}
	// up arrow
	if (event.keyCode == 38) {		    
	    var $prev_sibling = $active_el.parent('li').prev('li');
	    if ($prev_sibling.length) {
		$prev_sibling.children('a').focus();
	    }
	    else {
		xBookUtils.collapsePrintPageMenu();
	    }
	}
	// down arrow
	if (event.keyCode == 40) {
	    if ($active_el.attr('id') === "print_page_icon_a") {
		xBookUtils.expandPrintPageMenu();
	    }
	    else {
		var $next_sibling = $active_el.parent('li').next('li');
		if ($next_sibling.length) {
		    $next_sibling.children('a').focus();
		}
		else {
		    // we are at the end of the menu, do nothing
		}
	    }
	}
	// space
	if (event.keyCode == 32) {
	    if ($active_el.attr('id') === "print_page_icon_a") {
		xBookUtils.expandPrintPageMenu();
	    }
	}
	
	event.stopPropagation();
    }); // end keydown handler

} // end xBookUtils._enablePrintPageMenu


xBookUtils.collapsePrintPageMenu = function() {
    
    if ($('#print_page_box').hasClass('expanded') === true) {
	$('#print_page_box').removeClass('expanded');
	$('#print_page_icon a').attr('title', 'Show menu').attr('aria-expanded', 'false').focus();
	$('#print_page_menu').attr('aria-expanded','false').attr('aria-hidden','true');
    }
} // end xBookUtils.collapsePrintPageMenu


xBookUtils.expandPrintPageMenu = function(event) {
    if ($('#print_page_box').hasClass('expanded') === false) {
	$('#print_page_box').addClass('expanded');
	$('#print_page_icon a').attr('title', 'Hide menu').attr('aria-expanded', 'true');
	$('#print_page_menu').attr('aria-expanded','true').attr('aria-hidden','false');
	
	// focus on first menu if no 'event' was passed in or Enter key
	// was used for click
	if (event === undefined || (event.clientX == 0 && event.clientY == 0)) {
	    $('#print_page_menu ul li:first a').focus();
	}
    }
} // end xBookUtils.expandPrintPageMenu


/*
  Fix up page_starts:
  - Add prefix
  - Adjust placement if page_start is first/last element on page
*/ 
xBookUtils._processPageStarts = function() {

    if (player.pageStart_prefix === undefined) {
	player.pageStart_prefix = "Page ";
    }
    
    $('[data-block_type="page_start"]').each(function() {
	var $this = $(this);
	var page_num = $this.text();
	
	// Add a span around the page number
	$this.html('<span class="page_num" id="page_' + page_num + '">' + player.pageStart_prefix + page_num + '</span>');
	
	// If this is the last element in the section then move it
	// up halfway into its previous sibling (this can be applied
	// to any section on the page).
	var $parent = $this.parent('[data-type="section"]');
	if ($parent.length > 0 && $this.is(':last-child')) {
	    var prev_sibling_height = $this.prev().outerHeight();
	    $this.css('margin-top', "-" + (prev_sibling_height/2) + "px");
	}
	// If this is the first element after the h2 in the first section
	// of the page then move it halfway down into its next sibling
	var $first_section = $this.parent('#digfir_section_0');
	if ($first_section.length > 0 && $this.prev('h2.section-title').length > 0) {
	    var next_sibling_height = $this.next().outerHeight();
	    $this.css('margin-top', (next_sibling_height/2) + "px");
	}
    });
} // end xBookUtils._processPageStarts
