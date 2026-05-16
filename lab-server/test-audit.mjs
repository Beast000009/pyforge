// Comprehensive audit: every lab × (canonical solution, cheat attempt).
//
// For each lab:
//  - canonical solution → must pass every visible + hidden case
//  - "cheat" (just print case 1's expected) → must FAIL (AST gate or hidden cases)
//
// Run with: node test-audit.mjs

const BASE = "http://127.0.0.1:3030";

async function http(path, opts = {}) {
  const r = await fetch(BASE + path, opts);
  if (!r.ok && r.status !== 204) throw new Error(`HTTP ${r.status} on ${path}: ${await r.text()}`);
  if (r.status === 204) return null;
  return r.json();
}

// Canonical Python solutions — what a real student writes after learning the lesson.
const SOLUTIONS = {
  "s1-1-2": `print("Python is fun!")`,
  "s1-1-3": `color = ""\nprice = 0\nprint(color, price)`,
  "s1-1-4": `v = None\nprint(type(v))`,
  "s1-1-5": `tag = ""\nstart = tag.index('"') + 1\nend = tag.index('"', start)\nurl = tag[start:end]\nprint(url)`,
  "s1-1-6": `a = 0\nb = 0\nprint(a + b)\nprint(a - b)\nprint(a * b)\nprint(a // b)`,
  "s1-1-7": `x = 0.0\ny = 0\nprint(x * y)`,
  "s1-1-8": `skyIsBlue = True\nif skyIsBlue:\n    print("The sky is blue")\nelse:\n    print("The sky is not blue")`,
  "s1-1-9": `firstName='A'\nlastName='B'\nhandle='C'\nsystemsCrashed=0\nmovieHoursLong=0.0\nmovieYear='0'\nprint(firstName + " " + lastName + " " + handle + " " + str(systemsCrashed) + " " + str(movieHoursLong) + " " + movieYear)`,
  "s1-2-1": `dogs = []\nprint(dogs[1])\nprint(len(dogs))`,
  "s1-2-2": `theOne = {}\nfor key in theOne:\n    print(key + ": " + theOne[key])`,
  "s1-3-1": `n = 0\ntotal = 0\nfor i in range(n):\n    total += i\nprint(total)`,
  "s1-3-2": `n = 0\nif n % 15 == 0:\n    print("FizzBuzz")\nelif n % 3 == 0:\n    print("Fizz")\nelif n % 5 == 0:\n    print("Buzz")\nelse:\n    print(n)`,
  "s1-3-3": `name = input("Your name: ")\nprint("Hello, " + name)`,
  "s1-4-1": `with open("/workdir/out.txt", "w") as f:\n    f.write("PyForge")\nwith open("/workdir/out.txt") as f:\n    print(f.read())`,
  "s1-4-2": `def greet(name):\n    return "Hello, " + name + "!"\ntarget = ""\nprint(greet(target))`,
  "s1-4-4": `def square(x):\n    return x * x\nn = 0\nprint(square(n))`,
  "s1-4-5": `import math\nn = 0\nprint(math.sqrt(n))`,
  "s1-5-3": `import requests\nurl = "http://192.168.58.101/"\nr = requests.get(url)\nprint(r.status_code)`,
  "s1-6-1": `import socket\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nprint(s.family)`,
  "s1-6-2": `import socket\ntry:\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    s.connect(("192.168.58.101", 80))\n    print("connected")\nexcept Exception:\n    print("failed")`,
  "s1-6-3": `import socket\ns = socket.socket()\ns.connect(("192.168.58.101", 80))\ns.send(b"GET / HTTP/1.0\\r\\nHost: 192.168.58.101\\r\\n\\r\\n")\ndata = s.recv(4096)\nprint(data.decode().splitlines()[0])`,
  "s1-7-2": `import requests\nr = requests.get("http://192.168.58.101/")\nfor line in r.text.split("\\n"):\n    if "href=" in line:\n        print(line)`,
  "s1-7-3": `urls = []\nunique = []\nfor u in urls:\n    if u not in unique:\n        unique.append(u)\nfor u in unique:\n    print(u)`,
  "s1-7-4": `import requests\nr = requests.get("http://192.168.58.101/")\nseen = []\nfor line in r.text.split("\\n"):\n    if 'href="' in line:\n        s = line.index('href="') + 6\n        e = line.index('"', s)\n        url = line[s:e]\n        if url not in seen:\n            seen.append(url)\n            print(url)`,
  "s2-1-1": `import socket\ns = socket.socket()\ns.connect(("192.168.58.101", 80))\ns.send(b"GET / HTTP/1.0\\r\\n\\r\\n")\ndata = s.recv(4096)\nprint(data.decode().splitlines()[0])`,
  "s2-2-1": `import socket\nport = 80\ntry:\n    s = socket.socket()\n    s.settimeout(2)\n    s.connect(("192.168.58.101", port))\n    print("open")\nexcept Exception:\n    print("closed")`,
  "s2-3-1": `import socket\ns = socket.socket()\ns.bind(("0.0.0.0", 8080))\ns.listen(1)\nc, _ = s.accept()\nc.send(b"OK")\nc.close()`,
  "s2-3-2": `import socket\ns = socket.socket()\ns.bind(("0.0.0.0", 8080))\ns.listen(1)\nc, _ = s.accept()\nc.send(b"Connection Established")\nc.close()`,
  "s2-4-1": `import socket\nfor p in range(78, 83):\n    s = socket.socket()\n    s.settimeout(0.5)\n    if s.connect_ex(("192.168.58.101", p)) == 0:\n        print(p)\n    s.close()`,
  "s2-5-2": `import requests\nr = requests.get("http://192.168.58.101/")\nprint(r.headers["Server"])`,
  "s2-5-3": `import requests\nurl = "http://192.168.58.101/"\nr = requests.get(url)\nfor line in r.text.split("\\n"):\n    if "title" in line:\n        print(line)`,
  "s2-6-1": `import requests\nuser = "alice"\nr = requests.post("http://192.168.58.101/echo", data={"user": user})\nprint(r.text.strip())`,
  "s3-1-1": `sentence = ""\nwords = sentence.split()\nprint(len(words))\nprint("-".join(words))`,
  "s3-1-3": `x = 0.0\nprint(round(x, 2))`,
  "s3-1-5": `v = None\nprint(bool(v))`,
  "s3-2-1": `a = []\nb = []\nsa, sb = set(a), set(b)\nprint(sorted(sa & sb))\nprint(sorted(sa | sb))\nprint(sorted(sa - sb))`,
  "s3-2-4": `data = {}\nprint(data.get("name", "unknown"))`,
  "s3-3-1": `n = 0\nprint(bin(n))`,
  "s3-3-3": `n = 0\nprint(hex(n))`,
  "s3-4-1": `c = ""\nprint(ord(c))`,
  "s3-4-4": `n = 0\nch = chr(n)\nprint(ch)\nprint(ord(ch))`,
  "s3-7-3": `import json\npayload = ""\ndata = json.loads(payload)\nprint(data["name"])\nprint(data["count"])`,
};

// "Cheat": just print case 1's expected output (or expectedOutput) — bypasses the actual logic.
function cheatFor(lab) {
  const firstExp = lab.cases?.[0]?.expected ?? lab.expectedOutput ?? "";
  return `print(${JSON.stringify(firstExp)}, end="")`;
}

function pyRepr(val) {
  if (typeof val === "string") return JSON.stringify(val);
  if (val === null || val === undefined) return "None";
  if (typeof val === "boolean") return val ? "True" : "False";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return "[" + val.map(pyRepr).join(", ") + "]";
  if (typeof val === "object") {
    return "{" + Object.entries(val).map(([k, v]) => `${JSON.stringify(k)}: ${pyRepr(v)}`).join(", ") + "}";
  }
  return JSON.stringify(val);
}

// Stronger cheat: branch on every visible input and print that visible answer.
// Hidden cases should catch this even when the code has real if/elif structure.
function branchCheatFor(lab) {
  if (!lab.cases?.length || !lab.hiddenCaseCount || !lab.paramName) return null;
  const names = Array.isArray(lab.paramName) ? lab.paramName : [lab.paramName];
  const prelude = names.map((name) => `${name} = None`).join("\n");
  const expr = names.length === 1 ? names[0] : `(${names.join(", ")})`;
  const valueFor = (input) => {
    if (names.length === 1) return pyRepr(input);
    return `(${names.map((name) => pyRepr(input?.[name])).join(", ")})`;
  };
  const branches = lab.cases.map((c, i) => {
    const kw = i === 0 ? "if" : "elif";
    return `${kw} ${expr} == ${valueFor(c.input)}:\n    print(${JSON.stringify(c.expected)}, end="")`;
  }).join("\n");
  const fallback = `else:\n    print(${JSON.stringify(lab.cases[0].expected)}, end="")`;
  return `${prelude}\n${branches}\n${fallback}`;
}

async function main() {
  const { labs } = await http("/labs");
  console.log(`\nAuditing ${labs.length} labs — solution + cheat for each\n`);

  let solOk = 0, solFail = 0, cheatBlocked = 0, cheatPassed = 0;
  let branchBlocked = 0, branchPassed = 0, branchSkipped = 0;
  const failures = [];

  for (const lab of labs) {
    const id = lab.subsectionId;
    const session = await http(`/labs/${id}/session`, { method: "POST" });
    const sid = session.sessionId;

    try {
      // Canonical solution
      const sol = SOLUTIONS[id];
      let solDetail = " (no canonical solution provided)";
      let solAllPass = false;
      if (sol) {
        const r1 = await http(`/labs/${id}/session/${sid}/verify`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: sol }),
        });
        const total = r1.results?.length || 0;
        const passed = r1.results?.filter(r => r.pass).length || 0;
        solAllPass = passed === total && total > 0 && !r1.gateError;
        solDetail = ` solution=${passed}/${total}${r1.gateError ? ` (AST: ${r1.gateError.slice(0, 60)})` : ""}`;
      }
      if (solAllPass) solOk++; else { solFail++; failures.push({ id, kind: "solution", detail: solDetail }); }

      // Cheat attempt. Some intro labs (allowsHardcode) explicitly teach
      // printing one fixed string — there the canonical answer and the
      // "cheat" are the same program, so a hardcode is the intended solution.
      let cheatDetail;
      if (lab.allowsHardcode) {
        cheatBlocked++;
        cheatDetail = " cheat=n/a (hardcode is the lesson — exempt)";
      } else {
        const cheat = cheatFor(lab);
        const r2 = await http(`/labs/${id}/session/${sid}/verify`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: cheat }),
        });
        const cT = r2.results?.length || 0;
        const cP = r2.results?.filter(r => r.pass).length || 0;
        const cheatAllPass = cP === cT && cT > 0 && !r2.gateError;
        cheatDetail = ` cheat=${cP}/${cT}${r2.gateError ? " (AST blocked)" : (cheatAllPass ? " ⚠ GOT THROUGH" : " ✓ caught")}`;
        if (cheatAllPass) { cheatPassed++; failures.push({ id, kind: "cheat-passed", detail: cheatDetail }); }
        else cheatBlocked++;
      }

      let branchDetail = "";
      const branchCheat = branchCheatFor(lab);
      if (!branchCheat || lab.allowsHardcode) {
        branchSkipped++;
      } else {
        const r3 = await http(`/labs/${id}/session/${sid}/verify`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: branchCheat }),
        });
        const bT = r3.results?.length || 0;
        const bP = r3.results?.filter(r => r.pass).length || 0;
        const branchAllPass = bP === bT && bT > 0 && !r3.gateError;
        branchDetail = ` branch=${bP}/${bT}${r3.gateError ? " (AST blocked)" : (branchAllPass ? " ⚠ GOT THROUGH" : " ✓ caught")}`;
        if (branchAllPass) { branchPassed++; failures.push({ id, kind: "branch-cheat-passed", detail: branchDetail }); }
        else branchBlocked++;
      }

      console.log(`${solAllPass ? "✓" : "✗"} ${id.padEnd(7)} ${lab.filename.padEnd(22)}${solDetail}${cheatDetail}${branchDetail}`);
    } finally {
      await http(`/labs/${id}/session/${sid}`, { method: "DELETE" });
    }
  }

  console.log("\n=== Audit summary ===");
  console.log(`Solutions: ${solOk}/${labs.length} canonical solutions pass all (visible + hidden) cases`);
  console.log(`Cheats:    ${cheatBlocked}/${labs.length} hardcode-cheats blocked (by AST gate or hidden cases)`);
  console.log(`Branches:  ${branchBlocked}/${branchBlocked + branchPassed} visible-input branch cheats blocked (${branchSkipped} not applicable)`);
  if (failures.length) {
    console.log("\nIssues to address:");
    for (const f of failures) console.log("  •", f.id, f.kind, "—", f.detail);
  }
  process.exit(solFail + cheatPassed + branchPassed === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(2); });
