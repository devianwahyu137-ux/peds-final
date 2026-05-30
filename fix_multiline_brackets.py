import os
import re

DIR = '/Users/devianwahyu/Final Project/src'
for root, _, files in os.walk(DIR):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()

            orig = content
            
            # Add Flame to imports if used
            if '<Flame' in content and 'lucide-react' in content and 'Flame,' not in content:
                content = content.replace('import { Landmark', 'import { Flame, Landmark')

            # Find multiline bracket [ <Icon /> ] Title
            # Regex to match: [ \n <Icon ... /> \n ] Title
            # We'll use a more general replacement. Let's just find '[' and ']' that wrap an icon.
            content = re.sub(r'\[\s*(<[A-Za-z]+[^>]*>)\s*\]\s*([^<]+)', r'\1 \2', content, flags=re.MULTILINE)
            
            # Also find stray '[' and ']' around headers, e.g.
            # [
            #   <TrendingUp />
            # ]
            # TITLE
            # Let's do this:
            # 1. find `[` 
            # 2. find `<Icon ...>`
            # 3. find `]`
            # 4. find `Title`
            # Wait, easier to just manually view files or use a broad regex
            content = re.sub(r'\[\s*\n\s*(<[A-Za-z]+[^>]*>)\s*\n\s*\]', r'\1', content)

            if content != orig:
                with open(path, 'w') as f:
                    f.write(content)
                print(f"Fixed {file}")
