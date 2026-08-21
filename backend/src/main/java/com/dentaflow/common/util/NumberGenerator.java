package com.dentaflow.common.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

public final class NumberGenerator {

    private static final AtomicLong APPOINTMENT_COUNTER = new AtomicLong(0);
    private static final AtomicLong BILL_COUNTER = new AtomicLong(0);
    private static final AtomicLong PATIENT_COUNTER = new AtomicLong(0);

    private NumberGenerator() {}

    public static synchronized String generateAppointmentNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long number = APPOINTMENT_COUNTER.incrementAndGet();
        return String.format("APT-%s-%06d", year, number);
    }

    public static synchronized String generateBillNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        String month = String.valueOf(LocalDate.now().getMonthValue());
        long number = BILL_COUNTER.incrementAndGet();
        return String.format("BILL-%s%s-%06d", year, month, number);
    }

    public static synchronized String generatePatientNumber() {
        long number = PATIENT_COUNTER.incrementAndGet();
        return String.format("PAT-%06d", number);
    }

    public static synchronized String generateDentistCode(String name) {
        String prefix = name.substring(0, Math.min(3, name.length())).toUpperCase();
        long timestamp = System.currentTimeMillis() % 10000;
        return String.format("DNT-%s-%04d", prefix, timestamp);
    }
}
