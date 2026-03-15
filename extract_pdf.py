from pdfminer.high_level import extract_text
import sys

try:
    text = extract_text('1CR24MC085.pdf')
    with open('pdf_content.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Text extracted to pdf_content.txt")
except Exception as e:
    print(f"Error: {e}")
