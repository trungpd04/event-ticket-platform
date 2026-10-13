package com.trungpd.eventticketplatform.events.validation;

import com.trungpd.eventticketplatform.events.dto.request.CreateEventRequest;
import com.trungpd.eventticketplatform.ticketing.dto.request.CreateTicketTypeRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class EventTimeValidatorTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private CreateEventRequest buildRequest(LocalDateTime startTime,
                                            LocalDateTime endTime,
                                            LocalDateTime saleStart,
                                            LocalDateTime saleEnd) {
        CreateTicketTypeRequest ticketType = new CreateTicketTypeRequest();
        ticketType.setName("Vé thường");
        ticketType.setPrice(100000L);
        ticketType.setTotalQuantity(50);

        CreateEventRequest request = new CreateEventRequest();
        request.setTitle("Sự kiện thử nghiệm");
        request.setLocation("Hà Nội");
        request.setStartTime(startTime);
        request.setEndTime(endTime);
        request.setTicketSaleStartTime(saleStart);
        request.setTicketSaleEndTime(saleEnd);
        request.setThumbnailFileId(1L);
        request.setBannerFileId(2L);
        request.setCategoryId(1L);
        request.setProvinceId(1L);
        request.setWardId(1L);
        request.setTicketTypes(List.of(ticketType));
        return request;
    }

    private Set<ConstraintViolation<CreateEventRequest>> validate(CreateEventRequest request) {
        return validator.validate(request);
    }

    @Test
    void shouldAcceptValidEventTimes() {
        LocalDateTime now = LocalDateTime.now();
        CreateEventRequest request = buildRequest(
                now.plusHours(2),
                now.plusHours(4),
                now.plusHours(1),
                now.plusHours(2)
        );

        assertThat(validate(request)).isEmpty();
    }

    @Test
    void shouldRejectStartTimeTooSoon() {
        LocalDateTime now = LocalDateTime.now();
        CreateEventRequest request = buildRequest(
                now.plusMinutes(30),
                now.plusHours(3),
                now.plusMinutes(30),
                now.plusMinutes(45)
        );

        Set<ConstraintViolation<CreateEventRequest>> violations = validate(request);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessageTemplate())
                .contains("error.event.start-time-too-soon");
    }

    @Test
    void shouldRejectEndTimeBeforeStartTime() {
        LocalDateTime now = LocalDateTime.now();
        CreateEventRequest request = buildRequest(
                now.plusHours(3),
                now.plusHours(2),
                now.plusHours(1),
                now.plusHours(2)
        );

        Set<ConstraintViolation<CreateEventRequest>> violations = validate(request);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessageTemplate())
                .contains("error.validation.end-time-after-start");
    }

    @Test
    void shouldRejectSaleEndBeforeSaleStart() {
        LocalDateTime now = LocalDateTime.now();
        CreateEventRequest request = buildRequest(
                now.plusHours(3),
                now.plusHours(4),
                now.plusHours(2),
                now.plusHours(1)
        );

        Set<ConstraintViolation<CreateEventRequest>> violations = validate(request);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessageTemplate())
                .contains("error.event.invalid-sale-period");
    }

    @Test
    void shouldRejectSaleEndAfterEventStart() {
        LocalDateTime now = LocalDateTime.now();
        CreateEventRequest request = buildRequest(
                now.plusHours(3),
                now.plusHours(5),
                now.plusHours(1),
                now.plusHours(4)
        );

        Set<ConstraintViolation<CreateEventRequest>> violations = validate(request);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessageTemplate())
                .contains("error.event.sale-after-start");
    }

    @Test
    void shouldRejectEmptyTicketTypes() {
        LocalDateTime now = LocalDateTime.now();
        CreateEventRequest request = buildRequest(
                now.plusHours(2),
                now.plusHours(4),
                now.plusHours(1),
                now.plusHours(2)
        );
        request.setTicketTypes(List.of());

        Set<ConstraintViolation<CreateEventRequest>> violations = validate(request);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getMessageTemplate())
                .contains("error.event.ticket-types.empty");
    }

}
