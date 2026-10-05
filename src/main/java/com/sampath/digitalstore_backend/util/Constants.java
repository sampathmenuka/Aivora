package com.sampath.digitalstore_backend.util;

import java.math.BigDecimal;

public final class Constants {

    private Constants() {
    }

    public static final int MAX_CART_ITEM_QUANTITY = 99;

    // Share of each sale kept by the platform (10%)
    public static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.10");

    public static final int MONEY_SCALE = 2;
}
