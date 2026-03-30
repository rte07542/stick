package com.stick.user.dto;

import com.stick.user.domain.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private Long userId;
    private String nickname;

    public static LoginResponse or(String token, User user) {
        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .nickname(user.getNickname())
                .build();
    }
}
