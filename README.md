# JavaHeader

A tool for visualizing your Java code structure via generated C header files and seamlessly adding methods/classes to your code.

## Features
- Generate a C Header file out of your java code (Test.java -> Test.h)
- Automatically update your header file while you're coding
- Add new methods and classes to your Java code through the generated header file

## Usage
### Run:

1. You need to have [NodeJS](https://nodejs.org) installed.
  
2. Clone the GitHub Repo.
  
3. Open the "JavaHeader" folder and run "index.js" in your terminal with specified path to your Java code:<br>
    ```console
    node index.js <PathToYourCode>
    ```
    *(absolute and relative paths are supported)*<br>
  
4. The Java header file will be created in the specified path.

5. Update your Java code (save) and the header file will also be updated.

### Testing (optional):
*Test.java* is provided in the repo to test the script:
Run with: `node index.js .\Test.java` and *Test.h* should be created.

### Add to header:
Add your method/class signature to the header file with standard Java Syntax.<br>

Example Header file:<br>
```C
public class Main {
	public static void main(String[] args);
	void test(int a);
}
```
#### ❗*Only the addition of methods/classes is allowed. If you try to delete something, the script will revert it!* ❗

Save the header file and your new method/class signature will be added automatically to your code.

Resulting Java file:<br>
```Java
public class Main {
	public static void main(String[] args){}
	void test(int a){}
}
```

### Nesting
Nested methods and classes are supported as well. Make sure to put to put *{ }* around.

Example nested header file:<br>
```C
public class Main {
	public static void main(String[] args){
    class Test {
      void test(int a);
    }
  }
}
```
Resulting Java file:<br>
```Java
public class Main {
  public static void main(String[] args){
    class Test {
      void test(int a){}
    }
  }
}
```

## Contributing
Contributions to JavaHeader are welcomed! Feel free to submit bug reports, feature requests, or pull requests to help improve the tool.
