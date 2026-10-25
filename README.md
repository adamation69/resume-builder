# Resume Builder Website

A responsive resume-builder website built with plain HTML, CSS, and JavaScript. No build tools or installation are required.

## Features

- Modern, responsive interface
- A4 resume preview and print-to-PDF workflow
- Ten layouts: Modern, Classic, Professional, Elegant, Minimal, Executive, Compact, Sidebar, Timeline, Monochrome, and No Experience
- Editable personal details, work experience, education, skills, and languages
- Optional profile photo upload with centered cropping and adjustable size and shape
- Live preview updates as you edit
- PDF resume import with local text extraction and OCR for scanned PDFs
- Adjustable resume font size, font weight, and template color palettes
- Works locally in a modern browser

## Run the project

1. Extract the ZIP file.
2. Open `index.html` in Chrome, Firefox, Edge, or Safari.
3. Fill out the resume fields and choose a template.
4. Click **Save as PDF**.
5. In the print dialog, choose **Save as PDF** and set the paper size to **A4**. Enable background graphics if you want the template colors included.

## Project files

- `index.html` — page structure
- `styles.css` — responsive styling and print rules
- `app.js` — form behavior, template switching, photo upload, and live preview

## Notes

This is a front-end-only starter project. Resume information is held in browser memory and is not sent to a server. Refreshing the page resets the sample data. For production use, consider adding save/load functionality, form validation, and automated PDF generation.

PDF resume import runs in the browser. It accepts PDF files only; text extraction and OCR may load PDF.js and Tesseract.js from their CDNs when needed. The selected resume file is not uploaded.
