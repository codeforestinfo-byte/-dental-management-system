package com.dentaflow.report;

import com.dentaflow.common.response.ApiResponse;
import com.dentaflow.report.dto.DailyReportResponse;
import com.dentaflow.report.dto.DentistPerformanceResponse;
import com.dentaflow.report.dto.RevenueReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailyReportResponse>> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyReportResponse response = reportService.getDailyReport(date);
        return ResponseEntity.ok(ApiResponse.success("Daily report generated", response));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<List<DailyReportResponse>>> getWeeklyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        List<DailyReportResponse> response = reportService.getWeeklyReport(startDate);
        return ResponseEntity.ok(ApiResponse.success("Weekly report generated", response));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<DailyReportResponse>>> getMonthlyReport(
            @RequestParam int year,
            @RequestParam int month) {
        List<DailyReportResponse> response = reportService.getMonthlyReport(year, month);
        return ResponseEntity.ok(ApiResponse.success("Monthly report generated", response));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        RevenueReportResponse response = reportService.getRevenueReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Revenue report generated", response));
    }

    @GetMapping("/dentist-performance")
    public ResponseEntity<ApiResponse<List<DentistPerformanceResponse>>> getDentistPerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DentistPerformanceResponse> response = reportService.getDentistPerformance(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Dentist performance report generated", response));
    }
}
