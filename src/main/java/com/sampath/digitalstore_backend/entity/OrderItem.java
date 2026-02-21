package com.sampath.digitalstore_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many order items belong to one order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Each item refers to one product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Price snapshot at purchase time
    @Column(nullable = false)
    private Double priceAtPurchase;

    @Column(nullable = false)
    private Integer quantity;

    // Optional future: commission support
    private Double platformFee;

    private Double sellerEarnings;
}