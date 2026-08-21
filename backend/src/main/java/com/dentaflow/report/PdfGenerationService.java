package com.dentaflow.report;

import com.dentaflow.billing.dto.BillResponse;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfGenerationService {

    @Value("${app.dental-clinic.name}")
    private String clinicName;

    @Value("${app.dental-clinic.address}")
    private String clinicAddress;

    @Value("${app.dental-clinic.phone}")
    private String clinicPhone;

    @Value("${app.dental-clinic.email}")
    private String clinicEmail;

    public void generateBillPdf(BillResponse bill, OutputStream outputStream) {
        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument, PageSize.A4);
            document.setMargins(20, 20, 20, 20);

            DeviceRgb headerColor = new DeviceRgb(41, 128, 185);
            DeviceRgb lightGray = new DeviceRgb(236, 240, 241);

            Paragraph clinicTitle = new Paragraph(clinicName)
                    .setFontSize(22)
                    .setFontColor(headerColor)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(clinicTitle);

            Paragraph clinicInfo = new Paragraph(clinicAddress + "\n" + clinicPhone + " | " + clinicEmail)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(clinicInfo);

            document.add(new Paragraph(""));

            Paragraph billTitle = new Paragraph("INVOICE")
                    .setFontSize(18)
                    .setBold()
                    .setFontColor(headerColor)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(billTitle);

            document.add(new Paragraph(""));

            float[] billInfoWidths = {150, 350};
            Table billInfoTable = new Table(UnitValue.createPercentArray(billInfoWidths));
            billInfoTable.useAllAvailableWidth();

            billInfoTable.addCell(createLabelCell("Bill Number:"));
            billInfoTable.addCell(createValueCell(bill.getBillNumber()));
            billInfoTable.addCell(createLabelCell("Patient Name:"));
            billInfoTable.addCell(createValueCell(bill.getPatientName()));
            billInfoTable.addCell(createLabelCell("Dentist:"));
            billInfoTable.addCell(createValueCell(bill.getDentistName()));
            billInfoTable.addCell(createLabelCell("Treatment:"));
            billInfoTable.addCell(createValueCell(bill.getTreatmentName()));
            billInfoTable.addCell(createLabelCell("Date:"));
            billInfoTable.addCell(createValueCell(
                    bill.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))));

            document.add(billInfoTable);
            document.add(new Paragraph(""));

            float[] itemWidths = {250, 125, 125};
            Table itemTable = new Table(UnitValue.createPercentArray(itemWidths));
            itemTable.useAllAvailableWidth();

            Cell headerCell1 = new Cell().add(new Paragraph("Description"))
                    .setBackgroundColor(headerColor)
                    .setFontColor(ColorConstants.WHITE)
                    .setBold();
            Cell headerCell2 = new Cell().add(new Paragraph("Amount"))
                    .setBackgroundColor(headerColor)
                    .setFontColor(ColorConstants.WHITE)
                    .setBold();
            Cell headerCell3 = new Cell().add(new Paragraph("Status"))
                    .setBackgroundColor(headerColor)
                    .setFontColor(ColorConstants.WHITE)
                    .setBold();

            itemTable.addHeaderCell(headerCell1);
            itemTable.addHeaderCell(headerCell2);
            itemTable.addHeaderCell(headerCell3);

            itemTable.addCell("Consultation Fee");
            itemTable.addCell(String.format("Rs. %s", bill.getConsultationFee()));
            itemTable.addCell("-");

            itemTable.addCell(bill.getTreatmentName());
            itemTable.addCell(String.format("Rs. %s", bill.getTreatmentFee()));
            itemTable.addCell("-");

            Cell totalLabel = new Cell().add(new Paragraph("Total"))
                    .setBold()
                    .setBackgroundColor(lightGray);
            Cell totalValue = new Cell().add(new Paragraph(String.format("Rs. %s", bill.getTotalAmount())))
                    .setBold()
                    .setBackgroundColor(lightGray);
            Cell totalStatus = new Cell().add(new Paragraph(""))
                    .setBackgroundColor(lightGray);

            itemTable.addCell(totalLabel);
            itemTable.addCell(totalValue);
            itemTable.addCell(totalStatus);

            Cell paidLabel = new Cell().add(new Paragraph("Paid"))
                    .setBackgroundColor(lightGray);
            Cell paidValue = new Cell().add(new Paragraph(String.format("Rs. %s", bill.getAmountPaid())))
                    .setBackgroundColor(lightGray);
            Cell paidStatus = new Cell().add(new Paragraph(""))
                    .setBackgroundColor(lightGray);

            itemTable.addCell(paidLabel);
            itemTable.addCell(paidValue);
            itemTable.addCell(paidStatus);

            Cell balanceLabel = new Cell().add(new Paragraph("Balance"))
                    .setBold()
                    .setBackgroundColor(lightGray);
            Cell balanceValue = new Cell().add(new Paragraph(String.format("Rs. %s", bill.getBalance())))
                    .setBold()
                    .setBackgroundColor(lightGray);
            Cell balanceStatus = new Cell().add(new Paragraph(bill.getBillStatus()))
                    .setBold()
                    .setBackgroundColor(lightGray);

            itemTable.addCell(balanceLabel);
            itemTable.addCell(balanceValue);
            itemTable.addCell(balanceStatus);

            document.add(itemTable);

            document.add(new Paragraph(""));
            document.add(new Paragraph(""));

            Paragraph footer = new Paragraph("Thank you for choosing " + clinicName + "!")
                    .setFontSize(12)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(footer);

            document.close();
            log.info("Generated PDF for bill: {}", bill.getBillNumber());

        } catch (Exception e) {
            log.error("Error generating PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    private Cell createLabelCell(String text) {
        return new Cell().add(new Paragraph(text))
                .setBold()
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
    }

    private Cell createValueCell(String text) {
        return new Cell().add(new Paragraph(text != null ? text : ""))
                .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
    }
}
