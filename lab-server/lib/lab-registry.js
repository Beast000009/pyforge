// lab-registry.js — single source of truth for every PyForge lab.
//
// Each entry has:
//   filename, subsectionId, diff, instructions, code, flag, hint,
//   paramName?, expectedOutput? or cases[],
//   requires?  → AST gate (calls/attrs/stmts/defs/forbidden/minLines)
//   hiddenCases? → cases that frontend NEVER sees; run server-side only.
//
// `getPublicLab(id)` returns the lab MINUS hiddenCases — safe to send to client.

export const LAB_REGISTRY = {
  // ═══ Module 1.1 ═════════════════════════════════════════════════════════
  "s1-1-2": {
    filename: "firstscript.py",
    subsectionId: "s1-1-2",
    diff: "easy",
    instructions: 'Write a Python script that prints "Python is fun!" to the terminal.',
    code: '#!/usr/bin/python\n# Modify this line:\nprint("Scripting is fun!")\n',
    expectedOutput: "Python is fun!\n",
    requires: { calls: ["print"] },
    // The very first lab: the lesson IS to print one exact literal string.
    // The canonical solution and a "hardcode cheat" are necessarily identical
    // here, so the audit's cheat heuristic is a false positive — flag it as an
    // intentional, documented exception rather than pretending it's gateable.
    allowsHardcode: true,
    flag: "PYTHON(FIRST_Script_Executed!)",
    hint: "The string inside print() must match the expected text exactly — punctuation and capitalization included.",
  },

  "s1-1-3": {
    filename: "setvars.py",
    subsectionId: "s1-1-3",
    diff: "easy",
    instructions: "Set color to a string and price to an integer, then print them on one line separated by a space. The runner will test with multiple (color, price) pairs.",
    code: '#!/usr/bin/python\ncolor = ""\nprice = 0\nprint(color, price)\n',
    expectedOutput: "red 25\n",
    paramName: ["color", "price"],
    cases: [
      { name: "Red 25",   input: { color: "red",   price: 25 },  expected: "red 25" },
      { name: "Blue 7",   input: { color: "blue",  price: 7  },  expected: "blue 7" },
    ],
    hiddenCases: [
      { input: { color: "green",  price: 99 },  expected: "green 99" },
      { input: { color: "purple", price: 0  },  expected: "purple 0" },
    ],
    requires: { calls: ["print"], minLines: 3 },
    flag: "PYTHON(Variables_assigned!)",
    hint: "Assign any string to color and any integer to price. The starter's print(color, price) already inserts a space between them.",
  },

  "s1-1-4": {
    filename: "datatypes.py",
    subsectionId: "s1-1-4",
    diff: "easy",
    instructions: "Print the Python type of v using the built-in type() function. The runner tests several values — your code must use type() so it works for every input.",
    code: "#!/usr/bin/python\nv = 55\nprint(v)\n",
    paramName: "v",
    cases: [
      { name: "Integer", input: 55,    expected: "<class 'int'>" },
      { name: "String",  input: "hi",  expected: "<class 'str'>" },
      { name: "Float",   input: 3.14,  expected: "<class 'float'>" },
    ],
    hiddenCases: [
      { input: true,        expected: "<class 'bool'>" },
      { input: [1, 2],      expected: "<class 'list'>" },
      { input: { a: 1 },    expected: "<class 'dict'>" },
    ],
    requires: { calls: ["type", "print"] },
    flag: "PYTHON(Type_inspector)",
    hint: "Built-in type() returns the class of any value. Just print whatever it returns.",
  },

  "s1-1-5": {
    filename: "urle.py",
    subsectionId: "s1-1-5",
    diff: "easy",
    instructions: "Slice the URL out of the anchor tag. The URL sits between the first \" and the next \". Find both positions with .index() and slice. Tested with multiple tags.",
    code: `#!/usr/bin/python
tag = '<a href="https://www.offsec.com/blog">Blog</a>'
# Find the indices of the two quotes around the URL, then slice.
start = 0
end = 0
url = tag[start:end]
print(url)
`,
    paramName: "tag",
    cases: [
      { name: "OffSec blog",  input: '<a href="https://www.offsec.com/blog">Blog</a>',  expected: "https://www.offsec.com/blog" },
      { name: "Python docs",  input: '<a href="https://docs.python.org/3/library/string.html">Docs</a>', expected: "https://docs.python.org/3/library/string.html" },
    ],
    hiddenCases: [
      { input: '<a href="https://github.com/anthropics/claude-code">R</a>', expected: "https://github.com/anthropics/claude-code" },
      { input: '<a href="http://example.com/page?id=42">X</a>',             expected: "http://example.com/page?id=42" },
    ],
    requires: { attrs: ["index"], stmts: ["Subscript"] },
    flag: "PYTHON(Slicing_and_Dicing_Them_URLs)",
    hint: "str.index(sub) returns the position of the first occurrence; pass a second arg to start searching from a given offset, so the next quote can be found after the first.",
  },

  "s1-1-6": {
    filename: "intmath.py",
    subsectionId: "s1-1-6",
    diff: "easy",
    instructions: "Print a+b, a-b, a*b, a//b — one per line. Tested with multiple (a, b) pairs.",
    code: "#!/usr/bin/python\na = 10\nb = 3\nprint(a + b)\n",
    paramName: ["a", "b"],
    cases: [
      { name: "10 and 3",  input: { a: 10,  b: 3 }, expected: "13\n7\n30\n3" },
      { name: "100 and 7", input: { a: 100, b: 7 }, expected: "107\n93\n700\n14" },
    ],
    hiddenCases: [
      { input: { a: 20, b: 4 },  expected: "24\n16\n80\n5" },
      { input: { a: 9,  b: 2 },  expected: "11\n7\n18\n4" },
    ],
    requires: { calls: ["print"], stmts: ["BinOp"], minLines: 4 },
    flag: "PYTHON(Integer_arithmetic_unlocked)",
    hint: "One print per operation. The four operators are +, -, *, and // (integer floor division — not /).",
  },

  "s1-1-7": {
    filename: "floats.py",
    subsectionId: "s1-1-7",
    diff: "easy",
    instructions: "Print the product of x and y.",
    code: "#!/usr/bin/python\nx = 3.14\ny = 2\nprint(x)\n",
    paramName: ["x", "y"],
    cases: [
      { name: "Pi × 2",   input: { x: 3.14, y: 2 },  expected: "6.28" },
      { name: "0.5 × 10", input: { x: 0.5,  y: 10 }, expected: "5.0" },
    ],
    hiddenCases: [
      { input: { x: 2.5, y: 4 },   expected: "10.0" },
      { input: { x: 1.1, y: 3 },   expected: "3.3000000000000003" },
    ],
    requires: { calls: ["print"], stmts: ["BinOp"] },
    flag: "PYTHON(Floating_point_works)",
    hint: "Multiply x by y and print the result. Python promotes int × float → float automatically.",
  },

  "s1-1-8": {
    filename: "boolean.py",
    subsectionId: "s1-1-8",
    diff: "easy",
    instructions: "Set skyIsBlue so the script prints 'The sky is blue'. The runner flips the boolean to verify your if/else branching.",
    code: '#!/usr/bin/python\nskyIsBlue = False\nif skyIsBlue:\n    print("The sky is blue")\nelse:\n    print("The sky is not blue")\n',
    expectedOutput: "The sky is blue\n",
    paramName: "skyIsBlue",
    cases: [
      { name: "Sky IS blue",     input: true,  expected: "The sky is blue" },
      { name: "Sky is NOT blue", input: false, expected: "The sky is not blue" },
    ],
    requires: { stmts: ["If"] },
    flag: "PYTHON(It_is_Vdue_to_Rayleigh_scattering)",
    hint: "The starter's if/else is already correct — only the boolean value needs to change. The runner will then flip it to test both branches.",
  },

  "s1-1-9": {
    filename: "typecasting.py",
    subsectionId: "s1-1-9",
    diff: "med",
    instructions: "Fix the print() so all six values appear on one line, space-separated. Must cast numbers via str(). Tested with multiple profiles.",
    code: `#!/usr/bin/python
firstName = 'Dade'
lastName = 'Murphy'
handle = 'Zero Cool'
systemsCrashed = 1995
movieHoursLong = 1.783
movieYear = '1995'
print(firstName + " " + lastName)
`,
    paramName: ["firstName", "lastName", "handle", "systemsCrashed", "movieHoursLong", "movieYear"],
    cases: [
      { name: "Hackers (1995)",     input: { firstName: "Dade",   lastName: "Murphy",   handle: "Zero Cool", systemsCrashed: 1995, movieHoursLong: 1.783, movieYear: "1995" }, expected: "Dade Murphy Zero Cool 1995 1.783 1995" },
      { name: "The Matrix (1999)",  input: { firstName: "Thomas", lastName: "Anderson", handle: "Neo",       systemsCrashed: 1,    movieHoursLong: 2.196, movieYear: "1999" }, expected: "Thomas Anderson Neo 1 2.196 1999" },
    ],
    hiddenCases: [
      { input: { firstName: "Elliot", lastName: "Alderson", handle: "fsociety", systemsCrashed: 17, movieHoursLong: 0.75, movieYear: "2015" }, expected: "Elliot Alderson fsociety 17 0.75 2015" },
      { input: { firstName: "Lisbeth",lastName: "Salander", handle: "Wasp",     systemsCrashed: 4,  movieHoursLong: 2.5,  movieYear: "2011" }, expected: "Lisbeth Salander Wasp 4 2.5 2011" },
    ],
    requires: { calls: ["str", "print"] },
    flag: "PYTHON(Type_casting_with_Grit)",
    hint: "Concat with + and ' ' separators. The two numeric fields (systemsCrashed, movieHoursLong) need str() — string + int raises TypeError.",
  },

  // ═══ Module 1.2 ═════════════════════════════════════════════════════════
  "s1-2-1": {
    filename: "listops.py",
    subsectionId: "s1-2-1",
    diff: "easy",
    instructions: "Print the second item of the list (index 1), then the length. One per line. Tested with multiple lists.",
    code: "#!/usr/bin/python\ndogs = ['golden retriever', 'labrador', 'german shepherd', 'huskies']\nprint(dogs[0])\n",
    paramName: "dogs",
    cases: [
      { name: "Four dogs",   input: ['golden retriever', 'labrador', 'german shepherd', 'huskies'], expected: "labrador\n4" },
      { name: "Two animals", input: ['cat', 'dog'], expected: "dog\n2" },
    ],
    hiddenCases: [
      { input: ['a', 'b', 'c'], expected: "b\n3" },
      { input: ['x', 'y', 'z', 'w', 'q'], expected: "y\n5" },
    ],
    requires: { calls: ["len", "print"], stmts: ["Subscript"] },
    flag: "PYTHON(Lists_indexed)",
    hint: "Index lists with [i] (0-based). Built-in len() returns the size.",
  },

  "s1-2-2": {
    filename: "forDictionary.py",
    subsectionId: "s1-2-2",
    diff: "easy",
    instructions: "Print each 'key: value' pair from theOne. Requires a real for loop — tested with multiple dictionaries.",
    code: "#!/usr/bin/python\ntheOne = {'firstName': 'Thomas', 'lastName': 'Anderson', 'occupation': 'Programmer', 'company': 'MetaCortex'}\nfor key in theOne:\n    pass\n",
    paramName: "theOne",
    cases: [
      { name: "Neo (Matrix)", input: { firstName: "Thomas", lastName: "Anderson", occupation: "Programmer", company: "MetaCortex" }, expected: "firstName: Thomas\nlastName: Anderson\noccupation: Programmer\ncompany: MetaCortex" },
      { name: "Empty dict",   input: {}, expected: "" },
    ],
    hiddenCases: [
      { input: { only: "one" }, expected: "only: one" },
      { input: { a: "1", b: "2", c: "3" }, expected: "a: 1\nb: 2\nc: 3" },
    ],
    requires: { stmts: ["For"], calls: ["print"] },
    flag: "PYTHON(Guts_is_packing)",
    hint: "Iterating a dict (for k in theOne) yields keys. Look up the value with theOne[k] and concat with ': '.",
  },

  // ═══ Module 1.3 ═════════════════════════════════════════════════════════
  "s1-3-1": {
    filename: "loops.py",
    subsectionId: "s1-3-1",
    diff: "easy",
    instructions: "Sum integers from 0 to n-1, then print the total. Must use a loop.",
    code: "#!/usr/bin/python\nn = 5\ntotal = 0\nfor i in range(n):\n    pass\nprint(total)\n",
    paramName: "n",
    cases: [
      { name: "n = 5",  input: 5,  expected: "10" },
      { name: "n = 10", input: 10, expected: "45" },
    ],
    hiddenCases: [
      { input: 0,  expected: "0" },
      { input: 1,  expected: "0" },
      { input: 50, expected: "1225" },
    ],
    requires: { stmts: ["For"], calls: ["range", "print"] },
    flag: "PYTHON(Loop_de_loop)",
    hint: "range(n) yields 0..n-1. Accumulate each value into total inside the for body, then print total after the loop.",
  },

  "s1-3-2": {
    filename: "fizzbuzz.py",
    subsectionId: "s1-3-2",
    diff: "med",
    instructions: "Classify n: 'FizzBuzz' for multiples of 15, 'Fizz' for 3, 'Buzz' for 5, otherwise print the number. Requires real branching — tested with many values.",
    code: '#!/usr/bin/python\nn = 15\nif False:\n    print("FizzBuzz")\nelse:\n    print(n)\n',
    paramName: "n",
    cases: [
      { name: "Divisible by 15", input: 15, expected: "FizzBuzz" },
      { name: "Divisible by 3",  input: 9,  expected: "Fizz" },
      { name: "Divisible by 5",  input: 25, expected: "Buzz" },
      { name: "Neither",         input: 7,  expected: "7" },
    ],
    hiddenCases: [
      { input: 0,   expected: "FizzBuzz" },
      { input: 30,  expected: "FizzBuzz" },
      { input: 33,  expected: "Fizz" },
      { input: 100, expected: "Buzz" },
      { input: 11,  expected: "11" },
    ],
    requires: { stmts: ["If"], calls: ["print"] },
    flag: "PYTHON(Conditionals_mastered)",
    hint: "Use the modulo operator % to test divisibility. Order matters — check the most restrictive case (multiple of 15) before 3 or 5.",
  },

  "s1-3-3": {
    filename: "input.py",
    subsectionId: "s1-3-3",
    diff: "easy",
    instructions: "Read a line from stdin (input()) and print it back with 'Hello, ' prefix.",
    code: '#!/usr/bin/python\nname = input("Your name: ")\nprint(name)\n',
    cases: [
      { name: "Alice", stdin: "Alice\n", expected: "Your name: Hello, Alice" },
      { name: "Trinity", stdin: "Trinity\n", expected: "Your name: Hello, Trinity" },
    ],
    hiddenCases: [
      { stdin: "Neo\n", expected: "Your name: Hello, Neo" },
      { stdin: "fsociety\n", expected: "Your name: Hello, fsociety" },
    ],
    requires: { calls: ["input", "print"] },
    flag: "PYTHON(Standard_input)",
    hint: "The starter already reads stdin with input(). Just prefix what gets printed with 'Hello, '.",
  },

  // ═══ Module 1.4 ═════════════════════════════════════════════════════════
  "s1-4-1": {
    filename: "fileio.py",
    subsectionId: "s1-4-1",
    diff: "easy",
    instructions: "Write 'PyForge' to /workdir/out.txt, then read it back and print the contents.",
    code: "#!/usr/bin/python\n# Write 'PyForge' to /workdir/out.txt, then read & print it\n",
    expectedOutput: "PyForge\n",
    requires: { calls: ["open", "print"] },
    flag: "PYTHON(File_io_handled)",
    hint: "open(path, 'w') for writing, open(path) for reading. Use a with-block so the file closes automatically. Then print what f.read() returns.",
  },

  "s1-4-2": {
    filename: "funcs.py",
    subsectionId: "s1-4-2",
    diff: "easy",
    instructions: "Define greet(name) that returns 'Hello, <name>!' and call it with target.",
    code: '#!/usr/bin/python\ndef greet(name):\n    return ""\n\ntarget = "Alice"\nprint(greet(target))\n',
    paramName: "target",
    cases: [
      { name: "Alice", input: "Alice", expected: "Hello, Alice!" },
      { name: "Bob",   input: "Bob",   expected: "Hello, Bob!" },
    ],
    hiddenCases: [
      { input: "Neo",     expected: "Hello, Neo!" },
      { input: "Trinity", expected: "Hello, Trinity!" },
    ],
    requires: { defs: ["greet"], stmts: ["Return"], calls: ["print"] },
    flag: "PYTHON(Functions_speak)",
    hint: "Inside greet(), build the string with concatenation and return it (don't print from inside the function).",
  },

  "s1-4-4": {
    filename: "returnvals.py",
    subsectionId: "s1-4-4",
    diff: "easy",
    instructions: "Define square(x) that returns x*x. Tested with several values.",
    code: "#!/usr/bin/python\ndef square(x):\n    return 0\n\nn = 4\nprint(square(n))\n",
    paramName: "n",
    cases: [
      { name: "4",   input: 4,   expected: "16" },
      { name: "10",  input: 10,  expected: "100" },
    ],
    hiddenCases: [
      { input: -3, expected: "9" },
      { input: 0,  expected: "0" },
      { input: 7,  expected: "49" },
    ],
    requires: { defs: ["square"], stmts: ["Return"] },
    flag: "PYTHON(Return_to_sender)",
    hint: "Return x * x (or x ** 2). The function body needs a real return statement — the starter's `return 0` always gives 0.",
  },

  "s1-4-5": {
    filename: "importmath.py",
    subsectionId: "s1-4-5",
    diff: "easy",
    instructions: "Import math and print math.sqrt(n).",
    code: "#!/usr/bin/python\nimport math\nn = 16\nprint(n)\n",
    paramName: "n",
    cases: [
      { name: "16",  input: 16,  expected: "4.0" },
      { name: "25",  input: 25,  expected: "5.0" },
    ],
    hiddenCases: [
      { input: 144, expected: "12.0" },
      { input: 2,   expected: "1.4142135623730951" },
    ],
    requires: { stmts: ["Import"], calls: ["math.sqrt", "print"] },
    flag: "PYTHON(Imports_imported)",
    hint: "math.sqrt(n) returns a float. Import the math module at the top, then print the result.",
  },

  // ═══ Module 1.5 / 1.6 ════════════════════════════════════════════════════
  "s1-5-3": {
    filename: "fetch.py",
    subsectionId: "s1-5-3",
    diff: "med",
    instructions: "Use the requests library to GET the given url and print the response status code. The runner tests several URLs — your code must work for all of them.",
    code: '#!/usr/bin/python\nimport requests\nurl = "http://192.168.58.101/"\n# GET url and print status_code\n',
    paramName: "url",
    cases: [
      { name: "Homepage 200",  input: "http://192.168.58.101/",            expected: "200" },
      { name: "About page 200", input: "http://192.168.58.101/about",      expected: "200" },
    ],
    hiddenCases: [
      { input: "http://192.168.58.101/missing",     expected: "404" },
      { input: "http://192.168.58.101/status/404",  expected: "404" },
      { input: "http://192.168.58.101/status/500",  expected: "500" },
      { input: "http://192.168.58.101/status/204",  expected: "204" },
    ],
    requires: { stmts: ["Import"], calls: ["requests.get", "print"], attrs: ["status_code"] },
    flag: "PYTHON(Web_requests_master)",
    hint: "requests.get(url) returns a Response. Its .status_code attribute holds the HTTP code as an int.",
  },

  "s1-6-1": {
    filename: "socket_create.py",
    subsectionId: "s1-6-1",
    diff: "easy",
    instructions: "Create a TCP socket using socket.AF_INET + socket.SOCK_STREAM, then print its family attribute.",
    code: "#!/usr/bin/python\nimport socket\n# create a TCP socket and print s.family\n",
    expectedOutput: "2\n",
    requires: { stmts: ["Import"], calls: ["socket.socket", "print"], attrs: ["family"] },
    flag: "PYTHON(Sockets_created)",
    hint: "socket.socket() takes (family, type). For a TCP socket pass socket.AF_INET and socket.SOCK_STREAM. The resulting socket exposes .family.",
  },

  "s1-6-2": {
    filename: "socket_connect.py",
    subsectionId: "s1-6-2",
    diff: "med",
    instructions: "Open a TCP socket and connect to 192.168.58.101:80. Print 'connected' on success, 'failed' on error.",
    code: "#!/usr/bin/python\nimport socket\n# connect to ('192.168.58.101', 80) and print 'connected' or 'failed'\n",
    expectedOutput: "connected\n",
    requires: { calls: ["socket.socket", "print"], attrs: ["connect"], stmts: ["Try"] },
    flag: "PYTHON(Sockets_connected)",
    hint: "s.connect() takes a (host, port) tuple. Wrap it in try/except — on success print 'connected', on any Exception print 'failed'.",
  },

  "s1-6-3": {
    filename: "socket_send.py",
    subsectionId: "s1-6-3",
    diff: "med",
    instructions: "Connect to 192.168.58.101:80, send 'GET / HTTP/1.0\\r\\nHost: 192.168.58.101\\r\\n\\r\\n' encoded as bytes, then print the first line of the response (decoded).",
    code: "#!/usr/bin/python\nimport socket\n# send a raw HTTP GET and print the first response line\n",
    expectedOutput: "HTTP/1.1 200 OK\n",
    requires: { calls: ["socket.socket", "print"], attrs: ["connect", "send", "recv"] },
    flag: "PYTHON(Bytes_on_the_wire)",
    hint: "send() needs bytes (b'...'). An HTTP/1.0 request ends with a blank line — i.e. \\r\\n\\r\\n. recv() returns bytes; decode() to str, then splitlines()[0] gives the status line.",
  },

  // ═══ Module 1.7 ═════════════════════════════════════════════════════════
  "s1-7-2": {
    filename: "spider_parse.py",
    subsectionId: "s1-7-2",
    diff: "med",
    instructions: "GET http://192.168.58.101/, split the body by newline, and print every line that contains 'href='.",
    code: "#!/usr/bin/python\nimport requests\n# print every line of r.text that contains 'href='\n",
    expectedOutput: "    <a href=\"/about\">About</a>\n    <a href=\"/contact\">Contact</a>\n    <a href=\"/blog\">Blog</a>\n",
    requires: { stmts: ["For", "If"], calls: ["requests.get", "print"], attrs: ["text", "split"] },
    flag: "PYTHON(Lines_of_href)",
    hint: "r.text is the response body as a string. Split it on '\\n' and print only the lines where 'href=' appears.",
  },

  "s1-7-3": {
    filename: "dedupe.py",
    subsectionId: "s1-7-3",
    diff: "med",
    instructions: "Filter urls to unique entries, preserving order. Tested with several lists.",
    code: '#!/usr/bin/python\nurls = ["http://a.com", "http://b.com", "http://a.com", "http://c.com"]\nunique = []\nfor u in urls:\n    pass\nfor u in unique:\n    print(u)\n',
    paramName: "urls",
    cases: [
      { name: "Mixed",       input: ["http://a.com", "http://b.com", "http://a.com", "http://c.com"], expected: "http://a.com\nhttp://b.com\nhttp://c.com" },
      { name: "All unique",  input: ["a", "b", "c"], expected: "a\nb\nc" },
    ],
    hiddenCases: [
      { input: ["x", "x", "x"], expected: "x" },
      { input: [],              expected: "" },
      { input: ["1", "2", "1", "3", "2", "4"], expected: "1\n2\n3\n4" },
    ],
    requires: { stmts: ["For", "If"], calls: ["print"], attrs: ["append"] },
    flag: "PYTHON(No_duplicates_allowed)",
    hint: "Walk urls; for each one, append to a separate list only if it's not already there. Using set() would lose order — don't.",
  },

  "s1-7-4": {
    filename: "spider.py",
    subsectionId: "s1-7-4",
    diff: "hard",
    instructions: "Fetch http://192.168.58.101/, extract every unique href that contains '192.168.58.101' OR is a relative path (starts with /). Print one URL per line, in order of first appearance.",
    code: "#!/usr/bin/python\nimport requests\n# fetch + parse + dedupe URLs\n",
    expectedOutput: "/about\n/contact\n/blog\n",
    requires: { stmts: ["For", "If"], calls: ["requests.get", "print"], attrs: ["text", "split"] },
    flag: "PYTHON(Putting_It_All_Together_Spider)",
    hint: "Combines labs 1.5.3 (fetch), 1.7.2 (find href lines), and 1.7.3 (dedupe). For each href= line, slice between the two '\"' characters; keep a list of URLs already printed.",
  },

  // ═══ Module 2 ═══════════════════════════════════════════════════════════
  "s2-1-1": {
    filename: "client.py",
    subsectionId: "s2-1-1",
    diff: "med",
    instructions: "Build a TCP client that connects to 192.168.58.101:80, sends a basic HTTP GET, reads the response, and prints the response's HTTP status line.",
    code: "#!/usr/bin/python\nimport socket\n# build a TCP client\n",
    expectedOutput: "HTTP/1.1 200 OK\n",
    requires: { calls: ["socket.socket", "print"], attrs: ["connect", "send", "recv"] },
    flag: "PYTHON(Basic_TCP_client)",
    hint: "Same shape as lab 1.6.3 (socket_send). Connect to (host, 80), send b'GET / HTTP/1.0\\r\\n\\r\\n', recv, decode, print the first line.",
  },

  "s2-2-1": {
    filename: "tryexcept.py",
    subsectionId: "s2-2-1",
    diff: "easy",
    instructions: "Try connecting to 192.168.58.101 on port (variable). Print 'open' or 'closed'. Tested with multiple ports.",
    code: '#!/usr/bin/python\nimport socket\nport = 80\n# print "open" or "closed"\n',
    paramName: "port",
    cases: [
      { name: "Port 80 (open)",     input: 80, expected: "open" },
      { name: "Port 9999 (closed)", input: 9999, expected: "closed" },
    ],
    hiddenCases: [
      { input: 80,    expected: "open" },
      { input: 22,    expected: "closed" },
      { input: 65000, expected: "closed" },
    ],
    requires: { stmts: ["Try"], calls: ["socket.socket", "print"] },
    flag: "PYTHON(Try_and_except)",
    hint: "Set a short s.settimeout() so closed ports fail quickly. Wrap s.connect(('192.168.58.101', port)) in try/except — print 'open' on success, 'closed' on Exception.",
  },

  "s2-3-1": {
    filename: "server.py",
    subsectionId: "s2-3-1",
    diff: "hard",
    instructions: "Build a TCP server that binds 0.0.0.0:8080, accepts a connection, sends b'OK' to the client, and closes. The runner spawns a netcat client and prints what it receives.",
    code: "#!/usr/bin/python\nimport socket\n# bind 0.0.0.0:8080, accept one, send b'OK', close\n",
    expectedOutput: "OK\n",
    serverLab: true,
    serverPort: 8080,
    requires: { calls: ["socket.socket"], attrs: ["bind", "listen", "accept", "send", "close"] },
    flag: "PYTHON(Server_built)",
    hint: "Server lifecycle: bind((host, port)) → listen() → accept() (returns conn, addr) → conn.send(bytes) → conn.close(). The runner connects from a netcat client.",
  },

  "s2-3-2": {
    filename: "server_test.py",
    subsectionId: "s2-3-2",
    diff: "med",
    instructions: "Build a multi-connection-capable TCP server. For this test the runner already runs your script in a one-shot configuration: bind, accept, send 'Connection Established', repeat is implied by listen().",
    code: '#!/usr/bin/python\nimport socket\nimport sys\n# accept one client and send b"Connection Established"\n',
    expectedOutput: "Connection Established\n",
    serverLab: true,
    serverPort: 8080,
    requires: { calls: ["socket.socket"], attrs: ["bind", "listen", "accept", "send"] },
    flag: "PYTHON(Server_Side_Shenanigans)",
    hint: "Same lifecycle as lab 2.3.1, just send b'Connection Established' instead of b'OK'.",
  },

  "s2-4-1": {
    filename: "scan.py",
    subsectionId: "s2-4-1",
    diff: "hard",
    instructions: "Port-scan 192.168.58.101 on ports 78–82 using socket.connect_ex. Print only the open ports, one per line.",
    code: "#!/usr/bin/python\nimport socket\n# scan ports 78..82 on 192.168.58.101 and print only the open ones\n",
    expectedOutput: "80\n",
    requires: { stmts: ["For"], calls: ["socket.socket", "range", "print"], attrs: ["connect_ex"] },
    flag: "PYTHON(Port_scanner_v1)",
    hint: "socket.connect_ex((host, port)) returns 0 for open ports (an int errno otherwise — no exception). Iterate range(78, 83) and print only the open ones. Remember range's stop is exclusive.",
  },

  "s2-5-2": {
    filename: "get_headers.py",
    subsectionId: "s2-5-2",
    diff: "easy",
    instructions: "GET http://192.168.58.101/ and print the value of the Server response header.",
    code: "#!/usr/bin/python\nimport requests\n# print r.headers['Server']\n",
    expectedOutput: "PyForgeHTTP/1.0\n",
    requires: { calls: ["requests.get", "print"], attrs: ["headers"] },
    flag: "PYTHON(Response_headers_read)",
    hint: "r.headers behaves like a case-insensitive dict. Index it with the header name.",
  },

  "s2-5-3": {
    filename: "parse_html.py",
    subsectionId: "s2-5-3",
    diff: "med",
    instructions: "GET the given url, then print every line of the body that contains 'title'. Tested against several pages — your code must work for all of them.",
    code: '#!/usr/bin/python\nimport requests\nurl = "http://192.168.58.101/"\n# fetch url and print only the title-line(s)\n',
    paramName: "url",
    cases: [
      { name: "Homepage title", input: "http://192.168.58.101/",      expected: "    <title>PyForge Target</title>" },
      { name: "About title",    input: "http://192.168.58.101/about", expected: "    <title>About — PyForge</title>" },
    ],
    hiddenCases: [
      { input: "http://192.168.58.101/contact", expected: "    <title>Contact — PyForge</title>" },
    ],
    requires: { stmts: ["For", "If"], calls: ["requests.get", "print"], attrs: ["text", "split"] },
    flag: "PYTHON(HTML_lines_filtered)",
    hint: "Same pattern as lab 1.7.2 — split r.text by '\\n' and filter for 'title' instead of 'href='.",
  },

  "s2-6-1": {
    filename: "post.py",
    subsectionId: "s2-6-1",
    diff: "med",
    instructions: "POST {'user': user} to http://192.168.58.101/echo and print the response body (stripped). The /echo endpoint reflects the user field — tested with several users.",
    code: '#!/usr/bin/python\nimport requests\nuser = "alice"\n# POST {"user": user} to /echo and print the stripped response\n',
    paramName: "user",
    cases: [
      { name: "alice", input: "alice", expected: "user=alice" },
      { name: "bob",   input: "bob",   expected: "user=bob" },
    ],
    hiddenCases: [
      { input: "neo",      expected: "user=neo" },
      { input: "trinity",  expected: "user=trinity" },
      { input: "fsociety", expected: "user=fsociety" },
    ],
    requires: { calls: ["requests.post", "print"], attrs: ["text"] },
    flag: "PYTHON(POST_request_sent)",
    hint: "requests.post(url, data={...}) sends form-encoded body. Read r.text and strip() to remove trailing newlines.",
  },

  // ═══ Module 3 ═══════════════════════════════════════════════════════════
  "s3-1-1": {
    filename: "strops.py",
    subsectionId: "s3-1-1",
    diff: "easy",
    instructions: "Split sentence on whitespace, then print the word count, then the words hyphen-joined.",
    code: '#!/usr/bin/python\nsentence = "the quick brown fox"\nwords = sentence.split()\nprint(sentence)\n',
    paramName: "sentence",
    cases: [
      { name: "Pangram words", input: "the quick brown fox", expected: "4\nthe-quick-brown-fox" },
      { name: "Two words",     input: "hello world",         expected: "2\nhello-world" },
    ],
    hiddenCases: [
      { input: "alone", expected: "1\nalone" },
      { input: "a b c d e", expected: "5\na-b-c-d-e" },
    ],
    requires: { calls: ["len", "print"], attrs: ["split", "join"] },
    flag: "PYTHON(Split_and_join)",
    hint: "str.split() with no args splits on any whitespace. len() of the resulting list gives the word count; sep.join(list) does the reverse.",
  },

  "s3-1-3": {
    filename: "rounding.py",
    subsectionId: "s3-1-3",
    diff: "easy",
    instructions: "Print x rounded to 2 decimal places.",
    code: "#!/usr/bin/python\nx = 3.14159265\nprint(x)\n",
    paramName: "x",
    cases: [
      { name: "Pi",  input: 3.14159265, expected: "3.14" },
      { name: "E",   input: 2.71828182, expected: "2.72" },
    ],
    hiddenCases: [
      { input: 7.42,   expected: "7.42" },
      { input: -3.789, expected: "-3.79" },
    ],
    requires: { calls: ["round", "print"] },
    flag: "PYTHON(Rounded_off)",
    hint: "Built-in round(value, ndigits). Note: 3.145 → 3.14 in Python 3 (banker's rounding) — that's fine.",
  },

  "s3-1-5": {
    filename: "bools.py",
    subsectionId: "s3-1-5",
    diff: "easy",
    instructions: "Convert v to a Boolean and print the result.",
    code: "#!/usr/bin/python\nv = 1\nprint(v)\n",
    paramName: "v",
    cases: [
      { name: "Nonzero int",  input: 1,    expected: "True" },
      { name: "Zero",         input: 0,    expected: "False" },
      { name: "Empty string", input: "",   expected: "False" },
    ],
    hiddenCases: [
      { input: "x",   expected: "True" },
      { input: [],    expected: "False" },
      { input: [0],   expected: "True" },
      { input: null,  expected: "False" },
    ],
    requires: { calls: ["bool", "print"] },
    flag: "PYTHON(Boolean_truthy)",
    hint: "bool() coerces anything to True/False. Falsy: 0, 0.0, '', [], {}, None — everything else is True.",
  },

  "s3-2-1": {
    filename: "sets.py",
    subsectionId: "s3-2-1",
    diff: "med",
    instructions: "Print sorted intersection, union, and a-only difference of lists a and b. One list per line.",
    code: "#!/usr/bin/python\na = [1, 2, 3, 4]\nb = [3, 4, 5, 6]\nprint(a)\n",
    paramName: ["a", "b"],
    cases: [
      { name: "Overlapping",  input: { a: [1,2,3,4], b: [3,4,5,6] }, expected: "[3, 4]\n[1, 2, 3, 4, 5, 6]\n[1, 2]" },
      { name: "Disjoint",     input: { a: [1,2], b: [3,4] },         expected: "[]\n[1, 2, 3, 4]\n[1, 2]" },
    ],
    hiddenCases: [
      { input: { a: [5,6], b: [5,6] },     expected: "[5, 6]\n[5, 6]\n[]" },
      { input: { a: [1,1,2], b: [2,3] },   expected: "[2]\n[1, 2, 3]\n[1]" },
    ],
    requires: { calls: ["set", "sorted", "print"] },
    flag: "PYTHON(Set_theory_applied)",
    hint: "Convert both lists to set(). The operators are & (intersection), | (union), - (difference). Wrap each result in sorted() to print a stable list.",
  },

  "s3-2-4": {
    filename: "dictget.py",
    subsectionId: "s3-2-4",
    diff: "easy",
    instructions: "Print data.get('name', 'unknown') — safe dict access with fallback.",
    code: "#!/usr/bin/python\ndata = {'name': 'Alice', 'age': 30}\nprint(data)\n",
    paramName: "data",
    cases: [
      { name: "Has name",    input: { name: "Alice", age: 30 }, expected: "Alice" },
      { name: "Missing name", input: { age: 25 },                expected: "unknown" },
    ],
    hiddenCases: [
      { input: { name: "Trinity" }, expected: "Trinity" },
      { input: {},                  expected: "unknown" },
    ],
    requires: { attrs: ["get"], calls: ["print"] },
    flag: "PYTHON(Safe_dict_access)",
    hint: "dict.get(key, default) returns default when the key is missing — unlike data[key] which raises KeyError.",
  },

  "s3-3-1": {
    filename: "binary.py",
    subsectionId: "s3-3-1",
    diff: "easy",
    instructions: "Print n in binary (with the 0b prefix).",
    code: "#!/usr/bin/python\nn = 10\nprint(n)\n",
    paramName: "n",
    cases: [
      { name: "10",  input: 10,  expected: "0b1010" },
      { name: "255", input: 255, expected: "0b11111111" },
    ],
    hiddenCases: [
      { input: 1,   expected: "0b1" },
      { input: 0,   expected: "0b0" },
      { input: 64,  expected: "0b1000000" },
    ],
    requires: { calls: ["bin", "print"] },
    flag: "PYTHON(Binary_thinking)",
    hint: "Built-in bin(int) returns the string '0bNNNN' — exactly what's expected.",
  },

  "s3-3-3": {
    filename: "hexx.py",
    subsectionId: "s3-3-3",
    diff: "easy",
    instructions: "Print n in hexadecimal (with the 0x prefix).",
    code: "#!/usr/bin/python\nn = 255\nprint(n)\n",
    paramName: "n",
    cases: [
      { name: "255",   input: 255,   expected: "0xff" },
      { name: "16",    input: 16,    expected: "0x10" },
    ],
    hiddenCases: [
      { input: 65535, expected: "0xffff" },
      { input: 0,     expected: "0x0" },
    ],
    requires: { calls: ["hex", "print"] },
    flag: "PYTHON(Hex_master)",
    hint: "Built-in hex(int) returns the string '0xNN' (lowercase). Mirror of bin().",
  },

  "s3-4-1": {
    filename: "ascii.py",
    subsectionId: "s3-4-1",
    diff: "easy",
    instructions: "Print ord(c) — the ASCII integer of character c.",
    code: '#!/usr/bin/python\nc = "A"\nprint(c)\n',
    paramName: "c",
    cases: [
      { name: "A", input: "A", expected: "65" },
      { name: "a", input: "a", expected: "97" },
    ],
    hiddenCases: [
      { input: "0", expected: "48" },
      { input: " ", expected: "32" },
      { input: "z", expected: "122" },
    ],
    requires: { calls: ["ord", "print"] },
    flag: "PYTHON(ASCII_unlocked)",
    hint: "Built-in ord(single_char) returns its Unicode/ASCII code point as an int. Inverse of chr().",
  },

  "s3-4-4": {
    filename: "chrord.py",
    subsectionId: "s3-4-4",
    diff: "easy",
    instructions: "Convert integer n to its character via chr(n), print the char on line 1, then ord(char) on line 2.",
    code: "#!/usr/bin/python\nn = 65\nprint(n)\n",
    paramName: "n",
    cases: [
      { name: "65 -> A", input: 65, expected: "A\n65" },
      { name: "97 -> a", input: 97, expected: "a\n97" },
    ],
    hiddenCases: [
      { input: 33,  expected: "!\n33" },
      { input: 126, expected: "~\n126" },
    ],
    requires: { calls: ["chr", "ord", "print"] },
    flag: "PYTHON(Chr_and_back)",
    hint: "chr(int) returns the corresponding 1-character string; ord(char) goes back to int. Round-trip both.",
  },

  "s3-7-3": {
    filename: "jsonparse.py",
    subsectionId: "s3-7-3",
    diff: "med",
    instructions: "Parse the JSON payload and print the 'name' field then the 'count' field, one per line.",
    code: '#!/usr/bin/python\nimport json\npayload = \'{"name": "Alice", "count": 7}\'\nprint(payload)\n',
    paramName: "payload",
    cases: [
      { name: "Alice", input: '{"name": "Alice", "count": 7}', expected: "Alice\n7" },
      { name: "Bob",   input: '{"name": "Bob", "count": 0}',   expected: "Bob\n0" },
    ],
    hiddenCases: [
      { input: '{"name": "Neo", "count": 1999}', expected: "Neo\n1999" },
      { input: '{"name": "x", "count": 1}',     expected: "x\n1" },
    ],
    requires: { calls: ["json.loads", "print"], stmts: ["Import"] },
    flag: "PYTHON(JSON_parsed)",
    hint: "json.loads(str) parses a JSON string into a dict/list. Then index it like any dict: data['name'], data['count'].",
  },
};

/** Strip `hiddenCases` and `requires` from a lab object before sending to client. */
export function getPublicLab(id) {
  const lab = LAB_REGISTRY[id];
  if (!lab) return null;
  const { hiddenCases, requires, ...pub } = lab;
  // Tell the client the lab has requirements (so they can warn if AST will gate),
  // but never leak the actual list — they'd just hardcode around it.
  return { ...pub, hasRequirements: !!requires, hiddenCaseCount: hiddenCases?.length || 0 };
}

export function listPublicLabs() {
  return Object.keys(LAB_REGISTRY).map(getPublicLab);
}

export function getLabFull(id) {
  return LAB_REGISTRY[id] || null;
}
