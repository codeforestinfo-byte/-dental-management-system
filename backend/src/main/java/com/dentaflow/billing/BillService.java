package com.dentaflow.billing;

import com.dentaflow.appointment.Appointment;
import com.dentaflow.appointment.AppointmentRepository;
import com.dentaflow.billing.dto.BillResponse;
import com.dentaflow.billing.dto.PaymentRequest;
import com.dentaflow.billing.dto.PaymentResponse;
import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.common.mapper.BillMapper;
import com.dentaflow.common.util.NumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

        BigDecimal consultationFee = new BigDecimal("1500.00");
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
    public Page<BillResponse> getAllBills(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return billRepository.findAll(pageable).map(billMapper::toResponse);
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
