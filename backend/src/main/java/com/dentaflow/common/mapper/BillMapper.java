package com.dentaflow.common.mapper;

import com.dentaflow.billing.Bill;
import com.dentaflow.billing.Payment;
import com.dentaflow.billing.dto.BillResponse;
import com.dentaflow.billing.dto.PaymentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BillMapper {

    @Mapping(source = "appointment.id", target = "appointmentId")
    @Mapping(expression = "java(bill.getAppointment().getPatient().getFirstName() + \" \" + bill.getAppointment().getPatient().getLastName())", target = "patientName")
    @Mapping(expression = "java(bill.getAppointment().getDentist().getDentistName())", target = "dentistName")
    @Mapping(expression = "java(bill.getAppointment().getTreatment().getTreatmentName())", target = "treatmentName")
    @Mapping(source = "billStatus", target = "billStatus")
    BillResponse toResponse(Bill bill);

    List<BillResponse> toResponseList(List<Bill> bills);

    PaymentResponse toPaymentResponse(Payment payment);

    List<PaymentResponse> toPaymentResponseList(List<Payment> payments);
}
