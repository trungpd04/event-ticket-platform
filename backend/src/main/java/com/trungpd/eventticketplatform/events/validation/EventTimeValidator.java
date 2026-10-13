package com.trungpd.eventticketplatform.events.validation;

import com.trungpd.eventticketplatform.events.dto.request.CreateEventRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDateTime;

public class EventTimeValidator implements ConstraintValidator<EventTimeValid, CreateEventRequest> {

    @Override
    public boolean isValid(CreateEventRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }

        String violationKey = findViolationKey(request);
        if (violationKey == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate("{" + violationKey + "}").addConstraintViolation();
        return false;
    }

    private String findViolationKey(CreateEventRequest request) {
        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = request.getEndTime();
        LocalDateTime saleStart = request.getTicketSaleStartTime();
        LocalDateTime saleEnd = request.getTicketSaleEndTime();

        if (startTime != null && !startTime.isAfter(LocalDateTime.now().plusHours(1))) {
            return "error.event.start-time-too-soon";
        }
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            return "error.validation.end-time-after-start";
        }
        if (saleStart != null && saleEnd != null) {
            if (!saleEnd.isAfter(saleStart)) {
                return "error.event.invalid-sale-period";
            }
            if (startTime != null && saleEnd.isAfter(startTime)) {
                return "error.event.sale-after-start";
            }
        }
        return null;
    }

}
