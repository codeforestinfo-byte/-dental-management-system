package com.dentaflow.report;

import com.dentaflow.appointment.Appointment;
import com.dentaflow.appointment.AppointmentRepository;
import com.dentaflow.billing.BillRepository;
import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.dentist.Dentist;
import com.dentaflow.dentist.DentistRepository;
import com.dentaflow.report.dto.DailyReportResponse;
import com.dentaflow.report.dto.DentistPerformanceResponse;
import com.dentaflow.report.dto.RevenueReportResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;
    private final DentistRepository dentistRepository;

    @Transactional(readOnly = true)
    public DailyReportResponse getDailyReport(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        long totalAppointments = appointmentRepository.findByAppointmentDateOnly(date).size();
        long completedAppointments = appointmentRepository
                .countByAppointmentDateAndStatus(date, Appointment.AppointmentStatus.COMPLETED);
        long cancelledAppointments = appointmentRepository
                .countByAppointmentDateAndStatus(date, Appointment.AppointmentStatus.CANCELLED);

        BigDecimal totalRevenue = billRepository.sumAmountPaidBetweenDates(startOfDay, endOfDay);
        long totalBills = billRepository.countByCreatedAtBetween(startOfDay, endOfDay);

        return DailyReportResponse.builder()
                .reportDate(date)
                .totalAppointments(totalAppointments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .totalPatientsSeen(completedAppointments)
                .totalRevenue(totalRevenue)
                .totalBills(totalBills)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DailyReportResponse> getWeeklyReport(LocalDate startDate) {
        return java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(i -> getDailyReport(startDate.plusDays(i)))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DailyReportResponse> getMonthlyReport(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        int daysInMonth = startDate.lengthOfMonth();
        return java.util.stream.IntStream.rangeClosed(0, daysInMonth - 1)
                .mapToObj(i -> getDailyReport(startDate.plusDays(i)))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = billRepository.sumAmountPaidBetweenDates(start, end);
        long totalTransactions = billRepository.countByCreatedAtBetween(start, end);
        BigDecimal averageTransaction = totalTransactions > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalTransactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return RevenueReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalRevenue(totalRevenue)
                .totalTransactions(totalTransactions)
                .averageTransactionValue(averageTransaction)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DentistPerformanceResponse> getDentistPerformance(LocalDate startDate, LocalDate endDate) {
        List<Dentist> dentists = dentistRepository.findByActiveTrue();
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        return dentists.stream()
                .map(dentist -> {
                    List<Appointment> appointments = appointmentRepository
                            .findDentistAppointmentsBetweenDates(dentist.getId(), startDate, endDate);

                    long completed = appointments.stream()
                            .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                            .count();

                    BigDecimal revenue = billRepository.sumAmountPaidBetweenDates(start, end);

                    double completionRate = appointments.isEmpty() ? 0 :
                            (double) completed / appointments.size() * 100;

                    return DentistPerformanceResponse.builder()
                            .dentistId(dentist.getId())
                            .dentistName(dentist.getDentistName())
                            .specialization(dentist.getSpecialization())
                            .totalAppointments(appointments.size())
                            .completedAppointments(completed)
                            .totalRevenue(revenue)
                            .completionRate(Math.round(completionRate * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
