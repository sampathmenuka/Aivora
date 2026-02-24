package com.sampath.digitalstore_backend.service.impl;

import com.sampath.digitalstore_backend.dto.auth.AuthRequest;
import com.sampath.digitalstore_backend.dto.auth.AuthResponse;
import com.sampath.digitalstore_backend.entity.Role;
import com.sampath.digitalstore_backend.entity.User;
import com.sampath.digitalstore_backend.exception.BadRequestException;
import com.sampath.digitalstore_backend.exception.ResourceNotFoundException;
import com.sampath.digitalstore_backend.exception.UnauthorizedException;
import com.sampath.digitalstore_backend.repository.UserRepository;
import com.sampath.digitalstore_backend.security.JwtService;
import com.sampath.digitalstore_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(AuthRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole().name())
                .token(token)
                .build();
    }

    @Override
    public AuthResponse login(AuthRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole().name())
                .token(token)
                .build();
    }
}