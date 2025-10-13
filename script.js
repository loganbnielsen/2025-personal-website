const lines = [
  "Initializing system...",
  "Establishing secure connection...",
  "Access granted.",
  "",
  "Welcome, Logan Nielsen.",
  "Type 'help' to begin.",
];

const terminal = document.getElementById("terminal");
const cursor = document.createElement("span");
cursor.classList.add("cursor");
terminal.appendChild(cursor);

class Type {
  constructor(lines, cursor, onComplete) {
    this.lines = lines;
    this.cursor = cursor;
    this.onComplete = onComplete;
    this.line = 0;
    this.char = 0;
    this.typing = true;
  }

  type() {
    if (this.line < this.lines.length) {
      if (this.char < this.lines[this.line].length) {
        this.cursor.insertAdjacentText("beforebegin", this.lines[this.line][this.char]);
        this.char++;
        setTimeout(() => this.type(), 10 + Math.random() * 10);
      } else {
        // Finished a line
        this.cursor.insertAdjacentHTML("beforebegin", "<br>");
        this.line++;
        this.char = 0;
        setTimeout(() => this.type(), 200);
      }
    } else {
      this.typing = false;
      if (this.onComplete) this.onComplete();
    }
  }
}

class REPL {
  constructor(terminal, cursor) {
    this.terminal = terminal;
    this.cursor = cursor;
    this.currentInput = "";
    this.active = false;
    this.inputField = null;
    this.inputStartPos = null;
  }

  start() {
    this.active = true;
    this.showPrompt();
    this.setupInput();
  }

  showPrompt() {
    this.cursor.insertAdjacentHTML("beforebegin", "<br>> ");
    this.inputStartPos = this.terminal.childNodes.length - 1;
  }

  setupInput() {
    // Create invisible input field to capture all keyboard input
    this.inputField = document.createElement("input");
    this.inputField.type = "text";
    this.inputField.id = "hidden-input";
    this.inputField.autocomplete = "off";
    this.inputField.autocapitalize = "off";
    this.inputField.spellcheck = false;
    document.body.appendChild(this.inputField);
    
    // Focus it immediately
    this.inputField.focus();

    // Re-focus if user clicks anywhere on the page
    document.addEventListener("click", () => {
      if (this.active) this.inputField.focus();
    });

    // Listen to input changes
    this.inputField.addEventListener("input", (e) => {
      this.currentInput = e.target.value;
      this.updateDisplay();
    });

    // Listen for Enter key
    this.inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.processCommand(this.currentInput);
        this.currentInput = "";
        this.inputField.value = "";
      }
    });
  }

  updateDisplay() {
    // Remove old input display
    const nodesToRemove = [];
    let node = this.cursor.previousSibling;
    
    while (node && node.textContent !== "> ") {
      nodesToRemove.unshift(node);
      node = node.previousSibling;
    }
    
    nodesToRemove.forEach(n => n.remove());

    // Add current input
    if (this.currentInput) {
      this.cursor.insertAdjacentText("beforebegin", this.currentInput);
    }
  }

  processCommand(cmd) {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Remove the current input from display
    this.cursor.insertAdjacentHTML("beforebegin", "<br>");

    let response = "";
    switch (trimmedCmd) {
      case "help":
        response = "Available commands:<br>  help - Show this message<br> start - Begin, commence, or embark 😄<br>  clear - Clear the terminal<br>  date - Show current date";
        break;
      case "start":
        response = "I'm Logan Nielsen, welcome to my website!";
        break;
      case "clear":
        // Clear everything except cursor
        while (this.terminal.firstChild !== this.cursor) {
          this.terminal.removeChild(this.terminal.firstChild);
        }
        this.showPrompt();
        this.inputField.focus();
        return;
      case "date":
        response = new Date().toString();
        break;
      case "":
        this.showPrompt();
        this.inputField.focus();
        return;
      default:
        response = `Command not found: ${cmd}<br>Type 'help' for available commands.`;
    }

    this.cursor.insertAdjacentHTML("beforebegin", response);
    this.showPrompt();
    this.inputField.focus();
  }
}

// Remove CRT overlay when animation completes
setTimeout(() => {
  const overlay = document.getElementById("crtOverlay");
  overlay.classList.add("complete");
}, 600);

// Create REPL instance
const repl = new REPL(terminal, cursor);

// Create typer with callback to start REPL when done
const typer = new Type(lines, cursor, () => {
  setTimeout(() => repl.start(), 500);
});

// Start typing when terminal is visible
setTimeout(() => typer.type(), 1050);
