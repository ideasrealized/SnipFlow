---
description: 
globs: 
alwaysApply: false
---
---
description: UI/UX design principles and accessibility best practices.
globs: 
alwaysApply: false
---
# GUI Development Best Practices

## 1. Framework-Agnostic Design Principles

### Core Requirements
- Ensure separation of concerns using the **Model-View-Controller (MVC)** pattern.
- Keep UI logic separate from business logic for maintainability.
- Design components to be **adaptable to multiple GUI frameworks**.
- Follow platform-specific guidelines when applicable.

### Example: MVC Pattern Implementation
```python
class Model:
    """Handles data and application state."""
    def __init__(self):
        self.data = "Hello, World!"

class View:
    """Handles UI layout and rendering."""
    def __init__(self, framework):
        self.framework = framework
        self.label = None

    def display_text(self, text):
        if self.framework == "tkinter":
            import tkinter as tk
            root = tk.Tk()
            self.label = tk.Label(root, text=text)
            self.label.pack()
            root.mainloop()
        elif self.framework == "qt":
            from PyQt5.QtWidgets import QApplication, QLabel
            import sys
            app = QApplication(sys.argv)
            label = QLabel(text)
            label.show()
            sys.exit(app.exec_())

class Controller:
    """Manages interactions between the model and view."""
    def __init__(self, model, view):
        self.model = model
        self.view = view

    def update_view(self):
        self.view.display_text(self.model.data)

# Usage
model = Model()
view = View("tkinter")  # Change to "qt" for PyQt5
controller = Controller(model, view)
controller.update_view()
```

## 2. Component Organization & Directory Structure
```plaintext
gui/
├── components/     # UI components
├── utils/         # UI utilities
├── styles/        # Theme and style definitions
└── assets/        # Images and resources
```

## 3. User Experience (UX) Guidelines

### Design Standards
- Provide clear user feedback (e.g., tooltips, status bars, confirmation dialogs).
- Ensure a **responsive UI** that adapts to different screen sizes.
- Implement proper **error handling** with clear user messages.
- Optimize layouts for **visual hierarchy and usability**.

### Layout Best Practices
- Use `grid()` over `pack()` for complex layouts in Tkinter.
- Use **consistent widget spacing** for better readability.
- Group related UI elements together.

### Example: Using Grid Layout
```python
frame = ttk.Frame(root)
frame.grid(column=0, row=0, padx=10, pady=10)

ttk.Label(frame, text="Username:").grid(column=0, row=0, sticky="w")
username_entry = ttk.Entry(frame)
username_entry.grid(column=1, row=0, padx=5, pady=5)
```

## 4. Threading for Performance

### Issue
- Running long tasks on the **main UI thread** freezes the interface.
- Always run **background tasks** in a separate thread while updating the UI.

### Example: Running Tasks in a Separate Thread
```python
import threading
import tkinter as tk

def run_task_in_thread(task, callback):
    """Runs a function in a separate thread and updates UI on completion."""
    def wrapper():
        result = task()
        root.after(0, callback, result)
    thread = threading.Thread(target=wrapper)
    thread.start()

def long_running_task():
    import time
    time.sleep(3)
    return "Task Completed"

def update_ui(result):
    label.config(text=result)

root = tk.Tk()
label = tk.Label(root, text="Starting task...")
label.pack()
button = tk.Button(root, text="Run Task", command=lambda: run_task_in_thread(long_running_task, update_ui))
button.pack()
root.mainloop()
```

## 5. Accessibility Standards

### Requirements
- Include **keyboard shortcuts** and **tooltips**.
- Provide support for **high DPI displays**.
- Follow **WCAG (Web Content Accessibility Guidelines)** for color contrast.

### Example: Adding Keyboard Shortcuts
```python
button = ttk.Button(parent, text="Save")
button.bind('<Return>', lambda e: button.invoke())
```

## 6. State Management Best Practices

### Principles
- Use framework-specific state management features (`StringVar` in Tkinter, signals in PyQt).
- Implement **undo/redo** support for user actions.
- Maintain **consistent state** across components.

### Example: Using a State Variable
```python
class Component:
    def __init__(self):
        self.state = tk.StringVar()
        self.state.trace_add('write', self._on_state_change)

    def _on_state_change(self, *args):
        print("State updated to:", self.state.get())
```

## 7. Error Handling

### Best Practices
- Display **friendly messages** instead of generic errors.
- Log UI errors for **debugging purposes**.
- Implement **fallback states** when an operation fails.

### Example: Using Message Boxes for Errors
```python
from tkinter import messagebox

def show_error(message):
    messagebox.showerror("Error", message)
```

## 8. Theming for Modern UI

### Best Practices
- Use **theming libraries** (`ttk.Style()` for Tkinter, `QStyle` for PyQt).
- Follow **consistent font styles and sizes**.
- Apply **light/dark mode** support.

### Example: Applying a Custom Theme
```python
style = ttk.Style()
style.configure("TButton", font=("Arial", 12), padding=6)
```

## 9. Testing Requirements

### Categories
- **UI flow tests** (navigating between screens)
- **Resolution testing** (different screen sizes)
- **Widget interaction tests**
- **Accessibility testing**
- **State change tests**

### Example: Testing Button State
```python
def test_button_state():
    button = ttk.Button(root)
    assert button['state'] == 'normal'
    button['state'] = 'disabled'
    assert button['state'] == 'disabled'
```

## 10. Documentation Standards

### Required Documentation
- Widget hierarchies
- State management strategies
- Event bindings
- Component interfaces

### Example: Documenting a Custom Widget
```python
class CustomWidget(ttk.Frame):
    """
    A custom widget for displaying financial data.
    
    Attributes:
        data_var (tk.StringVar): Bound data variable
        state (str): Current widget state
    
    Events:
        <<ValueChanged>>: Fired when data changes
        <<StateChanged>>: Fired when state changes
    """
```

## 11. Best Practices Summary
- **Use MVC architecture** to separate concerns.
- **Ensure UI responsiveness** by handling long tasks in background threads.
- **Follow accessibility guidelines** for inclusivity.
- **Apply theming and styling** for modern UI.
- **Optimize layouts** with `grid()` over `pack()` where applicable.
- **Use error handling best practices** to enhance user experience.
- **Write unit tests** for UI interactions and state changes.
- **Document component structure and behaviors** for maintainability.

By following these guidelines, your GUI applications will be maintainable, performant, and platform-agnostic.

