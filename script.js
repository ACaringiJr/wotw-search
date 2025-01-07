document.querySelector("form.sectionForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  let iframe = document.querySelector(".strayer");
  let section = document.getElementById("section").value;

  // Set the iframe source URL
  iframe.src = "https://digfir-published.macmillanusa.com/strayersources3ehs/strayersources3ehs_ch" + section + ".html";
  
  // Wait for the iframe content to load
  iframe.onload = function() {
    // Once the iframe is loaded, send a message to inject the custom font
    iframe.contentWindow.postMessage({
      type: "changeFont",
      font: "Trebuchet MS, sans-serif"
    }, "*");
  };
});
