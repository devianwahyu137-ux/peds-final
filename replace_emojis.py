import os
import re

DIR = '/Users/devianwahyu/Final Project/src'

LUCIDE_IMPORT = 'import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";\n'

EMOJI_MAP = {
    '🏦': '<Landmark size={16} className="text-indigo-400" />',
    '🏛️': '<Landmark size={16} className="text-indigo-400" />',
    '📈': '<TrendingUp size={16} className="text-emerald-400" />',
    '📊': '<LineChart size={16} className="text-blue-400" />',
    '🪙': '<Coins size={16} className="text-amber-400" />',
    '🥇': '<Coins size={16} className="text-amber-400" />',
    '💵': '<Wallet size={16} className="text-emerald-400" />',
    '💰': '<Wallet size={16} className="text-emerald-400" />',
    '🚨': '<AlertTriangle size={16} className="text-amber-500" />',
    '⚠️': '<AlertTriangle size={16} className="text-amber-500" />',
    '⚠': '<AlertTriangle size={16} className="text-amber-500" />',
    '📉': '<TrendingDown size={16} className="text-red-400" />',
    '🚀': '<TrendingUp size={16} className="text-emerald-400" />',
    '🛠️': '<Settings2 size={16} className="text-slate-400" />',
    '🎲': '<Dices size={16} className="text-slate-400" />',
    '🛡️': '<Shield size={16} className="text-blue-400" />',
    '〰️': '<Activity size={16} className="text-slate-400" />',
    '➡️': '<ArrowRight size={16} className="text-slate-400" />',
    '⚖️': '<ActivitySquare size={16} className="text-slate-400" />',
}

files_to_modify = []
for root, _, files in os.walk(DIR):
    for file in files:
        if file.endswith('.jsx'):
            files_to_modify.append(os.path.join(root, file))

for path in files_to_modify:
    with open(path, 'r') as f:
        content = f.read()

    original_content = content
    has_emoji = False

    for emoji, comp in EMOJI_MAP.items():
        if emoji in content:
            has_emoji = True
            # Replace quoted emojis first
            content = re.sub(f'["\']{re.escape(emoji)}["\']', comp, content)
            # Replace remaining unquoted emojis
            # Wait, if an emoji is in JSX text, replacing it with a component is valid.
            # But what if it's inside a template literal like `[ 🚨 RUPIAH CRASH ]`? 
            # If it's inside a template literal (backticks), we need to inject it as JSX. 
            # Wait, JSX components can't just be inside string template literals! 
            # E.g., `transition-all ${...} [ 🚨 RUPIAH CRASH ]` - this is from AlphaShield.jsx:
            # `<button ... className={`...`}>[ 🚨 RUPIAH CRASH ]</button>`
            # The backticks are for className, but the `[ 🚨 RUPIAH CRASH ]` is outside the backticks!
            # So `> [ 🚨 RUPIAH CRASH ] </button>` -> `> [ {<AlertTriangle... />} RUPIAH CRASH ] </button>`
            
            # To be completely safe with unquoted emojis in JSX text:
            # We should wrap it in curly braces if it's inside a raw JSX block, but simple replace might work if it's just raw text.
            # Wait, in React, `<button> <AlertTriangle /> TEXT </button>` is valid. We don't need curly braces around elements unless they are in an array or inside props.
            
            content = content.replace(emoji, comp)

    if has_emoji:
        # Avoid duplicate imports
        if "lucide-react" not in content:
            # Add after first import
            parts = content.split(';\n', 1)
            if len(parts) > 1 and 'import' in parts[0]:
                content = parts[0] + ';\n' + LUCIDE_IMPORT + parts[1]
            else:
                content = LUCIDE_IMPORT + content
        else:
            # Update existing import. This is tricky. Let's just append our specific icons to the existing import.
            # Actually, simpler: just add another import. Vite handles multiple imports from same package fine.
            content = LUCIDE_IMPORT + content

        with open(path, 'w') as f:
            f.write(content)
        print(f"Updated {path}")

