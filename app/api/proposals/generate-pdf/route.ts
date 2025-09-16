import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || 'demo'
    
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set viewport for A4
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 1
    })
    
    // Navigate to the print preview page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const previewUrl = `${baseUrl}/proposals/${id}/print-preview`
    
    await page.goto(previewUrl, {
      waitUntil: 'networkidle0'
    })
    
    // Wait for the PDF to be ready
    await page.waitForFunction(() => {
      return typeof window !== 'undefined' && window.__pdfReady === true
    }, { timeout: 10000 })
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    })
    
    await browser.close()
    
    // Return PDF as response
    return new NextResponse(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="deyor-proposal-${id}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
