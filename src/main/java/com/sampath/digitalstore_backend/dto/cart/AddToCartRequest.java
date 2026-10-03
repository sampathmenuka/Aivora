package com.sampath.digitalstore_backend.dto.cart;

import com.sampath.digitalstore_backend.util.Constants;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddToCartRequest {

    @NotNull(message = "productId is required")
    private Long productId;

    @Min(value = 1, message = "quantity must be at least 1")
    @Max(value = Constants.MAX_CART_ITEM_QUANTITY, message = "quantity is too large")
    private Integer quantity; // default 1 in service if null
}
