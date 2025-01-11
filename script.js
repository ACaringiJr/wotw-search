document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.sectionForm");
  const iframe = document.querySelector(".strayer");
  const sectionInput = document.getElementById("section");
  const openTabButton = document.getElementById("openTab");

  // Function to highlight proper nouns and numbers
  function highlightTextInIframe(iframe) {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

      // Regex patterns for proper nouns and numbers
      const properNounRegex = /(?<![.!?\n]\s*)\b[A-Z][a-z]*\b/g; // Excludes words at sentence starts
      const numberRegex = /\b\d+\b/g;

      // Function to process a text node
      function processTextNode(textNode) {
        const text = textNode.nodeValue;

        // Split text into parts to wrap matches
        const parts = text.split(/(\b[A-Z][a-z]*\b|\b\d+\b)/g); // Matches proper nouns and numbers
        const fragment = document.createDocumentFragment();

        parts.forEach((part) => {
          if (properNounRegex.test(part)) {
            const span = document.createElement("span");
            span.style.backgroundColor = "#e0b3ff";
            span.style.borderRadius = "3px";
            span.style.padding = "2px";
            span.textContent = part;
            fragment.appendChild(span);
          } else if (numberRegex.test(part)) {
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

      // Start processing the body of the iframe
      traverseAndHighlight(iframeDocument.body);
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
