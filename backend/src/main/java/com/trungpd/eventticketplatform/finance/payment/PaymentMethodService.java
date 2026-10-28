package com.trungpd.eventticketplatform.finance.payment;

import com.trungpd.eventticketplatform.events.entity.OptionSetValue;
import com.trungpd.eventticketplatform.events.repository.OptionSetValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentMethodService implements IPaymentMethodService {

    private static final String OPTION_SET_CODE = "PAYMENT_METHODS";

    private final OptionSetValueRepository optionSetValueRepository;

    public List<PaymentMethod> getActivePaymentMethods() {
        List<OptionSetValue> values = optionSetValueRepository
                .findAllByOptionSetCodeAndStatusOrderBySortOrderAsc(OPTION_SET_CODE, "ACTIVE");

        if (values.isEmpty()) {
            return getDefaultPaymentMethods();
        }

        return values.stream()
                .map(this::toPaymentMethod)
                .toList();
    }

    public boolean isSupported(PaymentProviderType providerType) {
        return getActivePaymentMethods().stream()
                .anyMatch(method -> method.getCode().equalsIgnoreCase(providerType.name()) && method.isActive());
    }

    private List<PaymentMethod> getDefaultPaymentMethods() {
        return Arrays.stream(PaymentProviderType.values())
                .map(type -> PaymentMethod.builder()
                        .code(type.name())
                        .name(type.name())
                        .description("")
                        .active(true)
                        .build())
                .toList();
    }

    private PaymentMethod toPaymentMethod(OptionSetValue value) {
        return PaymentMethod.builder()
                .code(value.getCode())
                .name(value.getName())
                .description(value.getValue())
                .active(true)
                .build();
    }
}
