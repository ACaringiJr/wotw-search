// ===================================================================
// class inheritance pattern, from http://ejohn.org/blog/simple-javascript-inheritance/
// Inspired by base2 and Prototype
function ______Class_Inheritance_Pattern() {}	// PW: the function lines starting with "______" are really just comments, to make things easier to find in BBEdit's function menu
(function(){
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	this.Class = function(){};
	
	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;
		
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;
		
		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function" && 
				typeof _super[name] == "function" && fnTest.test(prop[name]) ?
				(function(name, fn){
					return function() {
						var tmp = this._super;
						
						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = _super[name];
						
						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply(this, arguments);				
						this._super = tmp;
						
						return ret;
					};
				})(name, prop[name]) :
				prop[name];
		}
		
		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}
		
		// Populate our constructed prototype object
		Class.prototype = prototype;
		
		// Enforce the constructor to be what we expect
		Class.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;
		
		return Class;
	};
})();

// Implement a shuffle method for arrays
Array.prototype.shuffle = function () {
	var n = this.length;
	for (var j = n - 1; j > 0; j--) {
		var k = Math.floor(Math.random() * (j + 1));
		var tmp = this[j];
		this[j] = this[k];
		this[k] = tmp;
	}
}

// safe log function, so we don't get exceptions in browsers that don't support
// console.log
function safe_log(s) {
	try {
		console.log(s);
	} catch(e) {}
}


function ______Metadata() {}		// comment so that BBEdit's function menu works better
var Metadata = Class.extend({
	add: function(key, value) {
		if (key != "" && key != null) {
			if (this.md_options.lowercase_keys == true) {
				key = key.toLowerCase();
			} else if (this.md_options.uppercase_keys == true) {
				key = key.toUpperCase();
			}
		}

		// if md[key] is an array, push on to the array
		if (typeof(this[key]) == "object") {
			this[key].push(value);

		// else store the key/value pair in the item's metadata array
		} else {
			this[key] = value;
		}
	},
	
	add_from_jq: function(jq) {
		if (jq == null || jq.length == 0) {
			return;
		}
		
		// copy out the html so we can paste it back in at the end
		var original_html = jq.html();
		
		// first extract <field> key-value pairs
		var md = this;
		jq.find("[data-type=field]").each(function(index, element) {
			var key = $(element).attr("key");
			var value = $(element).html();
			md.add(key, value);
		});
		
		// then remove these
		jq.find("[data-type=field]").remove();
		
		// and look for "old-style" lines (_key: value)
		var lines = jq.html().split("\n");
		for (var i = 0; i < lines.length; ++i) {
			var l = $.trim(lines[i]).replace(/^_/, "");
			if (l == "") continue;
			
			if (l.search(/^(.*?)\s*:\s*(.*)/) > -1) {
				md.add(RegExp.$1, RegExp.$2);
			} else {
				safe_log("bad metadata line: " + l);
			}
		}
		
		// now restore the original html
		jq.html(original_html);
	},
	
	init: function(options) {
		if (options == null) {
			this.md_options = {};
		} else {
			this.md_options = options;
		}
		
		if (this.md_options.jq != null) {
			this.add_from_jq(this.md_options.jq)
			this.md_options.jq = null;
		}
	}
});


// standardize cookie functions
var Cookies = function() {
	return {
	
	set_value: function(name, val, shouldExpire) {
		var cv = name + "=" + val + "; path=/";
		if (shouldExpire != true) {
			var later = new Date();
			later.setFullYear (later.getFullYear() + 10);
			cv += "; expires=" + later.toGMTString();
		}
		document.cookie = cv;
	},
	
	get_value: function(name) {
		var cook = document.cookie;					// get the cookie
		var pos = cook.indexOf (name + '=');	// look for the named field
		if (pos != -1) {		// if found
			var start = pos + name.length + 1;
			var end = cook.indexOf(";", start);
			if (end == -1) end = cook.length;
			return cook.substring(start, end);
		} else {
			return null;
		}
	},
	
	clear: function(name) {
		var earlier = new Date();
		earlier.setFullYear(earlier.getFullYear() - 10);
		document.cookie = name + "=0; path=/; expires=" + earlier.toGMTString();	
	}

		// Remember: no comma after last item
	};	// end return for public vars and functions
}();


var xxt={};xxt.e=function(a,b){if(a.length==0)return"";var c=xxt.strToLongs(Utf8.encode(a));if(c.length<=1)c[1]=0;var d=xxt.strToLongs(Utf8.encode(b).slice(0,16));var e=c.length;var f=c[e-1],g=c[0],h=2654435769;var i,j,k=Math.floor(6+52/e),l=0;while(k-->0){l+=h;j=l>>>2&3;for(var m=0;m<e;m++){g=c[(m+1)%e];i=(f>>>5^g<<2)+(g>>>3^f<<4)^(l^g)+(d[m&3^j]^f);f=c[m]+=i}}var n=xxt.longsToStr(c);return Base64.encode(n)};xxt.d=function(a,b){if(a.length==0)return"";var c=xxt.strToLongs(Base64.decode(a));var d=xxt.strToLongs(Utf8.encode(b).slice(0,16));var e=c.length;var f=c[e-1],g=c[0],h=2654435769;var i,j,k=Math.floor(6+52/e),l=k*h;while(l!=0){j=l>>>2&3;for(var m=e-1;m>=0;m--){f=c[m>0?m-1:e-1];i=(f>>>5^g<<2)+(g>>>3^f<<4)^(l^g)+(d[m&3^j]^f);g=c[m]-=i}l-=h}var n=xxt.longsToStr(c);n=n.replace(/\0+$/,"");return Utf8.decode(n)};xxt.strToLongs=function(a){var b=new Array(Math.ceil(a.length/4));for(var c=0;c<b.length;c++){b[c]=a.charCodeAt(c*4)+(a.charCodeAt(c*4+1)<<8)+(a.charCodeAt(c*4+2)<<16)+(a.charCodeAt(c*4+3)<<24)}return b};xxt.longsToStr=function(a){var b=new Array(a.length);for(var c=0;c<a.length;c++){b[c]=String.fromCharCode(a[c]&255,a[c]>>>8&255,a[c]>>>16&255,a[c]>>>24&255)}return b.join("")};var Base64={};Base64.code="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";Base64.encode=function(a,b){b=typeof b=="undefined"?false:b;var c,d,e,f,g,h,i,j,k=[],l="",m,n,o;var p=Base64.code;n=b?Utf8.encode(a):a;m=n.length%3;if(m>0){while(m++<3){l+="=";n+="�"}}for(m=0;m<n.length;m+=3){c=n.charCodeAt(m);d=n.charCodeAt(m+1);e=n.charCodeAt(m+2);f=c<<16|d<<8|e;g=f>>18&63;h=f>>12&63;i=f>>6&63;j=f&63;k[m/3]=p.charAt(g)+p.charAt(h)+p.charAt(i)+p.charAt(j)}o=k.join("");o=o.slice(0,o.length-l.length)+l;return o};Base64.decode=function(a,b){b=typeof b=="undefined"?false:b;var c,d,e,f,g,h,i,j,k=[],l,m;var n=Base64.code;m=b?Utf8.decode(a):a;for(var o=0;o<m.length;o+=4){f=n.indexOf(m.charAt(o));g=n.indexOf(m.charAt(o+1));h=n.indexOf(m.charAt(o+2));i=n.indexOf(m.charAt(o+3));j=f<<18|g<<12|h<<6|i;c=j>>>16&255;d=j>>>8&255;e=j&255;k[o/4]=String.fromCharCode(c,d,e);if(i==64)k[o/4]=String.fromCharCode(c,d);if(h==64)k[o/4]=String.fromCharCode(c)}l=k.join("");return b?Utf8.decode(l):l};var Utf8={};Utf8.encode=function(a){var b=a.replace(/[\u0080-\u07ff]/g,function(a){var b=a.charCodeAt(0);return String.fromCharCode(192|b>>6,128|b&63)});b=b.replace(/[\u0800-\uffff]/g,function(a){var b=a.charCodeAt(0);return String.fromCharCode(224|b>>12,128|b>>6&63,128|b&63)});return b};Utf8.decode=function(a){var b=a.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,function(a){var b=(a.charCodeAt(0)&15)<<12|(a.charCodeAt(1)&63)<<6|a.charCodeAt(2)&63;return String.fromCharCode(b)});b=b.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g,function(a){var b=(a.charCodeAt(0)&31)<<6|a.charCodeAt(1)&63;return String.fromCharCode(b)});return b}

// Some useful UI elements, e.g. buttons
var UI_Elements = function() {
	return {
	
	// if "manuscript/preview" is in window.location, assume we're previewing
	in_preview_mode: function() {
		return (window.location.href.indexOf("manuscript/preview") > -1);
	},
	
	relative_file_url: function(url) {
		// start for relative urls in images etc. (see e.g. finish_inline_query in queries)
		// http://127.0.0.1/digfir/generic/test_2012_01_12/test_2012_01_12_1.html
		// http://localhost:3000/manuscript/preview/id/4f0f187da4a16c726b000000/block/id1110633
		
		// If we're in preview mode, the url needs a "/" in front of it
		if (this.in_preview_mode()) {
			url = "/" + url;
		}
		// otherwise it should be OK as is
		
		return url;
	},
	
	// note that fn's must have string arguments enclosed in "s -- e.g. 'alert("foo")', NOT "alert('foo')"
	get_button_html: function(atts) {
		var id = (atts.id != null) ? atts.id : "";
		var label = (atts.label != null) ? atts.label : "Submit";
		var fn = (atts.fn != null) ? atts.fn : 'alert("foo")';
		var extra_class = (atts.extra_class != null) ? atts.extra_class : "";
		
		/*
		var html = "<div class='button_wrapper'>"
			+ "<div id='" + id + "' class='button " + extra_class + "' onclick='" + fn + "'>" + label + "</div>"
			+ "</div>"
			;
		*/
		
		var html = "<button id='" + id + "' class='standard_button " + extra_class + "' onclick='" + fn + "'>"
			+ label + "</button>";

		
		return html;
	},
	
	activate_buttons: function(ids) {
		if (ids != null) {
			for (var i = 0; i < ids.length; ++i) {
				$("#" +ids[i]).button();
			}
		} else {
			$(".standard_button").button();
		}
	},
	
	update_button_label: function(id, new_label) {
		$("#" + id).find("span").html(new_label);
	},

	update_button_class_label: function(theclass, new_label) {
		$("." + theclass).find("span").html(new_label);
	},

	update_button_fn: function(id, new_fn) {
		$("#" + id).attr("onclick", new_fn);
	},
	
	toggle_button: function(id, force) {
		var jq = $("#" + id);
		var currently_showing = (jq.css("display") != "none");

		var new_val;
		if (force != null) {
			new_val = force;
		} else if (currently_showing == null) {
			new_val = false;
		} else {
			new_val = !currently_showing;
		}
		
		// if we're already in the state we need to be, return
		if (new_val == currently_showing) {
			return;
		// else show it..
		} else if (new_val == true) {
			jq.slideDown("fast");
		// ... or hide it -- no animation here
		} else {
			jq.hide();
		}
	}

		// Remember: no comma after last item
	};	// end return for public vars and functions
}();


/**
 * A Javascript object to encode and/or decode html characters using HTML or Numeric entities that handles double or partial encoding
 * Author: R Reid
 * source: http://www.strictly-software.com/htmlencode
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2011 Robert Reid - Strictly-Software.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2011-07-14, Jacques-Yves Bleau: 
 *       - fixed conversion error with capitalized accentuated characters
 *       + converted arr1 and arr2 to object property to remove redundancy
 */

Encoder = {

	// When encoding do we convert characters into html or numerical entities
	EncodeType : "entity",  // entity OR numerical

	isEmpty : function(val){
		if(val){
			return ((val===null) || val.length==0 || /^\s+$/.test(val));
		}else{
			return true;
		}
	},
	arr1: new Array('&nbsp;','&iexcl;','&cent;','&pound;','&curren;','&yen;','&brvbar;','&sect;','&uml;','&copy;','&ordf;','&laquo;','&not;','&shy;','&reg;','&macr;','&deg;','&plusmn;','&sup2;','&sup3;','&acute;','&micro;','&para;','&middot;','&cedil;','&sup1;','&ordm;','&raquo;','&frac14;','&frac12;','&frac34;','&iquest;','&Agrave;','&Aacute;','&Acirc;','&Atilde;','&Auml;','&Aring;','&Aelig;','&Ccedil;','&Egrave;','&Eacute;','&Ecirc;','&Euml;','&Igrave;','&Iacute;','&Icirc;','&Iuml;','&ETH;','&Ntilde;','&Ograve;','&Oacute;','&Ocirc;','&Otilde;','&Ouml;','&times;','&Oslash;','&Ugrave;','&Uacute;','&Ucirc;','&Uuml;','&Yacute;','&THORN;','&szlig;','&agrave;','&aacute;','&acirc;','&atilde;','&auml;','&aring;','&aelig;','&ccedil;','&egrave;','&eacute;','&ecirc;','&euml;','&igrave;','&iacute;','&icirc;','&iuml;','&eth;','&ntilde;','&ograve;','&oacute;','&ocirc;','&otilde;','&ouml;','&divide;','&Oslash;','&ugrave;','&uacute;','&ucirc;','&uuml;','&yacute;','&thorn;','&yuml;','&quot;','&amp;','&lt;','&gt;','&oelig;','&oelig;','&scaron;','&scaron;','&yuml;','&circ;','&tilde;','&ensp;','&emsp;','&thinsp;','&zwnj;','&zwj;','&lrm;','&rlm;','&ndash;','&mdash;','&lsquo;','&rsquo;','&sbquo;','&ldquo;','&rdquo;','&bdquo;','&dagger;','&dagger;','&permil;','&lsaquo;','&rsaquo;','&euro;','&fnof;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;','&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;','&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;','&sigmaf;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&thetasym;','&upsih;','&piv;','&bull;','&hellip;','&prime;','&prime;','&oline;','&frasl;','&weierp;','&image;','&real;','&trade;','&alefsym;','&larr;','&uarr;','&rarr;','&darr;','&harr;','&crarr;','&larr;','&uarr;','&rarr;','&darr;','&harr;','&forall;','&part;','&exist;','&empty;','&nabla;','&isin;','&notin;','&ni;','&prod;','&sum;','&minus;','&lowast;','&radic;','&prop;','&infin;','&ang;','&and;','&or;','&cap;','&cup;','&int;','&there4;','&sim;','&cong;','&asymp;','&ne;','&equiv;','&le;','&ge;','&sub;','&sup;','&nsub;','&sube;','&supe;','&oplus;','&otimes;','&perp;','&sdot;','&lceil;','&rceil;','&lfloor;','&rfloor;','&lang;','&rang;','&loz;','&spades;','&clubs;','&hearts;','&diams;'),
	arr2: new Array('&#160;','&#161;','&#162;','&#163;','&#164;','&#165;','&#166;','&#167;','&#168;','&#169;','&#170;','&#171;','&#172;','&#173;','&#174;','&#175;','&#176;','&#177;','&#178;','&#179;','&#180;','&#181;','&#182;','&#183;','&#184;','&#185;','&#186;','&#187;','&#188;','&#189;','&#190;','&#191;','&#192;','&#193;','&#194;','&#195;','&#196;','&#197;','&#198;','&#199;','&#200;','&#201;','&#202;','&#203;','&#204;','&#205;','&#206;','&#207;','&#208;','&#209;','&#210;','&#211;','&#212;','&#213;','&#214;','&#215;','&#216;','&#217;','&#218;','&#219;','&#220;','&#221;','&#222;','&#223;','&#224;','&#225;','&#226;','&#227;','&#228;','&#229;','&#230;','&#231;','&#232;','&#233;','&#234;','&#235;','&#236;','&#237;','&#238;','&#239;','&#240;','&#241;','&#242;','&#243;','&#244;','&#245;','&#246;','&#247;','&#248;','&#249;','&#250;','&#251;','&#252;','&#253;','&#254;','&#255;','&#34;','&#38;','&#60;','&#62;','&#338;','&#339;','&#352;','&#353;','&#376;','&#710;','&#732;','&#8194;','&#8195;','&#8201;','&#8204;','&#8205;','&#8206;','&#8207;','&#8211;','&#8212;','&#8216;','&#8217;','&#8218;','&#8220;','&#8221;','&#8222;','&#8224;','&#8225;','&#8240;','&#8249;','&#8250;','&#8364;','&#402;','&#913;','&#914;','&#915;','&#916;','&#917;','&#918;','&#919;','&#920;','&#921;','&#922;','&#923;','&#924;','&#925;','&#926;','&#927;','&#928;','&#929;','&#931;','&#932;','&#933;','&#934;','&#935;','&#936;','&#937;','&#945;','&#946;','&#947;','&#948;','&#949;','&#950;','&#951;','&#952;','&#953;','&#954;','&#955;','&#956;','&#957;','&#958;','&#959;','&#960;','&#961;','&#962;','&#963;','&#964;','&#965;','&#966;','&#967;','&#968;','&#969;','&#977;','&#978;','&#982;','&#8226;','&#8230;','&#8242;','&#8243;','&#8254;','&#8260;','&#8472;','&#8465;','&#8476;','&#8482;','&#8501;','&#8592;','&#8593;','&#8594;','&#8595;','&#8596;','&#8629;','&#8656;','&#8657;','&#8658;','&#8659;','&#8660;','&#8704;','&#8706;','&#8707;','&#8709;','&#8711;','&#8712;','&#8713;','&#8715;','&#8719;','&#8721;','&#8722;','&#8727;','&#8730;','&#8733;','&#8734;','&#8736;','&#8743;','&#8744;','&#8745;','&#8746;','&#8747;','&#8756;','&#8764;','&#8773;','&#8776;','&#8800;','&#8801;','&#8804;','&#8805;','&#8834;','&#8835;','&#8836;','&#8838;','&#8839;','&#8853;','&#8855;','&#8869;','&#8901;','&#8968;','&#8969;','&#8970;','&#8971;','&#9001;','&#9002;','&#9674;','&#9824;','&#9827;','&#9829;','&#9830;'),
		
	// Convert HTML entities into numerical entities
	HTML2Numerical : function(s){
		return this.swapArrayVals(s,this.arr1,this.arr2);
	},	

	// Convert Numerical entities into HTML entities
	NumericalToHTML : function(s){
		return this.swapArrayVals(s,this.arr2,this.arr1);
	},


	// Numerically encodes all unicode characters
	numEncode : function(s){
		
		if(this.isEmpty(s)) return "";

		var e = "";
		for (var i = 0; i < s.length; i++)
		{
			var c = s.charAt(i);
			if (c < " " || c > "~")
			{
				c = "&#" + c.charCodeAt() + ";";
			}
			e += c;
		}
		return e;
	},
	
	// HTML Decode numerical and HTML entities back to original values
	htmlDecode : function(s){

		var c,m,d = s;
		
		if(this.isEmpty(d)) return "";

		// convert HTML entites back to numerical entites first
		d = this.HTML2Numerical(d);
		
		// look for numerical entities &#34;
		arr=d.match(/&#[0-9]{1,5};/g);
		
		// if no matches found in string then skip
		if(arr!=null){
			for(var x=0;x<arr.length;x++){
				m = arr[x];
				c = m.substring(2,m.length-1); //get numeric part which is refernce to unicode character
				// if its a valid number we can decode
				if(c >= -32768 && c <= 65535){
					// decode every single match within string
					d = d.replace(m, String.fromCharCode(c));
				}else{
					d = d.replace(m, ""); //invalid so replace with nada
				}
			}			
		}

		return d;
	},		

	// encode an input string into either numerical or HTML entities
	htmlEncode : function(s,dbl){
			
		if(this.isEmpty(s)) return "";

		// do we allow double encoding? E.g will &amp; be turned into &amp;amp;
		dbl = dbl || false; //default to prevent double encoding
		
		// if allowing double encoding we do ampersands first
		if(dbl){
			if(this.EncodeType=="numerical"){
				s = s.replace(/&/g, "&#38;");
			}else{
				s = s.replace(/&/g, "&amp;");
			}
		}

		// convert the xss chars to numerical entities ' " < >
		s = this.XSSEncode(s,false);
		
		if(this.EncodeType=="numerical" || !dbl){
			// Now call function that will convert any HTML entities to numerical codes
			s = this.HTML2Numerical(s);
		}

		// Now encode all chars above 127 e.g unicode
		s = this.numEncode(s);

		// now we know anything that needs to be encoded has been converted to numerical entities we
		// can encode any ampersands & that are not part of encoded entities
		// to handle the fact that I need to do a negative check and handle multiple ampersands &&&
		// I am going to use a placeholder

		// if we don't want double encoded entities we ignore the & in existing entities
		if(!dbl){
			s = s.replace(/&#/g,"##AMPHASH##");
		
			if(this.EncodeType=="numerical"){
				s = s.replace(/&/g, "&#38;");
			}else{
				s = s.replace(/&/g, "&amp;");
			}

			s = s.replace(/##AMPHASH##/g,"&#");
		}
		
		// replace any malformed entities
		s = s.replace(/&#\d*([^\d;]|$)/g, "$1");

		if(!dbl){
			// safety check to correct any double encoded &amp;
			s = this.correctEncoding(s);
		}

		// now do we need to convert our numerical encoded string into entities
		if(this.EncodeType=="entity"){
			s = this.NumericalToHTML(s);
		}

		return s;					
	},

	// Encodes the basic 4 characters used to malform HTML in XSS hacks
	XSSEncode : function(s,en){
		if(!this.isEmpty(s)){
			en = en || true;
			// do we convert to numerical or html entity?
			if(en){
				s = s.replace(/\'/g,"&#39;"); //no HTML equivalent as &apos is not cross browser supported
				s = s.replace(/\"/g,"&quot;");
				s = s.replace(/</g,"&lt;");
				s = s.replace(/>/g,"&gt;");
			}else{
				s = s.replace(/\'/g,"&#39;"); //no HTML equivalent as &apos is not cross browser supported
				s = s.replace(/\"/g,"&#34;");
				s = s.replace(/</g,"&#60;");
				s = s.replace(/>/g,"&#62;");
			}
			return s;
		}else{
			return "";
		}
	},

	// returns true if a string contains html or numerical encoded entities
	hasEncoded : function(s){
		if(/&#[0-9]{1,5};/g.test(s)){
			return true;
		}else if(/&[A-Z]{2,6};/gi.test(s)){
			return true;
		}else{
			return false;
		}
	},

	// will remove any unicode characters
	stripUnicode : function(s){
		return s.replace(/[^\x20-\x7E]/g,"");
		
	},

	// corrects any double encoded &amp; entities e.g &amp;amp;
	correctEncoding : function(s){
		return s.replace(/(&amp;)(amp;)+/,"$1");
	},


	// Function to loop through an array swaping each item with the value from another array e.g swap HTML entities with Numericals
	swapArrayVals : function(s,arr1,arr2){
		if(this.isEmpty(s)) return "";
		var re;
		if(arr1 && arr2){
			//ShowDebug("in swapArrayVals arr1.length = " + arr1.length + " arr2.length = " + arr2.length)
			// array lengths must match
			if(arr1.length == arr2.length){
				for(var x=0,i=arr1.length;x<i;x++){
					re = new RegExp(arr1[x], 'g');
					s = s.replace(re,arr2[x]); //swap arr1 item with matching item from arr2	
				}
			}
		}
		return s;
	},

	inArray : function( item, arr ) {
		for ( var i = 0, x = arr.length; i < x; i++ ){
			if ( arr[i] === item ){
				return i;
			}
		}
		return -1;
	}

}

// MAVE functions for evaluating free-response answers
var MAVE = function() {
	// PRIVATE VARS AND FUNCTIONS
	var current_question_id = null;
	var current_options = null;
	var current_submitted_answer = null;
	var current_submission_id = null;
	var current_submission_timestamp = null;
	var previous_answers = [];
	
	var default_options = {
		max_similarity_score: 0.6
		, min_prototype_score: 0.075
		, min_valid_score: 0.075
		, min_valid_avg_score: 0.075
		, max_question_text_score: 0.5
	}
	
	function round(n) {
		n = Math.round(n*1000) / 1000;
		return n;
	}
	
	function get_option(key) {
		if (current_options != null && current_options[key] != null) {
			return current_options[key];
		} else {
			return default_options[key];
		}
	}
	
	// questions can specify a "_validity_criterion" and/or "_plagiarism_criterion"
	// of 1-5. Translate these into options here.
	// note that these will override any explicit value of min_valid_score, etc
	// that might also be sent in (so don't use both in a question)
	function register_questions_criteria() {
		var v = current_options.validity_criterion;
		if (v == 1) {
			current_options.min_prototype_score = 0.025;
			current_options.min_valid_score = 0.025;
			current_options.min_valid_avg_score = 0.025;
		} else if (v == 2) {
			current_options.min_prototype_score = 0.050;
			current_options.min_valid_score = 0.050;
			current_options.min_valid_avg_score = 0.050;
		} else if (v == 3) {
			// these are the defaults set above
		} else if (v == 4) {
			current_options.min_prototype_score = 0.100;
			current_options.min_valid_score = 0.100;
			current_options.min_valid_avg_score = 0.100;
		} else if (v == 5) {
			current_options.min_prototype_score = 0.125;
			current_options.min_valid_score = 0.125;
			current_options.min_valid_avg_score = 0.125;
		}
		
		var p = current_options.plagiarism_criterion;
		if (p == 1) {
			current_options.max_similarity_score = 0.8;
		} else if (p == 2) {
			current_options.max_similarity_score = 0.7;
		} else if (p == 3) {
			// this is the default set above
		} else if (p == 4) {
			current_options.max_similarity_score = 0.5;
		} else if (p == 5) {
			current_options.max_similarity_score = 0.4;
		}
	}
	
	// return true if the answer is close to another answer already given
	// false means it's *not* a plagiarism
	function plagiarism_check(vd) {
		// item is a plagiarism if...
		
		// maxSimilarityScore (calculated across all answers either verified or submitted as valid) is > max_similarity_score
		if (vd.maxSimilarityScore > get_option("max_similarity_score")
			// or questionTextScore > max_similarity_score
			|| vd.questionTextScore > get_option("max_similarity_score")
			
			// or if maxSimilarityScore is substantial and is == prototypeScore, in which case
			// it's almost certainly some piece of the prototype answer
			// Note that "substantial" needs to be considered as a function of the size of the answer --
			// for a short answer, it's easy to get a lot of overlap here (see e.g. calculus_chapter02_01).
			// Taking this out for now...
			// || (vd.maxSimilarityScore > 0.2 && vd.maxSimilarityScore == vd.prototypeScore)
			) {
			return true;
		} else {
			previous_answers.push(current_submitted_answer);
			return false;
		}
	}
	
	// return true if the answer should be considered "valid" -- an honest attempt
	// to answer the question
	function valid_check(vd) {
		// to be valid...
		if (
			// similarity with prototype answer must be at least x
			// OR max similarity with some other valid answer must be at least x
			// OR average similarity with other valid answers must be at least x
			(vd.prototypeScore > get_option("min_prototype_score") 	// similarity score for prototype
				|| vd.maxValidScore > get_option("min_valid_score")	// max sim score for all valid answers
				|| vd.validScore > get_option("min_valid_avg_score")	// avg sim score for all valids
			)

			// AND average similarity with valid answers must be > avg similarity with invalids
			&& vd.validScore > vd.invalidScore
			
			// AND it can't be too similar to the question
			&& vd.questionTextScore < get_option("max_question_text_score")
			) {
			return true;
			
		} else {
			return false
		}
	}
	
	// PUBLIC VARS AND FUNCTIONS
	return {
	
	public_var: 10,
	
	// possible options:
	//   callback_fn (see validate_answer_success; this should really always be included)
	//   options shown in default_options above
	//   validity_criterion (1-5 -- see above)
	//   plagiarism_criterion (1-5 -- see above)
	validate_answer: function(question_id, submitted_answer, options) {
		current_question_id = question_id;
		current_options = options;
		register_questions_criteria();
		current_submitted_answer = submitted_answer;
		
		// limit length of submitted_answer?
		submitted_answer = submitted_answer.substr(0,1000);
		
		var dataString = "&questionID=" + current_question_id + "&submittedAnswer=" + escape(submitted_answer);
		
		Standard_Dialog.wait("Validating answer...");

		$.ajax({
			type: 'GET',
			url: 'https://responsevalidator.azurewebsites.net/api/Submissions',
			contentType: "application/json; charset=utf-8",
			data: dataString,
			success: MAVE.validate_answer_success,
			error: MAVE.validate_answer_error,
			timeout:5000,
			dataType: "jsonp"
		});
	},
	
	validate_answer_success: function(result) {
		var vd = result.validationDetails;
		
		// close the "waiting" dialog
		Standard_Dialog.close();

		// If there was an error...
		if (vd == null) {	
			// log error result
			var s = "validate_answer error:\n";
			for (var i in result) {
				s += i + ": " + result[i] + "\n";
			}
			safe_log(s)
			
			// for now, in case of an error we assume that the answer is OK
			current_options.callback_fn(true);
			return;
		}
		// else webservice executed successfully
		var s = "* validate_answer success:\n"
			+ "submission: " + current_submitted_answer + "\n"
			+ "max valid score: " + round(vd.maxValidScore) + "\n"
			+ "avg valid score: " + round(vd.validScore) + "\n"
			+ "score against prototype answer: " + round(vd.prototypeScore) + "\n"
			+ "avg invalid score: " + round(vd.invalidScore) + "\n"
			+ "score against question text: " + round(vd.questionTextScore) + "\n"
			+ "max similarity score (plagiarism detection): " + round(vd.maxSimilarityScore) + "\n"
			;
		safe_log(s);
		
		// get current_submission_id and current_submission_timestamp
		current_submission_id = result.ID;
		current_submission_timestamp = result.timestamp;
		
		// If answer is too close to a previously-submitted one, tell them
		if (plagiarism_check(vd) == true) {
			html = "<p>The answer you entered is similar or identical to an answer that was entered previously. Please try again.</p>";
			
			Standard_Dialog.open(html, {title:"Try Again", close: MAVE.invalid_revise, buttons: [{text:"OK", click: MAVE.invalid_revise_and_close}]});
		
		// Else if answer is valid, call callback indicating that submission is valid
		} else if (valid_check(vd)) {
			// first call the webservice to "save" it
			MAVE.submit_answer(false)
			current_options.callback_fn(true);
		
		// otherwise show a modal dialog to make the student sweat...
		} else {
			html = "<p><b>Did you make an honest attempt to answer the question?</b> MAVE (<span style='font-weight:bold; font-size:.75em; cursor:pointer;' onclick='$(\"#whatsmave\").slideToggle()'>what's this?</span>) doesn't think your response is valid, but this may be because you didn't know the answer&mdash;or MAVE may have simply made a mistake.</p>"
				+ "<p id='whatsmave' style='display:none; font-size:.9em; padding:5px;' class='ui-widget-content'>MAVE is our Mechanical Answer Validity Evaluator, a system that uses machine learning algorithms to evaluate whether or not your submission is an honest attempt to answer the question at hand. The system does a good job, but it's not perfect, so click \"Submit Answer\" if you feel you've made your best effort at answering the question.</p>"
				+ "<ul><li>Click \"Revise Answer\" to revise your answer.</li><li>Or click \"Submit Answer\" to submit your answer as it stands, even if you know it's wrong. (You'll get full credit for now, <i>but your grade may be revised later</i>.)</li></ul>"
				;
		
			Standard_Dialog.open(html, {title:"Answer Validity Check", close: MAVE.invalid_revise
				, buttons: [ 
					{text:"Revise Answer", click: MAVE.invalid_revise_and_close}  
					, {text:"Submit Answer", click: function() {MAVE.submit_answer(true);}}
				]});
		}
	},
	
	validate_answer_error: function(jqXHR, textStatus, errorThrown) {
		safe_log("validate_answer_failure; result:");
		safe_log(jqXHR);
		safe_log(textStatus);
		safe_log(errorThrown);

		// for now, in case of an error we assume that the answer is OK
		current_options.callback_fn(true);
	},
	
	submit_answer: function(isStudentOverride) {
		safe_log("MAVE submitting answer");
		Standard_Dialog.close();

		// we send the ajax request to submit the answer, but we don't actually care about the result,
		// because we're going to let the answer go through either way.
		var dataString = "&questionID=" + current_question_id + "&submissionID=" + current_submission_id + "&timestamp=" + current_submission_timestamp + "&isStudentOverride=" + isStudentOverride;
		$.ajax({
			type: 'GET',
			url: 'https://responsevalidator.azurewebsites.net/api/Submissions',
			contentType: "application/json; charset=utf-8",
			data: dataString,
			// success: MAVE.invalid_overrule_success(a),
			dataType: "jsonp",
			success: function() {
					safe_log("updateSubmission returned successfully");
				},
			error: function() {
					safe_log("updateSubmission failed");
				},
			timeout:5000
		});
		
		// call callback indicating that submission is valid
		current_options.callback_fn(true);
	},
	
	invalid_revise_and_close: function() {
		Standard_Dialog.close();
		MAVE.invalid_revise();
	},
	
	// if student says he wants to revise, call the callback_fn indicating that 
	// the answer is not ready to be submitted.
	invalid_revise: function() {
		current_options.callback_fn(false);
	}
	
		// Remember: no comma after last item
	};	// end return for public vars and functions
}();

var Standard_Dialog = function() {
	// PRIVATE VARS AND FUNCTIONS
	var private_var = 5;
	
	function private_method() {
		// do stuff here
	}
	
	// PUBLIC VARS AND FUNCTIONS
	return {
	
	public_var: 10,
	
	// other common options:
	//   title: "Foo"
	//   close: function
	//   buttons: [{text:"OK", click: Standard_Dialog.close}]
	open: function(html, options) {
		if (options == null) options = {};
		if (options.width == "auto") options.width = null;
		else if (options.width == null) options.width = 450;
		if (options.modal == null) options.modal = true;
		if (options.draggable == null) options.draggable = false;
		if (options.resizable == null) options.resizable = false;
		if (options.buttons == "none") options.buttons = null;
		else if (options.buttons == "OK" || options.buttons == null) options.buttons = [{text:"OK", click: Standard_Dialog.close}];
		
		$("#standard_dialog_div").dialog("close");
		$("#standard_dialog_div").remove();

		html = "<div id='standard_dialog_div'>" + html + "</div>";
		$("body").append(html);
		$("#standard_dialog_div").dialog(options);
	},
	
	// for now alert is just like any other dialog; we could change that later.
	wait: function(html, options) {
		if (options == null) options = {};
		options.buttons = "none";
		this.open(html, options);
	},
	
	alert: function(html, options) {
		this.open(html, options);
	},
	
	close: function() {
		// when we close from here, we *don't* call the .dialog("close") fn, so if you need to call the fn defined
		// as the onclose event when you called Standard_Dialog.open(), you should do that separately
		// $("#standard_dialog_div").dialog("close");
		$("#standard_dialog_div").remove();
	}

		// Remember: no comma after last item
	};	// end return for public vars and functions
}();


// "advancedMap" code for imagemaps
var AdvMap = {
    /*
        map: map element
        opts:
        - id (for area)
        - shapes
        - color
        - opacity
        - hover
        -- color
        -- opacity
        -- overCallback  ( returns area )
        -- outCallback  ( returns area )
        - onClick ( returns area )
    */
    addArea: function(map, opts, tq) {

        if ( typeof this.curr_canvas_id == "undefined" ) { this.curr_canvas_id = 0; }
        else { this.curr_canvas_id++; }

        /* Normalize Options */
        var default_opts = {
            'color': '#56B4FE',
            'opacity': 0.4
        };
        opts = $.extend({}, default_opts, opts);

        /* Hover */
        if ( typeof opts.hover == "undefined" ) {
            opts.hover = {};
        }
        if ( typeof opts.hover.color == "undefined" ) { opts.hover.color = opts.color; }
        if ( typeof opts.hover.opacity == "undefined" ) { opts.hover.opacity = opts.opacity; }

        var $map = $(map);
        var map_name = $map.attr('name');
        var $img = $("img[usemap='#"+map_name+"']");
        $wrap = $img.parent('.pic_container');
        if ( !$img.hasClass('initialized') ) {
            AdvMap._initImage($img, $wrap);
            $img.addClass('initialized');
        }

        opts.canvas_id = 'canvas-' + tq.query_index + "_" + this.curr_canvas_id;
        var $canvas = $('<canvas>')
                            .attr('id', opts.canvas_id)
                            .attr('width', $img.width() )
                            .attr('height', $img.height() );
        $img.before($canvas);
        AdvMap._initCanvas($canvas);

        // Add an <area> for each shape, but draw all the shapes on the same <canvas>
        for( var i=0; i<opts.shapes.length; i++ ) {
            var $area = $('<area>')
                            .attr('shape', opts.shapes[i].shape)
                            .attr('coords', opts.shapes[i].coords)
                            .attr('href', '#')
                            .data('opts', opts)
                            .appendTo($map);
    
            /* Events */
            $area.hover(AdvMap._areaHoverOver, AdvMap._areaHoverOut);
            $area.click(AdvMap._areaClick);
        }
        AdvMap._drawShapes($canvas, opts.shapes, opts.color, opts.opacity);
    },
    _drawShapes: function(canvas, shapes, color, opacity) {
        for( var i=0; i<shapes.length; i++ ) {
            AdvMap._drawShape(canvas, shapes[i].shape, shapes[i].coords, color, opacity);
        }
    },
    _drawShape: function(canvas, shape, coords, color, opacity) {
        if ( typeof coords == "string" ) { coords = AdvMap._prepareCoords(coords); }
        var cxt = $(canvas).get(0).getContext('2d');
        cxt.beginPath();
        switch( shape ) {
            case 'rect':
                cxt.rect(coords[0], coords[1], coords[2] - coords[0], coords[3] - coords[1]);
                break;
            case 'circle':
                cxt.arc(coords[0], coords[1], coords[2], 0, Math.PI * 2, false);
                break;
            case 'poly':
                cxt.moveTo(coords[0], coords[1]);
                for(i=2; i < coords.length; i+=2) {
                    cxt.lineTo(coords[i], coords[i+1]);
                }
                break;
        }
        cxt.closePath();
        cxt.fillStyle = AdvMap._css3color(color, opacity);
        cxt.fill();        
    },
    _clearCanvas: function(canvas) {
        var cxt = $(canvas).get(0).getContext('2d');
        cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
    },
    _areaHoverOver: function(e) {
        var $area = $(e.target);
        var opts = $area.data('opts');
        var $canvas = $('#'+opts.canvas_id);
        AdvMap._clearCanvas($canvas);
        AdvMap._drawShapes($canvas, opts.shapes, opts.hover.color, opts.hover.opacity);
        if ( typeof opts.hover.overCallback != "undefined" ) { opts.hover.overCallback($area, $canvas); }
    },
    _areaHoverOut: function(e) {
        var $area = $(e.target);
        var opts = $area.data('opts');
        var $canvas = $('#'+opts.canvas_id);
        AdvMap._clearCanvas($canvas);
        AdvMap._drawShapes($canvas, opts.shapes, opts.color, opts.opacity);
        if ( typeof opts.hover.outCallback != "undefined" ) { opts.hover.outCallback($area, $canvas); }
    },
    _areaClick: function(e) {
        e.preventDefault();
        var $area = $(e.target);
        var opts = $area.data('opts');
        if ( typeof opts.onClick != "undefined" ) { opts.onClick(e, $area, opts.tq); }
    },
    _prepareCoords: function(coords) {
        coords = coords.split(',');
        for (i=0; i < coords.length; i++) { coords[i] = parseFloat(coords[i]); }
        return coords;
    },
    _initCanvas: function(canvas_el) {
        // This needs to be run before any
        // drawing starts so IE can use excanvas.js
		var el = $(canvas_el).get(0);
        if (el.getContext == null) {
            G_vmlCanvasManager.initElement(el);
        }
    },
    _initImage: function(image, wrapper) {
        image = $(image);
        $(wrapper)
            .width( image.width() )
            .height( image.height() );
        $(wrapper).css({'background-image': 'url('+ image.attr('src') +')'});
        image.css('opacity', 0);
        if ($.browser.msie && parseInt($.browser.version) < 8) { image.css('filter', 'Alpha(opacity=0)'); }
    },
    _hex_to_decimal: function(hex) {
        return Math.max(0, Math.min(parseInt(hex, 16), 255));
    },
    _css3color: function(color, opacity) {
        color = color.replace('#', '');
        return 'rgba('+AdvMap._hex_to_decimal(color.substr(0,2))+','+AdvMap._hex_to_decimal(color.substr(2,2))+','+AdvMap._hex_to_decimal(color.substr(4,2))+','+opacity+')';
    }
};
