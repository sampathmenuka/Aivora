package com.sampath.digitalstore_backend.service;

import com.sampath.digitalstore_backend.dto.auth.AuthRequest;
import com.sampath.digitalstore_backend.dto.auth.AuthResponse;

public interface AuthService {

    AuthResponse register(AuthRequest request);

    AuthResponse login(AuthRequest request);
}
