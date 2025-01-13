document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form.sectionForm");
  const iframe = document.querySelector(".strayer");
  const sectionInput = document.getElementById("section");
  const openTabButton = document.getElementById("openTab");

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
