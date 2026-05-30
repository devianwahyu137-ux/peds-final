import os
import re

DIR = '/Users/devianwahyu/Final Project/src'
for root, _, files in os.walk(DIR):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()

            matches = re.finditer(r'<h3[^>]*>.*?</h3>', content, flags=re.DOTALL)
            for m in matches:
                tag = m.group(0)
                if '[' in tag and ']' in tag:
                    print(f"File: {file} -> Header: {tag}")
