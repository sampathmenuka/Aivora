package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.auth.AuthRequest;
import com.sampath.digitalstore_backend.dto.auth.AuthResponse;
import com.sampath.digitalstore_backend.entity.Role;
import com.sampath.digitalstore_backend.entity.User;
import com.sampath.digitalstore_backend.repository.UserRepository;
import com.sampath.digitalstore_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(AuthRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole().name())
                .token("REGISTER_SUCCESS") // temporary
                .build();
    }

    @Override
    public AuthResponse login(AuthRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole().name())
                .token("LOGIN_SUCCESS") // temporary (JWT later)
                .build();
    }
}