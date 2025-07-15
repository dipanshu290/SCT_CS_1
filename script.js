function caesar(text, shift, encrypt = true) {
  if (!/^-?\d+$/.test(shift)) return "❌ Caesar shift must be a valid integer.";
  shift = parseInt(shift);
  return text.replace(/[a-z]/gi, (c) => {
    const base = c >= "A" && c <= "Z" ? 65 : 97;
    const offset = encrypt ? shift : -shift;
    return String.fromCharCode(
      ((c.charCodeAt(0) - base + offset + 26) % 26) + base
    );
  });
}

function rot13(text) {
  return caesar(text, 13);
}

function vigenere(text, key, encrypt = true) {
  if (!/^[a-z]+$/i.test(key))
    return "❌ Vigenère key must contain letters only.";
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
  const key = document.getElementById("key").value.trim();
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
    if (output.includes("❌")) return;
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

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
}

function bindEnterNavigation() {
  const fields = ["message", "mode", "key", "action"];
  const modeEl = document.getElementById("mode");
  const keyEl = document.getElementById("key");
  const runButton = document.querySelector('button[onclick="runCipher()"]');

  modeEl.addEventListener("change", () => {
    if (modeEl.value === "rot13") {
      keyEl.disabled = true;
      keyEl.value = "";
      keyEl.style.opacity = "0.5";
    } else {
      keyEl.disabled = false;
      keyEl.style.opacity = "1";
    }
  });

  fields.forEach((id, idx) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const isRot13 = modeEl.value === "rot13";
        let nextIdx = idx + 1;
        if (id === "mode" && isRot13) nextIdx++;
        if (id === "key" && isRot13) nextIdx++;
        const nextField = fields[nextIdx];
        if (nextField) {
          document.getElementById(nextField).focus();
        } else {
          runButton.focus();
        }
      }
    });
  });

  runButton.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCipher();
    }
  });
}

window.onload = () => {
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
