// Read-only native source witness on macOS. Never OCR or count pages as translated.
// Usage: swift pdfkit-source.swift ABSOLUTE_PDF_PATH FROM_PHYSICAL TO_PHYSICAL
import Foundation
import PDFKit

func stop() -> Never {
    fputs("PDFKIT_SOURCE_WITNESS_FAILED\n", stderr)
    exit(2)
}
let args = CommandLine.arguments
guard args.count == 4,
      let from = Int(args[2]), let to = Int(args[3]),
      from > 0, to >= from, to - from + 1 <= 150 else { stop() }
let file = URL(fileURLWithPath: args[1])
guard file.isFileURL, let doc = PDFDocument(url: file),
      doc.pageCount >= to, doc.pageCount > 0 else { stop() }
var pages = [[String: Any]]()
for number in from...to {
    guard let page = doc.page(at: number - 1) else { stop() }
    pages.append(["page": number, "text": page.string ?? ""])
}
let result: [String: Any] = ["pageCount": doc.pageCount, "pages": pages]
guard JSONSerialization.isValidJSONObject(result),
      let bytes = try? JSONSerialization.data(withJSONObject: result, options: [.fragmentsAllowed]),
      let output = String(data: bytes, encoding: .utf8) else { stop() }
print(output)
