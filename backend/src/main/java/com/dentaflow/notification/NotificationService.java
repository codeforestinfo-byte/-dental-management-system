package com.dentaflow.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendAppointmentConfirmation(String patientEmail, String patientName,
                                             String appointmentDate, String appointmentTime,
                                             String dentistName) {
        String subject = "Appointment Confirmation - Sunrise Dental";
        String body = String.format(
                "Dear %s,\n\n" +
                "Your appointment has been confirmed.\n\n" +
                "Date: %s\n" +
                "Time: %s\n" +
                "Dentist: %s\n\n" +
                "Please arrive 15 minutes before your appointment.\n\n" +
                "Best regards,\nSunrise Dental Team",
                patientName, appointmentDate, appointmentTime, dentistName);
        sendEmail(patientEmail, subject, body);
    }

    @Async
    public void sendAppointmentReminder(String patientEmail, String patientName,
                                         String appointmentDate, String appointmentTime) {
        String subject = "Appointment Reminder - Sunrise Dental";
        String body = String.format(
                "Dear %s,\n\n" +
                "This is a reminder for your appointment tomorrow.\n\n" +
                "Date: %s\n" +
                "Time: %s\n\n" +
                "Please arrive 15 minutes before your appointment.\n\n" +
                "Best regards,\nSunrise Dental Team",
                patientName, appointmentDate, appointmentTime);
        sendEmail(patientEmail, subject, body);
    }
}
