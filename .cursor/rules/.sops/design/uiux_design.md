---
description: 
globs: 
alwaysApply: false
---
Design Instruction Set for Cursor Agent



1) Apply a Style Type 

`Note for user: choose a style from the list: Minimalist, Neumorphic, Flat Design, Material Design, Glassmorphism, Skeuomorphic, Brutalist, Dark Mode, Light Mode `
  
Apply this style type and principles to all UI/UX design: **Flat Design (Dark Mode Focus)** 

2) Use the following libraries: **Shadcn UI**, **Radix UI**, and **Tailwind CSS**. Use **Lucide React** for icons, and **Toast** for notifications.

3) Colors should match the defined palette: 

### Dark Mode Theme (Primary Theme)
```css
--background: 215 28% 9%;        /* Dark bluish-gray background */
--foreground: 210 20% 98%;       /* Light text color with blue tint */
--card: 217 25% 12%;             /* Card background - slightly lighter than base */
--card-foreground: 210 20% 98%;  /* Card text color */
--popover: 217 25% 12%;          /* Popover background */
--popover-foreground: 210 20% 98%; /* Popover text */
--primary: 210 20% 98%;          /* Primary elements color (white with blue tint) */
--primary-foreground: 215 28% 9%; /* Text on primary elements */
--secondary: 217 19% 20%;        /* Secondary elements color (medium bluish-gray) */
--secondary-foreground: 210 20% 98%; /* Text on secondary elements */
--muted: 217 19% 20%;            /* Muted elements (subtle background) */
--muted-foreground: 210 15% 70%; /* Muted text color */
--accent: 217 19% 20%;           /* Accent elements */
--accent-foreground: 210 20% 98%; /* Text on accent elements */
--destructive: 0 62.8% 30.6%;    /* Destructive/error color (red) */
--destructive-foreground: 210 20% 98%; /* Text on destructive elements */
--border: 217 19% 20%;           /* Border color */
--input: 217 19% 20%;            /* Input field background */
--ring: 210 16% 83.1%;           /* Focus ring color */
```

### Light Mode Theme (Optional Alternative)
```css
--background: 0 0% 100%;         /* White background */
--foreground: 0 0% 3.9%;         /* Nearly black text */
--card: 0 0% 100%;               /* White card background */
--card-foreground: 0 0% 3.9%;    /* Dark text on cards */
--popover: 0 0% 100%;            /* White popover background */
--popover-foreground: 0 0% 3.9%; /* Dark text on popovers */
--primary: 0 0% 9%;              /* Dark gray primary */
--primary-foreground: 0 0% 98%;  /* Light text on primary */
--secondary: 0 0% 96.1%;         /* Light gray secondary */
--secondary-foreground: 0 0% 9%; /* Dark text on secondary */
--muted: 0 0% 96.1%;             /* Light gray muted */
--muted-foreground: 0 0% 45.1%;  /* Medium gray muted text */
--accent: 0 0% 96.1%;            /* Light gray accent */
--accent-foreground: 0 0% 9%;    /* Dark text on accent */
--destructive: 0 84.2% 60.2%;    /* Bright red destructive */
--destructive-foreground: 0 0% 98%; /* Light text on destructive */
--border: 0 0% 89.8%;            /* Light gray border */
--input: 0 0% 89.8%;             /* Light gray input */
--ring: 0 0% 3.9%;               /* Dark ring */
```

### Chart Colors (Data Visualization)
```css
/* Dark Mode */
--chart-1: 220 70% 50%;          /* Blue */
--chart-2: 160 60% 45%;          /* Green */
--chart-3: 30 80% 55%;           /* Orange */
--chart-4: 280 65% 60%;          /* Purple */
--chart-5: 340 75% 55%;          /* Pink */

/* Light Mode */
--chart-1: 12 76% 61%;           /* Red-Orange */
--chart-2: 173 58% 39%;          /* Teal */
--chart-3: 197 37% 24%;          /* Dark Blue */
--chart-4: 43 74% 66%;           /* Yellow */
--chart-5: 27 87% 67%;           /* Orange */
```

### Implementation Notes
- Default to dark mode theme for all designs
- Use HSL color values as defined in CSS variables
- Ensure sufficient contrast for accessibility (WCAG AA compliance)
- Apply consistent color usage: primary for main actions, secondary for alternative actions, destructive for delete/warning actions
- For interactive elements, implement hover and focus states with subtle variations

3) Follow Proper Content Hierarchy  

a) Organize the page into sections, rows, columns and objects.
- Use typographic structure to organize information:  
- H1: Page title, one per page (e.g., `text-2xl font-bold`)  
- H2: Section headings (e.g., `text-xl font-semibold`)  
- H3: Subsections/Card Titles (e.g., `text-lg font-semibold`)  
- Body Text: Minimum 16px font with proper line spacing (e.g., `text-base`, `text-sm` for secondary)  
- Captions/Notes: For footnotes or supporting info (e.g., `text-xs`, `text-gray-500`)  
- Use a standard sans-serif font (Tailwind default).

b) Break interfaces into reusable design components:  
- Buttons  
- Cards  
- Modals  
- Forms  
- Navigation bars  
- Footers  

Each component should follow the atomic design model: atoms, molecules, organisms, templates, pages t for headings and a separate one for body content 

4) Design Buttons Properly  
 
- Clearly styled for primary, secondary, and tertiary use  
- Sized for accessibility (at least 44px height)  
- Labeled with concise action words (e.g., Start Now, Download, Learn More)  
- Responsive to hover, focus, and click events  
- Visibly different from surrounding text  

5) Apply Spacing and Layout Best Practices  
Use a consistent spacing scale (**Tailwind's default scale (multiples of 4px): `p-1`, `p-2`, `p-4`, `m-2`, `m-4`, `m-6`, `gap-4`, `space-x-3`, etc.**)  
Margins separate sections  
Padding creates internal space  
Use a standard grid system (**Tailwind's responsive grid (`grid`, `grid-cols-*`, `md:grid-cols-*`)**)  
Maintain visual breathing room with sufficient whitespace  
Align components and maintain consistent spacing between them (**Use Flexbox/Grid utilities**)  

6) Ensure Responsiveness  
Design should adjust to various screen widths:  
Mobile: 375px  
Tablet: 768px  
Desktop: 1440px and 1920px  
Ultra-wide: 2560px or higher  
Ensure all content remains legible and components reflow properly 

7) Follow Core UI/UX Design Principles  

a) Ensure all designs follow foundational UI/UX laws and principles:  
- Consistency and Standards: Use familiar patterns and interface elements.  
- Visual Hierarchy: Use size, contrast, and spacing to guide attention.  
- Feedback Principle: Every user action should have a clear response.  
- Aesthetic-Usability Effect: Visually appealing interfaces are easier to use.  
- Fitts's Law: Make clickable elements large and easy to reach.  
- Hick's Law: Simplify user choices to speed up decisions.  
- Accessibility: Follow WCAG guidelines for contrast, navigation, and readability.  
- Responsiveness: Designs should work across mobile, tablet, and desktop.  
b) **Workspace Layout Principle:** Emulate Discord's three-column layout where applicable:
    - **Left Column:** Navigation / Channel List / Server List
    - **Center Column:** Main Content / Chat Area
    - **Right Column:** Contextual Information / Member List / Metadata

8) Use Component-Based Structure  

b) Also reference design systems such as:  
- Atomic Design  
- Google Material Design  
- Apple Human Interface Guidelines  
- Microsoft Fluent UI   

9) Include Motion and Microinteraction Guidelines  

If using animation:  
- Use subtle transitions (e.g., **Tailwind `transition-colors duration-200` for hover effects**)  
- Keep transitions under 300ms  
- Use natural easing (ease-in-out)  
- Avoid animating critical content  
- Only use motion to enhance usability, not to distract  