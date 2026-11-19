import Foundation
import PDFKit
import Vision
import AppKit

func stop(_ reason: String) -> Never {
  fputs("Source PDF extraction: \(reason)\n", stderr)
  exit(1)
}
func arabicCoverage(_ value: String) -> (Int, Double) {
  let letters = value.unicodeScalars.filter { CharacterSet.letters.contains($0) }
  let arabic = letters.filter { (0x0600...0x06FF).contains($0.value) || (0x0750...0x077F).contains($0.value) || (0x08A0...0x08FF).contains($0.value) }.count
  return (arabic, letters.isEmpty ? 0 : Double(arabic) / Double(letters.count))
}
func reliableArabic(_ value: String) -> Bool {
  let (count, share) = arabicCoverage(value)
  return count >= 35 && share >= 0.30
}
func recognizeArabic(_ page: PDFPage) throws -> String {
  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  request.usesLanguageCorrection = false
  let supported = try request.supportedRecognitionLanguages()
  guard let language = supported.first(where: { $0.lowercased().hasPrefix("ar-") || $0 == "ar" }) else {
    stop("Apple Vision on this Mac does not advertise Arabic OCR; do not trust garbled PDFKit text")
  }
  request.recognitionLanguages = [language]
  let thumb = page.thumbnail(of: CGSize(width: 1900, height: 2600), for: .mediaBox)
  var rect = CGRect(origin: .zero, size: thumb.size)
  guard let image = thumb.cgImage(forProposedRect: &rect, context: nil, hints: nil) else {
    stop("Could not render the PDF page for OCR")
  }
  let handler = VNImageRequestHandler(cgImage: image, options: [:])
  try handler.perform([request])
  let observations = request.results ?? []
  let sorted = observations.sorted {
    if abs($0.boundingBox.midY - $1.boundingBox.midY) > 0.014 {
      return $0.boundingBox.midY > $1.boundingBox.midY
    }
    return $0.boundingBox.midX > $1.boundingBox.midX
  }
  return sorted.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
}

let args = CommandLine.arguments
guard args.count == 5 else { stop("expected PDF path, first page, last page, output JSON path") }
guard let first = Int(args[2]), let last = Int(args[3]), first > 0, last >= first, last - first <= 3 else {
  stop("only one to four physical pages may be extracted per request")
}
guard let pdf = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  stop("PDFKit could not open the canonical source")
}
guard last <= pdf.pageCount else { stop("requested page outside canonical PDF") }
var entries: [[String: Any]] = []
for number in first...last {
  guard let page = pdf.page(at: number - 1) else { stop("page missing: \(number)") }
  let direct = page.string ?? ""
  let method: String
  let text: String
  if reliableArabic(direct) {
    method = "pdfkit"
    text = direct
  } else {
    method = "vision_ocr"
    do { text = try recognizeArabic(page) } catch { stop("Vision Arabic OCR failed at page \(number): \(error)") }
    if !reliableArabic(text) {
      let (count, share) = arabicCoverage(text)
      stop("OCR page \(number) still lacks credible Arabic (\(count) letters, share \(share)); require human source inspection")
    }
  }
  entries.append(["physical_page":number, "text":text, "extraction_method":method])
}
let payload: [String: Any] = ["physical_page_count":pdf.pageCount,"pages":entries]
do {
  let data = try JSONSerialization.data(withJSONObject:payload,options:[.sortedKeys])
  try data.write(to:URL(fileURLWithPath:args[4]),options:.atomic)
} catch {
  stop("unable to serialize extracted source pages: \(error)")
}
