function caesar(text, shift, encrypt = true) {
  shift = parseInt(shift);
  if (isNaN(shift)) return "❌ Invalid shift value.";
  return text.replace(/[a-z]/gi, (c) => {
    const base = c >= "A" && c <= "Z" ? 65 : 97;
    const offset = encrypt ? shift : -shift;
    return String.fromCharCode(
      ((c.charCodeAt(0) - base + offset + 26) % 26) + base
    );
  });
}

function rot13(text) {
  return caesar(text, 13, true);
}

function vigenere(text, key, encrypt = true) {
  if (!/^[a-z]+$/i.test(key)) return "❌ Vigenère key must be letters only.";
  let result = "",
    j = 0;
  key = key.toUpperCase();
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (/[a-z]/i.test(c)) {
      const base = c >= "A" && c <= "Z" ? 65 : 97;
      const k = key[j % key.length].charCodeAt(0) - 65;
      const offset = encrypt ? k : -k;
      result += String.fromCharCode(
        ((c.charCodeAt(0) - base + offset + 26) % 26) + base
      );
      j++;
    } else {
      result += c;
    }
  }
  return result;
}

function runCipher() {
  const msg = document.getElementById("message").value.trim();
  const mode = document.getElementById("mode").value;
  const key = document.getElementById("key").value;
  const action = document.getElementById("action").value;

  let output = "🧪 Output:\n\n";
  if (!msg) {
    output += "❌ Enter a message first.";
  } else {
    switch (mode) {
      case "caesar":
        output += caesar(msg, key, action === "encrypt");
        break;
      case "rot13":
        output += rot13(msg);
        break;
      case "vigenere":
        output += vigenere(msg, key, action === "encrypt");
        break;
      default:
        output += "❌ Unknown mode.";
    }
  }

  const outputEl = document.getElementById("output");
  outputEl.textContent = output;
  outputEl.scrollIntoView({ behavior: "smooth" });

  setTimeout(() => {
    if (confirm("✅ Cipher complete! Download result as .txt?")) {
      downloadResult();
    }
  }, 300);
}

function downloadResult(filename = "securecipher_result.txt") {
  const output = document.getElementById("output").textContent;
  if (
    !output ||
    output.includes("Awaiting") ||
    output.includes("Enter a message")
  )
    return;
  const blob = new Blob([output], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function copyToClipboard() {
  const output = document.getElementById("output").textContent;
  navigator.clipboard.writeText(output).then(
    () => alert("📋 Cipher result copied to clipboard."),
    () => alert("⚠️ Failed to copy.")
  );
}

function startDictation() {
  if (!("webkitSpeechRecognition" in window)) {
    alert(
      "🚫 Voice input is not supported in this browser. Try Chrome or Edge."
    );
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    document.getElementById("output").textContent = "🎙️ Listening...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("message").value = transcript;
    document.getElementById("output").textContent =
      "✅ Transcribed message inserted.";
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") {
      if (confirm("⚠️ No speech detected. Retry voice input?")) {
        recognition.start(); // Retry listening
      } else {
        document.getElementById("output").textContent =
          "🛑 Voice input canceled.";
      }
    } else {
      alert(`⚠️ Voice input failed: ${event.error}`);
      document.getElementById(
        "output"
      ).textContent = `⚠️ Error: ${event.error}`;
    }
  };

  recognition.start();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js");
    });
  }
}

function bindEnterNavigation() {
  const fields = ["message", "key", "action", "mode"];
  fields.forEach((id, idx) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = fields[idx + 1];
        if (next) {
          document.getElementById(next).focus();
        } else {
          document.querySelector('button[onclick="runCipher()"]').focus();
        }
      }
    });
  });

  document
    .querySelector('button[onclick="runCipher()"]')
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runCipher();
      }
    });
}

window.onload = function () {
  const splash = document.getElementById("splash");
  if (splash) {
    setTimeout(() => {
      splash.style.display = "none";
      document.getElementById("message").focus();
    }, 2000);
  }
  bindEnterNavigation();
  registerServiceWorker();
};
