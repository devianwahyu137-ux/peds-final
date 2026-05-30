import os
import re

TARGET_DIRS = ["src/components", "src/pages"]

REPLACEMENTS = {
    # Backgrounds - Panels/Cards
    r'\bbg-black(/[\d]+)?\b(?!\s*dark:)': r'bg-slate-50 dark:bg-black\1',
    r'\bbg-neutral-900(/[\d]+)?\b(?!\s*dark:)': r'bg-white dark:bg-neutral-900\1',
    r'\bbg-neutral-950(/[\d]+)?\b(?!\s*dark:)': r'bg-slate-50 dark:bg-neutral-950\1',
    r'\bbg-\[\#121212\](/[\d]+)?\b(?!\s*dark:)': r'bg-white dark:bg-[#121212]\1',
    
    # Texts
    r'\btext-white\b(?!\s*dark:)': r'text-slate-900 dark:text-white',
    r'\btext-neutral-100\b(?!\s*dark:)': r'text-slate-900 dark:text-neutral-100',
    r'\btext-neutral-200\b(?!\s*dark:)': r'text-slate-800 dark:text-neutral-200',
    r'\btext-neutral-300\b(?!\s*dark:)': r'text-slate-700 dark:text-neutral-300',
    r'\btext-neutral-400\b(?!\s*dark:)': r'text-slate-500 dark:text-neutral-400',
    r'\btext-neutral-500\b(?!\s*dark:)': r'text-slate-400 dark:text-neutral-500',
    r'\btext-gray-400\b(?!\s*dark:)': r'text-slate-500 dark:text-neutral-400',
    
    # Borders
    r'\bborder-neutral-800(/[\d]+)?\b(?!\s*dark:)': r'border-slate-300 dark:border-neutral-800\1',
    r'\bborder-neutral-900(/[\d]+)?\b(?!\s*dark:)': r'border-slate-200 dark:border-neutral-900\1',
    r'\bborder-\[\#222\](/[\d]+)?\b(?!\s*dark:)': r'border-slate-200 dark:border-[#222]\1',
}

def process_file(filepath):
    # Read file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # We only want to replace inside className="..." or className={...}
    # But since it's React, it might be easier to just replace everywhere, except for things that are clearly not tailwind classes.
    # Given the specificity of \bbg-black\b etc., it's relatively safe.
    
    for pattern, replacement in REPLACEMENTS.items():
        # A bit of a hack: if we see "dark:bg-black", we don't want to replace "bg-black" inside it.
        # The negative lookahead (?!\s*dark:) in the regex doesn't work for prefix. We need negative lookbehind.
        # Modified pattern: add negative lookbehind for "dark:"
        safe_pattern = r'(?<!dark:)' + pattern
        content = re.sub(safe_pattern, replacement, content)

    # Clean up double darks if they happen:
    content = re.sub(r'dark:dark:', 'dark:', content)
    # Clean up cases where we accidentally duplicate bg-slate-50 (like bg-slate-50 bg-slate-50)
    # (Optional, tailwind handles duplicates fine, but let's keep code clean)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for d in TARGET_DIRS:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.jsx'):
                process_file(os.path.join(root, file))

print("Done.")
