# Logic Intelligence Technologies PDF System

This package creates three company PDFs using a fixed document design system based on the supplied reference PDF.

## Install

```bash
python -m pip install -r requirements.txt
```

## Fonts

Place the approved font files in `fonts/`:

- Poppins-Regular.ttf
- Poppins-Medium.ttf
- Poppins-Bold.ttf
- Poppins-Italic.ttf
- Lora-Regular.ttf
- Lora-Italic.ttf

The generator intentionally stops if these fonts are missing.

## Generate

```bash
python run.py
```

The three PDFs are written to `output/`.
