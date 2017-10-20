class PrintTicketService {
  constructor() {
    this.options = {
      scale: 2,               // 3x scaling factor
      width: 1,
      height: 60,              // Bar height, in millimeters
      includetext: true,            // Show human-readable text
      textxalign: 'center',        // Always good to set this
      textsize: 13
    }
  }

  print() {
    var win = window.open('', '', 'left=0,top=0,width=552,height=477,toolbar=0,scrollbars=0,status =0');
    var content = "<html>";
    content += `<style type=\"text/css\">  @media print {
      body {
        font-size: 0.5cm;
      }
    
      h3 {
        page-break-before: always;
        margin-top: 3.3cm;
      }
    
      b {
        margin-left: 2cm;
        font-size: 0.5cm;
      }
    
      @page {
        size: 5.5cm 8.5cm;/* width height */
      }
    }</style>`;
    content += "<body onload=\"window.print(); window.close();\">";
    content += document.getElementById('printable').innerHTML;
    content += " </body>";
    content += "</html>";
    win.document.write(content);
    win.document.close();
  }
};

export default PrintTicketService;