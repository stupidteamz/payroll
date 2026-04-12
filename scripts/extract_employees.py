import pandas as pd
import json
import os

def parse_payroll_file(file_path):
    # Load all sheets to handle potential multi-sheet files, though assuming single sheet based on preview
    xl = pd.ExcelFile(file_path)
    employees = []
    
    # Process each sheet
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name)
        
        # We need a robust way to identify employee blocks. 
        # Based on preview, employee name is in a row with "ชื่อพนักงาน :"
        # Let's iterate and look for that pattern.
        
        # This is a heuristic based on the structure seen.
        # We will look for rows containing 'ชื่อพนักงาน'
        
        # Simplify data for now to just extract name, position, account, bank
        # Based on preview: 
        # Row with 'ชื่อพนักงาน :' has name in col index 3 (Unnamed: 3)
        # Row with 'ตำแหน่ง :' has position in col index 3
        # Row with 'หมายเลขบัญชี :' has account in col index 8
        # Row with 'ชื่อธนาคาร :' has bank in col index 8
        
        # Converting df to list of dicts for easier indexing
        data = df.to_dict('records')
        
        current_emp = None
        
        for row in data:
            # Check for Name
            if row.get('Unnamed: 1') == 'ชื่อพนักงาน :':
                current_emp = {
                    'thaiName': str(row.get('Unnamed: 3', '')),
                    'position': '',
                    'bankAccountNumber': '',
                    'bankName': '',
                    'salary': 0
                }
                employees.append(current_emp)
            
            # Check for Position
            if current_emp and row.get('Unnamed: 1') == 'ตำแหน่ง :':
                current_emp['position'] = str(row.get('Unnamed: 3', ''))
                
            # Check for Account
            if current_emp and row.get('Unnamed: 7') == 'หมายเลขบัญชี :':
                current_emp['bankAccountNumber'] = str(row.get('Unnamed: 8', ''))
                
            # Check for Bank
            if current_emp and row.get('Unnamed: 7') == 'ชื่อธนาคาร :':
                current_emp['bankName'] = str(row.get('Unnamed: 8', ''))
                
            # Check for Salary (This is harder, needs to look for "เงินเดือน")
            # Example: 'เงินเดือน ( 200 ) ชั่วโมง' -> 12000.0 is at Unnamed: 5
            if current_emp and isinstance(row.get('Unnamed: 1'), str) and 'เงินเดือน' in row.get('Unnamed: 1'):
                 val = row.get('Unnamed: 5')
                 if isinstance(val, (int, float)):
                     current_emp['salary'] = float(val)

    return employees

# File path
file_path = 'D:/work/3.เงินเดือน ( วันที่ 01-31 มี.ค.-69 ) Rev.2.xlsx'
parsed_data = parse_payroll_file(file_path)

# Save to file
with open('d:/gemini-bot-payroll-system/employees_data.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_data, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(parsed_data)} employees to employees_data.json")
