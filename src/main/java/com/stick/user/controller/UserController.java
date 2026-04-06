package com.stick.user.controller;

import com.stick.global.jwt.JwtUtil;
import com.stick.user.domain.User;
import com.stick.user.dto.LoginRequest;
import com.stick.user.dto.SignupRequest;
import com.stick.user.dto.UserResponse;
import com.stick.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public UserResponse signup(@RequestBody SignupRequest request) {
        return UserResponse.from(userService.signup(
                request.getLoginId(),
                request.getPassword(),
                request.getNickname(),
                request.isAgeConfirmed()
        ));
    }

    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequest request) {
        User user = userService.login(request.getLoginId(), request.getPassword());
        String token = jwtUtil.generateToken(user.getId());
        return UserResponse.from(user, token);
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return UserResponse.from(userService.getUserById(id));
    }
}
