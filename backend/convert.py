import sys
import os
import time
import subprocess
import uno
from com.sun.star.beans import PropertyValue

def convert():
    if len(sys.argv) < 3:
        print("Usage: python3 convert.py <input.xlsx> <output.pdf>")
        sys.exit(1)

    input_file = os.path.abspath(sys.argv[1])
    output_file = os.path.abspath(sys.argv[2])
    
    # Start LibreOffice in listener mode
    cmd = [
        "soffice", "--headless", "--invisible", "--nocrashreport", "--nodefault", "--nologo",
        "--nofirststartwizard", "--norestore",
        "--accept=socket,host=127.0.0.1,port=2002,tcpNoDelay=1;urp;StarOffice.ComponentContext"
    ]
    p = subprocess.Popen(cmd)
    
    ctx = None
    for i in range(15):
        try:
            localContext = uno.getComponentContext()
            resolver = localContext.ServiceManager.createInstanceWithContext(
                "com.sun.star.bridge.UnoUrlResolver", localContext)
            ctx = resolver.resolve("uno:socket,host=127.0.0.1,port=2002,tcpNoDelay=1;urp;StarOffice.ComponentContext")
            break
        except Exception:
            time.sleep(0.5)
            
    if not ctx:
        p.terminate()
        print("Error: Failed to connect to LibreOffice")
        sys.exit(1)
        
    try:
        desktop = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
        
        url = uno.systemPathToFileUrl(input_file)
        props = (PropertyValue("Hidden", 0, True, 0),)
        
        # Open document
        doc = desktop.loadComponentFromURL(url, "_blank", 0, props)
        
        # The crucial step: Force Excel formulas to execute
        doc.calculateAll()
        
        # Export to PDF
        out_url = uno.systemPathToFileUrl(output_file)
        save_props = (PropertyValue("FilterName", 0, "calc_pdf_Export", 0),)
        doc.storeToURL(out_url, save_props)
        
        doc.close(True)
    finally:
        p.terminate()
        p.wait()

if __name__ == "__main__":
    convert()
