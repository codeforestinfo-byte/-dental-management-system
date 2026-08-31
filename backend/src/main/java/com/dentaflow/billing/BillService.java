package com.dentaflow.billing;

import com.dentaflow.appointment.Appointment;
import com.dentaflow.appointment.AppointmentRepository;
import com.dentaflow.appointment.dto.AppointmentResponse;
import com.dentaflow.billing.dto.BillResponse;
import com.dentaflow.billing.dto.PaymentRequest;
import com.dentaflow.billing.dto.PaymentResponse;
import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.common.mapper.BillMapper;
import com.dentaflow.common.util.NumberGenerator;
import com.dentaflow.dentist.Dentist;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillService {

    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillMapper billMapper;

    @Transactional
    public BillResponse generateBill(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (billRepository.existsByAppointmentId(appointmentId)) {
            throw new BadRequestException("Bill already exists for this appointment");
        }

        Dentist dentist = appointment.getDentist();
        BigDecimal consultationFee = dentist.getConsultationFee() != null
                ? dentist.getConsultationFee()
                : new BigDecimal("1500.00");
        BigDecimal treatmentFee = appointment.getTreatment().getTreatmentFee();

        Bill bill = Bill.builder()
                .billNumber(NumberGenerator.generateBillNumber())
                .appointment(appointment)
                .consultationFee(consultationFee)
                .treatmentFee(treatmentFee)
                .amountPaid(BigDecimal.ZERO)
                .build();

        bill.calculateTotals();

        Bill savedBill = billRepository.save(bill);
        log.info("Generated bill: {} for appointment: {}", savedBill.getBillNumber(),
                appointment.getAppointmentNumber());
        return billMapper.toResponse(savedBill);
    }

    @Transactional(readOnly = true)
    public BillResponse getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        BillResponse response = billMapper.toResponse(bill);

        List<PaymentResponse> payments = paymentRepository.findByBillId(id).stream()
                .map(billMapper::toPaymentResponse)
                .collect(Collectors.toList());
        response.setPayments(payments);

        return response;
    }

    @Transactional(readOnly = true)
    public Page<BillResponse> getAllBills(int page, int size, String sortBy, String sortDir,
                                          String status, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Bill> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("billStatus"), Bill.BillStatus.valueOf(status.toUpperCase())));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("billNumber")), pattern),
                        cb.like(cb.lower(root.get("appointment").get("patient").get("firstName")), pattern),
                        cb.like(cb.lower(root.get("appointment").get("patient").get("lastName")), pattern),
                        cb.like(cb.lower(root.get("appointment").get("patient").get("patientNumber")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return billRepository.findAll(spec, pageable).map(billMapper::toResponse);
    }

    @Transactional
    public BillResponse processRefund(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", billId));

        if (bill.getBillStatus() != Bill.BillStatus.PAID) {
            throw new BadRequestException("Only fully paid bills can be refunded");
        }

        bill.setBillStatus(Bill.BillStatus.REFUNDED);
        bill.setAmountPaid(BigDecimal.ZERO);
        bill.setBalance(bill.getTotalAmount());
        billRepository.save(bill);

        log.info("Refunded bill: {}", bill.getBillNumber());
        return billMapper.toResponse(bill);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getCompletedAppointmentsWithoutBills() {
        List<Appointment> completed = appointmentRepository.findByStatus(
                Appointment.AppointmentStatus.COMPLETED, PageRequest.of(0, 1000)).getContent();

        return completed.stream()
                .filter(a -> !billRepository.existsByAppointmentId(a.getId()))
                .map(a -> AppointmentResponse.builder()
                        .id(a.getId())
                        .appointmentNumber(a.getAppointmentNumber())
                        .patientName(a.getPatient().getFirstName() + " " + a.getPatient().getLastName())
                        .dentistName(a.getDentist().getDentistName())
                        .treatmentName(a.getTreatment().getTreatmentName())
                        .appointmentDate(a.getAppointmentDate())
                        .appointmentTime(a.getAppointmentTime())
                        .build()
                )
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse processPayment(Long billId, PaymentRequest request) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", billId));

        if (bill.getBillStatus() == Bill.BillStatus.PAID) {
            throw new BadRequestException("Bill is already fully paid");
        }

        if (request.getPaymentAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be positive");
        }

        if (request.getPaymentAmount().compareTo(bill.getBalance()) > 0) {
            throw new BadRequestException("Payment amount exceeds the balance due");
        }

        Payment.PaymentMethod method;
        try {
            method = Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method: " + request.getPaymentMethod());
        }

        Payment payment = Payment.builder()
                .bill(bill)
                .paymentMethod(method)
                .paymentAmount(request.getPaymentAmount())
                .reference(request.getReference())
                .build();

        paymentRepository.save(payment);

        bill.setAmountPaid(bill.getAmountPaid().add(request.getPaymentAmount()));
        bill.calculateTotals();
        billRepository.save(bill);

        log.info("Processed payment of {} for bill: {}", request.getPaymentAmount(), bill.getBillNumber());
        return billMapper.toPaymentResponse(payment);
    }
}
