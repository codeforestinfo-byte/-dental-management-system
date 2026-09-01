package com.dentaflow.attendance;

import com.dentaflow.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dentist-attendance")
@RequiredArgsConstructor
public class DentistAttendanceController {

    private final DentistAttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<DentistAttendance>> markAttendance(
            @Valid @RequestBody AttendanceRequest request) {
        DentistAttendance attendance = attendanceService.markAttendance(
                request.getDentistId(),
                LocalDate.parse(request.getAttendanceDate()),
                request.getStatus(),
                request.getNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance marked successfully", attendance));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DentistAttendance>>> getAttendanceByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DentistAttendance> records = attendanceService.getAttendanceByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved", records));
    }

    @GetMapping("/dentist/{dentistId}")
    public ResponseEntity<ApiResponse<DentistAttendance>> getDentistAttendance(
            @PathVariable Long dentistId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DentistAttendance attendance = attendanceService.getDentistAttendance(dentistId, date);
        return ResponseEntity.ok(ApiResponse.success("Dentist attendance retrieved", attendance));
    }

    @GetMapping("/map")
    public ResponseEntity<ApiResponse<Map<Long, String>>> getAttendanceMap(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Map<Long, String> map = attendanceService.getAttendanceMapByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Attendance map retrieved", map));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok(ApiResponse.success("Attendance record deleted"));
    }

    public static class AttendanceRequest {
        private Long dentistId;
        private String attendanceDate;
        private String status;
        private String notes;

        public Long getDentistId() { return dentistId; }
        public void setDentistId(Long dentistId) { this.dentistId = dentistId; }
        public String getAttendanceDate() { return attendanceDate; }
        public void setAttendanceDate(String attendanceDate) { this.attendanceDate = attendanceDate; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
