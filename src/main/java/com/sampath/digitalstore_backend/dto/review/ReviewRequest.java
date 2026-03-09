package com.sampath.digitalstore_backend.dto.review;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {
    private Integer rating;   // 1..5
    private String comment;
}
