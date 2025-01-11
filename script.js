document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.sectionForm");
  const iframe = document.querySelector(".strayer");
  const sectionInput = document.getElementById("section");
  const openTabButton = document.getElementById("openTab");

  // Function to highlight proper nouns and numbers with inline styles
  function highlightTextInIframe(iframe) {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

      // Regex patterns
      const properNounRegex = /(?<![.!?]\s)\b[A-Z][a-z]*\b/g; // Avoids words after punctuation
      const numberRegex = /\b\d+\b/g;

      // Function to process text nodes
      function processTextNode(node) {
        let text = node.nodeValue;

        // Replace proper nouns with inline styles
        text = text.replace(properNounRegex, (match) => {
          return `<span style="background-color: #e0b3ff; border-radius: 3px; padding: 2px;">${match}</span>`;
        });

        // Replace numbers with inline styles
        text = text.replace(numberRegex, (match) => {
          return `<span style="background-color: #add8e6; border-radius: 3px; padding: 2px;">${match}</span>`;
        });

        // Replace the text node with a span-wrapped HTML fragment
        const span = document.createElement("span");
        span.innerHTML = text;
        node.parentNode.replaceChild(span, node);
      }

      // Traverse and process all text nodes
      function traverseNodes(element) {
        const walker = iframeDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
          processTextNode(node);
        }
      }

      // Process the iframe's body content
      traverseNodes(iframeDocument.body);
    } catch (error) {
      console.error("Could not access iframe content:", error);
    }
  }

  // Check if there is a query parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get("section");

  if (section) {
    // Prepopulate the iframe and input field if the section is present in the URL
    sectionInput.value = section;
    iframe.src = `./strayersources3ehs/strayersources3ehs_ch${section}.html`;

    // Wait for the iframe to load before highlighting
    iframe.onload = function () {
      highlightTextInIframe(iframe);
    };
  }

  // Handle form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const sectionValue = sectionInput.value;

    if (sectionValue) {
      // Update the iframe source
      iframe.src = `./strayersources3ehs/strayersources3ehs_ch${sectionValue}.html`;

      // Update the URL with the section parameter
      const newUrl = `${window.location.origin}${window.location.pathname}?section=${encodeURIComponent(sectionValue)}`;
      window.history.pushState({ path: newUrl }, "", newUrl);

      // Wait for the iframe to load before highlighting
      iframe.onload = function () {
        highlightTextInIframe(iframe);
      };
    }
  });

  // Handle "Open in New Tab" button click
  openTabButton.addEventListener("click", function () {
    const sectionValue = sectionInput.value;

    if (sectionValue) {
      const url = `./strayersources3ehs/strayersources3ehs_ch${sectionValue}.html`;
      window.open(url, "_blank");
    } else {
      alert("Please enter a section before opening in a new tab.");
    }
  });
});
