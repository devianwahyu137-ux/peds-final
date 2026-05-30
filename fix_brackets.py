import os
import re

DIR = '/Users/devianwahyu/Final Project/src'

for root, _, files in os.walk(DIR):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
                
            original_content = content
            
            # Find and print potential bracket headers
            matches = re.finditer(r'\[\s*(<[A-Za-z]+[^>]*>)\s*\]\s*([A-Za-z_ ]+)', content)
            for m in matches:
                print(f"File: {file} -> Match: {m.group(0)}")
                
            # Also find raw emojis
            matches_emojis = re.finditer(r'[🔥🔗🏢🪙🔧]', content)
            for m in matches_emojis:
                print(f"File: {file} -> Emoji: {m.group(0)}")

