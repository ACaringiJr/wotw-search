document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.sectionForm");
  const iframe = document.querySelector(".strayer");
  const sectionInput = document.getElementById("section");
  const openTabButton = document.getElementById("openTab");

  // Function to highlight proper nouns and numbers with inline styles
  function highlightText(element) {
    const properNounRegex = /\b[A-Z][a-z]*\b/g;
    const numberRegex = /\b\d+\b/g;
    const text = element.innerHTML;

    // Replace proper nouns with inline styles for highlighting
    let highlightedText = text.replace(properNounRegex, (match) => {
      return `<span style="background-color: #e0b3ff; border-radius: 3px; padding: 2px;">${match}</span>`;
    });

    // Replace numbers with inline styles for highlighting
    highlightedText = highlightedText.replace(numberRegex, (match) => {
      return `<span style="background-color: #add8e6; border-radius: 3px; padding: 2px;">${match}</span>`;
    });

    element.innerHTML = highlightedText;
  }

  // Process all relevant text elements on the page
  function processPage() {
    const elements = document.querySelectorAll("body *:not(script):not(style):not(iframe)");

    elements.forEach((element) => {
      if (element.children.length === 0) {
        // Only process leaf nodes (elements without children)
        highlightText(element);
      }
    });
  }

  // Highlight text before handling other functionality
  processPage();

  // Check if there is a query parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get("section");

  if (section) {
    // Prepopulate the iframe and input field if the section is present in the URL
    sectionInput.value = section;
    iframe.src = `./strayersources3ehs/strayersources3ehs_ch${section}.html`;
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
