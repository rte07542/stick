package com.stick.user.controller;

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
        return UserResponse.from(userService.login(
                request.getLoginId(),
                request.getPassword()
        ));
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return UserResponse.from(userService.getUserById(id));
    }


}
