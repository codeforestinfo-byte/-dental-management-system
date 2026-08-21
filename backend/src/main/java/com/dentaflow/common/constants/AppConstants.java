package com.dentaflow.common.constants;

public final class AppConstants {

    private AppConstants() {}

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_RECEPTIONIST = "RECEPTIONIST";
    public static final String ROLE_DENTIST = "DENTIST";

    public static final String STATUS_SCHEDULED = "SCHEDULED";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_NO_SHOW = "NO_SHOW";

    public static final String PAYMENT_METHOD_CASH = "CASH";
    public static final String PAYMENT_METHOD_CARD = "CARD";
    public static final String PAYMENT_METHOD_BANK_TRANSFER = "BANK_TRANSFER";
    public static final String PAYMENT_METHOD_MOBILE = "MOBILE";

    public static final String APPOINTMENT_NUMBER_PREFIX = "APT";
    public static final String BILL_NUMBER_PREFIX = "BILL";
    public static final String PATIENT_NUMBER_PREFIX = "PAT";
    public static final String DENTIST_CODE_PREFIX = "DNT";

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
}
