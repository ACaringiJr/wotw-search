document.querySelector("form.sectionForm").addEventListener("submit", function(event) {
  event.preventDefault();

  let iframe = document.querySelector(".strayer");
  let section = document.getElementById("section").value;

  iframe.src = "./strayersources3ehs/strayersources3ehs_ch" + section + ".html";
});
