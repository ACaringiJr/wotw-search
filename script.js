document.querySelector("form.sectionForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const iframe = document.querySelector(".strayer");
  const section = document.getElementById("section").value;
  const feedback = document.getElementById("feedback");

  // Reset feedback
  feedback.textContent = "";

  if (!section) {
    feedback.textContent = "Please enter a valid section number.";
    return;
  }

  const url = `https://digfir-published.macmillanusa.com/strayersources3ehs/strayersources3ehs_ch${section}.html`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch section ${section}.`);
      }
      return response.text();
    })
    .then((html) => {
      // Add a custom style to the fetched HTML
      const style = `
        <style>
          body {
            font-family: "Trebuchet MS", sans-serif;
            padding: 1em;
          }
          h1, h2, h3 {
            color: #0073e6;
          }
        </style>
      `;
      const updatedHtml = html.replace(/<\/head>/, style + "</head>");

      // Display the updated HTML in the iframe
      iframe.srcdoc = updatedHtml;
    })
    .catch((error) => {
      feedback.textContent = error.message;
    });
});
