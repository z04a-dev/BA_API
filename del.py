import os

import argparse
parser = argparse.ArgumentParser(description='delete script')
parser.add_argument('library', type=str, help='Library name') 
args = parser.parse_args()

if os.path.exists("resultzip/" + args.library + "_library.zip"):
  os.remove("resultzip/" + args.library + "_library.zip")
else:
    print("ERR: failed to delete zip file")
    
if os.path.exists("res/" + args.library + ".zip"):
  os.remove("res/" + args.library + ".zip")
else:
    print("ERR: failed to delete zip file")
