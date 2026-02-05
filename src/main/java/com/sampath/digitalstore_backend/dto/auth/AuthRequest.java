package com.sampath.digitalstore_backend.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequest {

    private String name;     // used for register
    private String email;
    private String password;
}