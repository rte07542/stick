package com.stick.user.controller;

import com.stick.user.domain.User;
import com.stick.user.dto.LoginRequest;
import com.stick.user.dto.SignupRequest;
import com.stick.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    public User signup(@RequestBody SignupRequest request) {
        return userService.signup(
                request.getLoginId(),
                request.getPassword(),
                request.getNickname(),
                request.isAgeConfirmed()
        );
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        return userService.login(
                request.getLoginId(),
                request.getPassword()
        );
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }


}
