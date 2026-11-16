import Foundation
import PDFKit
import AppKit

func fail(_ message: String) -> Never {
  fputs("SOURCE_RENDER_BLOCKED: \(message)\n", stderr)
  exit(1)
}
let args = CommandLine.arguments
guard args.count == 4, let first=Int(args[2]), let last=Int(args[3]),
      first>0,last>=first,last-first<=3 else {
  fail("At most four consecutive physical source pages required")
}
guard let document=PDFDocument(url:URL(fileURLWithPath:args[1])) else {
  fail("Canonical source PDF could not be opened")
}
guard last<=document.pageCount else { fail("Requested physical page exceeds PDF page count") }
print("SOURCE_RENDER_PHYSICAL_PAGE_COUNT=\(document.pageCount)")
for number in first...last {
  guard let page=document.page(at:number-1) else { fail("Physical source page missing") }
  let image=page.thumbnail(of:NSSize(width:1500,height:2100),for:.mediaBox)
  guard let tiff=image.tiffRepresentation,
        let rep=NSBitmapImageRep(data:tiff),
        let jpeg=rep.representation(using:.jpeg,properties:[.compressionFactor:0.44]),
        jpeg.count<3_000_000 else { fail("Source image render invalid or oversized") }
  print("WORKBENCH_RENDER_PAGE_\(number)_START")
  print(jpeg.base64EncodedString())
  print("WORKBENCH_RENDER_PAGE_\(number)_END")
}
