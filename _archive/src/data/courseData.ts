export interface Exercise {
  question: string;
  answer: string;
  isLab?: boolean;
  flag?: string;
}

export interface CodeBlock {
  code: string;
  caption?: string;
  language?: string;
}

export interface ContentBlock {
  type: "text" | "code" | "note" | "objectives" | "heading";
  content?: string;
  codeBlock?: CodeBlock;
  items?: string[];
}

export interface Subsection {
  id: string;
  number: string;
  title: string;
  duration?: string;
  content: ContentBlock[];
  exercises?: Exercise[];
}

export interface Section {
  id: string;
  number: string;
  title: string;
  subsections: Subsection[];
}

export interface Module {
  id: string;
  number: string;
  title: string;
  duration?: string;
  description?: string;
  sections: Section[];
}

export const courseData: Module[] = [
  {
    id: "m1",
    number: "1",
    title: "Python Scripting Basics",
    duration: "~15.5 hours",
    description:
      "Scripting is an efficient way to perform or automate repetitive tasks. Python is a platform-independent language because the interpreter can be installed on both *nix-type and Windows operating systems.",
    sections: [
      {
        id: "s1-1",
        number: "1.1",
        title: "Variables, Slicing, and Type Casting",
        subsections: [
          {
            id: "s1-1-1",
            number: "1.1.1",
            title: "Finding our Version of Python",
            duration: "~160 minutes",
            content: [
              {
                type: "objectives",
                items: [
                  "Find the Python version",
                  "Understand and set a shebang line",
                  "Write our first Python script",
                  "Understand basic variable types",
                  "Understand how to use different variable types",
                  "Slice strings",
                  "Understand and work with integer variables",
                  "Understand float variables",
                  "Understand Boolean variables",
                  "Understand type casting",
                  "Set variables to different data types using type casting",
                ],
              },
              {
                type: "text",
                content:
                  "Before working with our Python exercises, let's examine how to determine our installed version. To do this, let's execute python -V in the terminal.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python -V\nPython 3.9.10",
                  caption:
                    "Listing 1 - The currently installed version of Python is displayed",
                },
              },
              {
                type: "text",
                content:
                  "We can confirm that we currently have Python 3.9.10 installed and working on our Kali machine. This is important to know since the syntax between versions can affect how our scripts run. Now that we know our version number, let's write our first Python script.",
              },
            ],
            exercises: [
              {
                question:
                  "What is the option (with dash) to check the version of Python?",
                answer: "-V",
              },
              {
                question:
                  "Are the syntax requirements the same between Python 2 and Python 3? (yes/no)",
                answer: "no",
              },
            ],
          },
          {
            id: "s1-1-2",
            number: "1.1.2",
            title: "Writing our First Python Script",
            content: [
              {
                type: "text",
                content:
                  "Python is a popular and high-level programming language used by scientists and security professionals alike. Like Bash scripting, we can tell the system to interpret the script as a Python script with the shebang #!/usr/bin/python. We can save the file, set the executable flag with chmod, and execute it with ./filename.py. Additionally, we can run a Python script using the python command, which doesn't require the shebang line or the executable flag.",
              },
              {
                type: "text",
                content: "Let's review a simple \"Hello World\" script.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ cat pythonsample.py\n#!/usr/bin/python\nprint(\"Scripting is fun!\")",
                  caption: "Listing 2 - Simple Python script",
                },
              },
              {
                type: "text",
                content:
                  "The script has two lines. The first line tells the OS that the script should be interpreted with Python. The second line is a print() function that outputs the string to the terminal when we execute it. Let's make pythonsample.py executable with chmod.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ chmod +x pythonsample.py",
                  caption: "Listing 3 - The script is now executable",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: 'kali@kali:~$ ./pythonsample.py\nScripting is fun!',
                  caption:
                    "Listing 4 - The script is executed and the output is displayed in the terminal",
                },
              },
              {
                type: "text",
                content:
                  "Another variation is to run the script with the python command before the script.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python pythonsample.py\nScripting is fun!",
                  caption: "Listing 5 - The script executed with the python command",
                },
              },
              {
                type: "text",
                content:
                  "Running it this way, the shebang line is not needed. Although, it is good practice to have it in the script file.",
              },
            ],
            exercises: [
              {
                question:
                  "What is the first line in the script called that specifies which interpreter to use?",
                answer: "Shebang",
              },
              {
                question:
                  'What is the script code to print "Python is fun!" to the terminal output? (Enter the entire line of code in Python 3 syntax)',
                answer: 'print("Python is fun!")',
              },
              {
                question:
                  "Write a Python script called firstscript.py that prints \"Python is fun!\" to the terminal output. Make sure the script is executable, has the appropriate shebang line, and wait a minute after script completion for the flag to appear. The script file must be located in the /home/offsec/ directory.",
                answer: "PYTHON(FIRST_Script_Executed!)",
                isLab: true,
                flag: "PYTHON(FIRST_Script_Executed!)",
              },
            ],
          },
          {
            id: "s1-1-3",
            number: "1.1.3",
            title: "Setting Variables",
            content: [
              {
                type: "text",
                content:
                  "Before we cover the types of variables we may encounter in Python, let's examine how we can set variables. We will use the print() function to display the value of the variables in the terminal.",
              },
              {
                type: "text",
                content:
                  "To set a variable in our Python script, we will enter a variable name followed by an equal (=) sign and the value of the variable we want to set.",
              },
              {
                type: "code",
                codeBlock: {
                  code: 'kali@kali:~$ cat variables.py\n#!/usr/bin/python\ncompanyName = "OffSec"\ncurrentYear = 2023\nprint(companyName)\nprint(currentYear)',
                  caption: "Listing 6 - Two variables are set in our script",
                },
              },
              {
                type: "text",
                content:
                  'We have two variables set in our script, followed by the print() functions to display them to the terminal. The first variable is called companyName and has the value of "OffSec". The next variable is called currentYear and has the value of 2023.',
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ ./variables.py\nOffSec\n2023",
                  caption:
                    "Listing 7 - The variable values are displayed in the terminal",
                },
              },
              {
                type: "text",
                content:
                  "As expected, the print() functions printed the values of the variables to the terminal.",
              },
            ],
            exercises: [
              {
                question:
                  'How could a variable of color be set to the value "red"?',
                answer: 'color = "red"',
              },
              {
                question:
                  'How could a variable of year be set to the integer of "2022"?',
                answer: "year = 2022",
              },
            ],
          },
          {
            id: "s1-1-4",
            number: "1.1.4",
            title: "Data Types",
            content: [
              {
                type: "text",
                content:
                  "Python is quite forgiving when it comes to data types, especially when compared to lower-level programming languages. Python variables can be converted from one data type to another in a process called type casting. We can set a variable to a value by using the equal sign (=).",
              },
              {
                type: "text",
                content:
                  "The print() function can be used to output information to the command-line. During debugging, we may want to check a variable's type. We can do this with the built-in type() function.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ cat typeofsample.py\n#!/usr/bin/python\na = 'banana'\nprint(a)\nprint(type(a))\n\nb = 1337\nprint(b)\nprint(type(b))",
                  caption: "Listing 8 - Python data types",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python typeofsample.py\nbanana\n<class 'str'>\n1337\n<class 'int'>",
                  caption: "Listing 9 - Output showing variable types",
                },
              },
              {
                type: "text",
                content:
                  "In this example, we created two variables, a and b. Our script prints the value of the variable and then its data type. Variable a is a string with the value of \"banana\" and variable b is an integer with the value of \"1337\".",
              },
            ],
            exercises: [
              {
                question:
                  "What data type would be assigned to the following?\na = 55",
                answer: "integer",
              },
              {
                question:
                  "What data type would be assigned to the following?\na = '55'",
                answer: "string",
              },
            ],
          },
          {
            id: "s1-1-5",
            number: "1.1.5",
            title: "Strings and Slicing",
            content: [
              {
                type: "text",
                content:
                  "Strings hold one or more letters, numbers, or symbols, and are typically set by using quotes. Slicing in Python is when we cut a string or list into sections to extract just the parts we are interested in.",
              },
              {
                type: "text",
                content:
                  "Let's say we're writing a Python script to scrape a website for links. Within the HTML code, each anchor tag will appear something like this:",
              },
              {
                type: "code",
                codeBlock: {
                  code: '<a href="https://www.offsec.com/blog">Blog</a>',
                  caption: "Listing 10 - An HTML anchor tag",
                },
              },
              {
                type: "text",
                content:
                  "To work with this in our script, we want only the URL portion. We'll use string slicing to pull it out. We need to count each character up to our URL with the first character being 0. The letter \"h\" in \"https\" is at index 9.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ cat tagslice.py\n#!/usr/bin/python\ntag = '<a href=\"https://www.offsec.com/blog\">Blog</a>'\nurl = tag[9:48]\nprint(url)\n\nkali@kali:~$ python tagslice.py\nhttps://www.offsec.com/blog",
                  caption: "Listing 11 - Slicing the HTML anchor tag",
                },
              },
              {
                type: "text",
                content:
                  "We can also slice dynamically using the index() function. This way our script will work on tags of any length.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ cat tagslice2.py\n#!/usr/bin/python\ntag = '<a href=\"https://www.offsec.com/blog\">Blog</a>'\nstart = \"http\"\nend = \"\\\">\"\nurl = tag[tag.index(start):tag.index(end)]\nprint(url)\n\nkali@kali:~$ python tagslice2.py\nhttps://www.offsec.com/blog",
                  caption: "Listing 12 - Improving our slicing script",
                },
              },
            ],
            exercises: [
              {
                question: 'In the string "Hello", what is the index value of the letter "H"?',
                answer: "0",
              },
              {
                question:
                  'In the following code block, what would the index slice be to extract "super" from the string?\n\nFact = "When a solution contains more of a solute than can be dissolved, it is known to be supersaturated."',
                answer: "Fact[83:88]",
              },
              {
                question:
                  "Modify urle.py and add the values for the start and end variables, so only the full URL is printed to the terminal. After this is complete, wait up to a minute for the flag to appear.",
                answer: "PYTHON(Slicing_and_Dicing_Them_URLs)",
                isLab: true,
                flag: "PYTHON(Slicing_and_Dicing_Them_URLs)",
              },
            ],
          },
          {
            id: "s1-1-6",
            number: "1.1.6",
            title: "Integers",
            content: [
              {
                type: "text",
                content:
                  "Integer (or int) variables are the basic ways to store whole numbers. Int variables are typically set by assigning a whole number without quotes to a variable name.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ cat intTest.py\n#!/usr/bin/python\nmyInt = 750\nprint(myInt)\n\nkali@kali:~$ python intTest.py\n750",
                  caption:
                    "Listing 13 - Setting an integer variable and printing it to the terminal",
                },
              },
              {
                type: "text",
                content:
                  "If you use quotes to set a number to a variable, you are setting it as a string instead of an integer. This may lead to bugs or errors if comparisons are done.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python intTest2.py\n750\n750\n751\nTraceback (most recent call last):\n  File \"intTest2.py\", line 7, in <module>\n    print(myString + 1)\nTypeError: can only concatenate str (not \"int\") to str",
                  caption: "Listing 14 - Working with integers and strings",
                },
              },
              {
                type: "text",
                content:
                  "It's interesting to note that the output of two of the four print() functions was the same, but Python was unable to add one to \"750\" when that value was a string. It's an excellent idea to get familiar with reading output errors and researching them.",
              },
            ],
            exercises: [
              {
                question:
                  "Will the following be considered a string or an integer? (string/integer)\nnumber = '33'",
                answer: "string",
              },
              {
                question:
                  "Will the following be considered a string or an integer? (string/integer)\nnumber = 42",
                answer: "integer",
              },
              {
                question:
                  "Using what we have learned so far, can integers be added to strings? (yes/no)",
                answer: "no",
              },
            ],
          },
          {
            id: "s1-1-7",
            number: "1.1.7",
            title: "Floats",
            content: [
              {
                type: "text",
                content:
                  "If we want a variable to contain a number with a decimal, we can't use an integer. Instead, we will need to use a Float. The nice thing is that Python will usually handle this for us, and we can typically treat floats the same as integer variables.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ cat floatTest.py\n#!/usr/bin/python\na = 100\nprint(a)\nprint(type(a))\na = a + 0.5\nprint(a)\nprint(type(a))\n\nkali@kali:~$ python floatTest.py\n100\n<class 'int'>\n100.5\n<class 'float'>",
                  caption: "Listing 15 - Working with Float variables",
                },
              },
              {
                type: "text",
                content:
                  "As we found from the script execution, Python was able to change the integer to a float without us needing to do anything else. Beyond strings and number variables, we must understand Boolean variables as well.",
              },
            ],
            exercises: [
              {
                question:
                  "In Python, do we need to do anything to convert an integer to a float when the number value becomes a decimal? (yes/no)",
                answer: "no",
              },
            ],
          },
          {
            id: "s1-1-8",
            number: "1.1.8",
            title: "Booleans",
            content: [
              {
                type: "text",
                content:
                  "Boolean variables store an object value of \"True\" or \"False\". These types of variables are useful when using conditional statements. It's important to understand that these are not string values of \"True\" or \"False\" — they are actual Boolean objects.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "# this may be set from a user database or after authentication\nadminBool = False\n\nif (adminBool):\n    print('You are an admin!')\nelse:\n    print('You are NOT an admin!')",
                  caption: "Listing 16 - Example working with Booleans",
                },
              },
              {
                type: "text",
                content:
                  "Since the variable adminBool is False, this script would print \"You are NOT an admin!\". Now let's examine a way to change variable types from one to another with a process called type casting.",
              },
            ],
            exercises: [
              {
                question:
                  "Is the following a Boolean variable? (yes/no)\nisAdmin = True",
                answer: "yes",
              },
              {
                question:
                  "Is the following a Boolean variable? (yes/no)\nisAdmin = 1",
                answer: "no",
              },
              {
                question:
                  "Is the following a Boolean variable? (yes/no)\nisAdmin = \"False\"",
                answer: "no",
              },
              {
                question:
                  "In the /home/offsec/boolean.py script file, set the skyIsBlue Boolean so that the script prints \"The sky is blue\" to the terminal. When this is complete, wait up to a minute for the flag to appear.",
                answer: "PYTHON(It_is_Vdue_to_Rayleigh_scattering)",
                isLab: true,
                flag: "PYTHON(It_is_Vdue_to_Rayleigh_scattering)",
              },
            ],
          },
          {
            id: "s1-1-9",
            number: "1.1.9",
            title: "Type Casting",
            content: [
              {
                type: "text",
                content:
                  "Casting is a way to convert a variable type in Python. This can be done by using the appropriate casting function to modify the variable type to another. A reason to use this is when reading user input or data from an external source such as a text document or webpage.",
              },
              {
                type: "text",
                content:
                  "For example, let's say we have two strings that contain numbers that we want to add together. If we try to add these variables together, we won't receive any errors, but the result is unexpected.",
              },
              {
                type: "code",
                codeBlock: {
                  code: 'kali@kali:~$ cat castTest.py\n#!/usr/bin/python\nnumA = "86"\nnumB = "20"\nprint(type(numA))\nprint(type(numB))\nprint(numA + numB)\n\nkali@kali:~$ python castTest.py\n<class \'str\'>\n<class \'str\'>\n8620',
                  caption:
                    "Listing 17 - Setting up strings to test casting",
                },
              },
              {
                type: "text",
                content:
                  "The output shows that we concatenated the strings together instead of adding the numbers. We will need to cast the strings to integers before they can be added, using the int() function.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "print(int(numA) + int(numB))\n\n# Output:\n106",
                  caption: "Listing 18 - Example casting strings to integers",
                },
              },
              {
                type: "text",
                content:
                  "This can also be done with the str() function to convert an integer or float into a string data type.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "newValue = int(numA) + int(numB)\nprint(newValue)\nprint(type(newValue))\nprint(type(str(newValue)))\n\n# Output:\n106\n<class 'int'>\n<class 'str'>",
                  caption: "Listing 19 - Example casting integer to string",
                },
              },
            ],
            exercises: [
              {
                question:
                  "For questions 1-6, use the following code snippet:\n\nfirstName = 'Dade'\nlastName = 'Murphy'\nhandle = 'Zero Cool'\nsystemsCrashed = 1995\nmovieHoursLong = 1.783\nmovieYear = '1995'\n\nWhich line number declares a float variable?",
                answer: "5",
              },
              {
                question: "How many string variables are declared?",
                answer: "3",
              },
              {
                question:
                  "How could we rewrite the movieYear line so that Python will interpret it as an integer?",
                answer: "movieYear = 1995",
              },
              {
                question:
                  "If the variable movieYear was kept as a string, how could we later type cast it as an integer?",
                answer: "int(movieYear)",
              },
              {
                question:
                  "Can strings and integers be printed in the same print function without type casting? (yes/no)",
                answer: "no",
              },
              {
                question:
                  "How could we type cast the systemsCrashed variable to a string?",
                answer: "str(systemsCrashed)",
              },
              {
                question:
                  "Without changing any of the variable declarations at the beginning of the script, adjust the print function within /home/offsec/typecasting.py. After this is complete, wait a minute for the flag to appear.",
                answer: "PYTHON(Type_casting_with_Grit)",
                isLab: true,
                flag: "PYTHON(Type_casting_with_Grit)",
              },
            ],
          },
        ],
      },
      {
        id: "s1-2",
        number: "1.2",
        title: "Lists and Dictionaries",
        subsections: [
          {
            id: "s1-2-1",
            number: "1.2.1",
            title: "Python Lists",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand what lists and dictionaries are",
                  "Understand how lists and dictionaries can be used",
                  "Create lists",
                  "Create dictionaries",
                ],
              },
              {
                type: "text",
                content:
                  "So far, we have covered variables and how to work with them. Now let's examine some more complex variables that hold more than one value: lists and dictionaries. A Python list is an ordered collection of items that can hold different data types.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\ndogs = ['golden retriever', 'labrador', 'german shepherd', 'huskies']\nprint(dogs)\nprint(dogs[0])\nprint(dogs[2])",
                  caption: "Listing 20 - A Python list example",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python dogs.py\n['golden retriever', 'labrador', 'german shepherd', 'huskies']\ngolden retriever\ngerman shepherd",
                  caption: "Listing 21 - Output from the list script",
                },
              },
              {
                type: "text",
                content:
                  "We can iterate over a list using a for loop. We can also append items to a list using the .append() method, and remove items using .remove().",
              },
              {
                type: "code",
                codeBlock: {
                  code: "for dog in dogs:\n    print(dog + \" are great dogs\")",
                  caption: "Listing 22 - Iterating over a list",
                },
              },
            ],
            exercises: [
              {
                question:
                  "Using the dogs list ['golden retriever', 'labrador', 'german shepherd', 'huskies'], what index number would access 'labrador'?",
                answer: "1",
              },
              {
                question:
                  "How many iterations would the for loop complete when iterating over the dogs list?",
                answer: "4",
              },
              {
                question: "What is the index number of 'huskies'?",
                answer: "3",
              },
            ],
          },
          {
            id: "s1-2-2",
            number: "1.2.2",
            title: "Python Dictionaries",
            content: [
              {
                type: "text",
                content:
                  "A Python dictionary stores data as key-value pairs, similar to a real dictionary where words are keys and definitions are values. Dictionaries are created using curly braces {}.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\ntheOne = {\n    'firstName': 'Thomas',\n    'lastName': 'Anderson',\n    'occupation': 'Programmer',\n    'company': 'MetaCortex'\n}\nprint(theOne)",
                  caption: "Listing 23 - A Python dictionary example",
                },
              },
              {
                type: "text",
                content:
                  "We can access values by their key, update values, and retrieve all keys using the .keys() method.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "# Access a value\nprint(theOne['firstName'])   # Thomas\n\n# Update a value\ntheOne['occupation'] = 'Superhero'\nprint(theOne['occupation'])  # Superhero\n\n# Get all keys\nprint(theOne.keys())",
                  caption: "Listing 24 - Working with dictionary values",
                },
              },
            ],
            exercises: [
              {
                question:
                  "Print each dictionary key and key-value as shown in the demonstration. The file is /home/offsec/forDictionary.py. The format for each line should be 'key: value'.",
                answer: "PYTHON(Guts_is_packing)",
                isLab: true,
                flag: "PYTHON(Guts_is_packing)",
              },
            ],
          },
        ],
      },
      {
        id: "s1-3",
        number: "1.3",
        title: "Loops, Logic, and User Input",
        subsections: [
          {
            id: "s1-3-1",
            number: "1.3.1",
            title: "Loops",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand for loops and while loops",
                  "Iterate over lists and ranges",
                  "Use break and continue statements",
                  "Build loops with conditional logic",
                ],
              },
              {
                type: "text",
                content:
                  "Loops are fundamental building blocks of scripting. Python supports two main loop types: for loops and while loops. A for loop iterates over a sequence (list, range, string), while a while loop continues as long as a condition is True.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\n# For loop over a range\nfor i in range(1, 6):\n    print(f\"Iteration: {i}\")\n\n# While loop\ncount = 0\nwhile count < 5:\n    print(f\"Count: {count}\")\n    count += 1",
                  caption: "Listing 25 - For and while loop examples",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python loops.py\nIteration: 1\nIteration: 2\nIteration: 3\nIteration: 4\nIteration: 5\nCount: 0\nCount: 1\nCount: 2\nCount: 3\nCount: 4",
                  caption: "Listing 26 - Loop output",
                },
              },
            ],
            exercises: [
              {
                question:
                  "How would you write a for loop that iterates over numbers 0 through 9?",
                answer: "for i in range(10):",
              },
              {
                question:
                  "What keyword is used to exit a loop prematurely?",
                answer: "break",
              },
            ],
          },
          {
            id: "s1-3-2",
            number: "1.3.2",
            title: "Conditional Statements",
            content: [
              {
                type: "text",
                content:
                  "Conditional statements let our scripts make decisions. Python uses if, elif, and else to control program flow based on conditions.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nscore = 85\n\nif score >= 90:\n    print(\"Grade: A\")\nelif score >= 80:\n    print(\"Grade: B\")\nelif score >= 70:\n    print(\"Grade: C\")\nelse:\n    print(\"Grade: F\")",
                  caption: "Listing 27 - Conditional statements",
                },
              },
              {
                type: "text",
                content:
                  "Comparison operators include == (equal), != (not equal), > (greater than), < (less than), >= (greater than or equal), <= (less than or equal). Logical operators: and, or, not.",
              },
            ],
            exercises: [
              {
                question:
                  "What keyword checks a secondary condition if the first if condition is False?",
                answer: "elif",
              },
              {
                question:
                  "What operator checks if two values are equal?",
                answer: "==",
              },
            ],
          },
          {
            id: "s1-3-3",
            number: "1.3.3",
            title: "User Input",
            content: [
              {
                type: "text",
                content:
                  "Python's input() function allows our scripts to receive data from the user at runtime. The input() function always returns a string, so type casting may be necessary.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nname = input(\"Enter your name: \")\nage = int(input(\"Enter your age: \"))\n\nprint(f\"Hello, {name}! You are {age} years old.\")\n\nif age >= 18:\n    print(\"You are an adult.\")\nelse:\n    print(\"You are a minor.\")",
                  caption: "Listing 28 - Using user input",
                },
              },
              {
                type: "note",
                content:
                  "Always validate user input in production scripts. Never trust data provided by users without checking it first — this is especially important in security-focused scripting.",
              },
            ],
            exercises: [
              {
                question:
                  "What function is used to get input from the user in Python 3?",
                answer: "input()",
              },
              {
                question:
                  "What data type does input() always return?",
                answer: "string",
              },
            ],
          },
        ],
      },
      {
        id: "s1-4",
        number: "1.4",
        title: "Files and Functions",
        subsections: [
          {
            id: "s1-4-1",
            number: "1.4.1",
            title: "Working With Files",
            content: [
              {
                type: "objectives",
                items: [
                  "Open files",
                  "Read files",
                  "Write to files",
                  "Close files",
                  "Create functions",
                  "Understand function parameters",
                  "Return function values",
                ],
              },
              {
                type: "text",
                content:
                  "Working with files can be incredibly useful when writing Python scripts. This can be used to get data from a file and act upon that information in the code. It can also be used to change or even create files on a system.",
              },
              {
                type: "code",
                codeBlock: {
                  code: '#!/usr/bin/python\n# Open and read a file\nf = open("myfile.txt", "r")\nprint(f.read())\nf.close()\n\n# Using with statement (preferred)\nwith open("myfile.txt", "r") as f:\n    content = f.read()\n    print(content)',
                  caption: "Listing 29 - Reading a file",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: '#!/usr/bin/python\n# Write to a file\nwith open("output.txt", "w") as f:\n    f.write("Hello, World!\\n")\n    f.write("This is a new line.")\n\n# Append to a file\nwith open("output.txt", "a") as f:\n    f.write("\\nAppended line.")',
                  caption: "Listing 30 - Writing to a file",
                },
              },
              {
                type: "text",
                content:
                  "File modes: 'r' = read (default), 'w' = write (overwrites), 'a' = append, 'rb' = read binary, 'wb' = write binary.",
              },
            ],
            exercises: [
              {
                question:
                  "What file mode is used to append data to an existing file without overwriting it?",
                answer: "a",
              },
              {
                question:
                  "What Python construct automatically closes a file when the block exits?",
                answer: "with statement",
              },
            ],
          },
          {
            id: "s1-4-2",
            number: "1.4.2",
            title: "Writing Functions",
            content: [
              {
                type: "text",
                content:
                  "Functions allow us to group reusable blocks of code. We define functions using the def keyword followed by a name and parentheses. Functions prevent code repetition and make scripts more organized.",
              },
              {
                type: "code",
                codeBlock: {
                  code: '#!/usr/bin/python\ndef greet():\n    print("Hello from a function!")\n\n# Call the function\ngreet()',
                  caption: "Listing 31 - A basic function",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What keyword is used to define a function in Python?",
                answer: "def",
              },
            ],
          },
          {
            id: "s1-4-3",
            number: "1.4.3",
            title: "Function Parameters",
            content: [
              {
                type: "text",
                content:
                  "Functions can accept parameters (inputs) to make them more flexible. Parameters are defined inside the parentheses and act like variables within the function scope.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\ndef greet(name, greeting=\"Hello\"):\n    print(f\"{greeting}, {name}!\")\n\ngreet(\"OffSec\")           # Hello, OffSec!\ngreet(\"Kali\", \"Welcome\")  # Welcome, Kali!",
                  caption:
                    "Listing 32 - Function with parameters and defaults",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What is a parameter with a pre-assigned value called?",
                answer: "default parameter",
              },
            ],
          },
          {
            id: "s1-4-4",
            number: "1.4.4",
            title: "Return Values",
            content: [
              {
                type: "text",
                content:
                  "Functions can return values using the return keyword. The returned value can then be stored in a variable or used directly.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\ndef add(a, b):\n    return a + b\n\ndef square(x):\n    return x * x\n\nresult = add(10, 5)\nprint(result)         # 15\nprint(square(7))      # 49",
                  caption: "Listing 33 - Functions with return values",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What keyword sends a value back from a function to the caller?",
                answer: "return",
              },
            ],
          },
          {
            id: "s1-4-5",
            number: "1.4.5",
            title: "Importing Functions",
            content: [
              {
                type: "text",
                content:
                  "We can import functions from other Python files (modules) using the import statement. This allows us to split code into manageable files and reuse functions across scripts.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "# Import the entire module\nimport calculations\ncalculations.square(5)\n\n# Import specific function\nfrom calculations import square, power\npower(2, 8)\n\n# Import with alias\nimport calculations as calc\ncalc.sqrt(16)",
                  caption: "Listing 34 - Importing functions from a module",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What keyword is used to bring a module into the current script?",
                answer: "import",
              },
            ],
          },
        ],
      },
      {
        id: "s1-5",
        number: "1.5",
        title: "Modules and Web Requests",
        subsections: [
          {
            id: "s1-5-1",
            number: "1.5.1",
            title: "Standard Library Modules",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand Python's standard library",
                  "Import and use built-in modules",
                  "Install third-party modules with pip",
                  "Make HTTP GET and POST requests",
                ],
              },
              {
                type: "text",
                content:
                  "Python includes a large standard library of modules that can be imported into our scripts. Common modules include os (operating system interface), sys (system-specific parameters), re (regular expressions), datetime (date and time), and json (JSON encoding/decoding).",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nimport os\nimport sys\n\n# Get current directory\nprint(os.getcwd())\n\n# List files in a directory\nfiles = os.listdir('/tmp')\nfor f in files:\n    print(f)\n\n# Python version\nprint(sys.version)",
                  caption: "Listing 35 - Using standard library modules",
                },
              },
            ],
            exercises: [
              {
                question:
                  "Which standard library module provides operating system functions like listdir() and getcwd()?",
                answer: "os",
              },
            ],
          },
          {
            id: "s1-5-2",
            number: "1.5.2",
            title: "Installing Third-Party Modules",
            content: [
              {
                type: "text",
                content:
                  "Beyond the standard library, Python has thousands of third-party modules available via pip (Python's package installer). For web requests, the requests library is the most popular choice.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ pip install requests\nCollecting requests\n  Downloading requests-2.28.0-py3-none-any.whl (62 kB)\nInstalling collected packages: requests\nSuccessfully installed requests-2.28.0",
                  caption: "Listing 36 - Installing the requests module",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What command is used to install a Python package called 'requests'?",
                answer: "pip install requests",
              },
            ],
          },
          {
            id: "s1-5-3",
            number: "1.5.3",
            title: "Making Web Requests",
            content: [
              {
                type: "text",
                content:
                  "The requests library makes it simple to send HTTP requests. We can perform GET requests to retrieve data, POST requests to send data, and inspect response headers and status codes.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nimport requests\n\nurl = \"http://www.offensive-security.com\"\nresponse = requests.get(url)\n\nprint(response.status_code)  # 200\nprint(response.headers)       # Response headers\nprint(response.text)          # HTML content",
                  caption: "Listing 37 - Making a GET request with requests",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What attribute of a requests response object contains the HTTP status code?",
                answer: "response.status_code",
              },
              {
                question:
                  "What attribute contains the response body as a string?",
                answer: "response.text",
              },
            ],
          },
        ],
      },
      {
        id: "s1-6",
        number: "1.6",
        title: "Python Network Sockets",
        subsections: [
          {
            id: "s1-6-1",
            number: "1.6.1",
            title: "The Socket Module",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand what network sockets are",
                  "Use the socket module to create connections",
                  "Send and receive data over sockets",
                  "Connect to remote services",
                ],
              },
              {
                type: "text",
                content:
                  "The socket module allows Python scripts to communicate over a network. Sockets are endpoints for network communication. Python's socket module implements the Berkeley socket API and supports both TCP (SOCK_STREAM) and UDP (SOCK_DGRAM) protocols.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nimport socket\n\n# Create a TCP socket\nclient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n\n# AF_INET = IPv4 addressing\n# SOCK_STREAM = TCP (reliable, connection-oriented)",
                  caption: "Listing 38 - Creating a socket",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What socket constant represents IPv4 addressing?",
                answer: "socket.AF_INET",
              },
              {
                question:
                  "What socket type is used for TCP connections?",
                answer: "socket.SOCK_STREAM",
              },
            ],
          },
          {
            id: "s1-6-2",
            number: "1.6.2",
            title: "Connecting to Services",
            content: [
              {
                type: "text",
                content:
                  "Once a socket is created, we use connect() to establish a connection to a remote host and port. We then receive data using recv() which specifies the maximum number of bytes to receive at once.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nimport socket\n\nclient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nhost = socket.gethostname()\nport = 9999\n\nclient.connect((host, port))\nmsg = client.recv(1024)\nclient.close()\n\nprint(msg.decode('ascii'))",
                  caption: "Listing 39 - Connecting to a service",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python networkclient.py\nPlease send a number to be squared",
                  caption: "Listing 40 - The server is requesting a number",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What socket method establishes a connection to a server?",
                answer: "connect()",
              },
              {
                question:
                  "What does recv(1024) specify?",
                answer: "Maximum bytes to receive (1024 bytes)",
              },
            ],
          },
          {
            id: "s1-6-3",
            number: "1.6.3",
            title: "Sending and Receiving Data",
            content: [
              {
                type: "text",
                content:
                  "After connecting, we can send data using send() or sendall(). Data must be encoded to bytes before sending, and decoded from bytes after receiving.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nimport socket\n\nclient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nclient.connect((socket.gethostname(), 9999))\n\nmsg = client.recv(1024)\nprint(msg.decode('ascii'))\n\n# Send a number to the server\nnumber = \"7\"\nclient.send(number.encode('ascii'))\n\nresult = client.recv(1024)\nprint(result.decode('ascii'))  # 49\nclient.close()",
                  caption: "Listing 41 - Sending data to a server",
                },
              },
            ],
            exercises: [
              {
                question:
                  "Why must data be encoded before sending over a socket?",
                answer: "Sockets transmit bytes, not strings",
              },
            ],
          },
        ],
      },
      {
        id: "s1-7",
        number: "1.7",
        title: "Putting It All Together",
        subsections: [
          {
            id: "s1-7-1",
            number: "1.7.1",
            title: "Planning with Pseudocode",
            content: [
              {
                type: "objectives",
                items: [
                  "Plan a complex script using pseudocode",
                  "Build a web spider incrementally",
                  "Parse HTML to extract links",
                  "Avoid revisiting duplicate URLs",
                  "Print the complete list of discovered URLs",
                ],
              },
              {
                type: "text",
                content:
                  "Before writing complex scripts, it helps to plan using pseudocode — a plain-language description of the logic without worrying about syntax. Let's plan a web spider that follows links on a website.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "1. Set a starting URL\n2. Add it to a urlList\n3. Make a GET request to that URL\n4. Parse the response for all href links\n5. For each link found:\n   6a. If already in urlList, skip it\n   6b. If not in urlList, add it and request it\n7. When finished, print all discovered URLs",
                  caption: "Listing 42 - Pseudocode for the web spider",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What is pseudocode used for?",
                answer:
                  "Planning script logic in plain language before writing actual code",
              },
            ],
          },
          {
            id: "s1-7-2",
            number: "1.7.2",
            title: "Building the Web Spider",
            content: [
              {
                type: "text",
                content:
                  "Now let's translate our pseudocode into a working Python script. We'll use the requests library to fetch pages and string slicing to extract URLs from HTML anchor tags.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nimport requests\n\nURL = \"http://192.168.58.101/\"\nurlList = []\nurlList.append(URL)\n\npage = requests.get(URL)\nprint(page.text)",
                  caption: "Listing 43 - Starting the web spider",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nimport requests\n\nURL = \"http://192.168.58.101/\"\nurlList = []\nurlList.append(URL)\n\npage = requests.get(URL)\nstart = \"http\"\n\nfor line in page.text.split('\\n'):\n    if \"http\" in line:\n        if \"192.168.58.101\" in line:\n            if \"'>\" in line:\n                end = \"'>\"\n            else:\n                end = '\">'\n            sliced = line[line.index(start):line.index(end)]\n            if not sliced in urlList:\n                urlList.append(sliced)",
                  caption: "Listing 44 - Parsing links from the page",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What method splits the page text into individual lines?",
                answer: ".split('\\n')",
              },
            ],
          },
          {
            id: "s1-7-3",
            number: "1.7.3",
            title: "Avoiding Duplicate URLs",
            content: [
              {
                type: "text",
                content:
                  "To avoid requesting the same URL twice, we check if the sliced URL is already in our urlList before appending it. We also need to recursively request each new URL found.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "def checkUrlList(url, urlList):\n    if url in urlList:\n        return True\n    else:\n        return False",
                  caption: "Listing 45 - Checking for duplicate URLs",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What Python operator checks if a value exists in a list?",
                answer: "in",
              },
            ],
          },
          {
            id: "s1-7-4",
            number: "1.7.4",
            title: "Final Spider Script",
            content: [
              {
                type: "text",
                content:
                  "Let's put it all together into a complete, working web spider that crawls all discovered links and prints each unique URL.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python\nimport requests\n\nURL = \"http://192.168.58.101/\"\nurlList = [URL]\n\ndef getLinks(url):\n    page = requests.get(url)\n    start = \"http\"\n    for line in page.text.split('\\n'):\n        if \"http\" in line and \"192.168.58.101\" in line:\n            end = \"'>\" if \"'>\" in line else '\">'\n            if start in line and end in line:\n                sliced = line[line.index(start):line.index(end)]\n                if sliced not in urlList:\n                    urlList.append(sliced)\n                    getLinks(sliced)\n\ngetLinks(URL)\n\nfor url in urlList:\n    print(url)",
                  caption: "Listing 46 - The complete web spider",
                },
              },
              {
                type: "note",
                content:
                  "Congratulations! You have completed Module 1: Python Scripting Basics. You now have the foundational skills needed to write functional Python scripts. Module 2 will dive deeper into network scripting.",
              },
            ],
            exercises: [
              {
                question:
                  "Run the completed web spider against the target machine. What does recursive mean in the context of this function?",
                answer:
                  "The function calls itself to follow each newly discovered URL",
              },
              {
                question:
                  "Run the web spider against the target at 192.168.58.101 and collect the flag from the results.",
                answer: "PYTHON(Putting_It_All_Together_Spider)",
                isLab: true,
                flag: "PYTHON(Putting_It_All_Together_Spider)",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "m2",
    number: "2",
    title: "Network Scripting",
    description:
      "Python is a very popular language that penetration testers use to create network scripts. This is due to its ease of use and the large number of libraries available.",
    sections: [
      {
        id: "s2-1",
        number: "2.1",
        title: "Write a Client with Python - I",
        subsections: [
          {
            id: "s2-1-1",
            number: "2.1.1",
            title: "Building a Basic Client",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand what network sockets are in detail",
                  "Build a basic networking client in Python",
                  "Use socket methods: connect, recv, close",
                  "Decode data received from the server",
                ],
              },
              {
                type: "text",
                content:
                  "For programs and systems to communicate with each other on a network, they use sockets and the socket API to send messages back and forth. A socket is essentially an endpoint that allows network communication to flow between two programs running over a network.",
              },
              {
                type: "text",
                content:
                  "As we begin writing our scripts, we recommend that you follow along and type the syntax in your own Python files. Try not to copy/paste the code, because writing it yourself can help reinforce understanding and memory.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\n# client.py\nimport socket\n\nclient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nhost = socket.gethostname()\nport = 8080\n\nclient.connect((host, port))   # Connect to our server\nmsg = client.recv(1024)\nclient.close()\n\nprint(msg.decode('ascii'))",
                  caption: "Listing 1 - A basic network client",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python3 client.py\nConnection Established",
                  caption: "Listing 2 - Connecting to a server",
                },
              },
              {
                type: "text",
                content:
                  "We've now built a fully functioning client program in Python. Our script connects to a local server running on port 8080. The socket.close() method terminates the connection between the client and the server.",
              },
            ],
            exercises: [
              {
                question:
                  "What method does a client use to establish a TCP connection?",
                answer: "connect()",
              },
              {
                question:
                  "What does recv(1024) define?",
                answer: "The maximum number of bytes to receive at once (1024)",
              },
            ],
          },
          {
            id: "s2-1-2",
            number: "2.1.2",
            title: "Socket Methods",
            content: [
              {
                type: "text",
                content:
                  "Python's socket module provides many useful methods for network communication. Understanding these methods is essential for building robust network tools.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "# Key socket methods:\nsocket.socket()          # Create socket\nsocket.connect((host, port))  # Connect to server\nsocket.send(data)        # Send data\nsocket.recv(bufsize)     # Receive data\nsocket.close()           # Close connection\nsocket.gethostname()     # Get local hostname\nsocket.gethostbyname(h)  # Resolve hostname to IP",
                  caption: "Listing 3 - Common socket methods",
                },
              },
            ],
            exercises: [
              {
                question:
                  "Which method resolves a hostname to an IP address?",
                answer: "socket.gethostbyname()",
              },
            ],
          },
        ],
      },
      {
        id: "s2-2",
        number: "2.2",
        title: "Write a Client Program in Python - II",
        subsections: [
          {
            id: "s2-2-1",
            number: "2.2.1",
            title: "Error Handling: Try and Except Clauses",
            content: [
              {
                type: "objectives",
                items: [
                  "Handle connection errors gracefully with try/except",
                  "Receive data of unknown size",
                  "Build interactive two-way socket communication",
                ],
              },
              {
                type: "text",
                content:
                  "Network operations can fail for many reasons: the server might be down, the connection refused, or the host unreachable. Python's try/except blocks let us handle these errors gracefully instead of crashing.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport socket\n\ntry:\n    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    client.connect(('192.168.1.1', 8080))\n    msg = client.recv(1024)\n    print(msg.decode('ascii'))\nexcept ConnectionRefusedError:\n    print(\"Connection refused. Is the server running?\")\nexcept socket.timeout:\n    print(\"Connection timed out.\")\nexcept Exception as e:\n    print(f\"An error occurred: {e}\")\nfinally:\n    client.close()",
                  caption: "Listing 4 - Error handling in socket clients",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What exception is raised when a connection is refused by the remote host?",
                answer: "ConnectionRefusedError",
              },
              {
                question:
                  "What block always runs, regardless of whether an exception occurred?",
                answer: "finally",
              },
            ],
          },
          {
            id: "s2-2-2",
            number: "2.2.2",
            title: "Handling Unknown Data Size",
            content: [
              {
                type: "text",
                content:
                  "When we don't know how much data the server will send, we need to loop and keep receiving until there is no more data. We can detect the end of data when recv() returns an empty bytes object.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport socket\n\nclient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nclient.connect((socket.gethostname(), 8080))\n\nfull_data = b''\nwhile True:\n    chunk = client.recv(1024)\n    if not chunk:  # Empty bytes = connection closed\n        break\n    full_data += chunk\n\nprint(full_data.decode('ascii'))\nclient.close()",
                  caption: "Listing 5 - Receiving data of unknown size",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What does recv() return when the server closes the connection?",
                answer: "Empty bytes object (b'')",
              },
            ],
          },
          {
            id: "s2-2-3",
            number: "2.2.3",
            title: "Interactive Sockets",
            content: [
              {
                type: "text",
                content:
                  "Many services are interactive — they receive input from the client and respond accordingly. We can use send() or sendall() to transmit data back to the server.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport socket\n\nclient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nclient.connect((socket.gethostname(), 9999))\n\n# Receive the prompt\nprompt = client.recv(1024)\nprint(prompt.decode('ascii'))\n\n# Send a number to be squared\nnumber = \"7\"\nclient.sendall(number.encode('ascii'))\n\n# Receive the result\nresult = client.recv(1024)\nprint(result.decode('ascii'))   # 49\nclient.close()",
                  caption: "Listing 6 - Interactive socket client",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What is the difference between send() and sendall()?",
                answer:
                  "sendall() guarantees all data is sent; send() may only send part of the data",
              },
            ],
          },
        ],
      },
      {
        id: "s2-3",
        number: "2.3",
        title: "Write a Server with Python",
        subsections: [
          {
            id: "s2-3-1",
            number: "2.3.1",
            title: "Building a Basic Server",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand server socket methods: bind and listen",
                  "Build a basic networking server in Python",
                  "Implement interactive sockets in a client and server",
                  "Accept multiple connections",
                ],
              },
              {
                type: "text",
                content:
                  "A server listens for incoming connections. Unlike a client that actively connects, a server binds to a port and waits. The key server methods are: bind() to assign an address, listen() to start accepting connections, and accept() to accept an incoming connection.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport socket\n\nserver = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nserver.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\n\nhost = socket.gethostname()\nport = 8080\n\nserver.bind((host, port))  # Bind to address\nserver.listen(5)            # Accept up to 5 queued connections\nprint(f\"Server listening on {host}:{port}\")\n\nconn, addr = server.accept()  # Block and wait for client\nprint(f\"Connection from {addr}\")\nconn.send(b\"Connection Established\")\nconn.close()",
                  caption: "Listing 7 - A basic network server",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What socket method binds a server to a specific address and port?",
                answer: "bind()",
              },
              {
                question:
                  "What does the argument to listen() specify?",
                answer: "Maximum number of queued connections",
              },
            ],
          },
          {
            id: "s2-3-2",
            number: "2.3.2",
            title: "Testing our Client and Server",
            content: [
              {
                type: "text",
                content:
                  "Now let's test our client and server together. Run the server script first in one terminal, then the client in another.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "# Terminal 1 - Server\nkali@kali:~$ python3 server.py\nServer listening on kali:8080\nConnection from ('127.0.0.1', 54321)\n\n# Terminal 2 - Client\nkali@kali:~$ python3 client.py\nConnection Established",
                  caption: "Listing 8 - Testing client and server",
                },
              },
              {
                type: "note",
                content:
                  "Always start the server before the client. If the client tries to connect before the server is listening, it will receive a ConnectionRefusedError.",
              },
            ],
            exercises: [
              {
                question:
                  "Make sure that your server can accept at least four connections at once. Then, use SSH to login to the container on port 2004 at the target VM with credentials root:root. Run the binary located at /root/ to connect back to your server and receive the flag.",
                answer: "PYTHON(Server_Side_Shenanigans)",
                isLab: true,
                flag: "PYTHON(Server_Side_Shenanigans)",
              },
            ],
          },
        ],
      },
      {
        id: "s2-4",
        number: "2.4",
        title: "Write a Port Scanner with Python",
        subsections: [
          {
            id: "s2-4-1",
            number: "2.4.1",
            title: "Using the Socket Module to Create a Port Scanner",
            content: [
              {
                type: "objectives",
                items: [
                  "Build a TCP port scanner using sockets",
                  "Scan a range of ports on a target host",
                  "Identify open and closed ports",
                  "Understand port knocking",
                ],
              },
              {
                type: "text",
                content:
                  "A port scanner checks which TCP ports are open on a target system. We attempt to connect to each port — if the connection succeeds, the port is open; if it's refused, the port is closed.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport socket\n\ntarget = \"192.168.1.100\"\n\nprint(f\"Scanning {target}\")\nfor port in range(1, 1025):\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    s.settimeout(0.5)\n    result = s.connect_ex((target, port))\n    if result == 0:\n        print(f\"Port {port}: OPEN\")\n    s.close()",
                  caption: "Listing 9 - A basic port scanner",
                },
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ python3 portscanner.py\nScanning 192.168.1.100\nPort 22: OPEN\nPort 80: OPEN\nPort 443: OPEN",
                  caption: "Listing 10 - Port scanner output",
                },
              },
              {
                type: "text",
                content:
                  "connect_ex() returns 0 on success (port open) and an error code on failure (port closed/filtered). We use settimeout() to avoid waiting too long for each connection attempt.",
              },
            ],
            exercises: [
              {
                question:
                  "What does connect_ex() return when a port is open?",
                answer: "0",
              },
              {
                question:
                  "Why do we use settimeout() in a port scanner?",
                answer:
                  "To avoid waiting too long for closed/filtered ports, making the scan faster",
              },
            ],
          },
          {
            id: "s2-4-2",
            number: "2.4.2",
            title: "Port Knocking",
            content: [
              {
                type: "text",
                content:
                  "Port Knocking is a means by which external users can open a gated port on a machine by first connecting to a predetermined list of other ports in a specific order. Think of it like entering a PIN on a mobile device: if you input the correct numbers in the correct order, the phone will unlock. Similarly, assuming the machine's firewall has been configured in such a way, \"knocking\" on the correct ports in the correct order will open the gated port.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport socket\nimport time\n\ntarget = \"192.168.1.100\"\nknock_sequence = [7000, 8000, 9000]  # The secret knock\n\nfor port in knock_sequence:\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    s.settimeout(0.1)\n    s.connect_ex((target, port))  # Knock — ignore result\n    s.close()\n    time.sleep(0.1)  # Small delay between knocks\n\nprint(\"Knock sequence sent. Try connecting to the target port.\")",
                  caption: "Listing 11 - Port knocking implementation",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What is port knocking used for?",
                answer:
                  "Opening a gated/hidden port by connecting to other ports in a specific sequence",
              },
            ],
          },
        ],
      },
      {
        id: "s2-5",
        number: "2.5",
        title: "Website Interaction with Python - I",
        subsections: [
          {
            id: "s2-5-1",
            number: "2.5.1",
            title: "The Transport Layer: Using the Python Sockets Module with HTTP",
            content: [
              {
                type: "objectives",
                items: [
                  "Make raw HTTP requests using sockets",
                  "Use the requests library for GET requests",
                  "Parse HTML using string methods",
                  "Inspect HTTP response headers",
                ],
              },
              {
                type: "text",
                content:
                  "At the transport layer, HTTP is just text sent over a TCP connection. We can use raw sockets to craft HTTP requests manually. This helps us understand exactly what a browser sends and receives.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport socket\n\nclient = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nclient.connect(('www.offensive-security.com', 80))\n\nrequest = \"GET / HTTP/1.1\\r\\nHost: www.offensive-security.com\\r\\n\\r\\n\"\nclient.send(request.encode('ascii'))\n\nresponse = b''\nwhile True:\n    chunk = client.recv(4096)\n    if not chunk:\n        break\n    response += chunk\n\nprint(response.decode('ascii', errors='ignore')[:500])\nclient.close()",
                  caption: "Listing 12 - Raw HTTP GET request over socket",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What is the correct HTTP/1.1 header format to specify the target host?",
                answer: "Host: www.example.com",
              },
            ],
          },
          {
            id: "s2-5-2",
            number: "2.5.2",
            title: "The Application Layer: GET Requests with Python",
            content: [
              {
                type: "text",
                content:
                  "The requests library abstracts all the low-level socket work and provides a clean interface for HTTP operations.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\n# web-client.py\nimport requests\n\nurl = \"http://www.offensive-security.com\"\nresponse = requests.get(url)\n\nprint(response.status_code)   # 200\nprint(response.headers)        # Headers dict\nprint(response.text[:500])     # First 500 chars of body",
                  caption: "Listing 13 - Retrieving the response headers",
                },
              },
            ],
            exercises: [
              {
                question:
                  "Which attribute of a requests response contains the response headers as a dictionary?",
                answer: "response.headers",
              },
            ],
          },
          {
            id: "s2-5-3",
            number: "2.5.3",
            title: "Parsing HTML",
            content: [
              {
                type: "text",
                content:
                  "After retrieving a page, we can parse the HTML to extract links, form fields, or other data using string methods or dedicated libraries.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport requests\n\nurl = \"http://192.168.58.101/\"\nresponse = requests.get(url)\n\nfor line in response.text.split('\\n'):\n    if 'href' in line and 'http' in line:\n        start = line.index('http')\n        end = line.index('\"', start)\n        link = line[start:end]\n        print(link)",
                  caption: "Listing 14 - Parsing links from HTML",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What method splits an HTML page into individual lines?",
                answer: ".split('\\n')",
              },
            ],
          },
        ],
      },
      {
        id: "s2-6",
        number: "2.6",
        title: "Website Interaction with Python - II",
        subsections: [
          {
            id: "s2-6-1",
            number: "2.6.1",
            title: "POST Requests and Parameters with Python",
            content: [
              {
                type: "objectives",
                items: [
                  "Make HTTP POST requests using Python",
                  "Analyze HTTP request headers with Python",
                  "Become comfortable programming repetitive web-based actions",
                ],
              },
              {
                type: "text",
                content:
                  "POST requests send data to a server, typically from web forms. Unlike GET requests where parameters appear in the URL, POST data is sent in the request body.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport requests\n\nurl = \"http://192.168.58.101/login\"\npayload = {\n    'username': 'admin',\n    'password': 'password123'\n}\n\nresponse = requests.post(url, data=payload)\nprint(response.status_code)\nprint(response.text)",
                  caption: "Listing 15 - Sending a POST request",
                },
              },
              {
                type: "text",
                content:
                  "We can also send JSON data, set custom headers, or manage cookies. The requests library's session object maintains state across requests (like staying logged in).",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport requests\n\n# Using a session to persist login state\ns = requests.Session()\nlogin_url = \"http://192.168.58.101/login\"\ns.post(login_url, data={'username': 'admin', 'password': 'secret'})\n\n# Subsequent requests are made as the logged-in user\nprotected = s.get(\"http://192.168.58.101/dashboard\")\nprint(protected.text)",
                  caption: "Listing 16 - Using a requests session",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What function is used to send a POST request with the requests library?",
                answer: "requests.post()",
              },
              {
                question:
                  "What requests object maintains login state across multiple requests?",
                answer: "requests.Session()",
              },
            ],
          },
          {
            id: "s2-6-2",
            number: "2.6.2",
            title: "Request Headers and Non-Text-based Content",
            content: [
              {
                type: "text",
                content:
                  "We can set custom HTTP headers to impersonate browsers, bypass restrictions, or send specific content types. Non-text responses like images or binary files require accessing response.content instead of response.text.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nimport requests\n\nheaders = {\n    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',\n    'Accept': 'text/html,application/xhtml+xml',\n    'Referer': 'https://www.google.com'\n}\n\nresponse = requests.get('http://target.com/', headers=headers)\nprint(response.status_code)\n\n# For binary content (images, files)\nimg_response = requests.get('http://target.com/logo.png')\nwith open('logo.png', 'wb') as f:\n    f.write(img_response.content)",
                  caption: "Listing 17 - Custom headers and binary content",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What attribute of the response contains raw binary data?",
                answer: "response.content",
              },
            ],
          },
        ],
      },
      {
        id: "s2-7",
        number: "2.7",
        title: "Capturing and Sending Packets with Scapy",
        subsections: [
          {
            id: "s2-7-1",
            number: "2.7.1",
            title: "Why Scapy?",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand why text-based packet manipulation is powerful",
                  "Capture network traffic using Scapy",
                  "Craft and send custom packets",
                ],
              },
              {
                type: "text",
                content:
                  "Scapy is a powerful Python library for packet manipulation. Unlike raw sockets, Scapy lets us dissect, forge, and decode packets of a wide number of protocols with minimal code. It is widely used for network testing, protocol fuzzing, and security research.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "kali@kali:~$ pip install scapy\nkali@kali:~$ python3\n>>> from scapy.all import *",
                  caption: "Listing 18 - Installing and importing Scapy",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What makes Scapy more powerful than raw sockets for packet manipulation?",
                answer:
                  "Scapy can dissect, forge, and decode many protocols with minimal code; raw sockets require manual byte construction",
              },
            ],
          },
          {
            id: "s2-7-2",
            number: "2.7.2",
            title: "Capturing Network Traffic",
            content: [
              {
                type: "text",
                content:
                  "Scapy's sniff() function captures live network traffic. We can filter by protocol, count packets, or apply a callback function to each captured packet.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nfrom scapy.all import *\n\ndef packet_callback(packet):\n    if packet.haslayer(IP):\n        print(f\"{packet[IP].src} -> {packet[IP].dst}\")\n\n# Capture 10 TCP packets on eth0\nsniff(iface=\"eth0\", filter=\"tcp\", prn=packet_callback, count=10)",
                  caption: "Listing 19 - Capturing packets with Scapy",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What Scapy function is used to capture live network traffic?",
                answer: "sniff()",
              },
            ],
          },
          {
            id: "s2-7-3",
            number: "2.7.3",
            title: "Crafting Custom Packets",
            content: [
              {
                type: "text",
                content:
                  "Scapy lets us craft custom packets by stacking protocol layers together using the / operator. This is extremely useful for testing, fuzzing, and evading detection.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nfrom scapy.all import *\n\n# Craft an ICMP ping packet\npacket = IP(dst=\"192.168.1.1\") / ICMP()\nresponse = sr1(packet, timeout=1)\n\nif response:\n    print(f\"Host is up: {response[IP].src}\")\nelse:\n    print(\"No response\")\n\n# Craft a TCP SYN packet\nsyn = IP(dst=\"192.168.1.1\") / TCP(dport=80, flags=\"S\")\nresponse = sr1(syn, timeout=1)\nprint(response.summary())",
                  caption: "Listing 20 - Crafting and sending custom packets",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What operator is used in Scapy to stack protocol layers?",
                answer: "/",
              },
              {
                question:
                  "What Scapy function sends a packet and waits for one response?",
                answer: "sr1()",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "m3",
    number: "3",
    title: "Data Manipulation in Python",
    duration: "~7.5 hours",
    description:
      "This module covers advanced data types and structures in Python, including binary data, base representations, complex numbers, and user-defined data structures.",
    sections: [
      {
        id: "s3-1",
        number: "3.1",
        title: "Python Data Basics",
        subsections: [
          {
            id: "s3-1-1",
            number: "3.1.1",
            title: "Working With Strings",
            content: [
              {
                type: "objectives",
                items: [
                  "Refresh basic knowledge of Python data types",
                  "Understand sets, lists, and dictionaries in depth",
                  "Understand different base representations",
                  "Learn to convert and display data objects",
                  "Manipulate binary large objects",
                  "Understand user-defined data structures",
                ],
              },
              {
                type: "text",
                content:
                  "In this module, we revisit Python data types at a deeper level. Strings in Python are immutable sequences of Unicode characters. They support a rich set of methods for searching, splitting, joining, and transforming text.",
              },
              {
                type: "code",
                codeBlock: {
                  code: '>>> s = "Hello, World!"\n>>> s.upper()         # \'HELLO, WORLD!\'\n>>> s.lower()         # \'hello, world!\'\n>>> s.split(\",\")      # [\'Hello\', \' World!\']\n>>> s.strip()         # Remove whitespace\n>>> s.replace(\"World\", \"Python\")  # \'Hello, Python!\'\n>>> s.startswith(\"He\")  # True\n>>> len(s)            # 13\n>>> s[7:12]           # \'World\'',
                  caption: "Listing 1 - Common string methods",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What string method splits a string on whitespace by default?",
                answer: ".split()",
              },
              {
                question:
                  "How do you get the length of a string?",
                answer: "len(string)",
              },
            ],
          },
          {
            id: "s3-1-2",
            number: "3.1.2",
            title: "Working with Integers",
            content: [
              {
                type: "text",
                content:
                  "Python integers have arbitrary precision — they can be as large as memory allows. Python supports integer division (//, returning a whole number), modulo (%, returning the remainder), and exponentiation (**).",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> 17 // 5      # Integer division: 3\n>>> 17 % 5       # Modulo (remainder): 2\n>>> 2 ** 10      # Exponentiation: 1024\n>>> abs(-42)     # Absolute value: 42\n>>> divmod(17,5) # (quotient, remainder): (3, 2)",
                  caption: "Listing 2 - Integer operations",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What data type results from doing an integer divide of the floating point value 124.00?",
                answer: "float",
              },
              {
                question:
                  "How do we extract the remainder of dividing 1325 by 91?",
                answer: "1325 % 91",
              },
            ],
          },
          {
            id: "s3-1-3",
            number: "3.1.3",
            title: "Working with Floating Points",
            content: [
              {
                type: "text",
                content:
                  "Floating point variables are numbers which have values both in front of and behind the decimal point. For example, dividing three by two gives 1.5. We can set a floating point variable by including a decimal point in the assignment.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> f = 3.14159\n>>> f * 2         # 6.28318\n>>> round(f, 2)   # 3.14\n>>> int(f)        # 3 (truncates)\n>>> 1 / 3         # 0.3333333333333333\n>>> 10.0 // 3     # 3.0 (float division)",
                  caption: "Listing 3 - Float operations",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What function rounds a float to a specified number of decimal places?",
                answer: "round()",
              },
            ],
          },
          {
            id: "s3-1-4",
            number: "3.1.4",
            title: "Exploring Complex Numbers",
            content: [
              {
                type: "text",
                content:
                  "Python offers the ability to manipulate complex numbers. These numbers, which consist of real and imaginary parts, occur when carrying out square root operations on negative numbers. They are used in engineering to analyze structural vibrations and the behavior of fluids. A complex number is represented in the form x+yj where x is the real part and y the imaginary part.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> cnum1 = 17+3j\n>>> print(cnum1)\n(17+3j)\n>>> type(cnum1)\n<class 'complex'>\n\n>>> cnum2 = complex(17, 3)\n>>> print(cnum2)\n(17+3j)\n\n>>> cnum1.real    # 17.0\n>>> cnum1.imag    # 3.0",
                  caption: "Listing 4 - Complex Numbers in Python",
                },
              },
            ],
            exercises: [
              {
                question:
                  "We have an imaginary number cnum1. Write the print statement to show: \"The real part is xx and the imaginary part is yy\".",
                answer:
                  'print(f"The real part is {cnum1.real} and the imaginary part is {cnum1.imag}")',
              },
            ],
          },
          {
            id: "s3-1-5",
            number: "3.1.5",
            title: "Working with Booleans",
            content: [
              {
                type: "text",
                content:
                  "At a deeper level, Python Booleans are actually a subclass of int. True equals 1 and False equals 0. This means Booleans can participate in arithmetic operations, which can lead to surprising results.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> True + True   # 2\n>>> True * 5      # 5\n>>> False + 10    # 10\n>>> bool(0)       # False\n>>> bool(\"\")      # False (empty string)\n>>> bool([])      # False (empty list)\n>>> bool(42)      # True\n>>> bool(\"hello\") # True",
                  caption: "Listing 5 - Boolean arithmetic",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What is the integer value of True in Python?",
                answer: "1",
              },
              {
                question:
                  "What does bool([]) return?",
                answer: "False",
              },
            ],
          },
          {
            id: "s3-1-6",
            number: "3.1.6",
            title: "Understanding Python Bytes",
            content: [
              {
                type: "text",
                content:
                  "The bytes type represents a sequence of 8-bit values (0-255). It's used extensively in network programming, binary file I/O, and cryptography. Bytes literals are prefixed with b.",
              },
              {
                type: "code",
                codeBlock: {
                  code: '>>> b = b"hello"\n>>> type(b)           # <class \'bytes\'>\n>>> len(b)            # 5\n>>> b[0]              # 104 (ASCII for \'h\')\n>>> b.hex()           # \'68656c6c6f\'\n>>> b.decode("ascii") # \'hello\'\n\n# Encoding strings to bytes\n>>> "hello".encode("utf-8")  # b\'hello\'',
                  caption: "Listing 6 - Working with bytes",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What prefix denotes a bytes literal in Python?",
                answer: "b",
              },
              {
                question:
                  "What method converts a bytes object to its hexadecimal representation?",
                answer: ".hex()",
              },
            ],
          },
        ],
      },
      {
        id: "s3-2",
        number: "3.2",
        title: "Sets, Lists, and Dictionaries",
        subsections: [
          {
            id: "s3-2-1",
            number: "3.2.1",
            title: "Manipulating Sets",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand sets and their uniqueness property",
                  "Perform set operations: union, intersection, difference",
                  "Work with lists at a deeper level",
                  "Understand tuples and their immutability",
                  "Use advanced dictionary operations",
                ],
              },
              {
                type: "text",
                content:
                  "A set is an unordered collection of unique items. Sets are useful when you need to eliminate duplicates or perform mathematical set operations like union, intersection, and difference.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> s1 = {1, 2, 3, 4, 5}\n>>> s2 = {4, 5, 6, 7, 8}\n\n>>> s1 | s2   # Union: {1,2,3,4,5,6,7,8}\n>>> s1 & s2   # Intersection: {4, 5}\n>>> s1 - s2   # Difference: {1, 2, 3}\n>>> s1 ^ s2   # Symmetric diff: {1,2,3,6,7,8}\n\n# Sets eliminate duplicates\n>>> words = ['cat', 'dog', 'cat', 'bird', 'dog']\n>>> unique = set(words)   # {'cat', 'dog', 'bird'}",
                  caption: "Listing 7 - Set operations",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What set operator returns only elements common to both sets?",
                answer: "& (intersection)",
              },
            ],
          },
          {
            id: "s3-2-2",
            number: "3.2.2",
            title: "Working with Lists",
            content: [
              {
                type: "text",
                content:
                  "Lists are Python's most versatile data structure. They maintain order, allow duplicates, and support a wide range of operations including sorting, inserting at specific positions, and slicing.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> list1 = [3, 42, 15, 9, 7, 16, 'phoenix']\n>>> list1.sort()\n>>> print(list1)\n[3, 7, 9, 15, 16, 42, 'phoenix']\n\n>>> list2 = [1, 3, 5, 7, 13, 17, 19, 23]\n>>> list2.insert(4, 11)\n>>> print(list2)\n[1, 3, 5, 7, 11, 13, 17, 19, 23]\n\n# Hex digit mapping\n>>> hexlist = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F']\n>>> hexlist[12]  # 'C'",
                  caption: "Listing 8 - Advanced list operations",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What list method inserts an item at a specific index?",
                answer: ".insert(index, value)",
              },
            ],
          },
          {
            id: "s3-2-3",
            number: "3.2.3",
            title: "Exploring Tuples",
            content: [
              {
                type: "text",
                content:
                  "Tuples are immutable sequences — once created, their elements cannot be changed. They are typically used to represent fixed collections of related items, such as coordinates or database records.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> t = (10, 20, 30)\n>>> t[0]     # 10\n>>> len(t)   # 3\n\n# Tuple unpacking\n>>> x, y, z = t\n>>> print(x, y, z)  # 10 20 30\n\n# Tuples are immutable\n>>> t[0] = 99\nTypeError: 'tuple' object does not support item assignment",
                  caption: "Listing 9 - Tuple operations",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What makes tuples different from lists?",
                answer: "Tuples are immutable (cannot be modified after creation)",
              },
            ],
          },
          {
            id: "s3-2-4",
            number: "3.2.4",
            title: "Using Dictionaries",
            content: [
              {
                type: "text",
                content:
                  "Dictionaries offer O(1) average-case lookup, making them extremely efficient. Advanced operations include dictionary comprehensions, merging dicts, and using .get() for safe access.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> d = {'a': 1, 'b': 2, 'c': 3}\n\n# Safe access (no KeyError)\n>>> d.get('d', 'not found')   # 'not found'\n\n# Dictionary comprehension\n>>> squares = {n: n**2 for n in range(1, 6)}\n>>> squares  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}\n\n# Merging dicts (Python 3.9+)\n>>> d1 = {'a': 1}; d2 = {'b': 2}\n>>> merged = d1 | d2   # {'a': 1, 'b': 2}",
                  caption: "Listing 10 - Advanced dictionary operations",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What dictionary method retrieves a value safely without raising KeyError?",
                answer: ".get(key, default)",
              },
            ],
          },
        ],
      },
      {
        id: "s3-3",
        number: "3.3",
        title: "Different Base Representations",
        subsections: [
          {
            id: "s3-3-1",
            number: "3.3.1",
            title: "Manipulating Binary Values",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand binary, octal, and hexadecimal number systems",
                  "Convert between bases using Python built-ins",
                  "Perform bitwise operations",
                ],
              },
              {
                type: "text",
                content:
                  "Computers store everything as binary (base-2). Python can represent integers in binary using the 0b prefix. Bitwise operators allow us to manipulate individual bits.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> bin(42)      # '0b101010'\n>>> 0b101010     # 42\n>>> 0b1111       # 15\n\n# Bitwise operators\n>>> 0b1010 & 0b1100  # AND: 0b1000 = 8\n>>> 0b1010 | 0b1100  # OR:  0b1110 = 14\n>>> 0b1010 ^ 0b1100  # XOR: 0b0110 = 6\n>>> ~0b1010           # NOT: -11\n>>> 0b1010 << 2       # Left shift: 0b101000 = 40\n>>> 0b1010 >> 1       # Right shift: 0b101 = 5",
                  caption: "Listing 11 - Binary operations",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What Python built-in function converts an integer to its binary string representation?",
                answer: "bin()",
              },
            ],
          },
          {
            id: "s3-3-2",
            number: "3.3.2",
            title: "Octal Numbers",
            content: [
              {
                type: "text",
                content:
                  "Octal (base-8) uses digits 0-7. In Python, octal literals use the 0o prefix. Octal is historically significant in Unix file permissions (e.g., chmod 755).",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> oct(8)        # '0o10'\n>>> oct(255)      # '0o377'\n>>> 0o17          # 15\n>>> 0o777         # 511\n\n# Unix permissions\n>>> oct(0o755)    # '0o755'\n# 7 = rwx (owner), 5 = r-x (group), 5 = r-x (others)",
                  caption: "Listing 12 - Octal numbers",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What prefix is used for octal literals in Python?",
                answer: "0o",
              },
            ],
          },
          {
            id: "s3-3-3",
            number: "3.3.3",
            title: "Hexadecimal Numbers",
            content: [
              {
                type: "text",
                content:
                  "Hexadecimal (base-16) uses digits 0-9 and letters A-F. It is widely used in memory addresses, colors, and binary file analysis. Python's hex() function converts integers to hex. We can build a hexdump tool to display binary file contents.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> hex(255)      # '0xff'\n>>> hex(65535)    # '0xffff'\n>>> 0xFF          # 255\n>>> 0x1A          # 26\n\n# Building a hexdump\n1. fname = input('Filename: ')\n2. r = open(fname, \"rb\")\n3. offset = 0\n4. infile = True\n5. while infile:\n6.     addr=str(hex(offset)[2:].ljust(8))",
                  caption: "Listing 13 - Hexadecimal and hexdump building",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What Python function converts an integer to a hexadecimal string?",
                answer: "hex()",
              },
              {
                question:
                  "What prefix is used for hexadecimal literals in Python?",
                answer: "0x",
              },
            ],
          },
        ],
      },
      {
        id: "s3-4",
        number: "3.4",
        title: "Converting and Displaying Data Types",
        subsections: [
          {
            id: "s3-4-1",
            number: "3.4.1",
            title: "Introducing Conversions",
            content: [
              {
                type: "objectives",
                items: [
                  "Convert between integers, bytes, characters, and strings",
                  "Use to_bytes() and from_bytes()",
                  "Convert characters with ord() and chr()",
                  "Encode strings as hex",
                ],
              },
              {
                type: "text",
                content:
                  "Python provides many built-in functions to convert between data types. Understanding these conversions is essential for working with binary data, network protocols, and cryptography.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "# Overview of conversion functions\nint()      # String/float to integer\nfloat()    # String/int to float\nstr()      # Any type to string\nbytes()    # To bytes object\nbytearray() # Mutable bytes\nord()      # Character to ASCII code\nchr()      # ASCII code to character\nhex()      # Integer to hex string\nbin()      # Integer to binary string\noct()      # Integer to octal string",
                  caption: "Listing 14 - Python conversion functions overview",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What function converts a character to its ASCII integer value?",
                answer: "ord()",
              },
            ],
          },
          {
            id: "s3-4-2",
            number: "3.4.2",
            title: "Converting Integers",
            content: [
              {
                type: "text",
                content:
                  "We can convert an integer to bytes using the .to_bytes() function, specifying the number of bytes and byte order (big-endian or little-endian).",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> ii = 99\n\n>>> b = ii.to_bytes(1, 'big')\n>>> print('to_bytes:', type(b), b)\nto_bytes: <class 'bytes'> b'c'\n\n>>> b2 = bytes([ii])\n>>> print('in list:', type(b2), b2)\niterble: <class 'bytes'> b'c'\n\n# Multi-byte integers\n>>> (256).to_bytes(2, 'big')    # b'\\x01\\x00'\n>>> (256).to_bytes(2, 'little') # b'\\x00\\x01'",
                  caption: "Listing 15 - Integer to bytes conversion",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What two arguments does .to_bytes() require?",
                answer: "Number of bytes and byte order ('big' or 'little')",
              },
            ],
          },
          {
            id: "s3-4-3",
            number: "3.4.3",
            title: "Converting Bytes",
            content: [
              {
                type: "text",
                content:
                  "Converting bytes back to integers uses int.from_bytes(). We can also access individual bytes by indexing, which returns an integer value (0-255).",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> b = b'\\x01\\x00'\n>>> int.from_bytes(b, 'big')     # 256\n>>> int.from_bytes(b, 'little')  # 1\n\n>>> data = b'hello'\n>>> data[0]         # 104 (ASCII 'h')\n>>> list(data)      # [104, 101, 108, 108, 111]",
                  caption: "Listing 16 - Bytes to integer conversion",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What function converts a bytes object back to an integer?",
                answer: "int.from_bytes()",
              },
            ],
          },
          {
            id: "s3-4-4",
            number: "3.4.4",
            title: "Converting Characters",
            content: [
              {
                type: "text",
                content:
                  "The ord() function converts a single character to its Unicode/ASCII integer code point. The chr() function does the reverse — converts an integer code point to a character. These are essential for XOR encryption, Caesar ciphers, and character analysis.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> ord('A')    # 65\n>>> ord('a')    # 97\n>>> ord('0')    # 48\n>>> chr(65)     # 'A'\n>>> chr(97)     # 'a'\n\n# Simple Caesar cipher shift\n>>> message = \"hello\"\n>>> shift = 3\n>>> ''.join(chr(ord(c) + shift) for c in message)\n'khoor'",
                  caption: "Listing 17 - ord() and chr() conversions",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What is the ASCII value of the letter 'A'?",
                answer: "65",
              },
              {
                question:
                  "What function converts ASCII code 65 back to 'A'?",
                answer: "chr(65)",
              },
            ],
          },
          {
            id: "s3-4-5",
            number: "3.4.5",
            title: "String to Hexadecimal String",
            content: [
              {
                type: "text",
                content:
                  "Converting a string to its hexadecimal representation is useful for encoding binary data as printable text. This is commonly used in network protocols, file formats, and data storage.",
              },
              {
                type: "code",
                codeBlock: {
                  code: ">>> s = \"hello\"\n>>> s.encode().hex()      # '68656c6c6f'\n>>> bytes.fromhex('68656c6c6f').decode()  # 'hello'\n\n# Manual conversion\n>>> ' '.join(hex(ord(c)) for c in \"hi\")\n'0x68 0x69'\n\n# Using binascii\n>>> import binascii\n>>> binascii.hexlify(b'hello')    # b'68656c6c6f'\n>>> binascii.unhexlify('68656c6c6f')  # b'hello'",
                  caption: "Listing 18 - String to hexadecimal conversion",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What method converts an encoded string to its hex representation?",
                answer: ".encode().hex()",
              },
            ],
          },
        ],
      },
      {
        id: "s3-5",
        number: "3.5",
        title: "Manipulating Binary Large Objects in Python",
        subsections: [
          {
            id: "s3-5-1",
            number: "3.5.1",
            title: "Arrays of Bytes and Byte Arrays",
            content: [
              {
                type: "objectives",
                items: [
                  "Understand the difference between bytes and bytearray",
                  "Manipulate binary data using bytearrays",
                  "Manage BLOBs using bytes objects",
                ],
              },
              {
                type: "text",
                content:
                  "Python has two types for binary sequences: bytes (immutable) and bytearray (mutable). The bytearray type is especially useful when you need to modify binary data in-place, such as when building network packets or modifying binary files.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "# bytes - immutable\n>>> b = bytes([72, 101, 108, 108, 111])\n>>> b               # b'Hello'\n>>> b[0]            # 72\n>>> b[0] = 99       # TypeError! Immutable\n\n# bytearray - mutable\n>>> ba = bytearray(b'Hello')\n>>> ba[0] = 99      # OK! Mutable\n>>> bytes(ba)       # b'cello'\n>>> ba.append(33)   # Add a byte\n>>> ba.extend(b' World')  # Add multiple bytes",
                  caption: "Listing 19 - bytes vs bytearray",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What is the key difference between bytes and bytearray?",
                answer:
                  "bytes is immutable; bytearray is mutable (can be modified in-place)",
              },
            ],
          },
          {
            id: "s3-5-2",
            number: "3.5.2",
            title: "Managing BLOBs as Bytes",
            content: [
              {
                type: "text",
                content:
                  "Binary Large Objects (BLOBs) are large chunks of binary data, such as images, executables, or encrypted content. Python's bytes type is ideal for reading and writing these objects.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\n# Read a binary file (BLOB)\nwith open('image.png', 'rb') as f:\n    blob = f.read()\n\nprint(f\"Read {len(blob)} bytes\")\nprint(f\"Header: {blob[:8].hex()}\")  # PNG magic bytes\n\n# Write modified BLOB\nmodified = bytearray(blob)\nmodified[0] = 0x89  # Ensure PNG magic byte\nwith open('modified.png', 'wb') as f:\n    f.write(bytes(modified))",
                  caption: "Listing 20 - Reading and writing BLOBs",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What file mode opens a file for reading in binary mode?",
                answer: "'rb'",
              },
            ],
          },
        ],
      },
      {
        id: "s3-6",
        number: "3.6",
        title: "User-Defined Data Structures",
        subsections: [
          {
            id: "s3-6-1",
            number: "3.6.1",
            title: "Building Stacks of Data",
            content: [
              {
                type: "objectives",
                items: [
                  "Build stacks of data (LIFO)",
                  "Create doubly-linked lists",
                  "Build graph structures",
                  "Grow trees in Python",
                  "Work with FIFO queues",
                ],
              },
              {
                type: "text",
                content:
                  "A stack is a Last-In-First-Out (LIFO) data structure. Think of it like a stack of plates — you always add and remove from the top. Python lists can be used as stacks using .append() to push and .pop() to pop.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "#!/usr/bin/python3\nstack = []\n\n# Push items\nstack.append('first')\nstack.append('second')\nstack.append('third')\n\nprint(stack)   # ['first', 'second', 'third']\n\n# Pop items (LIFO)\nprint(stack.pop())  # 'third'\nprint(stack.pop())  # 'second'\nprint(stack)        # ['first']",
                  caption: "Listing 21 - Implementing a stack with a list",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What does LIFO stand for?",
                answer: "Last-In, First-Out",
              },
            ],
          },
          {
            id: "s3-6-2",
            number: "3.6.2",
            title: "Doubly-Linked Lists",
            content: [
              {
                type: "text",
                content:
                  "A doubly-linked list is a linear data structure where each node contains data and pointers to both the previous and next nodes. This allows traversal in both directions.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "class Node:\n    def __init__(self, data):\n        self.data = data\n        self.prev = None\n        self.next = None\n\nclass DoublyLinkedList:\n    def __init__(self):\n        self.head = None\n\n    def append(self, data):\n        new_node = Node(data)\n        if self.head is None:\n            self.head = new_node\n            return\n        curr = self.head\n        while curr.next:\n            curr = curr.next\n        curr.next = new_node\n        new_node.prev = curr",
                  caption: "Listing 22 - Doubly linked list implementation",
                },
              },
            ],
            exercises: [
              {
                question:
                  "How many pointers does each node in a doubly-linked list have?",
                answer: "Two (prev and next)",
              },
            ],
          },
          {
            id: "s3-6-3",
            number: "3.6.3",
            title: "Graph Structures",
            content: [
              {
                type: "text",
                content:
                  "Graphs represent relationships between objects (nodes) via edges. They model network topologies, social networks, and dependency trees. Python dictionaries are ideal for adjacency-list representations.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "# Adjacency list using a dictionary\ngraph = {\n    'A': ['B', 'C'],\n    'B': ['A', 'D', 'E'],\n    'C': ['A', 'F'],\n    'D': ['B'],\n    'E': ['B', 'F'],\n    'F': ['C', 'E']\n}\n\n# BFS traversal\nfrom collections import deque\n\ndef bfs(graph, start):\n    visited = set()\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        if node not in visited:\n            visited.add(node)\n            print(node)\n            queue.extend(graph[node])",
                  caption: "Listing 23 - Graph with BFS traversal",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What Python data structure is commonly used to represent a graph as an adjacency list?",
                answer: "Dictionary",
              },
            ],
          },
          {
            id: "s3-6-4",
            number: "3.6.4",
            title: "Tree Structures",
            content: [
              {
                type: "text",
                content:
                  "Trees are hierarchical data structures with a root node and child nodes. Active Directory domains are a real-world tree structure. Python's xml.etree.ElementTree module provides excellent tree-building tools.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "import xml.etree.ElementTree as ET\n\ntree = ET.parse('library.xml')\nroot = tree.getroot()\n\nprint(root.tag)         # 'Library'\nprint(root[0].tag)      # 'Composer'\nprint(root[0][0].text)  # 'Hildegard Von Bingen'\n\n# Iterate across the tree\nfor i in range(len(root)):\n    print(root[i][0].text)",
                  caption: "Listing 24 - Reading tree tags with ElementTree",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What Python module is used for parsing XML tree structures?",
                answer: "xml.etree.ElementTree",
              },
            ],
          },
          {
            id: "s3-6-5",
            number: "3.6.5",
            title: "Working with FIFO Queues",
            content: [
              {
                type: "text",
                content:
                  "A queue is a First-In-First-Out (FIFO) data structure — like a line at a store. Python's collections.deque is the ideal implementation, as it provides O(1) operations at both ends.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "from collections import deque\n\nqueue = deque()\n\n# Enqueue\nqueue.append('first')\nqueue.append('second')\nqueue.append('third')\n\nprint(queue)   # deque(['first', 'second', 'third'])\n\n# Dequeue (FIFO)\nprint(queue.popleft())  # 'first'\nprint(queue.popleft())  # 'second'\nprint(queue)            # deque(['third'])",
                  caption: "Listing 25 - Implementing a queue with deque",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What does FIFO stand for?",
                answer: "First-In, First-Out",
              },
              {
                question:
                  "What Python class provides O(1) FIFO operations from both ends?",
                answer: "collections.deque",
              },
            ],
          },
        ],
      },
      {
        id: "s3-7",
        number: "3.7",
        title: "Data Structures as Records",
        subsections: [
          {
            id: "s3-7-1",
            number: "3.7.1",
            title: "Python Dataclasses",
            content: [
              {
                type: "objectives",
                items: [
                  "Use @dataclass to create structured record types",
                  "Parse XML data with ElementTree",
                  "Load and save JSON data with the json module",
                  "Interact with SQLite databases",
                ],
              },
              {
                type: "text",
                content:
                  "Python's @dataclass decorator (Python 3.7+) provides a clean way to create classes that are mainly used to store data. It automatically generates __init__, __repr__, and __eq__ methods.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass Vendor:\n    name: str\n    country: str\n    products: List[str]\n\n# Usage\nv = Vendor('OffSec', 'US', ['OSCP', 'OSEP', 'OSED'])\nprint(v)          # Vendor(name='OffSec', country='US', ...)\nprint(v.name)     # 'OffSec'\nprint(v.products) # ['OSCP', 'OSEP', 'OSED']",
                  caption: "Listing 26 - Python dataclass",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What library do we need to import to work with data records using @dataclass?",
                answer: "dataclasses",
              },
              {
                question:
                  "What decorator do we use to create a data record specification?",
                answer: "@dataclass",
              },
            ],
          },
          {
            id: "s3-7-2",
            number: "3.7.2",
            title: "Working with XML",
            content: [
              {
                type: "text",
                content:
                  "XML (eXtensible Markup Language) is widely used for configuration files and data exchange. Python's xml.etree.ElementTree module lets us parse, navigate, and modify XML documents.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "import xml.etree.ElementTree as ET\n\n# Parse XML string\nxml_data = '''\n<Library>\n  <Composer>\n    <Name>Hildegard Von Bingen</Name>\n    <Nationality>German</Nationality>\n  </Composer>\n  <Composer>\n    <Name>Jaufre Rudel</Name>\n  </Composer>\n</Library>\n'''\n\nroot = ET.fromstring(xml_data)\nfor composer in root:\n    print(composer[0].text)",
                  caption: "Listing 27 - Parsing XML with ElementTree",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What module is used to parse XML in Python's standard library?",
                answer: "xml.etree.ElementTree",
              },
            ],
          },
          {
            id: "s3-7-3",
            number: "3.7.3",
            title: "Working with JSON",
            content: [
              {
                type: "text",
                content:
                  "JSON (JavaScript Object Notation) is used extensively in modern systems and cloud services. Python has a built-in json module for encoding and decoding JSON data as Python dictionaries.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "import json\n\n# Python dict to JSON string\ndata = {'composer': 'Hildegard', 'year': 1098}\njson_str = json.dumps(data, indent=2)\nprint(json_str)\n\n# JSON string to Python dict\nparsed = json.loads(json_str)\nprint(parsed['composer'])   # Hildegard\n\n# Read/write JSON files\nwith open('data.json', 'w') as f:\n    json.dump(data, f)\n\nwith open('data.json', 'r') as f:\n    loaded = json.load(f)",
                  caption: "Listing 28 - Working with JSON",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What data structure is ideally suited to loading JSON data?",
                answer: "Dictionary",
              },
              {
                question:
                  "What function serializes a Python dict to a JSON string?",
                answer: "json.dumps()",
              },
            ],
          },
          {
            id: "s3-7-4",
            number: "3.7.4",
            title: "SQLite Database Interaction",
            content: [
              {
                type: "text",
                content:
                  "SQLite is a lightweight, file-based relational database built into Python. The sqlite3 module requires no server installation and is perfect for storing structured data in scripts.",
              },
              {
                type: "code",
                codeBlock: {
                  code: "import sqlite3\n\n# Connect (creates file if not exists)\nconn = sqlite3.connect('data.db')\ncursor = conn.cursor()\n\n# Create table\ncursor.execute('''\nCREATE TABLE IF NOT EXISTS composers (\n    id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    nationality TEXT\n)\n''')\n\n# Insert data\ncursor.execute('INSERT INTO composers (name, nationality) VALUES (?, ?)',\n               ('Hildegard Von Bingen', 'German'))\n\nconn.commit()  # Write changes to disk\nconn.close()",
                  caption: "Listing 29 - SQLite database interaction",
                },
              },
            ],
            exercises: [
              {
                question:
                  "What connection function ensures any changes made to the database are written to disk?",
                answer: "conn.commit()",
              },
              {
                question:
                  "We define a dataclass called 'vendor'. What type of data object will this be?",
                answer: "A class instance (object)",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getAllSubsections(): Array<{
  module: Module;
  section: Section;
  subsection: Subsection;
}> {
  const result = [];
  for (const module of courseData) {
    for (const section of module.sections) {
      for (const subsection of section.subsections) {
        result.push({ module, section, subsection });
      }
    }
  }
  return result;
}

export function findSubsectionById(id: string): {
  module: Module;
  section: Section;
  subsection: Subsection;
} | null {
  for (const module of courseData) {
    for (const section of module.sections) {
      for (const subsection of section.subsections) {
        if (subsection.id === id) return { module, section, subsection };
      }
    }
  }
  return null;
}
