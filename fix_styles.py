import os
import re

replacements = {
    # BACKGROUNDS
    r"rgba\(\s*5\s*,\s*5\s*,\s*5\s*,\s*0\.85\s*\)": "var(--as-bg-primary)",
    r"rgba\(\s*5\s*,\s*5\s*,\s*5\s*,\s*0\.9\s*\)": "var(--as-bg-primary)",
    r"rgba\(\s*5\s*,\s*5\s*,\s*5\s*,\s*0\.95\s*\)": "var(--as-bg-primary)",
    r"rgba\(\s*5\s*,\s*5\s*,\s*5\s*,\s*0\.97\s*\)": "var(--as-bg-primary)",
    r"rgba\(\s*10\s*,\s*10\s*,\s*10\s*,\s*0\.70?\s*\)": "var(--as-bg-secondary)", # will match 0.7 and 0.70
    r"rgba\(\s*10\s*,\s*10\s*,\s*10\s*,\s*0\.60?\s*\)": "var(--as-bg-secondary)", # 0.6 and 0.60
    r"rgba\(\s*10\s*,\s*10\s*,\s*10\s*,\s*0\.50?\s*\)": "var(--as-bg-secondary)", # 0.50
    r"rgba\(\s*10\s*,\s*10\s*,\s*10\s*,\s*0\.80?\s*\)": "var(--as-bg-secondary)",
    r"#0a0a0a": "var(--as-bg-secondary)",
    r"#050505": "var(--as-bg-primary)",
    r"rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.40?\s*\)": "var(--as-bg-tertiary)",
    r"rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.60?\s*\)": "var(--as-bg-tertiary)",
    r"rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.80?\s*\)": "var(--as-bg-primary)",
    r"rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.92\s*\)": "var(--as-bg-primary)",
    r"rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.95\s*\)": "var(--as-navbar-bg)",

    # BORDERS
    r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.06\s*\)": "var(--as-border-primary)",
    r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.05\s*\)": "var(--as-border-primary)",
    r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.04\s*\)": "var(--as-border-secondary)",
    r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.02\s*\)": "var(--as-border-secondary)",
    r"rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.10\s*\)": "var(--as-border-primary)",
    r"#262626": "var(--as-border-divider)",
    r"#1a1a1a": "var(--as-border-divider)",

    # TEXT
    r"#e5e5e5": "var(--as-text-primary)",
    r"#a3a3a3": "var(--as-text-secondary)",
    r"#525252": "var(--as-text-tertiary)",
    r"#404040": "var(--as-text-dim)",
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    for pattern, repl in replacements.items():
        content = re.sub(pattern, repl, content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js') or file.endswith('.css'):
                process_file(os.path.join(root, file))
    
    # Also process root files if any
    if os.path.exists('src/AlphaShield.jsx'):
        process_file('src/AlphaShield.jsx')

if __name__ == '__main__':
    main()
