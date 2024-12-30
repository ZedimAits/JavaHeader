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