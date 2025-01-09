document.querySelector("form.sectionForm").addEventListener("submit", function(event) {
  event.preventDefault();

  let iframe = document.querySelector(".strayer");
  let section = document.getElementById("section").value;

  // Set the iframe source URL to the local file
  iframe.src = "./strayersources3ehs/strayersources3ehs_ch" + section + ".html";

  // Resize the iframe based on the loaded content (only works if same-origin)
  iframe.onload = function() {
    iframe.style.width = iframe.contentWindow.document.body.scrollWidth + 'px';
  };
});
