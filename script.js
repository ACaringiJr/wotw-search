document.querySelector("form.sectionForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  let iframe = document.querySelector(".strayer");
  let section = document.getElementById("section").value;
  
  // Set the iframe source URL
  iframe.src = "https://digfir-published.macmillanusa.com/strayersources3ehs/strayersources3ehs_ch" + section + ".html";
  
  // Wait for the iframe content to load
  iframe.onload = function() {
    // Try to inject custom styles into the iframe
    try {
      let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Inject the custom style (font) into the iframe
      let styleTag = iframeDoc.createElement("style");
      styleTag.textContent = `
        body {
          font-family: "Trebuchet MS", sans-serif !important;
        }
      `;
      iframeDoc.head.appendChild(styleTag);
    } catch (error) {
      console.error("Error injecting styles: ", error);
    }
  };
});
