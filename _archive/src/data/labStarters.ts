export interface LabStarter {
  filename: string;
  code: string;
  instructions: string;
  expectedOutput: string;
  flag: string;
  hint?: string;
}

// Map from subsection id → lab starter
export const labStarters: Record<string, LabStarter> = {
  "s1-1-2": {
    filename: "firstscript.py",
    instructions:
      'Write a Python script that prints "Python is fun!" to the terminal. ' +
      'Use the print() function. When your output matches exactly, the flag will unlock.',
    code: `#!/usr/bin/python
# Exercise: Write a Python script that prints "Python is fun!"
# Modify the line below:

print("Scripting is fun!")
`,
    expectedOutput: "Python is fun!\n",
    flag: "PYTHON(FIRST_Script_Executed!)",
    hint: 'Change the string inside print() to "Python is fun!"',
  },

  "s1-1-5": {
    filename: "urle.py",
    instructions:
      "Extract only the full URL from the HTML anchor tag below using Python string slicing. " +
      "Set the start and end variables so that only the URL is printed.",
    code: `#!/usr/bin/python
# Exercise: Extract the URL from the anchor tag using string slicing
tag = '<a href="https://www.offsec.com/blog">Blog</a>'

start = ""   # Set this to the start marker string
end   = ""   # Set this to the end marker string

# Do not modify below this line
url = tag[tag.index(start):tag.index(end)]
print(url)
`,
    expectedOutput: "https://www.offsec.com/blog\n",
    flag: "PYTHON(Slicing_and_Dicing_Them_URLs)",
    hint: 'Try start = "http" and end = "\\">',
  },

  "s1-1-8": {
    filename: "boolean.py",
    instructions:
      'Set the skyIsBlue variable to the correct Boolean so the script prints "The sky is blue".',
    code: `#!/usr/bin/python
# Exercise: Set skyIsBlue to the correct Boolean value

skyIsBlue = False   # Change this!

if skyIsBlue:
    print("The sky is blue")
else:
    print("The sky is not blue")
`,
    expectedOutput: "The sky is blue\n",
    flag: "PYTHON(It_is_Vdue_to_Rayleigh_scattering)",
    hint: "True or False?",
  },

  "s1-1-9": {
    filename: "typecasting.py",
    instructions:
      "Without changing the variable declarations, adjust the print() function " +
      "so that all variables are printed on one line. You will need to type cast " +
      "numeric variables to strings.",
    code: `#!/usr/bin/python
# Exercise: Fix the print statement without changing the variables
firstName = 'Dade'
lastName = 'Murphy'
handle = 'Zero Cool'
systemsCrashed = 1995
movieHoursLong = 1.783
movieYear = '1995'

# Fix this print statement — it must print all values on one line:
print(firstName + " " + lastName)
`,
    expectedOutput: "Dade Murphy Zero Cool 1995 1.783 1995\n",
    flag: "PYTHON(Type_casting_with_Grit)",
    hint: 'Use str() to convert numbers: print(firstName + " " + lastName + " " + handle + " " + str(systemsCrashed) + ...)',
  },

  "s1-2-2": {
    filename: "forDictionary.py",
    instructions:
      "Print each key and its value from the dictionary on a separate line using the format: 'key: value'",
    code: `#!/usr/bin/python
# Exercise: Print each key-value pair from the dictionary

theOne = {
    'firstName': 'Thomas',
    'lastName': 'Anderson',
    'occupation': 'Programmer',
    'company': 'MetaCortex'
}

# Write a loop that prints each key: value pair
for key in theOne:
    pass   # Replace this line
`,
    expectedOutput:
      "firstName: Thomas\nlastName: Anderson\noccupation: Programmer\ncompany: MetaCortex\n",
    flag: "PYTHON(Guts_is_packing)",
    hint: 'Use print(key + ": " + theOne[key])',
  },

  "s2-3-2": {
    filename: "server_test.py",
    instructions:
      "Build a TCP server that listens on port 8080 and sends back 'Connection Established' " +
      "to each connecting client. For this simulation, the server will handle one mock connection.",
    code: `#!/usr/bin/python3
# Exercise: Build a basic TCP server
# In this simulation we mock the socket interaction

class MockSocket:
    def __init__(self):
        self.messages = []
    def send(self, data):
        self.messages.append(data.decode('ascii'))
    def close(self):
        pass

# Simulate what your server would do with a connected client:
conn = MockSocket()

# Write the line that sends "Connection Established" to the client:
conn.send(b"Connection Established")

# Verify it worked:
if "Connection Established" in conn.messages:
    print("Server sent: Connection Established")
    print("Test PASSED")
`,
    expectedOutput: "Server sent: Connection Established\nTest PASSED\n",
    flag: "PYTHON(Server_Side_Shenanigans)",
    hint: 'conn.send(b"Connection Established")',
  },

  "s1-7-4": {
    filename: "spider.py",
    instructions:
      "Complete the web spider. The mock HTML below contains several links. " +
      "Your script should find all unique URLs that contain '192.168.58.101'.",
    code: `#!/usr/bin/python
# Exercise: Web Spider — extract all unique URLs from the page

# Simulated HTML page (in the real lab this comes from requests.get)
html = """
<html>
<a href='http://192.168.58.101/'>Home</a>
<a href='http://192.168.58.101/about'>About</a>
<a href='http://192.168.58.101/contact'>Contact</a>
<a href='http://192.168.58.101/'>Home duplicate</a>
<a href='https://www.google.com'>External</a>
</html>
"""

BASE = "http://192.168.58.101"
urlList = []

for line in html.split("\\n"):
    if BASE in line and "http" in line:
        start = "http"
        if "'>" in line:
            end = "'>"
        else:
            end = '">'
        if start in line and end in line:
            sliced = line[line.index(start):line.index(end)]
            if sliced not in urlList:
                urlList.append(sliced)

for url in urlList:
    print(url)
`,
    expectedOutput:
      "http://192.168.58.101/\nhttp://192.168.58.101/about\nhttp://192.168.58.101/contact\n",
    flag: "PYTHON(Putting_It_All_Together_Spider)",
    hint: "The starter code is mostly complete — just run it and check the output!",
  },
};
