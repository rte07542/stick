package com.stick.user.controller;

import com.stick.global.jwt.JwtUtil;
import com.stick.user.domain.User;
import com.stick.user.dto.LoginRequest;
import com.stick.user.dto.SignupRequest;
import com.stick.user.dto.UserResponse;
import com.stick.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request.getLoginId(), request.getPassword());
        String token = jwtUtil.generateToken(user.getId());
        return UserResponse.from(user, token);
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return UserResponse.from(userService.getUserById(id));
    }

    @GetMapping("/check")
    public ResponseEntity<Void> checkLoginId(@RequestParam String loginId) {
        if (!userService.isLoginIdAvailable(loginId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/me/avatar")
    public UserResponse updateAvatar(@RequestBody java.util.Map<String, String> body,
                                     HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String url = body.get("profileImageUrl");
        return UserResponse.from(userService.updateAvatar(userId, url));
    }

    @PatchMapping("/me")
    public UserResponse updateMe(@RequestBody java.util.Map<String, String> body,
                                 HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String nickname = body.get("nickname");
        return UserResponse.from(userService.updateNickname(userId, nickname));
    }
}
