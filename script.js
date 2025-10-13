const lines = [
  "Initializing system...",
  "Establishing secure connection...",
  "Access granted.",
  "",
  "Welcome, Logan Nielsen.",
  "Type 'help' to begin."
];

const terminal = document.getElementById("terminal");
const cursor = document.createElement("span");
cursor.classList.add("cursor");
terminal.appendChild(cursor);

let line = 0;
let char = 0;
let typing = true;

function type() {
  if (line < lines.length) {
    if (char < lines[line].length) {
      cursor.insertAdjacentText("beforebegin", lines[line][char]);
      char++;
      setTimeout(type, 10 + Math.random() * 10);
    } else {
      // Finished a line
      cursor.insertAdjacentHTML("beforebegin", "<br>");
      line++;
      char = 0;
      setTimeout(type, 200);
    }
  } else {
    typing = false;
  }
}

// Remove CRT overlay after animation completes and start typing
setTimeout(() => {
  const overlay = document.getElementById('crtOverlay');
  overlay.classList.add('complete');
  
  // Start typing after CRT animation
  setTimeout(type, 100);
}, 1200);

