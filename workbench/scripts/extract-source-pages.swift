import Foundation
import PDFKit

func stop(_ reason: String) -> Never {
  fputs("Source PDF extraction: \(reason)\n", stderr)
  exit(1)
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
  guard let text = page.string, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
    stop("page \(number) has no text layer; source OCR is required, not invented")
  }
  entries.append(["physical_page": number, "text": text])
}
let payload: [String: Any] = ["physical_page_count":pdf.pageCount,"pages":entries]
do {
  let data = try JSONSerialization.data(withJSONObject:payload,options:[.sortedKeys])
  try data.write(to:URL(fileURLWithPath:args[4]),options:.atomic)
} catch {
  stop("unable to serialize extracted source pages: \(error)")
}
