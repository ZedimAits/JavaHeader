# JavaHeader

JavaHeader is a tool designed to help you visualize your Java code structure by generating C header files. It simplifies the process of navigating complex Java codebases by focusing on methods, classes, and structure.

## What's New in Version 2.0
- **Enhanced Java Code Parser**: Now capable of parsing and displaying almost any Java code with improved accuracy, thanks to [ANTLR4](https://github.com/antlr/antlr4).
- **Robust Structure Display**: Better handling of nested structures, ensuring a clear and precise header file output.

## Features
- Generate a C Header file from your Java code (`Test.java` -> `Test.h`).
- Automatically update the header file as you code.
- Support for nested methods and classes.

## Usage
### Run:

1. Clone the GitHub repository.
2. Navigate to the "JavaHeader" folder.
3. Install the necessary dependencies using:
    ```bash
    npm install
    ```
3. Run the script using `node` with the path to your Java file:
    ```bash
    node index.js <PathToYourCode>
    ```

4. The corresponding header file will be created in the specified directory.
5. Edit and save your Java code; the header file will update automatically.


### Example Run
For example, with `Test.java` provided in the repository:
```bash
node index.js ./Test.java
```
This will generate a Test.h file in the same directory.

## Example

<details>
  <summary markdown="span"><b>Test.java</b></summary>

  ```java
  // Class with Constructor and Methods
class Test {
    private int value;

    public Test(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }
}

// Nested Classes
class Nested {
    private static final String MESSAGE = "Outer class message";

    public static class NestedStaticClass {
        public void printMessage() {
            System.out.println(MESSAGE);
        }
    }

    public class InnerClass {
        public void display() {
            System.out.println("Inner class method.");
        }
    }
}

enum Status {
    ACTIVE, INACTIVE
}

@interface StatusInfo {
    Status value();
}

@StatusInfo(Status.ACTIVE)
class AnnotatedClass {
    Runnable runnable = new Runnable() {
        @Override
        public void run() {
            System.out.println("Anonymous class example.");
        }
    };
}
```
</details>

<details>
  <summary markdown="span"><b>Test.h</b></summary>

  ```java
  class Test {
	public Test (int value);
	public int getValue ();
	public void setValue (int value);
}
class Nested {
	public static class NestedStaticClass {
		public void printMessage ();
	}
	public class InnerClass {
		public void display ();
	}
}
enum Status {
	ACTIVE, INACTIVE
}
@interface StatusInfo {
	Status value ();
}
@StatusInfo(Status.ACTIVE)
class AnnotatedClass {
}
```
</details>

## Contributing
Contributions to JavaHeader are welcomed! Feel free to submit bug reports, feature requests, or pull requests to help improve the tool.
