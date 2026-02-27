package com.sampath.digitalstore_backend.dto.review;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private String userEmail;
    private LocalDateTime createdAt;
}
