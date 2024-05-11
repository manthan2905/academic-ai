import { NextRequest, NextResponse } from "next/server";
import path from 'path';
import fs from 'fs';


export async function GET(req: NextRequest) { 
    try {
        // Define the directory path
        const directoryPath = path.join(process.cwd(), 'data');
    
        // Read the contents of the directory
        const files = fs.readdirSync(directoryPath);
    
        // Filter PDF files
        const pdfFiles = files.filter((file) => file.endsWith('.pdf'));
    
        // Send only the names of PDF files as the response
        return NextResponse.json(pdfFiles);
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
      }
    

}
