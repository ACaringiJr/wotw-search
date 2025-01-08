document.querySelector("form.sectionForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  let iframe = document.querySelector(".strayer");
  let section = document.getElementById("section").value;

  // Set the iframe source URL
  iframe.src = "https://digfir-published.macmillanusa.com/strayersources3ehs/strayersources3ehs_ch" + section + ".html";
  
  iframe.contentWindow.document.querySelector("body").style.fontFace = "Trebuchet MS";
});
