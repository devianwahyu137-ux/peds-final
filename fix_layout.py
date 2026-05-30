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

            # Fix headers with [<Icon />] TITLE
            # Example: <h3 className="text-sm font-bold ...">[ <Icon /> ] TITLE</h3>
            # We want to add " flex flex-row items-center gap-2" to the className, and remove the brackets.
            
            def replace_header(match):
                class_attr = match.group(1)
                icon = match.group(2)
                title = match.group(3)
                
                # Check if flex is already there
                if 'flex' not in class_attr:
                    new_class = class_attr.replace('className="', 'className="flex flex-row items-center gap-2 ')
                else:
                    new_class = class_attr
                    
                return f"{new_class}>{icon} {title.strip()}"

            # Regex: (className="[^"]*")\s*>\s*\[\s*(<[A-Za-z]+[^>]*>)\s*\]\s*([^<]+)
            content = re.sub(r'(className="[^"]*")\s*>\s*\[\s*(<[A-Za-z]+[^>]*>)\s*\]\s*([^<]+)', replace_header, content)

            # Fix Execution Ticket: [&gt;] EXECUTION TICKET
            # Wait, user said "if there are ANY native emojis left ... like generic chain link... replace them"
            # Execution ticket is [&gt;]. We should replace it with <ArrowRight /> or similar, or just remove brackets.
            if '[&gt;] EXECUTION TICKET' in content:
                content = content.replace('[&gt;] EXECUTION TICKET', '<ArrowRight size={16} className="text-slate-400" /> EXECUTION TICKET')

            # Replace 🔥 with Flame
            if '🔥' in content:
                content = content.replace('🔥', '<Flame size={16} className="text-red-500" />')
                if 'Flame' not in content and 'lucide-react' in content:
                    content = content.replace('import {', 'import { Flame,')
            
            if '🚨' in content:
                content = content.replace('🚨', '<AlertTriangle size={16} className="text-amber-500" />')

            # Look for other text emojis wrapped in brackets
            # Like [ 🚨 RUPIAH CRASH ] in AlphaShield or MarketPage.
            # Actually, `[ <AlertTriangle... /> RUPIAH CRASH ]`
            content = re.sub(r'\[\s*(<[A-Za-z]+[^>]*>)\s+([^\]]+)\]', r'\1 \2', content)

            if content != orig:
                with open(path, 'w') as f:
                    f.write(content)
                print(f"Fixed {file}")

