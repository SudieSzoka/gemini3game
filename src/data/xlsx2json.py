import pandas as pd
import json
import os

def convert_xlsx_to_json(input_file, output_file):
    try:
        # Read the Excel file
        # converters={1: str} forces the second column (index 1) to be read as string
        # This preserves leading zeros or other text formatting for that column
        df = pd.read_excel(input_file, converters={1: str})
        
        # Convert to a list of dictionaries (JSON array)
        # orient='records' creates a list of objects: [{col1: val1, col2: val2}, ...]
        json_data = df.to_dict(orient='records')
        
        # Save to JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=4)
            
        print(f"Successfully converted '{input_file}' to '{output_file}'.")
        print(f"Total records: {len(json_data)}")
        if len(json_data) > 0:
            print("First record sample:")
            print(json.dumps(json_data[0], ensure_ascii=False, indent=4))
            
    except Exception as e:
        print(f"Error converting file: {e}")

if __name__ == "__main__":
    # Files are in the same directory as the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "Gemini3Game.xlsx")
    output_path = os.path.join(script_dir, "Gemini3Game.json")
    
    if os.path.exists(input_path):
        convert_xlsx_to_json(input_path, output_path)
    else:
        print(f"File not found: {input_path}")
