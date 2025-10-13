// ========================================
// MODE CONFIGURATION
// ========================================
// Set to 'DEV' to skip/speed up animations for development
// Set to 'PROD' for full experience
const MODE = 'DEV'; // Change to 'DEV' for faster development

// Animation timings based on mode
const TIMINGS = MODE === 'DEV' ? {
  crtDuration: 0.3,        // CRT animation (seconds)
  crtDelay: 300,           // When CRT overlay removes (ms)
  terminalDelay: 0.2,      // Terminal fade-in delay (seconds)
  typingStart: 400,        // When typing starts (ms)
  typingSpeed: 2,          // Characters per keystroke (ms)
  lineDelay: 50,           // Delay between lines (ms)
  replDelay: 100           // Delay before REPL starts (ms)
} : {
  crtDuration: 1.2,        // CRT animation (seconds)
  crtDelay: 600,           // When CRT overlay removes (ms)
  terminalDelay: 1.0,      // Terminal fade-in delay (seconds)
  typingStart: 1050,       // When typing starts (ms)
  typingSpeed: 10,         // Characters per keystroke (ms)
  lineDelay: 200,          // Delay between lines (ms)
  replDelay: 500           // Delay before REPL starts (ms)
};

// Set CSS variables based on mode
document.documentElement.style.setProperty('--crt-duration', `${TIMINGS.crtDuration}s`);
document.documentElement.style.setProperty('--terminal-delay', `${TIMINGS.terminalDelay}s`);

// Load saved theme preference
const savedTheme = localStorage.getItem('terminal-theme');
if (savedTheme) {
  const themes = {
    green: { primary: '#00ff66', glow: '#00ff66' },
    amber: { primary: '#ffb000', glow: '#ffb000' },
    blue: { primary: '#00d4ff', glow: '#00d4ff' },
    matrix: { primary: '#00ff00', glow: '#00ff00' }
  };
  
  if (themes[savedTheme]) {
    const theme = themes[savedTheme];
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--glow-color', theme.glow);
  }
}

const lines = [
  "Initializing system...",
  "Establishing secure connection...",
  "Access granted.",
  "",
  "Welcome, Logan Nielsen.",
  "Type 'help' to begin.",
];

const terminal = document.getElementById("terminal");
const output = document.getElementById("output");
const inputLine = document.getElementById("input-line");
const prompt = document.getElementById("prompt");
const inputText = document.getElementById("input-text");
const cursor = document.querySelector(".cursor");

// Hide prompt and input line initially (shown after typing animation)
inputLine.style.display = "none";

class Type {
  constructor(lines, output, onComplete) {
    this.lines = lines;
    this.output = output;
    this.onComplete = onComplete;
    this.line = 0;
    this.char = 0;
    this.typing = true;
    this.currentLineText = document.createTextNode("");
    this.output.appendChild(this.currentLineText);
  }

  type() {
    if (this.line < this.lines.length) {
      if (this.char < this.lines[this.line].length) {
        this.currentLineText.textContent += this.lines[this.line][this.char];
        this.char++;
        setTimeout(() => this.type(), TIMINGS.typingSpeed + Math.random() * TIMINGS.typingSpeed);
      } else {
        // Finished a line
        this.output.appendChild(document.createElement("br"));
        this.line++;
        this.char = 0;
        this.currentLineText = document.createTextNode("");
        this.output.appendChild(this.currentLineText);
        setTimeout(() => this.type(), TIMINGS.lineDelay);
      }
    } else {
      this.typing = false;
      if (this.onComplete) this.onComplete();
    }
  }
}

class REPL {
  constructor(output, inputText, cursor) {
    this.output = output;
    this.inputText = inputText;
    this.cursor = cursor;
    this.currentInput = "";
    this.active = false;
    this.inputField = null;
    this.typingTimer = null;
    this.commandHistory = [];
    this.historyIndex = -1;
  }

  start() {
    this.active = true;
    this.cursor.classList.add("active");
    // Add spacing before input line
    this.output.appendChild(document.createElement("br"));
    this.output.appendChild(document.createElement("br"));
    // Show the input line
    inputLine.style.display = "flex";
    this.setupInput();
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
      
      // Make cursor solid while typing
      this.cursor.classList.add("typing-active");
      
      // Clear previous timer
      if (this.typingTimer) {
        clearTimeout(this.typingTimer);
      }
      
      // Resume blinking after 500ms of inactivity
      this.typingTimer = setTimeout(() => {
        this.cursor.classList.remove("typing-active");
      }, 500);
    });

    // Listen for Enter and arrow keys
    this.inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.processCommand(this.currentInput);
        this.currentInput = "";
        this.inputField.value = "";
        
        // Clear typing timer and resume blinking
        if (this.typingTimer) {
          clearTimeout(this.typingTimer);
        }
        this.cursor.classList.remove("typing-active");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateHistory(1);
      }
    });
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    // Update history index
    this.historyIndex += direction;
    
    // Clamp to valid range (-1 means no history selected, use empty string)
    if (this.historyIndex < -1) {
      this.historyIndex = -1;
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length - 1;
    }

    // Update input field with history item (or empty if at -1)
    if (this.historyIndex === -1) {
      this.currentInput = "";
      this.inputField.value = "";
    } else {
      this.currentInput = this.commandHistory[this.historyIndex];
      this.inputField.value = this.currentInput;
    }
    
    this.updateDisplay();
  }

  updateDisplay() {
    // Simply update the input text span
    this.inputText.textContent = this.currentInput;
  }

  processCommand(cmd) {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Save to history (don't save empty commands or duplicates of last command)
    if (trimmedCmd && (this.commandHistory.length === 0 || this.commandHistory[this.commandHistory.length - 1] !== trimmedCmd)) {
      this.commandHistory.push(trimmedCmd);
    }
    // Reset history index
    this.historyIndex = this.commandHistory.length;

    // Add the command to output (what user typed)
    const commandLine = document.createElement('div');
    commandLine.textContent = '> ' + cmd;
    this.output.appendChild(commandLine);

    let response = "";
    
    // Handle theme command
    if (trimmedCmd.startsWith("theme ")) {
      const themeName = trimmedCmd.substring(6).trim();
      response = this.changeTheme(themeName);
    } else {
      switch (trimmedCmd) {
        case "help":
          response = "Available commands:<br>  help - Show this message<br>  start - Begin, commence, or embark 😄<br>  clear - Clear the terminal<br>  date - Show current date<br>  theme [green|amber|blue|matrix] - Change color theme";
          break;
        case "start":
          response = "I'm Logan Nielsen, welcome to my website!";
          break;
        case "clear":
          // Clear the output
          this.output.innerHTML = "";
          this.inputText.textContent = "";
          this.currentInput = "";
          this.inputField.value = "";
          // Scroll to top after clear
          terminal.scrollTop = 0;
          this.inputField.focus();
          return;
        case "date":
          response = new Date().toString();
          break;
        case "":
          // Empty command, just clear input
          this.inputText.textContent = "";
          this.currentInput = "";
          this.inputField.value = "";
          // Scroll to bottom
          terminal.scrollTop = terminal.scrollHeight;
          this.inputField.focus();
          return;
        default:
          response = `Command not found: ${cmd}<br>Type 'help' for available commands.`;
      }
    }

    // Add response to output if there is one
    if (response) {
      const responseLine = document.createElement('div');
      responseLine.innerHTML = response;
      this.output.appendChild(responseLine);
    }

    // Clear the input text
    this.inputText.textContent = "";
    this.currentInput = "";
    this.inputField.value = "";
    
    // Scroll to bottom to keep input line visible
    terminal.scrollTop = terminal.scrollHeight;
    
    this.inputField.focus();
  }

  changeTheme(themeName) {
    const themes = {
      green: { primary: '#00ff66', glow: '#00ff66', name: 'Classic Green' },
      amber: { primary: '#ffb000', glow: '#ffb000', name: 'Retro Amber' },
      blue: { primary: '#00d4ff', glow: '#00d4ff', name: 'IBM Blue' },
      matrix: { primary: '#00ff00', glow: '#00ff00', name: 'Matrix Green' }
    };

    if (themes[themeName]) {
      const theme = themes[themeName];
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      document.documentElement.style.setProperty('--glow-color', theme.glow);
      
      // Save theme preference
      localStorage.setItem('terminal-theme', themeName);
      
      return `Theme changed to: ${theme.name}`;
    } else {
      return `Unknown theme: ${themeName}<br>Available themes: green, amber, blue, matrix`;
    }
  }
}

// Remove CRT overlay when animation completes
setTimeout(() => {
  const overlay = document.getElementById("crtOverlay");
  overlay.classList.add("complete");
}, TIMINGS.crtDelay);

// Create REPL instance
const repl = new REPL(output, inputText, cursor);

// Create typer with callback to start REPL when done
const typer = new Type(lines, output, () => {
  setTimeout(() => repl.start(), TIMINGS.replDelay);
});

// Start typing when terminal is visible
setTimeout(() => typer.type(), TIMINGS.typingStart);
